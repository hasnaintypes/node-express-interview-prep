// API Routes Module

const express = require("express")
const router = express.Router()

// API status and information
router.get("/status", (req, res) => {
  res.json({
    status: "healthy",
    message: "API is running smoothly",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || "development",
  })
})

// API endpoints documentation
router.get("/endpoints", (req, res) => {
  res.json({
    message: "Available API endpoints",
    endpoints: {
      users: {
        "GET /api/users": "Get all users",
        "GET /api/users/:id": "Get user by ID",
        "POST /api/users": "Create new user",
        "PUT /api/users/:id": "Update user",
        "DELETE /api/users/:id": "Delete user",
      },
      api: {
        "GET /api/v1/status": "API health check",
        "GET /api/v1/endpoints": "API documentation",
        "GET /api/v1/stats": "API usage statistics",
      },
    },
  })
})

// API usage statistics
router.get("/stats", (req, res) => {
  res.json({
    message: "API usage statistics",
    stats: {
      totalRequests: Math.floor(Math.random() * 10000),
      activeUsers: Math.floor(Math.random() * 100),
      responseTime: Math.floor(Math.random() * 100) + "ms",
      errorRate: (Math.random() * 5).toFixed(2) + "%",
      lastRequest: new Date().toISOString(),
    },
  })
})

module.exports = router
