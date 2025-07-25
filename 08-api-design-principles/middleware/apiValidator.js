const apiValidator = (req, res, next) => {
  // Content-Type validation for POST/PUT/PATCH requests
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const contentType = req.headers["content-type"]

    if (!contentType || !contentType.includes("application/json")) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_CONTENT_TYPE",
          message: "Content-Type must be application/json",
        },
      })
    }
  }

  // Accept header validation
  const acceptHeader = req.headers.accept
  if (acceptHeader && !acceptHeader.includes("application/json") && !acceptHeader.includes("*/*")) {
    return res.status(406).json({
      success: false,
      error: {
        code: "NOT_ACCEPTABLE",
        message: "API only supports application/json responses",
      },
    })
  }

  // API version validation (if versioned)
  const apiVersion = req.headers["api-version"]
  if (apiVersion && !["1.0", "1"].includes(apiVersion)) {
    return res.status(400).json({
      success: false,
      error: {
        code: "UNSUPPORTED_API_VERSION",
        message: "Unsupported API version",
      },
    })
  }

  next()
}

const validatePagination = (req, res, next) => {
  const { page, limit } = req.query

  if (page && (isNaN(page) || Number.parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PAGE_PARAMETER",
        message: "Page must be a positive integer",
      },
    })
  }

  if (limit && (isNaN(limit) || Number.parseInt(limit) < 1 || Number.parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_LIMIT_PARAMETER",
        message: "Limit must be between 1 and 100",
      },
    })
  }

  next()
}

const validateProduct = (req, res, next) => {
  const { name, description, price, category, stock } = req.body
  const errors = []

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push({
      field: "name",
      message: "Name must be at least 2 characters long",
    })
  }

  if (!description || typeof description !== "string" || description.trim().length < 10) {
    errors.push({
      field: "description",
      message: "Description must be at least 10 characters long",
    })
  }

  if (!price || isNaN(price) || Number.parseFloat(price) <= 0) {
    errors.push({
      field: "price",
      message: "Price must be a positive number",
    })
  }

  if (!category || typeof category !== "string" || category.trim().length < 2) {
    errors.push({
      field: "category",
      message: "Category must be at least 2 characters long",
    })
  }

  if (stock === undefined || isNaN(stock) || Number.parseInt(stock) < 0) {
    errors.push({
      field: "stock",
      message: "Stock must be a non-negative integer",
    })
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: errors,
      },
    })
  }

  next()
}

const validateUserUpdate = (req, res, next) => {
  const { name, email, role } = req.body
  const errors = []

  if (name && (typeof name !== "string" || name.trim().length < 2)) {
    errors.push({
      field: "name",
      message: "Name must be at least 2 characters long",
    })
  }

  if (email && (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    errors.push({
      field: "email",
      message: "Valid email address is required",
    })
  }

  if (role && !["user", "admin", "moderator"].includes(role)) {
    errors.push({
      field: "role",
      message: "Role must be one of: user, admin, moderator",
    })
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: errors,
      },
    })
  }

  next()
}

module.exports = {
  apiValidator,
  validatePagination,
  validateProduct,
  validateUserUpdate,
}
