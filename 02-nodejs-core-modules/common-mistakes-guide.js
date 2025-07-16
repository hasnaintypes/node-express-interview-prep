// Common Mistakes and Best Practices Demo
// Run with: node mistakes-demo.js

console.log("⚠️ Common Node.js Core Module Mistakes Demo")
console.log("=".repeat(50))

const path = require('path')
const crypto = require('crypto')
const os = require('os')
const { EventEmitter } = require('events')

console.log("\n1. ❌ Path Separator Issues:")
console.log("============================")

// WRONG: Platform-specific path construction
function badPathExample() {
  const filename = "data.txt"
  const badPath = __dirname + "/files/" + filename  // Will break on Windows
  console.log("❌ Bad path (Unix-only):", badPath)
  
  // Another bad example
  const badWinPath = "C:\\Users\\John\\Documents\\file.txt"  // Will break on Unix
  console.log("❌ Bad path (Windows-only):", badWinPath)
}

// CORRECT: Cross-platform path construction
function goodPathExample() {
  const filename = "data.txt"
  const goodPath = path.join(__dirname, "files", filename)  // Works everywhere
  console.log("✅ Good path (cross-platform):", goodPath)
  
  // Another good example
  const goodCrossPlatformPath = path.join("Users", "John", "Documents", "file.txt")
  console.log("✅ Good path (cross-platform):", goodCrossPlatformPath)
  
  // Show platform-specific separators
  console.log("Platform separator:", `'${path.sep}'`)
  console.log("Platform delimiter:", `'${path.delimiter}'`)
}

badPathExample()
goodPathExample()

console.log("\n2. ❌ Weak Random Number Generation:")
console.log("====================================")

// WRONG: Using Math.random() for security
function badRandomExample() {
  const weakId = Math.random().toString(36).substring(2)
  const weakToken = Math.random().toString()
  console.log("❌ Weak ID (predictable):", weakId)
  console.log("❌ Weak token (not secure):", weakToken)
}

// CORRECT: Using crypto module for security
function goodRandomExample() {
  const strongId = crypto.randomUUID()
  const strongToken = crypto.randomBytes(32).toString('hex')
  const strongPassword = crypto.randomBytes(16).toString('base64')
  console.log("✅ Strong UUID:", strongId)
  console.log("✅ Strong token:", strongToken)
  console.log("✅ Strong password:", strongPassword)
}

badRandomExample()
goodRandomExample()

console.log("\n3. ❌ Buffer Encoding Problems:")
console.log("===============================")

// WRONG: Implicit encoding
function badBufferExample() {
  const text = "Hello 世界 🌍"
  const badBuffer = Buffer.from(text)  // Encoding not specified
  console.log("❌ Buffer with implicit encoding:", badBuffer)
  console.log("❌ Might display incorrectly:", badBuffer.toString())
}

// CORRECT: Explicit encoding
function goodBufferExample() {
  const text = "Hello 世界 🌍"
  const goodBuffer = Buffer.from(text, 'utf8')  // Encoding specified
  console.log("✅ Buffer with explicit encoding:", goodBuffer)
  console.log("✅ Displays correctly:", goodBuffer.toString('utf8'))
  
  // Different encodings
  console.log("✅ As hex:", goodBuffer.toString('hex'))
  console.log("✅ As base64:", goodBuffer.toString('base64'))
}

badBufferExample()
goodBufferExample()

console.log("\n4. ❌ URL Parsing Without Error Handling:")
console.log("==========================================")

// WRONG: No error handling
function badUrlExample() {
  const testUrls = ["https://example.com", "not-a-valid-url", "ftp://files.com"]
  
  testUrls.forEach(urlString => {
    try {
      const url = new URL(urlString)  // This will throw for invalid URLs
      console.log("❌ No error handling - might crash:", url.hostname)
    } catch (error) {
      console.log("❌ Crashed on:", urlString)
    }
  })
}

// CORRECT: Proper error handling
function goodUrlExample() {
  function safeParseURL(urlString) {
    try {
      return new URL(urlString)
    } catch (error) {
      console.error(`❌ Invalid URL: ${urlString}`)
      return null
    }
  }
  
  const testUrls = ["https://example.com", "not-a-valid-url", "ftp://files.com"]
  
  testUrls.forEach(urlString => {
    const url = safeParseURL(urlString)
    if (url) {
      console.log("✅ Safely parsed:", url.hostname)
    }
  })
}

badUrlExample()
goodUrlExample()

console.log("\n5. ❌ Memory Leaks with EventEmitters:")
console.log("======================================")

// WRONG: Accumulating listeners
function badEventExample() {
  const emitter = new EventEmitter()
  
  // This function adds listeners without removing them
  function addListener() {
    emitter.on('data', (data) => {
      console.log('Received:', data)
    })
  }
  
  // Simulate multiple calls (would cause memory leak)
  console.log("❌ Adding multiple listeners without cleanup...")
  addListener()
  addListener()
  addListener()
  
  console.log("❌ Listener count:", emitter.listenerCount('data'))
  emitter.emit('data', 'test')
}

// CORRECT: Proper listener management
function goodEventExample() {
  const emitter = new EventEmitter()
  
  // Proper way: reuse the same handler or clean up
  const handler = (data) => {
    console.log('✅ Properly handled:', data)
  }
  
  // Add listener
  emitter.on('data', handler)
  console.log("✅ Listener count:", emitter.listenerCount('data'))
  
  // Use once() for one-time events
  emitter.once('startup', () => {
    console.log('✅ Startup event (runs once)')
  })
  
  // Emit events
  emitter.emit('data', 'test data')
  emitter.emit('startup')
  emitter.emit('startup')  // Won't run again
  
  // Clean up when done
  emitter.removeListener('data', handler)
  console.log("✅ After cleanup, listener count:", emitter.listenerCount('data'))
}

badEventExample()
goodEventExample()

console.log("\n6. ❌ Platform-Specific Assumptions:")
console.log("====================================")

// WRONG: Assuming Unix behavior
function badPlatformExample() {
  const homeDir = process.env.HOME  // undefined on Windows
  console.log("❌ Unix-only home dir:", homeDir || "undefined")
  
  const pathSep = "/"  // Wrong on Windows
  console.log("❌ Hardcoded separator:", pathSep)
}

// CORRECT: Cross-platform approach
function goodPlatformExample() {
  const homeDir = os.homedir()  // Works everywhere
  console.log("✅ Cross-platform home dir:", homeDir)
  
  const pathSep = path.sep  // Correct for current platform
  console.log("✅ Platform separator:", pathSep)
  
  console.log("✅ Platform info:")
  console.log("  - Platform:", os.platform())
  console.log("  - Architecture:", os.arch())
  console.log("  - EOL marker:", JSON.stringify(os.EOL))
}

badPlatformExample()
goodPlatformExample()

console.log("\n7. ❌ Manual String Manipulation for URLs:")
console.log("==========================================")

// WRONG: Manual parsing
function badQueryExample() {
  const query = "name=john doe&email=john@example.com&age=30"
  const badParsed = query.split('&')  // Doesn't handle encoding
  console.log("❌ Manual parsing (broken):", badParsed)
}

// CORRECT: Using querystring module
function goodQueryExample() {
  const querystring = require('querystring')
  const query = "name=john%20doe&email=john%40example.com&age=30"
  const goodParsed = querystring.parse(query)
  console.log("✅ Proper parsing:", goodParsed)
  
  // Creating query strings
  const params = { name: 'jane doe', email: 'jane@example.com', active: true }
  const queryStr = querystring.stringify(params)
  console.log("✅ Proper encoding:", queryStr)
}

badQueryExample()
goodQueryExample()

console.log("\n8. ❌ Large Buffer Allocation:")
console.log("==============================")

// WRONG: Dangerous large allocation
function badBufferAllocExample() {
  try {
    // Don't actually do this - it could crash!
    console.log("❌ Attempting to allocate 1GB buffer (dangerous)...")
    // const bigBuffer = Buffer.alloc(1024 * 1024 * 1024)  // 1GB
    console.log("❌ (Skipped for safety - would use too much memory)")
  } catch (error) {
    console.log("❌ Buffer allocation failed:", error.message)
  }
}

// CORRECT: Safe buffer handling
function goodBufferAllocExample() {
  function safeBufferAlloc(size) {
    const MAX_SIZE = 1024 * 1024 * 10  // 10MB limit
    if (size > MAX_SIZE) {
      throw new Error(`Buffer size ${size} exceeds maximum ${MAX_SIZE}`)
    }
    return Buffer.alloc(size)
  }
  
  try {
    const safeBuffer = safeBufferAlloc(1024)  // 1KB - safe
    console.log("✅ Safe buffer allocated:", safeBuffer.length, "bytes")
    
    const unsafeSize = 1024 * 1024 * 100  // 100MB - too big
    safeBufferAlloc(unsafeSize)
  } catch (error) {
    console.log("✅ Properly caught oversized allocation:", error.message)
  }
}

badBufferAllocExample()
goodBufferAllocExample()

console.log("\n📚 Summary of Best Practices:")
console.log("=============================")
console.log("✅ Always use path.join() for file paths")
console.log("✅ Use crypto module for secure random data")
console.log("✅ Specify encoding explicitly when working with buffers")
console.log("✅ Handle URL parsing errors with try-catch")
console.log("✅ Clean up event listeners to prevent memory leaks")
console.log("✅ Use os module for cross-platform compatibility")
console.log("✅ Use querystring module for URL parameter handling")
console.log("✅ Validate buffer sizes before allocation")

console.log("\n✅ Mistakes demo completed!")
