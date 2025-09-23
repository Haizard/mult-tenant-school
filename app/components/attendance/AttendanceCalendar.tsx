'use client';

import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarDay, FaUserCheck, FaUserTimes, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { attendanceService } from '../../../lib/attendanceService';
import { useToast } from '../../../hooks/use-toast';

interface AttendanceCalendarProps {
  className?: string;
  studentId?: string;
  onDateSelect?: (date: string) => void;
}

interface DayAttendance {
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK' | null;
  count?: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    sick: number;
    total: number;
  };
}

const AttendanceCalendar = ({ className = '', studentId, onDateSelect }: AttendanceCalendarProps) => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<Record<string, DayAttendance>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadMonthAttendance();
  }, [currentDate, studentId]);

  const loadMonthAttendance = async () => {
    setIsLoading(true);
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Generate mock data for demonstration
      const mockData: Record<string, DayAttendance> = {};

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];

        if (studentId) {
          // Individual student data
          const statuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK', null];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)] as any;

          mockData[dateStr] = {
            date: dateStr,
            status: randomStatus
          };
        } else {
          // Class/school-wide data
          const present = Math.floor(Math.random() * 30) + 120;
          const absent = Math.floor(Math.random() * 15) + 5;
          const late = Math.floor(Math.random() * 10) + 2;
          const excused = Math.floor(Math.random() * 8) + 1;
          const sick = Math.floor(Math.random() * 5) + 1;

          mockData[dateStr] = {
            date: dateStr,
            status: null,
            count: {
              present,
              absent,
              late,
              excused,
              sick,
              total: present + absent + late + excused + sick
            }
          };
        }
      }

      setAttendanceData(mockData);
    } catch (error) {
      console.error('Error loading attendance data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load attendance data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ABSENT':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'EXCUSED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'SICK':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'PRESENT':
        return <FaUserCheck className="text-green-600" />;
      case 'ABSENT':
        return <FaUserTimes className="text-red-600" />;
      case 'LATE':
        return <FaClock className="text-yellow-600" />;
      case 'EXCUSED':
        return <FaExclamationTriangle className="text-blue-600" />;
      case 'SICK':
        return <FaExclamationTriangle className="text-purple-600" />;
      default:
        return null;
    }
  };

  const getAttendanceRate = (count: any) => {
    if (!count || count.total === 0) return 0;
    return Math.round((count.present / count.total) * 100);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth();
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaCalendarDay className="text-blue-500 text-xl" />
            <h3 className="text-lg font-bold text-text-primary">
              {studentId ? 'Student Attendance Calendar' : 'School Attendance Calendar'}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigateMonth('prev')}>
              <FaChevronLeft />
            </Button>
            <span className="font-medium text-text-primary min-w-[150px] text-center">
              {monthYear}
            </span>
            <Button variant="secondary" size="sm" onClick={() => navigateMonth('next')}>
              <FaChevronRight />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((day, index) => {
            const dateStr = day.toISOString().split('T')[0];
            const attendance = attendanceData[dateStr];
            const isSelected = selectedDate === dateStr;
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDay = isToday(day);

            return (
              <div
                key={index}
                onClick={() => isCurrentMonthDay && handleDateClick(dateStr)}
                className={`
                  relative p-2 min-h-[80px] border rounded cursor-pointer transition-all
                  ${isCurrentMonthDay ? 'hover:bg-gray-50' : 'text-gray-400'}
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                  ${isTodayDay ? 'bg-blue-50 border-blue-300' : 'border-gray-200'}
                  ${!isCurrentMonthDay ? 'bg-gray-50' : ''}
                `}
              >
                <div className="text-sm font-medium mb-1">
                  {day.getDate()}
                </div>

                {isCurrentMonthDay && attendance && (
                  <div className="space-y-1">
                    {studentId ? (
                      // Individual student view
                      <div className="flex items-center justify-center">
                        {attendance.status ? (
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${getStatusColor(attendance.status)}`}>
                            {getStatusIcon(attendance.status)}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300"></div>
                        )}
                      </div>
                    ) : (
                      // School-wide view
                      attendance.count && (
                        <div className="space-y-1">
                          <div className="text-xs text-center">
                            <span className="font-medium">{getAttendanceRate(attendance.count)}%</span>
                          </div>
                          <div className="flex justify-center">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-green-500 h-1 rounded-full"
                                style={{ width: `${getAttendanceRate(attendance.count)}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 text-center">
                            {attendance.count.present}/{attendance.count.total}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {isTodayDay && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Legend:</h4>
            <div className="flex items-center gap-4 text-sm">
              {studentId ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
                    <span>Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></div>
                    <span>Late</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
                    <span>Excused</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-2 rounded bg-green-500"></div>
                    <span>Attendance Rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Today</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </Card>

      {/* Selected Date Details */}
      {selectedDate && attendanceData[selectedDate] && (
        <Card className="p-6">
          <h4 className="font-bold text-text-primary mb-4">
            Attendance Details - {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h4>

          {studentId ? (
            // Individual student details
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-lg border ${getStatusColor(attendanceData[selectedDate].status)}`}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(attendanceData[selectedDate].status)}
                  <span className="font-medium">
                    {attendanceData[selectedDate].status || 'No Record'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // School-wide details
            attendanceData[selectedDate].count && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {attendanceData[selectedDate].count!.present}
                  </p>
                  <p className="text-sm text-gray-600">Present</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {attendanceData[selectedDate].count!.absent}
                  </p>
                  <p className="text-sm text-gray-600">Absent</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {attendanceData[selectedDate].count!.late}
                  </p>
                  <p className="text-sm text-gray-600">Late</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {attendanceData[selectedDate].count!.excused}
                  </p>
                  <p className="text-sm text-gray-600">Excused</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {attendanceData[selectedDate].count!.sick}
                  </p>
                  <p className="text-sm text-gray-600">Sick</p>
                </div>
              </div>
            )
          )}
        </Card>
      )}
    </div>
  );
};

export default AttendanceCalendar;
