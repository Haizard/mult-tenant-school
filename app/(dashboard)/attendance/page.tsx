'use client';

import { useState, useEffect } from 'react';
import { FaClipboardList, FaUserCheck, FaUserTimes, FaCalendarAlt, FaChalkboardTeacher, FaUserGraduate, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import RoleGuard from '../../components/RoleGuard';
import { useAuth } from '../../contexts/AuthContext';

interface AttendanceRecord {
  id: string;
  studentName: string;
  studentId: string;
  class: string;
  subject: string;
  teacher: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes?: string;
}

const AttendancePage = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sample attendance data
  const sampleAttendance: AttendanceRecord[] = [
    {
      id: '1',
      studentName: 'Alice Brown',
      studentId: 'STU001',
      class: 'Grade 10A',
      subject: 'Mathematics',
      teacher: 'Dr. Sarah Johnson',
      date: '2024-01-20',
      status: 'PRESENT',
      notes: ''
    },
    {
      id: '2',
      studentName: 'John Smith',
      studentId: 'STU002',
      class: 'Grade 10A',
      subject: 'Mathematics',
      teacher: 'Dr. Sarah Johnson',
      date: '2024-01-20',
      status: 'ABSENT',
      notes: 'Sick leave'
    },
    {
      id: '3',
      studentName: 'Emma Wilson',
      studentId: 'STU003',
      class: 'Grade 10A',
      subject: 'Mathematics',
      teacher: 'Dr. Sarah Johnson',
      date: '2024-01-20',
      status: 'LATE',
      notes: 'Traffic delay'
    },
    {
      id: '4',
      studentName: 'Michael Davis',
      studentId: 'STU004',
      class: 'Grade 11B',
      subject: 'Physics',
      teacher: 'John Smith',
      date: '2024-01-20',
      status: 'PRESENT',
      notes: ''
    }
  ];

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      setAttendanceRecords(sampleAttendance);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'success';
      case 'ABSENT':
        return 'error';
      case 'LATE':
        return 'warning';
      case 'EXCUSED':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <FaUserCheck className="text-green-500" />;
      case 'ABSENT':
        return <FaUserTimes className="text-red-500" />;
      case 'LATE':
        return <FaUserTimes className="text-yellow-500" />;
      case 'EXCUSED':
        return <FaUserCheck className="text-blue-500" />;
      default:
        return <FaUserTimes className="text-gray-500" />;
    }
  };

  const handleMarkAttendance = () => {
    console.log('Mark attendance');
  };

  const handleEditAttendance = (recordId: string) => {
    console.log('Edit attendance:', recordId);
  };

  const handleDeleteAttendance = (recordId: string) => {
    console.log('Delete attendance:', recordId);
  };

  const columns = [
    {
      key: 'studentName',
      label: 'Student',
      sortable: true,
      render: (value: string, row: AttendanceRecord) => (
        <div className="flex items-center">
          <FaUserGraduate className="text-blue-500 mr-2" />
          <div>
            <p className="font-medium text-text-primary">{value}</p>
            <p className="text-sm text-text-secondary">{row.studentId}</p>
          </div>
        </div>
      )
    },
    {
      key: 'class',
      label: 'Class',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-text-primary">{value}</span>
      )
    },
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-text-primary">{value}</span>
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
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center">
          <FaCalendarAlt className="text-purple-500 mr-2" />
          <span className="text-sm text-text-primary">{value}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <StatusBadge status={getStatusColor(value) as any} size="sm">
            {value}
          </StatusBadge>
        </div>
      )
    },
    {
      key: 'notes',
      label: 'Notes',
      sortable: false,
      render: (value: string) => (
        <span className="text-sm text-text-secondary">{value || '-'}</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value: any, row: AttendanceRecord) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditAttendance(row.id)}
            className="glass-button p-2 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
            title="Edit Attendance"
          >
            <FaEdit className="text-sm" />
          </button>
          <button
            onClick={() => handleDeleteAttendance(row.id)}
            className="glass-button p-2 hover:bg-red-500/10 hover:text-red-500 transition-colors"
            title="Delete Attendance"
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
              <h1 className="text-3xl font-bold text-text-primary mb-2">Attendance Management</h1>
              <p className="text-text-secondary">Track and manage student attendance records</p>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status="info" size="lg">
                {attendanceRecords.length} Total Records
              </StatusBadge>
              <Button variant="primary" size="md" onClick={handleMarkAttendance}>
                <FaPlus className="mr-2" />
                Mark Attendance
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-green to-accent-green-light rounded-xl">
                <FaUserCheck className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Present Today</p>
                <p className="text-2xl font-bold text-text-primary">
                  {attendanceRecords.filter(a => a.status === 'PRESENT').length}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-red to-accent-red-light rounded-xl">
                <FaUserTimes className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Absent Today</p>
                <p className="text-2xl font-bold text-text-primary">
                  {attendanceRecords.filter(a => a.status === 'ABSENT').length}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-yellow to-accent-yellow-light rounded-xl">
                <FaClipboardList className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Late Today</p>
                <p className="text-2xl font-bold text-text-primary">
                  {attendanceRecords.filter(a => a.status === 'LATE').length}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-xl">
                <FaCalendarAlt className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Attendance Rate</p>
                <p className="text-2xl font-bold text-text-primary">
                  {Math.round((attendanceRecords.filter(a => a.status === 'PRESENT').length / attendanceRecords.length) * 100)}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card variant="strong" glow="purple">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">Attendance Records</h2>
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
            data={attendanceRecords}
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

export default AttendancePage;
