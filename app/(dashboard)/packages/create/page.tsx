'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/auth';
import apiService from '@/app/lib/apiService';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

interface Feature {
  featureName: string;
  featureDescription: string;
  isIncluded: boolean;
}

export default function CreatePackagePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [newFeature, setNewFeature] = useState({ name: '', description: '' });

  const [formData, setFormData] = useState({
    packageName: '',
    packageType: '',
    description: '',
    basePrice: '',
    billingCycle: 'monthly'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addFeature = () => {
    if (!newFeature.name.trim()) {
      setError('Feature name is required');
      return;
    }
    setFeatures([...features, {
      featureName: newFeature.name,
      featureDescription: newFeature.description,
      isIncluded: true
    }]);
    setNewFeature({ name: '', description: '' });
    setError(null);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.packageName || !formData.packageType || !formData.basePrice) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.post('/packages/packages', {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        features
      });

      if (response.success) {
        router.push('/packages');
      } else {
        setError(response.message || 'Failed to create package');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
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
      <div className="flex items-center gap-4">
        <Link href="/packages">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Service Package</h1>
          <p className="text-gray-600 mt-2">Add a new premium service package</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Package Information</CardTitle>
            <CardDescription>Basic details about the service package</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="packageName">Package Name *</Label>
                <Input
                  id="packageName"
                  name="packageName"
                  value={formData.packageName}
                  onChange={handleInputChange}
                  placeholder="e.g., Computer Lab Maintenance"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="packageType">Package Type *</Label>
                <Select value={formData.packageType} onValueChange={(value) => handleSelectChange('packageType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select package type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPUTER_MAINTENANCE">Computer Lab Maintenance</SelectItem>
                    <SelectItem value="TUTORIALS">Tutorials & Educational Content</SelectItem>
                    <SelectItem value="SPORTS">Sports & Games Program</SelectItem>
                    <SelectItem value="ACADEMIC_COMPETITION">Academic Competition</SelectItem>
                    <SelectItem value="TOURS">Educational Tours & Excursions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the package and its benefits"
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (USD) *</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingCycle">Billing Cycle</Label>
                <Select value={formData.billingCycle} onValueChange={(value) => handleSelectChange('billingCycle', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Package Features</CardTitle>
            <CardDescription>Add features included in this package</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{feature.featureName}</p>
                    {feature.featureDescription && (
                      <p className="text-sm text-gray-600">{feature.featureDescription}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="featureName">Feature Name</Label>
                <Input
                  id="featureName"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Equipment Tracking"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featureDescription">Feature Description</Label>
                <Input
                  id="featureDescription"
                  value={newFeature.description}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the feature"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={addFeature}
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href="/packages" className="flex-1">
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Creating...' : 'Create Package'}
          </Button>
        </div>
      </form>
    </div>
  );
}

