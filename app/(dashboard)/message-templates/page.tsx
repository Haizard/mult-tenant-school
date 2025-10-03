'use client';

import { useState, useEffect } from 'react';
import { FaFileAlt, FaPlus, FaEdit, FaTrash, FaEye, FaCopy, FaTag, FaCalendarAlt } from 'react-icons/fa';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import RoleGuard from '../../components/RoleGuard';
import RoleBasedButton from '../../components/RoleBasedButton';
import { useAuth } from '../../contexts/AuthContext';
import communicationService, { MessageTemplate } from '../../../lib/communicationService';
import { useToast } from '../../hooks/use-toast';

const MessageTemplatesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Load templates from API
  const loadTemplates = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await communicationService.getMessageTemplates({
        page,
        limit: pagination.limit,
        isActive: true
      });
      
      if (response.success) {
        setTemplates(response.data.templates);
        setPagination(response.data.pagination);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load message templates',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load message templates',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'EMERGENCY':
        return 'error';
      case 'EXAMINATION':
        return 'warning';
      case 'ACADEMIC':
        return 'info';
      case 'ATTENDANCE':
        return 'success';
      case 'GENERAL':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleCreateTemplate = () => {
    // TODO: Open create template modal/form
    console.log('Create new template');
  };

  const handleEditTemplate = (templateId: string) => {
    // TODO: Open edit template modal/form
    console.log('Edit template:', templateId);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }
    
    try {
      const response = await communicationService.deleteMessageTemplate(templateId);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Template deleted successfully',
        });
        loadTemplates(pagination.page);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete template',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive'
      });
    }
  };

  const handleUseTemplate = (templateId: string) => {
    // TODO: Open compose message with template
    console.log('Use template:', templateId);
  };

  const columns = [
    {
      key: 'name',
      label: 'Template Name',
      sortable: true,
      render: (value: string, row: MessageTemplate) => (
        <div className="flex items-center">
          <FaFileAlt className="text-blue-500 mr-2" />
          <div>
            <p className="font-medium text-text-primary">{value}</p>
            <p className="text-sm text-text-secondary">{row.description}</p>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center">
          <FaTag className="text-purple-500 mr-2" />
          <StatusBadge status={getCategoryColor(value) as any} size="sm">
            {value}
          </StatusBadge>
        </div>
      )
    },
    {
      key: 'usageCount',
      label: 'Usage Count',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center">
          <FaCopy className="text-green-500 mr-2" />
          <span className="text-sm text-text-primary">{value}</span>
        </div>
      )
    },
    {
      key: 'lastUsedAt',
      label: 'Last Used',
      sortable: true,
      render: (value: string | Date | null) => (
        <div className="flex items-center">
          <FaCalendarAlt className="text-orange-500 mr-2" />
          <span className="text-sm text-text-primary">
            {value ? new Date(value).toLocaleDateString() : 'Never'}
          </span>
        </div>
      )
    },
    {
      key: 'createdBy',
      label: 'Created By',
      sortable: true,
      render: (value: any, row: MessageTemplate) => (
        <span className="text-sm text-text-primary">
          {row.createdBy ? `${row.createdBy.firstName} ${row.createdBy.lastName}` : 'Unknown'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value: any, row: MessageTemplate) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleUseTemplate(row.id)}
            className="glass-button p-2 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
            title="Use Template"
          >
            <FaCopy className="text-sm" />
          </button>
          <button
            onClick={() => handleEditTemplate(row.id)}
            className="glass-button p-2 hover:bg-green-500/10 hover:text-green-500 transition-colors"
            title="Edit Template"
          >
            <FaEdit className="text-sm" />
          </button>
          <RoleBasedButton
            allowedRoles={['Tenant Admin']}
            onClick={() => handleDeleteTemplate(row.id)}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-red-500/10 hover:text-red-500 transition-colors"
            title="Delete Template"
          >
            <FaTrash className="text-sm" />
          </RoleBasedButton>
        </div>
      )
    }
  ];

  return (
    <RoleGuard allowedRoles={['Tenant Admin', 'Teacher']}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Message Templates</h1>
              <p className="text-text-secondary">Create and manage reusable message templates</p>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status="info" size="lg">
                {templates.length} Templates
              </StatusBadge>
              <RoleBasedButton
                allowedRoles={['Tenant Admin', 'Teacher']}
                onClick={handleCreateTemplate}
                variant="primary"
                size="md"
              >
                <FaPlus className="mr-2" />
                Create Template
              </RoleBasedButton>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-xl">
                <FaFileAlt className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Templates</p>
                <p className="text-2xl font-bold text-text-primary">{templates.length}</p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-green to-accent-green-light rounded-xl">
                <FaCopy className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Most Used</p>
                <p className="text-2xl font-bold text-text-primary">
                  {Math.max(...templates.map(t => t.usageCount), 0)}
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
                <p className="text-sm text-text-secondary">Categories</p>
                <p className="text-2xl font-bold text-text-primary">
                  {new Set(templates.map(t => t.category)).size}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-red to-accent-red-light rounded-xl">
                <FaCalendarAlt className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Recently Used</p>
                <p className="text-2xl font-bold text-text-primary">
                  {templates.filter(t => t.lastUsedAt && 
                    new Date(t.lastUsedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Templates Table */}
        <Card variant="strong" glow="purple">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">All Templates</h2>
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
            data={templates}
            columns={columns}
            searchable={true}
            filterable={true}
            pagination={true}
            pageSize={10}
            loading={isLoading}
          />
        </Card>
      </div>
    </RoleGuard>
  );
};

export default MessageTemplatesPage;
