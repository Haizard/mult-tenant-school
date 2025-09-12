'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [], 
  fallbackPath = '/auth/login' 
}) => {
  const { user, isLoading, isAuthenticated, isLoggingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(fallbackPath);
        return;
      }

      if (requiredRoles.length > 0 && user) {
        const userRoles = user.roles.map(role => role.name);
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
        
        if (!hasRequiredRole) {
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [user, isLoading, isAuthenticated, requiredRoles, router, fallbackPath]);

  if (isLoading || isLoggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-purple mx-auto mb-4"></div>
          <p className="text-text-secondary">
            {isLoggingOut ? 'Signing out...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (requiredRoles.length > 0 && user) {
    const userRoles = user.roles.map(role => role.name);
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return null; // Will redirect to unauthorized
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
