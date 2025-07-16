# 02 - Node.js Core Modules

## 🎯 Learning Objectives

- Master essential Node.js built-in modules
- Work with path, os, and url modules
- Handle different data types and utilities
- Understand basic cryptographic operations
- Learn event-driven programming basics

## 📚 Core Modules Overview

Node.js comes with many built-in modules that provide essential functionality without requiring external dependencies. This module focuses on the **most important** ones for beginners and intermediate developers.

### Essential Core Modules (Covered in this module):

- **path**: File path utilities and cross-platform path handling
- **os**: Operating system utilities and information
- **url**: URL parsing and formatting
- **crypto**: Basic cryptographic functionality (hashing, UUIDs)
- **util**: Utility functions for debugging and formatting
- **events**: Event emitter for asynchronous programming
- **buffer**: Binary data handling
- **querystring**: URL query string parsing
- **timers**: Scheduling functions (setTimeout, setInterval)

### Why These Modules Matter:

- **No Installation Required**: Built into Node.js
- **Foundation Skills**: Used in most Node.js applications
- **Cross-Platform**: Work consistently across operating systems
- **Performance**: Optimized C++ implementations

## 🛤️ Path Module

The `path` module provides utilities for working with file and directory paths in a cross-platform way.

```javascript
const path = require("path");

// Join paths (handles separators correctly)
path.join("/users", "john", "documents"); // '/users/john/documents'
path.join("C:", "Users", "John"); // 'C:\Users\John' (Windows)

// Get file extension
path.extname("file.txt"); // '.txt'
path.extname("document.pdf"); // '.pdf'

// Get filename
path.basename("/path/to/file.txt"); // 'file.txt'
path.basename("/path/to/file.txt", ".txt"); // 'file'

// Get directory
path.dirname("/path/to/file.txt"); // '/path/to'

// Parse path into components
path.parse("/home/user/documents/file.txt");
// Returns: { root: '/', dir: '/home/user/documents', base: 'file.txt', ext: '.txt', name: 'file' }

// Check if path is absolute
path.isAbsolute("/users/john"); // true
path.isAbsolute("./file.txt"); // false
```

### Platform Differences:
```javascript
// Path separators
path.sep; // '/' on POSIX, '\' on Windows
path.delimiter; // ':' on POSIX, ';' on Windows
```

## 💻 OS Module

The `os` module provides operating system-related utilities and information.

```javascript
const os = require("os");

// Basic system info
os.platform(); // 'darwin', 'win32', 'linux', etc.
os.arch(); // 'x64', 'arm64', 'ia32', etc.
os.hostname(); // Computer hostname
os.uptime(); // System uptime in seconds

// User information
os.homedir(); // User home directory
os.tmpdir(); // Temporary directory

// Hardware information
os.cpus(); // Array of CPU information
os.cpus().length; // Number of CPU cores
os.totalmem(); // Total system memory in bytes
os.freemem(); // Free system memory in bytes

// Memory usage in human-readable format
function formatMemory(bytes) {
  const gb = bytes / 1024 / 1024 / 1024;
  return gb.toFixed(2) + " GB";
}

console.log("Total Memory:", formatMemory(os.totalmem()));
console.log("Free Memory:", formatMemory(os.freemem()));
```

## 🔗 URL Module

The `url` module provides URL parsing and formatting utilities.

```javascript
const url = require("url");

// Parse URL
const myUrl = new URL("https://api.example.com:8080/users/123?active=true&sort=name#profile");

// URL components
myUrl.protocol; // 'https:'
myUrl.hostname; // 'api.example.com'
myUrl.port; // '8080'
myUrl.pathname; // '/users/123'
myUrl.search; // '?active=true&sort=name'
myUrl.hash; // '#profile'

// Working with query parameters
myUrl.searchParams.get("active"); // 'true'
myUrl.searchParams.set("limit", "10");
myUrl.searchParams.delete("sort");

// URL Search Params
const params = new URLSearchParams("name=john&age=30&city=new%20york");
params.get("name"); // 'john'
params.has("age"); // true
params.toString(); // 'name=john&age=30&city=new%20york'
```

## 🔐 Crypto Module

The `crypto` module provides basic cryptographic functionality for secure applications.

```javascript
const crypto = require("crypto");

// Generate random data
crypto.randomBytes(16).toString("hex"); // Random hex string
crypto.randomBytes(16).toString("base64"); // Random base64 string

// Generate UUID
crypto.randomUUID(); // 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

// Generate random integers
crypto.randomInt(1, 100); // Random integer between 1 and 99

// Create hash
const hash = crypto.createHash("sha256");
hash.update("Hello World");
const result = hash.digest("hex");

// One-liner hash
crypto.createHash("sha256").update("Hello World").digest("hex");

// HMAC (Hash-based Message Authentication Code)
const hmac = crypto.createHmac("sha256", "secret-key");
hmac.update("Hello World");
const hmacResult = hmac.digest("hex");
```

## 🛠️ Util Module

The `util` module provides utility functions for debugging, formatting, and working with objects.

```javascript
const util = require("util");

// Inspect objects with detailed formatting
const complexObject = {
  name: "John",
  age: 30,
  hobbies: ["reading", "coding"],
  address: { street: "123 Main St", city: "New York" },
};

util.inspect(complexObject); // Formatted object string
util.inspect(complexObject, { colors: true }); // With colors
util.inspect(complexObject, { depth: null }); // Show all levels

// Format strings (similar to printf)
util.format("Hello %s", "World"); // 'Hello World'
util.format("Number: %d", 42); // 'Number: 42'
util.format("User %s is %d years old", "John", 30); // 'User John is 30 years old'
```

## 🔤 QueryString Module

The `querystring` module provides utilities for parsing and formatting URL query strings.

```javascript
const querystring = require("querystring");

// Parse query string
const parsed = querystring.parse("name=john&age=30&city=new%20york");
// Result: { name: 'john', age: '30', city: 'new york' }

// Stringify object to query string
const obj = { name: "jane", age: 25, city: "los angeles" };
querystring.stringify(obj); // 'name=jane&age=25&city=los%20angeles'

// Escape and unescape
querystring.escape("hello world!"); // 'hello%20world!'
querystring.unescape("hello%20world!"); // 'hello world!'
```

## ⚡ Events Module

The `events` module provides an event emitter for implementing the observer pattern.

```javascript
const EventEmitter = require("events");

// Create event emitter
const emitter = new EventEmitter();

// Add listeners
emitter.on("message", (data) => {
  console.log("Received:", data);
});

// Emit events
emitter.emit("message", "Hello World");

// One-time listeners
emitter.once("startup", () => {
  console.log("App started - this will only run once");
});

// Remove listeners
const handler = (data) => console.log(data);
emitter.on("test", handler);
emitter.removeListener("test", handler);
```

## 📦 Buffer Module (Global)

Buffer is a global object for handling binary data.

```javascript
// Create buffers
const buf1 = Buffer.alloc(10); // Create 10-byte buffer filled with zeros
const buf2 = Buffer.from("Hello World", "utf8"); // From string

// Convert to string
buf2.toString(); // 'Hello World'
buf2.toString("hex"); // '48656c6c6f20576f726c64'
buf2.toString("base64"); // 'SGVsbG8gV29ybGQ='

// Write to buffer
const buf = Buffer.alloc(20);
buf.write("Hello", 0, "utf8"); // Write 'Hello' at position 0
buf.write(" World", 5, "utf8"); // Write ' World' at position 5
```

## ⏰ Timers Module (Global)

Timer functions for scheduling code execution.

```javascript
// setTimeout - execute once after delay
const timeoutId = setTimeout(() => {
  console.log("Executed after 1 second");
}, 1000);

// setInterval - execute repeatedly
const intervalId = setInterval(() => {
  console.log("Executed every 2 seconds");
}, 2000);

// setImmediate - execute in next iteration of event loop
setImmediate(() => {
  console.log("Executed immediately");
});

// Clear timers
clearTimeout(timeoutId);
clearInterval(intervalId);
```

## 💻 Code Examples in This Module

This module contains practical examples you can run and study:

### Main Application (`app.js`):
Run `node app.js` to see all modules in action:
- **Path Module**: File path operations and parsing
- **OS Module**: System information and memory usage
- **URL Module**: URL parsing and search parameters
- **Crypto Module**: UUID generation, hashing, and HMAC
- **Util Module**: Object inspection and string formatting
- **QueryString Module**: Query string parsing and encoding
- **Events Module**: Basic event emitter usage
- **Timers**: setTimeout and setImmediate examples
- **Buffer Module**: Buffer creation and encoding
- **Module Info**: Basic module properties

### Utility Classes:

#### `utils/fileUtils.js` - File Operations:
```javascript
const FileUtils = require('./utils/fileUtils');

// Get file information
const info = FileUtils.getFileInfo('./package.json');
console.log(info); // { fullPath, directory, filename, extension, basename, isAbsolute }

// Join paths safely
const path = FileUtils.joinPaths('uploads', 'images', 'photo.jpg');

// Change file extension
const newFile = FileUtils.changeExtension('document.txt', '.pdf');

// Get file size
const size = FileUtils.getFileSize('./package.json');
console.log(size); // { bytes, kb, mb }
```

#### `utils/systemInfo.js` - System Information:
```javascript
const SystemInfo = require('./utils/systemInfo');

// Basic system info
console.log(SystemInfo.getBasicInfo());

// Memory information
console.log(SystemInfo.getMemoryInfo());

// CPU information
console.log(SystemInfo.getCPUInfo());

// Full system report
console.log(SystemInfo.getFullReport());
```

## ⚠️ Common Beginner Mistakes

### 1. Path Separators:
```javascript
// ❌ Wrong - Won't work on all platforms
const filePath = __dirname + '/files/' + filename;

// ✅ Correct - Cross-platform
const filePath = path.join(__dirname, 'files', filename);
```

### 2. Weak Random Numbers:
```javascript
// ❌ Wrong - Not secure
const id = Math.random().toString();

// ✅ Correct - Cryptographically secure
const id = crypto.randomUUID();
```

### 3. Buffer Encoding:
```javascript
// ❌ Wrong - Might not display correctly
const buf = Buffer.from('Hello 世界');

// ✅ Correct - Explicit encoding
const buf = Buffer.from('Hello 世界', 'utf8');
```

### 4. URL Parsing:
```javascript
// ❌ Wrong - No error handling
const url = new URL(userInput);

// ✅ Correct - Safe parsing
function parseURL(input) {
  try {
    return new URL(input);
  } catch (error) {
    console.error('Invalid URL:', input);
    return null;
  }
}
```

## 🏋️ Practice Exercises

### For Beginners:
- [ ] Run `node app.js` and understand each output
- [ ] Modify the FileUtils class to add a new method
- [ ] Create a simple system monitor using SystemInfo
- [ ] Build a URL parser for command line arguments
- [ ] Generate and format different types of random data

### For Intermediate:
- [ ] Build a file organizer using path operations
- [ ] Create a real-time system monitoring tool
- [ ] Implement a simple URL shortener
- [ ] Build an event-driven logging system
- [ ] Create a configuration file manager

## 🎯 What You've Learned

After completing this module, you now understand:

- **Path Module**: Cross-platform file path handling
- **OS Module**: Getting system information and monitoring resources
- **URL Module**: Parsing and working with URLs
- **Crypto Module**: Basic security operations (hashing, UUIDs, random data)
- **Util Module**: Debugging and object inspection
- **Events Module**: Basic event-driven programming
- **Buffer Module**: Working with binary data
- **QueryString Module**: URL parameter handling
- **Timers**: Scheduling code execution

## 🚀 Next Steps

Continue your Node.js journey with:

1. **File System (fs)** - Reading and writing files
2. **HTTP Module** - Building web servers
3. **Express.js** - Web application framework
4. **Database Integration** - Working with databases
5. **Authentication** - User login and security

## 📚 Summary

These core modules are the foundation of Node.js development. They provide essential functionality that you'll use in almost every Node.js application. The examples in this module show practical usage patterns that you can apply in real projects.

**Key Takeaways:**
- Always use `path.join()` for file paths
- Use `crypto` module for secure random data
- `util.inspect()` is great for debugging objects
- `os` module helps with system information
- Event emitters enable asynchronous programming

Keep practicing with these modules and refer back to the code examples as you build more complex applications!

---

*Practice with the examples in this module and experiment with the utility classes to deepen your understanding of Node.js core modules.*
- [Node.js Best Practices](https://nodejs.dev/learn)
- [Security Best Practices for Node.js](https://nodejs.org/en/security/)

---

_This module provides the foundation for understanding Node.js core functionality. Practice with the examples and build upon these concepts to create robust applications._
