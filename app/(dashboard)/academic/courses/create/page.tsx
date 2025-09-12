'use client';

import { useState, useEffect } from 'react';
import { FaArrowLeft, FaSave, FaBook, FaGraduationCap } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { notificationService } from '@/lib/notifications';
import { academicService } from '@/lib/academicService';
import { authService } from '@/lib/auth';

interface FormData {
  courseCode: string;
  courseName: string;
  description: string;
  credits: number;
  academicLevel: 'Primary' | 'O-Level' | 'A-Level' | 'University';
  duration: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface Subject {
  id: string;
  name: string;
  code: string;
  level: string;
  type: string;
  credits: number;
}

export default function CreateCoursePage() {
  const [formData, setFormData] = useState<FormData>({
    courseCode: '',
    courseName: '',
    description: '',
    credits: 0,
    academicLevel: 'O-Level',
    duration: '1 year',
    status: 'ACTIVE'
  });
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoadingData(true);
      
      // Check if user is authenticated
      const currentUser = authService.getCurrentUserSync();
      if (!currentUser) {
        notificationService.error('Please log in to access this page');
        window.location.href = '/login';
        return;
      }
      
      console.log('Loading subjects from API...');
      
      // Load subjects from API
      const response = await academicService.getSubjects();
      console.log('Subjects API response:', response);
      
      if (!response || !response.success || !response.data) {
        throw new Error(`Failed to load subjects: ${response?.message || 'Unknown error'}`);
      }
      
      const apiSubjects = response.data.map(subject => ({
        id: subject.id,
        name: subject.subjectName,
        code: subject.subjectCode || '',
        level: subject.subjectLevel.replace('_', '-'),
        type: subject.subjectType,
        credits: subject.credits
      }));
      
      setSubjects(apiSubjects);
      console.log('Subjects loaded successfully:', apiSubjects.length);
      
    } catch (error) {
      console.error('Error loading subjects:', error);
      notificationService.error(`Failed to load subjects: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Redirect to login if authentication failed
      if (error instanceof Error && error.message.includes('authentication')) {
        window.location.href = '/login';
        return;
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const currentUser = authService.getCurrentUserSync();
      if (!currentUser) {
        notificationService.error('Please log in to access this page');
        window.location.href = '/login';
        return;
      }
      
      // Client-side validation
      if (!formData.courseCode.trim()) {
        notificationService.error('Course code is required');
        return;
      }
      
      if (!formData.courseName.trim()) {
        notificationService.error('Course name is required');
        return;
      }
      
      if (formData.credits < 0) {
        notificationService.error('Credits must be a positive number');
        return;
      }

      notificationService.info('Creating course...');
      
      // API call to create course
      const courseData = {
        courseCode: formData.courseCode,
        courseName: formData.courseName,
        description: formData.description,
        credits: parseInt(formData.credits.toString()),
        status: formData.status,
        subjectIds: selectedSubjects
      };
      
      console.log('Creating course with data:', courseData);
      
      // Create course via API
      await academicService.createCourse(courseData);
      
      notificationService.success('Course created successfully!');
      window.location.href = '/academic/courses';
      
    } catch (err) {
      console.error('Error creating course:', err);
      notificationService.error(err instanceof Error ? err.message : 'Failed to create course');
      
      // Redirect to login if authentication failed
      if (err instanceof Error && err.message.includes('authentication')) {
        window.location.href = '/login';
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/academic/courses';
  };

  const filteredSubjects = subjects.filter(subject => 
    subject.level === formData.academicLevel
  );

  const totalCredits = selectedSubjects.reduce((total, subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return total + (subject?.credits || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleBack}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <FaArrowLeft />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Create New Course</h1>
              <p className="text-text-secondary">Set up a new academic course with subject assignments</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaBook className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Course Information</h2>
                  <p className="text-text-secondary">Basic course details and configuration</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    placeholder="e.g., MATH101, ENG201"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    placeholder="e.g., Advanced Mathematics"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Academic Level *
                  </label>
                  <select
                    name="academicLevel"
                    value={formData.academicLevel}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                  >
                    <option value="Primary">Primary</option>
                    <option value="O-Level">O-Level</option>
                    <option value="A-Level">A-Level</option>
                    <option value="University">University</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Credits
                  </label>
                  <input
                    type="number"
                    name="credits"
                    value={formData.credits}
                    onChange={handleInputChange}
                    min="0"
                    className="glass-input w-full"
                    placeholder="Total credits"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Duration
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="glass-input w-full"
                  >
                    <option value="1 semester">1 Semester</option>
                    <option value="1 year">1 Year</option>
                    <option value="2 years">2 Years</option>
                    <option value="3 years">3 Years</option>
                    <option value="4 years">4 Years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="glass-input w-full"
                  placeholder="Course description and objectives"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="glass-input w-full"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {/* Subject Assignment */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaGraduationCap className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Subject Assignment</h2>
                  <p className="text-text-secondary">Select subjects for this course</p>
                </div>
              </div>

              {filteredSubjects.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSubjects.map(subject => (
                      <div
                        key={subject.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedSubjects.includes(subject.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSubjectToggle(subject.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-text-primary">{subject.name}</h4>
                            <p className="text-sm text-text-secondary">{subject.code}</p>
                            <p className="text-xs text-text-muted">{subject.type}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-text-primary">{subject.credits} credits</span>
                            {selectedSubjects.includes(subject.id) && (
                              <div className="text-blue-500 text-sm">✓ Selected</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedSubjects.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">
                          Selected: {selectedSubjects.length} subject(s)
                        </span>
                        <span className="text-sm font-medium text-text-primary">
                          Total Credits: {totalCredits}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg">
                  <div className="text-gray-400 text-4xl mb-2">📚</div>
                  <p className="text-text-secondary">
                    No subjects available for {formData.academicLevel} level
                  </p>
                  <p className="text-sm text-text-muted mt-1">
                    Create subjects first or select a different academic level
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleBack}
                variant="secondary"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || loadingData}
                className="flex items-center space-x-2"
              >
                <FaSave />
                <span>{loading ? 'Creating...' : 'Create Course'}</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
