const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// ============================================
// AI TUTOR PROFILE ROUTES
// ============================================

// Get all available tutors
router.get('/tutors',
  authorize(['chatbot:read']),
  chatbotController.getTutors
);

// Get tutor by ID
router.get('/tutors/:id',
  authorize(['chatbot:read']),
  chatbotController.getTutorById
);

// Create new tutor (Admin only)
router.post('/tutors',
  authorize(['chatbot:create']),
  ensureTenantAccess,
  chatbotController.createTutor
);

// ============================================
// CONVERSATION ROUTES
// ============================================

// Get all conversations for current user
router.get('/conversations',
  authorize(['chatbot:read']),
  ensureTenantAccess,
  chatbotController.getConversations
);

// Get conversation by ID
router.get('/conversations/:id',
  authorize(['chatbot:read']),
  ensureTenantAccess,
  chatbotController.getConversationById
);

// Start new conversation
router.post('/conversations',
  authorize(['chatbot:create']),
  ensureTenantAccess,
  chatbotController.startConversation
);

// ============================================
// MESSAGE ROUTES
// ============================================

// Send message to conversation
router.post('/conversations/:conversationId/messages',
  authorize(['chatbot:create']),
  ensureTenantAccess,
  chatbotController.sendMessage
);

module.exports = router;

