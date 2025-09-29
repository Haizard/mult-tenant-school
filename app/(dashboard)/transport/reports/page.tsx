"use client";

import { useState, useEffect } from "react";
import { FaChartBar, FaDownload, FaCalendarAlt, FaFilter } from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import transportService from "@/lib/transportService";

export default function TransportReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await transportService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (reportType: string) => {
    try {
      // In a real implementation, this would generate and download a report
      console.log(`Generating ${reportType} report for date range:`, dateRange);
      // For now, just show an alert
      alert(`${reportType} report generation would be implemented here`);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto"></div>
          <p className="text-text-secondary mt-2">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Transport Reports</h1>
          <p className="text-text-secondary mt-2">Generate and view transport analytics and reports</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Date Range
            </label>
            <div className="flex gap-4">
              <div>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Routes</p>
                <p className="text-2xl font-bold text-text-primary">{stats.routes.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaChartBar className="text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Active Vehicles</p>
                <p className="text-2xl font-bold text-text-primary">{stats.vehicles.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaChartBar className="text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Active Drivers</p>
                <p className="text-2xl font-bold text-text-primary">{stats.drivers.active}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaChartBar className="text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Students Transported</p>
                <p className="text-2xl font-bold text-text-primary">{stats.students.active}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <FaChartBar className="text-orange-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Route Performance Report */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaChartBar className="text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Route Performance</h3>
          <p className="text-sm text-text-secondary mb-4">
            Analyze route efficiency, occupancy rates, and performance metrics
          </p>
          <Button
            variant="outline"
            onClick={() => generateReport('Route Performance')}
            className="w-full"
          >
            <FaDownload className="mr-2" />
            Generate Report
          </Button>
        </Card>

        {/* Vehicle Maintenance Report */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <FaChartBar className="text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Vehicle Maintenance</h3>
          <p className="text-sm text-text-secondary mb-4">
            Track maintenance schedules, costs, and vehicle health status
          </p>
          <Button
            variant="outline"
            onClick={() => generateReport('Vehicle Maintenance')}
            className="w-full"
          >
            <FaDownload className="mr-2" />
            Generate Report
          </Button>
        </Card>

        {/* Driver Performance Report */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <FaChartBar className="text-purple-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Driver Performance</h3>
          <p className="text-sm text-text-secondary mb-4">
            Evaluate driver performance, attendance, and safety records
          </p>
          <Button
            variant="outline"
            onClick={() => generateReport('Driver Performance')}
            className="w-full"
          >
            <FaDownload className="mr-2" />
            Generate Report
          </Button>
        </Card>

        {/* Financial Report */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaChartBar className="text-yellow-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Financial Summary</h3>
          <p className="text-sm text-text-secondary mb-4">
            Revenue, costs, fuel expenses, and financial performance analysis
          </p>
          <Button
            variant="outline"
            onClick={() => generateReport('Financial Summary')}
            className="w-full"
          >
            <FaDownload className="mr-2" />
            Generate Report
          </Button>
        </Card>

        {/* Safety & Incidents Report */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <FaChartBar className="text-red-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Safety & Incidents</h3>
          <p className="text-sm text-text-secondary mb-4">
            Incident reports, safety metrics, and compliance tracking
          </p>
          <Button
            variant="outline"
            onClick={() => generateReport('Safety & Incidents')}
            className="w-full"
          >
            <FaDownload className="mr-2" />
            Generate Report
          </Button>
        </Card>

        {/* Student Attendance Report */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <FaChartBar className="text-indigo-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Student Attendance</h3>
          <p className="text-sm text-text-secondary mb-4">
            Transport attendance patterns and student usage statistics
          </p>
          <Button
            variant="outline"
            onClick={() => generateReport('Student Attendance')}
            className="w-full"
          >
            <FaDownload className="mr-2" />
            Generate Report
          </Button>
        </Card>
      </div>
    </div>
  );
}
