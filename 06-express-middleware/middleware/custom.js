// Custom Middleware Functions

const crypto = require("crypto")

// Request logging middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const url = req.url
  const ip = req.ip || req.connection.remoteAddress

  console.log(`[${timestamp}] ${method} ${url} - ${ip}`)
  next()
}

// Request timing middleware
const requestTimer = (req, res, next) => {
  req.requestTime = Date.now()

  // Add response time to headers
  res.on("finish", () => {
    const responseTime = Date.now() - req.requestTime
    console.log(`⏱️  Response time: ${responseTime}ms for ${req.method} ${req.url}`)
  })

  next()
}

// Request ID middleware
const requestId = (req, res, next) => {
  req.requestId = crypto.randomBytes(16).toString("hex")
  res.set("X-Request-ID", req.requestId)
  next()
}

// CORS middleware
const cors = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")

  if (req.method === "OPTIONS") {
    res.sendStatus(200)
  } else {
    next()
  }
}

// Security headers middleware
const securityHeaders = (req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Referrer-Policy": "strict-origin	'max-age=31536000; includeSubDomains",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  })
  next()
}

// Rate limiting middleware
const rateLimit = (() => {
  const requests = new Map()
  const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
  const MAX_REQUESTS = 100

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress
    const now = Date.now()

    if (!requests.has(ip)) {
      requests.set(ip, { count: 1, resetTime: now + WINDOW_MS })
      return next()
    }

    const requestData = requests.get(ip)

    if (now > requestData.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + WINDOW_MS })
      return next()
    }

    if (requestData.count >= MAX_REQUESTS) {
      return res.status(429).json({
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        resetTime: new Date(requestData.resetTime).toISOString(),
      })
    }

    requestData.count++
    next()
  }
})()

// Request body size limiter
const bodyLimiter = (maxSize = "1mb") => {
  return (req, res, next) => {
    const contentLength = req.get("content-length")

    if (contentLength && Number.parseInt(contentLength) > parseSize(maxSize)) {
      return res.status(413).json({
        error: "Payload too large",
        message: `Request body size exceeds ${maxSize} limit`,
      })
    }

    next()
  }
}

// Helper function to parse size strings
const parseSize = (size) => {
  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 }
  const match = size
    .toString()
    .toLowerCase()
    .match(/^(\d+(?:\.\d+)?)\s*([kmg]?b)$/)

  if (!match) return 0

  const [, value, unit] = match
  return Math.floor(Number.parseFloat(value) * units[unit])
}

// Content type validator
const contentTypeValidator = (allowedTypes) => {
  return (req, res, next) => {
    const contentType = req.get("content-type")

    if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
      if (!contentType || !allowedTypes.some((type) => contentType.includes(type))) {
        return res.status(415).json({
          error: "Unsupported media type",
          message: `Content-Type must be one of: ${allowedTypes.join(", ")}`,
        })
      }
    }

    next()
  }
}

// Cache control middleware
const cacheControl = (maxAge = 3600) => {
  return (req, res, next) => {
    if (req.method === "GET") {
      res.set("Cache-Control", `public, max-age=${maxAge}`)
    } else {
      res.set("Cache-Control", "no-cache, no-store, must-revalidate")
    }
    next()
  }
}

module.exports = {
  requestLogger,
  requestTimer,
  requestId,
  cors,
  securityHeaders,
  rateLimit,
  bodyLimiter,
  contentTypeValidator,
  cacheControl,
}
