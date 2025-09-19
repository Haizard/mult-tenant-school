import { ApiService } from './apiService';

const apiClient = new ApiService();

export interface Teacher {
  id: string;
  employeeNumber?: string;
  dateOfBirth?: string;
  gender: string;
  nationality?: string;
  qualification?: string;
  experience?: number;
  specialization?: string;
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  joiningDate?: string;
  previousSchool?: string;
  teachingLicense?: string;
  licenseExpiry?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export interface UpdateTeacherData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeNumber?: string;
  dateOfBirth?: string;
  gender: string;
  nationality?: string;
  qualification?: string;
  experience?: number;
  specialization?: string;
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  joiningDate?: string;
  previousSchool?: string;
  teachingLicense?: string;
  licenseExpiry?: string;
}

class TeacherService {
  private baseUrl = '/api/teachers';

  async getTeacher(id: string): Promise<Teacher> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher:', error);
      throw error;
    }
  }

  async updateTeacher(id: string, data: UpdateTeacherData): Promise<Teacher> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }
  }
}

export const teacherService = new TeacherService();