"use client";

import { useState, useEffect } from "react";
import {
  FaUsers,
  FaRoute,
  FaMapMarkerAlt,
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaDollarSign,
} from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import RoleGuard from "@/components/RoleGuard";
import RoleBasedButton from "@/components/RoleBasedButton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

interface StudentTransport {
  id: string;
  pickupPoint: string;
  dropoffPoint: string;
  pickupTime: string;
  dropoffTime: string;
  monthlyFee: number;
  status: string;
  student: {
    id: string;
    studentId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
  route: {
    id: string;
    routeName: string;
    routeCode: string;
    startLocation: string;
    endLocation: string;
    fareAmount: number;
  };
  transportFees: Array<{
    status: string;
    amount: number;
    dueDate: string;
  }>;
}

export default function StudentTransportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [studentTransports, setStudentTransports] = useState<StudentTransport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [routeFilter, setRouteFilter] = useState("all");
  const [routes, setRoutes] = useState<any[]>([]);

  const canManageTransport = user?.roles?.some((role) =>
    ["Super Admin", "Tenant Admin", "Transport Staff"].includes(role.name)
  );

  const isStudent = user?.roles?.some((role) => role.name === "Student");

  useEffect(() => {
    loadStudentTransports();
    if (canManageTransport) {
      loadRoutes();
    }
  }, [searchTerm, statusFilter, routeFilter]);

  const loadStudentTransports = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(routeFilter !== "all" && { routeId: routeFilter }),
      });

      const response = await api.get(`/transport/students?${params}`);
      if (response.data.success) {
        setStudentTransports(response.data.data);
      }
    } catch (error) {
      console.error("Error loading student transports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoutes = async () => {
    try {
      const response = await api.get("/transport/routes");
      if (response.data.success) {
        setRoutes(response.data.data);
      }
    } catch (error) {
      console.error("Error loading routes:", error);
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
      default:
        return "secondary";
    }
  };

  const getPendingFees = (transportFees: any[]) => {
    return transportFees.filter((fee) => 
      ["PENDING", "OVERDUE"].includes(fee.status)
    ).length;
  };

  // If user is a student, show only their transport information
  if (isStudent) {
    const myTransport = studentTransports.find(
      (st) => st.student.user.email === user?.email
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              My Transport
            </h1>
            <p className="text-text-secondary">
              Your transport route and schedule information
            </p>
          </div>
        </div>

        {myTransport ? (
          <Card className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Route Information */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                  <FaRoute className="mr-2 text-accent-blue" />
                  Route Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Route:</span>
                    <span className="font-medium text-text-primary">
                      {myTransport.route.routeName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Code:</span>
                    <span className="font-medium text-text-primary">
                      {myTransport.route.routeCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Status:</span>
                    <StatusBadge status={getStatusColor(myTransport.status)}>
                      {myTransport.status}
                    </StatusBadge>
                  </div>
                </div>
              </div>

              {/* Pickup/Dropoff Information */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-accent-green" />
                  Pickup & Dropoff
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Pickup Point:</span>
                    <span className="font-medium text-text-primary">
                      {myTransport.pickupPoint}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Pickup Time:</span>
                    <span className="font-medium text-text-primary">
                      {myTransport.pickupTime || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Dropoff Point:</span>
                    <span className="font-medium text-text-primary">
                      {myTransport.dropoffPoint}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Dropoff Time:</span>
                    <span className="font-medium text-text-primary">
                      {myTransport.dropoffTime || "Not set"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Information */}
            {myTransport.monthlyFee && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                  <FaDollarSign className="mr-2 text-accent-orange" />
                  Fee Information
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Monthly Fee:</span>
                  <span className="font-medium text-text-primary">
                    TZS {myTransport.monthlyFee.toLocaleString()}
                  </span>
                </div>
                {getPendingFees(myTransport.transportFees) > 0 && (
                  <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      You have {getPendingFees(myTransport.transportFees)} pending fee(s).
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <FaUsers className="text-6xl text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No Transport Assigned
            </h3>
            <p className="text-text-secondary">
              You are not currently assigned to any transport route. 
              Please contact the school administration if you need transport services.
            </p>
          </Card>
        )}
      </div>
    );
  }

  // Admin/Transport Staff view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Student Transport
          </h1>
          <p className="text-text-secondary">
            Manage student transport assignments and routes
          </p>
        </div>
        <RoleBasedButton
          allowedRoles={["Super Admin", "Tenant Admin", "Transport Staff"]}
          onClick={() => router.push("/transport/students/assign")}
        >
          <FaPlus className="mr-2" />
          Assign Student
        </RoleBasedButton>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            <option value="all">All Routes</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.routeName}
              </option>
            ))}
          </select>

          <Button onClick={loadStudentTransports} variant="outline">
            Apply Filters
          </Button>
        </div>
      </Card>

      {/* Student Transport List */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
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
      ) : studentTransports.length === 0 ? (
        <Card className="p-12 text-center">
          <FaUsers className="text-6xl text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No student transport assignments found
          </h3>
          <p className="text-text-secondary mb-6">
            {searchTerm
              ? "No assignments match your search criteria"
              : "Get started by assigning students to transport routes"}
          </p>
          {canManageTransport && !searchTerm && (
            <Button onClick={() => router.push("/transport/students/assign")}>
              <FaPlus className="mr-2" />
              Assign First Student
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {studentTransports.map((studentTransport) => (
            <Card key={studentTransport.id} className="p-6">
              {/* Student Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {studentTransport.student.user.firstName}{" "}
                    {studentTransport.student.user.lastName}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    ID: {studentTransport.student.studentId}
                  </p>
                </div>
                <StatusBadge status={getStatusColor(studentTransport.status)}>
                  {studentTransport.status}
                </StatusBadge>
              </div>

              {/* Route Information */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <FaRoute className="mr-2 text-accent-blue" />
                  <span className="text-text-secondary">Route:</span>
                  <span className="ml-2 text-text-primary font-medium">
                    {studentTransport.route.routeName}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <FaMapMarkerAlt className="mr-2 text-accent-green" />
                  <span className="text-text-secondary">Pickup:</span>
                  <span className="ml-2 text-text-primary">
                    {studentTransport.pickupPoint}
                    {studentTransport.pickupTime && (
                      <span className="text-text-secondary ml-1">
                        ({studentTransport.pickupTime})
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <FaMapMarkerAlt className="mr-2 text-accent-orange" />
                  <span className="text-text-secondary">Dropoff:</span>
                  <span className="ml-2 text-text-primary">
                    {studentTransport.dropoffPoint}
                    {studentTransport.dropoffTime && (
                      <span className="text-text-secondary ml-1">
                        ({studentTransport.dropoffTime})
                      </span>
                    )}
                  </span>
                </div>

                {studentTransport.monthlyFee && (
                  <div className="flex items-center text-sm">
                    <FaDollarSign className="mr-2 text-accent-purple" />
                    <span className="text-text-secondary">Monthly Fee:</span>
                    <span className="ml-2 text-text-primary font-medium">
                      TZS {studentTransport.monthlyFee.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Pending Fees Alert */}
              {getPendingFees(studentTransport.transportFees) > 0 && (
                <div className="mb-4 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-700">
                  {getPendingFees(studentTransport.transportFees)} pending fee(s)
                </div>
              )}

              {/* Actions */}
              <RoleGuard requiredPermissions={["transport.manage"]}>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      router.push(`/transport/students/${studentTransport.id}/edit`)
                    }
                  >
                    <FaEdit className="mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-400"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </RoleGuard>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
