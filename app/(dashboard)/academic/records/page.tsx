'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MoreHorizontal,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Calendar,
  Users,
  Award,
  AlertCircle
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { studentService, StudentAcademicRecord } from '@/lib/studentService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';

export default function AcademicRecordsPage() {
  const [records, setRecords] = useState<StudentAcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      // This would typically load all academic records
      // For now, we'll use a placeholder
      setRecords([]);
    } catch (error) {
      console.error('Error loading academic records:', error);
      toast({
        title: 'Error',
        description: 'Failed to load academic records',
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
      case 'ARCHIVED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    
    const gradeValue = grade.charAt(0);
    switch (gradeValue) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBehaviorColor = (behavior: string) => {
    switch (behavior) {
      case 'EXCELLENT': return 'bg-green-100 text-green-800';
      case 'GOOD': return 'bg-blue-100 text-blue-800';
      case 'FAIR': return 'bg-yellow-100 text-yellow-800';
      case 'POOR': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = !searchTerm || 
      record.academicYear.yearName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.class?.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subject?.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.grade?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || record.status === statusFilter;
    const matchesTerm = !termFilter || record.term === termFilter;
    const matchesYear = !yearFilter || record.academicYear.yearName === yearFilter;
    
    return matchesSearch && matchesStatus && matchesTerm && matchesYear;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Records</h1>
          <p className="text-muted-foreground">
            Manage student academic records, grades, and performance tracking
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/academic/records/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
            <p className="text-xs text-muted-foreground">
              All academic records
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Records</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.length > 0 
                ? (records.reduce((sum, r) => sum + (r.averageMarks || 0), 0) / records.length).toFixed(1)
                : '0.0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Overall average
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter(r => r.grade && r.grade.startsWith('A')).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Grade A students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Records Directory</CardTitle>
          <CardDescription>
            Search and filter academic records by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by student, subject, class, or academic year..."
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
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={termFilter}
                onValueChange={setTermFilter}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Terms</SelectItem>
                  <SelectItem value="FIRST_TERM">First Term</SelectItem>
                  <SelectItem value="SECOND_TERM">Second Term</SelectItem>
                  <SelectItem value="THIRD_TERM">Third Term</SelectItem>
                  <SelectItem value="ANNUAL">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Records Table */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No academic records found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter || termFilter
                    ? 'Try adjusting your search criteria'
                    : 'Get started by adding your first academic record'
                  }
                </p>
                {!searchTerm && !statusFilter && !termFilter && (
                  <Button asChild>
                    <Link href="/academic/records/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Record
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRecords.map((record) => (
                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">
                                {record.academicYear.yearName}
                                {record.term && ` • ${record.term}`}
                              </h3>
                              <Badge className={getStatusColor(record.status)}>
                                {record.status}
                              </Badge>
                              {record.grade && (
                                <Badge className={getGradeColor(record.grade)}>
                                  {record.grade}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                              <p>
                                {record.class?.className || 'No Class'} • 
                                {record.subject?.subjectName || 'General'}
                              </p>
                              <div className="flex items-center space-x-4">
                                {record.totalMarks && (
                                  <span>Total: {record.totalMarks}</span>
                                )}
                                {record.averageMarks && (
                                  <span>Average: {record.averageMarks.toFixed(2)}</span>
                                )}
                                {record.rank && (
                                  <span>Rank: #{record.rank}</span>
                                )}
                                {record.attendance && (
                                  <span>Attendance: {record.attendance}%</span>
                                )}
                              </div>
                              {record.behavior && (
                                <div className="flex items-center space-x-2">
                                  <span>Behavior:</span>
                                  <Badge className={getBehaviorColor(record.behavior)}>
                                    {record.behavior}
                                  </Badge>
                                </div>
                              )}
                              {record.comments && (
                                <p className="text-gray-600">{record.comments}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-right text-sm text-gray-500">
                            <p>Created: {format(new Date(record.createdAt), 'MMM dd, yyyy')}</p>
                            {record.updatedAt !== record.createdAt && (
                              <p>Updated: {format(new Date(record.updatedAt), 'MMM dd, yyyy')}</p>
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
                                <Link href={`/academic/records/${record.id}`}>
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/academic/records/${record.id}/edit`}>
                                  Edit Record
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Generate Report
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Archive Record
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
  );
}

