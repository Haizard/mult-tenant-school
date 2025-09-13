import { apiService } from '../api';

export interface Subject {
  id: string;
  subjectName: string;
  subjectCode?: string;
  subjectLevel: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL' | 'UNIVERSITY';
  subjectType: 'CORE' | 'ELECTIVE' | 'OPTIONAL';
  description?: string;
  credits?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface AcademicYear {
  id: string;
  yearName: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface Class {
  id: string;
  className: string;
  classLevel: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL' | 'UNIVERSITY';
  classCode?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  classId?: string;
  academicYearId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  class?: Class;
  academicYear?: AcademicYear;
}

class AcademicService {
  // Subjects
  async getSubjects(): Promise<Subject[]> {
    try {
      const response = await apiService.get('/subjects');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  }

  async getSubjectById(id: string): Promise<Subject> {
    try {
      const response = await apiService.get(`/subjects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subject:', error);
      throw error;
    }
  }

  async createSubject(subjectData: Partial<Subject>): Promise<Subject> {
    try {
      const response = await apiService.post('/subjects', subjectData);
      return response.data;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  }

  async updateSubject(id: string, subjectData: Partial<Subject>): Promise<Subject> {
    try {
      const response = await apiService.put(`/subjects/${id}`, subjectData);
      return response.data;
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  }

  async deleteSubject(id: string): Promise<void> {
    try {
      await apiService.delete(`/subjects/${id}`);
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }

  // Academic Years
  async getAcademicYears(): Promise<AcademicYear[]> {
    try {
      const response = await apiService.get('/academic-years');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching academic years:', error);
      throw error;
    }
  }

  async getCurrentAcademicYear(): Promise<AcademicYear> {
    try {
      const response = await apiService.get('/academic-years/current');
      return response.data;
    } catch (error) {
      console.error('Error fetching current academic year:', error);
      throw error;
    }
  }

  async createAcademicYear(yearData: Partial<AcademicYear>): Promise<AcademicYear> {
    try {
      const response = await apiService.post('/academic-years', yearData);
      return response.data;
    } catch (error) {
      console.error('Error creating academic year:', error);
      throw error;
    }
  }

  // Classes
  async getClasses(): Promise<Class[]> {
    try {
      const response = await apiService.get('/classes');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  }

  async getClassById(id: string): Promise<Class> {
    try {
      const response = await apiService.get(`/classes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching class:', error);
      throw error;
    }
  }

  async createClass(classData: Partial<Class>): Promise<Class> {
    try {
      const response = await apiService.post('/academic/classes', classData);
      return response.data;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  }

  async updateClass(id: string, classData: Partial<Class>): Promise<Class> {
    try {
      const response = await apiService.put(`/classes/${id}`, classData);
      return response.data;
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  }

  async deleteClass(id: string): Promise<void> {
    try {
      await apiService.delete(`/classes/${id}`);
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }

  // Students
  async getStudents(): Promise<Student[]> {
    try {
      const response = await apiService.get('/students');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  async getStudentsByClass(classId: string): Promise<Student[]> {
    try {
      const response = await apiService.get(`/students?classId=${classId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching students by class:', error);
      throw error;
    }
  }

  async getStudentById(id: string): Promise<Student> {
    try {
      const response = await apiService.get(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  }

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    try {
      const response = await apiService.post('/students', studentData);
      return response.data;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  async updateStudent(id: string, studentData: Partial<Student>): Promise<Student> {
    try {
      const response = await apiService.put(`/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      await apiService.delete(`/students/${id}`);
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  // Academic Reports
  async getAcademicReports(filters?: {
    academicYearId?: string;
    classId?: string;
    subjectId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const response = await apiService.get(`/reports?${params.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching academic reports:', error);
      throw error;
    }
  }

  // Academic Statistics
  async getAcademicStatistics(filters?: {
    academicYearId?: string;
    classId?: string;
    subjectId?: string;
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const response = await apiService.get(`/statistics?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching academic statistics:', error);
      throw error;
    }
  }
}

export const academicService = new AcademicService();
