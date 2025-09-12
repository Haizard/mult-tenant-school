'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';

interface RoleBasedButtonProps {
  children: React.ReactNode;
  allowedRoles: string[];
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  fallback?: React.ReactNode;
}

const RoleBasedButton: React.FC<RoleBasedButtonProps> = ({ 
  children, 
  allowedRoles, 
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fallback = null
}) => {
  const { user } = useAuth();

  // Check if user has any of the allowed roles
  const hasPermission = user?.roles?.some(role => allowedRoles.includes(role.name)) || false;

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
    >
      {children}
    </Button>
  );
};

export default RoleBasedButton;
