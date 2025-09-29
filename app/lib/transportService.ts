import api from './api';

export interface TransportRoute {
  id: string;
  routeName: string;
  routeCode?: string;
  description?: string;
  startLocation: string;
  endLocation: string;
  distance?: number;
  estimatedDuration?: number;
  capacity: number;
  currentOccupancy: number;
  fareAmount?: number;
  status: string;
  operatingDays: number[];
  startTime?: string;
  endTime?: string;
  stops?: any[];
  routeOptimized?: boolean;
  lastOptimizedAt?: string;
  emergencyContacts?: any[];
  specialInstructions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  routeStops?: RouteStop[];
  studentTransport?: StudentTransport[];
  transportSchedules?: TransportSchedule[];
  transportFees?: TransportFee[];
  incidents?: TransportIncident[];
  _count?: {
    studentTransport: number;
    transportSchedules: number;
    routeStops: number;
  };
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  make: string;
  model: string;
  year?: number;
  capacity: number;
  fuelType: string;
  registrationNumber?: string;
  chassisNumber?: string;
  engineNumber?: string;
  currentMileage: number;
  status: string;
  condition: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  roadTaxExpiry?: string;
  inspectionExpiry?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  vendor?: string;
  isActive: boolean;
  gpsTrackingId?: string;
  fuelEfficiency?: number;
  seatingLayout?: any;
  safetyFeatures?: any[];
  documents?: any[];
  notes?: string;
  driverAssignments?: DriverAssignment[];
  transportSchedules?: TransportSchedule[];
  maintenances?: VehicleMaintenance[];
  fuelRecords?: FuelRecord[];
  incidents?: TransportIncident[];
  inspections?: VehicleInspection[];
  _count?: {
    transportSchedules: number;
    maintenances: number;
    fuelRecords: number;
    incidents: number;
  };
}

export interface Driver {
  id: string;
  driverCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiry: string;
  licenseIssueDate?: string;
  licenseIssuePlace?: string;
  medicalCertExpiry?: string;
  joiningDate: string;
  salary?: number;
  bankAccount?: string;
  bloodGroup?: string;
  experience: number;
  trainingRecords?: any[];
  performanceRating?: number;
  status: string;
  isActive: boolean;
  profilePicture?: string;
  documents?: any[];
  specialSkills?: any[];
  notes?: string;
  vehicleAssignments?: DriverAssignment[];
  transportSchedules?: TransportSchedule[];
  attendanceRecords?: DriverAttendance[];
  incidents?: TransportIncident[];
  performanceRecords?: DriverPerformance[];
  _count?: {
    vehicleAssignments: number;
    transportSchedules: number;
    incidents: number;
  };
}

export interface StudentTransport {
  id: string;
  studentId: string;
  routeId: string;
  pickupPoint: string;
  dropoffPoint: string;
  pickupTime?: string;
  dropoffTime?: string;
  monthlyFee?: number;
  seatNumber?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  specialNotes?: string;
  guardianPreferences?: any;
  status: string;
  isActive: boolean;
  assignedDate: string;
  endDate?: string;
  student: {
    id: string;
    studentId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
  };
  route: TransportRoute;
  transportFees?: TransportFee[];
  attendanceRecords?: TransportAttendance[];
}

export interface TransportSchedule {
  id: string;
  routeId: string;
  vehicleId: string;
  driverId: string;
  date: string;
  scheduleType: string;
  startTime: string;
  endTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: string;
  capacity: number;
  occupancy: number;
  weather?: string;
  trafficConditions?: string;
  fuelConsumed?: number;
  mileageStart?: number;
  mileageEnd?: number;
  notes?: string;
  gpsTrackingData?: any;
  delayReasons?: any[];
  emergencyContacts?: any[];
  route: TransportRoute;
  vehicle: Vehicle;
  driver: Driver;
  attendanceRecords?: TransportAttendance[];
  incidents?: TransportIncident[];
}

export interface DriverAssignment {
  id: string;
  driverId: string;
  vehicleId: string;
  assignedDate: string;
  endDate?: string;
  status: string;
  isPrimary: boolean;
  notes?: string;
  driver: Driver;
  vehicle: Vehicle;
}

export interface VehicleMaintenance {
  id: string;
  vehicleId: string;
  maintenanceType: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  nextServiceDate?: string;
  cost?: number;
  serviceProvider?: string;
  invoiceNumber?: string;
  mileageAtService?: number;
  status: string;
  priority: string;
  partsReplaced?: any[];
  workPerformed?: any[];
  recommendations?: string;
  warrantyExpiry?: string;
  documents?: any[];
  vehicle: Vehicle;
}

export interface TransportFee {
  id: string;
  studentTransportId: string;
  routeId: string;
  studentId: string;
  academicYearId?: string;
  feeType: string;
  amount: number;
  currency: string;
  dueDate: string;
  paidDate?: string;
  status: string;
  discountAmount: number;
  lateCharges: number;
  paymentMethod?: string;
  transactionId?: string;
  receiptNumber?: string;
  notes?: string;
}

export interface TransportIncident {
  id: string;
  incidentType: string;
  severity: string;
  title: string;
  description: string;
  incidentDate: string;
  location?: string;
  routeId?: string;
  vehicleId?: string;
  driverId?: string;
  scheduleId?: string;
  studentsInvolved?: any[];
  injuryDetails?: string;
  actionsTaken?: string;
  status: string;
  resolution?: string;
  preventiveMeasures?: string;
  documentsAttached?: any[];
  insuranceClaim?: string;
  policeCaseNumber?: string;
  parentalNotification?: string;
  authorityNotification?: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

export interface TransportAttendance {
  id: string;
  studentTransportId: string;
  scheduleId: string;
  studentId: string;
  date: string;
  pickupStatus: string;
  pickupTime?: string;
  dropoffStatus: string;
  dropoffTime?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  notes?: string;
  parentNotified: boolean;
  parentNotifiedAt?: string;
  absentReason?: string;
}

export interface RouteStop {
  id: string;
  routeId: string;
  stopName: string;
  stopCode?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  landmark?: string;
  stopOrder: number;
  estimatedTime?: string;
  waitTime: number;
  isActive: boolean;
  emergencyContacts?: any[];
  specialInstructions?: string;
}

export interface FuelRecord {
  id: string;
  vehicleId: string;
  fillDate: string;
  fuelQuantity: number;
  fuelCost: number;
  pricePerLiter: number;
  mileageAtFill: number;
  fuelStation?: string;
  receiptNumber?: string;
  fuelType: string;
  attendantName?: string;
  notes?: string;
}

export interface VehicleInspection {
  id: string;
  vehicleId: string;
  inspectionType: string;
  inspectionDate: string;
  inspector: string;
  inspectorType: string;
  certificateNumber?: string;
  expiryDate?: string;
  status: string;
  score?: number;
  defectsFound?: any[];
  recommendations?: string;
  certificatePath?: string;
  notes?: string;
  nextInspectionDue?: string;
}

export interface DriverAttendance {
  id: string;
  driverId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: string;
  workingHours?: number;
  overtimeHours?: number;
  notes?: string;
  location?: string;
}

export interface DriverPerformance {
  id: string;
  driverId: string;
  evaluationPeriod: string;
  punctualityScore?: number;
  safetyScore?: number;
  behaviorScore?: number;
  vehicleCareScore?: number;
  overallScore?: number;
  commendations?: any[];
  concerns?: any[];
  actionPlan?: string;
  evaluationDate: string;
  nextEvaluationDue?: string;
}

export interface TransportStats {
  routes: {
    total: number;
    active: number;
    inactive: number;
  };
  vehicles: {
    total: number;
    active: number;
    inactive: number;
  };
  drivers: {
    total: number;
    active: number;
    inactive: number;
  };
  students: {
    total: number;
    active: number;
    inactive: number;
  };
  maintenance: {
    pending: number;
    overdue: number;
  };
  incidents: {
    recent: number;
  };
  alerts: {
    expiringSoon: number;
  };
  financial: {
    monthlyFuelCost: number;
    monthlyRevenue: number;
  };
}

class TransportService {
  // Transport Routes
  async getRoutes(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/transport/routes?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw error;
    }
  }

  async getRouteById(id: string) {
    try {
      const response = await api.get(`/transport/routes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching route:', error);
      throw error;
    }
  }

  async createRoute(routeData: Partial<TransportRoute>) {
    try {
      const response = await api.post('/transport/routes', routeData);
      return response.data;
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  }

  async updateRoute(id: string, routeData: Partial<TransportRoute>) {
    try {
      const response = await api.put(`/transport/routes/${id}`, routeData);
      return response.data;
    } catch (error) {
      console.error('Error updating route:', error);
      throw error;
    }
  }

  async deleteRoute(id: string) {
    try {
      const response = await api.delete(`/transport/routes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting route:', error);
      throw error;
    }
  }

  async optimizeRoute(id: string) {
    try {
      const response = await api.post(`/transport/routes/${id}/optimize`);
      return response.data;
    } catch (error) {
      console.error('Error optimizing route:', error);
      throw error;
    }
  }

  // Vehicles
  async getVehicles(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/transport/vehicles?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }

  async getVehicleById(id: string) {
    try {
      const response = await api.get(`/transport/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }
  }

  async createVehicle(vehicleData: Partial<Vehicle>) {
    try {
      const response = await api.post('/transport/vehicles', vehicleData);
      return response.data;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }

  async updateVehicle(id: string, vehicleData: Partial<Vehicle>) {
    try {
      const response = await api.put(`/transport/vehicles/${id}`, vehicleData);
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }

  async deleteVehicle(id: string) {
    try {
      const response = await api.delete(`/transport/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  }

  // Drivers
  async getDrivers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/transport/drivers?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  }

  async getDriverById(id: string) {
    try {
      const response = await api.get(`/transport/drivers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver:', error);
      throw error;
    }
  }

  async createDriver(driverData: Partial<Driver>) {
    try {
      const response = await api.post('/transport/drivers', driverData);
      return response.data;
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  }

  async updateDriver(id: string, driverData: Partial<Driver>) {
    try {
      const response = await api.put(`/transport/drivers/${id}`, driverData);
      return response.data;
    } catch (error) {
      console.error('Error updating driver:', error);
      throw error;
    }
  }

  async deleteDriver(id: string) {
    try {
      const response = await api.delete(`/transport/drivers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw error;
    }
  }

  // Student Transport
  async getStudentTransports(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    routeId?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.routeId) queryParams.append('routeId', params.routeId);

      const response = await api.get(`/transport/students?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student transports:', error);
      throw error;
    }
  }

  async assignStudentToRoute(assignmentData: {
    studentId: string;
    routeId: string;
    pickupPoint: string;
    dropoffPoint: string;
    pickupTime?: string;
    dropoffTime?: string;
    monthlyFee?: number;
    seatNumber?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    specialNotes?: string;
    guardianPreferences?: any;
  }) {
    try {
      const response = await api.post('/transport/students/assign', assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error assigning student to route:', error);
      throw error;
    }
  }

  // Maintenance
  async getMaintenanceRecords(params: {
    page?: number;
    limit?: number;
    vehicleId?: string;
    status?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.vehicleId) queryParams.append('vehicleId', params.vehicleId);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/transport/maintenance?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      throw error;
    }
  }

  async createMaintenanceRecord(maintenanceData: Partial<VehicleMaintenance>) {
    try {
      const response = await api.post('/transport/maintenance', maintenanceData);
      return response.data;
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      throw error;
    }
  }

  // Statistics
  async getStats(): Promise<{ success: boolean; data: TransportStats }> {
    try {
      const response = await api.get('/transport/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching transport stats:', error);
      throw error;
    }
  }

  // Utility functions
  formatCurrency(amount: number, currency: string = 'TZS'): string {
    return `${currency} ${amount.toLocaleString()}`;
  }

  formatDistance(distance: number): string {
    return `${distance} km`;
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  getDayNames(days: number[]): string {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => dayNames[day]).join(', ');
  }

  getStatusColor(status: string): 'success' | 'warning' | 'danger' | 'secondary' | 'info' {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
      case 'COMPLETED':
      case 'PAID':
      case 'PASSED':
        return 'success';
      case 'INACTIVE':
      case 'DRAFT':
      case 'PENDING':
        return 'secondary';
      case 'SUSPENDED':
      case 'OVERDUE':
      case 'DELAYED':
      case 'CONDITIONAL':
        return 'warning';
      case 'MAINTENANCE':
      case 'ACCIDENT':
      case 'RETIRED':
      case 'FAILED':
      case 'CRITICAL':
      case 'URGENT':
        return 'danger';
      case 'IN_PROGRESS':
      case 'SCHEDULED':
        return 'info';
      default:
        return 'secondary';
    }
  }

  getPriorityColor(priority: string): 'success' | 'warning' | 'danger' | 'secondary' | 'info' {
    switch (priority.toUpperCase()) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'info';
      case 'HIGH':
        return 'warning';
      case 'URGENT':
      case 'CRITICAL':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getSeverityColor(severity: string): 'success' | 'warning' | 'danger' | 'secondary' {
    switch (severity.toUpperCase()) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
      case 'CRITICAL':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getConditionColor(condition: string): 'success' | 'warning' | 'danger' | 'secondary' {
    switch (condition.toUpperCase()) {
      case 'EXCELLENT':
      case 'GOOD':
        return 'success';
      case 'FAIR':
        return 'warning';
      case 'POOR':
      case 'DAMAGED':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  formatFuelEfficiency(efficiency: number): string {
    return `${efficiency} km/L`;
  }

  formatMileage(mileage: number): string {
    return `${mileage.toLocaleString()} km`;
  }

  getMaintenanceTypeColor(type: string): 'success' | 'warning' | 'danger' | 'secondary' | 'info' {
    switch (type.toUpperCase()) {
      case 'ROUTINE_SERVICE':
      case 'PREVENTIVE':
        return 'success';
      case 'INSPECTION':
        return 'info';
      case 'CORRECTIVE':
      case 'REPAIR':
        return 'warning';
      case 'EMERGENCY':
      case 'OVERHAUL':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getIncidentTypeColor(type: string): 'success' | 'warning' | 'danger' | 'secondary' | 'info' {
    switch (type.toUpperCase()) {
      case 'DELAY':
      case 'ROUTE_DEVIATION':
        return 'warning';
      case 'ACCIDENT':
      case 'MEDICAL_EMERGENCY':
      case 'VEHICLE_DAMAGE':
        return 'danger';
      case 'BREAKDOWN':
      case 'TRAFFIC_VIOLATION':
        return 'danger';
      case 'STUDENT_MISBEHAVIOR':
        return 'warning';
      case 'SAFETY_CONCERN':
        return 'info';
      default:
        return 'secondary';
    }
  }

  calculateRouteEfficiency(route: TransportRoute): {
    occupancyRate: number;
    costPerStudent: number;
    timeEfficiency: number;
  } {
    const occupancyRate = route.capacity > 0 ? (route.currentOccupancy / route.capacity) * 100 : 0;
    const costPerStudent = route.currentOccupancy > 0 && route.fareAmount 
      ? route.fareAmount / route.currentOccupancy 
      : 0;
    const timeEfficiency = route.distance && route.estimatedDuration 
      ? (route.distance / route.estimatedDuration) * 60 // km/h
      : 0;

    return {
      occupancyRate: Math.round(occupancyRate),
      costPerStudent: Math.round(costPerStudent),
      timeEfficiency: Math.round(timeEfficiency)
    };
  }

  formatPerformanceScore(score: number): string {
    return `${score.toFixed(1)}/10`;
  }

  getPerformanceGrade(score: number): string {
    if (score >= 9) return 'A+';
    if (score >= 8) return 'A';
    if (score >= 7) return 'B+';
    if (score >= 6) return 'B';
    if (score >= 5) return 'C+';
    if (score >= 4) return 'C';
    if (score >= 3) return 'D+';
    if (score >= 2) return 'D';
    return 'F';
  }

  formatWorkingHours(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  }

  // Schedule management
  async getSchedules(params: {
    page?: number;
    limit?: number;
    routeId?: string;
    vehicleId?: string;
    driverId?: string;
    date?: string;
    status?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.routeId) queryParams.append('routeId', params.routeId);
      if (params.vehicleId) queryParams.append('vehicleId', params.vehicleId);
      if (params.driverId) queryParams.append('driverId', params.driverId);
      if (params.date) queryParams.append('date', params.date);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/transport/schedules?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  }

  async createSchedule(scheduleData: Partial<TransportSchedule>) {
    try {
      const response = await api.post('/transport/schedules', scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  // Incident management
  async getIncidents(params: {
    page?: number;
    limit?: number;
    routeId?: string;
    vehicleId?: string;
    driverId?: string;
    severity?: string;
    status?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.routeId) queryParams.append('routeId', params.routeId);
      if (params.vehicleId) queryParams.append('vehicleId', params.vehicleId);
      if (params.driverId) queryParams.append('driverId', params.driverId);
      if (params.severity) queryParams.append('severity', params.severity);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/transport/incidents?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching incidents:', error);
      throw error;
    }
  }

  async createIncident(incidentData: Partial<TransportIncident>) {
    try {
      const response = await api.post('/transport/incidents', incidentData);
      return response.data;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  }

  // Fee management
  async getFees(params: {
    page?: number;
    limit?: number;
    studentId?: string;
    routeId?: string;
    status?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.studentId) queryParams.append('studentId', params.studentId);
      if (params.routeId) queryParams.append('routeId', params.routeId);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/transport/fees?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fees:', error);
      throw error;
    }
  }

  async createFee(feeData: Partial<TransportFee>) {
    try {
      const response = await api.post('/transport/fees', feeData);
      return response.data;
    } catch (error) {
      console.error('Error creating fee:', error);
      throw error;
    }
  }

  // Attendance management
  async getAttendance(params: {
    page?: number;
    limit?: number;
    studentId?: string;
    scheduleId?: string;
    date?: string;
    status?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.studentId) queryParams.append('studentId', params.studentId);
      if (params.scheduleId) queryParams.append('scheduleId', params.scheduleId);
      if (params.date) queryParams.append('date', params.date);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/transport/attendance?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  }

  async markAttendance(attendanceData: Partial<TransportAttendance>) {
    try {
      const response = await api.post('/transport/attendance', attendanceData);
      return response.data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }

  // Fuel management
  async getFuelRecords(params: {
    page?: number;
    limit?: number;
    vehicleId?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.vehicleId) queryParams.append('vehicleId', params.vehicleId);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await api.get(`/transport/fuel?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fuel records:', error);
      throw error;
    }
  }

  async createFuelRecord(fuelData: Partial<FuelRecord>) {
    try {
      const response = await api.post('/transport/fuel', fuelData);
      return response.data;
    } catch (error) {
      console.error('Error creating fuel record:', error);
      throw error;
    }
  }

  // Inspection management
  async getInspections(params: {
    page?: number;
    limit?: number;
    vehicleId?: string;
    inspectionType?: string;
    status?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.vehicleId) queryParams.append('vehicleId', params.vehicleId);
      if (params.inspectionType) queryParams.append('inspectionType', params.inspectionType);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/transport/inspections?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inspections:', error);
      throw error;
    }
  }

  async createInspection(inspectionData: Partial<VehicleInspection>) {
    try {
      const response = await api.post('/transport/inspections', inspectionData);
      return response.data;
    } catch (error) {
      console.error('Error creating inspection:', error);
      throw error;
    }
  }

  // Driver performance management
  async getDriverPerformance(params: {
    page?: number;
    limit?: number;
    driverId?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.driverId) queryParams.append('driverId', params.driverId);

      const response = await api.get(`/transport/drivers/performance?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver performance:', error);
      throw error;
    }
  }

  async createDriverPerformance(performanceData: Partial<DriverPerformance>) {
    try {
      const response = await api.post('/transport/drivers/performance', performanceData);
      return response.data;
    } catch (error) {
      console.error('Error creating driver performance:', error);
      throw error;
    }
  }

  // Driver assignment management
  async getDriverAssignments(params: {
    page?: number;
    limit?: number;
    driverId?: string;
    vehicleId?: string;
    status?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.driverId) queryParams.append('driverId', params.driverId);
      if (params.vehicleId) queryParams.append('vehicleId', params.vehicleId);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/transport/drivers/assignments?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver assignments:', error);
      throw error;
    }
  }

  async createDriverAssignment(assignmentData: Partial<DriverAssignment>) {
    try {
      const response = await api.post('/transport/drivers/assignments', assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating driver assignment:', error);
      throw error;
    }
  }

  // Route stop management
  async getRouteStops(params: {
    page?: number;
    limit?: number;
    routeId?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.routeId) queryParams.append('routeId', params.routeId);

      const response = await api.get(`/transport/routes/stops?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching route stops:', error);
      throw error;
    }
  }

  async createRouteStop(stopData: Partial<RouteStop>) {
    try {
      const response = await api.post('/transport/routes/stops', stopData);
      return response.data;
    } catch (error) {
      console.error('Error creating route stop:', error);
      throw error;
    }
  }

  // Notification management
  async getNotifications(params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.type) queryParams.append('type', params.type);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/transport/notifications?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async createNotification(notificationData: {
    type: string;
    title: string;
    message: string;
    priority?: string;
    targetUsers?: string[];
    targetRoles?: string[];
  }) {
    try {
      const response = await api.post('/transport/notifications', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
}

const transportService = new TransportService();
export default transportService;