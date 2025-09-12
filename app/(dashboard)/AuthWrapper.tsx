'use client';

import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, isLoading, isAuthenticated, isLoggingOut } = useAuth();

  useEffect(() => {
    // Immediate redirect if not authenticated (no router.push delay)
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
  }, [isLoading, isAuthenticated]);

  // Show loading screen while checking authentication or during logout
  if (isLoading || isLoggingOut || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-purple mx-auto mb-4"></div>
          <p className="text-text-secondary">
            {isLoggingOut ? 'Signing out...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Only render dashboard layout if authenticated
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 relative">
        <Header />
        <div className="mt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
