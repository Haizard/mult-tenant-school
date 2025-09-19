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

router.get('/courses/:id', 
  authorize(['courses:read']), 
  ensureTenantAccess, 
  academicController.getCourseById
);

router.delete('/courses/:id', 
  authorize(['courses:delete']), 
  ensureTenantAccess, 
  academicController.deleteCourse
);

// Subject Management Routes
router.get('/subjects', 
  authorize(['users:read']), 
  ensureTenantAccess, 
  async (req, res) => {
    try {
      console.log('Simple subjects test endpoint hit');
      res.json({ success: true, data: [], message: 'Test endpoint working' });
    } catch (error) {
      console.error('Test endpoint error:', error);
      res.status(500).json({ success: false, message: 'Test failed', error: error.message });
    }
  }
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

router.get('/subjects/:id', 
  authorize(['subjects:read']), 
  ensureTenantAccess, 
  academicController.getSubjectById
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

// Academic Year Management Routes
router.get('/academic-years', 
  authorize(['academic-years:read']), 
  ensureTenantAccess, 
  academicController.getAcademicYears
);

router.post('/academic-years', 
  authorize(['academic-years:create']), 
  ensureTenantAccess, 
  academicController.validateAcademicYear, 
  academicController.createAcademicYear
);

router.put('/academic-years/:id', 
  authorize(['academic-years:update']), 
  ensureTenantAccess, 
  academicController.validateAcademicYear, 
  academicController.updateAcademicYear
);

router.delete('/academic-years/:id', 
  authorize(['academic-years:delete']), 
  ensureTenantAccess, 
  academicController.deleteAcademicYear
);

// Class Management Routes
router.get('/classes', 
  authorize(['classes:read']), 
  ensureTenantAccess, 
  academicController.getClasses
);

router.post('/classes', 
  authorize(['classes:create']), 
  ensureTenantAccess, 
  academicController.validateClass, 
  academicController.createClass
);

router.put('/classes/:id', 
  authorize(['classes:update']), 
  ensureTenantAccess, 
  academicController.validateClass, 
  academicController.updateClass
);

router.get('/classes/:id', 
  authorize(['classes:read']), 
  ensureTenantAccess, 
  academicController.getClassById
);

router.delete('/classes/:id', 
  authorize(['classes:delete']), 
  ensureTenantAccess, 
  academicController.deleteClass
);

module.exports = router;


