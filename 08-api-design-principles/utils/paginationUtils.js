// Pagination Utilities
// Helper functions for handling pagination logic

const paginationUtils = {
  // Calculate pagination metadata
  calculatePagination(page, limit, totalItems) {
    const currentPage = Math.max(1, parseInt(page) || 1);
    const itemsPerPage = Math.min(Math.max(1, parseInt(limit) || 10), 100);
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const offset = (currentPage - 1) * itemsPerPage;

    return {
      currentPage,
      itemsPerPage,
      totalPages,
      totalItems,
      offset,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
    };
  },

  // Generate pagination links
  generatePaginationLinks(req, pagination) {
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${
      req.path
    }`;
    const queryParams = { ...req.query };

    const links = {};

    // First page link
    if (pagination.currentPage > 1) {
      queryParams.page = 1;
      links.first = `${baseUrl}?${new URLSearchParams(queryParams).toString()}`;
    }

    // Previous page link
    if (pagination.hasPrevPage) {
      queryParams.page = pagination.prevPage;
      links.prev = `${baseUrl}?${new URLSearchParams(queryParams).toString()}`;
    }

    // Next page link
    if (pagination.hasNextPage) {
      queryParams.page = pagination.nextPage;
      links.next = `${baseUrl}?${new URLSearchParams(queryParams).toString()}`;
    }

    // Last page link
    if (pagination.currentPage < pagination.totalPages) {
      queryParams.page = pagination.totalPages;
      links.last = `${baseUrl}?${new URLSearchParams(queryParams).toString()}`;
    }

    return links;
  },

  // Validate pagination parameters
  validatePaginationParams(page, limit) {
    const errors = [];

    if (page !== undefined) {
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        errors.push("Page must be a positive integer");
      }
    }

    if (limit !== undefined) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        errors.push("Limit must be between 1 and 100");
      }
    }

    return errors;
  },

  // Apply pagination to array
  paginateArray(array, page, limit) {
    const pagination = this.calculatePagination(page, limit, array.length);
    const paginatedItems = array.slice(
      pagination.offset,
      pagination.offset + pagination.itemsPerPage
    );

    return {
      items: paginatedItems,
      pagination: {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        itemsPerPage: pagination.itemsPerPage,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage,
      },
    };
  },

  // Get default pagination values
  getDefaultPagination() {
    return {
      page: 1,
      limit: 10,
      maxLimit: 100,
    };
  },

  // Parse pagination from query parameters
  parsePaginationFromQuery(query) {
    const defaults = this.getDefaultPagination();

    return {
      page: Math.max(1, parseInt(query.page) || defaults.page),
      limit: Math.min(
        Math.max(1, parseInt(query.limit) || defaults.limit),
        defaults.maxLimit
      ),
    };
  },

  // Create pagination response format
  createPaginationResponse(
    data,
    pagination,
    message = "Data retrieved successfully"
  ) {
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

  // Calculate page range for pagination UI
  calculatePageRange(currentPage, totalPages, maxPages = 5) {
    const start = Math.max(1, currentPage - Math.floor(maxPages / 2));
    const end = Math.min(totalPages, start + maxPages - 1);

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return {
      pages,
      showFirst: start > 1,
      showLast: end < totalPages,
      showPrevEllipsis: start > 2,
      showNextEllipsis: end < totalPages - 1,
    };
  },
};

module.exports = paginationUtils;
