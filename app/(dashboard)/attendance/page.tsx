'use client';

import { useState, useEffect } from 'react';
import { FaClipboardList, FaUserCheck, FaUserTimes, FaCalendarAlt, FaChalkboardTeacher, FaUserGraduate, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/ui/DataTable';
import RoleGuard from '../../components/RoleGuard';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceService, AttendanceRecord } from '../../../lib/attendanceService';
import { useToast } from '../../../hooks/use-toast';

const AttendancePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({
    PRESENT: 0,
    ABSENT: 0,
    LATE: 0,
    EXCUSED: 0,
    SICK: 0
  });
  const [selectedDate, setSelectedDate] = useState(attendanceService.getTodayDate());

  useEffect(() => {
    loadAttendanceData();
    loadAttendanceStats();
  }, [selectedDate]);

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true);
      const response = await attendanceService.getAttendanceRecords({
        date: selectedDate,
        page: 1,
        limit: 50
      });
      
      if (response.success) {
        setAttendanceRecords(response.data || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load attendance records',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error loading attendance:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load attendance records',
        variant: 'destructive'
      });
      setAttendanceRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttendanceStats = async () => {
    try {
      const response = await attendanceService.getAttendanceStats({
        date: selectedDate
      });
      
      if (response.success) {
        setAttendanceStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading attendance stats:', error);
    }
  };

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
    // TODO: Implement attendance marking modal/form
    toast({
      title: 'Feature Coming Soon',
      description: 'Attendance marking interface will be available soon',
      variant: 'default'
    });
  };

  const handleEditAttendance = async (recordId: string) => {
    try {
      // TODO: Implement edit modal/form
      toast({
        title: 'Feature Coming Soon',
        description: 'Edit attendance interface will be available soon',
        variant: 'default'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to edit attendance',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAttendance = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      await attendanceService.deleteAttendance(recordId);
      toast({
        title: 'Success',
        description: 'Attendance record deleted successfully',
        variant: 'success'
      });
      loadAttendanceData(); // Reload data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete attendance record',
        variant: 'destructive'
      });
    }
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

        {/* Date Selector */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={() => setSelectedDate(attendanceService.getTodayDate())}>
              Today
            </Button>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <FaUserCheck className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceStats.PRESENT}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                <FaUserTimes className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Absent Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceStats.ABSENT}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                <FaClipboardList className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Late Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceStats.LATE}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <FaCalendarAlt className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceService.calculateAttendanceRate(attendanceStats)}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card className="p-6">
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
