'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiFolder,
  FiTag,
  FiSave,
  FiSearch,
  FiFilter
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface ContentCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelected?: (category: ContentCategory) => void;
}

interface ContentCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  parent_id?: string;
  content_count: number;
  created_at: Date;
  updated_at: Date;
}

const CATEGORY_COLORS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'gray', label: 'Gray', class: 'bg-gray-500' }
];

const CATEGORY_ICONS = [
  { value: 'folder', label: 'Folder', icon: '📁' },
  { value: 'book', label: 'Book', icon: '📚' },
  { value: 'document', label: 'Document', icon: '📄' },
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'presentation', label: 'Presentation', icon: '📊' },
  { value: 'quiz', label: 'Quiz', icon: '❓' },
  { value: 'assignment', label: 'Assignment', icon: '📝' },
  { value: 'reference', label: 'Reference', icon: '📖' }
];

export default function ContentCategoriesModal({ isOpen, onClose, onCategorySelected }: ContentCategoriesModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ContentCategory | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue',
    icon: 'folder',
    parent_id: ''
  });

  // Mock categories data - in real implementation, this would come from API
  useEffect(() => {
    if (isOpen) {
      setCategories([
        {
          id: '1',
          name: 'Lesson Materials',
          description: 'Core lesson content and materials',
          color: 'blue',
          icon: '📚',
          content_count: 45,
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-15')
        },
        {
          id: '2',
          name: 'Assignments',
          description: 'Homework and assignments',
          color: 'green',
          icon: '📝',
          content_count: 32,
          created_at: new Date('2024-01-16'),
          updated_at: new Date('2024-01-16')
        },
        {
          id: '3',
          name: 'Reference Materials',
          description: 'Additional reading and reference content',
          color: 'purple',
          icon: '📖',
          content_count: 28,
          created_at: new Date('2024-01-17'),
          updated_at: new Date('2024-01-17')
        },
        {
          id: '4',
          name: 'Interactive Content',
          description: 'Quizzes, games, and interactive materials',
          color: 'red',
          icon: '🎮',
          content_count: 15,
          created_at: new Date('2024-01-18'),
          updated_at: new Date('2024-01-18')
        },
        {
          id: '5',
          name: 'Video Lessons',
          description: 'Educational videos and tutorials',
          color: 'indigo',
          icon: '🎥',
          parent_id: '1',
          content_count: 22,
          created_at: new Date('2024-01-19'),
          updated_at: new Date('2024-01-19')
        }
      ]);
    }
  }, [isOpen]);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      setLoading(true);
      
      // Mock API call - in real implementation, this would create the category
      const newCategory: ContentCategory = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        color: formData.color,
        icon: CATEGORY_ICONS.find(i => i.value === formData.icon)?.icon || '📁',
        parent_id: formData.parent_id || undefined,
        content_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      setCategories(prev => [...prev, newCategory]);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        color: 'blue',
        icon: 'folder',
        parent_id: ''
      });
      setShowCreateForm(false);
      
      toast.success('Category created successfully!');
      
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category: ContentCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: CATEGORY_ICONS.find(i => i.icon === category.icon)?.value || 'folder',
      parent_id: category.parent_id || ''
    });
    setShowCreateForm(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory) return;

    try {
      setLoading(true);
      
      // Mock API call - in real implementation, this would update the category
      const updatedCategory: ContentCategory = {
        ...editingCategory,
        name: formData.name,
        description: formData.description,
        color: formData.color,
        icon: CATEGORY_ICONS.find(i => i.value === formData.icon)?.icon || '📁',
        parent_id: formData.parent_id || undefined,
        updated_at: new Date()
      };
      
      setCategories(prev => 
        prev.map(cat => cat.id === editingCategory.id ? updatedCategory : cat)
      );
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        color: 'blue',
        icon: 'folder',
        parent_id: ''
      });
      setShowCreateForm(false);
      setEditingCategory(null);
      
      toast.success('Category updated successfully!');
      
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    if (category.content_count > 0) {
      if (!confirm(`This category contains ${category.content_count} content items. Are you sure you want to delete it? The content will be uncategorized.`)) {
        return;
      }
    }

    try {
      setLoading(true);
      
      // Mock API call - in real implementation, this would delete the category
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      toast.success('Category deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (color: string) => {
    const colorConfig = CATEGORY_COLORS.find(c => c.value === color);
    return colorConfig?.class || 'bg-gray-500';
  };

  const getParentCategories = () => {
    return categories.filter(cat => !cat.parent_id);
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
              <h2 className="text-xl font-semibold text-gray-900">Content Categories</h2>
              <p className="text-sm text-gray-600">Organize your content with categories and tags</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                <span>New Category</span>
              </button>
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
            {showCreateForm ? (
              /* Create/Edit Form */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-xl p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingCategory(null);
                      setFormData({ name: '', description: '', color: 'blue', icon: 'folder', parent_id: '' });
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <FiX className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter category name..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parent Category
                      </label>
                      <select
                        name="parent_id"
                        value={formData.parent_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">No Parent (Top Level)</option>
                        {getParentCategories().map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

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
                      placeholder="Describe this category..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORY_COLORS.map(color => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                            className={`w-8 h-8 rounded-full ${color.class} ${
                              formData.color === color.value
                                ? 'ring-2 ring-offset-2 ring-purple-500'
                                : 'ring-1 ring-gray-300'
                            }`}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon
                      </label>
                      <select
                        name="icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {CATEGORY_ICONS.map(icon => (
                          <option key={icon.value} value={icon.value}>
                            {icon.icon} {icon.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingCategory(null);
                        setFormData({ name: '', description: '', color: 'blue', icon: 'folder', parent_id: '' });
                      }}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      <FiSave className="w-4 h-4" />
                      <span>{editingCategory ? 'Update' : 'Create'} Category</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* Categories List */
              <div className="space-y-6">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategories.map((category) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg ${getCategoryColor(category.color)} flex items-center justify-center text-white`}>
                            <span className="text-lg">{category.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {category.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {category.content_count} items
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Category"
                          >
                            <FiEdit3 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Category"
                          >
                            <FiTrash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {category.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {category.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created {new Date(category.created_at).toLocaleDateString()}</span>
                        {onCategorySelected && (
                          <button
                            onClick={() => onCategorySelected(category)}
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                          >
                            Select
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredCategories.length === 0 && (
                  <div className="text-center py-12">
                    <FiFolder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchTerm ? 'No categories found' : 'No categories yet'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm 
                        ? 'Try adjusting your search terms'
                        : 'Create your first category to start organizing content'
                      }
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <FiPlus className="w-4 h-4" />
                        <span>Create Category</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
