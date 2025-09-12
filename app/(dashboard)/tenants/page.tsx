'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaBuilding, FaPlus, FaEye, FaEdit, FaTrash, FaUserShield, FaChartBar, FaCog, FaSearch, FaFilter } from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import RoleGuard from '../../components/RoleGuard';
import { useAuth } from '../../contexts/AuthContext';
import { useAuditLog } from '../../hooks/useAuditLog';
import { tenantService, Tenant } from '../../lib/tenantService';

const TenantsPage: React.FC = () => {
  const { user } = useAuth();
  const auditLog = useAuditLog();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Load tenants from service
  const loadTenants = useCallback(async () => {
    setIsLoading(true);
    try {
      const tenantsData = await tenantService.getTenants();
      setTenants(tenantsData);
    } catch (error) {
      console.error('Error loading tenants:', error);
      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'SUSPENDED':
        return 'danger';
      case 'TRIAL':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleCreateTenant = () => {
    auditLog.logAction('TENANT_CREATION_STARTED', 'tenant', undefined, { action: 'create_tenant_form_opened' });
    window.location.href = '/tenants/create';
  };

  const handleViewTenant = (tenantId: string) => {
    auditLog.logAction('TENANT_VIEW_STARTED', 'tenant', tenantId, { action: 'tenant_view_opened' });
    window.location.href = `/tenants/${tenantId}`;
  };

  const handleEditTenant = (tenantId: string) => {
    auditLog.logAction('TENANT_EDIT_STARTED', 'tenant', tenantId, { action: 'edit_tenant_form_opened' });
    window.location.href = `/tenants/${tenantId}`;
  };

  const handleSuspendTenant = async (tenantId: string) => {
    try {
      await tenantService.updateTenantStatus(tenantId, 'SUSPENDED');
      auditLog.logAction('TENANT_SUSPENDED', 'tenant', tenantId, { action: 'tenant_suspended' });
      // Reload tenants to reflect changes
      loadTenants();
    } catch (error) {
      auditLog.logAction('TENANT_SUSPEND_FAILED', 'tenant', tenantId, { action: 'tenant_suspend_failed' }, 'FAILURE', 'Failed to suspend tenant');
    }
  };

  const handleActivateTenant = async (tenantId: string) => {
    try {
      await tenantService.updateTenantStatus(tenantId, 'ACTIVE');
      auditLog.logAction('TENANT_ACTIVATED', 'tenant', tenantId, { action: 'tenant_activated' });
      // Reload tenants to reflect changes
      loadTenants();
    } catch (error) {
      auditLog.logAction('TENANT_ACTIVATE_FAILED', 'tenant', tenantId, { action: 'tenant_activate_failed' }, 'FAILURE', 'Failed to activate tenant');
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      try {
        await tenantService.deleteTenant(tenantId);
        auditLog.logAction('TENANT_DELETED', 'tenant', tenantId, { action: 'tenant_deleted' });
        // Reload tenants to reflect changes
        loadTenants();
      } catch (error) {
        auditLog.logAction('TENANT_DELETE_FAILED', 'tenant', tenantId, { action: 'tenant_delete_failed' }, 'FAILURE', 'Failed to delete tenant');
      }
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    if (!tenant) return false;
    const matchesSearch = tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.domain?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tenantColumns = [
    {
      key: 'name',
      label: 'School Name',
      render: (tenant: Tenant) => (
        tenant ? (
          <div className="flex items-center">
            <FaBuilding className="text-blue-500 mr-3" />
            <div>
              <div className="font-medium text-gray-900">{tenant.name}</div>
              <div className="text-sm text-gray-500">{tenant.domain}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <FaBuilding className="text-gray-300 mr-3" />
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
      key: 'subscription',
      label: 'Subscription',
      render: (tenant: Tenant) => (
        tenant ? (
          <div>
            <div className="font-medium text-gray-900">{tenant.subscriptionPlan}</div>
            <div className="text-sm text-gray-500">
              {tenant.userCount}/{tenant.maxUsers} users
            </div>
            {tenant.subscriptionExpiry && (
              <div className="text-xs text-gray-400">
                Expires: {new Date(tenant.subscriptionExpiry).toLocaleDateString()}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="font-medium text-gray-400">Loading...</div>
            <div className="text-sm text-gray-300">Loading...</div>
            <div className="text-xs text-gray-300">Loading...</div>
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
              onClick={() => handleViewTenant(tenant.id)}
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
                onClick={() => handleActivateTenant(tenant.id)}
                className="text-green-600 hover:text-green-800"
              >
                Activate
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteTenant(tenant.id)}
              className="text-red-600 hover:text-red-800"
            >
              <FaTrash className="mr-1" />
              Delete
            </Button>
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
    <RoleGuard allowedRoles={['Super Admin']}>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
            <p className="text-gray-600 mt-1">Manage schools and their subscriptions</p>
          </div>
          <Button onClick={handleCreateTenant} className="flex items-center">
            <FaPlus className="mr-2" />
            Create New Tenant
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card variant="gradient" glow="blue">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                <p className="text-3xl font-bold text-gray-900">{tenants.length}</p>
              </div>
              <FaBuilding className="text-2xl text-blue-600" />
            </div>
          </Card>
          <Card variant="gradient" glow="green">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tenants</p>
                <p className="text-3xl font-bold text-gray-900">
                  {tenants.filter(t => t.status === 'ACTIVE').length}
                </p>
              </div>
              <FaUserShield className="text-2xl text-green-600" />
            </div>
          </Card>
          <Card variant="gradient" glow="yellow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trial Tenants</p>
                <p className="text-3xl font-bold text-gray-900">
                  {tenants.filter(t => t.status === 'TRIAL').length}
                </p>
              </div>
              <FaChartBar className="text-2xl text-yellow-600" />
            </div>
          </Card>
          <Card variant="gradient" glow="purple">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {tenants.reduce((sum, t) => sum + t.userCount, 0)}
                </p>
              </div>
              <FaUserShield className="text-2xl text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="TRIAL">Trial</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
              <Button variant="secondary" className="flex items-center">
                <FaFilter className="mr-1" />
                More Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Tenants Table */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">All Tenants</h2>
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
              data={filteredTenants}
              columns={tenantColumns}
              searchable={false}
              sortable={true}
              pagination={true}
            />
          )}
        </Card>
    </div>
    </RoleGuard>
  );
};

export default TenantsPage;