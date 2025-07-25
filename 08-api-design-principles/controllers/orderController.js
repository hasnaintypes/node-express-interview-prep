// Order Controller
// HTTP request handlers for order operations

const orderService = require("../services/orderService");

const orderController = {
  // GET /api/orders - Get all orders with pagination and filtering
  async getOrders(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: Math.min(parseInt(req.query.limit) || 10, 100), // Max 100 per page
        userId: req.query.userId || "",
        status: req.query.status || "",
        paymentStatus: req.query.paymentStatus || "",
        sort: req.query.sort || "-createdAt",
        startDate: req.query.startDate || "",
        endDate: req.query.endDate || "",
      };

      const result = await orderService.findOrders(options);

      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
        message: "Orders retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders/:id - Get order by ID
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ORDER_ID",
            message: "Valid order ID is required",
          },
        });
      }

      const order = await orderService.findOrderById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "Order not found",
          },
        });
      }

      res.json({
        success: true,
        data: order,
        message: "Order retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/orders - Create new order
  async createOrder(req, res, next) {
    try {
      const orderData = req.body;

      const newOrder = await orderService.createOrder(orderData);

      res.status(201).json({
        success: true,
        data: newOrder,
        message: "Order created successfully",
      });
    } catch (error) {
      if (
        error.message.includes("Validation failed") ||
        error.message.includes("not found") ||
        error.message.includes("Insufficient stock")
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

  // PATCH /api/orders/:id/status - Update order status
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ORDER_ID",
            message: "Valid order ID is required",
          },
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: "Status is required",
          },
        });
      }

      const updatedOrder = await orderService.updateOrderStatus(id, status);

      res.json({
        success: true,
        data: updatedOrder,
        message: "Order status updated successfully",
      });
    } catch (error) {
      if (error.message === "Order not found") {
        return res.status(404).json({
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "Order not found",
          },
        });
      }
      if (
        error.message.includes("Cannot transition") ||
        error.message.includes("Invalid")
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS_TRANSITION",
            message: error.message,
          },
        });
      }
      next(error);
    }
  },

  // PATCH /api/orders/:id/payment - Update payment status
  async updatePaymentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { paymentStatus } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ORDER_ID",
            message: "Valid order ID is required",
          },
        });
      }

      if (!paymentStatus) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PAYMENT_STATUS",
            message: "Payment status is required",
          },
        });
      }

      const updatedOrder = await orderService.updatePaymentStatus(
        id,
        paymentStatus
      );

      res.json({
        success: true,
        data: updatedOrder,
        message: "Payment status updated successfully",
      });
    } catch (error) {
      if (error.message === "Order not found") {
        return res.status(404).json({
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "Order not found",
          },
        });
      }
      if (error.message.includes("Invalid")) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PAYMENT_STATUS",
            message: error.message,
          },
        });
      }
      next(error);
    }
  },

  // DELETE /api/orders/:id - Cancel order
  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ORDER_ID",
            message: "Valid order ID is required",
          },
        });
      }

      const cancelledOrder = await orderService.cancelOrder(id, reason);

      res.json({
        success: true,
        data: cancelledOrder,
        message: "Order cancelled successfully",
      });
    } catch (error) {
      if (error.message === "Order not found") {
        return res.status(404).json({
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "Order not found",
          },
        });
      }
      if (
        error.message.includes("Cannot cancel") ||
        error.message.includes("already cancelled")
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "CANNOT_CANCEL_ORDER",
            message: error.message,
          },
        });
      }
      next(error);
    }
  },

  // GET /api/orders/user/:userId - Get orders by user
  async getOrdersByUser(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_USER_ID",
            message: "Valid user ID is required",
          },
        });
      }

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: Math.min(parseInt(req.query.limit) || 10, 100),
        status: req.query.status || "",
        paymentStatus: req.query.paymentStatus || "",
        sort: req.query.sort || "-createdAt",
      };

      const result = await orderService.findOrdersByUser(userId, options);

      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
        message: "User orders retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders/stats - Get order statistics
  async getOrderStats(req, res, next) {
    try {
      const { userId } = req.query;

      const stats = await orderService.getOrderStats(userId);

      res.json({
        success: true,
        data: stats,
        message: "Order statistics retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders/recent - Get recent orders
  async getRecentOrders(req, res, next) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);

      const orders = await orderService.getRecentOrders(limit);

      res.json({
        success: true,
        data: orders,
        message: "Recent orders retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/orders/:id/items - Add item to order
  async addItemToOrder(req, res, next) {
    try {
      const { id } = req.params;
      const itemData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ORDER_ID",
            message: "Valid order ID is required",
          },
        });
      }

      const updatedOrder = await orderService.addItemToOrder(id, itemData);

      res.json({
        success: true,
        data: updatedOrder,
        message: "Item added to order successfully",
      });
    } catch (error) {
      if (error.message === "Order not found") {
        return res.status(404).json({
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "Order not found",
          },
        });
      }
      if (
        error.message.includes("Cannot modify") ||
        error.message.includes("not found") ||
        error.message.includes("Insufficient stock")
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

  // DELETE /api/orders/:id/items/:productId - Remove item from order
  async removeItemFromOrder(req, res, next) {
    try {
      const { id, productId } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ORDER_ID",
            message: "Valid order ID is required",
          },
        });
      }

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PRODUCT_ID",
            message: "Valid product ID is required",
          },
        });
      }

      const updatedOrder = await orderService.removeItemFromOrder(
        id,
        productId
      );

      res.json({
        success: true,
        data: updatedOrder,
        message: "Item removed from order successfully",
      });
    } catch (error) {
      if (error.message === "Order not found") {
        return res.status(404).json({
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "Order not found",
          },
        });
      }
      if (
        error.message.includes("Cannot modify") ||
        error.message.includes("not found")
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
};

module.exports = orderController;
