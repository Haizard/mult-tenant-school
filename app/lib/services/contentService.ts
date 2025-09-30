import { API_BASE_URL } from '../api';

export interface Content {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  content_type: 'document' | 'video' | 'presentation' | 'interactive' | 'resource';
  file_path?: string;
  file_url?: string;
  file_size?: number;
  mime_type?: string;
  category?: string;
  tags: string[];
  grade_level?: string;
  subject_id?: string;
  created_by: string;
  status: 'draft' | 'published' | 'archived';
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: Date;
  views_count: number;
  downloads_count: number;
  created_at: Date;
  updated_at: Date;
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  _count?: {
    assignments: number;
    usage: number;
    comments: number;
  };
}

export interface ContentAssignment {
  id: string;
  tenant_id: string;
  content_id: string;
  assigned_by: string;
  assignment_type: 'student' | 'class' | 'grade';
  target_id: string;
  assigned_at: Date;
  due_date?: Date;
  instructions?: string;
  is_mandatory: boolean;
  status: 'assigned' | 'viewed' | 'completed';
}

export interface ContentUsage {
  id: string;
  content_id: string;
  user_id: string;
  user_type: string;
  action_type: 'view' | 'download' | 'share' | 'comment';
  duration_seconds?: number;
  progress_percentage: number;
  device_info?: string;
  accessed_at: Date;
}

export interface ContentAnalytics {
  period: string;
  date_range: {
    start: Date;
    end: Date;
  };
  total_usage: Array<{
    action_type: string;
    _count: { id: number };
  }>;
  views_over_time: Array<{
    accessed_at: Date;
    _count: { id: number };
  }>;
  user_engagement: Array<{
    user_id: string;
    user_type: string;
    _count: { id: number };
  }>;
  device_stats: Array<{
    device_info: string;
    _count: { id: number };
  }>;
}

export interface ContentFilters {
  page?: number;
  limit?: number;
  content_type?: string;
  status?: string;
  grade_level?: string;
  subject_id?: string;
  search?: string;
  created_by?: string;
}

class ContentService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private getFormDataAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getAllContent(filters: ContentFilters = {}): Promise<{
    content: Content[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/content?${queryParams.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch content');
    }

    const result = await response.json();
    return result.data;
  }

  async getContentById(id: string): Promise<Content> {
    const response = await fetch(`${API_BASE_URL}/content/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch content');
    }

    const result = await response.json();
    return result.data;
  }

  async createContent(contentData: {
    title: string;
    description?: string;
    content_type: string;
    category?: string;
    tags?: string;
    grade_level?: string;
    subject_id?: string;
    file_url?: string;
    file?: File;
  }): Promise<Content> {
    const formData = new FormData();
    
    // Add text fields
    Object.entries(contentData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'file') {
        formData.append(key, value.toString());
      }
    });
    
    // Add file if provided
    if (contentData.file) {
      formData.append('file', contentData.file);
    }

    const response = await fetch(`${API_BASE_URL}/content`, {
      method: 'POST',
      headers: this.getFormDataAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create content');
    }

    const result = await response.json();
    return result.data;
  }

  async updateContent(id: string, contentData: {
    title?: string;
    description?: string;
    content_type?: string;
    category?: string;
    tags?: string;
    grade_level?: string;
    subject_id?: string;
    file_url?: string;
    status?: string;
    changes_description?: string;
    file?: File;
  }): Promise<Content> {
    const formData = new FormData();
    
    // Add text fields
    Object.entries(contentData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'file') {
        formData.append(key, value.toString());
      }
    });
    
    // Add file if provided
    if (contentData.file) {
      formData.append('file', contentData.file);
    }

    const response = await fetch(`${API_BASE_URL}/content/${id}`, {
      method: 'PUT',
      headers: this.getFormDataAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update content');
    }

    const result = await response.json();
    return result.data;
  }

  async deleteContent(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/content/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete content');
    }
  }

  async assignContent(id: string, assignmentData: {
    assignment_type: 'student' | 'class' | 'grade';
    target_ids: string[];
    due_date?: Date;
    instructions?: string;
    is_mandatory?: boolean;
  }): Promise<ContentAssignment[]> {
    const response = await fetch(`${API_BASE_URL}/content/${id}/assign`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to assign content');
    }

    const result = await response.json();
    return result.data;
  }

  async getContentAssignments(id: string): Promise<ContentAssignment[]> {
    const response = await fetch(`${API_BASE_URL}/content/${id}/assignments`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch assignments');
    }

    const result = await response.json();
    return result.data;
  }

  async getContentAnalytics(id: string, period: string = '30d'): Promise<ContentAnalytics> {
    const response = await fetch(`${API_BASE_URL}/content/${id}/analytics?period=${period}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch analytics');
    }

    const result = await response.json();
    return result.data;
  }

  async exportContentReport(options: {
    format?: 'csv' | 'json';
    content_ids?: string[];
    start_date?: Date;
    end_date?: Date;
    include_analytics?: boolean;
  } = {}): Promise<Blob | any> {
    const queryParams = new URLSearchParams();
    
    if (options.format) queryParams.append('format', options.format);
    if (options.content_ids) queryParams.append('content_ids', options.content_ids.join(','));
    if (options.start_date) queryParams.append('start_date', options.start_date.toISOString().split('T')[0]);
    if (options.end_date) queryParams.append('end_date', options.end_date.toISOString().split('T')[0]);
    if (options.include_analytics) queryParams.append('include_analytics', 'true');

    const response = await fetch(`${API_BASE_URL}/content/export?${queryParams.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to export report');
    }

    if (options.format === 'csv') {
      return await response.blob();
    } else {
      return await response.json();
    }
  }

  // Utility methods
  getFileDownloadUrl(filePath: string): string {
    return `${API_BASE_URL}/content/files/${filePath}`;
  }

  getContentTypeIcon(contentType: string): string {
    const icons = {
      document: '📄',
      video: '🎥',
      presentation: '📊',
      interactive: '🎮',
      resource: '📚'
    };
    return icons[contentType as keyof typeof icons] || '📄';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isValidFileType(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4',
      'video/avi',
      'video/mov',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/zip'
    ];
    return allowedTypes.includes(file.type);
  }
}

export const contentService = new ContentService();
