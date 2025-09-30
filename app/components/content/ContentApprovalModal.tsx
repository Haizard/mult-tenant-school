'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiCheck, 
  FiXCircle, 
  FiMessageSquare, 
  FiClock,
  FiUser,
  FiFileText,
  FiEye
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { Content, contentService } from '../../lib/services/contentService';

interface ContentApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content;
  onApprovalProcessed: (approved: boolean) => void;
}

interface ApprovalHistory {
  id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'resubmitted';
  reviewer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  comments?: string;
  created_at: Date;
}

export default function ContentApprovalModal({ isOpen, onClose, content, onApprovalProcessed }: ContentApprovalModalProps) {
  const [loading, setLoading] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Mock approval history - in real implementation, this would come from the API
      setApprovalHistory([
        {
          id: '1',
          action: 'submitted',
          created_at: new Date(content.created_at),
          comments: 'Initial submission'
        }
      ]);
    }
  }, [isOpen, content]);

  const handleApproval = async (approve: boolean) => {
    if (!comments.trim()) {
      toast.error('Please provide review comments');
      return;
    }

    try {
      setLoading(true);
      
      // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      onApprovalProcessed(approve);
      toast.success(approve ? 'Content approved successfully!' : 'Content rejected successfully!');
      
      // Reset form
      setDecision(null);
      setComments('');
      
    } catch (error) {
      console.error('Error processing approval:', error);
      toast.error('Failed to process approval');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'submitted': return FiFileText;
      case 'approved': return FiCheck;
      case 'rejected': return FiXCircle;
      case 'resubmitted': return FiFileText;
      default: return FiClock;
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
              <h2 className="text-xl font-semibold text-gray-900">Content Approval</h2>
              <p className="text-sm text-gray-600">
                Review and approve "{content.title}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-6">
              {/* Content Preview */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{content.title}</h3>
                    {content.description && (
                      <p className="text-gray-600 mb-4">{content.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Type: {content.content_type}</span>
                      <span>Creator: {content.creator?.first_name} {content.creator?.last_name}</span>
                      <span>Created: {new Date(content.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(content.approval_status || 'pending')}`}>
                    {(content.approval_status || 'pending').toUpperCase()}
                  </div>
                </div>

                {/* Content Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Content Details</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {content.category && <li>Category: {content.category}</li>}
                      {content.grade_level && <li>Grade: {content.grade_level}</li>}
                      {content.subject?.name && <li>Subject: {content.subject.name}</li>}
                      {content.tags.length > 0 && (
                        <li>Tags: {content.tags.join(', ')}</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">File Information</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {content.file_path && <li>File: {content.file_path}</li>}
                      {content.file_url && <li>URL: {content.file_url}</li>}
                      {content.mime_type && <li>Type: {content.mime_type}</li>}
                      {content.file_size && (
                        <li>Size: {contentService.formatFileSize(content.file_size)}</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Preview Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                    <FiEye className="w-4 h-4" />
                    <span>Preview Content</span>
                  </button>
                </div>
              </div>

              {/* Approval History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval History</h3>
                <div className="space-y-3">
                  {approvalHistory.map((item) => {
                    const IconComponent = getActionIcon(item.action);
                    return (
                      <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200">
                          <IconComponent className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900 capitalize">
                              {item.action.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(item.created_at).toLocaleDateString()} at{' '}
                              {new Date(item.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          {item.reviewer && (
                            <div className="text-sm text-gray-600 mb-1">
                              by {item.reviewer.first_name} {item.reviewer.last_name}
                            </div>
                          )}
                          {item.comments && (
                            <p className="text-sm text-gray-700">{item.comments}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Form */}
              {content.approval_status === 'pending' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Decision</h3>
                  
                  {/* Decision Buttons */}
                  <div className="flex space-x-4 mb-4">
                    <button
                      onClick={() => setDecision('approve')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        decision === 'approve'
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <FiCheck className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => setDecision('reject')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        decision === 'reject'
                          ? 'bg-red-100 text-red-700 border-2 border-red-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <FiXCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Comments *
                    </label>
                    <div className="relative">
                      <FiMessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows={4}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Provide detailed feedback about your decision..."
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end space-x-4 mt-6">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => decision && handleApproval(decision === 'approve')}
                      disabled={loading || !decision || !comments.trim()}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          {decision === 'approve' ? (
                            <FiCheck className="w-4 h-4" />
                          ) : (
                            <FiXCircle className="w-4 h-4" />
                          )}
                          <span>{decision === 'approve' ? 'Approve Content' : 'Reject Content'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Already Processed */}
              {content.approval_status && content.approval_status !== 'pending' && (
                <div className={`p-4 rounded-lg ${
                  content.approval_status === 'approved' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    {content.approval_status === 'approved' ? (
                      <FiCheck className="w-5 h-5 text-green-600" />
                    ) : (
                      <FiXCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      content.approval_status === 'approved' 
                        ? 'text-green-800' 
                        : 'text-red-800'
                    }`}>
                      Content has been {content.approval_status}
                    </span>
                  </div>
                  {content.approved_at && (
                    <p className={`text-sm mt-1 ${
                      content.approval_status === 'approved' 
                        ? 'text-green-700' 
                        : 'text-red-700'
                    }`}>
                      on {new Date(content.approved_at).toLocaleDateString()} at{' '}
                      {new Date(content.approved_at).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
