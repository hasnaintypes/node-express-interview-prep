# API Documentation

## RESTful API Design Principles Demo

This project demonstrates comprehensive REST API design principles and best practices.

### Table of Contents

1. [Getting Started](#getting-started)
2. [API Overview](#api-overview)
3. [Authentication](#authentication)
4. [Endpoints](#endpoints)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Pagination](#pagination)
8. [Filtering & Sorting](#filtering--sorting)
9. [Best Practices](#best-practices)

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn package manager

### Installation

```bash
npm install
```

### Running the API

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

## API Overview

### Base URL

```
http://localhost:3000/api
```

### Versioning

The API supports versioning through URL path:

```
/api/v1/users
/api/v1/products
/api/v1/orders
```

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Authentication

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Using Access Tokens

Include the access token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

## Endpoints

### Users

#### Get All Users

```http
GET /api/users?page=1&limit=10&search=john&role=user&sort=name,-createdAt
```

#### Get User by ID

```http
GET /api/users/:id
```

#### Create User

```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Update User

```http
PUT /api/users/:id
Content-Type: application/json

{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

#### Partial Update User

```http
PATCH /api/users/:id
Content-Type: application/json

{
  "name": "John Smith"
}
```

#### Delete User

```http
DELETE /api/users/:id
```

### Products

#### Get All Products

```http
GET /api/products?page=1&limit=10&category=electronics&minPrice=100&maxPrice=1000&sort=price
```

#### Get Product by ID

```http
GET /api/products/:id
```

#### Create Product

```http
POST /api/products
Content-Type: application/json

{
  "name": "Laptop Pro",
  "description": "High-performance laptop",
  "price": 1299.99,
  "category": "electronics",
  "stock": 50,
  "sku": "LAP001"
}
```

#### Update Product

```http
PUT /api/products/:id
Content-Type: application/json

{
  "name": "Laptop Pro Max",
  "price": 1399.99
}
```

#### Delete Product

```http
DELETE /api/products/:id
```

#### Get Categories

```http
GET /api/products/categories
```

#### Search Products

```http
GET /api/products/search?q=laptop&category=electronics&sort=price-asc
```

### Orders

#### Get All Orders

```http
GET /api/orders?page=1&limit=10&status=pending&userId=1&sort=-createdAt
```

#### Get Order by ID

```http
GET /api/orders/:id
```

#### Create Order

```http
POST /api/orders
Content-Type: application/json

{
  "userId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 29.99,
      "name": "Wireless Mouse"
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

#### Update Order Status

```http
PATCH /api/orders/:id/status
Content-Type: application/json

{
  "status": "confirmed"
}
```

#### Cancel Order

```http
DELETE /api/orders/:id
Content-Type: application/json

{
  "reason": "Customer requested cancellation"
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit information is included in response headers
- **Response**: 429 status code when limit is exceeded

## Pagination

All list endpoints support pagination:

### Query Parameters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Filtering & Sorting

### Filtering

Use query parameters to filter results:

```http
GET /api/products?category=electronics&minPrice=100&maxPrice=500&inStock=true
```

### Sorting

Use the `sort` parameter:

```http
GET /api/users?sort=name,-createdAt
```

- Ascending: `name`
- Descending: `-name`
- Multiple fields: `name,-createdAt`

### Search

Use the `search` parameter for text search:

```http
GET /api/users?search=john
```

## Best Practices

### 1. RESTful URLs

- Use nouns, not verbs
- Use plural nouns for collections
- Use hierarchy for relationships

### 2. HTTP Methods

- `GET` - Retrieve data
- `POST` - Create new resource
- `PUT` - Update entire resource
- `PATCH` - Partial update
- `DELETE` - Remove resource

### 3. Status Codes

Use appropriate HTTP status codes for different scenarios.

### 4. Error Handling

Provide clear, consistent error messages with appropriate status codes.

### 5. Validation

Validate all input data and provide meaningful error messages.

### 6. Security

- Use HTTPS in production
- Implement authentication and authorization
- Validate and sanitize all inputs
- Use rate limiting

### 7. Documentation

Keep API documentation up-to-date and comprehensive.

### 8. Versioning

Plan for API versioning from the beginning.

### 9. Caching

Implement appropriate caching strategies for better performance.

### 10. Monitoring

Monitor API performance and usage patterns.

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### API Testing with Postman

Import the Postman collection from `/docs/postman/` directory.

## Deployment

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key
DATABASE_URL=your-database-url
```

### Production Deployment

```bash
npm run build
npm start
```

## Support

For questions or issues, please contact the API team or create an issue in the repository.
