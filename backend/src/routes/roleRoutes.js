const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Role management routes
router.get('/roles', 
  authorize(['roles:read']), 
  ensureTenantAccess, 
  roleController.getRoles
);

router.post('/roles', 
  authorize(['roles:create']), 
  ensureTenantAccess, 
  roleController.validateRole, 
  roleController.createRole
);

router.put('/roles/:id', 
  authorize(['roles:update']), 
  ensureTenantAccess, 
  roleController.validateRole, 
  roleController.updateRole
);

router.delete('/roles/:id', 
  authorize(['roles:delete']), 
  ensureTenantAccess, 
  roleController.deleteRole
);

// Permission routes
router.get('/permissions', 
  authorize(['permissions:read']), 
  roleController.getPermissions
);

module.exports = router;


