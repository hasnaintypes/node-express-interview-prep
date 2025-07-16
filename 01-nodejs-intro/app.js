// Node.js Introduction - Working Examples

console.log("🚀 Welcome to Node.js!")
console.log("=".repeat(50))

// 1. Global Objects Demo
console.log("\n📁 Global Objects:")
console.log("Current directory:", __dirname)
console.log("Current file:", __filename)
console.log("Node version:", process.version)
console.log("Platform:", process.platform)

// 2. Process Object
console.log("\n⚙️ Process Information:")
console.log("Process ID:", process.pid)
console.log("Memory usage:", process.memoryUsage())
console.log("Command line args:", process.argv)

// 3. Environment Variables
console.log("\n🌍 Environment:")
console.log("NODE_ENV:", process.env.NODE_ENV || "development")
console.log("PATH exists:", !!process.env.PATH)

// 4. Module System Demo
const userModule = require("./modules/user")
const mathModule = require("./modules/math")

console.log("\n📦 Module System:")
console.log("User greeting:", userModule.greet())
console.log("User info:", userModule.getUserInfo())
console.log("Math operations:", mathModule.add(5, 3))
console.log("Math operations:", mathModule.multiply(4, 7))

// 5. Basic HTTP Server
const http = require("http")

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" })
  res.end(`
    <h1>🎉 Node.js Server Running!</h1>
    <p><strong>URL:</strong> ${req.url}</p>
    <p><strong>Method:</strong> ${req.method}</p>
    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
  `)
})

const PORT = 3000
server.listen(PORT, () => {
  console.log(`\n🌐 Server running at http://localhost:${PORT}`)
  console.log("Press Ctrl+C to stop the server")
})

// 6. Console Methods Demo
console.log("\n🎨 Console Methods:")
console.time("Timer Demo")
console.warn("⚠️ This is a warning")
console.error("❌ This is an error (but not crashing)")
console.info("ℹ️ This is info")
console.timeEnd("Timer Demo")

// 7. Graceful Shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Gracefully shutting down...")
  server.close(() => {
    console.log("✅ Server closed")
    process.exit(0)
  })
})
