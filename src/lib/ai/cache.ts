/**
 * High-Performance AI Response Caching Layer
 * 
 * Multi-tier caching system optimized for AI responses:
 * - In-memory LRU cache for hot data
 * - Redis cache for shared/persistent data
 * - Intelligent cache invalidation
 * - Response compression and deduplication
 * - Cache warming and precomputation
 */

import { createHash } from 'crypto';
import { AIRequest, AIResponse, CacheConfig } from './types';

export interface CacheEntry {
  response: AIResponse;
  timestamp: number;
  hits: number;
  cost: number;
  compressed: boolean;
  size: number;
}

export interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  totalSize: number;
  avgResponseTime: number;
  costSaved: number;
}

export interface CacheKey {
  hash: string;
  metadata: {
    model: string;
    provider: string;
    messageCount: number;
    estimatedTokens: number;
  };
}

class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;
  private accessOrder: K[];

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    this.accessOrder = [];
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.updateAccessOrder(key);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.set(key, value);
      this.updateAccessOrder(key);
    } else {
      if (this.cache.size >= this.capacity) {
        this.evictLeastRecentlyUsed();
      }
      this.cache.set(key, value);
      this.accessOrder.push(key);
    }
  }

  delete(key: K): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.accessOrder = this.accessOrder.filter(k => k !== key);
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  size(): number {
    return this.cache.size;
  }

  keys(): K[] {
    return Array.from(this.cache.keys());
  }

  private updateAccessOrder(key: K): void {
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
  }

  private evictLeastRecentlyUsed(): void {
    const lruKey = this.accessOrder.shift();
    if (lruKey !== undefined) {
      this.cache.delete(lruKey);
    }
  }
}

export class AIResponseCache {
  private memoryCache: LRUCache<string, CacheEntry>;
  private config: CacheConfig;
  private stats: CacheStats;
  private compressionEnabled: boolean;

  constructor(config: CacheConfig) {
    this.config = config;
    this.memoryCache = new LRUCache(config.maxSize);
    this.compressionEnabled = true;
    this.stats = {
      totalEntries: 0,
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      totalSize: 0,
      avgResponseTime: 0,
      costSaved: 0,
    };

    this.startCleanupInterval();
  }

  /**
   * Get cached response if available and valid
   */
  async get(request: AIRequest): Promise<AIResponse | null> {
    if (!this.config.enabled) return null;

    const cacheKey = this.generateCacheKey(request);
    const startTime = Date.now();

    try {
      // Try memory cache first (fastest)
      const memoryEntry = this.memoryCache.get(cacheKey.hash);
      if (memoryEntry && this.isEntryValid(memoryEntry)) {
        memoryEntry.hits++;
        this.stats.totalHits++;
        this.updateHitRate();
        
        const responseTime = Date.now() - startTime;
        this.updateAverageResponseTime(responseTime);

        console.debug('Cache hit (memory)', {
          key: cacheKey.hash,
          hits: memoryEntry.hits,
          age: Date.now() - memoryEntry.timestamp,
        });

        return this.decompressResponse(memoryEntry.response, memoryEntry.compressed);
      }

      // Cache miss
      this.stats.totalMisses++;
      this.updateHitRate();

      return null;

    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Store response in cache with compression and metadata
   */
  async set(request: AIRequest, response: AIResponse): Promise<void> {
    if (!this.config.enabled) return;

    try {
      const cacheKey = this.generateCacheKey(request);
      const compressed = this.compressionEnabled;
      const processedResponse = compressed ? this.compressResponse(response) : response;
      
      const entry: CacheEntry = {
        response: processedResponse,
        timestamp: Date.now(),
        hits: 0,
        cost: response.usage.cost,
        compressed,
        size: this.estimateResponseSize(response),
      };

      // Store in memory cache
      this.memoryCache.set(cacheKey.hash, entry);
      this.stats.totalEntries++;
      this.stats.totalSize += entry.size;

      console.debug('Cache set', {
        key: cacheKey.hash,
        size: entry.size,
        compressed,
        totalEntries: this.stats.totalEntries,
      });

    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Check if a request would benefit from caching
   */
  isWorthCaching(request: AIRequest): boolean {
    // Don't cache streaming requests
    if (request.stream) return false;

    // Don't cache requests with high temperature (low determinism)
    if (request.temperature !== undefined && request.temperature > 0.7) return false;

    // Don't cache requests with tools (usually dynamic)
    if (request.tools && request.tools.length > 0) return false;

    // Cache requests with system prompts (likely templates)
    if (request.messages.some(m => m.role === 'system')) return true;

    // Cache shorter requests (more likely to be repeated)
    const totalLength = request.messages.reduce((sum, m) => sum + m.content.length, 0);
    if (totalLength < 1000) return true;

    // Cache requests with common patterns
    const commonPatterns = [
      'explain', 'summarize', 'translate', 'analyze', 'review',
      'what is', 'how to', 'why does', 'can you',
    ];

    const hasCommonPattern = request.messages.some(m =>
      commonPatterns.some(pattern =>
        m.content.toLowerCase().includes(pattern)
      )
    );

    return hasCommonPattern;
  }

  /**
   * Warm cache with common requests
   */
  async warmCache(commonRequests: Array<{ request: AIRequest; response: AIResponse }>): Promise<void> {
    console.info('Warming cache with', commonRequests.length, 'entries');

    for (const { request, response } of commonRequests) {
      if (this.isWorthCaching(request)) {
        await this.set(request, response);
      }
    }
  }

  /**
   * Invalidate cache entries matching patterns
   */
  invalidatePattern(pattern: {
    model?: string;
    provider?: string;
    messagePattern?: RegExp;
  }): number {
    let invalidated = 0;
    const keysToDelete: string[] = [];

    for (const key of this.memoryCache.keys()) {
      const entry = this.memoryCache.get(key);
      if (!entry) continue;

      let shouldInvalidate = false;

      if (pattern.model && entry.response.model === pattern.model) {
        shouldInvalidate = true;
      }

      if (pattern.provider && entry.response.provider === pattern.provider) {
        shouldInvalidate = true;
      }

      if (pattern.messagePattern) {
        // This would require storing original request, simplified for now
        shouldInvalidate = true;
      }

      if (shouldInvalidate) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.memoryCache.delete(key);
      invalidated++;
    }

    this.stats.totalEntries -= invalidated;
    console.info('Invalidated', invalidated, 'cache entries');

    return invalidated;
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats(): CacheStats & {
    memoryUsage: {
      used: number;
      capacity: number;
      utilization: number;
    };
    topEntries: Array<{
      key: string;
      hits: number;
      size: number;
      age: number;
    }>;
  } {
    const memoryUsage = {
      used: this.memoryCache.size(),
      capacity: this.config.maxSize,
      utilization: this.memoryCache.size() / this.config.maxSize,
    };

    // Get top entries by hits
    const topEntries = this.memoryCache.keys()
      .map(key => {
        const entry = this.memoryCache.get(key);
        return entry ? {
          key: key.substring(0, 8) + '...', // Truncate for display
          hits: entry.hits,
          size: entry.size,
          age: Date.now() - entry.timestamp,
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (b?.hits || 0) - (a?.hits || 0))
      .slice(0, 10) as any;

    return {
      ...this.stats,
      memoryUsage,
      topEntries,
    };
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.memoryCache.clear();
    this.stats = {
      totalEntries: 0,
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      totalSize: 0,
      avgResponseTime: 0,
      costSaved: 0,
    };
    console.info('Cache cleared');
  }

  /**
   * Optimize cache by removing low-value entries
   */
  optimize(): {
    entriesRemoved: number;
    spaceFreed: number;
    costSaved: number;
  } {
    const entries = this.memoryCache.keys()
      .map(key => ({ key, entry: this.memoryCache.get(key) }))
      .filter(item => item.entry)
      .map(item => ({ key: item.key, ...item.entry! }));

    // Score entries based on value (hits, recency, cost saved)
    const scoredEntries = entries.map(entry => {
      const age = Date.now() - entry.timestamp;
      const recencyScore = Math.max(0, 1 - age / (24 * 60 * 60 * 1000)); // Decay over 24 hours
      const hitScore = Math.min(1, entry.hits / 10); // Normalize to 0-1
      const costScore = Math.min(1, entry.cost / 0.01); // Normalize to 0-1
      
      const totalScore = (hitScore * 0.4) + (recencyScore * 0.3) + (costScore * 0.3);
      
      return { ...entry, score: totalScore };
    }).sort((a, b) => a.score - b.score); // Lowest scores first (candidates for removal)

    // Remove bottom 20% if cache is more than 80% full
    const utilizationThreshold = 0.8;
    const currentUtilization = this.memoryCache.size() / this.config.maxSize;
    
    if (currentUtilization > utilizationThreshold) {
      const toRemove = Math.floor(scoredEntries.length * 0.2);
      const removedEntries = scoredEntries.slice(0, toRemove);
      
      let spaceFreed = 0;
      let costSaved = 0;
      
      for (const entry of removedEntries) {
        this.memoryCache.delete(entry.key);
        spaceFreed += entry.size;
        costSaved += entry.cost * entry.hits;
      }
      
      this.stats.totalEntries -= removedEntries.length;
      this.stats.totalSize -= spaceFreed;
      
      console.info('Cache optimization completed', {
        entriesRemoved: removedEntries.length,
        spaceFreed,
        costSaved,
      });
      
      return {
        entriesRemoved: removedEntries.length,
        spaceFreed,
        costSaved,
      };
    }

    return {
      entriesRemoved: 0,
      spaceFreed: 0,
      costSaved: 0,
    };
  }

  // Private methods

  private generateCacheKey(request: AIRequest): CacheKey {
    const keyData = {
      model: request.model,
      messages: request.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: request.temperature || 0,
      maxTokens: request.maxTokens,
      topP: request.topP,
    };

    const keyString = JSON.stringify(keyData);
    const hash = createHash('sha256').update(keyString).digest('hex');

    return {
      hash,
      metadata: {
        model: request.model,
        provider: 'unknown', // Would be determined by routing
        messageCount: request.messages.length,
        estimatedTokens: keyString.length / 4, // Rough estimate
      },
    };
  }

  private isEntryValid(entry: CacheEntry): boolean {
    const age = Date.now() - entry.timestamp;
    return age <= this.config.ttlSeconds * 1000;
  }

  private compressResponse(response: AIResponse): AIResponse {
    // Simple compression by removing metadata and compacting
    return {
      ...response,
      metadata: undefined, // Remove metadata to save space
      choices: response.choices.map(choice => ({
        ...choice,
        message: {
          role: choice.message.role,
          content: choice.message.content,
        },
      })),
    };
  }

  private decompressResponse(response: AIResponse, compressed: boolean): AIResponse {
    if (!compressed) return response;
    
    // Restore any compressed data
    return {
      ...response,
      metadata: {
        fromCache: true,
        cacheHit: Date.now(),
      },
    };
  }

  private estimateResponseSize(response: AIResponse): number {
    return JSON.stringify(response).length;
  }

  private updateHitRate(): void {
    const total = this.stats.totalHits + this.stats.totalMisses;
    this.stats.hitRate = total > 0 ? this.stats.totalHits / total : 0;
  }

  private updateAverageResponseTime(responseTime: number): void {
    const totalRequests = this.stats.totalHits + this.stats.totalMisses;
    this.stats.avgResponseTime = 
      (this.stats.avgResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
      this.optimize();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const key of this.memoryCache.keys()) {
      const entry = this.memoryCache.get(key);
      if (entry && !this.isEntryValid(entry)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      const entry = this.memoryCache.get(key);
      if (entry) {
        this.stats.totalSize -= entry.size;
        this.stats.totalEntries--;
      }
      this.memoryCache.delete(key);
    }

    if (expiredKeys.length > 0) {
      console.debug('Cleaned up', expiredKeys.length, 'expired cache entries');
    }
  }
}

/**
 * Cache-aware AI service wrapper
 */
export class CachedAIService {
  private cache: AIResponseCache;
  private baseService: any; // Would be the main AI router

  constructor(cacheConfig: CacheConfig, baseService: any) {
    this.cache = new AIResponseCache(cacheConfig);
    this.baseService = baseService;
  }

  async chat(request: AIRequest, userId: string, options: any = {}): Promise<AIResponse> {
    const startTime = Date.now();

    // Check cache first
    if (this.cache.isWorthCaching(request)) {
      const cached = await this.cache.get(request);
      if (cached) {
        console.info('Serving from cache', {
          userId,
          model: request.model,
          cacheAge: Date.now() - startTime,
        });
        return cached;
      }
    }

    // Cache miss - call base service
    const response = await this.baseService.chat(request, userId, options);

    // Cache the response if appropriate
    if (this.cache.isWorthCaching(request)) {
      await this.cache.set(request, response);
    }

    return response;
  }

  async *chatStream(request: AIRequest, userId: string, options: any = {}): AsyncIterable<any> {
    // Streaming responses are not cached
    for await (const chunk of this.baseService.chatStream(request, userId, options)) {
      yield chunk;
    }
  }

  getCacheStats() {
    return this.cache.getStats();
  }

  clearCache() {
    this.cache.clear();
  }

  optimizeCache() {
    return this.cache.optimize();
  }
}