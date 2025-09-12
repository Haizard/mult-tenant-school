'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaUsers, FaCalendarAlt, FaEdit, FaTrash, FaEye, FaSearch, FaFilter } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { notificationService } from '@/lib/notifications';
import { academicService } from '@/lib/academicService';

interface Class {
  id: string;
  className: string;
  classCode: string;
  academicLevel: 'Primary' | 'O-Level' | 'A-Level' | 'University';
  academicYear: string;
  capacity: number;
  currentEnrollment: number;
  status: 'ACTIVE' | 'INACTIVE' | 'FULL';
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  subjects: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  createdAt: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      
      // Note: Classes API endpoint doesn't exist yet in backend
      // For now, we'll use mock data until the backend is updated
      const mockClasses: Class[] = [
        {
          id: '1',
          className: 'Form 1A',
          classCode: 'F1A',
          academicLevel: 'O-Level',
          academicYear: '2024/2025',
          capacity: 40,
          currentEnrollment: 35,
          status: 'ACTIVE',
          teacher: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe'
          },
          subjects: [
            { id: '1', name: 'Mathematics', code: 'MATH' },
            { id: '2', name: 'English', code: 'ENG' },
            { id: '3', name: 'Physics', code: 'PHY' }
          ],
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          className: 'Form 2B',
          classCode: 'F2B',
          academicLevel: 'O-Level',
          academicYear: '2024/2025',
          capacity: 40,
          currentEnrollment: 40,
          status: 'FULL',
          teacher: {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith'
          },
          subjects: [
            { id: '4', name: 'Chemistry', code: 'CHEM' },
            { id: '5', name: 'Biology', code: 'BIO' },
            { id: '6', name: 'History', code: 'HIST' }
          ],
          createdAt: '2024-01-20T10:00:00Z'
        },
        {
          id: '3',
          className: 'Form 5A',
          classCode: 'F5A',
          academicLevel: 'A-Level',
          academicYear: '2024/2025',
          capacity: 30,
          currentEnrollment: 25,
          status: 'ACTIVE',
          teacher: {
            id: '3',
            firstName: 'Michael',
            lastName: 'Johnson'
          },
          subjects: [
            { id: '7', name: 'Advanced Mathematics', code: 'AMATH' },
            { id: '8', name: 'Physics', code: 'PHY' },
            { id: '9', name: 'Chemistry', code: 'CHEM' }
          ],
          createdAt: '2024-01-25T10:00:00Z'
        }
      ];
      
      setClasses(mockClasses);
      
      // TODO: Replace with real API call when backend classes endpoint is ready
      // const response = await academicService.getClasses();
      // setClasses(response.data);
      
    } catch (error) {
      console.error('Error loading classes:', error);
      notificationService.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = () => {
    window.location.href = '/academic/classes/create';
  };

  const handleViewClass = (classId: string) => {
    window.location.href = `/academic/classes/${classId}`;
  };

  const handleEditClass = (classId: string) => {
    window.location.href = `/academic/classes/${classId}/edit`;
  };

  const handleDeleteClass = async (classId: string) => {
    if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      try {
        // API call to delete class
        notificationService.success('Class deleted successfully');
        loadClasses(); // Reload classes
      } catch (error) {
        notificationService.error('Failed to delete class');
      }
    }
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = 
      cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.classCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.teacher?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.teacher?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || cls.academicLevel === levelFilter;
    const matchesStatus = statusFilter === 'all' || cls.status === statusFilter;
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const getEnrollmentPercentage = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100);
  };

  const getEnrollmentColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading classes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Class Management</h1>
              <p className="text-text-secondary">Manage classes, sections, and student enrollment</p>
            </div>
            <Button
              onClick={handleCreateClass}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <FaPlus />
              <span>Create Class</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input w-full pl-10"
                />
              </div>
              <div>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="glass-input w-full"
                >
                  <option value="all">All Levels</option>
                  <option value="Primary">Primary</option>
                  <option value="O-Level">O-Level</option>
                  <option value="A-Level">A-Level</option>
                  <option value="University">University</option>
                </select>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="glass-input w-full"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="FULL">Full</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <FaFilter className="text-text-secondary" />
                <span className="text-sm text-text-secondary">
                  {filteredClasses.length} of {classes.length} classes
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <Card key={cls.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary">{cls.className}</h3>
                    <p className="text-text-secondary">{cls.classCode} • {cls.academicLevel}</p>
                  </div>
                  <StatusBadge status={cls.status} />
                </div>

                {/* Teacher */}
                {cls.teacher && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2">
                      <FaUsers className="text-text-secondary" />
                      <span className="text-sm text-text-secondary">Class Teacher:</span>
                    </div>
                    <p className="text-text-primary font-medium ml-6">
                      {cls.teacher.firstName} {cls.teacher.lastName}
                    </p>
                  </div>
                )}

                {/* Enrollment */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">Enrollment</span>
                    <span className={`text-sm font-medium ${getEnrollmentColor(getEnrollmentPercentage(cls.currentEnrollment, cls.capacity))}`}>
                      {cls.currentEnrollment}/{cls.capacity} ({getEnrollmentPercentage(cls.currentEnrollment, cls.capacity)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        getEnrollmentPercentage(cls.currentEnrollment, cls.capacity) >= 90
                          ? 'bg-red-500'
                          : getEnrollmentPercentage(cls.currentEnrollment, cls.capacity) >= 75
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${getEnrollmentPercentage(cls.currentEnrollment, cls.capacity)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Subjects */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaCalendarAlt className="text-text-secondary" />
                    <span className="text-sm text-text-secondary">Subjects ({cls.subjects.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cls.subjects.slice(0, 3).map((subject) => (
                      <span
                        key={subject.id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {subject.code}
                      </span>
                    ))}
                    {cls.subjects.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{cls.subjects.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewClass(cls.id)}
                      className="glass-button p-2 hover:bg-accent-blue/10 hover:text-accent-blue transition-colors"
                      title="View Class"
                    >
                      <FaEye className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleEditClass(cls.id)}
                      className="glass-button p-2 hover:bg-accent-green/10 hover:text-accent-green transition-colors"
                      title="Edit Class"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="glass-button p-2 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      title="Delete Class"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                  <span className="text-xs text-text-secondary">
                    {new Date(cls.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredClasses.length === 0 && (
          <Card>
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">🏫</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">No Classes Found</h3>
              <p className="text-text-secondary mb-6">
                {searchTerm || levelFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first class.'}
              </p>
              {(!searchTerm && levelFilter === 'all' && statusFilter === 'all') && (
                <Button onClick={handleCreateClass} variant="primary">
                  Create First Class
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
