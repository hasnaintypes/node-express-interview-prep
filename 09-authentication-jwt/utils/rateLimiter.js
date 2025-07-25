// Rate limiting utilities

const rateLimit = require("express-rate-limit");

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests from this IP, please try again later",
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      code: "AUTH_RATE_LIMIT_EXCEEDED",
      message:
        "Too many authentication attempts from this IP, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    error: {
      code: "PASSWORD_RESET_RATE_LIMIT_EXCEEDED",
      message: "Too many password reset attempts, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email verification rate limiter
const emailVerificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // limit each IP to 3 email verification requests per 10 minutes
  message: {
    success: false,
    error: {
      code: "EMAIL_VERIFICATION_RATE_LIMIT_EXCEEDED",
      message: "Too many email verification attempts, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Create IP-based rate limiter
const createIPRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: message || "Too many requests from this IP",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Custom rate limiter based on user ID
const createUserRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?.id?.toString() || req.ip;
    },
    message: {
      success: false,
      error: {
        code: "USER_RATE_LIMIT_EXCEEDED",
        message: message || "Too many requests from this user",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  createIPRateLimiter,
  createUserRateLimiter,
};
