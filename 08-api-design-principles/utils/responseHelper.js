// Response Helper Utilities
// Standardized response format for API consistency

const responseHelper = {
  // Success response
  success(data, message = "Success", meta = {}) {
    return {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  },

  // Error response
  error(code, message, details = {}) {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  },

  // Paginated response
  paginated(data, pagination, message = "Data retrieved successfully") {
    return {
      success: true,
      data,
      pagination,
      message,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  },

  // Validation error response
  validationError(errors) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: errors,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  },

  // Not found response
  notFound(resource = "Resource") {
    return {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: `${resource} not found`,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  },

  // Unauthorized response
  unauthorized(message = "Unauthorized access") {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  },

  // Forbidden response
  forbidden(message = "Access forbidden") {
    return {
      success: false,
      error: {
        code: "FORBIDDEN",
        message,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  },
};

module.exports = responseHelper;
