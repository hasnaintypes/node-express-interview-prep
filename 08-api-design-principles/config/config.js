// API Configuration
// Central configuration for API settings

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "localhost",
    env: process.env.NODE_ENV || "development",
  },

  // API configuration
  api: {
    version: "1.0.0",
    prefix: "/api",
    defaultVersion: "v1",
    timeout: 30000, // 30 seconds
    maxRequestSize: "10mb",
  },

  // Pagination defaults
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later",
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  },

  // Security configuration
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    },
  },

  // Authentication configuration
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || "your-secret-key",
      expiresIn: "1h",
      refreshExpiresIn: "7d",
    },
    bcrypt: {
      saltRounds: 12,
    },
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL || "sqlite://./database.sqlite",
    options: {
      logging: process.env.NODE_ENV === "development",
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    },
  },

  // Email configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    from: process.env.EMAIL_FROM || "noreply@example.com",
  },

  // File upload configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
    uploadDir: process.env.UPLOAD_DIR || "./uploads",
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "combined",
    logToFile: process.env.LOG_TO_FILE === "true",
    logDir: process.env.LOG_DIR || "./logs",
  },

  // Cache configuration
  cache: {
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0,
    },
    ttl: 3600, // 1 hour
  },

  // Validation configuration
  validation: {
    stripUnknown: true,
    abortEarly: false,
    allowUnknown: false,
  },

  // API documentation
  documentation: {
    title: "RESTful API Design Demo",
    description:
      "Comprehensive API demonstrating REST principles and best practices",
    version: "1.0.0",
    contact: {
      name: "API Support",
      email: "support@example.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },

  // Feature flags
  features: {
    authentication: true,
    rateLimit: true,
    compression: true,
    cors: true,
    validation: true,
    logging: true,
    errorHandling: true,
    apiVersioning: true,
    documentation: true,
  },
};

module.exports = config;
