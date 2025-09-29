const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./common');

// Hostel validation rules
const validateHostel = [
  body('name')
    .notEmpty()
    .withMessage('Hostel name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Hostel name must be between 2 and 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be between 5 and 500 characters'),
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 5, max: 255 })
    .withMessage('Address must be between 5 and 255 characters'),
  body('totalCapacity')
    .isInt({ min: 1 })
    .withMessage('Total capacity must be a positive integer'),
  body('monthlyFee')
    .isFloat({ min: 0 })
    .withMessage('Monthly fee must be a non-negative number'),
  body('wardenName')
    .notEmpty()
    .withMessage('Warden name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Warden name must be between 2 and 100 characters'),
  body('wardenEmail')
    .isEmail()
    .withMessage('Valid warden email is required'),
  body('wardenPhone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid warden phone number is required'),
  handleValidationErrors
];

const validateHostelUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid hostel ID format'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hostel name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be between 5 and 500 characters'),
  body('address')
    .optional()
    .isLength({ min: 5, max: 255 })
    .withMessage('Address must be between 5 and 255 characters'),
  body('totalCapacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total capacity must be a positive integer'),
  body('monthlyFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly fee must be a non-negative number'),
  body('wardenName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Warden name must be between 2 and 100 characters'),
  body('wardenEmail')
    .optional()
    .isEmail()
    .withMessage('Valid warden email is required'),
  body('wardenPhone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid warden phone number is required'),
  handleValidationErrors
];

// Hostel ID validation with numeric ID
const validateHostelId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid hostel ID format'),
  handleValidationErrors
];

module.exports = {
  validateHostel,
  validateHostelUpdate,
  validateHostelId
};
