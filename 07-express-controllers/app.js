// Express Controllers & MVC Architecture Demo

const express = require("express")
const path = require("path")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3000

console.log("🎮 Express Controllers & MVC Architecture Demo")
console.log("=".repeat(50))

// Import routes
const userRoutes = require("./routes/userRoutes")
const productRoutes = require("./routes/productRoutes")
const authRoutes = require("./routes/authRoutes")
const orderRoutes = require("./routes/orderRoutes")

// Import middleware
const errorHandler = require("./middleware/errorHandler")
const requestLogger = require("./middleware/requestLogger")

// Global middleware
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// Request logging
app.use(requestLogger)

// API Documentation route
app.get("/", (req, res) => {
  res.json({
    message: "🎮 Express Controllers & MVC Demo API",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register new user",
        "POST /api/auth/login": "User login",
        "POST /api/auth/refresh": "Refresh token",
        "POST /api/auth/logout": "User logout",
      },
      users: {
        "GET /api/users": "Get all users (admin only)",
        "GET /api/users/profile": "Get current user profile",
        "PUT /api/users/profile": "Update current user profile",
        "DELETE /api/users/profile": "Delete current user account",
      },
      products: {
        "GET /api/products": "Get all products",
        "GET /api/products/:id": "Get product by ID",
        "POST /api/products": "Create new product (admin only)",
        "PUT /api/products/:id": "Update product (admin only)",
        "DELETE /api/products/:id": "Delete product (admin only)",
      },
      orders: {
        "GET /api/orders": "Get user orders",
        "GET /api/orders/:id": "Get order by ID",
        "POST /api/orders": "Create new order",
        "PUT /api/orders/:id/status": "Update order status (admin only)",
      },
    },
    documentation: "Visit /api/docs for detailed API documentation",
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)

// API documentation
app.get("/api/docs", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "docs.html"))
})

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || "development",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
  })
})

// Global error handler
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`\n🌐 Server running at http://localhost:${PORT}`)
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`)
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`)
  console.log(`\nPress Ctrl+C to stop the server`)
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...")
  process.exit(0)
})

module.exports = app
