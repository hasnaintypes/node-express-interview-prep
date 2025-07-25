// Request Logger Middleware

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  console.log(`📨 ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
    body:
      req.method === "POST" || req.method === "PUT"
        ? req.body
          ? JSON.stringify(req.body).substring(0, 200)
          : "No body"
        : undefined,
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;

    // Log response
    console.log(`📤 ${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      duration: `${duration}ms`,
      success:
        data?.success !== undefined ? data.success : res.statusCode < 400,
      timestamp: new Date().toISOString(),
    });

    return originalJson.call(this, data);
  };

  // Override res.status to capture status changes
  const originalStatus = res.status;
  res.status = function (code) {
    res.statusCode = code;
    return originalStatus.call(this, code);
  };

  next();
};

module.exports = requestLogger;
