const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth');
const {
  getMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getMessageTemplates,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,
  getCommunicationLogs,
  sendBulkMessage,
  getMessageThread,
  replyToMessage,
  markMessageAsRead,
  getUnreadMessageCount,
  getCommunicationStats
} = require('../controllers/communicationController');

// Apply authentication to all routes
router.use(authenticateToken);

// Message Routes
router.get('/messages', authorize(['messages:read', 'messages:manage']), getMessages);
router.get('/messages/:id', authorize(['messages:read', 'messages:manage']), getMessageById);
router.post('/messages', authorize(['messages:create', 'messages:manage']), createMessage);
router.put('/messages/:id', authorize(['messages:update', 'messages:manage']), updateMessage);
router.delete('/messages/:id', authorize(['messages:delete', 'messages:manage']), deleteMessage);

// Announcement Routes
router.get('/announcements', authorize(['announcements:read', 'announcements:manage']), getAnnouncements);
router.get('/announcements/:id', authorize(['announcements:read', 'announcements:manage']), getAnnouncementById);
router.post('/announcements', authorize(['announcements:create', 'announcements:manage']), createAnnouncement);
router.put('/announcements/:id', authorize(['announcements:update', 'announcements:manage']), updateAnnouncement);
router.delete('/announcements/:id', authorize(['announcements:delete', 'announcements:manage']), deleteAnnouncement);

// Message Template Routes
router.get('/templates', authorize(['templates:read', 'templates:manage']), getMessageTemplates);
router.post('/templates', authorize(['templates:create', 'templates:manage']), createMessageTemplate);
router.put('/templates/:id', authorize(['templates:update', 'templates:manage']), updateMessageTemplate);
router.delete('/templates/:id', authorize(['templates:delete', 'templates:manage']), deleteMessageTemplate);

// Communication Log Routes
router.get('/logs', authorize(['communication:read', 'communication:manage']), getCommunicationLogs);

// Bulk Messaging Routes
router.post('/messages/bulk', authorize(['messages:create', 'messages:manage']), sendBulkMessage);

// Message Threading Routes
router.get('/messages/thread/:threadId', authorize(['messages:read', 'messages:manage']), getMessageThread);
router.post('/messages/:id/reply', authorize(['messages:create', 'messages:manage']), replyToMessage);

// Read Receipt Routes
router.put('/messages/:id/read', authorize(['messages:update', 'messages:manage']), markMessageAsRead);
router.get('/messages/unread/count', authorize(['messages:read', 'messages:manage']), getUnreadMessageCount);

// Analytics Routes
router.get('/stats', authorize(['communication:read', 'communication:manage']), getCommunicationStats);

module.exports = router;
