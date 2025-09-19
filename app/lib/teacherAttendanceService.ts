import { apiService } from './api';

export interface TeacherAttendance {
  id: string;
  teacherId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'SICK' | 'ON_LEAVE';
  checkIn?: string;
  checkOut?: string;
  reason?: string;
  notes?: string;
  teacher?: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface AttendanceSummary {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  sick: number;
  onLeave: number;
}

class TeacherAttendanceService {
  private baseUrl = 'teacher-attendance';

  async getAttendance(params?: {
    teacherId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TeacherAttendance[]> {
    const response = await apiService.get(this.baseUrl, { params });
    return response.data || [];
  }

  async markAttendance(data: {
    teacherId: string;
    date: string;
    status: string;
    checkIn?: string;
    checkOut?: string;
    reason?: string;
    notes?: string;
  }): Promise<TeacherAttendance> {
    const response = await apiService.post(`${this.baseUrl}/mark`, data);
    return response.data;
  }

  async getAttendanceSummary(params: {
    teacherId: string;
    month: number;
    year: number;
  }): Promise<AttendanceSummary> {
    const response = await apiService.get(`${this.baseUrl}/summary`, { params });
    return response.data;
  }
}

export const teacherAttendanceService = new TeacherAttendanceService();