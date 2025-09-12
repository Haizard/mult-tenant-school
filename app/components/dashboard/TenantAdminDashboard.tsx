import React, { useState, useEffect } from 'react';
import { FaUsers, FaChalkboardTeacher, FaUserGraduate, FaBook, FaChartLine, FaCalendarAlt, FaCog, FaBell, FaUserShield, FaBookOpen, FaPlus } from 'react-icons/fa';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import DataTable from '../ui/DataTable';
import { useAuth } from '../../contexts/AuthContext';

interface SchoolUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  lastLogin: string;
  department?: string;
  grade?: string;
}

const TenantAdminDashboard = () => {
  const { user } = useAuth();
  const [schoolUsers, setSchoolUsers] = useState<SchoolUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sample school user data - replace with API calls
  const sampleUsers: SchoolUser[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@school.edu',
      role: 'Teacher',
      status: 'ACTIVE',
      lastLogin: '2024-01-20',
      department: 'Mathematics'
    },
    {
      id: '2',
      name: 'John Smith',
      email: 'john.smith@school.edu',
      role: 'Teacher',
      status: 'ACTIVE',
      lastLogin: '2024-01-19',
      department: 'Science'
    },
    {
      id: '3',
      name: 'Alice Brown',
      email: 'alice.brown@school.edu',
      role: 'Student',
      status: 'ACTIVE',
      lastLogin: '2024-01-20',
      grade: 'Grade 12'
    },
    {
      id: '4',
      name: 'Mike Wilson',
      email: 'mike.wilson@school.edu',
      role: 'Student',
      status: 'PENDING',
      lastLogin: '2024-01-18',
      grade: 'Grade 11'
    },
    {
      id: '5',
      name: 'Lisa Davis',
      email: 'lisa.davis@school.edu',
      role: 'Staff',
      status: 'ACTIVE',
      lastLogin: '2024-01-20',
      department: 'Administration'
    }
  ];

  useEffect(() => {
    setSchoolUsers(sampleUsers);
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Teacher':
        return <FaChalkboardTeacher className="text-blue-500" />;
      case 'Student':
        return <FaUserGraduate className="text-green-500" />;
      case 'Staff':
        return <FaUsers className="text-purple-500" />;
      default:
        return <FaUsers className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'PENDING':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleCreateUser = () => {
    console.log('Create new user');
  };

  const handleEditUser = (userId: string) => {
    console.log('Edit user:', userId);
  };

  const schoolStats = [
    { 
      title: 'Total Students', 
      value: schoolUsers.filter(u => u.role === 'Student').length.toString(), 
      icon: FaUserGraduate, 
      color: 'green',
      change: '+12 this month'
    },
    { 
      title: 'Teachers', 
      value: schoolUsers.filter(u => u.role === 'Teacher').length.toString(), 
      icon: FaChalkboardTeacher, 
      color: 'blue',
      change: '+2 this month'
    },
    { 
      title: 'Active Users', 
      value: schoolUsers.filter(u => u.status === 'ACTIVE').length.toString(), 
      icon: FaUsers, 
      color: 'purple',
      change: '98% active rate'
    },
    { 
      title: 'Pending Approvals', 
      value: schoolUsers.filter(u => u.status === 'PENDING').length.toString(), 
      icon: FaBell, 
      color: 'yellow',
      change: '3 awaiting review'
    }
  ];

  const userColumns = [
    {
      key: 'name',
      label: 'User',
      render: (user: SchoolUser) => (
        <div className="flex items-center">
          {getRoleIcon(user.role)}
          <div className="ml-3">
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (user: SchoolUser) => (
        <div>
          <div className="font-medium text-gray-900">{user.role}</div>
          {user.department && (
            <div className="text-sm text-gray-500">{user.department}</div>
          )}
          {user.grade && (
            <div className="text-sm text-gray-500">{user.grade}</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (user: SchoolUser) => (
        <StatusBadge status={getStatusColor(user.status) as any}>
          {user.status}
        </StatusBadge>
      )
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (user: SchoolUser) => (
        <div className="text-sm text-gray-600">
          {new Date(user.lastLogin).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: SchoolUser) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditUser(user.id)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </Button>
          {user.status === 'PENDING' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditUser(user.id)}
              className="text-green-600 hover:text-green-800"
            >
              Approve
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">School Administration</h1>
          <p className="text-gray-600 mt-1">Manage your school's users and academic programs</p>
        </div>
        <Button 
          onClick={() => window.location.href = '/users/create'} 
          className="flex items-center"
        >
          <FaPlus className="mr-2" />
          Add New User
        </Button>
      </div>

      {/* School Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {schoolStats.map((stat, index) => (
          <Card key={index} variant="gradient" glow="blue">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`text-2xl text-${stat.color}-600`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="secondary" 
            className="flex flex-col items-center p-4 h-auto"
            onClick={() => window.location.href = '/users'}
          >
            <FaUsers className="text-2xl mb-2 text-blue-600" />
            <span className="text-sm">User Management</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex flex-col items-center p-4 h-auto"
            onClick={() => window.location.href = '/academic'}
          >
            <FaBook className="text-2xl mb-2 text-green-600" />
            <span className="text-sm">Academic Programs</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex flex-col items-center p-4 h-auto"
            onClick={() => window.location.href = '/schedule'}
          >
            <FaCalendarAlt className="text-2xl mb-2 text-purple-600" />
            <span className="text-sm">Schedule Management</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex flex-col items-center p-4 h-auto"
            onClick={() => window.location.href = '/reports'}
          >
            <FaChartLine className="text-2xl mb-2 text-orange-600" />
            <span className="text-sm">Reports & Analytics</span>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <Button variant="ghost" size="sm">
            <FaBell className="mr-1" />
            View All
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New student enrolled: Alice Brown</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Teacher Dr. Sarah Johnson submitted grades</p>
              <p className="text-xs text-gray-500">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New teacher application pending approval</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </Card>

      {/* School Users Management */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">School Users</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <FaChartLine className="mr-1" />
              Analytics
            </Button>
            <Button variant="ghost" size="sm">
              <FaCog className="mr-1" />
              Settings
            </Button>
          </div>
        </div>
        <DataTable
          data={schoolUsers}
          columns={userColumns}
          searchable={true}
          sortable={true}
          pagination={true}
        />
      </Card>

      {/* Academic Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Programs</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mathematics</span>
              <StatusBadge status="success">Active</StatusBadge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Science</span>
              <StatusBadge status="success">Active</StatusBadge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">English</span>
              <StatusBadge status="success">Active</StatusBadge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Social Studies</span>
              <StatusBadge status="warning">Pending Review</StatusBadge>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Student Portal</span>
              <StatusBadge status="success">Online</StatusBadge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Teacher Portal</span>
              <StatusBadge status="success">Online</StatusBadge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Parent Portal</span>
              <StatusBadge status="success">Online</StatusBadge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Gradebook</span>
              <StatusBadge status="success">Synchronized</StatusBadge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TenantAdminDashboard;
