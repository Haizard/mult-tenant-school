'use client';

import { useState, useEffect } from 'react';
import { FaArrowLeft, FaSave, FaGraduationCap, FaBook, FaChalkboardTeacher } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { notificationService } from '@/lib/notifications';
import { academicService } from '@/lib/academicService';
import { authService } from '@/lib/auth';
import { userService } from '@/lib/userService';

interface FormData {
  subjectName: string;
  subjectCode: string;
  subjectLevel: 'Primary' | 'O-Level' | 'A-Level' | 'University';
  subjectType: 'Core' | 'Optional' | 'Combination';
  description: string;
  credits: number;
  status: 'ACTIVE' | 'INACTIVE';
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function CreateSubjectPage() {
  const [formData, setFormData] = useState<FormData>({
    subjectName: '',
    subjectCode: '',
    subjectLevel: 'O-Level',
    subjectType: 'Core',
    description: '',
    credits: 0,
    status: 'ACTIVE'
  });
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoadingData(true);
      
      // Check if user is authenticated
      const currentUser = authService.getCurrentUserSync();
      if (!currentUser) {
        notificationService.error('Please log in to access this page');
        window.location.href = '/login';
        return;
      }
      
      console.log('Loading teachers from API...');
      
      // Load teachers from API
      const response = await userService.getTeachers();
      console.log('Teachers API response:', response);
      
      if (!response || !response.success || !response.data) {
        throw new Error(`Failed to load teachers: ${response?.message || 'Unknown error'}`);
      }
      
      setTeachers(response.data);
      console.log('Teachers loaded successfully:', response.data.length);
      
    } catch (error) {
      console.error('Error loading teachers:', error);
      notificationService.error(`Failed to load teachers: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
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

  const handleTeacherToggle = (teacherId: string) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
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
      if (!formData.subjectName.trim()) {
        notificationService.error('Subject name is required');
        return;
      }
      
      if (!formData.subjectCode.trim()) {
        notificationService.error('Subject code is required');
        return;
      }
      
      if (formData.credits < 0) {
        notificationService.error('Credits must be a positive number');
        return;
      }

      notificationService.info('Creating subject...');
      
      // API call to create subject
      const subjectData = {
        subjectName: formData.subjectName,
        subjectCode: formData.subjectCode,
        subjectLevel: formData.subjectLevel.replace('-', '_').toUpperCase(),
        subjectType: formData.subjectType.toUpperCase(),
        description: formData.description,
        credits: parseInt(formData.credits.toString()),
        status: formData.status
      };
      
      console.log('Creating subject with data:', subjectData);
      
      // Create subject via API
      const subjectResponse = await academicService.createSubject(subjectData);
      
      // Assign teachers to subject if any are selected
      if (selectedTeachers.length > 0 && subjectResponse?.data?.id) {
        console.log('Assigning teachers to subject:', selectedTeachers);
        
        // Assign each selected teacher to the subject
        for (const teacherId of selectedTeachers) {
          try {
            await academicService.assignTeacherToSubject(teacherId, subjectResponse.data.id);
          } catch (assignmentError) {
            console.error(`Failed to assign teacher ${teacherId}:`, assignmentError);
            // Continue with other assignments even if one fails
          }
        }
      }
      
      notificationService.success('Subject created successfully!');
      window.location.href = '/academic/subjects';
      
    } catch (err) {
      console.error('Error creating subject:', err);
      notificationService.error(err instanceof Error ? err.message : 'Failed to create subject');
      
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
    window.location.href = '/academic/subjects';
  };

  const getSubjectTypeDescription = (type: string, level: string) => {
    const descriptions = {
      'Core': {
        'Primary': 'Essential subjects required for primary education',
        'O-Level': 'Core subjects required for O-Level completion (NECTA)',
        'A-Level': 'Core subjects required for A-Level completion (NECTA)',
        'University': 'Core subjects required for degree completion'
      },
      'Optional': {
        'Primary': 'Elective subjects students can choose from',
        'O-Level': 'Choice subjects students can select (NECTA)',
        'A-Level': 'Recommended subjects for specific combinations',
        'University': 'Elective subjects for specialization'
      },
      'Combination': {
        'Primary': 'Subject combinations for primary level',
        'O-Level': 'Not applicable for O-Level',
        'A-Level': 'Subject combinations like EGM, PCB, HKL (NECTA)',
        'University': 'Subject combinations for degree programs'
      }
    };
    
    return descriptions[type as keyof typeof descriptions]?.[level as keyof typeof descriptions.Core] || '';
  };

  const getNECTAExamples = (level: string, type: string) => {
    if (level === 'O-Level' && type === 'Core') {
      return ['Mathematics', 'English', 'Kiswahili', 'Physics', 'Chemistry', 'Biology'];
    }
    if (level === 'O-Level' && type === 'Optional') {
      return ['History', 'Geography', 'Commerce', 'Book Keeping', 'Literature'];
    }
    if (level === 'A-Level' && type === 'Core') {
      return ['Advanced Mathematics', 'General Studies'];
    }
    if (level === 'A-Level' && type === 'Combination') {
      return ['EGM (Economics, Geography, Mathematics)', 'PCB (Physics, Chemistry, Biology)', 'HKL (History, Kiswahili, Literature)'];
    }
    return [];
  };

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
              <h1 className="text-3xl font-bold text-text-primary">Create New Subject</h1>
              <p className="text-text-secondary">Set up a new academic subject with NECTA compliance</p>
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
                  <FaGraduationCap className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Subject Information</h2>
                  <p className="text-text-secondary">Basic subject details and NECTA configuration</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    name="subjectName"
                    value={formData.subjectName}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    placeholder="e.g., Mathematics, Physics"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    name="subjectCode"
                    value={formData.subjectCode}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    placeholder="e.g., MATH, PHY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Academic Level *
                  </label>
                  <select
                    name="subjectLevel"
                    value={formData.subjectLevel}
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
                    Subject Type *
                  </label>
                  <select
                    name="subjectType"
                    value={formData.subjectType}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                  >
                    <option value="Core">Core</option>
                    <option value="Optional">Optional</option>
                    <option value="Combination">Combination</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Subject credits"
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
                  placeholder="Subject description and learning objectives"
                />
              </div>
            </div>

            {/* NECTA Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <FaBook className="text-green-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">NECTA Compliance</h2>
                  <p className="text-text-secondary">Tanzanian education system requirements</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-text-primary mb-2">
                  {formData.subjectType} Subject - {formData.subjectLevel}
                </h4>
                <p className="text-sm text-text-secondary mb-3">
                  {getSubjectTypeDescription(formData.subjectType, formData.subjectLevel)}
                </p>
                
                {getNECTAExamples(formData.subjectLevel, formData.subjectType).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-text-primary mb-2">Examples:</p>
                    <ul className="text-sm text-text-secondary list-disc list-inside">
                      {getNECTAExamples(formData.subjectLevel, formData.subjectType).map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* NECTA-specific warnings */}
              {formData.subjectLevel === 'A-Level' && formData.subjectType === 'Combination' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="text-yellow-600 text-lg">⚠️</div>
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">A-Level Combination Subject</h4>
                      <p className="text-sm text-yellow-700">
                        This subject represents a combination (EGM, PCB, HKL). Make sure to include all component subjects 
                        in the subject name and description.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {formData.subjectLevel === 'O-Level' && formData.subjectType === 'Optional' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="text-green-600 text-lg">ℹ️</div>
                    <div>
                      <h4 className="font-medium text-green-800 mb-1">O-Level Choice Subject</h4>
                      <p className="text-sm text-green-700">
                        This is a choice subject that students can select as part of their O-Level program. 
                        Students typically choose 2-3 choice subjects.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Teacher Assignment */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaChalkboardTeacher className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Teacher Assignment</h2>
                  <p className="text-text-secondary">Assign teachers to this subject (optional)</p>
                </div>
              </div>

              {teachers.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teachers.map(teacher => (
                      <div
                        key={teacher.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedTeachers.includes(teacher.id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleTeacherToggle(teacher.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-text-primary">
                              {teacher.firstName} {teacher.lastName}
                            </h4>
                            <p className="text-sm text-text-secondary">{teacher.email}</p>
                          </div>
                          {selectedTeachers.includes(teacher.id) && (
                            <div className="text-purple-500 text-sm">✓ Selected</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedTeachers.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">
                          Selected: {selectedTeachers.length} teacher(s)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg">
                  <div className="text-gray-400 text-4xl mb-2">👨‍🏫</div>
                  <p className="text-text-secondary">
                    No teachers available
                  </p>
                  <p className="text-sm text-text-muted mt-1">
                    Create teacher accounts first to assign them to subjects
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
                <span>{loading ? 'Creating...' : 'Create Subject'}</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
