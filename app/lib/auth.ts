// Authentication Service and JWT Token Management
import { apiService } from './api';
import { apiService as attendanceApiService } from '../../lib/apiService';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  lastLogin?: string;
  tenant: {
    id: string;
    name: string;
    email: string;
  };
  roles: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  permissions?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  tenantId: string;
  roleIds: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    this.loadUserFromStorage();
    // Sync token with attendance API service
    const token = apiService.getToken();
    if (token) {
      attendanceApiService.setToken(token);
    }
  }

  private loadUserFromStorage(): void {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData);
        } catch (error) {
          console.error('Error parsing user data from storage:', error);
          this.clearUserData();
        }
      }
    }
  }

  private saveUserData(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
    this.currentUser = user;
  }

  private clearUserData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_data');
    }
    this.currentUser = null;
    apiService.setToken(null);
    attendanceApiService.setToken(null);
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Save token and user data
        apiService.setToken(token);
        attendanceApiService.setToken(token);
        this.saveUserData(user);
        
        return { user, token };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  public async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/register', userData);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Save token and user data
        apiService.setToken(token);
        attendanceApiService.setToken(token);
        this.saveUserData(user);
        
        return { user, token };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local data regardless of API call result
      this.clearUserData();
    }
  }

  public async getCurrentUser(): Promise<User | null> {
    const token = apiService.getToken();
    console.log('Getting current user, token available:', !!token);
    
    if (!this.currentUser && token) {
      try {
        console.log('Fetching user profile from /auth/profile');
        const response = await apiService.get<User>('/auth/profile');
        console.log('Profile API response:', response);
        
        if (response.success && response.data) {
          console.log('Current user data:', response.data);
          console.log('User permissions:', response.data.permissions);
          this.saveUserData(response.data);
          return response.data;
        } else {
          console.error('Failed to get user profile:', response.message);
          this.logout();
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        this.logout();
      }
    } else {
      console.log('Using cached current user:', this.currentUser);
    }
    return this.currentUser;
  }

  public getCurrentUserSync(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return !!(this.currentUser && apiService.getToken());
  }

  public hasPermission(permission: string): boolean {
    if (!this.currentUser?.permissions) return false;
    return this.currentUser.permissions.includes(permission);
  }

  public hasRole(roleName: string): boolean {
    if (!this.currentUser?.roles) return false;
    return this.currentUser.roles.some(role => role.name === roleName);
  }

  public isSuperAdmin(): boolean {
    return this.hasRole('Super Admin');
  }

  public isTenantAdmin(): boolean {
    return this.hasRole('Tenant Admin');
  }

  public isTeacher(): boolean {
    return this.hasRole('Teacher');
  }

  public isStudent(): boolean {
    return this.hasRole('Student');
  }

  public getTenantId(): string | null {
    return this.currentUser?.tenant?.id || null;
  }

  public async refreshToken(): Promise<boolean> {
    try {
      const response = await apiService.post<{ token: string }>('/auth/refresh');
      if (response.success && response.data) {
        apiService.setToken(response.data.token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
    return false;
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiService.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });

    if (!response.success) {
      throw new Error(response.message || 'Password change failed');
    }
  }

  public async forgotPassword(email: string): Promise<void> {
    const response = await apiService.post('/auth/forgot-password', { email });

    if (!response.success) {
      throw new Error(response.message || 'Password reset request failed');
    }
  }

  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiService.post('/auth/reset-password', {
      token,
      newPassword,
    });

    if (!response.success) {
      throw new Error(response.message || 'Password reset failed');
    }
  }
}

export const authService = new AuthService();
export default authService;
