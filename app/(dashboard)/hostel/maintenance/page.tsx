'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, DollarSign, MapPin, Plus, Search, Settings, Wrench } from 'lucide-react';
import { toast } from 'sonner';

interface HostelMaintenance {
  id: string;
  title: string;
  description?: string;
  maintenanceType: string;
  priority: string;
  status: string;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  vendor?: string;
  notes?: string;
  hostel: {
    id: string;
    name: string;
  };
  room?: {
    id: string;
    roomNumber: string;
    floorNumber: number;
  };
}

interface Hostel {
  id: string;
  name: string;
}

interface HostelRoom {
  id: string;
  roomNumber: string;
  floorNumber: number;
}

export default function HostelMaintenancePage() {
  const [maintenance, setMaintenance] = useState<HostelMaintenance[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [hostelFilter, setHostelFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<HostelMaintenance | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    hostelId: '',
    roomId: '',
    maintenanceType: '',
    title: '',
    description: '',
    priority: 'NORMAL',
    scheduledDate: '',
    cost: '',
    vendor: '',
    notes: '',
  });

  useEffect(() => {
    fetchMaintenance();
    fetchHostels();
  }, []);

  useEffect(() => {
    if (formData.hostelId) {
      fetchRooms(formData.hostelId);
    }
  }, [formData.hostelId]);

  const fetchMaintenance = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (hostelFilter) params.append('hostelId', hostelFilter);

      const response = await fetch(`/api/hostel/maintenance?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMaintenance(data.maintenance || []);
      }
    } catch (error) {
      console.error('Error fetching maintenance:', error);
      toast.error('Failed to fetch maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchHostels = async () => {
    try {
      const response = await fetch('/api/hostel');
      if (response.ok) {
        const data = await response.json();
        setHostels(data.hostels || []);
      }
    } catch (error) {
      console.error('Error fetching hostels:', error);
    }
  };

  const fetchRooms = async (hostelId: string) => {
    try {
      const response = await fetch(`/api/hostel/rooms?hostelId=${hostelId}`);
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/hostel/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
        }),
      });

      if (response.ok) {
        toast.success('Maintenance record created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        fetchMaintenance();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create maintenance record');
      }
    } catch (error) {
      console.error('Error creating maintenance:', error);
      toast.error('Failed to create maintenance record');
    }
  };

  const handleUpdateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaintenance) return;

    try {
      const response = await fetch(`/api/hostel/maintenance/${selectedMaintenance.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
        }),
      });

      if (response.ok) {
        toast.success('Maintenance record updated successfully');
        setIsEditDialogOpen(false);
        resetForm();
        fetchMaintenance();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update maintenance record');
      }
    } catch (error) {
      console.error('Error updating maintenance:', error);
      toast.error('Failed to update maintenance record');
    }
  };

  const handleCompleteMaintenance = async (id: string) => {
    try {
      const response = await fetch(`/api/hostel/maintenance/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          completedDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success('Maintenance marked as completed');
        fetchMaintenance();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update maintenance status');
      }
    } catch (error) {
      console.error('Error completing maintenance:', error);
      toast.error('Failed to update maintenance status');
    }
  };

  const resetForm = () => {
    setFormData({
      hostelId: '',
      roomId: '',
      maintenanceType: '',
      title: '',
      description: '',
      priority: 'NORMAL',
      scheduledDate: '',
      cost: '',
      vendor: '',
      notes: '',
    });
    setSelectedMaintenance(null);
  };

  const openEditDialog = (maintenance: HostelMaintenance) => {
    setSelectedMaintenance(maintenance);
    setFormData({
      hostelId: maintenance.hostel.id,
      roomId: maintenance.room?.id || '',
      maintenanceType: maintenance.maintenanceType,
      title: maintenance.title,
      description: maintenance.description || '',
      priority: maintenance.priority,
      scheduledDate: maintenance.scheduledDate.split('T')[0],
      cost: maintenance.cost?.toString() || '',
      vendor: maintenance.vendor || '',
      notes: maintenance.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      OVERDUE: 'bg-orange-100 text-orange-800',
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      LOW: 'bg-gray-100 text-gray-800',
      NORMAL: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-yellow-100 text-yellow-800',
      URGENT: 'bg-red-100 text-red-800',
    };
    return priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800';
  };

  const filteredMaintenance = maintenance.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.hostel.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesHostel = !hostelFilter || item.hostel.id === hostelFilter;
    return matchesSearch && matchesStatus && matchesHostel;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hostel Maintenance</h1>
          <p className="text-gray-600">Manage hostel maintenance and repairs</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Maintenance Record</DialogTitle>
              <DialogDescription>
                Add a new maintenance record for hostel facilities
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateMaintenance} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hostelId">Hostel *</Label>
                  <Select
                    value={formData.hostelId}
                    onValueChange={(value) => setFormData({ ...formData, hostelId: value, roomId: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hostel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostels.map((hostel) => (
                        <SelectItem key={hostel.id} value={hostel.id}>
                          {hostel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="roomId">Room (Optional)</Label>
                  <Select
                    value={formData.roomId}
                    onValueChange={(value) => setFormData({ ...formData, roomId: value })}
                    disabled={!formData.hostelId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">General Maintenance</SelectItem>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.roomNumber} (Floor {room.floorNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maintenanceType">Maintenance Type *</Label>
                  <Select
                    value={formData.maintenanceType}
                    onValueChange={(value) => setFormData({ ...formData, maintenanceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROUTINE">Routine</SelectItem>
                      <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                      <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                      <SelectItem value="INSPECTION">Inspection</SelectItem>
                      <SelectItem value="REPAIR">Repair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter maintenance title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter maintenance description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost (TZS)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Enter vendor name"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Maintenance</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search maintenance..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hostel">Hostel</Label>
              <Select value={hostelFilter} onValueChange={setHostelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All hostels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All hostels</SelectItem>
                  {hostels.map((hostel) => (
                    <SelectItem key={hostel.id} value={hostel.id}>
                      {hostel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Records</CardTitle>
          <CardDescription>
            {filteredMaintenance.length} maintenance record(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Hostel</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaintenance.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.hostel.name}</TableCell>
                  <TableCell>
                    {item.room ? `Room ${item.room.roomNumber} (Floor ${item.room.floorNumber})` : 'General'}
                  </TableCell>
                  <TableCell>{item.maintenanceType}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityBadge(item.priority)}>
                      {item.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(item.scheduledDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {item.cost ? `TZS ${item.cost.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(item)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      {item.status !== 'COMPLETED' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteMaintenance(item.id)}
                        >
                          <Wrench className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Maintenance Record</DialogTitle>
            <DialogDescription>
              Update the maintenance record details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateMaintenance} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-hostelId">Hostel *</Label>
                <Select
                  value={formData.hostelId}
                  onValueChange={(value) => setFormData({ ...formData, hostelId: value, roomId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hostel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hostels.map((hostel) => (
                      <SelectItem key={hostel.id} value={hostel.id}>
                        {hostel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-roomId">Room (Optional)</Label>
                <Select
                  value={formData.roomId}
                  onValueChange={(value) => setFormData({ ...formData, roomId: value })}
                  disabled={!formData.hostelId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General Maintenance</SelectItem>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.roomNumber} (Floor {room.floorNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-maintenanceType">Maintenance Type *</Label>
                <Select
                  value={formData.maintenanceType}
                  onValueChange={(value) => setFormData({ ...formData, maintenanceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROUTINE">Routine</SelectItem>
                    <SelectItem value="PREVENTIVE">Preventive</SelectItem>
                    <SelectItem value="CORRECTIVE">Corrective</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                    <SelectItem value="INSPECTION">Inspection</SelectItem>
                    <SelectItem value="REPAIR">Repair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter maintenance title"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter maintenance description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-scheduledDate">Scheduled Date *</Label>
                <Input
                  id="edit-scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-cost">Cost (TZS)</Label>
                <Input
                  id="edit-cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-vendor">Vendor</Label>
              <Input
                id="edit-vendor"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="Enter vendor name"
              />
            </div>

            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Maintenance</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
