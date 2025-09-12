'use client';

import { useState, useEffect } from 'react';
import { FaBookOpen, FaGraduationCap, FaUsers, FaChartBar, FaCalendarAlt, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import StatusBadge from '../../../components/ui/StatusBadge';
import RoleGuard from '../../../components/RoleGuard';
import RoleBasedButton from '../../../components/RoleBasedButton';
import { useAuth } from '../../../contexts/AuthContext';
import { useAcademicFilters } from '../../../hooks/useAcademicFilters';
import { useAuditLog } from '../../../hooks/useAuditLog';

export default function AcademicDashboard() {
  const { user } = useAuth();
  const academicFilters = useAcademicFilters();
  const auditLog = useAuditLog();
  
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalSubjects: 0,
    totalClasses: 0,
    activeCourses: 0,
    activeSubjects: 0,
    assignedSubjects: 0,
    enrolledCourses: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard data based on user role
  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Get academic statistics based on user role
      const academicStats = await academicFilters.getAcademicStats();
      setStats(academicStats);
      
      // Get recent activity (this would be implemented with actual API calls)
      setRecentActivity([
        {
          id: '1',
          type: 'course_created',
          title: 'New course "Advanced Mathematics" created',
          timestamp: new Date().toISOString(),
          user: 'John Smith',
        },
        {
          id: '2',
          type: 'subject_updated',
          title: 'Subject "Physics" updated with new curriculum',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: 'Sarah Johnson',
        },
        {
          id: '3',
          type: 'teacher_assigned',
          title: 'Teacher assigned to "Chemistry" subject',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          user: 'Admin User',
        },
      ]);
      
      // Log dashboard access
      await auditLog.logAction('VIEW', 'ACADEMIC_DASHBOARD', undefined, {
        dashboardType: 'academic',
        userRole: user?.roles?.[0]?.name || 'Unknown'
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleSpecificStats = () => {
    if (academicFilters.canManage('courses')) {
      // Admin view - show management stats
      return [
        {
          title: 'Total Courses',
          value: stats.totalCourses,
          icon: FaBookOpen,
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
        },
        {
          title: 'Active Courses',
          value: stats.activeCourses,
          icon: FaGraduationCap,
          color: 'from-green-500 to-green-600',
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
        },
        {
          title: 'Total Subjects',
          value: stats.totalSubjects,
          icon: FaUsers,
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
        },
        {
          title: 'Active Subjects',
          value: stats.activeSubjects,
          icon: FaChartBar,
          color: 'from-orange-500 to-orange-600',
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
        },
      ];
    } else if (academicFilters.canView('courses')) {
      // Teacher/Student view - show assigned/enrolled stats
      return [
        {
          title: 'Assigned Subjects',
          value: stats.assignedSubjects,
          icon: FaGraduationCap,
          color: 'from-green-500 to-green-600',
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
        },
        {
          title: 'Enrolled Courses',
          value: stats.enrolledCourses,
          icon: FaBookOpen,
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
        },
        {
          title: 'Total Classes',
          value: stats.totalClasses,
          icon: FaUsers,
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
          iconColor: 'text-purple-600',
        },
        {
          title: 'Active Assignments',
          value: 12, // This would come from actual data
          icon: FaChartBar,
          color: 'from-orange-500 to-orange-600',
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
        },
      ];
    }
    
    return [];
  };

  const getRoleSpecificActions = () => {
    if (academicFilters.canManage('courses')) {
      return [
        {
          title: 'Create New Course',
          description: 'Add a new academic course',
          icon: FaBookOpen,
          href: '/academic/courses/create',
          color: 'from-blue-500 to-blue-600',
        },
        {
          title: 'Create New Subject',
          description: 'Add a new subject with NECTA compliance',
          icon: FaGraduationCap,
          href: '/academic/subjects/create',
          color: 'from-green-500 to-green-600',
        },
        {
          title: 'Manage Classes',
          description: 'Create and manage class schedules',
          icon: FaUsers,
          href: '/academic/classes',
          color: 'from-purple-500 to-purple-600',
        },
        {
          title: 'Assign Teachers',
          description: 'Assign teachers to subjects',
          icon: FaCalendarAlt,
          href: '/academic/teacher-assignments',
          color: 'from-orange-500 to-orange-600',
        },
      ];
    } else if (academicFilters.canView('courses')) {
      return [
        {
          title: 'View My Courses',
          description: 'View assigned courses and subjects',
          icon: FaEye,
          href: '/academic/my-courses',
          color: 'from-blue-500 to-blue-600',
        },
        {
          title: 'View My Subjects',
          description: 'View assigned subjects and classes',
          icon: FaGraduationCap,
          href: '/academic/my-subjects',
          color: 'from-green-500 to-green-600',
        },
        {
          title: 'View Schedule',
          description: 'View class schedule and timetable',
          icon: FaCalendarAlt,
          href: '/academic/schedule',
          color: 'from-purple-500 to-purple-600',
        },
        {
          title: 'View Grades',
          description: 'View grades and assessments',
          icon: FaChartBar,
          href: '/academic/grades',
          color: 'from-orange-500 to-orange-600',
        },
      ];
    }
    
    return [];
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course_created':
        return <FaBookOpen className="text-blue-600" />;
      case 'subject_updated':
        return <FaGraduationCap className="text-green-600" />;
      case 'teacher_assigned':
        return <FaUsers className="text-purple-600" />;
      default:
        return <FaChartBar className="text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const roleSpecificStats = getRoleSpecificStats();
  const roleSpecificActions = getRoleSpecificActions();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Academic Dashboard</h1>
            <p className="text-text-secondary">
              {academicFilters.canManage('courses') 
                ? 'Manage courses, subjects, and academic structure' 
                : 'View your academic information and assignments'
              }
            </p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status="info" size="lg">
              {user?.roles?.[0]?.name || 'User'}
            </StatusBadge>
            {academicFilters.canManage('courses') && (
              <RoleBasedButton
                allowedRoles={['Super Admin', 'Tenant Admin']}
                variant="primary"
                size="md"
                onClick={() => window.location.href = '/academic/courses/create'}
              >
                <FaBookOpen className="mr-2" />
                Quick Add Course
              </RoleBasedButton>
            )}
          </div>
        </div>
      </div>

      {/* Role-Specific Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleSpecificStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} variant="default">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <IconComponent className={`text-2xl ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">{stat.title}</p>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Role-Specific Quick Actions */}
      <Card variant="strong" glow="purple">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roleSpecificActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <RoleBasedButton
                  key={index}
                  allowedRoles={academicFilters.canManage('courses') 
                    ? ['Super Admin', 'Tenant Admin'] 
                    : ['Super Admin', 'Tenant Admin', 'Teacher', 'Student']
                  }
                  variant="secondary"
                  className="flex flex-col items-center justify-center h-24 p-4"
                  onClick={() => window.location.href = action.href}
                >
                  <IconComponent className="text-2xl mb-2" />
                  <span className="text-sm font-medium text-center">{action.title}</span>
                </RoleBasedButton>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card variant="strong" glow="purple">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-text-primary font-medium">{activity.title}</p>
                  <p className="text-sm text-text-secondary">
                    {activity.user} • {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Academic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courses Overview */}
        <Card variant="default">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Courses Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Total Courses</span>
                <span className="font-semibold text-text-primary">{stats.totalCourses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Active Courses</span>
                <span className="font-semibold text-text-primary">{stats.activeCourses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Inactive Courses</span>
                <span className="font-semibold text-text-primary">{stats.totalCourses - stats.activeCourses}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Subjects Overview */}
        <Card variant="default">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Subjects Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Total Subjects</span>
                <span className="font-semibold text-text-primary">{stats.totalSubjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Active Subjects</span>
                <span className="font-semibold text-text-primary">{stats.activeSubjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Assigned Subjects</span>
                <span className="font-semibold text-text-primary">{stats.assignedSubjects}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
