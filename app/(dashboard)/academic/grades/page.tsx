"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaChartBar,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilter,
  FaDownload,
  FaSearch,
  FaClipboardList,
  FaGraduationCap,
  FaTrophy,
  FaUsers,
} from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import RoleGuard from "@/components/RoleGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useAuditLog } from "@/hooks/useAuditLog";
import {
  examinationService,
  Examination,
  Grade,
} from "@/lib/services/examinationService";
import { academicService } from "@/lib/academicService";
import { studentService } from "@/lib/studentService";

interface GradeStats {
  totalGrades: number;
  pendingGrades: number;
  publishedGrades: number;
  averagePerformance: number;
}

interface GradeEntryModalProps {
  examination: Examination | null;
  onClose: () => void;
  onSubmit: (gradeData: any) => void;
  isOpen: boolean;
}

function GradeEntryModal({
  examination,
  onClose,
  onSubmit,
  isOpen,
}: GradeEntryModalProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<{
    [key: string]: { rawMarks: number; comments: string };
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && examination) {
      loadStudents();
    }
  }, [isOpen, examination]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const response = await studentService.getStudents();
      if (response.success && response.data) {
        setStudents(response.data);

        // Initialize grades object
        const initialGrades: {
          [key: string]: { rawMarks: number; comments: string };
        } = {};
        response.data.forEach((student: any) => {
          initialGrades[student.id] = { rawMarks: 0, comments: "" };
        });
        setGrades(initialGrades);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeChange = (
    studentId: string,
    field: "rawMarks" | "comments",
    value: string | number,
  ) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: field === "rawMarks" ? Number(value) : value,
      },
    }));
  };

  const handleSubmitGrades = async () => {
    if (!examination) return;

    setIsSubmitting(true);
    try {
      const gradePromises = Object.entries(grades)
        .map(([studentId, gradeData]) => {
          if (gradeData.rawMarks > 0) {
            return examinationService.createGrade({
              examinationId: examination.id,
              studentId,
              subjectId: examination.subjectId || "",
              rawMarks: gradeData.rawMarks,
              comments: gradeData.comments,
            });
          }
          return null;
        })
        .filter(Boolean);

      await Promise.all(gradePromises);
      onSubmit(grades);
      onClose();
    } catch (error) {
      console.error("Error submitting grades:", error);
      alert("Error submitting grades");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !examination) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Enter Grades for {examination.examName}
          </h2>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600">Maximum Marks</div>
                <div className="text-2xl font-bold text-blue-900">
                  {examination.maxMarks}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">Subject</div>
                <div className="text-lg font-semibold text-green-900">
                  {examination.subject?.subjectName || "All Subjects"}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600">Total Students</div>
                <div className="text-2xl font-bold text-purple-900">
                  {students.length}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Raw Marks (/{examination.maxMarks})
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => {
                    const gradeData = grades[student.id] || {
                      rawMarks: 0,
                      comments: "",
                    };
                    const percentage =
                      examination.maxMarks > 0
                        ? (gradeData.rawMarks / examination.maxMarks) * 100
                        : 0;

                    return (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max={examination.maxMarks}
                            value={gradeData.rawMarks}
                            onChange={(e) =>
                              handleGradeChange(
                                student.id,
                                "rawMarks",
                                e.target.value,
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-medium ${
                              percentage >= 80
                                ? "text-green-600"
                                : percentage >= 60
                                  ? "text-yellow-600"
                                  : percentage >= 40
                                    ? "text-orange-600"
                                    : "text-red-600"
                            }`}
                          >
                            {percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={gradeData.comments}
                            onChange={(e) =>
                              handleGradeChange(
                                student.id,
                                "comments",
                                e.target.value,
                              )
                            }
                            placeholder="Optional comments..."
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleSubmitGrades} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Grades"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GradesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const auditLog = useAuditLog();

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [stats, setStats] = useState<GradeStats>({
    totalGrades: 0,
    pendingGrades: 0,
    publishedGrades: 0,
    averagePerformance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterExam, setFilterExam] = useState("");
  const [showGradeEntry, setShowGradeEntry] = useState(false);
  const [selectedExamination, setSelectedExamination] =
    useState<Examination | null>(null);
  const [activeTab, setActiveTab] = useState("examinations");

  useEffect(() => {
    const loadDataAsync = async () => {
      try {
        setIsLoading(true);

        const [examinationsResponse, gradesResponse] = await Promise.all([
          examinationService.getExaminations(),
          examinationService.getGrades(),
        ]);

        if (examinationsResponse.success && examinationsResponse.data) {
          setExaminations(examinationsResponse.data);
        }

        if (gradesResponse.success && gradesResponse.data) {
          setGrades(gradesResponse.data);
          // Calculate stats using client-side method
          const calculatedStats = examinationService.calculateGradeStats(
            gradesResponse.data,
          );
          setStats(calculatedStats);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDataAsync();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [examinationsResponse, gradesResponse] = await Promise.all([
        examinationService.getExaminations(),
        examinationService.getGrades(),
      ]);

      if (examinationsResponse.success && examinationsResponse.data) {
        setExaminations(examinationsResponse.data);
      }

      if (gradesResponse.success && gradesResponse.data) {
        setGrades(gradesResponse.data);
        // Calculate stats using client-side method
        const calculatedStats = examinationService.calculateGradeStats(
          gradesResponse.data,
        );
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExamination = () => {
    router.push("/academic/examinations/create");
  };

  const handleEnterGrades = (examination: Examination) => {
    setSelectedExamination(examination);
    setShowGradeEntry(true);
  };

  const handleGradeEntrySubmit = async (gradeData: any) => {
    await auditLog.logAction("create", "grade", "", {
      message: `Entered grades for examination: ${selectedExamination?.examName}`,
    });
    loadData(); // Reload data
  };

  const handleViewGrades = (examination: Examination) => {
    router.push(`/academic/examinations/${examination.id}`);
  };

  const handleExportGrades = async () => {
    try {
      const response = await examinationService.exportGrades("csv");
      if (response.success && response.data) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = `grades-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        await auditLog.logAction("export", "grade", "", {
          message: "Exported grade data",
        });
      }
    } catch (error) {
      console.error("Error exporting grades:", error);
      alert("Error exporting grades");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "yellow";
      case "SUBMITTED":
        return "blue";
      case "APPROVED":
        return "green";
      case "PUBLISHED":
        return "purple";
      case "ARCHIVED":
        return "gray";
      default:
        return "gray";
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return "green";
    if (percentage >= 60) return "blue";
    if (percentage >= 40) return "yellow";
    return "red";
  };

  const filteredExaminations = examinations.filter((exam) => {
    const matchesSearch =
      exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject?.subjectName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || exam.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const filteredGrades = grades.filter((grade) => {
    const matchesSearch =
      grade.student.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      grade.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.examination.examName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || grade.status === filterStatus;
    const matchesExam = !filterExam || grade.examinationId === filterExam;

    return matchesSearch && matchesStatus && matchesExam;
  });

  const examinationColumns = [
    {
      key: "examName",
      label: "Examination",
      render: (value: string, row: Examination) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">
            {row.subject?.subjectName || "All Subjects"}
          </div>
        </div>
      ),
    },
    {
      key: "examType",
      label: "Type",
      render: (value: string) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {value.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "startDate",
      label: "Date",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "maxMarks",
      label: "Max Marks",
      render: (value: number) => <span className="font-medium">{value}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <StatusBadge
          status={value}
          color={getStatusColor(value)}
          text={value}
        />
      ),
    },
    {
      key: "grades",
      label: "Grades",
      render: (value: any, row: Examination) => (
        <span className="text-sm text-gray-600">
          {row._count?.grades || 0} entered
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: Examination) => (
        <div className="flex space-x-2">
          <RoleGuard permissions={["grades:create"]}>
            <Button
              onClick={() => handleEnterGrades(row)}
              variant="outline"
              size="sm"
              icon={FaEdit}
              disabled={row.status === "ARCHIVED"}
            >
              Enter Grades
            </Button>
          </RoleGuard>
          <Button
            onClick={() => handleViewGrades(row)}
            variant="outline"
            size="sm"
            icon={FaEye}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  const gradeColumns = [
    {
      key: "student",
      label: "Student",
      render: (value: any) => (
        <div>
          <div className="font-medium text-gray-900">
            {value.firstName} {value.lastName}
          </div>
          <div className="text-sm text-gray-500">{value.email}</div>
        </div>
      ),
    },
    {
      key: "examination",
      label: "Examination",
      render: (value: any) => (
        <div>
          <div className="font-medium text-gray-900">{value.examName}</div>
          <div className="text-sm text-gray-500">
            {value.examType.replace("_", " ")}
          </div>
        </div>
      ),
    },
    {
      key: "rawMarks",
      label: "Marks",
      render: (value: number, row: Grade) => (
        <span className="font-medium">
          {value}/{row.examination.maxMarks}
        </span>
      ),
    },
    {
      key: "percentage",
      label: "Percentage",
      render: (value: number) => (
        <StatusBadge
          status={value.toString()}
          color={getGradeColor(value)}
          text={`${value.toFixed(1)}%`}
        />
      ),
    },
    {
      key: "grade",
      label: "Grade",
      render: (value: string | null) => (
        <span className="font-semibold text-gray-900">
          {value || "Not assigned"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <StatusBadge
          status={value}
          color={getStatusColor(value)}
          text={value}
        />
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Grades & Results</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-24 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grades & Results</h1>
          <p className="text-gray-600">
            Enter grades, track student performance, and manage examination
            results
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleExportGrades}
            variant="outline"
            icon={FaDownload}
          >
            Export Grades
          </Button>
          <RoleGuard permissions={["examinations:create"]}>
            <Button onClick={handleCreateExamination} icon={FaPlus}>
              Create Examination
            </Button>
          </RoleGuard>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Grades"
          value={stats.totalGrades.toString()}
          icon={FaClipboardList}
          color="blue"
        />
        <StatCard
          label="Pending Grades"
          value={stats.pendingGrades.toString()}
          icon={FaEdit}
          color="orange"
        />
        <StatCard
          label="Published Grades"
          value={stats.publishedGrades.toString()}
          icon={FaTrophy}
          color="green"
        />
        <StatCard
          label="Avg Performance"
          value={`${stats.averagePerformance.toFixed(1)}%`}
          icon={FaChartBar}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("examinations")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "examinations"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Examinations ({examinations.length})
          </button>
          <button
            onClick={() => setActiveTab("grades")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "grades"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Grades ({grades.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === "examinations" ? "Examinations" : "Grade Records"}
            </h3>
            <div className="flex space-x-3">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filters */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="PUBLISHED">Published</option>
              </select>

              {activeTab === "grades" && (
                <select
                  value={filterExam}
                  onChange={(e) => setFilterExam(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Examinations</option>
                  {examinations.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.examName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {activeTab === "examinations" ? (
            <DataTable
              data={filteredExaminations}
              columns={examinationColumns}
              loading={isLoading}
              emptyMessage="No examinations found. Create your first examination to get started."
            />
          ) : (
            <DataTable
              data={filteredGrades}
              columns={gradeColumns}
              loading={isLoading}
              emptyMessage="No grades found. Start entering grades for examinations."
            />
          )}
        </div>
      </Card>

      {/* Grade Entry Modal */}
      <GradeEntryModal
        examination={selectedExamination}
        isOpen={showGradeEntry}
        onClose={() => {
          setShowGradeEntry(false);
          setSelectedExamination(null);
        }}
        onSubmit={handleGradeEntrySubmit}
      />
    </div>
  );
}
