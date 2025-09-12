'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaBuilding, FaUserShield, FaSave, FaTimes, FaEdit, FaEye } from 'react-icons/fa';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import StatusBadge from '../../../components/ui/StatusBadge';
import RoleGuard from '../../../components/RoleGuard';
import { useAuth } from '../../../contexts/AuthContext';
import { useAuditLog } from '../../../hooks/useAuditLog';
import { tenantService, Tenant } from '../../../lib/tenantService';

const TenantDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const auditLog = useAuditLog();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    address: '',
    phone: '',
    email: '',
    type: '',
    subscriptionPlan: '',
    maxUsers: 0,
    features: [] as string[],
    timezone: '',
    language: '',
    currency: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tenantId = params.id as string;

  useEffect(() => {
    loadTenant();
  }, [tenantId]);

  const loadTenant = async () => {
    setIsLoading(true);
    try {
      const tenants = await tenantService.getTenants();
      const foundTenant = tenants.find(t => t.id === tenantId);
      
      if (foundTenant) {
        setTenant(foundTenant);
        setFormData({
          name: foundTenant.name || '',
          domain: foundTenant.domain || '',
          address: foundTenant.address || '',
          phone: foundTenant.phone || '',
          email: foundTenant.email || '',
          type: foundTenant.type || '',
          subscriptionPlan: foundTenant.subscriptionPlan || '',
          maxUsers: foundTenant.maxUsers || 0,
          features: foundTenant.features || [],
          timezone: foundTenant.timezone || '',
          language: foundTenant.language || '',
          currency: foundTenant.currency || ''
        });
      } else {
        console.error('Tenant not found');
        router.push('/tenants');
      }
    } catch (error) {
      console.error('Error loading tenant:', error);
      router.push('/tenants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'School name is required';
    if (!formData.domain.trim()) newErrors.domain = 'School domain is required';
    if (!formData.email.trim()) newErrors.email = 'School email is required';
    if (!formData.address.trim()) newErrors.address = 'School address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !tenant) return;

    try {
      // Update tenant using the service
      const updatedTenant = await tenantService.updateTenant(tenant.id, {
        name: formData.name,
        domain: formData.domain,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        type: formData.type,
        subscriptionPlan: formData.subscriptionPlan,
        maxUsers: formData.maxUsers,
        features: formData.features,
        timezone: formData.timezone,
        language: formData.language,
        currency: formData.currency
      });

      // Update local state
      setTenant(updatedTenant);

      await auditLog.logAction('TENANT_UPDATED', 'tenant', tenant.id, {
        tenantName: formData.name,
        changes: formData
      });

      setIsEditing(false);
      alert('Tenant updated successfully!');
    } catch (error) {
      console.error('Error updating tenant:', error);
      await auditLog.logAction('TENANT_UPDATE_FAILED', 'tenant', tenant.id, {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'FAILURE');
      alert('Failed to update tenant');
    }
  };

  const handleCancel = () => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        domain: tenant.domain || '',
        address: tenant.address || '',
        phone: tenant.phone || '',
        email: tenant.email || '',
        type: tenant.type || '',
        subscriptionPlan: tenant.subscriptionPlan || '',
        maxUsers: tenant.maxUsers || 0,
        features: tenant.features || [],
        timezone: tenant.timezone || '',
        language: tenant.language || '',
        currency: tenant.currency || ''
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'SUSPENDED':
        return 'danger';
      case 'TRIAL':
        return 'info';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['Super Admin']}>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading tenant details...</div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (!tenant) {
    return (
      <RoleGuard allowedRoles={['Super Admin']}>
        <div className="p-6">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tenant Not Found</h1>
            <p className="text-gray-600 mb-6">The tenant you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/tenants')}>
              Back to Tenants
            </Button>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['Super Admin']}>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Tenant' : 'Tenant Details'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update tenant information' : 'View tenant information'}
            </p>
          </div>
          <div className="flex space-x-2">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex items-center"
              >
                <FaEdit className="mr-2" />
                Edit Tenant
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  className="flex items-center"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex items-center"
                >
                  <FaSave className="mr-2" />
                  Save Changes
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              onClick={() => router.push('/tenants')}
              className="flex items-center"
            >
              <FaTimes className="mr-2" />
              Back to Tenants
            </Button>
          </div>
        </div>

        {/* Tenant Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <div className="flex items-center mb-4">
              <FaBuilding className="text-blue-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <div className="text-gray-900">{tenant.name}</div>
                )}
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.domain ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <div className="text-gray-900">{tenant.domain}</div>
                )}
                {errors.domain && <p className="text-red-500 text-sm mt-1">{errors.domain}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Type
                </label>
                {isEditing ? (
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PRIMARY">Primary School</option>
                    <option value="SECONDARY">Secondary School</option>
                    <option value="COLLEGE">College</option>
                    <option value="UNIVERSITY">University</option>
                  </select>
                ) : (
                  <div className="text-gray-900">{tenant.type}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Email *
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                ) : (
                  <div className="text-gray-900">{tenant.email}</div>
                )}
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Address *
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={3}
                  />
                ) : (
                  <div className="text-gray-900">{tenant.address}</div>
                )}
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-900">{tenant.phone || 'Not provided'}</div>
                )}
              </div>
            </div>
          </Card>

          {/* Admin & Subscription Information */}
          <Card>
            <div className="flex items-center mb-4">
              <FaUserShield className="text-green-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Admin & Subscription</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Name
                </label>
                <div className="text-gray-900">{tenant.adminName}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email
                </label>
                <div className="text-gray-900">{tenant.adminEmail}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <StatusBadge status={getStatusColor(tenant.status) as any}>
                  {tenant.status}
                </StatusBadge>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Plan
                </label>
                {isEditing ? (
                  <select
                    value={formData.subscriptionPlan}
                    onChange={(e) => handleInputChange('subscriptionPlan', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="TRIAL">Trial</option>
                    <option value="BASIC">Basic</option>
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                ) : (
                  <div className="text-gray-900">{tenant.subscriptionPlan}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Users
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => handleInputChange('maxUsers', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-900">{tenant.maxUsers}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Users
                </label>
                <div className="text-gray-900">{tenant.userCount}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created Date
                </label>
                <div className="text-gray-900">{new Date(tenant.createdAt).toLocaleDateString()}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Activity
                </label>
                <div className="text-gray-900">{new Date(tenant.lastActivity).toLocaleDateString()}</div>
              </div>

              {tenant.subscriptionExpiry && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription Expiry
                  </label>
                  <div className="text-gray-900">{new Date(tenant.subscriptionExpiry).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
};

export default TenantDetailPage;
