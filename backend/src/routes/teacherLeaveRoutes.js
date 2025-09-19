const express = require('express');
const router = express.Router();
const teacherLeaveController = require('../controllers/teacherLeaveController');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', 
  authorize(['teachers:read']), 
  ensureTenantAccess, 
  teacherLeaveController.getTeacherLeaves
);

router.post('/', 
  authorize(['teachers:create']), 
  ensureTenantAccess, 
  teacherLeaveController.createLeaveRequest
);

router.put('/:id/status', 
  authorize(['teachers:update']), 
  ensureTenantAccess, 
  teacherLeaveController.updateLeaveStatus
);

module.exports = router;