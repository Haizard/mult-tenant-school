import { apiService } from '../api';

export interface Examination {
  id: string;
  examName: string;
  examType: 'QUIZ' | 'MID_TERM' | 'FINAL' | 'MOCK' | 'NECTA' | 'ASSIGNMENT' | 'PROJECT';
  examLevel: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL' | 'UNIVERSITY';
  subjectId?: string;
  academicYearId?: string;
  startDate: string;
  endDate?: string;
  maxMarks: number;
  weight: number;
  status: 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'PUBLISHED' | 'ARCHIVED';
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  subject?: {
    id: string;
    subjectName: string;
    subjectCode?: string;
    subjectLevel: string;
    subjectType: string;
  };
  academicYear?: {
    id: string;
    yearName: string;
    isCurrent: boolean;
  };
  createdByUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count: {
    grades: number;
  };
}

export interface Grade {
  id: string;
  examinationId: string;
  studentId: string;
  subjectId: string;
  rawMarks: number;
  percentage: number;
  grade?: string;
  points?: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  comments?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  examination: {
    id: string;
    examName: string;
    examType: string;
    examLevel: string;
    maxMarks: number;
    weight: number;
    status: string;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  subject: {
    id: string;
    subjectName: string;
    subjectCode?: string;
    subjectLevel: string;
    subjectType: string;
  };
  createdByUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface GradingScale {
  id: string;
  scaleName: string;
  examLevel: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL' | 'UNIVERSITY';
  gradeRanges: Array<{
    grade: string;
    min: number;
    max: number;
    points?: number;
  }>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  createdByUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateExaminationData {
  examName: string;
  examType: 'QUIZ' | 'MID_TERM' | 'FINAL' | 'MOCK' | 'NECTA' | 'ASSIGNMENT' | 'PROJECT';
  examLevel: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL' | 'UNIVERSITY';
  subjectId?: string;
  academicYearId?: string;
  startDate: string;
  endDate?: string;
  maxMarks?: number;
  weight?: number;
  description?: string;
}

export interface UpdateExaminationData extends Partial<CreateExaminationData> {
  status?: 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'PUBLISHED' | 'ARCHIVED';
}

export interface CreateGradeData {
  examinationId: string;
  studentId: string;
  subjectId: string;
  rawMarks: number;
  comments?: string;
}

export interface UpdateGradeData {
  rawMarks?: number;
  comments?: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
}

export interface CreateGradingScaleData {
  scaleName: string;
  examLevel: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL' | 'UNIVERSITY';
  gradeRanges: Array<{
    grade: string;
    min: number;
    max: number;
    points?: number;
  }>;
  isDefault?: boolean;
}

export interface ExaminationFilters {
  examType?: string;
  examLevel?: string;
  subjectId?: string;
  academicYearId?: string;
  status?: string;
}

export interface GradeFilters {
  examinationId?: string;
  studentId?: string;
  subjectId?: string;
  status?: string;
}

export interface GradingScaleFilters {
  examLevel?: string;
}

class ExaminationService {
  // Examination Management
  async getExaminations(filters?: ExaminationFilters): Promise<{ success: boolean; data?: Examination[]; message?: string }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const response = await apiService.get(`/examinations/examinations?${params.toString()}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching examinations:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch examinations'
      };
    }
  }

  async getExaminationById(id: string): Promise<{ success: boolean; data?: Examination; message?: string }> {
    try {
      const response = await apiService.get(`/examinations/examinations/${id}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching examination:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch examination'
      };
    }
  }

  async createExamination(data: CreateExaminationData): Promise<{ success: boolean; data?: Examination; message?: string }> {
    try {
      const response = await apiService.post('/examinations/examinations', data);
      return response;
    } catch (error: any) {
      console.error('Error creating examination:', error);
      return {
        success: false,
        message: error.message || 'Failed to create examination'
      };
    }
  }

  async updateExamination(id: string, data: UpdateExaminationData): Promise<{ success: boolean; data?: Examination; message?: string }> {
    try {
      const response = await apiService.put(`/examinations/examinations/${id}`, data);
      return response;
    } catch (error: any) {
      console.error('Error updating examination:', error);
      return {
        success: false,
        message: error.message || 'Failed to update examination'
      };
    }
  }

  async deleteExamination(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.delete(`/examinations/examinations/${id}`);
      return response;
    } catch (error: any) {
      console.error('Error deleting examination:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete examination'
      };
    }
  }

  // Grade Management
  async getGrades(filters?: GradeFilters): Promise<{ success: boolean; data?: Grade[]; message?: string }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const response = await apiService.get(`/examinations/grades?${params.toString()}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching grades:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch grades'
      };
    }
  }

  async getGradeById(id: string): Promise<{ success: boolean; data?: Grade; message?: string }> {
    try {
      const response = await apiService.get(`/examinations/grades/${id}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching grade:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch grade'
      };
    }
  }

  async createGrade(data: CreateGradeData): Promise<{ success: boolean; data?: Grade; message?: string }> {
    try {
      const response = await apiService.post('/examinations/grades', data);
      return response;
    } catch (error: any) {
      console.error('Error creating grade:', error);
      return {
        success: false,
        message: error.message || 'Failed to create grade'
      };
    }
  }

  async updateGrade(id: string, data: UpdateGradeData): Promise<{ success: boolean; data?: Grade; message?: string }> {
    try {
      const response = await apiService.put(`/examinations/grades/${id}`, data);
      return response;
    } catch (error: any) {
      console.error('Error updating grade:', error);
      return {
        success: false,
        message: error.message || 'Failed to update grade'
      };
    }
  }

  async deleteGrade(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.delete(`/examinations/grades/${id}`);
      return response;
    } catch (error: any) {
      console.error('Error deleting grade:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete grade'
      };
    }
  }

  // Grading Scale Management
  async getGradingScales(filters?: GradingScaleFilters): Promise<{ success: boolean; data?: GradingScale[]; message?: string }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const response = await apiService.get(`/examinations/grading-scales?${params.toString()}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching grading scales:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch grading scales'
      };
    }
  }

  async createGradingScale(data: CreateGradingScaleData): Promise<{ success: boolean; data?: GradingScale; message?: string }> {
    try {
      const response = await apiService.post('/examinations/grading-scales', data);
      return response;
    } catch (error: any) {
      console.error('Error creating grading scale:', error);
      return {
        success: false,
        message: error.message || 'Failed to create grading scale'
      };
    }
  }

  // Utility Methods
  async getExaminationStats(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await apiService.get('/examinations/stats');
      return response;
    } catch (error: any) {
      console.error('Error fetching examination stats:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch examination stats'
      };
    }
  }

  async getGradeStats(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await apiService.get('/examinations/grade-stats');
      return response;
    } catch (error: any) {
      console.error('Error fetching grade stats:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch grade stats'
      };
    }
  }

  async exportGrades(format: 'csv' | 'excel' = 'csv'): Promise<{ success: boolean; data?: Blob; message?: string }> {
    try {
      // For blob responses, we need to use fetch directly with full URL
      const token = apiService.getToken();
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const headers: HeadersInit = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`${baseURL}/examinations/export/grades?format=${format}`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to export grades');
      }
      
      const blob = await response.blob();
      return {
        success: true,
        data: blob
      };
    } catch (error: any) {
      console.error('Error exporting grades:', error);
      return {
        success: false,
        message: error.message || 'Failed to export grades'
      };
    }
  }
}

export const examinationService = new ExaminationService();
