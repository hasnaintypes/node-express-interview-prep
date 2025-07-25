// Request logging middleware

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Log request body (excluding sensitive data)
  if (req.body && Object.keys(req.body).length > 0) {
    const logBody = { ...req.body };

    // Remove sensitive fields
    const sensitiveFields = [
      "password",
      "token",
      "refreshToken",
      "accessToken",
    ];
    sensitiveFields.forEach((field) => {
      if (logBody[field]) {
        logBody[field] = "[REDACTED]";
      }
    });

    console.log("Request Body:", JSON.stringify(logBody, null, 2));
  }

  // Log response details
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} - ${
        res.statusCode
      } - ${duration}ms`
    );
  });

  next();
};

module.exports = requestLogger;
