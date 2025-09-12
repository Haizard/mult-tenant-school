'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaExclamationCircle, 
  FaChevronDown, 
  FaSync, 
  FaGraduationCap, 
  FaChartBar, 
  FaChartLine, 
  FaInfoCircle,
  FaShieldAlt,
  FaSchool
} from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import { useAuth } from '../../contexts/AuthContext';
import RoleGuard from '../../components/RoleGuard';
import { NECTAComplianceService, NECTAComplianceReport, SubjectCompliance, CourseCompliance } from '../../lib/nectaCompliance';
import { academicService } from '../../lib/academicService';

const NECTACompliancePage: React.FC = () => {
  const { user } = useAuth();
  const [complianceReport, setComplianceReport] = useState<NECTAComplianceReport | null>(null);
  const [subjectCompliance, setSubjectCompliance] = useState<SubjectCompliance[]>([]);
  const [courseCompliance, setCourseCompliance] = useState<CourseCompliance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedChecks, setExpandedChecks] = useState<Set<string>>(new Set());

  const loadComplianceData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load courses and subjects
      const [coursesResponse, subjectsResponse] = await Promise.all([
        academicService.getCourses(),
        academicService.getSubjects(),
      ]);

      const courses = coursesResponse.data || [];
      const subjects = subjectsResponse.data || [];

      // Create NECTA compliance service
      const complianceService = new NECTAComplianceService(user);

      // Generate compliance report
      const report = await complianceService.generateComplianceReport(courses, subjects);
      setComplianceReport(report);

      // Check individual subject compliance
      const subjectComplianceData: SubjectCompliance[] = [];
      for (const subject of subjects) {
        const compliance = await complianceService.checkSubjectCompliance(subject);
        subjectComplianceData.push(compliance);
      }
      setSubjectCompliance(subjectComplianceData);

      // Check individual course compliance
      const courseComplianceData: CourseCompliance[] = [];
      for (const course of courses) {
        const courseSubjects = subjects.filter(s => 
          course.courseSubjects?.some((cs: any) => cs.subjectId === s.id)
        );
        const compliance = await complianceService.checkCourseCompliance(course, courseSubjects);
        courseComplianceData.push(compliance);
      }
      setCourseCompliance(courseComplianceData);

    } catch (err) {
      console.error('Error loading compliance data:', err);
      setError('Failed to load NECTA compliance data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadComplianceData();
  }, [loadComplianceData]);

  const toggleCheckExpansion = (checkId: string) => {
    setExpandedChecks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(checkId)) {
        newSet.delete(checkId);
      } else {
        newSet.add(checkId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <FaCheckCircle className="text-green-500" />;
      case 'FAIL':
        return <FaExclamationCircle className="text-red-500" />;
      case 'WARNING':
        return <FaExclamationTriangle className="text-yellow-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'success';
      case 'FAIL':
        return 'error';
      case 'WARNING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">NECTA Compliance Check</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-800">Analyzing academic structure for NECTA compliance...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">NECTA Compliance Check</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <FaExclamationCircle className="text-red-500 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
        <Button onClick={loadComplianceData} className="flex items-center">
          <FaSync className="mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['Super Admin', 'Tenant Admin']}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">NECTA Compliance Check</h1>
          <Button 
            variant="secondary" 
            onClick={loadComplianceData} 
            disabled={isLoading}
            className="flex items-center"
          >
            <FaSync className="mr-2" />
            Refresh
          </Button>
        </div>

        {complianceReport && (
          <>
            {/* Overall Compliance Summary */}
            <Card className="mb-6" variant="gradient" glow="blue">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Compliance Summary</h2>
              <div className="flex items-center mb-4">
                <div className="flex-1 bg-gray-200 rounded-full h-3 mr-4">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      getComplianceColor(complianceReport.overallCompliance) === 'success' ? 'bg-green-500' :
                      getComplianceColor(complianceReport.overallCompliance) === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${complianceReport.overallCompliance}%` }}
                  ></div>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {Math.round(complianceReport.overallCompliance)}%
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {complianceReport.summary.passedChecks}
                  </div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">
                    {complianceReport.summary.warningChecks}
                  </div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {complianceReport.summary.failedChecks}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {complianceReport.summary.totalChecks}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
            </Card>

            {/* Compliance Checks */}
            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Compliance Checks</h2>
              <div className="space-y-4">
                {complianceReport.checks.map((check) => (
                  <div key={check.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleCheckExpansion(check.id)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        {getStatusIcon(check.status)}
                        <span className="ml-3 font-medium text-gray-900">{check.message}</span>
                      </div>
                      <div className="flex items-center">
                        <StatusBadge 
                          status={getStatusColor(check.status) as any}
                        >
                          {check.status}
                        </StatusBadge>
                        <FaChevronDown 
                          className={`ml-2 transition-transform ${
                            expandedChecks.has(check.id) ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                    {expandedChecks.has(check.id) && (
                      <div className="px-4 pb-4 border-t border-gray-200">
                        <div className="mt-3 text-sm text-gray-600">
                          <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                            {JSON.stringify(check.details, null, 2)}
                          </pre>
                        </div>
                        {check.recommendations && check.recommendations.length > 0 && (
                          <div className="mt-3">
                            <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                            <ul className="space-y-1">
                              {check.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start text-sm text-gray-600">
                                  <FaInfoCircle className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Subject Compliance */}
            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Subject Compliance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjectCompliance.map((subject) => (
                  <div key={subject.subjectId} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">{subject.subjectName}</h3>
                      <StatusBadge 
                        status={getComplianceColor(subject.complianceScore) as any}
                      >
                        {Math.round(subject.complianceScore)}%
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {subject.subjectLevel} • {subject.subjectType}
                    </p>
                    {subject.issues.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-red-600 mb-1">Issues:</p>
                        {subject.issues.map((issue, index) => (
                          <p key={index} className="text-xs text-red-600">• {issue}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Course Compliance */}
            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Compliance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseCompliance.map((course) => (
                  <div key={course.courseId} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">{course.courseName}</h3>
                      <StatusBadge 
                        status={getComplianceColor(course.complianceScore) as any}
                      >
                        {Math.round(course.complianceScore)}%
                      </StatusBadge>
                    </div>
                    {course.issues.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-red-600 mb-1">Issues:</p>
                        {course.issues.map((issue, index) => (
                          <p key={index} className="text-xs text-red-600">• {issue}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* General Recommendations */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">General Recommendations</h2>
              <ul className="space-y-2">
                {complianceReport.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <FaSchool className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Last checked: {new Date(complianceReport.lastChecked).toLocaleString()}
                </p>
              </div>
            </Card>
          </>
        )}
      </div>
    </RoleGuard>
  );
};

export default NECTACompliancePage;