// React Hook for Audit Logging
import { useCallback } from 'react';
import { auditLogger } from '../lib/auditLogger';
import { useAuth } from '../contexts/AuthContext';

export const useAuditLog = () => {
  const { user } = useAuth();

  // Update audit logger with current user
  auditLogger.setCurrentUser(user);

  const logAction = useCallback(async (
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, any>,
    status: 'SUCCESS' | 'FAILURE' | 'PENDING' = 'SUCCESS',
    errorMessage?: string
  ) => {
    await auditLogger.logAction(action, resource, resourceId, details, status, errorMessage);
  }, []);

  const logLogin = useCallback(async (status: 'SUCCESS' | 'FAILURE' = 'SUCCESS', errorMessage?: string) => {
    await auditLogger.logLogin(status, errorMessage);
  }, []);

  const logLogout = useCallback(async () => {
    await auditLogger.logLogout();
  }, []);

  const logUserCreation = useCallback(async (userId: string, userData: Record<string, any>) => {
    await auditLogger.logUserCreation(userId, userData);
  }, []);

  const logUserUpdate = useCallback(async (userId: string, oldData: Record<string, any>, newData: Record<string, any>) => {
    await auditLogger.logUserUpdate(userId, oldData, newData);
  }, []);

  const logUserDeletion = useCallback(async (userId: string, userData: Record<string, any>) => {
    await auditLogger.logUserDeletion(userId, userData);
  }, []);

  const logCourseCreation = useCallback(async (courseId: string, courseData: Record<string, any>) => {
    await auditLogger.logCourseCreation(courseId, courseData);
  }, []);

  const logCourseUpdate = useCallback(async (courseId: string, oldData: Record<string, any>, newData: Record<string, any>) => {
    await auditLogger.logCourseUpdate(courseId, oldData, newData);
  }, []);

  const logCourseDeletion = useCallback(async (courseId: string, courseData: Record<string, any>) => {
    await auditLogger.logCourseDeletion(courseId, courseData);
  }, []);

  const logSubjectCreation = useCallback(async (subjectId: string, subjectData: Record<string, any>) => {
    await auditLogger.logSubjectCreation(subjectId, subjectData);
  }, []);

  const logSubjectUpdate = useCallback(async (subjectId: string, oldData: Record<string, any>, newData: Record<string, any>) => {
    await auditLogger.logSubjectUpdate(subjectId, oldData, newData);
  }, []);

  const logSubjectDeletion = useCallback(async (subjectId: string, subjectData: Record<string, any>) => {
    await auditLogger.logSubjectDeletion(subjectId, subjectData);
  }, []);

  const logTeacherAssignment = useCallback(async (assignmentId: string, teacherId: string, subjectId: string) => {
    await auditLogger.logTeacherAssignment(assignmentId, teacherId, subjectId);
  }, []);

  const logTeacherAssignmentRemoval = useCallback(async (assignmentId: string, teacherId: string, subjectId: string) => {
    await auditLogger.logTeacherAssignmentRemoval(assignmentId, teacherId, subjectId);
  }, []);

  const logRoleAssignment = useCallback(async (userId: string, roleId: string, roleName: string) => {
    await auditLogger.logRoleAssignment(userId, roleId, roleName);
  }, []);

  const logRoleRemoval = useCallback(async (userId: string, roleId: string, roleName: string) => {
    await auditLogger.logRoleRemoval(userId, roleId, roleName);
  }, []);

  const logPermissionChange = useCallback(async (userId: string, permissionChanges: Record<string, any>) => {
    await auditLogger.logPermissionChange(userId, permissionChanges);
  }, []);

  const logDataExport = useCallback(async (resource: string, filters: Record<string, any>, recordCount: number) => {
    await auditLogger.logDataExport(resource, filters, recordCount);
  }, []);

  const logDataImport = useCallback(async (resource: string, fileName: string, recordCount: number, successCount: number, errorCount: number) => {
    await auditLogger.logDataImport(resource, fileName, recordCount, successCount, errorCount);
  }, []);

  const logSensitiveDataAccess = useCallback(async (resource: string, resourceId: string, dataType: string) => {
    await auditLogger.logSensitiveDataAccess(resource, resourceId, dataType);
  }, []);

  const logPermissionDenied = useCallback(async (action: string, resource: string, resourceId?: string) => {
    await auditLogger.logPermissionDenied(action, resource, resourceId);
  }, []);

  const getAuditLogs = useCallback(async (filters: any = {}) => {
    return await auditLogger.getAuditLogs(filters);
  }, []);

  const getAuditStats = useCallback(async (tenantId?: string, startDate?: string, endDate?: string) => {
    return await auditLogger.getAuditStats(tenantId, startDate, endDate);
  }, []);

  return {
    logAction,
    logLogin,
    logLogout,
    logUserCreation,
    logUserUpdate,
    logUserDeletion,
    logCourseCreation,
    logCourseUpdate,
    logCourseDeletion,
    logSubjectCreation,
    logSubjectUpdate,
    logSubjectDeletion,
    logTeacherAssignment,
    logTeacherAssignmentRemoval,
    logRoleAssignment,
    logRoleRemoval,
    logPermissionChange,
    logDataExport,
    logDataImport,
    logSensitiveDataAccess,
    logPermissionDenied,
    getAuditLogs,
    getAuditStats,
  };
};
