const { PrismaClient } = require('@prisma/client');
const chatbotController = require('../chatbotController');

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    aiTutorProfile: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    chatbotConversation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    chatbotMessage: {
      create: jest.fn(),
    },
  })),
}));

describe('Chatbot Controller', () => {
  let req, res, prisma;

  beforeEach(() => {
    prisma = new PrismaClient();
    
    req = {
      user: { id: 'user-123' },
      tenantId: 'tenant-123',
      params: {},
      body: {},
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('getTutors', () => {
    it('should return all active tutors', async () => {
      const mockTutors = [
        {
          id: 'tutor-1',
          tutorName: 'Math Master',
          subjectName: 'Mathematics',
          isActive: true,
        },
      ];

      prisma.aiTutorProfile.findMany.mockResolvedValue(mockTutors);

      await chatbotController.getTutors(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTutors,
        message: 'Tutors retrieved successfully',
      });
    });

    it('should filter tutors by subject', async () => {
      req.query.subject = 'Mathematics';
      const mockTutors = [
        {
          id: 'tutor-1',
          tutorName: 'Math Master',
          subjectName: 'Mathematics',
          isActive: true,
        },
      ];

      prisma.aiTutorProfile.findMany.mockResolvedValue(mockTutors);

      await chatbotController.getTutors(req, res);

      expect(prisma.aiTutorProfile.findMany).toHaveBeenCalledWith({
        where: { isActive: true, subjectName: 'Mathematics' },
        include: { conversations: { select: { id: true } } },
      });
    });
  });

  describe('startConversation', () => {
    it('should create a new conversation', async () => {
      req.body = {
        tutorId: 'tutor-123',
        topic: 'Algebra',
        mode: 'learning',
      };

      const mockTutor = {
        id: 'tutor-123',
        tutorName: 'Math Master',
        subjectName: 'Mathematics',
      };

      const mockConversation = {
        id: 'conv-123',
        tenantId: 'tenant-123',
        userId: 'user-123',
        tutorId: 'tutor-123',
        topic: 'Algebra',
        mode: 'learning',
      };

      prisma.aiTutorProfile.findUnique.mockResolvedValue(mockTutor);
      prisma.chatbotConversation.create.mockResolvedValue(mockConversation);

      await chatbotController.startConversation(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockConversation,
        message: 'Conversation started successfully',
      });
    });

    it('should return 400 if tutorId is missing', async () => {
      req.body = { topic: 'Algebra' };

      await chatbotController.startConversation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Tutor ID is required',
      });
    });

    it('should return 404 if tutor not found', async () => {
      req.body = { tutorId: 'invalid-tutor' };

      prisma.aiTutorProfile.findUnique.mockResolvedValue(null);

      await chatbotController.startConversation(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Tutor not found',
      });
    });
  });

  describe('getConversations', () => {
    it('should return user conversations', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          tenantId: 'tenant-123',
          userId: 'user-123',
          topic: 'Algebra',
          status: 'active',
        },
      ];

      prisma.chatbotConversation.findMany.mockResolvedValue(mockConversations);

      await chatbotController.getConversations(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockConversations,
        message: 'Conversations retrieved successfully',
      });
    });

    it('should filter conversations by status', async () => {
      req.query.status = 'active';
      const mockConversations = [
        {
          id: 'conv-1',
          status: 'active',
        },
      ];

      prisma.chatbotConversation.findMany.mockResolvedValue(mockConversations);

      await chatbotController.getConversations(req, res);

      expect(prisma.chatbotConversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'active' }),
        })
      );
    });
  });

  describe('sendMessage', () => {
    it('should send a message to conversation', async () => {
      req.params.conversationId = 'conv-123';
      req.body = {
        messageContent: 'What is algebra?',
        messageType: 'text',
      };

      const mockConversation = { id: 'conv-123', tenantId: 'tenant-123' };
      const mockMessage = {
        id: 'msg-123',
        conversationId: 'conv-123',
        senderType: 'student',
        messageContent: 'What is algebra?',
      };

      prisma.chatbotConversation.findFirst.mockResolvedValue(mockConversation);
      prisma.chatbotMessage.create.mockResolvedValue(mockMessage);

      await chatbotController.sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMessage,
        message: 'Message sent successfully',
      });
    });

    it('should return 400 if message content is empty', async () => {
      req.params.conversationId = 'conv-123';
      req.body = { messageContent: '' };

      await chatbotController.sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Message content is required',
      });
    });
  });
});

