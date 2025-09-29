"use client";

import { useState, useEffect } from "react";
import { FaClipboardCheck, FaPlus, FaSearch, FaFilter, FaUser, FaBus, FaRoute } from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RoleGuard from "@/components/RoleGuard";
import RoleBasedButton from "@/components/RoleBasedButton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import transportService from "@/lib/transportService";

export default function TransportAttendancePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setIsLoading(true);
      const response = await transportService.getAttendance();
      if (response.success) {
        setAttendance(response.data);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = record.student?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.student?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.schedule?.route?.routeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || record.pickupStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Transport Attendance</h1>
          <p className="text-text-secondary mt-2">Track student transport attendance</p>
        </div>
        <RoleBasedButton
          allowedRoles={["Super Admin", "Tenant Admin", "Transport Staff"]}
          variant="primary"
          onClick={() => router.push("/transport/attendance/mark")}
        >
          <FaPlus className="mr-2" />
          Mark Attendance
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
                placeholder="Search attendance..."
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
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Attendance List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto"></div>
            <p className="text-text-secondary mt-2">Loading attendance...</p>
          </div>
        ) : filteredAttendance.length === 0 ? (
          <Card className="p-8 text-center">
            <FaClipboardCheck className="text-6xl text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No attendance records found</h3>
            <p className="text-text-secondary">No transport attendance has been recorded yet.</p>
          </Card>
        ) : (
          filteredAttendance.map((record) => (
            <Card key={record.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaClipboardCheck className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {record.student?.user?.firstName} {record.student?.user?.lastName}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary mt-1">
                      <span>{new Date(record.date).toLocaleDateString()}</span>
                      {record.schedule?.route && (
                        <div className="flex items-center">
                          <FaRoute className="mr-1" />
                          {record.schedule.route.routeName}
                        </div>
                      )}
                      {record.schedule?.vehicle && (
                        <div className="flex items-center">
                          <FaBus className="mr-1" />
                          {record.schedule.vehicle.vehicleNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.pickupStatus)}`}>
                        Pickup: {record.pickupStatus}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.dropoffStatus)}`}>
                        Dropoff: {record.dropoffStatus}
                      </span>
                    </div>
                    {record.pickupTime && (
                      <p className="text-sm text-text-secondary mt-1">
                        Pickup: {record.pickupTime}
                      </p>
                    )}
                    {record.dropoffTime && (
                      <p className="text-sm text-text-secondary">
                        Dropoff: {record.dropoffTime}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/transport/attendance/${record.id}`)}
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
