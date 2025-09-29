import { apiService } from '../api';

export interface Schedule {
  id: string;
  title: string;
  type: 'CLASS' | 'EXAM' | 'EVENT' | 'MEETING';
  subjectId?: string;
  teacherId?: string;
  classId?: string;
  startTime: string;
  endTime: string;
  date: string;
  location?: string;
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED' | 'DRAFT';
  description?: string;
  recurring: boolean;
  recurrenceType?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recurrenceEnd?: string;
  recurrencePattern?: any;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  
  // Relationships
  subject?: {
    id: string;
    subjectName: string;
    subjectCode: string;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  updatedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ScheduleFormData {
  title: string;
  type: 'CLASS' | 'EXAM' | 'EVENT' | 'MEETING';
  subjectId?: string;
  teacherId?: string;
  classId?: string;
  startTime: string;
  endTime: string;
  date: string;
  location?: string;
  status?: 'ACTIVE' | 'CANCELLED' | 'COMPLETED' | 'DRAFT';
  description?: string;
  recurring?: boolean;
  recurrenceType?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recurrenceEnd?: string;
  recurrencePattern?: any;
}

export interface ScheduleFilters {
  page?: number;
  limit?: number;
  type?: 'CLASS' | 'EXAM' | 'EVENT' | 'MEETING';
  status?: 'ACTIVE' | 'CANCELLED' | 'COMPLETED' | 'DRAFT';
  date?: string;
  startDate?: string;
  endDate?: string;
  teacherId?: string;
  subjectId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ScheduleStats {
  total: number;
  active: number;
  today: number;
  upcoming: number;
  byType: {
    CLASS?: number;
    EXAM?: number;
    EVENT?: number;
    MEETING?: number;
  };
  byStatus: {
    ACTIVE?: number;
    CANCELLED?: number;
    COMPLETED?: number;
    DRAFT?: number;
  };
}

class ScheduleService {
  // Get all schedules with filtering and pagination
  async getSchedules(filters: ScheduleFilters = {}): Promise<{ success: boolean; data?: Schedule[]; message?: string; pagination?: any }> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/schedules?${queryParams.toString()}`;
      console.log('Fetching schedules from:', endpoint);
      console.log('Auth token available:', !!apiService.getToken());
      
      const response = await apiService.get<Schedule[]>(endpoint);
      console.log('Schedules API response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch schedules'
      };
    }
  }

  // Get schedule by ID
  async getScheduleById(id: string): Promise<{ success: boolean; data?: Schedule; message?: string }> {
    try {
      const response = await apiService.get<Schedule>(`/schedules/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch schedule'
      };
    }
  }

  // Create new schedule
  async createSchedule(scheduleData: ScheduleFormData): Promise<{ success: boolean; data?: Schedule; message?: string }> {
    try {
      const response = await apiService.post<Schedule>('/schedules', scheduleData);
      return response;
    } catch (error) {
      console.error('Error creating schedule:', error);
      return {
        success: false,
        message: error.message || 'Failed to create schedule'
      };
    }
  }

  // Update schedule
  async updateSchedule(id: string, scheduleData: Partial<ScheduleFormData>): Promise<{ success: boolean; data?: Schedule; message?: string }> {
    try {
      const response = await apiService.put<Schedule>(`/schedules/${id}`, scheduleData);
      return response;
    } catch (error) {
      console.error('Error updating schedule:', error);
      return {
        success: false,
        message: error.message || 'Failed to update schedule'
      };
    }
  }

  // Delete schedule
  async deleteSchedule(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.delete(`/schedules/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete schedule'
      };
    }
  }

  // Get schedule statistics
  async getScheduleStats(startDate?: string, endDate?: string): Promise<{ success: boolean; data?: ScheduleStats; message?: string }> {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await apiService.get<ScheduleStats>(`/schedules/stats?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching schedule stats:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch schedule statistics'
      };
    }
  }

  // Export schedules
  async exportSchedules(format: 'csv' | 'json' = 'csv', filters: ScheduleFilters = {}): Promise<{ success: boolean; data?: Blob; message?: string }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      // For blob responses, we need to use fetch directly with full URL
      const token = apiService.getToken();
      const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
      const headers: HeadersInit = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`${baseURL}/schedules/export?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to export schedules');
      }
      
      if (format === 'json') {
        const jsonData = await response.json();
        return {
          success: true,
          data: jsonData
        };
      }
      
      const blob = await response.blob();
      
      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `schedules-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return {
        success: true,
        data: blob
      };
    } catch (error) {
      console.error('Error exporting schedules:', error);
      return {
        success: false,
        message: error.message || 'Failed to export schedules'
      };
    }
  }

  // Get today's schedule
  async getTodaySchedule(): Promise<{ success: boolean; data?: Schedule[]; message?: string }> {
    const today = new Date().toISOString().split('T')[0];
    return this.getSchedules({ date: today, status: 'ACTIVE' });
  }

  // Get upcoming schedules (next 7 days)
  async getUpcomingSchedules(): Promise<{ success: boolean; data?: Schedule[]; message?: string }> {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return this.getSchedules({
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      status: 'ACTIVE'
    });
  }

  // Get schedule conflicts for a specific time slot
  async checkScheduleConflicts(
    date: string, 
    startTime: string, 
    endTime: string, 
    teacherId?: string, 
    excludeScheduleId?: string
  ): Promise<{ success: boolean; data?: Schedule[]; message?: string }> {
    try {
      const filters: ScheduleFilters = {
        date,
        status: 'ACTIVE'
      };

      if (teacherId) {
        filters.teacherId = teacherId;
      }

      const response = await this.getSchedules(filters);
      
      if (!response.success || !response.data) {
        return response;
      }

      // Filter for time conflicts
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      const conflicts = response.data.filter(schedule => {
        if (excludeScheduleId && schedule.id === excludeScheduleId) {
          return false;
        }

        const scheduleStart = new Date(`${schedule.date}T${schedule.startTime}`);
        const scheduleEnd = new Date(`${schedule.date}T${schedule.endTime}`);

        // Check for time overlap
        return (
          (startDateTime < scheduleEnd && endDateTime > scheduleStart) ||
          (scheduleStart < endDateTime && scheduleEnd > startDateTime) ||
          (startDateTime <= scheduleStart && endDateTime >= scheduleEnd)
        );
      });

      return {
        success: true,
        data: conflicts
      };
    } catch (error) {
      console.error('Error checking schedule conflicts:', error);
      return {
        success: false,
        message: error.message || 'Failed to check schedule conflicts'
      };
    }
  }
}

export const scheduleService = new ScheduleService();
