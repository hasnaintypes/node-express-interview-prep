// JWT Authentication & Security Demo

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const cookieParser = require("cookie-parser")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000

console.log("🔐 JWT Authentication & Security Demo")
console.log("=".repeat(50))

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const protectedRoutes = require("./routes/protected")

// Import middleware
const errorHandler = require("./middleware/errorHandler")
const requestLogger = require("./middleware/requestLogger")
const { authenticateToken } = require("./middleware/auth")
const { generalLimiter } = require("./utils/rateLimiter")

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
  }),
)

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
)

// General rate limiting
app.use(generalLimiter)

// Body parsing and cookies
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Serve static files
app.use(express.static(path.join(__dirname, 'public')))

// Request logging
app.use(requestLogger)

// API Documentation
app.get("/", (req, res) => {
  res.json({
    name: "JWT Authentication & Security Demo",
    version: "1.0.0",
    description: "Comprehensive JWT authentication system with security best practices",
    features: [
      "User registration and login",
      "JWT token generation and validation",
      "Password hashing with bcrypt",
      "Protected routes and middleware",
      "Token refresh mechanism",
      "Role-based authorization",
      "Rate limiting and security headers",
      "Account lockout protection",
      "Password reset functionality",
      "Security audit logging",
    ],
    endpoints: {
      authentication: {
        "POST /api/auth/register": "Register new user",
        "POST /api/auth/login": "User login",
        "POST /api/auth/refresh": "Refresh access token",
        "POST /api/auth/logout": "User logout",
        "POST /api/auth/forgot-password": "Request password reset",
        "POST /api/auth/reset-password": "Reset password with token",
        "POST /api/auth/change-password": "Change password (authenticated)",
      },
      users: {
        "GET /api/users/profile": "Get current user profile",
        "PUT /api/users/profile": "Update user profile",
        "DELETE /api/users/profile": "Delete user account",
      },
      protected: {
        "GET /api/protected/user": "User-only protected route",
        "GET /api/protected/admin": "Admin-only protected route",
        "GET /api/protected/moderator": "Moderator+ protected route",
      },
    },
    security: {
      rateLimit: "5 auth attempts per 15 minutes, 100 general requests per 15 minutes",
      passwordPolicy: "Minimum 8 characters, uppercase, lowercase, number, special character",
      tokenExpiry: "Access: 15 minutes, Refresh: 7 days",
      encryption: "bcrypt with 12 salt rounds",
      headers: "Helmet security headers enabled",
    },
  })
})

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || "development",
    },
  })
})

// Authentication demo endpoints
app.get("/api/demo/public", (req, res) => {
  res.json({
    success: true,
    data: {
      message: "This is a public endpoint - no authentication required",
      timestamp: new Date().toISOString(),
      ip: req.ip,
    },
  })
})

app.get("/api/demo/protected", authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      message: "This is a protected endpoint - authentication required",
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
      timestamp: new Date().toISOString(),
    },
  })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/protected", protectedRoutes)

// Token validation endpoint
app.post("/api/validate-token", (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({
      success: false,
      error: {
        code: "TOKEN_REQUIRED",
        message: "Token is required for validation",
      },
    })
  }

  try {
    const jwt = require("jsonwebtoken")
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    res.json({
      success: true,
      data: {
        valid: true,
        decoded: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          iat: decoded.iat,
          exp: decoded.exp,
        },
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
      },
    })
  } catch (error) {
    res.json({
      success: true,
      data: {
        valid: false,
        error: error.message,
      },
    })
  }
})

// Security information endpoint
app.get("/api/security-info", (req, res) => {
  res.json({
    success: true,
    data: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
      },
      tokenPolicy: {
        accessTokenExpiry: "15 minutes",
        refreshTokenExpiry: "7 days",
        algorithm: "HS256",
        issuer: "jwt-auth-demo",
      },
      rateLimits: {
        authentication: "5 attempts per 15 minutes",
        general: "100 requests per 15 minutes",
      },
      securityHeaders: [
        "Content-Security-Policy",
        "X-Content-Type-Options",
        "X-Frame-Options",
        "X-XSS-Protection",
        "Strict-Transport-Security",
      ],
      accountSecurity: {
        maxLoginAttempts: 5,
        lockoutDuration: "30 minutes",
        passwordResetExpiry: "10 minutes",
      },
    },
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  })
})

// Global error handler
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`\n🌐 Server running at http://localhost:${PORT}`)
  console.log(`🔐 Authentication endpoints: http://localhost:${PORT}/api/auth`)
  console.log(`🛡️  Security info: http://localhost:${PORT}/api/security-info`)
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`)
  console.log(`\n📋 Test credentials:`)
  console.log(`   Email: admin@example.com, Password: Admin123!`)
  console.log(`   Email: user@example.com, Password: User123!`)
  console.log(`\nPress Ctrl+C to stop the server`)
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...")
  process.exit(0)
});

module.exports = app
