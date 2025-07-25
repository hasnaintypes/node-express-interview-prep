// User Model
// Represents a user in the system with validation and business logic

class User {
  constructor(data) {
    this.id = data.id || null;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || "user";
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Validation methods
  static validate(userData) {
    const errors = [];

    if (!userData.name || userData.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long");
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push("Valid email is required");
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Transform for API response (exclude sensitive data)
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Update user data
  update(newData) {
    if (newData.name) this.name = newData.name;
    if (newData.email) this.email = newData.email;
    if (newData.role) this.role = newData.role;
    if (newData.isActive !== undefined) this.isActive = newData.isActive;
    this.updatedAt = new Date();
  }
}

module.exports = User;
