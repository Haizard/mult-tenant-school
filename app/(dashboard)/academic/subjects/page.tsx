'use client';

import { useState, useEffect } from 'react';
import { FaBookOpen, FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import StatusBadge from '../../../components/ui/StatusBadge';
import DataTable from '../../../components/ui/DataTable';
import { useAuth } from '../../../contexts/AuthContext';

// Sample subject data - replace with API calls
const sampleSubjects = [
  {
    id: '1',
    subjectName: 'Mathematics',
    subjectCode: 'MATH',
    subjectLevel: 'O_LEVEL',
    subjectType: 'CORE',
    description: 'Core mathematics for O-Level students',
    credits: 4,
    status: 'ACTIVE',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z',
    tenant: { name: 'Default School' },
    createdByUser: { firstName: 'Super', lastName: 'Admin', email: 'admin@schoolsystem.com' },
    teacherSubjects: [
      { teacher: { firstName: 'John', lastName: 'Smith', email: 'teacher1@schoolsystem.com' } }
    ]
  },
  {
    id: '2',
    subjectName: 'Physics',
    subjectCode: 'PHY',
    subjectLevel: 'A_LEVEL',
    subjectType: 'COMBINATION',
    description: 'Advanced physics for A-Level students',
    credits: 3,
    status: 'ACTIVE',
    createdAt: '2023-02-01T00:00:00Z',
    updatedAt: '2023-02-15T00:00:00Z',
    tenant: { name: 'Default School' },
    createdByUser: { firstName: 'John', lastName: 'Smith', email: 'teacher1@schoolsystem.com' },
    teacherSubjects: [
      { teacher: { firstName: 'Michael', lastName: 'Brown', email: 'teacher2@schoolsystem.com' } }
    ]
  },
  {
    id: '3',
    subjectName: 'English Literature',
    subjectCode: 'ENG',
    subjectLevel: 'O_LEVEL',
    subjectType: 'OPTIONAL',
    description: 'English literature and language',
    credits: 2,
    status: 'INACTIVE',
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2023-03-15T00:00:00Z',
    tenant: { name: 'Default School' },
    createdByUser: { firstName: 'Sarah', lastName: 'Johnson', email: 'teacher3@schoolsystem.com' },
    teacherSubjects: []
  },
  {
    id: '4',
    subjectName: 'Chemistry',
    subjectCode: 'CHEM',
    subjectLevel: 'A_LEVEL',
    subjectType: 'COMBINATION',
    description: 'Advanced chemistry for A-Level students',
    credits: 3,
    status: 'ACTIVE',
    createdAt: '2023-04-01T00:00:00Z',
    updatedAt: '2023-04-15T00:00:00Z',
    tenant: { name: 'Default School' },
    createdByUser: { firstName: 'Michael', lastName: 'Brown', email: 'teacher2@schoolsystem.com' },
    teacherSubjects: [
      { teacher: { firstName: 'Michael', lastName: 'Brown', email: 'teacher2@schoolsystem.com' } }
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

const getLevelColor = (level: string) => {
  switch (level) {
    case 'PRIMARY':
      return 'bg-green-100 text-green-800';
    case 'O_LEVEL':
      return 'bg-blue-100 text-blue-800';
    case 'A_LEVEL':
      return 'bg-purple-100 text-purple-800';
    case 'UNIVERSITY':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'CORE':
      return 'bg-red-100 text-red-800';
    case 'OPTIONAL':
      return 'bg-yellow-100 text-yellow-800';
    case 'COMBINATION':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function SubjectsPage() {
  const { user } = useAuth();
  
  // Check if user has permission to manage subjects
  const canManageSubjects = user?.roles?.some(role => 
    ['Super Admin', 'Tenant Admin'].includes(role.name)
  ) || false;
  
  const canViewSubjects = user?.roles?.some(role => 
    ['Super Admin', 'Tenant Admin', 'Teacher', 'Student'].includes(role.name)
  ) || false;
  const [subjects, setSubjects] = useState(sampleSubjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Filter subjects based on search and filters
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = 
      subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subject.status === statusFilter;
    const matchesLevel = levelFilter === 'all' || subject.subjectLevel === levelFilter;
    const matchesType = typeFilter === 'all' || subject.subjectType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesLevel && matchesType;
  });

  const handleCreateSubject = () => {
    // Navigate to create subject page
    console.log('Navigate to create subject');
  };

  const handleEditSubject = (subjectId: string) => {
    // Navigate to edit subject page
    console.log('Edit subject:', subjectId);
  };

  const handleDeleteSubject = (subjectId: string) => {
    // Show confirmation and delete subject
    console.log('Delete subject:', subjectId);
  };

  const handleViewSubject = (subjectId: string) => {
    // Navigate to subject details page
    console.log('View subject:', subjectId);
  };

  const columns = [
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
      render: (value: any, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-green-light rounded-full flex items-center justify-center text-white font-semibold">
            <FaBookOpen className="text-sm" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">{row.subjectName}</p>
            <p className="text-sm text-text-secondary">{row.subjectCode}</p>
          </div>
        </div>
      )
    },
    {
      key: 'level',
      label: 'Level',
      sortable: true,
      render: (value: string) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getLevelColor(value)}`}>
          {value.replace('_', '-')}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value: string) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(value)}`}>
          {value}
        </span>
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
      key: 'teachers',
      label: 'Teachers',
      sortable: false,
      render: (value: any, row: any) => (
        <div className="flex flex-wrap gap-1">
          {row.teacherSubjects.slice(0, 2).map((ts: any, index: number) => (
            <span
              key={index}
              className="text-xs bg-accent-blue/10 text-accent-blue px-2 py-1 rounded-full"
            >
              {ts.teacher.firstName} {ts.teacher.lastName}
            </span>
          ))}
          {row.teacherSubjects.length > 2 && (
            <span className="text-xs text-text-muted">
              +{row.teacherSubjects.length - 2} more
            </span>
          )}
          {row.teacherSubjects.length === 0 && (
            <span className="text-xs text-text-muted">No teachers assigned</span>
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
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value: any, row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewSubject(row.id)}
            className="glass-button p-2 hover:bg-accent-blue/10 hover:text-accent-blue transition-colors"
            title="View Subject"
          >
            <FaEye className="text-sm" />
          </button>
          <button
            onClick={() => handleEditSubject(row.id)}
            className="glass-button p-2 hover:bg-accent-green/10 hover:text-accent-green transition-colors"
            title="Edit Subject"
          >
            <FaEdit className="text-sm" />
          </button>
          <button
            onClick={() => handleDeleteSubject(row.id)}
            className="glass-button p-2 hover:bg-red-500/10 hover:text-red-500 transition-colors"
            title="Delete Subject"
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
            <h1 className="text-3xl font-bold text-text-primary mb-2">Subject Management</h1>
            <p className="text-text-secondary">Manage subjects with NECTA compliance and academic levels</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status="success" size="lg">
              {subjects.filter(s => s.status === 'ACTIVE').length} Active Subjects
            </StatusBadge>
            <Button variant="primary" size="md" onClick={handleCreateSubject}>
              <FaPlus className="mr-2" />
              Add Subject
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
              <p className="text-sm text-text-secondary">Total Subjects</p>
              <p className="text-2xl font-bold text-text-primary">{subjects.length}</p>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-xl">
              <FaGraduationCap className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Core Subjects</p>
              <p className="text-2xl font-bold text-text-primary">
                {subjects.filter(s => s.subjectType === 'CORE').length}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-accent-purple to-accent-purple-light rounded-xl">
              <FaChalkboardTeacher className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Combination Subjects</p>
              <p className="text-2xl font-bold text-text-primary">
                {subjects.filter(s => s.subjectType === 'COMBINATION').length}
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
              <p className="text-sm text-text-secondary">Optional Subjects</p>
              <p className="text-2xl font-bold text-text-primary">
                {subjects.filter(s => s.subjectType === 'OPTIONAL').length}
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
                placeholder="Search subjects..."
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

            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="glass-input px-4 py-2"
            >
              <option value="all">All Levels</option>
              <option value="PRIMARY">Primary</option>
              <option value="O_LEVEL">O-Level</option>
              <option value="A_LEVEL">A-Level</option>
              <option value="UNIVERSITY">University</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="glass-input px-4 py-2"
            >
              <option value="all">All Types</option>
              <option value="CORE">Core</option>
              <option value="OPTIONAL">Optional</option>
              <option value="COMBINATION">Combination</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <FaFilter className="text-text-muted" />
            <span className="text-sm text-text-secondary">
              {filteredSubjects.length} of {subjects.length} subjects
            </span>
          </div>
        </div>
      </Card>

      {/* Subjects Table */}
      <Card variant="strong" glow="green">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Subjects List</h2>
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
          data={filteredSubjects}
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
