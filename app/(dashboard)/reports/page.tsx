'use client';

import { useState, useEffect } from 'react';
import { FaFileAlt, FaDownload, FaChartBar, FaGraduationCap, FaBookOpen, FaUsers, FaShieldAlt, FaCalendarCheck, FaClipboardList, FaChartLine, FaFilter, FaEye } from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import RoleGuard from '../../components/RoleGuard';
import RoleBasedButton from '../../components/RoleBasedButton';
import { useAuth } from '../../contexts/AuthContext';
import { createAcademicReportsService, getReportTemplates } from '../../lib/academicReports';
import { useAuditLog } from '../../hooks/useAuditLog';
import { notificationService } from '../../lib/notifications';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  permissions: string[];
}

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    FaChartBar,
    FaUsers,
    FaGraduationCap,
    FaBookOpen,
    FaBook,
    FaChalkboardTeacher,
    FaUserGraduate,
    FaShieldAlt,
    FaCalendarCheck,
    FaClipboardList,
    FaChartLine,
    FaFileAlt,
  };
  return iconMap[iconName] || FaFileAlt;
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'System':
      return 'from-purple-500 to-purple-600';
    case 'Academic':
      return 'from-blue-500 to-blue-600';
    case 'Compliance':
      return 'from-green-500 to-green-600';
    case 'Personal':
      return 'from-orange-500 to-orange-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

export default function ReportsPage() {
  const { user } = useAuth();
  const auditLog = useAuditLog();
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);

  // Load report templates based on user role
  useEffect(() => {
    if (user) {
      const templates = getReportTemplates(user);
      setReportTemplates(templates);
      
      // Log report access
      auditLog.logAction('VIEW', 'REPORTS', undefined, {
        reportType: 'reports_page',
        userRole: user.roles?.[0]?.name || 'Unknown'
      });
    }
  }, [user, auditLog]);

  // Filter templates by category
  const filteredTemplates = reportTemplates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  );

  // Get unique categories
  const categories = ['all', ...new Set(reportTemplates.map(t => t.category))];

  const handleGenerateReport = async (templateId: string) => {
    setIsGenerating(true);
    try {
      const service = createAcademicReportsService(user);
      
      // Log report generation
      await auditLog.logAction('GENERATE', 'REPORT', templateId, {
        reportType: templateId,
        userRole: user?.roles?.[0]?.name || 'Unknown'
      });
      
      // Generate report (this would be replaced with actual report generation)
      const reportData = await generateReportData(templateId);
      
      // Add to generated reports
      const newReport = {
        id: Date.now().toString(),
        templateId,
        name: reportTemplates.find(t => t.id === templateId)?.name || 'Unknown Report',
        generatedAt: new Date().toISOString(),
        status: 'completed',
        data: reportData
      };
      
      setGeneratedReports(prev => [newReport, ...prev]);
      notificationService.success('Report generated successfully');
      
    } catch (error) {
      console.error('Error generating report:', error);
      notificationService.error('Failed to generate report');
      
      // Log failed report generation
      await auditLog.logAction('GENERATE', 'REPORT', templateId, {}, 'FAILURE', 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = async (reportId: string, format: 'PDF' | 'EXCEL' | 'CSV') => {
    try {
      const report = generatedReports.find(r => r.id === reportId);
      if (!report) return;
      
      const service = createAcademicReportsService(user);
      const exportData = await service.exportReport(report.templateId, format);
      
      // Log export action
      await auditLog.logDataExport('REPORT', { reportId, format }, 1);
      
      // Create download link
      const url = window.URL.createObjectURL(exportData);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.name}_${format.toLowerCase()}.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      notificationService.success(`Report exported as ${format}`);
      
    } catch (error) {
      console.error('Error exporting report:', error);
      notificationService.error('Failed to export report');
    }
  };

  const generateReportData = async (templateId: string): Promise<any> => {
    // Simulate report generation with sample data
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const sampleData = {
      system_overview: {
        totalTenants: 5,
        totalUsers: 1250,
        totalCourses: 45,
        totalSubjects: 180,
        systemHealth: 'Good'
      },
      tenant_overview: {
        totalStudents: 800,
        totalTeachers: 45,
        totalCourses: 12,
        totalSubjects: 48,
        averageGrade: 75.5,
        attendanceRate: 92.3
      },
      course_performance: [
        { courseName: 'Mathematics', students: 120, averageGrade: 78.5, passRate: 85.2 },
        { courseName: 'Physics', students: 95, averageGrade: 72.3, passRate: 78.9 },
        { courseName: 'Chemistry', students: 88, averageGrade: 75.8, passRate: 82.1 }
      ],
      necta_compliance_report: {
        oLevelCompliance: 95.2,
        aLevelCompliance: 92.8,
        coreSubjects: 24,
        optionalSubjects: 18,
        combinationSubjects: 6
      }
    };
    
    return sampleData[templateId as keyof typeof sampleData] || {};
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Academic Reports</h1>
            <p className="text-text-secondary">Generate and export comprehensive academic reports</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status="info" size="lg">
              {reportTemplates.length} Available Reports
            </StatusBadge>
            <StatusBadge status="success" size="lg">
              {generatedReports.length} Generated
            </StatusBadge>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <Card variant="strong" glow="purple">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Report Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-accent-purple text-white shadow-purple-glow'
                    : 'glass-button hover:bg-accent-purple/10'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => {
          const IconComponent = getIconComponent(template.icon);
          const categoryColor = getCategoryColor(template.category);
          
          return (
            <Card key={template.id} variant="default" className="hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-full bg-gradient-to-br ${categoryColor}`}>
                    <IconComponent className="text-2xl text-white" />
                  </div>
                  <StatusBadge status="info" size="sm">
                    {template.category}
                  </StatusBadge>
                </div>
                
                <h3 className="text-xl font-semibold text-text-primary mb-2">{template.name}</h3>
                <p className="text-text-secondary mb-4">{template.description}</p>
                
                <div className="flex items-center gap-2">
                  <RoleBasedButton
                    allowedRoles={template.permissions}
                    variant="primary"
                    size="sm"
                    onClick={() => handleGenerateReport(template.id)}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    <FaChartBar className="mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </RoleBasedButton>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Generated Reports */}
      {generatedReports.length > 0 && (
        <Card variant="strong" glow="purple">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Generated Reports</h2>
            <div className="space-y-3">
              {generatedReports.map(report => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <FaFileAlt className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{report.name}</p>
                      <p className="text-sm text-text-secondary">
                        Generated on {formatDate(report.generatedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportReport(report.id, 'PDF')}
                      className="glass-button p-2 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      title="Export as PDF"
                    >
                      <FaDownload className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleExportReport(report.id, 'EXCEL')}
                      className="glass-button p-2 hover:bg-green-500/10 hover:text-green-500 transition-colors"
                      title="Export as Excel"
                    >
                      <FaDownload className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleExportReport(report.id, 'CSV')}
                      className="glass-button p-2 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                      title="Export as CSV"
                    >
                      <FaDownload className="text-sm" />
                    </button>
                    <button
                      onClick={() => {
                        // Show report preview
                        alert(JSON.stringify(report.data, null, 2));
                      }}
                      className="glass-button p-2 hover:bg-purple-500/10 hover:text-purple-500 transition-colors"
                      title="Preview Report"
                    >
                      <FaEye className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Report Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-accent-purple to-accent-purple-light rounded-xl">
              <FaFileAlt className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Available Reports</p>
              <p className="text-2xl font-bold text-text-primary">{reportTemplates.length}</p>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-accent-green to-accent-green-light rounded-xl">
              <FaChartBar className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Generated Reports</p>
              <p className="text-2xl font-bold text-text-primary">{generatedReports.length}</p>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-xl">
              <FaShieldAlt className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">NECTA Reports</p>
              <p className="text-2xl font-bold text-text-primary">
                {reportTemplates.filter(t => t.id.includes('necta')).length}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl">
              <FaUsers className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Personal Reports</p>
              <p className="text-2xl font-bold text-text-primary">
                {reportTemplates.filter(t => t.category === 'Personal').length}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
