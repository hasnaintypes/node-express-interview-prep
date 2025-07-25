// Utility functions for common operations

const crypto = require("crypto");

// Generate a random token
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

// Generate a secure random password
const generateSecurePassword = (length = 12) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return password;
};

// Hash a string using SHA-256
const hashString = (str) => {
  return crypto.createHash("sha256").update(str).digest("hex");
};

// Compare two hashed strings
const compareHashes = (hash1, hash2) => {
  return hash1 === hash2;
};

// Sanitize user input to prevent XSS
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

// Format error response
const formatErrorResponse = (error, statusCode = 500) => {
  return {
    success: false,
    error: {
      code: error.code || "INTERNAL_SERVER_ERROR",
      message: error.message || "Internal server error",
      statusCode: statusCode,
    },
  };
};

// Format success response
const formatSuccessResponse = (data, message = "Success") => {
  return {
    success: true,
    message,
    data,
  };
};

// Check if email is valid
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check if password meets requirements
const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Remove sensitive fields from user object
const sanitizeUser = (user) => {
  const sanitized = { ...user };
  const sensitiveFields = [
    "password",
    "refreshToken",
    "passwordResetToken",
    "emailVerificationToken",
  ];

  sensitiveFields.forEach((field) => {
    delete sanitized[field];
  });

  return sanitized;
};

// Generate a JWT payload
const generateJWTPayload = (user) => {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
  };
};

// Sleep function for testing
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Convert milliseconds to human readable format
const msToTime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  return `${seconds} second${seconds > 1 ? "s" : ""}`;
};

// Check if a date is expired
const isExpired = (date) => {
  return new Date(date) < new Date();
};

module.exports = {
  generateToken,
  generateSecurePassword,
  hashString,
  compareHashes,
  sanitizeInput,
  formatErrorResponse,
  formatSuccessResponse,
  isValidEmail,
  isValidPassword,
  sanitizeUser,
  generateJWTPayload,
  sleep,
  msToTime,
  isExpired,
};
