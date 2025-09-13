'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';
import { createPermissionChecker } from '../lib/rolePermissions';

interface RoleBasedButtonProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
  permissions?: string[];
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  fallback?: React.ReactNode;
  icon?: React.ComponentType<any>;
}

const RoleBasedButton: React.FC<RoleBasedButtonProps> = ({ 
  children, 
  allowedRoles = [], 
  permissions = [],
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fallback = null,
  icon: Icon
}) => {
  const { user, isLoading } = useAuth();

  // If still loading, don't show the button
  if (isLoading) {
    return fallback ? <>{fallback}</> : null;
  }
  
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
      // If no roles or permissions specified, show the button
      hasPermission = true;
    }
  }

  if (!hasPermission) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={className}
      icon={Icon}
    >
      {children}
    </Button>
  );
};

export default RoleBasedButton;
