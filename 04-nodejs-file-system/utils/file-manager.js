// File Manager Utility Class

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

class FileManager {
  constructor(baseDir = "./") {
    this.baseDir = path.resolve(baseDir);
  }

  // Ensure directory exists
  async ensureDir(dirPath) {
    const fullPath = path.join(this.baseDir, dirPath);
    try {
      await fs.promises.mkdir(fullPath, { recursive: true });
      return true;
    } catch (err) {
      throw new Error(`Failed to create directory: ${err.message}`);
    }
  }

  // Read file with error handling
  async readFile(filePath, encoding = "utf8") {
    const fullPath = path.join(this.baseDir, filePath);
    try {
      const data = await fs.promises.readFile(fullPath, encoding);
      return data;
    } catch (err) {
      throw new Error(`Failed to read file: ${err.message}`);
    }
  }

  // Write file with error handling
  async writeFile(filePath, data, encoding = "utf8") {
    const fullPath = path.join(this.baseDir, filePath);
    try {
      await fs.promises.writeFile(fullPath, data, encoding);
      return true;
    } catch (err) {
      throw new Error(`Failed to write file: ${err.message}`);
    }
  }

  // Delete file with error handling
  async deleteFile(filePath) {
    const fullPath = path.join(this.baseDir, filePath);
    try {
      await fs.promises.unlink(fullPath);
      return true;
    } catch (err) {
      throw new Error(`Failed to delete file: ${err.message}`);
    }
  }
}
