// Order Service
// Business logic for order operations

const Order = require("../models/Order");
const productService = require("./productService");

// In-memory storage for demonstration (replace with database in production)
let orders = [
  new Order({
    id: 1,
    userId: 1,
    items: [
      { productId: 1, quantity: 1, price: 1299.99, name: "Laptop Pro" },
      { productId: 2, quantity: 2, price: 29.99, name: "Wireless Mouse" },
    ],
    status: "confirmed",
    totalAmount: 1359.97,
    shippingAddress: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    billingAddress: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    paymentMethod: "credit_card",
    paymentStatus: "paid",
    notes: "Please deliver to front door",
    createdAt: new Date("2024-01-01"),
  }),
  new Order({
    id: 2,
    userId: 2,
    items: [{ productId: 3, quantity: 1, price: 89.99, name: "Coffee Maker" }],
    status: "processing",
    totalAmount: 89.99,
    shippingAddress: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA",
    },
    billingAddress: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA",
    },
    paymentMethod: "paypal",
    paymentStatus: "paid",
    createdAt: new Date("2024-01-02"),
  }),
];

let nextOrderId = 3;

const orderService = {
  // Get all orders with pagination and filtering
  async findOrders(options = {}) {
    const {
      page = 1,
      limit = 10,
      userId = "",
      status = "",
      paymentStatus = "",
      sort = "-createdAt",
      startDate = "",
      endDate = "",
    } = options;

    let filteredOrders = [...orders];

    // Apply user filter
    if (userId) {
      filteredOrders = filteredOrders.filter(
        (order) => order.userId === parseInt(userId)
      );
    }

    // Apply status filter
    if (status) {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === status
      );
    }

    // Apply payment status filter
    if (paymentStatus) {
      filteredOrders = filteredOrders.filter(
        (order) => order.paymentStatus === paymentStatus
      );
    }

    // Apply date range filter
    if (startDate) {
      const start = new Date(startDate);
      filteredOrders = filteredOrders.filter(
        (order) => new Date(order.createdAt) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredOrders = filteredOrders.filter(
        (order) => new Date(order.createdAt) <= end
      );
    }

    // Apply sorting
    const [sortField, sortOrder] = sort.startsWith("-")
      ? [sort.slice(1), "desc"]
      : [sort, "asc"];
    filteredOrders.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "createdAt" || sortField === "updatedAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedOrders = filteredOrders.slice(offset, offset + limit);

    return {
      orders: paginatedOrders.map((order) => order.toJSON()),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredOrders.length / limit),
        totalOrders: filteredOrders.length,
        hasNextPage: offset + limit < filteredOrders.length,
        hasPrevPage: page > 1,
      },
    };
  },

  // Find order by ID
  async findOrderById(id) {
    const order = orders.find((o) => o.id === parseInt(id));
    return order ? order.toJSON() : null;
  },

  // Create new order
  async createOrder(orderData) {
    const validation = Order.validate(orderData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    // Validate product availability and prices
    for (const item of orderData.items) {
      const product = await productService.findProductById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }
    }

    const newOrder = new Order({
      ...orderData,
      id: nextOrderId++,
    });

    // Calculate total amount
    newOrder.calculateTotal();

    // Update product stock
    for (const item of orderData.items) {
      await productService.updateStock(item.productId, -item.quantity);
    }

    orders.push(newOrder);
    return newOrder.toJSON();
  },

  // Update order status
  async updateOrderStatus(id, newStatus) {
    const order = orders.find((o) => o.id === parseInt(id));
    if (!order) {
      throw new Error("Order not found");
    }

    // Validate status transition
    const validTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status].includes(newStatus)) {
      throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
    }

    order.updateStatus(newStatus);

    // If order is cancelled, restore product stock
    if (newStatus === "cancelled") {
      for (const item of order.items) {
        await productService.updateStock(item.productId, item.quantity);
      }
    }

    return order.toJSON();
  },

  // Update payment status
  async updatePaymentStatus(id, newPaymentStatus) {
    const order = orders.find((o) => o.id === parseInt(id));
    if (!order) {
      throw new Error("Order not found");
    }

    order.updatePaymentStatus(newPaymentStatus);
    return order.toJSON();
  },

  // Cancel order
  async cancelOrder(id, reason = "") {
    const order = orders.find((o) => o.id === parseInt(id));
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === "delivered") {
      throw new Error("Cannot cancel delivered order");
    }

    if (order.status === "cancelled") {
      throw new Error("Order is already cancelled");
    }

    // Restore product stock
    for (const item of order.items) {
      await productService.updateStock(item.productId, item.quantity);
    }

    order.updateStatus("cancelled");
    if (reason) {
      order.notes = order.notes
        ? `${order.notes}\nCancellation reason: ${reason}`
        : `Cancellation reason: ${reason}`;
    }

    return order.toJSON();
  },

  // Get orders by user
  async findOrdersByUser(userId, options = {}) {
    return await this.findOrders({ ...options, userId });
  },

  // Get order statistics
  async getOrderStats(userId = null) {
    let ordersToAnalyze = orders;

    if (userId) {
      ordersToAnalyze = orders.filter((o) => o.userId === parseInt(userId));
    }

    const totalOrders = ordersToAnalyze.length;
    const totalRevenue = ordersToAnalyze.reduce(
      (sum, o) => sum + o.totalAmount,
      0
    );
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const statusCounts = {};
    const paymentStatusCounts = {};

    ordersToAnalyze.forEach((order) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      paymentStatusCounts[order.paymentStatus] =
        (paymentStatusCounts[order.paymentStatus] || 0) + 1;
    });

    return {
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      averageOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      statusBreakdown: statusCounts,
      paymentStatusBreakdown: paymentStatusCounts,
    };
  },

  // Get recent orders
  async getRecentOrders(limit = 10) {
    const sortedOrders = [...orders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return sortedOrders.slice(0, limit).map((order) => order.toJSON());
  },

  // Add item to order (if order is still pending)
  async addItemToOrder(orderId, item) {
    const order = orders.find((o) => o.id === parseInt(orderId));
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "pending") {
      throw new Error("Cannot modify confirmed order");
    }

    // Validate product availability
    const product = await productService.findProductById(item.productId);
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product ${product.name}`);
    }

    order.addItem(item);
    await productService.updateStock(item.productId, -item.quantity);

    return order.toJSON();
  },

  // Remove item from order (if order is still pending)
  async removeItemFromOrder(orderId, productId) {
    const order = orders.find((o) => o.id === parseInt(orderId));
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "pending") {
      throw new Error("Cannot modify confirmed order");
    }

    const item = order.items.find((i) => i.productId === parseInt(productId));
    if (!item) {
      throw new Error("Item not found in order");
    }

    // Restore product stock
    await productService.updateStock(productId, item.quantity);

    order.removeItem(parseInt(productId));
    return order.toJSON();
  },
};

module.exports = orderService;
