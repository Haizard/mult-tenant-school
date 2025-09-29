"use client";

import { useState, useEffect } from "react";
import {
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaIdCard,
  FaClock,
  FaBus,
} from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import RoleGuard from "@/components/RoleGuard";
import RoleBasedButton from "@/components/RoleBasedButton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

interface Driver {
  id: string;
  driverCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiry: string;
  experience: number;
  status: string;
  isActive: boolean;
  vehicleAssignments: Array<{
    status: string;
    vehicle: {
      vehicleNumber: string;
      make: string;
      model: string;
    };
  }>;
  _count: {
    vehicleAssignments: number;
    transportSchedules: number;
  };
}

export default function DriversPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const canManageDrivers = user?.roles?.some((role) =>
    ["Super Admin", "Tenant Admin", "Transport Staff"].includes(role.name)
  );

  useEffect(() => {
    loadDrivers();
  }, [currentPage, searchTerm, statusFilter]);

  const loadDrivers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await api.get(`/transport/drivers?${params}`);
      if (response.data.success) {
        setDrivers(response.data.data);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error("Error loading drivers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;

    try {
      const response = await api.delete(`/transport/drivers/${driverId}`);
      if (response.data.success) {
        loadDrivers();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete driver");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "INACTIVE":
        return "secondary";
      case "SUSPENDED":
        return "warning";
      case "TERMINATED":
        return "danger";
      case "ON_LEAVE":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getLicenseTypeLabel = (type: string) => {
    switch (type) {
      case "LIGHT_VEHICLE":
        return "Light Vehicle";
      case "HEAVY_VEHICLE":
        return "Heavy Vehicle";
      case "TRANSPORT_VEHICLE":
        return "Transport Vehicle";
      case "SPECIAL_VEHICLE":
        return "Special Vehicle";
      default:
        return type;
    }
  };

  const getAssignedVehicle = (driver: Driver) => {
    const activeAssignment = driver.vehicleAssignments.find(
      (assignment) => assignment.status === "ACTIVE"
    );
    return activeAssignment
      ? `${activeAssignment.vehicle.vehicleNumber} (${activeAssignment.vehicle.make} ${activeAssignment.vehicle.model})`
      : "Unassigned";
  };

  const isLicenseExpiring = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isLicenseExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Driver Management
          </h1>
          <p className="text-text-secondary">
            Manage drivers and vehicle assignments
          </p>
        </div>
        <RoleBasedButton
          allowedRoles={["Super Admin", "Tenant Admin", "Transport Staff"]}
          onClick={() => router.push("/transport/drivers/create")}
        >
          <FaPlus className="mr-2" />
          Add Driver
        </RoleBasedButton>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue appearance-none"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>
          <Button onClick={loadDrivers} variant="outline" className="w-full">
            Apply Filters
          </Button>
        </div>
      </Card>

      {/* Drivers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-surface rounded mb-2"></div>
              <div className="h-3 bg-surface rounded mb-4 w-3/4"></div>
              <div className="space-y-2">
                <div className="h-2 bg-surface rounded"></div>
                <div className="h-2 bg-surface rounded w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <Card className="p-12 text-center">
          <FaUsers className="text-6xl text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No drivers found
          </h3>
          <p className="text-text-secondary mb-6">
            {searchTerm
              ? "No drivers match your search criteria"
              : "Get started by adding your first driver"}
          </p>
          {canManageDrivers && !searchTerm && (
            <Button onClick={() => router.push("/transport/drivers/create")}>
              <FaPlus className="mr-2" />
              Add First Driver
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <Card key={driver.id} className="p-6 hover:shadow-lg transition-shadow">
              {/* Driver Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {driver.firstName} {driver.lastName}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Code: {driver.driverCode}
                  </p>
                </div>
                <StatusBadge status={getStatusColor(driver.status)}>
                  {driver.status}
                </StatusBadge>
              </div>

              {/* Driver Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <FaIdCard className="mr-2 text-accent-blue" />
                  <span className="text-text-secondary">License:</span>
                  <span className="ml-2 text-text-primary">
                    {driver.licenseNumber}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <span className="text-text-secondary ml-6">Type:</span>
                  <span className="ml-2 text-text-primary">
                    {getLicenseTypeLabel(driver.licenseType)}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <FaClock className="mr-2 text-accent-green" />
                  <span className="text-text-secondary">Experience:</span>
                  <span className="ml-2 text-text-primary">
                    {driver.experience || 0} years
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <FaBus className="mr-2 text-accent-purple" />
                  <span className="text-text-secondary">Vehicle:</span>
                  <span className="ml-2 text-text-primary text-xs">
                    {getAssignedVehicle(driver)}
                  </span>
                </div>

                {driver.phone && (
                  <div className="flex items-center text-sm">
                    <span className="text-text-secondary ml-6">Phone:</span>
                    <span className="ml-2 text-text-primary">{driver.phone}</span>
                  </div>
                )}
              </div>

              {/* License Expiry Warning */}
              {isLicenseExpired(driver.licenseExpiry) && (
                <div className="mb-4 p-2 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-700">
                  ⚠️ License expired on {new Date(driver.licenseExpiry).toLocaleDateString()}
                </div>
              )}
              {!isLicenseExpired(driver.licenseExpiry) && isLicenseExpiring(driver.licenseExpiry) && (
                <div className="mb-4 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-700">
                  ⚠️ License expires on {new Date(driver.licenseExpiry).toLocaleDateString()}
                </div>
              )}

              {/* Driver Stats */}
              <div className="flex justify-between text-xs text-text-secondary mb-4 pt-3 border-t border-border">
                <span>{driver._count.vehicleAssignments} assignments</span>
                <span>{driver._count.transportSchedules} schedules</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/transport/drivers/${driver.id}`)}
                >
                  <FaEye className="mr-1" />
                  View
                </Button>
                
                <RoleGuard requiredPermissions={["transport.manage"]}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/transport/drivers/${driver.id}/edit`)}
                  >
                    <FaEdit className="mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-400"
                    onClick={() => handleDeleteDriver(driver.id)}
                  >
                    <FaTrash />
                  </Button>
                </RoleGuard>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          
          <span className="px-4 py-2 text-text-secondary">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
