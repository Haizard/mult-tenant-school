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
router.get('/', authorize(['leave:read', 'leave:manage']), getLeaveRequests);
router.post('/', authorize(['leave:create', 'leave:manage']), createLeaveRequest);
router.put('/:id', authorize(['leave:update', 'leave:manage']), updateLeaveRequest);
router.delete('/:id', authorize(['leave:delete', 'leave:manage']), deleteLeaveRequest);
router.get('/stats', authorize(['leave:read', 'leave:manage']), getLeaveStats);

module.exports = router;
