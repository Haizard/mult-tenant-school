'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiDownload, 
  FiMaximize2,
  FiMinimize2,
  FiVolume2,
  FiVolumeX,
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiFileText,
  FiExternalLink,
  FiZoomIn,
  FiZoomOut
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { Content, contentService } from '../../lib/services/contentService';

interface ContentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content;
}

export default function ContentViewerModal({ isOpen, onClose, content }: ContentViewerModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  
  // Video controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setError(null);
      setZoom(100);
    }
  }, [isOpen]);

  const getFileUrl = () => {
    if (content.file_url) {
      return content.file_url;
    }
    if (content.file_path) {
      return contentService.getFileDownloadUrl(content.file_path);
    }
    return null;
  };

  const handleDownload = async () => {
    try {
      const fileUrl = getFileUrl();
      if (!fileUrl) {
        toast.error('File not available for download');
        return;
      }

      // Create download link
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = content.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const renderContentViewer = () => {
    const fileUrl = getFileUrl();
    
    if (!fileUrl) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No preview available</p>
            <p className="text-sm text-gray-500">File cannot be previewed in browser</p>
          </div>
        </div>
      );
    }

    switch (content.content_type) {
      case 'video':
        return (
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              className="w-full h-auto max-h-96"
              controls
              preload="metadata"
              onLoadedMetadata={(e) => {
                const video = e.target as HTMLVideoElement;
                setDuration(video.duration);
              }}
              onTimeUpdate={(e) => {
                const video = e.target as HTMLVideoElement;
                setCurrentTime(video.currentTime);
                setIsPlaying(!video.paused);
              }}
            >
              <source src={fileUrl} type={content.mime_type || 'video/mp4'} />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'document':
        if (content.mime_type === 'application/pdf') {
          return (
            <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <iframe
                src={`${fileUrl}#toolbar=1`}
                className="w-full h-full border-0"
                title={content.title}
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
              />
            </div>
          );
        } else {
          return (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
              <div className="text-center">
                <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Document Preview</p>
                <p className="text-sm text-gray-500 mb-4">{content.title}</p>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <FiDownload className="w-4 h-4" />
                    <span>Download to View</span>
                  </button>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <FiExternalLink className="w-4 h-4" />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              </div>
            </div>
          );
        }

      case 'presentation':
        return (
          <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              title={content.title}
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
            />
          </div>
        );

      default:
        if (content.mime_type?.startsWith('image/')) {
          return (
            <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
              <img
                src={fileUrl}
                alt={content.title}
                className="max-w-full max-h-96 object-contain rounded"
                style={{ transform: `scale(${zoom / 100})` }}
                onLoad={() => setLoading(false)}
                onError={() => setError('Failed to load image')}
              />
            </div>
          );
        }

        return (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
            <div className="text-center">
              <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Preview not available</p>
              <p className="text-sm text-gray-500 mb-4">This file type cannot be previewed</p>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-auto"
              >
                <FiDownload className="w-4 h-4" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
        fullscreen ? 'bg-black' : ''
      }`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`bg-white rounded-xl shadow-2xl overflow-hidden ${
            fullscreen 
              ? 'w-full h-full max-w-none max-h-none rounded-none' 
              : 'w-full max-w-6xl max-h-[95vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">{content.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Type: {content.content_type}</span>
                {content.file_size && (
                  <span>Size: {contentService.formatFileSize(content.file_size)}</span>
                )}
                <span>Views: {content.views_count}</span>
              </div>
            </div>
            
            {/* Toolbar */}
            <div className="flex items-center space-x-2">
              {/* Zoom Controls (for images and PDFs) */}
              {(content.mime_type?.startsWith('image/') || content.mime_type === 'application/pdf') && (
                <>
                  <button
                    onClick={handleZoomOut}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom Out"
                  >
                    <FiZoomOut className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-600 min-w-[3rem] text-center">{zoom}%</span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom In"
                  >
                    <FiZoomIn className="w-4 h-4 text-gray-600" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-2" />
                </>
              )}
              
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download"
              >
                <FiDownload className="w-4 h-4 text-gray-600" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {fullscreen ? (
                  <FiMinimize2 className="w-4 h-4 text-gray-600" />
                ) : (
                  <FiMaximize2 className="w-4 h-4 text-gray-600" />
                )}
              </button>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <FiX className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content Viewer */}
          <div className={`${fullscreen ? 'h-full' : 'max-h-[calc(95vh-120px)]'} overflow-auto`}>
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <FiX className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-600 mb-2">Error loading content</p>
                    <p className="text-sm text-gray-500">{error}</p>
                  </div>
                </div>
              ) : (
                renderContentViewer()
              )}
            </div>
          </div>

          {/* Content Info Footer */}
          {!fullscreen && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <span>Created by {content.creator?.first_name} {content.creator?.last_name}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(content.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-4">
                  {content.subject?.name && (
                    <span>Subject: {content.subject.name}</span>
                  )}
                  {content.grade_level && (
                    <span>Grade: {content.grade_level}</span>
                  )}
                </div>
              </div>
              
              {content.description && (
                <p className="mt-2 text-sm text-gray-700">{content.description}</p>
              )}
              
              {content.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {content.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
