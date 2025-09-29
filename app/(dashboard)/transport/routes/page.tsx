"use client";

import { useState, useEffect } from "react";
import {
  FaRoute,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
} from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import RoleGuard from "@/components/RoleGuard";
import RoleBasedButton from "@/components/RoleBasedButton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

interface TransportRoute {
  id: string;
  routeName: string;
  routeCode: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  estimatedDuration: number;
  capacity: number;
  currentOccupancy: number;
  fareAmount: number;
  status: string;
  operatingDays: number[];
  startTime: string;
  endTime: string;
  _count: {
    studentTransport: number;
    transportSchedules: number;
  };
}

export default function TransportRoutesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const canManageRoutes = user?.roles?.some((role) =>
    ["Super Admin", "Tenant Admin", "Transport Staff"].includes(role.name)
  );

  useEffect(() => {
    loadRoutes();
  }, [currentPage, searchTerm, statusFilter]);

  const loadRoutes = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await api.get(`/transport/routes?${params}`);
      if (response.data.success) {
        setRoutes(response.data.data);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error("Error loading routes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return;

    try {
      const response = await api.delete(`/transport/routes/${routeId}`);
      if (response.data.success) {
        loadRoutes();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete route");
    }
  };

  const getDayNames = (days: number[]) => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days.map((day) => dayNames[day]).join(", ");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "INACTIVE":
        return "secondary";
      case "SUSPENDED":
        return "warning";
      case "MAINTENANCE":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Transport Routes
          </h1>
          <p className="text-text-secondary">
            Manage school transport routes and schedules
          </p>
        </div>
        <RoleBasedButton
          allowedRoles={["Super Admin", "Tenant Admin", "Transport Staff"]}
          onClick={() => router.push("/transport/routes/create")}
        >
          <FaPlus className="mr-2" />
          Add Route
        </RoleBasedButton>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search routes..."
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
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
          <Button onClick={loadRoutes} variant="outline" className="w-full">
            Apply Filters
          </Button>
        </div>
      </Card>

      {/* Routes List */}
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
      ) : routes.length === 0 ? (
        <Card className="p-12 text-center">
          <FaRoute className="text-6xl text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No routes found
          </h3>
          <p className="text-text-secondary mb-6">
            {searchTerm
              ? "No routes match your search criteria"
              : "Get started by creating your first transport route"}
          </p>
          {canManageRoutes && !searchTerm && (
            <Button onClick={() => router.push("/transport/routes/create")}>
              <FaPlus className="mr-2" />
              Create First Route
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {routes.map((route) => (
            <Card key={route.id} className="p-6 hover:shadow-lg transition-shadow">
              {/* Route Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {route.routeName}
                  </h3>
                  {route.routeCode && (
                    <p className="text-sm text-text-secondary">
                      Code: {route.routeCode}
                    </p>
                  )}
                </div>
                <StatusBadge status={getStatusColor(route.status)}>
                  {route.status}
                </StatusBadge>
              </div>

              {/* Route Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-text-secondary">
                  <FaMapMarkerAlt className="mr-2 text-accent-blue" />
                  <span className="truncate">
                    {route.startLocation} → {route.endLocation}
                  </span>
                </div>

                {route.distance && (
                  <div className="flex items-center text-sm text-text-secondary">
                    <FaRoute className="mr-2 text-accent-green" />
                    <span>
                      {route.distance} km
                      {route.estimatedDuration && (
                        <span className="ml-2">
                          • {route.estimatedDuration} min
                        </span>
                      )}
                    </span>
                  </div>
                )}

                <div className="flex items-center text-sm text-text-secondary">
                  <FaUsers className="mr-2 text-accent-purple" />
                  <span>
                    {route.currentOccupancy}/{route.capacity} students
                  </span>
                </div>

                {route.operatingDays && route.operatingDays.length > 0 && (
                  <div className="flex items-center text-sm text-text-secondary">
                    <FaClock className="mr-2 text-accent-orange" />
                    <span>{getDayNames(route.operatingDays)}</span>
                  </div>
                )}

                {route.startTime && route.endTime && (
                  <div className="text-sm text-text-secondary">
                    Time: {route.startTime} - {route.endTime}
                  </div>
                )}

                {route.fareAmount && (
                  <div className="text-sm font-medium text-text-primary">
                    Fare: TZS {route.fareAmount.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-between text-xs text-text-secondary mb-4">
                <span>{route._count.studentTransport} students assigned</span>
                <span>{route._count.transportSchedules} schedules</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    router.push(`/transport/routes/${route.id}`)
                  }
                >
                  <FaEye className="mr-1" />
                  View
                </Button>
                
                <RoleGuard requiredPermissions={["transport.manage"]}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/transport/routes/${route.id}/edit`)
                    }
                  >
                    <FaEdit className="mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-400"
                    onClick={() => handleDeleteRoute(route.id)}
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
