"use client";

import { useState, useEffect } from "react";
import {
  FaPlus,
  FaUsers,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { notificationService } from "@/lib/notifications";
import { academicService } from "@/lib/academicService";
import { authService } from "@/lib/auth";

interface Class {
  id: string;
  className: string;
  classCode: string;
  academicLevel: "Primary" | "O-Level" | "A-Level" | "University";
  academicYear: string;
  capacity: number;
  currentEnrollment: number;
  status: "ACTIVE" | "INACTIVE" | "FULL";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      const currentUser = authService.getCurrentUserSync();
      if (!currentUser) {
        notificationService.error("Please log in to access this page");
        window.location.href = "/login";
        return;
      }

      console.log("Loading classes from API...");
      const response = await academicService.getClasses();

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to load classes");
      }

      // Transform API data to match our interface with real-time enrollment
      const transformedClasses: Class[] = response.data.map((cls: any) => ({
        id: cls.id,
        className: cls.className,
        classCode: cls.classCode,
        academicLevel: (cls.academicLevel?.replace("_", "-") || "O-Level") as
          | "Primary"
          | "O-Level"
          | "A-Level"
          | "University",
        academicYear: cls.academicYear?.yearName || "Unknown",
        capacity: cls.capacity,
        currentEnrollment: cls.currentEnrollment || 0, // Real-time enrollment from backend
        status: cls.status,
        teacher: cls.assignedTeachers?.[0]?.teacher
          ? {
              id: cls.assignedTeachers[0].teacher.id,
              firstName: cls.assignedTeachers[0].teacher.user.firstName,
              lastName: cls.assignedTeachers[0].teacher.user.lastName,
            }
          : undefined,
        subjects:
          cls.classSubjects?.map((cs: any) => ({
            id: cs.subject.id,
            name: cs.subject.subjectName,
            code: cs.subject.subjectCode || "",
          })) || [],
        createdAt: cls.createdAt,
      }));

      setClasses(transformedClasses);
      console.log("Classes loaded successfully:", transformedClasses.length);
    } catch (error) {
      console.error("Error loading classes:", error);

      // Check if it's an authentication error
      if (
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.includes("Unauthorized") ||
          error.message.includes("authentication") ||
          error.message.includes("token"))
      ) {
        notificationService.error(
          "Authentication required. Please log in again.",
        );
        window.location.href = "/login";
        return;
      }

      notificationService.error(
        `Failed to load classes: ${error instanceof Error ? error.message : "Unknown error"}`,
      );

      // Fallback to mock data if API fails (with realistic enrollment data)
      const mockClasses: Class[] = [
        {
          id: "1",
          className: "Form 1A",
          classCode: "F1A",
          academicLevel: "O-Level",
          academicYear: "2024/2025",
          capacity: 40,
          currentEnrollment: 35, // Realistic enrollment data
          status: "ACTIVE",
          teacher: {
            id: "1",
            firstName: "John",
            lastName: "Doe",
          },
          subjects: [
            { id: "1", name: "Mathematics", code: "MATH" },
            { id: "2", name: "English", code: "ENG" },
            { id: "3", name: "Physics", code: "PHY" },
          ],
          createdAt: "2024-01-15T10:00:00Z",
        },
        {
          id: "2",
          className: "Form 2B",
          classCode: "F2B",
          academicLevel: "O-Level",
          academicYear: "2024/2025",
          capacity: 35,
          currentEnrollment: 32,
          status: "ACTIVE",
          teacher: {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
          },
          subjects: [
            { id: "1", name: "Mathematics", code: "MATH" },
            { id: "4", name: "Chemistry", code: "CHEM" },
          ],
          createdAt: "2024-01-10T10:00:00Z",
        },
      ];

      setClasses(mockClasses);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = () => {
    window.location.href = "/academic/classes/create";
  };

  const handleViewClass = (classId: string) => {
    window.location.href = `/academic/classes/${classId}`;
  };

  const handleViewSchedule = (classId: string) => {
    window.location.href = `/academic/classes/${classId}/schedule`;
  };

  const handleEditClass = (classId: string) => {
    window.location.href = `/academic/classes/${classId}/edit`;
  };

  const handleDeleteClass = async (classId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this class? This action cannot be undone.",
      )
    ) {
      try {
        await academicService.deleteClass(classId);
        notificationService.success("Class deleted successfully");
        loadClasses(); // Reload classes
      } catch (error) {
        console.error("Error deleting class:", error);
        notificationService.error(
          `Failed to delete class: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
  };

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.classCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.teacher?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.teacher?.lastName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel =
      levelFilter === "all" || cls.academicLevel === levelFilter;
    const matchesStatus = statusFilter === "all" || cls.status === statusFilter;

    return matchesSearch && matchesLevel && matchesStatus;
  });

  const getEnrollmentPercentage = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100);
  };

  const getEnrollmentColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
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
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Class Management
              </h1>
              <p className="text-text-secondary">
                Manage classes, sections, and student enrollment
              </p>
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
                    <h3 className="text-xl font-semibold text-text-primary">
                      {cls.className}
                    </h3>
                    <p className="text-text-secondary">
                      {cls.classCode} • {cls.academicLevel}
                    </p>
                  </div>
                  <StatusBadge status={cls.status} />
                </div>

                {/* Teacher */}
                {cls.teacher && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2">
                      <FaUsers className="text-text-secondary" />
                      <span className="text-sm text-text-secondary">
                        Class Teacher:
                      </span>
                    </div>
                    <p className="text-text-primary font-medium ml-6">
                      {cls.teacher.firstName} {cls.teacher.lastName}
                    </p>
                  </div>
                )}

                {/* Real-time Enrollment */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-text-secondary">
                        Enrollment
                      </span>
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                        title="Real-time data"
                      ></div>
                    </div>
                    <span
                      className={`text-sm font-medium ${getEnrollmentColor(getEnrollmentPercentage(cls.currentEnrollment, cls.capacity))}`}
                    >
                      {cls.currentEnrollment}/{cls.capacity} (
                      {getEnrollmentPercentage(
                        cls.currentEnrollment,
                        cls.capacity,
                      )}
                      %)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getEnrollmentPercentage(
                          cls.currentEnrollment,
                          cls.capacity,
                        ) >= 90
                          ? "bg-red-500"
                          : getEnrollmentPercentage(
                                cls.currentEnrollment,
                                cls.capacity,
                              ) >= 75
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(getEnrollmentPercentage(cls.currentEnrollment, cls.capacity), 100)}%`,
                      }}
                    ></div>
                  </div>
                  {cls.currentEnrollment >= cls.capacity && (
                    <div className="mt-1 text-xs text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      Class is at full capacity
                    </div>
                  )}
                  {cls.capacity - cls.currentEnrollment <= 5 &&
                    cls.currentEnrollment < cls.capacity && (
                      <div className="mt-1 text-xs text-orange-600 flex items-center">
                        <span className="mr-1">⚡</span>
                        Only {cls.capacity - cls.currentEnrollment} spots
                        remaining
                      </div>
                    )}
                </div>

                {/* Subjects */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaCalendarAlt className="text-text-secondary" />
                    <span className="text-sm text-text-secondary">
                      Subjects ({cls.subjects.length})
                    </span>
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
                      title="Manage Students"
                    >
                      <FaUsers className="text-sm" />
                    </button>
                    <button
                      onClick={() =>
                        (window.location.href = `/academic/classes/${cls.id}/schedule`)
                      }
                      className="glass-button p-2 hover:bg-accent-purple/10 hover:text-accent-purple transition-colors"
                      title="Class Schedule"
                    >
                      <FaCalendarAlt className="text-sm" />
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
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                No Classes Found
              </h3>
              <p className="text-text-secondary mb-6">
                {searchTerm || levelFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first class."}
              </p>
              {!searchTerm &&
                levelFilter === "all" &&
                statusFilter === "all" && (
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
