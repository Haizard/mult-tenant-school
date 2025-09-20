'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FaUsers, FaChalkboardTeacher, FaArrowLeft, FaCalendarAlt, FaGraduationCap, FaUserPlus, FaTrash, FaEye } from 'react-icons/fa';
import { academicService } from '@/lib/academicService';
import { studentService } from '@/lib/studentService';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function ClassDetailsPage() {
  const params = useParams();
  const { toast } = useToast();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadClassData();
    }
  }, [params.id]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      const [classResponse, studentsResponse, allStudentsResponse] = await Promise.all([
        academicService.getClass(params.id as string),
        academicService.getClassStudents(params.id as string),
        studentService.getStudents()
      ]);

      setClassData(classResponse.data);
      setStudents(studentsResponse.data || []);
      setAvailableStudents(allStudentsResponse.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load class data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async (studentId: string) => {
    try {
      await academicService.assignStudent({
        studentId,
        classId: params.id as string,
        academicYearId: classData?.academicYearId || ''
      });
      toast({ title: 'Success', description: 'Student assigned successfully' });
      loadClassData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to assign student', variant: 'destructive' });
    }
  };

  const getEnrollmentPercentage = () => {
    if (!classData?.capacity) return 0;
    return Math.round((students.length / classData.capacity) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="glass-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-purple mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading class details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/academic/classes">
                <Button variant="secondary" className="glass-button">
                  <FaArrowLeft className="mr-2" />
                  Back to Classes
                </Button>
              </Link>
              <div className="p-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-purple-light shadow-purple-glow">
                <FaGraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">{classData?.className}</h1>
                <p className="text-text-secondary">{classData?.classCode} • Capacity: {classData?.capacity} students</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href={`/academic/classes/${params.id}/schedule`}>
                <Button variant="primary" className="glass-button">
                  <FaCalendarAlt className="mr-2" />
                  Schedule
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Enrolled Students</p>
                <p className="text-2xl font-bold text-text-primary">{students.length}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-500/20">
                <FaGraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Capacity</p>
                <p className="text-2xl font-bold text-text-primary">{classData?.capacity}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <FaEye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Enrollment</p>
                <p className="text-2xl font-bold text-text-primary">{getEnrollmentPercentage()}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Students Management */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-glow">
                <FaUsers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Class Students</h2>
                <p className="text-text-secondary">{students.length} students enrolled</p>
              </div>
            </div>
          </div>
          
          {/* Enrollment Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-secondary">Class Enrollment</span>
              <span className="text-sm font-medium text-text-primary">
                {students.length}/{classData?.capacity} ({getEnrollmentPercentage()}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  getEnrollmentPercentage() >= 90
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : getEnrollmentPercentage() >= 75
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                    : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}
                style={{ width: `${getEnrollmentPercentage()}%` }}
              ></div>
            </div>
          </div>

          {/* Student Assignment */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <FaUserPlus className="text-accent-blue" />
              <h3 className="font-medium text-text-primary">Assign New Student</h3>
            </div>
            <select 
              className="glass-input w-full"
              onChange={(e) => e.target.value && handleAssignStudent(e.target.value)}
              value=""
            >
              <option value="">Select student to assign...</option>
              {availableStudents.filter((s: any) => !students.find((cs: any) => cs.id === s.id)).map((student: any) => (
                <option key={student.id} value={student.id}>
                  {student.user?.firstName} {student.user?.lastName} - {student.studentId}
                </option>
              ))}
            </select>
          </div>

          {/* Students List */}
          <div className="space-y-3">
            {students.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FaUsers className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">No Students Enrolled</h3>
                <p className="text-text-secondary">Start by assigning students to this class using the dropdown above.</p>
              </div>
            ) : (
              students.map((student: any) => (
                <div key={student.id} className="glass-card p-4 bg-gradient-to-r from-white/50 to-blue-50/30 border-blue-200/30 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
                        {student.user?.firstName?.[0]}{student.user?.lastName?.[0]}
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary">
                          {student.user?.firstName} {student.user?.lastName}
                        </h4>
                        <p className="text-sm text-text-secondary">
                          ID: {student.studentId} • {student.user?.email}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="glass-button hover:bg-red-500/20"
                      onClick={() => academicService.removeStudent(params.id as string, student.id)}
                    >
                      <FaTrash className="mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}