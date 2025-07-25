// User Controller
// HTTP request handlers for user operations

const userService = require("../services/userService");

const userController = {
  // GET /api/users - Get all users with pagination and filtering
  async getUsers(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: Math.min(parseInt(req.query.limit) || 10, 100), // Max 100 per page
        search: req.query.search || "",
        sort: req.query.sort || "id",
        role: req.query.role || "",
        isActive: req.query.isActive || "",
      };

      const result = await userService.findUsers(options);

      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
        message: "Users retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/users/:id - Get user by ID
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_USER_ID",
            message: "Valid user ID is required",
          },
        });
      }

      const user = await userService.findUserById(id);

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
        message: "User retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/users - Create new user
  async createUser(req, res, next) {
    try {
      const userData = req.body;

      const newUser = await userService.createUser(userData);

      res.status(201).json({
        success: true,
        data: newUser,
        message: "User created successfully",
      });
    } catch (error) {
      if (
        error.message.includes("Validation failed") ||
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

  // PUT /api/users/:id - Update user (full replacement)
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const userData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_USER_ID",
            message: "Valid user ID is required",
          },
        });
      }

      const updatedUser = await userService.updateUser(id, userData);

      res.json({
        success: true,
        data: updatedUser,
        message: "User updated successfully",
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        });
      }
      if (
        error.message.includes("Validation failed") ||
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

  // PATCH /api/users/:id - Update user (partial update)
  async patchUser(req, res, next) {
    try {
      const { id } = req.params;
      const userData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_USER_ID",
            message: "Valid user ID is required",
          },
        });
      }

      const updatedUser = await userService.updateUser(id, userData);

      res.json({
        success: true,
        data: updatedUser,
        message: "User updated successfully",
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        });
      }
      if (
        error.message.includes("Validation failed") ||
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

  // DELETE /api/users/:id - Delete user
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_USER_ID",
            message: "Valid user ID is required",
          },
        });
      }

      const deletedUser = await userService.deleteUser(id);

      res.json({
        success: true,
        data: deletedUser,
        message: "User deleted successfully",
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        });
      }
      next(error);
    }
  },

  // GET /api/users/stats - Get user statistics
  async getUserStats(req, res, next) {
    try {
      const stats = await userService.getUserStats();

      res.json({
        success: true,
        data: stats,
        message: "User statistics retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
