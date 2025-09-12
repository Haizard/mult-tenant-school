// Academic Management Service
import { apiService, PaginatedResponse } from './api';

export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  description?: string;
  credits: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: string;
    name: string;
  };
  createdByUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  courseSubjects: Array<{
    id: string;
    subject: Subject;
    isRequired: boolean;
  }>;
}

export interface Subject {
  id: string;
  subjectName: string;
  subjectCode?: string;
  subjectLevel: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL' | 'UNIVERSITY';
  subjectType: 'CORE' | 'OPTIONAL' | 'COMBINATION';
  description?: string;
  credits: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: string;
    name: string;
  };
  createdByUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  teacherSubjects: Array<{
    id: string;
    teacher: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    assignedAt: string;
  }>;
}

export interface TeacherSubject {
  id: string;
  teacherId: string;
  subjectId: string;
  assignedAt: string;
  assignedBy?: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  subject: Subject;
}

export interface AcademicYear {
  id: string;
  yearName: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: string;
    name: string;
  };
}

export interface Class {
  id: string;
  className: string;
  classCode: string;
  academicLevel: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL' | 'UNIVERSITY';
  academicYearId: string;
  capacity: number;
  teacherId: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: string;
    name: string;
  };
  academicYear: AcademicYear;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdByUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  classSubjects: Array<{
    id: string;
    subject: Subject;
  }>;
}

export interface CourseFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface SubjectFilters {
  search?: string;
  status?: string;
  subjectLevel?: string;
  subjectType?: string;
  page?: number;
  limit?: number;
}

export interface TeacherSubjectFilters {
  teacherId?: string;
  subjectId?: string;
}

export interface ClassFilters {
  search?: string;
  status?: string;
  academicLevel?: string;
  academicYearId?: string;
  page?: number;
  limit?: number;
}

class AcademicService {
  // Course Management
  public async getCourses(filters: CourseFilters = {}): Promise<PaginatedResponse<Course[]>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/academic/courses${queryString ? `?${queryString}` : ''}`;
    
    return apiService.get<Course[]>(endpoint);
  }

  public async getCourseById(courseId: string): Promise<Course> {
    const response = await apiService.get<Course>(`/academic/courses/${courseId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch course');
    }
    
    return response.data;
  }

  public async createCourse(courseData: {
    courseCode: string;
    courseName: string;
    description?: string;
    credits?: number;
    subjectIds?: string[];
  }): Promise<Course> {
    const response = await apiService.post<Course>('/academic/courses', courseData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create course');
    }
    
    return response.data;
  }

  public async updateCourse(courseId: string, courseData: {
    courseCode?: string;
    courseName?: string;
    description?: string;
    credits?: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  }): Promise<Course> {
    const response = await apiService.put<Course>(`/academic/courses/${courseId}`, courseData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update course');
    }
    
    return response.data;
  }

  public async deleteCourse(courseId: string): Promise<void> {
    const response = await apiService.delete(`/academic/courses/${courseId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete course');
    }
  }

  // Subject Management
  public async getSubjects(filters: SubjectFilters = {}): Promise<PaginatedResponse<Subject[]>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.subjectLevel) params.append('subjectLevel', filters.subjectLevel);
    if (filters.subjectType) params.append('subjectType', filters.subjectType);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/academic/subjects${queryString ? `?${queryString}` : ''}`;
    
    return apiService.get<Subject[]>(endpoint);
  }

  public async getSubjectById(subjectId: string): Promise<Subject> {
    const response = await apiService.get<Subject>(`/academic/subjects/${subjectId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch subject');
    }
    
    return response.data;
  }

  public async createSubject(subjectData: {
    subjectName: string;
    subjectCode?: string;
    subjectLevel: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL' | 'UNIVERSITY';
    subjectType: 'CORE' | 'OPTIONAL' | 'COMBINATION';
    description?: string;
    credits?: number;
  }): Promise<Subject> {
    const response = await apiService.post<Subject>('/academic/subjects', subjectData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create subject');
    }
    
    return response.data;
  }

  public async updateSubject(subjectId: string, subjectData: {
    subjectName?: string;
    subjectCode?: string;
    subjectLevel?: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL' | 'UNIVERSITY';
    subjectType?: 'CORE' | 'OPTIONAL' | 'COMBINATION';
    description?: string;
    credits?: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  }): Promise<Subject> {
    const response = await apiService.put<Subject>(`/academic/subjects/${subjectId}`, subjectData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update subject');
    }
    
    return response.data;
  }

  public async deleteSubject(subjectId: string): Promise<void> {
    const response = await apiService.delete(`/academic/subjects/${subjectId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete subject');
    }
  }

  // Teacher-Subject Assignment
  public async getTeacherSubjects(filters: TeacherSubjectFilters = {}): Promise<TeacherSubject[]> {
    const params = new URLSearchParams();
    
    if (filters.teacherId) params.append('teacherId', filters.teacherId);
    if (filters.subjectId) params.append('subjectId', filters.subjectId);

    const queryString = params.toString();
    const endpoint = `/academic/teacher-subjects${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiService.get<TeacherSubject[]>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch teacher-subject assignments');
    }
    
    return response.data;
  }

  public async assignTeacherToSubject(teacherId: string, subjectId: string): Promise<TeacherSubject> {
    const response = await apiService.post<TeacherSubject>('/academic/teacher-subjects', {
      teacherId,
      subjectId,
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to assign teacher to subject');
    }
    
    return response.data;
  }

  public async removeTeacherFromSubject(assignmentId: string): Promise<void> {
    const response = await apiService.delete(`/academic/teacher-subjects/${assignmentId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to remove teacher from subject');
    }
  }

  // Academic Year Management
  public async getAcademicYears(): Promise<AcademicYear[]> {
    const response = await apiService.get<AcademicYear[]>('/academic/academic-years');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch academic years');
    }
    
    return response.data;
  }

  public async createAcademicYear(academicYearData: {
    yearName: string;
    startDate: string;
    endDate: string;
    isCurrent?: boolean;
  }): Promise<AcademicYear> {
    const response = await apiService.post<AcademicYear>('/academic/academic-years', academicYearData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create academic year');
    }
    
    return response.data;
  }

  public async updateAcademicYear(academicYearId: string, academicYearData: {
    yearName?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  }): Promise<AcademicYear> {
    const response = await apiService.put<AcademicYear>(`/academic/academic-years/${academicYearId}`, academicYearData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update academic year');
    }
    
    return response.data;
  }

  public async deleteAcademicYear(academicYearId: string): Promise<void> {
    const response = await apiService.delete(`/academic/academic-years/${academicYearId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete academic year');
    }
  }

  // Class Management
  public async getClasses(filters: ClassFilters = {}): Promise<PaginatedResponse<Class[]>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.academicLevel) params.append('academicLevel', filters.academicLevel);
    if (filters.academicYearId) params.append('academicYearId', filters.academicYearId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/academic/classes${queryString ? `?${queryString}` : ''}`;
    
    return apiService.get<Class[]>(endpoint);
  }

  public async getClassById(classId: string): Promise<Class> {
    const response = await apiService.get<Class>(`/academic/classes/${classId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch class');
    }
    
    return response.data;
  }

  public async createClass(classData: {
    className: string;
    classCode: string;
    academicLevel: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL' | 'UNIVERSITY';
    academicYearId: string;
    capacity: number;
    teacherId: string;
    subjectIds: string[];
    description?: string;
  }): Promise<Class> {
    const response = await apiService.post<Class>('/academic/classes', classData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create class');
    }
    
    return response.data;
  }

  public async updateClass(classId: string, classData: {
    className?: string;
    classCode?: string;
    academicLevel?: 'PRIMARY' | 'O_LEVEL' | 'A_LEVEL' | 'UNIVERSITY';
    academicYearId?: string;
    capacity?: number;
    teacherId?: string;
    subjectIds?: string[];
    description?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  }): Promise<Class> {
    const response = await apiService.put<Class>(`/academic/classes/${classId}`, classData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update class');
    }
    
    return response.data;
  }

  public async deleteClass(classId: string): Promise<void> {
    const response = await apiService.delete(`/academic/classes/${classId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete class');
    }
  }

  // Statistics
  public async getAcademicStats(): Promise<{
    totalCourses: number;
    activeCourses: number;
    totalSubjects: number;
    activeSubjects: number;
    subjectsByLevel: Record<string, number>;
    subjectsByType: Record<string, number>;
    totalCredits: number;
    averageCredits: number;
  }> {
    const response = await apiService.get<{
      totalCourses: number;
      activeCourses: number;
      totalSubjects: number;
      activeSubjects: number;
      subjectsByLevel: Record<string, number>;
      subjectsByType: Record<string, number>;
      totalCredits: number;
      averageCredits: number;
    }>('/academic/stats');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch academic statistics');
    }
    
    return response.data;
  }
}

export const academicService = new AcademicService();
export default academicService;
