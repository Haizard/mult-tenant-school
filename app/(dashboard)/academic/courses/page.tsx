'use client';

import { useState, useEffect } from 'react';
import { FaBookOpen, FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaGraduationCap, FaUsers } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTable from '@/components/ui/DataTable';
import { useAuth } from '@/contexts/AuthContext';
import { academicService } from '@/lib/academicService';
import { notificationService } from '@/lib/notifications';

// Sample course data - fallback
const sampleCourses = [
  {
    id: '1',
    courseCode: 'CS101',
    courseName: 'Introduction to Computer Science',
    description: 'Basic concepts of computer science and programming',
    credits: 4,
    status: 'ACTIVE',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z',
    tenant: { name: 'Default School' },
    createdByUser: { firstName: 'Super', lastName: 'Admin', email: 'admin@schoolsystem.com' },
    courseSubjects: [
      { subject: { subjectName: 'Programming', subjectCode: 'PROG' } },
      { subject: { subjectName: 'Mathematics', subjectCode: 'MATH' } }
    ]
  },
  {
    id: '2',
    courseCode: 'MATH201',
    courseName: 'Advanced Mathematics',
    description: 'Advanced mathematical concepts and applications',
    credits: 3,
    status: 'ACTIVE',
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2023-02-15T00:00:00Z',
    tenant: { name: 'Default School' },
    createdByUser: { firstName: 'John', lastName: 'Smith', email: 'teacher1@schoolsystem.com' },
    courseSubjects: [
      { subject: { subjectName: 'Calculus', subjectCode: 'CALC' } }
    ]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'warning';
    case 'ARCHIVED':
      return 'danger';
    default:
      return 'default';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function CoursesPage() {
  const { user } = useAuth();
  
  // Check if user has permission to manage courses
  const canManageCourses = user?.roles?.some(role => 
    ['Super Admin', 'Tenant Admin'].includes(role.name)
  ) || false;
  
  const canViewCourses = user?.roles?.some(role => 
    ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'].includes(role.name)
  ) || false;
  
  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Load courses from API
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const response = await academicService.getCourses();
      
      if (response.success && response.data) {
        setCourses(response.data);
      } else {
        console.error('Failed to load courses:', response.message);
        notificationService.error('Failed to load courses');
        // Fallback to sample data
        setCourses(sampleCourses);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      notificationService.error('Failed to load courses');
      // Fallback to sample data
      setCourses(sampleCourses);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateCourse = () => {
    window.location.href = '/academic/courses/create';
  };

  const handleEditCourse = (courseId: string) => {
    window.location.href = `/academic/courses/${courseId}/edit`;
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        await academicService.deleteCourse(courseId);
        notificationService.success('Course deleted successfully');
        loadCourses(); // Reload the list
      } catch (error) {
        console.error('Error deleting course:', error);
        notificationService.error('Failed to delete course');
      }
    }
  };

  const handleViewCourse = (courseId: string) => {
    window.location.href = `/academic/courses/${courseId}`;
  };

  const columns = [
    {
      key: 'course',
      label: 'Course',
      sortable: true,
      render: (value: any, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-green-light rounded-full flex items-center justify-center text-white font-semibold">
            <FaBookOpen className="text-sm" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">{row.courseName}</p>
            <p className="text-sm text-text-secondary">{row.courseCode}</p>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      render: (value: string) => (
        <p className="text-sm text-text-primary max-w-xs truncate">{value || 'No description'}</p>
      )
    },
    {
      key: 'credits',
      label: 'Credits',
      sortable: true,
      render: (value: number) => (
        <span className="text-sm font-medium text-text-primary">{value || 0}</span>
      )
    },
    {
      key: 'subjects',
      label: 'Subjects',
      sortable: false,
      render: (value: any, row: any) => (
        <div className="flex flex-wrap gap-1">
          {(row.courseSubjects || []).slice(0, 2).map((cs: any, index: number) => (
            <span
              key={index}
              className="text-xs bg-accent-blue/10 text-accent-blue px-2 py-1 rounded-full"
            >
              {cs.subject?.subjectName || 'Unknown'}
            </span>
          ))}
          {(row.courseSubjects || []).length > 2 && (
            <span className="text-xs text-text-muted">
              +{(row.courseSubjects || []).length - 2} more
            </span>
          )}
          {(row.courseSubjects || []).length === 0 && (
            <span className="text-xs text-text-muted">No subjects</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <StatusBadge status={getStatusColor(value || 'INACTIVE') as any} size="sm">
          {value || 'INACTIVE'}
        </StatusBadge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value: any, row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewCourse(row.id)}
            className="glass-button p-2 hover:bg-accent-blue/10 hover:text-accent-blue transition-colors"
            title="View Course"
          >
            <FaEye className="text-sm" />
          </button>
          <button
            onClick={() => handleEditCourse(row.id)}
            className="glass-button p-2 hover:bg-accent-green/10 hover:text-accent-green transition-colors"
            title="Edit Course"
          >
            <FaEdit className="text-sm" />
          </button>
          <button
            onClick={() => handleDeleteCourse(row.id)}
            className="glass-button p-2 hover:bg-red-500/10 hover:text-red-500 transition-colors"
            title="Delete Course"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass-card p-6 bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border-accent-green/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Course Management</h1>
            <p className="text-text-secondary">Manage courses and their subject combinations</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status="success" size="lg">
              {courses.filter(c => c.status === 'ACTIVE').length} Active Courses
            </StatusBadge>
            <Button variant="primary" size="md" onClick={handleCreateCourse}>
              <FaPlus className="mr-2" />
              Add Course
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-accent-green to-accent-green-light rounded-xl">
              <FaBookOpen className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Courses</p>
              <p className="text-2xl font-bold text-text-primary">{courses.length}</p>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-xl">
              <FaGraduationCap className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Active Courses</p>
              <p className="text-2xl font-bold text-text-primary">
                {courses.filter(c => c.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-accent-purple to-accent-purple-light rounded-xl">
              <FaUsers className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Credits</p>
              <p className="text-2xl font-bold text-text-primary">
                {courses.reduce((sum, c) => sum + (c.credits || 0), 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl">
              <FaBookOpen className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Avg Credits</p>
              <p className="text-2xl font-bold text-text-primary">
                {courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + (c.credits || 0), 0) / courses.length) : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card variant="strong" glow="green">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input pl-10 pr-4 py-2 w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input px-4 py-2"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <FaFilter className="text-text-muted" />
            <span className="text-sm text-text-secondary">
              {filteredCourses.length} of {courses.length} courses
            </span>
          </div>
        </div>
      </Card>

      {/* Courses Table */}
      <Card variant="strong" glow="green">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Courses List</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Showing</span>
            <select className="glass-input px-3 py-1 text-sm">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-sm text-text-secondary">per page</span>
          </div>
        </div>

        <DataTable
          data={filteredCourses}
          columns={columns}
          searchable={false} // We have our own search
          filterable={false} // We have our own filters
          pagination={true}
          pageSize={10}
          loading={isLoading}
        />
      </Card>
    </div>
  );
}