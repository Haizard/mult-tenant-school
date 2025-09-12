'use client';

import { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaUserShield, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import { userService, User, UserFilters } from '../../lib/userService';
import { notificationService } from '../../lib/notifications';
import { errorHandler } from '../../lib/errorHandler';

// Sample user data - replace with API calls
const sampleUsers = [
  {
    id: '1',
    email: 'admin@schoolsystem.com',
    firstName: 'Super',
    lastName: 'Admin',
    phone: '+255 123 456 789',
    address: 'Dar es Salaam, Tanzania',
    status: 'ACTIVE',
    lastLogin: '2024-01-15T09:30:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    tenant: { name: 'Default School' },
    roles: [{ name: 'Super Admin', description: 'System administrator' }]
  },
  {
    id: '2',
    email: 'teacher1@schoolsystem.com',
    firstName: 'John',
    lastName: 'Smith',
    phone: '+255 234 567 890',
    address: 'Arusha, Tanzania',
    status: 'ACTIVE',
    lastLogin: '2024-01-15T08:15:00Z',
    createdAt: '2023-02-15T00:00:00Z',
    tenant: { name: 'Default School' },
    roles: [{ name: 'Teacher', description: 'Academic staff' }]
  },
  {
    id: '3',
    email: 'student1@schoolsystem.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '+255 345 678 901',
    address: 'Mwanza, Tanzania',
    status: 'ACTIVE',
    lastLogin: '2024-01-14T16:45:00Z',
    createdAt: '2023-03-01T00:00:00Z',
    tenant: { name: 'Default School' },
    roles: [{ name: 'Student', description: 'Student access' }]
  },
  {
    id: '4',
    email: 'teacher2@schoolsystem.com',
    firstName: 'Michael',
    lastName: 'Brown',
    phone: '+255 456 789 012',
    address: 'Dodoma, Tanzania',
    status: 'INACTIVE',
    lastLogin: '2024-01-10T14:20:00Z',
    createdAt: '2023-04-15T00:00:00Z',
    tenant: { name: 'Default School' },
    roles: [{ name: 'Teacher', description: 'Academic staff' }]
  }
];

const getRoleIcon = (roleName: string) => {
  switch (roleName) {
    case 'Super Admin':
    case 'Tenant Admin':
      return <FaUserShield className="text-purple-500" />;
    case 'Teacher':
      return <FaChalkboardTeacher className="text-blue-500" />;
    case 'Student':
      return <FaUserGraduate className="text-green-500" />;
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
    case 'SUSPENDED':
      return 'danger';
    case 'PENDING':
      return 'info';
    default:
      return 'default';
  }
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Load users from API
  const loadUsers = async (filters: UserFilters = {}) => {
    setIsLoading(true);
    try {
      const response = await userService.getUsers({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (response.success && response.data) {
        setUsers(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        throw new Error(response.message || 'Failed to load users');
      }
    } catch (error) {
      errorHandler.handleApiError(error, 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, [pagination.page, pagination.limit]);

  // Handle search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers({
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
      });
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, roleFilter]);

  // Filter users based on search and filters (client-side filtering for immediate feedback)
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.roles.some(role => role.name === roleFilter);
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleCreateUser = () => {
    // Navigate to create user page
    window.location.href = '/users/create';
  };

  const handleEditUser = (userId: string) => {
    // Navigate to edit user page
    window.location.href = `/users/${userId}/edit`;
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const toastId = notificationService.loading('Deleting user...');
      
      try {
        await userService.deleteUser(userId);
        notificationService.updateToSuccess(toastId, 'User deleted successfully');
        loadUsers(); // Reload users list
      } catch (error) {
        notificationService.updateToError(toastId, 'Failed to delete user');
        errorHandler.handleApiError(error, 'Failed to delete user');
      }
    }
  };

  const handleViewUser = (userId: string) => {
    // Navigate to user profile page
    window.location.href = `/users/${userId}`;
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      sortable: true,
      render: (value: any, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-purple-light rounded-full flex items-center justify-center text-white font-semibold">
            {row.firstName[0]}{row.lastName[0]}
          </div>
          <div>
            <p className="font-semibold text-text-primary">{row.firstName} {row.lastName}</p>
            <p className="text-sm text-text-secondary">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'roles',
      label: 'Role',
      sortable: true,
      render: (value: any, row: any) => (
        <div className="flex items-center gap-2">
          {getRoleIcon(row.roles[0]?.name)}
          <span className="text-sm font-medium text-text-primary">{row.roles[0]?.name}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <StatusBadge status={getStatusColor(value) as any} size="sm">
          {value}
        </StatusBadge>
      )
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-text-secondary">{formatDate(value)}</span>
      )
    },
    {
      key: 'tenant',
      label: 'Tenant',
      sortable: true,
      render: (value: any) => (
        <span className="text-sm text-text-primary">{value.name}</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value: any, row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewUser(row.id)}
            className="glass-button p-2 hover:bg-accent-blue/10 hover:text-accent-blue transition-colors"
            title="View User"
          >
            <FaEye className="text-sm" />
          </button>
          <button
            onClick={() => handleEditUser(row.id)}
            className="glass-button p-2 hover:bg-accent-green/10 hover:text-accent-green transition-colors"
            title="Edit User"
          >
            <FaEdit className="text-sm" />
          </button>
          <button
            onClick={() => handleDeleteUser(row.id)}
            className="glass-button p-2 hover:bg-red-500/10 hover:text-red-500 transition-colors"
            title="Delete User"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">User Management</h1>
            <p className="text-text-secondary">Manage user accounts, roles, and permissions</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status="success" size="lg">
              {users.filter(u => u.status === 'ACTIVE').length} Active Users
            </StatusBadge>
            <Button variant="primary" size="md" onClick={handleCreateUser}>
              <FaPlus className="mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-accent-purple to-accent-purple-light rounded-xl">
              <FaUsers className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Users</p>
              <p className="text-2xl font-bold text-text-primary">{users.length}</p>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-accent-green to-accent-green-light rounded-xl">
              <FaUserGraduate className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Students</p>
              <p className="text-2xl font-bold text-text-primary">
                {users.filter(u => u.roles.some(r => r.name === 'Student')).length}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-xl">
              <FaChalkboardTeacher className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Teachers</p>
              <p className="text-2xl font-bold text-text-primary">
                {users.filter(u => u.roles.some(r => r.name === 'Teacher')).length}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl">
              <FaUserShield className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Admins</p>
              <p className="text-2xl font-bold text-text-primary">
                {users.filter(u => u.roles.some(r => r.name.includes('Admin'))).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card variant="strong" glow="purple">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input pl-10 pr-4 py-2 w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input px-4 py-2"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING">Pending</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="glass-input px-4 py-2"
            >
              <option value="all">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Tenant Admin">Tenant Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <FaFilter className="text-text-muted" />
            <span className="text-sm text-text-secondary">
              {filteredUsers.length} of {users.length} users
            </span>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card variant="strong" glow="purple">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Users List</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Showing</span>
            <select className="glass-input px-3 py-1 text-sm">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-sm text-text-secondary">per page</span>
          </div>
        </div>

        <DataTable
          data={filteredUsers}
          columns={columns}
          searchable={false} // We have our own search
          filterable={false} // We have our own filters
          pagination={true}
          pageSize={10}
          loading={isLoading}
        />
      </Card>
    </div>
  );
}
