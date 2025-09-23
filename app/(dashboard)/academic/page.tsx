"use client";

import { useState } from "react";
import {
  FaBook,
  FaGraduationCap,
  FaUsers,
  FaCalendarAlt,
  FaChartBar,
  FaPlus,
  FaClipboardList,
} from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RoleGuard from "@/components/RoleGuard";
import RoleBasedButton from "@/components/RoleBasedButton";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AcademicPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Check user permissions - Academic features are for Tenant Admin
  const canManageAcademic =
    user?.roles?.some((role) => role.name === "Tenant Admin") || false;

  const canViewAcademic =
    user?.roles?.some((role) =>
      ["Tenant Admin", "Teacher", "Student"].includes(role.name),
    ) || false;

  const academicModules = [
    {
      id: "courses",
      title: "Courses",
      description: "Manage academic courses and programs",
      icon: FaBook,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      stats: { total: 12, active: 10, pending: 2 },
      path: "/academic/courses",
    },
    {
      id: "subjects",
      title: "Subjects",
      description: "Organize subjects and curriculum",
      icon: FaGraduationCap,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      stats: { total: 45, active: 42, pending: 3 },
      path: "/academic/subjects",
    },
    {
      id: "classes",
      title: "Classes",
      description: "Manage class schedules and sections",
      icon: FaUsers,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      stats: { total: 8, active: 7, pending: 1 },
      path: "/academic/classes",
    },
    {
      id: "schedules",
      title: "Schedules",
      description: "Academic calendar and timetables",
      icon: FaCalendarAlt,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      stats: { total: 24, active: 20, pending: 4 },
      path: "/academic/schedules",
    },
    {
      id: "examinations",
      title: "Examinations",
      description: "Create and manage examinations",
      icon: FaClipboardList,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      stats: { total: 25, active: 18, pending: 7 },
      path: "/academic/examinations",
    },
    {
      id: "grades",
      title: "Grades & Results",
      description: "Student performance and grade entry",
      icon: FaChartBar,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      stats: { total: 156, active: 142, pending: 14 },
      path: "/academic/grades",
    },
  ];

  const handleModuleClick = (path: string) => {
    router.push(path);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "new-course":
        router.push("/academic/courses/create");
        break;
      case "new-subject":
        router.push("/academic/subjects/create");
        break;
      case "new-class":
        router.push("/academic/classes/create");
        break;
      case "new-examination":
        router.push("/academic/examinations/create");
        break;
      case "enter-grades":
        router.push("/academic/grades");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Academic Management
              </h1>
              <p className="text-text-secondary">
                Manage courses, subjects, classes, and academic schedules
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <RoleBasedButton
                allowedRoles={["Tenant Admin"]}
                onClick={() => handleQuickAction("new-course")}
                variant="primary"
                className="flex items-center space-x-2"
              >
                <FaPlus />
                <span>New Course</span>
              </RoleBasedButton>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <RoleGuard allowedRoles={["Tenant Admin"]}>
          <Card className="mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RoleBasedButton
                  allowedRoles={["Tenant Admin"]}
                  onClick={() => handleQuickAction("new-course")}
                  variant="secondary"
                  className="flex items-center justify-center space-x-2 h-12"
                >
                  <FaBook />
                  <span>Add New Course</span>
                </RoleBasedButton>
                <RoleBasedButton
                  allowedRoles={["Tenant Admin"]}
                  onClick={() => handleQuickAction("new-subject")}
                  variant="secondary"
                  className="flex items-center justify-center space-x-2 h-12"
                >
                  <FaGraduationCap />
                  <span>Add New Subject</span>
                </RoleBasedButton>
                <RoleBasedButton
                  allowedRoles={["Tenant Admin"]}
                  onClick={() => handleQuickAction("new-class")}
                  variant="secondary"
                  className="flex items-center justify-center space-x-2 h-12"
                >
                  <FaUsers />
                  <span>Create New Class</span>
                </RoleBasedButton>
              </div>
            </div>
          </Card>
        </RoleGuard>

        {/* Academic Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {academicModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Card
                key={module.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() => handleModuleClick(module.path)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-full ${module.bgColor}`}>
                      <IconComponent
                        className={`text-2xl ${module.iconColor}`}
                      />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-text-primary">
                        {module.stats.total}
                      </div>
                      <div className="text-sm text-text-secondary">Total</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {module.title}
                  </h3>
                  <p className="text-text-secondary mb-4">
                    {module.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-text-secondary">
                          {module.stats.active} Active
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-text-secondary">
                          {module.stats.pending} Pending
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Recent Academic Activity
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <FaBook className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-text-primary font-medium">
                    New course &quot;Advanced Mathematics&quot; created
                  </p>
                  <p className="text-sm text-text-secondary">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <FaGraduationCap className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-text-primary font-medium">
                    Subject &quot;Physics&quot; updated with new curriculum
                  </p>
                  <p className="text-sm text-text-secondary">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-full">
                  <FaUsers className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-text-primary font-medium">
                    Class &quot;Grade 10A&quot; schedule modified
                  </p>
                  <p className="text-sm text-text-secondary">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
