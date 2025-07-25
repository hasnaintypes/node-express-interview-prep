const express = require("express")
const router = express.Router()
const { authenticateToken, requireRole } = require("../middleware/auth")
const { validatePagination } = require("../middleware/validation")

// In-memory storage for demo
const orders = [
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
    ],
    totalAmount: 299.99,
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

// GET /api/orders - List user orders
router.get("/", authenticateToken, validatePagination, (req, res) => {
  try {
    const { page = 1, limit = 10, status, sort = "-createdAt" } = req.query

    let userOrders = orders.filter((order) => order.userId === req.user.id)

    // Apply status filter
    if (status) {
      userOrders = userOrders.filter((order) => order.status === status)
    }

    // Apply sorting
    const sortFields = sort.split(",")
    userOrders.sort((a, b) => {
      for (const field of sortFields) {
        const isDesc = field.startsWith("-")
        const fieldName = isDesc ? field.slice(1) : field

        let aVal = a[fieldName]
        let bVal = b[fieldName]

        if (fieldName === "createdAt" || fieldName === "updatedAt") {
          aVal = new Date(aVal)
          bVal = new Date(bVal)
        } else if (fieldName === "totalAmount") {
          aVal = Number.parseFloat(aVal)
          bVal = Number.parseFloat(bVal)
        }

        if (aVal < bVal) return isDesc ? 1 : -1
        if (aVal > bVal) return isDesc ? -1 : 1
      }
      return 0
    })

    // Apply pagination
    const totalOrders = userOrders.length
    const totalPages = Math.ceil(totalOrders / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedOrders = userOrders.slice(startIndex, endIndex)

    res.json({
      success: true,
      data: paginatedOrders,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalItems: totalOrders,
        itemsPerPage: Number.parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      meta: {
        filters: { status },
        sort,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve orders",
      },
    })
  }
})

// GET /api/orders/:id - Get order details
router.get("/:id", authenticateToken, (req, res) => {
  try {
    const orderId = Number.parseInt(req.params.id)
    const order = orders.find((o) => o.id === orderId)

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
    if (order.userId !== req.user.id && req.user.role !== "admin") {
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
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve order",
      },
    })
  }
})

// POST /api/orders - Create new order
router.post("/", authenticateToken, (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ORDER_ITEMS",
          message: "Order must contain at least one item",
        },
      })
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        error: {
          code: "SHIPPING_ADDRESS_REQUIRED",
          message: "Shipping address is required",
        },
      })
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: {
          code: "PAYMENT_METHOD_REQUIRED",
          message: "Payment method is required",
        },
      })
    }

    // Calculate total amount (in real app, verify with product prices)
    const totalAmount = items.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)

    const newOrder = {
      id: Math.max(...orders.map((o) => o.id), 0) + 1,
      userId: req.user.id,
      items,
      totalAmount,
      status: "pending",
      shippingAddress,
      paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    orders.push(newOrder)

    res.status(201).json({
      success: true,
      data: newOrder,
      message: "Order created successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create order",
      },
    })
  }
})

// PATCH /api/orders/:id/status - Update order status (admin only)
router.patch("/:id/status", authenticateToken, requireRole("admin"), (req, res) => {
  try {
    const orderId = Number.parseInt(req.params.id)
    const { status } = req.body

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        },
      })
    }

    const orderIndex = orders.findIndex((o) => o.id === orderId)
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: "ORDER_NOT_FOUND",
          message: "Order not found",
        },
      })
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      status,
      updatedAt: new Date(),
    }

    res.json({
      success: true,
      data: orders[orderIndex],
      message: "Order status updated successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update order status",
      },
    })
  }
})

// DELETE /api/orders/:id - Cancel order
router.delete("/:id", authenticateToken, (req, res) => {
  try {
    const orderId = Number.parseInt(req.params.id)
    const orderIndex = orders.findIndex((o) => o.id === orderId)

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: "ORDER_NOT_FOUND",
          message: "Order not found",
        },
      })
    }

    const order = orders[orderIndex]

    // Check if user owns the order or is admin
    if (order.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCESS_DENIED",
          message: "You do not have permission to cancel this order",
        },
      })
    }

    // Check if order can be cancelled
    if (["shipped", "delivered"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "CANNOT_CANCEL_ORDER",
          message: "Cannot cancel order that has been shipped or delivered",
        },
      })
    }

    orders[orderIndex] = {
      ...order,
      status: "cancelled",
      updatedAt: new Date(),
    }

    res.json({
      success: true,
      data: orders[orderIndex],
      message: "Order cancelled successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to cancel order",
      },
    })
  }
})

module.exports = router
