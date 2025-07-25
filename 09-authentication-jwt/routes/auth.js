const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validation");
const {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation,
  emailVerificationValidation,
} = require("../utils/validators");
const {
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
} = require("../utils/rateLimiter");
const authService = require("../services/authService");
const { AppError } = require("../utils/errors");

// POST /api/auth/register - Register new user
router.post(
  "/register",
  authLimiter,
  registerValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await authService.register(req.body);

      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
        message: "Registration successful. Please verify your email address.",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: "REGISTRATION_FAILED",
          message: "Registration failed. Please try again.",
        },
      });
    }
  }
);

// POST /api/auth/login - Login user
router.post(
  "/login",
  authLimiter,
  loginValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;
      const result = await authService.login(email, password, rememberMe);

      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 30 days or 7 days
      });

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
        message: "Login successful",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: "LOGIN_FAILED",
          message: "Login failed. Please try again.",
        },
      });
    }
  }
);

// POST /api/auth/refresh - Refresh access token
router.post(
  "/refresh",
  refreshTokenValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
        message: "Token refreshed successfully",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: "REFRESH_TOKEN_ERROR",
          message: "Failed to refresh token",
        },
      });
    }
  }
);

// POST /api/auth/logout - Logout user
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post(
  "/forgot-password",
  passwordResetLimiter,
  forgotPasswordValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);

      res.json({
        success: true,
        message: "Password reset email sent",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "PASSWORD_RESET_FAILED",
          message: "Failed to send password reset email",
        },
      });
    }
  }
);

// POST /api/auth/reset-password - Reset password with token
router.post(
  "/reset-password",
  resetPasswordValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);

      res.json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: "PASSWORD_RESET_FAILED",
          message: "Failed to reset password",
        },
      });
    }
  }
);

// POST /api/auth/change-password - Change password (authenticated)
router.post(
  "/change-password",
  authenticateToken,
  changePasswordValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: "PASSWORD_CHANGE_FAILED",
          message: "Failed to change password",
        },
      });
    }
  }
);

// GET /api/auth/verify-email/:token - Verify email address
router.get(
  "/verify-email/:token",
  emailVerificationLimiter,
  emailVerificationValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { token } = req.params;
      const user = await authService.verifyEmail(token);

      res.json({
        success: true,
        data: { user },
        message: "Email verified successfully",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: "EMAIL_VERIFICATION_FAILED",
          message: "Failed to verify email",
        },
      });
    }
  }
);

// GET /api/auth/me - Get current user info
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    res.json({
      success: true,
      data: { user },
      message: "User information retrieved successfully",
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: "USER_INFO_FAILED",
        message: "Failed to get user information",
      },
    });
  }
});

// GET /api/auth/validate-token - Validate JWT token
router.get("/validate-token", authenticateToken, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      valid: true,
    },
    message: "Token is valid",
  });
});

module.exports = router;
