'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaEdit, FaTrash, FaCalendar, FaBook, FaUsers, FaChartBar } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import RoleGuard from '@/components/RoleGuard';
import RoleBasedButton from '@/components/RoleBasedButton';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from '@/hooks/useAuditLog';
import { examinationService } from '@/lib/services/examinationService';

interface ExaminationDetails {
  id: string;
  examName: string;
  examType: string;
  examLevel: string;
  startDate: string;
  endDate?: string;
  maxMarks: number;
  weight: number;
  status: string;
  description?: string;
  subject?: {
    id: string;
    subjectName: string;
    subjectCode: string;
    subjectLevel: string;
    subjectType: string;
  };
  academicYear?: {
    id: string;
    yearName: string;
  };
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  grades?: Array<{
    id: string;
    rawMarks: number;
    percentage: number;
    grade: string;
    points: number;
    status: string;
    student: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  _count: {
    grades: number;
  };
}

export default function ExaminationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const auditLog = useAuditLog();
  
  const [examination, setExamination] = useState<ExaminationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadExamination(params.id as string);
    }
  }, [params.id]);

  const loadExamination = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await examinationService.getExaminationById(id);
      if (response.success && response.data) {
        setExamination(response.data);
      } else {
        console.error('Failed to load examination:', response.message);
      }
    } catch (error) {
      console.error('Error loading examination:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/academic/examinations/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (!examination) return;
    
    if (window.confirm('Are you sure you want to delete this examination? This will also delete all associated grades.')) {
      try {
        const response = await examinationService.deleteExamination(examination.id);
        if (response.success) {
          await auditLog.logAction('examination', 'delete', examination.id, `Deleted examination: ${examination.examName}`);
          router.push('/academic/grades');
        } else {
          console.error('Failed to delete examination:', response.message);
        }
      } catch (error) {
        console.error('Error deleting examination:', error);
      }
    }
  };

  const handleBack = () => {
    router.push('/academic/grades');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'gray';
      case 'SCHEDULED': return 'blue';
      case 'ONGOING': return 'yellow';
      case 'COMPLETED': return 'green';
      case 'PUBLISHED': return 'purple';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!examination) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Examination Not Found</h2>
        <p className="text-gray-600 mb-6">The examination you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={handleBack} icon={FaArrowLeft}>
          Back to Grades
        </Button>
      </div>
    );
  }

  return (
    <RoleGuard permissions={['examinations:read']}>
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
              <h1 className="text-2xl font-bold text-gray-900">{examination.examName}</h1>
              <p className="text-gray-600">{examination.examType.replace('_', ' ')} • {examination.examLevel}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <RoleBasedButton
              onClick={handleEdit}
              icon={FaEdit}
              variant="outline"
              permissions={['examinations:update']}
            >
              Edit
            </RoleBasedButton>
            <RoleBasedButton
              onClick={handleDelete}
              icon={FaTrash}
              variant="destructive"
              permissions={['examinations:delete']}
            >
              Delete
            </RoleBasedButton>
          </div>
        </div>

        {/* Examination Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Examination Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Examination Name</label>
                    <p className="text-sm text-gray-900">{examination.examName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <StatusBadge status={examination.status} color={getStatusColor(examination.status)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <p className="text-sm text-gray-900">{examination.examType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <p className="text-sm text-gray-900">{examination.examLevel.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                    <p className="text-sm text-gray-900">{examination.maxMarks}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                    <p className="text-sm text-gray-900">{examination.weight}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <p className="text-sm text-gray-900">{formatDate(examination.startDate)}</p>
                  </div>
                  {examination.endDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <p className="text-sm text-gray-900">{formatDate(examination.endDate)}</p>
                    </div>
                  )}
                </div>
                {examination.description && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-sm text-gray-900">{examination.description}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Grades List */}
            {examination.grades && examination.grades.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Grades</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Marks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Points
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {examination.grades.map((grade) => (
                          <tr key={grade.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {grade.student.firstName} {grade.student.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{grade.student.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{grade.rawMarks}/{examination.maxMarks}</div>
                              <div className="text-sm text-gray-500">{grade.percentage.toFixed(1)}%</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={grade.grade} color={getGradeColor(grade.grade)} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{grade.points}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={grade.status} color={getStatusColor(grade.status)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subject Info */}
            {examination.subject && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaBook className="mr-2" />
                    Subject
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="text-sm text-gray-900">{examination.subject.subjectName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Code</label>
                      <p className="text-sm text-gray-900">{examination.subject.subjectCode}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Level</label>
                      <p className="text-sm text-gray-900">{examination.subject.subjectLevel}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <p className="text-sm text-gray-900">{examination.subject.subjectType}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Academic Year */}
            {examination.academicYear && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaCalendar className="mr-2" />
                    Academic Year
                  </h3>
                  <p className="text-sm text-gray-900">{examination.academicYear.yearName}</p>
                </div>
              </Card>
            )}

            {/* Statistics */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaChartBar className="mr-2" />
                  Statistics
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Total Grades:</span>
                    <span className="text-sm font-medium text-gray-900">{examination._count.grades}</span>
                  </div>
                  {examination.grades && examination.grades.length > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Average Marks:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {(examination.grades.reduce((sum, grade) => sum + grade.rawMarks, 0) / examination.grades.length).toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Highest Marks:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.max(...examination.grades.map(grade => grade.rawMarks))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">Lowest Marks:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.min(...examination.grades.map(grade => grade.rawMarks))}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Created By */}
            {examination.createdByUser && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaUsers className="mr-2" />
                    Created By
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {examination.createdByUser.firstName} {examination.createdByUser.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{examination.createdByUser.email}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
