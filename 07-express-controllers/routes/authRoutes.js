const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { validateRegister, validateLogin } = require("../middleware/validation")
const { authenticateToken } = require("../middleware/auth")

// Authentication routes
router.post("/register", validateRegister, authController.register)
router.post("/login", validateLogin, authController.login)
router.post("/refresh", authController.refreshToken)
router.post("/logout", authenticateToken, authController.logout)

module.exports = router
