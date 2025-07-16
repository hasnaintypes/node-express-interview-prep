// Node.js Event Loop & Asynchronous Programming

console.log("🔄 Event Loop & Async Programming Demo")
console.log("=".repeat(50))

const fs = require("fs")
const util = require("util")
const EventEmitter = require("events")

// 1. Event Loop Phases Demonstration
console.log("\n⚡ Event Loop Phases:")

console.log("1. Synchronous code")

// Timer phase
setTimeout(() => console.log("2. Timer (setTimeout)"), 0)
setInterval(() => {
  console.log("3. Timer (setInterval)")
  process.exit(0) // Exit after first interval
}, 100)

// Check phase
setImmediate(() => console.log("4. Check (setImmediate)"))

// Microtasks (higher priority)
process.nextTick(() => console.log("5. NextTick (microtask)"))
Promise.resolve().then(() => console.log("6. Promise (microtask)"))

console.log("7. More synchronous code")

// 2. Callback Pattern
console.log("\n📞 Callback Pattern:")

function fetchUserData(userId, callback) {
  // Simulate async operation
  setTimeout(() => {
    if (userId <= 0) {
      return callback(new Error("Invalid user ID"))
    }

    const userData = {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
    }

    callback(null, userData)
  }, 100)
}

fetchUserData(1, (err, data) => {
  if (err) {
    console.error("❌ Error:", err.message)
  } else {
    console.log("✅ User data:", data)
  }
})

// 3. Promise Pattern
console.log("\n🤝 Promise Pattern:")

function fetchUserDataPromise(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId <= 0) {
        reject(new Error("Invalid user ID"))
      } else {
        resolve({
          id: userId,
          name: `User ${userId}`,
          email: `user${userId}@example.com`,
        })
      }
    }, 150)
  })
}

fetchUserDataPromise(2)
  .then((data) => console.log("✅ Promise user data:", data))
  .catch((err) => console.error("❌ Promise error:", err.message))

// 4. Async/Await Pattern
console.log("\n🎯 Async/Await Pattern:")

async function fetchUserDataAsync(userId) {
  try {
    const data = await fetchUserDataPromise(userId)
    console.log("✅ Async/await user data:", data)
  } catch (err) {
    console.error("❌ Async/await error:", err.message)
  }
}

fetchUserDataAsync(3)

// 5. Event Emitter
console.log("\n📡 Event Emitter:")

class UserService extends EventEmitter {
  constructor() {
    super()
    this.users = []
  }

  addUser(user) {
    this.users.push(user)
    this.emit("userAdded", user)
    this.emit("usersChanged", this.users.length)
  }

  removeUser(userId) {
    const index = this.users.findIndex((u) => u.id === userId)
    if (index !== -1) {
      const user = this.users.splice(index, 1)[0]
      this.emit("userRemoved", user)
      this.emit("usersChanged", this.users.length)
    }
  }

  getUsers() {
    return [...this.users]
  }
}

const userService = new UserService()

// Event listeners
userService.on("userAdded", (user) => {
  console.log("👤 User added:", user.name)
})

userService.on("userRemoved", (user) => {
  console.log("👋 User removed:", user.name)
})

userService.on("usersChanged", (count) => {
  console.log("📊 Total users:", count)
})

// Add some users
userService.addUser({ id: 1, name: "Alice" })
userService.addUser({ id: 2, name: "Bob" })
userService.removeUser(1)

// 6. File Operations (Non-blocking)
console.log("\n📁 File Operations:")

// Create a test file first
fs.writeFile("temp-file.txt", "Hello from Node.js!", (err) => {
  if (err) {
    console.error("❌ Write error:", err)
    return
  }

  console.log("✅ File written successfully")

  // Read the file
  fs.readFile("temp-file.txt", "utf8", (err, data) => {
    if (err) {
      console.error("❌ Read error:", err)
      return
    }

    console.log("✅ File content:", data)

    // Clean up
    fs.unlink("temp-file.txt", (err) => {
      if (err) console.error("❌ Delete error:", err)
      else console.log("✅ File deleted")
    })
  })
})

// 7. Promisified File Operations
console.log("\n📄 Promisified File Operations:")

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)
const unlinkAsync = util.promisify(fs.unlink)

async function fileOperationsAsync() {
  try {
    await writeFileAsync("temp-async-file.txt", "Hello from async/await!")
    console.log("✅ Async file written")

    const data = await readFileAsync("temp-async-file.txt", "utf8")
    console.log("✅ Async file content:", data)

    await unlinkAsync("temp-async-file.txt")
    console.log("✅ Async file deleted")
  } catch (err) {
    console.error("❌ Async file error:", err.message)
  }
}

fileOperationsAsync()

// 8. Multiple Concurrent Operations
console.log("\n🚀 Concurrent Operations:")

async function concurrentOperations() {
  const operations = [fetchUserDataPromise(10), fetchUserDataPromise(20), fetchUserDataPromise(30)]

  try {
    const results = await Promise.all(operations)
    console.log("✅ All operations completed:", results.length, "users")
  } catch (err) {
    console.error("❌ Concurrent operations error:", err.message)
  }
}

concurrentOperations()

// 9. Error Handling Patterns
console.log("\n🛡️ Error Handling:")

// Unhandled promise rejection handler
process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 Unhandled Promise Rejection:", reason)
})

// Uncaught exception handler
process.on("uncaughtException", (err) => {
  console.error("🚨 Uncaught Exception:", err.message)
  process.exit(1)
})

// 10. Performance Monitoring
console.log("\n⏱️ Performance Monitoring:")

const startTime = process.hrtime.bigint()

setTimeout(() => {
  const endTime = process.hrtime.bigint()
  const duration = Number(endTime - startTime) / 1000000 // Convert to milliseconds
  console.log(`⚡ Event loop completed in ${duration.toFixed(2)}ms`)
}, 200)
