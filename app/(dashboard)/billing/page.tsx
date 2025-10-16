'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/auth';
import apiService from '@/app/lib/apiService';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Download, Eye, DollarSign, Clock, CheckCircle } from 'lucide-react';

interface BillingRecord {
  id: string;
  invoiceNumber: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  billingDate: string;
  dueDate: string;
  paymentStatus: string;
  paymentDate: string | null;
  subscription: {
    package: {
      packageName: string;
    };
  };
}

export default function BillingPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchBillingRecords();
    fetchAnalytics();
  }, []);

  const fetchBillingRecords = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/packages/billing/records');
      if (response.success) {
        setRecords(response.data);
      } else {
        setError(response.message || 'Failed to fetch billing records');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await apiService.get('/packages/analytics/revenue');
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const filteredRecords = records.filter(record => {
    if (activeTab === 'pending') return record.paymentStatus === 'PENDING';
    if (activeTab === 'paid') return record.paymentStatus === 'PAID';
    if (activeTab === 'overdue') return record.paymentStatus === 'OVERDUE';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'OVERDUE':
        return <DollarSign className="w-4 h-4" />;
      default:
        return null;
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
        <p className="text-gray-600 mt-2">Manage your subscription invoices and payments</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue?.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-gray-600 mt-1">Paid invoices</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.pendingRevenue?.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-gray-600 mt-1">Awaiting payment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Overdue Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${analytics.overdueRevenue?.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-gray-600 mt-1">Past due</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({records.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({records.filter(r => r.paymentStatus === 'PENDING').length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({records.filter(r => r.paymentStatus === 'PAID').length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({records.filter(r => r.paymentStatus === 'OVERDUE').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-600">Loading invoices...</p>
              </CardContent>
            </Card>
          ) : filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-600">No invoices found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map(record => (
                <Card key={record.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{record.invoiceNumber}</h3>
                          <Badge className={getStatusColor(record.paymentStatus)} variant="outline">
                            <span className="flex items-center gap-1">
                              {getStatusIcon(record.paymentStatus)}
                              {record.paymentStatus}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{record.subscription.package.packageName}</p>

                        <div className="grid gap-4 md:grid-cols-5 text-sm">
                          <div>
                            <p className="text-gray-600">Amount</p>
                            <p className="font-medium">${record.amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Tax</p>
                            <p className="font-medium">${record.taxAmount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total</p>
                            <p className="font-bold">${record.totalAmount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Billing Date</p>
                            <p className="font-medium">{formatDate(record.billingDate)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Due Date</p>
                            <p className="font-medium">{formatDate(record.dueDate)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
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

