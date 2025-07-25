// API Design Principles & Best Practices Demo

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const compression = require("compression")

const app = express()
const PORT = process.env.PORT || 3000

console.log("🌐 API Design Principles & Best Practices Demo")
console.log("=".repeat(50))

// Import routes
const userRoutes = require("./routes/users")
const productRoutes = require("./routes/products")
const orderRoutes = require("./routes/orders")
const authRoutes = require("./routes/auth")

// Import middleware
const errorHandler = require("./middleware/errorHandler")
const requestLogger = require("./middleware/requestLogger")
const apiValidator = require("./middleware/apiValidator")

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests from this IP, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use("/api", limiter)

// Compression
app.use(compression())

// Body parsing
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Request logging
app.use(requestLogger)

// API validation middleware
app.use("/api", apiValidator)

// API Documentation
app.get("/", (req, res) => {
  res.json({
    name: "RESTful API Design Demo",
    version: "1.0.0",
    description: "Demonstration of REST API design principles and best practices",
    documentation: {
      swagger: "/api/docs",
      postman: "/api/postman",
      examples: "/api/examples",
    },
    endpoints: {
      authentication: {
        "POST /api/auth/login": "User authentication",
        "POST /api/auth/register": "User registration",
        "POST /api/auth/refresh": "Token refresh",
        "DELETE /api/auth/logout": "User logout",
      },
      users: {
        "GET /api/users": "List users with pagination and filtering",
        "GET /api/users/:id": "Get user by ID",
        "POST /api/users": "Create new user",
        "PUT /api/users/:id": "Update user (full replacement)",
        "PATCH /api/users/:id": "Update user (partial)",
        "DELETE /api/users/:id": "Delete user",
      },
      products: {
        "GET /api/products": "List products with advanced filtering",
        "GET /api/products/:id": "Get product details",
        "POST /api/products": "Create new product",
        "PUT /api/products/:id": "Update product",
        "DELETE /api/products/:id": "Delete product",
        "GET /api/products/categories": "Get product categories",
        "GET /api/products/search": "Advanced product search",
      },
      orders: {
        "GET /api/orders": "List user orders",
        "GET /api/orders/:id": "Get order details",
        "POST /api/orders": "Create new order",
        "PATCH /api/orders/:id/status": "Update order status",
        "DELETE /api/orders/:id": "Cancel order",
      },
    },
    features: [
      "RESTful URL design",
      "Proper HTTP status codes",
      "Consistent response format",
      "Comprehensive error handling",
      "Request/response validation",
      "Pagination and filtering",
      "API versioning",
      "Rate limiting",
      "Security headers",
      "Request logging",
      "API documentation",
    ],
  })
})

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: "1.0.0",
    },
    message: "API is running smoothly",
  })
})

// API Information
app.get("/api/info", (req, res) => {
  res.json({
    success: true,
    data: {
      name: "RESTful API Demo",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      features: {
        authentication: true,
        rateLimit: true,
        compression: true,
        cors: true,
        validation: true,
        logging: true,
        errorHandling: true,
      },
      limits: {
        requestSize: "10MB",
        rateLimit: "100 requests per 15 minutes",
        pagination: {
          default: 10,
          maximum: 100,
        },
      },
    },
    message: "API information retrieved successfully",
  })
})

// API Examples
app.get("/api/examples", (req, res) => {
  res.json({
    success: true,
    data: {
      pagination: {
        url: "/api/users?page=2&limit=10",
        description: "Get users with pagination",
      },
      filtering: {
        url: "/api/products?category=electronics&price[gte]=100&price[lte]=500",
        description: "Filter products by category and price range",
      },
      sorting: {
        url: "/api/users?sort=name,-createdAt",
        description: "Sort users by name ascending, createdAt descending",
      },
      fieldSelection: {
        url: "/api/users?fields=id,name,email",
        description: "Select specific fields only",
      },
      search: {
        url: "/api/products/search?q=laptop&category=electronics",
        description: "Search products with query and filters",
      },
    },
    message: "API usage examples",
  })
})

// API Routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/products", productRoutes)
app.use("/api/v1/orders", orderRoutes)

// Version-less routes (redirect to latest version)
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)

// API Documentation routes
app.get("/api/docs", (req, res) => {
  res.json({
    success: true,
    data: {
      openapi: "3.0.0",
      info: {
        title: "RESTful API Demo",
        version: "1.0.0",
        description: "Comprehensive API demonstrating REST principles",
      },
      servers: [
        {
          url: `http://localhost:${PORT}/api/v1`,
          description: "Development server",
        },
      ],
      paths: {
        "/users": {
          get: {
            summary: "Get all users",
            parameters: [
              {
                name: "page",
                in: "query",
                schema: { type: "integer", default: 1 },
              },
              {
                name: "limit",
                in: "query",
                schema: { type: "integer", default: 10, maximum: 100 },
              },
              {
                name: "search",
                in: "query",
                schema: { type: "string" },
              },
              {
                name: "sort",
                in: "query",
                schema: { type: "string", example: "name,-createdAt" },
              },
            ],
            responses: {
              200: {
                description: "Successful response",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        data: { type: "array" },
                        pagination: { type: "object" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    message: "OpenAPI documentation",
  })
})

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ENDPOINT_NOT_FOUND",
      message: `API endpoint ${req.method} ${req.originalUrl} not found`,
      suggestion: "Check the API documentation at /api/docs",
    },
    meta: {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
    },
  })
})

// Global 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
      suggestion: "Visit / for API documentation",
    },
  })
})

// Global error handler
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`\n🌐 Server running at http://localhost:${PORT}`)
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`)
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`)
  console.log(`📋 API Examples: http://localhost:${PORT}/api/examples`)
  console.log(`\nPress Ctrl+C to stop the server`)
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...")
  process.exit(0)
})

module.exports = app
