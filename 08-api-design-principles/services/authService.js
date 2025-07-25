// Auth Service
// Business logic for authentication operations

const User = require("../models/User");
const userService = require("./userService");

// In-memory storage for tokens (replace with Redis or database in production)
let refreshTokens = new Set();
let blacklistedTokens = new Set();

const authService = {
  // User login
  async login(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // In a real app, you would hash the password and compare
    // For demo purposes, we'll do a simple check
    const users = await userService.findUsers({ limit: 1000 });
    const user = users.users.find((u) => u.email === email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    // In production, compare hashed passwords
    // const isValidPassword = await bcrypt.compare(password, user.password);
    // For demo, we'll assume password is valid if user exists

    // Generate tokens (in production, use JWT or similar)
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token
    refreshTokens.add(refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1 hour
      },
    };
  },

  // User registration
  async register(userData) {
    const { name, email, password, confirmPassword } = userData;

    if (!name || !email || !password || !confirmPassword) {
      throw new Error("All fields are required");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Check if user already exists
    const users = await userService.findUsers({ limit: 1000 });
    const existingUser = users.users.find((u) => u.email === email);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const newUser = await userService.createUser({
      name,
      email,
      password, // In production, hash this password
      role: "user",
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(newUser);
    const refreshToken = this.generateRefreshToken(newUser);

    // Store refresh token
    refreshTokens.add(refreshToken);

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1 hour
      },
    };
  },

  // Refresh access token
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    if (!refreshTokens.has(refreshToken)) {
      throw new Error("Invalid refresh token");
    }

    try {
      // In production, verify JWT token
      const decoded = this.verifyToken(refreshToken);
      const user = await userService.findUserById(decoded.userId);

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.isActive) {
        throw new Error("Account is deactivated");
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user);

      return {
        accessToken: newAccessToken,
        expiresIn: 3600,
      };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  },

  // User logout
  async logout(refreshToken) {
    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }

    return { message: "Logged out successfully" };
  },

  // Logout from all devices
  async logoutAll(userId) {
    // In production, you would invalidate all refresh tokens for this user
    // For demo, we'll remove all tokens (this affects all users)
    refreshTokens.clear();

    return { message: "Logged out from all devices" };
  },

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw new Error("Current password and new password are required");
    }

    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long");
    }

    const user = await userService.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // In production, verify current password
    // const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    // if (!isValidPassword) {
    //   throw new Error('Current password is incorrect');
    // }

    // Update password
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userService.updateUser(userId, { password: newPassword });

    return { message: "Password changed successfully" };
  },

  // Reset password (would typically involve email verification)
  async resetPassword(email) {
    const users = await userService.findUsers({ limit: 1000 });
    const user = users.users.find((u) => u.email === email);

    if (!user) {
      // Don't reveal that user doesn't exist
      return {
        message:
          "If an account with this email exists, a password reset link has been sent",
      };
    }

    // Generate reset token
    const resetToken = this.generateResetToken(user);

    // In production, send email with reset link
    // await emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message:
        "If an account with this email exists, a password reset link has been sent",
      resetToken, // Only for demo purposes
    };
  },

  // Verify reset token and update password
  async verifyResetToken(token, newPassword) {
    if (!token || !newPassword) {
      throw new Error("Reset token and new password are required");
    }

    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long");
    }

    try {
      const decoded = this.verifyToken(token);
      const user = await userService.findUserById(decoded.userId);

      if (!user) {
        throw new Error("User not found");
      }

      // Update password
      await userService.updateUser(decoded.userId, { password: newPassword });

      return { message: "Password reset successfully" };
    } catch (error) {
      throw new Error("Invalid or expired reset token");
    }
  },

  // Verify access token
  async verifyAccessToken(token) {
    if (!token) {
      throw new Error("Access token is required");
    }

    if (blacklistedTokens.has(token)) {
      throw new Error("Token has been revoked");
    }

    try {
      const decoded = this.verifyToken(token);
      const user = await userService.findUserById(decoded.userId);

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.isActive) {
        throw new Error("Account is deactivated");
      }

      return user;
    } catch (error) {
      throw new Error("Invalid or expired access token");
    }
  },

  // Generate access token (simplified - use JWT in production)
  generateAccessToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: "access",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    };

    // In production, use JWT
    return Buffer.from(JSON.stringify(payload)).toString("base64");
  },

  // Generate refresh token (simplified - use JWT in production)
  generateRefreshToken(user) {
    const payload = {
      userId: user.id,
      type: "refresh",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600, // 7 days
    };

    // In production, use JWT
    return Buffer.from(JSON.stringify(payload)).toString("base64");
  },

  // Generate reset token (simplified - use JWT in production)
  generateResetToken(user) {
    const payload = {
      userId: user.id,
      type: "reset",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    };

    // In production, use JWT
    return Buffer.from(JSON.stringify(payload)).toString("base64");
  },

  // Verify token (simplified - use JWT in production)
  verifyToken(token) {
    try {
      const decoded = JSON.parse(Buffer.from(token, "base64").toString());

      // Check expiration
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        throw new Error("Token expired");
      }

      return decoded;
    } catch (error) {
      throw new Error("Invalid token");
    }
  },

  // Revoke token
  async revokeToken(token) {
    blacklistedTokens.add(token);
    return { message: "Token revoked successfully" };
  },
};

module.exports = authService;
