/**
 * TTL (Time To Live) Cache Implementation
 *
 * A simple in-memory cache with automatic expiration of entries
 * after a specified time-to-live period.
 */

class TTLCache {
  constructor(defaultTTL = 60000) {
    // Default 1 minute
    this.cache = new Map()
    this.timers = new Map()
    this.defaultTTL = defaultTTL
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      expires: 0,
    }
  }

  /**
   * Set a key-value pair with optional TTL
   * @param {string} key
   * @param {any} value
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, value, ttl = this.defaultTTL) {
    // Clear existing timer if key already exists
    this.clearTimer(key)

    // Store the value with metadata
    const entry = {
      value,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl,
    }

    this.cache.set(key, entry)
    this.stats.sets++

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key)
      this.stats.expires++
    }, ttl)

    this.timers.set(key, timer)

    return this
  }

  /**
   * Get a value by key
   * @param {string} key
   * @returns {any} - The value or undefined if not found/expired
   */
  get(key) {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      return undefined
    }

    // Check if expired (shouldn't happen with timers, but safety check)
    if (Date.now() > entry.expiresAt) {
      this.delete(key)
      this.stats.misses++
      return undefined
    }

    this.stats.hits++
    return entry.value
  }

  /**
   * Check if a key exists and is not expired
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key)
      return false
    }

    return true
  }

  /**
   * Delete a key-value pair
   * @param {string} key
   * @returns {boolean} - True if key existed and was deleted
   */
  delete(key) {
    const existed = this.cache.has(key)

    if (existed) {
      this.cache.delete(key)
      this.clearTimer(key)
      this.stats.deletes++
    }

    return existed
  }

  /**
   * Clear a timer for a specific key
   * @param {string} key
   */
  clearTimer(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key))
      this.timers.delete(key)
    }
  }

  /**
   * Get all keys (only non-expired ones)
   * @returns {string[]}
   */
  keys() {
    const validKeys = []

    for (const [key, entry] of this.cache.entries()) {
      if (Date.now() <= entry.expiresAt) {
        validKeys.push(key)
      } else {
        // Clean up expired entry
        this.delete(key)
      }
    }

    return validKeys
  }

  /**
   * Get all values (only non-expired ones)
   * @returns {any[]}
   */
  values() {
    return this.keys().map((key) => this.get(key))
  }

  /**
   * Get all entries as [key, value] pairs
   * @returns {Array<[string, any]>}
   */
  entries() {
    return this.keys().map((key) => [key, this.get(key)])
  }

  /**
   * Get the number of non-expired entries
   * @returns {number}
   */
  size() {
    return this.keys().length
  }

  /**
   * Clear all entries and timers
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }

    this.cache.clear()
    this.timers.clear()
  }

  /**
   * Get TTL (time to live) for a key in milliseconds
   * @param {string} key
   * @returns {number} - TTL in milliseconds, or -1 if key doesn't exist
   */
  getTTL(key) {
    const entry = this.cache.get(key)

    if (!entry) {
      return -1
    }

    const ttl = entry.expiresAt - Date.now()
    return Math.max(0, ttl)
  }

  /**
   * Update TTL for an existing key
   * @param {string} key
   * @param {number} ttl - New TTL in milliseconds
   * @returns {boolean} - True if key existed and TTL was updated
   */
  updateTTL(key, ttl) {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    // Clear existing timer
    this.clearTimer(key)

    // Update expiration time
    entry.expiresAt = Date.now() + ttl

    // Set new timer
    const timer = setTimeout(() => {
      this.delete(key)
      this.stats.expires++
    }, ttl)

    this.timers.set(key, timer)

    return true
  }

  /**
   * Get cache statistics
   * @returns {object}
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? ((this.stats.hits / totalRequests) * 100).toFixed(2) : 0

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      currentSize: this.size(),
      totalRequests,
    }
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      expires: 0,
    }
  }

  /**
   * Get information about a specific key
   * @param {string} key
   * @returns {object|null}
   */
  getKeyInfo(key) {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    return {
      key,
      createdAt: new Date(entry.createdAt).toISOString(),
      expiresAt: new Date(entry.expiresAt).toISOString(),
      ttl: this.getTTL(key),
      size: JSON.stringify(entry.value).length, // Approximate size
    }
  }
}

// Example usage and testing
if (require.main === module) {
  console.log("Testing TTL Cache...")

  const cache = new TTLCache(2000) // 2 second default TTL

  // Test basic operations
  cache.set("user:1", { name: "John", age: 30 })
  cache.set("user:2", { name: "Jane", age: 25 }, 1000) // 1 second TTL

  console.log("Get user:1:", cache.get("user:1"))
  console.log("Get user:2:", cache.get("user:2"))
  console.log("Cache size:", cache.size())

  // Test TTL
  setTimeout(() => {
    console.log("\nAfter 1.5 seconds:")
    console.log("Get user:1:", cache.get("user:1")) // Should exist
    console.log("Get user:2:", cache.get("user:2")) // Should be expired
    console.log("Cache size:", cache.size())
  }, 1500)

  setTimeout(() => {
    console.log("\nAfter 3 seconds:")
    console.log("Get user:1:", cache.get("user:1")) // Should be expired
    console.log("Cache size:", cache.size())
    console.log("Cache stats:", cache.getStats())
  }, 3000)
}

module.exports = TTLCache
