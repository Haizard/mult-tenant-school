import { chatbotService } from '../chatbotService';

// Mock the apiService
jest.mock('../apiService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import { apiService } from '../apiService';

describe('ChatbotService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTutors', () => {
    it('should fetch all tutors', async () => {
      const mockTutors = [
        {
          id: 'tutor-1',
          tutorName: 'Math Master',
          subjectName: 'Mathematics',
          expertiseLevel: 'advanced',
          isActive: true,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockTutors,
      });

      const result = await chatbotService.getTutors();

      expect(apiService.get).toHaveBeenCalledWith('/chatbot/tutors');
      expect(result).toEqual(mockTutors);
    });

    it('should fetch tutors by subject', async () => {
      const mockTutors = [
        {
          id: 'tutor-1',
          tutorName: 'Math Master',
          subjectName: 'Mathematics',
          expertiseLevel: 'advanced',
          isActive: true,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockTutors,
      });

      const result = await chatbotService.getTutors('Mathematics');

      expect(apiService.get).toHaveBeenCalledWith('/chatbot/tutors?subject=Mathematics');
      expect(result).toEqual(mockTutors);
    });

    it('should throw error on failed fetch', async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Failed to fetch tutors',
      });

      await expect(chatbotService.getTutors()).rejects.toThrow(
        'Failed to fetch tutors'
      );
    });
  });

  describe('startConversation', () => {
    it('should start a new conversation', async () => {
      const mockConversation = {
        id: 'conv-123',
        tenantId: 'tenant-123',
        userId: 'user-123',
        tutorId: 'tutor-123',
        topic: 'Algebra',
        mode: 'learning' as const,
        status: 'active' as const,
        startedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockConversation,
      });

      const result = await chatbotService.startConversation(
        'tutor-123',
        'Algebra',
        'learning'
      );

      expect(apiService.post).toHaveBeenCalledWith('/chatbot/conversations', {
        tutorId: 'tutor-123',
        topic: 'Algebra',
        mode: 'learning',
      });
      expect(result).toEqual(mockConversation);
    });

    it('should use default mode if not specified', async () => {
      const mockConversation = {
        id: 'conv-123',
        tutorId: 'tutor-123',
        mode: 'learning' as const,
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockConversation,
      });

      await chatbotService.startConversation('tutor-123');

      expect(apiService.post).toHaveBeenCalledWith('/chatbot/conversations', {
        tutorId: 'tutor-123',
        topic: undefined,
        mode: 'learning',
      });
    });
  });

  describe('getConversations', () => {
    it('should fetch user conversations', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          topic: 'Algebra',
          status: 'active' as const,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockConversations,
      });

      const result = await chatbotService.getConversations();

      expect(apiService.get).toHaveBeenCalledWith('/chatbot/conversations');
      expect(result).toEqual(mockConversations);
    });

    it('should filter conversations by status', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          status: 'active' as const,
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockConversations,
      });

      const result = await chatbotService.getConversations('active');

      expect(apiService.get).toHaveBeenCalledWith(
        '/chatbot/conversations?status=active'
      );
      expect(result).toEqual(mockConversations);
    });
  });

  describe('sendMessage', () => {
    it('should send a message', async () => {
      const mockMessage = {
        id: 'msg-123',
        conversationId: 'conv-123',
        senderType: 'student' as const,
        messageContent: 'What is algebra?',
        messageType: 'text',
        createdAt: new Date().toISOString(),
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockMessage,
      });

      const result = await chatbotService.sendMessage(
        'conv-123',
        'What is algebra?',
        'text'
      );

      expect(apiService.post).toHaveBeenCalledWith(
        '/chatbot/conversations/conv-123/messages',
        {
          messageContent: 'What is algebra?',
          messageType: 'text',
        }
      );
      expect(result).toEqual(mockMessage);
    });

    it('should use default message type if not specified', async () => {
      const mockMessage = {
        id: 'msg-123',
        messageType: 'text',
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockMessage,
      });

      await chatbotService.sendMessage('conv-123', 'Hello');

      expect(apiService.post).toHaveBeenCalledWith(
        '/chatbot/conversations/conv-123/messages',
        {
          messageContent: 'Hello',
          messageType: 'text',
        }
      );
    });
  });
});

