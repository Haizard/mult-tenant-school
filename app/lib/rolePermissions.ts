// Role-Based Access Control (RBAC) Utilities
import { User } from './auth';

export interface Permission {
  resource: string;
  action: string;
  roles: string[];
}

export interface RolePermissions {
  [roleName: string]: Permission[];
}

// Define permissions for each role
export const ROLE_PERMISSIONS: RolePermissions = {
  'Super Admin': [
    // System-wide permissions
    { resource: 'system', action: 'manage', roles: ['Super Admin'] },
    { resource: 'tenants', action: 'create', roles: ['Super Admin'] },
    { resource: 'tenants', action: 'read', roles: ['Super Admin'] },
    { resource: 'tenants', action: 'update', roles: ['Super Admin'] },
    { resource: 'tenants', action: 'delete', roles: ['Super Admin'] },
    
    // User management across all tenants
    { resource: 'users', action: 'create', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'users', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'users', action: 'update', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'users', action: 'delete', roles: ['Super Admin', 'Tenant Admin'] },
    
    // Academic management - read access across all tenants
    { resource: 'courses', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'subjects', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'classes', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    
    // Reports and analytics
    { resource: 'reports', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'analytics', action: 'read', roles: ['Super Admin', 'Tenant Admin'] },
  ],
  
  'Tenant Admin': [
    // Tenant-specific user management
    { resource: 'users', action: 'create', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'users', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'users', action: 'update', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'users', action: 'delete', roles: ['Super Admin', 'Tenant Admin'] },
    
    // Academic management - full CRUD within tenant
    { resource: 'courses', action: 'create', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'courses', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'courses', action: 'update', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'courses', action: 'delete', roles: ['Super Admin', 'Tenant Admin'] },
    
    { resource: 'subjects', action: 'create', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'subjects', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'subjects', action: 'update', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'subjects', action: 'delete', roles: ['Super Admin', 'Tenant Admin'] },
    
    { resource: 'classes', action: 'create', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'classes', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'classes', action: 'update', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'classes', action: 'delete', roles: ['Super Admin', 'Tenant Admin'] },
    
    // Teacher assignments
    { resource: 'teacher_assignments', action: 'create', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'teacher_assignments', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'teacher_assignments', action: 'update', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'teacher_assignments', action: 'delete', roles: ['Super Admin', 'Tenant Admin'] },
    
    // Examination management
    { resource: 'examinations', action: 'create', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'examinations', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'examinations', action: 'update', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'examinations', action: 'delete', roles: ['Super Admin', 'Tenant Admin'] },
    
    // Grade management
    { resource: 'grades', action: 'create', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'grades', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'grades', action: 'update', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'grades', action: 'delete', roles: ['Super Admin', 'Tenant Admin'] },
    
    // Grading scales
    { resource: 'grading-scales', action: 'create', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'grading-scales', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    
    // Academic years
    { resource: 'academic-years', action: 'create', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'academic-years', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'academic-years', action: 'update', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'academic-years', action: 'delete', roles: ['Super Admin', 'Tenant Admin'] },
    
    // Reports and analytics
    { resource: 'reports', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'analytics', action: 'read', roles: ['Super Admin', 'Tenant Admin'] },
    
    // Student management - full CRUD within tenant
    { resource: 'students', action: 'create', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'students', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'students', action: 'update', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'students', action: 'delete', roles: ['Super Admin', 'Tenant Admin'] },
    
    // Parent management - full CRUD within tenant
    { resource: 'parents', action: 'create', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'parents', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'parents', action: 'update', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'parents', action: 'delete', roles: ['Super Admin', 'Tenant Admin'] },
    
    // Administrative features
    { resource: 'library', action: 'manage', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'transport', action: 'manage', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'hostel', action: 'manage', roles: ['Super Admin', 'Tenant Admin'] },
  ],
  
  'Teacher': [
    // Read-only access to academic data
    { resource: 'courses', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'subjects', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'classes', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    
    // Teacher-specific permissions
    { resource: 'teacher_assignments', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'gradebook', action: 'create', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'gradebook', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'gradebook', action: 'update', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'gradebook', action: 'delete', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    
    { resource: 'assessments', action: 'create', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'assessments', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'assessments', action: 'update', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'assessments', action: 'delete', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    
    // Examination management (for assigned subjects)
    { resource: 'examinations', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'examinations', action: 'create', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'examinations', action: 'update', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    
    // Grade management (for assigned subjects)
    { resource: 'grades', action: 'create', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'grades', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'grades', action: 'update', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    
    // Student data access (assigned students only)
    { resource: 'students', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'students', action: 'create', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'students', action: 'update', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'students', action: 'delete', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'parents', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'parents', action: 'create', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'parents', action: 'update', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'parents', action: 'delete', roles: ['Super Admin', 'Tenant Admin'] },
    { resource: 'attendance', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    { resource: 'attendance', action: 'update', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
    
    // Reports
    { resource: 'reports', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher'] },
  ],
  
  'Student': [
    // Read-only access to personal academic data
    { resource: 'courses', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'subjects', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'classes', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    
    // Personal data access
    { resource: 'personal_grades', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'personal_attendance', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'personal_schedule', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
    { resource: 'announcements', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'] },
  ],
  
  'Parent': [
    // Limited access to child's data
    { resource: 'child_grades', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Parent'] },
    { resource: 'child_attendance', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Parent'] },
    { resource: 'child_schedule', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Parent'] },
    { resource: 'announcements', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student', 'Parent'] },
  ],
  
  'Staff': [
    // Staff-specific permissions (e.g., Librarian, Accountant)
    { resource: 'library', action: 'manage', roles: ['Super Admin', 'Tenant Admin', 'Staff'] },
    { resource: 'finance', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Staff'] },
    { resource: 'finance', action: 'update', roles: ['Super Admin', 'Tenant Admin', 'Staff'] },
    { resource: 'announcements', action: 'read', roles: ['Super Admin', 'Tenant Admin', 'Teacher', 'Student', 'Staff'] },
  ]
};

// Utility functions for role-based access control
export class RolePermissionChecker {
  private user: User | null;

  constructor(user: User | null) {
    this.user = user;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(roleName: string): boolean {
    if (!this.user?.roles) return false;
    return this.user.roles.some(role => role.name === roleName);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roleNames: string[]): boolean {
    if (!this.user?.roles) return false;
    return this.user.roles.some(role => roleNames.includes(role.name));
  }

  /**
   * Check if user has permission for a specific resource and action
   */
  hasPermission(resource: string, action: string): boolean {
    if (!this.user?.permissions) return false;

    // Check if user has the permission in their permissions array from database
    const permissionName = `${resource}:${action}`;
    return this.user.permissions.includes(permissionName);
  }

  /**
   * Get all permissions for the current user
   */
  getUserPermissions(): Permission[] {
    if (!this.user?.permissions) return [];

    // Convert permission strings like "grades:create" to Permission objects
    return this.user.permissions.map(permissionName => {
      const [resource, action] = permissionName.split(':');
      return {
        resource,
        action,
        roles: this.user.roles.map(role => role.name)
      };
    });
  }

  /**
   * Check if user can manage academic data (create/edit/delete)
   */
  canManageAcademic(): boolean {
    return this.hasAnyRole(['Super Admin', 'Tenant Admin']);
  }

  /**
   * Check if user can view academic data
   */
  canViewAcademic(): boolean {
    return this.hasAnyRole(['Super Admin', 'Tenant Admin', 'Teacher', 'Student']);
  }

  /**
   * Check if user can manage users
   */
  canManageUsers(): boolean {
    return this.hasAnyRole(['Super Admin', 'Tenant Admin']);
  }

  /**
   * Check if user can view reports
   */
  canViewReports(): boolean {
    return this.hasAnyRole(['Super Admin', 'Tenant Admin', 'Teacher']);
  }

  /**
   * Check if user can manage gradebooks
   */
  canManageGradebooks(): boolean {
    return this.hasAnyRole(['Super Admin', 'Tenant Admin', 'Teacher']);
  }

  /**
   * Check if user is a Super Admin
   */
  isSuperAdmin(): boolean {
    return this.hasRole('Super Admin');
  }

  /**
   * Check if user is a Tenant Admin
   */
  isTenantAdmin(): boolean {
    return this.hasRole('Tenant Admin');
  }

  /**
   * Check if user is a Teacher
   */
  isTeacher(): boolean {
    return this.hasRole('Teacher');
  }

  /**
   * Check if user is a Student
   */
  isStudent(): boolean {
    return this.hasRole('Student');
  }

  /**
   * Check if user is a Parent
   */
  isParent(): boolean {
    return this.hasRole('Parent');
  }

  /**
   * Check if user is Staff
   */
  isStaff(): boolean {
    return this.hasRole('Staff');
  }

  /**
   * Get user's tenant ID
   */
  getTenantId(): string | null {
    return this.user?.tenant?.id || null;
  }

  /**
   * Check if user belongs to a specific tenant
   */
  belongsToTenant(tenantId: string): boolean {
    return this.user?.tenant?.id === tenantId;
  }
}

// Export a function to create a permission checker instance
export const createPermissionChecker = (user: User | null): RolePermissionChecker => {
  return new RolePermissionChecker(user);
};

// Export default permission checker for common use cases
export const checkPermission = (user: User | null, resource: string, action: string): boolean => {
  if (!user?.permissions) return false;
  const permissionName = `${resource}:${action}`;
  return user.permissions.includes(permissionName);
};

// Export role checking utilities
export const hasRole = (user: User | null, roleName: string): boolean => {
  const checker = createPermissionChecker(user);
  return checker.hasRole(roleName);
};

export const hasAnyRole = (user: User | null, roleNames: string[]): boolean => {
  const checker = createPermissionChecker(user);
  return checker.hasAnyRole(roleNames);
};
