'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList, 
  FiDownload,
  FiEye,
  FiShare2,
  FiEdit3,
  FiTrash2,
  FiFileText,
  FiVideo,
  FiPresentation,
  FiBookOpen
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { Content, ContentFilters, contentService } from '../../lib/services/contentService';
import CreateContentModal from '../../components/content/CreateContentModal';
import ShareContentModal from '../../components/content/ShareContentModal';
import ContentAnalyticsModal from '../../components/content/ContentAnalyticsModal';

const CONTENT_TYPE_ICONS = {
  document: FiFileText,
  video: FiVideo,
  presentation: FiPresentation,
  interactive: FiBookOpen,
  resource: FiBookOpen
};

const STATUS_COLORS = {
  draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  published: 'bg-green-100 text-green-800 border-green-200',
  archived: 'bg-gray-100 text-gray-800 border-gray-200'
};

export default function ContentManagement() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ContentFilters>({
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 12,
    total: 0,
    total_pages: 1
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  const loadContent = async () => {
    try {
      setLoading(true);
      const data = await contentService.getAllContent(filters);
      setContent(data.content);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [filters]);

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handleFilterChange = (key: keyof ContentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleCreateContent = () => {
    setShowCreateModal(true);
  };

  const handleContentCreated = (newContent: Content) => {
    setContent(prev => [newContent, ...prev]);
    setShowCreateModal(false);
    toast.success('Content created successfully!');
  };

  const handleShareContent = (content: Content) => {
    setSelectedContent(content);
    setShowShareModal(true);
  };

  const handleViewAnalytics = (content: Content) => {
    setSelectedContent(content);
    setShowAnalyticsModal(true);
  };

  const handleDeleteContent = async (content: Content) => {
    if (!confirm(`Are you sure you want to delete "${content.title}"?`)) {
      return;
    }

    try {
      await contentService.deleteContent(content.id);
      setContent(prev => prev.filter(c => c.id !== content.id));
      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const handleExportReport = async () => {
    try {
      const blob = await contentService.exportContentReport({
        format: 'csv',
        include_analytics: true
      });
      
      const url = window.URL.createObjectURL(blob as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `content-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const ContentCard = ({ content: item }: { content: Content }) => {
    const IconComponent = CONTENT_TYPE_ICONS[item.content_type] || FiFileText;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-200"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {item.content_type} • {item.creator?.first_name} {item.creator?.last_name}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-md border ${STATUS_COLORS[item.status]}`}>
            {item.status}
          </span>
        </div>

        {item.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span>{item.views_count} views</span>
            <span>{item._count?.assignments || 0} assignments</span>
          </div>
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewAnalytics(item)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Analytics"
            >
              <FiEye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleShareContent(item)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Share Content"
            >
              <FiShare2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <FiEdit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteContent(item)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Create, share, and manage educational content</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExportReport}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button
            onClick={handleCreateContent}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span>Create Content</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search content..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Content Type Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={filters.content_type || ''}
              onChange={(e) => handleFilterChange('content_type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="document">Documents</option>
              <option value="video">Videos</option>
              <option value="presentation">Presentations</option>
              <option value="interactive">Interactive</option>
              <option value="resource">Resources</option>
            </select>

            {/* Status Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid/List */}
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
      }`}>
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/80 rounded-xl border border-purple-100 p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 w-full bg-gray-200 rounded"></div>
                <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : content.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FiBookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first educational content.</p>
            <button
              onClick={handleCreateContent}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              <span>Create Content</span>
            </button>
          </div>
        ) : (
          content.map((item) => <ContentCard key={item.id} content={item} />)
        )}
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{' '}
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleFilterChange('page', pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm font-semibold">
              {pagination.current_page} of {pagination.total_pages}
            </span>
            <button
              onClick={() => handleFilterChange('page', pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.total_pages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateContentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onContentCreated={handleContentCreated}
        />
      )}

      {showShareModal && selectedContent && (
        <ShareContentModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          content={selectedContent}
          onContentShared={() => {
            setShowShareModal(false);
            toast.success('Content shared successfully!');
          }}
        />
      )}

      {showAnalyticsModal && selectedContent && (
        <ContentAnalyticsModal
          isOpen={showAnalyticsModal}
          onClose={() => setShowAnalyticsModal(false)}
          content={selectedContent}
        />
      )}
    </div>
  );
}
