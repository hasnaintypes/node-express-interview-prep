# 11 - Backend Interview Preparation Guide

## 🎯 Overview

This comprehensive guide covers everything you need to know for backend development interviews, from fundamental concepts to advanced system design questions.

## 📚 Table of Contents

1. [JavaScript Fundamentals](#javascript-fundamentals)
2. [Node.js Core Concepts](#nodejs-core-concepts)
3. [Express.js Framework](#expressjs-framework)
4. [Database & Data Modeling](#database--data-modeling)
5. [API Design & REST](#api-design--rest)
6. [Authentication & Security](#authentication--security)
7. [System Design](#system-design)
8. [Performance & Optimization](#performance--optimization)
9. [Testing](#testing)
10. [DevOps & Deployment](#devops--deployment)
11. [Coding Challenges](#coding-challenges)
12. [Behavioral Questions](#behavioral-questions)

---

## 🟨 JavaScript Fundamentals

### Q: Explain the difference between `var`, `let`, and `const`

**Answer:**
- **`var`**: Function-scoped, hoisted, can be redeclared
- **`let`**: Block-scoped, hoisted but not initialized, cannot be redeclared
- **`const`**: Block-scoped, hoisted but not initialized, cannot be redeclared or reassigned

```javascript
// var example
function varExample() {
  if (true) {
    var x = 1;
  }
  console.log(x); // 1 (accessible outside block)
}

// let example
function letExample() {
  if (true) {
    let y = 1;
  }
  console.log(y); // ReferenceError: y is not defined
}

// const example
const z = 1;
z = 2; // TypeError: Assignment to constant variable
```

### Q: What is the Event Loop in JavaScript?

**Answer:**
The Event Loop is a mechanism that handles asynchronous operations in JavaScript's single-threaded environment.

**Components:**
1. **Call Stack**: Executes synchronous code
2. **Web APIs**: Handle async operations (setTimeout, HTTP requests)
3. **Callback Queue**: Stores completed async callbacks
4. **Event Loop**: Moves callbacks from queue to stack when stack is empty

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');

// Output: 1, 4, 3, 2
// Explanation: Promises have higher priority than setTimeout
```

### Q: Explain Promises and async/await

**Answer:**
Promises represent eventual completion of asynchronous operations.

```javascript
// Promise example
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('Data fetched');
    }, 1000);
  });
}

// Using .then()
fetchData()
  .then(data => console.log(data))
  .catch(error => console.error(error));

// Using async/await
async function getData() {
  try {
    const data = await fetchData();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

### Q: What is closure in JavaScript?

**Answer:**
A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.

```javascript
function outerFunction(x) {
  return function innerFunction(y) {
    return x + y; // Has access to 'x' from outer scope
  };
}

const addFive = outerFunction(5);
console.log(addFive(3)); // 8
```

---

## 🟩 Node.js Core Concepts

### Q: What is Node.js and how does it work?

**Answer:**
Node.js is a JavaScript runtime built on Chrome's V8 engine that allows JavaScript to run on the server side.

**Key Features:**
- **Single-threaded**: Uses one main thread with event loop
- **Non-blocking I/O**: Asynchronous operations don't block execution
- **Event-driven**: Uses events and callbacks for handling operations
- **Cross-platform**: Runs on Windows, macOS, Linux

### Q: Explain the difference between process.nextTick() and setImmediate()

**Answer:**
Both schedule callbacks, but with different priorities:

```javascript
console.log('start');

setImmediate(() => console.log('setImmediate'));
process.nextTick(() => console.log('nextTick'));

console.log('end');

// Output: start, end, nextTick, setImmediate
// nextTick has higher priority than setImmediate
```

### Q: What are Streams in Node.js?

**Answer:**
Streams are objects that handle reading/writing data in chunks rather than loading everything into memory.

**Types:**
1. **Readable**: Read data from source
2. **Writable**: Write data to destination
3. **Duplex**: Both readable and writable
4. **Transform**: Modify data as it passes through

```javascript
const fs = require('fs');

// Reading large file with streams
const readStream = fs.createReadStream('large-file.txt');
const writeStream = fs.createWriteStream('output.txt');

readStream.pipe(writeStream);
```

### Q: How does Node.js handle child processes?

**Answer:**
Node.js provides several ways to create child processes:

```javascript
const { spawn, exec, fork } = require('child_process');

// spawn - for long-running processes
const ls = spawn('ls', ['-la']);

// exec - for shell commands
exec('ls -la', (error, stdout, stderr) => {
  console.log(stdout);
});

// fork - for Node.js scripts
const child = fork('child-script.js');
child.send({ message: 'Hello child' });
```

---

## 🟦 Express.js Framework

### Q: What is middleware in Express.js?

**Answer:**
Middleware functions have access to request, response objects and the next middleware function in the request-response cycle.

```javascript
// Application-level middleware
app.use((req, res, next) => {
  console.log('Time:', Date.now());
  next();
});

// Route-specific middleware
app.get('/protected', authenticateUser, (req, res) => {
  res.send('Protected route');
});

function authenticateUser(req, res, next) {
  // Authentication logic
  if (req.headers.authorization) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}
```

### Q: How do you handle errors in Express.js?

**Answer:**
Express has built-in error handling, but you can create custom error middleware:

```javascript
// Error handling middleware (must have 4 parameters)
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).send('Something broke!');
  } else {
    res.status(500).json({
      message: err.message,
      stack: err.stack
    });
  }
});

// Async error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/async-route', asyncHandler(async (req, res) => {
  const data = await someAsyncOperation();
  res.json(data);
}));
```

### Q: Explain the difference between app.use() and app.get()

**Answer:**
- **`app.use()`**: Mounts middleware for all HTTP methods
- **`app.get()`**: Handles only GET requests for specific routes

```javascript
// app.use() - applies to all methods
app.use('/api', (req, res, next) => {
  console.log('API middleware');
  next();
});

// app.get() - only for GET requests
app.get('/users', (req, res) => {
  res.json(users);
});
```

---

## 🟪 Database & Data Modeling

### Q: What's the difference between SQL and NoSQL databases?

**Answer:**

| Aspect | SQL | NoSQL |
|--------|-----|-------|
| **Structure** | Structured, tables with rows/columns | Flexible, documents/key-value/graph |
| **Schema** | Fixed schema | Dynamic schema |
| **ACID** | Full ACID compliance | Eventual consistency |
| **Scaling** | Vertical scaling | Horizontal scaling |
| **Examples** | PostgreSQL, MySQL | MongoDB, Redis, Cassandra |

### Q: Explain database indexing

**Answer:**
Indexes improve query performance by creating shortcuts to data:

```sql
-- Create index
CREATE INDEX idx_user_email ON users(email);

-- Composite index
CREATE INDEX idx_user_name_age ON users(name, age);

-- Unique index
CREATE UNIQUE INDEX idx_user_username ON users(username);
```

**Types:**
- **B-tree**: Default, good for equality and range queries
- **Hash**: Fast equality lookups
- **GIN/GiST**: For complex data types (arrays, JSON)

### Q: What are database transactions and ACID properties?

**Answer:**
Transactions ensure data integrity through ACID properties:

- **Atomicity**: All operations succeed or all fail
- **Consistency**: Database remains in valid state
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed changes persist

```javascript
// Transaction example with Node.js
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [100, 1]);
  await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [100, 2]);
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

---

## 🟧 API Design & REST

### Q: What are RESTful API principles?

**Answer:**
REST (Representational State Transfer) principles:

1. **Stateless**: Each request contains all needed information
2. **Client-Server**: Separation of concerns
3. **Cacheable**: Responses should be cacheable
4. **Uniform Interface**: Consistent resource identification
5. **Layered System**: Architecture can have multiple layers

```javascript
// RESTful routes example
GET    /api/users          // Get all users
GET    /api/users/123      // Get specific user
POST   /api/users          // Create new user
PUT    /api/users/123      // Update entire user
PATCH  /api/users/123      // Partial update
DELETE /api/users/123      // Delete user
```

### Q: How do you handle API versioning?

**Answer:**
Common versioning strategies:

```javascript
// URL versioning
app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

// Header versioning
app.use((req, res, next) => {
  const version = req.headers['api-version'] || 'v1';
  req.apiVersion = version;
  next();
});

// Query parameter versioning
app.get('/api/users', (req, res) => {
  const version = req.query.version || 'v1';
  if (version === 'v2') {
    // Handle v2 logic
  }
});
```

### Q: What are HTTP status codes and when to use them?

**Answer:**

| Code | Meaning | Use Case |
|------|---------|----------|
| **200** | OK | Successful GET, PUT, PATCH |
| **201** | Created | Successful POST |
| **204** | No Content | Successful DELETE |
| **400** | Bad Request | Invalid request data |
| **401** | Unauthorized | Authentication required |
| **403** | Forbidden | Access denied |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Resource conflict |
| **422** | Unprocessable Entity | Validation errors |
| **500** | Internal Server Error | Server error |

---

## 🔐 Authentication & Security

### Q: Explain JWT (JSON Web Tokens)

**Answer:**
JWT is a compact way to securely transmit information between parties.

**Structure:** `header.payload.signature`

```javascript
// JWT creation
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: 123, role: 'user' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// JWT verification
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**Pros:**
- Stateless
- Self-contained
- Cross-domain support

**Cons:**
- Cannot be revoked easily
- Larger than session IDs
- Vulnerable if secret is compromised

### Q: How do you secure an API?

**Answer:**
Security measures:

1. **Authentication & Authorization**
```javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied');
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = user;
    next();
  });
};
```

2. **Input Validation**
```javascript
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

3. **Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

4. **Security Headers**
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### Q: What's the difference between authentication and authorization?

**Answer:**
- **Authentication**: Verifying who the user is (login)
- **Authorization**: Verifying what the user can do (permissions)

```javascript
// Authentication middleware
const authenticate = (req, res, next) => {
  // Verify user identity
  const user = verifyToken(req.headers.authorization);
  if (!user) return res.status(401).send('Unauthenticated');
  req.user = user;
  next();
};

// Authorization middleware
const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).send('Unauthorized');
  }
  next();
};

// Usage
app.get('/admin', authenticate, authorize(['admin']), (req, res) => {
  res.send('Admin only content');
});
```

---

## 🏗️ System Design

### Q: How would you design a URL shortener like bit.ly?

**Answer:**

**Requirements:**
- Shorten long URLs
- Redirect to original URL
- Handle millions of URLs
- Analytics (optional)

**High-level Design:**
```
[Client] → [Load Balancer] → [Web Servers] → [Database]
                                ↓
                           [Cache Layer]
```

**Database Schema:**
```sql
CREATE TABLE urls (
  id BIGSERIAL PRIMARY KEY,
  short_code VARCHAR(7) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  click_count INTEGER DEFAULT 0
);

CREATE INDEX idx_short_code ON urls(short_code);
```

**Algorithm for short code generation:**
```javascript
function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
```

### Q: Design a chat application backend

**Answer:**

**Components:**
1. **WebSocket Server**: Real-time messaging
2. **REST API**: User management, chat history
3. **Message Queue**: Handle message delivery
4. **Database**: Store users, messages, chat rooms

```javascript
// WebSocket implementation
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });
  
  socket.on('send-message', (data) => {
    // Save to database
    saveMessage(data);
    
    // Broadcast to room
    socket.to(data.roomId).emit('new-message', data);
  });
});
```

**Database Schema:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES chat_rooms(id),
  user_id INTEGER REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Q: How would you handle high traffic and scale your application?

**Answer:**

**Scaling Strategies:**

1. **Horizontal Scaling**
```javascript
// Load balancer configuration
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Worker process
  app.listen(3000);
}
```

2. **Caching**
```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache frequently accessed data
app.get('/users/:id', async (req, res) => {
  const cached = await client.get(`user:${req.params.id}`);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const user = await User.findById(req.params.id);
  await client.setex(`user:${req.params.id}`, 3600, JSON.stringify(user));
  res.json(user);
});
```

3. **Database Optimization**
- Read replicas for read-heavy workloads
- Database sharding for write-heavy workloads
- Connection pooling
- Query optimization and indexing

4. **CDN for Static Assets**
5. **Microservices Architecture**
6. **Message Queues for Async Processing**

---

## ⚡ Performance & Optimization

### Q: How do you optimize Node.js application performance?

**Answer:**

1. **Use Clustering**
```javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  require('./app.js');
}
```

2. **Implement Caching**
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 });

app.get('/expensive-operation', (req, res) => {
  const key = 'expensive-data';
  const cached = cache.get(key);
  
  if (cached) {
    return res.json(cached);
  }
  
  const result = performExpensiveOperation();
  cache.set(key, result);
  res.json(result);
});
```

3. **Database Connection Pooling**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

4. **Use Compression**
```javascript
const compression = require('compression');
app.use(compression());
```

5. **Optimize Database Queries**
```javascript
// Bad: N+1 query problem
const users = await User.findAll();
for (const user of users) {
  user.posts = await Post.findByUserId(user.id);
}

// Good: Use joins or eager loading
const users = await User.findAll({
  include: [{ model: Post }]
});
```

### Q: How do you monitor application performance?

**Answer:**

1. **Application Metrics**
```javascript
const prometheus = require('prom-client');

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

// Middleware to collect metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
});
```

2. **Health Check Endpoints**
```javascript
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: await checkDatabaseHealth(),
    redis: await checkRedisHealth()
  };
  
  res.json(health);
});
```

3. **Error Tracking**
```javascript
const Sentry = require('@sentry/node');

Sentry.init({ dsn: process.env.SENTRY_DSN });

app.use(Sentry.Handlers.errorHandler());
```

---

## 🧪 Testing

### Q: What types of testing should you implement?

**Answer:**

1. **Unit Tests**
```javascript
// userService.test.js
const userService = require('../services/userService');

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };
      
      const user = await userService.createUser(userData);
      
      expect(user).toHaveProperty('id');
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
    });
    
    it('should throw error for invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email'
      };
      
      await expect(userService.createUser(userData))
        .rejects.toThrow('Invalid email format');
    });
  });
});
```

2. **Integration Tests**
```javascript
// userRoutes.test.js
const request = require('supertest');
const app = require('../app');

describe('User Routes', () => {
  it('should create a new user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    };
    
    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(userData.email);
  });
});
```

3. **End-to-End Tests**
```javascript
// e2e/userFlow.test.js
describe('User Registration Flow', () => {
  it('should complete full user registration', async () => {
    // Register user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
    
    expect(registerResponse.status).toBe(201);
    
    // Login user
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123'
      });
    
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
  });
});
```

### Q: How do you test asynchronous code?

**Answer:**

```javascript
// Testing Promises
describe('Async Operations', () => {
  it('should handle async operations with async/await', async () => {
    const result = await asyncFunction();
    expect(result).toBe('expected value');
  });
  
  it('should handle async operations with promises', () => {
    return asyncFunction().then(result => {
      expect(result).toBe('expected value');
    });
  });
  
  it('should handle rejected promises', async () => {
    await expect(failingAsyncFunction())
      .rejects.toThrow('Expected error message');
  });
});

// Testing callbacks
describe('Callback Functions', () => {
  it('should handle callbacks', (done) => {
    callbackFunction((err, result) => {
      expect(err).toBeNull();
      expect(result).toBe('expected value');
      done();
    });
  });
});
```

---

## 🚀 DevOps & Deployment

### Q: How do you deploy a Node.js application?

**Answer:**

1. **Docker Deployment**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    depends_on:
      - db
      
  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

2. **CI/CD Pipeline (GitHub Actions)**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          # Deploy commands here
```

3. **Environment Configuration**
```javascript
// config/index.js
module.exports = {
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      max: parseInt(process.env.DB_POOL_MAX) || 10
    }
  },
  redis: {
    url: process.env.REDIS_URL
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  }
};
```

### Q: How do you handle logging in production?

**Answer:**

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Usage
logger.info('User logged in', { userId: 123 });
logger.error('Database connection failed', { error: err.message });
```

---

## 💻 Coding Challenges

### Q: Implement a rate limiter

**Answer:**

```javascript
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier);
    
    // Remove old requests outside the window
    while (userRequests.length > 0 && userRequests[0] <= windowStart) {
      userRequests.shift();
    }
    
    // Check if under limit
    if (userRequests.length < this.maxRequests) {
      userRequests.push(now);
      return true;
    }
    
    return false;
  }
}

// Usage
const limiter = new RateLimiter(100, 60000); // 100 requests per minute

app.use((req, res, next) => {
  if (limiter.isAllowed(req.ip)) {
    next();
  } else {
    res.status(429).send('Too many requests');
  }
});
```

### Q: Implement a simple cache with TTL

**Answer:**

```javascript
class TTLCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }
  
  set(key, value, ttl) {
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    // Set value
    this.cache.set(key, value);
    
    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);
    
    this.timers.set(key, timer);
  }
  
  get(key) {
    return this.cache.get(key);
  }
  
  delete(key) {
    this.cache.delete(key);
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }
  
  has(key) {
    return this.cache.has(key);
  }
  
  clear() {
    this.cache.clear();
    
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}

// Usage
const cache = new TTLCache();
cache.set('user:123', { name: 'John' }, 60000); // 1 minute TTL
```

### Q: Implement a simple event emitter

**Answer:**

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }
  
  once(event, listener) {
    const onceWrapper = (...args) => {
      listener(...args);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }
  
  off(event, listenerToRemove) {
    if (!this.events[event]) return;
    
    this.events[event] = this.events[event].filter(
      listener => listener !== listenerToRemove
    );
  }
  
  emit(event, ...args) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(listener => {
      listener(...args);
    });
  }
  
  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

// Usage
const emitter = new EventEmitter();

emitter.on('user-login', (user) => {
  console.log(`User ${user.name} logged in`);
});

emitter.emit('user-login', { name: 'John' });
```

---

## 🤝 Behavioral Questions

### Q: Tell me about a challenging technical problem you solved

**Answer Structure:**
1. **Situation**: Describe the context and problem
2. **Task**: Explain what needed to be accomplished
3. **Action**: Detail the steps you took
4. **Result**: Share the outcome and what you learned

**Example:**
"We had a Node.js application that was experiencing memory leaks in production, causing the server to crash every few hours. I investigated using memory profiling tools and discovered that we weren't properly cleaning up event listeners in our WebSocket connections. I implemented proper cleanup logic and added monitoring to track memory usage, which resolved the issue and improved application stability."

### Q: How do you stay updated with new technologies?

**Answer:**
- Follow tech blogs and newsletters (Node.js blog, JavaScript Weekly)
- Participate in developer communities (Stack Overflow, Reddit, Discord)
- Attend conferences and meetups
- Work on side projects to experiment with new technologies
- Take online courses and read documentation
- Follow industry leaders on social media

### Q: Describe a time when you had to work with a difficult team member

**Answer:**
Focus on:
- Communication and understanding different perspectives
- Finding common ground and shared goals
- Professional problem-solving approach
- Positive outcome and lessons learned

---

## 📝 Interview Tips

### Technical Interview Preparation

1. **Practice Coding Problems**
   - LeetCode, HackerRank, CodeSignal
   - Focus on algorithms and data structures
   - Practice explaining your thought process

2. **System Design Practice**
   - Start with requirements gathering
   - Think about scalability and trade-offs
   - Draw diagrams to explain your design

3. **Know Your Resume**
   - Be ready to discuss any technology mentioned
   - Prepare specific examples from your experience
   - Understand the projects you've worked on deeply

### During the Interview

1. **Ask Clarifying Questions**
   - Understand requirements before coding
   - Ask about constraints and edge cases
   - Clarify expected input/output

2. **Think Out Loud**
   - Explain your approach before coding
   - Walk through your solution step by step
   - Discuss trade-offs and alternatives

3. **Write Clean Code**
   - Use meaningful variable names
   - Add comments for complex logic
   - Handle edge cases and errors

4. **Test Your Solution**
   - Walk through examples
   - Consider edge cases
   - Discuss how you would test in production

### Questions to Ask Interviewers

1. **Technical Questions**
   - What's the current tech stack?
   - How do you handle deployments?
   - What are the biggest technical challenges?

2. **Team Questions**
   - How is the team structured?
   - What's the code review process?
   - How do you handle technical debt?

3. **Growth Questions**
   - What opportunities are there for learning?
   - How do you support professional development?
   - What does career progression look like?

---

## 🎯 Final Preparation Checklist

### Core Concepts to Master
- [ ] JavaScript fundamentals (closures, promises, async/await)
- [ ] Node.js event loop and non-blocking I/O
- [ ] Express.js middleware and routing
- [ ] Database design and optimization
- [ ] RESTful API design principles
- [ ] Authentication and security best practices
- [ ] System design fundamentals
- [ ] Testing strategies and implementation

### Practical Skills
- [ ] Build a complete CRUD API
- [ ] Implement authentication with JWT
- [ ] Design a simple system architecture
- [ ] Write unit and integration tests
- [ ] Deploy an application to cloud platform
- [ ] Implement caching and optimization

### Soft Skills
- [ ] Practice explaining technical concepts clearly
- [ ] Prepare STAR method examples
- [ ] Research the company and role
- [ ] Prepare thoughtful questions for interviewers

Remember: The key to success is consistent practice and understanding concepts deeply rather than memorizing answers. Good luck with your interviews! 🚀
```
```

```


```
