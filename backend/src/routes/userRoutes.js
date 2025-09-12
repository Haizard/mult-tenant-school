const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/register', userController.validateUser, userController.register);
router.post('/login', userController.validateLogin, userController.login);

// Protected routes (authentication required)
router.use(authenticateToken);

// User profile routes
router.get('/profile', userController.getProfile);

// User management routes (require user management permissions)
router.get('/users', 
  authorize(['users:read']), 
  ensureTenantAccess, 
  userController.getUsers
);

router.put('/users/:id', 
  authorize(['users:update']), 
  ensureTenantAccess, 
  userController.updateUser
);

router.delete('/users/:id', 
  authorize(['users:delete']), 
  ensureTenantAccess, 
  userController.deleteUser
);

module.exports = router;

