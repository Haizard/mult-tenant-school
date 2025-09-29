// Shared validation messages for consistent error reporting
const VALIDATION_MESSAGES = {
  // Report validation messages
  REPORT: {
    TITLE_REQUIRED: 'Report title is required',
    TITLE_LENGTH: 'Title must be between 5 and 100 characters',
    CONTENT_REQUIRED: 'Report content is required',
    CONTENT_LENGTH: 'Content must be between 20 and 2000 characters',
    TYPE_INVALID: 'Invalid report type'
  },
  
  // Common validation messages
  COMMON: {
    REQUIRED: 'This field is required',
    INVALID_FORMAT: 'Invalid format',
    INVALID_TYPE: 'Invalid type'
  }
};

module.exports = {
  VALIDATION_MESSAGES
};
