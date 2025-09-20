'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Users,
  TrendingUp,
  Award,
  BookOpen,
  Download,
  Filter
} from 'lucide-react';
import { teacherReportsService, TeacherDemographics, PerformanceAnalytics, WorkloadAnalysis } from '@/lib/teacherReportsService';
import { useToast } from '@/hooks/use-toast';
import Button from '@/components/ui/Button';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export default function TeacherReportsPage() {
  const { toast } = useToast();
  const [demographics, setDemographics] = useState<TeacherDemographics | null>(null);
  const [performance, setPerformance] = useState<PerformanceAnalytics | null>(null);
  const [workload, setWorkload] = useState<WorkloadAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('demographics');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [demographicsData, performanceData, workloadData] = await Promise.all([
        teacherReportsService.getDemographics(),
        teacherReportsService.getPerformanceAnalytics(),
        teacherReportsService.getWorkloadAnalysis()
      ]);
      
      setDemographics(demographicsData);
      setPerformance(performanceData);
      setWorkload(workloadData);
    } catch (error: any) {
      const isAuthError = error.message?.includes('401') || error.message?.includes('Unauthorized');
      toast({
        title: isAuthError ? 'Authentication Required' : 'Error',
        description: isAuthError ? 'Please log in again to access reports' : 'Failed to load reports',
        variant: 'destructive'
      });
      
      if (isAuthError) {
        // Redirect to login or refresh page
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const genderData = demographics ? [
    { name: 'Male', value: demographics.byGender.male },
    { name: 'Female', value: demographics.byGender.female }
  ] : [];

  const experienceData = demographics ? Object.entries(demographics.byExperience).map(([key, value]) => ({
    name: `${key} years`,
    value
  })) : [];

  const performanceData = performance ? [
    { name: 'Excellent (4.5+)', value: performance.ratingDistribution.excellent },
    { name: 'Good (3.5-4.5)', value: performance.ratingDistribution.good },
    { name: 'Average (2.5-3.5)', value: performance.ratingDistribution.average },
    { name: 'Poor (<2.5)', value: performance.ratingDistribution.poor }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card p-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Teacher Reports & Analytics</h1>
              <p className="text-text-secondary">Comprehensive insights into teacher demographics and performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-purple-light shadow-purple-glow">
                <BarChart className="h-8 w-8 text-white" />
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-lg p-1">
          {[
            { id: 'demographics', label: 'Demographics', icon: Users },
            { id: 'performance', label: 'Performance', icon: Award },
            { id: 'workload', label: 'Workload', icon: BookOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Demographics Tab */}
        {activeTab === 'demographics' && demographics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary Stats */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                      <p className="text-2xl font-bold text-gray-900">{demographics.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Male Teachers</p>
                      <p className="text-2xl font-bold text-gray-900">{demographics.byGender.male}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-pink-100">
                      <Users className="h-6 w-6 text-pink-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Female Teachers</p>
                      <p className="text-2xl font-bold text-gray-900">{demographics.byGender.female}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Subjects Covered</p>
                      <p className="text-2xl font-bold text-gray-900">{Object.keys(demographics.bySubject).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gender Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Experience Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Experience Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={experienceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && performance && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600">
                    {performance.averageRating.toFixed(1)}
                  </div>
                  <div className="text-gray-600">Average Rating</div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(performance.byTeacher)
                    .sort(([,a], [,b]) => b.average - a.average)
                    .slice(0, 5)
                    .map(([name, data], index) => (
                      <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{name}</p>
                            <p className="text-sm text-gray-500">{data.ratings.length} evaluations</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{data.average.toFixed(1)}</div>
                          <div className="text-xs text-gray-500">avg rating</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Workload Tab */}
        {activeTab === 'workload' && workload && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workload Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Subjects</span>
                    <span className="font-bold">{workload.averageSubjects.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Classes</span>
                    <span className="font-bold">{workload.averageClasses.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-600">Overloaded Teachers</span>
                    <span className="font-bold text-red-600">{workload.overloaded.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-600">Underutilized Teachers</span>
                    <span className="font-bold text-yellow-600">{workload.underutilized.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Teacher Workload Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {workload.teachers
                    .sort((a, b) => b.workloadScore - a.workloadScore)
                    .map((teacher) => (
                      <div key={teacher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{teacher.name}</p>
                          <p className="text-sm text-gray-500">
                            {teacher.subjects} subjects, {teacher.classes} classes
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            teacher.workloadScore > 8 ? 'text-red-600' :
                            teacher.workloadScore < 3 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {teacher.workloadScore}
                          </div>
                          <div className="text-xs text-gray-500">workload score</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}