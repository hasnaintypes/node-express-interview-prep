const Product = require("../models/Product")
const productService = require("../services/productService")

class ProductController {
  // Get all products
  async getAllProducts(req, res, next) {
    try {
      const { page = 1, limit = 10, category, minPrice, maxPrice, sort } = req.query

      const options = {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        category,
        minPrice: minPrice ? Number.parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? Number.parseFloat(maxPrice) : undefined,
        sort,
      }

      const result = await productService.getAllProducts(options)

      res.json({
        success: true,
        data: result.products,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalProducts: result.totalProducts,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
        message: "Products retrieved successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // Get product by ID
  async getProductById(req, res, next) {
    try {
      const product = await Product.findById(req.params.id)

      if (!product) {
        return res.status(404).json({
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product not found",
          },
        })
      }

      res.json({
        success: true,
        data: product,
        message: "Product retrieved successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // Create new product (admin only)
  async createProduct(req, res, next) {
    try {
      const { name, description, price, category, stock, images } = req.body

      const newProduct = await Product.create({
        name,
        description,
        price,
        category,
        stock,
        images: images || [],
      })

      res.status(201).json({
        success: true,
        data: newProduct,
        message: "Product created successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // Update product (admin only)
  async updateProduct(req, res, next) {
    try {
      const { name, description, price, category, stock, images, active } = req.body

      const updatedProduct = await Product.update(req.params.id, {
        name,
        description,
        price,
        category,
        stock,
        images,
        active,
      })

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product not found",
          },
        })
      }

      res.json({
        success: true,
        data: updatedProduct,
        message: "Product updated successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // Delete product (admin only)
  async deleteProduct(req, res, next) {
    try {
      const deleted = await Product.delete(req.params.id)

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product not found",
          },
        })
      }

      res.json({
        success: true,
        message: "Product deleted successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // Search products
  async searchProducts(req, res, next) {
    try {
      const { q, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query

      if (!q) {
        return res.status(400).json({
          success: false,
          error: {
            code: "SEARCH_QUERY_REQUIRED",
            message: "Search query is required",
          },
        })
      }

      const options = {
        query: q,
        category,
        minPrice: minPrice ? Number.parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? Number.parseFloat(maxPrice) : undefined,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
      }

      const result = await productService.searchProducts(options)

      res.json({
        success: true,
        data: result.products,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalProducts: result.totalProducts,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
        message: "Search completed successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // Get product categories
  async getCategories(req, res, next) {
    try {
      const categories = await Product.getCategories()

      res.json({
        success: true,
        data: categories,
        message: "Categories retrieved successfully",
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new ProductController()
