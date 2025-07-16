// Authentication Middleware

const jwt = require("jsonwebtoken")

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
    issuer: "express-middleware-demo",
    audience: "express-app-users",
  })
}

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: "Access token required",
      message: "Please provide a valid access token in the Authorization header",
    })
  }

  const decoded = verifyToken(token)

  if (!decoded) {
    return res.status(403).json({
      error: "Invalid token",
      message: "The provided token is invalid or expired",
    })
  }

  req.user = decoded
  next()
}

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      req.user = decoded
    }
  }

  next()
}

// Role-based authorization middleware
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Please authenticate to access this resource",
      })
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        error: "Insufficient permissions",
        message: `This resource requires ${role} role`,
      })
    }

    next()
  }
}

// Multiple roles authorization
const requireAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Please authenticate to access this resource",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        message: `This resource requires one of these roles: ${roles.join(", ")}`,
      })
    }

    next()
  }
}

// Permission-based authorization
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Please authenticate to access this resource",
      })
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        message: `This resource requires '${permission}' permission`,
      })
    }

    next()
  }
}

// API key authentication middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"]

  if (!apiKey) {
    return res.status(401).json({
      error: "API key required",
      message: "Please provide a valid API key in the X-API-Key header",
    })
  }

  // Mock API key validation (in production, check against database)
  const validApiKeys = ["demo-api-key-123", "test-api-key-456"]

  if (!validApiKeys.includes(apiKey)) {
    return res.status(403).json({
      error: "Invalid API key",
      message: "The provided API key is invalid",
    })
  }

  req.apiKey = apiKey
  next()
}

// Session-based authentication middleware
const authenticateSession = (req, res, next) => {
  const sessionId = req.headers["x-session-id"] || req.cookies?.sessionId

  if (!sessionId) {
    return res.status(401).json({
      error: "Session required",
      message: "Please provide a valid session ID",
    })
  }

  // Mock session validation (in production, check against session store)
  const validSessions = new Map([
    ["session-123", { userId: 1, username: "admin", role: "admin" }],
    ["session-456", { userId: 2, username: "user", role: "user" }],
  ])

  const session = validSessions.get(sessionId)

  if (!session) {
    return res.status(403).json({
      error: "Invalid session",
      message: "The provided session ID is invalid or expired",
    })
  }

  req.user = session
  next()
}

// Token refresh middleware
const refreshToken = (req, res, next) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken

  if (!refreshToken) {
    return res.status(401).json({
      error: "Refresh token required",
      message: "Please provide a valid refresh token",
    })
  }

  const decoded = verifyToken(refreshToken)

  if (!decoded) {
    return res.status(403).json({
      error: "Invalid refresh token",
      message: "The provided refresh token is invalid or expired",
    })
  }

  // Generate new access token
  const newAccessToken = generateToken({
    id: decoded.id,
    username: decoded.username,
    role: decoded.role,
  })

  res.json({
    message: "Token refreshed successfully",
    accessToken: newAccessToken,
    expiresIn: "24h",
  })
}

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  optionalAuth,
  requireRole,
  requireAnyRole,
  requirePermission,
  authenticateApiKey,
  authenticateSession,
  refreshToken,
}
