# 09 - JWT Authentication & Security

## 🎯 Learning Objectives

- Understand JWT (JSON Web Tokens) structure and benefits
- Implement user registration and login systems
- Secure password hashing with bcrypt
- Create protected routes and middleware
- Handle token refresh and expiration
- Apply security best practices

## 📁 Project Structure

This project now includes all the necessary files for a complete JWT authentication system:

### Core Files:

- `app.js` - Main application server with security middleware
- `package.json` - Dependencies and scripts

### Routes:

- `routes/auth.js` - Authentication endpoints (login, register, logout, etc.)
- `routes/users.js` - User management endpoints
- `routes/protected.js` - Protected route examples

### Middleware:

- `middleware/auth.js` - JWT authentication middleware
- `middleware/errorHandler.js` - Global error handling
- `middleware/requestLogger.js` - Request logging
- `middleware/validation.js` - Input validation helpers

### Services:

- `services/authService.js` - Business logic for authentication
- `services/emailService.js` - Email sending functionality

### Models:

- `models/User.js` - User data model and operations

### Utilities:

- `utils/errors.js` - Custom error classes
- `utils/validators.js` - Input validation schemas
- `utils/helpers.js` - Common utility functions
- `utils/rateLimiter.js` - Rate limiting configurations

### Configuration:

- `config/database.js` - Database configuration
- `.env.example` - Environment variables template
- `.gitignore` - Git ignore patterns

### Documentation:

- `API_DOCUMENTATION.md` - Complete API documentation
- `public/index.html` - Interactive API testing interface

## 🚀 Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Test the API:**
   - Open http://localhost:3000 in your browser
   - Use the interactive testing interface
   - Or use the API endpoints directly

## 🔧 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run security-audit` - Run security audit

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with configurable rounds
- **Rate Limiting** - Prevent brute force attacks
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Secure error responses
- **CORS Protection** - Cross-origin resource sharing
- **Security Headers** - Helmet.js security headers
- **Account Lockout** - Temporary lockout after failed attempts

## 📊 Test Credentials

Use these pre-configured accounts for testing:

**Admin Account:**

- Email: `admin@example.com`
- Password: `Admin123!`

**User Account:**

- Email: `user@example.com`
- Password: `User123!`

## 🔐 What is JWT?

JWT (JSON Web Token) is a compact, URL-safe means of representing claims between two parties.

### JWT Structure:

\`\`\`
Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
\`\`\`

### JWT Components:

#### 1. Header:

\`\`\`json
{
"alg": "HS256",
"typ": "JWT"
}
\`\`\`

#### 2. Payload:

\`\`\`json
{
"sub": "1234567890",
"name": "John Doe",
"iat": 1516239022,
"exp": 1516325422
}
\`\`\`

#### 3. Signature:

\`\`\`javascript
HMACSHA256(
base64UrlEncode(header) + "." +
base64UrlEncode(payload),
secret
)
\`\`\`

## 🔒 JWT vs Sessions

### JWT Benefits:

- **Stateless**: No server-side storage required
- **Scalable**: Works across multiple servers
- **Cross-domain**: Can be used across different domains
- **Mobile-friendly**: Easy to use in mobile apps
- **Self-contained**: Contains all necessary information

### JWT Drawbacks:

- **Size**: Larger than session IDs
- **Revocation**: Difficult to revoke before expiration
- **Security**: Vulnerable if secret is compromised
- **Storage**: Client-side storage considerations

## 🛡️ Password Security

### Password Hashing with bcrypt:

\`\`\`javascript
const bcrypt = require('bcrypt');

// Hash password
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
\`\`\`

### Password Requirements:

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## 🔑 JWT Implementation

### Token Generation:

\`\`\`javascript
const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
return jwt.sign(payload, process.env.JWT_SECRET, {
expiresIn: '24h',
issuer: 'your-app-name',
audience: 'your-app-users'
});
};
\`\`\`

### Token Verification:

\`\`\`javascript
const verifyToken = (token) => {
try {
return jwt.verify(token, process.env.JWT_SECRET);
} catch (error) {
throw new Error('Invalid token');
}
};
\`\`\`

## 🚪 Authentication Flow

### Registration Flow:

\`\`\`

1. User submits registration form
2. Validate input data
3. Check if user already exists
4. Hash password with bcrypt
5. Save user to database
6. Generate JWT token
7. Return token to client
   \`\`\`

### Login Flow:

\`\`\`

1. User submits login credentials
2. Find user by email/username
3. Compare password with stored hash
4. Generate JWT token if valid
5. Return token to client
   \`\`\`

### Protected Route Access:

\`\`\`

1. Client sends request with JWT token
2. Server validates token
3. Extract user information from token
4. Allow or deny access based on token validity
   \`\`\`

## 🔐 Authentication Middleware

### Basic Auth Middleware:

\`\`\`javascript
const authenticateToken = (req, res, next) => {
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1];

if (!token) {
return res.status(401).json({ error: 'Access token required' });
}

jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
if (err) {
return res.status(403).json({ error: 'Invalid token' });
}
req.user = user;
next();
});
};
\`\`\`

### Role-Based Authorization:

\`\`\`javascript
const requireRole = (role) => {
return (req, res, next) => {
if (req.user.role !== role) {
return res.status(403).json({
error: 'Insufficient permissions'
});
}
next();
};
};
\`\`\`

## 🔄 Token Refresh

### Refresh Token Strategy:

\`\`\`javascript
// Generate tokens
const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

// Refresh endpoint
app.post('/auth/refresh', (req, res) => {
const { refreshToken } = req.body;

if (!refreshToken) {
return res.status(401).json({ error: 'Refresh token required' });
}

jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
if (err) {
return res.status(403).json({ error: 'Invalid refresh token' });
}

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });

});
});
\`\`\`

## 🛡️ Security Best Practices

### 1. Secure JWT Secrets:

\`\`\`javascript
// Use strong, random secrets
const JWT_SECRET = crypto.randomBytes(64).toString('hex');

// Store in environment variables
const secret = process.env.JWT_SECRET;
\`\`\`

### 2. Token Expiration:

\`\`\`javascript
// Short-lived access tokens
const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });

// Longer-lived refresh tokens
const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });
\`\`\`

### 3. HTTPS Only:

\`\`\`javascript
// Set secure cookies in production
res.cookie('refreshToken', refreshToken, {
httpOnly: true,
secure: process.env.NODE_ENV === 'production',
sameSite: 'strict',
maxAge: 7 _ 24 _ 60 _ 60 _ 1000 // 7 days
});
\`\`\`

### 4. Input Validation:

\`\`\`javascript
const { body, validationResult } = require('express-validator');

const validateRegistration = [
body('email').isEmail().normalizeEmail(),
body('password').isLength({ min: 8 }).matches(/^(?=._[a-z])(?=._[A-Z])(?=.\*\d)/),
body('name').isLength({ min: 2, max: 50 }).trim().escape()
];
\`\`\`

### 5. Rate Limiting:

\`\`\`javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
windowMs: 15 _ 60 _ 1000, // 15 minutes
max: 5, // 5 attempts per window
message: 'Too many authentication attempts'
});

app.use('/auth/login', authLimiter);
\`\`\`

## 🔍 Token Storage

### Client-Side Storage Options:

#### 1. localStorage:

\`\`\`javascript
// Store token
localStorage.setItem('accessToken', token);

// Retrieve token
const token = localStorage.getItem('accessToken');

// Remove token
localStorage.removeItem('accessToken');
\`\`\`

#### 2. sessionStorage:

\`\`\`javascript
// More secure, cleared when tab closes
sessionStorage.setItem('accessToken', token);
\`\`\`

#### 3. HTTP-Only Cookies:

\`\`\`javascript
// Most secure for refresh tokens
res.cookie('refreshToken', refreshToken, {
httpOnly: true,
secure: true,
sameSite: 'strict'
});
\`\`\`

## 🧪 Testing Authentication

### Unit Tests:

\`\`\`javascript
describe('Authentication', () => {
describe('POST /auth/register', () => {
it('should register a new user', async () => {
const userData = {
name: 'John Doe',
email: 'john@example.com',
password: 'Password123!'
};

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

});

describe('POST /auth/login', () => {
it('should login with valid credentials', async () => {
const credentials = {
email: 'john@example.com',
password: 'Password123!'
};

      const response = await request(app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.data.token).toBeDefined();
    });

});
});
\`\`\`

## 🔒 Advanced Security Features

### 1. Account Lockout:

\`\`\`javascript
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 30 _ 60 _ 1000; // 30 minutes

// Track failed attempts
user.loginAttempts = (user.loginAttempts || 0) + 1;
user.lockUntil = Date.now() + LOCKOUT_TIME;
\`\`\`

### 2. Password Reset:

\`\`\`javascript
const crypto = require('crypto');

// Generate reset token
const resetToken = crypto.randomBytes(32).toString('hex');
const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

user.passwordResetToken = resetTokenHash;
user.passwordResetExpires = Date.now() + 10 _ 60 _ 1000; // 10 minutes
\`\`\`

### 3. Two-Factor Authentication:

\`\`\`javascript
const speakeasy = require('speakeasy');

// Generate secret
const secret = speakeasy.generateSecret({
name: 'Your App',
length: 32
});

// Verify token
const verified = speakeasy.totp.verify({
secret: user.twoFactorSecret,
encoding: 'base32',
token: userToken,
window: 2
});
\`\`\`

## 📊 Security Monitoring

### 1. Login Tracking:

\`\`\`javascript
const loginLog = {
userId: user.id,
ip: req.ip,
userAgent: req.get('User-Agent'),
timestamp: new Date(),
success: true
};
\`\`\`

### 2. Suspicious Activity Detection:

\`\`\`javascript
// Multiple failed logins
// Login from new location
// Unusual access patterns
// Token manipulation attempts
\`\`\`

## 💻 Code Examples

Check out the complete implementation with:

- User registration and login
- JWT token generation and validation
- Protected routes and middleware
- Password hashing and security
- Token refresh mechanism
- Role-based authorization

## ⚠️ Common Security Mistakes

1. **Weak JWT Secrets**: Using predictable or short secrets
2. **No Token Expiration**: Tokens that never expire
3. **Client-Side Secret Storage**: Storing secrets in frontend code
4. **No Input Validation**: Accepting any input without validation
5. **Plain Text Passwords**: Not hashing passwords properly
6. **No Rate Limiting**: Allowing unlimited login attempts
7. **Insecure Token Storage**: Storing tokens in localStorage without consideration

## 🏋️ Practice

- [ ] Implement complete user authentication system
- [ ] Add role-based access control
- [ ] Create password reset functionality
- [ ] Implement account lockout mechanism
- [ ] Add two-factor authentication
- [ ] Build session management system
- [ ] Create security audit logging
