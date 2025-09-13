// Academic Data Filtering Based on User Roles
import { User } from './auth';
import { createPermissionChecker } from './rolePermissions';

export interface AcademicFilters {
  // Basic filters
  search?: string;
  status?: string;
  level?: string;
  type?: string;
  
  // Role-based filters
  tenantId?: string;
  userId?: string;
  assignedToUser?: boolean;
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CourseFilters extends AcademicFilters {
  courseCode?: string;
  credits?: number;
  subjectIds?: string[];
}

export interface SubjectFilters extends AcademicFilters {
  subjectCode?: string;
  subjectLevel?: string;
  subjectType?: string;
  teacherIds?: string[];
}

export interface ClassFilters extends AcademicFilters {
  className?: string;
  grade?: string;
  section?: string;
  teacherId?: string;
}

export class AcademicDataFilter {
  private user: User | null;
  private permissionChecker: ReturnType<typeof createPermissionChecker>;

  constructor(user: User | null) {
    this.user = user;
    this.permissionChecker = createPermissionChecker(user);
  }

  /**
   * Get courses based on user role and permissions
   */
  async getCourses(filters: CourseFilters = {}): Promise<any[]> {
    // Apply role-based filtering
    const roleBasedFilters = this.applyRoleBasedFilters(filters);
    
    // Super Admin can see all courses across all tenants
    if (this.permissionChecker.isSuperAdmin()) {
      return this.fetchCourses(roleBasedFilters);
    }
    
    // Tenant Admin can see all courses within their tenant
    if (this.permissionChecker.isTenantAdmin()) {
      roleBasedFilters.tenantId = this.user?.tenant?.id;
      return this.fetchCourses(roleBasedFilters);
    }
    
    // Teachers can see courses they are assigned to
    if (this.permissionChecker.isTeacher()) {
      roleBasedFilters.tenantId = this.user?.tenant?.id;
      roleBasedFilters.assignedToUser = true;
      return this.fetchCourses(roleBasedFilters);
    }
    
    // Students can see courses they are enrolled in
    if (this.permissionChecker.isStudent()) {
      roleBasedFilters.tenantId = this.user?.tenant?.id;
      roleBasedFilters.assignedToUser = true;
      return this.fetchCourses(roleBasedFilters);
    }
    
    return [];
  }

  /**
   * Get subjects based on user role and permissions
   */
  async getSubjects(filters: SubjectFilters = {}): Promise<any[]> {
    // Apply role-based filtering
    const roleBasedFilters = this.applyRoleBasedFilters(filters);
    
    // Super Admin can see all subjects across all tenants
    if (this.permissionChecker.isSuperAdmin()) {
      return this.fetchSubjects(roleBasedFilters);
    }
    
    // Tenant Admin can see all subjects within their tenant
    if (this.permissionChecker.isTenantAdmin()) {
      roleBasedFilters.tenantId = this.user?.tenant?.id;
      return this.fetchSubjects(roleBasedFilters);
    }
    
    // Teachers can see subjects they are assigned to
    if (this.permissionChecker.isTeacher()) {
      roleBasedFilters.tenantId = this.user?.tenant?.id;
      roleBasedFilters.assignedToUser = true;
      return this.fetchSubjects(roleBasedFilters);
    }
    
    // Students can see subjects they are enrolled in
    if (this.permissionChecker.isStudent()) {
      roleBasedFilters.tenantId = this.user?.tenant?.id;
      roleBasedFilters.assignedToUser = true;
      return this.fetchSubjects(roleBasedFilters);
    }
    
    return [];
  }

  /**
   * Get classes based on user role and permissions
   */
  async getClasses(filters: ClassFilters = {}): Promise<any[]> {
    // Apply role-based filtering
    const roleBasedFilters = this.applyRoleBasedFilters(filters);
    
    // Super Admin can see all classes across all tenants
    if (this.permissionChecker.isSuperAdmin()) {
      return this.fetchClasses(roleBasedFilters);
    }
    
    // Tenant Admin can see all classes within their tenant
    if (this.permissionChecker.isTenantAdmin()) {
      roleBasedFilters.tenantId = this.user?.tenant?.id;
      return this.fetchClasses(roleBasedFilters);
    }
    
    // Teachers can see classes they teach
    if (this.permissionChecker.isTeacher()) {
      roleBasedFilters.tenantId = this.user?.tenant?.id;
      roleBasedFilters.teacherId = this.user?.id;
      return this.fetchClasses(roleBasedFilters);
    }
    
    // Students can see classes they are enrolled in
    if (this.permissionChecker.isStudent()) {
      roleBasedFilters.tenantId = this.user?.tenant?.id;
      roleBasedFilters.assignedToUser = true;
      return this.fetchClasses(roleBasedFilters);
    }
    
    return [];
  }

  /**
   * Get teacher assignments based on user role
   */
  async getTeacherAssignments(filters: AcademicFilters = {}): Promise<any[]> {
    // Apply role-based filtering
    const roleBasedFilters = this.applyRoleBasedFilters(filters);
    
    // Super Admin can see all assignments across all tenants
    if (this.permissionChecker.isSuperAdmin()) {
      return this.fetchTeacherAssignments(roleBasedFilters);
    }
    
    // Tenant Admin can see all assignments within their tenant
    if (this.permissionChecker.isTenantAdmin()) {
      roleBasedFilters.tenantId = this.user?.tenant?.id;
      return this.fetchTeacherAssignments(roleBasedFilters);
    }
    
    // Teachers can see their own assignments
    if (this.permissionChecker.isTeacher()) {
      roleBasedFilters.tenantId = this.user?.tenant?.id;
      roleBasedFilters.userId = this.user?.id;
      return this.fetchTeacherAssignments(roleBasedFilters);
    }
    
    return [];
  }

  /**
   * Get academic statistics based on user role
   */
  async getAcademicStats(filters: AcademicFilters = {}): Promise<any> {
    const roleBasedFilters = this.applyRoleBasedFilters(filters);
    
    // Super Admin can see system-wide statistics
    if (this.permissionChecker.isSuperAdmin()) {
      return this.fetchAcademicStats(roleBasedFilters);
    }
    
    // Tenant Admin can see tenant-specific statistics
    if (this.permissionChecker.isTenantAdmin()) {
      roleBasedFilters.tenantId = this.user?.tenant?.id;
      return this.fetchAcademicStats(roleBasedFilters);
    }
    
    // Teachers can see statistics for their assigned subjects/classes
    if (this.permissionChecker.isTeacher()) {
      roleBasedFilters.tenantId = this.user?.tenant?.id;
      roleBasedFilters.userId = this.user?.id;
      return this.fetchAcademicStats(roleBasedFilters);
    }
    
    // Students can see their personal statistics
    if (this.permissionChecker.isStudent()) {
      roleBasedFilters.tenantId = this.user?.tenant?.id;
      roleBasedFilters.userId = this.user?.id;
      return this.fetchAcademicStats(roleBasedFilters);
    }
    
    return {};
  }

  /**
   * Apply role-based filters to the base filters
   */
  private applyRoleBasedFilters(filters: AcademicFilters): AcademicFilters {
    const roleBasedFilters = { ...filters };
    
    // Always filter by tenant for non-Super Admin users
    if (!this.permissionChecker.isSuperAdmin() && this.user?.tenant?.id) {
      roleBasedFilters.tenantId = this.user.tenant.id;
    }
    
    return roleBasedFilters;
  }

  /**
   * Fetch courses from API (placeholder - replace with actual API calls)
   */
  private async fetchCourses(filters: CourseFilters): Promise<any[]> {
    // This would be replaced with actual API calls
    // For now, return empty array
    return [];
  }

  /**
   * Fetch subjects from API (placeholder - replace with actual API calls)
   */
  private async fetchSubjects(filters: SubjectFilters): Promise<any[]> {
    // This would be replaced with actual API calls
    // For now, return empty array
    return [];
  }

  /**
   * Fetch classes from API (placeholder - replace with actual API calls)
   */
  private async fetchClasses(filters: ClassFilters): Promise<any[]> {
    // This would be replaced with actual API calls
    // For now, return empty array
    return [];
  }

  /**
   * Fetch teacher assignments from API (placeholder - replace with actual API calls)
   */
  private async fetchTeacherAssignments(filters: AcademicFilters): Promise<any[]> {
    // This would be replaced with actual API calls
    // For now, return empty array
    return [];
  }

  /**
   * Fetch academic statistics from API (placeholder - replace with actual API calls)
   */
  private async fetchAcademicStats(filters: AcademicFilters): Promise<any> {
    // This would be replaced with actual API calls
    // For now, return empty object
    return {};
  }

  /**
   * Check if user can view specific academic data
   */
  canViewAcademicData(resource: string, resourceId?: string): boolean {
    switch (resource) {
      case 'courses':
        return this.permissionChecker.hasPermission('courses', 'read');
      case 'subjects':
        return this.permissionChecker.hasPermission('subjects', 'read');
      case 'classes':
        return this.permissionChecker.hasPermission('classes', 'read');
      case 'examinations':
        return this.permissionChecker.hasPermission('examinations', 'read');
      case 'grades':
        return this.permissionChecker.hasPermission('grades', 'read');
      case 'teacher_assignments':
        return this.permissionChecker.hasAnyRole(['Super Admin', 'Tenant Admin', 'Teacher']);
      default:
        return false;
    }
  }

  /**
   * Check if user can manage specific academic data
   */
  canManageAcademicData(resource: string, resourceId?: string): boolean {
    switch (resource) {
      case 'courses':
        return this.permissionChecker.hasPermission('courses', 'create') || 
               this.permissionChecker.hasPermission('courses', 'update') ||
               this.permissionChecker.hasPermission('courses', 'delete');
      case 'subjects':
        return this.permissionChecker.hasPermission('subjects', 'create') || 
               this.permissionChecker.hasPermission('subjects', 'update') ||
               this.permissionChecker.hasPermission('subjects', 'delete');
      case 'classes':
        return this.permissionChecker.hasPermission('classes', 'create') || 
               this.permissionChecker.hasPermission('classes', 'update') ||
               this.permissionChecker.hasPermission('classes', 'delete');
      case 'examinations':
        return this.permissionChecker.hasPermission('examinations', 'create') || 
               this.permissionChecker.hasPermission('examinations', 'update') ||
               this.permissionChecker.hasPermission('examinations', 'delete');
      case 'grades':
        return this.permissionChecker.hasPermission('grades', 'create') || 
               this.permissionChecker.hasPermission('grades', 'update') ||
               this.permissionChecker.hasPermission('grades', 'delete');
      case 'teacher_assignments':
        return this.permissionChecker.hasAnyRole(['Super Admin', 'Tenant Admin']);
      default:
        return false;
    }
  }

  /**
   * Get available filter options based on user role
   */
  getAvailableFilters(resource: string): any {
    const baseFilters = {
      search: true,
      status: true,
      page: true,
      limit: true,
      sortBy: true,
      sortOrder: true,
    };

    if (this.permissionChecker.isSuperAdmin()) {
      return {
        ...baseFilters,
        tenantId: true,
        userId: true,
      };
    }

    if (this.permissionChecker.isTenantAdmin()) {
      return {
        ...baseFilters,
        userId: true,
      };
    }

    if (this.permissionChecker.isTeacher()) {
      return {
        ...baseFilters,
        assignedToUser: true,
      };
    }

    if (this.permissionChecker.isStudent()) {
      return {
        ...baseFilters,
        assignedToUser: true,
      };
    }

    return baseFilters;
  }

  /**
   * Get default filters based on user role
   */
  getDefaultFilters(resource: string): AcademicFilters {
    const defaultFilters: AcademicFilters = {
      status: 'ACTIVE',
      page: 1,
      limit: 25,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    // Always filter by tenant for non-Super Admin users
    if (!this.permissionChecker.isSuperAdmin() && this.user?.tenant?.id) {
      defaultFilters.tenantId = this.user.tenant.id;
    }

    // Teachers and students see only their assigned data
    if (this.permissionChecker.isTeacher() || this.permissionChecker.isStudent()) {
      defaultFilters.assignedToUser = true;
    }

    return defaultFilters;
  }
}

// Export utility functions
export const createAcademicFilter = (user: User | null): AcademicDataFilter => {
  return new AcademicDataFilter(user);
};

export const getAcademicFilters = (user: User | null, resource: string): AcademicFilters => {
  const filter = createAcademicFilter(user);
  return filter.getDefaultFilters(resource);
};

export const canViewAcademicData = (user: User | null, resource: string, resourceId?: string): boolean => {
  const filter = createAcademicFilter(user);
  return filter.canViewAcademicData(resource, resourceId);
};

export const canManageAcademicData = (user: User | null, resource: string, resourceId?: string): boolean => {
  const filter = createAcademicFilter(user);
  return filter.canManageAcademicData(resource, resourceId);
};
