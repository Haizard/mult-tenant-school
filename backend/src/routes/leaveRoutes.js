const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { ensureTenantAccess } = require('../middleware/tenantAccess');
const {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  getLeaveStats
} = require('../controllers/leaveController');

// Apply middleware to all routes
router.use(authenticate);
router.use(ensureTenantAccess);

// Routes
router.get('/', authorize(['attendance:read', 'attendance:manage']), getLeaveRequests);
router.post('/', authorize(['attendance:create', 'attendance:manage']), createLeaveRequest);
router.put('/:id', authorize(['attendance:update', 'attendance:manage']), updateLeaveRequest);
router.delete('/:id', authorize(['attendance:delete', 'attendance:manage']), deleteLeaveRequest);
router.get('/stats', authorize(['attendance:read', 'attendance:manage']), getLeaveStats);

module.exports = router;
