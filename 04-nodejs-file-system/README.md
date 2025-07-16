# 04 - Node.js File System, Streams & Buffers

## 🎯 Learning Objectives

- Master file system operations (sync and async)
- Understand streams for handling large data
- Work with buffers for binary data
- Implement file watching and directory operations

## 📁 File System Module

The `fs` module provides an API for interacting with the file system.

### Synchronous vs Asynchronous

```javascript
// Synchronous (blocking)
const data = fs.readFileSync("file.txt", "utf8");

// Asynchronous (non-blocking)
fs.readFile("file.txt", "utf8", (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Promise-based (modern)
const data = await fs.promises.readFile("file.txt", "utf8");
```

## 🌊 Streams

Streams are objects that let you read data from a source or write data to a destination in continuous fashion.

### Types of Streams:

1. **Readable**: Read data from source
2. **Writable**: Write data to destination
3. **Duplex**: Both readable and writable
4. **Transform**: Modify data as it passes through

```
Source ──→ Readable Stream ──→ Transform Stream ──→ Writable Stream ──→ Destination
```

### Stream Benefits:

- **Memory Efficient**: Process data chunk by chunk
- **Time Efficient**: Start processing before all data is available
- **Composable**: Chain streams together

## 📦 Buffers

Buffers handle binary data in Node.js (before strings, after bytes).

```javascript
// Create buffers
const buf1 = Buffer.from("Hello");
const buf2 = Buffer.alloc(10);
const buf3 = Buffer.allocUnsafe(10);

// Buffer operations
buf1.toString(); // Convert to string
buf1.length; // Buffer length
Buffer.concat([buf1, buf2]); // Concatenate buffers
```

## 📂 Common File Operations

### Reading Files:

```javascript
// Read entire file
fs.readFile("file.txt", "utf8", callback);

// Read file stream (for large files)
const readStream = fs.createReadStream("large-file.txt");
```

### Writing Files:

```javascript
// Write entire file
fs.writeFile("file.txt", "content", callback);

// Write file stream
const writeStream = fs.createWriteStream("output.txt");
```

### File Information:

```javascript
fs.stat("file.txt", (err, stats) => {
  console.log(stats.isFile());
  console.log(stats.isDirectory());
  console.log(stats.size);
  console.log(stats.mtime);
});
```

## 👀 File Watching

Monitor file system changes:

```javascript
// Watch single file
fs.watchFile("file.txt", (curr, prev) => {
  console.log("File changed");
});

// Watch directory
fs.watch("directory", (eventType, filename) => {
  console.log(`Event: ${eventType}, File: ${filename}`);
});
```

## 🗂️ Directory Operations

```javascript
// Create directory
fs.mkdir("new-dir", { recursive: true }, callback);

// Read directory
fs.readdir("directory", (err, files) => {
  console.log(files);
});

// Remove directory
fs.rmdir("directory", { recursive: true }, callback);
```

## 💻 Code Examples

Check out `app.js` for practical examples of:

- File reading and writing operations
- Stream processing for large files
- Buffer manipulation and conversion
- Directory operations and file watching
- Error handling patterns

## ⚠️ Common Pitfalls

1. **Memory Issues**: Reading large files entirely into memory
2. **Path Issues**: Use `path.join()` for cross-platform compatibility
3. **Error Handling**: Always handle file operation errors
4. **File Permissions**: Check file permissions before operations
5. **Stream Errors**: Handle stream error events

## 🏋️ Practice

- [ ] Create a file backup utility using streams
- [ ] Build a directory tree scanner
- [ ] Implement a file watcher that logs changes
- [ ] Create a CSV parser using transform streams
- [ ] Build a file compression utility

```

```
