import { apiService } from './api';

export interface TeacherDemographics {
  total: number;
  byGender: {
    male: number;
    female: number;
  };
  byExperience: {
    '0-2': number;
    '3-5': number;
    '6-10': number;
    '10+': number;
  };
  byQualification: Record<string, number>;
  bySubject: Record<string, number>;
}

export interface PerformanceAnalytics {
  averageRating: number;
  ratingDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  byTeacher: Record<string, {
    ratings: number[];
    average: number;
  }>;
}

export interface WorkloadAnalysis {
  teachers: Array<{
    id: string;
    name: string;
    subjects: number;
    classes: number;
    workloadScore: number;
    subjectList: string[];
    classList: string[];
  }>;
  averageSubjects: number;
  averageClasses: number;
  overloaded: any[];
  underutilized: any[];
}

class TeacherReportsService {
  private baseUrl = 'teacher-reports';

  async getDemographics(): Promise<TeacherDemographics> {
    const response = await apiService.get(`${this.baseUrl}/demographics`);
    return response.data;
  }

  async getPerformanceAnalytics(): Promise<PerformanceAnalytics> {
    const response = await apiService.get(`${this.baseUrl}/performance`);
    return response.data;
  }

  async getWorkloadAnalysis(): Promise<WorkloadAnalysis> {
    const response = await apiService.get(`${this.baseUrl}/workload`);
    return response.data;
  }
}

export const teacherReportsService = new TeacherReportsService();