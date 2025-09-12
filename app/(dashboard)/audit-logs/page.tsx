'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaEye, FaFilter, FaSearch, FaDownload, FaUser, FaCalendarAlt, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import RoleGuard from '../../components/RoleGuard';
import { useAuth } from '../../contexts/AuthContext';
import { useAuditLog } from '../../hooks/useAuditLog';
import { notificationService } from '../../lib/notifications';

interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRoles: string[];
  tenantId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  errorMessage?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SUCCESS':
      return 'success';
    case 'FAILURE':
      return 'danger';
    case 'PENDING':
      return 'warning';
    default:
      return 'default';
  }
};

const getActionIcon = (action: string) => {
  switch (action) {
    case 'LOGIN':
    case 'LOGOUT':
      return <FaUser className="text-blue-500" />;
    case 'CREATE':
      return <FaShieldAlt className="text-green-500" />;
    case 'UPDATE':
      return <FaShieldAlt className="text-yellow-500" />;
    case 'DELETE':
      return <FaShieldAlt className="text-red-500" />;
    case 'PERMISSION_DENIED':
      return <FaExclamationTriangle className="text-red-500" />;
    default:
      return <FaEye className="text-gray-500" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export default function AuditLogsPage() {
  const { user } = useAuth();
  const auditLog = useAuditLog();
  
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    action: 'all',
    resource: 'all',
    status: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0
  });

  // Load audit logs
  const loadAuditLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await auditLog.getAuditLogs({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (response.success && response.data) {
        setLogs(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setLogs([]);
        setPagination(prev => ({ ...prev, total: 0, pages: 0 }));
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      notificationService.error('Failed to load audit logs');
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, auditLog]);

  // Load logs on component mount and when filters change
  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  // Filter logs based on search
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.action.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.resource.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSearch;
  });

  const handleExportLogs = async () => {
    try {
      await auditLog.logDataExport('AUDIT_LOGS', filters, logs.length);
      notificationService.success('Audit logs exported successfully');
    } catch (error) {
      notificationService.error('Failed to export audit logs');
    }
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      sortable: true,
      render: (value: any, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-purple-light rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {row.userName.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <p className="font-semibold text-text-primary text-sm">{row.userName}</p>
            <p className="text-xs text-text-secondary">{row.userEmail}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {row.userRoles.slice(0, 2).map((role: string, index: number) => (
                <span
                  key={index}
                  className="text-xs bg-accent-purple/20 text-accent-purple px-1 py-0.5 rounded"
                >
                  {role}
                </span>
              ))}
              {row.userRoles.length > 2 && (
                <span className="text-xs text-text-muted">+{row.userRoles.length - 2}</span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          {getActionIcon(row.action)}
          <span className="text-sm font-medium text-text-primary">{row.action}</span>
        </div>
      )
    },
    {
      key: 'resource',
      label: 'Resource',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-text-primary">{value}</span>
      )
    },
    {
      key: 'resourceId',
      label: 'Resource ID',
      sortable: true,
      render: (value: string) => (
        <span className="text-xs text-text-secondary font-mono">{value || '-'}</span>
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
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-text-secondary">{formatDate(value)}</span>
      )
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      sortable: true,
      render: (value: string) => (
        <span className="text-xs text-text-secondary font-mono">{value || 'Unknown'}</span>
      )
    },
    {
      key: 'details',
      label: 'Details',
      sortable: false,
      render: (value: any, row: any) => (
        <div className="max-w-xs">
          {row.errorMessage && (
            <p className="text-xs text-red-600 mb-1">{row.errorMessage}</p>
          )}
          {row.details && Object.keys(row.details).length > 0 && (
            <button
              onClick={() => {
                alert(JSON.stringify(row.details, null, 2));
              }}
              className="text-xs text-accent-blue hover:text-accent-blue-light"
            >
              View Details
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <RoleGuard allowedRoles={['Super Admin', 'Tenant Admin']}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                {user?.roles?.some(role => role.name === 'Super Admin') ? 'System Audit Logs' : 'School Audit Logs'}
              </h1>
              <p className="text-text-secondary">
                {user?.roles?.some(role => role.name === 'Super Admin') 
                  ? 'Monitor all user actions across the entire system' 
                  : 'Monitor user actions within your school'
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status="info" size="lg">
                {logs.length} Total Logs
              </StatusBadge>
              <Button variant="secondary" size="md" onClick={handleExportLogs}>
                <FaDownload className="mr-2" />
                Export Logs
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-green to-accent-green-light rounded-xl">
                <FaShieldAlt className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Successful Actions</p>
                <p className="text-2xl font-bold text-text-primary">
                  {logs.filter(l => l.status === 'SUCCESS').length}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-400 rounded-xl">
                <FaExclamationTriangle className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Failed Actions</p>
                <p className="text-2xl font-bold text-text-primary">
                  {logs.filter(l => l.status === 'FAILURE').length}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-xl">
                <FaUser className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Unique Users</p>
                <p className="text-2xl font-bold text-text-primary">
                  {new Set(logs.map(l => l.userId)).size}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-purple to-accent-purple-light rounded-xl">
                <FaCalendarAlt className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Today's Actions</p>
                <p className="text-2xl font-bold text-text-primary">
                  {logs.filter(l => {
                    const today = new Date().toDateString();
                    return new Date(l.timestamp).toDateString() === today;
                  }).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card variant="strong" glow="purple">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="glass-input pl-10 pr-4 py-2 w-64"
                />
              </div>

              {/* Action Filter */}
              <select
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                className="glass-input px-4 py-2"
              >
                <option value="all">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="PERMISSION_DENIED">Permission Denied</option>
              </select>

              {/* Resource Filter */}
              <select
                value={filters.resource}
                onChange={(e) => setFilters(prev => ({ ...prev, resource: e.target.value }))}
                className="glass-input px-4 py-2"
              >
                <option value="all">All Resources</option>
                <option value="USER">User</option>
                <option value="COURSE">Course</option>
                <option value="SUBJECT">Subject</option>
                <option value="AUTHENTICATION">Authentication</option>
                <option value="SECURITY">Security</option>
              </select>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="glass-input px-4 py-2"
              >
                <option value="all">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILURE">Failure</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <FaFilter className="text-text-muted" />
              <span className="text-sm text-text-secondary">
                {filteredLogs.length} of {logs.length} logs
              </span>
            </div>
          </div>
        </Card>

        {/* Audit Logs Table */}
        <Card variant="strong" glow="purple">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">Audit Log Entries</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Showing</span>
              <select 
                className="glass-input px-3 py-1 text-sm"
                value={pagination.limit}
                onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-text-secondary">per page</span>
            </div>
          </div>

          <DataTable
            data={filteredLogs}
            columns={columns}
            searchable={false}
            filterable={false}
            pagination={true}
            pageSize={pagination.limit}
          />
        </Card>
      </div>
    </RoleGuard>
  );
}
