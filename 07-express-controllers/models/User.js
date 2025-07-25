// User Model - Data structure and database operations

class User {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.email = data.email
    this.password = data.password
    this.role = data.role || "user"
    this.active = data.active !== false
    this.emailVerified = data.emailVerified || false
    this.phone = data.phone || null
    this.address = data.address || null
    this.avatar = data.avatar || null
    this.lastLogin = data.lastLogin || null
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  // Instance methods
  toJSON() {
    const { password, ...userWithoutPassword } = this
    return userWithoutPassword
  }

  isAdmin() {
    return this.role === "admin"
  }

  isModerator() {
    return this.role === "moderator" || this.role === "admin"
  }

  isActive() {
    return this.active
  }

  // Static methods for database operations
  static async findAll() {
    // In a real application, this would query the database
    // For demo purposes, we'll use in-memory storage
    return User.getAllFromStorage()
  }

  static async findById(id) {
    const users = await User.getAllFromStorage()
    const user = users.find((u) => u.id === Number.parseInt(id))
    return user ? new User(user) : null
  }

  static async findByEmail(email) {
    const users = await User.getAllFromStorage()
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    return user ? new User(user) : null
  }

  static async create(userData) {
    const users = await User.getAllFromStorage()
    const newUser = new User({
      ...userData,
      id: Math.max(...users.map((u) => u.id), 0) + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    users.push(newUser)
    await User.saveToStorage(users)
    return newUser
  }

  static async update(id, updateData) {
    const users = await User.getAllFromStorage()
    const userIndex = users.findIndex((u) => u.id === Number.parseInt(id))

    if (userIndex === -1) {
      return null
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date(),
    }

    await User.saveToStorage(users)
    return new User(users[userIndex])
  }

  static async delete(id) {
    const users = await User.getAllFromStorage()
    const userIndex = users.findIndex((u) => u.id === Number.parseInt(id))

    if (userIndex === -1) {
      return false
    }

    users.splice(userIndex, 1)
    await User.saveToStorage(users)
    return true
  }

  // Storage methods (in real app, these would be database operations)
  static async getAllFromStorage() {
    // In-memory storage for demo
    if (!User._storage) {
      User._storage = [
        {
          id: 1,
          name: "Admin User",
          email: "admin@example.com",
          password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO", // secret123
          role: "admin",
          active: true,
          emailVerified: true,
          createdAt: new Date("2023-01-01"),
          updatedAt: new Date("2023-01-01"),
        },
        {
          id: 2,
          name: "John Doe",
          email: "john@example.com",
          password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO", // secret123
          role: "user",
          active: true,
          emailVerified: true,
          phone: "+1234567890",
          createdAt: new Date("2023-06-01"),
          updatedAt: new Date("2023-06-01"),
        },
        {
          id: 3,
          name: "Jane Smith",
          email: "jane@example.com",
          password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO", // secret123
          role: "moderator",
          active: true,
          emailVerified: false,
          createdAt: new Date("2023-08-15"),
          updatedAt: new Date("2023-08-15"),
        },
      ]
    }
    return User._storage
  }

  static async saveToStorage(users) {
    User._storage = users
    return true
  }

  // Validation methods
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

  static validateRole(role) {
    const validRoles = ["user", "admin", "moderator"]
    return validRoles.includes(role)
  }
}

module.exports = User
