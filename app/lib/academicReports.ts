// Academic Reports and Analytics System
import { User } from './auth';
import { createPermissionChecker } from './rolePermissions';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  tenantId?: string;
  userId?: string;
  academicYear?: string;
  semester?: string;
  grade?: string;
  subjectId?: string;
  courseId?: string;
  teacherId?: string;
}

export interface AcademicReport {
  id: string;
  title: string;
  description: string;
  type: 'COURSE' | 'SUBJECT' | 'STUDENT' | 'TEACHER' | 'OVERALL' | 'NECTA';
  format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON';
  filters: ReportFilters;
  data: any;
  generatedAt: string;
  generatedBy: string;
}

export interface CourseReport {
  courseId: string;
  courseName: string;
  courseCode: string;
  totalStudents: number;
  totalSubjects: number;
  averageGrade: number;
  completionRate: number;
  teacherAssignments: number;
  status: string;
}

export interface SubjectReport {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectLevel: string;
  subjectType: string;
  totalStudents: number;
  totalTeachers: number;
  averageGrade: number;
  passRate: number;
  status: string;
}

export interface StudentReport {
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrolledCourses: number;
  enrolledSubjects: number;
  averageGrade: number;
  attendanceRate: number;
  status: string;
}

export interface TeacherReport {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  assignedSubjects: number;
  assignedClasses: number;
  totalStudents: number;
  averageGrade: number;
  status: string;
}

export interface NECTAReport {
  academicLevel: string;
  totalStudents: number;
  totalSubjects: number;
  coreSubjects: number;
  optionalSubjects: number;
  combinationSubjects: number;
  averageGrade: number;
  passRate: number;
  divisionDistribution: {
    division1: number;
    division2: number;
    division3: number;
    division4: number;
    fail: number;
  };
}

export class AcademicReportsService {
  private user: User | null;
  private permissionChecker: ReturnType<typeof createPermissionChecker>;

  constructor(user: User | null) {
    this.user = user;
    this.permissionChecker = createPermissionChecker(user);
  }

  /**
   * Get available reports based on user role
   */
  getAvailableReports(): string[] {
    const reports: string[] = [];

    if (this.permissionChecker.isSuperAdmin()) {
      reports.push(
        'system_overview',
        'tenant_comparison',
        'global_academic_stats',
        'all_courses_report',
        'all_subjects_report',
        'all_teachers_report',
        'all_students_report',
        'necta_compliance_report'
      );
    }

    if (this.permissionChecker.isTenantAdmin()) {
      reports.push(
        'tenant_overview',
        'course_performance',
        'subject_performance',
        'teacher_performance',
        'student_performance',
        'academic_progress',
        'necta_compliance_report',
        'attendance_summary',
        'grade_distribution'
      );
    }

    if (this.permissionChecker.isTeacher()) {
      reports.push(
        'my_subjects_report',
        'my_classes_report',
        'student_progress',
        'gradebook_summary',
        'attendance_report'
      );
    }

    if (this.permissionChecker.isStudent()) {
      reports.push(
        'my_academic_record',
        'my_grades_report',
        'my_attendance_report',
        'my_progress_report'
      );
    }

    return reports;
  }

  /**
   * Generate course performance report
   */
  async generateCourseReport(filters: ReportFilters = {}): Promise<CourseReport[]> {
    if (!this.permissionChecker.canViewReports()) {
      throw new Error('Insufficient permissions to generate course report');
    }

    const roleBasedFilters = this.applyRoleBasedFilters(filters);
    return this.fetchCourseReportData(roleBasedFilters);
  }

  /**
   * Generate subject performance report
   */
  async generateSubjectReport(filters: ReportFilters = {}): Promise<SubjectReport[]> {
    if (!this.permissionChecker.canViewReports()) {
      throw new Error('Insufficient permissions to generate subject report');
    }

    const roleBasedFilters = this.applyRoleBasedFilters(filters);
    return this.fetchSubjectReportData(roleBasedFilters);
  }

  /**
   * Generate student performance report
   */
  async generateStudentReport(filters: ReportFilters = {}): Promise<StudentReport[]> {
    if (!this.permissionChecker.canViewReports()) {
      throw new Error('Insufficient permissions to generate student report');
    }

    const roleBasedFilters = this.applyRoleBasedFilters(filters);
    return this.fetchStudentReportData(roleBasedFilters);
  }

  /**
   * Generate teacher performance report
   */
  async generateTeacherReport(filters: ReportFilters = {}): Promise<TeacherReport[]> {
    if (!this.permissionChecker.canViewReports()) {
      throw new Error('Insufficient permissions to generate teacher report');
    }

    const roleBasedFilters = this.applyRoleBasedFilters(filters);
    return this.fetchTeacherReportData(roleBasedFilters);
  }

  /**
   * Generate NECTA compliance report
   */
  async generateNECTAReport(filters: ReportFilters = {}): Promise<NECTAReport[]> {
    if (!this.permissionChecker.hasAnyRole(['Super Admin', 'Tenant Admin'])) {
      throw new Error('Insufficient permissions to generate NECTA report');
    }

    const roleBasedFilters = this.applyRoleBasedFilters(filters);
    return this.fetchNECTAReportData(roleBasedFilters);
  }

  /**
   * Generate academic analytics dashboard data
   */
  async generateAnalyticsData(filters: ReportFilters = {}): Promise<any> {
    if (!this.permissionChecker.canViewReports()) {
      throw new Error('Insufficient permissions to generate analytics data');
    }

    const roleBasedFilters = this.applyRoleBasedFilters(filters);
    return this.fetchAnalyticsData(roleBasedFilters);
  }

  /**
   * Export report to different formats
   */
  async exportReport(
    reportType: string,
    format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON',
    filters: ReportFilters = {}
  ): Promise<Blob> {
    if (!this.permissionChecker.canViewReports()) {
      throw new Error('Insufficient permissions to export report');
    }

    const roleBasedFilters = this.applyRoleBasedFilters(filters);
    return this.generateReportExport(reportType, format, roleBasedFilters);
  }

  /**
   * Get report templates based on user role
   */
  getReportTemplates(): any[] {
    const templates: any[] = [];

    if (this.permissionChecker.isSuperAdmin()) {
      templates.push(
        {
          id: 'system_overview',
          name: 'System Overview Report',
          description: 'Comprehensive overview of all tenants and system performance',
          icon: 'FaChartBar',
          category: 'System',
          permissions: ['Super Admin'],
        },
        {
          id: 'tenant_comparison',
          name: 'Tenant Comparison Report',
          description: 'Compare performance metrics across different tenants',
          icon: 'FaUsers',
          category: 'System',
          permissions: ['Super Admin'],
        }
      );
    }

    if (this.permissionChecker.isTenantAdmin()) {
      templates.push(
        {
          id: 'tenant_overview',
          name: 'Tenant Overview Report',
          description: 'Comprehensive overview of tenant academic performance',
          icon: 'FaGraduationCap',
          category: 'Academic',
          permissions: ['Super Admin', 'Tenant Admin'],
        },
        {
          id: 'course_performance',
          name: 'Course Performance Report',
          description: 'Detailed analysis of course performance and student outcomes',
          icon: 'FaBookOpen',
          category: 'Academic',
          permissions: ['Super Admin', 'Tenant Admin'],
        },
        {
          id: 'subject_performance',
          name: 'Subject Performance Report',
          description: 'Analysis of subject performance with NECTA compliance',
          icon: 'FaBook',
          category: 'Academic',
          permissions: ['Super Admin', 'Tenant Admin'],
        },
        {
          id: 'teacher_performance',
          name: 'Teacher Performance Report',
          description: 'Evaluation of teacher performance and student outcomes',
          icon: 'FaChalkboardTeacher',
          category: 'Academic',
          permissions: ['Super Admin', 'Tenant Admin'],
        },
        {
          id: 'student_performance',
          name: 'Student Performance Report',
          description: 'Comprehensive student performance analysis',
          icon: 'FaUserGraduate',
          category: 'Academic',
          permissions: ['Super Admin', 'Tenant Admin'],
        },
        {
          id: 'necta_compliance_report',
          name: 'NECTA Compliance Report',
          description: 'Report ensuring compliance with Tanzanian education standards',
          icon: 'FaShieldAlt',
          category: 'Compliance',
          permissions: ['Super Admin', 'Tenant Admin'],
        }
      );
    }

    if (this.permissionChecker.isTeacher()) {
      templates.push(
        {
          id: 'my_subjects_report',
          name: 'My Subjects Report',
          description: 'Performance report for subjects I teach',
          icon: 'FaBook',
          category: 'Personal',
          permissions: ['Super Admin', 'Tenant Admin', 'Teacher'],
        },
        {
          id: 'my_classes_report',
          name: 'My Classes Report',
          description: 'Report for classes I teach',
          icon: 'FaUsers',
          category: 'Personal',
          permissions: ['Super Admin', 'Tenant Admin', 'Teacher'],
        },
        {
          id: 'student_progress',
          name: 'Student Progress Report',
          description: 'Track individual student progress in my classes',
          icon: 'FaChartLine',
          category: 'Personal',
          permissions: ['Super Admin', 'Tenant Admin', 'Teacher'],
        },
        {
          id: 'gradebook_summary',
          name: 'Gradebook Summary',
          description: 'Summary of grades and assessments',
          icon: 'FaClipboardList',
          category: 'Personal',
          permissions: ['Super Admin', 'Tenant Admin', 'Teacher'],
        }
      );
    }

    if (this.permissionChecker.isStudent()) {
      templates.push(
        {
          id: 'my_academic_record',
          name: 'My Academic Record',
          description: 'Complete academic record and transcript',
          icon: 'FaFileAlt',
          category: 'Personal',
          permissions: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'],
        },
        {
          id: 'my_grades_report',
          name: 'My Grades Report',
          description: 'Detailed report of my grades and performance',
          icon: 'FaChartBar',
          category: 'Personal',
          permissions: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'],
        },
        {
          id: 'my_attendance_report',
          name: 'My Attendance Report',
          description: 'Report of my attendance record',
          icon: 'FaCalendarCheck',
          category: 'Personal',
          permissions: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'],
        },
        {
          id: 'my_progress_report',
          name: 'My Progress Report',
          description: 'Track my academic progress over time',
          icon: 'FaChartLine',
          category: 'Personal',
          permissions: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'],
        }
      );
    }

    return templates;
  }

  /**
   * Apply role-based filters to report filters
   */
  private applyRoleBasedFilters(filters: ReportFilters): ReportFilters {
    const roleBasedFilters = { ...filters };

    // Always filter by tenant for non-Super Admin users
    if (!this.permissionChecker.isSuperAdmin() && this.user?.tenant?.id) {
      roleBasedFilters.tenantId = this.user.tenant.id;
    }

    // Teachers can only see their own data
    if (this.permissionChecker.isTeacher()) {
      roleBasedFilters.teacherId = this.user?.id;
    }

    // Students can only see their own data
    if (this.permissionChecker.isStudent()) {
      roleBasedFilters.userId = this.user?.id;
    }

    return roleBasedFilters;
  }

  /**
   * Fetch course report data (placeholder - replace with actual API calls)
   */
  private async fetchCourseReportData(filters: ReportFilters): Promise<CourseReport[]> {
    // This would be replaced with actual API calls
    return [];
  }

  /**
   * Fetch subject report data (placeholder - replace with actual API calls)
   */
  private async fetchSubjectReportData(filters: ReportFilters): Promise<SubjectReport[]> {
    // This would be replaced with actual API calls
    return [];
  }

  /**
   * Fetch student report data (placeholder - replace with actual API calls)
   */
  private async fetchStudentReportData(filters: ReportFilters): Promise<StudentReport[]> {
    // This would be replaced with actual API calls
    return [];
  }

  /**
   * Fetch teacher report data (placeholder - replace with actual API calls)
   */
  private async fetchTeacherReportData(filters: ReportFilters): Promise<TeacherReport[]> {
    // This would be replaced with actual API calls
    return [];
  }

  /**
   * Fetch NECTA report data (placeholder - replace with actual API calls)
   */
  private async fetchNECTAReportData(filters: ReportFilters): Promise<NECTAReport[]> {
    // This would be replaced with actual API calls
    return [];
  }

  /**
   * Fetch analytics data (placeholder - replace with actual API calls)
   */
  private async fetchAnalyticsData(filters: ReportFilters): Promise<any> {
    // This would be replaced with actual API calls
    return {};
  }

  /**
   * Generate report export (placeholder - replace with actual implementation)
   */
  private async generateReportExport(
    reportType: string,
    format: string,
    filters: ReportFilters
  ): Promise<Blob> {
    // This would be replaced with actual export implementation
    return new Blob();
  }
}

// Export utility functions
export const createAcademicReportsService = (user: User | null): AcademicReportsService => {
  return new AcademicReportsService(user);
};

export const getAvailableReports = (user: User | null): string[] => {
  const service = createAcademicReportsService(user);
  return service.getAvailableReports();
};

export const getReportTemplates = (user: User | null): any[] => {
  const service = createAcademicReportsService(user);
  return service.getReportTemplates();
};
