// Demonstration of Core Modules and Utility Classes
// Run with: node demo.js

console.log("🚀 Node.js Core Modules - Advanced Demo")
console.log("=".repeat(50))

// Import utility classes
const FileUtils = require('./utils/file-utils')
const SystemInfo = require('./utils/system-info')

// Core modules
const path = require('path')
const crypto = require('crypto')
const os = require('os')
const util = require('util')

console.log("\n📁 FileUtils Class Demo:")
console.log("========================")

// Get file information
const packageInfo = FileUtils.getFileInfo('./package.json')
console.log("Package.json info:", util.inspect(packageInfo, { colors: true }))

// Path operations
const imagePath = FileUtils.joinPaths('uploads', 'images', 'profile.jpg')
console.log("Image path:", imagePath)

// Extension manipulation
const pdfFile = FileUtils.changeExtension('document.txt', '.pdf')
console.log("Changed extension:", pdfFile)

// File size (if package.json exists)
const fileSize = FileUtils.getFileSize('./package.json')
if (fileSize) {
  console.log("Package.json size:", fileSize)
} else {
  console.log("Package.json not found")
}

console.log("\n🖥️ SystemInfo Class Demo:")
console.log("==========================")

// Basic system info
const basicInfo = SystemInfo.getBasicInfo()
console.log("System info:", util.inspect(basicInfo, { colors: true }))

// Memory information
const memoryInfo = SystemInfo.getMemoryInfo()
console.log("Memory info:", util.inspect(memoryInfo, { colors: true }))

// CPU information
const cpuInfo = SystemInfo.getCPUInfo()
console.log("CPU info:", util.inspect(cpuInfo, { colors: true }))

// User information
const userInfo = SystemInfo.getUserInfo()
console.log("User info:", util.inspect(userInfo, { colors: true }))

console.log("\n🔐 Security Best Practices Demo:")
console.log("=================================")

// Generate secure tokens
console.log("Secure UUID:", crypto.randomUUID())
console.log("Secure token (32 bytes):", crypto.randomBytes(32).toString('hex'))
console.log("Secure password salt:", crypto.randomBytes(16).toString('base64'))

// Hashing example
const password = "mySecurePassword123"
const salt = crypto.randomBytes(16).toString('hex')
const hash = crypto.createHash('sha256').update(password + salt).digest('hex')
console.log("Password hash:", hash)

console.log("\n🌐 URL Processing Demo:")
console.log("=======================")

// Safe URL parsing function
function safeParseURL(urlString) {
  try {
    const url = new URL(urlString)
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      searchParams: Object.fromEntries(url.searchParams)
    }
  } catch (error) {
    console.error(`❌ Invalid URL: ${urlString}`)
    return null
  }
}

// Test URLs
const testUrls = [
  "https://api.example.com:8080/users?page=1&limit=10#results",
  "http://localhost:3000/dashboard",
  "invalid-url-format",
  "ftp://files.example.com/documents/file.pdf"
]

testUrls.forEach(url => {
  const parsed = safeParseURL(url)
  if (parsed) {
    console.log(`✅ ${url}:`)
    console.log(util.inspect(parsed, { colors: true, compact: true }))
  }
})

console.log("\n📊 Buffer Operations Demo:")
console.log("===========================")

// Different buffer creation methods
const textBuffer = Buffer.from("Hello, 世界! 🌍", 'utf8')
const hexBuffer = Buffer.from('48656c6c6f', 'hex')
const arrayBuffer = Buffer.from([72, 101, 108, 108, 111])

console.log("Text buffer:", textBuffer.toString())
console.log("Text as hex:", textBuffer.toString('hex'))
console.log("Text as base64:", textBuffer.toString('base64'))

console.log("Hex buffer as text:", hexBuffer.toString())
console.log("Array buffer as text:", arrayBuffer.toString())

console.log("\n⚡ Event System Demo:")
console.log("=====================")

const EventEmitter = require('events')

class SimpleLogger extends EventEmitter {
  constructor() {
    super()
    this.logs = []
  }

  log(level, message) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message
    }
    this.logs.push(entry)
    this.emit('log', entry)
  }

  info(message) { this.log('info', message) }
  warn(message) { this.log('warn', message) }
  error(message) { this.log('error', message) }

  getLogs() { return this.logs }
}

const logger = new SimpleLogger()

// Add event listeners
logger.on('log', (entry) => {
  const color = entry.level === 'ERROR' ? '\x1b[31m' : 
                entry.level === 'WARN' ? '\x1b[33m' : '\x1b[32m'
  console.log(`${color}[${entry.level}]\x1b[0m ${entry.timestamp}: ${entry.message}`)
})

// Test the logger
logger.info('Application started')
logger.warn('This is a warning message')
logger.error('This is an error message')

console.log("\n⏰ Timer Execution Order Demo:")
console.log("===============================")

console.log("1: Synchronous code")

process.nextTick(() => {
  console.log("2: process.nextTick")
})

setImmediate(() => {
  console.log("4: setImmediate")
})

setTimeout(() => {
  console.log("5: setTimeout")
}, 0)

Promise.resolve().then(() => {
  console.log("3: Promise.resolve")
})

console.log("6: More synchronous code")

console.log("\n📈 System Monitoring Demo:")
console.log("===========================")

function displaySystemStats() {
  const stats = {
    timestamp: new Date().toLocaleString(),
    memory: {
      total: SystemInfo.formatBytes(os.totalmem()),
      free: SystemInfo.formatBytes(os.freemem()),
      used: SystemInfo.formatBytes(os.totalmem() - os.freemem())
    },
    cpu: {
      cores: os.cpus().length,
      model: os.cpus()[0].model
    },
    process: {
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime().toFixed(2) + ' seconds'
    }
  }
  
  console.log(util.inspect(stats, { colors: true, depth: null }))
}

displaySystemStats()

// Generate a full system report using our SystemInfo class
console.log("\n📋 Full System Report:")
console.log("=======================")
const fullReport = SystemInfo.getFullReport()
console.log(util.inspect(fullReport, { colors: true, depth: null }))

console.log("\n✅ Demo completed! All core modules demonstrated.")
