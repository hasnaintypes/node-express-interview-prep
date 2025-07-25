const Order = require("../models/Order")

class OrderService {
  async getUserOrders(options = {}) {
    const { userId, page = 1, limit = 10, status } = options

    let orders = await Order.findByUserId(userId)

    // Apply status filter
    if (status) {
      orders = orders.filter((order) => order.status === status)
    }

    // Apply pagination
    const totalOrders = orders.length
    const totalPages = Math.ceil(totalOrders / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const paginatedOrders = orders.slice(startIndex, endIndex)

    return {
      orders: paginatedOrders,
      currentPage: page,
      totalPages,
      totalOrders,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }

  async getAllOrders(options = {}) {
    const { page = 1, limit = 10, status, userId } = options

    let orders = await Order.findAll()

    // Apply filters
    if (status) {
      orders = orders.filter((order) => order.status === status)
    }

    if (userId) {
      orders = orders.filter((order) => order.userId === userId)
    }

    // Apply pagination
    const totalOrders = orders.length
    const totalPages = Math.ceil(totalOrders / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const paginatedOrders = orders.slice(startIndex, endIndex)

    return {
      orders: paginatedOrders,
      currentPage: page,
      totalPages,
      totalOrders,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }
}

module.exports = new OrderService()
