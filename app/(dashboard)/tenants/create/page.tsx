'use client';

import React, { useState } from 'react';
import { FaBuilding, FaUserShield, FaSave, FaTimes, FaInfoCircle } from 'react-icons/fa';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import StatusBadge from '../../../components/ui/StatusBadge';
import RoleGuard from '../../../components/RoleGuard';
import { useAuth } from '../../../contexts/AuthContext';
import { useAuditLog } from '../../../hooks/useAuditLog';
import { tenantService, CreateTenantData, CreateAdminData } from '../../../lib/tenantService';

interface TenantFormData {
  // School Information
  schoolName: string;
  schoolDomain: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolType: 'PRIMARY' | 'SECONDARY' | 'COLLEGE' | 'UNIVERSITY';
  
  // Admin Information
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword: string;
  confirmPassword: string;
  
  // Subscription Information
  subscriptionPlan: 'TRIAL' | 'BASIC' | 'STANDARD' | 'PREMIUM';
  maxUsers: number;
  features: string[];
  
  // Additional Settings
  timezone: string;
  language: string;
  currency: string;
}

const CreateTenantPage: React.FC = () => {
  const { user } = useAuth();
  const auditLog = useAuditLog();
  const [formData, setFormData] = useState<TenantFormData>({
    schoolName: '',
    schoolDomain: '',
    schoolAddress: '',
    schoolPhone: '',
    schoolEmail: '',
    schoolType: 'SECONDARY',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    confirmPassword: '',
    subscriptionPlan: 'TRIAL',
    maxUsers: 100,
    features: ['Basic Features'],
    timezone: 'Africa/Dar_es_Salaam',
    language: 'en',
    currency: 'TZS'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const subscriptionPlans = {
    TRIAL: { name: 'Trial', maxUsers: 100, features: ['Basic Features'], duration: '30 days' },
    BASIC: { name: 'Basic', maxUsers: 500, features: ['Basic Features', 'Email Support'], duration: '1 year' },
    STANDARD: { name: 'Standard', maxUsers: 1000, features: ['Basic Features', 'Email Support', 'Advanced Analytics'], duration: '1 year' },
    PREMIUM: { name: 'Premium', maxUsers: 2000, features: ['All Features', 'Priority Support', 'Custom Branding', 'API Access'], duration: '1 year' }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // School Information Validation
    if (!formData.schoolName.trim()) newErrors.schoolName = 'School name is required';
    if (!formData.schoolDomain.trim()) newErrors.schoolDomain = 'School domain is required';
    if (!formData.schoolEmail.trim()) newErrors.schoolEmail = 'School email is required';
    if (!formData.schoolAddress.trim()) newErrors.schoolAddress = 'School address is required';

    // Admin Information Validation
    if (!formData.adminFirstName.trim()) newErrors.adminFirstName = 'Admin first name is required';
    if (!formData.adminLastName.trim()) newErrors.adminLastName = 'Admin last name is required';
    if (!formData.adminEmail.trim()) newErrors.adminEmail = 'Admin email is required';
    if (!formData.adminPassword.trim()) newErrors.adminPassword = 'Admin password is required';
    if (formData.adminPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.adminPassword.length < 8) {
      newErrors.adminPassword = 'Password must be at least 8 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      // School Information Validation
      if (!formData.schoolName.trim()) newErrors.schoolName = 'School name is required';
      if (!formData.schoolDomain.trim()) newErrors.schoolDomain = 'School domain is required';
      if (!formData.schoolEmail.trim()) newErrors.schoolEmail = 'School email is required';
      if (!formData.schoolAddress.trim()) newErrors.schoolAddress = 'School address is required';
    } else if (currentStep === 2) {
      // Admin Information Validation
      if (!formData.adminFirstName.trim()) newErrors.adminFirstName = 'Admin first name is required';
      if (!formData.adminLastName.trim()) newErrors.adminLastName = 'Admin last name is required';
      if (!formData.adminEmail.trim()) newErrors.adminEmail = 'Admin email is required';
      if (!formData.adminPassword.trim()) newErrors.adminPassword = 'Admin password is required';
      if (formData.adminPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (formData.adminPassword.length < 8) {
        newErrors.adminPassword = 'Password must be at least 8 characters long';
      }
    }
    // Steps 3 and 4 don't require validation (subscription selection and review)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof TenantFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Prepare tenant data
      const tenantData: CreateTenantData = {
        name: formData.schoolName,
        domain: formData.schoolDomain,
        address: formData.schoolAddress,
        phone: formData.schoolPhone,
        email: formData.schoolEmail,
        type: formData.schoolType,
        subscriptionPlan: formData.subscriptionPlan,
        maxUsers: formData.maxUsers,
        features: formData.features,
        timezone: formData.timezone,
        language: formData.language,
        currency: formData.currency
      };

      const adminData: CreateAdminData = {
        firstName: formData.adminFirstName,
        lastName: formData.adminLastName,
        email: formData.adminEmail,
        phone: formData.adminPhone,
        password: formData.adminPassword,
        role: 'Tenant Admin'
      };

      // Create tenant using the service
      const newTenant = await tenantService.createTenant(tenantData, adminData);

      // Validate the response
      if (!newTenant || !newTenant.id) {
        throw new Error('Failed to create tenant: Invalid response from server');
      }

      // Log the action
      await auditLog.logAction('TENANT_CREATED', 'tenant', newTenant.id, {
        tenantName: formData.schoolName,
        adminEmail: formData.adminEmail,
        subscriptionPlan: formData.subscriptionPlan
      });

      // Show success message
      alert(`Tenant "${formData.schoolName}" created successfully!`);

      // Redirect to tenants list
      window.location.href = '/tenants';
    } catch (error) {
      console.error('Error creating tenant:', error);
      await auditLog.logAction('TENANT_CREATION_FAILED', 'tenant', undefined, {
        tenantName: formData.schoolName,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'FAILURE');
      
      // Show error message
      alert(`Failed to create tenant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">School Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School Name *
          </label>
          <input
            type="text"
            value={formData.schoolName}
            onChange={(e) => handleInputChange('schoolName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.schoolName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., St. Mary's Secondary School"
          />
          {errors.schoolName && <p className="text-red-500 text-sm mt-1">{errors.schoolName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School Domain *
          </label>
          <input
            type="text"
            value={formData.schoolDomain}
            onChange={(e) => handleInputChange('schoolDomain', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.schoolDomain ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., stmarys.schooli.com"
          />
          {errors.schoolDomain && <p className="text-red-500 text-sm mt-1">{errors.schoolDomain}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School Type
          </label>
          <select
            value={formData.schoolType}
            onChange={(e) => handleInputChange('schoolType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="PRIMARY">Primary School</option>
            <option value="SECONDARY">Secondary School</option>
            <option value="COLLEGE">College</option>
            <option value="UNIVERSITY">University</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School Email *
          </label>
          <input
            type="email"
            value={formData.schoolEmail}
            onChange={(e) => handleInputChange('schoolEmail', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.schoolEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="info@school.edu"
          />
          {errors.schoolEmail && <p className="text-red-500 text-sm mt-1">{errors.schoolEmail}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School Address *
          </label>
          <textarea
            value={formData.schoolAddress}
            onChange={(e) => handleInputChange('schoolAddress', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.schoolAddress ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={3}
            placeholder="Full school address"
          />
          {errors.schoolAddress && <p className="text-red-500 text-sm mt-1">{errors.schoolAddress}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School Phone
          </label>
          <input
            type="tel"
            value={formData.schoolPhone}
            onChange={(e) => handleInputChange('schoolPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+255 XXX XXX XXX"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Admin User Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.adminFirstName}
            onChange={(e) => handleInputChange('adminFirstName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.adminFirstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="John"
          />
          {errors.adminFirstName && <p className="text-red-500 text-sm mt-1">{errors.adminFirstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.adminLastName}
            onChange={(e) => handleInputChange('adminLastName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.adminLastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Smith"
          />
          {errors.adminLastName && <p className="text-red-500 text-sm mt-1">{errors.adminLastName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Email *
          </label>
          <input
            type="email"
            value={formData.adminEmail}
            onChange={(e) => handleInputChange('adminEmail', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.adminEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="admin@school.edu"
          />
          {errors.adminEmail && <p className="text-red-500 text-sm mt-1">{errors.adminEmail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Phone
          </label>
          <input
            type="tel"
            value={formData.adminPhone}
            onChange={(e) => handleInputChange('adminPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+255 XXX XXX XXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Password *
          </label>
          <input
            type="password"
            value={formData.adminPassword}
            onChange={(e) => handleInputChange('adminPassword', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.adminPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Minimum 8 characters"
          />
          {errors.adminPassword && <p className="text-red-500 text-sm mt-1">{errors.adminPassword}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Confirm password"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Subscription Plan</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(subscriptionPlans).map(([key, plan]) => (
          <div
            key={key}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.subscriptionPlan === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleInputChange('subscriptionPlan', key)}
          >
            <div className="text-center">
              <h4 className="font-semibold text-gray-900">{plan.name}</h4>
              <p className="text-2xl font-bold text-blue-600 mt-2">{plan.maxUsers}</p>
              <p className="text-sm text-gray-600">Max Users</p>
              <p className="text-xs text-gray-500 mt-2">{plan.duration}</p>
              <div className="mt-3">
                {plan.features.map((feature, index) => (
                  <p key={index} className="text-xs text-gray-600">• {feature}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Review & Create</h3>
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-4">School Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Name:</strong> {formData.schoolName}</div>
          <div><strong>Domain:</strong> {formData.schoolDomain}</div>
          <div><strong>Type:</strong> {formData.schoolType}</div>
          <div><strong>Email:</strong> {formData.schoolEmail}</div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-4">Admin User</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Name:</strong> {formData.adminFirstName} {formData.adminLastName}</div>
          <div><strong>Email:</strong> {formData.adminEmail}</div>
          <div><strong>Role:</strong> Tenant Admin</div>
          <div><strong>Phone:</strong> {formData.adminPhone || 'Not provided'}</div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-4">Subscription</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Plan:</strong> {subscriptionPlans[formData.subscriptionPlan].name}</div>
          <div><strong>Max Users:</strong> {formData.maxUsers}</div>
          <div><strong>Duration:</strong> {subscriptionPlans[formData.subscriptionPlan].duration}</div>
          <div><strong>Features:</strong> {subscriptionPlans[formData.subscriptionPlan].features.join(', ')}</div>
        </div>
      </div>
    </div>
  );

  return (
    <RoleGuard allowedRoles={['Super Admin']}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Tenant</h1>
            <p className="text-gray-600 mt-1">Set up a new school with admin user</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/tenants'}
            className="flex items-center"
          >
            <FaTimes className="mr-2" />
            Cancel
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>School Info</span>
            <span>Admin User</span>
            <span>Subscription</span>
            <span>Review</span>
          </div>
        </div>

        <Card>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className="flex justify-between mt-8">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading} className="flex items-center">
                <FaSave className="mr-2" />
                {isLoading ? 'Creating...' : 'Create Tenant'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </RoleGuard>
  );
};

export default CreateTenantPage;
