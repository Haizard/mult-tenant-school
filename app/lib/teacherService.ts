import { apiService } from './api';

export interface Teacher {
  id: string;
  teacherId: string;
  employeeNumber?: string;
  dateOfBirth: string;
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
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  subjects?: Array<{
    id: string;
    subjectName: string;
    subjectLevel: string;
    subjectType: string;
  }>;
}

export interface CreateTeacherData {
  // User information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  
  // Teacher-specific information
  employeeNumber?: string;
  dateOfBirth: string;
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

export interface UpdateTeacherData extends Partial<CreateTeacherData> {
  id: string;
}

export interface TeacherSubjectAssignment {
  teacherId: string;
  subjectId: string;
  assignedAt?: string;
  assignedBy?: string;
}

class TeacherService {
  private baseUrl = 'teachers';

  async getTeachers(): Promise<Teacher[]> {
    try {
      const response = await apiService.get(this.baseUrl);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch teachers');
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      return [];
    }
  }

  async getTeacher(id: string): Promise<Teacher> {
    try {
      const response = await apiService.get(`${this.baseUrl}/${id}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch teacher');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching teacher:', error);
      throw new Error(error.message || 'Failed to fetch teacher');
    }
  }

  async createTeacher(data: CreateTeacherData): Promise<Teacher> {
    try {
      const response = await apiService.post(this.baseUrl, data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create teacher');
      }
      return response.data;
    } catch (error: any) {
      console.error('Error creating teacher:', error);
      throw new Error(error.message || 'Failed to create teacher');
    }
  }

  async updateTeacher(id: string, data: Partial<UpdateTeacherData>): Promise<Teacher> {
    try {
      const response = await apiService.put(`${this.baseUrl}/${id}`, data);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update teacher');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error updating teacher:', error);
      throw new Error(error.message || 'Failed to update teacher');
    }
  }

  async deleteTeacher(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete teacher');
    }
  }

  // Subject assignment methods
  async getTeacherSubjects(teacherId: string): Promise<any[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/${teacherId}/subjects`);
      return (response as any)?.data || [];
    } catch (error: any) {
      console.error('Error fetching teacher subjects:', error);
      return [];
    }
  }

  async assignSubjectToTeacher(assignment: TeacherSubjectAssignment): Promise<void> {
    try {
      await apiService.post(`${this.baseUrl}/${assignment.teacherId}/subjects`, {
        subjectId: assignment.subjectId
      });
    } catch (error: any) {
      console.error('Error assigning subject to teacher:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign subject to teacher');
    }
  }

  async removeSubjectFromTeacher(teacherId: string, subjectId: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/${teacherId}/subjects/${subjectId}`);
    } catch (error: any) {
      console.error('Error removing subject from teacher:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove subject from teacher');
    }
  }

  // Qualification management
  async getTeacherQualifications(teacherId: string): Promise<any[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/${teacherId}/qualifications`);
      return (response as any)?.data || [];
    } catch (error: any) {
      console.error('Error fetching teacher qualifications:', error);
      return [];
    }
  }

  async addTeacherQualification(teacherId: string, qualification: any): Promise<any> {
    try {
      const response = await apiService.post(`${this.baseUrl}/${teacherId}/qualifications`, qualification);
      return response;
    } catch (error: any) {
      console.error('Error adding teacher qualification:', error);
      throw new Error(error.response?.data?.message || 'Failed to add teacher qualification');
    }
  }

  async updateTeacherQualification(teacherId: string, qualificationId: string, qualification: any): Promise<any> {
    try {
      const response = await apiService.put(`${this.baseUrl}/${teacherId}/qualifications/${qualificationId}`, qualification);
      return response;
    } catch (error: any) {
      console.error('Error updating teacher qualification:', error);
      throw new Error(error.response?.data?.message || 'Failed to update teacher qualification');
    }
  }

  async deleteTeacherQualification(teacherId: string, qualificationId: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/${teacherId}/qualifications/${qualificationId}`);
    } catch (error: any) {
      console.error('Error deleting teacher qualification:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete teacher qualification');
    }
  }

  // Performance and analytics
  async getTeacherPerformance(teacherId: string): Promise<any> {
    try {
      const response = await apiService.get(`${this.baseUrl}/${teacherId}/performance`);
      return response;
    } catch (error: any) {
      console.error('Error fetching teacher performance:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch teacher performance');
    }
  }

  async getTeacherWorkload(teacherId: string): Promise<any> {
    try {
      const response = await apiService.get(`${this.baseUrl}/${teacherId}/workload`);
      return response;
    } catch (error: any) {
      console.error('Error fetching teacher workload:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch teacher workload');
    }
  }

  // Class assignment methods
  async getTeacherClasses(teacherId: string): Promise<any[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/${teacherId}/classes`);
      return (response as any)?.data || [];
    } catch (error: any) {
      console.error('Error fetching teacher classes:', error);
      return [];
    }
  }

  async assignClassToTeacher(teacherId: string, classId: string, role: string = 'SUBJECT_TEACHER'): Promise<void> {
    try {
      await apiService.post(`${this.baseUrl}/${teacherId}/classes`, {
        classId,
        role
      });
    } catch (error: any) {
      console.error('Error assigning class to teacher:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign class to teacher');
    }
  }

  async removeClassFromTeacher(teacherId: string, classId: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/${teacherId}/classes/${classId}`);
    } catch (error: any) {
      console.error('Error removing class from teacher:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove class from teacher');
    }
  }

  // Bulk operations
  async bulkAssignSubjects(assignments: TeacherSubjectAssignment[]): Promise<void> {
    try {
      await apiService.post(`${this.baseUrl}/bulk-assign-subjects`, { assignments });
    } catch (error: any) {
      console.error('Error bulk assigning subjects:', error);
      throw new Error(error.response?.data?.message || 'Failed to bulk assign subjects');
    }
  }

  async exportTeachers(format: 'csv' | 'excel' = 'csv'): Promise<any> {
    try {
      const response = await apiService.get(`${this.baseUrl}/export?format=${format}`);
      return response;
    } catch (error: any) {
      console.error('Error exporting teachers:', error);
      throw new Error(error.response?.data?.message || 'Failed to export teachers');
    }
  }

  async importTeachers(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiService.post(`${this.baseUrl}/import`, formData);
      return response;
    } catch (error: any) {
      console.error('Error importing teachers:', error);
      throw new Error(error.response?.data?.message || 'Failed to import teachers');
    }
  }
}

export const teacherService = new TeacherService();
