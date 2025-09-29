"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaUsers,
  FaRoute,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaSave,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RoleGuard from "@/components/RoleGuard";
import api from "@/lib/api";

interface Student {
  id: string;
  studentId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Route {
  id: string;
  routeName: string;
  routeCode: string;
  startLocation: string;
  endLocation: string;
  capacity: number;
  currentOccupancy: number;
  fareAmount: number;
  stops: any[];
}

interface AssignmentFormData {
  studentId: string;
  routeId: string;
  pickupPoint: string;
  dropoffPoint: string;
  pickupTime: string;
  dropoffTime: string;
  monthlyFee: string;
  emergencyContact: string;
  emergencyPhone: string;
  specialNotes: string;
}

export default function AssignStudentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState<AssignmentFormData>({
    studentId: "",
    routeId: "",
    pickupPoint: "",
    dropoffPoint: "",
    pickupTime: "",
    dropoffTime: "",
    monthlyFee: "",
    emergencyContact: "",
    emergencyPhone: "",
    specialNotes: "",
  });

  useEffect(() => {
    loadStudents();
    loadRoutes();
  }, []);

  useEffect(() => {
    if (studentSearch) {
      const filtered = students.filter(
        (student) =>
          student.user.firstName.toLowerCase().includes(studentSearch.toLowerCase()) ||
          student.user.lastName.toLowerCase().includes(studentSearch.toLowerCase()) ||
          student.studentId.toLowerCase().includes(studentSearch.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [studentSearch, students]);

  useEffect(() => {
    if (formData.routeId) {
      const route = routes.find((r) => r.id === formData.routeId);
      setSelectedRoute(route || null);
      if (route && route.fareAmount) {
        setFormData((prev) => ({
          ...prev,
          monthlyFee: route.fareAmount.toString(),
        }));
      }
    } else {
      setSelectedRoute(null);
    }
  }, [formData.routeId, routes]);

  const loadStudents = async () => {
    try {
      const response = await api.get("/students");
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };

  const loadRoutes = async () => {
    try {
      const response = await api.get("/transport/routes?status=ACTIVE");
      if (response.data.success) {
        setRoutes(response.data.data);
      }
    } catch (error) {
      console.error("Error loading routes:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStudentSelect = (studentId: string) => {
    setFormData((prev) => ({
      ...prev,
      studentId,
    }));
    setStudentSearch("");
  };

  const getSelectedStudent = () => {
    return students.find((s) => s.id === formData.studentId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.routeId || !formData.pickupPoint || !formData.dropoffPoint) {
      alert("Please fill in all required fields");
      return;
    }

    if (selectedRoute && selectedRoute.currentOccupancy >= selectedRoute.capacity) {
      alert("Selected route has reached maximum capacity");
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData = {
        ...formData,
        monthlyFee: formData.monthlyFee ? parseFloat(formData.monthlyFee) : null,
      };

      const response = await api.post("/transport/students/assign", submitData);

      if (response.data.success) {
        router.push("/transport/students");
      }
    } catch (error: any) {
      console.error("Error assigning student:", error);
      alert(
        error.response?.data?.message || "Failed to assign student to route"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStudent = getSelectedStudent();

  return (
    <RoleGuard requiredPermissions={["transport.manage"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Assign Student to Transport
            </h1>
            <p className="text-text-secondary">
              Assign a student to a transport route
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <FaTimes className="mr-2" />
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <FaUsers className="mr-2 text-accent-blue" />
              Select Student
            </h3>
            
            {selectedStudent ? (
              <div className="flex items-center justify-between p-4 bg-accent-blue/10 border border-accent-blue/30 rounded-lg">
                <div>
                  <h4 className="font-medium text-text-primary">
                    {selectedStudent.user.firstName} {selectedStudent.user.lastName}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    Student ID: {selectedStudent.studentId}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Email: {selectedStudent.user.email}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, studentId: "" }))}
                >
                  Change Student
                </Button>
              </div>
            ) : (
              <div>
                <div className="relative mb-4">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search students by name or ID..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
                
                {studentSearch && (
                  <div className="max-h-64 overflow-y-auto border border-border rounded-lg">
                    {filteredStudents.length === 0 ? (
                      <div className="p-4 text-center text-text-secondary">
                        No students found matching your search
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          className="p-3 hover:bg-surface cursor-pointer border-b border-border last:border-b-0"
                          onClick={() => handleStudentSelect(student.id)}
                        >
                          <div className="font-medium text-text-primary">
                            {student.user.firstName} {student.user.lastName}
                          </div>
                          <div className="text-sm text-text-secondary">
                            ID: {student.studentId} • {student.user.email}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                {!studentSearch && (
                  <div className="p-8 text-center text-text-secondary">
                    Start typing to search for students
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Route Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <FaRoute className="mr-2 text-accent-green" />
              Select Route
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Transport Route *
                </label>
                <select
                  name="routeId"
                  value={formData.routeId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  required
                >
                  <option value="">Select a route</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.routeName} ({route.routeCode}) - {route.currentOccupancy}/{route.capacity} occupied
                    </option>
                  ))}
                </select>
              </div>

              {selectedRoute && (
                <div className="p-4 bg-surface rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">Route Details</h4>
                  <div className="space-y-1 text-sm text-text-secondary">
                    <p>Route: {selectedRoute.startLocation} → {selectedRoute.endLocation}</p>
                    <p>Capacity: {selectedRoute.currentOccupancy}/{selectedRoute.capacity} students</p>
                    {selectedRoute.fareAmount && (
                      <p>Monthly Fee: TZS {selectedRoute.fareAmount.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Pickup & Dropoff Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-accent-purple" />
              Pickup & Dropoff Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Pickup Point *
                </label>
                <input
                  type="text"
                  name="pickupPoint"
                  value={formData.pickupPoint}
                  onChange={handleInputChange}
                  placeholder="e.g., Near City Center"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Dropoff Point *
                </label>
                <input
                  type="text"
                  name="dropoffPoint"
                  value={formData.dropoffPoint}
                  onChange={handleInputChange}
                  placeholder="e.g., School Main Gate"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Pickup Time
                </label>
                <input
                  type="time"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Dropoff Time
                </label>
                <input
                  type="time"
                  name="dropoffTime"
                  value={formData.dropoffTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>
            </div>
          </Card>

          {/* Fee & Emergency Contact */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <FaDollarSign className="mr-2 text-accent-orange" />
              Fee & Emergency Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Monthly Fee (TZS)
                </label>
                <input
                  type="number"
                  name="monthlyFee"
                  value={formData.monthlyFee}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  placeholder="50000"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div></div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="Parent/Guardian name"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  placeholder="+255 123 456 789"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Special Notes
                </label>
                <textarea
                  name="specialNotes"
                  value={formData.specialNotes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any special requirements or notes..."
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
              disabled={isSubmitting || !formData.studentId || !formData.routeId}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning...
                </div>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Assign Student
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}
