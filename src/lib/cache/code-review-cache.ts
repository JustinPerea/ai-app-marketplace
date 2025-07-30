/**
 * Code Review Cache Service
 * 
 * Specialized caching for expensive AI code review operations
 * Provides 100% cost savings on repeated code reviews
 */

import crypto from 'crypto';
import { getRedisClient, TTL_STRATEGIES, ResilientRedisCache } from './redis-client';
import { ReviewType, ProviderPreference } from '../code-review/complexity-analyzer';

// Code review result interface
export interface CodeReviewResult {
  review: string;
  metadata: {
    codeLength: number;
    language: string;
    complexity: string;
    estimatedTokens: number;
    selectedProvider: string;
    providerReason: string;
    processingTime: number;
    estimatedCost: number;
    processedAt: string;
    aiModel: string;
    aiProcessingTime: number;
    tokensUsed?: number;
    actualCost?: number;
    costOptimization?: any;
  };
}

// Code review cache configuration
export interface CodeReviewCacheConfig {
  enabled: boolean;
  ttlSeconds: number;
  maxCodeSizeKB: number;
  compressionEnabled: boolean;
  includeMetadata: boolean;
}

// Code review cache key components
interface CodeReviewCacheKey {
  codeHash: string;
  reviewTypeHash: string;
  preferenceHash: string;
  fullKey: string;
}

class CodeReviewCache {
  private redisCache: ResilientRedisCache | null = null;
  private memoryCache: Map<string, CodeReviewResult> = new Map();
  private config: CodeReviewCacheConfig;
  private isInitialized = false;

  constructor(config?: Partial<CodeReviewCacheConfig>) {
    this.config = {
      enabled: true,
      ttlSeconds: 86400 * 2, // 48 hours
      maxCodeSizeKB: 1024, // 1MB max code size
      compressionEnabled: true,
      includeMetadata: true,
      ...config
    };
  }

  /**
   * Initialize cache system with fallback strategy
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const redisClient = getRedisClient();
      if (redisClient) {
        this.redisCache = new ResilientRedisCache({
          enabled: this.config.enabled,
          ttl: TTL_STRATEGIES.MEDIUM,
          compressionThreshold: 1024, // 1KB
          maxSize: this.config.maxCodeSizeKB * 1024,
          namespace: 'code-review',
          fallbackToMemory: true
        });
        console.log('🔍 Code Review Cache initialized with Redis backend');
      } else {
        console.log('⚠️ Redis not available, using memory cache for code reviews');
      }
    } catch (error) {
      console.warn('Code review cache initialization failed, using memory fallback:', error);
    }

    this.isInitialized = true;
    console.log(`🔍 Code Review Cache initialized`, {
      enabled: this.config.enabled,
      ttl: `${this.config.ttlSeconds / 3600}h`,
      maxSize: `${this.config.maxCodeSizeKB}KB`
    });
  }

  /**
   * Generate comprehensive cache key for code review
   */
  private generateCacheKey(
    code: string,
    reviewType: ReviewType,
    preference: ProviderPreference
  ): CodeReviewCacheKey {
    // Create deterministic hash of code content
    const codeHash = crypto
      .createHash('sha256')
      .update(code.trim())
      .digest('hex')
      .substring(0, 16);

    // Hash review parameters
    const reviewTypeHash = crypto
      .createHash('md5')
      .update(reviewType)
      .digest('hex')
      .substring(0, 8);

    const preferenceHash = crypto
      .createHash('md5')
      .update(preference)
      .digest('hex')
      .substring(0, 8);

    const fullKey = `code:${codeHash}:${reviewTypeHash}:${preferenceHash}`;

    return {
      codeHash,
      reviewTypeHash,
      preferenceHash,
      fullKey
    };
  }

  /**
   * Get cached code review result
   */
  async get(
    code: string,
    reviewType: ReviewType,
    preference: ProviderPreference,
    userId: string
  ): Promise<CodeReviewResult | null> {
    await this.initialize();

    if (!this.config.enabled) {
      return null;
    }

    // Check code size limits
    const codeSizeKB = Buffer.byteLength(code, 'utf8') / 1024;
    if (codeSizeKB > this.config.maxCodeSizeKB) {
      console.log(`🔍 Code too large for caching: ${codeSizeKB.toFixed(1)}KB > ${this.config.maxCodeSizeKB}KB`);
      return null;
    }

    const cacheKey = this.generateCacheKey(code, reviewType, preference);
    
    try {
      // Try Redis cache first
      if (this.redisCache) {
        const cached = await this.redisCache.get<CodeReviewResult>(cacheKey.fullKey);
        if (cached) {
          console.log(`🎯 Redis cache hit for code review: ${cacheKey.codeHash}`);
          return cached;
        }
      }

      // Fallback to memory cache
      const memoryCached = this.memoryCache.get(cacheKey.fullKey);
      if (memoryCached) {
        console.log(`💾 Memory cache hit for code review: ${cacheKey.codeHash}`);
        return memoryCached;
      }

      console.log(`❌ Cache miss for code review: ${cacheKey.codeHash}`);
      return null;

    } catch (error) {
      console.error('Code review cache get error:', error);
      return null;
    }
  }

  /**
   * Store code review result in cache
   */
  async set(
    code: string,
    reviewType: ReviewType,
    preference: ProviderPreference,
    result: CodeReviewResult,
    userId: string
  ): Promise<void> {
    await this.initialize();

    if (!this.config.enabled) {
      return;
    }

    // Check code size limits
    const codeSizeKB = Buffer.byteLength(code, 'utf8') / 1024;
    if (codeSizeKB > this.config.maxCodeSizeKB) {
      console.log(`🔍 Code too large for caching: ${codeSizeKB.toFixed(1)}KB`);
      return;
    }

    const cacheKey = this.generateCacheKey(code, reviewType, preference);

    try {
      // Add caching metadata
      const cachedResult: CodeReviewResult = {
        ...result,
        metadata: {
          ...result.metadata,
          cachedAt: new Date().toISOString(),
          cacheKey: cacheKey.codeHash,
          contentHash: cacheKey.codeHash,
          reviewType,
          preference,
          codeSize: `${codeSizeKB.toFixed(2)}KB`,
          ttl: `${this.config.ttlSeconds / 3600}h`,
          estimatedCost: result.metadata.estimatedCost || 0
        }
      };

      // Store in Redis cache
      if (this.redisCache) {
        await this.redisCache.set(
          cacheKey.fullKey,
          cachedResult,
          this.config.ttlSeconds
        );
        console.log(`💾 Code review cached in Redis: ${cacheKey.codeHash} (${codeSizeKB.toFixed(1)}KB)`);
      } else {
        // Fallback to memory cache with size limits
        if (this.memoryCache.size >= 100) { // Limit memory cache size
          const firstKey = this.memoryCache.keys().next().value;
          this.memoryCache.delete(firstKey);
        }
        
        this.memoryCache.set(cacheKey.fullKey, cachedResult);
        console.log(`💾 Code review cached in memory: ${cacheKey.codeHash} (${codeSizeKB.toFixed(1)}KB)`);
        
        // Set TTL for memory cache
        setTimeout(() => {
          this.memoryCache.delete(cacheKey.fullKey);
        }, this.config.ttlSeconds * 1000);
      }

    } catch (error) {
      console.error('Code review cache set error:', error);
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  async getStats(): Promise<{
    enabled: boolean;
    backend: string;
    size: number;
    hitRate?: number;
    config: CodeReviewCacheConfig;
  }> {
    await this.initialize();

    let size = 0;
    let backend = 'memory';

    if (this.redisCache) {
      backend = 'redis';
      // Redis size would need additional implementation
    } else {
      size = this.memoryCache.size;
    }

    return {
      enabled: this.config.enabled,
      backend,
      size,
      config: this.config
    };
  }

  /**
   * Clear cache (for testing/maintenance)
   */
  async clear(): Promise<void> {
    await this.initialize();

    try {
      if (this.redisCache) {
        // Redis clear would need pattern-based deletion
        console.log('🧹 Redis code review cache clear not implemented');
      }
      
      this.memoryCache.clear();
      console.log('🧹 Code review memory cache cleared');
    } catch (error) {
      console.error('Code review cache clear error:', error);
    }
  }

  /**
   * Calculate potential cost savings from caching
   */
  calculateCostSavings(result: CodeReviewResult): {
    savedCost: number;
    savingsPercentage: number;
    message: string;
  } {
    const estimatedCost = result.metadata.estimatedCost || 0;
    const actualCost = result.metadata.actualCost || estimatedCost;

    return {
      savedCost: actualCost,
      savingsPercentage: 100,
      message: `Instant cache response saved $${actualCost.toFixed(4)} (100% cost reduction)`
    };
  }
}

// Global cache instance
let globalCodeReviewCache: CodeReviewCache | null = null;

/**
 * Get global code review cache instance
 */
export function getCodeReviewCache(config?: Partial<CodeReviewCacheConfig>): CodeReviewCache {
  if (!globalCodeReviewCache) {
    globalCodeReviewCache = new CodeReviewCache(config);
  }
  return globalCodeReviewCache;
}

/**
 * Reset global cache instance (for testing)
 */
export function resetCodeReviewCache(): void {
  globalCodeReviewCache = null;
}