'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaLock } from 'react-icons/fa';
import Card from './ui/Card';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback,
  showAccessDenied = true 
}) => {
  const { user } = useAuth();

  // Check if user has any of the allowed roles
  const hasPermission = user?.roles?.some(role => allowedRoles.includes(role.name)) || false;

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showAccessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="strong" className="max-w-md text-center">
          <div className="p-8">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FaLock className="text-2xl text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Access Denied</h2>
            <p className="text-text-secondary mb-6">
              You don't have permission to access this page. This feature is restricted to: {allowedRoles.join(', ')}.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-text-secondary">Your current roles:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {user?.roles?.map((role, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full border"
                  >
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default RoleGuard;
