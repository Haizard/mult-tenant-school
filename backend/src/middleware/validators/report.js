const { body } = require('express-validator');
const { REPORT_TYPE } = require('../../constants/hostelConstants');
const { 
  REPORT_TITLE_MIN, 
  REPORT_TITLE_MAX, 
  REPORT_CONTENT_MIN, 
  REPORT_CONTENT_MAX 
} = require('../../constants/reportLimits');
const { VALIDATION_MESSAGES } = require('../../constants/validationMessages');
const { handleValidationErrors, stringField } = require('./common');

/**
 * Report Validation Factory Function
 * 
 * Creates a validation middleware for report creation/updates with configurable options.
 * 
 * Expected Request Body Shape:
 * @typedef {Object} ReportBody
 * @property {string} reportType - Type of report (must be one of allowed types)
 * @property {string} title - Report title (configurable min-max characters, trimmed)
 * @property {string} content - Report content (configurable min-max characters, trimmed)
 * 
 * Sanitization Rules Applied:
 * - All string fields are trimmed of leading/trailing whitespace
 * - Empty strings are rejected for required fields
 * - Length validation enforces minimum and maximum character limits
 * - reportType must match predefined constants
 * 
 * @param {Object} options - Configuration options for the validator
 * @param {Array} options.allowedTypes - Array of allowed report types (defaults to REPORT_TYPES)
 * @param {number} options.titleMin - Minimum title length (defaults to REPORT_TITLE_MIN)
 * @param {number} options.titleMax - Maximum title length (defaults to REPORT_TITLE_MAX)
 * @param {number} options.contentMin - Minimum content length (defaults to REPORT_CONTENT_MIN)
 * @param {number} options.contentMax - Maximum content length (defaults to REPORT_CONTENT_MAX)
 * @param {string} options.typeMessage - Custom message for invalid report type
 * @param {string} options.titleRequiredMessage - Custom message for required title
 * @param {string} options.titleLengthMessage - Custom message for title length validation
 * @param {string} options.contentRequiredMessage - Custom message for required content
 * @param {string} options.contentLengthMessage - Custom message for content length validation
 * @returns {Array} Express-validator middleware chain
 */
const createReportValidator = (options = {}) => {
  const {
    allowedTypes = Object.values(REPORT_TYPE),
    titleMin = REPORT_TITLE_MIN,
    titleMax = REPORT_TITLE_MAX,
    contentMin = REPORT_CONTENT_MIN,
    contentMax = REPORT_CONTENT_MAX,
    typeMessage = VALIDATION_MESSAGES.REPORT.TYPE_INVALID,
    titleRequiredMessage = VALIDATION_MESSAGES.REPORT.TITLE_REQUIRED,
    titleLengthMessage = VALIDATION_MESSAGES.REPORT.TITLE_LENGTH,
    contentRequiredMessage = VALIDATION_MESSAGES.REPORT.CONTENT_REQUIRED,
    contentLengthMessage = VALIDATION_MESSAGES.REPORT.CONTENT_LENGTH
  } = options;

  return [
    body('hostelId')
      .isInt({ min: 1 })
      .withMessage('Valid hostel ID is required'),
    body('reportType')
      .isIn(allowedTypes)
      .withMessage(typeMessage),
    stringField(
      'title',
      titleMin,
      titleMax,
      titleRequiredMessage,
      titleLengthMessage
    ),
    body('parameters')
      .optional()
      .isObject()
      .withMessage('Parameters must be an object'),
    body('data')
      .optional()
      .isObject()
      .withMessage('Data must be an object'),
    body('format')
      .optional()
      .isIn(['JSON', 'PDF', 'CSV', 'EXCEL'])
      .withMessage('Format must be one of: JSON, PDF, CSV, EXCEL'),
    handleValidationErrors
  ];
};

/**
 * Hostel Report Validation Middleware
 * 
 * Pre-configured validator for hostel reports using default settings.
 * 
 * @returns {Array} Express-validator middleware chain
 */
const validateHostelReport = createReportValidator();

module.exports = {
  validateHostelReport,
  createReportValidator
};
