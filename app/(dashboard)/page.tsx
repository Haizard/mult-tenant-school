'use client';

import { useAuth } from '../contexts/AuthContext';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import SuperAdminDashboard from '../components/dashboard/SuperAdminDashboard';
import TenantAdminDashboard from '../components/dashboard/TenantAdminDashboard';
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaSignOutAlt } from 'react-icons/fa';

export default function Home() {
  const { user, logout, isLoggingOut } = useAuth();

  const getUserRole = () => {
    if (!user || !user.roles || user.roles.length === 0) {
      return 'student'; // Default fallback
    }

    const roleNames = user.roles.map(role => role.name);
    
    // Priority order: Super Admin > Tenant Admin > Teacher > Student
    if (roleNames.includes('Super Admin')) return 'super-admin';
    if (roleNames.includes('Tenant Admin')) return 'tenant-admin';
    if (roleNames.includes('Teacher')) return 'teacher';
    if (roleNames.includes('Student')) return 'student';
    
    return 'student'; // Default fallback
  };

  const renderDashboard = () => {
    const userRole = getUserRole();
    
    switch (userRole) {
      case 'student':
        return <StudentDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'super-admin':
        return <SuperAdminDashboard />;
      case 'tenant-admin':
        return <TenantAdminDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // No need to manually redirect - AuthContext handles it
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* User Info Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Welcome, {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-text-secondary">
              {user?.roles?.map(role => role.name).join(', ')} • {user?.tenant?.name}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="glass-button flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                Signing out...
              </>
            ) : (
              <>
                <FaSignOutAlt />
                Logout
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      {renderDashboard()}
    </div>
  );
}
