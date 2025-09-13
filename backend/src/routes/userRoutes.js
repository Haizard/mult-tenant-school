const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');

// Allow user creation without authentication for initial setup
router.post('/', userController.validateUser, userController.register);

// Public routes for getting tenants and roles (needed for user creation form)
router.get('/tenants', userController.getTenants);
router.get('/roles', userController.getRoles);

// Protected routes (authentication required)
router.use(authenticateToken);

// System users route (Super Admin only) - must be before /:id route
router.get('/system', 
  authorize(['users:read']), 
  userController.getSystemUsers
);

// Public route for getting user by ID (needed for user detail/edit pages)
router.get('/:id', userController.getUserById);

// User management routes (require user management permissions)
router.get('/', 
  authorize(['users:read']), 
  ensureTenantAccess, 
  userController.getUsers
);

router.put('/:id', 
  authorize(['users:update']), 
  ensureTenantAccess, 
  userController.updateUser
);

router.delete('/:id', 
  authorize(['users:delete']), 
  ensureTenantAccess, 
  userController.deleteUser
);

module.exports = router;


