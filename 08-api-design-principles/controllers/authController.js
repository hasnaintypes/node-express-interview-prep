// Auth Controller
// HTTP request handlers for authentication operations

const authService = require("../services/authService");

const authController = {
  // POST /api/auth/login - User login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: "MISSING_CREDENTIALS",
            message: "Email and password are required",
          },
        });
      }

      const result = await authService.login(email, password);

      res.json({
        success: true,
        data: result,
        message: "Login successful",
      });
    } catch (error) {
      if (
        error.message === "Invalid credentials" ||
        error.message === "Account is deactivated"
      ) {
        return res.status(401).json({
          success: false,
          error: {
            code: "AUTHENTICATION_FAILED",
            message: error.message,
          },
        });
      }
      next(error);
    }
  },

  // POST /api/auth/register - User registration
  async register(req, res, next) {
    try {
      const userData = req.body;

      const result = await authService.register(userData);

      res.status(201).json({
        success: true,
        data: result,
        message: "Registration successful",
      });
    } catch (error) {
      if (
        error.message.includes("required") ||
        error.message.includes("do not match") ||
        error.message.includes("must be at least") ||
        error.message.includes("already exists")
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        });
      }
      next(error);
    }
  },

  // POST /api/auth/refresh - Refresh access token
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: {
            code: "MISSING_REFRESH_TOKEN",
            message: "Refresh token is required",
          },
        });
      }

      const result = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: result,
        message: "Token refreshed successfully",
      });
    } catch (error) {
      if (
        error.message.includes("Invalid") ||
        error.message.includes("not found")
      ) {
        return res.status(401).json({
          success: false,
          error: {
            code: "INVALID_REFRESH_TOKEN",
            message: error.message,
          },
        });
      }
      next(error);
    }
  },

  // POST /api/auth/logout - User logout
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;

      const result = await authService.logout(refreshToken);

      res.json({
        success: true,
        data: result,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/logout-all - Logout from all devices
  async logoutAll(req, res, next) {
    try {
      const { userId } = req.user; // Assuming user is attached by auth middleware

      const result = await authService.logoutAll(userId);

      res.json({
        success: true,
        data: result,
        message: "Logged out from all devices successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/change-password - Change password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const { userId } = req.user; // Assuming user is attached by auth middleware

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: {
            code: "MISSING_PASSWORDS",
            message: "Current password and new password are required",
          },
        });
      }

      const result = await authService.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      res.json({
        success: true,
        data: result,
        message: "Password changed successfully",
      });
    } catch (error) {
      if (
        error.message.includes("Current password") ||
        error.message.includes("must be at least") ||
        error.message === "User not found"
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        });
      }
      next(error);
    }
  },

  // POST /api/auth/forgot-password - Request password reset
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: {
            code: "MISSING_EMAIL",
            message: "Email is required",
          },
        });
      }

      const result = await authService.resetPassword(email);

      res.json({
        success: true,
        data: result,
        message: "Password reset instructions sent",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/reset-password - Reset password with token
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: {
            code: "MISSING_DATA",
            message: "Reset token and new password are required",
          },
        });
      }

      const result = await authService.verifyResetToken(token, newPassword);

      res.json({
        success: true,
        data: result,
        message: "Password reset successful",
      });
    } catch (error) {
      if (
        error.message.includes("Invalid") ||
        error.message.includes("expired") ||
        error.message.includes("must be at least")
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        });
      }
      next(error);
    }
  },

  // POST /api/auth/verify-token - Verify access token
  async verifyToken(req, res, next) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(400).json({
          success: false,
          error: {
            code: "MISSING_TOKEN",
            message: "Access token is required",
          },
        });
      }

      const user = await authService.verifyAccessToken(token);

      res.json({
        success: true,
        data: { user },
        message: "Token is valid",
      });
    } catch (error) {
      if (
        error.message.includes("Invalid") ||
        error.message.includes("expired") ||
        error.message.includes("revoked")
      ) {
        return res.status(401).json({
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: error.message,
          },
        });
      }
      next(error);
    }
  },

  // POST /api/auth/revoke-token - Revoke access token
  async revokeToken(req, res, next) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(400).json({
          success: false,
          error: {
            code: "MISSING_TOKEN",
            message: "Access token is required",
          },
        });
      }

      const result = await authService.revokeToken(token);

      res.json({
        success: true,
        data: result,
        message: "Token revoked successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/me - Get current user profile
  async getCurrentUser(req, res, next) {
    try {
      const { userId } = req.user; // Assuming user is attached by auth middleware

      const userService = require("../services/userService");
      const user = await userService.findUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        });
      }

      res.json({
        success: true,
        data: user,
        message: "User profile retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
