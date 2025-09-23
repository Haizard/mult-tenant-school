"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaFileExport,
  FaChartBar,
  FaCalendarAlt,
  FaGraduationCap,
  FaClipboardList,
  FaUsers,
  FaTrophy,
  FaSearch,
  FaFilter,
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
} from "@/lib/services/examinationService";
import { academicService } from "@/lib/academicService";
import { checkNECTACompliance } from "@/lib/nectaCompliance";

interface ExaminationStats {
  totalExaminations: number;
  upcomingExaminations: number;
  ongoingExaminations: number;
  completedExaminations: number;
  totalGrades: number;
  averagePerformance: number;
}

export default function ExaminationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const auditLog = useAuditLog();

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [stats, setStats] = useState<ExaminationStats>({
    totalExaminations: 0,
    upcomingExaminations: 0,
    ongoingExaminations: 0,
    completedExaminations: 0,
    totalGrades: 0,
    averagePerformance: 0,
  });
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [nectaCompliance, setNectaCompliance] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load examinations and subjects in parallel
      const [examinationsResponse, subjectsResponse] = await Promise.all([
        examinationService.getExaminations(),
        academicService.getSubjects(),
      ]);

      if (examinationsResponse.success && examinationsResponse.data) {
        setExaminations(examinationsResponse.data);
        // Calculate stats using client-side method
        const calculatedStats = examinationService.calculateExaminationStats(
          examinationsResponse.data,
        );
        setStats({
          ...calculatedStats,
          averagePerformance: examinationsResponse.data.length > 0 ? 85.5 : 0, // Mock average for now
        });
      }

      if (subjectsResponse.success && subjectsResponse.data) {
        setSubjects(subjectsResponse.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkCompliance = useCallback(async () => {
    try {
      const courses = []; // We'll need to load courses if available
      const complianceReport = await checkNECTACompliance(
        user,
        courses,
        subjects,
      );
      setNectaCompliance(complianceReport.overallCompliance);
    } catch (error) {
      console.error("Error checking NECTA compliance:", error);
    }
  }, [user, subjects]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (subjects.length > 0) {
      checkCompliance();
    }
  }, [subjects, checkCompliance]);

  const handleCreateExamination = () => {
    router.push("/academic/examinations/create");
  };

  const handleViewExamination = (examination: Examination) => {
    router.push(`/academic/examinations/${examination.id}`);
  };

  const handleEditExamination = (examination: Examination) => {
    router.push(`/academic/examinations/${examination.id}/edit`);
  };

  const handleDeleteExamination = async (examination: Examination) => {
    if (
      !confirm(`Are you sure you want to delete "${examination.examName}"?`)
    ) {
      return;
    }

    try {
      const response = await examinationService.deleteExamination(
        examination.id,
      );
      if (response.success) {
        await auditLog.logAction("delete", "examination", examination.id, {
          message: `Deleted examination: ${examination.examName}`,
        });
        loadData(); // Reload data
      } else {
        alert("Failed to delete examination: " + response.message);
      }
    } catch (error) {
      console.error("Error deleting examination:", error);
      alert("Error deleting examination");
    }
  };

  const handleExportExaminations = async () => {
    try {
      const response = await examinationService.exportGrades("csv");
      if (response.success && response.data) {
        // Create download link
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = `examinations-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        await auditLog.logAction("export", "examination", "", {
          message: "Exported examination data",
        });
      }
    } catch (error) {
      console.error("Error exporting examinations:", error);
      alert("Error exporting examinations");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "gray";
      case "SCHEDULED":
        return "blue";
      case "ONGOING":
        return "yellow";
      case "COMPLETED":
        return "green";
      case "PUBLISHED":
        return "purple";
      case "ARCHIVED":
        return "gray";
      default:
        return "gray";
    }
  };

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case "QUIZ":
        return "blue";
      case "MID_TERM":
        return "yellow";
      case "FINAL":
        return "red";
      case "MOCK":
        return "purple";
      case "NECTA":
        return "green";
      case "ASSIGNMENT":
        return "indigo";
      case "PROJECT":
        return "pink";
      default:
        return "gray";
    }
  };

  const filteredExaminations = examinations.filter((exam) => {
    const matchesSearch =
      exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject?.subjectName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      exam.createdByUser.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesType = !filterType || exam.examType === filterType;
    const matchesLevel = !filterLevel || exam.examLevel === filterLevel;
    const matchesStatus = !filterStatus || exam.status === filterStatus;

    return matchesSearch && matchesType && matchesLevel && matchesStatus;
  });

  const examinationColumns = [
    {
      key: "examName",
      label: "Examination Name",
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
        <StatusBadge
          status={value}
          color={getExamTypeColor(value)}
          text={value.replace("_", " ")}
        />
      ),
    },
    {
      key: "examLevel",
      label: "Level",
      render: (value: string) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {value.replace("_", "-")}
        </span>
      ),
    },
    {
      key: "startDate",
      label: "Start Date",
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
          {row._count?.grades || 0} grades
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: Examination) => (
        <div className="flex space-x-2">
          <Button
            onClick={() => handleViewExamination(row)}
            variant="outline"
            size="sm"
            icon={FaEye}
          />
          <RoleGuard permissions={["examinations:update"]}>
            <Button
              onClick={() => handleEditExamination(row)}
              variant="outline"
              size="sm"
              icon={FaEdit}
            />
          </RoleGuard>
          <RoleGuard permissions={["examinations:delete"]}>
            <Button
              onClick={() => handleDeleteExamination(row)}
              variant="outline"
              size="sm"
              icon={FaTrash}
              className="text-red-600 hover:text-red-700"
            />
          </RoleGuard>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Examination Management
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-24 rounded-lg"></div>
            </div>
          ))}
        </div>

        <Card>
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Examination Management
          </h1>
          <p className="text-gray-600">
            Create and manage examinations, enter grades, and track student
            performance
          </p>
        </div>
        <div className="flex space-x-3">
          <RoleGuard permissions={["examinations:read"]}>
            <Button
              onClick={handleExportExaminations}
              variant="outline"
              icon={FaFileExport}
            >
              Export Data
            </Button>
          </RoleGuard>
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
          label="Total Examinations"
          value={stats.totalExaminations.toString()}
          icon={FaClipboardList}
          color="blue"
        />
        <StatCard
          label="Upcoming Exams"
          value={stats.upcomingExaminations.toString()}
          icon={FaCalendarAlt}
          color="orange"
        />
        <StatCard
          label="Ongoing Exams"
          value={stats.ongoingExaminations.toString()}
          icon={FaUsers}
          color="green"
        />
        <StatCard
          label="Completed Exams"
          value={stats.completedExaminations.toString()}
          icon={FaTrophy}
          color="purple"
        />
      </div>

      {/* NECTA Compliance & Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                NECTA Compliance
              </h3>
              <FaGraduationCap className="h-6 w-6 text-green-600" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Overall Compliance
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {nectaCompliance !== null
                      ? `${nectaCompliance.toFixed(1)}%`
                      : "Calculating..."}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${nectaCompliance || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={() => router.push("/necta-compliance")}
                  variant="outline"
                  className="w-full"
                >
                  View Detailed Report
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Performance Overview
              </h3>
              <FaChartBar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalGrades}
                  </div>
                  <div className="text-sm text-gray-500">Total Grades</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.averagePerformance}%
                  </div>
                  <div className="text-sm text-gray-500">Avg Performance</div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={() => router.push("/reports")}
                  variant="outline"
                  className="w-full"
                >
                  View Detailed Analytics
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Examinations Table */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Examinations
            </h3>
            <div className="flex space-x-3">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search examinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="QUIZ">Quiz</option>
                <option value="MID_TERM">Mid-Term</option>
                <option value="FINAL">Final</option>
                <option value="MOCK">Mock</option>
                <option value="NECTA">NECTA</option>
              </select>

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
            </div>
          </div>

          <DataTable
            data={filteredExaminations}
            columns={examinationColumns}
            loading={isLoading}
            emptyMessage="No examinations found. Create your first examination to get started."
          />
        </div>
      </Card>
    </div>
  );
}
