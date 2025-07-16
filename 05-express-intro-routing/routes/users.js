// User Routes Module

const express = require("express")
const router = express.Router()

// Mock user data
const users = [
  { id: 1, name: "John Doe", email: "john@example.com", active: true },
  { id: 2, name: "Jane Smith", email: "jane@example.com", active: true },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", active: false },
]

// GET /api/users - Get all users
router.get("/", (req, res) => {
  const { active, limit, offset } = req.query

  let filteredUsers = users

  // Filter by active status
  if (active !== undefined) {
    const isActive = active === "true"
    filteredUsers = users.filter((user) => user.active === isActive)
  }

  // Pagination
  const startIndex = Number.parseInt(offset) || 0
  const endIndex = startIndex + (Number.parseInt(limit) || 10)
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  res.json({
    message: "Users retrieved successfully",
    users: paginatedUsers,
    pagination: {
      total: filteredUsers.length,
      limit: Number.parseInt(limit) || 10,
      offset: startIndex,
      hasMore: endIndex < filteredUsers.length,
    },
  })
})

// GET /api/users/:id - Get user by ID
router.get("/:id", (req, res) => {
  const userId = Number.parseInt(req.params.id)
  const user = users.find((u) => u.id === userId)

  if (!user) {
    return res.status(404).json({
      error: "User not found",
      message: `User with ID ${userId} does not exist`,
    })
  }

  res.json({
    message: "User retrieved successfully",
    user,
  })
})

// POST /api/users - Create new user
router.post("/", (req, res) => {
  const { name, email, active = true } = req.body

  if (!name || !email) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["name", "email"],
    })
  }

  // Check if email already exists
  const existingUser = users.find((u) => u.email === email)
  if (existingUser) {
    return res.status(409).json({
      error: "Email already exists",
      message: "A user with this email already exists",
    })
  }

  const newUser = {
    id: Math.max(...users.map((u) => u.id)) + 1,
    name,
    email,
    active,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)

  res.status(201).json({
    message: "User created successfully",
    user: newUser,
  })
})

// PUT /api/users/:id - Update user
router.put("/:id", (req, res) => {
  const userId = Number.parseInt(req.params.id)
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    return res.status(404).json({
      error: "User not found",
      message: `User with ID ${userId} does not exist`,
    })
  }

  const { name, email, active } = req.body

  // Update user
  users[userIndex] = {
    ...users[userIndex],
    ...(name && { name }),
    ...(email && { email }),
    ...(active !== undefined && { active }),
    updatedAt: new Date().toISOString(),
  }

  res.json({
    message: "User updated successfully",
    user: users[userIndex],
  })
})

// DELETE /api/users/:id - Delete user
router.delete("/:id", (req, res) => {
  const userId = Number.parseInt(req.params.id)
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    return res.status(404).json({
      error: "User not found",
      message: `User with ID ${userId} does not exist`,
    })
  }

  const deletedUser = users.splice(userIndex, 1)[0]

  res.json({
    message: "User deleted successfully",
    user: deletedUser,
    deletedAt: new Date().toISOString(),
  })
})

module.exports = router
