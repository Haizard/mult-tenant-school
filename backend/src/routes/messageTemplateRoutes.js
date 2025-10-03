const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const {
  getMessageTemplates,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate
} = require('../controllers/communicationController');

// Apply authentication to all routes
router.use(authenticateToken);

// Message Template Routes
router.get('/', authorize(['templates:read', 'templates:manage']), getMessageTemplates);
router.post('/', authorize(['templates:create', 'templates:manage']), createMessageTemplate);
router.put('/:id', authorize(['templates:update', 'templates:manage']), updateMessageTemplate);
router.delete('/:id', authorize(['templates:delete', 'templates:manage']), deleteMessageTemplate);

module.exports = router;
