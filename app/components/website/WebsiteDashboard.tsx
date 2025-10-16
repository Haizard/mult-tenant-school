'use client';

import React, { useState, useEffect } from 'react';
import { websitePageService } from '@/lib/websiteService';
import WebsitePageList from './WebsitePageList';
import WebsitePageForm from './WebsitePageForm';
import WebsiteSettings from './WebsiteSettings';

type TabType = 'pages' | 'settings' | 'analytics';

export default function WebsiteDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('pages');
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await websitePageService.getPages();
      if (response.success) {
        setPages(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = () => {
    setEditingPage(null);
    setShowForm(true);
  };

  const handleEditPage = (page: any) => {
    setEditingPage(page);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPage(null);
    loadPages();
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      await websitePageService.deletePage(pageId);
      loadPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete page');
    }
  };

  const handlePublishPage = async (pageId: string) => {
    try {
      await websitePageService.publishPage(pageId);
      loadPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish page');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Website Management</h1>
          <p className="text-slate-600">Manage your school's website pages, content, and settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'pages'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pages
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'pages' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Website Pages</h2>
                <button
                  onClick={handleCreatePage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Create Page
                </button>
              </div>

              {showForm ? (
                <WebsitePageForm
                  page={editingPage}
                  onClose={handleFormClose}
                />
              ) : (
                <WebsitePageList
                  pages={pages}
                  loading={loading}
                  onEdit={handleEditPage}
                  onDelete={handleDeletePage}
                  onPublish={handlePublishPage}
                />
              )}
            </>
          )}

          {activeTab === 'settings' && (
            <WebsiteSettings />
          )}

          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <p className="text-slate-600">Analytics coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

