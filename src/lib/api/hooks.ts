'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { apiClient, ApiResponse } from './client';

// Generic fetcher function for SWR
const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

// Marketplace hooks
export function useMarketplaceApps(params?: { 
  category?: string; 
  search?: string; 
  sort?: string;
}) {
  const query = new URLSearchParams(params).toString();
  const key = `/marketplace/apps${query ? `?${query}` : ''}`;
  
  const { data, error, isLoading, mutate: refetch } = useSWR(key, fetcher);
  
  return {
    apps: data,
    error,
    isLoading,
    refetch,
  };
}

export function useMarketplaceApp(id: string) {
  const { data, error, isLoading, mutate: refetch } = useSWR(
    id ? `/marketplace/apps/${id}` : null,
    fetcher
  );
  
  return {
    app: data,
    error,
    isLoading,
    refetch,
  };
}

export function useInstallApp() {
  const installApp = async (id: string) => {
    try {
      const response = await apiClient.marketplace.installApp(id);
      // Revalidate related data
      mutate(key => typeof key === 'string' && key.startsWith('/marketplace/apps'));
      mutate('/users/profile');
      return response;
    } catch (error) {
      throw error;
    }
  };

  return { installApp };
}

// User hooks
export function useUserProfile() {
  const { data, error, isLoading, mutate: refetch } = useSWR('/users/profile', fetcher);
  
  return {
    profile: data,
    error,
    isLoading,
    refetch,
  };
}

export function useUserApiKeys() {
  const { data, error, isLoading, mutate: refetch } = useSWR('/users/api-keys', fetcher);
  
  return {
    apiKeys: data || [],
    error,
    isLoading,
    refetch,
  };
}

export function useAddApiKey() {
  const { refetch } = useUserApiKeys();
  
  const addApiKey = async (keyData: any) => {
    try {
      const response = await apiClient.users.addApiKey(keyData);
      // Revalidate API keys list
      refetch();
      return response;
    } catch (error) {
      throw error;
    }
  };

  return { addApiKey };
}

export function useDeleteApiKey() {
  const { refetch } = useUserApiKeys();
  
  const deleteApiKey = async (id: string) => {
    try {
      const response = await apiClient.users.deleteApiKey(id);
      // Revalidate API keys list
      refetch();
      return response;
    } catch (error) {
      throw error;
    }
  };

  return { deleteApiKey };
}

export function useUserUsage(period: string = 'month') {
  const { data, error, isLoading, mutate: refetch } = useSWR(
    `/users/usage?period=${period}`,
    fetcher
  );
  
  return {
    usage: data,
    error,
    isLoading,
    refetch,
  };
}

// Developer hooks
export function useDeveloperApps() {
  const { data, error, isLoading, mutate: refetch } = useSWR('/developers/apps', fetcher);
  
  return {
    apps: data || [],
    error,
    isLoading,
    refetch,
  };
}

export function useDeveloperApp(id: string) {
  const { data, error, isLoading, mutate: refetch } = useSWR(
    id ? `/developers/apps/${id}` : null,
    fetcher
  );
  
  return {
    app: data,
    error,
    isLoading,
    refetch,
  };
}

export function useCreateApp() {
  const { refetch } = useDeveloperApps();
  
  const createApp = async (appData: any) => {
    try {
      const response = await apiClient.developers.createApp(appData);
      // Revalidate apps list
      refetch();
      return response;
    } catch (error) {
      throw error;
    }
  };

  return { createApp };
}

export function useUpdateApp(id: string) {
  const { refetch } = useDeveloperApps();
  
  const updateApp = async (appData: any) => {
    try {
      const response = await apiClient.developers.updateApp(id, appData);
      // Revalidate apps list and individual app
      refetch();
      mutate(`/developers/apps/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  };

  return { updateApp };
}

export function useDeleteApp() {
  const { refetch } = useDeveloperApps();
  
  const deleteApp = async (id: string) => {
    try {
      const response = await apiClient.developers.deleteApp(id);
      // Revalidate apps list
      refetch();
      return response;
    } catch (error) {
      throw error;
    }
  };

  return { deleteApp };
}

export function useAppAnalytics(id: string, period: string = 'month') {
  const { data, error, isLoading, mutate: refetch } = useSWR(
    id ? `/developers/apps/${id}/analytics?period=${period}` : null,
    fetcher
  );
  
  return {
    analytics: data,
    error,
    isLoading,
    refetch,
  };
}

// Generic hooks for common patterns
export function useAsyncAction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (action: () => Promise<any>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await action();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading, error };
}

// Utility hook for optimistic updates
export function useOptimisticUpdate<T>(
  key: string,
  updateFn: (currentData: T, optimisticData: Partial<T>) => T
) {
  const optimisticUpdate = async (optimisticData: Partial<T>, asyncAction: () => Promise<any>) => {
    // Get current data
    const currentData = mutate(key);
    
    try {
      // Apply optimistic update
      mutate(key, updateFn(currentData, optimisticData), false);
      
      // Execute async action
      const result = await asyncAction();
      
      // Revalidate to get real data
      mutate(key);
      
      return result;
    } catch (error) {
      // Revert on error
      mutate(key, currentData, false);
      throw error;
    }
  };

  return { optimisticUpdate };
}