// User Service
// Business logic for user operations

const User = require("../models/User");

// In-memory storage for demonstration (replace with database in production)
let users = [
  new User({
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    password: "hashedpassword123",
    role: "user",
    createdAt: new Date("2024-01-01"),
  }),
  new User({
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    password: "hashedpassword456",
    role: "admin",
    createdAt: new Date("2024-01-02"),
  }),
  new User({
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    password: "hashedpassword789",
    role: "user",
    isActive: false,
    createdAt: new Date("2024-01-03"),
  }),
];

let nextUserId = 4;

const userService = {
  // Get all users with pagination and filtering
  async findUsers(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "id",
      role = "",
      isActive = "",
    } = options;

    let filteredUsers = [...users];

    // Apply search filter
    if (search) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply role filter
    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role);
    }

    // Apply active status filter
    if (isActive !== "") {
      filteredUsers = filteredUsers.filter(
        (user) => user.isActive === (isActive === "true")
      );
    }

    // Apply sorting
    const [sortField, sortOrder] = sort.startsWith("-")
      ? [sort.slice(1), "desc"]
      : [sort, "asc"];
    filteredUsers.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    return {
      users: paginatedUsers.map((user) => user.toJSON()),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredUsers.length / limit),
        totalUsers: filteredUsers.length,
        hasNextPage: offset + limit < filteredUsers.length,
        hasPrevPage: page > 1,
      },
    };
  },

  // Find user by ID
  async findUserById(id) {
    const user = users.find((u) => u.id === parseInt(id));
    return user ? user.toJSON() : null;
  },

  // Create new user
  async createUser(userData) {
    const validation = User.validate(userData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    // Check if email already exists
    const existingUser = users.find((u) => u.email === userData.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const newUser = new User({
      ...userData,
      id: nextUserId++,
    });

    users.push(newUser);
    return newUser.toJSON();
  },

  // Update user
  async updateUser(id, userData) {
    const user = users.find((u) => u.id === parseInt(id));
    if (!user) {
      throw new Error("User not found");
    }

    // Validate only provided fields
    const fieldsToValidate = {};
    if (userData.name) fieldsToValidate.name = userData.name;
    if (userData.email) fieldsToValidate.email = userData.email;
    if (userData.password) fieldsToValidate.password = userData.password;

    if (Object.keys(fieldsToValidate).length > 0) {
      const validation = User.validate({ ...user, ...fieldsToValidate });
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }
    }

    // Check if email already exists (excluding current user)
    if (userData.email && userData.email !== user.email) {
      const existingUser = users.find(
        (u) => u.email === userData.email && u.id !== user.id
      );
      if (existingUser) {
        throw new Error("Email already exists");
      }
    }

    user.update(userData);
    return user.toJSON();
  },

  // Delete user
  async deleteUser(id) {
    const userIndex = users.findIndex((u) => u.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    const deletedUser = users.splice(userIndex, 1)[0];
    return deletedUser.toJSON();
  },

  // Get user statistics
  async getUserStats() {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;
    const adminUsers = users.filter((u) => u.role === "admin").length;
    const regularUsers = users.filter((u) => u.role === "user").length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      regularUsers,
    };
  },
};

module.exports = userService;
