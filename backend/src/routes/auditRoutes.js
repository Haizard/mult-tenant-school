const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Create audit log entry (public endpoint for logging)
router.post('/', auditController.createAuditLog);

// Get audit logs with filtering (requires audit logs read permission)
router.get('/', 
  authorize(['audit-logs:read']), 
  ensureTenantAccess, 
  auditController.getAuditLogs
);

// Get audit log by ID
router.get('/:id', 
  authorize(['audit-logs:read']), 
  ensureTenantAccess, 
  auditController.getAuditLogById
);

// Get audit log statistics
router.get('/stats/summary', 
  authorize(['audit-logs:read']), 
  ensureTenantAccess, 
  auditController.getAuditLogStats
);

module.exports = router;
