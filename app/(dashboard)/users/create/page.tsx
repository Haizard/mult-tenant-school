'use client';

import { useState, useEffect } from 'react';
import { FaUserPlus, FaArrowLeft, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { userService, RegisterData, Role, Tenant } from '../../lib/userService';
import { notificationService } from '../../lib/notifications';
import { errorHandler } from '../../lib/errorHandler';

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

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  tenantId?: string;
  roleIds?: string;
}

// Sample data - replace with API calls
const sampleTenants = [
  { id: '1', name: 'Default School', email: 'admin@schoolsystem.com' },
  { id: '2', name: 'St. Mary\'s Academy', email: 'admin@stmarys.edu' },
  { id: '3', name: 'Kilimanjaro Secondary', email: 'info@kilimanjaro.edu' }
];

const sampleRoles = [
  { id: '1', name: 'Super Admin', description: 'System administrator with full access' },
  { id: '2', name: 'Tenant Admin', description: 'School administrator with tenant-level access' },
  { id: '3', name: 'Teacher', description: 'Teacher with academic access' },
  { id: '4', name: 'Student', description: 'Student with limited access' },
  { id: '5', name: 'Staff', description: 'Non-teaching staff member' }
];

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

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load tenants and roles on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [tenantsResponse, rolesResponse] = await Promise.all([
          userService.getTenants(),
          userService.getRoles(),
        ]);

        setTenants(tenantsResponse);
        setRoles(rolesResponse);
      } catch (error) {
        errorHandler.handleApiError(error, 'Failed to load form data');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    // Tenant validation
    if (!formData.tenantId) {
      newErrors.tenantId = 'Please select a tenant';
    }

    // Role validation
    if (formData.roleIds.length === 0) {
      newErrors.roleIds = 'Please select at least one role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId]
    }));
    
    // Clear role error
    if (errors.roleIds) {
      setErrors(prev => ({ ...prev, roleIds: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const userData: RegisterData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        tenantId: formData.tenantId,
        roleIds: formData.roleIds,
      };

      await userService.createUser(userData);
      
      notificationService.success('User created successfully!');
      
      // Redirect to users list
      window.location.href = '/users';
      
    } catch (error) {
      console.error('Error creating user:', error);
      errorHandler.handleApiError(error, 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // Navigate back to users list
    console.log('Navigate back to users list');
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass-card p-6 bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border-accent-green/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="glass-button p-3 hover:bg-accent-purple/10 hover:text-accent-purple transition-colors"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Create New User</h1>
              <p className="text-text-secondary">Add a new user account to the system</p>
            </div>
          </div>
          <StatusBadge status="info" size="lg">
            <FaUserPlus className="mr-2" />
            New User
          </StatusBadge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card variant="strong" glow="purple">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-accent-purple to-accent-purple-light rounded-lg">
              <FaUserPlus className="text-lg text-white" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`glass-input w-full ${errors.firstName ? 'border-red-500' : ''}`}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`glass-input w-full ${errors.lastName ? 'border-red-500' : ''}`}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`glass-input w-full ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`glass-input w-full ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="glass-input w-full h-20 resize-none"
                placeholder="Enter address"
              />
            </div>
          </div>
        </Card>

        {/* Security Information */}
        <Card variant="strong" glow="blue">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-lg">
              <FaEye className="text-lg text-white" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Security Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`glass-input w-full pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`glass-input w-full pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Tenant and Role Assignment */}
        <Card variant="strong" glow="green">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-accent-green to-accent-green-light rounded-lg">
              <FaUserPlus className="text-lg text-white" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Tenant & Role Assignment</h2>
          </div>

          <div className="space-y-6">
            {/* Tenant Selection */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Select Tenant *
              </label>
              <select
                value={formData.tenantId}
                onChange={(e) => handleInputChange('tenantId', e.target.value)}
                className={`glass-input w-full ${errors.tenantId ? 'border-red-500' : ''}`}
                disabled={loadingData}
              >
                <option value="">Choose a tenant...</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} ({tenant.email})
                  </option>
                ))}
              </select>
              {errors.tenantId && (
                <p className="text-red-500 text-sm mt-1">{errors.tenantId}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Assign Roles *
              </label>
              {loadingData ? (
                <div className="glass-card p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-purple mx-auto"></div>
                  <p className="text-sm text-text-secondary mt-2">Loading roles...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map(role => (
                    <div
                      key={role.id}
                      className={`glass-card p-4 cursor-pointer transition-all duration-200 ${
                        formData.roleIds.includes(role.id)
                          ? 'border-accent-purple bg-accent-purple/10'
                          : 'hover:bg-accent-purple/5'
                      }`}
                      onClick={() => handleRoleToggle(role.id)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.roleIds.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                          className="w-4 h-4 text-accent-purple"
                        />
                        <div>
                          <p className="font-semibold text-text-primary">{role.name}</p>
                          <p className="text-sm text-text-secondary">{role.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.roleIds && (
                <p className="text-red-500 text-sm mt-1">{errors.roleIds}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card variant="default">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={isLoading}
            >
              <FaArrowLeft className="mr-2" />
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
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
        </Card>
      </form>
    </div>
  );
}
