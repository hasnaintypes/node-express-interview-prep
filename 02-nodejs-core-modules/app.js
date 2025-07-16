// Node.js Core Modules - Working Examples

console.log("📚 Node.js Core Modules Demo")
console.log("=".repeat(50))

// 1. Path Module
const path = require("path")

console.log("\n🛤️ Path Module:")
console.log("Current directory:", __dirname)
console.log("Join paths:", path.join(__dirname, "files", "data.txt"))
console.log("File extension:", path.extname("document.pdf"))
console.log("Base name:", path.basename("/home/user/document.pdf"))
console.log("Directory name:", path.dirname("/home/user/document.pdf"))
console.log("Parse path:", path.parse("/home/user/document.pdf"))

// 2. OS Module
const os = require("os")

console.log("\n💻 OS Module:")
console.log("Platform:", os.platform())
console.log("Architecture:", os.arch())
console.log("CPU count:", os.cpus().length)
console.log("Total memory:", (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + " GB")
console.log("Free memory:", (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + " GB")
console.log("Home directory:", os.homedir())
console.log("Hostname:", os.hostname())
console.log("Uptime:", (os.uptime() / 3600).toFixed(2) + " hours")

// 3. URL Module
const url = require("url")

console.log("\n🔗 URL Module:")
const sampleUrl = "https://api.example.com:8080/users/123?active=true&sort=name#profile"
const parsedUrl = new URL(sampleUrl)

console.log("Full URL:", sampleUrl)
console.log("Protocol:", parsedUrl.protocol)
console.log("Hostname:", parsedUrl.hostname)
console.log("Port:", parsedUrl.port)
console.log("Pathname:", parsedUrl.pathname)
console.log("Search params:", parsedUrl.search)
console.log("Hash:", parsedUrl.hash)

// URL Search Params
console.log("\n🔍 URL Search Params:")
parsedUrl.searchParams.forEach((value, key) => {
  console.log(`${key}: ${value}`)
})

// 4. Crypto Module
const crypto = require("crypto")

console.log("\n🔐 Crypto Module:")
console.log("Random UUID:", crypto.randomUUID())
console.log("Random bytes (hex):", crypto.randomBytes(16).toString("hex"))
console.log("Random bytes (base64):", crypto.randomBytes(16).toString("base64"))

// Hash generation
const hash = crypto.createHash("sha256")
hash.update("Hello World")
console.log("SHA256 hash:", hash.digest("hex"))

// HMAC
const hmac = crypto.createHmac("sha256", "secret-key")
hmac.update("Hello World")
console.log("HMAC:", hmac.digest("hex"))

// 5. Util Module
const util = require("util")

console.log("\n🛠️ Util Module:")
const complexObject = {
  name: "John",
  age: 30,
  hobbies: ["reading", "coding"],
  address: {
    street: "123 Main St",
    city: "New York",
  },
}

console.log("Formatted string:", util.format("Hello %s, you are %d years old", "John", 30))
console.log("Object inspection:")
console.log(util.inspect(complexObject, { colors: true, depth: null }))

// 6. QueryString Module
const querystring = require("querystring")

console.log("\n🔤 QueryString Module:")
const params = "name=john&age=30&city=new%20york"
const parsed = querystring.parse(params)
console.log("Parsed query:", parsed)
console.log("Stringified:", querystring.stringify({ name: "jane", age: 25 }))

// 7. Events Module (Preview for later modules)
const EventEmitter = require("events")

console.log("\n⚡ Events Module (Preview):")
const emitter = new EventEmitter()

emitter.on("message", (data) => {
  console.log("Received message:", data)
})

emitter.emit("message", "Hello from EventEmitter!")

// 8. Timers (Global, but worth mentioning)
console.log("\n⏰ Timers:")
console.log("Setting timeout...")

setTimeout(() => {
  console.log("✅ Timeout executed after 1 second")
}, 1000)

setImmediate(() => {
  console.log("✅ Immediate executed")
})

// 9. Buffer (Global)
console.log("\n📦 Buffer:")
const buffer = Buffer.from("Hello World", "utf8")
console.log("Buffer:", buffer)
console.log("Buffer to string:", buffer.toString())
console.log("Buffer to hex:", buffer.toString("hex"))
console.log("Buffer to base64:", buffer.toString("base64"))

// 10. Module information
console.log("\n📋 Module Information:")
console.log("Module filename:", __filename)
console.log("Module dirname:", __dirname)
console.log("Module loaded:", !!module.loaded)
console.log("Module children count:", module.children.length)
