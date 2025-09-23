'use client';

import { useState, useEffect, use } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { notificationService } from '@/lib/notifications';
import { academicService } from '@/lib/academicService';
import { authService } from '@/lib/auth';

interface FormData {
  className: string;
  classCode: string;
  capacity: number;
  description: string;
}

export default function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [formData, setFormData] = useState<FormData>({
    className: '',
    classCode: '',
    capacity: 40,
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadClassData();
  }, [id]);

  const loadClassData = async () => {
    try {
      setLoadingData(true);
      
      const currentUser = authService.getCurrentUserSync();
      if (!currentUser) {
        notificationService.error('Please log in to access this page');
        window.location.href = '/login';
        return;
      }
      
      const classesResponse = await academicService.getClasses();
      const classData = classesResponse?.data?.find((cls: any) => cls.id === id);
      
      if (classData) {
        setFormData({
          className: classData.className,
          classCode: classData.classCode,
          capacity: classData.capacity,
          description: classData.description || ''
        });
      }
      
    } catch (error) {
      console.error('Error loading class data:', error);
      notificationService.error('Failed to load class data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      
      const currentUser = authService.getCurrentUserSync();
      if (!currentUser) {
        notificationService.error('Please log in to access this page');
        window.location.href = '/login';
        return;
      }
      
      if (!formData.className.trim()) {
        notificationService.error('Class name is required');
        return;
      }
      
      if (!formData.classCode.trim()) {
        notificationService.error('Class code is required');
        return;
      }
      
      if (formData.capacity < 1 || formData.capacity > 100) {
        notificationService.error('Capacity must be between 1 and 100');
        return;
      }

      await academicService.updateClass(id, formData);
      
      notificationService.success('Class updated successfully!');
      window.location.href = '/academic/classes';
      
    } catch (err) {
      console.error('Error updating class:', err);
      notificationService.error(err instanceof Error ? err.message : 'Failed to update class');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/academic/classes';
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading class data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
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
              <h1 className="text-3xl font-bold text-text-primary">Edit Class</h1>
              <p className="text-text-secondary">Update class information</p>
            </div>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                <span>{loading ? 'Updating...' : 'Update Class'}</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}