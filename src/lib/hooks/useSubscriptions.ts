/**
 * Subscription Management Hooks
 * 
 * Custom hooks for managing app subscriptions including:
 * - Fetching user subscriptions
 * - Installing/uninstalling apps
 * - Subscription status checking
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface AppSubscription {
  id: string;
  userId: string;
  appId: string;
  status: 'ACTIVE' | 'CANCELLED' | 'PAUSED' | 'EXPIRED';
  startedAt: string;
  cancelledAt?: string;
  app: {
    id: string;
    name: string;
    slug: string;
    iconUrl?: string;
    category: string;
    pricing: string;
    price?: number;
    developer: {
      displayName: string;
      verified: boolean;
    };
  };
}

export interface SubscriptionApiResponse {
  subscriptions: AppSubscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SubscriptionState {
  subscriptions: AppSubscription[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Hook for managing user subscriptions
 */
export function useSubscriptions(status?: string) {
  const [state, setState] = useState<SubscriptionState>({
    subscriptions: [],
    loading: true,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
  });

  const fetchSubscriptions = useCallback(async (page = 1, limit = 10) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`/api/users/subscriptions?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const data: SubscriptionApiResponse = await response.json();

      setState(prev => ({
        ...prev,
        subscriptions: data.subscriptions,
        pagination: data.pagination,
        loading: false,
      }));

    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch subscriptions',
        loading: false,
      }));
    }
  }, [status]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const refetch = useCallback(() => {
    fetchSubscriptions(state.pagination.page, state.pagination.limit);
  }, [fetchSubscriptions, state.pagination.page, state.pagination.limit]);

  return {
    ...state,
    refetch,
    fetchPage: (page: number) => fetchSubscriptions(page, state.pagination.limit),
  };
}

/**
 * Hook for managing app installation
 */
export function useAppInstallation() {
  const [installing, setInstalling] = useState<Record<string, boolean>>({});
  const [uninstalling, setUninstalling] = useState<Record<string, boolean>>({});

  const installApp = useCallback(async (appId: string): Promise<boolean> => {
    try {
      setInstalling(prev => ({ ...prev, [appId]: true }));

      const response = await fetch('/api/users/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appId }),
      });

      if (!response.ok) {
        // Gracefully handle missing API endpoint during development
        if (response.status === 404) {
          toast.info('Demo Mode', {
            description: 'App installation API not yet implemented',
          });
          return true; // Simulate successful installation in demo mode
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to install app');
      }

      const result = await response.json();
      
      toast.success(result.message || 'App installed successfully!', {
        description: `You can now access ${result.subscription?.app?.name}`,
      });

      return true;

    } catch (error) {
      console.error('Error installing app:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to install app';
      toast.error('Installation failed', {
        description: errorMessage,
      });

      return false;

    } finally {
      setInstalling(prev => ({ ...prev, [appId]: false }));
    }
  }, []);

  const uninstallApp = useCallback(async (subscriptionId: string): Promise<boolean> => {
    try {
      setUninstalling(prev => ({ ...prev, [subscriptionId]: true }));

      const response = await fetch(`/api/users/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Gracefully handle missing API endpoint during development
        if (response.status === 404) {
          toast.info('Demo Mode', {
            description: 'App uninstallation API not yet implemented',
          });
          return true; // Simulate successful uninstallation in demo mode
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to uninstall app');
      }

      const result = await response.json();
      
      toast.success(result.message || 'App uninstalled successfully');

      return true;

    } catch (error) {
      console.error('Error uninstalling app:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to uninstall app';
      toast.error('Uninstallation failed', {
        description: errorMessage,
      });

      return false;

    } finally {
      setUninstalling(prev => ({ ...prev, [subscriptionId]: false }));
    }
  }, []);

  return {
    installing,
    uninstalling,
    installApp,
    uninstallApp,
  };
}

/**
 * Hook for checking if user has access to a specific app
 */
export function useAppAccess(appId: string | null) {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [subscription, setSubscription] = useState<AppSubscription | null>(null);

  useEffect(() => {
    if (!appId) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    const checkAccess = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/users/subscriptions?status=ACTIVE`);
        
        if (!response.ok) {
          throw new Error('Failed to check subscription status');
        }

        const data: SubscriptionApiResponse = await response.json();
        const userSubscription = data.subscriptions.find(
          sub => sub.appId === appId && sub.status === 'ACTIVE'
        );

        setHasAccess(!!userSubscription);
        setSubscription(userSubscription || null);

      } catch (error) {
        console.error('Error checking app access:', error);
        setHasAccess(false);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [appId]);

  return {
    hasAccess,
    loading,
    subscription,
  };
}

/**
 * Hook for subscription statistics and dashboard metrics
 */
export function useSubscriptionStats() {
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    recentInstalls: 0,
    activeKeys: 4, // Mock data - will be replaced with real API call
    monthlySpend: 147.32, // Mock data - will be replaced with real API call
    totalUsage: 89432, // Mock data - will be replaced with real API call
    trends: {
      apps: 2,
      spend: -12.5,
      usage: 18.7
    },
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [totalResponse, activeResponse] = await Promise.all([
          fetch('/api/users/subscriptions'),
          fetch('/api/users/subscriptions?status=ACTIVE'),
        ]);

        if (totalResponse.ok && activeResponse.ok) {
          const [totalData, activeData] = await Promise.all([
            totalResponse.json(),
            activeResponse.json(),
          ]);

          // Calculate recent installs (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const recentInstalls = totalData.subscriptions.filter((sub: AppSubscription) =>
            new Date(sub.startedAt) > thirtyDaysAgo
          ).length;

          setStats({
            totalSubscriptions: totalData.pagination.total,
            activeSubscriptions: activeData.pagination.total,
            recentInstalls,
            // TODO: Replace these with real API calls when endpoints are available
            activeKeys: 4,
            monthlySpend: 147.32,
            totalUsage: 89432,
            trends: {
              apps: 2,
              spend: -12.5,
              usage: 18.7
            },
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error fetching subscription stats:', error);
        setStats(prev => ({ 
          ...prev, 
          loading: false,
          // Ensure we still provide the expected structure even on error
          activeKeys: 4,
          monthlySpend: 147.32,
          totalUsage: 89432,
          trends: {
            apps: 2,
            spend: -12.5,
            usage: 18.7
          }
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
}