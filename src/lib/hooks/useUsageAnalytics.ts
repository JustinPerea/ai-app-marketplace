/**
 * Usage Analytics Hook
 * 
 * IMPLEMENTATION REASONING:
 * Provides real usage statistics to React components from localStorage tracking.
 * Uses client-side tracking to avoid database complexity during development.
 * Alternative server-side approach rejected because localStorage is browser-only.
 * This assumes usage-tracker service is working and localStorage is available.
 * If this breaks, check browser localStorage support and usage-tracker imports.
 * 
 * DEPENDENCIES:
 * - Requires usage-tracker service for data retrieval and tracking
 * - Assumes React environment with useState and useEffect hooks
 * - Performance: Minimal impact, only processes cached localStorage data
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUsageStats, trackUsageEvent, clearUsageData, UsageStats, UsageEvent } from '@/lib/analytics/usage-tracker';

export interface UseUsageAnalyticsResult {
  stats: UsageStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  trackEvent: (event: Omit<UsageEvent, 'id' | 'timestamp'>) => void;
  clearData: () => void;
}

/**
 * Hook to manage usage analytics data and tracking
 */
export function useUsageAnalytics(daysBack = 30): UseUsageAnalyticsResult {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      
      const usageStats = getUsageStats(daysBack);
      setStats(usageStats);
      
      console.log('Usage analytics refreshed:', {
        totalRequests: usageStats.totalRequests,
        totalCost: usageStats.totalCost,
        providersActive: usageStats.providerBreakdown.length,
      });
      
    } catch (err) {
      console.error('Failed to fetch usage analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load usage data');
    } finally {
      setLoading(false);
    }
  }, [daysBack]);

  const trackEvent = useCallback((event: Omit<UsageEvent, 'id' | 'timestamp'>) => {
    try {
      trackUsageEvent(event);
      // Refresh stats after tracking new event
      refresh();
    } catch (err) {
      console.error('Failed to track usage event:', err);
      setError(err instanceof Error ? err.message : 'Failed to track event');
    }
  }, [refresh]);

  const clearData = useCallback(() => {
    try {
      clearUsageData();
      refresh(); // Refresh to show cleared state
    } catch (err) {
      console.error('Failed to clear usage data:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear data');
    }
  }, [refresh]);

  // Load initial data
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    stats,
    loading,
    error,
    refresh,
    trackEvent,
    clearData,
  };
}

/**
 * Hook for just tracking events without analytics data
 */
export function useUsageTracking() {
  const trackEvent = useCallback((event: Omit<UsageEvent, 'id' | 'timestamp'>) => {
    try {
      trackUsageEvent(event);
    } catch (err) {
      console.error('Failed to track usage event:', err);
    }
  }, []);

  return { trackEvent };
}

/**
 * Hook to get provider-specific analytics
 */
export function useProviderAnalytics(provider: string, daysBack = 30) {
  const { stats, loading, error, refresh } = useUsageAnalytics(daysBack);
  
  const providerStats = stats?.providerBreakdown.find(p => p.provider === provider);
  const providerActivity = stats?.recentActivity.filter(event => event.provider === provider) || [];
  
  return {
    providerStats,
    providerActivity,
    loading,
    error,
    refresh,
  };
}