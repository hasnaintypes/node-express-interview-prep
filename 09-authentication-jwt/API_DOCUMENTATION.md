# JWT Authentication System Documentation

## Overview

This is a comprehensive JWT authentication system built with Node.js and Express. It provides secure authentication, authorization, and user management features.

## Features

### Authentication

- User registration with email validation
- User login with rate limiting
- JWT access tokens with configurable expiration
- Refresh tokens for maintaining sessions
- Secure password hashing with bcrypt
- Account lockout after failed login attempts

### Authorization

- Role-based access control (RBAC)
- Route-level permission checking
- Admin-only endpoints
- User ownership validation

### Security

- Input validation and sanitization
- Rate limiting for sensitive endpoints
- Secure HTTP headers with Helmet
- CORS configuration
- Password strength validation
- Account lockout mechanism

### User Management

- User profile management
- Password change functionality
- Password reset via email
- Email verification system
- User listing for admins

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "user" // optional, defaults to "user"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "emailVerified": false,
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  },
  "message": "Registration successful. Please verify your email address."
}
```

#### POST /api/auth/login

Authenticate user and return access token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "rememberMe": false // optional
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  },
  "message": "Login successful"
}
```

#### POST /api/auth/refresh

Refresh access token using refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  },
  "message": "Token refreshed successfully"
}
```

#### POST /api/auth/logout

Logout user and invalidate refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Password Management

#### POST /api/auth/forgot-password

Request password reset email.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

#### POST /api/auth/reset-password

Reset password using reset token.

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePassword123!"
}
```

#### POST /api/auth/change-password

Change password for authenticated user.

**Headers:**

```
Authorization: Bearer <access-token>
```

**Request Body:**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

### User Management

#### GET /api/users/me

Get current user profile.

**Headers:**

```
Authorization: Bearer <access-token>
```

#### GET /api/users

Get all users (admin only).

**Headers:**

```
Authorization: Bearer <access-token>
```

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sort` - Sort field (createdAt, name, email, role)
- `order` - Sort order (asc, desc)
- `role` - Filter by role (user, admin)

#### GET /api/users/:id

Get user by ID (admin or own profile).

#### PUT /api/users/:id

Update user (admin or own profile).

#### DELETE /api/users/:id

Delete user (admin only).

### Protected Routes

#### GET /api/protected/public

Public endpoint (no authentication required).

#### GET /api/protected/private

Protected endpoint (authentication required).

#### GET /api/protected/admin

Admin-only endpoint.

#### GET /api/protected/user

User role endpoint.

## Security Features

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%\*?&)

### Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Password reset: 3 requests per hour
- Email verification: 3 requests per 10 minutes

### Account Lockout

- Maximum 5 failed login attempts
- 30-minute lockout period
- Automatic unlock after lockout period

## Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Password Hashing
BCRYPT_ROUNDS=12

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com

# Frontend
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

## Installation & Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Start the server: `npm run dev`

## Testing

Run tests with:

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Security Considerations

1. **Never store JWT secrets in code** - Use environment variables
2. **Use HTTPS in production** - Especially for authentication endpoints
3. **Implement proper logging** - Monitor failed login attempts
4. **Regular security audits** - Run `npm audit` regularly
5. **Database security** - Use parameterized queries, proper indexing
6. **Input validation** - Validate all user inputs
7. **Rate limiting** - Implement rate limiting for all endpoints
8. **CORS configuration** - Configure CORS properly for your frontend

## Error Handling

All API responses follow a consistent format:

**Success Response:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... } // optional
  }
}
```

## Common Error Codes

- `MISSING_TOKEN` - Authorization header missing
- `INVALID_TOKEN` - JWT token is invalid
- `TOKEN_EXPIRED` - JWT token has expired
- `INVALID_CREDENTIALS` - Email/password combination is incorrect
- `EMAIL_ALREADY_EXISTS` - Email is already registered
- `USER_NOT_FOUND` - User does not exist
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests from IP
- `VALIDATION_ERROR` - Input validation failed
- `ACCOUNT_LOCKED` - Account is temporarily locked

## Development Notes

- This implementation uses in-memory storage for demo purposes
- In production, replace with a proper database (PostgreSQL, MongoDB, etc.)
- Implement proper logging and monitoring
- Consider using Redis for refresh token storage
- Add email templates for better user experience
- Implement 2FA for enhanced security
