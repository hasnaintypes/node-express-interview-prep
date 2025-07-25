// Authentication Routes - Password Reset & Email Verification

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Joi = require("joi");
const router = express.Router();

const emailService = require("../services/emailService");
const {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
  TokenError,
} = require("../utils/errors");

// Mock database - In real app, use MongoDB/PostgreSQL
const users = new Map();
const resetTokens = new Map();
const verificationTokens = new Map();

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

// Helper function to generate secure tokens
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Helper function to hash tokens
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Helper function to create JWT
const createJWT = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "default-secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @route   POST /api/auth/register
// @desc    Register user with email verification
// @access  Public
router.post("/register", async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { name, email, password } = value;

    // Check if user already exists
    if (users.has(email)) {
      throw new ConflictError("User already exists with this email");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = generateSecureToken();
    const hashedToken = hashToken(verificationToken);

    // Create user
    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      emailPreferences: {
        marketing: true,
        notifications: true,
        security: true,
      },
    };

    // Store user and verification token
    users.set(email, user);
    verificationTokens.set(hashedToken, {
      email,
      token: verificationToken,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Send verification email
    await emailService.sendVerificationEmail(email, {
      name,
      verificationToken,
      verificationUrl: `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/verify-email?token=${verificationToken}`,
    });

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { email, password } = value;

    // Find user
    const user = users.get(email);
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new AuthenticationError(
        "Please verify your email before logging in"
      );
    }

    // Generate JWT
    const token = createJWT(user.id);

    // Update last login
    user.lastLogin = new Date().toISOString();

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post("/forgot-password", async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { email } = value;

    // Find user
    const user = users.get(email);
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message:
          "If an account with that email exists, you will receive a password reset email.",
      });
    }

    // Generate reset token
    const resetToken = generateSecureToken();
    const hashedToken = hashToken(resetToken);

    // Store reset token (expires in 10 minutes)
    resetTokens.set(hashedToken, {
      email,
      token: resetToken,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(email, {
      name: user.name,
      resetToken,
      resetUrl: `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/reset-password?token=${resetToken}`,
      expiresIn: "10 minutes",
    });

    res.json({
      success: true,
      message:
        "If an account with that email exists, you will receive a password reset email.",
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post("/reset-password", async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { token, newPassword } = value;

    // Hash token and find it
    const hashedToken = hashToken(token);
    const resetData = resetTokens.get(hashedToken);

    if (!resetData) {
      throw new TokenError("Invalid or expired reset token");
    }

    // Check if token is expired
    if (Date.now() > resetData.expiresAt) {
      resetTokens.delete(hashedToken);
      throw new TokenError("Reset token has expired");
    }

    // Find user
    const user = users.get(resetData.email);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    user.password = hashedPassword;
    user.passwordResetAt = new Date().toISOString();

    // Remove reset token
    resetTokens.delete(hashedToken);

    // Send confirmation email
    await emailService.sendPasswordResetConfirmation(user.email, {
      name: user.name,
      resetTime: user.passwordResetAt,
    });

    res.json({
      success: true,
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post("/verify-email", async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new ValidationError("Verification token is required");
    }

    // Hash token and find it
    const hashedToken = hashToken(token);
    const verificationData = verificationTokens.get(hashedToken);

    if (!verificationData) {
      throw new TokenError("Invalid or expired verification token");
    }

    // Check if token is expired
    if (Date.now() > verificationData.expiresAt) {
      verificationTokens.delete(hashedToken);
      throw new TokenError("Verification token has expired");
    }

    // Find user
    const user = users.get(verificationData.email);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date().toISOString();

    // Remove verification token
    verificationTokens.delete(hashedToken);

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, {
      name: user.name,
    });

    res.json({
      success: true,
      message:
        "Email verified successfully. You can now login to your account.",
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post("/resend-verification", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError("Email is required");
    }

    // Find user
    const user = users.get(email);
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message:
          "If an account with that email exists and is not verified, you will receive a verification email.",
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.json({
        success: true,
        message: "Email is already verified.",
      });
    }

    // Generate new verification token
    const verificationToken = generateSecureToken();
    const hashedToken = hashToken(verificationToken);

    // Store verification token
    verificationTokens.set(hashedToken, {
      email,
      token: verificationToken,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Send verification email
    await emailService.sendVerificationEmail(email, {
      name: user.name,
      verificationToken,
      verificationUrl: `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/verify-email?token=${verificationToken}`,
    });

    res.json({
      success: true,
      message:
        "If an account with that email exists and is not verified, you will receive a verification email.",
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/tokens/status
// @desc    Get token statistics (for debugging)
// @access  Public (remove in production)
router.get("/tokens/status", (req, res) => {
  const now = Date.now();

  // Count active tokens
  const activeResetTokens = Array.from(resetTokens.values()).filter(
    (t) => t.expiresAt > now
  );
  const activeVerificationTokens = Array.from(
    verificationTokens.values()
  ).filter((t) => t.expiresAt > now);

  res.json({
    success: true,
    data: {
      users: users.size,
      activeResetTokens: activeResetTokens.length,
      activeVerificationTokens: activeVerificationTokens.length,
      totalResetTokens: resetTokens.size,
      totalVerificationTokens: verificationTokens.size,
    },
  });
});

module.exports = router;
