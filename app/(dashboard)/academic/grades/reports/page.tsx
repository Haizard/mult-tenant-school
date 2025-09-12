'use client';

import { useState, useEffect } from 'react';
import { FaChartBar, FaDownload, FaFilter, FaEye } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useAcademicFilters } from '@/hooks/useAcademicFilters';
import { examinationService } from '@/lib/services/examinationService';
import { nectaComplianceService } from '@/lib/nectaCompliance';

export default function GradeReportsPage() {
  const { user } = useAuth();
  const academicFilters = useAcademicFilters();
  
  // Check if user has permission to view reports
  const canViewReports = academicFilters.canView('grades');
  
  const [examinations, setExaminations] = useState<any[]>([]);
  const [selectedExamination, setSelectedExamination] = useState('');
  const [grades, setGrades] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load examinations
  useEffect(() => {
    loadExaminations();
  }, []);

  // Load grades when examination is selected
  useEffect(() => {
    if (selectedExamination) {
      loadGrades();
    }
  }, [selectedExamination]);

  const loadExaminations = async () => {
    try {
      const response = await examinationService.getExaminations({ status: 'COMPLETED' });
      if (response.success && response.data) {
        setExaminations(response.data);
      }
    } catch (error) {
      console.error('Error loading examinations:', error);
    }
  };

  const loadGrades = async () => {
    try {
      setIsLoading(true);
      const response = await examinationService.getGrades({ examinationId: selectedExamination });
      if (response.success && response.data) {
        setGrades(response.data);
        generateReport(response.data);
      }
    } catch (error) {
      console.error('Error loading grades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = (gradesData: any[]) => {
    if (gradesData.length === 0) {
      setReportData(null);
      return;
    }

    // Group grades by student
    const studentGrades: Record<string, any[]> = {};
    gradesData.forEach(grade => {
      if (!studentGrades[grade.studentId]) {
        studentGrades[grade.studentId] = [];
      }
      studentGrades[grade.studentId].push(grade);
    });

    // Calculate student results
    const studentResults = Object.entries(studentGrades).map(([studentId, grades]) => {
      const student = grades[0].student;
      const studentGradesData = grades.map(grade => ({
        subjectId: grade.subjectId,
        subjectName: grade.subject.subjectName,
        subjectType: grade.subject.subjectType,
        rawMarks: grade.rawMarks,
        percentage: grade.percentage,
        grade: grade.grade,
        points: grade.points
      }));

      return nectaComplianceService.calculateStudentResult(
        studentId,
        `${student.firstName} ${student.lastName}`,
        studentGradesData,
        grades[0].examination.examLevel
      );
    });

    // Generate NECTA report
    const nectaReport = nectaComplianceService.generateNECTAReport(studentResults);

    // Calculate additional statistics
    const totalMarks = gradesData.reduce((sum, grade) => sum + grade.rawMarks, 0);
    const averageMarks = totalMarks / gradesData.length;
    const highestMarks = Math.max(...gradesData.map(grade => grade.rawMarks));
    const lowestMarks = Math.min(...gradesData.map(grade => grade.rawMarks));

    // Grade distribution by subject
    const subjectStats: Record<string, any> = {};
    gradesData.forEach(grade => {
      const subjectName = grade.subject.subjectName;
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = {
          subjectName,
          totalStudents: 0,
          averageMarks: 0,
          highestMarks: 0,
          lowestMarks: 100,
          gradeDistribution: {}
        };
      }
      
      subjectStats[subjectName].totalStudents++;
      subjectStats[subjectName].averageMarks += grade.rawMarks;
      subjectStats[subjectName].highestMarks = Math.max(subjectStats[subjectName].highestMarks, grade.rawMarks);
      subjectStats[subjectName].lowestMarks = Math.min(subjectStats[subjectName].lowestMarks, grade.rawMarks);
      
      if (!subjectStats[subjectName].gradeDistribution[grade.grade]) {
        subjectStats[subjectName].gradeDistribution[grade.grade] = 0;
      }
      subjectStats[subjectName].gradeDistribution[grade.grade]++;
    });

    // Calculate averages
    Object.values(subjectStats).forEach((stats: any) => {
      stats.averageMarks = stats.averageMarks / stats.totalStudents;
    });

    setReportData({
      examination: gradesData[0]?.examination,
      summary: {
        totalStudents: studentResults.length,
        totalGrades: gradesData.length,
        averageMarks,
        highestMarks,
        lowestMarks,
        ...nectaReport.summary
      },
      divisionBreakdown: nectaReport.divisionBreakdown,
      gradeDistribution: nectaReport.gradeDistribution,
      subjectStats: Object.values(subjectStats),
      studentResults
    });
  };

  const handleExportReport = async () => {
    if (!reportData) return;

    try {
      const csvContent = generateCSVReport(reportData);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `grade-report-${selectedExamination}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const generateCSVReport = (data: any) => {
    let csv = 'Grade Report\n\n';
    
    // Summary
    csv += 'SUMMARY\n';
    csv += `Total Students,${data.summary.totalStudents}\n`;
    csv += `Total Grades,${data.summary.totalGrades}\n`;
    csv += `Average Marks,${data.summary.averageMarks.toFixed(2)}\n`;
    csv += `Highest Marks,${data.summary.highestMarks}\n`;
    csv += `Lowest Marks,${data.summary.lowestMarks}\n`;
    csv += `Passed Students,${data.summary.passedStudents}\n`;
    csv += `Failed Students,${data.summary.failedStudents}\n`;
    csv += `Conditional Students,${data.summary.conditionalStudents}\n\n`;

    // Division Breakdown
    csv += 'DIVISION BREAKDOWN\n';
    csv += 'Division,Count\n';
    Object.entries(data.divisionBreakdown).forEach(([division, count]) => {
      csv += `${division},${count}\n`;
    });
    csv += '\n';

    // Grade Distribution
    csv += 'GRADE DISTRIBUTION\n';
    csv += 'Grade,Count\n';
    Object.entries(data.gradeDistribution).forEach(([grade, count]) => {
      csv += `${grade},${count}\n`;
    });
    csv += '\n';

    // Student Results
    csv += 'STUDENT RESULTS\n';
    csv += 'Student Name,Division,Status,Total Points,Average\n';
    data.studentResults.forEach((result: any) => {
      csv += `${result.studentName},${result.division},${result.status},${result.totalPoints},${result.average.toFixed(2)}\n`;
    });

    return csv;
  };

  const selectedExam = examinations.find(exam => exam.id === selectedExamination);

  return (
    <RoleGuard permissions={['grades:read']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grade Reports</h1>
            <p className="text-gray-600">View and analyze examination results</p>
          </div>
          {reportData && (
            <Button
              onClick={handleExportReport}
              icon={FaDownload}
              variant="outline"
            >
              Export Report
            </Button>
          )}
        </div>

        {/* Examination Selection */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Select Examination</h3>
            <div className="max-w-md">
              <select
                value={selectedExamination}
                onChange={(e) => setSelectedExamination(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Examination</option>
                {examinations.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.examName} - {exam.examType.replace('_', ' ')} ({exam.examLevel})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Report Content */}
        {isLoading ? (
          <Card>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Generating report...</p>
            </div>
          </Card>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Summary Statistics */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{reportData.summary.totalStudents}</div>
                  <div className="text-sm text-blue-800">Total Students</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{reportData.summary.passedStudents}</div>
                  <div className="text-sm text-green-800">Passed</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{reportData.summary.failedStudents}</div>
                  <div className="text-sm text-red-800">Failed</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{reportData.summary.averageMarks.toFixed(1)}</div>
                  <div className="text-sm text-yellow-800">Average Marks</div>
                </div>
              </div>
            </Card>

            {/* Division Breakdown */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Division Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(reportData.divisionBreakdown).map(([division, count]) => (
                  <div key={division} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-700">{count}</div>
                    <div className="text-sm text-gray-600">{division}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Grade Distribution */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {Object.entries(reportData.gradeDistribution).map(([grade, count]) => (
                  <div key={grade} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-700">{count}</div>
                    <div className="text-sm text-gray-600">Grade {grade}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Subject Statistics */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Subject Statistics</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Students
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Highest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lowest
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.subjectStats.map((subject: any) => (
                      <tr key={subject.subjectName} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {subject.subjectName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {subject.totalStudents}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {subject.averageMarks.toFixed(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {subject.highestMarks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {subject.lowestMarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Student Results */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Student Results</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Division
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.studentResults.map((result: any) => (
                      <tr key={result.studentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {result.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.division}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            result.status === 'PASS' ? 'bg-green-100 text-green-800' :
                            result.status === 'FAIL' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {result.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.totalPoints}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.average.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ) : selectedExamination ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600">No grades found for this examination.</p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600">Please select an examination to view reports.</p>
            </div>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}
