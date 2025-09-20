'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { teacherAttendanceService, TeacherAttendance } from '@/lib/teacherAttendanceService';
import { teacherService } from '@/lib/teacherService';
import { useToast } from '@/hooks/use-toast';

export default function TeacherAttendancePage() {
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<TeacherAttendance[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [attendanceData, teachersData] = await Promise.all([
        teacherAttendanceService.getAttendance({
          startDate: selectedDate,
          endDate: selectedDate
        }),
        teacherService.getTeachers()
      ]);
      setAttendance(attendanceData);
      setTeachers(teachersData);
    } catch (error: any) {
      const isAuthError = error.message?.includes('Invalid token') || error.message?.includes('Unauthorized');
      toast({
        title: isAuthError ? 'Authentication Required' : 'Error',
        description: isAuthError ? 'Please log in again to access this page' : 'Failed to load data',
        variant: 'destructive'
      });
      
      if (isAuthError) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (teacherId: string, status: string) => {
    try {
      await teacherAttendanceService.markAttendance({
        teacherId,
        date: selectedDate,
        status,
        checkIn: status === 'PRESENT' ? new Date().toISOString() : undefined
      });
      
      toast({
        title: 'Success',
        description: 'Attendance marked successfully'
      });
      
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to mark attendance',
        variant: 'destructive'
      });
    }
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher =>
      teacher.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacherId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teachers, searchTerm]);

  const attendanceStats = useMemo(() => {
    const total = attendance.length;
    return {
      total,
      present: attendance.filter(a => a.status === 'PRESENT').length,
      absent: attendance.filter(a => a.status === 'ABSENT').length,
      late: attendance.filter(a => a.status === 'LATE').length,
      onLeave: attendance.filter(a => a.status === 'ON_LEAVE').length
    };
  }, [attendance]);

  const getAttendanceForTeacher = (teacherId: string) => {
    return attendance.find(a => a.teacherId === teacherId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'text-green-600 bg-green-100';
      case 'ABSENT': return 'text-red-600 bg-red-100';
      case 'LATE': return 'text-yellow-600 bg-yellow-100';
      case 'ON_LEAVE': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Teacher Attendance</h1>
              <p className="text-text-secondary">Track and manage teacher attendance</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-purple-light shadow-purple-glow">
                <Users className="h-8 w-8 text-white" />
              </div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceStats.total}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceStats.present}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-red-100">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceStats.absent}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Late</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceStats.late}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">On Leave</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceStats.onLeave}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Attendance List */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Attendance for {new Date(selectedDate).toLocaleDateString()}
            </h3>
            
            <div className="space-y-4">
              {filteredTeachers.map((teacher) => {
                const teacherAttendance = getAttendanceForTeacher(teacher.id);
                
                return (
                  <div key={teacher.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {teacher.user.firstName[0]}{teacher.user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {teacher.user.firstName} {teacher.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{teacher.teacherId}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {teacherAttendance ? (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(teacherAttendance.status)}`}>
                          {teacherAttendance.status.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm font-medium text-gray-600 bg-gray-100">
                          Not Marked
                        </span>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAttendance(teacher.id, 'PRESENT')}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAttendance(teacher.id, 'ABSENT')}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Absent
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAttendance(teacher.id, 'LATE')}
                          className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                        >
                          Late
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}