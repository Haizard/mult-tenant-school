'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaCalendarAlt, FaClock, FaUsers, FaBook, FaEdit, FaArrowLeft, FaMapMarkerAlt } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import RoleBasedButton from '@/components/RoleBasedButton';
import { useAuth } from '@/contexts/AuthContext';
import { scheduleService, Schedule } from '@/lib/services/scheduleService';

// Using Schedule interface from scheduleService

const ScheduleDetailsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scheduleId = params.id as string;

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true);
      try {
        const response = await scheduleService.getScheduleById(scheduleId);
        
        if (response.success && response.data) {
          setSchedule(response.data);
        } else {
          console.error('Failed to load schedule:', response.message);
          setSchedule(null);
        }
      } catch (error) {
        console.error('Failed to load schedule:', error);
        setSchedule(null);
      } finally {
        setLoading(false);
      }
    };

    if (scheduleId) {
      loadSchedule();
    }
  }, [scheduleId]);

  const handleEdit = () => {
    router.push(`/academic/schedules/${scheduleId}/edit`);
  };

  const handleBack = () => {
    router.push('/academic/schedules');
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

  if (!schedule) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Schedule Not Found</h3>
          <p className="text-gray-500 mb-4">The schedule you're looking for doesn't exist or has been removed.</p>
          <Button onClick={handleBack} variant="primary">
            Back to Schedules
          </Button>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CLASS': return <FaBook className="h-5 w-5" />;
      case 'EXAM': return <FaEdit className="h-5 w-5" />;
      case 'EVENT': return <FaCalendarAlt className="h-5 w-5" />;
      case 'MEETING': return <FaUsers className="h-5 w-5" />;
      default: return <FaCalendarAlt className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
          >
            <FaArrowLeft className="mr-2" />
            Back to Schedules
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">{schedule.title}</h1>
            <p className="text-text-secondary">Schedule Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge status={schedule.type} />
          <StatusBadge status={schedule.status} />
          <RoleBasedButton
            variant="primary"
            size="md"
            onClick={handleEdit}
            permissions={['schedules:update']}
          >
            <FaEdit className="mr-2" />
            Edit Schedule
          </RoleBasedButton>
        </div>
      </div>

      {/* Schedule Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-full bg-blue-100">
                {getTypeIcon(schedule.type)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">Schedule Information</h2>
                <p className="text-text-secondary">Basic details about this schedule</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Title
                </label>
                <p className="text-text-primary font-medium">{schedule.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Type
                </label>
                <StatusBadge status={schedule.type} />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Date
                </label>
                <p className="text-text-primary">{new Date(schedule.date).toLocaleDateString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Time
                </label>
                <div className="flex items-center space-x-2">
                  <FaClock className="h-4 w-4 text-text-secondary" />
                  <p className="text-text-primary">
                    {new Date(schedule.startTime).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    })} - {new Date(schedule.endTime).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    })}
                  </p>
                </div>
              </div>

              {schedule.subject && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Subject
                  </label>
                  <p className="text-text-primary">{schedule.subject.subjectName} ({schedule.subject.subjectCode})</p>
                </div>
              )}

              {schedule.teacher && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Teacher
                  </label>
                  <p className="text-text-primary">{schedule.teacher.firstName} {schedule.teacher.lastName}</p>
                </div>
              )}

              {schedule.location && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Location
                  </label>
                  <div className="flex items-center space-x-2">
                    <FaMapMarkerAlt className="h-4 w-4 text-text-secondary" />
                    <p className="text-text-primary">{schedule.location}</p>
                  </div>
                </div>
              )}
            </div>

            {schedule.description && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Description
                </label>
                <p className="text-text-primary bg-gray-50 p-4 rounded-lg">
                  {schedule.description}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Current Status
                </label>
                <StatusBadge status={schedule.status} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Recurring
                </label>
                <p className="text-text-primary">
                  {schedule.recurring ? 'Yes' : 'No'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Created
                </label>
                <p className="text-text-primary">
                  {new Date(schedule.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <RoleBasedButton
                variant="primary"
                size="md"
                onClick={handleEdit}
                permissions={['schedules:update']}
                className="w-full"
              >
                <FaEdit className="mr-2" />
                Edit Schedule
              </RoleBasedButton>
              
              <Button
                variant="outline"
                size="md"
                onClick={() => window.print()}
                className="w-full"
              >
                Print Schedule
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailsPage;
