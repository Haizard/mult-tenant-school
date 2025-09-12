'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaEdit, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { userService } from '@/lib/userService';
import { notificationService } from '@/lib/notifications';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  lastLogin?: string;
  createdAt: string;
  tenant: {
    id: string;
    name: string;
    email: string;
  };
  roles: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await userService.getUserById(userId);
      setUser(userData);
    } catch (err) {
      console.error('Error loading user:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user');
      notificationService.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/users/${userId}/edit`);
  };

  const handleBack = () => {
    router.push('/users');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading user details...</p>
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
              <Button onClick={loadUser} variant="primary">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-500 text-6xl mb-4">👤</div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">User Not Found</h2>
              <p className="text-text-secondary mb-4">The requested user could not be found.</p>
              <Button onClick={handleBack} variant="secondary">
                Back to Users
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
              <h1 className="text-3xl font-bold text-text-primary">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-text-secondary">User Details</p>
            </div>
          </div>
          <Button
            onClick={handleEdit}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <FaEdit />
            <span>Edit User</span>
          </Button>
        </div>

        {/* User Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaUser className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Basic Information</h2>
                <p className="text-text-secondary">Personal details and contact information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    First Name
                  </label>
                  <p className="text-text-primary font-medium">{user.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Last Name
                  </label>
                  <p className="text-text-primary font-medium">{user.lastName}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Email Address
                </label>
                <div className="flex items-center space-x-2">
                  <FaEnvelope className="text-text-secondary" />
                  <p className="text-text-primary font-medium">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Phone Number
                  </label>
                  <div className="flex items-center space-x-2">
                    <FaPhone className="text-text-secondary" />
                    <p className="text-text-primary font-medium">{user.phone}</p>
                  </div>
                </div>
              )}

              {user.address && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Address
                  </label>
                  <div className="flex items-start space-x-2">
                    <FaMapMarkerAlt className="text-text-secondary mt-1" />
                    <p className="text-text-primary font-medium">{user.address}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Status and Organization */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <FaShieldAlt className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">Status</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Account Status
                  </label>
                  <StatusBadge status={user.status} />
                </div>
                {user.lastLogin && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Last Login
                    </label>
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-text-secondary" />
                      <p className="text-text-primary font-medium">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Member Since
                  </label>
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-text-secondary" />
                    <p className="text-text-primary font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Organization */}
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <FaUser className="text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">Organization</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    School/Organization
                  </label>
                  <p className="text-text-primary font-medium">{user.tenant.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Organization Email
                  </label>
                  <p className="text-text-primary font-medium">{user.tenant.email}</p>
                </div>
              </div>
            </Card>

            {/* Roles */}
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-full">
                  <FaShieldAlt className="text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">Roles</h3>
              </div>
              <div className="space-y-2">
                {user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <div key={role.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-text-primary">{role.name}</p>
                      <p className="text-sm text-text-secondary">{role.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-text-secondary">No roles assigned</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
