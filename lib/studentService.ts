
import { ApiService } from './apiService';

interface CreateStudentData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  studentId: string;
  admissionNumber?: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  nationality?: string;
  religion?: string;
  bloodGroup?: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string;
  emergencyContact: string;
  emergencyPhone: string;
  emergencyRelation?: string;
  admissionDate?: string;
  previousSchool?: string;
  previousGrade?: string;
  medicalInfo?: string;
  transportMode?: string;
  transportRoute?: string;
  specialNeeds?: string;
  hobbies?: string;
}

class StudentService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService();
  }

  async createStudent(studentData: CreateStudentData) {
    try {
      const response = await this.apiService.post('/api/students', studentData);
      return response;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  async getStudents() {
    try {
      const response = await this.apiService.get('/api/students');
      if (!Array.isArray(response)) {
        // If response is not an array, try to get the data from a property
        return response.data || [];
      }
      return response;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  async getStudent(id: string) {
    try {
      const response = await this.apiService.get(`/api/students/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  }

  async updateStudent(id: string, studentData: Partial<CreateStudentData>) {
    try {
      const response = await this.apiService.put(`/api/students/${id}`, studentData);
      return response;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  async deleteStudent(id: string) {
    try {
      const response = await this.apiService.delete(`/api/students/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }
}

export const studentService = new StudentService();
