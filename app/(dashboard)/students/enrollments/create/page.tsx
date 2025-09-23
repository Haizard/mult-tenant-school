'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaArrowLeft, FaSave, FaUserGraduate, FaCalendarAlt, FaBook, FaUsers } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { notificationService } from '@/lib/notifications';
import { academicService } from '@/lib/academicService';
import { studentService } from '@/lib/studentService';
import { authService } from '@/lib/auth';

interface FormData {
  studentId: string;
  enrollmentType: 'COURSE' | 'SUBJECT' | 'CLASS';
  academicYearId: string;
  courseId: string;
  subjectId: string;
  classId: string;
  notes: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
}

interface Course {
  id: string;
  courseName: string;
  courseCode: string;
  academicLevel: string;
  credits: number;
}

interface Subject {
  id: string;
  subjectName: string;
  subjectCode: string;
  subjectLevel: string;
  subjectType: string;
}

interface Class {
  id: string;
  className: string;
  classCode: string;
  academicLevel: string;
  capacity: number;
  teacher: {
    firstName: string;
    lastName: string;
  };
}

interface AcademicYear {
  id: string;
  yearName: string;
  isCurrent: boolean;
  status: string;
}

export default function CreateEnrollmentPage() {
  const searchParams = useSearchParams();
  const preSelectedStudentId = searchParams.get('studentId');
  
  const [formData, setFormData] = useState<FormData>({
    studentId: preSelectedStudentId || '',
    enrollmentType: 'CLASS',
    academicYearId: '',
    courseId: '',
    subjectId: '',
    classId: '',
    notes: ''
  });
  
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      
      // Check if user is authenticated
      const currentUser = authService.getCurrentUserSync();
      if (!currentUser) {
        notificationService.error('Please log in to access this page');
        window.location.href = '/login';
        return;
      }
      
      console.log('Loading enrollment form data...');
      
      // Load all required data in parallel
      const [
        studentsResponse,
        coursesResponse,
        subjectsResponse,
        classesResponse,
        academicYearsResponse
      ] = await Promise.all([
        studentService.getStudents(),
        academicService.getCourses(),
        academicService.getSubjects(),
        academicService.getClasses(),
        academicService.getAcademicYears()
      ]);
      
      // Process students
      if (studentsResponse && studentsResponse.data) {
        const studentList = studentsResponse.data.map((student: any) => ({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          studentId: student.studentId
        }));
        setStudents(studentList);
      }
      
      // Process courses
      if (coursesResponse && coursesResponse.success && coursesResponse.data) {
        const courseList = coursesResponse.data.map((course: any) => ({
          id: course.id,
          courseName: course.courseName,
          courseCode: course.courseCode,
          academicLevel: course.academicLevel || 'O_LEVEL',
          credits: course.credits
        }));
        setCourses(courseList);
      }
      
      // Process subjects
      if (subjectsResponse && subjectsResponse.success && subjectsResponse.data) {
        const subjectList = subjectsResponse.data.map((subject: any) => ({
          id: subject.id,
          subjectName: subject.subjectName,
          subjectCode: subject.subjectCode || '',
          subjectLevel: subject.subjectLevel?.replace('_', '-') || 'O-Level',
          subjectType: subject.subjectType || 'CORE'
        }));
        setSubjects(subjectList);
      }
      
      // Process classes
      if (classesResponse && classesResponse.success && classesResponse.data) {
        const classList = classesResponse.data.map((classItem: any) => ({
          id: classItem.id,
          className: classItem.className,
          classCode: classItem.classCode,
          academicLevel: classItem.academicLevel?.replace('_', '-') || 'O-Level',
          capacity: classItem.capacity,
          teacher: {
            firstName: classItem.teacher?.firstName || '',
            lastName: classItem.teacher?.lastName || ''
          }
        }));
        setClasses(classList);
      }
      
      // Process academic years
      if (academicYearsResponse && Array.isArray(academicYearsResponse)) {
        setAcademicYears(academicYearsResponse);
        
        // Set current academic year as default
        const currentYear = academicYearsResponse.find((year: any) => year.isCurrent);
        if (currentYear) {
          setFormData(prev => ({ ...prev, academicYearId: currentYear.id }));
        }
      } else if (academicYearsResponse && (academicYearsResponse as any).data) {
        setAcademicYears((academicYearsResponse as any).data);
        
        // Set current academic year as default
        const currentYear = (academicYearsResponse as any).data.find((year: any) => year.isCurrent);
        if (currentYear) {
          setFormData(prev => ({ ...prev, academicYearId: currentYear.id }));
        }
      }
      
      console.log('Form data loaded successfully');
      
    } catch (error) {
      console.error('Error loading form data:', error);
      notificationService.error(`Failed to load form data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Client-side validation
      if (!formData.studentId) {
        notificationService.error('Please select a student');
        return;
      }
      
      if (!formData.academicYearId) {
        notificationService.error('Please select an academic year');
        return;
      }
      
      if (!formData.enrollmentType) {
        notificationService.error('Please select enrollment type');
        return;
      }
      
      // Validate based on enrollment type
      if (formData.enrollmentType === 'COURSE' && !formData.courseId) {
        notificationService.error('Please select a course for course enrollment');
        return;
      }
      
      if (formData.enrollmentType === 'SUBJECT' && !formData.subjectId) {
        notificationService.error('Please select a subject for subject enrollment');
        return;
      }
      
      if (formData.enrollmentType === 'CLASS' && !formData.classId) {
        notificationService.error('Please select a class for class enrollment');
        return;
      }

      // Additional validation checks
      if (formData.enrollmentType === 'CLASS' && formData.classId) {
        try {
          const capacityCheck = await academicService.validateClassCapacity(formData.classId);
          if (!capacityCheck.isValid) {
            notificationService.error(`Class is at full capacity (${capacityCheck.currentEnrollment}/${capacityCheck.capacity}). No available spots.`);
            return;
          }
          
          if (capacityCheck.availableSpots <= 5) {
            const proceed = confirm(`Warning: Only ${capacityCheck.availableSpots} spots remaining in this class. Do you want to proceed?`);
            if (!proceed) return;
          }
        } catch (error) {
          console.warn('Could not validate class capacity:', error);
        }
      }
      
      if (formData.enrollmentType === 'COURSE' && formData.courseId) {
        try {
          const enrollmentCheck = await academicService.validateCourseEnrollment(formData.studentId, formData.courseId);
          if (!enrollmentCheck.isValid) {
            notificationService.error(enrollmentCheck.reason || 'Course enrollment validation failed');
            return;
          }
        } catch (error) {
          console.warn('Could not validate course enrollment:', error);
        }
      }

      notificationService.info('Creating enrollment...');
      
      // Prepare enrollment data
      const enrollmentData = {
        academicYearId: formData.academicYearId,
        enrollmentType: formData.enrollmentType,
        notes: formData.notes,
        ...(formData.enrollmentType === 'COURSE' && { courseId: formData.courseId }),
        ...(formData.enrollmentType === 'SUBJECT' && { subjectId: formData.subjectId }),
        ...(formData.enrollmentType === 'CLASS' && { classId: formData.classId })
      };
      
      console.log('Creating enrollment with data:', enrollmentData);
      
      // API call to create enrollment
      await studentService.createEnrollment(formData.studentId, enrollmentData);
      
      notificationService.success('Student enrolled successfully!');
      window.location.href = '/students/enrollments';
      
    } catch (err) {
      console.error('Error creating enrollment:', err);
      notificationService.error(err instanceof Error ? err.message : 'Failed to create enrollment');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/students/enrollments';
  };

  // Filter options based on enrollment type
  const getFilteredOptions = () => {
    switch (formData.enrollmentType) {
      case 'COURSE':
        return courses;
      case 'SUBJECT':
        return subjects;
      case 'CLASS':
        return classes;
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleBack}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <FaArrowLeft />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Create Student Enrollment</h1>
              <p className="text-text-secondary">Enroll student in courses, subjects, or classes</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaUserGraduate className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Student Information</h2>
                  <p className="text-text-secondary">Select student and academic year</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Student *
                  </label>
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    disabled={loadingData}
                  >
                    <option value="">Select student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} ({student.studentId})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Academic Year *
                  </label>
                  <select
                    name="academicYearId"
                    value={formData.academicYearId}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    disabled={loadingData}
                  >
                    <option value="">Select academic year</option>
                    {academicYears.map(year => (
                      <option key={year.id} value={year.id}>
                        {year.yearName} {year.isCurrent ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Enrollment Type */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaBook className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Enrollment Details</h2>
                  <p className="text-text-secondary">Choose enrollment type and target</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Enrollment Type *
                </label>
                <select
                  name="enrollmentType"
                  value={formData.enrollmentType}
                  onChange={handleInputChange}
                  required
                  className="glass-input w-full"
                >
                  <option value="CLASS">Class Enrollment</option>
                  <option value="COURSE">Course Enrollment</option>
                  <option value="SUBJECT">Subject Enrollment</option>
                </select>
              </div>

              {/* Dynamic Selection Based on Type */}
              {formData.enrollmentType === 'COURSE' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Course *
                  </label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    disabled={loadingData}
                  >
                    <option value="">Select course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.courseName} ({course.courseCode}) - {course.academicLevel}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.enrollmentType === 'SUBJECT' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Subject *
                  </label>
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    disabled={loadingData}
                  >
                    <option value="">Select subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.subjectName} ({subject.subjectCode}) - {subject.subjectLevel}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.enrollmentType === 'CLASS' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Class *
                  </label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    disabled={loadingData}
                  >
                    <option value="">Select class</option>
                    {classes.map(classItem => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.className} ({classItem.classCode}) - {classItem.academicLevel} 
                        - Teacher: {classItem.teacher.firstName} {classItem.teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="glass-input w-full"
                  placeholder="Optional enrollment notes or special requirements"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleBack}
                variant="secondary"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || loadingData}
                className="flex items-center space-x-2"
              >
                <FaSave />
                <span>{loading ? 'Enrolling...' : 'Create Enrollment'}</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}