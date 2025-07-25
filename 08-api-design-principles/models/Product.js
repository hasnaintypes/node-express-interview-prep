// Product Model
// Represents a product in the system with validation and business logic

class Product {
  constructor(data) {
    this.id = data.id || null;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.category = data.category;
    this.stock = data.stock || 0;
    this.sku = data.sku;
    this.images = data.images || [];
    this.specifications = data.specifications || {};
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Validation methods
  static validate(productData) {
    const errors = [];

    if (!productData.name || productData.name.trim().length < 2) {
      errors.push("Product name must be at least 2 characters long");
    }

    if (!productData.price || productData.price <= 0) {
      errors.push("Product price must be greater than 0");
    }

    if (!productData.category || productData.category.trim().length < 1) {
      errors.push("Product category is required");
    }

    if (!productData.sku || productData.sku.trim().length < 1) {
      errors.push("Product SKU is required");
    }

    if (productData.stock !== undefined && productData.stock < 0) {
      errors.push("Stock cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Business logic methods
  updateStock(quantity) {
    this.stock += quantity;
    this.updatedAt = new Date();
  }

  isInStock(quantity = 1) {
    return this.stock >= quantity;
  }

  // Transform for API response
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      category: this.category,
      stock: this.stock,
      sku: this.sku,
      images: this.images,
      specifications: this.specifications,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Update product data
  update(newData) {
    if (newData.name) this.name = newData.name;
    if (newData.description) this.description = newData.description;
    if (newData.price) this.price = newData.price;
    if (newData.category) this.category = newData.category;
    if (newData.stock !== undefined) this.stock = newData.stock;
    if (newData.sku) this.sku = newData.sku;
    if (newData.images) this.images = newData.images;
    if (newData.specifications) this.specifications = newData.specifications;
    if (newData.isActive !== undefined) this.isActive = newData.isActive;
    this.updatedAt = new Date();
  }
}

module.exports = Product;
