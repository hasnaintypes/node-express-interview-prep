# 07 - Express Controllers & MVC Architecture

## 🎯 Learning Objectives
- Implement MVC (Model-View-Controller) architecture
- Organize controllers and separate business logic
- Create service layers for data operations
- Handle validation and error management
- Build modular and maintainable applications

## 🏗️ MVC Architecture Pattern

MVC separates application logic into three interconnected components:

### Model-View-Controller Flow:
```
Request ──→ Router ──→ Controller ──→ Service ──→ Model ──→ Database
   ↑                      ↓           ↓         ↓
   └── Response ←── View ←── Controller ←── Service ←── Model
```

### Components:
- **Model**: Data structure and database operations
- **View**: Presentation layer (JSON responses in APIs)
- **Controller**: Request handling and response coordination
- **Service**: Business logic and data processing

## 📁 Project Structure

```
express-controllers/
├── controllers/          # Request handlers
│   ├── userController.js
│   ├── productController.js
│   └── authController.js
├── services/            # Business logic
│   ├── userService.js
│   ├── productService.js
│   └── authService.js
├── models/              # Data models
│   ├── User.js
│   ├── Product.js
│   └── index.js
├── routes/              # Route definitions
│   ├── userRoutes.js
│   ├── productRoutes.js
│   └── authRoutes.js
├── middleware/          # Custom middleware
├── utils/               # Utility functions
├── validators/          # Input validation
└── app.js              # Main application
```

## 🎮 Controllers

Controllers handle HTTP requests and coordinate between services and models.

### Controller Structure:
```javascript
class UserController {
  // GET /users
  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers(req.query);
      res.json({
        success: true,
        data: users,
        message: 'Users retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /users/:id
  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json({
        success: true,
        data: user,
        message: 'User retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /users
  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
```

## 🔧 Services

Services contain business logic and interact with models.

### Service Layer Benefits:
- **Separation of Concerns**: Business logic separate from HTTP handling
- **Reusability**: Services can be used by multiple controllers
- **Testability**: Easier to unit test business logic
- **Maintainability**: Centralized business rules

### Service Structure:
```javascript
class UserService {
  async getAllUsers(filters = {}) {
    const { page = 1, limit = 10, search, active } = filters;
    
    // Apply filters and pagination
    let users = await User.findAll();
    
    if (search) {
      users = users.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (active !== undefined) {
      users = users.filter(user => user.active === (active === 'true'));
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    return {
      users: paginatedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(users.length / limit),
        totalItems: users.length,
        hasNext: endIndex < users.length,
        hasPrev: startIndex > 0
      }
    };
  }
}
```

## 📊 Models

Models represent data structure and handle database operations.

### Model Structure:
```javascript
class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'user';
    this.active = data.active !== false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Instance methods
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  // Static methods
  static async findById(id) {
    // Database query logic
  }

  static async findByEmail(email) {
    // Database query logic
  }

  static async create(userData) {
    // Database creation logic
  }

  static async update(id, updateData) {
    // Database update logic
  }

  static async delete(id) {
    // Database deletion logic
  }
}
```

## 🛤️ Route Organization

Routes connect HTTP endpoints to controllers.

### Route Structure:
```javascript
const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const validation = require('../validators/userValidator');

const router = express.Router();

// Public routes
router.post('/register', validation.register, userController.register);
router.post('/login', validation.login, userController.login);

// Protected routes
router.use(authMiddleware.authenticate);

router.get('/', userController.getAllUsers);
router.get('/:id', validation.getUserById, userController.getUserById);
router.post('/', validation.createUser, userController.createUser);
router.put('/:id', validation.updateUser, userController.updateUser);
router.delete('/:id', validation.deleteUser, userController.deleteUser);

module.exports = router;
```

## ✅ Validation Layer

Validators handle input validation before reaching controllers.

### Validation Structure:
```javascript
const { body, param, query, validationResult } = require('express-validator');

const userValidator = {
  register: [
    body('name')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*d)/)
      .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
    handleValidationErrors
  ],

  getUserById: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Valid user ID is required'),
    handleValidationErrors
  ]
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};
```

## 🔄 Error Handling

Centralized error handling across controllers.

### Error Handling Pattern:
```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// In controllers
async createUser(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.code === 'DUPLICATE_EMAIL') {
      return next(new AppError('Email already exists', 409));
    }
    next(error);
  }
}
```

## 📈 Response Formatting

Consistent API response structure.

### Response Format:
```javascript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "pagination": { ... } // if applicable
}

// Error Response
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": [ ... ] // validation errors
  }
}
```

## 🧪 Testing Controllers

Unit testing controller methods.

### Controller Testing:
```javascript
const request = require('supertest');
const app = require('../app');

describe('User Controller', () => {
  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
    });
  });
});
```

## 📝 Best Practices

1. **Single Responsibility**: Each controller handles one resource
2. **Thin Controllers**: Keep controllers lightweight, move logic to services
3. **Error Handling**: Always use try-catch and pass errors to middleware
4. **Validation**: Validate input before processing
5. **Response Format**: Use consistent response structure
6. **Status Codes**: Use appropriate HTTP status codes
7. **Documentation**: Document controller methods and endpoints

## 💻 Code Examples

Check out the complete implementation with:
- User management system
- Product catalog
- Authentication system
- File upload handling
- Search and filtering
- Pagination implementation

## ⚠️ Common Pitfalls

1. **Fat Controllers**: Putting too much logic in controllers
2. **No Error Handling**: Forgetting try-catch blocks
3. **Inconsistent Responses**: Different response formats
4. **No Validation**: Accepting invalid input
5. **Tight Coupling**: Controllers directly accessing database
6. **No Testing**: Not writing unit tests for controllers

## 🏋️ Practice

- [ ] Build a blog system with posts, comments, and categories
- [ ] Create an e-commerce API with products, orders, and inventory
- [ ] Implement a task management system with projects and assignments
- [ ] Build a social media API with users, posts, and relationships
- [ ] Create a booking system with availability and reservations
- [ ] Implement a content management system with roles and permissions
```
```

```


```
