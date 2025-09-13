'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaChartBar, FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaDownload } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import RoleGuard from '@/components/RoleGuard';
import RoleBasedButton from '@/components/RoleBasedButton';
import { useAuth } from '@/contexts/AuthContext';
import { useAcademicFilters } from '@/hooks/useAcademicFilters';
import { useAuditLog } from '@/hooks/useAuditLog';
import { examinationService } from '@/lib/services/examinationService';

// Sample data for demonstration
const sampleExaminations = [
  {
    id: '1',
    examName: 'Mid-Term Examination',
    examType: 'MID_TERM',
    examLevel: 'O_LEVEL',
    subject: {
      id: '1',
      subjectName: 'Mathematics',
      subjectCode: 'MATH',
      subjectLevel: 'O_LEVEL',
      subjectType: 'CORE'
    },
    academicYear: {
      id: '1',
      yearName: '2024/2025',
      isCurrent: true
    },
    startDate: '2024-03-15T09:00:00Z',
    endDate: '2024-03-15T12:00:00Z',
    maxMarks: 100,
    weight: 0.3,
    status: 'COMPLETED',
    description: 'Mid-term examination for O-Level students',
    createdAt: '2024-03-01T10:00:00Z',
    createdBy: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@school.com'
    },
    _count: {
      grades: 45
    }
  },
  {
    id: '2',
    examName: 'Final Examination',
    examType: 'FINAL',
    examLevel: 'O_LEVEL',
    subject: {
      id: '2',
      subjectName: 'English',
      subjectCode: 'ENG',
      subjectLevel: 'O_LEVEL',
      subjectType: 'CORE'
    },
    academicYear: {
      id: '1',
      yearName: '2024/2025',
      isCurrent: true
    },
    startDate: '2024-06-20T09:00:00Z',
    endDate: '2024-06-20T12:00:00Z',
    maxMarks: 100,
    weight: 0.5,
    status: 'SCHEDULED',
    description: 'Final examination for O-Level students',
    createdAt: '2024-03-01T10:00:00Z',
    createdBy: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@school.com'
    },
    _count: {
      grades: 0
    }
  }
];

const sampleGrades = [
  {
    id: '1',
    examination: {
      id: '1',
      examName: 'Mid-Term Examination',
      examType: 'MID_TERM',
      examLevel: 'O_LEVEL',
      maxMarks: 100,
      weight: 0.3,
      status: 'COMPLETED'
    },
    student: {
      id: '1',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@school.com'
    },
    subject: {
      id: '1',
      subjectName: 'Mathematics',
      subjectCode: 'MATH',
      subjectLevel: 'O_LEVEL',
      subjectType: 'CORE'
    },
    rawMarks: 85,
    percentage: 85,
    grade: 'A',
    points: 6,
    status: 'PUBLISHED',
    comments: 'Excellent performance',
    createdAt: '2024-03-16T10:00:00Z',
    createdBy: {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@school.com'
    }
  },
  {
    id: '2',
    examination: {
      id: '1',
      examName: 'Mid-Term Examination',
      examType: 'MID_TERM',
      examLevel: 'O_LEVEL',
      maxMarks: 100,
      weight: 0.3,
      status: 'COMPLETED'
    },
    student: {
      id: '2',
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'bob.wilson@school.com'
    },
    subject: {
      id: '1',
      subjectName: 'Mathematics',
      subjectCode: 'MATH',
      subjectLevel: 'O_LEVEL',
      subjectType: 'CORE'
    },
    rawMarks: 72,
    percentage: 72,
    grade: 'B+',
    points: 5,
    status: 'PUBLISHED',
    comments: 'Good performance',
    createdAt: '2024-03-16T10:00:00Z',
    createdBy: {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@school.com'
    }
  }
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'bg-gray-100 text-gray-800';
    case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
    case 'ONGOING': return 'bg-yellow-100 text-yellow-800';
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'PUBLISHED': return 'bg-purple-100 text-purple-800';
    case 'ARCHIVED': return 'bg-gray-100 text-gray-600';
    case 'SUBMITTED': return 'bg-orange-100 text-orange-800';
    case 'APPROVED': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A+': return 'bg-green-100 text-green-800';
    case 'A': return 'bg-green-100 text-green-800';
    case 'B+': return 'bg-blue-100 text-blue-800';
    case 'B': return 'bg-blue-100 text-blue-800';
    case 'C+': return 'bg-yellow-100 text-yellow-800';
    case 'C': return 'bg-yellow-100 text-yellow-800';
    case 'D': return 'bg-orange-100 text-orange-800';
    case 'F': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function GradesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const auditLog = useAuditLog();
  const academicFilters = useAcademicFilters();
  
  // Check if user has permission to manage grades
  const canManageGrades = academicFilters.canManage('grades');
  const canViewGrades = academicFilters.canView('grades');
  
  const [activeTab, setActiveTab] = useState<'examinations' | 'grades'>('examinations');
  const [examinations, setExaminations] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [examTypeFilter, setExamTypeFilter] = useState('all');
  const [examLevelFilter, setExamLevelFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Load data from API
  useEffect(() => {
    loadExaminations();
    loadGrades();
  }, []);

  const loadExaminations = async () => {
    try {
      setIsLoading(true);
      const response = await examinationService.getExaminations();
      if (response.success && response.data) {
        setExaminations(response.data);
      } else {
        console.error('Failed to load examinations:', response.message);
        setExaminations(sampleExaminations);
      }
    } catch (error) {
      console.error('Error loading examinations:', error);
      setExaminations(sampleExaminations);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGrades = async () => {
    try {
      setIsLoading(true);
      const response = await examinationService.getGrades();
      if (response.success && response.data) {
        setGrades(response.data);
      } else {
        console.error('Failed to load grades:', response.message);
        setGrades(sampleGrades);
      }
    } catch (error) {
      console.error('Error loading grades:', error);
      setGrades(sampleGrades);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter examinations
  const filteredExaminations = examinations.filter(exam => {
    const matchesSearch = 
      exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.subject?.subjectName && exam.subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchesType = examTypeFilter === 'all' || exam.examType === examTypeFilter;
    const matchesLevel = examLevelFilter === 'all' || exam.examLevel === examLevelFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesLevel;
  });

  // Filter grades
  const filteredGrades = grades.filter(grade => {
    const matchesSearch = 
      grade.examination.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || grade.status === statusFilter;
    const matchesType = examTypeFilter === 'all' || grade.examination.examType === examTypeFilter;
    const matchesLevel = examLevelFilter === 'all' || grade.examination.examLevel === examLevelFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesLevel;
  });

  const handleCreateExamination = () => {
    router.push('/academic/examinations/create');
  };

  const handleCreateGrade = () => {
    router.push('/academic/grades/create');
  };

  const handleEditExamination = (id: string) => {
    router.push(`/academic/examinations/${id}/edit`);
  };

  const handleEditGrade = (id: string) => {
    router.push(`/academic/grades/${id}/edit`);
  };

  const handleDeleteExamination = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this examination? This will also delete all associated grades.')) {
      try {
        const response = await examinationService.deleteExamination(id);
        if (response.success) {
          await auditLog.logAction('examination', 'delete', id, 'Examination deleted');
          loadExaminations();
        } else {
          console.error('Failed to delete examination:', response.message);
        }
      } catch (error) {
        console.error('Error deleting examination:', error);
      }
    }
  };

  const handleDeleteGrade = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      try {
        const response = await examinationService.deleteGrade(id);
        if (response.success) {
          await auditLog.logAction('grade', 'delete', id, 'Grade deleted');
          loadGrades();
        } else {
          console.error('Failed to delete grade:', response.message);
        }
      } catch (error) {
        console.error('Error deleting grade:', error);
      }
    }
  };

  const handleViewExamination = (id: string) => {
    router.push(`/academic/examinations/${id}`);
  };

  const handleViewGrade = (id: string) => {
    router.push(`/academic/grades/${id}`);
  };

  const handleExportGrades = async () => {
    try {
      const response = await examinationService.exportGrades('csv');
      if (response.success && response.data) {
        // Create download link
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `grades-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to export grades:', response.message);
      }
    } catch (error) {
      console.error('Error exporting grades:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grades Management</h1>
          <p className="text-gray-600">Manage examinations and student grades</p>
        </div>
        <div className="flex space-x-3">
          <RoleBasedButton
            onClick={() => router.push('/academic/grades/reports')}
            icon={FaChartBar}
            variant="outline"
            permissions={['grades:read']}
          >
            View Reports
          </RoleBasedButton>
          <RoleBasedButton
            onClick={handleExportGrades}
            icon={FaDownload}
            variant="outline"
            permissions={['grades:read']}
          >
            Export Grades
          </RoleBasedButton>
          <RoleBasedButton
            onClick={handleCreateExamination}
            icon={FaPlus}
            permissions={['examinations:create']}
          >
            Create Examination
          </RoleBasedButton>
          <RoleBasedButton
            onClick={handleCreateGrade}
            icon={FaPlus}
            permissions={['grades:create']}
          >
            Enter Grades
          </RoleBasedButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('examinations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'examinations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Examinations ({examinations.length})
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'grades'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Grades ({grades.length})
          </button>
        </nav>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
            <select
              value={examTypeFilter}
              onChange={(e) => setExamTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="QUIZ">Quiz</option>
              <option value="MID_TERM">Mid-Term</option>
              <option value="FINAL">Final</option>
              <option value="MOCK">Mock</option>
              <option value="NECTA">NECTA</option>
              <option value="ASSIGNMENT">Assignment</option>
              <option value="PROJECT">Project</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Level</label>
            <select
              value={examLevelFilter}
              onChange={(e) => setExamLevelFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="PRIMARY">Primary</option>
              <option value="O_LEVEL">O-Level</option>
              <option value="A_LEVEL">A-Level</option>
              <option value="UNIVERSITY">University</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Examinations Tab */}
      {activeTab === 'examinations' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Examination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Marks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grades Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExaminations.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{exam.examName}</div>
                        <div className="text-sm text-gray-500">{exam.examLevel}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{exam.subject?.subjectName || 'All Subjects'}</div>
                      <div className="text-sm text-gray-500">{exam.subject?.subjectCode || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{exam.examType.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(exam.startDate)}</div>
                      {exam.endDate && (
                        <div className="text-sm text-gray-500">to {formatDate(exam.endDate)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{exam.maxMarks}</div>
                      <div className="text-sm text-gray-500">Weight: {exam.weight}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{exam._count.grades}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={exam.status} color={getStatusColor(exam.status)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <RoleBasedButton
                          onClick={() => handleViewExamination(exam.id)}
                          icon={FaEye}
                          variant="outline"
                          size="sm"
                          permissions={['examinations:read']}
                        />
                        <RoleBasedButton
                          onClick={() => handleEditExamination(exam.id)}
                          icon={FaEdit}
                          variant="outline"
                          size="sm"
                          permissions={['examinations:update']}
                        />
                        <RoleBasedButton
                          onClick={() => handleDeleteExamination(exam.id)}
                          icon={FaTrash}
                          variant="outline"
                          size="sm"
                          permissions={['examinations:delete']}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Grades Tab */}
      {activeTab === 'grades' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Examination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGrades.map((grade) => (
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
                      <div className="text-sm text-gray-900">{grade.examination.examName}</div>
                      <div className="text-sm text-gray-500">{grade.examination.examType.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{grade.subject.subjectName}</div>
                      <div className="text-sm text-gray-500">{grade.subject.subjectCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{grade.rawMarks}/{grade.examination.maxMarks}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <RoleBasedButton
                          onClick={() => handleViewGrade(grade.id)}
                          icon={FaEye}
                          variant="outline"
                          size="sm"
                          permissions={['grades:read']}
                        />
                        <RoleBasedButton
                          onClick={() => handleEditGrade(grade.id)}
                          icon={FaEdit}
                          variant="outline"
                          size="sm"
                          permissions={['grades:update']}
                        />
                        <RoleBasedButton
                          onClick={() => handleDeleteGrade(grade.id)}
                          icon={FaTrash}
                          variant="outline"
                          size="sm"
                          permissions={['grades:delete']}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
