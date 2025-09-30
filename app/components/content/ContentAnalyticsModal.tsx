'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiEye, 
  FiDownload, 
  FiUsers, 
  FiTrendingUp,
  FiCalendar,
  FiMonitor,
  FiSmartphone,
  FiTablet
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Content, ContentAnalytics, contentService } from '../../lib/services/contentService';

interface ContentAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const DEVICE_ICONS = {
  desktop: FiMonitor,
  mobile: FiSmartphone,
  tablet: FiTablet,
  unknown: FiMonitor
};

export default function ContentAnalyticsModal({ isOpen, onClose, content }: ContentAnalyticsModalProps) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<ContentAnalytics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const loadAnalytics = async (period: string = '30d') => {
    try {
      setLoading(true);
      const data = await contentService.getContentAnalytics(content.id, period);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAnalytics(selectedPeriod);
    }
  }, [isOpen, selectedPeriod]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    loadAnalytics(period);
  };

  // Process analytics data for charts
  const getUsageStats = () => {
    if (!analytics) return [];
    return analytics.total_usage.map(item => ({
      name: item.action_type.charAt(0).toUpperCase() + item.action_type.slice(1),
      value: item._count.id,
      color: COLORS[analytics.total_usage.indexOf(item) % COLORS.length]
    }));
  };

  const getViewsOverTime = () => {
    if (!analytics) return [];
    return analytics.views_over_time.map(item => ({
      date: new Date(item.accessed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: item._count.id
    }));
  };

  const getUserEngagement = () => {
    if (!analytics) return [];
    const userTypeStats = analytics.user_engagement.reduce((acc, item) => {
      if (!acc[item.user_type]) {
        acc[item.user_type] = 0;
      }
      acc[item.user_type] += item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(userTypeStats).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: COLORS[Object.keys(userTypeStats).indexOf(type) % COLORS.length]
    }));
  };

  const getDeviceStats = () => {
    if (!analytics) return [];
    return analytics.device_stats.slice(0, 5).map(item => {
      const deviceType = item.device_info.toLowerCase().includes('mobile') ? 'mobile' :
                        item.device_info.toLowerCase().includes('tablet') ? 'tablet' :
                        item.device_info.toLowerCase().includes('desktop') ? 'desktop' : 'unknown';
      
      return {
        name: deviceType.charAt(0).toUpperCase() + deviceType.slice(1),
        value: item._count.id,
        icon: DEVICE_ICONS[deviceType as keyof typeof DEVICE_ICONS]
      };
    });
  };

  const getTotalStats = () => {
    if (!analytics) return { views: 0, downloads: 0, shares: 0, comments: 0 };
    
    const stats = analytics.total_usage.reduce((acc, item) => {
      acc[item.action_type] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      views: stats.view || 0,
      downloads: stats.download || 0,
      shares: stats.share || 0,
      comments: stats.comment || 0
    };
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Content Analytics</h2>
              <p className="text-sm text-gray-600">
                Usage analytics for "{content.title}"
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Period Selector */}
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : analytics ? (
              <div className="space-y-8">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { 
                      label: 'Total Views', 
                      value: getTotalStats().views, 
                      icon: FiEye, 
                      color: 'text-blue-600', 
                      bgColor: 'bg-blue-100' 
                    },
                    { 
                      label: 'Downloads', 
                      value: getTotalStats().downloads, 
                      icon: FiDownload, 
                      color: 'text-green-600', 
                      bgColor: 'bg-green-100' 
                    },
                    { 
                      label: 'Shares', 
                      value: getTotalStats().shares, 
                      icon: FiUsers, 
                      color: 'text-purple-600', 
                      bgColor: 'bg-purple-100' 
                    },
                    { 
                      label: 'Engagement', 
                      value: analytics.user_engagement.length, 
                      icon: FiTrendingUp, 
                      color: 'text-orange-600', 
                      bgColor: 'bg-orange-100' 
                    }
                  ].map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-xl p-4"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                            <IconComponent className={`w-5 h-5 ${stat.color}`} />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">{stat.label}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Views Over Time Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white border border-gray-200 rounded-xl p-6"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <FiTrendingUp className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Views Over Time</h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getViewsOverTime()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="views" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
                          activeDot={{ r: 6, fill: '#8b5cf6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Usage by Action Type */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white border border-gray-200 rounded-xl p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Action Type</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getUsageStats()}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {getUsageStats().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4">
                      {getUsageStats().map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-600">
                            {item.name} ({item.value})
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* User Engagement */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white border border-gray-200 rounded-xl p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getUserEngagement()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip />
                          <Bar 
                            dataKey="value" 
                            fill="#8b5cf6" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>

                {/* Device Statistics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white border border-gray-200 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Usage</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {getDeviceStats().map((device, index) => {
                      const IconComponent = device.icon;
                      return (
                        <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                          <IconComponent className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                          <p className="text-lg font-semibold text-gray-900">{device.value}</p>
                          <p className="text-sm text-gray-600">{device.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Summary Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-purple-50 border border-purple-200 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">Analytics Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-purple-700">
                        <strong>Period:</strong> {selectedPeriod === '7d' ? 'Last 7 days' : selectedPeriod === '30d' ? 'Last 30 days' : 'Last 90 days'}
                      </p>
                      <p className="text-purple-700">
                        <strong>Total Interactions:</strong> {analytics.total_usage.reduce((sum, item) => sum + item._count.id, 0)}
                      </p>
                      <p className="text-purple-700">
                        <strong>Unique Users:</strong> {analytics.user_engagement.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-purple-700">
                        <strong>Content Type:</strong> {content.content_type}
                      </p>
                      <p className="text-purple-700">
                        <strong>Created:</strong> {new Date(content.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-purple-700">
                        <strong>Status:</strong> {content.status}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
                <p className="text-gray-600">No analytics data available for the selected period.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
