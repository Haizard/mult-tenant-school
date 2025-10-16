'use client';

import React, { useState, useEffect } from 'react';
import { websitePageService, WebsitePage } from '@/lib/websiteService';

interface WebsitePageFormProps {
  page?: WebsitePage | null;
  onClose: () => void;
}

export default function WebsitePageForm({ page, onClose }: WebsitePageFormProps) {
  const [formData, setFormData] = useState({
    pageName: '',
    pageSlug: '',
    pageType: 'CUSTOM',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (page) {
      setFormData({
        pageName: page.pageName,
        pageSlug: page.pageSlug,
        pageType: page.pageType,
        description: page.description || '',
      });
    }
  }, [page]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (page) {
        await websitePageService.updatePage(page.id, formData);
      } else {
        await websitePageService.createPage(formData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
      <h3 className="text-xl font-bold text-slate-900 mb-6">
        {page ? 'Edit Page' : 'Create New Page'}
      </h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Page Name *
          </label>
          <input
            type="text"
            name="pageName"
            value={formData.pageName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Home, About Us"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Page Slug *
          </label>
          <input
            type="text"
            name="pageSlug"
            value={formData.pageSlug}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., home, about-us"
          />
          <p className="text-xs text-slate-500 mt-1">URL-friendly identifier (lowercase, hyphens only)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Page Type *
          </label>
          <select
            name="pageType"
            value={formData.pageType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="HOME">Home</option>
            <option value="ADMISSION">Admission</option>
            <option value="CONTACT">Contact</option>
            <option value="GALLERY">Gallery</option>
            <option value="ABOUT">About</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Page description (optional)"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
          >
            {loading ? 'Saving...' : page ? 'Update Page' : 'Create Page'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

