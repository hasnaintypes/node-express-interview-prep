const Product = require("../models/Product")

class ProductService {
  async getAllProducts(options = {}) {
    const { page = 1, limit = 10, category, minPrice, maxPrice, sort } = options

    let products = await Product.findAll()

    // Apply filters
    if (category) {
      products = products.filter((product) => product.category.toLowerCase() === category.toLowerCase())
    }

    if (minPrice !== undefined) {
      products = products.filter((product) => product.price >= minPrice)
    }

    if (maxPrice !== undefined) {
      products = products.filter((product) => product.price <= maxPrice)
    }

    // Apply sorting
    if (sort) {
      const sortFields = sort.split(",")
      products.sort((a, b) => {
        for (const field of sortFields) {
          const isDesc = field.startsWith("-")
          const fieldName = isDesc ? field.slice(1) : field

          let aVal = a[fieldName]
          let bVal = b[fieldName]

          if (fieldName === "price") {
            aVal = Number.parseFloat(aVal)
            bVal = Number.parseFloat(bVal)
          }

          if (aVal < bVal) return isDesc ? 1 : -1
          if (aVal > bVal) return isDesc ? -1 : 1
        }
        return 0
      })
    }

    // Apply pagination
    const totalProducts = products.length
    const totalPages = Math.ceil(totalProducts / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const paginatedProducts = products.slice(startIndex, endIndex)

    return {
      products: paginatedProducts,
      currentPage: page,
      totalPages,
      totalProducts,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }

  async searchProducts(options = {}) {
    const { query, category, minPrice, maxPrice, page = 1, limit = 10 } = options

    let products = await Product.findAll()

    // Apply search
    if (query) {
      const searchLower = query.toLowerCase()
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) || product.description.toLowerCase().includes(searchLower),
      )
    }

    // Apply additional filters
    if (category) {
      products = products.filter((product) => product.category.toLowerCase() === category.toLowerCase())
    }

    if (minPrice !== undefined) {
      products = products.filter((product) => product.price >= minPrice)
    }

    if (maxPrice !== undefined) {
      products = products.filter((product) => product.price <= maxPrice)
    }

    // Apply pagination
    const totalProducts = products.length
    const totalPages = Math.ceil(totalProducts / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const paginatedProducts = products.slice(startIndex, endIndex)

    return {
      products: paginatedProducts,
      currentPage: page,
      totalPages,
      totalProducts,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }
}

module.exports = new ProductService()
