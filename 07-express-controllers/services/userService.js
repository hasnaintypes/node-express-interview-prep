// User Service - Business logic for user operations

const User = require("../models/User")
const { AppError } = require("../utils/errors")
const bcrypt = require("bcrypt")

class UserService {
  async getAllUsers(options = {}) {
    const { page = 1, limit = 10, search, sort } = options

    let users = await User.findAll()

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      users = users.filter(
        (user) => user.name.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower),
      )
    }

    // Apply sorting
    if (sort) {
      const sortFields = sort.split(",")
      users.sort((a, b) => {
        for (const field of sortFields) {
          const isDesc = field.startsWith("-")
          const fieldName = isDesc ? field.slice(1) : field

          let aVal = a[fieldName]
          let bVal = b[fieldName]

          // Handle date fields
          if (fieldName === "createdAt" || fieldName === "updatedAt") {
            aVal = new Date(aVal)
            bVal = new Date(bVal)
          }

          if (aVal < bVal) return isDesc ? 1 : -1
          if (aVal > bVal) return isDesc ? -1 : 1
        }
        return 0
      })
    }

    // Apply pagination
    const totalUsers = users.length
    const totalPages = Math.ceil(totalUsers / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const paginatedUsers = users.slice(startIndex, endIndex)

    return {
      users: paginatedUsers.map((user) => new User(user).toJSON()),
      currentPage: page,
      totalPages,
      totalUsers,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }

  async getUserById(id) {
    try {
      const user = await User.findById(id)

      if (!user) {
        throw new AppError("User not found", 404)
      }

      return user.toJSON()
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError("Failed to retrieve user", 500)
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await User.findByEmail(email)
      return user
    } catch (error) {
      throw new AppError("Failed to retrieve user", 500)
    }
  }

  async createUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findByEmail(userData.email)
      if (existingUser) {
        throw new AppError("User with this email already exists", 409)
      }

      // Hash password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds)

      const newUser = await User.create({
        ...userData,
        password: hashedPassword,
      })

      return newUser.toJSON()
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError("Failed to create user", 500)
    }
  }

  async updateUser(id, updateData) {
    try {
      const user = await User.findById(id)

      if (!user) {
        throw new AppError("User not found", 404)
      }

      // Check if email is being updated and already exists
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findByEmail(updateData.email)
        if (existingUser) {
          throw new AppError("Email already in use", 409)
        }
      }

      // Hash password if being updated
      if (updateData.password) {
        const saltRounds = 12
        updateData.password = await bcrypt.hash(updateData.password, saltRounds)
      }

      const updatedUser = await User.update(id, updateData)
      return updatedUser.toJSON()
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError("Failed to update user", 500)
    }
  }

  async deleteUser(id) {
    try {
      const user = await User.findById(id)

      if (!user) {
        throw new AppError("User not found", 404)
      }

      await User.delete(id)
      return true
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError("Failed to delete user", 500)
    }
  }

  async updateUserStatus(id, active) {
    try {
      const user = await User.findById(id)

      if (!user) {
        throw new AppError("User not found", 404)
      }

      const updatedUser = await User.update(id, { active })
      return updatedUser.toJSON()
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError("Failed to update user status", 500)
    }
  }

  async updateUserRole(id, role) {
    try {
      const validRoles = ["user", "admin", "moderator"]

      if (!validRoles.includes(role)) {
        throw new AppError("Invalid role", 400)
      }

      const user = await User.findById(id)

      if (!user) {
        throw new AppError("User not found", 404)
      }

      const updatedUser = await User.update(id, { role })
      return updatedUser.toJSON()
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError("Failed to update user role", 500)
    }
  }

  async getUserStats() {
    try {
      const users = await User.findAll()

      const stats = {
        total: users.length,
        active: users.filter((user) => user.active).length,
        inactive: users.filter((user) => !user.active).length,
        byRole: {
          admin: users.filter((user) => user.role === "admin").length,
          moderator: users.filter((user) => user.role === "moderator").length,
          user: users.filter((user) => user.role === "user").length,
        },
        recentRegistrations: users.filter(
          (user) => new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        ).length,
      }

      return stats
    } catch (error) {
      throw new AppError("Failed to retrieve user statistics", 500)
    }
  }

  async bulkUserAction(action, userIds) {
    try {
      const validActions = ["activate", "deactivate", "delete"]

      if (!validActions.includes(action)) {
        throw new AppError("Invalid bulk action", 400)
      }

      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new AppError("User IDs array is required", 400)
      }

      const results = {
        success: [],
        failed: [],
      }

      for (const userId of userIds) {
        try {
          switch (action) {
            case "activate":
              await this.updateUserStatus(userId, true)
              results.success.push(userId)
              break
            case "deactivate":
              await this.updateUserStatus(userId, false)
              results.success.push(userId)
              break
            case "delete":
              await this.deleteUser(userId)
              results.success.push(userId)
              break
          }
        } catch (error) {
          results.failed.push({ userId, error: error.message })
        }
      }

      return results
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError("Failed to perform bulk action", 500)
    }
  }

  async validatePassword(userId, password) {
    try {
      const user = await User.findById(userId)

      if (!user) {
        throw new AppError("User not found", 404)
      }

      const isValid = await bcrypt.compare(password, user.password)
      return isValid
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError("Failed to validate password", 500)
    }
  }
}

module.exports = new UserService()
