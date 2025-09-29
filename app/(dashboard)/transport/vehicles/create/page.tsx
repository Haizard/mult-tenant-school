"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaBus,
  FaCalendarAlt,
  FaGasPump,
  FaCog,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RoleGuard from "@/components/RoleGuard";
import api from "@/lib/api";

interface VehicleFormData {
  vehicleNumber: string;
  make: string;
  model: string;
  year: string;
  capacity: string;
  fuelType: string;
  registrationNumber: string;
  chassisNumber: string;
  engineNumber: string;
  insuranceNumber: string;
  insuranceExpiry: string;
  roadTaxExpiry: string;
  fitnessExpiry: string;
  permitExpiry: string;
  purchaseDate: string;
  purchasePrice: string;
  currentMileage: string;
  condition: string;
  location: string;
  notes: string;
}

export default function CreateVehiclePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>({
    vehicleNumber: "",
    make: "",
    model: "",
    year: "",
    capacity: "30",
    fuelType: "DIESEL",
    registrationNumber: "",
    chassisNumber: "",
    engineNumber: "",
    insuranceNumber: "",
    insuranceExpiry: "",
    roadTaxExpiry: "",
    fitnessExpiry: "",
    permitExpiry: "",
    purchaseDate: "",
    purchasePrice: "",
    currentMileage: "",
    condition: "GOOD",
    location: "",
    notes: "",
  });

  const fuelTypes = [
    { value: "DIESEL", label: "Diesel" },
    { value: "PETROL", label: "Petrol" },
    { value: "CNG", label: "CNG" },
    { value: "ELECTRIC", label: "Electric" },
    { value: "HYBRID", label: "Hybrid" },
  ];

  const conditions = [
    { value: "EXCELLENT", label: "Excellent" },
    { value: "GOOD", label: "Good" },
    { value: "FAIR", label: "Fair" },
    { value: "POOR", label: "Poor" },
    { value: "DAMAGED", label: "Damaged" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicleNumber || !formData.make || !formData.model) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        capacity: parseInt(formData.capacity),
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
        currentMileage: formData.currentMileage ? parseInt(formData.currentMileage) : null,
        insuranceExpiry: formData.insuranceExpiry || null,
        roadTaxExpiry: formData.roadTaxExpiry || null,
        fitnessExpiry: formData.fitnessExpiry || null,
        permitExpiry: formData.permitExpiry || null,
        purchaseDate: formData.purchaseDate || null,
      };

      const response = await api.post("/transport/vehicles", submitData);

      if (response.data.success) {
        router.push("/transport/vehicles");
      }
    } catch (error: any) {
      console.error("Error creating vehicle:", error);
      alert(
        error.response?.data?.message || "Failed to create vehicle"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard requiredPermissions={["transport.manage"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Add New Vehicle
            </h1>
            <p className="text-text-secondary">
              Register a new vehicle for transport services
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <FaTimes className="mr-2" />
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <FaBus className="mr-2 text-accent-blue" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Vehicle Number *
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., SCH-001"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., T123ABC"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Make *
                </label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  placeholder="e.g., Toyota, Isuzu"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., Hiace, NPR"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="1980"
                  max={new Date().getFullYear() + 1}
                  placeholder="2020"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Capacity (students) *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Fuel Type *
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  required
                >
                  {fuelTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Condition
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  {conditions.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Vehicle Identification */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <FaCog className="mr-2 text-accent-green" />
              Vehicle Identification
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Chassis Number
                </label>
                <input
                  type="text"
                  name="chassisNumber"
                  value={formData.chassisNumber}
                  onChange={handleInputChange}
                  placeholder="Vehicle chassis number"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Engine Number
                </label>
                <input
                  type="text"
                  name="engineNumber"
                  value={formData.engineNumber}
                  onChange={handleInputChange}
                  placeholder="Vehicle engine number"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Current Mileage (km)
                </label>
                <input
                  type="number"
                  name="currentMileage"
                  value={formData.currentMileage}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="e.g., 50000"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Current parking location"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>
            </div>
          </Card>

          {/* Insurance & Registration */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-accent-purple" />
              Insurance & Registration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Insurance Number
                </label>
                <input
                  type="text"
                  name="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={handleInputChange}
                  placeholder="Insurance policy number"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Insurance Expiry
                </label>
                <input
                  type="date"
                  name="insuranceExpiry"
                  value={formData.insuranceExpiry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Road Tax Expiry
                </label>
                <input
                  type="date"
                  name="roadTaxExpiry"
                  value={formData.roadTaxExpiry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Fitness Certificate Expiry
                </label>
                <input
                  type="date"
                  name="fitnessExpiry"
                  value={formData.fitnessExpiry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Permit Expiry
                </label>
                <input
                  type="date"
                  name="permitExpiry"
                  value={formData.permitExpiry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>
            </div>
          </Card>

          {/* Purchase Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <FaGasPump className="mr-2 text-accent-orange" />
              Purchase Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Purchase Date
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Purchase Price (TZS)
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  placeholder="e.g., 25000000"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Additional notes about the vehicle..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>
            </div>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Add Vehicle
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}
