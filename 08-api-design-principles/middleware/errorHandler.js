const errorHandler = (err, req, res, next) => {
  console.error("Error:", err)

  let error = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong on our end",
    },
  }

  // Validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }))

    error = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: errors,
      },
    }
    return res.status(400).json(error)
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = {
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid token",
      },
    }
    return res.status(401).json(error)
  }

  if (err.name === "TokenExpiredError") {
    error = {
      success: false,
      error: {
        code: "TOKEN_EXPIRED",
        message: "Token has expired",
      },
    }
    return res.status(401).json(error)
  }

  // Custom application errors
  if (err.statusCode) {
    error = {
      success: false,
      error: {
        code: err.code || "APPLICATION_ERROR",
        message: err.message,
      },
    }
    return res.status(err.statusCode).json(error)
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    error.error.stack = err.stack
  }

  // Add request context
  error.meta = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    userAgent: req.headers["user-agent"],
  }

  res.status(500).json(error)
}

module.exports = errorHandler
