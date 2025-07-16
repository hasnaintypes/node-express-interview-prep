// Express.js Introduction & Routing Examples

const express = require("express")
const path = require("path")

const app = express()
const PORT = 3000

console.log("🚀 Express.js Introduction & Routing Demo")
console.log("=".repeat(50))

// Middleware for parsing JSON and URL-encoded data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files middleware
app.use(express.static(path.join(__dirname, "public")))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

// 1. Basic Routes
console.log("\n🛤️ Setting up basic routes...")

app.get("/", (req, res) => {
  res.send(`
    <h1>🚀 Express.js Routing Demo</h1>
    <p>Welcome to the Express.js routing examples!</p>
    <ul>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
      <li><a href="/users">Users</a></li>
      <li><a href="/products">Products</a></li>
      <li><a href="/api/info">API Info</a></li>
    </ul>
  `)
})

app.get("/about", (req, res) => {
  res.json({
    message: "About page",
    description: "This is the about page demonstrating basic routing",
    timestamp: new Date().toISOString(),
  })
})

app.get("/contact", (req, res) => {
  res.json({
    message: "Contact page",
    email: "contact@example.com",
    phone: "+1-555-0123",
  })
})

// 2. Route Parameters
console.log("🎯 Setting up route parameters...")

app.get("/users/:id", (req, res) => {
  const userId = req.params.id

  // Basic validation
  if (!userId || isNaN(userId)) {
    return res.status(400).json({
      error: "Invalid user ID",
      message: "User ID must be a number",
    })
  }

  res.json({
    message: `User details for ID: ${userId}`,
    user: {
      id: Number.parseInt(userId),
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      active: true,
    },
  })
})

// Multiple parameters
app.get("/users/:id/posts/:postId", (req, res) => {
  const { id, postId } = req.params

  res.json({
    message: "User post details",
    user: {
      id: Number.parseInt(id),
      name: `User ${id}`,
    },
    post: {
      id: Number.parseInt(postId),
      title: `Post ${postId} by User ${id}`,
      content: "This is the post content...",
    },
  })
})

// Optional parameters
app.get("/posts/:year/:month?", (req, res) => {
  const { year, month } = req.params

  res.json({
    message: "Posts by date",
    filters: {
      year: Number.parseInt(year),
      month: month ? Number.parseInt(month) : "all months",
    },
    posts: [
      { id: 1, title: "Sample Post 1" },
      { id: 2, title: "Sample Post 2" },
    ],
  })
})

// 3. Query Parameters
console.log("🔍 Setting up query parameters...")

app.get("/search", (req, res) => {
  const { q, limit, offset, sort } = req.query

  // Default values
  const searchLimit = Number.parseInt(limit) || 10
  const searchOffset = Number.parseInt(offset) || 0
  const sortBy = sort || "relevance"

  res.json({
    message: "Search results",
    query: q || "",
    pagination: {
      limit: searchLimit,
      offset: searchOffset,
      total: 100, // Mock total
    },
    sort: sortBy,
    results: [
      { id: 1, title: "Result 1", relevance: 0.9 },
      { id: 2, title: "Result 2", relevance: 0.8 },
    ],
  })
})

// 4. HTTP Methods
console.log("🔧 Setting up different HTTP methods...")

app.get("/products", (req, res) => {
  res.json({
    message: "Get all products",
    products: [
      { id: 1, name: "Laptop", price: 999 },
      { id: 2, name: "Phone", price: 699 },
    ],
  })
})

app.post("/products", (req, res) => {
  const { name, price } = req.body

  if (!name || !price) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["name", "price"],
    })
  }

  const newProduct = {
    id: Date.now(),
    name,
    price: Number.parseFloat(price),
    createdAt: new Date().toISOString(),
  }

  res.status(201).json({
    message: "Product created successfully",
    product: newProduct,
  })
})

app.put("/products/:id", (req, res) => {
  const { id } = req.params
  const { name, price } = req.body

  res.json({
    message: `Product ${id} updated`,
    product: {
      id: Number.parseInt(id),
      name,
      price: Number.parseFloat(price),
      updatedAt: new Date().toISOString(),
    },
  })
})

app.delete("/products/:id", (req, res) => {
  const { id } = req.params

  res.json({
    message: `Product ${id} deleted successfully`,
    deletedAt: new Date().toISOString(),
  })
})

// 5. Multiple Route Handlers
console.log("🔄 Setting up multiple route handlers...")

const validateUser = (req, res, next) => {
  const { id } = req.params

  if (!id || isNaN(id)) {
    return res.status(400).json({
      error: "Invalid user ID",
    })
  }

  // Add validated data to request
  req.validatedUser = {
    id: Number.parseInt(id),
    name: `User ${id}`,
  }

  next()
}

const logAccess = (req, res, next) => {
  console.log(`👤 User access: ${req.validatedUser?.name || "Unknown"}`)
  next()
}

app.get("/users/:id/profile", validateUser, logAccess, (req, res) => {
  res.json({
    message: "User profile",
    user: req.validatedUser,
    profile: {
      bio: "This is the user biography",
      location: "New York, NY",
      website: "https://example.com",
    },
  })
})

// 6. Route Patterns
console.log("🎨 Setting up route patterns...")

// Wildcard routes
app.get("/files/*", (req, res) => {
  const filePath = req.params[0]
  res.json({
    message: "File access",
    path: filePath,
    type: path.extname(filePath) || "unknown",
  })
})

// Regular expression routes
app.get(/.*fly$/, (req, res) => {
  res.json({
    message: "Caught a fly!",
    path: req.path,
    pattern: 'Routes ending with "fly"',
  })
})

// 7. Request Information
app.get("/api/info", (req, res) => {
  res.json({
    message: "Request information",
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    params: req.params,
    headers: {
      "user-agent": req.get("User-Agent"),
      accept: req.get("Accept"),
      host: req.get("Host"),
    },
    ip: req.ip,
    protocol: req.protocol,
    secure: req.secure,
    timestamp: new Date().toISOString(),
  })
})

// 8. Error Handling
app.get("/error", (req, res, next) => {
  const error = new Error("This is a test error")
  error.status = 500
  next(error)
})

// 9. Router Module Example
const userRoutes = require("./routes/users")
const apiRoutes = require("./routes/api")

app.use("/api/users", userRoutes)
app.use("/api/v1", apiRoutes)

// 10. 404 Handler (should be last)
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The route ${req.method} ${req.url} does not exist`,
    availableRoutes: [
      "GET /",
      "GET /about",
      "GET /contact",
      "GET /users/:id",
      "GET /search",
      "GET /products",
      "POST /products",
    ],
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message)

  res.status(err.status || 500).json({
    error: err.message,
    timestamp: new Date().toISOString(),
    path: req.path,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`\n🌐 Server running at http://localhost:${PORT}`)
  console.log(`📱 Try these routes:`)
  console.log(`   http://localhost:${PORT}/`)
  console.log(`   http://localhost:${PORT}/users/123`)
  console.log(`   http://localhost:${PORT}/search?q=nodejs&limit=5`)
  console.log(`   http://localhost:${PORT}/api/info`)
  console.log(`\nPress Ctrl+C to stop the server`)
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...")
  process.exit(0)
})
