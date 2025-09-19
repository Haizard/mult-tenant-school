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
router.get('/', getNotifications);
router.get('/stats', getNotificationStats);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);
router.post('/', authorize(['parents:create', 'parents:update']), createNotification);
router.post('/attendance-alert', authorize(['attendance:manage']), sendAttendanceAlert);

module.exports = router;
