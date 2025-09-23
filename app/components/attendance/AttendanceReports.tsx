"use client";

import { useState, useEffect } from "react";
import { FaDownload, FaFilter } from "react-icons/fa";
import { Card } from "../ui/Card";
import Button from "../ui/Button";
import Chart from "../Chart";
import { attendanceService } from "../../../lib/attendanceService";
import { useToast } from "../../../hooks/use-toast";

interface AttendanceReportsProps {
  className?: string;
}

interface AttendanceAnalytics {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  attendanceRate: number;
  weeklyTrend: number;
  monthlyStats: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
  }>;
  classWiseStats: Array<{
    className: string;
    attendanceRate: number;
    totalStudents: number;
  }>;
}

const AttendanceReports = ({ className = "" }: AttendanceReportsProps) => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AttendanceAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("7"); // Last 7 days
  const [selectedClass, setSelectedClass] = useState("all");
  const [reportType, setReportType] = useState("overview");

  useEffect(() => {
    loadAttendanceAnalytics();
  }, [selectedDateRange, selectedClass]);

  const loadAttendanceAnalytics = async () => {
    setIsLoading(true);
    try {
      // Get current date stats
      const today = new Date().toISOString().split("T")[0];
      const statsResponse = await attendanceService.getAttendanceStats({
        date: today,
      });

      if (statsResponse.success) {
        const stats = statsResponse.data.stats;
        const totalToday = Object.values(stats).reduce(
          (sum: number, count: number) => sum + count,
          0,
        );

        // Mock additional analytics data - in real implementation, these would come from dedicated API endpoints
        const mockAnalytics: AttendanceAnalytics = {
          totalStudents: statsResponse.data.totalStudents || 150,
          presentToday: stats.PRESENT,
          absentToday: stats.ABSENT,
          lateToday: stats.LATE,
          attendanceRate: statsResponse.data.attendanceRate,
          weeklyTrend: 2.5, // Percentage change from last week
          monthlyStats: generateMockMonthlyData(),
          classWiseStats: generateMockClassData(),
        };

        setAnalytics(mockAnalytics);
      }
    } catch (error) {
      console.error("Error loading attendance analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load attendance analytics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockMonthlyData = () => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split("T")[0],
        present: Math.floor(Math.random() * 20) + 130,
        absent: Math.floor(Math.random() * 15) + 5,
        late: Math.floor(Math.random() * 10) + 2,
        excused: Math.floor(Math.random() * 8) + 1,
      });
    }
    return data;
  };

  const generateMockClassData = () => [
    { className: "Grade 10A", attendanceRate: 92, totalStudents: 30 },
    { className: "Grade 10B", attendanceRate: 88, totalStudents: 28 },
    { className: "Grade 11A", attendanceRate: 85, totalStudents: 32 },
    { className: "Grade 11B", attendanceRate: 90, totalStudents: 29 },
    { className: "Grade 12A", attendanceRate: 95, totalStudents: 31 },
  ];

  const handleExportReport = () => {
    // Mock export functionality
    toast({
      title: "Export Started",
      description:
        "Your attendance report is being generated and will be downloaded shortly.",
      variant: "success",
    });
  };

  const getAttendanceChartData = () => {
    if (!analytics) return [];

    return analytics.monthlyStats.map((stat) => ({
      name: new Date(stat.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      Present: stat.present,
      Absent: stat.absent,
      Late: stat.late,
      Excused: stat.excused,
    }));
  };

  const getClassWiseChartData = () => {
    if (!analytics) return [];

    return analytics.classWiseStats.map((cls) => ({
      name: cls.className,
      "Attendance Rate": cls.attendanceRate,
      "Total Students": cls.totalStudents,
    }));
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-text-secondary">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-6 text-center">
          <p className="text-text-secondary">No attendance data available</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Filters */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            Attendance Reports & Analytics
          </h2>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleExportReport}>
              <span className="mr-2">📥</span>
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="glass-input w-full"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 3 Months</option>
              <option value="365">Last Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="glass-input w-full"
            >
              <option value="all">All Classes</option>
              <option value="grade10a">Grade 10A</option>
              <option value="grade10b">Grade 10B</option>
              <option value="grade11a">Grade 11A</option>
              <option value="grade11b">Grade 11B</option>
              <option value="grade12a">Grade 12A</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="glass-input w-full"
            >
              <option value="overview">Overview</option>
              <option value="detailed">Detailed</option>
              <option value="trends">Trends</option>
              <option value="comparison">Comparison</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button variant="primary" className="w-full">
              <span className="mr-2">🔍</span>
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <span className="text-2xl text-white">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalStudents}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <span className="text-2xl text-white">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Attendance Rate</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.attendanceRate}%
                </p>
                <div
                  className={`flex items-center text-sm ${analytics.weeklyTrend > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  <span className="mr-1">
                    {analytics.weeklyTrend > 0 ? "↑" : "↓"}
                  </span>
                  <span>{Math.abs(analytics.weeklyTrend)}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <span className="text-2xl text-white">✅</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Present Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.presentToday}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
              <span className="text-2xl text-white">❌</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Absent Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.absentToday}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Attendance Trend Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-text-primary">
            Daily Attendance Trends
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📅</span>
            <span>Last 30 Days</span>
          </div>
        </div>

        <div className="h-80">
          {getAttendanceChartData().length > 0 ? (
            <Chart
              data={getAttendanceChartData()}
              type="area"
              xAxisKey="name"
              yAxisKeys={["Present", "Absent", "Late", "Excused"]}
              colors={["#10B981", "#EF4444", "#F59E0B", "#3B82F6"]}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No attendance data available for chart</p>
            </div>
          )}
        </div>
      </Card>

      {/* Class-wise Performance */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-text-primary">
            Class-wise Attendance Performance
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📊</span>
            <span>Attendance Rate by Class</span>
          </div>
        </div>

        <div className="h-80">
          {getClassWiseChartData().length > 0 ? (
            <Chart
              data={getClassWiseChartData()}
              type="bar"
              xAxisKey="name"
              yAxisKeys={["Attendance Rate"]}
              colors={["#6366F1"]}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No class data available for chart</p>
            </div>
          )}
        </div>
      </Card>

      {/* Detailed Class Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-text-primary mb-6">
          Class Statistics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Class
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Total Students
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Attendance Rate
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.classWiseStats.map((cls, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {cls.className}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {cls.totalStudents}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${cls.attendanceRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {cls.attendanceRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cls.attendanceRate >= 90
                          ? "bg-green-100 text-green-800"
                          : cls.attendanceRate >= 80
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {cls.attendanceRate >= 90
                        ? "Excellent"
                        : cls.attendanceRate >= 80
                          ? "Good"
                          : "Needs Attention"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceReports;
