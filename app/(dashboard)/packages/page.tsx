'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/auth';
import apiService from '@/app/lib/apiService';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

interface Package {
  id: string;
  packageName: string;
  packageType: string;
  description: string;
  basePrice: number;
  billingCycle: string;
  status: string;
  features: Array<{ id: string; featureName: string }>;
  subscriptions: Array<{ id: string; subscriptionStatus: string }>;
}

export default function PackagesPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/packages/packages');
      if (response.success) {
        setPackages(response.data);
      } else {
        setError(response.message || 'Failed to fetch packages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const response = await apiService.delete(`/packages/packages/${id}`);
      if (response.success) {
        setPackages(packages.filter(p => p.id !== id));
      } else {
        setError(response.message || 'Failed to delete package');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const filteredPackages = packages.filter(pkg => {
    if (activeTab === 'active') return pkg.status === 'active';
    if (activeTab === 'inactive') return pkg.status !== 'active';
    return true;
  });

  const getPackageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      COMPUTER_MAINTENANCE: 'Computer Lab',
      TUTORIALS: 'Tutorials',
      SPORTS: 'Sports',
      ACADEMIC_COMPETITION: 'Academic Competition',
      TOURS: 'Tours'
    };
    return labels[type] || type;
  };

  if (!user?.roles?.some(r => r.name === 'Super Admin')) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">You do not have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Packages</h1>
          <p className="text-gray-600 mt-2">Manage premium service packages for schools</p>
        </div>
        <Link href="/packages/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Package
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Packages ({packages.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({packages.filter(p => p.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({packages.filter(p => p.status !== 'active').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-600">Loading packages...</p>
              </CardContent>
            </Card>
          ) : filteredPackages.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-600">No packages found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPackages.map(pkg => (
                <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{pkg.packageName}</CardTitle>
                        <CardDescription>{getPackageTypeLabel(pkg.packageType)}</CardDescription>
                      </div>
                      <Badge variant={pkg.status === 'active' ? 'default' : 'secondary'}>
                        {pkg.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{pkg.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Base Price:</span>
                        <span className="font-semibold">${pkg.basePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Billing Cycle:</span>
                        <span className="font-semibold capitalize">{pkg.billingCycle}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Features:</span>
                        <span className="font-semibold">{pkg.features.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subscriptions:</span>
                        <span className="font-semibold">{pkg.subscriptions.length}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Link href={`/packages/${pkg.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/packages/${pkg.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(pkg.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

