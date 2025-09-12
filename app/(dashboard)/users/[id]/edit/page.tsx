'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { userService } from '@/lib/userService';
import { notificationService } from '@/lib/notifications';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  tenantId: string;
  roleIds: string[];
}

interface Tenant {
  id: string;
  name: string;
  email: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    status: 'ACTIVE',
    tenantId: '',
    roleIds: []
  });
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load user data, tenants, and roles in parallel
      const [userData, tenantsData, rolesData] = await Promise.all([
        userService.getUserById(userId),
        userService.getTenants(),
        userService.getRoles()
      ]);
      
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || '',
        address: userData.address || '',
        status: userData.status,
        tenantId: userData.tenant.id,
        roleIds: userData.roles.map(role => role.id)
      });
      
      setTenants(tenantsData);
      setRoles(rolesData);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user data');
      notificationService.error('Failed to load user data');
    } finally {
      setLoading(false);
      setLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    
    try {
      setSaving(true);
      
      // Client-side validation
      if (!formData.firstName.trim()) {
        notificationService.error('First name is required');
        return;
      }
      
      if (!formData.lastName.trim()) {
        notificationService.error('Last name is required');
        return;
      }
      
      if (!formData.email.trim()) {
        notificationService.error('Email is required');
        return;
      }
      
      if (!formData.tenantId) {
        notificationService.error('Please select a tenant');
        return;
      }
      
      if (formData.roleIds.length === 0) {
        notificationService.error('Please select at least one role');
        return;
      }

      notificationService.info('Updating user...');
      
      // Update user
      await userService.updateUser(userId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        status: formData.status,
        tenantId: formData.tenantId,
        roleIds: formData.roleIds
      });
      
      notificationService.success('User updated successfully!');
      router.push(`/users/${userId}`);
      
    } catch (err) {
      console.error('Error updating user:', err);
      notificationService.error(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(`/users/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading user data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Error Loading User</h2>
              <p className="text-text-secondary mb-4">{error}</p>
              <Button onClick={loadUserData} variant="primary">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleBack}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <FaArrowLeft />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Edit User</h1>
              <p className="text-text-secondary">Update user information and settings</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaUser className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Personal Information</h2>
                  <p className="text-text-secondary">Basic user details and contact information</p>
                </div>
              </div>

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
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="glass-input w-full"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="glass-input w-full"
                  placeholder="Enter address"
                />
              </div>
            </div>

            {/* Organization and Roles */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaUser className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Organization & Roles</h2>
                  <p className="text-text-secondary">Assign tenant and user roles</p>
                </div>
              </div>

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
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleBack}
                variant="secondary"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={saving || loadingData}
                className="flex items-center space-x-2"
              >
                <FaSave />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
