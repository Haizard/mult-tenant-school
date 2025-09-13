const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Public routes (no authentication required)
router.post('/login', userController.validateLogin, userController.login);
router.post('/register', userController.validateUser, userController.register);
router.post('/logout', userController.logout);
router.post('/refresh', userController.refreshToken);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Protected routes (authentication required)
const { authenticateToken } = require('../middleware/auth');
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/change-password', authenticateToken, userController.changePassword);

module.exports = router;