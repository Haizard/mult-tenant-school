const express = require('express');
const router = express.Router();
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');
const {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  getLeaveStats
} = require('../controllers/leaveController');

// Apply middleware to all routes
router.use(authenticateToken);
router.use(ensureTenantAccess);

// Routes
router.get('/', authorize(['attendance:read', 'attendance:manage']), getLeaveRequests);
router.post('/', authorize(['attendance:create', 'attendance:manage']), createLeaveRequest);
router.put('/:id', authorize(['attendance:update', 'attendance:manage']), updateLeaveRequest);
router.delete('/:id', authorize(['attendance:delete', 'attendance:manage']), deleteLeaveRequest);
router.get('/stats', authorize(['attendance:read', 'attendance:manage']), getLeaveStats);

module.exports = router;
