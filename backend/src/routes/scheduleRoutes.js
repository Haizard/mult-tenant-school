const express = require('express');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');
const {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getScheduleStats,
  exportSchedules,
  validateSchedule,
  validateScheduleUpdate
} = require('../controllers/scheduleController');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Schedule CRUD routes
router.get('/', authorize(['schedules:read']), ensureTenantAccess, getSchedules);
router.get('/stats', authorize(['schedules:read']), ensureTenantAccess, getScheduleStats);
router.get('/export', authorize(['schedules:read']), ensureTenantAccess, exportSchedules);
router.get('/:id', authorize(['schedules:read']), ensureTenantAccess, getScheduleById);
router.post('/', authorize(['schedules:create']), ensureTenantAccess, validateSchedule, createSchedule);
router.put('/:id', authorize(['schedules:update']), ensureTenantAccess, validateScheduleUpdate, updateSchedule);
router.delete('/:id', authorize(['schedules:delete']), ensureTenantAccess, deleteSchedule);

module.exports = router;
