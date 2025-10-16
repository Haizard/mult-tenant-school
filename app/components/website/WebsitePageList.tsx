'use client';

import React from 'react';
import { WebsitePage } from '@/lib/websiteService';

interface WebsitePageListProps {
  pages: WebsitePage[];
  loading: boolean;
  onEdit: (page: WebsitePage) => void;
  onDelete: (pageId: string) => void;
  onPublish: (pageId: string) => void;
}

export default function WebsitePageList({
  pages,
  loading,
  onEdit,
  onDelete,
  onPublish,
}: WebsitePageListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">No pages created yet</p>
        <p className="text-sm text-slate-500">Create your first page to get started</p>
      </div>
    );
  }

  const getPageTypeColor = (pageType: string) => {
    const colors: Record<string, string> = {
      HOME: 'bg-blue-100 text-blue-800',
      ADMISSION: 'bg-green-100 text-green-800',
      CONTACT: 'bg-purple-100 text-purple-800',
      GALLERY: 'bg-pink-100 text-pink-800',
      ABOUT: 'bg-yellow-100 text-yellow-800',
      CUSTOM: 'bg-gray-100 text-gray-800',
    };
    return colors[pageType] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-yellow-100 text-yellow-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-semibold text-slate-900">Page Name</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900">Type</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900">Published</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900">Created</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="py-3 px-4">
                <div>
                  <p className="font-medium text-slate-900">{page.pageName}</p>
                  <p className="text-sm text-slate-500">/{page.pageSlug}</p>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPageTypeColor(page.pageType)}`}>
                  {page.pageType}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(page.status)}`}>
                  {page.status}
                </span>
              </td>
              <td className="py-3 px-4">
                {page.isPublished ? (
                  <span className="text-green-600 font-medium">✓ Published</span>
                ) : (
                  <span className="text-slate-500">Draft</span>
                )}
              </td>
              <td className="py-3 px-4 text-sm text-slate-600">
                {new Date(page.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(page)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                  {!page.isPublished && (
                    <button
                      onClick={() => onPublish(page.id)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(page.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

