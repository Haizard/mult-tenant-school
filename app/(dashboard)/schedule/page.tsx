'use client';

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaChalkboardTeacher, FaUserGraduate, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import RoleGuard from '../../components/RoleGuard';
import { useAuth } from '../../contexts/AuthContext';

interface ScheduleItem {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  class: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED';
}

const SchedulePage = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sample schedule data
  const sampleSchedules: ScheduleItem[] = [
    {
      id: '1',
      title: 'Mathematics Class',
      subject: 'Mathematics',
      teacher: 'Dr. Sarah Johnson',
      class: 'Grade 10A',
      day: 'Monday',
      startTime: '08:00',
      endTime: '09:00',
      room: 'Room 101',
      status: 'ACTIVE'
    },
    {
      id: '2',
      title: 'Science Lab',
      subject: 'Physics',
      teacher: 'John Smith',
      class: 'Grade 11B',
      day: 'Tuesday',
      startTime: '10:00',
      endTime: '11:30',
      room: 'Lab 205',
      status: 'ACTIVE'
    },
    {
      id: '3',
      title: 'English Literature',
      subject: 'English',
      teacher: 'Alice Brown',
      class: 'Grade 9C',
      day: 'Wednesday',
      startTime: '14:00',
      endTime: '15:00',
      room: 'Room 203',
      status: 'ACTIVE'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      setSchedules(sampleSchedules);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleCreateSchedule = () => {
    console.log('Create new schedule');
  };

  const handleEditSchedule = (scheduleId: string) => {
    console.log('Edit schedule:', scheduleId);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    console.log('Delete schedule:', scheduleId);
  };

  const columns = [
    {
      key: 'title',
      label: 'Class',
      sortable: true,
      render: (value: string, row: ScheduleItem) => (
        <div className="flex items-center">
          <FaCalendarAlt className="text-blue-500 mr-2" />
          <div>
            <p className="font-medium text-text-primary">{value}</p>
            <p className="text-sm text-text-secondary">{row.subject}</p>
          </div>
        </div>
      )
    },
    {
      key: 'teacher',
      label: 'Teacher',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center">
          <FaChalkboardTeacher className="text-green-500 mr-2" />
          <span className="text-sm text-text-primary">{value}</span>
        </div>
      )
    },
    {
      key: 'class',
      label: 'Class',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center">
          <FaUserGraduate className="text-purple-500 mr-2" />
          <span className="text-sm text-text-primary">{value}</span>
        </div>
      )
    },
    {
      key: 'day',
      label: 'Day',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-text-primary">{value}</span>
      )
    },
    {
      key: 'startTime',
      label: 'Time',
      sortable: true,
      render: (value: string, row: ScheduleItem) => (
        <div className="flex items-center">
          <FaClock className="text-orange-500 mr-2" />
          <span className="text-sm text-text-primary">{value} - {row.endTime}</span>
        </div>
      )
    },
    {
      key: 'room',
      label: 'Room',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-text-primary">{value}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <StatusBadge status={getStatusColor(value) as any} size="sm">
          {value}
        </StatusBadge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value: any, row: ScheduleItem) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditSchedule(row.id)}
            className="glass-button p-2 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
            title="Edit Schedule"
          >
            <FaEdit className="text-sm" />
          </button>
          <button
            onClick={() => handleDeleteSchedule(row.id)}
            className="glass-button p-2 hover:bg-red-500/10 hover:text-red-500 transition-colors"
            title="Delete Schedule"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      )
    }
  ];

  return (
    <RoleGuard allowedRoles={['Tenant Admin', 'Teacher', 'Student']}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Schedule Management</h1>
              <p className="text-text-secondary">Manage class schedules and timetables</p>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status="info" size="lg">
                {schedules.length} Total Classes
              </StatusBadge>
              <Button variant="primary" size="md" onClick={handleCreateSchedule}>
                <FaPlus className="mr-2" />
                Add Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-xl">
                <FaCalendarAlt className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Classes</p>
                <p className="text-2xl font-bold text-text-primary">{schedules.length}</p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-green to-accent-green-light rounded-xl">
                <FaChalkboardTeacher className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Active Classes</p>
                <p className="text-2xl font-bold text-text-primary">
                  {schedules.filter(s => s.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-purple to-accent-purple-light rounded-xl">
                <FaUserGraduate className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Unique Classes</p>
                <p className="text-2xl font-bold text-text-primary">
                  {new Set(schedules.map(s => s.class)).size}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl">
                <FaClock className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Teachers</p>
                <p className="text-2xl font-bold text-text-primary">
                  {new Set(schedules.map(s => s.teacher)).size}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Schedule Table */}
        <Card variant="strong" glow="purple">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">Class Schedules</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Showing</span>
              <select className="glass-input px-3 py-1 text-sm">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-text-secondary">per page</span>
            </div>
          </div>

          <DataTable
            data={schedules}
            columns={columns}
            searchable={true}
            filterable={true}
            pagination={true}
            pageSize={10}
          />
        </Card>
      </div>
    </RoleGuard>
  );
};

export default SchedulePage;
