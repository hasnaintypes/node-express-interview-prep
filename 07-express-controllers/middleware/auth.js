const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: "ACCESS_TOKEN_REQUIRED",
          message: "Access token is required",
        },
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user || !user.isActive()) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid or expired token",
        },
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid token",
        },
      })
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: {
          code: "TOKEN_EXPIRED",
          message: "Token has expired",
        },
      })
    }

    next(error)
  }
}

// Require specific role
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTHENTICATION_REQUIRED",
          message: "Authentication required",
        },
      })
    }

    if (role === "admin" && !req.user.isAdmin()) {
      return res.status(403).json({
        success: false,
        error: {
          code: "ADMIN_ACCESS_REQUIRED",
          message: "Admin access required",
        },
      })
    }

    if (role === "moderator" && !req.user.isModerator()) {
      return res.status(403).json({
        success: false,
        error: {
          code: "MODERATOR_ACCESS_REQUIRED",
          message: "Moderator access required",
        },
      })
    }

    next()
  }
}

module.exports = {
  authenticateToken,
  requireRole,
}
