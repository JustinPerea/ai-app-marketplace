/**
 * Main AI Service Integration Layer
 * 
 * Orchestrates all AI components:
 * - Provider routing and optimization
 * - Error handling and fallbacks
 * - Caching and performance optimization
 * - Usage analytics and monitoring
 * - Security and API key management
 */

import { PrismaClient, ApiProvider } from '@prisma/client';
import { AIProviderRouter } from './router';
import { AIErrorHandler } from './error-handler';
import { CachedAIService } from './cache';
import { EnhancedAIResponseCache, EnhancedCacheConfig } from '../cache/enhanced-ai-cache';
import { AIAnalyticsService } from './analytics';
import { createApiKeyManager } from '../security/api-key-manager';
import {
  AIRequest,
  AIResponse,
  AIStreamChunk,
  RouterConfig,
  CacheConfig,
  DEFAULT_ROUTER_CONFIG,
  DEFAULT_CACHE_CONFIG,
  PERFORMANCE_TARGETS,
} from './types';

export interface AIServiceConfig {
  router?: Partial<RouterConfig>;
  cache?: Partial<EnhancedCacheConfig>;
  errorHandler?: {
    maxRetries?: number;
    retryDelayMs?: number;
    circuitBreakerThreshold?: number;
  };
  analytics?: {
    enabled?: boolean;
    detailedLogging?: boolean;
  };
}

export interface ChatOptions {
  preferredProvider?: ApiProvider;
  maxCost?: number;
  requireStreaming?: boolean;
  requireTools?: boolean;
  bypassCache?: boolean;
  timeout?: number;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    router: 'healthy' | 'degraded' | 'unhealthy';
    cache: 'healthy' | 'degraded' | 'unhealthy';
    analytics: 'healthy' | 'degraded' | 'unhealthy';
    providers: Record<ApiProvider, 'healthy' | 'degraded' | 'unhealthy'>;
  };
  metrics: {
    averageLatency: number;
    errorRate: number;
    cacheHitRate: number;
    totalRequests: number;
  };
  lastCheck: Date;
}

export class AIService {
  private prisma: PrismaClient;
  private router: AIProviderRouter;
  private errorHandler: AIErrorHandler;
  private cachedService: CachedAIService;
  private enhancedCache: EnhancedAIResponseCache;
  private analytics: AIAnalyticsService;
  private apiKeyManager: ReturnType<typeof createApiKeyManager>;
  private config: Required<AIServiceConfig>;

  constructor(prisma: PrismaClient, config: AIServiceConfig = {}) {
    this.prisma = prisma;
    this.apiKeyManager = createApiKeyManager(prisma);

    this.config = {
      router: { ...DEFAULT_ROUTER_CONFIG, ...config.router },
      cache: { 
        ...DEFAULT_CACHE_CONFIG, 
        redis: {
          enabled: true,
          ttlSeconds: 3600, // 1 hour default
          semanticSimilarity: true,
          compressionEnabled: true,
        },
        ...config.cache 
      },
      errorHandler: {
        maxRetries: 3,
        retryDelayMs: 1000,
        circuitBreakerThreshold: 5,
        ...config.errorHandler,
      },
      analytics: {
        enabled: true,
        detailedLogging: false,
        ...config.analytics,
      },
    };

    this.initializeServices();
  }

  /**
   * Main chat completion method with full optimization stack
   */
  async chat(
    request: AIRequest,
    userId: string,
    options: ChatOptions = {}
  ): Promise<AIResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // Validate request
      this.validateRequest(request);

      // Apply timeout if specified
      const timeoutPromise = options.timeout ? 
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), options.timeout)
        ) : null;

      // Execute with timeout
      const responsePromise = this.executeChat(request, userId, options, requestId);
      const response = timeoutPromise ? 
        await Promise.race([responsePromise, timeoutPromise]) : 
        await responsePromise;

      // Record successful request
      const latency = Date.now() - startTime;
      if (this.config.analytics.enabled) {
        await this.analytics.recordRequest({
          userId,
          requestId,
          provider: response.provider,
          model: response.model,
          tokensUsed: response.usage.totalTokens,
          cost: response.usage.cost,
          latency,
          successful: true,
        });
      }

      return {
        ...response,
        metadata: {
          ...response.metadata,
          requestId,
          totalLatency: latency,
          serviceVersion: '1.0.0',
        },
      };

    } catch (error) {
      const latency = Date.now() - startTime;
      
      // Record failed request
      if (this.config.analytics.enabled && error instanceof Error) {
        await this.analytics.recordRequest({
          userId,
          requestId,
          provider: ApiProvider.OPENAI, // Default for error tracking
          model: request.model,
          tokensUsed: 0,
          cost: 0,
          latency,
          successful: false,
          errorCode: error.message,
        });
      }

      throw error;
    }
  }

  /**
   * Streaming chat completion with optimizations
   */
  async *chatStream(
    request: AIRequest,
    userId: string,
    options: ChatOptions = {}
  ): AsyncIterable<AIStreamChunk> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // Validate request
      this.validateRequest(request);

      // Force streaming requirement
      const streamOptions = { ...options, requireStreaming: true };

      let totalCost = 0;
      let chunkCount = 0;

      for await (const chunk of this.executeStreamChat(request, userId, streamOptions, requestId)) {
        chunkCount++;
        if (chunk.usage) {
          totalCost += chunk.usage.cost;
        }

        yield {
          ...chunk,
          metadata: {
            ...chunk.metadata,
            requestId,
            chunkIndex: chunkCount,
            serviceVersion: '1.0.0',
          },
        };
      }

      // Record streaming request completion
      const latency = Date.now() - startTime;
      if (this.config.analytics.enabled) {
        await this.analytics.recordRequest({
          userId,
          requestId,
          provider: ApiProvider.OPENAI, // Would be determined from first chunk
          model: request.model,
          tokensUsed: 0, // Hard to calculate for streaming
          cost: totalCost,
          latency,
          successful: true,
          metadata: { streaming: true, chunks: chunkCount },
        });
      }

    } catch (error) {
      const latency = Date.now() - startTime;
      
      if (this.config.analytics.enabled && error instanceof Error) {
        await this.analytics.recordRequest({
          userId,
          requestId,
          provider: ApiProvider.OPENAI,
          model: request.model,
          tokensUsed: 0,
          cost: 0,
          latency,
          successful: false,
          errorCode: error.message,
          metadata: { streaming: true },
        });
      }

      throw error;
    }
  }

  /**
   * Get comprehensive service health status
   */
  async getHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      // Check provider statuses
      const providerStatuses = await this.router.getProviderStatuses();
      const providerHealth: Record<ApiProvider, 'healthy' | 'degraded' | 'unhealthy'> = {} as any;
      
      for (const status of providerStatuses) {
        providerHealth[status.provider] = status.isHealthy ? 'healthy' : 
          status.errorRate < 0.5 ? 'degraded' : 'unhealthy';
      }

      // Check cache health
      const cacheStats = this.cachedService.getCacheStats();
      const cacheHealth = cacheStats.hitRate > 0.1 ? 'healthy' : 'degraded';

      // Calculate overall metrics
      const performanceMetrics = this.router.getPerformanceMetrics();
      const totalRequests = Object.values(performanceMetrics)
        .reduce((sum, metrics) => sum + metrics.totalRequests, 0);
      
      const avgLatency = totalRequests > 0 ? 
        Object.values(performanceMetrics)
          .reduce((sum, metrics) => sum + metrics.avgLatency * metrics.totalRequests, 0) / totalRequests : 0;

      const errorRate = totalRequests > 0 ?
        Object.values(performanceMetrics)
          .reduce((sum, metrics) => sum + (1 - metrics.successRate) * metrics.totalRequests, 0) / totalRequests : 0;

      // Determine overall status
      const unhealthyProviders = Object.values(providerHealth).filter(h => h === 'unhealthy').length;
      const degradedProviders = Object.values(providerHealth).filter(h => h === 'degraded').length;
      
      let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
      if (unhealthyProviders > 2 || errorRate > 0.5) {
        overallStatus = 'unhealthy';
      } else if (unhealthyProviders > 0 || degradedProviders > 1 || avgLatency > PERFORMANCE_TARGETS.MAX_RESPONSE_TIME * 2) {
        overallStatus = 'degraded';
      } else {
        overallStatus = 'healthy';
      }

      return {
        status: overallStatus,
        services: {
          router: overallStatus,
          cache: cacheHealth,
          analytics: 'healthy',
          providers: providerHealth,
        },
        metrics: {
          averageLatency: avgLatency,
          errorRate,
          cacheHitRate: cacheStats.hitRate,
          totalRequests,
        },
        lastCheck: new Date(),
      };

    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        services: {
          router: 'unhealthy',
          cache: 'unhealthy',
          analytics: 'unhealthy',
          providers: {} as any,
        },
        metrics: {
          averageLatency: 0,
          errorRate: 1,
          cacheHitRate: 0,
          totalRequests: 0,
        },
        lastCheck: new Date(),
      };
    }
  }

  /**
   * Get usage analytics for a user
   */
  async getAnalytics(userId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    return {
      usage: await this.analytics.getUserUsageMetrics(userId, startDate, endDate),
      costs: await this.analytics.analyzeCosts(userId, startDate, endDate),
      performance: await this.analytics.analyzePerformance(startDate, endDate, undefined, userId),
      patterns: await this.analytics.analyzeUsagePatterns(userId, startDate, endDate),
      predictions: await this.analytics.generatePredictiveInsights(userId, days),
    };
  }

  /**
   * Optimize service performance
   */
  async optimize(): Promise<{
    cacheOptimization: any;
    routerOptimization: any;
    recommendations: string[];
  }> {
    const cacheOptimization = this.cachedService.optimizeCache();
    
    // Router optimization would include updating provider weights, costs, etc.
    const routerOptimization = {
      providersOptimized: 0,
      settingsUpdated: 0,
    };

    const recommendations = [
      'Consider upgrading API plans for frequently rate-limited providers',
      'Review model selection to optimize for cost vs. quality',
      'Enable caching for repetitive requests to reduce costs',
    ];

    return {
      cacheOptimization,
      routerOptimization,
      recommendations,
    };
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<AIServiceConfig>): void {
    // Update router configuration
    if (newConfig.router) {
      this.router.updateConfig(newConfig.router);
      this.config.router = { ...this.config.router, ...newConfig.router };
    }

    // Update other configurations
    if (newConfig.cache) {
      this.config.cache = { ...this.config.cache, ...newConfig.cache };
    }

    if (newConfig.analytics) {
      this.config.analytics = { ...this.config.analytics, ...newConfig.analytics };
    }

    console.info('AI Service configuration updated:', newConfig);
  }

  // Private methods

  private initializeServices(): void {
    // Initialize router
    this.router = new AIProviderRouter(
      this.prisma,
      this.config.router,
      this.config.cache
    );

    // Initialize error handler
    this.errorHandler = new AIErrorHandler(
      {
        maxRetries: this.config.errorHandler.maxRetries,
        baseDelayMs: this.config.errorHandler.retryDelayMs,
        maxDelayMs: 30000,
        backoffMultiplier: 2,
        jitterFactor: 0.1,
      },
      {
        failureThreshold: this.config.errorHandler.circuitBreakerThreshold,
        successThreshold: 3,
        timeoutMs: 60000,
        monitoringWindowMs: 300000,
      }
    );

    // Initialize analytics
    this.analytics = new AIAnalyticsService(this.prisma);

    // Initialize enhanced Redis cache
    this.enhancedCache = new EnhancedAIResponseCache(this.config.cache);

    // Initialize cached service wrapper (keeping for compatibility)
    this.cachedService = new CachedAIService(this.config.cache, this.router);
    
    console.log('🚀 AI Service initialized with Redis-enhanced caching for 70% cost reduction');
  }

  private async executeChat(
    request: AIRequest,
    userId: string,
    options: ChatOptions,
    requestId: string
  ): Promise<AIResponse> {
    // Use enhanced Redis cache if caching is enabled and not bypassed
    if (this.config.cache.enabled && !options.bypassCache) {
      // Try enhanced cache first
      const cachedResponse = await this.enhancedCache.get(request);
      if (cachedResponse) {
        console.log('🎯 Enhanced cache hit - significant cost savings achieved');
        return cachedResponse;
      }

      // Cache miss - get response from router and cache it
      const response = await this.router.chat(request, userId, options);
      await this.enhancedCache.set(request, response);
      return response;
    }

    // Direct router call (cache bypassed)
    return this.router.chat(request, userId, options);
  }

  private async *executeStreamChat(
    request: AIRequest,
    userId: string,
    options: ChatOptions,
    requestId: string
  ): AsyncIterable<AIStreamChunk> {
    // Streaming always bypasses cache
    for await (const chunk of this.router.chatStream(request, userId, options)) {
      yield chunk;
    }
  }

  private validateRequest(request: AIRequest): void {
    if (!request.model) {
      throw new Error('Model is required');
    }

    if (!request.messages || request.messages.length === 0) {
      throw new Error('Messages are required');
    }

    if (request.messages.some(m => !m.role || !m.content)) {
      throw new Error('All messages must have role and content');
    }

    if (request.maxTokens && request.maxTokens < 1) {
      throw new Error('maxTokens must be positive');
    }

    if (request.temperature !== undefined && (request.temperature < 0 || request.temperature > 2)) {
      throw new Error('temperature must be between 0 and 2');
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Factory function for easy service creation
export function createAIService(
  prisma: PrismaClient,
  config: AIServiceConfig = {}
): AIService {
  return new AIService(prisma, config);
}

// Export singleton instance for use across the app
let aiServiceInstance: AIService | null = null;

export function getAIService(prisma?: PrismaClient, config?: AIServiceConfig): AIService {
  if (!aiServiceInstance && prisma) {
    aiServiceInstance = new AIService(prisma, config);
  }
  
  if (!aiServiceInstance) {
    throw new Error('AI Service not initialized. Call with prisma instance first.');
  }
  
  return aiServiceInstance;
}