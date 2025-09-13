'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from '@/hooks/useAuditLog';
import { examinationService } from '@/lib/services/examinationService';
import { academicService } from '@/lib/services/academicService';

interface ExaminationFormData {
  examName: string;
  examType: string;
  examLevel: string;
  subjectId: string;
  maxMarks: number;
  weight: number;
  startDate: string;
  endDate: string;
  status: string;
  description: string;
}

export default function CreateExaminationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const auditLog = useAuditLog();
  
  const [formData, setFormData] = useState<ExaminationFormData>({
    examName: '',
    examType: 'QUIZ',
    examLevel: 'O_LEVEL',
    subjectId: '',
    maxMarks: 100,
    weight: 1,
    startDate: '',
    endDate: '',
    status: 'DRAFT',
    description: ''
  });
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      const response = await academicService.getSubjects();
      if (response.success && response.data) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxMarks' || name === 'weight' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.examName.trim() || !formData.startDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const createData = {
        examName: formData.examName,
        examType: formData.examType,
        examLevel: formData.examLevel,
        startDate: new Date(formData.startDate).toISOString(),
        maxMarks: formData.maxMarks,
        weight: formData.weight,
        status: formData.status,
        ...(formData.endDate && { endDate: new Date(formData.endDate).toISOString() }),
        ...(formData.subjectId && { subjectId: formData.subjectId }),
        ...(formData.description && { description: formData.description })
      };

      const response = await examinationService.createExamination(createData);
      if (response.success) {
        await auditLog.logAction('create', 'examination', response.data.id, { message: `Created examination: ${formData.examName}` });
        router.push('/academic/grades');
      } else {
        console.error('Failed to create examination:', response.message);
        alert('Failed to create examination: ' + response.message);
      }
    } catch (error) {
      console.error('Error creating examination:', error);
      alert('Error creating examination');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/academic/grades');
  };

  return (
    <RoleGuard permissions={['examinations:create']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleCancel}
              variant="outline"
              icon={FaArrowLeft}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Examination</h1>
              <p className="text-gray-600">Create a new examination for students</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="examName" className="block text-sm font-medium text-gray-700 mb-1">
                  Examination Name *
                </label>
                <input
                  type="text"
                  id="examName"
                  name="examName"
                  value={formData.examName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Mid-Term Mathematics Test"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="examType" className="block text-sm font-medium text-gray-700 mb-1">
                  Examination Type
                </label>
                <select
                  id="examType"
                  name="examType"
                  value={formData.examType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="QUIZ">Quiz</option>
                  <option value="MID_TERM">Mid-Term</option>
                  <option value="FINAL">Final</option>
                  <option value="MOCK">Mock</option>
                  <option value="NECTA">NECTA</option>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="PROJECT">Project</option>
                </select>
              </div>

              <div>
                <label htmlFor="examLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Examination Level
                </label>
                <select
                  id="examLevel"
                  name="examLevel"
                  value={formData.examLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PRIMARY">Primary</option>
                  <option value="O_LEVEL">O-Level</option>
                  <option value="A_LEVEL">A-Level</option>
                  <option value="UNIVERSITY">University</option>
                </select>
              </div>

              <div>
                <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  id="subjectId"
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.subjectName} ({subject.subjectCode})
                    </option>
                  ))}
                </select>
                {isLoading && <p className="text-sm text-gray-500 mt-1">Loading subjects...</p>}
              </div>

              <div>
                <label htmlFor="maxMarks" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Marks
                </label>
                <input
                  type="number"
                  id="maxMarks"
                  name="maxMarks"
                  value={formData.maxMarks}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="0.1"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">Weight for term calculation</p>
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">Optional end date for multi-day examinations</p>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional description for the examination..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                icon={FaTimes}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                icon={FaSave}
              >
                {isSubmitting ? 'Creating...' : 'Create Examination'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </RoleGuard>
  );
}
