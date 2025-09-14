'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Heart,
  FileText,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { studentService, Student, StudentAcademicRecord, Attendance } from '@/lib/studentService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ParentPortalPage() {
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [academicRecords, setAcademicRecords] = useState<StudentAcademicRecord[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadChildData(selectedChild.id);
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    try {
      setLoading(true);
      // This would typically load the parent's children
      // For now, we'll use a placeholder
      setChildren([]);
    } catch (error) {
      console.error('Error loading children:', error);
      toast({
        title: 'Error',
        description: 'Failed to load children information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChildData = async (childId: string) => {
    try {
      // Load academic records and attendance for the selected child
      // This would use the parent portal API endpoints
      setAcademicRecords([]);
      setAttendance([]);
    } catch (error) {
      console.error('Error loading child data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load child data',
        variant: 'destructive'
      });
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

  const getAttendanceStatus = (status: string) => {
    switch (status) {
      case 'PRESENT': return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'ABSENT': return { color: 'bg-red-100 text-red-800', icon: AlertCircle };
      case 'LATE': return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'EXCUSED': return { color: 'bg-blue-100 text-blue-800', icon: CheckCircle };
      case 'SICK': return { color: 'bg-orange-100 text-orange-800', icon: Heart };
      default: return { color: 'bg-gray-100 text-gray-800', icon: Clock };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parent Portal</h1>
          <p className="text-muted-foreground">
            Monitor your children's academic progress and school activities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Contact School
          </Button>
        </div>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No children found</h3>
            <p className="text-gray-500 mb-4">
              You don't have any children registered in the system yet.
            </p>
            <Button asChild>
              <Link href="/contact">
                Contact School
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Children Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Your Children</CardTitle>
              <CardDescription>
                Select a child to view their academic information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {children.map((child) => (
                  <Card 
                    key={child.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedChild?.id === child.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedChild(child)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-600">
                            {child.user.firstName[0]}{child.user.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {child.user.firstName} {child.user.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Age: {calculateAge(child.dateOfBirth)} • {child.studentId}
                          </p>
                          <Badge className={getStatusColor(child.status)}>
                            {child.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedChild && (
            <>
              {/* Child Overview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Class</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedChild.enrollments?.find(e => e.isActive)?.class?.className || 'Not Assigned'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedChild.enrollments?.find(e => e.isActive)?.academicYear?.yearName || 'No active enrollment'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">95%</div>
                    <p className="text-xs text-muted-foreground">
                      Last 30 days
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">A-</div>
                    <p className="text-xs text-muted-foreground">
                      Current term
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Next Exam</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Dec 15</div>
                    <p className="text-xs text-muted-foreground">
                      Mathematics
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Child Details Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="academic">Academic Records</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="health">Health Records</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Personal Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Users className="h-5 w-5" />
                          <span>Personal Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Full Name</label>
                            <p className="text-sm">{selectedChild.user.firstName} {selectedChild.user.lastName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Age</label>
                            <p className="text-sm">{calculateAge(selectedChild.dateOfBirth)} years old</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Student ID</label>
                            <p className="text-sm font-mono">{selectedChild.studentId}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <Badge className={getStatusColor(selectedChild.status)}>
                              {selectedChild.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Phone className="h-5 w-5" />
                          <span>Contact Information</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{selectedChild.user.email}</span>
                          </div>
                          {selectedChild.phone && (
                            <div className="flex items-center space-x-3">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{selectedChild.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{selectedChild.address}, {selectedChild.city}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
                        {selectedChild.user.firstName}'s academic performance and progress
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {academicRecords.length > 0 ? (
                        <div className="space-y-4">
                          {academicRecords.map((record) => (
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
                          <p className="text-gray-500">No academic records found for {selectedChild.user.firstName}.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Attendance Tab */}
                <TabsContent value="attendance" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Attendance Records</span>
                      </CardTitle>
                      <CardDescription>
                        {selectedChild.user.firstName}'s attendance history
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {attendance.length > 0 ? (
                        <div className="space-y-4">
                          {attendance.map((record) => {
                            const statusInfo = getAttendanceStatus(record.status);
                            const StatusIcon = statusInfo.icon;
                            return (
                              <div key={record.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <StatusIcon className="h-5 w-5 text-gray-400" />
                                    <div>
                                      <p className="font-medium">{format(new Date(record.date), 'MMM dd, yyyy')}</p>
                                      <p className="text-sm text-gray-500">
                                        {record.class?.className || record.subject?.subjectName || 'General'}
                                        {record.period && ` • ${record.period}`}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge className={statusInfo.color}>
                                    {record.status}
                                  </Badge>
                                </div>
                                {record.reason && (
                                  <p className="text-sm text-gray-600 mt-2">Reason: {record.reason}</p>
                                )}
                                {record.notes && (
                                  <p className="text-sm text-gray-600 mt-1">Notes: {record.notes}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
                          <p className="text-gray-500">No attendance records found for {selectedChild.user.firstName}.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Additional tabs would be implemented here... */}
                <TabsContent value="schedule">
                  <Card>
                    <CardHeader>
                      <CardTitle>Class Schedule</CardTitle>
                      <CardDescription>Daily class schedule and timetable</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Schedule</h3>
                        <p className="text-gray-500">Class schedule will be displayed here.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="health">
                  <Card>
                    <CardHeader>
                      <CardTitle>Health Records</CardTitle>
                      <CardDescription>Medical information and health records</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Health Records</h3>
                        <p className="text-gray-500">Health information will be displayed here.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </>
      )}
    </div>
  );
}




