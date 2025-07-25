// Database configuration (for when using a real database)

const config = {
  development: {
    database: {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || "jwt_auth_dev",
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "password",
      dialect: "postgres",
      logging: console.log,
    },
    jwt: {
      secret: process.env.JWT_SECRET || "fallback-secret-change-in-production",
      refreshSecret:
        process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret",
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },
    bcrypt: {
      rounds: Number.parseInt(process.env.BCRYPT_ROUNDS) || 12,
    },
    email: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  },

  production: {
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      dialect: "postgres",
      logging: false,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },
    bcrypt: {
      rounds: Number.parseInt(process.env.BCRYPT_ROUNDS) || 12,
    },
    email: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  },

  test: {
    database: {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || "jwt_auth_test",
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "password",
      dialect: "postgres",
      logging: false,
    },
    jwt: {
      secret: "test-secret",
      refreshSecret: "test-refresh-secret",
      expiresIn: "15m",
      refreshExpiresIn: "7d",
    },
    bcrypt: {
      rounds: 4, // Lower rounds for faster tests
    },
    email: {
      host: "localhost",
      port: 1025,
      secure: false,
      auth: {
        user: "test",
        pass: "test",
      },
    },
  },
};

const environment = process.env.NODE_ENV || "development";

module.exports = config[environment];
