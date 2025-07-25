const express = require("express")
const router = express.Router()
const { authenticateToken, requireRole } = require("../middleware/auth")
const { validatePagination, validateUserUpdate } = require("../middleware/validation")

// In-memory storage for demo
const users = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    active: true,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  },
  {
    id: 2,
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    active: true,
    createdAt: new Date("2023-06-01"),
    updatedAt: new Date("2023-06-01"),
  },
  {
    id: 3,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "moderator",
    active: true,
    createdAt: new Date("2023-08-15"),
    updatedAt: new Date("2023-08-15"),
  },
]

// GET /api/users - List users with pagination and filtering
router.get("/", validatePagination, (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, active, sort = "id", fields } = req.query

    let filteredUsers = [...users]

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredUsers = filteredUsers.filter(
        (user) => user.name.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower),
      )
    }

    // Apply role filter
    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role)
    }

    // Apply active filter
    if (active !== undefined) {
      const isActive = active === "true"
      filteredUsers = filteredUsers.filter((user) => user.active === isActive)
    }

    // Apply sorting
    const sortFields = sort.split(",")
    filteredUsers.sort((a, b) => {
      for (const field of sortFields) {
        const isDesc = field.startsWith("-")
        const fieldName = isDesc ? field.slice(1) : field

        let aVal = a[fieldName]
        let bVal = b[fieldName]

        if (fieldName === "createdAt" || fieldName === "updatedAt") {
          aVal = new Date(aVal)
          bVal = new Date(bVal)
        }

        if (aVal < bVal) return isDesc ? 1 : -1
        if (aVal > bVal) return isDesc ? -1 : 1
      }
      return 0
    })

    // Apply pagination
    const totalUsers = filteredUsers.length
    const totalPages = Math.ceil(totalUsers / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    // Apply field selection
    let responseUsers = paginatedUsers
    if (fields) {
      const selectedFields = fields.split(",")
      responseUsers = paginatedUsers.map((user) => {
        const filteredUser = {}
        selectedFields.forEach((field) => {
          if (user.hasOwnProperty(field)) {
            filteredUser[field] = user[field]
          }
        })
        return filteredUser
      })
    }

    res.json({
      success: true,
      data: responseUsers,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalItems: totalUsers,
        itemsPerPage: Number.parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      meta: {
        filters: { search, role, active },
        sort,
        fields: fields || "all",
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve users",
      },
    })
  }
})

// GET /api/users/:id - Get user by ID
router.get("/:id", (req, res) => {
  try {
    const userId = Number.parseInt(req.params.id)
    const user = users.find((u) => u.id === userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      })
    }

    res.json({
      success: true,
      data: user,
      message: "User retrieved successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve user",
      },
    })
  }
})

// POST /api/users - Create new user (admin only)
router.post("/", authenticateToken, requireRole("admin"), (req, res) => {
  try {
    const { name, email, role = "user", active = true } = req.body

    // Check if email already exists
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

    const newUser = {
      id: Math.max(...users.map((u) => u.id), 0) + 1,
      name,
      email,
      role,
      active,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    users.push(newUser)

    res.status(201).json({
      success: true,
      data: newUser,
      message: "User created successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create user",
      },
    })
  }
})

// PUT /api/users/:id - Update user (full replacement)
router.put("/:id", authenticateToken, requireRole("admin"), validateUserUpdate, (req, res) => {
  try {
    const userId = Number.parseInt(req.params.id)
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      })
    }

    const { name, email, role, active } = req.body

    // Check if email is taken by another user
    const existingUser = users.find((u) => u.email === email && u.id !== userId)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message: "Email is already in use by another user",
        },
      })
    }

    users[userIndex] = {
      ...users[userIndex],
      name,
      email,
      role,
      active,
      updatedAt: new Date(),
    }

    res.json({
      success: true,
      data: users[userIndex],
      message: "User updated successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update user",
      },
    })
  }
})

// PATCH /api/users/:id - Update user (partial)
router.patch("/:id", authenticateToken, requireRole("admin"), (req, res) => {
  try {
    const userId = Number.parseInt(req.params.id)
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      })
    }

    const updates = req.body

    // Check if email is being updated and is taken by another user
    if (updates.email) {
      const existingUser = users.find((u) => u.email === updates.email && u.id !== userId)
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "Email is already in use by another user",
          },
        })
      }
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date(),
    }

    res.json({
      success: true,
      data: users[userIndex],
      message: "User updated successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update user",
      },
    })
  }
})

// DELETE /api/users/:id - Delete user
router.delete("/:id", authenticateToken, requireRole("admin"), (req, res) => {
  try {
    const userId = Number.parseInt(req.params.id)
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      })
    }

    users.splice(userIndex, 1)

    res.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete user",
      },
    })
  }
})

module.exports = router
