# 08 - API Design Principles & Best Practices

## 🎯 Learning Objectives
- Master RESTful API design principles
- Implement proper HTTP status codes and methods
- Design effective API versioning strategies
- Handle pagination, filtering, and sorting
- Create comprehensive API documentation
- Implement proper error handling and validation

## 🌐 REST API Principles

REST (Representational State Transfer) is an architectural style for designing networked applications.

### Core REST Principles:

1. **Stateless**: Each request contains all information needed
2. **Client-Server**: Separation of concerns
3. **Cacheable**: Responses should be cacheable when appropriate
4. **Uniform Interface**: Consistent resource identification
5. **Layered System**: Architecture can be composed of layers
6. **Code on Demand**: Optional - server can send executable code

### REST Constraints:
```
Client ←──HTTP──→ Server
   ↑                ↓
   └── Stateless ──┘
```

## 🛤️ Resource-Based URLs

Design URLs around resources, not actions.

### Good URL Design:
```
GET    /api/users              # Get all users
GET    /api/users/123          # Get user by ID
POST   /api/users              # Create new user
PUT    /api/users/123          # Update user (full)
PATCH  /api/users/123          # Update user (partial)
DELETE /api/users/123          # Delete user

GET    /api/users/123/posts    # Get user's posts
POST   /api/users/123/posts    # Create post for user
```

### Bad URL Design:
```
❌ GET  /api/getUsers
❌ POST /api/createUser
❌ GET  /api/user/delete/123
❌ POST /api/users/123/getPosts
```

## 🔢 HTTP Methods & Status Codes

### HTTP Methods:
```javascript
GET     // Retrieve data (safe, idempotent)
POST    // Create new resource
PUT     // Update entire resource (idempotent)
PATCH   // Partial update
DELETE  // Remove resource (idempotent)
HEAD    // Get headers only
OPTIONS // Get allowed methods
```

### HTTP Status Codes:
```javascript
// Success (2xx)
200 OK                    // Successful GET, PUT, PATCH
201 Created              // Successful POST
202 Accepted             // Async processing started
204 No Content           // Successful DELETE

// Client Error (4xx)
400 Bad Request          // Invalid request data
401 Unauthorized         // Authentication required
403 Forbidden            // Access denied
404 Not Found            // Resource doesn't exist
409 Conflict             // Resource conflict
422 Unprocessable Entity // Validation errors
429 Too Many Requests    // Rate limit exceeded

// Server Error (5xx)
500 Internal Server Error // Generic server error
502 Bad Gateway          // Upstream server error
503 Service Unavailable  // Server overloaded
```

## 📄 Request/Response Format

### Request Structure:
```javascript
// Headers
Content-Type: application/json
Authorization: Bearer <token>
Accept: application/json

// Body (for POST/PUT/PATCH)
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}
```

### Response Structure:
```javascript
// Success Response
{
  "success": true,
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "message": "User created successfully",
  "meta": {
    "timestamp": "2023-12-01T10:00:00Z",
    "version": "1.0"
  }
}

// Error Response
{
  "success": false  "2023-12-01T10:00:00Z",
    "version": "1.0"
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2023-12-01T10:00:00Z",
    "requestId": "req_123456"
  }
}
```

## 📊 Pagination

Handle large datasets efficiently with pagination.

### Offset-Based Pagination:
```javascript
GET /api/users?page=2&limit=10

// Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### Cursor-Based Pagination:
```javascript
GET /api/users?cursor=eyJpZCI6MTIzfQ&limit=10

// Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6MTMzfQ",
    "prevCursor": "eyJpZCI6MTEzfQ",
    "hasNext": true,
    "hasPrev": true
  }
}
```

## 🔍 Filtering & Sorting

### Filtering:
```javascript
GET /api/users?status=active&role=admin&age[gte]=18&age[lte]=65

// Query operators
[eq]   // equals (default)
[ne]   // not equals
[gt]   // greater than
[gte]  // greater than or equal
[lt]   // less than
[lte]  // less than or equal
[in]   // in array
[nin]  // not in array
[like] // contains (case-insensitive)
```

### Sorting:
```javascript
GET /api/users?sort=name,-createdAt

// Multiple fields: name ascending, createdAt descending
// + or no prefix = ascending
// - prefix = descending
```

### Field Selection:
```javascript
GET /api/users?fields=id,name,email

// Only return specified fields
```

## 🔄 API Versioning

### URL Versioning:
```javascript
GET /api/v1/users
GET /api/v2/users
```

### Header Versioning:
```javascript
GET /api/users
Accept: application/vnd.api+json;version=1
```

### Query Parameter Versioning:
```javascript
GET /api/users?version=1
```

## 🔒 Security Best Practices

### Authentication & Authorization:
```javascript
// JWT Token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// API Key
X-API-Key: your-api-key-here

// Basic Auth (HTTPS only)
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

### Input Validation:
```javascript
// Validate all inputs
const schema = {
  name: { type: 'string', minLength: 2, maxLength: 50 },
  email: { type: 'string', format: 'email' },
  age: { type: 'number', minimum: 0, maximum: 120 }
};
```

### Rate Limiting:
```javascript
// Headers
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

## 📝 API Documentation

### OpenAPI/Swagger Example:
```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get all users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
```

## 🧪 Testing APIs

### Unit Testing:
```javascript
describe('GET /api/users', () => {
  it('should return all users', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### Integration Testing:
```javascript
describe('User API Integration', () => {
  it('should create, read, update, and delete user', async () => {
    // Create
    const createResponse = await request(app)
      .post('/api/users')
      .send({ name: 'Test User', email: 'test@example.com' })
      .expect(201);
    
    const userId = createResponse.body.data.id;
    
    // Read
    await request(app)
      .get(`/api/users/${userId}`)
      .expect(200);
    
    // Update
    await request(app)
      .put(`/api/users/${userId}`)
      .send({ name: 'Updated User' })
      .expect(200);
    
    // Delete
    await request(app)
      .delete(`/api/users/${userId}`)
      .expect(204);
  });
});
```

## 📈 Performance Optimization

### Caching:
```javascript
// Cache-Control headers
Cache-Control: public, max-age=3600
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"

// Conditional requests
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
If-Modified-Since: Wed, 21 Oct 2015 07:28:00 GMT
```

### Compression:
```javascript
// Enable gzip compression
Accept-Encoding: gzip, deflate
Content-Encoding: gzip
```

### Database Optimization:
```javascript
// Use database indexes
// Implement query optimization
// Use connection pooling
// Implement read replicas
```

## 🔧 Error Handling

### Consistent Error Format:
```javascript
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with ID 123 not found",
    "details": {
      "userId": 123,
      "timestamp": "2023-12-01T10:00:00Z"
    }
  }
}
```

### Error Categories:
```javascript
// Validation Errors
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": [
    { "field": "email", "message": "Invalid email format" }
  ]
}

// Business Logic Errors
{
  "code": "INSUFFICIENT_FUNDS",
  "message": "Account balance is insufficient"
}

// System Errors
{
  "code": "DATABASE_CONNECTION_ERROR",
  "message": "Unable to connect to database"
}
```

## 📋 API Design Checklist

### ✅ Design Principles:
- [ ] Use nouns for resources, not verbs
- [ ] Use HTTP methods correctly
- [ ] Return appropriate status codes
- [ ] Implement consistent response format
- [ ] Use proper error handling

### ✅ Security:
- [ ] Implement authentication
- [ ] Use HTTPS in production
- [ ] Validate all inputs
- [ ] Implement rate limiting
- [ ] Use CORS properly

### ✅ Performance:
- [ ] Implement pagination
- [ ] Use caching where appropriate
- [ ] Optimize database queries
- [ ] Implement compression
- [ ] Monitor API performance

### ✅ Documentation:
- [ ] Document all endpoints
- [ ] Provide request/response examples
- [ ] Include error codes and messages
- [ ] Keep documentation up to date
- [ ] Provide SDK/client libraries

## 💻 Code Examples

Check out the complete implementation with:
- RESTful API endpoints
- Proper error handling
- Pagination and filtering
- API documentation
- Testing examples
- Performance optimization

## ⚠️ Common Mistakes

1. **Non-RESTful URLs**: Using verbs instead of nouns
2. **Wrong HTTP Methods**: Using GET for data modification
3. **Inconsistent Responses**: Different formats for different endpoints
4. **Poor Error Messages**: Generic or unhelpful error responses
5. **No Versioning**: Breaking changes without version control
6. **Missing Documentation**: Undocumented APIs are hard to use
7. **No Rate Limiting**: APIs vulnerable to abuse

## 🏋️ Practice

- [ ] Design a complete e-commerce API with products, orders, and payments
- [ ] Implement a social media API with posts, comments, and likes
- [ ] Create a project management API with projects, tasks, and teams
- [ ] Build a booking system API with availability and reservations
- [ ] Design a content management API with articles, categories, and tags
- [ ] Implement a financial API with accounts, transactions, and reports
```
```

```


```
