import { apiService } from './apiService';

export interface AiTutor {
  id: string;
  tutorName: string;
  subjectName: string;
  subjectCode?: string;
  expertiseLevel: string;
  teachingStyle?: string;
  isActive: boolean;
}

export interface ChatbotConversation {
  id: string;
  tenantId: string;
  userId: string;
  tutorId: string;
  conversationTitle?: string;
  topic?: string;
  mode: 'learning' | 'past_paper_solver';
  status: 'active' | 'archived' | 'completed';
  startedAt: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotMessage {
  id: string;
  conversationId: string;
  senderType: 'student' | 'ai';
  messageContent: string;
  messageType: string;
  metadata?: string;
  createdAt: string;
}

class ChatbotService {
  /**
   * Get all available AI tutors
   */
  async getTutors(subject?: string): Promise<AiTutor[]> {
    try {
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      
      const response = await apiService.get(
        `/chatbot/tutors${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch tutors');
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tutors:', error);
      throw error;
    }
  }

  /**
   * Get tutor by ID
   */
  async getTutorById(tutorId: string): Promise<AiTutor> {
    try {
      const response = await apiService.get(`/chatbot/tutors/${tutorId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch tutor');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching tutor:', error);
      throw error;
    }
  }

  /**
   * Create new AI tutor (Admin only)
   */
  async createTutor(tutorData: Partial<AiTutor>): Promise<AiTutor> {
    try {
      const response = await apiService.post('/chatbot/tutors', tutorData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to create tutor');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating tutor:', error);
      throw error;
    }
  }

  /**
   * Start new conversation with tutor
   */
  async startConversation(
    tutorId: string,
    topic?: string,
    mode: 'learning' | 'past_paper_solver' = 'learning'
  ): Promise<ChatbotConversation> {
    try {
      const response = await apiService.post('/chatbot/conversations', {
        tutorId,
        topic,
        mode
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to start conversation');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  }

  /**
   * Get all conversations for current user
   */
  async getConversations(status?: string): Promise<ChatbotConversation[]> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      
      const response = await apiService.get(
        `/chatbot/conversations${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch conversations');
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(conversationId: string): Promise<ChatbotConversation> {
    try {
      const response = await apiService.get(`/chatbot/conversations/${conversationId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch conversation');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  /**
   * Send message to conversation
   */
  async sendMessage(
    conversationId: string,
    messageContent: string,
    messageType: string = 'text'
  ): Promise<ChatbotMessage> {
    try {
      const response = await apiService.post(
        `/chatbot/conversations/${conversationId}/messages`,
        {
          messageContent,
          messageType
        }
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to send message');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

export const chatbotService = new ChatbotService();
export default chatbotService;

