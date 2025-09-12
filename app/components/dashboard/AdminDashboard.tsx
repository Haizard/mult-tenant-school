import React from 'react';
import { FaUsers, FaChalkboardTeacher, FaBook, FaChartLine, FaCalendarAlt, FaCog, FaBell, FaUserShield, FaBookOpen } from 'react-icons/fa';
import Card from '../ui/Card';
import StatCard from '../ui/StatCard';
import ProgressRing from '../ui/ProgressRing';
import StatusBadge from '../ui/StatusBadge';
import NotificationCard from '../ui/NotificationCard';
import CalendarWidget from '../ui/CalendarWidget';
import DataTable from '../ui/DataTable';

const AdminDashboard = () => {
  // Sample data
  const notifications = [
    {
      type: 'warning' as const,
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 11 PM to 2 AM',
      timestamp: '2 hours ago',
      author: 'IT Department',
      unread: true,
    },
    {
      type: 'info' as const,
      title: 'New Teacher Application',
      message: 'Dr. Sarah Johnson has submitted an application for Physics position',
      timestamp: '4 hours ago',
      author: 'HR Department',
      unread: true,
    },
    {
      type: 'success' as const,
      title: 'Fee Collection Complete',
      message: 'Monthly fee collection has been completed successfully',
      timestamp: '1 day ago',
      author: 'Finance Department',
      unread: false,
    },
  ];

  const recentActivities = [
    { action: 'Student Enrolled', user: 'Alex Johnson', time: '2 hours ago', status: 'completed' },
    { action: 'Grade Submitted', user: 'Dr. Smith', time: '3 hours ago', status: 'completed' },
    { action: 'Fee Payment', user: 'Sarah Wilson', time: '5 hours ago', status: 'completed' },
    { action: 'Library Book Returned', user: 'Mike Chen', time: '6 hours ago', status: 'completed' },
  ];

  const systemStats = [
    { metric: 'Server Uptime', value: '99.9%', color: 'green' as const },
    { metric: 'Database Usage', value: '78%', color: 'blue' as const },
    { metric: 'Storage Used', value: '65%', color: 'orange' as const },
    { metric: 'Active Users', value: '156', color: 'purple' as const },
  ];

  const calendarEvents = [
    { date: 25, title: 'Board Meeting', type: 'event' as const, color: 'purple' as const },
    { date: 28, title: 'System Update', type: 'event' as const, color: 'blue' as const },
    { date: 30, title: 'Monthly Report Due', type: 'assignment' as const, color: 'orange' as const },
  ];

  const activityColumns = [
    { key: 'action', label: 'Action', sortable: true },
    { key: 'user', label: 'User', sortable: true },
    { key: 'time', label: 'Time', sortable: true },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (value: string) => (
        <StatusBadge status={value as any} size="sm">
          {value}
        </StatusBadge>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-green/10 border-accent-purple/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome, Administrator!</h1>
            <p className="text-text-secondary">School management system overview and analytics</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status="active" size="lg">
              Super Admin
            </StatusBadge>
            <div className="text-right">
              <p className="text-sm text-text-secondary">Last Login</p>
              <p className="font-semibold text-text-primary">Today, 9:30 AM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={FaUsers} 
          label="Total Students" 
          value="1,250" 
          color="purple" 
        />
        <StatCard 
          icon={FaChalkboardTeacher} 
          label="Total Teachers" 
          value="85" 
          color="blue" 
        />
        <StatCard 
          icon={FaBook} 
          label="Active Courses" 
          value="45" 
          color="green" 
        />
        <StatCard 
          icon={FaChartLine} 
          label="System Health" 
          value="99.9%" 
          color="orange" 
        />
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => (
          <Card key={index} variant="default">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-text-primary mb-4">{stat.metric}</h3>
              <ProgressRing
                percentage={stat.metric === 'Active Users' ? 100 : parseInt(stat.value)}
                size={80}
                strokeWidth={6}
                color={stat.color}
                label={stat.value}
                id={`admin-${stat.metric.toLowerCase().replace(/\s+/g, '-')}`}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activities */}
          <Card variant="strong" glow="purple">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">Recent Activities</h2>
              <button className="glass-button px-4 py-2 text-sm">
                View All Logs
              </button>
            </div>
            <DataTable
              data={recentActivities}
              columns={activityColumns}
              searchable={true}
              filterable={true}
              pagination={true}
              pageSize={5}
            />
          </Card>

          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="gradient">
              <h3 className="text-lg font-bold text-text-primary mb-4">Student Enrollment Trend</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">This Month</span>
                  <span className="font-semibold text-text-primary">+45</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Last Month</span>
                  <span className="font-semibold text-text-primary">+38</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Growth Rate</span>
                  <span className="font-semibold text-accent-green">+18.4%</span>
                </div>
              </div>
            </Card>

            <Card variant="gradient">
              <h3 className="text-lg font-bold text-text-primary mb-4">Financial Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Revenue</span>
                  <span className="font-semibold text-accent-green">$125,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Expenses</span>
                  <span className="font-semibold text-status-danger">$98,500</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Profit</span>
                  <span className="font-semibold text-accent-purple">$26,500</span>
                </div>
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
              <h2 className="text-xl font-bold text-text-primary">System Alerts</h2>
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
              <a href="/users" className="glass-button p-4 text-center hover:scale-105 transition-all duration-200 block">
                <FaUsers className="text-2xl text-accent-purple mx-auto mb-2" />
                <p className="text-sm font-medium">Manage Users</p>
              </a>
              <a href="/academic/courses" className="glass-button p-4 text-center hover:scale-105 transition-all duration-200 block">
                <FaBook className="text-2xl text-accent-blue mx-auto mb-2" />
                <p className="text-sm font-medium">Manage Courses</p>
              </a>
              <a href="/academic/subjects" className="glass-button p-4 text-center hover:scale-105 transition-all duration-200 block">
                <FaBookOpen className="text-2xl text-accent-green mx-auto mb-2" />
                <p className="text-sm font-medium">Manage Subjects</p>
              </a>
              <button className="glass-button p-4 text-center hover:scale-105 transition-all duration-200">
                <FaUserShield className="text-2xl text-orange-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Security</p>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
