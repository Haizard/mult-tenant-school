const express = require('express');
const router = express.Router();
const {
  // Hostel Management
  getHostels,
  createHostel,
  updateHostel,
  deleteHostel,
  
  // Room Management
  getHostelRooms,
  createHostelRoom,
  updateHostelRoom,
  deleteHostelRoom,
  
  // Assignment Management
  getHostelAssignments,
  createHostelAssignment,
  updateHostelAssignment,
  deleteHostelAssignment,
  
  // Maintenance Management
  getHostelMaintenance,
  createHostelMaintenance,
  updateHostelMaintenance,
  deleteHostelMaintenance,
  
  // Reports
  getHostelReports,
  createHostelReport,
  deleteHostelReport,
  
  // Statistics
  getHostelStats,
} = require('../controllers/hostelController');

// Import middleware
const { authenticateToken, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  validateHostel,
  validateHostelUpdate,
  validateHostelRoom,
  validateHostelRoomUpdate,
  validateHostelAssignment,
  validateHostelAssignmentUpdate,
  validateHostelMaintenance,
  validateHostelMaintenanceUpdate,
  validateHostelReport,
  validateId,
  validateHostelResourceId
} = require('../middleware');

// Hostel Management Routes
router.get('/', authenticateToken, asyncHandler(getHostels));
router.post('/', authenticateToken, authorize(['hostel:create']), validateHostel, asyncHandler(createHostel));

// Room Management Routes
router.get('/rooms', authenticateToken, asyncHandler(getHostelRooms));
router.post('/rooms', authenticateToken, authorize(['hostel:create']), validateHostelRoom, asyncHandler(createHostelRoom));
router.patch('/rooms/:id', authenticateToken, authorize(['hostel:update']), validateHostelRoomUpdate, asyncHandler(updateHostelRoom));
router.delete('/rooms/:id', authenticateToken, authorize(['hostel:delete']), validateId, asyncHandler(deleteHostelRoom));

// Assignment Management Routes
router.get('/assignments', authenticateToken, asyncHandler(getHostelAssignments));
router.post('/assignments', authenticateToken, authorize(['hostel:create']), validateHostelAssignment, asyncHandler(createHostelAssignment));
router.patch('/assignments/:id', authenticateToken, authorize(['hostel:update']), validateHostelAssignmentUpdate, asyncHandler(updateHostelAssignment));
router.delete('/assignments/:id', authenticateToken, authorize(['hostel:delete']), validateId, asyncHandler(deleteHostelAssignment));

// Maintenance Management Routes
router.get('/maintenance', authenticateToken, asyncHandler(getHostelMaintenance));
router.post('/maintenance', authenticateToken, authorize(['hostel:create']), validateHostelMaintenance, asyncHandler(createHostelMaintenance));
router.patch('/maintenance/:id', authenticateToken, authorize(['hostel:update']), validateHostelMaintenanceUpdate, asyncHandler(updateHostelMaintenance));
router.delete('/maintenance/:id', authenticateToken, authorize(['hostel:delete']), validateId, asyncHandler(deleteHostelMaintenance));

// Reports Routes
router.get('/reports', authenticateToken, asyncHandler(getHostelReports));
router.post('/reports', authenticateToken, authorize(['hostel:create']), validateHostelReport, asyncHandler(createHostelReport));
router.delete('/reports/:id', authenticateToken, authorize(['hostel:delete']), validateId, asyncHandler(deleteHostelReport));

// Statistics Route
router.get('/stats', authenticateToken, asyncHandler(getHostelStats));

// Generic param-based routes (must come after specific paths)
router.patch('/:id', authenticateToken, authorize(['hostel:update']), validateHostelResourceId, validateHostelUpdate, asyncHandler(updateHostel));
router.delete('/:id', authenticateToken, authorize(['hostel:delete']), validateHostelResourceId, asyncHandler(deleteHostel));

module.exports = router;
