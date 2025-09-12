'use client';

import { useState, useEffect } from 'react';
import { FaBook, FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaGraduationCap, FaCode, FaLock } from 'react-icons/fa';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import StatusBadge from '../../../components/ui/StatusBadge';
import DataTable from '../../../components/ui/DataTable';
import { useAuth } from '../../../contexts/AuthContext';
import { notificationService } from '../../../lib/notifications';

// Sample course data - replace with API calls
const sampleCourses = [
  {
    id: '1',
    courseCode: 'CS101',
    courseName: 'Introduction to Computer Science',
    description: 'Basic concepts of computer science and programming',
    credits: 3,
    status: 'ACTIVE',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z',
    tenant: { name: 'Default School' },
    createdByUser: { firstName: 'Super', lastName: 'Admin', email: 'admin@schoolsystem.com' },
    courseSubjects: [
      { subject: { subjectName: 'Programming Fundamentals', subjectLevel: 'O_LEVEL' } },
      { subject: { subjectName: 'Data Structures', subjectLevel: 'A_LEVEL' } }
    ]
  },
  {
    id: '2',
    courseCode: 'MATH201',
    courseName: 'Advanced Mathematics',
    description: 'Advanced mathematical concepts and applications',
    credits: 4,
    status: 'ACTIVE',
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2023-02-15T00:00:00Z',
    tenant: { name: 'Default School' },
    createdByUser: { firstName: 'John', lastName: 'Smith', email: 'teacher1@schoolsystem.com' },
    courseSubjects: [
      { subject: { subjectName: 'Calculus', subjectLevel: 'A_LEVEL' } },
      { subject: { subjectName: 'Algebra', subjectLevel: 'O_LEVEL' } }
    ]
  },
  {
    id: '3',
    courseCode: 'ENG101',
    courseName: 'English Language',
    description: 'English language and literature course',
    credits: 2,
    status: 'INACTIVE',
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2023-03-15T00:00:00Z',
    tenant: { name: 'Default School' },
    createdByUser: { firstName: 'Sarah', lastName: 'Johnson', email: 'teacher2@schoolsystem.com' },
    courseSubjects: [
      { subject: { subjectName: 'English Literature', subjectLevel: 'O_LEVEL' } }
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
  const [courses, setCourses] = useState(sampleCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateCourse = () => {
    // Navigate to create course page
    console.log('Navigate to create course');
  };

  const handleEditCourse = (courseId: string) => {
    // Navigate to edit course page
    console.log('Edit course:', courseId);
  };

  const handleDeleteCourse = (courseId: string) => {
    // Show confirmation and delete course
    console.log('Delete course:', courseId);
  };

  const handleViewCourse = (courseId: string) => {
    // Navigate to course details page
    console.log('View course:', courseId);
  };

  const columns = [
    {
      key: 'course',
      label: 'Course',
      sortable: true,
      render: (value: any, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-full flex items-center justify-center text-white font-semibold">
            <FaCode className="text-sm" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">{row.courseCode}</p>
            <p className="text-sm text-text-secondary">{row.courseName}</p>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      render: (value: string) => (
        <p className="text-sm text-text-primary max-w-xs truncate">{value}</p>
      )
    },
    {
      key: 'credits',
      label: 'Credits',
      sortable: true,
      render: (value: number) => (
        <span className="text-sm font-medium text-text-primary">{value}</span>
      )
    },
    {
      key: 'subjects',
      label: 'Subjects',
      sortable: false,
      render: (value: any, row: any) => (
        <div className="flex flex-wrap gap-1">
          {row.courseSubjects.slice(0, 2).map((cs: any, index: number) => (
            <span
              key={index}
              className="text-xs bg-accent-purple/10 text-accent-purple px-2 py-1 rounded-full"
            >
              {cs.subject.subjectName}
            </span>
          ))}
          {row.courseSubjects.length > 2 && (
            <span className="text-xs text-text-muted">
              +{row.courseSubjects.length - 2} more
            </span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <StatusBadge status={getStatusColor(value) as any} size="sm">
          {value}
        </StatusBadge>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-text-secondary">{formatDate(value)}</span>
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
          {canManageCourses && (
            <>
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
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass-card p-6 bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border-accent-blue/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Course Management</h1>
            <p className="text-text-secondary">
              {canManageCourses 
                ? "Manage courses, subjects, and academic structure" 
                : "View courses and academic structure"
              }
            </p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status="success" size="lg">
              {courses.filter(c => c.status === 'ACTIVE').length} Active Courses
            </StatusBadge>
            {canManageCourses && (
              <Button variant="primary" size="md" onClick={handleCreateCourse}>
                <FaPlus className="mr-2" />
                Add Course
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-xl">
              <FaBook className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Courses</p>
              <p className="text-2xl font-bold text-text-primary">{courses.length}</p>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-accent-green to-accent-green-light rounded-xl">
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
              <FaCode className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Credits</p>
              <p className="text-2xl font-bold text-text-primary">
                {courses.reduce((sum, course) => sum + course.credits, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl">
              <FaBook className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Avg Credits</p>
              <p className="text-2xl font-bold text-text-primary">
                {(courses.reduce((sum, course) => sum + course.credits, 0) / courses.length).toFixed(1)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card variant="strong" glow="blue">
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
      <Card variant="strong" glow="blue">
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
