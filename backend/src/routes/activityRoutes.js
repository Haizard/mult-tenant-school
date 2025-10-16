const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);
router.use(ensureTenantAccess);

// Activity Management Routes
router.get('/', 
  authorize(['activities:read']), 
  activityController.getActivities
);

router.post('/', 
  authorize(['activities:create']), 
  activityController.createActivity
);

router.get('/:id', 
  authorize(['activities:read']), 
  activityController.getActivityById
);

router.put('/:id', 
  authorize(['activities:update']), 
  activityController.updateActivity
);

router.delete('/:id', 
  authorize(['activities:delete']), 
  activityController.deleteActivity
);

// Student Enrollment Routes
router.post('/:activityId/enroll', 
  authorize(['activities:update']), 
  activityController.enrollStudent
);

router.delete('/:activityId/students/:enrollmentId', 
  authorize(['activities:update']), 
  activityController.removeStudent
);

// Get student's activities
router.get('/students/:studentId/activities', 
  authorize(['activities:read']), 
  activityController.getStudentActivities
);

module.exports = router;

