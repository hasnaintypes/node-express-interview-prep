// User Routes - User management and email preferences

const express = require("express");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const router = express.Router();

const emailService = require("../services/emailService");
const {
  ValidationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
} = require("../utils/errors");

// Mock database - same as auth routes
const users = new Map();

// Mock authentication middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new AuthorizationError("Access token required");
  }

  // In real app, verify JWT and set req.user
  // Mock user for demo
  req.user = {
    id: "user-123",
    email: "user@example.com",
  };

  next();
};

// Validation schemas
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  phone: Joi.string().pattern(/^\+?[\d\s-()]+$/),
  bio: Joi.string().max(500),
  preferences: Joi.object({
    language: Joi.string().valid("en", "es", "fr", "de"),
    timezone: Joi.string(),
    theme: Joi.string().valid("light", "dark"),
  }),
});

const changeEmailSchema = Joi.object({
  newEmail: Joi.string().email().required(),
  password: Joi.string().required(),
});

const emailPreferencesSchema = Joi.object({
  marketing: Joi.boolean(),
  notifications: Joi.boolean(),
  security: Joi.boolean(),
  newsletter: Joi.boolean(),
  productUpdates: Joi.boolean(),
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", requireAuth, async (req, res, next) => {
  try {
    // Find user by ID from token
    const user = Array.from(users.values()).find((u) => u.id === req.user.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Return user profile without password
    const { password, ...userProfile } = user;

    res.json({
      success: true,
      data: {
        user: userProfile,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", requireAuth, async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    // Find user
    const user = Array.from(users.values()).find((u) => u.id === req.user.id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Update user profile
    const updatedFields = {};
    if (value.name) {
      user.name = value.name;
      updatedFields.name = value.name;
    }
    if (value.phone) {
      user.phone = value.phone;
      updatedFields.phone = value.phone;
    }
    if (value.bio) {
      user.bio = value.bio;
      updatedFields.bio = value.bio;
    }
    if (value.preferences) {
      user.preferences = { ...user.preferences, ...value.preferences };
      updatedFields.preferences = user.preferences;
    }

    user.updatedAt = new Date().toISOString();

    // Send profile update notification
    await emailService.sendProfileUpdateNotification(user.email, {
      name: user.name,
      updatedFields: Object.keys(updatedFields),
      updateTime: user.updatedAt,
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          bio: user.bio,
          preferences: user.preferences,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/change-email
// @desc    Change user email address
// @access  Private
router.post("/change-email", requireAuth, async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = changeEmailSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { newEmail, password } = value;

    // Find user
    const user = Array.from(users.values()).find((u) => u.id === req.user.id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ValidationError("Invalid password");
    }

    // Check if new email is already taken
    if (users.has(newEmail)) {
      throw new ConflictError("Email already in use");
    }

    // Store old email for cleanup
    const oldEmail = user.email;

    // Update email and mark as unverified
    user.email = newEmail;
    user.isEmailVerified = false;
    user.emailChangeAt = new Date().toISOString();

    // Remove old email key and add new one
    users.delete(oldEmail);
    users.set(newEmail, user);

    // Send verification email to new address
    await emailService.sendEmailChangeVerification(newEmail, {
      name: user.name,
      oldEmail,
      newEmail,
      verificationUrl: `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/verify-email-change`,
    });

    // Send notification to old email
    await emailService.sendEmailChangeNotification(oldEmail, {
      name: user.name,
      newEmail,
      changeTime: user.emailChangeAt,
    });

    res.json({
      success: true,
      message: "Email change initiated. Please verify your new email address.",
      data: {
        oldEmail,
        newEmail,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/email-preferences
// @desc    Get user email preferences
// @access  Private
router.get("/email-preferences", requireAuth, async (req, res, next) => {
  try {
    // Find user
    const user = Array.from(users.values()).find((u) => u.id === req.user.id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const preferences = user.emailPreferences || {
      marketing: true,
      notifications: true,
      security: true,
      newsletter: false,
      productUpdates: true,
    };

    res.json({
      success: true,
      data: {
        preferences,
        lastUpdated: user.preferencesUpdatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/email-preferences
// @desc    Update user email preferences
// @access  Private
router.put("/email-preferences", requireAuth, async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = emailPreferencesSchema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    // Find user
    const user = Array.from(users.values()).find((u) => u.id === req.user.id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Update preferences
    user.emailPreferences = {
      ...user.emailPreferences,
      ...value,
    };
    user.preferencesUpdatedAt = new Date().toISOString();

    // Send confirmation email
    await emailService.sendPreferencesUpdateConfirmation(user.email, {
      name: user.name,
      preferences: user.emailPreferences,
      updateTime: user.preferencesUpdatedAt,
    });

    res.json({
      success: true,
      message: "Email preferences updated successfully",
      data: {
        preferences: user.emailPreferences,
        lastUpdated: user.preferencesUpdatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/unsubscribe
// @desc    Unsubscribe from all emails
// @access  Public (token-based)
router.post("/unsubscribe", async (req, res, next) => {
  try {
    const { token, email } = req.body;

    if (!token && !email) {
      throw new ValidationError("Token or email is required");
    }

    // In real app, verify unsubscribe token
    // For demo, find user by email
    const user = users.get(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Update preferences to disable all emails
    user.emailPreferences = {
      marketing: false,
      notifications: false,
      security: true, // Keep security emails enabled
      newsletter: false,
      productUpdates: false,
    };
    user.unsubscribedAt = new Date().toISOString();

    // Send confirmation
    await emailService.sendUnsubscribeConfirmation(user.email, {
      name: user.name,
      unsubscribeTime: user.unsubscribedAt,
    });

    res.json({
      success: true,
      message:
        "You have been unsubscribed from marketing emails. Security notifications will still be sent.",
      data: {
        unsubscribedAt: user.unsubscribedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/activity
// @desc    Get user activity log
// @access  Private
router.get("/activity", requireAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    // Mock activity data
    const activities = [
      {
        id: 1,
        type: "login",
        description: "User logged in",
        timestamp: new Date().toISOString(),
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0...",
      },
      {
        id: 2,
        type: "profile_update",
        description: "Profile updated",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        ip: "192.168.1.1",
      },
      {
        id: 3,
        type: "email_change",
        description: "Email address changed",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        ip: "192.168.1.1",
      },
    ];

    const filteredActivities = type
      ? activities.filter((a) => a.type === type)
      : activities;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        activities: paginatedActivities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredActivities.length,
          pages: Math.ceil(filteredActivities.length / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete("/account", requireAuth, async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      throw new ValidationError("Password is required to delete account");
    }

    // Find user
    const user = Array.from(users.values()).find((u) => u.id === req.user.id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ValidationError("Invalid password");
    }

    // Send account deletion notification
    await emailService.sendAccountDeletionNotification(user.email, {
      name: user.name,
      deletionTime: new Date().toISOString(),
    });

    // Delete user
    users.delete(user.email);

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
