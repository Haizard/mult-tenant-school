const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Teacher Management Routes
router.get('/', 
  authorize(['teachers:read']), 
  ensureTenantAccess, 
  teacherController.getTeachers
);

router.post('/', 
  authorize(['teachers:create']), 
  ensureTenantAccess, 
  teacherController.createTeacher
);

router.get('/:id', 
  authorize(['teachers:read']), 
  ensureTenantAccess, 
  teacherController.getTeacher
);

router.put('/:id', 
  authorize(['teachers:update']), 
  ensureTenantAccess, 
  teacherController.updateTeacher
);

router.delete('/:id', 
  authorize(['teachers:delete']), 
  ensureTenantAccess, 
  teacherController.deleteTeacher
);

// Teacher Subject Assignment Routes
router.get('/:teacherId/subjects', 
  authorize(['teachers:read']), 
  ensureTenantAccess, 
  teacherController.getTeacherSubjects
);

router.post('/:teacherId/subjects', 
  authorize(['teachers:update']), 
  ensureTenantAccess, 
  teacherController.assignSubjectToTeacher
);

router.delete('/:teacherId/subjects/:subjectId', 
  authorize(['teachers:update']), 
  ensureTenantAccess, 
  teacherController.removeSubjectFromTeacher
);

// Teacher Qualification Routes
router.get('/:teacherId/qualifications', 
  authorize(['teachers:read']), 
  ensureTenantAccess, 
  teacherController.getTeacherQualifications
);

router.post('/:teacherId/qualifications', 
  authorize(['teachers:update']), 
  ensureTenantAccess, 
  teacherController.addTeacherQualification
);

router.put('/:teacherId/qualifications/:qualificationId', 
  authorize(['teachers:update']), 
  ensureTenantAccess, 
  teacherController.updateTeacherQualification
);

router.delete('/:teacherId/qualifications/:qualificationId', 
  authorize(['teachers:update']), 
  ensureTenantAccess, 
  teacherController.deleteTeacherQualification
);

module.exports = router;
