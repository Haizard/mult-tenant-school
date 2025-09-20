'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FaCalendarAlt, FaPlus, FaArrowLeft, FaClock, FaMapMarkerAlt, FaBook, FaTrash, FaTimes } from 'react-icons/fa';
import { academicService } from '@/lib/academicService';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_COLORS = {
  Monday: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  Tuesday: 'from-green-500/20 to-green-600/20 border-green-500/30',
  Wednesday: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  Thursday: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
  Friday: 'from-pink-500/20 to-pink-600/20 border-pink-500/30'
};

export default function ClassSchedulePage() {
  const params = useParams();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    subjectId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    location: ''
  });

  useEffect(() => {
    if (params.id) {
      loadScheduleData();
    }
  }, [params.id]);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      const [scheduleResponse, subjectsResponse] = await Promise.all([
        academicService.getClassSchedule(params.id as string),
        academicService.getSubjects()
      ]);

      setSchedule(scheduleResponse.data || []);
      setSubjects(subjectsResponse.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load schedule data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    try {
      await academicService.createSchedule({
        classId: params.id as string,
        ...newSchedule
      });
      toast({ title: 'Success', description: 'Schedule added successfully' });
      setShowAddForm(false);
      setNewSchedule({
        subjectId: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        location: ''
      });
      loadScheduleData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add schedule', variant: 'destructive' });
    }
  };

  const groupScheduleByDay = () => {
    const grouped = {};
    DAYS.forEach(day => {
      grouped[day] = schedule.filter((item: any) => item.dayOfWeek === day)
        .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="glass-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-purple mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading class schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  const groupedSchedule = groupScheduleByDay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/academic/classes/${params.id}`}>
                <Button variant="secondary" className="glass-button">
                  <FaArrowLeft className="mr-2" />
                  Back to Class
                </Button>
              </Link>
              <div className="p-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-purple-light shadow-purple-glow">
                <FaCalendarAlt className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Class Schedule</h1>
                <p className="text-text-secondary">Manage weekly timetable and class periods</p>
              </div>
            </div>
            <Button onClick={() => setShowAddForm(true)} variant="primary" className="glass-button">
              <FaPlus className="mr-2" />
              Add Schedule
            </Button>
          </div>
        </div>

        {/* Add Schedule Form */}
        {showAddForm && (
          <div className="glass-card p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 shadow-green-glow">
                  <FaPlus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary">Add New Schedule</h3>
                  <p className="text-text-secondary">Create a new class period</p>
                </div>
              </div>
              <Button 
                onClick={() => setShowAddForm(false)} 
                variant="ghost" 
                className="glass-button hover:bg-red-500/20"
              >
                <FaTimes />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <FaBook className="inline mr-2" />Subject
                </label>
                <select
                  className="glass-input w-full"
                  value={newSchedule.subjectId}
                  onChange={(e) => setNewSchedule({...newSchedule, subjectId: e.target.value})}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject: any) => (
                    <option key={subject.id} value={subject.id}>{subject.subjectName}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <FaCalendarAlt className="inline mr-2" />Day
                </label>
                <select
                  className="glass-input w-full"
                  value={newSchedule.dayOfWeek}
                  onChange={(e) => setNewSchedule({...newSchedule, dayOfWeek: e.target.value})}
                >
                  <option value="">Select Day</option>
                  {DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., Room 101, Lab A"
                  className="glass-input w-full"
                  value={newSchedule.location}
                  onChange={(e) => setNewSchedule({...newSchedule, location: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <FaClock className="inline mr-2" />Start Time
                </label>
                <input
                  type="time"
                  className="glass-input w-full"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <FaClock className="inline mr-2" />End Time
                </label>
                <input
                  type="time"
                  className="glass-input w-full"
                  value={newSchedule.endTime}
                  onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button onClick={() => setShowAddForm(false)} variant="secondary" className="glass-button">
                Cancel
              </Button>
              <Button onClick={handleAddSchedule} variant="primary" className="glass-button">
                <FaPlus className="mr-2" />
                Add Schedule
              </Button>
            </div>
          </div>
        )}

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {DAYS.map(day => (
            <div key={day} className={`glass-card p-4 bg-gradient-to-br ${DAY_COLORS[day]}`}>
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-text-primary">{day}</h3>
                <p className="text-sm text-text-secondary">{groupedSchedule[day].length} periods</p>
              </div>
              
              <div className="space-y-3">
                {groupedSchedule[day].length === 0 ? (
                  <div className="text-center py-8">
                    <FaCalendarAlt className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No classes scheduled</p>
                  </div>
                ) : (
                  groupedSchedule[day].map((item: any) => (
                    <div key={item.id} className="glass-card p-3 bg-white/50 hover:bg-white/70 transition-all duration-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-text-primary text-sm">
                            {item.subject?.subjectName || 'Unknown Subject'}
                          </h4>
                          <div className="flex items-center text-xs text-text-secondary mt-1">
                            <FaClock className="mr-1" />
                            {item.startTime}-{item.endTime}
                          </div>
                          {item.location && (
                            <div className="flex items-center text-xs text-text-secondary mt-1">
                              <FaMapMarkerAlt className="mr-1" />
                              {item.location}
                            </div>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="glass-button hover:bg-red-500/20 p-1"
                          onClick={() => academicService.deleteSchedule(params.id as string, item.id)}
                        >
                          <FaTrash className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Schedule Summary */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-indigo-glow">
              <FaCalendarAlt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-primary">Schedule Summary</h3>
              <p className="text-text-secondary">Weekly overview of all class periods</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {DAYS.map(day => (
              <div key={day} className="text-center p-3 rounded-lg bg-gradient-to-br from-white/50 to-gray-50/50">
                <div className="font-medium text-text-primary">{day}</div>
                <div className="text-2xl font-bold text-accent-purple">{groupedSchedule[day].length}</div>
                <div className="text-xs text-text-secondary">periods</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}