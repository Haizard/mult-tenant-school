'use client';

import { useState, useEffect } from 'react';
import { FaBullhorn, FaPlus, FaEdit, FaTrash, FaEye, FaCalendarAlt, FaUser, FaTag } from 'react-icons/fa';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import RoleGuard from '../../components/RoleGuard';
import RoleBasedButton from '../../components/RoleBasedButton';
import { useAuth } from '../../contexts/AuthContext';
import communicationService, { Announcement } from '../../../lib/communicationService';
import { useToast } from '../../hooks/use-toast';

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Load announcements from API
  const loadAnnouncements = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await communicationService.getAnnouncements({
        page,
        limit: pagination.limit,
        status: 'PUBLISHED'
      });

      if (response.success) {
        setAnnouncements(response.data.announcements);
        setPagination(response.data.pagination);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load announcements',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load announcements',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'default';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'URGENT':
        return 'error';
      case 'EVENT':
        return 'success';
      case 'ACADEMIC':
        return 'info';
      case 'GENERAL':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'ARCHIVED':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleCreateAnnouncement = () => {
    // TODO: Open create announcement modal/form
    console.log('Create new announcement');
  };

  const handleEditAnnouncement = (announcementId: string) => {
    // TODO: Open edit announcement modal/form
    console.log('Edit announcement:', announcementId);
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await communicationService.deleteAnnouncement(announcementId);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Announcement deleted successfully',
        });
        loadAnnouncements(pagination.page);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete announcement',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete announcement',
        variant: 'destructive'
      });
    }
  };

  const handleViewAnnouncement = async (announcementId: string) => {
    try {
      await communicationService.getAnnouncementById(announcementId);
      // TODO: Open announcement detail modal/page
      console.log('View announcement:', announcementId);
    } catch (error) {
      console.error('Error viewing announcement:', error);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value: string, row: Announcement) => (
        <div className="flex items-center">
          <FaBullhorn className="text-blue-500 mr-2" />
          <div>
            <p className="font-medium text-text-primary">{value}</p>
            <p className="text-sm text-text-secondary">{row.category}</p>
          </div>
        </div>
      )
    },
    {
      key: 'content',
      label: 'Content',
      sortable: false,
      render: (value: string) => (
        <span className="text-sm text-text-secondary max-w-xs truncate">
          {value.length > 100 ? `${value.substring(0, 100)}...` : value}
        </span>
      )
    },
    {
      key: 'author',
      label: 'Author',
      sortable: true,
      render: (value: any, row: Announcement) => (
        <div className="flex items-center">
          <FaUser className="text-green-500 mr-2" />
          <span className="text-sm text-text-primary">
            {row.author ? `${row.author.firstName} ${row.author.lastName}` : 'Unknown'}
          </span>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value: string) => (
        <StatusBadge status={getPriorityColor(value) as any} size="sm">
          {value}
        </StatusBadge>
      )
    },
    {
      key: 'targetAudience',
      label: 'Audience',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center">
          <FaTag className="text-purple-500 mr-2" />
          <span className="text-sm text-text-primary">{value}</span>
        </div>
      )
    },
    {
      key: 'publishDate',
      label: 'Published',
      sortable: true,
      render: (value: string | Date) => (
        <div className="flex items-center">
          <FaCalendarAlt className="text-orange-500 mr-2" />
          <span className="text-sm text-text-primary">
            {value ? new Date(value).toLocaleDateString() : 'Not published'}
          </span>
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
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value: any, row: Announcement) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewAnnouncement(row.id)}
            className="glass-button p-2 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
            title="View Announcement"
          >
            <FaEye className="text-sm" />
          </button>
          <RoleBasedButton
            allowedRoles={['Tenant Admin']}
            onClick={() => handleEditAnnouncement(row.id)}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-green-500/10 hover:text-green-500 transition-colors"
            title="Edit Announcement"
          >
            <FaEdit className="text-sm" />
          </RoleBasedButton>
          <RoleBasedButton
            allowedRoles={['Tenant Admin']}
            onClick={() => handleDeleteAnnouncement(row.id)}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-red-500/10 hover:text-red-500 transition-colors"
            title="Delete Announcement"
          >
            <FaTrash className="text-sm" />
          </RoleBasedButton>
        </div>
      )
    }
  ];

  return (
    <RoleGuard allowedRoles={['Tenant Admin', 'Teacher', 'Student']}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Announcements</h1>
              <p className="text-text-secondary">Stay updated with school news and important information</p>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status="info" size="lg">
                {announcements.length} Total Announcements
              </StatusBadge>
              <RoleBasedButton
                allowedRoles={['Tenant Admin']}
                onClick={handleCreateAnnouncement}
                variant="primary"
                size="md"
              >
                <FaPlus className="mr-2" />
                Create Announcement
              </RoleBasedButton>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-xl">
                <FaBullhorn className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Published</p>
                <p className="text-2xl font-bold text-text-primary">
                  {announcements.filter(a => a.status === 'PUBLISHED').length}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-red to-accent-red-light rounded-xl">
                <FaBullhorn className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Urgent</p>
                <p className="text-2xl font-bold text-text-primary">
                  {announcements.filter(a => a.priority === 'URGENT').length}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-green to-accent-green-light rounded-xl">
                <FaCalendarAlt className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Events</p>
                <p className="text-2xl font-bold text-text-primary">
                  {announcements.filter(a => a.category === 'EVENT').length}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-purple to-accent-purple-light rounded-xl">
                <FaTag className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Academic</p>
                <p className="text-2xl font-bold text-text-primary">
                  {announcements.filter(a => a.category === 'ACADEMIC').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Announcements Table */}
        <Card variant="strong" glow="purple">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">All Announcements</h2>
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
            data={announcements}
            columns={columns}
            searchable={true}
            filterable={true}
            pagination={true}
            pageSize={10}
          />
        </Card>
      </div>
    </RoleGuard>
  );
};

export default AnnouncementsPage;
