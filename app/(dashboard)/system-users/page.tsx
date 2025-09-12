'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import RoleGuard from '../../components/RoleGuard';
import { FaPlus, FaEye, FaEdit, FaTrash, FaUserShield, FaBuilding, FaUsers } from 'react-icons/fa';
import { useAuditLog } from '../../hooks/useAuditLog';
import { apiService } from '../../lib/api';

interface SystemUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  lastLogin?: string;
  tenant: {
    id: string;
    name: string;
    domain: string;
  };
  roles: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  createdAt: string;
}

const SystemUsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const auditLog = useAuditLog();

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Ensure API service has the current token
      const token = localStorage.getItem('auth_token');
      if (token) {
        apiService.setToken(token);
      }
      
      const response = await apiService.get('/users/system');
      
      if (response.success) {
        setUsers(response.data?.users || []);
      } else {
        console.error('Failed to load system users:', response.message);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading system users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await auditLog.logAction('USER_DELETED', 'user', userId, {
          userName: userName,
          deletedBy: user?.email
        });
        
        // Reload users
        await loadUsers();
        alert('User deleted successfully');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleUpdateUserStatus = async (userId: string, currentStatus: string, userName: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await auditLog.logAction('USER_STATUS_UPDATED', 'user', userId, {
          userName: userName,
          oldStatus: currentStatus,
          newStatus: newStatus,
          updatedBy: user?.email
        });
        
        // Reload users
        await loadUsers();
        alert(`User status updated to ${newStatus}`);
      } else {
        const errorData = await response.json();
        alert(`Failed to update user status: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  // Filter users based on search term, status, and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.tenant.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.roles.some(role => role.name === roleFilter);
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (row: SystemUser) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <FaUserShield className="text-blue-600 text-sm" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.firstName} {row.lastName}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'tenant',
      label: 'Tenant',
      render: (row: SystemUser) => (
        <div className="flex items-center space-x-2">
          <FaBuilding className="text-gray-400 text-sm" />
          <div>
            <div className="font-medium text-gray-900">{row.tenant.name}</div>
            <div className="text-sm text-gray-500">{row.tenant.domain}</div>
          </div>
        </div>
      )
    },
    {
      key: 'roles',
      label: 'Roles',
      render: (row: SystemUser) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.map(role => (
            <span
              key={role.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {role.name}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: SystemUser) => (
        <StatusBadge status={row.status}>
          {row.status}
        </StatusBadge>
      )
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (row: SystemUser) => (
        <span className="text-sm text-gray-500">
          {row.lastLogin ? new Date(row.lastLogin).toLocaleDateString() : 'Never'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: SystemUser) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/users/${row.id}`}
            className="flex items-center space-x-1"
          >
            <FaEye className="text-xs" />
            <span>View</span>
          </Button>
          {row.roles.some(role => role.name === 'Super Admin') ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = `/users/${row.id}/edit`}
                className="flex items-center space-x-1"
              >
                <FaEdit className="text-xs" />
                <span>Edit</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateUserStatus(row.id, row.status, `${row.firstName} ${row.lastName}`)}
                className={`flex items-center space-x-1 ${
                  row.status === 'ACTIVE' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'
                }`}
              >
                <span>{row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteUser(row.id, `${row.firstName} ${row.lastName}`)}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
              >
                <FaTrash className="text-xs" />
                <span>Delete</span>
              </Button>
            </>
          ) : (
            <span className="text-sm text-gray-500 italic">
              Managed by {row.tenant.name}
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <RoleGuard allowedRoles={['Super Admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Users</h1>
            <p className="text-gray-600 mt-1">Monitor all users across all tenants</p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => window.location.href = '/tenants'}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <FaBuilding className="text-sm" />
              <span>Manage Tenants</span>
            </Button>
            <Button
              onClick={() => window.location.href = '/users/create?role=Super Admin'}
              className="flex items-center space-x-2"
            >
              <FaPlus className="text-sm" />
              <span>Add Super Admin</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaUserShield className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaBuilding className="text-orange-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tenants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(users.map(u => u.tenant.id)).size}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaUserShield className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Super Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.roles.some(r => r.name === 'Super Admin')).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Tenant Admin">Tenant Admin</option>
                <option value="Teacher">Teacher</option>
                <option value="Student">Student</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setRoleFilter('all');
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Information Card */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaUserShield className="text-blue-600 text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">User Management Hierarchy</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Super Admin:</strong> Creates and manages tenants (schools) and other Super Admins</p>
                <p><strong>Tenant Admin:</strong> Creates teachers, students, and other users within their school</p>
                <p><strong>This page:</strong> Monitor all users across the system for oversight purposes</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              All System Users ({filteredUsers.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              View and monitor users across all tenants. For user creation, use tenant-specific management.
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <DataTable
              data={filteredUsers}
              columns={columns}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          )}
        </Card>
      </div>
    </RoleGuard>
  );
};

export default SystemUsersPage;
