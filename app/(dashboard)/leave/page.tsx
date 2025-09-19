'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Clock, Users, AlertTriangle, Plus, Filter } from 'lucide-react';
import { leaveService, LeaveRequest, LeaveType, LeaveStatus } from '@/lib/leaveService';
import { useToast } from '@/hooks/use-toast';

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
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const reason = prompt('Enter rejection reason:');
                    if (reason) handleRejectLeave(request.id, reason);
                  }}
                >
                  Reject
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (confirm('Are you sure you want to delete this leave request?')) {
                  handleDeleteLeave(request.id);
                }
              }}
            >
              Delete
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-gray-600">Manage student leave requests and approvals</p>
        </div>
        <Button onClick={() => toast({ title: 'Feature Coming Soon', description: 'Leave request form will be implemented' })}>
          <Plus className="h-4 w-4 mr-2" />
          New Leave Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.emergency}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Leave Type</label>
              <select
                value={filters.leaveType}
                onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
                className="w-full p-2 border rounded-md"
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
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={leaveRequests}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
