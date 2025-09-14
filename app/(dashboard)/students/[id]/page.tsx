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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="space-y-6">
        {/* Header - Match system style */}
        <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.href = '/students'}
                  className="flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Students
                </Button>
              </div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                {student.user.firstName} {student.user.lastName}
              </h1>
              <p className="text-text-secondary">
                Student ID: {student.studentId} • {student.user.email}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {student.user.firstName[0]}{student.user.lastName[0]}
              </div>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => window.location.href = `/students/${student.id}/edit`}
                className="flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Status and Basic Info */}
          <div className="flex items-center space-x-3 mt-4">
            <Badge className={getStatusColor(student.status)}>
              {student.status}
            </Badge>
            <Badge className={getGenderColor(student.gender)}>
              {student.gender}
            </Badge>
            <Badge variant="outline">
              Age: {calculateAge(student.dateOfBirth)}
            </Badge>
            {student.admissionNumber && (
              <Badge variant="outline">
                Admission: {student.admissionNumber}
              </Badge>
            )}
          </div>
        </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="academic">Academic Records</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="health">Health Records</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="parents">Parents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>
                <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-sm">{student.user.firstName} {student.user.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-sm">{format(new Date(student.dateOfBirth), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-sm">{student.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nationality</label>
                    <p className="text-sm">{student.nationality}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Religion</label>
                    <p className="text-sm">{student.religion || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Blood Group</label>
                    <p className="text-sm">{student.bloodGroup || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                </div>
                <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{student.user.email}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{student.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{student.address}, {student.city}, {student.region}</span>
                  </div>
                  {student.postalCode && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Postal Code: {student.postalCode}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 rounded-lg bg-red-100">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                </div>
                <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact Person</label>
                    <p className="text-sm">{student.emergencyContact}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                    <p className="text-sm">{student.emergencyPhone}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Academic Information */}
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
                </div>
                <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Student ID</label>
                    <p className="text-sm font-mono">{student.studentId}</p>
                  </div>
                  {student.admissionNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Admission Number</label>
                      <p className="text-sm font-mono">{student.admissionNumber}</p>
                    </div>
                  )}
                  {student.admissionDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Admission Date</label>
                      <p className="text-sm">{format(new Date(student.admissionDate), 'MMM dd, yyyy')}</p>
                    </div>
                  )}
                  {student.previousSchool && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Previous School</label>
                      <p className="text-sm">{student.previousSchool}</p>
                    </div>
                  )}
                  {student.previousGrade && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Previous Grade</label>
                      <p className="text-sm">{student.previousGrade}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Transport Information */}
          {(student.transportMode || student.transportRoute) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Transport Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {student.transportMode && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Transport Mode</label>
                      <p className="text-sm">{student.transportMode}</p>
                    </div>
                  )}
                  {student.transportRoute && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Transport Route</label>
                      <p className="text-sm">{student.transportRoute}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medical Information */}
          {student.medicalInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Medical Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{student.medicalInfo}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Enrollments Tab */}
        <TabsContent value="enrollments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Current Enrollments</span>
              </CardTitle>
              <CardDescription>
                Active course, subject, and class enrollments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {student.enrollments && student.enrollments.length > 0 ? (
                <div className="space-y-4">
                  {student.enrollments
                    .filter(enrollment => enrollment.isActive)
                    .map((enrollment) => (
                      <div key={enrollment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">
                              {enrollment.class?.className || 
                               enrollment.course?.courseName || 
                               enrollment.subject?.subjectName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {enrollment.academicYear.yearName} • {enrollment.enrollmentType}
                            </p>
                          </div>
                          <Badge className={enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {enrollment.status}
                          </Badge>
                        </div>
                        {enrollment.notes && (
                          <p className="text-sm text-gray-600 mt-2">{enrollment.notes}</p>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments</h3>
                  <p className="text-gray-500">This student is not currently enrolled in any programs.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Records Tab */}
        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Academic Records</span>
              </CardTitle>
              <CardDescription>
                Student's academic performance and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {student.academicRecords && student.academicRecords.length > 0 ? (
                <div className="space-y-4">
                  {student.academicRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {record.academicYear.yearName}
                          {record.term && ` • ${record.term}`}
                        </h4>
                        <Badge className={record.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {record.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {record.totalMarks && (
                          <div>
                            <label className="text-gray-500">Total Marks</label>
                            <p className="font-medium">{record.totalMarks}</p>
                          </div>
                        )}
                        {record.averageMarks && (
                          <div>
                            <label className="text-gray-500">Average</label>
                            <p className="font-medium">{record.averageMarks.toFixed(2)}</p>
                          </div>
                        )}
                        {record.grade && (
                          <div>
                            <label className="text-gray-500">Grade</label>
                            <p className="font-medium">{record.grade}</p>
                          </div>
                        )}
                        {record.rank && (
                          <div>
                            <label className="text-gray-500">Rank</label>
                            <p className="font-medium">#{record.rank}</p>
                          </div>
                        )}
                      </div>
                      {record.comments && (
                        <p className="text-sm text-gray-600 mt-2">{record.comments}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No academic records</h3>
                  <p className="text-gray-500">No academic records found for this student.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional tabs would be implemented here... */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Student attendance history and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Attendance Records</h3>
                <p className="text-gray-500">Attendance tracking will be implemented here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Health Records</CardTitle>
              <CardDescription>Student health information and medical records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Health Records</h3>
                <p className="text-gray-500">Health record management will be implemented here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Student documents and file management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Documents</h3>
                <p className="text-gray-500">Document management will be implemented here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parents">
          <Card>
            <CardHeader>
              <CardTitle>Parents & Guardians</CardTitle>
              <CardDescription>Parent and guardian information</CardDescription>
            </CardHeader>
            <CardContent>
              {student.parentRelations && student.parentRelations.length > 0 ? (
                <div className="space-y-4">
                  {student.parentRelations.map((relation) => (
                    <div key={relation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">
                            {relation.parent.user.firstName} {relation.parent.user.lastName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {relation.relationship} • {relation.parent.user.email}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {relation.isPrimary && (
                            <Badge variant="outline">Primary</Badge>
                          )}
                          {relation.isEmergency && (
                            <Badge variant="outline">Emergency</Badge>
                          )}
                          {relation.canPickup && (
                            <Badge variant="outline">Can Pickup</Badge>
                          )}
                        </div>
                      </div>
                      {relation.notes && (
                        <p className="text-sm text-gray-600 mt-2">{relation.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No parents assigned</h3>
                  <p className="text-gray-500">No parent or guardian information found for this student.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}




