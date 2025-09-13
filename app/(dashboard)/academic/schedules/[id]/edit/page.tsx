'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaCalendarAlt, FaClock, FaUsers, FaBook, FaSave, FaArrowLeft } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

interface ScheduleFormData {
  title: string;
  type: 'CLASS' | 'EXAM' | 'EVENT' | 'MEETING';
  subject: string;
  teacher: string;
  class: string;
  startTime: string;
  endTime: string;
  date: string;
  location: string;
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED' | 'DRAFT';
  description: string;
  recurring: boolean;
}

const EditSchedulePage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scheduleId = params.id as string;

  const [formData, setFormData] = useState<ScheduleFormData>({
    title: '',
    type: 'CLASS',
    subject: '',
    teacher: '',
    class: '',
    startTime: '',
    endTime: '',
    date: '',
    location: '',
    status: 'ACTIVE',
    description: '',
    recurring: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // For now, using sample data
        const sampleSchedule = {
          title: 'Mathematics Class - Algebra',
          type: 'CLASS' as const,
          subject: 'Mathematics',
          teacher: 'John Smith',
          class: 'Grade 10A',
          startTime: '08:00',
          endTime: '09:00',
          date: '2024-01-15',
          location: 'Room 101',
          status: 'ACTIVE' as const,
          description: 'Introduction to quadratic equations. Students will learn the basic concepts and solve practice problems.',
          recurring: true,
        };
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        setFormData(sampleSchedule);
      } catch (error) {
        console.error('Failed to load schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    if (scheduleId) {
      loadSchedule();
    }
  }, [scheduleId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // TODO: Implement actual API call to update schedule
      console.log('Updating schedule:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to schedule details
      router.push(`/academic/schedules/${scheduleId}`);
    } catch (error) {
      console.error('Failed to update schedule:', error);
      alert('Failed to update schedule. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/academic/schedules/${scheduleId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
          >
            <FaArrowLeft className="mr-2" />
            Cancel
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Edit Schedule</h1>
            <p className="text-text-secondary">Update schedule information</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-full bg-blue-100">
              <FaCalendarAlt className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Schedule Information</h2>
              <p className="text-text-secondary">Update the basic details of this schedule</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-text-primary mb-2">
                Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CLASS">Class</option>
                <option value="EXAM">Exam</option>
                <option value="EVENT">Event</option>
                <option value="MEETING">Meeting</option>
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-text-primary mb-2">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-text-primary mb-2">
                Start Time *
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-text-primary mb-2">
                End Time *
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="teacher" className="block text-sm font-medium text-text-primary mb-2">
                Teacher
              </label>
              <input
                type="text"
                id="teacher"
                name="teacher"
                value={formData.teacher}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="class" className="block text-sm font-medium text-text-primary mb-2">
                Class
              </label>
              <input
                type="text"
                id="class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-text-primary mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter schedule description..."
            />
          </div>

          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="recurring"
                checked={formData.recurring}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-text-primary">Recurring Schedule</span>
            </label>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditSchedulePage;
