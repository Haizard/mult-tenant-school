import { ApiService } from './apiService';

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: string;
  priority: NotificationPriority;
  createdAt: string;
  updatedAt: string;
}

export enum NotificationType {
  ATTENDANCE_ALERT = 'ATTENDANCE_ALERT',
  LEAVE_REQUEST = 'LEAVE_REQUEST',
  LEAVE_APPROVED = 'LEAVE_APPROVED',
  LEAVE_REJECTED = 'LEAVE_REJECTED',
  GENERAL = 'GENERAL',
  EMERGENCY = 'EMERGENCY'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface NotificationParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
}

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  priority?: NotificationPriority;
}

export interface NotificationStats {
  total: number;
  unread: number;
  highPriority: number;
  byType: Record<NotificationType, number>;
}

class NotificationService {
  private baseUrl = '/api/notifications';
  private apiService = new ApiService();

  async getNotifications(params: NotificationParams = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await this.apiService.get(`${this.baseUrl}?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markAsRead(id: string) {
    try {
      const response = await this.apiService.put(`${this.baseUrl}/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      const response = await this.apiService.put(`${this.baseUrl}/read-all`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(id: string) {
    try {
      const response = await this.apiService.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async createNotification(data: CreateNotificationData) {
    try {
      const response = await this.apiService.post(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async sendAttendanceAlert(studentId: string, attendanceDate: string, status: string) {
    try {
      const response = await this.apiService.post(`${this.baseUrl}/attendance-alert`, {
        studentId,
        attendanceDate,
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error sending attendance alert:', error);
      throw error;
    }
  }

  async getNotificationStats() {
    try {
      const response = await this.apiService.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notification statistics:', error);
      throw error;
    }
  }

  // Helper methods
  getPriorityColor(priority: NotificationPriority): string {
    const colors: Record<NotificationPriority, string> = {
      [NotificationPriority.LOW]: 'text-gray-600 bg-gray-100',
      [NotificationPriority.NORMAL]: 'text-blue-600 bg-blue-100',
      [NotificationPriority.HIGH]: 'text-orange-600 bg-orange-100',
      [NotificationPriority.URGENT]: 'text-red-600 bg-red-100'
    };
    return colors[priority] || 'text-gray-600 bg-gray-100';
  }

  getTypeIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      [NotificationType.ATTENDANCE_ALERT]: '📅',
      [NotificationType.LEAVE_REQUEST]: '📝',
      [NotificationType.LEAVE_APPROVED]: '✅',
      [NotificationType.LEAVE_REJECTED]: '❌',
      [NotificationType.GENERAL]: '📢',
      [NotificationType.EMERGENCY]: '🚨'
    };
    return icons[type] || '📢';
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

export const notificationService = new NotificationService();
