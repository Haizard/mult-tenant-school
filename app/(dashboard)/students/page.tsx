'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MoreHorizontal,
  Users,
  GraduationCap,
  UserCheck,
  AlertCircle,
  Calendar,
  BookOpen,
  Heart,
  FileText,
  TrendingUp,
  Award,
  Eye,
  Edit3,
  Mail,
  Phone,
  MapPin,
  Clock,
  Star,
  Shield
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { studentService, Student, StudentFilters } from '@/lib/studentService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StudentFilters>({
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
  }, [filters]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await studentService.getStudents(filters);
      
      if (response.success && response.data) {
        setStudents(response.data);
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        });
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({
      ...prev,
      search: value || undefined,
      page: 1
    }));
  };

  const handleFilterChange = (key: keyof StudentFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value || undefined,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="space-y-6">
        {/* Header Section - Match TenantAdmin Dashboard Style */}
        <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Student Management</h1>
              <p className="text-text-secondary">Comprehensive student enrollment and academic tracking system</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="secondary" 
                size="sm"
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button 
                variant="primary"
                onClick={() => window.location.href = '/students/new'}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Student
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Matching TenantAdmin Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="gradient" glow="blue">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{pagination.total}</p>
                <p className="text-xs text-gray-500 mt-1">+12% this month</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="text-2xl text-blue-600" />
              </div>
            </div>
          </Card>

          <Card variant="gradient" glow="green">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-3xl font-bold text-gray-900">
                  {students.filter(s => s.status === 'ACTIVE').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">98.5% active rate</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <UserCheck className="text-2xl text-green-600" />
              </div>
            </div>
          </Card>

          <Card variant="gradient" glow="purple">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Graduates</p>
                <p className="text-3xl font-bold text-gray-900">
                  {students.filter(s => s.status === 'GRADUATED').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">2024 Academic Year</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Award className="text-2xl text-purple-600" />
              </div>
            </div>
          </Card>

          <Card variant="gradient" glow="orange">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-3xl font-bold text-gray-900">
                  {students.filter(s => {
                    const createdDate = new Date(s.createdAt);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return createdDate > thirtyDaysAgo;
                  }).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Recent enrollments</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Star className="text-2xl text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter Section - Simplified to match system style */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Student Directory</h2>
              <p className="text-gray-600">Search and manage student records</p>
            </div>
          </div>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="GRADUATED">Graduated</option>
              <option value="TRANSFERRED">Transferred</option>
              <option value="DROPPED">Dropped</option>
            </select>
            
            {/* Gender Filter */}
            <select
              value={filters.gender || 'all'}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Student Cards */}
          <div className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-gray-500">Loading students...</div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-16">
                <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || filters.status || filters.gender ? 'No matches found' : 'No students enrolled yet'}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  {searchTerm || filters.status || filters.gender
                    ? 'Try adjusting your search criteria or filters'
                    : 'Ready to build your student community? Add your first student to get started'
                  }
                </p>
                {!searchTerm && !filters.status && !filters.gender && (
                  <Button 
                    variant="primary"
                    onClick={() => window.location.href = '/students/new'}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Enroll First Student
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <Card key={student.id} className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between p-6">
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {student.user.firstName[0]}{student.user.lastName[0]}
                        </div>
                        
                        {/* Student Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {student.user.firstName} {student.user.lastName}
                            </h3>
                            <Badge 
                              className={`text-xs ${
                                student.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                                student.status === 'GRADUATED' ? 'bg-blue-100 text-blue-800' :
                                student.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {student.status}
                            </Badge>
                            <Badge className={`text-xs ${
                              student.gender === 'MALE' ? 'bg-blue-100 text-blue-800' :
                              student.gender === 'FEMALE' ? 'bg-pink-100 text-pink-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {student.gender}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{student.user.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Age: {calculateAge(student.dateOfBirth)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{student.region}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Student ID: {student.studentId}</p>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.location.href = `/students/${student.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.location.href = `/students/${student.id}/edit`}
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Manage Enrollments
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Award className="h-4 w-4 mr-2" />
                              Academic Records
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Clock className="h-4 w-4 mr-2" />
                              Attendance
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Heart className="h-4 w-4 mr-2" />
                              Health Records
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Documents
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Card className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-gray-600 text-sm">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} students
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={pagination.page === page ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-10 h-10 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
