// Callback Hell Example and Solution

console.log("😈 Callback Hell Example")

// BAD: Callback Hell
function callbackHellExample() {
  console.log("\n❌ Callback Hell (Pyramid of Doom):")

  setTimeout(() => {
    console.log("Step 1 completed")
    setTimeout(() => {
      console.log("Step 2 completed")
      setTimeout(() => {
        console.log("Step 3 completed")
        setTimeout(() => {
          console.log("Step 4 completed")
          setTimeout(() => {
            console.log("All steps completed (callback hell)")
          }, 100)
        }, 100)
      }, 100)
    }, 100)
  }, 100)
}

// GOOD: Promise Chain Solution
function promiseChainSolution() {
  console.log("\n✅ Promise Chain Solution:")

  function step(stepNumber) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Step ${stepNumber} completed`)
        resolve(stepNumber)
      }, 100)
    })
  }

  step(1)
    .then(() => step(2))
    .then(() => step(3))
    .then(() => step(4))
    .then(() => console.log("All steps completed (promise chain)"))
    .catch((err) => console.error("Error:", err))
}

// BETTER: Async/Await Solution
async function asyncAwaitSolution() {
  console.log("\n🎯 Async/Await Solution:")

  function step(stepNumber) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Step ${stepNumber} completed`)
        resolve(stepNumber)
      }, 100)
    })
  }

  try {
    await step(1)
    await step(2)
    await step(3)
    await step(4)
    console.log("All steps completed (async/await)")
  } catch (err) {
    console.error("Error:", err)
  }
}

// Run examples
callbackHellExample()

setTimeout(() => {
  promiseChainSolution()
}, 600)

setTimeout(() => {
  asyncAwaitSolution()
}, 1200)
