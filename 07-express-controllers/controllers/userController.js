const User = require("../models/User")
const userService = require("../services/userService")

class UserController {
  // Get all users (admin only)
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search, sort } = req.query

      const options = {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        search,
        sort,
      }

      const result = await userService.getAllUsers(options)

      res.json({
        success: true,
        data: result.users,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalUsers: result.totalUsers,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
        message: "Users retrieved successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // Get current user profile
  async getCurrentUser(req, res, next) {
    try {
      const user = await User.findById(req.user.id)

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        })
      }

      res.json({
        success: true,
        data: user.toJSON(),
        message: "User profile retrieved successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // Update current user profile
  async updateCurrentUser(req, res, next) {
    try {
      const { name, email, phone, address } = req.body

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await User.findByEmail(email)
        if (existingUser && existingUser.id !== req.user.id) {
          return res.status(400).json({
            success: false,
            error: {
              code: "EMAIL_ALREADY_EXISTS",
              message: "Email address is already in use",
            },
          })
        }
      }

      const updatedUser = await User.update(req.user.id, {
        name,
        email,
        phone,
        address,
      })

      res.json({
        success: true,
        data: updatedUser.toJSON(),
        message: "Profile updated successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // Delete current user account
  async deleteCurrentUser(req, res, next) {
    try {
      await User.delete(req.user.id)

      res.json({
        success: true,
        message: "Account deleted successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // Get user by ID (admin only)
  async getUserById(req, res, next) {
    try {
      const user = await User.findById(req.params.id)

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        })
      }

      res.json({
        success: true,
        data: user.toJSON(),
        message: "User retrieved successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // Update user (admin only)
  async updateUser(req, res, next) {
    try {
      const { name, email, role, active } = req.body

      const updatedUser = await User.update(req.params.id, {
        name,
        email,
        role,
        active,
      })

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        })
      }

      res.json({
        success: true,
        data: updatedUser.toJSON(),
        message: "User updated successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // Delete user (admin only)
  async deleteUser(req, res, next) {
    try {
      const deleted = await User.delete(req.params.id)

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        })
      }

      res.json({
        success: true,
        message: "User deleted successfully",
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new UserController()
