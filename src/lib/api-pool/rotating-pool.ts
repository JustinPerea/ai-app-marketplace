/**
 * Rotating API Pool Manager
 * 
 * Manages shared API keys for instant zero-friction access
 * Implements fair quota distribution and automatic rotation
 */

import { z } from 'zod';

// Pool configuration schema
const PoolConfigSchema = z.object({
  projectId: z.string(),
  provider: z.enum(['google', 'openai', 'anthropic']),
  apiKey: z.string(),
  dailyLimit: z.number().positive(),
  usedToday: z.number().nonnegative().default(0),
  lastReset: z.date().default(() => new Date()),
  status: z.enum(['active', 'exhausted', 'error']).default('active'),
  priority: z.number().int().min(1).max(10).default(5)
});

export type PoolConfig = z.infer<typeof PoolConfigSchema>;

// User quota tracking
const UserQuotaSchema = z.object({
  userId: z.string(),
  requestsToday: z.number().nonnegative().default(0),
  lastRequest: z.date().optional(),
  tier: z.enum(['instant', 'connected', 'paid']).default('instant')
});

export type UserQuota = z.infer<typeof UserQuotaSchema>;

// Request result
export interface PoolRequestResult {
  success: boolean;
  pool?: PoolConfig;
  provider?: string;
  error?: string;
  quotaRemaining?: number;
  upgradePrompt?: {
    title: string;
    message: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    benefits: string[];
  };
}

export class RotatingAPIPool {
  private pools: PoolConfig[] = [];
  private userQuotas: Map<string, UserQuota> = new Map();
  private readonly INSTANT_DAILY_LIMIT = 25;
  private readonly POOL_RESET_TIME = '00:00'; // Midnight UTC

  constructor() {
    this.initializePools();
    this.scheduleReset();
  }

  /**
   * Initialize API pools with platform keys
   * These would be loaded from environment variables in production
   */
  private initializePools() {
    // Example pools - in production, these would come from secure storage
    const poolConfigs = [
      {
        projectId: 'marketplace-pool-1',
        provider: 'google' as const,
        apiKey: process.env.GOOGLE_POOL_KEY_1 || 'placeholder-key-1',
        dailyLimit: 1500,
        priority: 1
      },
      {
        projectId: 'marketplace-pool-2', 
        provider: 'google' as const,
        apiKey: process.env.GOOGLE_POOL_KEY_2 || 'placeholder-key-2',
        dailyLimit: 1500,
        priority: 2
      },
      {
        projectId: 'marketplace-pool-3',
        provider: 'openai' as const,
        apiKey: process.env.OPENAI_POOL_KEY_1 || 'placeholder-key-3',
        dailyLimit: 10000,
        priority: 3
      },
      {
        projectId: 'marketplace-pool-4',
        provider: 'anthropic' as const,
        apiKey: process.env.ANTHROPIC_POOL_KEY_1 || 'placeholder-key-4',
        dailyLimit: 5000,
        priority: 4
      }
    ];

    this.pools = poolConfigs.map(config => 
      PoolConfigSchema.parse({
        ...config,
        usedToday: 0,
        lastReset: new Date(),
        status: 'active'
      })
    );
  }

  /**
   * Get available API key for request
   */
  async getAvailableKey(
    userId: string,
    preferredProvider?: string,
    requestsNeeded: number = 1
  ): Promise<PoolRequestResult> {
    // Check user quota first
    const userQuota = this.getUserQuota(userId);
    
    // Instant tier users have 25 requests/day limit
    if (userQuota.tier === 'instant' && 
        userQuota.requestsToday + requestsNeeded > this.INSTANT_DAILY_LIMIT) {
      return this.generateUpgradePrompt(userQuota);
    }

    // Try preferred provider first
    if (preferredProvider) {
      const preferredPool = this.findAvailablePool(preferredProvider, requestsNeeded);
      if (preferredPool) {
        this.updatePoolUsage(preferredPool, requestsNeeded);
        this.updateUserQuota(userId, requestsNeeded);
        
        return {
          success: true,
          pool: preferredPool,
          provider: preferredProvider,
          quotaRemaining: this.INSTANT_DAILY_LIMIT - (userQuota.requestsToday + requestsNeeded)
        };
      }
    }

    // Fallback to any available pool (cost-optimized order)
    const availablePool = this.findAvailablePool(null, requestsNeeded);
    if (!availablePool) {
      return {
        success: false,
        error: 'All pools exhausted for today',
        upgradePrompt: {
          title: 'Daily limit reached',
          message: 'Connect your provider to continue instantly',
          urgency: 'critical',
          benefits: ['60x more requests', 'Priority processing', 'Advanced features']
        }
      };
    }

    this.updatePoolUsage(availablePool, requestsNeeded);
    this.updateUserQuota(userId, requestsNeeded);

    return {
      success: true,
      pool: availablePool,
      provider: availablePool.provider,
      quotaRemaining: this.INSTANT_DAILY_LIMIT - (userQuota.requestsToday + requestsNeeded)
    };
  }

  /**
   * Find available pool with capacity
   */
  private findAvailablePool(preferredProvider?: string | null, requestsNeeded: number = 1): PoolConfig | null {
    let candidatePools = this.pools.filter(pool => 
      pool.status === 'active' && 
      pool.usedToday + requestsNeeded <= pool.dailyLimit
    );

    // Filter by preferred provider if specified
    if (preferredProvider) {
      candidatePools = candidatePools.filter(pool => pool.provider === preferredProvider);
    }

    // Sort by priority (lower number = higher priority), then by usage
    candidatePools.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.usedToday - b.usedToday;
    });

    return candidatePools[0] || null;
  }

  /**
   * Update pool usage tracking
   */
  private updatePoolUsage(pool: PoolConfig, requestsUsed: number) {
    pool.usedToday += requestsUsed;
    
    // Mark as exhausted if at limit
    if (pool.usedToday >= pool.dailyLimit) {
      pool.status = 'exhausted';
    }
  }

  /**
   * Get or create user quota tracking
   */
  private getUserQuota(userId: string): UserQuota {
    if (!this.userQuotas.has(userId)) {
      this.userQuotas.set(userId, {
        userId,
        requestsToday: 0,
        tier: 'instant'
      });
    }
    
    const quota = this.userQuotas.get(userId)!;
    
    // Reset if new day
    if (this.isNewDay(quota.lastRequest)) {
      quota.requestsToday = 0;
    }
    
    return quota;
  }

  /**
   * Update user quota usage
   */
  private updateUserQuota(userId: string, requestsUsed: number) {
    const quota = this.getUserQuota(userId);
    quota.requestsToday += requestsUsed;
    quota.lastRequest = new Date();
  }

  /**
   * Generate upgrade prompt based on usage
   */
  private generateUpgradePrompt(userQuota: UserQuota): PoolRequestResult {
    const remaining = this.INSTANT_DAILY_LIMIT - userQuota.requestsToday;
    
    if (remaining <= 0) {
      return {
        success: false,
        error: 'Daily limit reached',
        upgradePrompt: {
          title: 'Daily limit reached',
          message: 'Connect your provider for 1,500+ daily requests',
          urgency: 'critical',
          benefits: [
            '60x more requests (1,500+ vs 25)',
            'Priority processing',
            'No sharing with others',
            'Advanced orchestration features'
          ]
        }
      };
    }

    if (remaining <= 5) {
      return {
        success: false,
        error: 'Approaching daily limit',
        upgradePrompt: {
          title: `Only ${remaining} requests left today! 🚨`,
          message: 'Connect your provider for unlimited requests',
          urgency: 'high',
          benefits: [
            '60x more requests',
            'Priority processing', 
            'Dedicated quota'
          ]
        }
      };
    }

    // This shouldn't happen, but just in case
    return {
      success: false,
      error: 'Quota check failed'
    };
  }

  /**
   * Check if it's a new day since last request
   */
  private isNewDay(lastRequest?: Date): boolean {
    if (!lastRequest) return false;
    
    const now = new Date();
    const last = new Date(lastRequest);
    
    return now.getUTCDate() !== last.getUTCDate() ||
           now.getUTCMonth() !== last.getUTCMonth() ||
           now.getUTCFullYear() !== last.getUTCFullYear();
  }

  /**
   * Schedule daily reset of pool quotas
   */
  private scheduleReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    
    const msUntilReset = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.resetDailyQuotas();
      // Schedule next reset
      setInterval(() => this.resetDailyQuotas(), 24 * 60 * 60 * 1000);
    }, msUntilReset);
  }

  /**
   * Reset daily quotas for all pools and users
   */
  private resetDailyQuotas() {
    console.log('Resetting daily quotas for API pools');
    
    // Reset pool quotas
    this.pools.forEach(pool => {
      pool.usedToday = 0;
      pool.status = 'active';
      pool.lastReset = new Date();
    });

    // Reset user quotas  
    this.userQuotas.forEach(quota => {
      quota.requestsToday = 0;
    });
  }

  /**
   * Get pool status for monitoring
   */
  getPoolStatus() {
    return {
      pools: this.pools.map(pool => ({
        projectId: pool.projectId,
        provider: pool.provider,
        usedToday: pool.usedToday,
        dailyLimit: pool.dailyLimit,
        status: pool.status,
        utilizationPercent: Math.round((pool.usedToday / pool.dailyLimit) * 100)
      })),
      totalUsers: this.userQuotas.size,
      totalRequestsToday: Array.from(this.userQuotas.values())
        .reduce((sum, quota) => sum + quota.requestsToday, 0)
    };
  }

  /**
   * Update user tier (when they connect OAuth or add API keys)
   */
  updateUserTier(userId: string, tier: 'instant' | 'connected' | 'paid') {
    const quota = this.getUserQuota(userId);
    quota.tier = tier;
  }

  /**
   * Check if user has upgrade prompts available
   */
  shouldShowUpgradePrompt(userId: string): boolean {
    const quota = this.getUserQuota(userId);
    return quota.tier === 'instant' && quota.requestsToday >= 20; // Show at 80% usage
  }
}

// Singleton instance
export const rotatingPool = new RotatingAPIPool();