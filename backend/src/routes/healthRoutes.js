const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);
router.use(ensureTenantAccess);

// Health Records Routes
router.get('/students/:studentId/records', 
  authorize(['health:read']), 
  healthController.getHealthRecords
);

router.post('/students/:studentId/records', 
  authorize(['health:create']), 
  healthController.createHealthRecord
);

router.get('/students/:studentId/records/:recordId', 
  authorize(['health:read']), 
  healthController.getHealthRecordById
);

router.put('/students/:studentId/records/:recordId', 
  authorize(['health:update']), 
  healthController.updateHealthRecord
);

router.delete('/students/:studentId/records/:recordId', 
  authorize(['health:delete']), 
  healthController.deleteHealthRecord
);

// Health Summary
router.get('/students/:studentId/summary', 
  authorize(['health:read']), 
  healthController.getHealthSummary
);

module.exports = router;

