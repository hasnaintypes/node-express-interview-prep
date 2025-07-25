/**
 * Rate Limiter Implementation
 *
 * This implements a sliding window rate limiter that tracks requests
 * per identifier (IP address, user ID, etc.) within a time window.
 */

class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = new Map() // identifier -> array of timestamps
  }

  /**
   * Check if a request is allowed for the given identifier
   * @param {string} identifier - Unique identifier (IP, user ID, etc.)
   * @returns {boolean} - True if request is allowed, false otherwise
   */
  isAllowed(identifier) {
    const now = Date.now()
    const windowStart = now - this.windowMs

    // Initialize if first request from this identifier
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [])
    }

    const userRequests = this.requests.get(identifier)

    // Remove requests outside the current window
    while (userRequests.length > 0 && userRequests[0] <= windowStart) {
      userRequests.shift()
    }

    // Check if under the rate limit
    if (userRequests.length < this.maxRequests) {
      userRequests.push(now)
      return true
    }

    return false
  }

  /**
   * Get current request count for an identifier
   * @param {string} identifier
   * @returns {number}
   */
  getCurrentCount(identifier) {
    if (!this.requests.has(identifier)) {
      return 0
    }

    const now = Date.now()
    const windowStart = now - this.windowMs
    const userRequests = this.requests.get(identifier)

    // Count requests within current window
    return userRequests.filter((timestamp) => timestamp > windowStart).length
  }

  /**
   * Get time until next request is allowed
   * @param {string} identifier
   * @returns {number} - Milliseconds until next request allowed
   */
  getTimeUntilReset(identifier) {
    if (!this.requests.has(identifier)) {
      return 0
    }

    const userRequests = this.requests.get(identifier)
    if (userRequests.length < this.maxRequests) {
      return 0
    }

    const oldestRequest = userRequests[0]
    const resetTime = oldestRequest + this.windowMs
    return Math.max(0, resetTime - Date.now())
  }

  /**
   * Clear all stored requests (useful for testing)
   */
  clear() {
    this.requests.clear()
  }

  /**
   * Get statistics about the rate limiter
   * @returns {object}
   */
  getStats() {
    const identifiers = Array.from(this.requests.keys())
    const totalRequests = identifiers.reduce((sum, id) => {
      return sum + this.getCurrentCount(id)
    }, 0)

    return {
      activeIdentifiers: identifiers.length,
      totalActiveRequests: totalRequests,
      maxRequestsPerWindow: this.maxRequests,
      windowSizeMs: this.windowMs,
    }
  }
}

/**
 * Express.js middleware factory for rate limiting
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Time window in milliseconds
 * @param {function} keyGenerator - Function to generate identifier from request
 * @returns {function} Express middleware
 */
function createRateLimitMiddleware(maxRequests, windowMs, keyGenerator = (req) => req.ip) {
  const limiter = new RateLimiter(maxRequests, windowMs)

  return (req, res, next) => {
    const identifier = keyGenerator(req)

    if (limiter.isAllowed(identifier)) {
      // Add rate limit headers
      res.set({
        "X-RateLimit-Limit": maxRequests,
        "X-RateLimit-Remaining": maxRequests - limiter.getCurrentCount(identifier),
        "X-RateLimit-Reset": new Date(Date.now() + limiter.getTimeUntilReset(identifier)).toISOString(),
      })

      next()
    } else {
      const retryAfter = Math.ceil(limiter.getTimeUntilReset(identifier) / 1000)

      res.set({
        "X-RateLimit-Limit": maxRequests,
        "X-RateLimit-Remaining": 0,
        "X-RateLimit-Reset": new Date(Date.now() + limiter.getTimeUntilReset(identifier)).toISOString(),
        "Retry-After": retryAfter,
      })

      res.status(429).json({
        error: "Too Many Requests",
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter: retryAfter,
      })
    }
  }
}

// Example usage
if (require.main === module) {
  // Basic usage example
  const limiter = new RateLimiter(5, 60000) // 5 requests per minute

  console.log("Testing rate limiter...")

  // Simulate requests
  for (let i = 1; i <= 7; i++) {
    const allowed = limiter.isAllowed("user123")
    console.log(`Request ${i}: ${allowed ? "ALLOWED" : "BLOCKED"}`)

    if (!allowed) {
      const timeUntilReset = limiter.getTimeUntilReset("user123")
      console.log(`  Time until reset: ${timeUntilReset}ms`)
    }
  }

  console.log("\nRate limiter stats:", limiter.getStats())
}

module.exports = {
  RateLimiter,
  createRateLimitMiddleware,
}
