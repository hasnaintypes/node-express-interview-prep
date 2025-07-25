const jwt = require("jsonwebtoken")

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: "ACCESS_TOKEN_REQUIRED",
        message: "Access token is required",
      },
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or expired token",
      },
    })
  }
}

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

    if (role === "admin" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: {
          code: "ADMIN_ACCESS_REQUIRED",
          message: "Admin access required",
        },
      })
    }

    if (role === "moderator" && !["admin", "moderator"].includes(req.user.role)) {
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
