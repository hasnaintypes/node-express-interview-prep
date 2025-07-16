// Node.js File System, Streams & Buffers

const fs = require("fs")
const path = require("path")
const { pipeline } = require("stream")
const { promisify } = require("util")

console.log("📁 File System, Streams & Buffers Demo")
console.log("=".repeat(50))

// Create directories for examples
const examplesDir = path.join(__dirname, "examples")
const dataDir = path.join(__dirname, "data")
;[examplesDir, dataDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

// 1. Basic File Operations
console.log("\n📄 Basic File Operations:")

const sampleData = `Hello from Node.js File System!
This is a sample file created at ${new Date().toISOString()}
Line 3 of the sample file
Line 4 with some numbers: 12345`

// Write file (async)
fs.writeFile(path.join(dataDir, "sample.txt"), sampleData, "utf8", (err) => {
  if (err) {
    console.error("❌ Write error:", err)
    return
  }

  console.log("✅ File written successfully")

  // Read file (async)
  fs.readFile(path.join(dataDir, "sample.txt"), "utf8", (err, data) => {
    if (err) {
      console.error("❌ Read error:", err)
      return
    }

    console.log("✅ File content:")
    console.log(data)
  })
})

// 2. File Stats and Information
console.log("\n📊 File Information:")

setTimeout(() => {
  fs.stat(path.join(dataDir, "sample.txt"), (err, stats) => {
    if (err) {
      console.error("❌ Stat error:", err)
      return
    }

    console.log("✅ File stats:")
    console.log("  Size:", stats.size, "bytes")
    console.log("  Is file:", stats.isFile())
    console.log("  Is directory:", stats.isDirectory())
    console.log("  Created:", stats.birthtime)
    console.log("  Modified:", stats.mtime)
    console.log("  Mode:", stats.mode.toString(8))
  })
}, 100)

// 3. Directory Operations
console.log("\n📂 Directory Operations:")

// Create nested directories
const nestedDir = path.join(dataDir, "nested", "deep", "structure")
fs.mkdir(nestedDir, { recursive: true }, (err) => {
  if (err) {
    console.error("❌ Mkdir error:", err)
    return
  }

  console.log("✅ Nested directories created")

  // List directory contents
  fs.readdir(dataDir, { withFileTypes: true }, (err, entries) => {
    if (err) {
      console.error("❌ Readdir error:", err)
      return
    }

    console.log("✅ Directory contents:")
    entries.forEach((entry) => {
      const type = entry.isDirectory() ? "📁" : "📄"
      console.log(`  ${type} ${entry.name}`)
    })
  })
})

// 4. Buffer Operations
console.log("\n📦 Buffer Operations:")

// Create buffers
const buf1 = Buffer.from("Hello", "utf8")
const buf2 = Buffer.from(" World!", "utf8")
const buf3 = Buffer.alloc(10, "a") // Fill with 'a'

console.log("Buffer 1:", buf1)
console.log("Buffer 1 string:", buf1.toString())
console.log("Buffer 1 hex:", buf1.toString("hex"))
console.log("Buffer 1 base64:", buf1.toString("base64"))

// Concatenate buffers
const combined = Buffer.concat([buf1, buf2])
console.log("Combined buffer:", combined.toString())

// Buffer comparison
console.log("Buffers equal:", buf1.equals(Buffer.from("Hello")))

// 5. Streams - Reading Large Files
console.log("\n🌊 Stream Operations:")

// Create a large file for stream demo
const largeContent = "This is line number X\n".repeat(1000)
fs.writeFile(
  path.join(dataDir, "large-file.txt"),
  largeContent.replace(/X/g, (match, offset) => Math.floor(offset / 20)),
  (err) => {
    if (err) {
      console.error("❌ Large file write error:", err)
      return
    }

    console.log("✅ Large file created")

    // Read using stream
    const readStream = fs.createReadStream(path.join(dataDir, "large-file.txt"), {
      encoding: "utf8",
      highWaterMark: 1024, // 1KB chunks
    })

    let chunkCount = 0
    let totalSize = 0

    readStream.on("data", (chunk) => {
      chunkCount++
      totalSize += chunk.length
      if (chunkCount <= 3) {
        console.log(`📦 Chunk ${chunkCount} (${chunk.length} chars):`, chunk.substring(0, 50) + "...")
      }
    })

    readStream.on("end", () => {
      console.log(`✅ Stream reading completed: ${chunkCount} chunks, ${totalSize} total chars`)
    })

    readStream.on("error", (err) => {
      console.error("❌ Stream error:", err)
    })
  },
)

// 6. Transform Streams
console.log("\n🔄 Transform Streams:")

const { Transform } = require("stream")

class UpperCaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase())
    callback()
  }
}

setTimeout(() => {
  const readStream = fs.createReadStream(path.join(dataDir, "sample.txt"))
  const writeStream = fs.createWriteStream(path.join(dataDir, "uppercase.txt"))
  const upperCaseTransform = new UpperCaseTransform()

  pipeline(readStream, upperCaseTransform, writeStream, (err) => {
    if (err) {
      console.error("❌ Pipeline error:", err)
    } else {
      console.log("✅ Transform pipeline completed")

      // Read the transformed file
      fs.readFile(path.join(dataDir, "uppercase.txt"), "utf8", (err, data) => {
        if (err) {
          console.error("❌ Read transformed file error:", err)
        } else {
          console.log("✅ Transformed content preview:", data.substring(0, 100) + "...")
        }
      })
    }
  })
}, 500)

// 7. File Watching
console.log("\n👀 File Watching:")

setTimeout(() => {
  const watchFile = path.join(dataDir, "watch-me.txt")

  // Create file to watch
  fs.writeFile(watchFile, "Initial content", (err) => {
    if (err) {
      console.error("❌ Watch file creation error:", err)
      return
    }

    console.log("✅ Watch file created")

    // Watch the file
    const watcher = fs.watch(watchFile, (eventType, filename) => {
      console.log(`👁️ File ${filename} changed: ${eventType}`)
    })

    // Modify the file after a delay
    setTimeout(() => {
      fs.appendFile(watchFile, "\nModified content", (err) => {
        if (err) {
          console.error("❌ File modification error:", err)
        } else {
          console.log("✅ File modified")
        }
      })
    }, 1000)

    // Stop watching after 3 seconds
    setTimeout(() => {
      watcher.close()
      console.log("👁️ File watching stopped")
    }, 3000)
  })
}, 1000)

// 8. Promise-based File Operations
console.log("\n🤝 Promise-based Operations:")

async function promiseFileOperations() {
  try {
    const promiseFile = path.join(dataDir, "promise-file.txt")

    // Write file
    await fs.promises.writeFile(promiseFile, "Content from promises!")
    console.log("✅ Promise file written")

    // Read file
    const data = await fs.promises.readFile(promiseFile, "utf8")
    console.log("✅ Promise file content:", data)

    // Get file stats
    const stats = await fs.promises.stat(promiseFile)
    console.log("✅ Promise file size:", stats.size, "bytes")
  } catch (err) {
    console.error("❌ Promise operation error:", err)
  }
}

setTimeout(promiseFileOperations, 1500)

// 9. Error Handling Examples
console.log("\n🛡️ Error Handling:")

// Try to read non-existent file
fs.readFile("non-existent-file.txt", (err, data) => {
  if (err) {
    console.log("✅ Handled expected error:", err.code)
  }
})

// Try to write to invalid path
fs.writeFile("/invalid/path/file.txt", "content", (err) => {
  if (err) {
    console.log("✅ Handled path error:", err.code)
  }
})

// 10. Cleanup function
function cleanup() {
  console.log("\n🧹 Cleaning up temporary files...")

  const filesToClean = ["sample.txt", "large-file.txt", "uppercase.txt", "watch-me.txt", "promise-file.txt"]

  filesToClean.forEach((file) => {
    const filePath = path.join(dataDir, file)
    fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.error(`❌ Cleanup error for ${file}:`, err.code)
      }
    })
  })
}

// Cleanup on exit
process.on("exit", cleanup)
process.on("SIGINT", () => {
  cleanup()
  process.exit(0)
})
