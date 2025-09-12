import React from 'react';
import { FaUserGraduate, FaBook, FaCalendarAlt, FaChartLine, FaTrophy, FaClock } from 'react-icons/fa';
import Card from '../ui/Card';
import StatCard from '../ui/StatCard';
import ProgressRing from '../ui/ProgressRing';
import StatusBadge from '../ui/StatusBadge';
import NotificationCard from '../ui/NotificationCard';
import CalendarWidget from '../ui/CalendarWidget';
import DataTable from '../ui/DataTable';

const StudentDashboard = () => {
  // Sample data
  const notifications = [
    {
      type: 'info' as const,
      title: 'New Assignment Posted',
      message: 'Mathematics Assignment 3 has been posted. Due date: Dec 25, 2023',
      timestamp: '2 hours ago',
      author: 'Dr. Smith',
      unread: true,
    },
    {
      type: 'success' as const,
      title: 'Grade Updated',
      message: 'Your Physics exam grade has been updated. Check your results.',
      timestamp: '1 day ago',
      author: 'Prof. Johnson',
      unread: false,
    },
    {
      type: 'warning' as const,
      title: 'Library Book Due',
      message: 'Your library book "Advanced Calculus" is due tomorrow.',
      timestamp: '2 days ago',
      author: 'Library System',
      unread: true,
    },
  ];

  const recentGrades = [
    { subject: 'Mathematics', grade: 'A+', score: '95/100', date: '2023-12-20' },
    { subject: 'Physics', grade: 'A', score: '88/100', date: '2023-12-18' },
    { subject: 'Chemistry', grade: 'B+', score: '82/100', date: '2023-12-15' },
    { subject: 'English', grade: 'A-', score: '90/100', date: '2023-12-12' },
  ];

  const calendarEvents = [
    { date: 25, title: 'Math Assignment Due', type: 'assignment' as const, color: 'red' as const },
    { date: 28, title: 'Physics Exam', type: 'exam' as const, color: 'purple' as const },
    { date: 30, title: 'Winter Break Starts', type: 'holiday' as const, color: 'green' as const },
  ];

  const attendanceData = [
    { subject: 'Mathematics', present: 45, total: 50, percentage: 90 },
    { subject: 'Physics', present: 42, total: 48, percentage: 87.5 },
    { subject: 'Chemistry', present: 40, total: 45, percentage: 88.9 },
    { subject: 'English', present: 38, total: 42, percentage: 90.5 },
  ];

  const gradeColumns = [
    { key: 'subject', label: 'Subject', sortable: true },
    { key: 'grade', label: 'Grade', sortable: true },
    { key: 'score', label: 'Score', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome back, Alex!</h1>
            <p className="text-text-secondary">Here's your academic overview for this semester</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status="active" size="lg">
              Current Student
            </StatusBadge>
            <div className="text-right">
              <p className="text-sm text-text-secondary">Student ID</p>
              <p className="font-semibold text-text-primary">STU-2023-001</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={FaUserGraduate} 
          label="Current GPA" 
          value="3.85" 
          color="purple" 
        />
        <StatCard 
          icon={FaBook} 
          label="Courses Enrolled" 
          value="6" 
          color="blue" 
        />
        <StatCard 
          icon={FaChartLine} 
          label="Attendance Rate" 
          value="89%" 
          color="green" 
        />
        <StatCard 
          icon={FaTrophy} 
          label="Achievements" 
          value="12" 
          color="orange" 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Grades */}
          <Card variant="strong" glow="purple">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">Recent Grades</h2>
              <button className="glass-button px-4 py-2 text-sm">
                View All
              </button>
            </div>
            <DataTable
              data={recentGrades}
              columns={gradeColumns}
              searchable={false}
              filterable={false}
              pagination={false}
            />
          </Card>

          {/* Attendance Overview */}
          <Card variant="gradient">
            <h2 className="text-xl font-bold text-text-primary mb-6">Attendance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {attendanceData.map((item, index) => (
                <div key={index} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-text-primary">{item.subject}</h3>
                    <span className="text-sm text-text-secondary">{item.present}/{item.total}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ProgressRing
                      percentage={item.percentage}
                      size={60}
                      strokeWidth={6}
                      color={item.percentage >= 90 ? 'green' : item.percentage >= 80 ? 'blue' : 'orange'}
                      showPercentage={true}
                      id={`attendance-${index}`}
                    />
                    <div>
                      <p className="text-lg font-bold text-text-primary">{item.percentage}%</p>
                      <p className="text-sm text-text-secondary">Attendance</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Calendar */}
          <CalendarWidget
            events={calendarEvents}
            onDateSelect={(date) => console.log('Date selected:', date)}
            onEventClick={(event) => console.log('Event clicked:', event)}
          />

          {/* Notifications */}
          <Card variant="default">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">Notifications</h2>
              <StatusBadge status="warning" size="sm">
                3 New
              </StatusBadge>
            </div>
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <NotificationCard
                  key={index}
                  {...notification}
                  onClick={() => console.log('Notification clicked')}
                />
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card variant="strong">
            <h2 className="text-xl font-bold text-text-primary mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="glass-button p-4 text-center hover:scale-105 transition-all duration-200">
                <FaBook className="text-2xl text-accent-purple mx-auto mb-2" />
                <p className="text-sm font-medium">View Assignments</p>
              </button>
              <button className="glass-button p-4 text-center hover:scale-105 transition-all duration-200">
                <FaCalendarAlt className="text-2xl text-accent-blue mx-auto mb-2" />
                <p className="text-sm font-medium">Schedule</p>
              </button>
              <button className="glass-button p-4 text-center hover:scale-105 transition-all duration-200">
                <FaChartLine className="text-2xl text-accent-green mx-auto mb-2" />
                <p className="text-sm font-medium">Progress</p>
              </button>
              <button className="glass-button p-4 text-center hover:scale-105 transition-all duration-200">
                <FaClock className="text-2xl text-orange-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Attendance</p>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
