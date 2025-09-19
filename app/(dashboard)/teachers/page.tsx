'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  BookOpen,
  Award,
  UserCheck
} from 'lucide-react';
import { teacherService } from '@/lib/teacherService';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Teacher {
  id: string;
  teacherId: string;
  employeeNumber?: string;
  dateOfBirth: string;
  gender: string;
  nationality?: string;
  qualification?: string;
  experience?: number;
  specialization?: string;
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  joiningDate?: string;
  previousSchool?: string;
  teachingLicense?: string;
  licenseExpiry?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  subjects?: Array<{
    id: string;
    subject_name: string;
    subject_level: string;
    subject_type: string;
  }>;
}

export default function TeachersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    // Filter teachers based on search term
    const filtered = teachers.filter(teacher =>
      teacher.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacherId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [teachers, searchTerm]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getTeachers();
      // Ensure data is an array, fallback to empty array if not
      setTeachers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading teachers:', error);
      // Set empty array on error to prevent filter issues
      setTeachers([]);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load teachers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) {
      return;
    }

    try {
      await teacherService.deleteTeacher(teacherId);
      toast({
        title: 'Success',
        description: 'Teacher deleted successfully'
      });
      loadTeachers(); // Reload the list
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete teacher',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateExperience = (joiningDate: string) => {
    const today = new Date();
    const joinDate = new Date(joiningDate);
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
    return diffYears;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Teachers</h1>
              <p className="text-text-secondary">
                Manage teacher profiles, qualifications, and subject assignments
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-purple-light shadow-purple-glow">
                <Users className="h-8 w-8 text-white" />
              </div>
              <Link href="/teachers/new">
                <Button variant="primary" className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Teacher
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search teachers by name, email, teacher ID, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </Card>

        {/* Teachers Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-100">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Male Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teachers.filter(t => t.gender === 'MALE').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-pink-100">
                  <User className="h-6 w-6 text-pink-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Female Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teachers.filter(t => t.gender === 'FEMALE').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Subjects Taught</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teachers.reduce((total, teacher) => total + (teacher.subjects?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Teachers List */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Teachers</h3>
            
            {filteredTeachers.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'No teachers match your search criteria.' : 'Get started by adding your first teacher.'}
                </p>
                <Link href="/teachers/new">
                  <Button variant="primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Teacher
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teacher ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Specialization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subjects
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                                {(teacher.user?.firstName?.[0] || '?')}{(teacher.user?.lastName?.[0] || '')}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {teacher.user.firstName} {teacher.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {teacher.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{teacher.teacherId}</div>
                          {teacher.employeeNumber && (
                            <div className="text-sm text-gray-500">Emp: {teacher.employeeNumber}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{teacher.user.email}</div>
                          {teacher.user.phone && (
                            <div className="text-sm text-gray-500">{teacher.user.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{teacher.specialization || 'N/A'}</div>
                          {teacher.qualification && (
                            <div className="text-sm text-gray-500">{teacher.qualification}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {teacher.subjects?.slice(0, 2).map((subject, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {subject.subject_name}
                              </span>
                            ))}
                            {(teacher.subjects?.length || 0) > 2 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                +{(teacher.subjects?.length || 0) - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link href={`/teachers/${teacher.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/teachers/${teacher.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteTeacher(teacher.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
