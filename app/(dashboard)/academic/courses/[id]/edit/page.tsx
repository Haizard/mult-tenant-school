'use client';

import { useState, useEffect, use } from 'react';
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
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

interface Subject {
  id: string;
  name: string;
  code: string;
  level: string;
  type: string;
  credits: number;
}

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const [formData, setFormData] = useState<FormData>({
    courseCode: '',
    courseName: '',
    description: '',
    credits: 0,
    status: 'ACTIVE'
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Unwrap params using React.use()
  const resolvedParams = use(params);

  useEffect(() => {
    loadCourseAndSubjects();
  }, [resolvedParams.id]);

  const loadCourseAndSubjects = async () => {
    try {
      setLoadingData(true);
      
      // Check if user is authenticated
      const currentUser = authService.getCurrentUserSync();
      if (!currentUser) {
        notificationService.error('Please log in to access this page');
        window.location.href = '/login';
        return;
      }
      
      // Load course and subjects in parallel
      const [courseResponse, subjectsResponse] = await Promise.all([
        academicService.getCourseById(resolvedParams.id),
        academicService.getSubjects()
      ]);
      
      // Set course data
      setFormData({
        courseCode: courseResponse.courseCode,
        courseName: courseResponse.courseName,
        description: courseResponse.description || '',
        credits: courseResponse.credits,
        status: courseResponse.status
      });
      
      // Set selected subjects from course
      const courseSubjectIds = courseResponse.courseSubjects?.map(cs => cs.subject.id) || [];
      setSelectedSubjects(courseSubjectIds);
      
      // Transform subjects data
      if (subjectsResponse.success && subjectsResponse.data) {
        const apiSubjects = subjectsResponse.data.map(subject => ({
          id: subject.id,
          name: subject.subjectName,
          code: subject.subjectCode || '',
          level: subject.subjectLevel.replace('_', '-'),
          type: subject.subjectType,
          credits: subject.credits
        }));
        setSubjects(apiSubjects);
      }
      
    } catch (error) {
      console.error('Error loading course and subjects:', error);
      notificationService.error('Failed to load course details');
      window.location.href = '/academic/courses';
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

      notificationService.info('Updating course...');
      
      // API call to update course
      const courseData = {
        courseCode: formData.courseCode,
        courseName: formData.courseName,
        description: formData.description,
        credits: parseInt(formData.credits.toString()),
        status: formData.status
      };
      
      console.log('Updating course with data:', courseData);
      
      // Update course via API
      await academicService.updateCourse(resolvedParams.id, courseData);
      
      notificationService.success('Course updated successfully!');
      window.location.href = `/academic/courses/${resolvedParams.id}`;
      
    } catch (err) {
      console.error('Error updating course:', err);
      notificationService.error(err instanceof Error ? err.message : 'Failed to update course');
      
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
    window.location.href = `/academic/courses/${resolvedParams.id}`;
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading course details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border-accent-green/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack}>
              <FaArrowLeft className="mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Edit Course</h1>
              <p className="text-text-secondary">Update course information and settings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card variant="strong" glow="green">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Code */}
            <div>
              <label htmlFor="courseCode" className="block text-sm font-medium text-text-primary mb-2">
                Course Code *
              </label>
              <input
                type="text"
                id="courseCode"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleInputChange}
                required
                className="glass-input w-full"
                placeholder="e.g., CS101, MATH201"
              />
            </div>

            {/* Course Name */}
            <div>
              <label htmlFor="courseName" className="block text-sm font-medium text-text-primary mb-2">
                Course Name *
              </label>
              <input
                type="text"
                id="courseName"
                name="courseName"
                value={formData.courseName}
                onChange={handleInputChange}
                required
                className="glass-input w-full"
                placeholder="Enter course name"
              />
            </div>

            {/* Credits */}
            <div>
              <label htmlFor="credits" className="block text-sm font-medium text-text-primary mb-2">
                Credits *
              </label>
              <input
                type="number"
                id="credits"
                name="credits"
                value={formData.credits}
                onChange={handleInputChange}
                min="0"
                required
                className="glass-input w-full"
                placeholder="Number of credits"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-text-primary mb-2">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="glass-input w-full"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="glass-input w-full"
                placeholder="Enter course description"
              />
            </div>
          </div>

          {/* Subjects Selection */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-lg">
                <FaGraduationCap className="text-lg text-white" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Course Subjects</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(subject => (
                <div
                  key={subject.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedSubjects.includes(subject.id)
                      ? 'border-accent-green bg-accent-green/10'
                      : 'border-gray-200 hover:border-accent-blue'
                  }`}
                  onClick={() => handleSubjectToggle(subject.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-text-primary">{subject.name}</h4>
                      <p className="text-sm text-text-secondary">
                        {subject.code} • {subject.level} • {subject.type}
                      </p>
                      <p className="text-xs text-text-muted">{subject.credits} credits</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.id)}
                      onChange={() => handleSubjectToggle(subject.id)}
                      className="w-4 h-4 text-accent-green"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {subjects.length === 0 && (
              <div className="text-center py-8">
                <FaBook className="text-4xl text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary">No subjects available</p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <Button variant="ghost" onClick={handleBack} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Update Course
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
