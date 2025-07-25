// Product Model - Data structure and database operations

class Product {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.price = data.price
    this.category = data.category
    this.stock = data.stock
    this.images = data.images || []
    this.active = data.active !== false
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  // Instance methods
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      category: this.category,
      stock: this.stock,
      images: this.images,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  isInStock() {
    return this.stock > 0
  }

  // Static methods for database operations
  static async findAll() {
    return Product.getAllFromStorage()
  }

  static async findById(id) {
    const products = await Product.getAllFromStorage()
    const product = products.find((p) => p.id === Number.parseInt(id))
    return product ? new Product(product) : null
  }

  static async findByCategory(category) {
    const products = await Product.getAllFromStorage()
    return products.filter((p) => p.category.toLowerCase() === category.toLowerCase()).map((p) => new Product(p))
  }

  static async create(productData) {
    const products = await Product.getAllFromStorage()
    const newProduct = new Product({
      ...productData,
      id: Math.max(...products.map((p) => p.id), 0) + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    products.push(newProduct)
    await Product.saveToStorage(products)
    return newProduct
  }

  static async update(id, updateData) {
    const products = await Product.getAllFromStorage()
    const productIndex = products.findIndex((p) => p.id === Number.parseInt(id))

    if (productIndex === -1) {
      return null
    }

    products[productIndex] = {
      ...products[productIndex],
      ...updateData,
      updatedAt: new Date(),
    }

    await Product.saveToStorage(products)
    return new Product(products[productIndex])
  }

  static async delete(id) {
    const products = await Product.getAllFromStorage()
    const productIndex = products.findIndex((p) => p.id === Number.parseInt(id))

    if (productIndex === -1) {
      return false
    }

    products.splice(productIndex, 1)
    await Product.saveToStorage(products)
    return true
  }

  static async getCategories() {
    const products = await Product.getAllFromStorage()
    const categories = [...new Set(products.map((p) => p.category))]
    return categories.map((category) => ({
      name: category,
      count: products.filter((p) => p.category === category).length,
    }))
  }

  // Storage methods (in real app, these would be database operations)
  static async getAllFromStorage() {
    if (!Product._storage) {
      Product._storage = [
        {
          id: 1,
          name: "Laptop Pro 15",
          description: "High-performance laptop with 16GB RAM and 512GB SSD",
          price: 1299.99,
          category: "Electronics",
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
          category: "Electronics",
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
          category: "Home & Kitchen",
          stock: 15,
          images: ["/images/coffee-maker-1.jpg", "/images/coffee-maker-2.jpg"],
          active: true,
          createdAt: new Date("2023-03-10"),
          updatedAt: new Date("2023-03-10"),
        },
        {
          id: 4,
          name: "Running Shoes",
          description: "Lightweight running shoes with advanced cushioning",
          price: 129.99,
          category: "Sports & Outdoors",
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
          category: "Electronics",
          stock: 20,
          images: ["/images/phone-1.jpg", "/images/phone-2.jpg"],
          active: true,
          createdAt: new Date("2023-05-20"),
          updatedAt: new Date("2023-05-20"),
        },
      ]
    }
    return Product._storage
  }

  static async saveToStorage(products) {
    Product._storage = products
    return true
  }
}

module.exports = Product
