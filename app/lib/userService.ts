// User Management Service
import { apiService, PaginatedResponse } from './api';
import { User, RegisterData } from './auth';

export interface UserFilters {
  search?: string;
  status?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  tenantId?: string;
  roleIds?: string[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  createdAt: string;
  permissions: Array<{
    id: string;
    name: string;
    description?: string;
    resource: string;
    action: string;
  }>;
  userCount: number;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
}

class UserService {
  // User Management
  public async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User[]>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.role) params.append('role', filters.role);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    
    return apiService.get<User[]>(endpoint);
  }

  public async getTeachers(filters: { search?: string; page?: number; limit?: number } = {}): Promise<PaginatedResponse<User[]>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/users/teachers${queryString ? `?${queryString}` : ''}`;
    
    return apiService.get<User[]>(endpoint);
  }

  public async getUserById(userId: string): Promise<User> {
    const response = await apiService.get<User>(`/users/${userId}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch user');
    }
    
    return response.data;
  }

  public async createUser(userData: RegisterData): Promise<User> {
    const response = await apiService.post<User>('/users', userData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create user');
    }
    
    return response.data;
  }

  public async updateUser(userId: string, userData: UserUpdateData): Promise<User> {
    const response = await apiService.put<User>(`/users/${userId}`, userData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update user');
    }
    
    return response.data;
  }

  public async deleteUser(userId: string): Promise<void> {
    const response = await apiService.delete(`/users/${userId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete user');
    }
  }

  // Role Management
  public async getRoles(): Promise<Role[]> {
    const response = await apiService.get<Role[]>('/users/roles');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch roles');
    }
    
    return response.data;
  }

  public async createRole(roleData: {
    name: string;
    description?: string;
    permissionIds?: string[];
  }): Promise<Role> {
    const response = await apiService.post<Role>('/roles', roleData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create role');
    }
    
    return response.data;
  }

  public async updateRole(roleId: string, roleData: {
    name?: string;
    description?: string;
    permissionIds?: string[];
  }): Promise<Role> {
    const response = await apiService.put<Role>(`/roles/${roleId}`, roleData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update role');
    }
    
    return response.data;
  }

  public async deleteRole(roleId: string): Promise<void> {
    const response = await apiService.delete(`/roles/${roleId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete role');
    }
  }

  // Permission Management
  public async getPermissions(): Promise<{
    permissions: Permission[];
    groupedPermissions: Record<string, Permission[]>;
  }> {
    const response = await apiService.get<{
      permissions: Permission[];
      groupedPermissions: Record<string, Permission[]>;
    }>('/permissions');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch permissions');
    }
    
    return response.data;
  }

  // Tenant Management
  public async getTenants(): Promise<Tenant[]> {
    const response = await apiService.get<Tenant[]>('/users/tenants');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch tenants');
    }
    
    return response.data;
  }

  public async createTenant(tenantData: {
    name: string;
    email: string;
  }): Promise<Tenant> {
    const response = await apiService.post<Tenant>('/tenants', tenantData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create tenant');
    }
    
    return response.data;
  }

  public async updateTenant(tenantId: string, tenantData: {
    name?: string;
    email?: string;
  }): Promise<Tenant> {
    const response = await apiService.put<Tenant>(`/tenants/${tenantId}`, tenantData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update tenant');
    }
    
    return response.data;
  }

  public async deleteTenant(tenantId: string): Promise<void> {
    const response = await apiService.delete(`/tenants/${tenantId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete tenant');
    }
  }

  // User Statistics
  public async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    suspendedUsers: number;
    pendingUsers: number;
    usersByRole: Record<string, number>;
  }> {
    const response = await apiService.get<{
      totalUsers: number;
      activeUsers: number;
      inactiveUsers: number;
      suspendedUsers: number;
      pendingUsers: number;
      usersByRole: Record<string, number>;
    }>('/users/stats');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch user statistics');
    }
    
    return response.data;
  }
}

export const userService = new UserService();
export default userService;
