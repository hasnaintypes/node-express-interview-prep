// User Module - Demonstrates module.exports

const user = {
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  role: "Developer",
}

function greet() {
  return `Hello, I'm ${user.name}!`
}

function getUserInfo() {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

function updateUser(updates) {
  Object.assign(user, updates)
  return user
}

// Export functions and data
module.exports = {
  greet,
  getUserInfo,
  updateUser,
  user: user, // Direct access to user object
}
