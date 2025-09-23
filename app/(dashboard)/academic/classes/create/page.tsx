"use client";

import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaSave,
  FaUsers,
  FaCalendarAlt,
  FaBook,
} from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { notificationService } from "@/lib/notifications";
import { academicService } from "@/lib/academicService";
import { teacherService } from "@/lib/teacherService";
import { authService } from "@/lib/auth";

interface FormData {
  className: string;
  classCode: string;
  academicLevel: "Primary" | "O-Level" | "A-Level" | "University";
  academicYear: string;
  capacity: number;
  teacherId: string;
  subjectIds: string[];
  description: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  level: string;
  type: string;
}

interface AcademicYear {
  id: string;
  yearName: string;
  isCurrent: boolean;
}

export default function CreateClassPage() {
  const [formData, setFormData] = useState<FormData>({
    className: "",
    classCode: "",
    academicLevel: "O-Level",
    academicYear: "",
    capacity: 40,
    teacherId: "",
    subjectIds: [],
    description: "",
  });

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
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
        notificationService.error("Please log in to access this page");
        window.location.href = "/login";
        return;
      }

      console.log("Loading form data from API...");

      // Load real data from APIs
      let teachers: Teacher[] = [];
      let subjects: Subject[] = [];
      let academicYears: AcademicYear[] = [];

      try {
        // Use existing services to get teachers, subjects, and academic years
        const [teachersResponse, subjectsResponse, academicYearsResponse] =
          await Promise.all([
            teacherService.getTeachers(),
            academicService.getSubjects(),
            academicService.getAcademicYears(),
          ]);

        // Process teachers
        if (teachersResponse && Array.isArray(teachersResponse)) {
          teachers = teachersResponse.map((teacher: any) => ({
            id: teacher.id,
            firstName: teacher.user?.firstName || teacher.firstName,
            lastName: teacher.user?.lastName || teacher.lastName,
            email: teacher.user?.email || teacher.email,
          }));
        } else if (teachersResponse && (teachersResponse as any).data) {
          teachers = (teachersResponse as any).data.map((teacher: any) => ({
            id: teacher.id,
            firstName: teacher.user?.firstName || teacher.firstName,
            lastName: teacher.user?.lastName || teacher.lastName,
            email: teacher.user?.email || teacher.email,
          }));
        }

        // Process subjects
        if (
          subjectsResponse &&
          subjectsResponse.success &&
          subjectsResponse.data
        ) {
          subjects = subjectsResponse.data.map((subject: any) => ({
            id: subject.id,
            name: subject.subjectName,
            code: subject.subjectCode || "",
            level: subject.subjectLevel?.replace("_", "-") || "O-Level",
            type: subject.subjectType || "CORE",
          }));
        }

        // Process academic years
        if (academicYearsResponse && Array.isArray(academicYearsResponse)) {
          academicYears = academicYearsResponse;
        } else if (
          academicYearsResponse &&
          (academicYearsResponse as any).data
        ) {
          academicYears = (academicYearsResponse as any).data;
        }

        console.log("Loaded real data:", {
          teachers: teachers.length,
          subjects: subjects.length,
          academicYears: academicYears.length,
        });
      } catch (error) {
        console.error("Failed to load real data:", error);
        // Fallback to empty arrays
        teachers = [];
        subjects = [];
        academicYears = [];
      }

      // Mock academic years if none loaded
      if (academicYears.length === 0) {
        academicYears = [
          { id: "1", yearName: "2024/2025", isCurrent: true },
          { id: "2", yearName: "2023/2024", isCurrent: false },
          { id: "3", yearName: "2025/2026", isCurrent: false },
        ];
      }

      setTeachers(teachers);
      setSubjects(subjects);
      setAcademicYears(academicYears);

      // Set default academic year to current
      const currentYear = academicYears.find((year) => year.isCurrent);
      if (currentYear) {
        setFormData((prev) => ({ ...prev, academicYear: currentYear.id }));
      }
    } catch (error) {
      console.error("Error loading form data:", error);
      notificationService.error(
        `Failed to load form data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setFormData((prev) => ({
      ...prev,
      subjectIds: selectedOptions,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Check if user is authenticated
      const currentUser = authService.getCurrentUserSync();
      if (!currentUser) {
        notificationService.error("Please log in to access this page");
        window.location.href = "/login";
        return;
      }

      // Client-side validation
      if (!formData.className.trim()) {
        notificationService.error("Class name is required");
        return;
      }

      if (!formData.classCode.trim()) {
        notificationService.error("Class code is required");
        return;
      }

      if (!formData.academicYear) {
        notificationService.error("Please select an academic year");
        return;
      }

      if (!formData.teacherId) {
        notificationService.error("Please select a class teacher");
        return;
      }

      if (formData.subjectIds.length === 0) {
        notificationService.error("Please select at least one subject");
        return;
      }

      if (formData.capacity < 1 || formData.capacity > 100) {
        notificationService.error("Capacity must be between 1 and 100");
        return;
      }

      notificationService.info("Creating class...");

      // Transform data for API
      const academicLevelMap: Record<string, string> = {
        Primary: "PRIMARY",
        "O-Level": "O_LEVEL",
        "A-Level": "A_LEVEL",
        University: "UNIVERSITY",
      };

      const classData = {
        className: formData.className,
        classCode: formData.classCode,
        academicLevel: academicLevelMap[formData.academicLevel] as
          | "PRIMARY"
          | "O_LEVEL"
          | "A_LEVEL"
          | "UNIVERSITY",
        academicYearId: formData.academicYear,
        teacherId: formData.teacherId,
        capacity: formData.capacity,
        subjectIds: formData.subjectIds,
        description: formData.description,
      };

      console.log("Creating class with data:", classData);

      // API call to create class
      await academicService.createClass(classData);

      notificationService.success("Class created successfully!");
      window.location.href = "/academic/classes";
    } catch (err) {
      console.error("Error creating class:", err);
      notificationService.error(
        err instanceof Error ? err.message : "Failed to create class",
      );

      // Redirect to login if authentication failed
      if (err instanceof Error && err.message.includes("authentication")) {
        window.location.href = "/login";
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = "/academic/classes";
  };

  const filteredSubjects = subjects.filter(
    (subject) => subject.level === formData.academicLevel,
  );

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading form data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-text-primary">
                Create New Class
              </h1>
              <p className="text-text-secondary">
                Set up a new class with teacher and subject assignments
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaUsers className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">
                    Basic Information
                  </h2>
                  <p className="text-text-secondary">
                    Class name, code, and academic level
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    name="className"
                    value={formData.className}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    placeholder="e.g., Form 1A, Grade 5B"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Class Code *
                  </label>
                  <input
                    type="text"
                    name="classCode"
                    value={formData.classCode}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    placeholder="e.g., F1A, G5B"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Academic Level *
                  </label>
                  <select
                    name="academicLevel"
                    value={formData.academicLevel}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                  >
                    <option value="">Select academic level</option>
                    <option value="Primary">Primary</option>
                    <option value="O-Level">O-Level</option>
                    <option value="A-Level">A-Level</option>
                    <option value="University">University</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Academic Year *
                  </label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    disabled={loadingData}
                  >
                    <option value="">Select academic year</option>
                    {academicYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.yearName} {year.isCurrent ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="100"
                    className="glass-input w-full"
                    placeholder="Maximum number of students"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Class Teacher *
                  </label>
                  <select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                    disabled={loadingData}
                  >
                    <option value="">Select class teacher</option>
                    {teachers.length === 0 && !loadingData && (
                      <option value="" disabled>
                        No teachers available - Please add teachers first
                      </option>
                    )}
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName} ({teacher.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="glass-input w-full"
                  rows={3}
                  placeholder="Optional class description"
                />
              </div>
            </div>

            {/* Subject Assignment */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaBook className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">
                    Subject Assignment
                  </h2>
                  <p className="text-text-secondary">
                    Assign subjects for this class level
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Subjects *{" "}
                  <span className="text-text-muted">
                    (Hold Ctrl to select multiple)
                  </span>
                </label>
                <select
                  name="subjectIds"
                  value={formData.subjectIds}
                  onChange={handleSubjectChange}
                  required
                  multiple
                  className="glass-input w-full h-32"
                  disabled={loadingData}
                >
                  {subjects.length === 0 && !loadingData && (
                    <option value="" disabled>
                      No subjects available - Please add subjects first
                    </option>
                  )}
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code}) - {subject.type}
                    </option>
                  ))}
                </select>
                {formData.subjectIds.length > 0 && (
                  <p className="text-sm text-text-secondary mt-1">
                    Selected: {formData.subjectIds.length} subject(s)
                  </p>
                )}
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
                <span>{loading ? "Creating..." : "Create Class"}</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
