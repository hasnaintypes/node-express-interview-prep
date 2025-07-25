const express = require("express")
const router = express.Router()
const orderController = require("../controllers/orderController")
const { authenticateToken, requireRole } = require("../middleware/auth")
const { validateOrder } = require("../middleware/validation")

// User routes
router.get("/", authenticateToken, orderController.getUserOrders)
router.get("/:id", authenticateToken, orderController.getOrderById)
router.post("/", authenticateToken, validateOrder, orderController.createOrder)

// Admin routes
router.get("/admin/all", authenticateToken, requireRole("admin"), orderController.getAllOrders)
router.put("/:id/status", authenticateToken, requireRole("admin"), orderController.updateOrderStatus)

module.exports = router
