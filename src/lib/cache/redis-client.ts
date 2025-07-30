/**
 * Redis Client Configuration for AI Marketplace Platform
 * 
 * Implements distributed caching with Upstash Redis for 70% cost reduction
 * Compatible with Vercel deployment and Next.js 14+ App Router
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Redis configuration interface
export interface RedisConfig {
  url?: string;
  token?: string;
  defaultTTL: number;
  maxRetries: number;
  retryDelayMs: number;
  keyPrefix: string;
  enableCompression: boolean;
}

// Default Redis configuration
export const defaultRedisConfig: RedisConfig = {
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  defaultTTL: 3600, // 1 hour default
  maxRetries: 3,
  retryDelayMs: 100,
  keyPrefix: 'ai-marketplace:v1:',
  enableCompression: true,
};

// TTL strategies for different content types
export const TTL_STRATEGIES = {
  STATIC_CONTENT: 24 * 60 * 60,        // 24 hours - help content, FAQs
  TEMPLATE_BASED: 6 * 60 * 60,         // 6 hours - code reviews, summaries  
  USER_SPECIFIC: 60 * 60,              // 1 hour - personal recommendations
  DYNAMIC_CONTENT: 15 * 60,            // 15 minutes - real-time analysis
  PDF_PROCESSING: 48 * 60 * 60,        // 48 hours - expensive PDF operations
  AI_RESPONSES: 2 * 60 * 60,           // 2 hours - general AI responses
} as const;

// Cache entry interface
export interface CacheEntry {
  value: any;
  timestamp: number;
  ttl: number;
  compressed?: boolean;
}

// Resilient Redis client with fallback
export class ResilientRedisCache {
  private redis: Redis | null = null;
  private fallbackCache: Map<string, CacheEntry> = new Map();
  private config: RedisConfig;
  private isRedisAvailable: boolean = false;

  constructor(config: Partial<RedisConfig> = {}) {
    this.config = { ...defaultRedisConfig, ...config };
    this.initializeRedis();
  }

  private initializeRedis(): void {
    try {
      if (this.config.url && this.config.token) {
        this.redis = new Redis({
          url: this.config.url,
          token: this.config.token,
        });
        this.isRedisAvailable = true;
        console.log('🚀 Redis client initialized successfully');
      } else {
        console.warn('⚠️ Redis credentials not configured, using memory fallback');
        this.isRedisAvailable = false;
      }
    } catch (error) {
      console.error('❌ Redis initialization failed:', error);
      this.isRedisAvailable = false;
    }
  }

  private generateKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  private compressData(data: any): string {
    if (!this.config.enableCompression) {
      return JSON.stringify(data);
    }
    
    // Simple compression for JSON data
    const jsonString = JSON.stringify(data);
    
    // For now, just return JSON - can add actual compression later if needed
    return jsonString;
  }

  private decompressData(data: string): any {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to decompress data:', error);
      return null;
    }
  }

  async get(key: string): Promise<any | null> {
    const fullKey = this.generateKey(key);

    // Try Redis first
    if (this.redis && this.isRedisAvailable) {
      try {
        const result = await this.redis.get(fullKey);
        if (result) {
          return this.decompressData(result as string);
        }
      } catch (error) {
        console.warn('Redis get failed, using fallback:', error);
        this.isRedisAvailable = false;
      }
    }

    // Fallback to memory cache
    const fallbackEntry = this.fallbackCache.get(fullKey);
    if (fallbackEntry) {
      // Check if entry is still valid
      const now = Date.now();
      if (now - fallbackEntry.timestamp < fallbackEntry.ttl * 1000) {
        return fallbackEntry.value;
      } else {
        // Remove expired entry
        this.fallbackCache.delete(fullKey);
      }
    }

    return null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const fullKey = this.generateKey(key);
    const finalTTL = ttl || this.config.defaultTTL;
    const compressedValue = this.compressData(value);

    // Try Redis first
    if (this.redis && this.isRedisAvailable) {
      try {
        await this.redis.setex(fullKey, finalTTL, compressedValue);
        return;
      } catch (error) {
        console.warn('Redis set failed, using fallback:', error);
        this.isRedisAvailable = false;
      }
    }

    // Fallback to memory cache
    this.fallbackCache.set(fullKey, {
      value,
      timestamp: Date.now(),
      ttl: finalTTL,
    });

    // Clean up old entries periodically
    this.cleanupFallbackCache();
  }

  async del(key: string): Promise<number> {
    const fullKey = this.generateKey(key);

    let deletedCount = 0;

    // Try Redis first
    if (this.redis && this.isRedisAvailable) {
      try {
        deletedCount = await this.redis.del(fullKey);
      } catch (error) {
        console.warn('Redis delete failed:', error);
        this.isRedisAvailable = false;
      }
    }

    // Also remove from fallback
    if (this.fallbackCache.has(fullKey)) {
      this.fallbackCache.delete(fullKey);
      deletedCount = Math.max(deletedCount, 1);
    }

    return deletedCount;
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.get(key);
    return result !== null;
  }

  private cleanupFallbackCache(): void {
    const now = Date.now();
    const maxEntries = 1000; // Limit memory cache size

    // Remove expired entries
    for (const [key, entry] of this.fallbackCache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.fallbackCache.delete(key);
      }
    }

    // If still too many entries, remove oldest ones
    if (this.fallbackCache.size > maxEntries) {
      const entries = Array.from(this.fallbackCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, entries.length - maxEntries);
      for (const [key] of toRemove) {
        this.fallbackCache.delete(key);
      }
    }
  }

  async flushAll(): Promise<void> {
    if (this.redis && this.isRedisAvailable) {
      try {
        await this.redis.flushdb();
      } catch (error) {
        console.warn('Redis flush failed:', error);
      }
    }
    
    this.fallbackCache.clear();
  }

  getStats(): { 
    redisAvailable: boolean; 
    fallbackSize: number; 
    keyPrefix: string;
  } {
    return {
      redisAvailable: this.isRedisAvailable,
      fallbackSize: this.fallbackCache.size,
      keyPrefix: this.config.keyPrefix,
    };
  }
}

// Singleton instance
let redisInstance: ResilientRedisCache | null = null;

export function getRedisClient(config?: Partial<RedisConfig>): ResilientRedisCache {
  if (!redisInstance) {
    redisInstance = new ResilientRedisCache(config);
  }
  return redisInstance;
}

// Rate limiting instance
export const createRateLimit = (options: {
  requestsPerWindow: number;
  windowMs: number;
}) => {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(options.requestsPerWindow, `${options.windowMs}ms`),
      analytics: true,
    });
  }
  return null;
};

// Export default instance
export const redis = getRedisClient();