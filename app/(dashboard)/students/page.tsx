'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30">
      {/* Premium Header with Glassmorphism */}
      <div className="glass-card-premium p-6 animate-slide-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-purple-light shadow-purple-glow">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text-animated">Student Management</h1>
              <p className="text-text-secondary mt-1">
                Comprehensive student enrollment and academic tracking system
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="secondary" 
              className="glass-button hover-lift shadow-glass-light border-glass-border text-text-primary"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button 
              asChild
              className="btn-primary hover-lift animate-glow"
            >
              <Link href="/students/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Student
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-slide-in-up" style={{animationDelay: '0.1s'}}>
        <div className="glass-card-premium p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-text-secondary text-sm font-medium tracking-wide uppercase">Total Students</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-text-primary">{pagination.total}</p>
                <span className="text-sm text-accent-green font-medium flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12%
                </span>
              </div>
              <p className="text-xs text-text-muted">Growth from last month</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-blue-light shadow-blue-glow">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="glass-card-premium p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-text-secondary text-sm font-medium tracking-wide uppercase">Active Students</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-text-primary">
                  {students.filter(s => s.status === 'ACTIVE').length}
                </p>
                <span className="text-sm text-accent-green font-medium">98.5%</span>
              </div>
              <p className="text-xs text-text-muted">Currently enrolled</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-accent-green to-accent-green-light shadow-green-glow">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="glass-card-premium p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-text-secondary text-sm font-medium tracking-wide uppercase">Graduates</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-text-primary">
                  {students.filter(s => s.status === 'GRADUATED').length}
                </p>
                <span className="text-sm text-accent-purple font-medium">2024</span>
              </div>
              <p className="text-xs text-text-muted">This academic year</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-purple-light shadow-purple-glow">
              <Award className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="glass-card-premium p-6 hover-lift transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-text-secondary text-sm font-medium tracking-wide uppercase">New This Month</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-text-primary">
                  {students.filter(s => {
                    const createdDate = new Date(s.createdAt);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return createdDate > thirtyDaysAgo;
                  }).length}
                </p>
                <span className="text-sm text-status-warning font-medium">Fresh</span>
              </div>
              <p className="text-xs text-text-muted">Recent enrollments</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-status-warning to-yellow-400 shadow-orange-glow">
              <Star className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Premium Search and Filter Section */}
      <div className="glass-card-premium p-6 animate-slide-in-up" style={{animationDelay: '0.2s'}}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-accent-blue/20 to-accent-purple/20">
              <Search className="h-5 w-5 text-accent-purple" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Student Directory</h2>
              <p className="text-text-secondary text-sm">Advanced search and filtering capabilities</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="glass-button text-text-secondary hover:text-accent-purple"
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="glass-button text-text-secondary hover:text-accent-green"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted group-hover:text-accent-purple transition-colors duration-200 h-5 w-5" />
              <Input
                placeholder="Search by name, student ID, email, or phone number..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="input-field pl-12 pr-4 py-4 text-base border-0 focus:ring-2 focus:ring-accent-purple/30"
              />
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex gap-3">
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="glass-input w-[160px] border-glass-border hover:border-accent-purple/30 transition-colors">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-accent-purple" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="glass-card border-glass-border">
                <SelectItem value="all" className="hover:bg-glass-white/50">🔍 All Status</SelectItem>
                <SelectItem value="ACTIVE" className="hover:bg-green-50/50">✅ Active</SelectItem>
                <SelectItem value="INACTIVE" className="hover:bg-gray-50/50">⏸️ Inactive</SelectItem>
                <SelectItem value="SUSPENDED" className="hover:bg-red-50/50">🚫 Suspended</SelectItem>
                <SelectItem value="GRADUATED" className="hover:bg-blue-50/50">🎓 Graduated</SelectItem>
                <SelectItem value="TRANSFERRED" className="hover:bg-yellow-50/50">📤 Transferred</SelectItem>
                <SelectItem value="DROPPED" className="hover:bg-red-50/50">❌ Dropped</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.gender || 'all'}
              onValueChange={(value) => handleFilterChange('gender', value)}
            >
              <SelectTrigger className="glass-input w-[140px] border-glass-border hover:border-accent-blue/30 transition-colors">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-accent-blue" />
                  <SelectValue placeholder="Gender" />
                </div>
              </SelectTrigger>
              <SelectContent className="glass-card border-glass-border">
                <SelectItem value="all" className="hover:bg-glass-white/50">🔍 All Gender</SelectItem>
                <SelectItem value="MALE" className="hover:bg-blue-50/50">👨 Male</SelectItem>
                <SelectItem value="FEMALE" className="hover:bg-pink-50/50">👩 Female</SelectItem>
                <SelectItem value="OTHER" className="hover:bg-purple-50/50">🏳️‍⚧️ Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Premium Student Cards */}
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-purple/20 border-t-accent-purple mx-auto"></div>
                <p className="text-text-muted font-medium">Loading student directory...</p>
              </div>
            </div>
          ) : students.length === 0 ? (
            <div className="glass-card-premium p-12 text-center animate-fade-in-scale">
              <div className="space-y-6">
                <div className="p-4 rounded-full bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 w-20 h-20 mx-auto flex items-center justify-center">
                  <GraduationCap className="h-10 w-10 text-accent-purple" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-text-primary">
                    {searchTerm || filters.status || filters.gender ? 'No matches found' : 'No students enrolled yet'}
                  </h3>
                  <p className="text-text-secondary max-w-md mx-auto">
                    {searchTerm || filters.status || filters.gender
                      ? 'Try adjusting your search criteria or filters to find what you’re looking for'
                      : 'Ready to build your student community? Add your first student to get started'
                    }
                  </p>
                </div>
                {!searchTerm && !filters.status && !filters.gender && (
                  <Button asChild className="btn-primary animate-glow">
                    <Link href="/students/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Enroll First Student
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 animate-slide-in-up" style={{animationDelay: '0.3s'}}>
              {students.map((student, index) => (
                <div 
                  key={student.id} 
                  className="glass-card-premium hover-lift transition-all duration-300 overflow-hidden"
                  style={{animationDelay: `${0.1 * index}s`}}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      {/* Student Info Section */}
                      <div className="flex items-center space-x-6 flex-1">
                        {/* Avatar */}
                        <div className="relative">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 backdrop-blur-sm border border-glass-border flex items-center justify-center shadow-glass">
                            <span className="text-xl font-bold bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent">
                              {student.user.firstName[0]}{student.user.lastName[0]}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-accent-green to-green-400 flex items-center justify-center shadow-green-glow">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* Student Details */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-xl font-bold text-text-primary hover:text-accent-purple transition-colors cursor-pointer">
                                  {student.user.firstName} {student.user.lastName}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    student.status === 'ACTIVE' ? 'badge-success' : 
                                    student.status === 'GRADUATED' ? 'badge-info' :
                                    student.status === 'SUSPENDED' ? 'badge-danger' : 'badge-warning'
                                  }`}>
                                    {student.status === 'ACTIVE' ? '✅' : 
                                     student.status === 'GRADUATED' ? '🎓' :
                                     student.status === 'SUSPENDED' ? '🚫' : '⏸️'} {student.status}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    student.gender === 'MALE' ? 'bg-blue-100 text-blue-800' :
                                    student.gender === 'FEMALE' ? 'bg-pink-100 text-pink-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {student.gender === 'MALE' ? '👨' : student.gender === 'FEMALE' ? '👩' : '🏳️‍⚧️'} {student.gender}
                                  </span>
                                </div>
                              </div>
                              <p className="text-text-secondary text-sm font-medium">Student ID: {student.studentId}</p>
                            </div>
                          </div>
                          
                          {/* Contact Info */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center space-x-2 text-text-secondary">
                              <Mail className="h-4 w-4 text-accent-blue" />
                              <span className="truncate">{student.user.email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-text-secondary">
                              <Calendar className="h-4 w-4 text-accent-green" />
                              <span>Age: {calculateAge(student.dateOfBirth)} years</span>
                            </div>
                            <div className="flex items-center space-x-2 text-text-secondary">
                              <MapPin className="h-4 w-4 text-accent-purple" />
                              <span>{student.region}</span>
                            </div>
                          </div>
                          
                          {/* Enrollment Info */}
                          {student.enrollments && student.enrollments.length > 0 && (
                            <div className="flex items-center space-x-2 text-sm">
                              <BookOpen className="h-4 w-4 text-status-warning" />
                              <span className="text-text-secondary">
                                <span className="font-medium text-text-primary">Enrolled in:</span> {' '}
                                {student.enrollments
                                  .filter(e => e.isActive)
                                  .map(e => e.class?.className || e.course?.courseName || e.subject?.subjectName)
                                  .join(', ')
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions Section */}
                      <div className="flex items-center space-x-4">
                        {/* Admission Date */}
                        <div className="text-right space-y-1 hidden lg:block">
                          <div className="flex items-center space-x-1 text-text-muted text-xs">
                            <Clock className="h-3 w-3" />
                            <span>Admitted</span>
                          </div>
                          <p className="text-text-secondary text-sm font-medium">
                            {format(new Date(student.createdAt), 'MMM dd, yyyy')}
                          </p>
                          {student.admissionDate && (
                            <p className="text-text-muted text-xs">
                              Enrolled: {format(new Date(student.admissionDate), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <Button 
                            asChild
                            variant="ghost" 
                            size="sm"
                            className="glass-button text-accent-blue hover:text-accent-blue hover:bg-blue-50/30 transition-all duration-200"
                          >
                            <Link href={`/students/${student.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          
                          <Button 
                            asChild
                            variant="ghost" 
                            size="sm"
                            className="glass-button text-accent-green hover:text-accent-green hover:bg-green-50/30 transition-all duration-200"
                          >
                            <Link href={`/students/${student.id}/edit`}>
                              <Edit3 className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="glass-button text-text-secondary hover:text-accent-purple transition-all duration-200"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-card border-glass-border shadow-glass">
                              <DropdownMenuItem asChild className="hover:bg-glass-white/50 cursor-pointer">
                                <Link href={`/students/${student.id}/enrollments`} className="flex items-center">
                                  <BookOpen className="h-4 w-4 mr-2 text-accent-blue" />
                                  Manage Enrollments
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="hover:bg-glass-white/50 cursor-pointer">
                                <Link href={`/students/${student.id}/academic-records`} className="flex items-center">
                                  <Award className="h-4 w-4 mr-2 text-accent-green" />
                                  Academic Records
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="hover:bg-glass-white/50 cursor-pointer">
                                <Link href={`/students/${student.id}/attendance`} className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2 text-status-warning" />
                                  Attendance
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="hover:bg-glass-white/50 cursor-pointer">
                                <Link href={`/students/${student.id}/health-records`} className="flex items-center">
                                  <Heart className="h-4 w-4 mr-2 text-status-danger" />
                                  Health Records
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="hover:bg-glass-white/50 cursor-pointer">
                                <Link href={`/students/${student.id}/documents`} className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-accent-purple" />
                                  Documents
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </div>

        {/* Premium Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 glass-card-premium p-4 animate-slide-in-up" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center justify-between">
              <div className="text-text-secondary text-sm font-medium">
                Showing <span className="text-text-primary font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="text-text-primary font-semibold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="text-text-primary font-semibold">{pagination.total}</span> students
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="glass-button disabled:opacity-50 disabled:cursor-not-allowed hover:text-accent-purple"
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 p-0 rounded-lg transition-all duration-200 ${
                          pagination.page === page
                            ? 'bg-gradient-to-r from-accent-purple to-accent-purple-light text-white shadow-purple-glow'
                            : 'glass-button hover:text-accent-purple hover:border-accent-purple/30'
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="glass-button disabled:opacity-50 disabled:cursor-not-allowed hover:text-accent-purple"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




