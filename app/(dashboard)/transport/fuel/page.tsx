"use client";

import { useState, useEffect } from "react";
import { FaGasPump, FaPlus, FaSearch, FaFilter, FaBus } from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RoleGuard from "@/components/RoleGuard";
import RoleBasedButton from "@/components/RoleBasedButton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import transportService from "@/lib/transportService";

export default function FuelRecordsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [fuelRecords, setFuelRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");

  useEffect(() => {
    loadFuelRecords();
  }, []);

  const loadFuelRecords = async () => {
    try {
      setIsLoading(true);
      const response = await transportService.getFuelRecords();
      if (response.success) {
        setFuelRecords(response.data);
      }
    } catch (error) {
      console.error('Error loading fuel records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = fuelRecords.filter(record => {
    const matchesSearch = record.vehicle?.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.fuelStation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicle = !vehicleFilter || record.vehicleId === vehicleFilter;
    return matchesSearch && matchesVehicle;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Fuel Records</h1>
          <p className="text-text-secondary mt-2">Track fuel consumption and costs</p>
        </div>
        <RoleBasedButton
          allowedRoles={["Super Admin", "Tenant Admin", "Transport Staff"]}
          variant="primary"
          onClick={() => router.push("/transport/fuel/create")}
        >
          <FaPlus className="mr-2" />
          Add Fuel Record
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
                placeholder="Search fuel records..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Fuel Records List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto"></div>
            <p className="text-text-secondary mt-2">Loading fuel records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card className="p-8 text-center">
            <FaGasPump className="text-6xl text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No fuel records found</h3>
            <p className="text-text-secondary">No fuel records have been added yet.</p>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaGasPump className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {record.vehicle?.vehicleNumber} - {record.vehicle?.make} {record.vehicle?.model}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary mt-1">
                      <span>{new Date(record.fillDate).toLocaleDateString()}</span>
                      <span>{record.fuelQuantity}L @ {transportService.formatCurrency(record.pricePerLiter)}/L</span>
                      {record.fuelStation && <span>{record.fuelStation}</span>}
                      <span>Mileage: {record.mileageAtFill?.toLocaleString()} km</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-primary">
                    {transportService.formatCurrency(record.fuelCost)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {record.fuelType}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
