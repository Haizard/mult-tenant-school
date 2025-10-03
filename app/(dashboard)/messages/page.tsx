'use client';

import { useState, useEffect } from 'react';
import { FaEnvelope, FaEnvelopeOpen, FaReply, FaTrash, FaUser, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import RoleGuard from '../../components/RoleGuard';
import { useAuth } from '../../contexts/AuthContext';
import communicationService, { Message } from '../../../lib/communicationService';
import { useToast } from '../../hooks/use-toast';

const MessagesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Load messages from API
  const loadMessages = async (page = 1, tab = activeTab) => {
    try {
      setIsLoading(true);
      const params: any = {
        page,
        limit: pagination.limit
      };

      if (tab === 'inbox') {
        params.recipientId = user?.id;
      } else {
        params.senderId = user?.id;
      }

      const response = await communicationService.getMessages(params);
      
      if (response.success) {
        setMessages(response.data.messages);
        setPagination(response.data.pagination);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load unread count
  const loadUnreadCount = async () => {
    try {
      const response = await communicationService.getUnreadMessageCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  useEffect(() => {
    loadMessages();
    loadUnreadCount();
  }, [activeTab]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'NORMAL':
        return 'info';
      case 'LOW':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READ':
        return 'success';
      case 'SENT':
        return 'info';
      case 'DELIVERED':
        return 'success';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await communicationService.markMessageAsRead(messageId);
      if (response.success) {
        loadMessages(pagination.page);
        loadUnreadCount();
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleReply = (messageId: string) => {
    // TODO: Open reply modal/form
    console.log('Reply to message:', messageId);
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }
    
    try {
      const response = await communicationService.deleteMessage(messageId);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Message deleted successfully',
        });
        loadMessages(pagination.page);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete message',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive'
      });
    }
  };

  const columns = [
    {
      key: 'isRead',
      label: '',
      sortable: false,
      render: (value: boolean) => (
        <div className="flex items-center justify-center">
          {value ? (
            <FaEnvelopeOpen className="text-gray-400" />
          ) : (
            <FaEnvelope className="text-blue-500" />
          )}
        </div>
      )
    },
    {
      key: activeTab === 'inbox' ? 'sender' : 'recipient',
      label: activeTab === 'inbox' ? 'From' : 'To',
      sortable: true,
      render: (value: any, row: Message) => {
        const person = activeTab === 'inbox' ? row.sender : row.recipient;
        return (
          <div className="flex items-center">
            <FaUser className="text-green-500 mr-2" />
            <span className="text-sm text-text-primary">
              {person ? `${person.firstName} ${person.lastName}` : 'Unknown'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
      render: (value: string, row: Message) => (
        <div>
          <p className="font-medium text-text-primary">{value || 'No Subject'}</p>
          <p className="text-sm text-text-secondary truncate max-w-xs">
            {row.content.length > 50 ? `${row.content.substring(0, 50)}...` : row.content}
          </p>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center">
          {value === 'URGENT' && <FaExclamationTriangle className="text-red-500 mr-2" />}
          <StatusBadge status={getPriorityColor(value) as any} size="sm">
            {value}
          </StatusBadge>
        </div>
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
      render: (value: any, row: Message) => (
        <div className="flex items-center gap-2">
          {activeTab === 'inbox' && !row.isRead && (
            <button
              onClick={() => handleMarkAsRead(row.id)}
              className="glass-button p-2 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
              title="Mark as Read"
            >
              <FaEnvelopeOpen className="text-sm" />
            </button>
          )}
          <button
            onClick={() => handleReply(row.id)}
            className="glass-button p-2 hover:bg-green-500/10 hover:text-green-500 transition-colors"
            title="Reply"
          >
            <FaReply className="text-sm" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="glass-button p-2 hover:bg-red-500/10 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      )
    }
  ];

  return (
    <RoleGuard allowedRoles={['Tenant Admin', 'Teacher', 'Student', 'Parent']}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Messages</h1>
              <p className="text-text-secondary">Manage your direct messages and communications</p>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status="info" size="lg">
                {unreadCount} Unread
              </StatusBadge>
              <Button variant="primary" size="md">
                <FaEnvelope className="mr-2" />
                Compose Message
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-glass-light rounded-lg p-1">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'inbox'
                ? 'bg-accent-blue text-white shadow-lg'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Inbox ({unreadCount})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sent'
                ? 'bg-accent-blue text-white shadow-lg'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Sent
          </button>
        </div>

        {/* Messages Table */}
        <Card variant="strong" glow="purple">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">
              {activeTab === 'inbox' ? 'Inbox' : 'Sent Messages'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Showing</span>
              <select className="glass-input px-3 py-1 text-sm">
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-text-secondary">per page</span>
            </div>
          </div>

          <DataTable
            data={messages}
            columns={columns}
            searchable={true}
            filterable={true}
            pagination={true}
            pageSize={20}
            loading={isLoading}
          />
        </Card>
      </div>
    </RoleGuard>
  );
};

export default MessagesPage;
