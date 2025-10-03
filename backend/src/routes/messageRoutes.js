const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const {
  getMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage
} = require('../controllers/communicationController');

// Apply authentication to all routes
router.use(authenticateToken);

// Message Routes
router.get('/', authorize(['messages:read', 'messages:manage']), getMessages);
router.get('/:id', authorize(['messages:read', 'messages:manage']), getMessageById);
router.post('/', authorize(['messages:create', 'messages:manage']), createMessage);
router.put('/:id', authorize(['messages:update', 'messages:manage']), updateMessage);
router.delete('/:id', authorize(['messages:delete', 'messages:manage']), deleteMessage);

module.exports = router;
