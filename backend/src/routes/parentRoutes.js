const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Parent Management Routes
router.get('/', 
  authorize(['parents:read']), 
  ensureTenantAccess, 
  parentController.getParents
);

router.post('/', 
  authorize(['parents:create']), 
  ensureTenantAccess, 
  parentController.validateParent, 
  parentController.createParent
);

router.get('/:id', 
  authorize(['parents:read']), 
  ensureTenantAccess, 
  parentController.getParentById
);

router.put('/:id', 
  authorize(['parents:update']), 
  ensureTenantAccess, 
  parentController.validateParent, 
  parentController.updateParent
);

router.delete('/:id', 
  authorize(['parents:delete']), 
  ensureTenantAccess, 
  parentController.deleteParent
);

// Parent-Student Relationship Routes
router.get('/:id/students', 
  authorize(['parents:read']), 
  ensureTenantAccess, 
  parentController.getParentStudents
);

router.post('/:id/students', 
  authorize(['parents:update']), 
  ensureTenantAccess, 
  parentController.validateParentRelation, 
  parentController.createParentRelation
);

router.put('/:id/students/:relationId', 
  authorize(['parents:update']), 
  ensureTenantAccess, 
  parentController.validateParentRelation, 
  parentController.updateParentRelation
);

router.delete('/:id/students/:relationId', 
  authorize(['parents:update']), 
  ensureTenantAccess, 
  parentController.deleteParentRelation
);

// Parent Portal Routes (for parents to view their children's data)
router.get('/:id/children/:studentId/academic-records', 
  authorize(['parents:read']), 
  ensureTenantAccess, 
  parentController.getChildAcademicRecords
);

router.get('/:id/children/:studentId/attendance', 
  authorize(['parents:read']), 
  ensureTenantAccess, 
  parentController.getChildAttendance
);

router.get('/:id/children/:studentId/grades', 
  authorize(['parents:read']), 
  ensureTenantAccess, 
  parentController.getChildGrades
);

router.get('/:id/children/:studentId/schedule', 
  authorize(['parents:read']), 
  ensureTenantAccess, 
  parentController.getChildSchedule
);

router.get('/:id/children/:studentId/health-records', 
  authorize(['parents:read']), 
  ensureTenantAccess, 
  parentController.getChildHealthRecords
);

// Parent Statistics
router.get('/:id/statistics', 
  authorize(['parents:read']), 
  ensureTenantAccess, 
  parentController.getParentStatistics
);

module.exports = router;




