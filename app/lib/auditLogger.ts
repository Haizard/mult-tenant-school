// Audit Logging System for Role-Based Actions
import { apiService } from './api';
import { User } from './auth';

export interface AuditLogEntry {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRoles: string[];
  tenantId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  errorMessage?: string;
}

export interface AuditLogFilters {
  userId?: string;
  tenantId?: string;
  action?: string;
  resource?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  success: boolean;
  data: AuditLogEntry[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

class AuditLogger {
  private currentUser: User | null = null;

  constructor() {
    // Initialize with current user if available
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData);
        } catch (error) {
          console.error('Error parsing user data for audit logging:', error);
        }
      }
    }
  }

  /**
   * Set the current user for audit logging
   */
  setCurrentUser(user: User | null): void {
    this.currentUser = user;
  }

  /**
   * Get current user information
   */
  private getCurrentUserInfo() {
    if (!this.currentUser) {
      throw new Error('No current user set for audit logging');
    }

    return {
      userId: this.currentUser.id,
      userEmail: this.currentUser.email,
      userName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      userRoles: this.currentUser.roles.map(role => role.name),
      tenantId: this.currentUser.tenant.id,
    };
  }

  /**
   * Get client information (IP, User Agent)
   */
  private getClientInfo() {
    if (typeof window === 'undefined') {
      return {
        ipAddress: 'unknown',
        userAgent: 'server-side',
      };
    }

    return {
      ipAddress: this.getClientIP() || 'unknown',
      userAgent: navigator.userAgent,
    };
  }

  /**
   * Attempt to get client IP (this is a simplified version)
   */
  private getClientIP(): string | null {
    // In a real application, you would get this from the server
    // For now, we'll return null and let the server handle it
    return null;
  }

  /**
   * Log a user action
   */
  async logAction(
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, any>,
    status: 'SUCCESS' | 'FAILURE' | 'PENDING' = 'SUCCESS',
    errorMessage?: string
  ): Promise<void> {
    try {
      const userInfo = this.getCurrentUserInfo();
      const clientInfo = this.getClientInfo();

      const auditEntry: Omit<AuditLogEntry, 'id'> = {
        ...userInfo,
        ...clientInfo,
        action,
        resource,
        resourceId,
        details: details || {},
        timestamp: new Date().toISOString(),
        status,
        errorMessage,
      };

      // Send to server
      await apiService.post('/audit-logs', auditEntry);
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw error to avoid breaking the main functionality
    }
  }

  /**
   * Log user login
   */
  async logLogin(status: 'SUCCESS' | 'FAILURE' = 'SUCCESS', errorMessage?: string): Promise<void> {
    await this.logAction(
      'LOGIN',
      'AUTHENTICATION',
      undefined,
      { loginMethod: 'email_password' },
      status,
      errorMessage
    );
  }

  /**
   * Log user logout
   */
  async logLogout(): Promise<void> {
    await this.logAction(
      'LOGOUT',
      'AUTHENTICATION',
      undefined,
      { logoutMethod: 'manual' }
    );
  }

  /**
   * Log user creation
   */
  async logUserCreation(userId: string, userData: Record<string, any>): Promise<void> {
    await this.logAction(
      'CREATE',
      'USER',
      userId,
      { createdUser: userData }
    );
  }

  /**
   * Log user update
   */
  async logUserUpdate(userId: string, oldData: Record<string, any>, newData: Record<string, any>): Promise<void> {
    await this.logAction(
      'UPDATE',
      'USER',
      userId,
      { 
        oldData: this.sanitizeData(oldData),
        newData: this.sanitizeData(newData),
        changes: this.getChanges(oldData, newData)
      }
    );
  }

  /**
   * Log user deletion
   */
  async logUserDeletion(userId: string, userData: Record<string, any>): Promise<void> {
    await this.logAction(
      'DELETE',
      'USER',
      userId,
      { deletedUser: this.sanitizeData(userData) }
    );
  }

  /**
   * Log course creation
   */
  async logCourseCreation(courseId: string, courseData: Record<string, any>): Promise<void> {
    await this.logAction(
      'CREATE',
      'COURSE',
      courseId,
      { courseData: this.sanitizeData(courseData) }
    );
  }

  /**
   * Log course update
   */
  async logCourseUpdate(courseId: string, oldData: Record<string, any>, newData: Record<string, any>): Promise<void> {
    await this.logAction(
      'UPDATE',
      'COURSE',
      courseId,
      { 
        oldData: this.sanitizeData(oldData),
        newData: this.sanitizeData(newData),
        changes: this.getChanges(oldData, newData)
      }
    );
  }

  /**
   * Log course deletion
   */
  async logCourseDeletion(courseId: string, courseData: Record<string, any>): Promise<void> {
    await this.logAction(
      'DELETE',
      'COURSE',
      courseId,
      { courseData: this.sanitizeData(courseData) }
    );
  }

  /**
   * Log subject creation
   */
  async logSubjectCreation(subjectId: string, subjectData: Record<string, any>): Promise<void> {
    await this.logAction(
      'CREATE',
      'SUBJECT',
      subjectId,
      { subjectData: this.sanitizeData(subjectData) }
    );
  }

  /**
   * Log subject update
   */
  async logSubjectUpdate(subjectId: string, oldData: Record<string, any>, newData: Record<string, any>): Promise<void> {
    await this.logAction(
      'UPDATE',
      'SUBJECT',
      subjectId,
      { 
        oldData: this.sanitizeData(oldData),
        newData: this.sanitizeData(newData),
        changes: this.getChanges(oldData, newData)
      }
    );
  }

  /**
   * Log subject deletion
   */
  async logSubjectDeletion(subjectId: string, subjectData: Record<string, any>): Promise<void> {
    await this.logAction(
      'DELETE',
      'SUBJECT',
      subjectId,
      { subjectData: this.sanitizeData(subjectData) }
    );
  }

  /**
   * Log teacher assignment
   */
  async logTeacherAssignment(assignmentId: string, teacherId: string, subjectId: string): Promise<void> {
    await this.logAction(
      'ASSIGN',
      'TEACHER_SUBJECT',
      assignmentId,
      { teacherId, subjectId }
    );
  }

  /**
   * Log teacher assignment removal
   */
  async logTeacherAssignmentRemoval(assignmentId: string, teacherId: string, subjectId: string): Promise<void> {
    await this.logAction(
      'UNASSIGN',
      'TEACHER_SUBJECT',
      assignmentId,
      { teacherId, subjectId }
    );
  }

  /**
   * Log role assignment
   */
  async logRoleAssignment(userId: string, roleId: string, roleName: string): Promise<void> {
    await this.logAction(
      'ASSIGN_ROLE',
      'USER',
      userId,
      { roleId, roleName }
    );
  }

  /**
   * Log role removal
   */
  async logRoleRemoval(userId: string, roleId: string, roleName: string): Promise<void> {
    await this.logAction(
      'REMOVE_ROLE',
      'USER',
      userId,
      { roleId, roleName }
    );
  }

  /**
   * Log permission change
   */
  async logPermissionChange(userId: string, permissionChanges: Record<string, any>): Promise<void> {
    await this.logAction(
      'CHANGE_PERMISSIONS',
      'USER',
      userId,
      { permissionChanges }
    );
  }

  /**
   * Log data export
   */
  async logDataExport(resource: string, filters: Record<string, any>, recordCount: number): Promise<void> {
    await this.logAction(
      'EXPORT',
      resource,
      undefined,
      { filters, recordCount }
    );
  }

  /**
   * Log data import
   */
  async logDataImport(resource: string, fileName: string, recordCount: number, successCount: number, errorCount: number): Promise<void> {
    await this.logAction(
      'IMPORT',
      resource,
      undefined,
      { fileName, recordCount, successCount, errorCount }
    );
  }

  /**
   * Log access to sensitive data
   */
  async logSensitiveDataAccess(resource: string, resourceId: string, dataType: string): Promise<void> {
    await this.logAction(
      'ACCESS_SENSITIVE',
      resource,
      resourceId,
      { dataType }
    );
  }

  /**
   * Log failed permission check
   */
  async logPermissionDenied(action: string, resource: string, resourceId?: string): Promise<void> {
    await this.logAction(
      'PERMISSION_DENIED',
      'SECURITY',
      resourceId,
      { attemptedAction: action, attemptedResource: resource },
      'FAILURE',
      'Insufficient permissions'
    );
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogResponse> {
    const params = new URLSearchParams();
    
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.tenantId) params.append('tenantId', filters.tenantId);
    if (filters.action) params.append('action', filters.action);
    if (filters.resource) params.append('resource', filters.resource);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/audit-logs${queryString ? `?${queryString}` : ''}`;
    
    return apiService.get<AuditLogEntry[]>(endpoint);
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(tenantId?: string, startDate?: string, endDate?: string): Promise<{
    totalLogs: number;
    logsByAction: Record<string, number>;
    logsByResource: Record<string, number>;
    logsByStatus: Record<string, number>;
    logsByUser: Record<string, number>;
    recentActivity: AuditLogEntry[];
  }> {
    const params = new URLSearchParams();
    if (tenantId) params.append('tenantId', tenantId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const endpoint = `/audit-logs/stats${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiService.get(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch audit statistics');
    }
    
    return response.data;
  }

  /**
   * Sanitize sensitive data before logging
   */
  private sanitizeData(data: Record<string, any>): Record<string, any> {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Get changes between old and new data
   */
  private getChanges(oldData: Record<string, any>, newData: Record<string, any>): Record<string, any> {
    const changes: Record<string, any> = {};

    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          old: oldData[key],
          new: newData[key],
        };
      }
    }

    return changes;
  }
}

// Create singleton instance
export const auditLogger = new AuditLogger();

// Export default
export default auditLogger;
