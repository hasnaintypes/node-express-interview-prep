const User = require("../models/User")

// Validate user registration
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body
  const errors = []

  // Name validation
  if (!name || name.trim().length < 2) {
    errors.push({
      field: "name",
      message: "Name must be at least 2 characters long",
    })
  }

  // Email validation
  if (!email || !User.validateEmail(email)) {
    errors.push({
      field: "email",
      message: "Valid email address is required",
    })
  }

  // Password validation
  if (!password || !User.validatePassword(password)) {
    errors.push({
      field: "password",
      message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
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

// Validate user login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body
  const errors = []

  if (!email) {
    errors.push({
      field: "email",
      message: "Email is required",
    })
  }

  if (!password) {
    errors.push({
      field: "password",
      message: "Password is required",
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

// Validate user update
const validateUserUpdate = (req, res, next) => {
  const { name, email, role } = req.body
  const errors = []

  if (name && name.trim().length < 2) {
    errors.push({
      field: "name",
      message: "Name must be at least 2 characters long",
    })
  }

  if (email && !User.validateEmail(email)) {
    errors.push({
      field: "email",
      message: "Valid email address is required",
    })
  }

  if (role && !User.validateRole(role)) {
    errors.push({
      field: "role",
      message: "Invalid role specified",
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

// Validate product
const validateProduct = (req, res, next) => {
  const { name, description, price, category, stock } = req.body
  const errors = []

  if (!name || name.trim().length < 2) {
    errors.push({
      field: "name",
      message: "Product name must be at least 2 characters long",
    })
  }

  if (!description || description.trim().length < 10) {
    errors.push({
      field: "description",
      message: "Product description must be at least 10 characters long",
    })
  }

  if (!price || price <= 0) {
    errors.push({
      field: "price",
      message: "Price must be greater than 0",
    })
  }

  if (!category || category.trim().length < 2) {
    errors.push({
      field: "category",
      message: "Category is required",
    })
  }

  if (stock === undefined || stock < 0) {
    errors.push({
      field: "stock",
      message: "Stock must be 0 or greater",
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

// Validate product update
const validateProductUpdate = (req, res, next) => {
  const { name, description, price, category, stock } = req.body
  const errors = []

  if (name && name.trim().length < 2) {
    errors.push({
      field: "name",
      message: "Product name must be at least 2 characters long",
    })
  }

  if (description && description.trim().length < 10) {
    errors.push({
      field: "description",
      message: "Product description must be at least 10 characters long",
    })
  }

  if (price !== undefined && price <= 0) {
    errors.push({
      field: "price",
      message: "Price must be greater than 0",
    })
  }

  if (category && category.trim().length < 2) {
    errors.push({
      field: "category",
      message: "Category is required",
    })
  }

  if (stock !== undefined && stock < 0) {
    errors.push({
      field: "stock",
      message: "Stock must be 0 or greater",
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

// Validate order
const validateOrder = (req, res, next) => {
  const { items, shippingAddress, paymentMethod } = req.body
  const errors = []

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push({
      field: "items",
      message: "Order must contain at least one item",
    })
  } else {
    items.forEach((item, index) => {
      if (!item.productId) {
        errors.push({
          field: `items[${index}].productId`,
          message: "Product ID is required",
        })
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push({
          field: `items[${index}].quantity`,
          message: "Quantity must be greater than 0",
        })
      }
    })
  }

  if (!shippingAddress) {
    errors.push({
      field: "shippingAddress",
      message: "Shipping address is required",
    })
  } else {
    const requiredFields = ["street", "city", "state", "zipCode", "country"]
    requiredFields.forEach((field) => {
      if (!shippingAddress[field]) {
        errors.push({
          field: `shippingAddress.${field}`,
          message: `${field} is required`,
        })
      }
    })
  }

  if (!paymentMethod) {
    errors.push({
      field: "paymentMethod",
      message: "Payment method is required",
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
  validateRegister,
  validateLogin,
  validateUser: validateRegister,
  validateUserUpdate,
  validateProduct,
  validateProductUpdate,
  validateOrder,
}
