const requestLogger = (req, res, next) => {
  const start = Date.now()

  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)

  // Log request body for POST/PUT/PATCH (excluding sensitive data)
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const logBody = { ...req.body }

    // Remove sensitive fields
    delete logBody.password
    delete logBody.token
    delete logBody.refreshToken

    if (Object.keys(logBody).length > 0) {
      console.log("Request Body:", JSON.stringify(logBody, null, 2))
    }
  }

  // Override res.json to log response
  const originalJson = res.json
  res.json = function (body) {
    const duration = Date.now() - start

    // Log response
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`)

    // Log response body in development (excluding sensitive data)
    if (process.env.NODE_ENV === "development" && body) {
      const logBody = { ...body }

      // Remove sensitive fields from response
      if (logBody.data && logBody.data.accessToken) {
        logBody.data.accessToken = "[REDACTED]"
      }
      if (logBody.data && logBody.data.refreshToken) {
        logBody.data.refreshToken = "[REDACTED]"
      }

      console.log("Response Body:", JSON.stringify(logBody, null, 2))
    }

    return originalJson.call(this, body)
  }

  next()
}

module.exports = requestLogger
