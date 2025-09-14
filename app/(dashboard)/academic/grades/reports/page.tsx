'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaChartBar, FaUsers, FaGraduationCap, FaBook, FaDownload, FaEye } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import RoleGuard from '@/components/RoleGuard';
import RoleBasedButton from '@/components/RoleBasedButton';
import { useAuth } from '@/contexts/AuthContext';
import { examinationService } from '@/lib/services/examinationService';
import { academicService } from '@/lib/academicService';

interface GradeReport {
  totalGrades: number;
  totalStudents: number;
  totalExaminations: number;
  totalSubjects: number;
  averagePercentage: number;
  gradeDistribution: {
    [key: string]: number;
  };
  statusDistribution: {
    [key: string]: number;
  };
  subjectPerformance: Array<{
    subjectName: string;
    averagePercentage: number;
    totalGrades: number;
  }>;
  examinationPerformance: Array<{
    examName: string;
    examType: string;
    averagePercentage: number;
    totalGrades: number;
  }>;
}

export default function GradeReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [report, setReport] = useState<GradeReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    academicYear: '',
    subject: '',
    examination: '',
    dateRange: 'all'
  });

  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [examinations, setExaminations] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      loadReport();
    }
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load filter options
      const [academicYearsRes, subjectsRes, examinationsRes] = await Promise.all([
        academicService.getAcademicYears(),
        academicService.getSubjects(),
        examinationService.getExaminations()
      ]);

      if (academicYearsRes.success) setAcademicYears(academicYearsRes.data || []);
      if (subjectsRes.success) setSubjects(subjectsRes.data || []);
      if (examinationsRes.success) setExaminations(examinationsRes.data || []);

      // Load initial report
      await loadReport();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReport = async () => {
    try {
      // For now, generate a mock report since we don't have a dedicated report API
      const gradesRes = await examinationService.getGrades();
      
      if (gradesRes.success && gradesRes.data) {
        const grades = gradesRes.data;
        
        // Calculate statistics
        const totalGrades = grades.length;
        const uniqueStudents = new Set(grades.map(g => g.studentId)).size;
        const uniqueExaminations = new Set(grades.map(g => g.examinationId)).size;
        const uniqueSubjects = new Set(grades.map(g => g.subjectId)).size;
        
        const averagePercentage = grades.length > 0 
          ? grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length 
          : 0;

        // Grade distribution
        const gradeDistribution = grades.reduce((acc, grade) => {
          const letterGrade = grade.grade || 'N/A';
          acc[letterGrade] = (acc[letterGrade] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Status distribution
        const statusDistribution = grades.reduce((acc, grade) => {
          acc[grade.status] = (acc[grade.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Subject performance
        const subjectStats = grades.reduce((acc, grade) => {
          const subjectName = grade.subject.subjectName;
          if (!acc[subjectName]) {
            acc[subjectName] = { total: 0, sum: 0, count: 0 };
          }
          acc[subjectName].sum += grade.percentage;
          acc[subjectName].count += 1;
          return acc;
        }, {} as Record<string, any>);

        const subjectPerformance = Object.entries(subjectStats).map(([subjectName, stats]) => ({
          subjectName,
          averagePercentage: stats.sum / stats.count,
          totalGrades: stats.count
        }));

        // Examination performance
        const examStats = grades.reduce((acc, grade) => {
          const examName = grade.examination.examName;
          const examType = grade.examination.examType;
          const key = `${examName}_${examType}`;
          if (!acc[key]) {
            acc[key] = { examName, examType, sum: 0, count: 0 };
          }
          acc[key].sum += grade.percentage;
          acc[key].count += 1;
          return acc;
        }, {} as Record<string, any>);

        const examinationPerformance = Object.values(examStats).map((stats: any) => ({
          examName: stats.examName,
          examType: stats.examType,
          averagePercentage: stats.sum / stats.count,
          totalGrades: stats.count
        }));

        setReport({
          totalGrades,
          totalStudents: uniqueStudents,
          totalExaminations: uniqueExaminations,
          totalSubjects: uniqueSubjects,
          averagePercentage,
          gradeDistribution,
          statusDistribution,
          subjectPerformance,
          examinationPerformance
        });
      }
    } catch (error) {
      console.error('Error loading report:', error);
    }
  };

  const handleBack = () => {
    router.push('/academic/grades');
  };

  const handleExportReport = async () => {
    try {
      const response = await examinationService.exportGrades('csv');
      if (response.success && response.data) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `grades-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export report');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'green';
      case 'DRAFT': return 'gray';
      case 'APPROVED': return 'blue';
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
              <h1 className="text-2xl font-bold text-gray-900">Grade Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive analysis of academic performance</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <RoleBasedButton
              onClick={handleExportReport}
              icon={FaDownload}
              variant="outline"
              permissions={['grades:read']}
            >
              Export Report
            </RoleBasedButton>
          </div>
        </div>

        {/* Overview Cards */}
        {report && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaChartBar className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Grades</dt>
                        <dd className="text-lg font-medium text-gray-900">{report.totalGrades}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaUsers className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Students</dt>
                        <dd className="text-lg font-medium text-gray-900">{report.totalStudents}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaGraduationCap className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Examinations</dt>
                        <dd className="text-lg font-medium text-gray-900">{report.totalExaminations}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaBook className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Average Score</dt>
                        <dd className="text-lg font-medium text-gray-900">{report.averagePercentage.toFixed(1)}%</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Grade Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(report.gradeDistribution).map(([grade, count]) => (
                      <div key={grade} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={grade} color={getGradeColor(grade)} size="sm" />
                          <span className="text-sm text-gray-900">Grade {grade}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                          <span className="text-sm text-gray-500">
                            ({((count / report.totalGrades) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(report.statusDistribution).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={status} color={getStatusColor(status)} size="sm" />
                          <span className="text-sm text-gray-900">{status}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                          <span className="text-sm text-gray-500">
                            ({((count / report.totalGrades) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Subject Performance */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Average Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Grades
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Performance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.subjectPerformance.map((subject, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{subject.subjectName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{subject.averagePercentage.toFixed(1)}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{subject.totalGrades}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  subject.averagePercentage >= 80 ? 'bg-green-500' :
                                  subject.averagePercentage >= 60 ? 'bg-blue-500' :
                                  subject.averagePercentage >= 40 ? 'bg-yellow-500' :
                                  subject.averagePercentage >= 20 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(subject.averagePercentage, 100)}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            {/* Examination Performance */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Examination Performance</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Examination
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Average Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Grades
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Performance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.examinationPerformance.map((exam, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{exam.examName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{exam.examType.replace('_', ' ')}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{exam.averagePercentage.toFixed(1)}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{exam.totalGrades}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  exam.averagePercentage >= 80 ? 'bg-green-500' :
                                  exam.averagePercentage >= 60 ? 'bg-blue-500' :
                                  exam.averagePercentage >= 40 ? 'bg-yellow-500' :
                                  exam.averagePercentage >= 20 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(exam.averagePercentage, 100)}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </RoleGuard>
  );
}