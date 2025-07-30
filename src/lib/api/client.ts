// API client configuration and utilities
import { useUser } from '@auth0/nextjs-auth0';

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new ApiError({
          message: `HTTP error! status: ${response.status}`,
          status: response.status,
        });
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError({
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500,
      });
    }
  }

  // Generic CRUD operations
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Marketplace APIs
  marketplace = {
    getApps: (params?: { category?: string; search?: string; sort?: string }) => {
      const query = new URLSearchParams(params).toString();
      return this.get(`/marketplace/apps${query ? `?${query}` : ''}`);
    },
    
    getApp: (id: string) => this.get(`/marketplace/apps/${id}`),
    
    installApp: (id: string) => this.post(`/marketplace/apps/${id}/install`),
    
    uninstallApp: (id: string) => this.post(`/marketplace/apps/${id}/uninstall`),
  };

  // User APIs
  users = {
    getProfile: () => this.get('/users/profile'),
    
    updateProfile: (data: any) => this.put('/users/profile', data),
    
    getApiKeys: () => this.get('/users/api-keys'),
    
    addApiKey: (data: any) => this.post('/users/api-keys', data),
    
    deleteApiKey: (id: string) => this.delete(`/users/api-keys/${id}`),
    
    getUsage: (params?: { period?: string }) => {
      const query = new URLSearchParams(params).toString();
      return this.get(`/users/usage${query ? `?${query}` : ''}`);
    },
  };

  // Developer APIs
  developers = {
    getApps: () => this.get('/developers/apps'),
    
    getApp: (id: string) => this.get(`/developers/apps/${id}`),
    
    createApp: (data: any) => this.post('/developers/apps', data),
    
    updateApp: (id: string, data: any) => this.put(`/developers/apps/${id}`, data),
    
    deleteApp: (id: string) => this.delete(`/developers/apps/${id}`),
    
    getAnalytics: (id: string, params?: { period?: string }) => {
      const query = new URLSearchParams(params).toString();
      return this.get(`/developers/apps/${id}/analytics${query ? `?${query}` : ''}`);
    },
  };
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Custom error class
export class ApiError extends Error {
  status: number;
  code?: string;

  constructor({ message, status, code }: { message: string; status: number; code?: string }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Utility hook for API calls with authentication
export function useApiClient() {
  const { user, isLoading } = useUser();
  
  return {
    client: apiClient,
    isAuthenticated: !!user && !isLoading,
    isLoading,
  };
}