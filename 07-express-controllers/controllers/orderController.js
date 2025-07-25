const Order = require("../models/Order")
const Product = require("../models/Product")
const orderService = require("../services/orderService")

class OrderController {
  // Get user orders
  async getUserOrders(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query

      const options = {
        userId: req.user.id,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        status,
      }

      const result = await orderService.getUserOrders(options)

      res.json({
        success: true,
        data: result.orders,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalOrders: result.totalOrders,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
        message: "Orders retrieved successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // Get order by ID
  async getOrderById(req, res, next) {
    try {
      const order = await Order.findById(req.params.id)

      if (!order) {
        return res.status(404).json({
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "Order not found",
          },
        })
      }

      // Check if user owns the order or is admin
      if (order.userId !== req.user.id && !req.user.isAdmin()) {
        return res.status(403).json({
          success: false,
          error: {
            code: "ACCESS_DENIED",
            message: "You do not have permission to view this order",
          },
        })
      }

      res.json({
        success: true,
        data: order,
        message: "Order retrieved successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // Create new order
  async createOrder(req, res, next) {
    try {
      const { items, shippingAddress, paymentMethod } = req.body

      // Validate items and calculate total
      let totalAmount = 0
      const orderItems = []

      for (const item of items) {
        const product = await Product.findById(item.productId)

        if (!product) {
          return res.status(400).json({
            success: false,
            error: {
              code: "PRODUCT_NOT_FOUND",
              message: `Product with ID ${item.productId} not found`,
            },
          })
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            error: {
              code: "INSUFFICIENT_STOCK",
              message: `Insufficient stock for product ${product.name}`,
            },
          })
        }

        const itemTotal = product.price * item.quantity
        totalAmount += itemTotal

        orderItems.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
          total: itemTotal,
        })
      }

      // Create order
      const newOrder = await Order.create({
        userId: req.user.id,
        items: orderItems,
        totalAmount,
        shippingAddress,
        paymentMethod,
        status: "pending",
      })

      // Update product stock
      for (const item of items) {
        const product = await Product.findById(item.productId)
        await Product.update(item.productId, {
          stock: product.stock - item.quantity,
        })
      }

      res.status(201).json({
        success: true,
        data: newOrder,
        message: "Order created successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // Get all orders (admin only)
  async getAllOrders(req, res, next) {
    try {
      const { page = 1, limit = 10, status, userId } = req.query

      const options = {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        status,
        userId: userId ? Number.parseInt(userId) : undefined,
      }

      const result = await orderService.getAllOrders(options)

      res.json({
        success: true,
        data: result.orders,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalOrders: result.totalOrders,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
        message: "Orders retrieved successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  // Update order status (admin only)
  async updateOrderStatus(req, res, next) {
    try {
      const { status } = req.body

      const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: "Invalid order status",
          },
        })
      }

      const updatedOrder = await Order.update(req.params.id, { status })

      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "Order not found",
          },
        })
      }

      res.json({
        success: true,
        data: updatedOrder,
        message: "Order status updated successfully",
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new OrderController()
