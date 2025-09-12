'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';

interface RoleBasedButtonProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  permissions?: string[];
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
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

  // Check if user has any of the allowed roles or permissions
  let hasPermission = false;
  
  // If still loading, don't show the button
  if (isLoading) {
    return fallback ? <>{fallback}</> : null;
  }
  
  // Ensure user and roles exist
  if (!user || !user.roles || !Array.isArray(user.roles)) {
    hasPermission = false;
  } else if (allowedRoles && allowedRoles.length > 0) {
    hasPermission = user.roles.some(role => 
      role && role.name && allowedRoles.includes(role.name)
    );
  } else if (permissions && permissions.length > 0) {
    // For permissions, we need to check if user has the required permissions
    // This is a simplified check - in a real app, you'd check against user's actual permissions
    hasPermission = user.roles.some(role => 
      role && role.name && (
        role.name === 'Super Admin' || 
        role.name === 'Tenant Admin' || 
        (role.name === 'Teacher' && permissions.some(p => p.includes('grades'))) ||
        (role.name === 'Student' && permissions.some(p => p.includes('read')))
      )
    );
  } else {
    // If no roles or permissions specified, show the button
    hasPermission = true;
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
