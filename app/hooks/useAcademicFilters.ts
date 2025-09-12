// React Hook for Academic Data Filtering
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createAcademicFilter, AcademicFilters, CourseFilters, SubjectFilters, ClassFilters } from '../lib/academicFilters';

export const useAcademicFilters = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<AcademicFilters>({});
  const [isLoading, setIsLoading] = useState(false);

  // Memoize the academic filter to prevent infinite re-renders
  const academicFilter = useMemo(() => createAcademicFilter(user), [user]);

  // Initialize filters based on user role
  useEffect(() => {
    if (user) {
      const defaultFilters = academicFilter.getDefaultFilters('courses');
      setFilters(defaultFilters);
    }
  }, [user, academicFilter]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<AcademicFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters to default
  const resetFilters = useCallback((resource: string) => {
    const defaultFilters = academicFilter.getDefaultFilters(resource);
    setFilters(defaultFilters);
  }, [academicFilter]);

  // Get courses with role-based filtering
  const getCourses = useCallback(async (customFilters?: Partial<CourseFilters>) => {
    setIsLoading(true);
    try {
      const combinedFilters = { ...filters, ...customFilters } as CourseFilters;
      const courses = await academicFilter.getCourses(combinedFilters);
      return courses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [filters, academicFilter]);

  // Get subjects with role-based filtering
  const getSubjects = useCallback(async (customFilters?: Partial<SubjectFilters>) => {
    setIsLoading(true);
    try {
      const combinedFilters = { ...filters, ...customFilters } as SubjectFilters;
      const subjects = await academicFilter.getSubjects(combinedFilters);
      return subjects;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [filters, academicFilter]);

  // Get classes with role-based filtering
  const getClasses = useCallback(async (customFilters?: Partial<ClassFilters>) => {
    setIsLoading(true);
    try {
      const combinedFilters = { ...filters, ...customFilters } as ClassFilters;
      const classes = await academicFilter.getClasses(combinedFilters);
      return classes;
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [filters, academicFilter]);

  // Get teacher assignments with role-based filtering
  const getTeacherAssignments = useCallback(async (customFilters?: Partial<AcademicFilters>) => {
    setIsLoading(true);
    try {
      const combinedFilters = { ...filters, ...customFilters };
      const assignments = await academicFilter.getTeacherAssignments(combinedFilters);
      return assignments;
    } catch (error) {
      console.error('Error fetching teacher assignments:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [filters, academicFilter]);

  // Get academic statistics with role-based filtering
  const getAcademicStats = useCallback(async (customFilters?: Partial<AcademicFilters>) => {
    setIsLoading(true);
    try {
      const combinedFilters = { ...filters, ...customFilters };
      const stats = await academicFilter.getAcademicStats(combinedFilters);
      return stats;
    } catch (error) {
      console.error('Error fetching academic stats:', error);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [filters, academicFilter]);

  // Check permissions
  const canView = useCallback((resource: string, resourceId?: string) => {
    return academicFilter.canViewAcademicData(resource, resourceId);
  }, [academicFilter]);

  const canManage = useCallback((resource: string, resourceId?: string) => {
    return academicFilter.canManageAcademicData(resource, resourceId);
  }, [academicFilter]);

  // Get available filter options
  const getAvailableFilters = useCallback((resource: string) => {
    return academicFilter.getAvailableFilters(resource);
  }, [academicFilter]);

  return {
    filters,
    isLoading,
    updateFilters,
    resetFilters,
    getCourses,
    getSubjects,
    getClasses,
    getTeacherAssignments,
    getAcademicStats,
    canView,
    canManage,
    getAvailableFilters,
  };
};
