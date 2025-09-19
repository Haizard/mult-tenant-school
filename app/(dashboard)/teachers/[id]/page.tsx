'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  ArrowLeft,
  Edit,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  BookOpen,
  Plus,
  Trash2,
  FileText,
  Building,
  User,
  UserCheck
} from 'lucide-react';
import { teacherService, Teacher } from '@/lib/teacherService';
import { academicService } from '@/lib/academicService';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function TeacherDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showQualificationModal, setShowQualificationModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newQualification, setNewQualification] = useState({
    title: '',
    institution: '',
    dateObtained: '',
    expiryDate: '',
    certificateNumber: '',
    description: ''
  });

  useEffect(() => {
    if (params.id) {
      Promise.all([
        loadTeacher(params.id as string),
        loadTeacherSubjects(params.id as string),
        loadTeacherQualifications(params.id as string),
        loadAvailableSubjects()
      ]);
    }
  }, [params.id]);

  const loadTeacher = async (id: string) => {
    try {
      setLoading(true);
      const data = await teacherService.getTeacher(id);
      setTeacher(data);
    } catch (error: any) {
      console.error('Error loading teacher:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load teacher',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherSubjects = async (id: string) => {
    try {
      const data = await teacherService.getTeacherSubjects(id);
      setSubjects(data);
    } catch (error: any) {
      console.error('Error loading teacher subjects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load teacher subjects',
        variant: 'destructive'
      });
    }
  };

  const loadTeacherQualifications = async (id: string) => {
    try {
      const data = await teacherService.getTeacherQualifications(id);
      setQualifications(data);
    } catch (error: any) {
      console.error('Error loading teacher qualifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load teacher qualifications',
        variant: 'destructive'
      });
    }
  };

  const loadAvailableSubjects = async () => {
    try {
      const response = await academicService.getSubjects({ status: 'ACTIVE' });
      setAvailableSubjects(response.data || []);
    } catch (error: any) {
      console.error('Error loading available subjects:', error);
    }
  };

  const handleAssignSubject = async () => {
    if (!selectedSubject || !teacher) return;
    
    try {
      await teacherService.assignSubjectToTeacher({
        teacherId: teacher.id,
        subjectId: selectedSubject
      });
      
      toast({
        title: 'Success',
        description: 'Subject assigned successfully'
      });
      
      setShowSubjectModal(false);
      setSelectedSubject('');
      loadTeacherSubjects(teacher.id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign subject',
        variant: 'destructive'
      });
    }
  };

  const handleAddQualification = async () => {
    if (!teacher || !newQualification.title || !newQualification.institution) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in required fields',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      await teacherService.addTeacherQualification(teacher.id, newQualification);
      
      toast({
        title: 'Success',
        description: 'Qualification added successfully'
      });
      
      setShowQualificationModal(false);
      setNewQualification({
        title: '',
        institution: '',
        dateObtained: '',
        expiryDate: '',
        certificateNumber: '',
        description: ''
      });
      loadTeacherQualifications(teacher.id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add qualification',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatAddress = (teacher: Teacher) => {
    if (!teacher.address) return 'N/A';
    
    const parts = [teacher.address];
    if (teacher.city) parts.push(teacher.city);
    if (teacher.region) parts.push(teacher.region);
    if (teacher.postalCode) parts.push(teacher.postalCode);
    
    return parts.join(', ');
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

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Teacher not found</h3>
          <p className="text-gray-600 mb-4">The teacher you're looking for doesn't exist.</p>
          <Link href="/teachers">
            <Button variant="primary">Back to Teachers</Button>
          </Link>
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
          <Link href="/teachers">
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teachers
            </Button>
          </Link>
          
          {/* Profile Header */}
          <div className="flex items-end space-x-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white font-bold text-4xl shadow-2xl">
                {teacher.user.firstName[0]}{teacher.user.lastName[0]}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 h-8 w-8 rounded-full border-4 border-white flex items-center justify-center">
                <div className="h-3 w-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="pb-4">
              <h1 className="text-4xl font-bold text-white mb-2">
                {teacher.user.firstName} {teacher.user.lastName}
              </h1>
              <div className="flex items-center space-x-4 text-white/90">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {teacher.teacherId}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {teacher.specialization || 'General Teacher'}
                </span>
              </div>
            </div>
            <div className="ml-auto pb-4">
              <Link href={`/teachers/${teacher.id}/edit`}>
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
                <p className="text-sm text-gray-600">Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Experience</p>
                <p className="text-2xl font-bold text-gray-900">{teacher.experience || 0}y</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Qualifications</p>
                <p className="text-2xl font-bold text-gray-900">{qualifications.length}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="text-2xl font-bold text-gray-900">{calculateAge(teacher.dateOfBirth)}</p>
              </div>
              <User className="h-8 w-8 text-orange-500" />
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
                    <p className="text-lg font-medium text-gray-900">{teacher.user.firstName} {teacher.user.lastName}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</label>
                    <p className="text-lg font-medium text-gray-900">{formatDate(teacher.dateOfBirth)}</p>
                    <p className="text-sm text-gray-500">Age: {calculateAge(teacher.dateOfBirth)}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</label>
                    <p className="text-lg font-medium text-gray-900">{teacher.gender}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nationality</label>
                    <p className="text-lg font-medium text-gray-900">{teacher.nationality || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Employee Number</label>
                    <p className="text-lg font-medium text-gray-900">{teacher.employeeNumber || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Joining Date</label>
                    <p className="text-lg font-medium text-gray-900">{formatDate(teacher.joiningDate || '')}</p>
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
                      <p className="text-lg font-medium text-gray-900">{teacher.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                      <p className="text-lg font-medium text-gray-900">{teacher.user.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</label>
                      <p className="text-lg font-medium text-gray-900">
                        {formatAddress(teacher)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Professional Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Highest Qualification</label>
                    <p className="text-lg font-medium text-gray-900">{teacher.qualification || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Years of Experience</label>
                    <p className="text-lg font-medium text-gray-900">{teacher.experience || 0} years</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Specialization</label>
                    <p className="text-lg font-medium text-gray-900">{teacher.specialization || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Previous School</label>
                    <p className="text-lg font-medium text-gray-900">{teacher.previousSchool || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teaching License</label>
                    <p className="text-lg font-medium text-gray-900">{teacher.teachingLicense || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">License Expiry</label>
                    <p className="text-lg font-medium text-gray-900">{formatDate(teacher.licenseExpiry || '')}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Name</label>
                    <p className="text-lg font-medium text-gray-900">{teacher.emergencyContact || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                    <p className="text-lg font-medium text-gray-900">{teacher.emergencyPhone || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Relationship</label>
                    <p className="text-lg font-medium text-gray-900">{teacher.emergencyRelation || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Subjects and Qualifications */}
          <div className="space-y-8">
            {/* Assigned Subjects */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Assigned Subjects
                </h3>
                <Button 
                  size="sm" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={() => setShowSubjectModal(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                {subjects.length > 0 ? (
                  <div className="space-y-3">
                    {subjects.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                        <div>
                          <p className="font-semibold text-gray-900">{subject.subject_name}</p>
                          <p className="text-sm text-gray-600">{subject.subject_level} • {subject.subject_type}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            teacherService.removeSubjectFromTeacher(teacher.id, subject.id)
                              .then(() => {
                                toast({ title: 'Success', description: 'Subject removed successfully' });
                                loadTeacherSubjects(teacher.id);
                              })
                              .catch((error) => {
                                toast({ title: 'Error', description: error.message, variant: 'destructive' });
                              });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-gray-600 mb-4">No subjects assigned yet</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowSubjectModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Subject
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Qualifications */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Qualifications
                </h3>
                <Button 
                  size="sm" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={() => setShowQualificationModal(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                {qualifications.length > 0 ? (
                  <div className="space-y-3">
                    {qualifications.map((qualification, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                        <p className="font-semibold text-gray-900">{qualification.title}</p>
                        <p className="text-sm text-gray-600">{qualification.institution}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(qualification.dateObtained)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-amber-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                      <Award className="h-8 w-8 text-amber-500" />
                    </div>
                    <p className="text-gray-600 mb-4">No qualifications added yet</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowQualificationModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Qualification
                    </Button>
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
                      <UserCheck className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Joined School</p>
                      <p className="text-xs text-gray-500">{formatDate(teacher.createdAt)}</p>
                    </div>
                  </div>
                  {teacher.joiningDate && (
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Building className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Started Teaching</p>
                        <p className="text-xs text-gray-500">{formatDate(teacher.joiningDate)}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Profile Updated</p>
                      <p className="text-xs text-gray-500">{formatDate(teacher.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Assignment Modal */}
        {showSubjectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Assign Subject</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Choose a subject...</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.subjectName} ({subject.subjectLevel})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowSubjectModal(false);
                      setSelectedSubject('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAssignSubject} disabled={!selectedSubject}>
                    Assign Subject
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Qualification Modal */}
        {showQualificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
              <h3 className="text-lg font-semibold mb-4">Add Qualification</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newQualification.title}
                    onChange={(e) => setNewQualification(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Bachelor of Education"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution *
                  </label>
                  <input
                    type="text"
                    value={newQualification.institution}
                    onChange={(e) => setNewQualification(prev => ({ ...prev, institution: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., University of Dar es Salaam"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Obtained
                    </label>
                    <input
                      type="date"
                      value={newQualification.dateObtained}
                      onChange={(e) => setNewQualification(prev => ({ ...prev, dateObtained: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate Number
                    </label>
                    <input
                      type="text"
                      value={newQualification.certificateNumber}
                      onChange={(e) => setNewQualification(prev => ({ ...prev, certificateNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowQualificationModal(false);
                      setNewQualification({
                        title: '',
                        institution: '',
                        dateObtained: '',
                        expiryDate: '',
                        certificateNumber: '',
                        description: ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddQualification}>
                    Add Qualification
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
