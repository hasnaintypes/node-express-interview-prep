// Validation Utilities
// Common validation functions for API inputs

const validationUtils = {
  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Password validation
  isValidPassword(password) {
    return password && password.length >= 6;
  },

  // URL validation
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Phone number validation (basic)
  isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
  },

  // UUID validation
  isValidUUID(uuid) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // Date validation
  isValidDate(date) {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  },

  // Positive number validation
  isPositiveNumber(value) {
    return !isNaN(value) && Number(value) > 0;
  },

  // Non-negative number validation
  isNonNegativeNumber(value) {
    return !isNaN(value) && Number(value) >= 0;
  },

  // String length validation
  isValidLength(str, min = 0, max = Infinity) {
    return str && str.length >= min && str.length <= max;
  },

  // Array validation
  isValidArray(arr, minLength = 0, maxLength = Infinity) {
    return (
      Array.isArray(arr) && arr.length >= minLength && arr.length <= maxLength
    );
  },

  // Object validation
  isValidObject(obj) {
    return obj && typeof obj === "object" && !Array.isArray(obj);
  },

  // Enum validation
  isValidEnum(value, allowedValues) {
    return allowedValues.includes(value);
  },

  // Credit card validation (basic Luhn algorithm)
  isValidCreditCard(cardNumber) {
    const num = cardNumber.replace(/\D/g, "");
    let sum = 0;
    let alternate = false;

    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);

      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit = (digit % 10) + 1;
        }
      }

      sum += digit;
      alternate = !alternate;
    }

    return sum % 10 === 0;
  },

  // Sanitize string (remove dangerous characters)
  sanitizeString(str) {
    return str.replace(/[<>]/g, "");
  },

  // Validate pagination parameters
  validatePagination(page, limit) {
    const errors = [];

    if (page !== undefined) {
      if (isNaN(page) || page < 1) {
        errors.push("Page must be a positive integer");
      }
    }

    if (limit !== undefined) {
      if (isNaN(limit) || limit < 1 || limit > 100) {
        errors.push("Limit must be between 1 and 100");
      }
    }

    return errors;
  },

  // Validate sort parameter
  validateSort(sort, allowedFields) {
    if (!sort) return [];

    const errors = [];
    const sortFields = sort.split(",");

    for (const field of sortFields) {
      const cleanField = field.startsWith("-") ? field.slice(1) : field;
      if (!allowedFields.includes(cleanField)) {
        errors.push(`Invalid sort field: ${cleanField}`);
      }
    }

    return errors;
  },

  // Validate date range
  validateDateRange(startDate, endDate) {
    const errors = [];

    if (startDate && !this.isValidDate(startDate)) {
      errors.push("Invalid start date format");
    }

    if (endDate && !this.isValidDate(endDate)) {
      errors.push("Invalid end date format");
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errors.push("Start date cannot be after end date");
    }

    return errors;
  },

  // Validate price range
  validatePriceRange(minPrice, maxPrice) {
    const errors = [];

    if (minPrice !== undefined && !this.isNonNegativeNumber(minPrice)) {
      errors.push("Minimum price must be a non-negative number");
    }

    if (maxPrice !== undefined && !this.isPositiveNumber(maxPrice)) {
      errors.push("Maximum price must be a positive number");
    }

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      Number(minPrice) > Number(maxPrice)
    ) {
      errors.push("Minimum price cannot be greater than maximum price");
    }

    return errors;
  },

  // Validate file upload
  validateFileUpload(file, allowedTypes = [], maxSize = 10 * 1024 * 1024) {
    const errors = [];

    if (!file) {
      errors.push("File is required");
      return errors;
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed`);
    }

    if (file.size > maxSize) {
      errors.push(
        `File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`
      );
    }

    return errors;
  },
};

module.exports = validationUtils;
