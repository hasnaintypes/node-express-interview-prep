const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const { authenticateToken, requireRole } = require("../middleware/auth")
const { validateUser, validateUserUpdate } = require("../middleware/validation")

// Get all users (admin only)
router.get("/", authenticateToken, requireRole("admin"), userController.getAllUsers)

// Get current user profile
router.get("/profile", authenticateToken, userController.getCurrentUser)

// Update current user profile
router.put("/profile", authenticateToken, validateUserUpdate, userController.updateCurrentUser)

// Delete current user account
router.delete("/profile", authenticateToken, userController.deleteCurrentUser)

// Admin routes
router.get("/:id", authenticateToken, requireRole("admin"), userController.getUserById)
router.put("/:id", authenticateToken, requireRole("admin"), validateUserUpdate, userController.updateUser)
router.delete("/:id", authenticateToken, requireRole("admin"), userController.deleteUser)

module.exports = router
