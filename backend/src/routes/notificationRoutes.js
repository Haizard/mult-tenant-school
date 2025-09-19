const express = require('express');
const router = express.Router();
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  sendAttendanceAlert,
  getNotificationStats
} = require('../controllers/notificationController');

// Apply middleware to all routes
router.use(authenticateToken);
router.use(ensureTenantAccess);

// Routes
router.get('/', authorize(['notifications:read', 'notifications:manage']), getNotifications);
router.get('/stats', authorize(['notifications:read', 'notifications:manage']), getNotificationStats);
router.put('/:id/read', authorize(['notifications:update', 'notifications:manage']), markAsRead);
router.put('/read-all', authorize(['notifications:update', 'notifications:manage']), markAllAsRead);
router.delete('/:id', authorize(['notifications:delete', 'notifications:manage']), deleteNotification);
router.post('/', authorize(['notifications:create', 'notifications:manage']), createNotification);
router.post('/attendance-alert', authorize(['attendance:manage']), sendAttendanceAlert);

module.exports = router;
