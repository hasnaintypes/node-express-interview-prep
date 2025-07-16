// File Utilities using Path module

const path = require("path")
const fs = require("fs")

class FileUtils {
  static getFileInfo(filePath) {
    const parsed = path.parse(filePath)
    return {
      fullPath: path.resolve(filePath),
      directory: parsed.dir,
      filename: parsed.name,
      extension: parsed.ext,
      basename: parsed.base,
      isAbsolute: path.isAbsolute(filePath),
    }
  }

  static joinPaths(...paths) {
    return path.join(...paths)
  }

  static getRelativePath(from, to) {
    return path.relative(from, to)
  }

  static normalizeePath(filePath) {
    return path.normalize(filePath)
  }

  static changeExtension(filePath, newExt) {
    const parsed = path.parse(filePath)
    return path.join(parsed.dir, parsed.name + newExt)
  }

  static getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath)
      return {
        bytes: stats.size,
        kb: (stats.size / 1024).toFixed(2),
        mb: (stats.size / 1024 / 1024).toFixed(2),
      }
    } catch (error) {
      return null
    }
  }
}

module.exports = FileUtils
