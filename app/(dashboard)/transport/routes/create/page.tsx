"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaRoute,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaCalendarAlt,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RoleGuard from "@/components/RoleGuard";
import api from "@/lib/api";

interface RouteStop {
  id: string;
  name: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  estimatedTime?: string;
}

interface RouteFormData {
  routeName: string;
  routeCode: string;
  description: string;
  startLocation: string;
  endLocation: string;
  distance: string;
  estimatedDuration: string;
  capacity: string;
  fareAmount: string;
  operatingDays: number[];
  startTime: string;
  endTime: string;
  stops: RouteStop[];
}

export default function CreateRoutePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RouteFormData>({
    routeName: "",
    routeCode: "",
    description: "",
    startLocation: "",
    endLocation: "",
    distance: "",
    estimatedDuration: "",
    capacity: "30",
    fareAmount: "",
    operatingDays: [1, 2, 3, 4, 5], // Monday to Friday
    startTime: "",
    endTime: "",
    stops: [],
  });

  const dayOptions = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
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

  const handleDayToggle = (dayValue: number) => {
    setFormData((prev) => ({
      ...prev,
      operatingDays: prev.operatingDays.includes(dayValue)
        ? prev.operatingDays.filter((day) => day !== dayValue)
        : [...prev.operatingDays, dayValue].sort(),
    }));
  };

  const addStop = () => {
    const newStop: RouteStop = {
      id: Date.now().toString(),
      name: "",
      estimatedTime: "",
    };
    setFormData((prev) => ({
      ...prev,
      stops: [...prev.stops, newStop],
    }));
  };

  const removeStop = (stopId: string) => {
    setFormData((prev) => ({
      ...prev,
      stops: prev.stops.filter((stop) => stop.id !== stopId),
    }));
  };

  const updateStop = (stopId: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      stops: prev.stops.map((stop) =>
        stop.id === stopId ? { ...stop, [field]: value } : stop
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.routeName || !formData.startLocation || !formData.endLocation) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.operatingDays.length === 0) {
      alert("Please select at least one operating day");
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData = {
        ...formData,
        distance: formData.distance ? parseFloat(formData.distance) : null,
        estimatedDuration: formData.estimatedDuration
          ? parseInt(formData.estimatedDuration)
          : null,
        capacity: parseInt(formData.capacity),
        fareAmount: formData.fareAmount ? parseFloat(formData.fareAmount) : null,
        stops: formData.stops.filter((stop) => stop.name.trim() !== ""),
      };

      const response = await api.post("/transport/routes", submitData);

      if (response.data.success) {
        router.push("/transport/routes");
      }
    } catch (error: any) {
      console.error("Error creating route:", error);
      alert(
        error.response?.data?.message || "Failed to create route"
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
              Create Transport Route
            </h1>
            <p className="text-text-secondary">
              Add a new transport route for school buses
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <FaTimes className="mr-2" />
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <FaRoute className="mr-2 text-accent-blue" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Route Name *
                </label>
                <input
                  type="text"
                  name="routeName"
                  value={formData.routeName}
                  onChange={handleInputChange}
                  placeholder="e.g., City Center Route"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Route Code
                </label>
                <input
                  type="text"
                  name="routeCode"
                  value={formData.routeCode}
                  onChange={handleInputChange}
                  placeholder="e.g., R001"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Brief description of the route..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>
            </div>
          </Card>

          {/* Route Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-accent-green" />
              Route Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Start Location *
                </label>
                <input
                  type="text"
                  name="startLocation"
                  value={formData.startLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Bus Depot"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  End Location *
                </label>
                <input
                  type="text"
                  name="endLocation"
                  value={formData.endLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., School Main Gate"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Distance (km)
                </label>
                <input
                  type="number"
                  name="distance"
                  value={formData.distance}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  placeholder="e.g., 15.5"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Estimated Duration (minutes)
                </label>
                <input
                  type="number"
                  name="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="e.g., 45"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Capacity (students)
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
                  Monthly Fare (TZS)
                </label>
                <input
                  type="number"
                  name="fareAmount"
                  value={formData.fareAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="100"
                  placeholder="e.g., 50000"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>
            </div>
          </Card>

          {/* Schedule */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <FaClock className="mr-2 text-accent-purple" />
              Schedule
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Operating Days
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {dayOptions.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        formData.operatingDays.includes(day.value)
                          ? "bg-accent-blue text-white border-accent-blue"
                          : "bg-background text-text-secondary border-border hover:border-accent-blue"
                      }`}
                    >
                      {day.label.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Route Stops */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary flex items-center">
                <FaUsers className="mr-2 text-accent-orange" />
                Route Stops
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStop}
              >
                <FaPlus className="mr-1" />
                Add Stop
              </Button>
            </div>

            {formData.stops.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <FaMapMarkerAlt className="text-4xl mx-auto mb-2" />
                <p>No stops added yet. Click "Add Stop" to add route stops.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.stops.map((stop, index) => (
                  <div
                    key={stop.id}
                    className="flex items-center gap-3 p-3 bg-surface rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-accent-blue text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={stop.name}
                        onChange={(e) =>
                          updateStop(stop.id, "name", e.target.value)
                        }
                        placeholder="Stop name"
                        className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      />
                      
                      <input
                        type="time"
                        value={stop.estimatedTime || ""}
                        onChange={(e) =>
                          updateStop(stop.id, "estimatedTime", e.target.value)
                        }
                        className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-400"
                      onClick={() => removeStop(stop.id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
                  Create Route
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}
