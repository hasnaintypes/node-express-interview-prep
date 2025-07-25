// Order Model
// Represents an order in the system with validation and business logic

class Order {
  constructor(data) {
    this.id = data.id || null;
    this.userId = data.userId;
    this.items = data.items || [];
    this.status = data.status || "pending";
    this.totalAmount = data.totalAmount || 0;
    this.shippingAddress = data.shippingAddress;
    this.billingAddress = data.billingAddress;
    this.paymentMethod = data.paymentMethod;
    this.paymentStatus = data.paymentStatus || "pending";
    this.notes = data.notes || "";
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Order status constants
  static STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  };

  static PAYMENT_STATUS = {
    PENDING: "pending",
    PAID: "paid",
    FAILED: "failed",
    REFUNDED: "refunded",
  };

  // Validation methods
  static validate(orderData) {
    const errors = [];

    if (!orderData.userId) {
      errors.push("User ID is required");
    }

    if (
      !orderData.items ||
      !Array.isArray(orderData.items) ||
      orderData.items.length === 0
    ) {
      errors.push("Order must have at least one item");
    }

    if (orderData.items) {
      orderData.items.forEach((item, index) => {
        if (!item.productId) {
          errors.push(`Item ${index + 1} must have a product ID`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1} must have a valid quantity`);
        }
        if (!item.price || item.price <= 0) {
          errors.push(`Item ${index + 1} must have a valid price`);
        }
      });
    }

    if (!orderData.shippingAddress) {
      errors.push("Shipping address is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Business logic methods
  calculateTotal() {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
    return this.totalAmount;
  }

  updateStatus(newStatus) {
    if (Object.values(Order.STATUS).includes(newStatus)) {
      this.status = newStatus;
      this.updatedAt = new Date();
    } else {
      throw new Error("Invalid order status");
    }
  }

  updatePaymentStatus(newStatus) {
    if (Object.values(Order.PAYMENT_STATUS).includes(newStatus)) {
      this.paymentStatus = newStatus;
      this.updatedAt = new Date();
    } else {
      throw new Error("Invalid payment status");
    }
  }

  addItem(item) {
    if (!item.productId || !item.quantity || !item.price) {
      throw new Error("Item must have productId, quantity, and price");
    }
    this.items.push(item);
    this.calculateTotal();
    this.updatedAt = new Date();
  }

  removeItem(productId) {
    this.items = this.items.filter((item) => item.productId !== productId);
    this.calculateTotal();
    this.updatedAt = new Date();
  }

  // Transform for API response
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      items: this.items,
      status: this.status,
      totalAmount: this.totalAmount,
      shippingAddress: this.shippingAddress,
      billingAddress: this.billingAddress,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Order;
