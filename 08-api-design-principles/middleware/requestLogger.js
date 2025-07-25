const requestLogger = (req, res, next) => {
  const start = Date.now()

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)

  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const logBody = { ...req.body }
    delete logBody.password
    delete logBody.token

    if (Object.keys(logBody).length > 0) {
      console.log("Request Body:", JSON.stringify(logBody, null, 2))
    }
  }

  const originalJson = res.json
  res.json = function (body) {
    const duration = Date.now() - start
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`)

    if (process.env.NODE_ENV === "development" && body) {
      const logBody = { ...body }
      if (logBody.data && logBody.data.token) {
        logBody.data.token = "[REDACTED]"
      }
      console.log("Response Body:", JSON.stringify(logBody, null, 2))
    }

    return originalJson.call(this, body)
  }

  next()
}

module.exports = requestLogger
