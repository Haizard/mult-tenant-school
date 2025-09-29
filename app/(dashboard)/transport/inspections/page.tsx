"use client";

import { useState, useEffect } from "react";
import { FaClipboardCheck, FaPlus, FaSearch, FaFilter, FaBus } from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RoleGuard from "@/components/RoleGuard";
import RoleBasedButton from "@/components/RoleBasedButton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import transportService from "@/lib/transportService";

export default function VehicleInspectionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      setIsLoading(true);
      const response = await transportService.getInspections();
      if (response.success) {
        setInspections(response.data);
      }
    } catch (error) {
      console.error('Error loading inspections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.vehicle?.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.inspector?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || inspection.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'CONDITIONAL': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Vehicle Inspections</h1>
          <p className="text-text-secondary mt-2">Track vehicle inspections and compliance</p>
        </div>
        <RoleBasedButton
          allowedRoles={["Super Admin", "Tenant Admin", "Transport Staff"]}
          variant="primary"
          onClick={() => router.push("/transport/inspections/create")}
        >
          <FaPlus className="mr-2" />
          Schedule Inspection
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
                placeholder="Search inspections..."
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
              <option value="PASSED">Passed</option>
              <option value="FAILED">Failed</option>
              <option value="CONDITIONAL">Conditional</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Inspections List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto"></div>
            <p className="text-text-secondary mt-2">Loading inspections...</p>
          </div>
        ) : filteredInspections.length === 0 ? (
          <Card className="p-8 text-center">
            <FaClipboardCheck className="text-6xl text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No inspections found</h3>
            <p className="text-text-secondary">No vehicle inspections have been scheduled yet.</p>
          </Card>
        ) : (
          filteredInspections.map((inspection) => (
            <Card key={inspection.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaClipboardCheck className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {inspection.vehicle?.vehicleNumber} - {inspection.vehicle?.make} {inspection.vehicle?.model}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary mt-1">
                      <span>{new Date(inspection.inspectionDate).toLocaleDateString()}</span>
                      <span>{inspection.inspectionType}</span>
                      <span>Inspector: {inspection.inspector}</span>
                      {inspection.expiryDate && (
                        <span>Expires: {new Date(inspection.expiryDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inspection.status)}`}>
                    {inspection.status}
                  </span>
                  {inspection.score && (
                    <span className="text-sm text-text-secondary">
                      Score: {inspection.score}/100
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/transport/inspections/${inspection.id}`)}
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
