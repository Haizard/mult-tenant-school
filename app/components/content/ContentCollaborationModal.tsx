'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiUsers, 
  FiMessageSquare, 
  FiEdit3,
  FiUser,
  FiClock,
  FiSend,
  FiUserPlus,
  FiSettings,
  FiEye,
  FiCheckCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { Content } from '../../lib/services/contentService';

interface ContentCollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content;
  onCollaborationUpdated: () => void;
}

interface Collaborator {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  status: 'active' | 'invited' | 'removed';
  joined_at: Date;
}

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: Date;
  is_resolved: boolean;
  replies?: Comment[];
}

interface Activity {
  id: string;
  user_name: string;
  action: 'edited' | 'commented' | 'joined' | 'shared';
  description: string;
  created_at: Date;
}

export default function ContentCollaborationModal({ 
  isOpen, 
  onClose, 
  content, 
  onCollaborationUpdated 
}: ContentCollaborationModalProps) {
  const [activeTab, setActiveTab] = useState<'collaborators' | 'comments' | 'activity'>('collaborators');
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [newCollaboratorRole, setNewCollaboratorRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');

  // Mock data loading
  useEffect(() => {
    if (isOpen) {
      // Mock collaborators
      setCollaborators([
        {
          id: '1',
          user_id: content.created_by,
          first_name: content.creator?.first_name || 'Creator',
          last_name: content.creator?.last_name || 'User',
          email: content.creator?.email || 'creator@school.com',
          role: 'admin',
          status: 'active',
          joined_at: new Date(content.created_at)
        },
        {
          id: '2',
          user_id: '2',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@school.com',
          role: 'editor',
          status: 'active',
          joined_at: new Date('2024-01-20')
        },
        {
          id: '3',
          user_id: '3',
          first_name: 'Bob',
          last_name: 'Johnson',
          email: 'bob.johnson@school.com',
          role: 'viewer',
          status: 'invited',
          joined_at: new Date('2024-01-21')
        }
      ]);

      // Mock comments
      setComments([
        {
          id: '1',
          user_id: '2',
          user_name: 'Jane Smith',
          content: 'This content looks great! I think we should add more examples for the students.',
          created_at: new Date('2024-01-20T10:30:00'),
          is_resolved: false
        },
        {
          id: '2',
          user_id: '3',
          user_name: 'Bob Johnson',
          content: 'I agree with Jane. Also, could we include some interactive elements?',
          created_at: new Date('2024-01-20T14:15:00'),
          is_resolved: false
        },
        {
          id: '3',
          user_id: content.created_by,
          user_name: `${content.creator?.first_name} ${content.creator?.last_name}`,
          content: 'Great suggestions! I\'ll work on adding those examples. Bob, what kind of interactive elements did you have in mind?',
          created_at: new Date('2024-01-20T16:45:00'),
          is_resolved: false
        }
      ]);

      // Mock activity
      setActivity([
        {
          id: '1',
          user_name: 'Jane Smith',
          action: 'joined',
          description: 'joined as editor',
          created_at: new Date('2024-01-20T09:00:00')
        },
        {
          id: '2',
          user_name: 'Jane Smith',
          action: 'commented',
          description: 'added a comment',
          created_at: new Date('2024-01-20T10:30:00')
        },
        {
          id: '3',
          user_name: 'Bob Johnson',
          action: 'joined',
          description: 'was invited as viewer',
          created_at: new Date('2024-01-21T08:00:00')
        }
      ]);
    }
  }, [isOpen, content]);

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCollaboratorEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Check if email already exists
    if (collaborators.some(c => c.email === newCollaboratorEmail)) {
      toast.error('This user is already a collaborator');
      return;
    }

    try {
      setLoading(true);
      
      // Mock API call
      const newCollaborator: Collaborator = {
        id: Date.now().toString(),
        user_id: Date.now().toString(),
        first_name: 'New',
        last_name: 'User',
        email: newCollaboratorEmail,
        role: newCollaboratorRole,
        status: 'invited',
        joined_at: new Date()
      };
      
      setCollaborators(prev => [...prev, newCollaborator]);
      setNewCollaboratorEmail('');
      setNewCollaboratorRole('viewer');
      
      toast.success('Collaborator invited successfully!');
      
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast.error('Failed to invite collaborator');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCollaboratorRole = async (collaboratorId: string, newRole: 'viewer' | 'editor' | 'admin') => {
    try {
      setLoading(true);
      
      // Mock API call
      setCollaborators(prev =>
        prev.map(c =>
          c.id === collaboratorId ? { ...c, role: newRole } : c
        )
      );
      
      toast.success('Role updated successfully!');
      
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    const collaborator = collaborators.find(c => c.id === collaboratorId);
    if (!collaborator) return;

    if (!confirm(`Remove ${collaborator.first_name} ${collaborator.last_name} from this collaboration?`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Mock API call
      setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
      
      toast.success('Collaborator removed successfully!');
      
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error('Failed to remove collaborator');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setLoading(true);
      
      // Mock API call
      const comment: Comment = {
        id: Date.now().toString(),
        user_id: 'current-user',
        user_name: 'Current User',
        content: newComment,
        created_at: new Date(),
        is_resolved: false
      };
      
      setComments(prev => [...prev, comment]);
      setNewComment('');
      
      toast.success('Comment added successfully!');
      
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      setComments(prev =>
        prev.map(c =>
          c.id === commentId ? { ...c, is_resolved: !c.is_resolved } : c
        )
      );
      
      toast.success('Comment status updated!');
      
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-100';
      case 'editor': return 'text-blue-600 bg-blue-100';
      case 'viewer': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'invited': return 'text-yellow-600 bg-yellow-100';
      case 'removed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Content Collaboration</h2>
              <p className="text-sm text-gray-600">
                Collaborate on "{content.title}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'collaborators', label: 'Collaborators', icon: FiUsers, count: collaborators.length },
              { id: 'comments', label: 'Comments', icon: FiMessageSquare, count: comments.length },
              { id: 'activity', label: 'Activity', icon: FiClock, count: activity.length }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === 'collaborators' && (
              <div className="space-y-6">
                {/* Add Collaborator Form */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Collaborator</h3>
                  <form onSubmit={handleAddCollaborator} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={newCollaboratorEmail}
                          onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="colleague@school.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <select
                          value={newCollaboratorRole}
                          onChange={(e) => setNewCollaboratorRole(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="viewer">Viewer - Can view content</option>
                          <option value="editor">Editor - Can edit content</option>
                          <option value="admin">Admin - Full access</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      <FiUserPlus className="w-4 h-4" />
                      <span>Invite Collaborator</span>
                    </button>
                  </form>
                </div>

                {/* Collaborators List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Current Collaborators</h3>
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {collaborator.first_name} {collaborator.last_name}
                          </h4>
                          <p className="text-sm text-gray-600">{collaborator.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(collaborator.role)}`}>
                              {collaborator.role}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(collaborator.status)}`}>
                              {collaborator.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <select
                          value={collaborator.role}
                          onChange={(e) => handleUpdateCollaboratorRole(collaborator.id, e.target.value as any)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                        
                        {collaborator.user_id !== content.created_by && (
                          <button
                            onClick={() => handleRemoveCollaborator(collaborator.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove Collaborator"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-6">
                {/* Add Comment Form */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Comment</h3>
                  <form onSubmit={handleAddComment} className="space-y-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add your comment or feedback..."
                    />
                    <button
                      type="submit"
                      disabled={loading || !newComment.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      <FiSend className="w-4 h-4" />
                      <span>Post Comment</span>
                    </button>
                  </form>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                  {comments.map((comment) => (
                    <div key={comment.id} className={`p-4 bg-white border rounded-lg ${
                      comment.is_resolved ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <FiUser className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{comment.user_name}</h4>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString()} at{' '}
                              {new Date(comment.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleResolveComment(comment.id)}
                          className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                            comment.is_resolved
                              ? 'text-green-700 bg-green-100 hover:bg-green-200'
                              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <FiCheckCircle className="w-3 h-3" />
                          <span>{comment.is_resolved ? 'Resolved' : 'Mark as Resolved'}</span>
                        </button>
                      </div>
                      
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                      <FiUser className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">
                        <span className="font-medium">{item.user_name}</span>{' '}
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.created_at).toLocaleDateString()} at{' '}
                        {new Date(item.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
