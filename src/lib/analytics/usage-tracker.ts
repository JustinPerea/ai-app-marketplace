/**
 * Usage Tracking Service
 * 
 * IMPLEMENTATION REASONING:
 * Using localStorage-based tracking to avoid database complexity during development.
 * This captures real API usage events from provider testing and app usage.
 * Alternative database storage rejected because it adds complexity without immediate benefit.
 * This assumes localStorage persistence is acceptable for development/demo purposes.
 * If this breaks, check localStorage availability and data structure integrity.
 * 
 * DEPENDENCIES:
 * - Requires localStorage to be available (browser environment)
 * - Assumes API provider types match our enum definitions
 * - Performance: Minimal impact, only stores aggregated data
 */

export interface UsageEvent {
  id: string;
  provider: string;
  model?: string;
  timestamp: number;
  requestTokens: number;
  responseTokens: number;
  cost: number;
  latency: number;
  success: boolean;
  appId?: string;
  errorMessage?: string;
}

export interface UsageStats {
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  averageLatency: number;
  successRate: number;
  dailyUsage: Array<{
    date: string;
    requests: number;
    cost: number;
    tokens: number;
  }>;
  providerBreakdown: Array<{
    provider: string;
    requests: number;
    cost: number;
    tokens: number;
    averageLatency: number;
    successRate: number;
  }>;
  recentActivity: UsageEvent[];
}

const STORAGE_KEY = 'ai_marketplace_usage_events';
const MAX_EVENTS = 1000; // Limit stored events to prevent localStorage bloat

/**
 * Track a new API usage event
 */
export function trackUsageEvent(event: Omit<UsageEvent, 'id' | 'timestamp'>): void {
  try {
    const fullEvent: UsageEvent = {
      ...event,
      id: `usage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    const existingEvents = getStoredEvents();
    const updatedEvents = [fullEvent, ...existingEvents].slice(0, MAX_EVENTS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
    
    console.log('Usage event tracked:', {
      provider: fullEvent.provider,
      success: fullEvent.success,
      cost: fullEvent.cost,
      latency: fullEvent.latency,
    });
  } catch (error) {
    console.error('Failed to track usage event:', error);
    // Don't throw - tracking failures shouldn't break the app
  }
}

/**
 * Get stored usage events from localStorage
 */
function getStoredEvents(): UsageEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored) as UsageEvent[];
  } catch (error) {
    console.error('Failed to parse stored usage events:', error);
    return [];
  }
}

/**
 * Calculate comprehensive usage statistics
 */
export function getUsageStats(daysBack = 30): UsageStats {
  const events = getStoredEvents();
  const cutoffTime = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
  const recentEvents = events.filter(event => event.timestamp >= cutoffTime);

  if (recentEvents.length === 0) {
    return {
      totalRequests: 0,
      totalCost: 0,
      totalTokens: 0,
      averageLatency: 0,
      successRate: 0,
      dailyUsage: [],
      providerBreakdown: [],
      recentActivity: [],
    };
  }

  // Calculate totals
  const totalRequests = recentEvents.length;
  const totalCost = recentEvents.reduce((sum, event) => sum + event.cost, 0);
  const totalTokens = recentEvents.reduce((sum, event) => sum + event.requestTokens + event.responseTokens, 0);
  const averageLatency = recentEvents.reduce((sum, event) => sum + event.latency, 0) / totalRequests;
  const successRate = (recentEvents.filter(event => event.success).length / totalRequests) * 100;

  // Daily usage breakdown
  const dailyUsageMap = new Map<string, { requests: number; cost: number; tokens: number }>();
  
  recentEvents.forEach(event => {
    const date = new Date(event.timestamp).toISOString().split('T')[0];
    const existing = dailyUsageMap.get(date) || { requests: 0, cost: 0, tokens: 0 };
    
    dailyUsageMap.set(date, {
      requests: existing.requests + 1,
      cost: existing.cost + event.cost,
      tokens: existing.tokens + event.requestTokens + event.responseTokens,
    });
  });

  const dailyUsage = Array.from(dailyUsageMap.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Provider breakdown
  const providerMap = new Map<string, UsageEvent[]>();
  recentEvents.forEach(event => {
    const existing = providerMap.get(event.provider) || [];
    providerMap.set(event.provider, [...existing, event]);
  });

  const providerBreakdown = Array.from(providerMap.entries()).map(([provider, events]) => ({
    provider,
    requests: events.length,
    cost: events.reduce((sum, event) => sum + event.cost, 0),
    tokens: events.reduce((sum, event) => sum + event.requestTokens + event.responseTokens, 0),
    averageLatency: events.reduce((sum, event) => sum + event.latency, 0) / events.length,
    successRate: (events.filter(event => event.success).length / events.length) * 100,
  }));

  return {
    totalRequests,
    totalCost,
    totalTokens,
    averageLatency,
    successRate,
    dailyUsage,
    providerBreakdown,
    recentActivity: recentEvents.slice(0, 10), // Most recent 10 events
  };
}

/**
 * Clear all usage data (useful for development/testing)
 */
export function clearUsageData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Usage data cleared');
  } catch (error) {
    console.error('Failed to clear usage data:', error);
  }
}

/**
 * Export usage data for backup/analysis
 */
export function exportUsageData(): UsageEvent[] {
  return getStoredEvents();
}

/**
 * Import usage data from backup
 */
export function importUsageData(events: UsageEvent[]): void {
  try {
    const validEvents = events.filter(event => 
      event.id && 
      event.provider && 
      typeof event.timestamp === 'number' &&
      typeof event.cost === 'number'
    ).slice(0, MAX_EVENTS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validEvents));
    console.log(`Imported ${validEvents.length} usage events`);
  } catch (error) {
    console.error('Failed to import usage data:', error);
  }
}