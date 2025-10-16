'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/auth';
import apiService from '@/app/lib/apiService';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Plus, Edit2, Trash2, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface Subscription {
  id: string;
  subscriptionStatus: string;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  customPrice: number | null;
  package: {
    packageName: string;
    packageType: string;
    basePrice: number;
  };
  billingRecords: Array<{ id: string; paymentStatus: string }>;
}

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/packages/subscriptions');
      if (response.success) {
        setSubscriptions(response.data);
      } else {
        setError(response.message || 'Failed to fetch subscriptions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    try {
      const response = await apiService.delete(`/packages/subscriptions/${id}`);
      if (response.success) {
        setSubscriptions(subscriptions.map(s => 
          s.id === id ? { ...s, subscriptionStatus: 'CANCELLED' } : s
        ));
      } else {
        setError(response.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (activeTab === 'active') return sub.subscriptionStatus === 'ACTIVE';
    if (activeTab === 'expired') return sub.subscriptionStatus === 'EXPIRED';
    if (activeTab === 'cancelled') return sub.subscriptionStatus === 'CANCELLED';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-gray-600 mt-2">Manage your service package subscriptions</p>
        </div>
        <Link href="/subscriptions/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Subscription
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.filter(s => s.subscriptionStatus === 'ACTIVE').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.filter(s => s.subscriptionStatus === 'EXPIRED').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.filter(s => s.subscriptionStatus === 'CANCELLED').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({subscriptions.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({subscriptions.filter(s => s.subscriptionStatus === 'ACTIVE').length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({subscriptions.filter(s => s.subscriptionStatus === 'EXPIRED').length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({subscriptions.filter(s => s.subscriptionStatus === 'CANCELLED').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-600">Loading subscriptions...</p>
              </CardContent>
            </Card>
          ) : filteredSubscriptions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-600">No subscriptions found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSubscriptions.map(sub => (
                <Card key={sub.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{sub.package.packageName}</h3>
                          <Badge className={getStatusColor(sub.subscriptionStatus)}>
                            {sub.subscriptionStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{sub.package.packageType}</p>

                        <div className="grid gap-4 md:grid-cols-4 text-sm">
                          <div>
                            <p className="text-gray-600">Start Date</p>
                            <p className="font-medium">{formatDate(sub.startDate)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">End Date</p>
                            <p className="font-medium">{sub.endDate ? formatDate(sub.endDate) : 'Ongoing'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Price</p>
                            <p className="font-medium">${(sub.customPrice || sub.package.basePrice).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Auto Renew</p>
                            <p className="font-medium">{sub.autoRenew ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/subscriptions/${sub.id}`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/subscriptions/${sub.id}/edit`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Button>
                        </Link>
                        {sub.subscriptionStatus === 'ACTIVE' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-red-600 hover:text-red-700"
                            onClick={() => handleCancel(sub.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Cancel
                          </Button>
                        )}
                      </div>
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

