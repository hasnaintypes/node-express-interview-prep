// Express Middleware & Error Handling Examples

const express = require("express")
const path = require("path")

const app = express()
const PORT = 3000

console.log("🔧 Express Middleware & Error Handling Demo")
console.log("=".repeat(50))

// Import custom middleware
const customMiddleware = require("./middleware/custom")
const authMiddleware = require("./middleware/auth")
const validationMiddleware = require("./middleware/validation")
const errorHandler = require("./middleware/errorHandler")

// 1. Built-in Middleware
console.log("\n📦 Setting up built-in middleware...")

// Parse JSON bodies (built-in)
app.use(express.json({ limit: "10mb" }))

// Parse URL-encoded bodies (built-in)
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Serve static files (built-in)
app.use(express.static(path.join(__dirname, "public")))

// 2. Custom Application-Level Middleware
console.log("🎭 Setting up custom middleware...")

// Request logging middleware
app.use(customMiddleware.requestLogger)

// Request timing middleware
app.use(customMiddleware.requestTimer)

// Request ID middleware
app.use(customMiddleware.requestId)

// 3. Security Middleware
console.log("🔒 Setting up security middleware...")

// CORS middleware
app.use(customMiddleware.cors)

// Security headers middleware
app.use(customMiddleware.securityHeaders)

// Rate limiting middleware
app.use("/api", customMiddleware.rateLimit)

// 4. Routes with Different Middleware

// Home route
app.get("/", (req, res) => {
  res.send(`
    <h1>🔧 Express Middleware Demo</h1>
    <p>Request ID: ${req.requestId}</p>
    <p>Server Time: ${new Date().toISOString()}</p>
    <ul>
      <li><a href="/api/public">Public API</a></li>
      <li><a href="/api/protected">Protected API</a></li>
      <li><a href="/api/admin">Admin API</a></li>
      <li><a href="/api/validate">Validation Test</a></li>
      <li><a href="/api/error">Error Test</a></li>
    </ul>
  `)
})

// Public API route
app.get("/api/public", (req, res) => {
  res.json({
    message: "Public API endpoint",
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    ip: req.ip,
  })
})

// Protected API route (requires authentication)
app.get("/api/protected", authMiddleware.authenticateToken, (req, res) => {
  res.json({
    message: "Protected API endpoint",
    user: req.user,
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  })
})

// Admin API route (requires admin role)
app.get("/api/admin", authMiddleware.authenticateToken, authMiddleware.requireRole("admin"), (req, res) => {
  res.json({
    message: "Admin API endpoint",
    user: req.user,
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  })
})

// Login route (generates JWT token)
app.post("/api/login", validationMiddleware.loginValidation, (req, res) => {
  const { username, password } = req.body

  // Mock authentication (in real app, check against database)
  if (username === "admin" && password === "password") {
    const token = authMiddleware.generateToken({
      id: 1,
      username: "admin",
      role: "admin",
    })

    res.json({
      message: "Login successful",
      token,
      user: { id: 1, username: "admin", role: "admin" },
    })
  } else if (username === "user" && password === "password") {
    const token = authMiddleware.generateToken({
      id: 2,
      username: "user",
      role: "user",
    })

    res.json({
      message: "Login successful",
      token,
      user: { id: 2, username: "user", role: "user" },
    })
  } else {
    res.status(401).json({
      error: "Invalid credentials",
    })
  }
})

// User creation route with validation
app.post("/api/users", validationMiddleware.userValidation, (req, res) => {
  const { name, email, age } = req.body

  // Mock user creation
  const newUser = {
    id: Date.now(),
    name,
    email,
    age,
    createdAt: new Date().toISOString(),
  }

  res.status(201).json({
    message: "User created successfully",
    user: newUser,
  })
})

// Validation test route
app.get("/api/validate", (req, res) => {
  res.send(`
    <h2>🔍 Validation Test</h2>
    <form method="POST" action="/api/users">
      <div>
        <label>Name:</label>
        <input type="text" name="name" required>
      </div>
      <div>
        <label>Email:</label>
        <input type="email" name="email" required>
      </div>
      <div>
        <label>Age:</label>
        <input type="number" name="age" min="0" max="120" required>
      </div>
      <button type="submit">Create User</button>
    </form>
  `)
})

// Multiple middleware example
app.get(
  "/api/multi-middleware",
  // Multiple middleware functions
  (req, res, next) => {
    console.log("🥇 First middleware")
    req.step1 = "completed"
    next()
  },
  (req, res, next) => {
    console.log("🥈 Second middleware")
    req.step2 = "completed"
    next()
  },
  (req, res, next) => {
    console.log("🥉 Third middleware")
    req.step3 = "completed"
    next()
  },
  (req, res) => {
    res.json({
      message: "Multi-middleware route",
      steps: {
        step1: req.step1,
        step2: req.step2,
        step3: req.step3,
      },
      requestId: req.requestId,
    })
  },
)

// Conditional middleware example
app.get(
  "/api/conditional",
  (req, res, next) => {
    // Only apply middleware if query parameter is present
    if (req.query.debug === "true") {
      console.log("🐛 Debug mode enabled")
      req.debugMode = true
    }
    next()
  },
  (req, res) => {
    res.json({
      message: "Conditional middleware",
      debugMode: req.debugMode || false,
      query: req.query,
    })
  },
)

// Error generation routes
app.get("/api/error", (req, res, next) => {
  const error = new Error("This is a test error")
  error.status = 500
  next(error)
})

app.get("/api/async-error", async (req, res, next) => {
  try {
    // Simulate async operation that fails
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Async operation failed"))
      }, 100)
    })
  } catch (error) {
    next(error)
  }
})

// Router-level middleware example
const apiRouter = express.Router()

// Router-level middleware
apiRouter.use((req, res, next) => {
  console.log("📋 Router-level middleware")
  req.routerLevel = true
  next()
})

apiRouter.get("/info", (req, res) => {
  res.json({
    message: "Router-level middleware example",
    routerLevel: req.routerLevel,
    requestId: req.requestId,
  })
})

app.use("/api/router", apiRouter)

// Request information endpoint
app.get("/api/request-info", (req, res) => {
  res.json({
    message: "Request information",
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    params: req.params,
    headers: {
      "content-type": req.get("Content-Type"),
      "user-agent": req.get("User-Agent"),
      authorization: req.get("Authorization") ? "Present" : "Not present",
    },
    ip: req.ip,
    protocol: req.protocol,
    secure: req.secure,
    fresh: req.fresh,
    stale: req.stale,
    xhr: req.xhr,
    body: req.body,
    requestTime: req.requestTime,
    processingTime: Date.now() - req.requestTime,
  })
})

// 404 handler (should be after all routes)
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The route ${req.method} ${req.url} does not exist`,
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`\n🌐 Server running at http://localhost:${PORT}`)
  console.log(`📱 Try these routes:`)
  console.log(`   http://localhost:${PORT}/api/public`)
  console.log(`   http://localhost:${PORT}/api/protected (requires auth)`)
  console.log(`   http://localhost:${PORT}/api/multi-middleware`)
  console.log(`   http://localhost:${PORT}/api/conditional?debug=true`)
  console.log(`\n🔑 Test credentials:`)
  console.log(`   Username: admin, Password: password (admin role)`)
  console.log(`   Username: user, Password: password (user role)`)
  console.log(`\nPress Ctrl+C to stop the server`)
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...")
  process.exit(0)
})
