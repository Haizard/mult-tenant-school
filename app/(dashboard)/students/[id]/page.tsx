'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  GraduationCap,
  BookOpen,
  Heart,
  FileText,
  Clock,
  Edit,
  ArrowLeft,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { studentService, Student } from '@/lib/studentService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (studentId) {
      loadStudent();
    }
  }, [studentId]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const studentData = await studentService.getStudentById(studentId);
      setStudent(studentData);
    } catch (error) {
      console.error('Error loading student:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      case 'GRADUATED': return 'bg-blue-100 text-blue-800';
      case 'TRANSFERRED': return 'bg-yellow-100 text-yellow-800';
      case 'DROPPED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'MALE': return 'bg-blue-100 text-blue-800';
      case 'FEMALE': return 'bg-pink-100 text-pink-800';
      case 'OTHER': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading student details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="text-center py-16">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Student not found</h3>
          <p className="text-gray-600 mb-6">The student you're looking for doesn't exist.</p>
          <Button 
            variant="primary"
            onClick={() => window.location.href = '/students'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section with Cover */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 h-64">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-6 pt-8">
          <Link href="/students">
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </Link>
          
          {/* Profile Header */}
          <div className="flex items-end space-x-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white font-bold text-4xl shadow-2xl">
                {student.user.firstName[0]}{student.user.lastName[0]}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 h-8 w-8 rounded-full border-4 border-white flex items-center justify-center">
                <div className="h-3 w-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="pb-4">
              <h1 className="text-4xl font-bold text-white mb-2">
                {student.user.firstName} {student.user.lastName}
              </h1>
              <div className="flex items-center space-x-4 text-white/90">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {student.studentId}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {student.gender} • Age {calculateAge(student.dateOfBirth)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  student.status === 'ACTIVE' ? 'bg-green-500/80' : 'bg-red-500/80'
                }`}>
                  {student.status}
                </span>
              </div>
            </div>
            <div className="ml-auto pb-4">
              <Link href={`/students/${student.id}/edit`}>
                <Button className="bg-white text-indigo-600 hover:bg-gray-100">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-10">

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="text-2xl font-bold text-gray-900">{calculateAge(student.dateOfBirth)}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-2xl font-bold text-gray-900">{student.status}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admission</p>
                <p className="text-2xl font-bold text-gray-900">{student.admissionNumber || 'N/A'}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">{student.enrollments?.length || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                    <p className="text-lg font-medium text-gray-900">{student.user.firstName} {student.user.lastName}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</label>
                    <p className="text-lg font-medium text-gray-900">{format(new Date(student.dateOfBirth), 'MMMM dd, yyyy')}</p>
                    <p className="text-sm text-gray-500">Age: {calculateAge(student.dateOfBirth)}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</label>
                    <p className="text-lg font-medium text-gray-900">{student.gender}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nationality</label>
                    <p className="text-lg font-medium text-gray-900">{student.nationality}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Religion</label>
                    <p className="text-lg font-medium text-gray-900">{student.religion || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Blood Group</label>
                    <p className="text-lg font-medium text-gray-900">{student.bloodGroup || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Information
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</label>
                      <p className="text-lg font-medium text-gray-900">{student.user.email}</p>
                    </div>
                  </div>
                  {student.phone && (
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                        <p className="text-lg font-medium text-gray-900">{student.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</label>
                      <p className="text-lg font-medium text-gray-900">
                        {student.address && (
                          <>
                            {student.address}
                            {student.city && `, ${student.city}`}
                            {student.region && `, ${student.region}`}
                            {student.postalCode && ` ${student.postalCode}`}
                          </>
                        ) || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Emergency Contact
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Name</label>
                    <p className="text-lg font-medium text-gray-900">{student.emergencyContact || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                    <p className="text-lg font-medium text-gray-900">{student.emergencyPhone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Academic Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Student ID</label>
                    <p className="text-lg font-medium text-gray-900 font-mono">{student.studentId}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admission Number</label>
                    <p className="text-lg font-medium text-gray-900">{student.admissionNumber || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admission Date</label>
                    <p className="text-lg font-medium text-gray-900">{student.admissionDate ? format(new Date(student.admissionDate), 'MMMM dd, yyyy') : 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Previous School</label>
                    <p className="text-lg font-medium text-gray-900">{student.previousSchool || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Previous Grade</label>
                    <p className="text-lg font-medium text-gray-900">{student.previousGrade || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Transport Mode</label>
                    <p className="text-lg font-medium text-gray-900">{student.transportMode || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Additional Information */}
          <div className="space-y-8">

            {/* Medical Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Medical Information
                </h3>
              </div>
              <div className="p-6">
                {student.medicalInfo ? (
                  <p className="text-gray-900 whitespace-pre-wrap">{student.medicalInfo}</p>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-pink-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                      <Heart className="h-8 w-8 text-pink-500" />
                    </div>
                    <p className="text-gray-600">No medical information recorded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Enrollments */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Enrollments
                </h3>
              </div>
              <div className="p-6">
                {student.enrollments && student.enrollments.length > 0 ? (
                  <div className="space-y-3">
                    {student.enrollments.map((enrollment, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                        <p className="font-semibold text-gray-900">{enrollment.class?.className || enrollment.course?.courseName || 'General Enrollment'}</p>
                        <p className="text-sm text-gray-600">{enrollment.academicYear?.yearName} • {enrollment.status}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-gray-600">No enrollments found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Timeline
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Student Registered</p>
                      <p className="text-xs text-gray-500">{format(new Date(student.createdAt), 'MMMM dd, yyyy')}</p>
                    </div>
                  </div>
                  {student.admissionDate && (
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Admission Date</p>
                        <p className="text-xs text-gray-500">{format(new Date(student.admissionDate), 'MMMM dd, yyyy')}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Profile Updated</p>
                      <p className="text-xs text-gray-500">{format(new Date(student.updatedAt), 'MMMM dd, yyyy')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}