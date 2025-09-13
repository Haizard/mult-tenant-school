'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from '@/hooks/useAuditLog';
import { examinationService } from '@/lib/services/examinationService';

interface GradeFormData {
  rawMarks: number;
  comments: string;
  status: string;
}

interface GradeDetails {
  id: string;
  rawMarks: number;
  percentage: number;
  grade: string;
  points: number;
  status: string;
  comments?: string;
  examination: {
    id: string;
    examName: string;
    examType: string;
    examLevel: string;
    maxMarks: number;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  subject: {
    id: string;
    subjectName: string;
    subjectCode: string;
  };
}

export default function EditGradePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const auditLog = useAuditLog();
  
  const [grade, setGrade] = useState<GradeDetails | null>(null);
  const [formData, setFormData] = useState<GradeFormData>({
    rawMarks: 0,
    comments: '',
    status: 'DRAFT'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadGrade(params.id as string);
    }
  }, [params.id]);

  const loadGrade = async (id: string) => {
    try {
      const response = await examinationService.getGradeById(id);
      if (response.success && response.data) {
        const gradeData = response.data;
        setGrade(gradeData);
        setFormData({
          rawMarks: gradeData.rawMarks,
          comments: gradeData.comments || '',
          status: gradeData.status
        });
      }
    } catch (error) {
      console.error('Error loading grade:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateGradeInfo = (rawMarks: number, maxMarks: number, examLevel: string) => {
    const percentage = (rawMarks / maxMarks) * 100;
    
    // NECTA grading scale
    let grade, points;
    if (examLevel === 'UNIVERSITY') {
      if (percentage >= 90) { grade = 'A+'; points = 4.0; }
      else if (percentage >= 80) { grade = 'A'; points = 3.7; }
      else if (percentage >= 75) { grade = 'B+'; points = 3.3; }
      else if (percentage >= 70) { grade = 'B'; points = 3.0; }
      else if (percentage >= 65) { grade = 'C+'; points = 2.7; }
      else if (percentage >= 60) { grade = 'C'; points = 2.3; }
      else if (percentage >= 50) { grade = 'D'; points = 2.0; }
      else { grade = 'F'; points = 0; }
    } else {
      if (percentage >= 80) { grade = 'A'; points = 7; }
      else if (percentage >= 60) { grade = 'B'; points = 5; }
      else if (percentage >= 40) { grade = 'C'; points = 3; }
      else if (percentage >= 20) { grade = 'D'; points = 1; }
      else { grade = 'F'; points = 0; }
    }
    
    return { percentage, grade, points };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rawMarks' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!grade) return;
    
    if (formData.rawMarks < 0 || formData.rawMarks > grade.examination.maxMarks) {
      alert(`Raw marks must be between 0 and ${grade.examination.maxMarks}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const { percentage, grade: letterGrade, points } = calculateGradeInfo(
        formData.rawMarks, 
        grade.examination.maxMarks, 
        grade.examination.examLevel
      );

      const updateData = {
        rawMarks: formData.rawMarks,
        percentage: Math.round(percentage * 100) / 100,
        grade: letterGrade,
        points,
        comments: formData.comments.trim() || null,
        status: formData.status
      };

      const response = await examinationService.updateGrade(params.id as string, updateData);
      if (response.success) {
        await auditLog.logAction('grade', 'update', params.id as string, 
          `Updated grade for ${grade.student.firstName} ${grade.student.lastName}: ${formData.rawMarks}/${grade.examination.maxMarks}`);
        router.push(`/academic/grades/${params.id}`);
      } else {
        console.error('Failed to update grade:', response.message);
        alert('Failed to update grade: ' + response.message);
      }
    } catch (error) {
      console.error('Error updating grade:', error);
      alert('Error updating grade');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/academic/grades/${params.id}`);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': case 'A+': return 'green';
      case 'B': case 'B+': return 'blue';
      case 'C': case 'C+': return 'yellow';
      case 'D': return 'orange';
      case 'F': return 'red';
      default: return 'gray';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!grade) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Grade Not Found</h2>
        <p className="text-gray-600 mb-6">The grade you're trying to edit doesn't exist or has been deleted.</p>
        <Button onClick={() => router.push('/academic/grades')} icon={FaArrowLeft}>
          Back to Grades
        </Button>
      </div>
    );
  }

  const previewGrade = calculateGradeInfo(formData.rawMarks, grade.examination.maxMarks, grade.examination.examLevel);

  return (
    <RoleGuard permissions={['grades:update']}>
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
              <h1 className="text-2xl font-bold text-gray-900">Edit Grade</h1>
              <p className="text-gray-600">
                {grade.student.firstName} {grade.student.lastName} • {grade.subject.subjectName} • {grade.examination.examName}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="rawMarks" className="block text-sm font-medium text-gray-700 mb-1">
                      Raw Marks (out of {grade.examination.maxMarks}) *
                    </label>
                    <input
                      type="number"
                      id="rawMarks"
                      name="rawMarks"
                      value={formData.rawMarks}
                      onChange={handleInputChange}
                      min="0"
                      max={grade.examination.maxMarks}
                      required
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
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                    Comments
                  </label>
                  <textarea
                    id="comments"
                    name="comments"
                    value={formData.comments}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional comments about the grade..."
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
                    {isSubmitting ? 'Updating...' : 'Update Grade'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            {/* Grade Preview */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Preview</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {formData.rawMarks} / {grade.examination.maxMarks}
                    </div>
                    <div className="text-lg text-gray-600 mb-3">
                      {previewGrade.percentage.toFixed(1)}%
                    </div>
                    <StatusBadge 
                      status={previewGrade.grade} 
                      color={getGradeColor(previewGrade.grade)} 
                      size="lg" 
                    />
                    <div className="mt-2 text-sm text-gray-600">
                      {previewGrade.points} points
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Performance Level</div>
                    <div className={`font-semibold ${
                      previewGrade.percentage >= 80 ? 'text-green-600' :
                      previewGrade.percentage >= 60 ? 'text-blue-600' :
                      previewGrade.percentage >= 40 ? 'text-yellow-600' :
                      previewGrade.percentage >= 20 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {previewGrade.percentage >= 80 ? 'Excellent' :
                       previewGrade.percentage >= 60 ? 'Good' :
                       previewGrade.percentage >= 40 ? 'Average' :
                       previewGrade.percentage >= 20 ? 'Below Average' : 'Poor'}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Student Info */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student</h3>
                <div className="space-y-2">
                  <div>
                    <div className="font-medium text-gray-900">
                      {grade.student.firstName} {grade.student.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{grade.student.email}</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Examination Info */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Examination</h3>
                <div className="space-y-2">
                  <div>
                    <div className="font-medium text-gray-900">{grade.examination.examName}</div>
                    <div className="text-sm text-gray-500">
                      {grade.examination.examType.replace('_', ' ')} • {grade.examination.examLevel}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Max Marks: {grade.examination.maxMarks}
                  </div>
                </div>
              </div>
            </Card>

            {/* Subject Info */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject</h3>
                <div>
                  <div className="font-medium text-gray-900">{grade.subject.subjectName}</div>
                  <div className="text-sm text-gray-500">{grade.subject.subjectCode}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
