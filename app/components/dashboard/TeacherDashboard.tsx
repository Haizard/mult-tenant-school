import React from 'react';
import { FaChalkboardTeacher, FaUsers, FaBookOpen, FaChartBar, FaCalendarCheck, FaClipboardList } from 'react-icons/fa';
import Card from '../ui/Card';
import StatCard from '../ui/StatCard';
import ProgressRing from '../ui/ProgressRing';
import StatusBadge from '../ui/StatusBadge';
import NotificationCard from '../ui/NotificationCard';
import CalendarWidget from '../ui/CalendarWidget';
import DataTable from '../ui/DataTable';

const TeacherDashboard = () => {
  // Sample data
  const notifications = [
    {
      type: 'warning' as const,
      title: 'Grade Submission Due',
      message: 'Physics Midterm grades are due by Dec 30, 2023',
      timestamp: '1 hour ago',
      author: 'Academic Office',
      unread: true,
    },
    {
      type: 'info' as const,
      title: 'New Student Enrolled',
      message: 'Sarah Johnson has been enrolled in your Advanced Physics class',
      timestamp: '3 hours ago',
      author: 'Registrar',
      unread: true,
    },
    {
      type: 'success' as const,
      title: 'Assignment Submitted',
      message: 'All students have submitted their lab reports',
      timestamp: '1 day ago',
      author: 'System',
      unread: false,
    },
  ];

  const classSchedule = [
    { time: '08:00 AM', subject: 'Physics 101', room: 'Room 201', students: 28 },
    { time: '10:00 AM', subject: 'Advanced Physics', room: 'Lab 301', students: 15 },
    { time: '02:00 PM', subject: 'Physics 201', room: 'Room 205', students: 32 },
    { time: '04:00 PM', subject: 'Office Hours', room: 'Office 101', students: 0 },
  ];

  const studentPerformance = [
    { name: 'Alex Johnson', grade: 'A+', attendance: 95, assignments: 8 },
    { name: 'Sarah Wilson', grade: 'A', attendance: 92, assignments: 7 },
    { name: 'Mike Chen', grade: 'B+', attendance: 88, assignments: 6 },
    { name: 'Emma Davis', grade: 'A-', attendance: 90, assignments: 8 },
  ];

  const calendarEvents = [
    { date: 25, title: 'Physics Midterm', type: 'exam' as const, color: 'red' as const },
    { date: 28, title: 'Faculty Meeting', type: 'event' as const, color: 'blue' as const },
    { date: 30, title: 'Grade Submission', type: 'assignment' as const, color: 'orange' as const },
  ];

  const classColumns = [
    { key: 'time', label: 'Time', sortable: true },
    { key: 'subject', label: 'Subject', sortable: true },
    { key: 'room', label: 'Room', sortable: true },
    { 
      key: 'students', 
      label: 'Students', 
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <span>{value}</span>
          {value > 0 && (
            <StatusBadge status="active" size="sm">
              Active
            </StatusBadge>
          )}
        </div>
      )
    },
  ];

  const performanceColumns = [
    { key: 'name', label: 'Student Name', sortable: true },
    { key: 'grade', label: 'Grade', sortable: true },
    { 
      key: 'attendance', 
      label: 'Attendance %', 
      sortable: true,
      render: (value: number, row: any, rowIndex: number) => (
        <div className="flex items-center gap-2">
          <ProgressRing percentage={value} size={30} strokeWidth={3} color={value >= 90 ? 'green' : value >= 80 ? 'blue' : 'orange'} showPercentage={false} id={`performance-${rowIndex}`} />
          <span>{value}%</span>
        </div>
      )
    },
    { key: 'assignments', label: 'Assignments', sortable: true },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="glass-card p-6 bg-gradient-to-r from-accent-blue/10 to-accent-green/10 border-accent-blue/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Good morning, Dr. Smith!</h1>
            <p className="text-text-secondary">Here's your teaching overview for today</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status="active" size="lg">
              Physics Department
            </StatusBadge>
            <div className="text-right">
              <p className="text-sm text-text-secondary">Employee ID</p>
              <p className="font-semibold text-text-primary">EMP-2023-045</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={FaChalkboardTeacher} 
          label="Classes Today" 
          value="4" 
          color="blue" 
        />
        <StatCard 
          icon={FaUsers} 
          label="Total Students" 
          value="75" 
          color="green" 
        />
        <StatCard 
          icon={FaBookOpen} 
          label="Subjects" 
          value="3" 
          color="purple" 
        />
        <StatCard 
          icon={FaChartBar} 
          label="Avg. Grade" 
          value="B+" 
          color="orange" 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <Card variant="strong" glow="blue">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">Today's Schedule</h2>
              <div className="flex items-center gap-2">
                <StatusBadge status="active" size="sm">
                  Live
                </StatusBadge>
                <button className="glass-button px-4 py-2 text-sm">
                  View All
                </button>
              </div>
            </div>
            <DataTable
              data={classSchedule}
              columns={classColumns}
              searchable={false}
              filterable={false}
              pagination={false}
            />
          </Card>

          {/* Student Performance */}
          <Card variant="gradient">
            <h2 className="text-xl font-bold text-text-primary mb-6">Top Performing Students</h2>
            <DataTable
              data={studentPerformance}
              columns={performanceColumns}
              searchable={true}
              filterable={true}
              pagination={true}
              pageSize={4}
            />
          </Card>

          {/* Class Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Attendance Rate</h3>
                <ProgressRing
                  percentage={87}
                  size={100}
                  strokeWidth={8}
                  color="green"
                  label="This Month"
                  id="teacher-attendance"
                />
              </div>
            </Card>
            
            <Card variant="default">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Assignment Completion</h3>
                <ProgressRing
                  percentage={92}
                  size={100}
                  strokeWidth={8}
                  color="blue"
                  label="This Semester"
                  id="teacher-assignments"
                />
              </div>
            </Card>
            
            <Card variant="default">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Student Satisfaction</h3>
                <ProgressRing
                  percentage={94}
                  size={100}
                  strokeWidth={8}
                  color="purple"
                  label="Recent Survey"
                  id="teacher-satisfaction"
                />
              </div>
            </Card>
          </div>
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
                2 New
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
                <FaClipboardList className="text-2xl text-accent-blue mx-auto mb-2" />
                <p className="text-sm font-medium">Take Attendance</p>
              </button>
              <button className="glass-button p-4 text-center hover:scale-105 transition-all duration-200">
                <FaBookOpen className="text-2xl text-accent-green mx-auto mb-2" />
                <p className="text-sm font-medium">Grade Assignments</p>
              </button>
              <button className="glass-button p-4 text-center hover:scale-105 transition-all duration-200">
                <FaCalendarCheck className="text-2xl text-accent-purple mx-auto mb-2" />
                <p className="text-sm font-medium">Schedule Class</p>
              </button>
              <button className="glass-button p-4 text-center hover:scale-105 transition-all duration-200">
                <FaChartBar className="text-2xl text-orange-500 mx-auto mb-2" />
                <p className="text-sm font-medium">View Reports</p>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
