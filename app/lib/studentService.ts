// Student Management Service
import { apiService, PaginatedResponse } from './api';

export interface Student {
  id: string;
  tenantId: string;
  userId: string;
  studentId: string;
  admissionNumber?: string;
  admissionDate?: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  nationality: string;
  religion?: string;
  bloodGroup?: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string;
  phone?: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalInfo?: string;
  previousSchool?: string;
  previousGrade?: string;
  transportMode?: string;
  transportRoute?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'TRANSFERRED' | 'DROPPED';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status: string;
  };
  enrollments?: StudentEnrollment[];
  parentRelations?: ParentStudentRelation[];
  academicRecords?: StudentAcademicRecord[];
  healthRecords?: HealthRecord[];
  documents?: StudentDocument[];
  attendance?: Attendance[];
}

export interface Parent {
  id: string;
  tenantId: string;
  userId: string;
  occupation?: string;
  workplace?: string;
  workPhone?: string;
  education?: string;
  relationship: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';
  isPrimary: boolean;
  isEmergency: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status: string;
  };
  parentRelations?: ParentStudentRelation[];
}

export interface StudentEnrollment {
  id: string;
  tenantId: string;
  studentId: string;
  academicYearId: string;
  classId?: string;
  courseId?: string;
  subjectId?: string;
  enrollmentType: 'COURSE' | 'SUBJECT' | 'CLASS';
  enrollmentDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'COMPLETED' | 'DROPPED';
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  academicYear: {
    id: string;
    yearName: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  };
  class?: {
    id: string;
    className: string;
    classCode: string;
  };
  course?: {
    id: string;
    courseName: string;
    courseCode: string;
  };
  subject?: {
    id: string;
    subjectName: string;
    subjectCode: string;
  };
}

export interface StudentAcademicRecord {
  id: string;
  tenantId: string;
  studentId: string;
  academicYearId: string;
  classId?: string;
  subjectId?: string;
  term?: 'FIRST_TERM' | 'SECOND_TERM' | 'THIRD_TERM' | 'ANNUAL';
  totalMarks?: number;
  averageMarks?: number;
  grade?: string;
  points?: number;
  division?: string;
  rank?: number;
  attendance?: number;
  behavior?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  comments?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  academicYear: {
    id: string;
    yearName: string;
  };
  class?: {
    id: string;
    className: string;
  };
  subject?: {
    id: string;
    subjectName: string;
  };
}

export interface ParentStudentRelation {
  id: string;
  tenantId: string;
  parentId: string;
  studentId: string;
  relationship: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';
  isPrimary: boolean;
  isEmergency: boolean;
  canPickup: boolean;
  notes?: string;
  createdAt: string;
  parent: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  student: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface HealthRecord {
  id: string;
  tenantId: string;
  studentId: string;
  recordType: 'MEDICAL_CHECKUP' | 'VACCINATION' | 'INJURY' | 'ILLNESS' | 'ALLERGY' | 'MEDICATION' | 'EMERGENCY' | 'OTHER';
  title: string;
  description?: string;
  date: string;
  doctor?: string;
  hospital?: string;
  medication?: string;
  dosage?: string;
  followUpDate?: string;
  isEmergency: boolean;
  attachments?: string;
  status: 'ACTIVE' | 'RESOLVED' | 'ONGOING' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface StudentDocument {
  id: string;
  tenantId: string;
  studentId: string;
  documentType: 'BIRTH_CERTIFICATE' | 'NATIONAL_ID' | 'PASSPORT' | 'PHOTO' | 'MEDICAL_CERTIFICATE' | 'TRANSFER_CERTIFICATE' | 'REPORT_CARD' | 'OTHER';
  title: string;
  description?: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isRequired: boolean;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  expiryDate?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'ARCHIVED' | 'PENDING_VERIFICATION';
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  tenantId: string;
  studentId: string;
  classId?: string;
  subjectId?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK';
  period?: 'MORNING' | 'AFTERNOON' | 'FULL_DAY';
  reason?: string;
  notes?: string;
  markedBy: string;
  createdAt: string;
  updatedAt: string;
  class?: {
    id: string;
    className: string;
  };
  subject?: {
    id: string;
    subjectName: string;
  };
}

export interface StudentFilters {
  search?: string;
  status?: string;
  gender?: string;
  classId?: string;
  academicYearId?: string;
  page?: number;
  limit?: number;
}

export interface ParentFilters {
  search?: string;
  status?: string;
  relationship?: string;
  page?: number;
  limit?: number;
}

export interface StudentStatistics {
  totalStudents: number;
  activeStudents: number;
  maleStudents: number;
  femaleStudents: number;
  studentsByClass: Record<string, number>;
  studentsByStatus: Record<string, number>;
  averageAge: number;
  attendanceRate: number;
}

class StudentService {
  // Student Management
  public async getStudents(filters: StudentFilters = {}): Promise<PaginatedResponse<Student[]>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.classId) params.append('classId', filters.classId);
    if (filters.academicYearId) params.append('academicYearId', filters.academicYearId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/students${queryString ? `?${queryString}` : ''}`;
    
    return apiService.get<Student[]>(endpoint);
  }

  public async getStudentById(studentId: string): Promise<Student> {
    const response = await apiService.get<Student>(`/students/${studentId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch student');
    }
    
    return response.data;
  }

  public async getStudent(studentId: string): Promise<Student> {
    return this.getStudentById(studentId);
  }

  public async createStudent(studentData: {
    firstName: string;
    lastName: string;
    email: string;
    studentId: string;
    admissionNumber?: string;
    admissionDate?: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    nationality?: string;
    religion?: string;
    bloodGroup?: string;
    address: string;
    city: string;
    region: string;
    postalCode?: string;
    phone?: string;
    emergencyContact: string;
    emergencyPhone: string;
    medicalInfo?: string;
    previousSchool?: string;
    previousGrade?: string;
    transportMode?: string;
    transportRoute?: string;
  }): Promise<Student> {
    const response = await apiService.post<Student>('/students', studentData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create student');
    }
    
    return response.data;
  }

  public async updateStudent(studentId: string, studentData: Partial<{
    studentId: string;
    admissionNumber: string;
    admissionDate: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    nationality: string;
    religion: string;
    bloodGroup: string;
    address: string;
    city: string;
    region: string;
    postalCode: string;
    phone: string;
    emergencyContact: string;
    emergencyPhone: string;
    medicalInfo: string;
    previousSchool: string;
    previousGrade: string;
    transportMode: string;
    transportRoute: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'TRANSFERRED' | 'DROPPED';
  }>): Promise<Student> {
    const response = await apiService.put<Student>(`/students/${studentId}`, studentData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update student');
    }
    
    return response.data;
  }

  public async deleteStudent(studentId: string): Promise<void> {
    const response = await apiService.delete(`/students/${studentId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete student');
    }
  }

  // Student Enrollment Management
  public async getStudentEnrollments(studentId: string): Promise<StudentEnrollment[]> {
    const response = await apiService.get<StudentEnrollment[]>(`/students/${studentId}/enrollments`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch student enrollments');
    }
    
    return response.data;
  }

  public async createEnrollment(studentId: string, enrollmentData: {
    academicYearId: string;
    classId?: string;
    courseId?: string;
    subjectId?: string;
    enrollmentType: 'COURSE' | 'SUBJECT' | 'CLASS';
    notes?: string;
  }): Promise<StudentEnrollment> {
    const response = await apiService.post<StudentEnrollment>(`/students/${studentId}/enrollments`, enrollmentData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create enrollment');
    }
    
    return response.data;
  }

  public async updateEnrollment(studentId: string, enrollmentId: string, enrollmentData: {
    academicYearId?: string;
    classId?: string;
    courseId?: string;
    subjectId?: string;
    enrollmentType?: 'COURSE' | 'SUBJECT' | 'CLASS';
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'COMPLETED' | 'DROPPED';
    notes?: string;
  }): Promise<StudentEnrollment> {
    const response = await apiService.put<StudentEnrollment>(`/students/${studentId}/enrollments/${enrollmentId}`, enrollmentData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update enrollment');
    }
    
    return response.data;
  }

  public async deleteEnrollment(studentId: string, enrollmentId: string): Promise<void> {
    const response = await apiService.delete(`/students/${studentId}/enrollments/${enrollmentId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete enrollment');
    }
  }

  // Student Academic Records
  public async getStudentAcademicRecords(studentId: string): Promise<StudentAcademicRecord[]> {
    const response = await apiService.get<StudentAcademicRecord[]>(`/students/${studentId}/academic-records`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch academic records');
    }
    
    return response.data;
  }

  public async createAcademicRecord(studentId: string, recordData: {
    academicYearId: string;
    classId?: string;
    subjectId?: string;
    term?: 'FIRST_TERM' | 'SECOND_TERM' | 'THIRD_TERM' | 'ANNUAL';
    totalMarks?: number;
    averageMarks?: number;
    grade?: string;
    points?: number;
    division?: string;
    rank?: number;
    attendance?: number;
    behavior?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    comments?: string;
  }): Promise<StudentAcademicRecord> {
    const response = await apiService.post<StudentAcademicRecord>(`/students/${studentId}/academic-records`, recordData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create academic record');
    }
    
    return response.data;
  }

  // Student Health Records
  public async getStudentHealthRecords(studentId: string): Promise<HealthRecord[]> {
    const response = await apiService.get<HealthRecord[]>(`/students/${studentId}/health-records`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch health records');
    }
    
    return response.data;
  }

  public async createHealthRecord(studentId: string, recordData: {
    recordType: 'MEDICAL_CHECKUP' | 'VACCINATION' | 'INJURY' | 'ILLNESS' | 'ALLERGY' | 'MEDICATION' | 'EMERGENCY' | 'OTHER';
    title: string;
    description?: string;
    date: string;
    doctor?: string;
    hospital?: string;
    medication?: string;
    dosage?: string;
    followUpDate?: string;
    isEmergency?: boolean;
    attachments?: string;
  }): Promise<HealthRecord> {
    const response = await apiService.post<HealthRecord>(`/students/${studentId}/health-records`, recordData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create health record');
    }
    
    return response.data;
  }

  // Student Documents
  public async getStudentDocuments(studentId: string): Promise<StudentDocument[]> {
    const response = await apiService.get<StudentDocument[]>(`/students/${studentId}/documents`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch documents');
    }
    
    return response.data;
  }

  public async createDocument(studentId: string, documentData: {
    documentType: 'BIRTH_CERTIFICATE' | 'NATIONAL_ID' | 'PASSPORT' | 'PHOTO' | 'MEDICAL_CERTIFICATE' | 'TRANSFER_CERTIFICATE' | 'REPORT_CARD' | 'OTHER';
    title: string;
    description?: string;
    filePath: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    isRequired?: boolean;
    expiryDate?: string;
  }): Promise<StudentDocument> {
    const response = await apiService.post<StudentDocument>(`/students/${studentId}/documents`, documentData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create document');
    }
    
    return response.data;
  }

  // Student Attendance
  public async getStudentAttendance(studentId: string): Promise<Attendance[]> {
    const response = await apiService.get<Attendance[]>(`/students/${studentId}/attendance`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch attendance');
    }
    
    return response.data;
  }

  public async createAttendance(studentId: string, attendanceData: {
    classId?: string;
    subjectId?: string;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK';
    period?: 'MORNING' | 'AFTERNOON' | 'FULL_DAY';
    reason?: string;
    notes?: string;
  }): Promise<Attendance> {
    const response = await apiService.post<Attendance>(`/students/${studentId}/attendance`, attendanceData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create attendance');
    }
    
    return response.data;
  }

  // Student Statistics
  public async getStudentStatistics(studentId: string): Promise<StudentStatistics> {
    const response = await apiService.get<StudentStatistics>(`/students/${studentId}/statistics`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch student statistics');
    }
    
    return response.data;
  }

  // Parent Management
  public async getParents(filters: ParentFilters = {}): Promise<PaginatedResponse<Parent[]>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.relationship) params.append('relationship', filters.relationship);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/parents${queryString ? `?${queryString}` : ''}`;
    
    return apiService.get<Parent[]>(endpoint);
  }

  public async getParentById(parentId: string): Promise<Parent> {
    const response = await apiService.get<Parent>(`/parents/${parentId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch parent');
    }
    
    return response.data;
  }

  public async createParent(parentData: {
    userId: string;
    occupation?: string;
    workplace?: string;
    workPhone?: string;
    education?: string;
    relationship: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';
    isPrimary?: boolean;
    isEmergency?: boolean;
  }): Promise<Parent> {
    const response = await apiService.post<Parent>('/parents', parentData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create parent');
    }
    
    return response.data;
  }

  public async updateParent(parentId: string, parentData: Partial<{
    occupation: string;
    workplace: string;
    workPhone: string;
    education: string;
    relationship: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';
    isPrimary: boolean;
    isEmergency: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  }>): Promise<Parent> {
    const response = await apiService.put<Parent>(`/parents/${parentId}`, parentData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update parent');
    }
    
    return response.data;
  }

  public async deleteParent(parentId: string): Promise<void> {
    const response = await apiService.delete(`/parents/${parentId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete parent');
    }
  }

  // Parent-Student Relationships
  public async getParentStudents(parentId: string): Promise<ParentStudentRelation[]> {
    const response = await apiService.get<ParentStudentRelation[]>(`/parents/${parentId}/students`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch parent students');
    }
    
    return response.data;
  }

  public async createParentRelation(parentId: string, relationData: {
    studentId: string;
    relationship: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';
    isPrimary?: boolean;
    isEmergency?: boolean;
    canPickup?: boolean;
    notes?: string;
  }): Promise<ParentStudentRelation> {
    const response = await apiService.post<ParentStudentRelation>(`/parents/${parentId}/students`, relationData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create parent-student relationship');
    }
    
    return response.data;
  }

  // Parent Portal Methods
  public async getChildAcademicRecords(parentId: string, studentId: string): Promise<StudentAcademicRecord[]> {
    const response = await apiService.get<StudentAcademicRecord[]>(`/parents/${parentId}/children/${studentId}/academic-records`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch child academic records');
    }
    
    return response.data;
  }

  public async getChildAttendance(parentId: string, studentId: string): Promise<Attendance[]> {
    const response = await apiService.get<Attendance[]>(`/parents/${parentId}/children/${studentId}/attendance`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch child attendance');
    }
    
    return response.data;
  }
}

export const studentService = new StudentService();
export default studentService;




