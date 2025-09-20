'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaUserCheck, FaUserTimes, FaClock, FaExclamationTriangle, FaHeartbeat } from 'react-icons/fa';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import { attendanceService, AttendanceData } from '../../../lib/attendanceService';
import { useToast } from '../../../hooks/use-toast';

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
}

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate: string;
}

const MarkAttendanceModal = ({ isOpen, onClose, onSuccess, selectedDate }: MarkAttendanceModalProps) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStudents();
    }
  }, [isOpen]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const mockStudents: Student[] = [
        { id: '1', name: 'John Doe', email: 'john@example.com', class: 'Grade 10A' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', class: 'Grade 10A' },
        { id: '3', name: 'Mike Johnson', email: 'mike@example.com', class: 'Grade 10A' },
        { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', class: 'Grade 10A' },
        { id: '5', name: 'David Brown', email: 'david@example.com', class: 'Grade 10A' },
      ];
      setStudents(mockStudents);
      
      const initialData: Record<string, string> = {};
      mockStudents.forEach(student => {
        initialData[student.id] = 'PRESENT';
      });
      setAttendanceData(initialData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const attendanceRecords: AttendanceData[] = students.map(student => ({
        studentId: student.id,
        date: selectedDate,
        status: attendanceData[student.id] as any,
        period: '1',
      }));

      await attendanceService.markAttendance(attendanceRecords);
      
      toast({
        title: 'Success',
        description: 'Attendance marked successfully',
        variant: 'success'
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark attendance',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <FaUserCheck className="text-green-500" />;
      case 'ABSENT':
        return <FaUserTimes className="text-red-500" />;
      case 'LATE':
        return <FaClock className="text-yellow-500" />;
      case 'EXCUSED':
        return <FaExclamationTriangle className="text-blue-500" />;
      case 'SICK':
        return <FaHeartbeat className="text-purple-500" />;
      default:
        return <FaUserCheck className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'ABSENT':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'LATE':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'EXCUSED':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'SICK':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-text-primary">Mark Attendance - {selectedDate}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-text-secondary">Loading students...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{student.name}</p>
                      <p className="text-sm text-text-secondary">{student.class}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(student.id, status)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                          attendanceData[student.id] === status
                            ? getStatusColor(status)
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {getStatusIcon(status)}
                        <span className="text-sm font-medium">{status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={isLoading || isSubmitting}
          >
            {isSubmitting ? 'Marking...' : 'Mark Attendance'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MarkAttendanceModal;