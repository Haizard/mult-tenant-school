import { ApiService } from './apiService';

export interface Message {
  id: string;
  tenantId: string;
  senderId: string;
  recipientId: string;
  subject?: string;
  content: string;
  messageType: 'DIRECT' | 'BROADCAST' | 'ANNOUNCEMENT' | 'SYSTEM';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  isRead: boolean;
  readAt?: Date;
  scheduledAt?: Date;
  sentAt?: Date;
  attachments?: any;
  metadata?: any;
  threadId?: string;
  replyToId?: string;
  createdAt: Date;
  updatedAt: Date;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  recipient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  replyTo?: {
    id: string;
    subject?: string;
    content: string;
  };
  replies?: Message[];
}

export interface Announcement {
  id: string;
  tenantId: string;
  authorId: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'ACADEMIC' | 'EVENT' | 'URGENT' | 'ADMINISTRATIVE' | 'SPORTS' | 'CULTURAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  targetAudience: 'ALL' | 'STUDENTS' | 'TEACHERS' | 'PARENTS' | 'STAFF' | 'ADMINISTRATORS' | 'SPECIFIC_CLASS' | 'SPECIFIC_GRADE';
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED' | 'EXPIRED';
  publishDate?: Date;
  expiryDate?: Date;
  attachments?: any;
  metadata?: any;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface MessageTemplate {
  id: string;
  tenantId: string;
  createdById: string;
  name: string;
  description?: string;
  subject?: string;
  content: string;
  category: 'GENERAL' | 'ACADEMIC' | 'ATTENDANCE' | 'EXAMINATION' | 'LEAVE' | 'EMERGENCY' | 'WELCOME' | 'REMINDER';
  variables?: any;
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CommunicationLog {
  id: string;
  tenantId: string;
  userId: string;
  communicationType: 'MESSAGE' | 'ANNOUNCEMENT' | 'NOTIFICATION' | 'TEMPLATE' | 'BULK_MESSAGE';
  messageId?: string;
  announcementId?: string;
  templateId?: string;
  recipientId?: string;
  recipientType?: 'INDIVIDUAL' | 'GROUP' | 'CLASS' | 'GRADE' | 'ROLE' | 'ALL_STUDENTS' | 'ALL_TEACHERS' | 'ALL_PARENTS' | 'ALL_STAFF';
  channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH_NOTIFICATION' | 'WHATSAPP';
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'CANCELLED';
  deliveredAt?: Date;
  readAt?: Date;
  failureReason?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  senderId?: string;
  recipientId?: string;
  threadId?: string;
  search?: string;
}

export interface AnnouncementParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  targetAudience?: string;
  search?: string;
}

export interface TemplateParams {
  page?: number;
  limit?: number;
  category?: string;
  isActive?: boolean;
  search?: string;
}

export interface CreateMessageData {
  recipientId: string;
  subject?: string;
  content: string;
  messageType?: string;
  priority?: string;
  scheduledAt?: string;
  attachments?: any;
  threadId?: string;
  replyToId?: string;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  category?: string;
  priority?: string;
  targetAudience?: string;
  publishDate?: string;
  expiryDate?: string;
  attachments?: any;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  subject?: string;
  content: string;
  category?: string;
  variables?: any;
}

export interface BulkMessageData {
  recipientIds: string[];
  subject?: string;
  content: string;
  messageType?: string;
  priority?: string;
  scheduledAt?: string;
  templateId?: string;
  variables?: Record<string, any>;
}

class CommunicationService {
  private baseUrl = '/api';
  private apiService = new ApiService();

  // Message Methods
  async getMessages(params: MessageParams = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await this.apiService.get(`${this.baseUrl}/messages?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async getMessageById(id: string) {
    try {
      const response = await this.apiService.get(`${this.baseUrl}/messages/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  }

  async createMessage(data: CreateMessageData) {
    try {
      const response = await this.apiService.post(`${this.baseUrl}/messages`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async updateMessage(id: string, data: Partial<CreateMessageData>) {
    try {
      const response = await this.apiService.put(`${this.baseUrl}/messages/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  async deleteMessage(id: string) {
    try {
      const response = await this.apiService.delete(`${this.baseUrl}/messages/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Announcement Methods
  async getAnnouncements(params: AnnouncementParams = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await this.apiService.get(`${this.baseUrl}/announcements?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  }

  async getAnnouncementById(id: string) {
    try {
      const response = await this.apiService.get(`${this.baseUrl}/announcements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching announcement:', error);
      throw error;
    }
  }

  async createAnnouncement(data: CreateAnnouncementData) {
    try {
      const response = await this.apiService.post(`${this.baseUrl}/announcements`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  async updateAnnouncement(id: string, data: Partial<CreateAnnouncementData>) {
    try {
      const response = await this.apiService.put(`${this.baseUrl}/announcements/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  }

  async deleteAnnouncement(id: string) {
    try {
      const response = await this.apiService.delete(`${this.baseUrl}/announcements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }

  // Template Methods
  async getMessageTemplates(params: TemplateParams = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await this.apiService.get(`${this.baseUrl}/message-templates?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching message templates:', error);
      throw error;
    }
  }

  async createMessageTemplate(data: CreateTemplateData) {
    try {
      const response = await this.apiService.post(`${this.baseUrl}/message-templates`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating message template:', error);
      throw error;
    }
  }

  async updateMessageTemplate(id: string, data: Partial<CreateTemplateData>) {
    try {
      const response = await this.apiService.put(`${this.baseUrl}/message-templates/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating message template:', error);
      throw error;
    }
  }

  async deleteMessageTemplate(id: string) {
    try {
      const response = await this.apiService.delete(`${this.baseUrl}/message-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting message template:', error);
      throw error;
    }
  }

  // Bulk Messaging Methods
  async sendBulkMessage(data: BulkMessageData) {
    try {
      const response = await this.apiService.post(`${this.baseUrl}/messages/bulk`, data);
      return response.data;
    } catch (error) {
      console.error('Error sending bulk message:', error);
      throw error;
    }
  }

  // Communication Analytics Methods
  async getCommunicationStats(params: { startDate?: string; endDate?: string; type?: string } = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await this.apiService.get(`${this.baseUrl}/communication/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching communication stats:', error);
      throw error;
    }
  }

  async getCommunicationLogs(params: {
    page?: number;
    limit?: number;
    communicationType?: string;
    status?: string;
    channel?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await this.apiService.get(`${this.baseUrl}/communication/logs?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching communication logs:', error);
      throw error;
    }
  }

  // Message Threading Methods
  async getMessageThread(threadId: string) {
    try {
      const response = await this.apiService.get(`${this.baseUrl}/messages/thread/${threadId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching message thread:', error);
      throw error;
    }
  }

  async replyToMessage(messageId: string, data: { content: string; attachments?: any }) {
    try {
      const response = await this.apiService.post(`${this.baseUrl}/messages/${messageId}/reply`, data);
      return response.data;
    } catch (error) {
      console.error('Error replying to message:', error);
      throw error;
    }
  }

  // Read Receipt Methods
  async markMessageAsRead(messageId: string) {
    try {
      const response = await this.apiService.put(`${this.baseUrl}/messages/${messageId}/read`, {});
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  async getUnreadMessageCount() {
    try {
      const response = await this.apiService.get(`${this.baseUrl}/messages/unread/count`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      throw error;
    }
  }

  // Template Variable Processing
  processTemplateVariables(template: string, variables: Record<string, any>): string {
    let processedTemplate = template;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processedTemplate = processedTemplate.replace(regex, value?.toString() || '');
    });

    return processedTemplate;
  }

  // Utility Methods
  async searchUsers(query: string, role?: string) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('search', query);
      if (role) queryParams.append('role', role);

      const response = await this.apiService.get(`${this.baseUrl}/users/search?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
}

const communicationService = new CommunicationService();
export default communicationService;
