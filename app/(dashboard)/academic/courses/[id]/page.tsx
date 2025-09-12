'use client';

import { useState, useEffect } from 'react';
import { FaArrowLeft, FaEdit, FaTrash, FaBookOpen, FaGraduationCap, FaUsers, FaCalendarAlt, FaUser } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { academicService } from '@/lib/academicService';
import { notificationService } from '@/lib/notifications';
import { useAuth } from '@/contexts/AuthContext';

interface Course {
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
    subject: {
      id: string;
      subjectName: string;
      subjectCode?: string;
      subjectLevel: string;
      subjectType: string;
    };
    isRequired: boolean;
  }>;
}

export default function CourseViewPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // Check permissions
  const canEdit = user?.roles?.some(role => 
    ['Super Admin', 'Tenant Admin'].includes(role.name)
  ) || false;

  const canDelete = user?.roles?.some(role => 
    ['Super Admin', 'Tenant Admin'].includes(role.name)
  ) || false;

  useEffect(() => {
    loadCourse();
  }, [params.id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await academicService.getCourseById(params.id);
      setCourse(response);
    } catch (error) {
      console.error('Error loading course:', error);
      notificationService.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    window.location.href = `/academic/courses/${params.id}/edit`;
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await academicService.deleteCourse(params.id);
        notificationService.success('Course deleted successfully');
        window.location.href = '/academic/courses';
      } catch (error) {
        console.error('Error deleting course:', error);
        notificationService.error('Failed to delete course');
      }
    }
  };

  const handleBack = () => {
    window.location.href = '/academic/courses';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'warning';
      case 'ARCHIVED': return 'danger';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <FaBookOpen className="text-6xl text-text-muted mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Course Not Found</h2>
        <p className="text-text-secondary mb-6">The course you're looking for doesn't exist or has been deleted.</p>
        <Button variant="primary" onClick={handleBack}>
          <FaArrowLeft className="mr-2" />
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border-accent-green/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack}>
              <FaArrowLeft className="mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">{course.courseName}</h1>
              <p className="text-text-secondary">{course.courseCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={getStatusColor(course.status) as any} size="lg">
              {course.status}
            </StatusBadge>
            {canEdit && (
              <Button variant="primary" onClick={handleEdit}>
                <FaEdit className="mr-2" />
                Edit Course
              </Button>
            )}
            {canDelete && (
              <Button variant="danger" onClick={handleDelete}>
                <FaTrash className="mr-2" />
                Delete Course
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card variant="strong" glow="green">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-accent-green to-accent-green-light rounded-xl">
                <FaBookOpen className="text-2xl text-white" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Course Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-text-secondary">Course Name</label>
                <p className="text-lg font-semibold text-text-primary">{course.courseName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Course Code</label>
                <p className="text-lg font-semibold text-text-primary">{course.courseCode}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Credits</label>
                <p className="text-lg font-semibold text-text-primary">{course.credits}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Status</label>
                <StatusBadge status={getStatusColor(course.status) as any}>
                  {course.status}
                </StatusBadge>
              </div>
            </div>
            
            {course.description && (
              <div className="mt-6">
                <label className="text-sm font-medium text-text-secondary">Description</label>
                <p className="text-text-primary mt-2 p-4 bg-gray-50 rounded-lg">{course.description}</p>
              </div>
            )}
          </Card>

          {/* Subjects */}
          <Card variant="strong" glow="blue">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-xl">
                <FaGraduationCap className="text-2xl text-white" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Course Subjects</h2>
            </div>
            
            {course.courseSubjects && course.courseSubjects.length > 0 ? (
              <div className="space-y-4">
                {course.courseSubjects.map((courseSubject) => (
                  <div key={courseSubject.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-full flex items-center justify-center text-white font-semibold">
                        <FaBookOpen className="text-sm" />
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">
                          {courseSubject.subject.subjectName}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {courseSubject.subject.subjectCode || 'No code'} • {courseSubject.subject.subjectLevel.replace('_', '-')} • {courseSubject.subject.subjectType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {courseSubject.isRequired && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          Required
                        </span>
                      )}
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                        {courseSubject.subject.subjectType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaGraduationCap className="text-4xl text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary">No subjects assigned to this course</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card variant="default">
            <h3 className="text-lg font-bold text-text-primary mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Subjects</span>
                <span className="font-semibold text-text-primary">
                  {course.courseSubjects?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Credits</span>
                <span className="font-semibold text-text-primary">{course.credits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Status</span>
                <StatusBadge status={getStatusColor(course.status) as any} size="sm">
                  {course.status}
                </StatusBadge>
              </div>
            </div>
          </Card>

          {/* Metadata */}
          <Card variant="default">
            <h3 className="text-lg font-bold text-text-primary mb-4">Metadata</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary">Created By</label>
                <p className="text-text-primary">
                  {course.createdByUser.firstName} {course.createdByUser.lastName}
                </p>
                <p className="text-sm text-text-secondary">{course.createdByUser.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Created At</label>
                <p className="text-text-primary">{formatDate(course.createdAt)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Last Updated</label>
                <p className="text-text-primary">{formatDate(course.updatedAt)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Tenant</label>
                <p className="text-text-primary">{course.tenant.name}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
