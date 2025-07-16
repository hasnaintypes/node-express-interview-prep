// System Information using OS module

const os = require("os")

class SystemInfo {
  static getBasicInfo() {
    return {
      platform: os.platform(),
      architecture: os.arch(),
      hostname: os.hostname(),
      release: os.release(),
      type: os.type(),
      uptime: this.formatUptime(os.uptime()),
    }
  }

  static getMemoryInfo() {
    const total = os.totalmem()
    const free = os.freemem()
    const used = total - free

    return {
      total: this.formatBytes(total),
      free: this.formatBytes(free),
      used: this.formatBytes(used),
      usagePercentage: ((used / total) * 100).toFixed(2) + "%",
    }
  }

  static getCPUInfo() {
    const cpus = os.cpus()
    return {
      count: cpus.length,
      model: cpus[0].model,
      speed: cpus[0].speed + " MHz",
      cores: cpus.map((cpu) => ({
        model: cpu.model,
        speed: cpu.speed,
      })),
    }
  }

  static getNetworkInterfaces() {
    const interfaces = os.networkInterfaces()
    const result = {}

    for (const [name, addresses] of Object.entries(interfaces)) {
      result[name] = addresses.map((addr) => ({
        address: addr.address,
        family: addr.family,
        internal: addr.internal,
      }))
    }

    return result
  }

  static getUserInfo() {
    return {
      username: os.userInfo().username,
      homedir: os.homedir(),
      shell: os.userInfo().shell || "N/A",
    }
  }

  static formatBytes(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  static formatUptime(seconds) {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    return `${days}d ${hours}h ${minutes}m`
  }

  static getFullReport() {
    return {
      system: this.getBasicInfo(),
      memory: this.getMemoryInfo(),
      cpu: this.getCPUInfo(),
      user: this.getUserInfo(),
      timestamp: new Date().toISOString(),
    }
  }
}

module.exports = SystemInfo
