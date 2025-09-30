'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiUsers, 
  FiUser, 
  FiCalendar, 
  FiMessageSquare,
  FiCheck,
  FiClock,
  FiSearch
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { Content, contentService } from '../../lib/services/contentService';

interface ShareContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content;
  onContentShared: () => void;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  class_name?: string;
  student_id: string;
}

interface Class {
  id: string;
  name: string;
  grade_level: string;
  student_count: number;
}

type AssignmentType = 'student' | 'class' | 'grade';

export default function ShareContentModal({ isOpen, onClose, content, onContentShared }: ShareContentModalProps) {
  const [loading, setLoading] = useState(false);
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('class');
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    due_date: '',
    instructions: '',
    is_mandatory: false
  });

  // Load students and classes on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // These would typically come from actual API endpoints
        // For now, we'll use placeholder data
        setStudents([
          { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@school.com', student_id: 'S001', class_name: 'Form 1A' },
          { id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane@school.com', student_id: 'S002', class_name: 'Form 1A' },
          { id: '3', first_name: 'Bob', last_name: 'Johnson', email: 'bob@school.com', student_id: 'S003', class_name: 'Form 1B' },
          { id: '4', first_name: 'Alice', last_name: 'Williams', email: 'alice@school.com', student_id: 'S004', class_name: 'Form 2A' }
        ]);
        
        setClasses([
          { id: '1', name: 'Form 1A', grade_level: 'Form 1', student_count: 25 },
          { id: '2', name: 'Form 1B', grade_level: 'Form 1', student_count: 23 },
          { id: '3', name: 'Form 2A', grade_level: 'Form 2', student_count: 28 },
          { id: '4', name: 'Form 2B', grade_level: 'Form 2', student_count: 26 }
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load students and classes');
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleTargetSelection = (targetId: string) => {
    setSelectedTargets(prev => {
      if (prev.includes(targetId)) {
        return prev.filter(id => id !== targetId);
      } else {
        return [...prev, targetId];
      }
    });
  };

  const handleSelectAll = () => {
    const currentTargets = assignmentType === 'student' 
      ? filteredStudents.map(s => s.id)
      : classes.map(c => c.id);
    
    if (selectedTargets.length === currentTargets.length) {
      setSelectedTargets([]);
    } else {
      setSelectedTargets(currentTargets);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTargets.length === 0) {
      toast.error('Please select at least one target to share with');
      return;
    }

    try {
      setLoading(true);
      
      const assignmentData = {
        assignment_type: assignmentType,
        target_ids: selectedTargets,
        due_date: formData.due_date ? new Date(formData.due_date) : undefined,
        instructions: formData.instructions || undefined,
        is_mandatory: formData.is_mandatory
      };
      
      await contentService.assignContent(content.id, assignmentData);
      onContentShared();
      
      // Reset form
      setSelectedTargets([]);
      setFormData({
        due_date: '',
        instructions: '',
        is_mandatory: false
      });
      
    } catch (error) {
      console.error('Error sharing content:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to share content');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSelectedCount = () => {
    if (assignmentType === 'student') {
      return selectedTargets.length;
    } else if (assignmentType === 'class') {
      return classes.filter(c => selectedTargets.includes(c.id))
        .reduce((total, cls) => total + cls.student_count, 0);
    }
    return 0;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Share Content</h2>
              <p className="text-sm text-gray-600">
                Share "{content.title}" with students and classes
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Assignment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Share With
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAssignmentType('student');
                      setSelectedTargets([]);
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      assignmentType === 'student'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiUser className="w-4 h-4" />
                    <span>Individual Students</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignmentType('class');
                      setSelectedTargets([]);
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      assignmentType === 'class'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiUsers className="w-4 h-4" />
                    <span>Entire Classes</span>
                  </button>
                </div>
              </div>

              {/* Search and Select All */}
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={assignmentType === 'student' ? 'Search students...' : 'Search classes...'}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  {selectedTargets.length === (assignmentType === 'student' ? filteredStudents.length : classes.length)
                    ? 'Deselect All'
                    : 'Select All'
                  }
                </button>
              </div>

              {/* Selection List */}
              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                {assignmentType === 'student' ? (
                  <div className="divide-y divide-gray-100">
                    {filteredStudents.map((student) => (
                      <label
                        key={student.id}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTargets.includes(student.id)}
                          onChange={() => handleTargetSelection(student.id)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {student.first_name} {student.last_name}
                            </span>
                            <span className="text-xs text-gray-500">({student.student_id})</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.email} • {student.class_name}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {classes.map((cls) => (
                      <label
                        key={cls.id}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTargets.includes(cls.id)}
                          onChange={() => handleTargetSelection(cls.id)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{cls.name}</span>
                            <span className="text-xs text-gray-500">({cls.grade_level})</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {cls.student_count} students
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Selection Summary */}
              {selectedTargets.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-purple-700">
                    <FiCheck className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Selected: {selectedTargets.length} {assignmentType === 'student' ? 'students' : 'classes'}
                      {assignmentType === 'class' && ` (${getSelectedCount()} students total)`}
                    </span>
                  </div>
                </div>
              )}

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date (Optional)
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="datetime-local"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions (Optional)
                </label>
                <div className="relative">
                  <FiMessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Add any specific instructions for this content..."
                  />
                </div>
              </div>

              {/* Mandatory Checkbox */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="is_mandatory"
                  checked={formData.is_mandatory}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label className="text-sm text-gray-700">
                  Mark as mandatory content
                </label>
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
                  disabled={loading || selectedTargets.length === 0}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <>
                      <FiUsers className="w-4 h-4" />
                      <span>Share Content</span>
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
