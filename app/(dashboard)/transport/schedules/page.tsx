"use client";

import { useState, useEffect } from "react";
import { FaCalendarAlt, FaPlus, FaSearch, FaFilter, FaBus, FaUser, FaRoute } from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RoleGuard from "@/components/RoleGuard";
import RoleBasedButton from "@/components/RoleBasedButton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import transportService from "@/lib/transportService";

export default function TransportSchedulesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await transportService.getSchedules();
      if (response.success) {
        setSchedules(response.data);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.route?.routeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.vehicle?.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.driver?.firstName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || schedule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Transport Schedules</h1>
          <p className="text-text-secondary mt-2">Manage transport schedules and assignments</p>
        </div>
        <RoleBasedButton
          allowedRoles={["Super Admin", "Tenant Admin", "Transport Staff"]}
          variant="primary"
          onClick={() => router.push("/transport/schedules/create")}
        >
          <FaPlus className="mr-2" />
          New Schedule
        </RoleBasedButton>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search schedules..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Schedules List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto"></div>
            <p className="text-text-secondary mt-2">Loading schedules...</p>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <Card className="p-8 text-center">
            <FaCalendarAlt className="text-6xl text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No schedules found</h3>
            <p className="text-text-secondary">Create your first transport schedule to get started.</p>
          </Card>
        ) : (
          filteredSchedules.map((schedule) => (
            <Card key={schedule.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaCalendarAlt className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {schedule.route?.routeName} - {new Date(schedule.date).toLocaleDateString()}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary mt-1">
                      <div className="flex items-center">
                        <FaBus className="mr-1" />
                        {schedule.vehicle?.vehicleNumber}
                      </div>
                      <div className="flex items-center">
                        <FaUser className="mr-1" />
                        {schedule.driver?.firstName} {schedule.driver?.lastName}
                      </div>
                      <div className="flex items-center">
                        <FaRoute className="mr-1" />
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    schedule.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                    schedule.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                    schedule.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {schedule.status}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/transport/schedules/${schedule.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
