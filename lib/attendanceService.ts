import { ApiService } from './apiService';

interface AttendanceRecord {
  id: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  class: string;
  subject: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK';
  period?: string;
  reason?: string;
  notes?: string;
  markedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface AttendanceData {
  studentId: string;
  classId?: string;
  subjectId?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK';
  period?: string;
  reason?: string;
  notes?: string;
}

interface AttendanceStats {
  PRESENT: number;
  ABSENT: number;
  LATE: number;
  EXCUSED: number;
  SICK: number;
}

interface AttendanceResponse {
  success: boolean;
  data: AttendanceRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface AttendanceStatsResponse {
  success: boolean;
  data: {
    stats: AttendanceStats;
    totalStudents: number;
    attendanceRate: number;
    date: string;
  };
}

class AttendanceService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService();
  }

  async getAttendanceRecords(params?: {
    date?: string;
    studentId?: string;
    classId?: string;
    subjectId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<AttendanceResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.date) queryParams.append('date', params.date);
      if (params?.studentId) queryParams.append('studentId', params.studentId);
      if (params?.classId) queryParams.append('classId', params.classId);
      if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const endpoint = `attendance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      throw error;
    }
  }

  async markAttendance(attendanceData: AttendanceData[]): Promise<any> {
    try {
      const response = await this.apiService.post('attendance', {
        attendanceData
      });
      return response;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }

  async updateAttendance(id: string, data: {
    status?: string;
    reason?: string;
    notes?: string;
  }): Promise<any> {
    try {
      const response = await this.apiService.put(`attendance/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  }

  async deleteAttendance(id: string): Promise<any> {
    try {
      const response = await this.apiService.delete(`attendance/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting attendance:', error);
      throw error;
    }
  }

  async getAttendanceStats(params?: {
    date?: string;
    classId?: string;
    subjectId?: string;
  }): Promise<AttendanceStatsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.date) queryParams.append('date', params.date);
      if (params?.classId) queryParams.append('classId', params.classId);
      if (params?.subjectId) queryParams.append('subjectId', params.subjectId);

      const endpoint = `attendance/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      throw error;
    }
  }

  async getStudentAttendanceHistory(studentId: string, params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const endpoint = `attendance/student/${studentId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching student attendance history:', error);
      throw error;
    }
  }

  // Helper method to get today's date in YYYY-MM-DD format
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Helper method to format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Helper method to get attendance status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'PRESENT':
        return 'success';
      case 'ABSENT':
        return 'error';
      case 'LATE':
        return 'warning';
      case 'EXCUSED':
      case 'SICK':
        return 'info';
      default:
        return 'default';
    }
  }

  // Helper method to calculate attendance rate
  calculateAttendanceRate(stats: AttendanceStats): number {
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    return total > 0 ? Math.round((stats.PRESENT / total) * 100) : 0;
  }
}

export const attendanceService = new AttendanceService();
export type { AttendanceRecord, AttendanceData, AttendanceStats };
