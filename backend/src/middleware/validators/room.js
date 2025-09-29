const { body, param } = require('express-validator');
const { ROOM_TYPES } = require('../../constants/constants');
const { handleValidationErrors } = require('./common');

// Runtime validation for ROOM_TYPES
if (!Array.isArray(ROOM_TYPES) || ROOM_TYPES.length === 0) {
  throw new Error('ROOM_TYPES must be a valid, non-empty array');
}

// Room validation rules
const validateHostelRoom = [
  body('hostelId')
    .isInt({ min: 1 })
    .withMessage('Valid hostel ID is required'),
  body('roomNumber')
    .notEmpty()
    .withMessage('Room number is required')
    .isLength({ min: 1, max: 20 })
    .withMessage('Room number must be between 1 and 20 characters'),
  body('capacity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Room capacity must be between 1 and 10'),
  body('roomType')
    .optional()
    .isIn(ROOM_TYPES)
    .withMessage('Invalid room type'),
  body('floorNumber')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Floor number must be a non-negative integer'),
  body('monthlyFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly fee must be a non-negative number'),
  body('amenities')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Amenities must not exceed 500 characters'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  handleValidationErrors
];

const validateHostelRoomUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid room ID format'),
  body('roomNumber')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('Room number must be between 1 and 20 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Room capacity must be between 1 and 10'),
  body('roomType')
    .optional()
    .isIn(ROOM_TYPES)
    .withMessage('Invalid room type'),
  body('floorNumber')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Floor number must be a non-negative integer'),
  body('monthlyFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly fee must be a non-negative number'),
  body('amenities')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Amenities must not exceed 500 characters'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  handleValidationErrors
];

module.exports = {
  validateHostelRoom,
  validateHostelRoomUpdate
};
