# 06 - Express Middleware & Error Handling

## 🎯 Learning Objectives

- Understand middleware architecture and execution order
- Create custom middleware functions
- Use built-in and third-party middleware
- Implement comprehensive error handling
- Apply security and validation middleware

## 🔧 What is Middleware?

Middleware functions are functions that have access to the request object (req), response object (res), and the next middleware function in the application's request-response cycle.

### Middleware Flow:

```
Request ──→ Middleware 1 ──→ Middleware 2 ──→ Route Handler ──→ Response
              │                 │                 │
              ↓                 ↓                 ↓
           next()            next()         res.send()
```

## 🎭 Types of Middleware

### 1. Application-Level Middleware

```javascript
// Applies to all routes
app.use((req, res, next) => {
  console.log("Request received");
  next();
});

// Applies to specific path
app.use("/api", (req, res, next) => {
  console.log("API request");
  next();
});
```

### 2. Router-Level Middleware

```javascript
const router = express.Router();

router.use((req, res, next) => {
  console.log("Router middleware");
  next();
});

router.get("/users", (req, res) => {
  res.send("Users");
});
```

### 3. Error-Handling Middleware

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
```

### 4. Built-in Middleware

```javascript
// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static("public"));
```

### 5. Third-Party Middleware

```javascript
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

app.use(cors());
app.use(helmet());
app.use(morgan("combined"));
```

## 🔄 Middleware Execution Order

Middleware executes in the order it's defined:

```javascript
// 1. First middleware
app.use((req, res, next) => {
  console.log("First");
  next();
});

// 2. Second middleware
app.use((req, res, next) => {
  console.log("Second");
  next();
});

// 3. Route handler
app.get("/", (req, res) => {
  console.log("Route handler");
  res.send("Hello");
});
```

## 🔒 Security Middleware

### CORS (Cross-Origin Resource Sharing)

```javascript
const cors = require("cors");

// Enable CORS for all routes
app.use(cors());

// Custom CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "https://myapp.com"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
```

### Helmet (Security Headers)

```javascript
const helmet = require("helmet");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);
```

### Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});

app.use("/api", limiter);
```

## 📝 Request Logging

### Morgan (HTTP Request Logger)

```javascript
const morgan = require("morgan");

// Pre-defined formats
app.use(morgan("combined")); // Apache combined format
app.use(morgan("common")); // Apache common format
app.use(morgan("dev")); // Development format
app.use(morgan("short")); // Short format
app.use(morgan("tiny")); // Minimal format

// Custom format
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
```

### Custom Logging Middleware

```javascript
const customLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get("User-Agent");

  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
  next();
};

app.use(customLogger);
```

## ✅ Validation Middleware

### Express Validator

```javascript
const { body, validationResult } = require("express-validator");

// Validation rules
const userValidation = [
  body("name")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),
  body("email").isEmail().withMessage("Must be a valid email"),
  body("age")
    .isInt({ min: 0, max: 120 })
    .withMessage("Age must be between 0 and 120"),
];

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

app.post("/users", userValidation, handleValidationErrors, (req, res) => {
  // Handle valid request
});
```

## 🔍 Authentication Middleware

### JWT Authentication

```javascript
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Protected resource", user: req.user });
});
```

## 🚨 Error Handling

### Basic Error Handling

```javascript
// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Development vs Production
  if (process.env.NODE_ENV === "development") {
    res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.status || 500).json({
      error: "Internal server error",
    });
  }
});
```

### Custom Error Classes

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Usage
const createError = (message, statusCode) => {
  return new AppError(message, statusCode);
};

app.get("/error", (req, res, next) => {
  next(createError("Something went wrong", 400));
});
```

### Async Error Handling

```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get(
  "/async",
  asyncHandler(async (req, res, next) => {
    const data = await someAsyncOperation();
    res.json(data);
  })
);
```

## 📊 Middleware Best Practices

1. **Order Matters**: Place middleware in logical order
2. **Error Handling**: Always handle errors properly
3. **Performance**: Use middleware efficiently
4. **Security**: Implement security middleware early
5. **Logging**: Log requests for debugging
6. **Validation**: Validate input before processing
7. **Authentication**: Protect sensitive routes

## 🔧 Common Middleware Patterns

### Conditional Middleware

```javascript
const conditionalMiddleware = (condition) => {
  return (req, res, next) => {
    if (condition(req)) {
      // Apply middleware logic
      console.log("Condition met");
    }
    next();
  };
};

app.use(conditionalMiddleware((req) => req.method === "POST"));
```

### Middleware Factory

```javascript
const createLogger = (options = {}) => {
  return (req, res, next) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${req.method} ${req.url}`;

    if (options.includeHeaders) {
      console.log(logMessage, req.headers);
    } else {
      console.log(logMessage);
    }

    next();
  };
};

app.use(createLogger({ includeHeaders: true }));
```

## 💻 Code Examples

Check out `app.js` for practical examples of:

- Custom middleware creation
- Built-in and third-party middleware
- Error handling patterns
- Security middleware implementation
- Validation and authentication middleware

## ⚠️ Common Pitfalls

1. **Forgetting next()**: Always call next() unless sending a response
2. **Middleware Order**: Security middleware should come first
3. **Error Handling**: Error middleware must have 4 parameters
4. **Async Errors**: Use proper async error handling
5. **Memory Leaks**: Remove event listeners in middleware

## 🏋️ Practice

- [ ] Create a request timing middleware that logs response times
- [ ] Implement role-based access control middleware
- [ ] Build a file upload middleware with validation
- [ ] Create a caching middleware for GET requests
- [ ] Implement API versioning middleware
- [ ] Build a custom rate limiting middleware

```

```
