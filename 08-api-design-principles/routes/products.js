const express = require("express")
const router = express.Router()
const { authenticateToken, requireRole } = require("../middleware/auth")
const { validatePagination, validateProduct } = require("../middleware/validation")

// In-memory storage for demo
const products = [
  {
    id: 1,
    name: "Laptop Pro 15",
    description: "High-performance laptop with 16GB RAM and 512GB SSD",
    price: 1299.99,
    category: "electronics",
    stock: 25,
    images: ["/images/laptop-1.jpg", "/images/laptop-2.jpg"],
    active: true,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    id: 2,
    name: "Wireless Headphones",
    description: "Premium noise-cancelling wireless headphones",
    price: 299.99,
    category: "electronics",
    stock: 50,
    images: ["/images/headphones-1.jpg"],
    active: true,
    createdAt: new Date("2023-02-01"),
    updatedAt: new Date("2023-02-01"),
  },
  {
    id: 3,
    name: "Coffee Maker Deluxe",
    description: "Programmable coffee maker with built-in grinder",
    price: 199.99,
    category: "home-kitchen",
    stock: 15,
    images: ["/images/coffee-maker-1.jpg"],
    active: true,
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-03-10"),
  },
  {
    id: 4,
    name: "Running Shoes",
    description: "Lightweight running shoes with advanced cushioning",
    price: 129.99,
    category: "sports",
    stock: 30,
    images: ["/images/shoes-1.jpg"],
    active: true,
    createdAt: new Date("2023-04-05"),
    updatedAt: new Date("2023-04-05"),
  },
  {
    id: 5,
    name: "Smartphone X",
    description: "Latest smartphone with 128GB storage and triple camera",
    price: 899.99,
    category: "electronics",
    stock: 20,
    images: ["/images/phone-1.jpg", "/images/phone-2.jpg"],
    active: true,
    createdAt: new Date("2023-05-20"),
    updatedAt: new Date("2023-05-20"),
  },
]

// GET /api/products - List products with advanced filtering
router.get("/", validatePagination, (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      "price[gte]": minPrice,
      "price[lte]": maxPrice,
      search,
      sort = "id",
      fields,
      active = "true",
    } = req.query

    let filteredProducts = [...products]

    // Apply active filter
    if (active !== undefined) {
      const isActive = active === "true"
      filteredProducts = filteredProducts.filter((product) => product.active === isActive)
    }

    // Apply category filter
    if (category) {
      filteredProducts = filteredProducts.filter((product) => product.category.toLowerCase() === category.toLowerCase())
    }

    // Apply price range filters
    if (minPrice) {
      filteredProducts = filteredProducts.filter((product) => product.price >= Number.parseFloat(minPrice))
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter((product) => product.price <= Number.parseFloat(maxPrice))
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) || product.description.toLowerCase().includes(searchLower),
      )
    }

    // Apply sorting
    const sortFields = sort.split(",")
    filteredProducts.sort((a, b) => {
      for (const field of sortFields) {
        const isDesc = field.startsWith("-")
        const fieldName = isDesc ? field.slice(1) : field

        let aVal = a[fieldName]
        let bVal = b[fieldName]

        if (fieldName === "price") {
          aVal = Number.parseFloat(aVal)
          bVal = Number.parseFloat(bVal)
        } else if (fieldName === "createdAt" || fieldName === "updatedAt") {
          aVal = new Date(aVal)
          bVal = new Date(bVal)
        }

        if (aVal < bVal) return isDesc ? 1 : -1
        if (aVal > bVal) return isDesc ? -1 : 1
      }
      return 0
    })

    // Apply pagination
    const totalProducts = filteredProducts.length
    const totalPages = Math.ceil(totalProducts / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    // Apply field selection
    let responseProducts = paginatedProducts
    if (fields) {
      const selectedFields = fields.split(",")
      responseProducts = paginatedProducts.map((product) => {
        const filteredProduct = {}
        selectedFields.forEach((field) => {
          if (product.hasOwnProperty(field)) {
            filteredProduct[field] = product[field]
          }
        })
        return filteredProduct
      })
    }

    res.json({
      success: true,
      data: responseProducts,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalItems: totalProducts,
        itemsPerPage: Number.parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      meta: {
        filters: { category, minPrice, maxPrice, search, active },
        sort,
        fields: fields || "all",
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve products",
      },
    })
  }
})

// GET /api/products/categories - Get product categories
router.get("/categories", (req, res) => {
  try {
    const categories = [...new Set(products.map((p) => p.category))]
    const categoriesWithCount = categories.map((category) => ({
      name: category,
      count: products.filter((p) => p.category === category && p.active).length,
    }))

    res.json({
      success: true,
      data: categoriesWithCount,
      message: "Categories retrieved successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve categories",
      },
    })
  }
})

// GET /api/products/search - Advanced product search
router.get("/search", validatePagination, (req, res) => {
  try {
    const {
      q: query,
      category,
      "price[gte]": minPrice,
      "price[lte]": maxPrice,
      page = 1,
      limit = 10,
      sort = "relevance",
    } = req.query

    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          code: "SEARCH_QUERY_REQUIRED",
          message: 'Search query parameter "q" is required',
        },
      })
    }

    let searchResults = [...products].filter((p) => p.active)
    const searchLower = query.toLowerCase()

    // Apply text search with relevance scoring
    searchResults = searchResults
      .map((product) => {
        let relevanceScore = 0

        // Name matches get higher score
        if (product.name.toLowerCase().includes(searchLower)) {
          relevanceScore += 10
          if (product.name.toLowerCase().startsWith(searchLower)) {
            relevanceScore += 5
          }
        }

        // Description matches get lower score
        if (product.description.toLowerCase().includes(searchLower)) {
          relevanceScore += 3
        }

        // Category matches get medium score
        if (product.category.toLowerCase().includes(searchLower)) {
          relevanceScore += 5
        }

        return { ...product, relevanceScore }
      })
      .filter((product) => product.relevanceScore > 0)

    // Apply additional filters
    if (category) {
      searchResults = searchResults.filter((product) => product.category.toLowerCase() === category.toLowerCase())
    }

    if (minPrice) {
      searchResults = searchResults.filter((product) => product.price >= Number.parseFloat(minPrice))
    }

    if (maxPrice) {
      searchResults = searchResults.filter((product) => product.price <= Number.parseFloat(maxPrice))
    }

    // Apply sorting
    if (sort === "relevance") {
      searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
    } else if (sort === "price") {
      searchResults.sort((a, b) => a.price - b.price)
    } else if (sort === "-price") {
      searchResults.sort((a, b) => b.price - a.price)
    } else if (sort === "name") {
      searchResults.sort((a, b) => a.name.localeCompare(b.name))
    }

    // Remove relevanceScore from response
    searchResults = searchResults.map(({ relevanceScore, ...product }) => product)

    // Apply pagination
    const totalResults = searchResults.length
    const totalPages = Math.ceil(totalResults / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedResults = searchResults.slice(startIndex, endIndex)

    res.json({
      success: true,
      data: paginatedResults,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalItems: totalResults,
        itemsPerPage: Number.parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      meta: {
        query,
        filters: { category, minPrice, maxPrice },
        sort,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Search failed",
      },
    })
  }
})

// GET /api/products/:id - Get product details
router.get("/:id", (req, res) => {
  try {
    const productId = Number.parseInt(req.params.id)
    const product = products.find((p) => p.id === productId)

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PRODUCT_NOT_FOUND",
          message: "Product not found",
        },
      })
    }

    if (!product.active) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PRODUCT_NOT_AVAILABLE",
          message: "Product is not available",
        },
      })
    }

    res.json({
      success: true,
      data: product,
      message: "Product retrieved successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve product",
      },
    })
  }
})

// POST /api/products - Create new product (admin only)
router.post("/", authenticateToken, requireRole("admin"), validateProduct, (req, res) => {
  try {
    const { name, description, price, category, stock, images = [] } = req.body

    const newProduct = {
      id: Math.max(...products.map((p) => p.id), 0) + 1,
      name,
      description,
      price: Number.parseFloat(price),
      category: category.toLowerCase(),
      stock: Number.parseInt(stock),
      images,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    products.push(newProduct)

    res.status(201).json({
      success: true,
      data: newProduct,
      message: "Product created successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create product",
      },
    })
  }
})

// PUT /api/products/:id - Update product (admin only)
router.put("/:id", authenticateToken, requireRole("admin"), validateProduct, (req, res) => {
  try {
    const productId = Number.parseInt(req.params.id)
    const productIndex = products.findIndex((p) => p.id === productId)

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PRODUCT_NOT_FOUND",
          message: "Product not found",
        },
      })
    }

    const { name, description, price, category, stock, images, active } = req.body

    products[productIndex] = {
      ...products[productIndex],
      name,
      description,
      price: Number.parseFloat(price),
      category: category.toLowerCase(),
      stock: Number.parseInt(stock),
      images: images || products[productIndex].images,
      active: active !== undefined ? active : products[productIndex].active,
      updatedAt: new Date(),
    }

    res.json({
      success: true,
      data: products[productIndex],
      message: "Product updated successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update product",
      },
    })
  }
})

// DELETE /api/products/:id - Delete product (admin only)
router.delete("/:id", authenticateToken, requireRole("admin"), (req, res) => {
  try {
    const productId = Number.parseInt(req.params.id)
    const productIndex = products.findIndex((p) => p.id === productId)

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PRODUCT_NOT_FOUND",
          message: "Product not found",
        },
      })
    }

    products.splice(productIndex, 1)

    res.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete product",
      },
    })
  }
})

module.exports = router
