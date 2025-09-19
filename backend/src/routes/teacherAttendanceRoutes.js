const express = require('express');
const router = express.Router();
const teacherAttendanceController = require('../controllers/teacherAttendanceController');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', 
  authorize(['teachers:read']), 
  ensureTenantAccess, 
  teacherAttendanceController.getTeacherAttendance
);

router.post('/mark', 
  authorize(['teachers:update']), 
  ensureTenantAccess, 
  teacherAttendanceController.markAttendance
);

router.get('/summary', 
  authorize(['teachers:read']), 
  ensureTenantAccess, 
  teacherAttendanceController.getAttendanceSummary
);

module.exports = router;