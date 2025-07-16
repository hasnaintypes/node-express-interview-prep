// Advanced Event Emitter Examples

const EventEmitter = require("events")

console.log("📡 Advanced Event Emitter Examples")

// 1. Custom Event Emitter with Error Handling
class TaskManager extends EventEmitter {
  constructor() {
    super()
    this.tasks = []
    this.completedTasks = []

    // Set max listeners to avoid memory leak warnings
    this.setMaxListeners(20)
  }

  addTask(task) {
    const taskWithId = {
      id: Date.now(),
      ...task,
      status: "pending",
      createdAt: new Date(),
    }

    this.tasks.push(taskWithId)
    this.emit("taskAdded", taskWithId)
    return taskWithId.id
  }

  completeTask(taskId) {
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId)

    if (taskIndex === -1) {
      this.emit("error", new Error(`Task ${taskId} not found`))
      return
    }

    const task = this.tasks.splice(taskIndex, 1)[0]
    task.status = "completed"
    task.completedAt = new Date()

    this.completedTasks.push(task)
    this.emit("taskCompleted", task)
    this.emit("statsChanged", this.getStats())
  }

  getStats() {
    return {
      pending: this.tasks.length,
      completed: this.completedTasks.length,
      total: this.tasks.length + this.completedTasks.length,
    }
  }

  // Method to remove all listeners (cleanup)
  cleanup() {
    this.removeAllListeners()
  }
}

// 2. Using the TaskManager
const taskManager = new TaskManager()

// Event listeners
taskManager.on("taskAdded", (task) => {
  console.log(`✅ Task added: ${task.title}`)
})

taskManager.on("taskCompleted", (task) => {
  console.log(`🎉 Task completed: ${task.title}`)
})

taskManager.on("statsChanged", (stats) => {
  console.log(`📊 Stats - Pending: ${stats.pending}, Completed: ${stats.completed}`)
})

taskManager.on("error", (err) => {
  console.error(`❌ TaskManager Error: ${err.message}`)
})

// 3. Once listeners (execute only once)
taskManager.once("firstTaskCompleted", () => {
  console.log("🎯 First task ever completed!")
})

// 4. Add tasks and complete them
console.log("\n📝 Adding and completing tasks:")

const task1Id = taskManager.addTask({ title: "Learn Node.js", priority: "high" })
const task2Id = taskManager.addTask({ title: "Build API", priority: "medium" })
const task3Id = taskManager.addTask({ title: "Write tests", priority: "low" })

setTimeout(() => {
  taskManager.completeTask(task1Id)
  taskManager.emit("firstTaskCompleted") // Manual emit
}, 500)

setTimeout(() => {
  taskManager.completeTask(task2Id)
}, 1000)

setTimeout(() => {
  taskManager.completeTask(999) // This will trigger an error
}, 1500)

// 5. Listener management
console.log("\n🎧 Listener Management:")

function temporaryListener(task) {
  console.log(`⏰ Temporary listener: ${task.title}`)
}

// Add temporary listener
taskManager.on("taskAdded", temporaryListener)

// Add another task to trigger the temporary listener
setTimeout(() => {
  taskManager.addTask({ title: "Temporary task", priority: "low" })

  // Remove the temporary listener after use
  taskManager.removeListener("taskAdded", temporaryListener)
  console.log("🗑️ Temporary listener removed")
}, 2000)

// 6. Event listener count and memory management
setTimeout(() => {
  console.log("\n📈 Event Listener Statistics:")
  console.log("taskAdded listeners:", taskManager.listenerCount("taskAdded"))
  console.log("taskCompleted listeners:", taskManager.listenerCount("taskCompleted"))
  console.log("All event names:", taskManager.eventNames())
}, 2500)

// 7. Cleanup
setTimeout(() => {
  console.log("\n🧹 Cleaning up...")
  taskManager.cleanup()
  console.log("All listeners removed")
}, 3000)
