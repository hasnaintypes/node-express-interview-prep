// Product Service
// Business logic for product operations

const Product = require("../models/Product");

// In-memory storage for demonstration (replace with database in production)
let products = [
  new Product({
    id: 1,
    name: "Laptop Pro",
    description: "High-performance laptop for professionals",
    price: 1299.99,
    category: "electronics",
    stock: 50,
    sku: "LAP001",
    images: ["laptop1.jpg", "laptop2.jpg"],
    specifications: { ram: "16GB", storage: "512GB SSD", cpu: "Intel i7" },
    createdAt: new Date("2024-01-01"),
  }),
  new Product({
    id: 2,
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse",
    price: 29.99,
    category: "accessories",
    stock: 100,
    sku: "MOU001",
    images: ["mouse1.jpg"],
    specifications: { connectivity: "Bluetooth", battery: "2 AA" },
    createdAt: new Date("2024-01-02"),
  }),
  new Product({
    id: 3,
    name: "Coffee Maker",
    description: "Automatic coffee maker with timer",
    price: 89.99,
    category: "appliances",
    stock: 25,
    sku: "COF001",
    images: ["coffee1.jpg", "coffee2.jpg"],
    specifications: { capacity: "12 cups", features: "Timer, Auto-shut off" },
    createdAt: new Date("2024-01-03"),
  }),
];

let nextProductId = 4;

const productService = {
  // Get all products with pagination and filtering
  async findProducts(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      minPrice = 0,
      maxPrice = Infinity,
      sort = "id",
      inStock = "",
    } = options;

    let filteredProducts = [...products];

    // Apply search filter
    if (search) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase()) ||
          product.sku.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    if (category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === category
      );
    }

    // Apply price range filter
    filteredProducts = filteredProducts.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice
    );

    // Apply stock filter
    if (inStock !== "") {
      if (inStock === "true") {
        filteredProducts = filteredProducts.filter(
          (product) => product.stock > 0
        );
      } else if (inStock === "false") {
        filteredProducts = filteredProducts.filter(
          (product) => product.stock === 0
        );
      }
    }

    // Apply sorting
    const [sortField, sortOrder] = sort.startsWith("-")
      ? [sort.slice(1), "desc"]
      : [sort, "asc"];
    filteredProducts.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    return {
      products: paginatedProducts.map((product) => product.toJSON()),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredProducts.length / limit),
        totalProducts: filteredProducts.length,
        hasNextPage: offset + limit < filteredProducts.length,
        hasPrevPage: page > 1,
      },
    };
  },

  // Find product by ID
  async findProductById(id) {
    const product = products.find((p) => p.id === parseInt(id));
    return product ? product.toJSON() : null;
  },

  // Create new product
  async createProduct(productData) {
    const validation = Product.validate(productData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    // Check if SKU already exists
    const existingProduct = products.find((p) => p.sku === productData.sku);
    if (existingProduct) {
      throw new Error("SKU already exists");
    }

    const newProduct = new Product({
      ...productData,
      id: nextProductId++,
    });

    products.push(newProduct);
    return newProduct.toJSON();
  },

  // Update product
  async updateProduct(id, productData) {
    const product = products.find((p) => p.id === parseInt(id));
    if (!product) {
      throw new Error("Product not found");
    }

    // Validate only provided fields
    const fieldsToValidate = { ...product };
    Object.keys(productData).forEach((key) => {
      if (productData[key] !== undefined) {
        fieldsToValidate[key] = productData[key];
      }
    });

    const validation = Product.validate(fieldsToValidate);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    // Check if SKU already exists (excluding current product)
    if (productData.sku && productData.sku !== product.sku) {
      const existingProduct = products.find(
        (p) => p.sku === productData.sku && p.id !== product.id
      );
      if (existingProduct) {
        throw new Error("SKU already exists");
      }
    }

    product.update(productData);
    return product.toJSON();
  },

  // Delete product
  async deleteProduct(id) {
    const productIndex = products.findIndex((p) => p.id === parseInt(id));
    if (productIndex === -1) {
      throw new Error("Product not found");
    }

    const deletedProduct = products.splice(productIndex, 1)[0];
    return deletedProduct.toJSON();
  },

  // Get product categories
  async getCategories() {
    const categories = [...new Set(products.map((p) => p.category))];
    return categories.map((category) => ({
      name: category,
      count: products.filter((p) => p.category === category).length,
    }));
  },

  // Search products
  async searchProducts(query, options = {}) {
    const {
      category = "",
      minPrice = 0,
      maxPrice = Infinity,
      sort = "relevance",
    } = options;

    let results = products.filter((product) => {
      const matchesQuery =
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.sku.toLowerCase().includes(query.toLowerCase());

      const matchesCategory = !category || product.category === category;
      const matchesPrice =
        product.price >= minPrice && product.price <= maxPrice;

      return matchesQuery && matchesCategory && matchesPrice;
    });

    // Sort results
    if (sort === "price-asc") {
      results.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      results.sort((a, b) => b.price - a.price);
    } else if (sort === "name") {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    return {
      query,
      results: results.map((product) => product.toJSON()),
      totalFound: results.length,
    };
  },

  // Update product stock
  async updateStock(id, quantity) {
    const product = products.find((p) => p.id === parseInt(id));
    if (!product) {
      throw new Error("Product not found");
    }

    product.updateStock(quantity);
    return product.toJSON();
  },

  // Get product statistics
  async getProductStats() {
    const totalProducts = products.length;
    const inStockProducts = products.filter((p) => p.stock > 0).length;
    const outOfStockProducts = totalProducts - inStockProducts;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const avgPrice =
      totalProducts > 0
        ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts
        : 0;

    return {
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      totalValue,
      averagePrice: parseFloat(avgPrice.toFixed(2)),
    };
  },
};

module.exports = productService;
