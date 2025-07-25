// User routes for protected user operations

const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  requireAdmin,
  requireOwnership,
} = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validation");
const {
  userIdValidation,
  userQueryValidation,
} = require("../utils/validators");
const User = require("../models/User");
const { AppError } = require("../utils/errors");

// GET /api/users/me - Get current user profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

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
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get user profile",
      },
    });
  }
});

// GET /api/users - Get all users (admin only)
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  userQueryValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort = "createdAt",
        order = "desc",
        role,
      } = req.query;

      let users = await User.findAll();

      // Filter by role if provided
      if (role) {
        users = users.filter((user) => user.role === role);
      }

      // Sort users
      users.sort((a, b) => {
        if (order === "asc") {
          return a[sort] > b[sort] ? 1 : -1;
        } else {
          return a[sort] < b[sort] ? 1 : -1;
        }
      });

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedUsers = users.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          users: paginatedUsers.map((user) => user.toJSON()),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: users.length,
            pages: Math.ceil(users.length / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get users",
        },
      });
    }
  }
);

// GET /api/users/:id - Get user by ID (admin or own profile)
router.get(
  "/:id",
  authenticateToken,
  userIdValidation,
  handleValidationErrors,
  requireOwnership("id"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

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
        data: {
          user: user.toJSON(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get user",
        },
      });
    }
  }
);

// PUT /api/users/:id - Update user (admin or own profile)
router.put(
  "/:id",
  authenticateToken,
  userIdValidation,
  handleValidationErrors,
  requireOwnership("id"),
  async (req, res) => {
    try {
      const { name, email, role } = req.body;
      const userId = req.params.id;

      // Check if user exists
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        });
      }

      // Only admin can change role
      if (role && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: {
            code: "INSUFFICIENT_PERMISSIONS",
            message: "Only admin can change user role",
          },
        });
      }

      // Check if email is already taken by another user
      if (email && email !== existingUser.email) {
        const emailUser = await User.findByEmail(email);
        if (emailUser && emailUser.id !== parseInt(userId)) {
          return res.status(409).json({
            success: false,
            error: {
              code: "EMAIL_ALREADY_EXISTS",
              message: "Email is already taken",
            },
          });
        }
      }

      // Update user
      const updatedUser = await User.update(userId, {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
      });

      res.json({
        success: true,
        data: {
          user: updatedUser.toJSON(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user",
        },
      });
    }
  }
);

// DELETE /api/users/:id - Delete user (admin only)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  userIdValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.params.id;

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        });
      }

      // Prevent admin from deleting themselves
      if (parseInt(userId) === req.user.id) {
        return res.status(400).json({
          success: false,
          error: {
            code: "CANNOT_DELETE_SELF",
            message: "Cannot delete your own account",
          },
        });
      }

      // Delete user
      await User.delete(userId);

      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete user",
        },
      });
    }
  }
);

module.exports = router;
