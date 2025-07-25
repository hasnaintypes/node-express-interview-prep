// Order Model - Data structure and database operations

class Order {
  constructor(data) {
    this.id = data.id
    this.userId = data.userId
    this.items = data.items || []
    this.totalAmount = data.totalAmount
    this.status = data.status || "pending"
    this.shippingAddress = data.shippingAddress
    this.paymentMethod = data.paymentMethod
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  // Instance methods
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      items: this.items,
      totalAmount: this.totalAmount,
      status: this.status,
      shippingAddress: this.shippingAddress,
      paymentMethod: this.paymentMethod,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  isPending() {
    return this.status === "pending"
  }

  isCompleted() {
    return this.status === "delivered"
  }

  // Static methods for database operations
  static async findAll() {
    return Order.getAllFromStorage()
  }

  static async findById(id) {
    const orders = await Order.getAllFromStorage()
    const order = orders.find((o) => o.id === Number.parseInt(id))
    return order ? new Order(order) : null
  }

  static async findByUserId(userId) {
    const orders = await Order.getAllFromStorage()
    return orders.filter((o) => o.userId === Number.parseInt(userId)).map((o) => new Order(o))
  }

  static async create(orderData) {
    const orders = await Order.getAllFromStorage()
    const newOrder = new Order({
      ...orderData,
      id: Math.max(...orders.map((o) => o.id), 0) + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    orders.push(newOrder)
    await Order.saveToStorage(orders)
    return newOrder
  }

  static async update(id, updateData) {
    const orders = await Order.getAllFromStorage()
    const orderIndex = orders.findIndex((o) => o.id === Number.parseInt(id))

    if (orderIndex === -1) {
      return null
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      ...updateData,
      updatedAt: new Date(),
    }

    await Order.saveToStorage(orders)
    return new Order(orders[orderIndex])
  }

  static async delete(id) {
    const orders = await Order.getAllFromStorage()
    const orderIndex = orders.findIndex((o) => o.id === Number.parseInt(id))

    if (orderIndex === -1) {
      return false
    }

    orders.splice(orderIndex, 1)
    await Order.saveToStorage(orders)
    return true
  }

  // Storage methods (in real app, these would be database operations)
  static async getAllFromStorage() {
    if (!Order._storage) {
      Order._storage = [
        {
          id: 1,
          userId: 2,
          items: [
            {
              productId: 1,
              productName: "Laptop Pro 15",
              price: 1299.99,
              quantity: 1,
              total: 1299.99,
            },
          ],
          totalAmount: 1299.99,
          status: "delivered",
          shippingAddress: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA",
          },
          paymentMethod: "credit_card",
          createdAt: new Date("2023-06-01"),
          updatedAt: new Date("2023-06-05"),
        },
        {
          id: 2,
          userId: 2,
          items: [
            {
              productId: 2,
              productName: "Wireless Headphones",
              price: 299.99,
              quantity: 1,
              total: 299.99,
            },
            {
              productId: 4,
              productName: "Running Shoes",
              price: 129.99,
              quantity: 2,
              total: 259.98,
            },
          ],
          totalAmount: 559.97,
          status: "processing",
          shippingAddress: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA",
          },
          paymentMethod: "paypal",
          createdAt: new Date("2023-08-15"),
          updatedAt: new Date("2023-08-16"),
        },
      ]
    }
    return Order._storage
  }

  static async saveToStorage(orders) {
    Order._storage = orders
    return true
  }
}

module.exports = Order
