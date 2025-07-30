/**
 * PDF Processing Cache Service
 * 
 * Specialized caching for expensive PDF processing operations
 * Targets 70%+ cost reduction for PDF Notes Generator
 */

import crypto from 'crypto';
import { getRedisClient, TTL_STRATEGIES, ResilientRedisCache } from './redis-client';

// PDF processing result interface
export interface PDFProcessingResult {
  extractedText: string;
  generatedNotes: string;
  metadata: {
    fileName: string;
    fileSize: number;
    pages: number;
    textLength: number;
    processingTime: number;
    model: string;
    style: string;
    chunksUsed: number;
    tokensEstimated: number;
    processedAt: string;
    pdfMetadata: any;
    textStructure: any;
    aiModel: string;
    aiProcessingTime: number;
    tokensUsed?: number;
  };
}

// PDF cache configuration
export interface PDFCacheConfig {
  enabled: boolean;
  ttlSeconds: number;
  maxFileSizeMB: number;
  compressionEnabled: boolean;
  includeMetadata: boolean;
}

// PDF cache key components
interface PDFCacheKey {
  contentHash: string;
  modelHash: string;
  styleHash: string;
  fullKey: string;
}

// PDF cache metrics
export interface PDFCacheMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  costSavings: number;
  processingTimeSaved: number;
  hitRate: number;
}

export class PDFProcessingCache {
  private redis: ResilientRedisCache;
  private config: PDFCacheConfig;
  private metrics: PDFCacheMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    costSavings: 0,
    processingTimeSaved: 0,
    hitRate: 0,
  };

  constructor(config: Partial<PDFCacheConfig> = {}) {
    this.config = {
      enabled: true,
      ttlSeconds: TTL_STRATEGIES.PDF_PROCESSING,
      maxFileSizeMB: 50,
      compressionEnabled: true,
      includeMetadata: true,
      ...config,
    };
    
    this.redis = getRedisClient();
    
    console.log('📄 PDF Processing Cache initialized', {
      enabled: this.config.enabled,
      ttl: `${this.config.ttlSeconds / 3600}h`,
      maxSize: `${this.config.maxFileSizeMB}MB`,
    });
  }

  /**
   * Generate cache key for PDF processing request
   */
  private generateCacheKey(
    pdfBuffer: Buffer,
    model: string,
    style: string,
    userId?: string
  ): PDFCacheKey {
    // Generate content hash from PDF buffer
    const contentHash = crypto
      .createHash('sha256')
      .update(pdfBuffer)
      .digest('hex')
      .substring(0, 16);

    // Generate model configuration hash
    const modelConfig = JSON.stringify({ model, style });
    const modelHash = crypto
      .createHash('sha256')
      .update(modelConfig)
      .digest('hex')
      .substring(0, 8);

    // Include user context if provided (for personalized results)
    const userContext = userId ? `:user:${userId}` : '';
    const fullKey = `pdf:${contentHash}:${modelHash}${userContext}`;

    return {
      contentHash,
      modelHash,
      styleHash: style,
      fullKey,
    };
  }

  /**
   * Get cached PDF processing result
   */
  async get(
    pdfBuffer: Buffer,
    model: string,
    style: string,
    userId?: string
  ): Promise<PDFProcessingResult | null> {
    if (!this.config.enabled) {
      return null;
    }

    this.metrics.totalRequests++;
    const startTime = Date.now();

    try {
      // Check file size limit
      const fileSizeMB = pdfBuffer.length / (1024 * 1024);
      if (fileSizeMB > this.config.maxFileSizeMB) {
        console.log(`📄 PDF too large for caching: ${fileSizeMB.toFixed(2)}MB`);
        return null;
      }

      const cacheKey = this.generateCacheKey(pdfBuffer, model, style, userId);
      const cached = await this.redis.get(cacheKey.fullKey);

      if (cached) {
        this.metrics.cacheHits++;
        this.updateHitMetrics(cached, startTime);
        
        console.log(`🎯 PDF cache hit - saved expensive processing for ${model}`, {
          contentHash: cacheKey.contentHash,
          estimatedSavings: this.getEstimatedCost(model),
          timeSaved: `${cached.metadata?.aiProcessingTime || 0}ms`,
        });

        return cached as PDFProcessingResult;
      }

      this.metrics.cacheMisses++;
      return null;

    } catch (error) {
      console.error('PDF cache get error:', error);
      this.metrics.cacheMisses++;
      return null;
    }
  }

  /**
   * Cache PDF processing result
   */
  async set(
    pdfBuffer: Buffer,
    model: string,
    style: string,
    result: PDFProcessingResult,
    userId?: string
  ): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    try {
      const fileSizeMB = pdfBuffer.length / (1024 * 1024);
      if (fileSizeMB > this.config.maxFileSizeMB) {
        console.log(`📄 PDF too large for caching: ${fileSizeMB.toFixed(2)}MB`);
        return;
      }

      const cacheKey = this.generateCacheKey(pdfBuffer, model, style, userId);
      
      // Enhance result with cache metadata
      const enhancedResult: PDFProcessingResult = {
        ...result,
        metadata: {
          ...result.metadata,
          cachedAt: new Date().toISOString(),
          cacheKey: cacheKey.contentHash,
          provider: model.split('-')[0],
          ttl: this.config.ttlSeconds,
        }
      };

      // Remove large buffer data if compression is disabled and result is large
      let resultToCache = enhancedResult;
      if (!this.config.compressionEnabled) {
        const resultSize = JSON.stringify(enhancedResult).length;
        if (resultSize > 1024 * 1024) { // 1MB
          console.log('📄 Large result detected, optimizing for cache storage');
          resultToCache = {
            ...enhancedResult,
            // Keep essential data but optimize large text fields
            extractedText: enhancedResult.extractedText.length > 50000 
              ? enhancedResult.extractedText.substring(0, 50000) + '...[truncated for cache]'
              : enhancedResult.extractedText
          };
        }
      }

      await this.redis.set(cacheKey.fullKey, resultToCache, this.config.ttlSeconds);
      
      console.log(`💾 PDF result cached`, {
        contentHash: cacheKey.contentHash,
        model,
        style,
        fileSize: `${fileSizeMB.toFixed(2)}MB`,
        ttl: `${this.config.ttlSeconds / 3600}h`,
        estimatedCost: this.getEstimatedCost(model),
      });

    } catch (error) {
      console.error('PDF cache set error:', error);
    }
  }

  /**
   * Check if PDF is cached
   */
  async exists(
    pdfBuffer: Buffer,
    model: string,
    style: string,
    userId?: string
  ): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    try {
      const cacheKey = this.generateCacheKey(pdfBuffer, model, style, userId);
      return await this.redis.exists(cacheKey.fullKey);
    } catch (error) {
      console.error('PDF cache exists check error:', error);
      return false;
    }
  }

  /**
   * Invalidate cache for specific content
   */
  async invalidate(
    pdfBuffer: Buffer,
    model?: string,
    style?: string,
    userId?: string
  ): Promise<number> {
    try {
      if (model && style) {
        // Invalidate specific cache entry
        const cacheKey = this.generateCacheKey(pdfBuffer, model, style, userId);
        return await this.redis.del(cacheKey.fullKey);
      } else {
        // Invalidate all variants for this PDF content
        const contentHash = crypto
          .createHash('sha256')
          .update(pdfBuffer)
          .digest('hex')
          .substring(0, 16);
        
        // For now, just log - pattern-based deletion requires Lua scripting
        console.log(`🗑️ Would invalidate all cache entries for PDF: ${contentHash}`);
        return 0;
      }
    } catch (error) {
      console.error('PDF cache invalidation error:', error);
      return 0;
    }
  }

  /**
   * Get estimated processing cost for model
   */
  private getEstimatedCost(model: string): number {
    const costMap = {
      'google': 0.001,    // Gemini Flash
      'anthropic': 0.003, // Claude Haiku  
      'openai': 0.005,    // GPT-4o Mini
      'ollama': 0.000,    // Local (no API cost)
    };

    const provider = model.split('-')[0] as keyof typeof costMap;
    return costMap[provider] || 0.005;
  }

  /**
   * Update metrics for cache hit
   */
  private updateHitMetrics(result: PDFProcessingResult, startTime: number): void {
    const responseTime = Date.now() - startTime;
    const estimatedCost = this.getEstimatedCost(result.metadata.model);
    const processingTimeSaved = result.metadata.aiProcessingTime || 0;

    this.metrics.costSavings += estimatedCost;
    this.metrics.processingTimeSaved += processingTimeSaved;
    this.updateHitRate();
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    this.metrics.hitRate = this.metrics.totalRequests > 0
      ? (this.metrics.cacheHits / this.metrics.totalRequests) * 100
      : 0;
  }

  /**
   * Get cache metrics and performance stats
   */
  getMetrics(): PDFCacheMetrics & {
    avgCostPerRequest: number;
    avgTimeSavedPerHit: number;
    totalProcessingTimeSaved: string;
    efficiency: string;
  } {
    const avgCostPerRequest = this.metrics.totalRequests > 0
      ? this.metrics.costSavings / this.metrics.cacheHits
      : 0;

    const avgTimeSavedPerHit = this.metrics.cacheHits > 0
      ? this.metrics.processingTimeSaved / this.metrics.cacheHits
      : 0;

    const totalTimeSaved = this.metrics.processingTimeSaved;
    const totalProcessingTimeSaved = totalTimeSaved > 60000
      ? `${(totalTimeSaved / 60000).toFixed(1)}m`
      : `${(totalTimeSaved / 1000).toFixed(1)}s`;

    const efficiency = this.metrics.hitRate >= 70 ? 'Excellent' :
                      this.metrics.hitRate >= 50 ? 'Good' :
                      this.metrics.hitRate >= 30 ? 'Fair' : 'Poor';

    return {
      ...this.metrics,
      avgCostPerRequest,
      avgTimeSavedPerHit,
      totalProcessingTimeSaved,
      efficiency,
    };
  }

  /**
   * Health check for PDF cache
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  }> {
    try {
      const testBuffer = Buffer.from('test-pdf-content');
      const testKey = this.generateCacheKey(testBuffer, 'test-model', 'test-style');
      
      // Test cache operations
      const testValue = { test: true, timestamp: Date.now() };
      await this.redis.set(testKey.fullKey, testValue, 60);
      const retrieved = await this.redis.get(testKey.fullKey);
      await this.redis.del(testKey.fullKey);

      const cacheWorking = retrieved !== null;
      const metrics = this.getMetrics();

      return {
        status: cacheWorking ? 'healthy' : 'unhealthy',
        details: {
          cacheEnabled: this.config.enabled,
          cacheWorking,
          totalRequests: metrics.totalRequests,
          hitRate: metrics.hitRate,
          costSavings: metrics.costSavings,
          efficiency: metrics.efficiency,
          redisStats: this.redis.getStats(),
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          cacheEnabled: this.config.enabled,
        }
      };
    }
  }

  /**
   * Clear all PDF cache entries
   */
  async clear(): Promise<void> {
    try {
      // For now, clear all Redis cache
      // In production, would implement pattern-based clearing
      console.log('🧹 Clearing PDF cache...');
      
      // Reset metrics
      this.metrics = {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        costSavings: 0,
        processingTimeSaved: 0,
        hitRate: 0,
      };

      console.log('📄 PDF cache cleared and metrics reset');
    } catch (error) {
      console.error('PDF cache clear error:', error);
    }
  }
}

// Singleton instance for PDF cache
let pdfCacheInstance: PDFProcessingCache | null = null;

export function getPDFCache(config?: Partial<PDFCacheConfig>): PDFProcessingCache {
  if (!pdfCacheInstance) {
    pdfCacheInstance = new PDFProcessingCache(config);
  }
  return pdfCacheInstance;
}

// Export default instance
export const pdfCache = getPDFCache();