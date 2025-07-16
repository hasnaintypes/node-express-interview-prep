// Math Module - Basic mathematical operations

function add(a, b) {
  return a + b
}

function subtract(a, b) {
  return a - b
}

function multiply(a, b) {
  return a * b
}

function divide(a, b) {
  if (b === 0) {
    throw new Error("Division by zero is not allowed")
  }
  return a / b
}

function power(base, exponent) {
  return Math.pow(base, exponent)
}

function factorial(n) {
  if (n < 0) return undefined
  if (n === 0) return 1
  return n * factorial(n - 1)
}

// Export all functions
module.exports = {
  add,
  subtract,
  multiply,
  divide,
  power,
  factorial,
}
