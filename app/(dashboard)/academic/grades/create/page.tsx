'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useAcademicFilters } from '@/hooks/useAcademicFilters';
import { useAuditLog } from '@/hooks/useAuditLog';
import { examinationService } from '@/lib/services/examinationService';
import { academicService } from '@/lib/services/academicService';

interface GradeEntry {
  studentId: string;
  studentName: string;
  rawMarks: number;
  comments?: string;
}

export default function CreateGradePage() {
  const router = useRouter();
  const { user } = useAuth();
  const auditLog = useAuditLog();
  const academicFilters = useAcademicFilters();
  
  // Check if user has permission to create grades
  const canCreateGrades = academicFilters.canManage('grades');
  
  const [examinationId, setExaminationId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [examinations, setExaminations] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [gradeEntries, setGradeEntries] = useState<GradeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load examinations and subjects
  useEffect(() => {
    loadExaminations();
    loadSubjects();
  }, []);

  // Load students when examination and subject are selected
  useEffect(() => {
    if (examinationId && subjectId) {
      loadStudents();
    }
  }, [examinationId, subjectId]);

  const loadExaminations = async () => {
    try {
      const response = await examinationService.getExaminations({ status: 'COMPLETED' });
      if (response.success && response.data) {
        setExaminations(response.data);
      }
    } catch (error) {
      console.error('Error loading examinations:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await academicService.getSubjects();
      if (response.success && response.data) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API to get students enrolled in specific subject
      // For now, using sample data
      const sampleStudents = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@school.com' },
        { id: '2', firstName: 'Bob', lastName: 'Wilson', email: 'bob.wilson@school.com' },
        { id: '3', firstName: 'Charlie', lastName: 'Brown', email: 'charlie.brown@school.com' },
        { id: '4', firstName: 'Diana', lastName: 'Davis', email: 'diana.davis@school.com' },
        { id: '5', firstName: 'Eve', lastName: 'Miller', email: 'eve.miller@school.com' },
      ];
      setStudents(sampleStudents);
      
      // Initialize grade entries
      const initialEntries: GradeEntry[] = sampleStudents.map(student => ({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        rawMarks: 0,
        comments: ''
      }));
      setGradeEntries(initialEntries);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExaminationChange = (value: string) => {
    setExaminationId(value);
    setGradeEntries([]);
  };

  const handleSubjectChange = (value: string) => {
    setSubjectId(value);
    setGradeEntries([]);
  };

  const handleGradeChange = (studentId: string, field: 'rawMarks' | 'comments', value: string | number) => {
    setGradeEntries(prev => 
      prev.map(entry => 
        entry.studentId === studentId 
          ? { ...entry, [field]: value }
          : entry
      )
    );
  };

  const handleAddStudent = () => {
    const newStudent = {
      id: `new-${Date.now()}`,
      firstName: 'New',
      lastName: 'Student',
      email: 'new.student@school.com'
    };
    
    setStudents(prev => [...prev, newStudent]);
    setGradeEntries(prev => [...prev, {
      studentId: newStudent.id,
      studentName: `${newStudent.firstName} ${newStudent.lastName}`,
      rawMarks: 0,
      comments: ''
    }]);
  };

  const handleRemoveStudent = (studentId: string) => {
    setStudents(prev => prev.filter(student => student.id !== studentId));
    setGradeEntries(prev => prev.filter(entry => entry.studentId !== studentId));
  };

  const handleSubmit = async () => {
    if (!examinationId || !subjectId) {
      alert('Please select an examination and subject');
      return;
    }

    const validEntries = gradeEntries.filter(entry => entry.rawMarks > 0);
    if (validEntries.length === 0) {
      alert('Please enter grades for at least one student');
      return;
    }

    setIsSubmitting(true);
    try {
      const promises = validEntries.map(entry =>
        examinationService.createGrade({
          examinationId,
          studentId: entry.studentId,
          subjectId,
          rawMarks: entry.rawMarks,
          comments: entry.comments
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(result => result.success).length;
      
      if (successCount > 0) {
        await auditLog.logAction('grade', 'create', examinationId, `Created ${successCount} grades`);
        alert(`Successfully created ${successCount} grades`);
        router.push('/academic/grades');
      } else {
        alert('Failed to create grades');
      }
    } catch (error) {
      console.error('Error creating grades:', error);
      alert('Error creating grades');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/academic/grades');
  };

  const selectedExamination = examinations.find(exam => exam.id === examinationId);
  const selectedSubject = subjects.find(subject => subject.id === subjectId);

  return (
    <RoleGuard permissions={['grades:create']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enter Grades</h1>
            <p className="text-gray-600">Enter student grades for examinations</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleCancel}
              icon={FaTimes}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              icon={FaSave}
              disabled={isSubmitting || !examinationId || !subjectId}
            >
              {isSubmitting ? 'Saving...' : 'Save Grades'}
            </Button>
          </div>
        </div>

        {/* Selection Form */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Examination & Subject Selection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Examination *
                </label>
                <select
                  value={examinationId}
                  onChange={(e) => handleExaminationChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Examination</option>
                  {examinations.map(exam => (
                    <option key={exam.id} value={exam.id}>
                      {exam.examName} - {exam.examType.replace('_', ' ')} ({exam.examLevel})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.subjectName} ({subject.subjectLevel})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {selectedExamination && selectedSubject && (
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-900">Selected:</h4>
                <p className="text-blue-800">
                  <strong>Examination:</strong> {selectedExamination.examName} 
                  ({selectedExamination.examType.replace('_', ' ')}) - Max Marks: {selectedExamination.maxMarks}
                </p>
                <p className="text-blue-800">
                  <strong>Subject:</strong> {selectedSubject.subjectName} ({selectedSubject.subjectLevel})
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Grade Entry Form */}
        {examinationId && subjectId && (
          <Card>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Grade Entry</h3>
                <Button
                  onClick={handleAddStudent}
                  icon={FaPlus}
                  variant="outline"
                  size="sm"
                >
                  Add Student
                </Button>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading students...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Raw Marks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comments
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {gradeEntries.map((entry) => (
                        <tr key={entry.studentId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {entry.studentName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              max={selectedExamination?.maxMarks || 100}
                              value={entry.rawMarks}
                              onChange={(e) => handleGradeChange(entry.studentId, 'rawMarks', parseFloat(e.target.value) || 0)}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-500">
                              / {selectedExamination?.maxMarks || 100}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={entry.comments}
                              onChange={(e) => handleGradeChange(entry.studentId, 'comments', e.target.value)}
                              placeholder="Optional comments..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              onClick={() => handleRemoveStudent(entry.studentId)}
                              icon={FaTrash}
                              variant="outline"
                              size="sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Summary */}
        {gradeEntries.length > 0 && (
          <Card>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Students:</span>
                  <span className="ml-2 font-medium">{gradeEntries.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">With Grades:</span>
                  <span className="ml-2 font-medium">
                    {gradeEntries.filter(entry => entry.rawMarks > 0).length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Average:</span>
                  <span className="ml-2 font-medium">
                    {gradeEntries.filter(entry => entry.rawMarks > 0).length > 0
                      ? (gradeEntries.reduce((sum, entry) => sum + entry.rawMarks, 0) / 
                         gradeEntries.filter(entry => entry.rawMarks > 0).length).toFixed(1)
                      : '0'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Max Marks:</span>
                  <span className="ml-2 font-medium">{selectedExamination?.maxMarks || 100}</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}
