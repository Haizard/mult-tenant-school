import { ApiService } from './apiService';

const apiClient = new ApiService();

export enum LeaveType {
  SICK = 'SICK',
  PERSONAL = 'PERSONAL',
  FAMILY_EMERGENCY = 'FAMILY_EMERGENCY',
  MEDICAL_APPOINTMENT = 'MEDICAL_APPOINTMENT',
  RELIGIOUS = 'RELIGIOUS',
  VACATION = 'VACATION',
  OTHER = 'OTHER'
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  studentId: string;
  requestedBy: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  description?: string;
  supportingDocs?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  isEmergency: boolean;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    admissionNumber?: string;
  };
  requester: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface LeaveRequestParams {
  page?: number;
  limit?: number;
  status?: LeaveStatus;
  studentId?: string;
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
}

export interface CreateLeaveRequestData {
  studentId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  description?: string;
  supportingDocs?: string;
  isEmergency?: boolean;
}

export interface UpdateLeaveRequestData {
  status: LeaveStatus;
  rejectedReason?: string;
}

export interface LeaveStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  emergency: number;
  byType: Record<LeaveType, number>;
}

class LeaveService {
  private baseUrl = '/api/leave';

  async getLeaveRequests(params: LeaveRequestParams = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}?${queryParams.toString()}`);
    return response;
  }

  async createLeaveRequest(data: CreateLeaveRequestData) {
    const response = await apiClient.post(this.baseUrl, data);
    return response;
  }

  async updateLeaveRequest(id: string, data: UpdateLeaveRequestData) {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response;
  }

  async deleteLeaveRequest(id: string) {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response;
  }

  async getLeaveStats(params: { startDate?: string; endDate?: string } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}/stats?${queryParams.toString()}`);
    return response;
  }

  getLeaveTypeLabel(type: LeaveType): string {
    const labels: Record<LeaveType, string> = {
      [LeaveType.SICK]: 'Sick Leave',
      [LeaveType.PERSONAL]: 'Personal Leave',
      [LeaveType.FAMILY_EMERGENCY]: 'Family Emergency',
      [LeaveType.MEDICAL_APPOINTMENT]: 'Medical Appointment',
      [LeaveType.RELIGIOUS]: 'Religious Leave',
      [LeaveType.VACATION]: 'Vacation',
      [LeaveType.OTHER]: 'Other'
    };
    return labels[type] || type;
  }

  getStatusColor(status: LeaveStatus): string {
    const colors: Record<LeaveStatus, string> = {
      [LeaveStatus.PENDING]: 'text-yellow-600 bg-yellow-100',
      [LeaveStatus.APPROVED]: 'text-green-600 bg-green-100',
      [LeaveStatus.REJECTED]: 'text-red-600 bg-red-100',
      [LeaveStatus.CANCELLED]: 'text-gray-600 bg-gray-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  calculateLeaveDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  }
}

export const leaveService = new LeaveService();