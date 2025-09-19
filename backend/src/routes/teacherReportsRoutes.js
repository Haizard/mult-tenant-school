const express = require('express');
const router = express.Router();
const teacherReportsController = require('../controllers/teacherReportsController');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/demographics', 
  authorize(['reports:read']), 
  ensureTenantAccess, 
  teacherReportsController.getTeacherDemographics
);

router.get('/performance', 
  authorize(['reports:read']), 
  ensureTenantAccess, 
  teacherReportsController.getPerformanceAnalytics
);

router.get('/workload', 
  authorize(['reports:read']), 
  ensureTenantAccess, 
  teacherReportsController.getWorkloadAnalysis
);

module.exports = router;