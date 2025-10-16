const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// ============================================
// AI TUTOR PROFILE MANAGEMENT
// ============================================

const getTutors = async (req, res) => {
  try {
    const { subject } = req.query;
    
    const where = { isActive: true };
    if (subject) {
      where.subjectName = subject;
    }

    const tutors = await prisma.aiTutorProfile.findMany({
      where,
      include: {
        conversations: {
          select: { id: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: tutors,
      message: 'Tutors retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutors',
      error: error.message
    });
  }
};

const getTutorById = async (req, res) => {
  try {
    const { id } = req.params;

    const tutor = await prisma.aiTutorProfile.findUnique({
      where: { id },
      include: {
        knowledgeBase: true,
        conversations: {
          select: { id: true, topic: true }
        }
      }
    });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: tutor,
      message: 'Tutor retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching tutor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor',
      error: error.message
    });
  }
};

const createTutor = async (req, res) => {
  try {
    const { tutorName, subjectName, subjectCode, expertiseLevel, teachingStyle, systemPrompt } = req.body;

    if (!tutorName || !subjectName) {
      return res.status(400).json({
        success: false,
        message: 'Tutor name and subject name are required'
      });
    }

    const tutor = await prisma.aiTutorProfile.create({
      data: {
        id: uuidv4(),
        tutorName,
        subjectName,
        subjectCode,
        expertiseLevel: expertiseLevel || 'intermediate',
        teachingStyle,
        systemPrompt,
        createdBy: req.user?.id
      }
    });

    res.status(201).json({
      success: true,
      data: tutor,
      message: 'Tutor created successfully'
    });
  } catch (error) {
    console.error('Error creating tutor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tutor',
      error: error.message
    });
  }
};

// ============================================
// CONVERSATION MANAGEMENT
// ============================================

const startConversation = async (req, res) => {
  try {
    const { tutorId, topic, mode } = req.body;
    const tenantId = req.tenantId;
    const userId = req.user.id;

    if (!tutorId) {
      return res.status(400).json({
        success: false,
        message: 'Tutor ID is required'
      });
    }

    // Verify tutor exists
    const tutor = await prisma.aiTutorProfile.findUnique({
      where: { id: tutorId }
    });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    const conversation = await prisma.chatbotConversation.create({
      data: {
        id: uuidv4(),
        tenantId,
        userId,
        tutorId,
        topic,
        mode: mode || 'learning',
        conversationTitle: `${tutor.subjectName} - ${topic || 'General'}`
      }
    });

    res.status(201).json({
      success: true,
      data: conversation,
      message: 'Conversation started successfully'
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start conversation',
      error: error.message
    });
  }
};

const getConversations = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.id;
    const { status } = req.query;

    const where = { tenantId, userId };
    if (status) {
      where.status = status;
    }

    const conversations = await prisma.chatbotConversation.findMany({
      where,
      include: {
        tutor: {
          select: { id: true, tutorName: true, subjectName: true }
        },
        messages: {
          select: { id: true, senderType: true, createdAt: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: conversations,
      message: 'Conversations retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
};

const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const conversation = await prisma.chatbotConversation.findFirst({
      where: { id, tenantId },
      include: {
        tutor: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: conversation,
      message: 'Conversation retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation',
      error: error.message
    });
  }
};

// ============================================
// MESSAGE MANAGEMENT
// ============================================

const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { messageContent, messageType } = req.body;
    const tenantId = req.tenantId;

    if (!messageContent) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Verify conversation exists and belongs to tenant
    const conversation = await prisma.chatbotConversation.findFirst({
      where: { id: conversationId, tenantId }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Create student message
    const message = await prisma.chatbotMessage.create({
      data: {
        id: uuidv4(),
        conversationId,
        senderType: 'student',
        messageContent,
        messageType: messageType || 'text'
      }
    });

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

module.exports = {
  // Tutor management
  getTutors,
  getTutorById,
  createTutor,

  // Conversation management
  startConversation,
  getConversations,
  getConversationById,

  // Message management
  sendMessage
};

