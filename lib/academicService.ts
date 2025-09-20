import { ApiService } from './apiService';

interface CreateClassData {
  className: string;
  classCode: string;
  academicLevel: string;
  academicYearId: string;
  capacity: number;
  teacherId: string;
  subjectIds: string[];
  description?: string;
}

interface AssignStudentData {
  studentId: string;
  classId: string;
  academicYearId: string;
}

interface AssignTeacherData {
  teacherId: string;
  classId: string;
  role: 'CLASS_TEACHER' | 'SUBJECT_TEACHER';
}

interface CreateScheduleData {
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location?: string;
}

class AcademicService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService();
  }

  // Class Management
  async getClasses() {
    return this.apiService.get('/api/classes');
  }

  async getClass(id: string) {
    return this.apiService.get(`/api/classes/${id}`);
  }

  async createClass(classData: CreateClassData) {
    return this.apiService.post('/api/classes', classData);
  }

  async updateClass(id: string, classData: Partial<CreateClassData>) {
    return this.apiService.put(`/api/classes/${id}`, classData);
  }

  async deleteClass(id: string) {
    return this.apiService.delete(`/api/classes/${id}`);
  }

  // Subject Management
  async getSubjects() {
    return this.apiService.get('/api/subjects');
  }

  // Student Assignment
  async getClassStudents(classId: string) {
    return this.apiService.get(`/api/classes/${classId}/students`);
  }

  async assignStudent(data: AssignStudentData) {
    return this.apiService.post(`/api/classes/${data.classId}/students`, data);
  }

  async removeStudent(classId: string, studentId: string) {
    return this.apiService.delete(`/api/classes/${classId}/students/${studentId}`);
  }

  // Teacher Assignment
  async getClassTeachers(classId: string) {
    return this.apiService.get(`/api/classes/${classId}/teachers`);
  }

  async assignTeacher(data: AssignTeacherData) {
    return this.apiService.post(`/api/classes/${data.classId}/teachers`, data);
  }

  async removeTeacher(classId: string, teacherId: string) {
    return this.apiService.delete(`/api/classes/${classId}/teachers/${teacherId}`);
  }

  // Class Scheduling
  async getClassSchedule(classId: string) {
    return this.apiService.get(`/api/classes/${classId}/schedule`);
  }

  async createSchedule(data: CreateScheduleData) {
    return this.apiService.post(`/api/classes/${data.classId}/schedule`, data);
  }

  async updateSchedule(classId: string, scheduleId: string, data: Partial<CreateScheduleData>) {
    return this.apiService.put(`/api/classes/${classId}/schedule/${scheduleId}`, data);
  }

  async deleteSchedule(classId: string, scheduleId: string) {
    return this.apiService.delete(`/api/classes/${classId}/schedule/${scheduleId}`);
  }

  // Reports and Analytics
  async getClassReport(classId: string) {
    return this.apiService.get(`/api/classes/${classId}/report`);
  }

  async getClassAnalytics(classId: string) {
    return this.apiService.get(`/api/classes/${classId}/analytics`);
  }
}

export const academicService = new AcademicService();