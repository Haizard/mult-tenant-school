import api from './api';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const STALE_WHILE_REVALIDATE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

// Simple in-memory cache for hostel stats
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  isStale: boolean;
}

const statsCache: Map<string, CacheEntry<HostelStats>> = new Map();

// DTO interfaces for better type safety
export interface RoomAmenities {
  wifi?: boolean;
  airConditioning?: boolean;
  heating?: boolean;
  refrigerator?: boolean;
  studyDesk?: boolean;
  wardrobe?: boolean;
  privateBathroom?: boolean;
  balcony?: boolean;
  [key: string]: boolean | undefined;
}

export interface MaintenanceAttachments {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface ReportParameters {
  startDate?: string;
  endDate?: string;
  hostelId?: string;
  roomType?: RoomType;
  status?: string;
  [key: string]: string | undefined;
}

export interface ReportData {
  summary?: Record<string, unknown>;
  details?: unknown[];
  charts?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// Types based on Prisma schema
export interface Hostel {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  address?: string;
  totalCapacity: number;
  currentOccupancy: number;
  availableRooms: number;
  monthlyFee?: number;
  currency: string;
  wardenName?: string;
  wardenPhone?: string;
  wardenEmail?: string;
  status: HostelStatus;
  isActive: boolean;
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
  createdBy?: string;
  updatedBy?: string;
  _count?: {
    rooms: number;
    assignments: number;
  };
}

export interface HostelRoom {
  id: string;
  tenantId: string;
  hostelId: string;
  roomNumber: string;
  floorNumber: number;
  capacity: number;
  currentOccupancy: number;
  roomType: RoomType;
  monthlyFee?: number;
  currency: string;
  amenities?: RoomAmenities;
  notes?: string;
  status: RoomStatus;
  isActive: boolean;
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
  createdBy?: string;
  updatedBy?: string;
  hostel?: {
    name: string;
  };
  _count?: {
    assignments: number;
  };
}

export interface HostelAssignment {
  id: string;
  tenantId: string;
  studentId: string;
  hostelId: string;
  roomId: string;
  assignmentDate: string; // ISO string format
  startDate: string; // ISO string format
  endDate?: string; // ISO string format
  monthlyFee: number;
  currency: string;
  depositAmount?: number;
  depositPaid: boolean;
  status: HostelAssignmentStatus;
  notes?: string;
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
  createdBy?: string;
  updatedBy?: string;
  student?: {
    id: string;
    studentId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  hostel?: {
    name: string;
  };
  room?: {
    roomNumber: string;
    floorNumber: number;
  };
}

export interface HostelMaintenance {
  id: string;
  tenantId: string;
  hostelId: string;
  roomId?: string;
  maintenanceType: MaintenanceType;
  title: string;
  description?: string;
  priority: MaintenancePriority;
  scheduledDate: string; // ISO string format
  completedDate?: string; // ISO string format
  cost?: number;
  currency: string;
  vendor?: string;
  status: MaintenanceStatus;
  notes?: string;
  attachments?: MaintenanceAttachments[];
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
  createdBy?: string;
  updatedBy?: string;
  hostel?: {
    name: string;
  };
  room?: {
    roomNumber: string;
    floorNumber: number;
  };
}

export interface HostelReport {
  id: string;
  tenantId: string;
  hostelId: string;
  reportType: HostelReportType;
  title: string;
  parameters?: ReportParameters;
  data: ReportData;
  generatedBy: string;
  generatedAt: string; // ISO string format
  format: ReportFormat;
  status: string;
  filePath?: string;
  expiryDate?: string; // ISO string format
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
  hostel?: {
    name: string;
  };
}

export interface HostelStats {
  totalHostels: number;
  totalRooms: number;
  totalAssignments: number;
  activeAssignments: number;
  availableRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  maintenanceRequests: number;
  completedMaintenance: number;
}

// Enums based on Prisma schema
export enum HostelStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  CLOSED = 'CLOSED',
}

export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  TRIPLE = 'TRIPLE',
  QUAD = 'QUAD',
  DORMITORY = 'DORMITORY',
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
  OUT_OF_ORDER = 'OUT_OF_ORDER',
}

export enum HostelAssignmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  TRANSFERRED = 'TRANSFERRED',
}

export enum MaintenanceType {
  ROUTINE = 'ROUTINE',
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  EMERGENCY = 'EMERGENCY',
  INSPECTION = 'INSPECTION',
  REPAIR = 'REPAIR',
}

export enum MaintenancePriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export enum HostelReportType {
  OCCUPANCY = 'OCCUPANCY',
  FINANCIAL = 'FINANCIAL',
  MAINTENANCE = 'MAINTENANCE',
  STUDENT_LIST = 'STUDENT_LIST',
  ROOM_AVAILABILITY = 'ROOM_AVAILABILITY',
  FEE_COLLECTION = 'FEE_COLLECTION',
  CUSTOM = 'CUSTOM',
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON',
}

// Service functions
export const hostelService = {
  // Hostel Management
  async getHostels(params?: {
    status?: HostelStatus;
    search?: string;
  }): Promise<Hostel[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await api.get(`/hostel?${queryParams.toString()}`);
    return (response.data as Hostel[]) || [];
  },

  async createHostel(data: {
    name: string;
    description?: string;
    address?: string;
    totalCapacity: number;
    monthlyFee?: number;
    wardenName?: string;
    wardenPhone?: string;
    wardenEmail?: string;
  }): Promise<Hostel> {
    const response = await api.post('/hostel', data);
    return (response.data as Hostel) || {} as Hostel;
  },

  async updateHostel(id: string, data: Partial<Hostel>): Promise<Hostel> {
    const response = await api.put(`/hostel/${encodeURIComponent(id)}`, data);
    return (response.data as Hostel) || {} as Hostel;
  },

  async deleteHostel(id: string): Promise<void> {
    await api.delete(`/hostel/${encodeURIComponent(id)}`);
  },

  // Room Management
  async getHostelRooms(params?: {
    hostelId?: string;
    status?: RoomStatus;
    search?: string;
  }): Promise<HostelRoom[]> {
    const queryParams = new URLSearchParams();
    if (params?.hostelId) queryParams.append('hostelId', params.hostelId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await api.get(`/hostel/rooms?${queryParams.toString()}`);
    return (response.data as HostelRoom[]) || [];
  },

  async createHostelRoom(data: {
    hostelId: string;
    roomNumber: string;
    floorNumber: number;
    capacity: number;
    roomType: RoomType;
    monthlyFee?: number;
    amenities?: RoomAmenities;
    notes?: string;
  }): Promise<HostelRoom> {
    const response = await api.post('/hostel/rooms', data);
    return (response.data as HostelRoom) || {} as HostelRoom;
  },

  async updateHostelRoom(id: string, data: Partial<HostelRoom>): Promise<HostelRoom> {
    const response = await api.put(`/hostel/rooms/${encodeURIComponent(id)}`, data);
    return (response.data as HostelRoom) || {} as HostelRoom;
  },

  // Assignment Management
  async getHostelAssignments(params?: {
    status?: HostelAssignmentStatus;
    studentId?: string;
    hostelId?: string;
    roomId?: string;
  }): Promise<HostelAssignment[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.studentId) queryParams.append('studentId', params.studentId);
    if (params?.hostelId) queryParams.append('hostelId', params.hostelId);
    if (params?.roomId) queryParams.append('roomId', params.roomId);
    
    const response = await api.get(`/hostel/assignments?${queryParams.toString()}`);
    return (response.data as HostelAssignment[]) || [];
  },

  async createHostelAssignment(data: {
    studentId: string;
    hostelId: string;
    roomId: string;
    startDate: string;
    endDate?: string;
    monthlyFee: number;
    depositAmount?: number;
    notes?: string;
  }): Promise<HostelAssignment> {
    const response = await api.post('/hostel/assignments', data);
    return (response.data as HostelAssignment) || {} as HostelAssignment;
  },

  async updateHostelAssignment(id: string, data: {
    status?: HostelAssignmentStatus;
    endDate?: string;
    notes?: string;
  }): Promise<HostelAssignment> {
    const response = await api.put(`/hostel/assignments/${encodeURIComponent(id)}`, data);
    return (response.data as HostelAssignment) || {} as HostelAssignment;
  },

  // Maintenance Management
  async getHostelMaintenance(params?: {
    status?: MaintenanceStatus;
    hostelId?: string;
    roomId?: string;
    maintenanceType?: MaintenanceType;
  }): Promise<HostelMaintenance[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.hostelId) queryParams.append('hostelId', params.hostelId);
    if (params?.roomId) queryParams.append('roomId', params.roomId);
    if (params?.maintenanceType) queryParams.append('maintenanceType', params.maintenanceType);
    
    const response = await api.get(`/hostel/maintenance?${queryParams.toString()}`);
    return (response.data as HostelMaintenance[]) || [];
  },

  async createHostelMaintenance(data: {
    hostelId: string;
    roomId?: string;
    maintenanceType: MaintenanceType;
    title: string;
    description?: string;
    priority: MaintenancePriority;
    scheduledDate: string;
    cost?: number;
    vendor?: string;
    notes?: string;
  }): Promise<HostelMaintenance> {
    const response = await api.post('/hostel/maintenance', data);
    return (response.data as HostelMaintenance) || {} as HostelMaintenance;
  },

  async updateHostelMaintenance(id: string, data: Partial<HostelMaintenance>): Promise<HostelMaintenance> {
    const response = await api.put(`/hostel/maintenance/${encodeURIComponent(id)}`, data);
    return (response.data as HostelMaintenance) || {} as HostelMaintenance;
  },

  // Reports
  async getHostelReports(params?: {
    hostelId?: string;
    reportType?: HostelReportType;
  }): Promise<HostelReport[]> {
    const queryParams = new URLSearchParams();
    if (params?.hostelId) queryParams.append('hostelId', params.hostelId);
    if (params?.reportType) queryParams.append('reportType', params.reportType);
    
    const response = await api.get(`/hostel/reports?${queryParams.toString()}`);
    return (response.data as HostelReport[]) || [];
  },

  async createHostelReport(data: {
    hostelId: string;
    reportType: HostelReportType;
    title: string;
    parameters?: ReportParameters;
    data: ReportData;
    format?: ReportFormat;
  }): Promise<HostelReport> {
    const response = await api.post('/hostel/reports', data);
    return (response.data as HostelReport) || {} as HostelReport;
  },

  // Statistics
  async getHostelStats(): Promise<HostelStats> {
    const cacheKey = 'hostel-stats';
    const now = Date.now();
    
    // Check if we have cached data
    const cachedEntry = statsCache.get(cacheKey);
    
    if (cachedEntry) {
      const age = now - cachedEntry.timestamp;
      
      // If data is fresh (within cache duration), return cached data
      if (age < CACHE_DURATION) {
        return cachedEntry.data;
      }
      
      // If data is stale but within revalidate window, return stale data and revalidate in background
      if (age < STALE_WHILE_REVALIDATE_DURATION && !cachedEntry.isStale) {
        // Mark as stale to prevent multiple background requests
        cachedEntry.isStale = true;
        
        // Return stale data immediately
        const staleData = cachedEntry.data;
        
        // Revalidate in background (fire and forget)
        this.refreshHostelStats().catch(error => {
          console.warn('Background refresh of hostel stats failed:', error);
        });
        
        return staleData;
      }
    }
    
    // No valid cache, fetch fresh data
    return this.refreshHostelStats();
  },

  // Internal method to refresh stats and update cache
  async refreshHostelStats(): Promise<HostelStats> {
    const cacheKey = 'hostel-stats';
    
    try {
      const response = await api.get('/hostel/stats');
      const freshData = response.data as HostelStats;
      
      // Update cache with fresh data
      statsCache.set(cacheKey, {
        data: freshData,
        timestamp: Date.now(),
        isStale: false
      });
      
      return freshData;
    } catch (error) {
      // If API fails and we have stale data, return it
      const cachedEntry = statsCache.get(cacheKey);
      if (cachedEntry) {
        console.warn('API failed, returning stale hostel stats data:', error);
        return cachedEntry.data;
      }
      
      // No fallback data available, re-throw error
      throw error;
    }
  },
};

export default hostelService;
