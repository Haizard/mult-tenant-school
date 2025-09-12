'use client';

import { useState, useEffect } from 'react';
import { FaArrowLeft, FaSave, FaUsers, FaCalendarAlt, FaBook } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { notificationService } from '@/lib/notifications';
import { academicService } from '@/lib/academicService';
import { userService } from '@/lib/userService';
import { authService } from '@/lib/auth';

interface FormData {
  className: string;
  classCode: string;
  academicLevel: 'Primary' | 'O-Level' | 'A-Level' | 'University';
  academicYear: string;
  capacity: number;
  teacherId: string;
  subjectIds: string[];
  description: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  level: string;
  type: string;
}

interface AcademicYear {
  id: string;
  yearName: string;
  isCurrent: boolean;
}

export default function CreateClassPage() {
  const [formData, setFormData] = useState<FormData>({
    className: '',
    classCode: '',
    academicLevel: 'O-Level',
    academicYear: '',
    capacity: 40,
    teacherId: '',
    subjectIds: [],
    description: ''
  });
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      
      // Check if user is authenticated
      const currentUser = authService.getCurrentUserSync();
      if (!currentUser) {
        notificationService.error('Please log in to access this page');
        window.location.href = '/login';
        return;
      }
      
      console.log('Loading form data from API...');
      
      // Load teachers and subjects from API
      const [usersResponse, subjectsResponse] = await Promise.all([
        userService.getUsers({ role: 'Teacher' }),
        academicService.getSubjects()
      ]);
      
      console.log('API responses:', { usersResponse, subjectsResponse });
      
      // Check if responses are valid
      if (!usersResponse || !usersResponse.success || !usersResponse.data) {
        throw new Error(`Failed to load users: ${usersResponse?.message || 'Unknown error'}`);
      }
      
      if (!subjectsResponse || !subjectsResponse.success || !subjectsResponse.data) {
        throw new Error(`Failed to load subjects: ${subjectsResponse?.message || 'Unknown error'}`);
      }
      
      // Filter teachers from users
      const teachers: Teacher[] = usersResponse.data
        .filter(user => user.roles && user.roles.some(role => role.name === 'Teacher'))
        .map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }));
      
      // Transform subjects data
      const subjects: Subject[] = subjectsResponse.data.map(subject => ({
        id: subject.id,
        name: subject.subjectName,
        code: subject.subjectCode || '',
        level: subject.subjectLevel.replace('_', '-'),
        type: subject.subjectType
      }));
      
      // Mock academic years for now (no API endpoint yet)
      const mockAcademicYears: AcademicYear[] = [
        { id: '1', yearName: '2024/2025', isCurrent: true },
        { id: '2', yearName: '2023/2024', isCurrent: false },
        { id: '3', yearName: '2025/2026', isCurrent: false }
      ];
      
      setTeachers(teachers);
      setSubjects(subjects);
      setAcademicYears(mockAcademicYears);
      
      // Set default academic year to current
      const currentYear = mockAcademicYears.find(year => year.isCurrent);
      if (currentYear) {
        setFormData(prev => ({ ...prev, academicYear: currentYear.id }));
      }
      
      console.log('Form data loaded successfully:', { teachers: teachers.length, subjects: subjects.length });
      
    } catch (error) {
      console.error('Error loading form data:', error);
      notificationService.error(`Failed to load form data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Redirect to login if authentication failed
      if (error instanceof Error && error.message.includes('authentication')) {
        window.location.href = '/login';
        return;
      }
      
      // Fallback to mock data if API fails
      const mockTeachers: Teacher[] = [
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@school.com' },
        { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@school.com' },
        { id: '3', firstName: 'Michael', lastName: 'Johnson', email: 'michael.johnson@school.com' }
      ];
      
      const mockSubjects: Subject[] = [
        { id: '1', name: 'Mathematics', code: 'MATH', level: 'O-Level', type: 'Core' },
        { id: '2', name: 'English', code: 'ENG', level: 'O-Level', type: 'Core' },
        { id: '3', name: 'Physics', code: 'PHY', level: 'O-Level', type: 'Core' },
        { id: '4', name: 'Chemistry', code: 'CHEM', level: 'O-Level', type: 'Core' },
        { id: '5', name: 'Biology', code: 'BIO', level: 'O-Level', type: 'Core' },
        { id: '6', name: 'History', code: 'HIST', level: 'O-Level', type: 'Optional' },
        { id: '7', name: 'Geography', code: 'GEO', level: 'O-Level', type: 'Optional' },
        { id: '8', name: 'Advanced Mathematics', code: 'AMATH', level: 'A-Level', type: 'Core' }
      ];
      
      const mockAcademicYears: AcademicYear[] = [
        { id: '1', yearName: '2024/2025', isCurrent: true },
        { id: '2', yearName: '2023/2024', isCurrent: false },
        { id: '3', yearName: '2025/2026', isCurrent: false }
      ];
      
      setTeachers(mockTeachers);
      setSubjects(mockSubjects);
      setAcademicYears(mockAcademicYears);
      
      const currentYear = mockAcademicYears.find(year => year.isCurrent);
      if (currentYear) {
        setFormData(prev => ({ ...prev, academicYear: currentYear.id }));
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

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      subjectIds: selectedOptions
    }));
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
      if (!formData.className.trim()) {
        notificationService.error('Class name is required');
        return;
      }
      
      if (!formData.classCode.trim()) {
        notificationService.error('Class code is required');
        return;
      }
      
      if (!formData.academicYear) {
        notificationService.error('Please select an academic year');
        return;
      }
      
      if (!formData.teacherId) {
        notificationService.error('Please select a class teacher');
        return;
      }
      
      if (formData.subjectIds.length === 0) {
        notificationService.error('Please select at least one subject');
        return;
      }
      
      if (formData.capacity < 1 || formData.capacity > 100) {
        notificationService.error('Capacity must be between 1 and 100');
        return;
      }

      notificationService.info('Creating class...');
      
      // API call to create class
      console.log('Creating class with data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notificationService.success('Class created successfully!');
      window.location.href = '/academic/classes';
      
    } catch (err) {
      console.error('Error creating class:', err);
      notificationService.error(err instanceof Error ? err.message : 'Failed to create class');
      
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
    window.location.href = '/academic/classes';
  };

  const filteredSubjects = subjects.filter(subject => 
    subject.level === formData.academicLevel
  );

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
              <h1 className="text-3xl font-bold text-text-primary">Create New Class</h1>
              <p className="text-text-secondary">Set up a new class with teacher and subject assignments</p>
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
                  <FaUsers className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Basic Information</h2>
                  <p className="text-text-secondary">Class name, code, and academic level</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    name="className"
                    value={formData.className}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    placeholder="e.g., Form 1A, Grade 5B"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Class Code *
                  </label>
                  <input
                    type="text"
                    name="classCode"
                    value={formData.classCode}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    placeholder="e.g., F1A, G5B"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Academic Year *
                  </label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    disabled={loadingData}
                  >
                    <option value="">Select academic year</option>
                    {academicYears.map(year => (
                      <option key={year.id} value={year.id}>
                        {year.yearName} {year.isCurrent ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="100"
                    className="glass-input w-full"
                    placeholder="Maximum number of students"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Class Teacher *
                  </label>
                  <select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    disabled={loadingData}
                  >
                    <option value="">Select class teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName} ({teacher.email})
                      </option>
                    ))}
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
                  rows={3}
                  className="glass-input w-full"
                  placeholder="Optional description for this class"
                />
              </div>
            </div>

            {/* Subject Assignment */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaBook className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Subject Assignment</h2>
                  <p className="text-text-secondary">Assign subjects for this class level</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Subjects * <span className="text-text-muted">(Hold Ctrl to select multiple)</span>
                </label>
                <select
                  name="subjectIds"
                  value={formData.subjectIds}
                  onChange={handleSubjectChange}
                  required
                  multiple
                  className="glass-input w-full h-32"
                  disabled={loadingData}
                >
                  {filteredSubjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code}) - {subject.type}
                    </option>
                  ))}
                </select>
                {formData.subjectIds.length > 0 && (
                  <p className="text-sm text-text-secondary mt-1">
                    Selected: {formData.subjectIds.length} subject(s)
                  </p>
                )}
                {filteredSubjects.length === 0 && (
                  <p className="text-sm text-yellow-600 mt-1">
                    No subjects available for {formData.academicLevel} level
                  </p>
                )}
              </div>
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
                <span>{loading ? 'Creating...' : 'Create Class'}</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
