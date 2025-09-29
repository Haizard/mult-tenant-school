/**
 * Central aggregator for all route validators
 * This module serves as a single entry point for importing validation middleware
 * across the entire project, making it easy to access validators from any module.
 */

// Import all validators from resource-specific modules
const {
  validateHostel,
  validateHostelUpdate,
  validateHostelId
} = require('./validators/hostel');
const {
  validateHostelRoom,
  validateHostelRoomUpdate
} = require('./validators/room');
const {
  validateHostelAssignment,
  validateHostelAssignmentUpdate
} = require('./validators/assignment');
const {
  validateHostelMaintenance,
  validateHostelMaintenanceUpdate
} = require('./validators/maintenance');
const {
  validateHostelReport
} = require('./validators/report');
const {
  handleValidationErrors,
  validateId
} = require('./validators/common');

// Export all validators for easy access throughout the project
module.exports = {
  // Hostel validators
  validateHostel,
  validateHostelUpdate,
  validateHostelResourceId: validateHostelId,
  
  // Room validators
  validateHostelRoom,
  validateHostelRoomUpdate,
  
  // Assignment validators
  validateHostelAssignment,
  validateHostelAssignmentUpdate,
  
  // Maintenance validators
  validateHostelMaintenance,
  validateHostelMaintenanceUpdate,
  
  // Report validators
  validateHostelReport,
  
  // Common validators
  validateId,
  handleValidationErrors
}
