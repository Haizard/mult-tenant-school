'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiUpload, 
  FiFileText, 
  FiVideo, 
  FiPresentation, 
  FiBookOpen,
  FiLink,
  FiTag
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { Content, contentService } from '../../lib/services/contentService';

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContentCreated: (content: Content) => void;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

const CONTENT_TYPES = [
  { value: 'document', label: 'Document', icon: FiFileText, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { value: 'video', label: 'Video', icon: FiVideo, color: 'text-red-600', bgColor: 'bg-red-100' },
  { value: 'presentation', label: 'Presentation', icon: FiPresentation, color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'interactive', label: 'Interactive', icon: FiBookOpen, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { value: 'resource', label: 'Resource', icon: FiBookOpen, color: 'text-indigo-600', bgColor: 'bg-indigo-100' }
];

const GRADE_LEVELS = [
  'Pre-Primary',
  'Standard 1',
  'Standard 2',
  'Standard 3',
  'Standard 4',
  'Standard 5',
  'Standard 6',
  'Standard 7',
  'Form 1',
  'Form 2',
  'Form 3',
  'Form 4',
  'Form 5',
  'Form 6'
];

export default function CreateContentModal({ isOpen, onClose, onContentCreated }: CreateContentModalProps) {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'document',
    category: '',
    tags: '',
    grade_level: '',
    subject_id: '',
    file_url: ''
  });

  // Load subjects on mount
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        // This would typically come from a subjects API endpoint
        // For now, we'll use placeholder data
        setSubjects([
          { id: '1', name: 'Mathematics', code: 'MATH' },
          { id: '2', name: 'English', code: 'ENG' },
          { id: '3', name: 'Science', code: 'SCI' },
          { id: '4', name: 'History', code: 'HIST' },
          { id: '5', name: 'Geography', code: 'GEO' }
        ]);
      } catch (error) {
        console.error('Error loading subjects:', error);
      }
    };

    if (isOpen) {
      loadSubjects();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!contentService.isValidFileType(file)) {
        toast.error('Invalid file type. Please select a supported file format.');
        return;
      }
      
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toast.error('File size too large. Please select a file smaller than 100MB.');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    if (uploadType === 'file' && !selectedFile) {
      toast.error('Please select a file or provide a URL');
      return;
    }
    
    if (uploadType === 'url' && !formData.file_url.trim()) {
      toast.error('Please provide a valid URL');
      return;
    }

    try {
      setLoading(true);
      
      const contentData = {
        ...formData,
        file: uploadType === 'file' ? selectedFile : undefined,
        file_url: uploadType === 'url' ? formData.file_url : undefined
      };
      
      const newContent = await contentService.createContent(contentData);
      onContentCreated(newContent);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        content_type: 'document',
        category: '',
        tags: '',
        grade_level: '',
        subject_id: '',
        file_url: ''
      });
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create content');
    } finally {
      setLoading(false);
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create Educational Content</h2>
              <p className="text-sm text-gray-600">Upload or link educational materials for your students</p>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter content title..."
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe the content and learning objectives..."
                />
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Content Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {CONTENT_TYPES.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, content_type: type.value }))}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          formData.content_type === type.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${type.bgColor} flex items-center justify-center mx-auto mb-2`}>
                          <IconComponent className={`w-4 h-4 ${type.color}`} />
                        </div>
                        <div className="text-xs font-medium text-gray-700">{type.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Content Source *
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setUploadType('file')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      uploadType === 'file'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiUpload className="w-4 h-4" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadType('url')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      uploadType === 'url'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiLink className="w-4 h-4" />
                    <span>External URL</span>
                  </button>
                </div>
              </div>

              {/* File Upload or URL Input */}
              {uploadType === 'file' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.jpg,.jpeg,.png,.gif,.txt,.zip"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {selectedFile ? (
                        <div className="space-y-2">
                          <FiFileText className="w-8 h-8 text-green-600 mx-auto" />
                          <div className="text-sm font-medium text-gray-900">{selectedFile.name}</div>
                          <div className="text-xs text-gray-500">
                            {contentService.formatFileSize(selectedFile.size)}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FiUpload className="w-8 h-8 text-gray-400 mx-auto" />
                          <div className="text-sm font-medium text-gray-900">Click to upload file</div>
                          <div className="text-xs text-gray-500">
                            PDF, DOC, PPT, MP4, Images (max 100MB)
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content URL
                  </label>
                  <input
                    type="url"
                    name="file_url"
                    value={formData.file_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/content"
                  />
                </div>
              )}

              {/* Subject and Grade Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Level
                  </label>
                  <select
                    name="grade_level"
                    value={formData.grade_level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Grade</option>
                    {GRADE_LEVELS.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Homework, Lesson Material"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="relative">
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="algebra, equations, practice"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Separate tags with commas
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FiUpload className="w-4 h-4" />
                      <span>Create Content</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
