// Error Handling Middleware

const fs = require("fs")
const path = require("path")

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400)
    this.details = details
  }
}

class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401)
  }
}

class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403)
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404)
  }
}

// Error logger
const logError = (error, req) => {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    error: {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    },
  }

  // Log to console
  console.error("🚨 Error occurred:", JSON.stringify(logEntry, null, 2))

  // Log to file (in production, use proper logging service)
  const logFile = path.join(__dirname, "../logs/error.log")
  const logDir = path.dirname(logFile)

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  fs.appendFile(logFile, JSON.stringify(logEntry) + "\n", (err) => {
    if (err) console.error("Failed to write to log file:", err)
  })
}

// Development error handler
const handleDevelopmentError = (error, req, res) => {
  logError(error, req)

  res.status(error.statusCode || 500).json({
    error: {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      status: error.status,
    },
    request: {
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    },
  })
}

// Production error handler
const handleProductionError = (error, req, res) => {
  // Log all errors
  logError(error, req)

  // Only send operational errors to client
  if (error.isOperational) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        statusCode: error.statusCode,
        status: error.status,
      },
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    })
  } else {
    // Don't leak error details in production
    res.status(500).json({
      error: {
        message: "Internal server error",
        statusCode: 500,
        status: "error",
      },
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    })
  }
}

// Handle specific error types
const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsError = (error) => {
  const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Duplicate field value: ${value}. Please use another value!`
  return new AppError(message, 400)
}

const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map((err) => err.message)
  const message = `Invalid input data. ${errors.join(". ")}`
  return new ValidationError(message, errors)
}

const handleJWTError = () => {
  return new AuthenticationError("Invalid token. Please log in again!")
}

const handleJWTExpiredError = () => {
  return new AuthenticationError("Your token has expired! Please log in again.")
}

// Main error handling middleware
const errorHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500
  error.status = error.status || "error"

  if (process.env.NODE_ENV === "development") {
    handleDevelopmentError(error, req, res)
  } else {
    let err = { ...error }
    err.message = error.message

    // Handle specific error types
    if (error.name === "CastError") err = handleCastError(err)
    if (error.code === 11000) err = handleDuplicateFieldsError(err)
    if (error.name === "ValidationError") err = handleValidationError(err)
    if (error.name === "JsonWebTokenError") err = handleJWTError()
    if (error.name === "TokenExpiredError") err = handleJWTExpiredError()

    handleProductionError(err, req, res)
  }
}

// Async error handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// 404 handler
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Can't find ${req.originalUrl} on this server!`)
  next(error)
}

// Unhandled promise rejection handler
const handleUnhandledRejection = () => {
  process.on("unhandledRejection", (err, promise) => {
    console.error("🚨 Unhandled Promise Rejection:", err.message)
    console.error("Promise:", promise)

    // Close server gracefully
    process.exit(1)
  })
}

// Uncaught exception handler
const handleUncaughtException = () => {
  process.on("uncaughtException", (err) => {
    console.error("🚨 Uncaught Exception:", err.message)
    console.error("Stack:", err.stack)

    // Close server gracefully
    process.exit(1)
  })
}

// Initialize global error handlers
const initGlobalErrorHandlers = () => {
  handleUnhandledRejection()
  handleUncaughtException()
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  initGlobalErrorHandlers,
}
