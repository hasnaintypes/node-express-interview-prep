const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const authService = require("../services/authService")

class AuthController {
  // Register new user
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body

      // Check if user already exists
      const existingUser = await User.findByEmail(email)
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "User with this email already exists",
          },
        })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
      })

      // Generate tokens
      const tokens = authService.generateTokens(newUser)

      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })

      res.status(201).json({
        success: true,
        data: {
          user: newUser.toJSON(),
          accessToken: tokens.accessToken,
        },
        message: "User registered successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // User login
  async login(req, res, next) {
    try {
      const { email, password } = req.body

      // Find user
      const user = await User.findByEmail(email)
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        })
      }

      // Check if user is active
      if (!user.isActive()) {
        return res.status(401).json({
          success: false,
          error: {
            code: "ACCOUNT_DISABLED",
            message: "Account has been disabled",
          },
        })
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        })
      }

      // Update last login
      await User.update(user.id, { lastLogin: new Date() })

      // Generate tokens
      const tokens = authService.generateTokens(user)

      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })

      res.json({
        success: true,
        data: {
          user: user.toJSON(),
          accessToken: tokens.accessToken,
        },
        message: "Login successful",
      })
    } catch (error) {
      next(error)
    }
  }

  // Refresh token
  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: {
            code: "REFRESH_TOKEN_REQUIRED",
            message: "Refresh token is required",
          },
        })
      }

      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
        const user = await User.findById(decoded.id)

        if (!user || !user.isActive()) {
          return res.status(401).json({
            success: false,
            error: {
              code: "INVALID_REFRESH_TOKEN",
              message: "Invalid refresh token",
            },
          })
        }

        // Generate new tokens
        const tokens = authService.generateTokens(user)

        // Set new refresh token as httpOnly cookie
        res.cookie("refreshToken", tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        res.json({
          success: true,
          data: {
            accessToken: tokens.accessToken,
          },
          message: "Token refreshed successfully",
        })
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: {
            code: "INVALID_REFRESH_TOKEN",
            message: "Invalid refresh token",
          },
        })
      }
    } catch (error) {
      next(error)
    }
  }

  // User logout
  async logout(req, res, next) {
    try {
      // Clear refresh token cookie
      res.clearCookie("refreshToken")

      res.json({
        success: true,
        message: "Logout successful",
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new AuthController()
