'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MoreHorizontal,
  BookOpen,
  GraduationCap,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { studentService, StudentEnrollment } from '@/lib/studentService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      // This would typically load all enrollments across students
      // For now, we'll use a placeholder
      setEnrollments([]);
    } catch (error) {
      console.error('Error loading enrollments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load enrollments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'DROPPED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'COURSE': return 'bg-blue-100 text-blue-800';
      case 'SUBJECT': return 'bg-purple-100 text-purple-800';
      case 'CLASS': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = !searchTerm || 
      enrollment.class?.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course?.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.subject?.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.academicYear.yearName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    const matchesType = typeFilter === 'all' || enrollment.enrollmentType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="space-y-6">
        {/* Header - Match system style */}
        <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Student Enrollments</h1>
              <p className="text-text-secondary">
                Manage student enrollments in courses, subjects, and classes
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-purple-light shadow-purple-glow">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="primary"
                onClick={() => window.location.href = '/students/enrollments/create'}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Enrollment
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Match system style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-3xl font-bold text-gray-900">{enrollments.length}</p>
                <p className="text-xs text-gray-500 mt-1">All time enrollments</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <BookOpen className="text-2xl text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Enrollments</p>
                <p className="text-3xl font-bold text-gray-900">
                  {enrollments.filter(e => e.status === 'ACTIVE').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Currently active</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="text-2xl text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Course Enrollments</p>
                <p className="text-3xl font-bold text-gray-900">
                  {enrollments.filter(e => e.enrollmentType === 'COURSE').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Course programs</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <GraduationCap className="text-2xl text-purple-600" />
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subject Enrollments</p>
                <p className="text-3xl font-bold text-gray-900">
                  {enrollments.filter(e => e.enrollmentType === 'SUBJECT').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Individual subjects</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <BookOpen className="text-2xl text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search - Match system style */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Enrollment Directory</h2>
              <p className="text-gray-600">Search and filter enrollments by various criteria</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by course, subject, class, or academic year..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="DROPPED">Dropped</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="COURSE">Course</SelectItem>
                  <SelectItem value="SUBJECT">Subject</SelectItem>
                  <SelectItem value="CLASS">Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Enrollments Table */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter || typeFilter
                    ? 'Try adjusting your search criteria'
                    : 'Get started by creating your first enrollment'
                  }
                </p>
                {!searchTerm && !statusFilter && !typeFilter && (
                  <Button asChild>
                    <Link href="/students/enrollments/create">
                      <Plus className="h-4 w-4 mr-2" />
                      New Enrollment
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEnrollments.map((enrollment) => (
                  <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            {enrollment.enrollmentType === 'COURSE' && <GraduationCap className="h-6 w-6 text-blue-600" />}
                            {enrollment.enrollmentType === 'SUBJECT' && <BookOpen className="h-6 w-6 text-purple-600" />}
                            {enrollment.enrollmentType === 'CLASS' && <Users className="h-6 w-6 text-green-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">
                                {enrollment.class?.className || 
                                 enrollment.course?.courseName || 
                                 enrollment.subject?.subjectName}
                              </h3>
                              <Badge className={getStatusColor(enrollment.status)}>
                                {enrollment.status}
                              </Badge>
                              <Badge className={getTypeColor(enrollment.enrollmentType)}>
                                {enrollment.enrollmentType}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                              <p>Academic Year: {enrollment.academicYear.yearName}</p>
                              <p>Enrolled: {format(new Date(enrollment.enrollmentDate), 'MMM dd, yyyy')}</p>
                              {enrollment.notes && (
                                <p className="text-gray-600">{enrollment.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-right text-sm text-gray-500">
                            <p>Created: {format(new Date(enrollment.createdAt), 'MMM dd, yyyy')}</p>
                            {enrollment.updatedAt !== enrollment.createdAt && (
                              <p>Updated: {format(new Date(enrollment.updatedAt), 'MMM dd, yyyy')}</p>
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/students/enrollments/${enrollment.id}`}>
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/students/enrollments/${enrollment.id}/edit`}>
                                  Edit Enrollment
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Update Status
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Remove Enrollment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}




