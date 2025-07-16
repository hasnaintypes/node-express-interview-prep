// Validation Middleware

const validator = require("validator")

// Email validation
const isValidEmail = (email) => {
  return validator.isEmail(email)
}

// Password validation
const isValidPassword = (password) => {
  return validator.isLength(password, { min: 8 }) && validator.matches(password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
}

// Phone number validation
const isValidPhone = (phone) => {
  return validator.isMobilePhone(phone, "any")
}

// Generic validation helper
const validate = (data, rules) => {
  const errors = []

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]

    if (rule.required && (!value || value.toString().trim() === "")) {
      errors.push({ field, message: `${field} is required` })
      continue
    }

    if (!rule.required && !value) continue

    if (rule.type && typeof value !== rule.type) {
      errors.push({ field, message: `${field} must be of type ${rule.type}` })
      continue
    }

    if (rule.minLength && value.length < rule.minLength) {
      errors.push({ field, message: `${field} must be at least ${rule.minLength} characters` })
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push({ field, message: `${field} must be at most ${rule.maxLength} characters` })
    }

    if (rule.min && Number.parseFloat(value) < rule.min) {
      errors.push({ field, message: `${field} must be at least ${rule.min}` })
    }

    if (rule.max && Number.parseFloat(value) > rule.max) {
      errors.push({ field, message: `${field} must be at most ${rule.max}` })
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push({ field, message: `${field} format is invalid` })
    }

    if (rule.custom && !rule.custom(value)) {
      errors.push({ field, message: rule.message || `${field} validation failed` })
    }
  }

  return errors
}

// User validation middleware
const userValidation = (req, res, next) => {
  const { name, email, age, phone } = req.body

  const rules = {
    name: {
      required: true,
      type: "string",
      minLength: 2,
      maxLength: 50,
    },
    email: {
      required: true,
      type: "string",
      custom: isValidEmail,
      message: "Invalid email format",
    },
    age: {
      required: true,
      type: "number",
      min: 0,
      max: 120,
    },
    phone: {
      required: false,
      type: "string",
      custom: isValidPhone,
      message: "Invalid phone number format",
    },
  }

  const errors = validate(req.body, rules)

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    })
  }

  next()
}

// Login validation middleware
const loginValidation = (req, res, next) => {
  const { username, password } = req.body

  const rules = {
    username: {
      required: true,
      type: "string",
      minLength: 3,
      maxLength: 20,
    },
    password: {
      required: true,
      type: "string",
      minLength: 8,
    },
  }

  const errors = validate(req.body, rules)

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    })
  }

  next()
}

// Product validation middleware
const productValidation = (req, res, next) => {
  const { name, price, category, description } = req.body

  const rules = {
    name: {
      required: true,
      type: "string",
      minLength: 2,
      maxLength: 100,
    },
    price: {
      required: true,
      type: "number",
      min: 0,
    },
    category: {
      required: true,
      type: "string",
      minLength: 2,
      maxLength: 50,
    },
    description: {
      required: false,
      type: "string",
      maxLength: 500,
    },
  }

  const errors = validate(req.body, rules)

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    })
  }

  next()
}

// Registration validation middleware
const registrationValidation = (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body

  const rules = {
    username: {
      required: true,
      type: "string",
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      required: true,
      type: "string",
      custom: isValidEmail,
      message: "Invalid email format",
    },
    password: {
      required: true,
      type: "string",
      custom: isValidPassword,
      message: "Password must be at least 8 characters with uppercase, lowercase, and number",
    },
  }

  const errors = validate(req.body, rules)

  // Check password confirmation
  if (password !== confirmPassword) {
    errors.push({ field: "confirmPassword", message: "Passwords do not match" })
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    })
  }

  next()
}

// Comment validation middleware
const commentValidation = (req, res, next) => {
  const { content, authorName, authorEmail } = req.body

  const rules = {
    content: {
      required: true,
      type: "string",
      minLength: 5,
      maxLength: 1000,
    },
    authorName: {
      required: true,
      type: "string",
      minLength: 2,
      maxLength: 50,
    },
    authorEmail: {
      required: true,
      type: "string",
      custom: isValidEmail,
      message: "Invalid email format",
    },
  }

  const errors = validate(req.body, rules)

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    })
  }

  next()
}

// Query parameter validation
const queryValidation = (rules) => {
  return (req, res, next) => {
    const errors = validate(req.query, rules)

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Query validation failed",
        details: errors,
      })
    }

    next()
  }
}

// URL parameter validation
const paramValidation = (rules) => {
  return (req, res, next) => {
    const errors = validate(req.params, rules)

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Parameter validation failed",
        details: errors,
      })
    }

    next()
  }
}

// File upload validation
const fileValidation = (options = {}) => {
  return (req, res, next) => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ["image/jpeg", "image/png", "image/gif"],
      required = false,
    } = options

    if (!req.file && required) {
      return res.status(400).json({
        error: "File required",
        message: "Please upload a file",
      })
    }

    if (!req.file && !required) {
      return next()
    }

    if (req.file.size > maxSize) {
      return res.status(400).json({
        error: "File too large",
        message: `File size must be less than ${maxSize / 1024 / 1024}MB`,
      })
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: "Invalid file type",
        message: `Allowed types: ${allowedTypes.join(", ")}`,
      })
    }

    next()
  }
}

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = validator.escape(obj[key].trim())
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitizeObject(obj[key])
      }
    }
  }

  if (req.body) sanitizeObject(req.body)
  if (req.query) sanitizeObject(req.query)
  if (req.params) sanitizeObject(req.params)

  next()
}

module.exports = {
  validate,
  userValidation,
  loginValidation,
  productValidation,
  registrationValidation,
  commentValidation,
  queryValidation,
  paramValidation,
  fileValidation,
  sanitizeInput,
}
