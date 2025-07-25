// Authentication Service - Business logic for authentication

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const User = require("../models/User")
const { AppError } = require("../utils/errors")
const emailService = require("./emailService")

class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production"
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret"
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m"
    this.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d"
    this.BCRYPT_ROUNDS = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12
    this.MAX_LOGIN_ATTEMPTS = 5
    this.LOCKOUT_TIME = 30 * 60 * 1000 // 30 minutes
  }

  // Generate JWT tokens
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: "jwt-auth-demo",
      audience: "jwt-auth-users",
    })

    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
      issuer: "jwt-auth-demo",
      audience: "jwt-auth-users",
    })

    return { accessToken, refreshToken }
  }

  // Verify JWT token
  verifyToken(token, isRefreshToken = false) {
    try {
      const secret = isRefreshToken ? this.JWT_REFRESH_SECRET : this.JWT_SECRET
      return jwt.verify(token, secret)
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new AppError("Token has expired", 401)
      }
      if (error.name === "JsonWebTokenError") {
        throw new AppError("Invalid token", 401)
      }
      throw new AppError("Token verification failed", 401)
    }
  }

  // Hash password
  async hashPassword(password) {
    try {
      return await bcrypt.hash(password, this.BCRYPT_ROUNDS)
    } catch (error) {
      throw new AppError("Password hashing failed", 500)
    }
  }

  // Compare password
  async comparePassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword)
    } catch (error) {
      throw new AppError("Password comparison failed", 500)
    }
  }

  // Validate password strength
  validatePassword(password) {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[@$!%*?&]/.test(password)

    const errors = []

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`)
    }
    if (!hasUpperCase) {
      errors.push("Password must contain at least one uppercase letter")
    }
    if (!hasLowerCase) {
      errors.push("Password must contain at least one lowercase letter")
    }
    if (!hasNumbers) {
      errors.push("Password must contain at least one number")
    }
    if (!hasSpecialChar) {
      errors.push("Password must contain at least one special character (@$!%*?&)")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Register new user
  async register(userData) {
    try {
      const { name, email, password, role = "user" } = userData

      // Check if user already exists
      const existingUser = await User.findByEmail(email)
      if (existingUser) {
        throw new AppError("User with this email already exists", 409)
      }

      // Validate password
      const passwordValidation = this.validatePassword(password)
      if (!passwordValidation.isValid) {
        throw new AppError("Password does not meet requirements", 400, {
          errors: passwordValidation.errors,
        })
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password)

      // Create user
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        emailVerified: false,
        createdAt: new Date(),
      })

      // Generate tokens
      const tokenPayload = {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      }

      const { accessToken, refreshToken } = this.generateTokens(tokenPayload)

      // Store refresh token (in production, store in database)
      await User.updateRefreshToken(newUser.id, refreshToken)

      return {
        user: newUser.toJSON(),
        accessToken,
        refreshToken,
        expiresIn: this.JWT_EXPIRES_IN,
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError("Registration failed", 500)
    }
  }

  // Login user
  async login(email, password, rememberMe = false) {
    try {
      // Find user by email
      const user = await User.findByEmail(email)
      if (!user) {
        throw new AppError("Invalid email or password", 401)
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > Date.now()) {
        const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60)
        throw new AppError(`Account is locked. Try again in ${lockTimeRemaining} minutes`, 423)
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(password, user.password)
      if (!isPasswordValid) {
        // Increment failed login attempts
        await this.handleFailedLogin(user.id)
        throw new AppError("Invalid email or password", 401)
      }

      // Reset failed login attempts on successful login
      await User.resetLoginAttempts(user.id)

      // Update last login
      await User.updateLastLogin(user.id)

      // Generate tokens
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      }

      const expiresIn = rememberMe ? "30d" : this.JWT_EXPIRES_IN
      const accessToken = jwt.sign(tokenPayload, this.JWT_SECRET, {
        expiresIn,
        issuer: "jwt-auth-demo",
        audience: "jwt-auth-users",
      })

      const { refreshToken } = this.generateTokens(tokenPayload)

      // Store refresh token
      await User.updateRefreshToken(user.id, refreshToken)

      return {
        user: user.toJSON(),
        accessToken,
        refreshToken,
        expiresIn,
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError("Login failed", 500)
    }
  }

  // Handle failed login attempts
  async handleFailedLogin(userId) {
    try {
      const user = await User.findById(userId)
      if (!user) return

      const attempts = (user.loginAttempts || 0) + 1

      if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
        // Lock account
        await User.update(userId, {
          loginAttempts: attempts,
          lockUntil: Date.now() + this.LOCKOUT_TIME,
        })
      } else {
        // Increment attempts
        await User.update(userId, {
          loginAttempts: attempts,
        })
      }
    } catch (error) {
      console.error("Failed to handle login attempt:", error)
    }
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = this.verifyToken(refreshToken, true)

      // Find user
      const user = await User.findById(decoded.id)
      if (!user) {
        throw new AppError("User not found", 404)
      }

      // Check if refresh token matches stored token
      if (user.refreshToken !== refreshToken) {
        throw new AppError("Invalid refresh token", 401)
      }

      // Generate new access token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      }

      const accessToken = jwt.sign(tokenPayload, this.JWT_SECRET, {
        expiresIn: this.JWT_EXPIRES_IN,
        issuer: "jwt-auth-demo",
        audience: "jwt-auth-users",
      })

      return {
        accessToken,
        expiresIn: this.JWT_EXPIRES_IN,
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError("Token refresh failed", 401)
    }
  }

  // Logout user
  async logout(refreshToken) {
    try {
      if (refreshToken) {
        const decoded = this.verifyToken(refreshToken, true)
        await User.updateRefreshToken(decoded.id, null)
      }
      return true
    } catch (error) {
      // Even if token verification fails, consider logout successful
      return true
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const user = await User.findByEmail(email)
      if (!user) {
        // Don't reveal if email exists
        return true
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex")
      const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex")

      // Store reset token with expiration
      await User.update(user.id, {
        passwordResetToken: resetTokenHash,
        passwordResetExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
      })

      // Send reset email
      await emailService.sendPasswordResetEmail(user.email, resetToken)

      return true
    } catch (error) {
      throw new AppError("Password reset request failed", 500)
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      // Hash the token to compare with stored hash
      const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex")

      // Find user with valid reset token
      const user = await User.findByResetToken(resetTokenHash)
      if (!user || user.passwordResetExpires < Date.now()) {
        throw new AppError("Invalid or expired reset token", 400)
      }

      // Validate new password
      const passwordValidation = this.validatePassword(newPassword)
      if (!passwordValidation.isValid) {
        throw new AppError("Password does not meet requirements", 400, {
          errors: passwordValidation.errors,
        })
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword)

      // Update user password and clear reset token
      await User.update(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        loginAttempts: 0,
        lockUntil: null,
      })

      return true
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError("Password reset failed", 500)
    }
  }

  // Change password (authenticated user)
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId)
      if (!user) {
        throw new AppError("User not found", 404)
      }

      // Verify current password
      const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        throw new AppError("Current password is incorrect", 400)
      }

      // Validate new password
      const passwordValidation = this.validatePassword(newPassword)
      if (!passwordValidation.isValid) {
        throw new AppError("Password does not meet requirements", 400, {
          errors: passwordValidation.errors,
        })
      }

      // Check if new password is different from current
      const isSamePassword = await this.comparePassword(newPassword, user.password)
      if (isSamePassword) {
        throw new AppError("New password must be different from current password", 400)
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword)

      // Update password
      await User.update(userId, {
        password: hashedPassword,
      })

      return true
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError("Password change failed", 500)
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const user = await User.findByEmailVerificationToken(token)
      if (!user) {
        throw new AppError("Invalid verification token", 400)
      }

      await User.update(user.id, {
        emailVerified: true,
        emailVerificationToken: null,
      })

      return user.toJSON()
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError("Email verification failed", 500)
    }
  }

  // Get current user
  async getCurrentUser(userId) {
    try {
      const user = await User.findById(userId)
      if (!user) {
        throw new AppError("User not found", 404)
      }

      return user.toJSON()
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError("Failed to get user information", 500)
    }
  }

  // Validate token
  async validateToken(token) {
    try {
      this.verifyToken(token)
      return true
    } catch (error) {
      return false
    }
  }
}

module.exports = new AuthService()
