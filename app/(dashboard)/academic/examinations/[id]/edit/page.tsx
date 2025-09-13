'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function EditExaminationPage() {
  const params = useParams();
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadExamination(params.id as string);
      loadSubjects();
    }
  }, [params.id]);

  const loadExamination = async (id: string) => {
    try {
      const response = await examinationService.getExaminationById(id);
      if (response.success && response.data) {
        const exam = response.data;
        setFormData({
          examName: exam.examName,
          examType: exam.examType,
          examLevel: exam.examLevel,
          subjectId: exam.subject?.id || '',
          maxMarks: exam.maxMarks,
          weight: exam.weight,
          startDate: exam.startDate.split('T')[0], // Convert to date input format
          endDate: exam.endDate ? exam.endDate.split('T')[0] : '',
          status: exam.status,
          description: exam.description || ''
        });
      }
    } catch (error) {
      console.error('Error loading examination:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await academicService.getSubjects();
      if (response.success && response.data) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
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
      const updateData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        subjectId: formData.subjectId || null
      };

      const response = await examinationService.updateExamination(params.id as string, updateData);
      if (response.success) {
        await auditLog.logAction('examination', 'update', params.id as string, `Updated examination: ${formData.examName}`);
        router.push(`/academic/examinations/${params.id}`);
      } else {
        console.error('Failed to update examination:', response.message);
        alert('Failed to update examination: ' + response.message);
      }
    } catch (error) {
      console.error('Error updating examination:', error);
      alert('Error updating examination');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/academic/examinations/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <RoleGuard permissions={['examinations:update']}>
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
              <h1 className="text-2xl font-bold text-gray-900">Edit Examination</h1>
              <p className="text-gray-600">Update examination details</p>
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
                {isSubmitting ? 'Updating...' : 'Update Examination'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </RoleGuard>
  );
}
