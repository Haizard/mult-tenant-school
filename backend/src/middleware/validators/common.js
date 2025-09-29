const { param, body } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
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

// Helper function for common string field validations
const stringField = (fieldName, minLength, maxLength, requiredMessage, lengthMessage) => {
  const validator = body(fieldName)
    .trim()
    .notEmpty()
    .withMessage(requiredMessage);

  // Only apply length validation if minLength or maxLength are valid numbers
  const lengthOptions = {};
  if (typeof minLength === 'number' && minLength >= 0) {
    lengthOptions.min = minLength;
  }
  if (typeof maxLength === 'number' && maxLength >= 0) {
    lengthOptions.max = maxLength;
  }

  // Apply isLength only if we have valid length constraints
  if (Object.keys(lengthOptions).length > 0) {
    validator.isLength(lengthOptions).withMessage(lengthMessage);
  }

  return validator;
};

// ID parameter validation with numeric ID
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Reusable validator helper functions
const idValidator = (fieldName, message = `Valid ${fieldName} is required`) => {
  return body(fieldName)
    .isInt({ min: 1 })
    .withMessage(message);
};

const isoDateValidator = (fieldName, message = `Valid ${fieldName} is required`) => {
  return body(fieldName)
    .isISO8601()
    .withMessage(message);
};

const statusValidator = (fieldName, validStatuses, message = 'Invalid status') => {
  return body(fieldName)
    .isIn(validStatuses)
    .withMessage(message);
};

const numericIdValidator = (fieldName, message = 'Invalid ID format') => {
  return param(fieldName)
    .isInt({ min: 1 })
    .withMessage(message);
};

module.exports = {
  handleValidationErrors,
  validateId,
  stringField,
  idValidator,
  isoDateValidator,
  statusValidator,
  numericIdValidator
};
