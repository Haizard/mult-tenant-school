'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaLock } from 'react-icons/fa';
import Card from './ui/Card';
import { createPermissionChecker } from '../lib/rolePermissions';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  permissions?: string[];
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  permissions,
  fallback,
  showAccessDenied = true 
}) => {
  const { user } = useAuth();

  // Check if user has any of the allowed roles or permissions
  let hasPermission = false;

  if (!user) {
    hasPermission = false;
  } else {
    const permissionChecker = createPermissionChecker(user);
    
    if (allowedRoles && allowedRoles.length > 0) {
      // Check by role names
      hasPermission = permissionChecker.hasAnyRole(allowedRoles);
    } else if (permissions && permissions.length > 0) {
      // Check by permissions - parse permission strings like "grades:create"
      hasPermission = permissions.some(permission => {
        const [resource, action] = permission.split(':');
        return permissionChecker.hasPermission(resource, action);
      });
    } else {
      // If no roles or permissions specified, allow access
      hasPermission = true;
    }
  }

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
              You don&apos;t have permission to access this page. This feature is restricted to: {
                allowedRoles?.join(', ') || 
                (permissions?.length ? `users with ${permissions.join(', ')} permissions` : 'specific roles')
              }.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-text-secondary">Your current roles:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {user?.roles?.map((role, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full border"
                  >
                    {role?.name || 'Unknown Role'}
                  </span>
                )) || (
                  <span className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full border">
                    No roles assigned
                  </span>
                )}
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
