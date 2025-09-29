"use client";

import { useState, useEffect } from "react";
import {
  FaBus,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaTools,
  FaGasPump,
  FaCog,
} from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import RoleGuard from "@/components/RoleGuard";
import RoleBasedButton from "@/components/RoleBasedButton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

interface Vehicle {
  id: string;
  vehicleNumber: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  fuelType: string;
  registrationNumber: string;
  status: string;
  condition: string;
  currentMileage: number;
  isActive: boolean;
  driverAssignments: Array<{
    status: string;
    driver: {
      firstName: string;
      lastName: string;
    };
  }>;
  _count: {
    transportSchedules: number;
    maintenances: number;
  };
}

export default function VehiclesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const canManageVehicles = user?.roles?.some((role) =>
    ["Super Admin", "Tenant Admin", "Transport Staff"].includes(role.name)
  );

  useEffect(() => {
    loadVehicles();
  }, [currentPage, searchTerm, statusFilter]);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await api.get(`/transport/vehicles?${params}`);
      if (response.data.success) {
        setVehicles(response.data.data);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error("Error loading vehicles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const response = await api.delete(`/transport/vehicles/${vehicleId}`);
      if (response.data.success) {
        loadVehicles();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete vehicle");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "INACTIVE":
        return "secondary";
      case "MAINTENANCE":
        return "warning";
      case "RETIRED":
      case "ACCIDENT":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "EXCELLENT":
        return "success";
      case "GOOD":
        return "success";
      case "FAIR":
        return "warning";
      case "POOR":
      case "DAMAGED":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getAssignedDriver = (vehicle: Vehicle) => {
    const activeAssignment = vehicle.driverAssignments.find(
      (assignment) => assignment.status === "ACTIVE"
    );
    return activeAssignment
      ? `${activeAssignment.driver.firstName} ${activeAssignment.driver.lastName}`
      : "Unassigned";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Vehicle Management
          </h1>
          <p className="text-text-secondary">
            Manage school vehicles and maintenance records
          </p>
        </div>
        <RoleBasedButton
          allowedRoles={["Super Admin", "Tenant Admin", "Transport Staff"]}
          onClick={() => router.push("/transport/vehicles/create")}
        >
          <FaPlus className="mr-2" />
          Add Vehicle
        </RoleBasedButton>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search vehicles..."
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
              <option value="MAINTENANCE">Maintenance</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
          <Button onClick={loadVehicles} variant="outline" className="w-full">
            Apply Filters
          </Button>
        </div>
      </Card>

      {/* Vehicles Grid */}
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
      ) : vehicles.length === 0 ? (
        <Card className="p-12 text-center">
          <FaBus className="text-6xl text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No vehicles found
          </h3>
          <p className="text-text-secondary mb-6">
            {searchTerm
              ? "No vehicles match your search criteria"
              : "Get started by adding your first vehicle"}
          </p>
          {canManageVehicles && !searchTerm && (
            <Button onClick={() => router.push("/transport/vehicles/create")}>
              <FaPlus className="mr-2" />
              Add First Vehicle
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="p-6 hover:shadow-lg transition-shadow">
              {/* Vehicle Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {vehicle.vehicleNumber}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <StatusBadge status={getStatusColor(vehicle.status)} size="sm">
                    {vehicle.status}
                  </StatusBadge>
                  <StatusBadge status={getConditionColor(vehicle.condition)} size="sm">
                    {vehicle.condition}
                  </StatusBadge>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Registration:</span>
                  <span className="text-text-primary">
                    {vehicle.registrationNumber || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Capacity:</span>
                  <span className="text-text-primary">{vehicle.capacity} students</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Fuel Type:</span>
                  <span className="text-text-primary">{vehicle.fuelType}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Mileage:</span>
                  <span className="text-text-primary">
                    {vehicle.currentMileage ? `${vehicle.currentMileage.toLocaleString()} km` : "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Driver:</span>
                  <span className="text-text-primary">{getAssignedDriver(vehicle)}</span>
                </div>
              </div>

              {/* Vehicle Stats */}
              <div className="flex justify-between text-xs text-text-secondary mb-4 pt-3 border-t border-border">
                <span>{vehicle._count.transportSchedules} schedules</span>
                <span>{vehicle._count.maintenances} maintenances</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/transport/vehicles/${vehicle.id}`)}
                >
                  <FaEye className="mr-1" />
                  View
                </Button>
                
                <RoleGuard requiredPermissions={["transport.manage"]}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/transport/vehicles/${vehicle.id}/edit`)}
                  >
                    <FaEdit className="mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-400"
                    onClick={() => handleDeleteVehicle(vehicle.id)}
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
