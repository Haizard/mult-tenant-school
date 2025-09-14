const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Student Management Routes
router.get('/', 
  authorize(['students:read']), 
  ensureTenantAccess, 
  studentController.getStudents
);

router.post('/', 
  authorize(['students:create']), 
  ensureTenantAccess, 
  studentController.validateStudent, 
  studentController.createStudent
);

router.get('/:id', 
  authorize(['students:read']), 
  ensureTenantAccess, 
  studentController.getStudentById
);

router.put('/:id', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.validateStudent, 
  studentController.updateStudent
);

router.delete('/:id', 
  authorize(['students:delete']), 
  ensureTenantAccess, 
  studentController.deleteStudent
);

// Student Enrollment Routes
router.get('/:id/enrollments', 
  authorize(['students:read']), 
  ensureTenantAccess, 
  studentController.getStudentEnrollments
);

router.post('/:id/enrollments', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.validateEnrollment, 
  studentController.createEnrollment
);

router.put('/:id/enrollments/:enrollmentId', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.validateEnrollment, 
  studentController.updateEnrollment
);

router.delete('/:id/enrollments/:enrollmentId', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.deleteEnrollment
);

// Student Academic Records Routes
router.get('/:id/academic-records', 
  authorize(['students:read']), 
  ensureTenantAccess, 
  studentController.getStudentAcademicRecords
);

router.post('/:id/academic-records', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.validateAcademicRecord, 
  studentController.createAcademicRecord
);

router.put('/:id/academic-records/:recordId', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.validateAcademicRecord, 
  studentController.updateAcademicRecord
);

router.delete('/:id/academic-records/:recordId', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.deleteAcademicRecord
);

// Parent-Student Relationship Routes
router.get('/:id/parents', 
  authorize(['students:read']), 
  ensureTenantAccess, 
  studentController.getStudentParents
);

router.post('/:id/parents', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.validateParentRelation, 
  studentController.createParentRelation
);

router.put('/:id/parents/:relationId', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.validateParentRelation, 
  studentController.updateParentRelation
);

router.delete('/:id/parents/:relationId', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.deleteParentRelation
);

// Health Records Routes
router.get('/:id/health-records', 
  authorize(['students:read']), 
  ensureTenantAccess, 
  studentController.getStudentHealthRecords
);

router.post('/:id/health-records', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.validateHealthRecord, 
  studentController.createHealthRecord
);

router.put('/:id/health-records/:recordId', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.validateHealthRecord, 
  studentController.updateHealthRecord
);

router.delete('/:id/health-records/:recordId', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.deleteHealthRecord
);

// Student Documents Routes
router.get('/:id/documents', 
  authorize(['students:read']), 
  ensureTenantAccess, 
  studentController.getStudentDocuments
);

router.post('/:id/documents', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.validateDocument, 
  studentController.createDocument
);

router.put('/:id/documents/:documentId', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.validateDocument, 
  studentController.updateDocument
);

router.delete('/:id/documents/:documentId', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.deleteDocument
);

// Attendance Routes
router.get('/:id/attendance', 
  authorize(['students:read']), 
  ensureTenantAccess, 
  studentController.getStudentAttendance
);

router.post('/:id/attendance', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.validateAttendance, 
  studentController.createAttendance
);

router.put('/:id/attendance/:attendanceId', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.validateAttendance, 
  studentController.updateAttendance
);

router.delete('/:id/attendance/:attendanceId', 
  authorize(['students:update']), 
  ensureTenantAccess, 
  studentController.deleteAttendance
);

// Student Statistics
router.get('/:id/statistics', 
  authorize(['students:read']), 
  ensureTenantAccess, 
  studentController.getStudentStatistics
);

module.exports = router;
