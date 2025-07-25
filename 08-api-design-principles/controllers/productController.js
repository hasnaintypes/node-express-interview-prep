// Product Controller
// HTTP request handlers for product operations

const productService = require("../services/productService");

const productController = {
  // GET /api/products - Get all products with pagination and filtering
  async getProducts(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: Math.min(parseInt(req.query.limit) || 10, 100), // Max 100 per page
        search: req.query.search || "",
        category: req.query.category || "",
        minPrice: parseFloat(req.query.minPrice) || 0,
        maxPrice: parseFloat(req.query.maxPrice) || Infinity,
        sort: req.query.sort || "id",
        inStock: req.query.inStock || "",
      };

      const result = await productService.findProducts(options);

      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination,
        message: "Products retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/products/:id - Get product by ID
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PRODUCT_ID",
            message: "Valid product ID is required",
          },
        });
      }

      const product = await productService.findProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product not found",
          },
        });
      }

      res.json({
        success: true,
        data: product,
        message: "Product retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/products - Create new product
  async createProduct(req, res, next) {
    try {
      const productData = req.body;

      const newProduct = await productService.createProduct(productData);

      res.status(201).json({
        success: true,
        data: newProduct,
        message: "Product created successfully",
      });
    } catch (error) {
      if (
        error.message.includes("Validation failed") ||
        error.message.includes("already exists")
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        });
      }
      next(error);
    }
  },

  // PUT /api/products/:id - Update product (full replacement)
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const productData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PRODUCT_ID",
            message: "Valid product ID is required",
          },
        });
      }

      const updatedProduct = await productService.updateProduct(
        id,
        productData
      );

      res.json({
        success: true,
        data: updatedProduct,
        message: "Product updated successfully",
      });
    } catch (error) {
      if (error.message === "Product not found") {
        return res.status(404).json({
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product not found",
          },
        });
      }
      if (
        error.message.includes("Validation failed") ||
        error.message.includes("already exists")
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        });
      }
      next(error);
    }
  },

  // PATCH /api/products/:id - Update product (partial update)
  async patchProduct(req, res, next) {
    try {
      const { id } = req.params;
      const productData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PRODUCT_ID",
            message: "Valid product ID is required",
          },
        });
      }

      const updatedProduct = await productService.updateProduct(
        id,
        productData
      );

      res.json({
        success: true,
        data: updatedProduct,
        message: "Product updated successfully",
      });
    } catch (error) {
      if (error.message === "Product not found") {
        return res.status(404).json({
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product not found",
          },
        });
      }
      if (
        error.message.includes("Validation failed") ||
        error.message.includes("already exists")
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        });
      }
      next(error);
    }
  },

  // DELETE /api/products/:id - Delete product
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PRODUCT_ID",
            message: "Valid product ID is required",
          },
        });
      }

      const deletedProduct = await productService.deleteProduct(id);

      res.json({
        success: true,
        data: deletedProduct,
        message: "Product deleted successfully",
      });
    } catch (error) {
      if (error.message === "Product not found") {
        return res.status(404).json({
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product not found",
          },
        });
      }
      next(error);
    }
  },

  // GET /api/products/categories - Get product categories
  async getCategories(req, res, next) {
    try {
      const categories = await productService.getCategories();

      res.json({
        success: true,
        data: categories,
        message: "Categories retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/products/search - Search products
  async searchProducts(req, res, next) {
    try {
      const { q: query } = req.query;

      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_SEARCH_QUERY",
            message: "Search query must be at least 2 characters long",
          },
        });
      }

      const options = {
        category: req.query.category || "",
        minPrice: parseFloat(req.query.minPrice) || 0,
        maxPrice: parseFloat(req.query.maxPrice) || Infinity,
        sort: req.query.sort || "relevance",
      };

      const result = await productService.searchProducts(query, options);

      res.json({
        success: true,
        data: result.results,
        meta: {
          query: result.query,
          totalFound: result.totalFound,
        },
        message: "Search completed successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/products/:id/stock - Update product stock
  async updateStock(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PRODUCT_ID",
            message: "Valid product ID is required",
          },
        });
      }

      if (quantity === undefined || isNaN(quantity)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_QUANTITY",
            message: "Valid quantity is required",
          },
        });
      }

      const updatedProduct = await productService.updateStock(id, quantity);

      res.json({
        success: true,
        data: updatedProduct,
        message: "Stock updated successfully",
      });
    } catch (error) {
      if (error.message === "Product not found") {
        return res.status(404).json({
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product not found",
          },
        });
      }
      next(error);
    }
  },

  // GET /api/products/stats - Get product statistics
  async getProductStats(req, res, next) {
    try {
      const stats = await productService.getProductStats();

      res.json({
        success: true,
        data: stats,
        message: "Product statistics retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = productController;
