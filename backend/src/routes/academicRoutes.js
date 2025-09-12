const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Course Management Routes
router.get('/courses', 
  authorize(['courses:read']), 
  ensureTenantAccess, 
  academicController.getCourses
);

router.post('/courses', 
  authorize(['courses:create']), 
  ensureTenantAccess, 
  academicController.validateCourse, 
  academicController.createCourse
);

router.put('/courses/:id', 
  authorize(['courses:update']), 
  ensureTenantAccess, 
  academicController.validateCourse, 
  academicController.updateCourse
);

router.delete('/courses/:id', 
  authorize(['courses:delete']), 
  ensureTenantAccess, 
  academicController.deleteCourse
);

// Subject Management Routes
router.get('/subjects', 
  authorize(['subjects:read']), 
  ensureTenantAccess, 
  academicController.getSubjects
);

router.post('/subjects', 
  authorize(['subjects:create']), 
  ensureTenantAccess, 
  academicController.validateSubject, 
  academicController.createSubject
);

router.put('/subjects/:id', 
  authorize(['subjects:update']), 
  ensureTenantAccess, 
  academicController.validateSubject, 
  academicController.updateSubject
);

router.delete('/subjects/:id', 
  authorize(['subjects:delete']), 
  ensureTenantAccess, 
  academicController.deleteSubject
);

// Teacher-Subject Assignment Routes
router.get('/teacher-subjects', 
  authorize(['subjects:read']), 
  ensureTenantAccess, 
  academicController.getTeacherSubjects
);

router.post('/teacher-subjects', 
  authorize(['subjects:update']), 
  ensureTenantAccess, 
  academicController.validateTeacherSubject, 
  academicController.assignTeacherToSubject
);

router.delete('/teacher-subjects/:id', 
  authorize(['subjects:update']), 
  ensureTenantAccess, 
  academicController.removeTeacherFromSubject
);

module.exports = router;


