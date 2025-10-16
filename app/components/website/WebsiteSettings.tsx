'use client';

import React, { useState, useEffect } from 'react';
import { websiteSettingsService, WebsiteSettings as WebsiteSettingsType } from '@/lib/websiteService';

export default function WebsiteSettings() {
  const [settings, setSettings] = useState<WebsiteSettingsType | null>(null);
  const [formData, setFormData] = useState({
    websiteTitle: '',
    websiteDescription: '',
    logoUrl: '',
    themeColor: '#3B82F6',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    fontFamily: 'Inter',
    contactEmail: '',
    contactPhone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await websiteSettingsService.getSettings();
      if (response.success) {
        setSettings(response.data);
        setFormData({
          websiteTitle: response.data.websiteTitle || '',
          websiteDescription: response.data.websiteDescription || '',
          logoUrl: response.data.logoUrl || '',
          themeColor: response.data.themeColor || '#3B82F6',
          primaryColor: response.data.primaryColor || '#3B82F6',
          secondaryColor: response.data.secondaryColor || '#10B981',
          fontFamily: response.data.fontFamily || 'Inter',
          contactEmail: response.data.contactEmail || '',
          contactPhone: response.data.contactPhone || '',
          address: response.data.address || '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await websiteSettingsService.updateSettings(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Website Settings</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Website Title
              </label>
              <input
                type="text"
                name="websiteTitle"
                value={formData.websiteTitle}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your School Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Website Description
              </label>
              <textarea
                name="websiteDescription"
                value={formData.websiteDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of your school"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
        </div>

        {/* Design Settings */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Design Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Theme Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="themeColor"
                  value={formData.themeColor}
                  onChange={handleChange}
                  className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.themeColor}
                  onChange={handleChange}
                  name="themeColor"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  name="primaryColor"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={handleChange}
                  className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={handleChange}
                  name="secondaryColor"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Font Family
              </label>
              <select
                name="fontFamily"
                value={formData.fontFamily}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Inter">Inter</option>
                <option value="Poppins">Poppins</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contact@school.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="School address"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

