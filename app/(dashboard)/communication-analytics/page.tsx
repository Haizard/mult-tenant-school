'use client';

import { useState, useEffect } from 'react';
import { FaChartBar, FaEnvelope, FaBullhorn, FaUsers, FaEye, FaCalendarAlt, FaDownload } from 'react-icons/fa';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import RoleGuard from '../../components/RoleGuard';
import { useAuth } from '../../contexts/AuthContext';
import communicationService, { CommunicationLog } from '../../../lib/communicationService';
import { useToast } from '../../hooks/use-toast';

interface CommunicationStats {
  overview: {
    totalCommunications: number;
    totalMessages: number;
    totalAnnouncements: number;
    readRate: number;
  };
  messageStats: Array<{ communicationType: string; _count: { id: number } }>;
  announcementStats: Array<{ category: string; _count: { id: number } }>;
  channelStats: Array<{ channel: string; _count: { id: number } }>;
  statusStats: Array<{ status: string; _count: { id: number } }>;
  dailyStats: Array<{ date: string; count: number }>;
  topCommunicators: Array<{ userId: string; userName: string; userRole: string; count: number }>;
  topTemplates: Array<{ id: string; name: string; category: string; usageCount: number; lastUsedAt: string | null }>;
}

const CommunicationAnalyticsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const [statsResponse, logsResponse] = await Promise.all([
        communicationService.getCommunicationStats({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }),
        communicationService.getCommunicationLogs({
          page: 1,
          limit: 10,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        })
      ]);
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      
      if (logsResponse.success) {
        setLogs(logsResponse.data.logs);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleExportData = () => {
    // TODO: Implement data export functionality
    console.log('Export analytics data');
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'IN_APP': return 'info';
      case 'EMAIL': return 'success';
      case 'SMS': return 'warning';
      case 'PUSH_NOTIFICATION': return 'purple';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'info';
      case 'DELIVERED': return 'success';
      case 'READ': return 'success';
      case 'FAILED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const logColumns = [
    {
      key: 'communicationType',
      label: 'Type',
      sortable: true,
      render: (value: string) => (
        <StatusBadge status="info" size="sm">
          {value}
        </StatusBadge>
      )
    },
    {
      key: 'user',
      label: 'User',
      sortable: true,
      render: (value: any) => (
        <div className="flex items-center">
          <FaUsers className="text-green-500 mr-2" />
          <span className="text-sm text-text-primary">
            {value ? `${value.firstName} ${value.lastName}` : 'Unknown'}
          </span>
        </div>
      )
    },
    {
      key: 'channel',
      label: 'Channel',
      sortable: true,
      render: (value: string) => (
        <StatusBadge status={getChannelColor(value) as any} size="sm">
          {value}
        </StatusBadge>
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
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value: string | Date) => (
        <div className="flex items-center">
          <FaCalendarAlt className="text-orange-500 mr-2" />
          <span className="text-sm text-text-primary">
            {new Date(value).toLocaleDateString()}
          </span>
        </div>
      )
    }
  ];

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['Tenant Admin', 'Teacher']}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Communication Analytics</h1>
              <p className="text-text-secondary">Track and analyze communication patterns and effectiveness</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-text-secondary">From:</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="glass-input px-3 py-1 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-text-secondary">To:</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="glass-input px-3 py-1 text-sm"
                />
              </div>
              <Button onClick={handleExportData} variant="secondary" size="md">
                <FaDownload className="mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-xl">
                <FaChartBar className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Communications</p>
                <p className="text-2xl font-bold text-text-primary">{stats.overview.totalCommunications}</p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-green to-accent-green-light rounded-xl">
                <FaEnvelope className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Messages</p>
                <p className="text-2xl font-bold text-text-primary">{stats.overview.totalMessages}</p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-purple to-accent-purple-light rounded-xl">
                <FaBullhorn className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Announcements</p>
                <p className="text-2xl font-bold text-text-primary">{stats.overview.totalAnnouncements}</p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-red to-accent-red-light rounded-xl">
                <FaEye className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Read Rate</p>
                <p className="text-2xl font-bold text-text-primary">{stats.overview.readRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts and Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel Distribution */}
          <Card variant="strong" glow="blue">
            <h3 className="text-lg font-bold text-text-primary mb-4">Channel Distribution</h3>
            <div className="space-y-3">
              {stats.channelStats.map((stat) => (
                <div key={stat.channel} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <StatusBadge status={getChannelColor(stat.channel) as any} size="sm">
                      {stat.channel}
                    </StatusBadge>
                  </div>
                  <span className="text-text-primary font-medium">{stat._count.id}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Status Distribution */}
          <Card variant="strong" glow="green">
            <h3 className="text-lg font-bold text-text-primary mb-4">Status Distribution</h3>
            <div className="space-y-3">
              {stats.statusStats.map((stat) => (
                <div key={stat.status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <StatusBadge status={getStatusColor(stat.status) as any} size="sm">
                      {stat.status}
                    </StatusBadge>
                  </div>
                  <span className="text-text-primary font-medium">{stat._count.id}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Communication Logs */}
        <Card variant="strong" glow="purple">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">Recent Communication Logs</h2>
            <Button variant="secondary" size="sm">
              View All Logs
            </Button>
          </div>

          <DataTable
            data={logs}
            columns={logColumns}
            searchable={false}
            filterable={false}
            pagination={false}
            loading={isLoading}
          />
        </Card>
      </div>
    </RoleGuard>
  );
};

export default CommunicationAnalyticsPage;
