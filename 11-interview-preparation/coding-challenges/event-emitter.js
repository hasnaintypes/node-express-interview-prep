/**
 * Custom Event Emitter Implementation
 *
 * A simple implementation of the Observer pattern that allows
 * objects to subscribe to and emit events.
 */

class EventEmitter {
  constructor() {
    this.events = {}
    this.maxListeners = 10
  }

  /**
   * Add a listener for an event
   * @param {string} event - Event name
   * @param {function} listener - Callback function
   * @returns {EventEmitter} - Returns this for chaining
   */
  on(event, listener) {
    if (typeof listener !== "function") {
      throw new TypeError("Listener must be a function")
    }

    if (!this.events[event]) {
      this.events[event] = []
    }

    // Check max listeners
    if (this.events[event].length >= this.maxListeners) {
      console.warn(
        `MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${this.events[event].length + 1} ${event} listeners added.`,
      )
    }

    this.events[event].push(listener)
    this.emit("newListener", event, listener)

    return this
  }

  /**
   * Add a one-time listener for an event
   * @param {string} event - Event name
   * @param {function} listener - Callback function
   * @returns {EventEmitter} - Returns this for chaining
   */
  once(event, listener) {
    if (typeof listener !== "function") {
      throw new TypeError("Listener must be a function")
    }

    const onceWrapper = (...args) => {
      listener.apply(this, args)
      this.off(event, onceWrapper)
    }

    // Store reference to original listener for removal
    onceWrapper.listener = listener

    this.on(event, onceWrapper)
    return this
  }

  /**
   * Remove a listener for an event
   * @param {string} event - Event name
   * @param {function} listener - Callback function to remove
   * @returns {EventEmitter} - Returns this for chaining
   */
  off(event, listener) {
    if (!this.events[event]) {
      return this
    }

    this.events[event] = this.events[event].filter((l) => {
      // Handle both regular listeners and once wrappers
      return l !== listener && l.listener !== listener
    })

    // Clean up empty event arrays
    if (this.events[event].length === 0) {
      delete this.events[event]
    }

    this.emit("removeListener", event, listener)
    return this
  }

  /**
   * Emit an event with optional arguments
   * @param {string} event - Event name
   * @param {...any} args - Arguments to pass to listeners
   * @returns {boolean} - True if event had listeners, false otherwise
   */
  emit(event, ...args) {
    if (!this.events[event]) {
      return false
    }

    // Create a copy of listeners to avoid issues if listeners are modified during emission
    const listeners = [...this.events[event]]

    listeners.forEach((listener) => {
      try {
        listener.apply(this, args)
      } catch (error) {
        // Emit error event if listener throws
        if (event !== "error") {
          this.emit("error", error)
        } else {
          // If error event itself throws, we need to handle it
          console.error("EventEmitter error:", error)
        }
      }
    })

    return true
  }

  /**
   * Remove all listeners for an event, or all events if no event specified
   * @param {string} [event] - Event name (optional)
   * @returns {EventEmitter} - Returns this for chaining
   */
  removeAllListeners(event) {
    if (event) {
      if (this.events[event]) {
        const listeners = [...this.events[event]]
        delete this.events[event]

        // Emit removeListener for each removed listener
        listeners.forEach((listener) => {
          this.emit("removeListener", event, listener)
        })
      }
    } else {
      // Remove all events
      const events = Object.keys(this.events)
      events.forEach((eventName) => {
        this.removeAllListeners(eventName)
      })
    }

    return this
  }

  /**
   * Get all listeners for an event
   * @param {string} event - Event name
   * @returns {function[]} - Array of listener functions
   */
  listeners(event) {
    return this.events[event] ? [...this.events[event]] : []
  }

  /**
   * Get the number of listeners for an event
   * @param {string} event - Event name
   * @returns {number} - Number of listeners
   */
  listenerCount(event) {
    return this.events[event] ? this.events[event].length : 0
  }

  /**
   * Get all event names that have listeners
   * @returns {string[]} - Array of event names
   */
  eventNames() {
    return Object.keys(this.events)
  }

  /**
   * Set the maximum number of listeners per event
   * @param {number} n - Maximum number of listeners
   * @returns {EventEmitter} - Returns this for chaining
   */
  setMaxListeners(n) {
    if (typeof n !== "number" || n < 0 || isNaN(n)) {
      throw new TypeError("n must be a non-negative number")
    }
    this.maxListeners = n
    return this
  }

  /**
   * Get the maximum number of listeners per event
   * @returns {number} - Maximum number of listeners
   */
  getMaxListeners() {
    return this.maxListeners
  }

  /**
   * Add a listener to the beginning of the listeners array
   * @param {string} event - Event name
   * @param {function} listener - Callback function
   * @returns {EventEmitter} - Returns this for chaining
   */
  prependListener(event, listener) {
    if (typeof listener !== "function") {
      throw new TypeError("Listener must be a function")
    }

    if (!this.events[event]) {
      this.events[event] = []
    }

    this.events[event].unshift(listener)
    this.emit("newListener", event, listener)

    return this
  }

  /**
   * Add a one-time listener to the beginning of the listeners array
   * @param {string} event - Event name
   * @param {function} listener - Callback function
   * @returns {EventEmitter} - Returns this for chaining
   */
  prependOnceListener(event, listener) {
    if (typeof listener !== "function") {
      throw new TypeError("Listener must be a function")
    }

    const onceWrapper = (...args) => {
      listener.apply(this, args)
      this.off(event, onceWrapper)
    }

    onceWrapper.listener = listener
    this.prependListener(event, onceWrapper)

    return this
  }
}

// Example usage and testing
if (require.main === module) {
  console.log("Testing Event Emitter...")

  const emitter = new EventEmitter()

  // Test basic on/emit
  emitter.on("test", (data) => {
    console.log("Test event received:", data)
  })

  emitter.emit("test", "Hello World!")

  // Test once
  emitter.once("once-test", (data) => {
    console.log("Once event received:", data)
  })

  emitter.emit("once-test", "First time")
  emitter.emit("once-test", "Second time") // Should not trigger

  // Test multiple listeners
  emitter.on("multi", () => console.log("Listener 1"))
  emitter.on("multi", () => console.log("Listener 2"))
  emitter.on("multi", () => console.log("Listener 3"))

  console.log("\nEmitting multi event:")
  emitter.emit("multi")

  // Test listener removal
  const removableListener = () => console.log("This will be removed")
  emitter.on("removable", removableListener)
  emitter.on("removable", () => console.log("This will stay"))

  console.log("\nBefore removal:")
  emitter.emit("removable")

  emitter.off("removable", removableListener)

  console.log("After removal:")
  emitter.emit("removable")

  // Test error handling
  emitter.on("error", (error) => {
    console.log("Error caught:", error.message)
  })

  emitter.on("error-test", () => {
    throw new Error("Test error")
  })

  console.log("\nTesting error handling:")
  emitter.emit("error-test")

  // Test statistics
  console.log("\nEvent statistics:")
  console.log("Event names:", emitter.eventNames())
  console.log('Listener count for "multi":', emitter.listenerCount("multi"))
  console.log("Max listeners:", emitter.getMaxListeners())
}

module.exports = EventEmitter
