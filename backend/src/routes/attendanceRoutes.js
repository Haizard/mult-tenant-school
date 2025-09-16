const express = require('express');
const router = express.Router();
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');
const {
  getAttendanceRecords,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
  getStudentAttendanceHistory
} = require('../controllers/attendanceController');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(ensureTenantAccess);

// GET /api/attendance - Get all attendance records
router.get('/', 
  authorize(['attendance:read', 'attendance:manage']), 
  getAttendanceRecords
);

// POST /api/attendance - Mark attendance for students
router.post('/', 
  authorize(['attendance:create', 'attendance:manage']), 
  markAttendance
);

// PUT /api/attendance/:id - Update attendance record
router.put('/:id', 
  authorize(['attendance:update', 'attendance:manage']), 
  updateAttendance
);

// DELETE /api/attendance/:id - Delete attendance record
router.delete('/:id', 
  authorize(['attendance:delete', 'attendance:manage']), 
  deleteAttendance
);

// GET /api/attendance/stats - Get attendance statistics
router.get('/stats', 
  authorize(['attendance:read', 'attendance:manage']), 
  getAttendanceStats
);

// GET /api/attendance/student/:studentId - Get student attendance history
router.get('/student/:studentId', 
  authorize(['attendance:read', 'attendance:manage']), 
  getStudentAttendanceHistory
);

module.exports = router;
