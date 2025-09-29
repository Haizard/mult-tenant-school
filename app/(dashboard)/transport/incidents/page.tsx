"use client";

import { useState, useEffect } from "react";
import { FaExclamationTriangle, FaPlus, FaSearch, FaFilter, FaBus, FaUser, FaRoute } from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RoleGuard from "@/components/RoleGuard";
import RoleBasedButton from "@/components/RoleBasedButton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import transportService from "@/lib/transportService";

export default function TransportIncidentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setIsLoading(true);
      const response = await transportService.getIncidents();
      if (response.success) {
        setIncidents(response.data);
      }
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.route?.routeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = !severityFilter || incident.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Transport Incidents</h1>
          <p className="text-text-secondary mt-2">Track and manage transport incidents and safety issues</p>
        </div>
        <RoleBasedButton
          allowedRoles={["Super Admin", "Tenant Admin", "Transport Staff"]}
          variant="primary"
          onClick={() => router.push("/transport/incidents/create")}
        >
          <FaPlus className="mr-2" />
          Report Incident
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
                placeholder="Search incidents..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="">All Severity</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Incidents List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto"></div>
            <p className="text-text-secondary mt-2">Loading incidents...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <Card className="p-8 text-center">
            <FaExclamationTriangle className="text-6xl text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No incidents found</h3>
            <p className="text-text-secondary">No transport incidents have been reported yet.</p>
          </Card>
        ) : (
          filteredIncidents.map((incident) => (
            <Card key={incident.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <FaExclamationTriangle className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{incident.title}</h3>
                    <p className="text-text-secondary text-sm mt-1 line-clamp-2">{incident.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary mt-2">
                      <span>{new Date(incident.incidentDate).toLocaleDateString()}</span>
                      {incident.route && (
                        <div className="flex items-center">
                          <FaRoute className="mr-1" />
                          {incident.route.routeName}
                        </div>
                      )}
                      {incident.vehicle && (
                        <div className="flex items-center">
                          <FaBus className="mr-1" />
                          {incident.vehicle.vehicleNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/transport/incidents/${incident.id}`)}
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
