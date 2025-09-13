'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaClock, FaUsers, FaBook, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import RoleBasedButton from '@/components/RoleBasedButton';
import { useAuth } from '@/contexts/AuthContext';
import { scheduleService, Schedule, ScheduleFilters } from '@/lib/services/scheduleService';

// Using Schedule interface from scheduleService

const SchedulesPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    const loadSchedules = async () => {
      if (!user) {
        console.error('User not authenticated');
        setSchedules([]);
        setLoading(false);
        return;
      }

      // Debug: Log user permissions and roles
      console.log('User permissions:', user.permissions);
      console.log('User roles:', user.roles);

      setLoading(true);
      try {
        const response = await scheduleService.getSchedules({
          limit: 100, // Load more schedules for better demo
          sortBy: 'date',
          sortOrder: 'asc'
        });
        
        if (response.success && response.data) {
          setSchedules(response.data);
        } else {
          console.error('Failed to load schedules:', response.message);
          setSchedules([]);
        }
      } catch (error) {
        console.error('Failed to load schedules:', error);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, [user]);


  const handleCreateSchedule = () => {
    router.push('/academic/schedules/create');
  };

  const handleViewSchedule = (scheduleId: string) => {
    router.push(`/academic/schedules/${scheduleId}`);
  };

  const handleEditSchedule = (scheduleId: string) => {
    router.push(`/academic/schedules/${scheduleId}/edit`);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      try {
        const response = await scheduleService.deleteSchedule(scheduleId);
        
        if (response.success) {
          // Remove from local state
          setSchedules(prevSchedules => prevSchedules.filter(s => s.id !== scheduleId));
        } else {
          alert(response.message || 'Failed to delete schedule. Please try again.');
        }
      } catch (error) {
        console.error('Failed to delete schedule:', error);
        alert('Failed to delete schedule. Please try again.');
      }
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => (
        <StatusBadge status={value} />
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'startTime',
      label: 'Time',
      render: (value: string, row: Schedule) => {
        const startTime = new Date(row.startTime).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        const endTime = new Date(row.endTime).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        return `${startTime} - ${endTime}`;
      },
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (value: any, row: Schedule) => row.subject?.subjectName || '-',
    },
    {
      key: 'teacher',
      label: 'Teacher',
      render: (value: any, row: Schedule) => 
        row.teacher ? `${row.teacher.firstName} ${row.teacher.lastName}` : '-',
    },
    {
      key: 'location',
      label: 'Location',
      render: (value: string) => value || '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <StatusBadge status={value} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: Schedule) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewSchedule(row.id)}
            title="View Schedule"
          >
            <FaEye />
          </Button>
          <RoleBasedButton
            variant="outline"
            size="sm"
            onClick={() => handleEditSchedule(row.id)}
            permissions={['schedules:update']}
          >
            <FaEdit />
          </RoleBasedButton>
          <RoleBasedButton
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteSchedule(row.id)}
            permissions={['schedules:delete']}
          >
            <FaTrash />
          </RoleBasedButton>
        </div>
      ),
    },
  ];

  // Filter schedules by selected date for calendar view
  const filteredSchedules = schedules.filter(schedule => 
    schedule.date === selectedDate
  );

  // Statistics
  const stats = {
    total: schedules.length,
    today: schedules.filter(s => s.date === new Date().toISOString().split('T')[0]).length,
    thisWeek: schedules.filter(s => {
      const scheduleDate = new Date(s.date);
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      return scheduleDate >= weekStart && scheduleDate <= weekEnd;
    }).length,
    active: schedules.filter(s => s.status === 'ACTIVE').length,
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Academic Schedules</h1>
          <p className="text-text-secondary">Manage class schedules, timetables, and academic calendar</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendar View
            </button>
          </div>
          <RoleBasedButton
            variant="primary"
            size="md"
            onClick={handleCreateSchedule}
            permissions={['schedules:create']}
          >
            <FaPlus className="mr-2" />
            Add Schedule
          </RoleBasedButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FaCalendarAlt className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
              <p className="text-sm text-text-secondary">Total Schedules</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <FaClock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-text-primary">{stats.today}</p>
              <p className="text-sm text-text-secondary">Today&apos;s Events</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <FaUsers className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-text-primary">{stats.thisWeek}</p>
              <p className="text-sm text-text-secondary">This Week</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <FaBook className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-text-primary">{stats.active}</p>
              <p className="text-sm text-text-secondary">Active Schedules</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Date Filter for Calendar View */}
      {viewMode === 'calendar' && (
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <label htmlFor="date-filter" className="text-sm font-medium text-text-primary">
              Select Date:
            </label>
            <input
              id="date-filter"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-text-secondary">
              {filteredSchedules.length} events on {new Date(selectedDate).toLocaleDateString()}
            </span>
          </div>
        </Card>
      )}

      {/* Schedule Table/Calendar */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-primary">
              {viewMode === 'list' ? 'All Schedules' : `Schedule for ${new Date(selectedDate).toLocaleDateString()}`}
            </h2>
          </div>

          {viewMode === 'list' ? (
            <DataTable
              columns={columns}
              data={schedules}
              searchable={true}
              pagination={true}
            />
          ) : (
            <div className="space-y-4">
              {filteredSchedules.length === 0 ? (
                <div className="text-center py-12">
                  <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">No events scheduled for this date</p>
                  <p className="text-gray-400 text-sm">Select a different date or create a new schedule</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredSchedules
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((schedule) => (
                      <div
                        key={schedule.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-text-primary">{schedule.title}</h3>
                              <StatusBadge status={schedule.type} />
                              <StatusBadge status={schedule.status} />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-text-secondary">
                              <div>
                                <span className="font-medium">Time:</span> {
                                  new Date(schedule.startTime).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: false 
                                  })
                                } - {
                                  new Date(schedule.endTime).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: false 
                                  })
                                }
                              </div>
                              {schedule.subject && (
                                <div>
                                  <span className="font-medium">Subject:</span> {schedule.subject.subjectName}
                                </div>
                              )}
                              {schedule.teacher && (
                                <div>
                                  <span className="font-medium">Teacher:</span> {schedule.teacher.firstName} {schedule.teacher.lastName}
                                </div>
                              )}
                              {schedule.location && (
                                <div>
                                  <span className="font-medium">Location:</span> {schedule.location}
                                </div>
                              )}
                            </div>
                            {schedule.description && (
                              <p className="text-sm text-text-secondary mt-2">{schedule.description}</p>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewSchedule(schedule.id)}
                            >
                              <FaEye />
                            </Button>
                            <RoleBasedButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSchedule(schedule.id)}
                              permissions={['schedules:update']}
                            >
                              <FaEdit />
                            </RoleBasedButton>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SchedulesPage;
