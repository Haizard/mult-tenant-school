'use client';

import { useState, useEffect, use } from 'react';
import { FaArrowLeft, FaSave, FaGraduationCap, FaBook } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { notificationService } from '@/lib/notifications';
import { academicService } from '@/lib/academicService';
import { authService } from '@/lib/auth';

interface FormData {
  subjectName: string;
  subjectCode: string;
  subjectLevel: 'Primary' | 'O-Level' | 'A-Level' | 'University';
  subjectType: 'Core' | 'Optional' | 'Combination';
  description: string;
  credits: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export default function EditSubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const [formData, setFormData] = useState<FormData>({
    subjectName: '',
    subjectCode: '',
    subjectLevel: 'O-Level',
    subjectType: 'Core',
    description: '',
    credits: 0,
    status: 'ACTIVE'
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Unwrap params using React.use()
  const resolvedParams = use(params);

  useEffect(() => {
    loadSubject();
  }, [resolvedParams.id]);

  const loadSubject = async () => {
    try {
      setLoadingData(true);
      
      // Check if user is authenticated
      const currentUser = authService.getCurrentUserSync();
      if (!currentUser) {
        notificationService.error('Please log in to access this page');
        window.location.href = '/login';
        return;
      }
      
      const subject = await academicService.getSubjectById(resolvedParams.id);
      
      setFormData({
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode || '',
        subjectLevel: subject.subjectLevel.replace('_', '-') as any,
        subjectType: subject.subjectType.charAt(0) + subject.subjectType.slice(1).toLowerCase() as any,
        description: subject.description || '',
        credits: subject.credits,
        status: subject.status
      });
      
    } catch (error) {
      console.error('Error loading subject:', error);
      notificationService.error('Failed to load subject details');
      window.location.href = '/academic/subjects';
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

      notificationService.info('Updating subject...');
      
      // API call to update subject
      const subjectData = {
        subjectName: formData.subjectName,
        subjectCode: formData.subjectCode,
        subjectLevel: formData.subjectLevel.replace('-', '_').toUpperCase(),
        subjectType: formData.subjectType.toUpperCase(),
        description: formData.description,
        credits: parseInt(formData.credits.toString()),
        status: formData.status
      };
      
      console.log('Updating subject with data:', subjectData);
      
      // Update subject via API
      await academicService.updateSubject(resolvedParams.id, subjectData);
      
      notificationService.success('Subject updated successfully!');
      window.location.href = `/academic/subjects/${resolvedParams.id}`;
      
    } catch (err) {
      console.error('Error updating subject:', err);
      notificationService.error(err instanceof Error ? err.message : 'Failed to update subject');
      
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
    window.location.href = `/academic/subjects/${resolvedParams.id}`;
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading subject details...</p>
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
              <h1 className="text-3xl font-bold text-text-primary mb-2">Edit Subject</h1>
              <p className="text-text-secondary">Update subject information and settings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card variant="strong" glow="green">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject Name */}
            <div className="md:col-span-2">
              <label htmlFor="subjectName" className="block text-sm font-medium text-text-primary mb-2">
                Subject Name *
              </label>
              <input
                type="text"
                id="subjectName"
                name="subjectName"
                value={formData.subjectName}
                onChange={handleInputChange}
                required
                className="glass-input w-full"
                placeholder="Enter subject name"
              />
            </div>

            {/* Subject Code */}
            <div>
              <label htmlFor="subjectCode" className="block text-sm font-medium text-text-primary mb-2">
                Subject Code *
              </label>
              <input
                type="text"
                id="subjectCode"
                name="subjectCode"
                value={formData.subjectCode}
                onChange={handleInputChange}
                required
                className="glass-input w-full"
                placeholder="e.g., MATH, ENG"
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

            {/* Academic Level */}
            <div>
              <label htmlFor="subjectLevel" className="block text-sm font-medium text-text-primary mb-2">
                Academic Level *
              </label>
              <select
                id="subjectLevel"
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

            {/* Subject Type */}
            <div>
              <label htmlFor="subjectType" className="block text-sm font-medium text-text-primary mb-2">
                Subject Type *
              </label>
              <select
                id="subjectType"
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
                placeholder="Enter subject description"
              />
            </div>
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
                  Update Subject
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
