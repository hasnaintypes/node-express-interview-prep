// User model for handling user data operations

const crypto = require("crypto");

class User {
  constructor(userData) {
    this.id = userData.id;
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.role = userData.role || "user";
    this.active = userData.active !== undefined ? userData.active : true;
    this.emailVerified = userData.emailVerified || false;
    this.emailVerificationToken = userData.emailVerificationToken || null;
    this.loginAttempts = userData.loginAttempts || 0;
    this.lockUntil = userData.lockUntil || null;
    this.passwordResetToken = userData.passwordResetToken || null;
    this.passwordResetExpires = userData.passwordResetExpires || null;
    this.refreshToken = userData.refreshToken || null;
    this.lastLogin = userData.lastLogin || null;
    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = userData.updatedAt || new Date();
  }

  // Convert user to JSON (excluding sensitive fields)
  toJSON() {
    const userObj = { ...this };
    delete userObj.password;
    delete userObj.refreshToken;
    delete userObj.passwordResetToken;
    delete userObj.emailVerificationToken;
    delete userObj.loginAttempts;
    delete userObj.lockUntil;
    return userObj;
  }

  // Static methods for user operations (In production, these would interact with a database)
  static users = [
    {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO", // Admin123!
      role: "admin",
      active: true,
      emailVerified: true,
      loginAttempts: 0,
      lockUntil: null,
      createdAt: new Date("2023-01-01"),
      updatedAt: new Date("2023-01-01"),
    },
    {
      id: 2,
      name: "John Doe",
      email: "user@example.com",
      password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO", // User123!
      role: "user",
      active: true,
      emailVerified: true,
      loginAttempts: 0,
      lockUntil: null,
      createdAt: new Date("2023-06-01"),
      updatedAt: new Date("2023-06-01"),
    },
  ];

  // Find user by ID
  static async findById(id) {
    const userData = this.users.find((user) => user.id === parseInt(id));
    return userData ? new User(userData) : null;
  }

  // Find user by email
  static async findByEmail(email) {
    const userData = this.users.find((user) => user.email === email);
    return userData ? new User(userData) : null;
  }

  // Find user by reset token
  static async findByResetToken(token) {
    const userData = this.users.find(
      (user) => user.passwordResetToken === token
    );
    return userData ? new User(userData) : null;
  }

  // Find user by email verification token
  static async findByEmailVerificationToken(token) {
    const userData = this.users.find(
      (user) => user.emailVerificationToken === token
    );
    return userData ? new User(userData) : null;
  }

  // Create new user
  static async create(userData) {
    const newId = Math.max(...this.users.map((u) => u.id), 0) + 1;
    const newUser = {
      id: newId,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    return new User(newUser);
  }

  // Update user
  static async update(id, updateData) {
    const userIndex = this.users.findIndex((user) => user.id === parseInt(id));
    if (userIndex === -1) return null;

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateData,
      updatedAt: new Date(),
    };

    return new User(this.users[userIndex]);
  }

  // Update refresh token
  static async updateRefreshToken(id, refreshToken) {
    return this.update(id, { refreshToken });
  }

  // Reset login attempts
  static async resetLoginAttempts(id) {
    return this.update(id, { loginAttempts: 0, lockUntil: null });
  }

  // Update last login
  static async updateLastLogin(id) {
    return this.update(id, { lastLogin: new Date() });
  }

  // Delete user
  static async delete(id) {
    const userIndex = this.users.findIndex((user) => user.id === parseInt(id));
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }

  // Get all users
  static async findAll() {
    return this.users.map((userData) => new User(userData));
  }

  // Generate email verification token
  static generateEmailVerificationToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  // Generate password reset token
  static generatePasswordResetToken() {
    return crypto.randomBytes(32).toString("hex");
  }
}

module.exports = User;
