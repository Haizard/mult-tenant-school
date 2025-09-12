// Tenant Service for managing tenants and tenant operations
import { apiService } from './api';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TRIAL';
  adminEmail: string;
  adminName: string;
  createdAt: string;
  userCount: number;
  subscriptionPlan: string;
  lastActivity: string;
  subscriptionExpiry?: string;
  maxUsers: number;
  features: string[];
  address?: string;
  phone?: string;
  email?: string;
  type?: string;
  timezone?: string;
  language?: string;
  currency?: string;
}

export interface CreateTenantData {
  name: string;
  domain: string;
  address: string;
  phone: string;
  email: string;
  type: string;
  subscriptionPlan: string;
  maxUsers: number;
  features: string[];
  timezone: string;
  language: string;
  currency: string;
}

export interface CreateAdminData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  tenantId?: string;
}

class TenantService {
  // Get all tenants
  async getTenants(): Promise<Tenant[]> {
    try {
      const response = await apiService.get('/tenants');
      return (response.data as Tenant[]) || [];
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw new Error('Failed to fetch tenants');
    }
  }

  // Create a new tenant
  async createTenant(tenantData: CreateTenantData, adminData: CreateAdminData): Promise<Tenant> {
    try {
      const requestData = {
        ...tenantData,
        adminFirstName: adminData.firstName,
        adminLastName: adminData.lastName,
        adminEmail: adminData.email,
        adminPhone: adminData.phone,
        adminPassword: adminData.password
      };

      const response = await apiService.post('/tenants', requestData);
      console.log('Tenant created successfully:', response.data);
      return response.data as Tenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw new Error('Failed to create tenant');
    }
  }

  // Update tenant status
  async updateTenantStatus(tenantId: string, status: Tenant['status']): Promise<Tenant> {
    try {
      const response = await apiService.put(`/tenants/${tenantId}/status`, { status });
      return response.data as Tenant;
    } catch (error) {
      console.error('Error updating tenant status:', error);
      throw new Error('Failed to update tenant status');
    }
  }

  // Update tenant information
  async updateTenant(tenantId: string, updateData: Partial<Tenant>): Promise<Tenant> {
    try {
      const response = await apiService.put(`/tenants/${tenantId}`, updateData);
      return response.data as Tenant;
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw new Error('Failed to update tenant');
    }
  }

  // Delete tenant
  async deleteTenant(tenantId: string): Promise<void> {
    try {
      await apiService.delete(`/tenants/${tenantId}`);
      console.log('Tenant deleted successfully');
    } catch (error) {
      console.error('Error deleting tenant:', error);
      throw new Error('Failed to delete tenant');
    }
  }
}

// Create singleton instance
export const tenantService = new TenantService();
