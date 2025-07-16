# 01 - Node.js Introduction & Architecture

## 🎯 Learning Objectives

- Understand what Node.js is and how it works
- Learn about the V8 engine and Node.js runtime
- Explore the request/response model
- Work with global objects and the module system

## 🧠 What is Node.js?

Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows you to run JavaScript on the server side, outside of a web browser. Created by Ryan Dahl in 2009, Node.js revolutionized server-side development by bringing JavaScript to the backend.

### Key Characteristics:

- **Single-threaded** with event-driven architecture
- **Non-blocking I/O** operations
- **Cross-platform** (Windows, macOS, Linux)
- **NPM ecosystem** with millions of packages
- **High performance** for I/O-intensive applications
- **Scalable** for concurrent connections
- **JavaScript everywhere** - same language for frontend and backend

### Why Use Node.js?

1. **Unified Language**: Use JavaScript for both client and server
2. **Fast Execution**: V8 engine compiles JS to native machine code
3. **Rich Ecosystem**: NPM has the largest package repository
4. **Active Community**: Large, supportive developer community
5. **Corporate Backing**: Supported by major companies (Google, Microsoft, IBM)

### Node.js vs Traditional Server Technologies:

| Feature      | Node.js              | Traditional (Apache/PHP) |
| ------------ | -------------------- | ------------------------ |
| Threading    | Single-threaded      | Multi-threaded           |
| I/O Model    | Non-blocking         | Blocking                 |
| Memory Usage | Lower                | Higher                   |
| Concurrency  | Event-driven         | Thread-based             |
| Best For     | Real-time apps, APIs | Traditional web apps     |

## 🏗️ Node.js Architecture

```
┌─────────────────────────────────────┐
│           Your Application          │
├─────────────────────────────────────┤
│            Node.js APIs             │
├─────────────────────────────────────┤
│              V8 Engine              │
├─────────────────────────────────────┤
│               libuv                 │
│        (Event Loop & I/O)           │
└─────────────────────────────────────┘
```

### Components:

1. **V8 Engine**: Compiles and executes JavaScript
2. **libuv**: Handles event loop, file system, networking
3. **Node.js APIs**: Built-in modules (fs, http, path, etc.)

### Deep Dive into V8 Engine:

The V8 engine is Google's open-source JavaScript engine that powers both Chrome and Node.js. It's written in C++ and provides exceptional performance through:

- **Just-In-Time (JIT) Compilation**: Converts JavaScript to optimized machine code
- **Garbage Collection**: Automatic memory management
- **Hidden Classes**: Optimizes object property access
- **Inline Caching**: Speeds up property access through caching

### Understanding libuv:

libuv is a C library that provides:

- **Event Loop**: Core of Node.js asynchronous architecture
- **Thread Pool**: Handles file system operations and CPU-intensive tasks
- **Asynchronous I/O**: Non-blocking file system, networking, and timers
- **Cross-platform Support**: Abstract layer for OS-specific operations

### Event Loop Phases:

```
┌───────────────────────────┐
┌─>│           timers          │  ← setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  ← I/O callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  ← Internal use
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  ← Fetching new I/O events
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  ← setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  ← Socket close events
   └───────────────────────────┘
```

### Node.js Runtime Environment:

Node.js provides a rich runtime environment with:

- **Built-in Modules**: Core modules like `fs`, `http`, `path`, `crypto`
- **Global Objects**: `global`, `process`, `Buffer`, `console`
- **Module System**: CommonJS for organizing code
- **NPM Integration**: Package management system
- **C++ Addons**: Native module support for performance-critical operations

## 🌍 Global Objects

Node.js provides several global objects available everywhere:

### `__dirname` and `__filename`

- `__dirname`: Current directory path
- `__filename`: Current file path

```javascript
console.log(__dirname); // /home/user/project
console.log(__filename); // /home/user/project/app.js
```

### `process` Object

The `process` object is a global that provides information about the current Node.js process:

- `process.env`: Environment variables
- `process.argv`: Command line arguments
- `process.exit()`: Exit the application
- `process.pid`: Process ID
- `process.platform`: Operating system platform
- `process.version`: Node.js version
- `process.memoryUsage()`: Memory usage statistics

```javascript
// Environment variables
console.log(process.env.NODE_ENV);

// Command line arguments
console.log(process.argv);

// Process information
console.log(`Process ID: ${process.pid}`);
console.log(`Platform: ${process.platform}`);
console.log(`Node.js Version: ${process.version}`);
```

### `console` Object

Enhanced console methods for debugging and logging:

- `console.log()`: Standard output
- `console.error()`: Error output
- `console.warn()`: Warning output
- `console.info()`: Information output
- `console.time()`: Start timer
- `console.timeEnd()`: End timer
- `console.table()`: Display data in table format
- `console.count()`: Count function calls
- `console.clear()`: Clear console

```javascript
console.time("operation");
// Some operation
console.timeEnd("operation");

console.table([
  { name: "John", age: 30 },
  { name: "Jane", age: 25 },
]);
```

### `Buffer` Object

Buffer is a global object for handling binary data:

```javascript
const buf = Buffer.from("Hello World");
console.log(buf); // <Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64>
console.log(buf.toString()); // Hello World
```

### `global` Object

The global namespace object (similar to `window` in browsers):

```javascript
global.myGlobalVar = "Hello World";
console.log(myGlobalVar); // Hello World
```

## 📦 Module System

Node.js uses CommonJS module system:

```javascript
// Exporting
module.exports = {
  name: "John",
  greet: function () {
    return "Hello!";
  },
};

// Importing
const user = require("./user");
console.log(user.greet());
```

### Types of Modules:

1. **Core Modules**: Built-in modules (fs, http, path, etc.)
2. **File Modules**: Your own files
3. **Node Modules**: Third-party packages from NPM

### Module Loading Process:

1. **Core modules**: Loaded first (highest priority)
2. **File modules**: Relative/absolute paths
3. **Node modules**: Searched in node_modules directory

### Module Caching:

Node.js caches modules after first load:

```javascript
console.log("Module executed");
module.exports = { data: "Hello" };

// First require - executes the module
const mod1 = require("./module");

// Second require - uses cached version
const mod2 = require("./module");

console.log(mod1 === mod2); // true
```

### Different Export Patterns:

```javascript
// Single export
module.exports = function () {
  return "Hello";
};

// Multiple exports
module.exports = {
  func1: function () {},
  func2: function () {},
  constant: "value",
};

// Exports shorthand
exports.name = "John";
exports.age = 30;
```

### Module Resolution Algorithm:

When you `require('./module')`, Node.js:

1. Checks if it's a core module
2. If starts with '/', './', '../' - treats as file module
3. Looks for exact file
4. Adds .js extension
5. Looks for directory with package.json
6. Looks for index.js in directory

## 🔄 Request/Response Model

```
Client Request ──→ Node.js Server ──→ Process ──→ Response ──→ Client
     ↑                                                        │
     └────────────── Connection Maintained ──────────────────┘
```

### Event-Driven Architecture:

Node.js follows an event-driven, non-blocking I/O model:

```javascript
const fs = require("fs");

// Non-blocking (asynchronous)
fs.readFile("file.txt", (err, data) => {
  if (err) throw err;
  console.log(data);
});

console.log("This runs first!");
```

### Callbacks vs Promises vs Async/Await:

```javascript
// Callback pattern
fs.readFile("file.txt", (err, data) => {
  if (err) console.error(err);
  else console.log(data);
});

// Promise pattern
const fsPromises = require("fs").promises;
fsPromises
  .readFile("file.txt")
  .then((data) => console.log(data))
  .catch((err) => console.error(err));

// Async/await pattern
async function readFile() {
  try {
    const data = await fsPromises.readFile("file.txt");
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

### HTTP Request/Response Cycle:

```javascript
const http = require("http");

const server = http.createServer((req, res) => {
  // Request object contains:
  // - req.url: requested URL
  // - req.method: HTTP method
  // - req.headers: request headers

  // Response object methods:
  // - res.writeHead(): set status and headers
  // - res.write(): write response body
  // - res.end(): end response

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello World");
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

### Error Handling Patterns:

```javascript
// Error-first callback
function readFile(filename, callback) {
  fs.readFile(filename, (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, data);
    }
  });
}

// Try-catch with async/await
async function safeReadFile(filename) {
  try {
    const data = await fs.promises.readFile(filename);
    return data;
  } catch (error) {
    console.error("Error reading file:", error.message);
    throw error;
  }
}
```

## 🚀 Node.js Performance Characteristics

### Single-Threaded Event Loop:

Node.js uses a single-threaded event loop for handling I/O operations:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                Event Loop                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌────────────┐│
│  │   Timers    │    │ Pending I/O │    │    Poll     │    │   Check    ││
│  │(setTimeout) │──▶│  Callbacks │───▶│   Events    │───▶│(setImmed.) ││
│  └─────────────┘    └─────────────┘    └─────────────┘    └────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Thread Pool:

While the event loop is single-threaded, Node.js uses a thread pool for:

- File system operations
- DNS lookups
- CPU-intensive tasks
- Crypto operations

```javascript
// These operations use thread pool
const fs = require("fs");
const crypto = require("crypto");

fs.readFile("large-file.txt", callback); // Uses thread pool
crypto.pbkdf2("secret", "salt", 100000, 64, "sha512", callback); // Uses thread pool
```

### Memory Management:

Node.js uses V8's garbage collector:

- **Heap**: Where objects are allocated
- **Stack**: Where function calls are tracked
- **Garbage Collection**: Automatic memory cleanup

```javascript
// Memory usage monitoring
console.log(process.memoryUsage());
// Output:
// {
//   rss: 4935680,        // Resident Set Size
//   heapTotal: 1826816,  // Total heap size
//   heapUsed: 650472,    // Used heap size
//   external: 49879      // External memory
// }
```

## 🔧 Node.js Core Modules

### File System (`fs`):

```javascript
const fs = require("fs");

// Synchronous operations (blocking)
const data = fs.readFileSync("file.txt", "utf8");

// Asynchronous operations (non-blocking)
fs.readFile("file.txt", "utf8", (err, data) => {
  if (err) throw err;
  console.log(data);
});
```

### Path Module:

```javascript
const path = require("path");

console.log(path.join("/users", "john", "documents")); // /users/john/documents
console.log(path.resolve("file.txt")); // Absolute path
console.log(path.extname("file.txt")); // .txt
console.log(path.basename("/path/to/file.txt")); // file.txt
```

### URL Module:

```javascript
const url = require("url");

const myUrl = new URL("https://example.com:8080/path?query=value#hash");
console.log(myUrl.hostname); // example.com
console.log(myUrl.pathname); // /path
console.log(myUrl.search); // ?query=value
```

### OS Module:

```javascript
const os = require("os");

console.log(os.platform()); // Operating system platform
console.log(os.arch()); // CPU architecture
console.log(os.cpus()); // CPU information
console.log(os.freemem()); // Free memory
console.log(os.totalmem()); // Total memory
```

## 🎯 Best Practices & Patterns

### Error Handling:

```javascript
// Always handle errors
fs.readFile("file.txt", (err, data) => {
  if (err) {
    console.error("Error reading file:", err.message);
    return;
  }
  // Process data
});

// Use domains for error handling (deprecated, use async_hooks)
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
```

### Performance Optimization:

```javascript
// Avoid blocking the event loop
const crypto = require("crypto");

// Bad: Blocks the event loop
function slowFunction() {
  const start = Date.now();
  while (Date.now() - start < 5000) {
    // Blocking operation
  }
}

// Good: Non-blocking
function fastFunction(callback) {
  setImmediate(() => {
    // Heavy computation
    callback(null, result);
  });
}
```

### Module Design Patterns:

```javascript
// Singleton pattern
let instance;
function createInstance() {
  return { value: Math.random() };
}

module.exports = {
  getInstance() {
    if (!instance) {
      instance = createInstance();
    }
    return instance;
  },
};

// Factory pattern
function createUser(name, email) {
  return {
    name,
    email,
    greet() {
      return `Hello, I'm ${this.name}`;
    },
  };
}

module.exports = { createUser };
```

## 💻 Code Examples

Check out `app.js` for practical examples of:

- Global objects usage
- Module creation and importing
- Basic HTTP server
- File path operations

## ⚠️ Common Errors & Pitfalls

### 1. Module Resolution Issues:

```javascript
// Bad: Incorrect path
const myModule = require("./modules/myModule"); // File doesn't exist

// Good: Check file paths and extensions
const myModule = require("./modules/myModule.js");
```

### 2. Callback Hell:

```javascript
// Bad: Nested callbacks
fs.readFile("file1.txt", (err, data1) => {
  if (err) throw err;
  fs.readFile("file2.txt", (err, data2) => {
    if (err) throw err;
    fs.readFile("file3.txt", (err, data3) => {
      if (err) throw err;
      // Process all data
    });
  });
});

// Good: Use Promises or async/await
async function readFiles() {
  try {
    const [data1, data2, data3] = await Promise.all([
      fs.promises.readFile("file1.txt"),
      fs.promises.readFile("file2.txt"),
      fs.promises.readFile("file3.txt"),
    ]);
    // Process all data
  } catch (err) {
    console.error(err);
  }
}
```

### 3. Memory Leaks:

```javascript
// Bad: Event listeners not removed
const EventEmitter = require("events");
const emitter = new EventEmitter();

function addListener() {
  emitter.on("event", () => {
    // Handler code
  });
}

// Good: Remove listeners
function addListener() {
  const handler = () => {
    // Handler code
  };
  emitter.on("event", handler);

  // Remove when done
  emitter.removeListener("event", handler);
}
```

### 4. Blocking Operations:

```javascript
// Bad: Blocking operations
const data = fs.readFileSync("large-file.txt");

// Good: Non-blocking operations
fs.readFile("large-file.txt", (err, data) => {
  if (err) throw err;
  // Process data
});
```

### 5. Error Handling:

```javascript
// Bad: Unhandled errors
fs.readFile("file.txt", (err, data) => {
  // Process data without checking err
  console.log(data.toString());
});

// Good: Always handle errors
fs.readFile("file.txt", (err, data) => {
  if (err) {
    console.error("Error reading file:", err.message);
    return;
  }
  console.log(data.toString());
});
```

## 🏋️ Practice Exercises

### Beginner Level:

- [ ] Create a module that exports your personal information
- [ ] Build a simple calculator module with add, subtract, multiply, divide
- [ ] Use `process.argv` to accept command line arguments
- [ ] Create a basic HTTP server that responds with "Hello World"
- [ ] Explore different `console` methods and their outputs

### Intermediate Level:

- [ ] Create a file reader module that handles errors gracefully
- [ ] Build a simple event emitter that logs messages
- [ ] Implement a basic timer module using `setTimeout` and `setInterval`
- [ ] Create a module that works with environment variables
- [ ] Build a simple HTTP server that serves different routes

### Advanced Level:

- [ ] Implement a custom module loader with caching
- [ ] Create a performance monitoring module
- [ ] Build a simple middleware system
- [ ] Implement error handling with custom error classes
- [ ] Create a module that demonstrates the event loop phases

## 🔗 Further Learning

### Essential Topics to Explore Next:

1. **Core Modules**: File system, HTTP, path, URL
2. **Express.js**: Web framework for Node.js
3. **Database Integration**: MongoDB, PostgreSQL
4. **Authentication**: JWT, sessions, OAuth
5. **Testing**: Jest, Mocha, Chai
6. **Deployment**: Docker, PM2, cloud platforms

### Recommended Resources:

- [Node.js Official Documentation](https://nodejs.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS)
- [Node.js Design Patterns](https://www.nodejsdesignpatterns.com/)

## 📚 Summary

In this introduction, we covered:

- **What Node.js is**: A JavaScript runtime built on V8 engine
- **Architecture**: V8 engine, libuv, and Node.js APIs
- **Event Loop**: How Node.js handles asynchronous operations
- **Global Objects**: Available objects and their purposes
- **Module System**: CommonJS pattern for code organization
- **Request/Response**: How Node.js handles HTTP communication
- **Performance**: Single-threaded event loop and thread pool
- **Best Practices**: Error handling, security, and optimization
- **Common Pitfalls**: What to avoid when developing with Node.js

Node.js provides a powerful foundation for building scalable network applications. Understanding these core concepts is essential for becoming proficient in Node.js development.
