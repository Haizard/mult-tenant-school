'use client';

import { useState, useEffect } from 'react';
import { FaUserPlus, FaArrowLeft, FaSave } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { userService, Tenant, Role } from '@/lib/userService';
import { RegisterData } from '@/lib/auth';
import { notificationService } from '@/lib/notifications';
import { errorHandler } from '@/lib/errorHandler';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  tenantId: string;
  roleIds: string[];
}

export default function CreateUserPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    tenantId: '',
    roleIds: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load tenants and roles on component mount
  useEffect(() => {
    const loadData = async () => {
      console.log('Loading tenants and roles...');
      try {
        const [tenantsData, rolesData] = await Promise.all([
          userService.getTenants(),
          userService.getRoles()
        ]);
        console.log('Loaded tenants:', tenantsData);
        console.log('Loaded roles:', rolesData);
        setTenants(tenantsData);
        setRoles(rolesData);
      } catch (error) {
        console.error('Error loading form data:', error);
        errorHandler.handleApiError(error, 'Failed to load form data');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      roleIds: selectedOptions
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      console.log('Password validation failed');
      notificationService.error('Passwords do not match');
      return;
    }
    
    if (!formData.tenantId) {
      console.log('Tenant validation failed');
      notificationService.error('Please select a tenant');
      return;
    }
    
    if (formData.roleIds.length === 0) {
      console.log('Role validation failed');
      notificationService.error('Please select at least one role');
      return;
    }

    console.log('Starting user creation...');
    setIsLoading(true);
    const toastId = notificationService.loading('Creating user...');
    
    try {
      const userData: RegisterData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        tenantId: formData.tenantId,
        roleIds: formData.roleIds
      };

      console.log('Sending user data:', userData);
      const result = await userService.createUser(userData);
      console.log('User creation result:', result);
      
      notificationService.updateToSuccess(toastId, 'User created successfully!');
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        tenantId: '',
        roleIds: []
      });
      
      // Navigate back to users list after a short delay
      setTimeout(() => {
        window.location.href = '/users';
      }, 1500);
      
    } catch (error) {
      console.error('User creation error:', error);
      notificationService.updateToError(toastId, 'Failed to create user');
      errorHandler.handleApiError(error, 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Create New User</h1>
            <p className="text-text-secondary">Add a new user to the system</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status="info" size="lg">
              New User
            </StatusBadge>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card variant="strong" glow="purple">
        <form onSubmit={handleSubmit} className="space-y-6" onClick={() => console.log('Form clicked!')}>
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="glass-input w-full"
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="glass-input w-full"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="glass-input w-full"
                placeholder="Enter email address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="glass-input w-full"
                  placeholder="Enter password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="glass-input w-full"
                  placeholder="Confirm password"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="glass-input w-full"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="glass-input w-full"
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          {/* Tenant and Role Assignment */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary">Tenant & Role Assignment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tenant * <span className="text-text-muted">(School/Organization)</span>
                </label>
                <select
                  name="tenantId"
                  value={formData.tenantId}
                  onChange={handleInputChange}
                  required
                  className="glass-input w-full"
                  disabled={loadingData}
                >
                  <option value="">Select a tenant</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Roles * <span className="text-text-muted">(Hold Ctrl to select multiple)</span>
                </label>
                <select
                  name="roleIds"
                  value={formData.roleIds}
                  onChange={handleRoleChange}
                  required
                  multiple
                  className="glass-input w-full h-24"
                  disabled={loadingData}
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
                {formData.roleIds.length > 0 && (
                  <p className="text-sm text-text-secondary mt-1">
                    Selected: {formData.roleIds.length} role(s)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-white/20">
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.history.back()}
            >
              <FaArrowLeft className="mr-2" />
              Back
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              onClick={() => console.log('Button clicked!')}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}