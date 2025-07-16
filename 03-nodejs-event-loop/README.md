# 03 - Node.js Event Loop & Asynchronous Programming

## 🎯 Learning Objectives

- Understand the Node.js Event Loop architecture
- Master asynchronous programming patterns
- Work with callbacks, promises, and async/await
- Handle non-blocking I/O operations effectively

## 🔄 The Event Loop

The Event Loop is the heart of Node.js that enables non-blocking I/O operations despite JavaScript being single-threaded.

### Event Loop Phases:

```
┌───────────────────────────┐
┌─>│ timers │ ← setTimeout, setInterval
│ └─────────────┬─────────────┘
│ ┌─────────────┴─────────────┐
│ │ pending callbacks │ ← I/O callbacks
│ └─────────────┬─────────────┘
│ ┌─────────────┴─────────────┐
│ │ idle, prepare │ ← Internal use
│ └─────────────┬─────────────┘
│ ┌─────────────┴─────────────┐
│ │ poll │ ← Fetch new I/O events
│ └─────────────┬─────────────┘
│ ┌─────────────┴─────────────┐
│ │ check │ ← setImmediate callbacks
│ └─────────────┬─────────────┘
│ ┌─────────────┴─────────────┐
└──┤ close callbacks │ ← close event callbacks
└───────────────────────────┘
```

## ⚡ Asynchronous Patterns

### 1. Callbacks (Traditional)

```javascript
fs.readFile("file.txt", (err, data) => {
  if (err) throw err;
  console.log(data);
});
```

### 2. Promises (ES6)

```javascript
const readFile = util.promisify(fs.readFile);
readFile("file.txt")
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
```

### 3. Async/Await (ES2017)

```javascript
async function readFileAsync() {
  try {
    const data = await readFile("file.txt");
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

## 🎭 Event Loop Priorities

### Execution Order:

1. **Synchronous code** (highest priority)
2. **process.nextTick()** callbacks
3. **Promise** callbacks (microtasks)
4. **setImmediate()** callbacks
5. **setTimeout()/setInterval()** callbacks

```javascript
console.log("1");
setTimeout(() => console.log("2"), 0);
process.nextTick(() => console.log("3"));
Promise.resolve().then(() => console.log("4"));
console.log("5");

// Output: 1, 5, 3, 4, 2
```

## 🚫 Blocking vs Non-Blocking

### Blocking (Synchronous):

```javascript
const data = fs.readFileSync("large-file.txt"); // Blocks entire process
console.log("This waits for file read");
```

### Non-Blocking (Asynchronous):

```javascript
fs.readFile("large-file.txt", (err, data) => {
  // Callback executed when ready
});
console.log("This executes immediately");
```

## 🔧 Working with Events

Node.js is built around events. Many objects emit events:

```javascript
const EventEmitter = require("events");

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

myEmitter.on("event", () => {
  console.log("An event occurred!");
});

myEmitter.emit("event");
```

## 🎯 Best Practices

1. **Avoid Blocking Operations**: Use async versions of functions
2. **Handle Errors**: Always handle errors in callbacks and promises
3. **Use Promises/Async-Await**: Modern and cleaner than callbacks
4. **Don't Block the Event Loop**: Keep operations fast
5. **Use process.nextTick() Sparingly**: Can starve the event loop

## 🌊 Streams and I/O

Node.js streams provide an efficient way to handle large amounts of data:

```javascript
const { Readable, Writable, Transform } = require('stream');

// Transform stream example
class UpperCaseTransform extends Transform {
\_transform(chunk, encoding, callback) {
callback(null, chunk.toString().toUpperCase());
}
}

fs.createReadStream('input.txt')
.pipe(new UpperCaseTransform())
.pipe(fs.createWriteStream('output.txt'));
```

## 🧵 Worker Threads

For CPU-intensive tasks, use worker threads to avoid blocking the main thread:

```javascript
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
// Main thread
const worker = new Worker(\_\_filename);
worker.postMessage({ task: 'heavy-computation' });
} else {
// Worker thread
parentPort.on('message', ({ task }) => {
// CPU-intensive work here
const result = heavyComputation();
parentPort.postMessage(result);
});
}
```

## 📊 Performance Monitoring

Monitor your application's performance:

```javascript
const { performance } = require('perf_hooks');

// Event loop lag detection
function measureEventLoopLag() {
const start = process.hrtime.bigint();
setImmediate(() => {
const lag = Number(process.hrtime.bigint() - start) / 1000000;
console.log(\`Event loop lag: \${lag.toFixed(2)}ms\`);
});
}
```

## 💻 Code Examples

### Main Application:

- **`app.js`** - Core event loop and async patterns demonstration
  - Event loop phases visualization
  - Callback, Promise, and async/await patterns
  - Event emitter usage
  - File operations (blocking vs non-blocking)
  - Concurrent operations handling
  - Error handling patterns

### Basic Examples:

- **`examples/basics/callback-hell.js`** - Callback hell problems and solutions

  - Demonstrates the "pyramid of doom" problem
  - Shows Promise chain solutions
  - Provides async/await alternatives
  - Compares readability and maintainability

- **`examples/basics/event-emitter-advanced.js`** - Advanced event emitter patterns
  - Custom EventEmitter classes
  - Error handling in event emitters
  - Memory leak prevention
  - Event listener management
  - Real-world task management example

### Advanced Examples:

- **`examples/advanced/event-loop-visualization.js`** - Interactive event loop demonstration

  - Visual representation of execution order
  - Microtasks vs macrotasks priority
  - Synchronous vs asynchronous execution
  - Phase-by-phase event loop breakdown

- **`examples/advanced/worker-threads.js`** - CPU-intensive task handling
  - Blocking vs non-blocking demonstrations
  - Worker thread creation and management
  - Inter-thread communication
  - Performance comparisons
  - Prime number and Fibonacci calculations

### Streams Examples:

- **`examples/streams/streams-demo.js`** - Comprehensive streams examples
  - Custom Readable, Writable, and Transform streams
  - File processing with streams
  - Backpressure handling
  - Object mode streams
  - Pipeline usage for better error handling

### Performance Examples:

- **`examples/performance/performance-monitoring.js`** - Performance monitoring tools
  - Event loop lag detection
  - CPU and memory usage monitoring
  - Performance hooks usage
  - Garbage collection monitoring
  - Event loop utilization tracking

### Real-World Examples:

- **`examples/real-world/async-file-processor.js`** - Real-world async file processing
  - Concurrent file processing with controlled concurrency
  - Stream processing for large files
  - Backup creation and cleanup
  - Error handling and reporting
  - Graceful shutdown patterns

## ⚠️ Common Pitfalls

1. **Callback Hell**: Nested callbacks become hard to read
2. **Unhandled Promise Rejections**: Always catch promise errors
3. **Blocking the Event Loop**: CPU-intensive tasks block everything
4. **Memory Leaks**: Event listeners not properly removed
5. **Improper Error Handling**: Not handling async errors correctly
6. **Not Using Streams**: Loading large files entirely into memory
7. **Ignoring Backpressure**: Not handling slow consumers properly
8. **Missing Performance Monitoring**: Not detecting event loop lag

## 🔧 Advanced Topics

### Memory Management:

- Garbage collection impact on event loop
- Memory leak detection and prevention
- Proper cleanup of resources

### Performance Optimization:

- Event loop lag monitoring
- CPU profiling and optimization
- Memory usage optimization

### Scaling Patterns:

- Cluster module for multi-process scaling
- Load balancing strategies
- Horizontal scaling considerations

## 🏋️ Practice Exercises

### Beginner:

- [ ] Create a custom EventEmitter class with multiple event types
- [ ] Convert callback-based functions to promises
- [ ] Demonstrate event loop phases with timers
- [ ] Build a simple async file reader

### Intermediate:

- [ ] Build a concurrent file processor with controlled concurrency
- [ ] Create custom readable and writable streams
- [ ] Implement event loop lag monitoring
- [ ] Handle multiple concurrent async operations with proper error handling

### Advanced:

- [ ] Build a worker thread pool for CPU-intensive tasks
- [ ] Create a real-time performance monitoring dashboard
- [ ] Implement backpressure handling in custom streams
- [ ] Build a memory-efficient large file processor
- [ ] Create a cluster-based scaling solution

## 📊 Performance Best Practices

1. **Monitor Event Loop Lag**: Keep it under 10ms
2. **Use Streams for Large Data**: Avoid loading everything into memory
3. **Implement Proper Error Handling**: Catch all async errors
4. **Use Worker Threads for CPU Tasks**: Keep main thread responsive
5. **Control Concurrency**: Don't overwhelm resources
6. **Profile Memory Usage**: Detect and fix memory leaks
7. **Use Performance Hooks**: Measure critical operations
8. **Implement Graceful Shutdown**: Clean up resources properly

## 📁 Project Structure

```
03-nodejs-event-loop/
├── app.js                           # Main demo application
├── examples/
│   ├── basics/
│   │   ├── callbackHell.js                 # Callback patterns and solutions
│   │   └── eventEmitterAdvanced.js         # Advanced event emitter patterns
│   ├── advanced/
│   │   ├── eventLoopVisualization.js       # Interactive event loop demo
│   │   └── workerThreads.js                # CPU-intensive task handling
│   ├── streams/
│   │   └── streamsDemo.js                  # Comprehensive streams examples
│   ├── performance/
│   │   └── performanceMonitoring.js        # Performance monitoring tools
│   └── real-world/
│       └── asyncFileProcessor.js           # Real-world async patterns
├── package.json                     # Project configuration and scripts
└── README.md                        # This documentation
```

## 🚀 Getting Started

1. **Run the main demo**: `npm start`
2. **Explore specific examples**: `npm run examples` (shows all available scripts)
3. **Study the code**: Each example is well-commented and demonstrates specific concepts
4. **Practice**: Try modifying the examples to experiment with different patterns

## 📚 Summary

Master the Node.js event loop and asynchronous programming patterns to build efficient, scalable applications. This module provides comprehensive coverage from basic concepts to advanced patterns.

**Key Takeaways:**

- Master the event loop to write efficient async code
- Use promises and async/await for better error handling
- Leverage streams for memory-efficient data processing
- Monitor performance to detect bottlenecks
- Use worker threads for CPU-intensive tasks
- Implement proper error handling and cleanup

Keep practicing with these patterns and refer back to the code examples as you build more complex applications!

---

_This module provides comprehensive coverage of Node.js event loop and asynchronous programming patterns. Practice with the examples and experiment with different approaches to master async programming in Node.js._
