import React, { useState, useEffect } from 'react';
import { FaBuilding, FaUsers, FaPlus, FaEye, FaEdit, FaTrash, FaShieldAlt, FaChartBar, FaCog, FaBell } from 'react-icons/fa';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import DataTable from '../ui/DataTable';
import { useAuth } from '../../contexts/AuthContext';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  adminEmail: string;
  adminName: string;
  createdAt: string;
  userCount: number;
  subscriptionPlan: string;
  lastActivity: string;
}

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateTenant, setShowCreateTenant] = useState(false);

  // Sample tenant data - replace with API calls
  const sampleTenants: Tenant[] = [
    {
      id: '1',
      name: 'St. Mary\'s Secondary School',
      domain: 'stmarys.schooli.com',
      status: 'ACTIVE',
      adminEmail: 'admin@stmarys.edu',
      adminName: 'John Smith',
      createdAt: '2024-01-15',
      userCount: 1250,
      subscriptionPlan: 'Premium',
      lastActivity: '2024-01-20'
    },
    {
      id: '2',
      name: 'Kilimanjaro International School',
      domain: 'kis.schooli.com',
      status: 'ACTIVE',
      adminEmail: 'admin@kis.edu',
      adminName: 'Sarah Johnson',
      createdAt: '2024-01-10',
      userCount: 890,
      subscriptionPlan: 'Standard',
      lastActivity: '2024-01-19'
    },
    {
      id: '3',
      name: 'Dar es Salaam Academy',
      domain: 'da.schooli.com',
      status: 'INACTIVE',
      adminEmail: 'admin@da.edu',
      adminName: 'Michael Brown',
      createdAt: '2024-01-05',
      userCount: 0,
      subscriptionPlan: 'Trial',
      lastActivity: '2024-01-18'
    }
  ];

  useEffect(() => {
    // Load tenants data
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setTenants(sampleTenants);
      setIsLoading(false);
    }, 100);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'SUSPENDED':
        return 'danger';
      default:
        return 'default';
    }
  };

  const handleCreateTenant = () => {
    setShowCreateTenant(true);
  };

  const handleEditTenant = (tenantId: string) => {
    console.log('Edit tenant:', tenantId);
  };

  const handleSuspendTenant = (tenantId: string) => {
    console.log('Suspend tenant:', tenantId);
  };

  const handleDeleteTenant = (tenantId: string) => {
    console.log('Delete tenant:', tenantId);
  };

  const systemStats = [
    { 
      title: 'Total Tenants', 
      value: tenants.length.toString(), 
      icon: FaBuilding, 
      color: 'blue',
      change: '+2 this month'
    },
    { 
      title: 'Active Tenants', 
      value: tenants.filter(t => t.status === 'ACTIVE').length.toString(), 
      icon: FaShieldAlt, 
      color: 'green',
      change: '+1 this week'
    },
    { 
      title: 'Total Users', 
      value: tenants.reduce((sum, t) => sum + t.userCount, 0).toString(), 
      icon: FaUsers, 
      color: 'purple',
      change: '+156 this month'
    },
    { 
      title: 'System Health', 
      value: '99.9%', 
      icon: FaChartBar, 
      color: 'green',
      change: 'All systems operational'
    }
  ];

  const tenantColumns = [
    {
      key: 'name',
      label: 'School Name',
      render: (tenant: Tenant) => (
        tenant ? (
          <div className="flex items-center">
            <FaBuilding className="text-blue-500 mr-2" />
            <div>
              <div className="font-medium text-gray-900">{tenant.name}</div>
              <div className="text-sm text-gray-500">{tenant.domain}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <FaBuilding className="text-gray-300 mr-2" />
            <div>
              <div className="font-medium text-gray-400">Loading...</div>
              <div className="text-sm text-gray-300">Loading...</div>
            </div>
          </div>
        )
      )
    },
    {
      key: 'adminName',
      label: 'Admin',
      render: (tenant: Tenant) => (
        tenant ? (
          <div>
            <div className="font-medium text-gray-900">{tenant.adminName}</div>
            <div className="text-sm text-gray-500">{tenant.adminEmail}</div>
          </div>
        ) : (
          <div>
            <div className="font-medium text-gray-400">Loading...</div>
            <div className="text-sm text-gray-300">Loading...</div>
          </div>
        )
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (tenant: Tenant) => (
        tenant ? (
          <StatusBadge status={getStatusColor(tenant.status) as any}>
            {tenant.status}
          </StatusBadge>
        ) : (
          <StatusBadge status="default">Loading...</StatusBadge>
        )
      )
    },
    {
      key: 'userCount',
      label: 'Users',
      render: (tenant: Tenant) => (
        tenant ? (
          <div className="text-center">
            <div className="font-medium text-gray-900">{tenant.userCount}</div>
            <div className="text-sm text-gray-500">{tenant.subscriptionPlan}</div>
          </div>
        ) : (
          <div className="text-center">
            <div className="font-medium text-gray-400">Loading...</div>
            <div className="text-sm text-gray-300">Loading...</div>
          </div>
        )
      )
    },
    {
      key: 'lastActivity',
      label: 'Last Activity',
      render: (tenant: Tenant) => (
        tenant ? (
          <div className="text-sm text-gray-600">
            {new Date(tenant.lastActivity).toLocaleDateString()}
          </div>
        ) : (
          <div className="text-sm text-gray-400">Loading...</div>
        )
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (tenant: Tenant) => (
        tenant ? (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditTenant(tenant.id)}
              className="text-blue-600 hover:text-blue-800"
            >
              <FaEye className="mr-1" />
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditTenant(tenant.id)}
              className="text-green-600 hover:text-green-800"
            >
              <FaEdit className="mr-1" />
              Edit
            </Button>
            {tenant.status === 'ACTIVE' ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSuspendTenant(tenant.id)}
                className="text-yellow-600 hover:text-yellow-800"
              >
                Suspend
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditTenant(tenant.id)}
                className="text-green-600 hover:text-green-800"
              >
                Activate
              </Button>
            )}
          </div>
        ) : (
          <div className="flex space-x-2">
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        )
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage tenants and system-wide settings</p>
        </div>
        <Button onClick={handleCreateTenant} className="flex items-center">
          <FaPlus className="mr-2" />
          Create New Tenant
        </Button>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => (
          <Card key={index} className="glass-card p-6 border-accent-purple/50">
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

      {/* Recent Activity */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent System Activity</h2>
          <Button variant="ghost" size="sm">
            <FaBell className="mr-1" />
            View All
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New tenant created: St. Mary's Secondary School</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">System backup completed successfully</p>
              <p className="text-xs text-gray-500">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Tenant "Dar es Salaam Academy" subscription expired</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tenants Management */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Tenants Management</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <FaChartBar className="mr-1" />
              Analytics
            </Button>
            <Button variant="ghost" size="sm">
              <FaCog className="mr-1" />
              Settings
            </Button>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading tenants...</div>
          </div>
        ) : (
          <DataTable
            data={tenants}
            columns={tenantColumns}
            searchable={true}
            sortable={true}
            pagination={true}
          />
        )}
      </Card>

      {/* System Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Database</span>
              <StatusBadge status="success">Healthy</StatusBadge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">API Services</span>
              <StatusBadge status="success">Operational</StatusBadge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">File Storage</span>
              <StatusBadge status="warning">78% Used</StatusBadge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Email Service</span>
              <StatusBadge status="success">Active</StatusBadge>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="secondary" className="w-full justify-start">
              <FaShieldAlt className="mr-2" />
              System Security Audit
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              <FaChartBar className="mr-2" />
              Generate System Report
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              <FaCog className="mr-2" />
              System Configuration
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              <FaUsers className="mr-2" />
              User Management
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
