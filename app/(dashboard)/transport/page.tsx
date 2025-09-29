"use client";

import { useState, useEffect } from "react";
import {
  FaBus,
  FaCar,
  FaUsers,
  FaRoute,
  FaPlus,
  FaChartBar,
  FaTools,
  FaExclamationTriangle,
  FaGasPump,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaShieldAlt,
  FaBell,
  FaArrowUp,
  FaArrowDown,
  FaChartArea,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";
// Using CSS animations instead of framer-motion
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RoleGuard from "@/components/RoleGuard";
import RoleBasedButton from "@/components/RoleBasedButton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import transportService from "@/lib/transportService";

export default function TransportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    routes: { total: 0, active: 0, inactive: 0 },
    vehicles: { total: 0, active: 0, inactive: 0 },
    drivers: { total: 0, active: 0, inactive: 0 },
    students: { total: 0, active: 0, inactive: 0 },
    maintenance: { pending: 0, overdue: 0 },
    incidents: { recent: 0 },
    alerts: { expiringSoon: 0 },
    financial: { monthlyFuelCost: 0, monthlyRevenue: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check user permissions
  const canManageTransport =
    user?.roles?.some((role) => 
      ["Super Admin", "Tenant Admin", "Transport Staff"].includes(role.name)
    ) || false;

  const canViewTransport =
    user?.roles?.some((role) =>
      ["Super Admin", "Tenant Admin", "Transport Staff", "Student", "Parent"].includes(role.name)
    ) || false;

  useEffect(() => {
    if (canViewTransport) {
      loadTransportStats();
    }
  }, [canViewTransport]);

  const loadTransportStats = async () => {
    try {
      setIsLoading(true);
      const response = await transportService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading transport stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // CSS animations instead of framer-motion
  const fadeInUp = "animate-fade-in-up";
  const staggeredAnimation = "animate-staggered";

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color, bgGradient }: any) => (
    <div className="animate-fade-in-up">
      <Card className={`p-6 relative overflow-hidden ${bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <Icon className="w-full h-full" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
              <Icon className={`text-2xl ${color}`} />
            </div>
            {trend && (
              <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend > 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-1">{title}</p>
            <p className={`text-3xl font-bold ${color} mb-2`}>
              {isLoading ? "..." : value}
            </p>
            <p className="text-xs text-text-secondary">{subtitle}</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const QuickActionCard = ({ icon: Icon, title, description, color, onClick }: any) => (
    <div className="animate-fade-in-up">
      <Card 
        className="p-6 cursor-pointer group hover:shadow-lg transition-all duration-300 border-l-4 border-transparent hover:border-accent-blue"
        onClick={onClick}
      >
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full ${color} bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300`}>
            <Icon className={`text-xl ${color}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
              {title}
            </h3>
            <p className="text-sm text-text-secondary mt-1">{description}</p>
          </div>
          <div className="text-text-secondary group-hover:text-accent-blue transition-colors">
            →
          </div>
        </div>
      </Card>
    </div>
  );

  const AlertCard = ({ type, title, message, count, color, icon: Icon, onClick }: any) => (
    <div className="animate-fade-in-up">
      <Card className={`p-4 border-l-4 ${color} bg-opacity-5 hover:bg-opacity-10 transition-all cursor-pointer`} onClick={onClick}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className={`text-lg ${color}`} />
            <div>
              <h4 className="font-medium text-text-primary">{title}</h4>
              <p className="text-sm text-text-secondary">{message}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${color} bg-opacity-20`}>
            {count}
          </div>
        </div>
      </Card>
    </div>
  );

  if (!canViewTransport) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <FaExclamationTriangle className="text-6xl text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Access Denied
          </h2>
          <p className="text-text-secondary">
            You don't have permission to access the transport management system.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="animate-fade-in-up">
        <Card className="p-8 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-green-600/10 border-0 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-text-primary mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Transport Management
              </h1>
              <p className="text-lg text-text-secondary">
                {canManageTransport
                  ? "Comprehensive transport operations, fleet management, and student services"
                  : "View your transport schedules, routes, and important updates"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {canManageTransport && (
                <RoleBasedButton
                  allowedRoles={["Super Admin", "Tenant Admin", "Transport Staff"]}
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                  onClick={() => router.push("/transport/routes/create")}
                >
                  <FaPlus className="mr-2" />
                  New Route
                </RoleBasedButton>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={FaRoute}
            title="Active Routes"
            value={stats.routes.active}
            subtitle={`${stats.routes.total} total routes`}
            color="text-blue-500"
            bgGradient="bg-gradient-to-br from-blue-500/10 to-blue-600/10"
            trend={5}
          />
          <StatCard
            icon={FaBus}
            title="Fleet Vehicles"
            value={stats.vehicles.active}
            subtitle={`${stats.vehicles.total} total vehicles`}
            color="text-green-500"
            bgGradient="bg-gradient-to-br from-green-500/10 to-green-600/10"
            trend={2}
          />
          <StatCard
            icon={FaUsers}
            title="Active Drivers"
            value={stats.drivers.active}
            subtitle={`${stats.drivers.total} total drivers`}
            color="text-purple-500"
            bgGradient="bg-gradient-to-br from-purple-500/10 to-purple-600/10"
            trend={3}
          />
          <StatCard
            icon={FaCar}
            title="Students"
            value={stats.students.active}
            subtitle="Using transport services"
            color="text-orange-500"
            bgGradient="bg-gradient-to-br from-orange-500/10 to-orange-600/10"
            trend={8}
          />
        </div>
      </div>

      {/* Financial Overview */}
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-green-500/20">
                <FaChartArea className="text-2xl text-green-500" />
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-500">
                  {transportService.formatCurrency(stats.financial.monthlyRevenue)}
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm text-green-400">
              <FaArrowUp className="mr-1" />
              12% from last month
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-red-500/10 to-pink-600/10 border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-red-500/20">
                <FaGasPump className="text-2xl text-red-500" />
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">Fuel Costs</p>
                <p className="text-2xl font-bold text-red-500">
                  {transportService.formatCurrency(stats.financial.monthlyFuelCost)}
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm text-red-400">
              <FaArrowUp className="mr-1" />
              5% from last month
            </div>
          </Card>
        </div>
      </div>

      {/* Alerts & Notifications */}
      {(stats.maintenance.pending > 0 || stats.maintenance.overdue > 0 || stats.incidents.recent > 0 || stats.alerts.expiringSoon > 0) && (
        <div className="animate-fade-in-up">
          <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center">
            <FaBell className="mr-2 text-yellow-500" />
            Alerts & Notifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.maintenance.overdue > 0 && (
              <AlertCard
                type="danger"
                title="Overdue Maintenance"
                message={`${stats.maintenance.overdue} vehicle(s) have overdue maintenance`}
                count={stats.maintenance.overdue}
                color="text-red-500 border-red-500"
                icon={FaTimesCircle}
                onClick={() => router.push("/transport/maintenance?status=overdue")}
              />
            )}
            {stats.maintenance.pending > 0 && (
              <AlertCard
                type="warning"
                title="Pending Maintenance"
                message={`${stats.maintenance.pending} vehicle(s) need maintenance`}
                count={stats.maintenance.pending}
                color="text-yellow-500 border-yellow-500"
                icon={FaExclamationCircle}
                onClick={() => router.push("/transport/maintenance")}
              />
            )}
            {stats.incidents.recent > 0 && (
              <AlertCard
                type="info"
                title="Recent Incidents"
                message={`${stats.incidents.recent} incident(s) in the last 30 days`}
                count={stats.incidents.recent}
                color="text-blue-500 border-blue-500"
                icon={FaInfoCircle}
                onClick={() => router.push("/transport/incidents")}
              />
            )}
            {stats.alerts.expiringSoon > 0 && (
              <AlertCard
                type="warning"
                title="Documents Expiring"
                message={`${stats.alerts.expiringSoon} document(s) expiring soon`}
                count={stats.alerts.expiringSoon}
                color="text-orange-500 border-orange-500"
                icon={FaClock}
                onClick={() => router.push("/transport/vehicles?expiring=true")}
              />
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {canManageTransport && (
        <div className="animate-fade-in-up">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionCard
              icon={FaRoute}
              title="Create New Route"
              description="Add a new transport route with stops"
              color="text-blue-500"
              onClick={() => router.push("/transport/routes/create")}
            />
            <QuickActionCard
              icon={FaBus}
              title="Register Vehicle"
              description="Add a new vehicle to the fleet"
              color="text-green-500"
              onClick={() => router.push("/transport/vehicles/create")}
            />
            <QuickActionCard
              icon={FaUsers}
              title="Add Driver"
              description="Register a new driver"
              color="text-purple-500"
              onClick={() => router.push("/transport/drivers/create")}
            />
            <QuickActionCard
              icon={FaCar}
              title="Assign Student"
              description="Assign student to transport route"
              color="text-orange-500"
              onClick={() => router.push("/transport/students/assign")}
            />
            <QuickActionCard
              icon={FaTools}
              title="Schedule Maintenance"
              description="Schedule vehicle maintenance"
              color="text-red-500"
              onClick={() => router.push("/transport/maintenance/create")}
            />
            <QuickActionCard
              icon={FaChartBar}
              title="View Reports"
              description="Transport analytics and insights"
              color="text-indigo-500"
              onClick={() => router.push("/transport/reports")}
            />
          </div>
        </div>
      )}

      {/* Transport Modules */}
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Transport Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            className="p-6 cursor-pointer transition-all duration-300 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30 hover:border-blue-400/50 hover:shadow-xl group"
            onClick={() => router.push("/transport/routes")}
          >
            <div className="flex items-start justify-between mb-4">
              <FaRoute className="text-3xl text-blue-500 group-hover:scale-110 transition-transform" />
              <div className="text-text-secondary group-hover:text-blue-500 transition-colors">
                {stats.routes.active} active
              </div>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-blue-500 transition-colors">
              Transport Routes
            </h3>
            <p className="text-sm text-text-secondary mb-3">
              Manage routes, stops, and schedules
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                {stats.routes.total} total routes
              </span>
              <div className="text-blue-500 group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer transition-all duration-300 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30 hover:border-green-400/50 hover:shadow-xl group"
            onClick={() => router.push("/transport/vehicles")}
          >
            <div className="flex items-start justify-between mb-4">
              <FaBus className="text-3xl text-green-500 group-hover:scale-110 transition-transform" />
              <div className="text-text-secondary group-hover:text-green-500 transition-colors">
                {stats.vehicles.active} active
              </div>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-green-500 transition-colors">
              Fleet Management
            </h3>
            <p className="text-sm text-text-secondary mb-3">
              Vehicles, maintenance, and tracking
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                {stats.maintenance.pending} pending maintenance
              </span>
              <div className="text-green-500 group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer transition-all duration-300 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30 hover:border-purple-400/50 hover:shadow-xl group"
            onClick={() => router.push("/transport/drivers")}
          >
            <div className="flex items-start justify-between mb-4">
              <FaUsers className="text-3xl text-purple-500 group-hover:scale-110 transition-transform" />
              <div className="text-text-secondary group-hover:text-purple-500 transition-colors">
                {stats.drivers.active} active
              </div>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-purple-500 transition-colors">
              Driver Management
            </h3>
            <p className="text-sm text-text-secondary mb-3">
              Driver profiles and performance
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                {stats.drivers.total} total drivers
              </span>
              <div className="text-purple-500 group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer transition-all duration-300 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/30 hover:border-orange-400/50 hover:shadow-xl group"
            onClick={() => router.push("/transport/students")}
          >
            <div className="flex items-start justify-between mb-4">
              <FaCar className="text-3xl text-orange-500 group-hover:scale-110 transition-transform" />
              <div className="text-text-secondary group-hover:text-orange-500 transition-colors">
                {stats.students.active} active
              </div>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-orange-500 transition-colors">
              Student Transport
            </h3>
            <p className="text-sm text-text-secondary mb-3">
              Student assignments and tracking
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                Route assignments
              </span>
              <div className="text-orange-500 group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer transition-all duration-300 bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/30 hover:border-red-400/50 hover:shadow-xl group"
            onClick={() => router.push("/transport/maintenance")}
          >
            <div className="flex items-start justify-between mb-4">
              <FaTools className="text-3xl text-red-500 group-hover:scale-110 transition-transform" />
              <div className="text-text-secondary group-hover:text-red-500 transition-colors">
                {stats.maintenance.pending} pending
              </div>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-red-500 transition-colors">
              Maintenance
            </h3>
            <p className="text-sm text-text-secondary mb-3">
              Vehicle maintenance and repairs
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                Service scheduling
              </span>
              <div className="text-red-500 group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer transition-all duration-300 bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border-indigo-500/30 hover:border-indigo-400/50 hover:shadow-xl group"
            onClick={() => router.push("/transport/reports")}
          >
            <div className="flex items-start justify-between mb-4">
              <FaChartBar className="text-3xl text-indigo-500 group-hover:scale-110 transition-transform" />
              <div className="text-text-secondary group-hover:text-indigo-500 transition-colors">
                Analytics
              </div>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-indigo-500 transition-colors">
              Reports & Analytics
            </h3>
            <p className="text-sm text-text-secondary mb-3">
              Performance insights and reports
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                Business intelligence
              </span>
              <div className="text-indigo-500 group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}