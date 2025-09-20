'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Clock, Users, AlertTriangle, Plus, Filter } from 'lucide-react';
import { leaveService, LeaveRequest, LeaveType, LeaveStatus } from '@/lib/leaveService';
import { useToast } from '@/hooks/use-toast';
import NewLeaveRequestForm from '@/components/leave/NewLeaveRequestForm';

export default function LeavePage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    emergency: 0,
    byType: {}
  });
  const [loading, setLoading] = useState(true);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    leaveType: '',
    studentId: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadLeaveData();
    loadLeaveStats();
  }, [filters]);

  const loadLeaveData = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getLeaveRequests({
        ...filters,
        status: filters.status as LeaveStatus || undefined,
        leaveType: filters.leaveType as LeaveType || undefined
      });
      setLeaveRequests(response.data || []);
    } catch (error) {
      console.error('Error loading leave requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leave requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveStats = async () => {
    try {
      const response = await leaveService.getLeaveStats();
      setStats(response.data || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        emergency: 0,
        byType: {}
      });
    } catch (error) {
      console.error('Error loading leave stats:', error);
    }
  };

  const handleApproveLeave = async (requestId: string) => {
    try {
      await leaveService.updateLeaveRequest(requestId, { status: LeaveStatus.APPROVED });
      toast({
        title: 'Success',
        description: 'Leave request approved successfully'
      });
      loadLeaveData();
      loadLeaveStats();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve leave request',
        variant: 'destructive'
      });
    }
  };

  const handleRejectLeave = async (requestId: string, reason: string) => {
    try {
      await leaveService.updateLeaveRequest(requestId, { 
        status: LeaveStatus.REJECTED,
        rejectedReason: reason
      });
      toast({
        title: 'Success',
        description: 'Leave request rejected'
      });
      loadLeaveData();
      loadLeaveStats();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject leave request',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteLeave = async (requestId: string) => {
    try {
      await leaveService.deleteLeaveRequest(requestId);
      toast({
        title: 'Success',
        description: 'Leave request deleted successfully'
      });
      loadLeaveData();
      loadLeaveStats();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete leave request',
        variant: 'destructive'
      });
    }
  };

  const columns = [
    {
      accessorKey: 'student.firstName',
      header: 'Student',
      cell: ({ row }: any) => {
        const student = row.original.student;
        return (
          <div>
            <div className="font-medium">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-sm text-gray-500">
              ID: {student.studentId}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'leaveType',
      header: 'Type',
      cell: ({ row }: any) => (
        <Badge variant="outline">
          {leaveService.getLeaveTypeLabel(row.original.leaveType)}
        </Badge>
      )
    },
    {
      accessorKey: 'startDate',
      header: 'Duration',
      cell: ({ row }: any) => {
        const startDate = new Date(row.original.startDate).toLocaleDateString();
        const endDate = new Date(row.original.endDate).toLocaleDateString();
        const days = leaveService.calculateLeaveDays(row.original.startDate, row.original.endDate);
        return (
          <div>
            <div className="text-sm">{startDate} - {endDate}</div>
            <div className="text-xs text-gray-500">{days} day{days > 1 ? 's' : ''}</div>
          </div>
        );
      }
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }: any) => (
        <div className="max-w-xs truncate" title={row.original.reason}>
          {row.original.reason}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const colorClass = leaveService.getStatusColor(status);
        return (
          <div className="flex items-center gap-2">
            <Badge className={colorClass}>
              {status}
            </Badge>
            {row.original.isEmergency && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Requested',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const request = row.original;
        return (
          <div className="flex gap-2">
            {request.status === 'PENDING' && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleApproveLeave(request.id)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-lg"
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const reason = prompt('Enter rejection reason:');
                    if (reason) handleRejectLeave(request.id, reason);
                  }}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-lg"
                >
                  Reject
                </Button>
              </>
            )}
            <Button
              size="sm"
              onClick={() => {
                if (confirm('Are you sure you want to delete this leave request?')) {
                  handleDeleteLeave(request.id);
                }
              }}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-lg"
            >
              Delete
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Leave Management
              </h1>
              <p className="text-purple-100 text-lg">Streamline student leave requests with intelligent approval workflows</p>
            </div>
            <Button 
              onClick={() => setShowNewRequestForm(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Request
            </Button>
          </div>
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stats.total}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{stats.pending}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.approved}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">{stats.rejected}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-rose-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl shadow-lg animate-pulse">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Emergency</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{stats.emergency}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Smart Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full p-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Leave Type</label>
                <select
                  value={filters.leaveType}
                  onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
                  className="w-full p-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <option value="">All Types</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="PERSONAL">Personal Leave</option>
                  <option value="FAMILY_EMERGENCY">Family Emergency</option>
                  <option value="MEDICAL_APPOINTMENT">Medical Appointment</option>
                  <option value="RELIGIOUS">Religious Leave</option>
                  <option value="VACATION">Vacation</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => setFilters({ status: '', leaveType: '', studentId: '' })}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl p-3"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
          <div className="relative z-10 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Leave Requests</h3>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 overflow-hidden">
              <DataTable
                columns={columns}
                data={leaveRequests}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* New Request Form Modal */}
      {showNewRequestForm && (
        <NewLeaveRequestForm
          onClose={() => setShowNewRequestForm(false)}
          onSubmit={async (data) => {
            try {
              await leaveService.createLeaveRequest(data);
              toast({
                title: 'Success',
                description: 'Leave request submitted successfully'
              });
              setShowNewRequestForm(false);
              loadLeaveData();
              loadLeaveStats();
            } catch (error) {
              toast({
                title: 'Error',
                description: 'Failed to submit leave request',
                variant: 'destructive'
              });
            }
          }}
        />
      )}
    </div>
  );
}
