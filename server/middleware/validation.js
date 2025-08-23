import { validationResult } from 'express-validator';

/**
 * Generic validation middleware
 * Checks for validation errors from express-validator
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  next();
};

/**
 * Validation middleware creator
 * Creates validation middleware with custom error handling
 */
export const createValidation = (validationRules) => {
  return [
    ...validationRules,
    validateRequest
  ];
};

/**
 * Common validation patterns
 */
export const commonValidations = {
  // MongoDB ObjectId validation
  objectId: (field = 'id') => ({
    isMongoId: {
      errorMessage: `${field} must be a valid MongoDB ObjectId`
    }
  }),
  
  // Email validation
  email: {
    isEmail: {
      errorMessage: 'Must be a valid email address'
    },
    normalizeEmail: true
  },
  
  // Required string validation
  requiredString: (field) => ({
    notEmpty: {
      errorMessage: `${field} is required`
    },
    isString: {
      errorMessage: `${field} must be a string`
    },
    trim: true
  }),
  
  // Optional string validation
  optionalString: {
    optional: true,
    isString: {
      errorMessage: 'Must be a string'
    },
    trim: true
  },
  
  // Pagination validation
  pagination: {
    page: {
      optional: { options: { nullable: true } },
      isInt: {
        options: { min: 1 },
        errorMessage: 'Page must be a positive integer'
      },
      toInt: true
    },
    limit: {
      optional: { options: { nullable: true } },
      isInt: {
        options: { min: 1, max: 100 },
        errorMessage: 'Limit must be between 1 and 100'
      },
      toInt: true
    }
  }
};
