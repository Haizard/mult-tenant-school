'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaEdit, FaTrash, FaBook, FaUser, FaChartBar, FaCalendar } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import RoleGuard from '@/components/RoleGuard';
import RoleBasedButton from '@/components/RoleBasedButton';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from '@/hooks/useAuditLog';
import { examinationService } from '@/lib/services/examinationService';

interface GradeDetails {
  id: string;
  rawMarks: number;
  percentage: number;
  grade: string;
  points: number;
  status: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
  examination: {
    id: string;
    examName: string;
    examType: string;
    examLevel: string;
    maxMarks: number;
    weight: number;
    status: string;
    startDate: string;
    endDate?: string;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  subject: {
    id: string;
    subjectName: string;
    subjectCode: string;
    subjectLevel: string;
    subjectType: string;
  };
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function GradeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const auditLog = useAuditLog();
  
  const [grade, setGrade] = useState<GradeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadGrade(params.id as string);
    }
  }, [params.id]);

  const loadGrade = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await examinationService.getGradeById(id);
      if (response.success && response.data) {
        setGrade(response.data);
      } else {
        console.error('Failed to load grade:', response.message);
      }
    } catch (error) {
      console.error('Error loading grade:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/academic/grades/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (!grade) return;
    
    if (window.confirm('Are you sure you want to delete this grade?')) {
      try {
        const response = await examinationService.deleteGrade(grade.id);
        if (response.success) {
          await auditLog.logAction('grade', 'delete', grade.id, `Deleted grade for ${grade.student.firstName} ${grade.student.lastName}`);
          router.push('/academic/grades');
        } else {
          console.error('Failed to delete grade:', response.message);
        }
      } catch (error) {
        console.error('Error deleting grade:', error);
      }
    }
  };

  const handleBack = () => {
    router.push('/academic/grades');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'gray';
      case 'PUBLISHED': return 'green';
      case 'ARCHIVED': return 'gray';
      default: return 'gray';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': case 'A+': return 'green';
      case 'B': case 'B+': return 'blue';
      case 'C': case 'C+': return 'yellow';
      case 'D': return 'orange';
      case 'F': return 'red';
      default: return 'gray';
    }
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 80) return { level: 'Excellent', color: 'text-green-600' };
    if (percentage >= 60) return { level: 'Good', color: 'text-blue-600' };
    if (percentage >= 40) return { level: 'Average', color: 'text-yellow-600' };
    if (percentage >= 20) return { level: 'Below Average', color: 'text-orange-600' };
    return { level: 'Poor', color: 'text-red-600' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!grade) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Grade Not Found</h2>
        <p className="text-gray-600 mb-6">The grade you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={handleBack} icon={FaArrowLeft}>
          Back to Grades
        </Button>
      </div>
    );
  }

  const performance = getPerformanceLevel(grade.percentage);

  return (
    <RoleGuard permissions={['grades:read']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleBack}
              variant="outline"
              icon={FaArrowLeft}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {grade.student.firstName} {grade.student.lastName} - Grade Details
              </h1>
              <p className="text-gray-600">{grade.subject.subjectName} • {grade.examination.examName}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <RoleBasedButton
              onClick={handleEdit}
              icon={FaEdit}
              variant="outline"
              permissions={['grades:update']}
            >
              Edit
            </RoleBasedButton>
            <RoleBasedButton
              onClick={handleDelete}
              icon={FaTrash}
              variant="destructive"
              permissions={['grades:delete']}
            >
              Delete
            </RoleBasedButton>
          </div>
        </div>

        {/* Grade Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Grade Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Raw Marks</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">{grade.rawMarks}</span>
                        <span className="text-lg text-gray-500">/ {grade.examination.maxMarks}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">{grade.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Letter Grade</label>
                      <StatusBadge status={grade.grade} color={getGradeColor(grade.grade)} size="lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                      <span className="text-2xl font-bold text-gray-900">{grade.points}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Performance Level</label>
                  <span className={`text-lg font-semibold ${performance.color}`}>{performance.level}</span>
                </div>

                {grade.comments && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{grade.comments}</p>
                  </div>
                )}

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <StatusBadge status={grade.status} color={getStatusColor(grade.status)} />
                </div>
              </div>
            </Card>

            {/* Performance Analysis */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaChartBar className="mr-2" />
                  Performance Analysis
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Score Progress</span>
                      <span>{grade.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          grade.percentage >= 80 ? 'bg-green-500' :
                          grade.percentage >= 60 ? 'bg-blue-500' :
                          grade.percentage >= 40 ? 'bg-yellow-500' :
                          grade.percentage >= 20 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(grade.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{grade.rawMarks}</div>
                      <div className="text-sm text-gray-600">Raw Score</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{grade.percentage.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Percentage</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{grade.points}</div>
                      <div className="text-sm text-gray-600">Grade Points</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Info */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaUser className="mr-2" />
                  Student
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{grade.student.firstName} {grade.student.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{grade.student.email}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Subject Info */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaBook className="mr-2" />
                  Subject
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{grade.subject.subjectName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Code</label>
                    <p className="text-sm text-gray-900">{grade.subject.subjectCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Level</label>
                    <p className="text-sm text-gray-900">{grade.subject.subjectLevel}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="text-sm text-gray-900">{grade.subject.subjectType}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Examination Info */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaCalendar className="mr-2" />
                  Examination
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{grade.examination.examName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="text-sm text-gray-900">{grade.examination.examType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Level</label>
                    <p className="text-sm text-gray-900">{grade.examination.examLevel}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="text-sm text-gray-900">{formatDate(grade.examination.startDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Marks</label>
                    <p className="text-sm text-gray-900">{grade.examination.maxMarks}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weight</label>
                    <p className="text-sm text-gray-900">{grade.examination.weight}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <StatusBadge status={grade.examination.status} color={getStatusColor(grade.examination.status)} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Timestamps */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Information</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="text-sm text-gray-900">{formatDateTime(grade.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="text-sm text-gray-900">{formatDateTime(grade.updatedAt)}</p>
                  </div>
                  {grade.createdByUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created By</label>
                      <p className="text-sm text-gray-900">
                        {grade.createdByUser.firstName} {grade.createdByUser.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{grade.createdByUser.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
