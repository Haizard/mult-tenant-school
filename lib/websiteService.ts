import { apiService } from './apiService';

const API_BASE = '/api/website';

export interface WebsitePage {
  id: string;
  tenantId: string;
  pageName: string;
  pageSlug: string;
  pageType: 'HOME' | 'ADMISSION' | 'CONTACT' | 'GALLERY' | 'ABOUT' | 'CUSTOM';
  description?: string;
  isPublished: boolean;
  publishedAt?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export interface WebsiteContent {
  id: string;
  tenantId: string;
  pageId: string;
  contentType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FORM' | 'GALLERY';
  contentData: string;
  versionNumber: number;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface WebsiteGallery {
  id: string;
  tenantId: string;
  pageId?: string;
  imageUrl: string;
  imageTitle?: string;
  imageDescription?: string;
  imageAltText?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface WebsiteSettings {
  id: string;
  tenantId: string;
  websiteTitle?: string;
  websiteDescription?: string;
  logoUrl?: string;
  themeColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialMedia?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface WebsiteAnalytics {
  id: string;
  tenantId: string;
  pageId?: string;
  visitorIp?: string;
  userAgent?: string;
  referrer?: string;
  pageViews: number;
  sessionDuration?: number;
  visitedAt: string;
}

// ============ WEBSITE PAGES API ============

export const websitePageService = {
  /**
   * Get all website pages
   */
  async getPages(filters?: { status?: string; pageType?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.pageType) params.append('pageType', filters.pageType);

    const query = params.toString();
    const url = query ? `${API_BASE}/pages?${query}` : `${API_BASE}/pages`;

    return apiService.get<{ success: boolean; data: WebsitePage[]; count: number }>(url);
  },

  /**
   * Get a single website page
   */
  async getPage(id: string) {
    return apiService.get<{ success: boolean; data: WebsitePage }>(`${API_BASE}/pages/${id}`);
  },

  /**
   * Create a new website page
   */
  async createPage(data: {
    pageName: string;
    pageSlug: string;
    pageType: string;
    description?: string;
  }) {
    return apiService.post<{ success: boolean; data: WebsitePage }>(`${API_BASE}/pages`, data);
  },

  /**
   * Update a website page
   */
  async updatePage(
    id: string,
    data: {
      pageName?: string;
      pageSlug?: string;
      pageType?: string;
      description?: string;
      status?: string;
    }
  ) {
    return apiService.put<{ success: boolean; data: WebsitePage }>(`${API_BASE}/pages/${id}`, data);
  },

  /**
   * Delete a website page
   */
  async deletePage(id: string) {
    return apiService.delete<{ success: boolean; message: string }>(`${API_BASE}/pages/${id}`);
  },

  /**
   * Publish a website page
   */
  async publishPage(id: string) {
    return apiService.post<{ success: boolean; data: WebsitePage; message: string }>(
      `${API_BASE}/pages/${id}/publish`,
      {}
    );
  },
};

// ============ WEBSITE CONTENT API ============

export const websiteContentService = {
  /**
   * Get page content
   */
  async getPageContent(pageId: string) {
    return apiService.get<{ success: boolean; data: WebsiteContent[] }>(
      `${API_BASE}/content/${pageId}`
    );
  },

  /**
   * Create or update page content
   */
  async createPageContent(
    pageId: string,
    data: {
      contentType: string;
      contentData: Record<string, any>;
    }
  ) {
    return apiService.post<{ success: boolean; data: WebsiteContent }>(
      `${API_BASE}/content/${pageId}`,
      data
    );
  },
};

// ============ WEBSITE GALLERY API ============

export const websiteGalleryService = {
  /**
   * Get gallery images
   */
  async getImages(pageId?: string) {
    const params = new URLSearchParams();
    if (pageId) params.append('pageId', pageId);

    const query = params.toString();
    const url = query ? `${API_BASE}/gallery?${query}` : `${API_BASE}/gallery`;

    return apiService.get<{ success: boolean; data: WebsiteGallery[] }>(url);
  },

  /**
   * Upload gallery image
   */
  async uploadImage(data: {
    imageUrl: string;
    imageTitle?: string;
    imageDescription?: string;
    imageAltText?: string;
    pageId?: string;
    displayOrder?: number;
  }) {
    return apiService.post<{ success: boolean; data: WebsiteGallery }>(
      `${API_BASE}/gallery`,
      data
    );
  },

  /**
   * Delete gallery image
   */
  async deleteImage(id: string) {
    return apiService.delete<{ success: boolean; message: string }>(`${API_BASE}/gallery/${id}`);
  },
};

// ============ WEBSITE SETTINGS API ============

export const websiteSettingsService = {
  /**
   * Get website settings
   */
  async getSettings() {
    return apiService.get<{ success: boolean; data: WebsiteSettings }>(`${API_BASE}/settings`);
  },

  /**
   * Update website settings
   */
  async updateSettings(data: Partial<WebsiteSettings>) {
    return apiService.put<{ success: boolean; data: WebsiteSettings }>(
      `${API_BASE}/settings`,
      data
    );
  },
};

// ============ WEBSITE ANALYTICS API ============

export const websiteAnalyticsService = {
  /**
   * Get website analytics
   */
  async getAnalytics(filters?: {
    pageId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.pageId) params.append('pageId', filters.pageId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const query = params.toString();
    const url = query ? `${API_BASE}/analytics?${query}` : `${API_BASE}/analytics`;

    return apiService.get<{ success: boolean; data: WebsiteAnalytics[] }>(url);
  },

  /**
   * Track page view
   */
  async trackPageView(data: {
    pageId?: string;
    visitorIp?: string;
    userAgent?: string;
    referrer?: string;
  }) {
    return apiService.post<{ success: boolean; data: WebsiteAnalytics }>(
      `${API_BASE}/analytics/track`,
      data
    );
  },
};

