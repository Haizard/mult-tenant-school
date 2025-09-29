// API Configuration and Base Service
// FORCE API to use Next.js routes, ignore environment variable
const API_BASE_URL = "/api";

// CRITICAL CACHE BUSTING - Updated API configuration
const API_VERSION = "v3.0.0-CACHE-BUST-" + Date.now();
const CACHE_BUST_ID = Math.random().toString(36).substring(7);

console.log("🔥 CACHE BUSTED API Service - Version:", API_VERSION);
console.log("🔥 Cache Bust ID:", CACHE_BUST_ID);
console.log("🔥 API Base URL:", API_BASE_URL);
console.log("🔥 FORCED TO USE /api - IGNORING ENVIRONMENT VARIABLE");
console.log("🔥 Environment NEXT_PUBLIC_API_URL (IGNORED):", process.env.NEXT_PUBLIC_API_URL);

// Force reload marker
if (typeof window !== 'undefined') {
  console.log("🔥 BROWSER DETECTED - If you see localhost:5000 in any requests, HARD REFRESH NOW!");
  window.__API_CACHE_BUST = CACHE_BUST_ID;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
  pagination?: PaginationInfo;
  responseText?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: PaginationInfo;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = this.getStoredToken();
    
    // AGGRESSIVE CACHE BUSTING
    console.log("🔥🔥🔥 API SERVICE CONSTRUCTOR - CACHE BUSTED VERSION 🔥🔥🔥");
    console.log("🔥 Base URL:", this.baseURL);
    console.log("🔥 Version:", API_VERSION);
    console.log("🔥 Cache Bust ID:", CACHE_BUST_ID);
    
    if (typeof window !== 'undefined') {
      console.log("🔥 BROWSER ENVIRONMENT - Checking for cached API service...");
      
      // Clear localStorage API cache if any
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('api_cache')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log("🔥 Cleared", keysToRemove.length, "cached API entries");
      console.log("🔥 If you still see localhost:5000, perform a HARD REFRESH (Ctrl+Shift+R)");
    }
  }

  private getStoredToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  public setToken(token: string | null): void {
    console.log("Setting auth token:", !!token);
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);
        console.log("Token saved to localStorage");
      } else {
        localStorage.removeItem("auth_token");
        console.log("Token removed from localStorage");
      }
    }
  }

  public getToken(): string | null {
    if (!this.token) {
      // Try to get token from localStorage as a fallback
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("auth_token");
        if (storedToken) {
          console.log("Retrieved token from localStorage");
          this.token = storedToken;
        }
      }
    }
    console.log("Getting auth token:", !!this.token);
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    // Remove leading slash from endpoint to avoid double slashes
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;
    const url = `${this.baseURL}/${cleanEndpoint}`;

    console.log("🔥🔥🔥 API SERVICE REQUEST - CACHE BUSTED 🔥🔥🔥", {
      baseURL: this.baseURL,
      endpoint,
      cleanEndpoint,
      finalUrl: url,
      version: API_VERSION,
      cacheBustId: CACHE_BUST_ID,
      timestamp: new Date().toISOString(),
    });
    
    // CRITICAL: Alert if still using localhost:5000
    if (url.includes('localhost:5000')) {
      console.error("🚨🚨🚨 CRITICAL ERROR: Still using localhost:5000! 🚨🚨🚨");
      console.error("🚨 This means your browser is using cached JavaScript!");
      console.error("🚨 SOLUTION: Perform a HARD REFRESH (Ctrl+Shift+R or Ctrl+F5)");
      console.error("🚨 Or open an incognito/private window");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    console.log("API Request:", {
      url,
      method: options.method || "GET",
      headers: {
        ...headers,
        Authorization: headers["Authorization"] ? "[REDACTED]" : undefined,
      },
      body: options.body,
    });

    try {
      // Test basic connectivity first
      console.log("Testing connectivity to:", url);

      const response = await fetch(url, {
        ...options,
        headers,
        mode: "cors", // Explicitly set CORS mode
        credentials: "include", // Include credentials for CORS
      });

      console.log("API Response:", {
        url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      let data;
      let responseText;
      try {
        responseText = await response.text();
        console.log("Response body:", responseText);

        if (responseText) {
          data = JSON.parse(responseText);
        } else {
          data = {};
        }
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        console.error("Response text:", responseText);
        return {
          success: false,
          message: "Invalid response from server",
          error: "JSON_PARSE_ERROR",
          responseText: responseText,
        };
      }

      if (!response.ok) {
        console.error(
          "API Error:",
          JSON.stringify(
            {
              url,
              status: response.status,
              statusText: response.statusText,
              data,
            },
            null,
            2,
          ),
        );
        return {
          success: false,
          message:
            data?.message || `HTTP ${response.status}: ${response.statusText}`,
          error: data?.error || "HTTP_ERROR",
          errors: data?.errors,
          responseText: responseText,
        };
      }

      // If response is an array, return it directly as data
      if (Array.isArray(data)) {
        return {
          success: true,
          message: "Success",
          data: data,
        };
      }

      return {
        success: true,
        message: data.message || "Success",
        data: data.data || data,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error("API Request Error Details:", {
        error,
        errorName: error instanceof Error ? error.name : "Unknown",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        url,
        baseURL: this.baseURL,
      });

      // More specific error handling
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        return {
          success: false,
          message:
            "Cannot connect to server. Please check if the backend is running on port 5000.",
          error: "CONNECTION_REFUSED",
        };
      }

      return {
        success: false,
        message: "Network error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  public async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  public async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  public async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiService = new ApiService();
export default apiService;
