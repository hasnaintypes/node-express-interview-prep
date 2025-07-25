const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// Mock user storage
const users = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO", // secret123
    role: "admin",
    active: true,
  },
  {
    id: 2,
    name: "John Doe",
    email: "john@example.com",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO", // secret123
    role: "user",
    active: true,
  },
]

// POST /api/auth/login - User authentication
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_CREDENTIALS",
          message: "Email and password are required",
        },
      })
    }

    const user = users.find((u) => u.email === email)
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      })
    }

    if (!user.active) {
      return res.status(401).json({
        success: false,
        error: {
          code: "ACCOUNT_DISABLED",
          message: "Account has been disabled",
        },
      })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "1h" },
    )

    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
      message: "Login successful",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Login failed",
      },
    })
  }
})

// POST /api/auth/register - User registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Name, email, and password are required",
        },
      })
    }

    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message: "User with this email already exists",
        },
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const newUser = {
      id: Math.max(...users.map((u) => u.id), 0) + 1,
      name,
      email,
      password: hashedPassword,
      role: "user",
      active: true,
    }

    users.push(newUser)

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "1h" },
    )

    const { password: _, ...userWithoutPassword } = newUser

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
      message: "Registration successful",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Registration failed",
      },
    })
  }
})

module.exports = router
