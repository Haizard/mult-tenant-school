const express = require('express');
const { authenticateToken: authenticate, authorize } = require('../middleware/auth');
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
router.use(authenticate);

// Schedule CRUD routes
router.get('/', authorize(['schedules:read']), getSchedules);
router.get('/stats', authorize(['schedules:read']), getScheduleStats);
router.get('/export', authorize(['schedules:read']), exportSchedules);
router.get('/:id', authorize(['schedules:read']), getScheduleById);
router.post('/', authorize(['schedules:create']), validateSchedule, createSchedule);
router.put('/:id', authorize(['schedules:update']), validateScheduleUpdate, updateSchedule);
router.delete('/:id', authorize(['schedules:delete']), deleteSchedule);

module.exports = router;
