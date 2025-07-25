const express = require("express")
const router = express.Router()
const productController = require("../controllers/productController")
const { authenticateToken, requireRole } = require("../middleware/auth")
const { validateProduct, validateProductUpdate } = require("../middleware/validation")

// Public routes
router.get("/", productController.getAllProducts)
router.get("/search", productController.searchProducts)
router.get("/categories", productController.getCategories)
router.get("/:id", productController.getProductById)

// Protected routes (admin only)
router.post("/", authenticateToken, requireRole("admin"), validateProduct, productController.createProduct)
router.put("/:id", authenticateToken, requireRole("admin"), validateProductUpdate, productController.updateProduct)
router.delete("/:id", authenticateToken, requireRole("admin"), productController.deleteProduct)

module.exports = router
