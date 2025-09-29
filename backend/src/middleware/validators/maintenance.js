/**
 * Maintenance Validators
 * 
 * This module provides validation middleware for hostel maintenance operations.
 * It validates both creation and update requests for maintenance records.
 * 
 * Expected Constants (must be arrays):
 * - MAINTENANCE_ISSUE_TYPES: Array of valid issue types (e.g., ['ELECTRICAL', 'PLUMBING', 'STRUCTURAL'])
 * - MAINTENANCE_PRIORITY: Array of valid priority levels (e.g., ['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
 * - MAINTENANCE_STATUS: Array of valid status values (e.g., ['PENDING', 'IN_PROGRESS', 'COMPLETED'])
 * 
 * Data Shape Validated:
 * - Create: { roomId: number, issueType: string, description: string, priority: string }
 * - Update: { status?: string, priority?: string, description?: string } (at least one required)
 */

const { body, param } = require('express-validator');
const { MAINTENANCE_TYPE, MAINTENANCE_STATUS, PRIORITY } = require('../../constants/hostelConstants');
const { handleValidationErrors } = require('./common');

// Helper function to ensure constants are arrays for isIn validation
const ensureArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  // If it's an object, extract values, otherwise wrap in array
  return typeof value === 'object' && value !== null ? Object.values(value) : [value];
};

// Maintenance creation validation rules
const validateHostelMaintenance = [
  body('hostelId')
    .isInt({ min: 1 })
    .withMessage('Valid hostel ID is required'),
  body('roomId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid room ID is required'),
  body('maintenanceType')
    .isIn(ensureArray(MAINTENANCE_TYPE))
    .withMessage('Invalid maintenance type'),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('priority')
    .isIn(ensureArray(PRIORITY))
    .withMessage('Invalid priority level'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),
  body('vendor')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Vendor name must not exceed 100 characters'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  handleValidationErrors
];

const validateHostelMaintenanceUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid maintenance ID format'),
  body('maintenanceType')
    .optional()
    .isIn(ensureArray(MAINTENANCE_TYPE))
    .withMessage('Invalid maintenance type'),
  body('title')
    .optional()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('priority')
    .optional()
    .isIn(ensureArray(PRIORITY))
    .withMessage('Invalid priority level'),
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  body('completedDate')
    .optional()
    .isISO8601()
    .withMessage('Valid completed date is required'),
  body('status')
    .optional()
    .isIn(ensureArray(MAINTENANCE_STATUS))
    .withMessage('Invalid maintenance status'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),
  body('vendor')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Vendor name must not exceed 100 characters'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  handleValidationErrors
];

module.exports = {
  validateHostelMaintenance,
  validateHostelMaintenanceUpdate
};
