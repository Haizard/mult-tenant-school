const { body, param } = require('express-validator');
const { ASSIGNMENT_STATUS } = require('../../constants/hostelConstants');
const { handleValidationErrors } = require('./common');

// Assignment validation rules
const validateHostelAssignment = [
  body('studentId')
    .isInt({ min: 1 })
    .withMessage('Valid student ID is required'),
  body('hostelId')
    .isInt({ min: 1 })
    .withMessage('Valid hostel ID is required'),
  body('roomId')
    .isInt({ min: 1 })
    .withMessage('Valid room ID is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('monthlyFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly fee must be a non-negative number'),
  body('depositAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Deposit amount must be a non-negative number'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  handleValidationErrors
];

const validateHostelAssignmentUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid assignment ID format'),
  body('status')
    .optional()
    .isIn(Object.values(ASSIGNMENT_STATUS))
    .withMessage('Invalid assignment status'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  handleValidationErrors
];

module.exports = {
  validateHostelAssignment,
  validateHostelAssignmentUpdate
};
