// Password Reset & Email Integration Demo

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const cookieParser = require("cookie-parser")

const app = express()
const PORT = process.env.PORT || 3000

console.log("📧 Password Reset & Email Integration Demo")
console.log("=".repeat(50))

// Import routes
const authRoutes = require("./routes/auth")
const emailRoutes = require("./routes/email")
const userRoutes = require("./routes/users")

// Import middleware
const errorHandler = require("./middleware/errorHandler")
const requestLogger = require("./middleware/requestLogger")

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per window per IP/email
  message: {
    success: false,
    error: {
      code: "TOO_MANY_RESET_REQUESTS",
      message: "Too many password reset requests. Please try again later.",
    },
  },
  keyGenerator: (req) => {
    return req.body.email || req.ip
  },
})

// Email verification rate limiting
const emailVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 requests per window
  message: {
    success: false,
    error: {
      code: "TOO_MANY_VERIFICATION_REQUESTS",
      message: "Too many email verification requests. Please try again later.",
    },
  },
})

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
    },
  },
})

app.use("/api/auth/forgot-password", passwordResetLimiter)
app.use("/api/auth/resend-verification", emailVerificationLimiter)
app.use("/api", generalLimiter)

// Body parsing and cookies
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Request logging
app.use(requestLogger)

// API Documentation
app.get("/", (req, res) => {
  res.json({
    name: "Password Reset & Email Integration Demo",
    version: "1.0.0",
    description: "Comprehensive email integration system with secure password reset functionality",
    features: [
      "Secure password reset flow",
      "Email verification system",
      "Template-based emails",
      "Rate limiting protection",
      "Audit logging",
      "Multi-provider email support",
      "Email analytics",
      "Security notifications",
      "Welcome email sequences",
      "Responsive email templates",
    ],
    endpoints: {
      authentication: {
        "POST /api/auth/register": "Register with email verification",
        "POST /api/auth/login": "User login",
        "POST /api/auth/forgot-password": "Request password reset",
        "POST /api/auth/reset-password": "Reset password with token",
        "POST /api/auth/verify-email": "Verify email address",
        "POST /api/auth/resend-verification": "Resend verification email",
      },
      email: {
        "GET /api/email/templates": "List available email templates",
        "POST /api/email/send": "Send custom email (admin only)",
        "GET /api/email/analytics": "Email analytics (admin only)",
        "POST /api/email/test": "Test email configuration",
      },
      users: {
        "GET /api/users/profile": "Get user profile",
        "PUT /api/users/profile": "Update user profile",
        "POST /api/users/change-email": "Change email address",
        "GET /api/users/email-preferences": "Get email preferences",
        "PUT /api/users/email-preferences": "Update email preferences",
      },
    },
    emailProviders: {
      supported: ["SMTP", "SendGrid", "Mailgun", "Amazon SES"],
      current: process.env.EMAIL_PROVIDER || "SMTP",
      features: ["HTML templates", "Attachments", "Analytics", "Webhooks"],
    },
    security: {
      tokenExpiry: "10 minutes for password reset",
      rateLimits: {
        passwordReset: "3 requests per 15 minutes",
        emailVerification: "3 requests per 5 minutes",
        general: "100 requests per 15 minutes",
      },
      encryption: "SHA-256 for token hashing",
      auditLogging: "All email events logged",
    },
  })
})

// Health check with email service status
app.get("/api/health", async (req, res) => {
  const emailService = require("./services/emailService")

  let emailStatus = "unknown"
  try {
    await emailService.testConnection()
    emailStatus = "healthy"
  } catch (error) {
    emailStatus = "unhealthy"
  }

  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        email: emailStatus,
        database: "healthy", // Mock status
      },
      environment: process.env.NODE_ENV || "development",
    },
  })
})

// Email service test endpoint
app.post("/api/test-email", async (req, res) => {
  try {
    const { to, subject = "Test Email", template = "test" } = req.body

    if (!to) {
      return res.status(400).json({
        success: false,
        error: {
          code: "EMAIL_REQUIRED",
          message: "Recipient email address is required",
        },
      })
    }

    const emailService = require("./services/emailService")

    await emailService.sendTestEmail(to, {
      subject,
      template,
      data: {
        testMessage: "This is a test email from the Password Reset & Email Integration Demo",
        timestamp: new Date().toISOString(),
        serverInfo: {
          nodeVersion: process.version,
          platform: process.platform,
        },
      },
    })

    res.json({
      success: true,
      message: "Test email sent successfully",
      data: {
        recipient: to,
        subject,
        template,
        sentAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "EMAIL_SEND_FAILED",
        message: "Failed to send test email",
        details: error.message,
      },
    })
  }
})

// Email configuration info
app.get("/api/email-config", (req, res) => {
  res.json({
    success: true,
    data: {
      provider: process.env.EMAIL_PROVIDER || "SMTP",
      configuration: {
        host: process.env.SMTP_HOST || "Not configured",
        port: process.env.SMTP_PORT || "Not configured",
        secure: process.env.SMTP_SECURE === "true",
        fromEmail: process.env.FROM_EMAIL || "Not configured",
        fromName: process.env.FROM_NAME || "Not configured",
      },
      features: {
        templates: true,
        analytics: true,
        attachments: true,
        scheduling: false,
        webhooks: false,
      },
      limits: {
        dailyLimit: process.env.EMAIL_DAILY_LIMIT || "Unlimited",
        hourlyLimit: process.env.EMAIL_HOURLY_LIMIT || "Unlimited",
        maxRecipients: process.env.EMAIL_MAX_RECIPIENTS || "1",
      },
    },
  })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/email", emailRoutes)
app.use("/api/users", userRoutes)

// Email webhook endpoint (for email service providers)
app.post("/api/webhooks/email", (req, res) => {
  try {
    const { event, email, timestamp, data } = req.body

    // Log email event
    console.log(`Email webhook received: ${event} for ${email}`)

    // Process webhook based on event type
    switch (event) {
      case "delivered":
        // Handle email delivered
        break
      case "opened":
        // Handle email opened
        break
      case "clicked":
        // Handle link clicked
        break
      case "bounced":
        // Handle email bounced
        break
      case "complained":
        // Handle spam complaint
        break
      default:
        console.log(`Unknown email event: ${event}`)
    }

    res.json({
      success: true,
      message: "Webhook processed successfully",
    })
  } catch (error) {
    console.error("Webhook processing error:", error)
    res.status(500).json({
      success: false,
      error: "Webhook processing failed",
    })
  }
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
  console.log(`📧 Email endpoints: http://localhost:${PORT}/api/email`)
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`)
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`)
  console.log(`\n📋 Test email: POST http://localhost:${PORT}/api/test-email`)
  console.log(`📊 Email config: GET http://localhost:${PORT}/api/email-config`)
  console.log(`\nPress Ctrl+C to stop the server`)
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...")
  process.exit(0)
})

module.exports = app
