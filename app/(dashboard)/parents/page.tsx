'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MoreHorizontal,
  Users,
  UserCheck,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  GraduationCap
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { studentService, Parent, ParentFilters } from '@/lib/studentService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ParentFilters>({
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadParents();
  }, [filters]);

  const loadParents = async () => {
    try {
      setLoading(true);
      const response = await studentService.getParents(filters);
      
      if (response.success && response.data) {
        setParents(response.data);
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        });
      }
    } catch (error) {
      console.error('Error loading parents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load parents',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({
      ...prev,
      search: value || undefined,
      page: 1
    }));
  };

  const handleFilterChange = (key: keyof ParentFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'FATHER': return 'bg-blue-100 text-blue-800';
      case 'MOTHER': return 'bg-pink-100 text-pink-800';
      case 'GUARDIAN': return 'bg-purple-100 text-purple-800';
      case 'OTHER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parent Management</h1>
          <p className="text-muted-foreground">
            Manage parent and guardian information and relationships
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/parents/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Parent
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Parents</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parents.filter(p => p.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fathers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parents.filter(p => p.relationship === 'FATHER').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Father figures
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mothers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parents.filter(p => p.relationship === 'MOTHER').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Mother figures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Parent Directory</CardTitle>
          <CardDescription>
            Search and filter parents by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search parents by name or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.relationship || ''}
                onValueChange={(value) => handleFilterChange('relationship', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Relationships</SelectItem>
                  <SelectItem value="FATHER">Father</SelectItem>
                  <SelectItem value="MOTHER">Mother</SelectItem>
                  <SelectItem value="GUARDIAN">Guardian</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Parents Table */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : parents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No parents found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filters.status || filters.relationship
                    ? 'Try adjusting your search criteria'
                    : 'Get started by adding your first parent'
                  }
                </p>
                {!searchTerm && !filters.status && !filters.relationship && (
                  <Button asChild>
                    <Link href="/parents/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Parent
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {parents.map((parent) => (
                  <Card key={parent.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-600">
                              {parent.user.firstName[0]}{parent.user.lastName[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">
                                {parent.user.firstName} {parent.user.lastName}
                              </h3>
                              <Badge className={getStatusColor(parent.status)}>
                                {parent.status}
                              </Badge>
                              <Badge className={getRelationshipColor(parent.relationship)}>
                                {parent.relationship}
                              </Badge>
                              {parent.isPrimary && (
                                <Badge variant="outline">Primary</Badge>
                              )}
                              {parent.isEmergency && (
                                <Badge variant="outline">Emergency</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                              <p className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{parent.user.email}</span>
                              </p>
                              {parent.user.phone && (
                                <p className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{parent.user.phone}</span>
                                </p>
                              )}
                              {parent.occupation && (
                                <p className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{parent.occupation}</span>
                                  {parent.workplace && <span> at {parent.workplace}</span>}
                                </p>
                              )}
                              {parent.parentRelations && parent.parentRelations.length > 0 && (
                                <p className="flex items-center space-x-1">
                                  <GraduationCap className="h-3 w-3" />
                                  <span>
                                    {parent.parentRelations.length} child{parent.parentRelations.length !== 1 ? 'ren' : ''}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-right text-sm text-gray-500">
                            <p>Added: {format(new Date(parent.createdAt), 'MMM dd, yyyy')}</p>
                            {parent.updatedAt !== parent.createdAt && (
                              <p>Updated: {format(new Date(parent.updatedAt), 'MMM dd, yyyy')}</p>
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/parents/${parent.id}`}>
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/parents/${parent.id}/edit`}>
                                  Edit Parent
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/parents/${parent.id}/children`}>
                                  Manage Children
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Remove Parent
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={pagination.page === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



