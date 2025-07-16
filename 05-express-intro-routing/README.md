# 05 - Express.js Introduction & Routing

## 🎯 Learning Objectives

- Set up Express.js from scratch
- Understand Express application structure
- Master routing patterns and parameters
- Handle static files and template engines
- Work with request and response objects

## 🚀 What is Express.js?

Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

### Key Features:

- **Minimal and Fast**: Lightweight with essential features
- **Middleware Support**: Pluggable middleware architecture
- **Routing**: Powerful routing system
- **Template Engines**: Support for various template engines
- **Static Files**: Built-in static file serving
- **HTTP Helpers**: Utilities for HTTP requests/responses

## 🏗️ Express Application Structure

```
express-app/
├── app.js              # Main application file
├── routes/             # Route definitions
│   ├── index.js
│   ├── users.js
│   └── api.js
├── public/             # Static files
│   ├── css/
│   ├── js/
│   └── images/
├── views/              # Template files
├── middleware/         # Custom middleware
└── package.json
```

## 🛤️ Basic Routing

Express routing refers to how an application's endpoints respond to client requests.

### Route Definition Structure:

```javascript
app.METHOD(PATH, HANDLER);
```

- **METHOD**: HTTP method (get, post, put, delete, etc.)
- **PATH**: Route path on the server
- **HANDLER**: Function executed when route is matched

### HTTP Methods:

```javascript
app.get("/users", (req, res) => {
  // Handle GET request
});

app.post("/users", (req, res) => {
  // Handle POST request
});

app.put("/users/:id", (req, res) => {
  // Handle PUT request
});

app.delete("/users/:id", (req, res) => {
  // Handle DELETE request
});
```

## 🎯 Route Parameters

### URL Parameters:

```javascript
// Route: /users/:id
app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  res.send(`User ID: ${userId}`);
});

// Route: /users/:id/posts/:postId
app.get("/users/:id/posts/:postId", (req, res) => {
  const { id, postId } = req.params;
  res.json({ userId: id, postId: postId });
});
```

### Query Parameters:

```javascript
// URL: /search?q=nodejs&limit=10
app.get("/search", (req, res) => {
  const { q, limit } = req.query;
  res.json({ query: q, limit: limit || 20 });
});
```

### Optional Parameters:

```javascript
// Route: /posts/:year/:month?
app.get("/posts/:year/:month?", (req, res) => {
  const { year, month } = req.params;
  res.json({ year, month: month || "all" });
});
```

## 🔧 Request and Response Objects

### Request Object (req):

```javascript
app.get("/request-info", (req, res) => {
  const info = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    params: req.params,
    query: req.query,
    body: req.body,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  };
  res.json(info);
});
```

### Response Object (res):

```javascript
app.get("/response-examples", (req, res) => {
  // Send JSON
  res.json({ message: "Hello JSON" });

  // Send plain text
  res.send("Hello Text");

  // Send with status code
  res.status(201).json({ created: true });

  // Set headers
  res.set("Custom-Header", "value");

  // Redirect
  res.redirect("/home");
});
```

## 📁 Static Files

Express can serve static files like images, CSS, JavaScript:

```javascript
// Serve static files from 'public' directory
app.use(express.static("public"));

// Multiple static directories
app.use(express.static("public"));
app.use(express.static("files"));

// Virtual path prefix
app.use("/static", express.static("public"));
```

## 🎨 Template Engines

Express supports various template engines:

### EJS Example:

```javascript
app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/profile", (req, res) => {
  const user = { name: "John", age: 30 };
  res.render("profile", { user });
});
```

### Handlebars Example:

```javascript
const hbs = require("express-handlebars");

app.engine("handlebars", hbs());
app.set("view engine", "handlebars");

app.get("/products", (req, res) => {
  const products = [
    { name: "Laptop", price: 999 },
    { name: "Phone", price: 699 },
  ];
  res.render("products", { products });
});
```

## 🔄 Route Handlers

### Single Handler:

```javascript
app.get("/single", (req, res) => {
  res.send("Single handler");
});
```

### Multiple Handlers:

```javascript
app.get(
  "/multiple",
  (req, res, next) => {
    console.log("First handler");
    next(); // Pass control to next handler
  },
  (req, res) => {
    res.send("Second handler");
  }
);
```

### Array of Handlers:

```javascript
const handler1 = (req, res, next) => {
  console.log("Handler 1");
  next();
};

const handler2 = (req, res, next) => {
  console.log("Handler 2");
  next();
};

app.get("/array", [handler1, handler2], (req, res) => {
  res.send("Final handler");
});
```

## 🛤️ Router Module

Express Router creates modular, mountable route handlers:

```javascript
// routes/users.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Users list");
});

router.get("/:id", (req, res) => {
  res.send(`User ${req.params.id}`);
});

module.exports = router;

// app.js
const userRoutes = require("./routes/users");
app.use("/users", userRoutes);
```

## 🔍 Route Patterns

### String Patterns:

```javascript
app.get("/ab*cd", handler); // Matches abcd, abxcd, abRANDOMcd
app.get("/ab+cd", handler); // Matches abcd, abbcd, abbbcd
app.get("/ab?cd", handler); // Matches acd, abcd
app.get("/ab(cd)?e", handler); // Matches abe, abcde
```

### Regular Expressions:

```javascript
app.get(/.*fly$/, handler); // Matches butterfly, dragonfly
app.get(/d+/, handler); // Matches routes with numbers
```

## 📝 Best Practices

1. **Organize Routes**: Use Express Router for modular routes
2. **Consistent Naming**: Follow RESTful conventions
3. **Error Handling**: Always handle errors properly
4. **Validation**: Validate input parameters
5. **Security**: Don't expose sensitive information in URLs
6. **Performance**: Use appropriate HTTP methods
7. **Documentation**: Document your routes clearly

## 💻 Code Examples

Check out `app.js` for practical examples of:

- Basic Express server setup
- Various routing patterns
- Parameter handling
- Static file serving
- Template engine integration
- Router module usage

## ⚠️ Common Pitfalls

1. **Route Order**: Routes are matched in order of definition
2. **Missing next()**: Forgetting to call next() in middleware
3. **Case Sensitivity**: Routes are case-sensitive by default
4. **Trailing Slashes**: /users and /users/ are different routes
5. **Parameter Validation**: Always validate route parameters

## 🏋️ Practice

- [ ] Create a blog application with routes for posts, categories, and authors
- [ ] Build a REST API for a todo application
- [ ] Implement a file upload endpoint with proper validation
- [ ] Create a dynamic route that serves different content based on parameters
- [ ] Build a simple authentication system with login/logout routes
- [ ] Implement route-level middleware for logging and validation

```

```
