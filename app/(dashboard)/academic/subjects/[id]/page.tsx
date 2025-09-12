'use client';

import { useState, useEffect, use } from 'react';
import { FaArrowLeft, FaEdit, FaTrash, FaBookOpen, FaGraduationCap, FaChalkboardTeacher, FaCalendarAlt, FaUser } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { academicService } from '@/lib/academicService';
import { notificationService } from '@/lib/notifications';
import { useAuth } from '@/contexts/AuthContext';

interface Subject {
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

export default function SubjectViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Unwrap params using React.use()
  const resolvedParams = use(params);

  // Check permissions
  const canEdit = user?.roles?.some(role => 
    ['Super Admin', 'Tenant Admin'].includes(role.name)
  ) || false;

  const canDelete = user?.roles?.some(role => 
    ['Super Admin', 'Tenant Admin'].includes(role.name)
  ) || false;

  useEffect(() => {
    loadSubject();
  }, [resolvedParams.id]);

  const loadSubject = async () => {
    try {
      setLoading(true);
      const response = await academicService.getSubjectById(resolvedParams.id);
      setSubject(response);
    } catch (error) {
      console.error('Error loading subject:', error);
      notificationService.error('Failed to load subject details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    window.location.href = `/academic/subjects/${resolvedParams.id}/edit`;
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      try {
        await academicService.deleteSubject(resolvedParams.id);
        notificationService.success('Subject deleted successfully');
        window.location.href = '/academic/subjects';
      } catch (error) {
        console.error('Error deleting subject:', error);
        notificationService.error('Failed to delete subject');
      }
    }
  };

  const handleBack = () => {
    window.location.href = '/academic/subjects';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'warning';
      case 'ARCHIVED': return 'danger';
      default: return 'default';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'PRIMARY': return 'bg-green-100 text-green-800';
      case 'O_LEVEL': return 'bg-blue-100 text-blue-800';
      case 'A_LEVEL': return 'bg-purple-100 text-purple-800';
      case 'UNIVERSITY': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CORE': return 'bg-red-100 text-red-800';
      case 'OPTIONAL': return 'bg-yellow-100 text-yellow-800';
      case 'COMBINATION': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <p className="text-text-secondary">Loading subject details...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <FaBookOpen className="text-6xl text-text-muted mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Subject Not Found</h2>
        <p className="text-text-secondary mb-6">The subject you're looking for doesn't exist or has been deleted.</p>
        <Button variant="primary" onClick={handleBack}>
          <FaArrowLeft className="mr-2" />
          Back to Subjects
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
              <h1 className="text-3xl font-bold text-text-primary mb-2">{subject.subjectName}</h1>
              <p className="text-text-secondary">{subject.subjectCode || 'No code assigned'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={getStatusColor(subject.status) as any} size="lg">
              {subject.status}
            </StatusBadge>
            {canEdit && (
              <Button variant="primary" onClick={handleEdit}>
                <FaEdit className="mr-2" />
                Edit Subject
              </Button>
            )}
            {canDelete && (
              <Button variant="danger" onClick={handleDelete}>
                <FaTrash className="mr-2" />
                Delete Subject
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
              <h2 className="text-xl font-bold text-text-primary">Subject Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-text-secondary">Subject Name</label>
                <p className="text-lg font-semibold text-text-primary">{subject.subjectName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Subject Code</label>
                <p className="text-lg font-semibold text-text-primary">{subject.subjectCode || 'Not assigned'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Academic Level</label>
                <span className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${getLevelColor(subject.subjectLevel)}`}>
                  {subject.subjectLevel.replace('_', '-')}
                </span>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Subject Type</label>
                <span className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${getTypeColor(subject.subjectType)}`}>
                  {subject.subjectType}
                </span>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Credits</label>
                <p className="text-lg font-semibold text-text-primary">{subject.credits}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Status</label>
                <StatusBadge status={getStatusColor(subject.status) as any}>
                  {subject.status}
                </StatusBadge>
              </div>
            </div>
            
            {subject.description && (
              <div className="mt-6">
                <label className="text-sm font-medium text-text-secondary">Description</label>
                <p className="text-text-primary mt-2 p-4 bg-gray-50 rounded-lg">{subject.description}</p>
              </div>
            )}
          </Card>

          {/* Teachers */}
          <Card variant="strong" glow="blue">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-xl">
                <FaChalkboardTeacher className="text-2xl text-white" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Assigned Teachers</h2>
            </div>
            
            {subject.teacherSubjects && subject.teacherSubjects.length > 0 ? (
              <div className="space-y-4">
                {subject.teacherSubjects.map((teacherSubject) => (
                  <div key={teacherSubject.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-full flex items-center justify-center text-white font-semibold">
                        <FaUser className="text-sm" />
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">
                          {teacherSubject.teacher.firstName} {teacherSubject.teacher.lastName}
                        </p>
                        <p className="text-sm text-text-secondary">{teacherSubject.teacher.email}</p>
                      </div>
                    </div>
                    <div className="text-sm text-text-secondary">
                      Assigned: {formatDate(teacherSubject.assignedAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaChalkboardTeacher className="text-4xl text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary">No teachers assigned to this subject</p>
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
                <span className="text-text-secondary">Teachers Assigned</span>
                <span className="font-semibold text-text-primary">
                  {subject.teacherSubjects?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Credits</span>
                <span className="font-semibold text-text-primary">{subject.credits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Status</span>
                <StatusBadge status={getStatusColor(subject.status) as any} size="sm">
                  {subject.status}
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
                  {subject.createdByUser.firstName} {subject.createdByUser.lastName}
                </p>
                <p className="text-sm text-text-secondary">{subject.createdByUser.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Created At</label>
                <p className="text-text-primary">{formatDate(subject.createdAt)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Last Updated</label>
                <p className="text-text-primary">{formatDate(subject.updatedAt)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Tenant</label>
                <p className="text-text-primary">{subject.tenant.name}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
