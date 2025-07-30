/**
 * AI Provider Router with Cost Optimization
 * 
 * Intelligent routing system that:
 * - Optimizes for cost while maintaining quality
 * - Provides automatic fallback on failures
 * - Implements circuit breaker patterns
 * - Tracks performance metrics
 * - Supports provider-specific features
 */

import { ApiProvider } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { createApiKeyManager } from '../security/api-key-manager';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GoogleProvider } from './providers/google';
import {
  AIProvider,
  AIRequest,
  AIResponse,
  AIStreamChunk,
  AIModel,
  RouterConfig,
  FallbackStrategy,
  CostAnalysis,
  CostRecommendation,
  ProviderStatus,
  AIError,
  PerformanceMetrics,
  CacheConfig,
  MODEL_EQUIVALENTS,
  DEFAULT_ROUTER_CONFIG,
  DEFAULT_CACHE_CONFIG,
  PERFORMANCE_TARGETS,
  COST_THRESHOLDS,
} from './types';

interface ProviderWithMetrics {
  provider: AIProvider;
  status: ProviderStatus;
  lastStatusCheck: number;
  totalRequests: number;
  successfulRequests: number;
  avgLatency: number;
  avgCost: number;
}

interface CacheEntry {
  response: AIResponse;
  timestamp: number;
  cost: number;
}

interface RouteDecision {
  selectedProvider: ApiProvider;
  selectedModel: string;
  estimatedCost: number;
  reasoning: string;
  fallbackOptions: Array<{
    provider: ApiProvider;
    model: string;
    cost: number;
  }>;
}

export class AIProviderRouter {
  private providers: Map<ApiProvider, ProviderWithMetrics> = new Map();
  private cache: Map<string, CacheEntry> = new Map();
  private config: RouterConfig;
  private cacheConfig: CacheConfig;
  private prisma: PrismaClient;
  private apiKeyManager: ReturnType<typeof createApiKeyManager>;

  constructor(
    prisma: PrismaClient,
    config: Partial<RouterConfig> = {},
    cacheConfig: Partial<CacheConfig> = {}
  ) {
    this.prisma = prisma;
    this.apiKeyManager = createApiKeyManager(prisma);
    this.config = { ...DEFAULT_ROUTER_CONFIG, ...config };
    this.cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...cacheConfig };

    this.initializeProviders();
    this.startHealthChecks();
    this.startCacheCleanup();
  }

  /**
   * Main routing method - intelligently routes requests to optimal provider
   */
  async chat(
    request: AIRequest,
    userId: string,
    options: {
      preferredProvider?: ApiProvider;
      maxCost?: number;
      requireStreaming?: boolean;
      requireTools?: boolean;
    } = {}
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Check cache first
      if (this.cacheConfig.enabled && !request.stream) {
        const cacheKey = this.generateCacheKey(request);
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheConfig.ttlSeconds * 1000) {
          console.info('Cache hit for request', { cacheKey, cost: cached.cost });
          return {
            ...cached.response,
            metadata: {
              ...cached.response.metadata,
              fromCache: true,
              cacheKey,
            },
          };
        }
      }

      // Analyze cost and select optimal route
      const routeDecision = await this.selectOptimalRoute(request, options);
      
      // Get user's API key for the selected provider
      const apiKey = await this.getUserApiKey(userId, routeDecision.selectedProvider);
      if (!apiKey) {
        throw new AIError({
          code: 'NO_API_KEY',
          message: `No API key found for provider: ${routeDecision.selectedProvider}`,
          type: 'authentication',
          provider: routeDecision.selectedProvider,
          retryable: false,
        });
      }

      // Execute request with fallback handling
      const response = await this.executeWithFallback(
        { ...request, model: routeDecision.selectedModel },
        routeDecision,
        userId
      );

      // Update metrics
      const latency = Date.now() - startTime;
      await this.updateMetrics(routeDecision.selectedProvider, latency, response.usage.cost, true);

      // Cache successful response
      if (this.cacheConfig.enabled && !request.stream) {
        const cacheKey = this.generateCacheKey(request);
        this.cache.set(cacheKey, {
          response,
          timestamp: Date.now(),
          cost: response.usage.cost,
        });
      }

      // Track usage for billing and analytics
      await this.trackUsage(userId, routeDecision.selectedProvider, request, response, latency);

      return {
        ...response,
        metadata: {
          ...response.metadata,
          routeDecision,
          totalLatency: latency,
        },
      };

    } catch (error) {
      const latency = Date.now() - startTime;
      
      if (error instanceof AIError) {
        await this.updateMetrics(error.provider, latency, 0, false);
        throw error;
      }

      throw new AIError({
        code: 'ROUTER_ERROR',
        message: error instanceof Error ? error.message : 'Unknown routing error',
        type: 'api_error',
        provider: request.model.includes('gpt') ? ApiProvider.OPENAI :
                  request.model.includes('claude') ? ApiProvider.ANTHROPIC :
                  ApiProvider.GOOGLE,
        retryable: true,
        details: { latency },
      });
    }
  }

  /**
   * Streaming chat with intelligent routing
   */
  async *chatStream(
    request: AIRequest,
    userId: string,
    options: {
      preferredProvider?: ApiProvider;
      maxCost?: number;
      requireTools?: boolean;
    } = {}
  ): AsyncIterable<AIStreamChunk> {
    const startTime = Date.now();

    try {
      // Streaming requests can't be cached, so skip cache check
      const routeDecision = await this.selectOptimalRoute(request, { 
        ...options, 
        requireStreaming: true 
      });

      const apiKey = await this.getUserApiKey(userId, routeDecision.selectedProvider);
      if (!apiKey) {
        throw new AIError({
          code: 'NO_API_KEY',
          message: `No API key found for provider: ${routeDecision.selectedProvider}`,
          type: 'authentication',
          provider: routeDecision.selectedProvider,
          retryable: false,
        });
      }

      const provider = this.providers.get(routeDecision.selectedProvider)?.provider;
      if (!provider) {
        throw new AIError({
          code: 'PROVIDER_NOT_AVAILABLE',
          message: `Provider ${routeDecision.selectedProvider} not available`,
          type: 'api_error',
          provider: routeDecision.selectedProvider,
          retryable: false,
        });
      }

      let totalCost = 0;
      let chunkCount = 0;

      for await (const chunk of provider.chatStream(
        { ...request, model: routeDecision.selectedModel },
        apiKey
      )) {
        chunkCount++;
        if (chunk.usage) {
          totalCost += chunk.usage.cost;
        }

        yield {
          ...chunk,
          metadata: {
            routeDecision,
            chunkIndex: chunkCount,
          },
        };
      }

      // Update metrics after streaming completes
      const latency = Date.now() - startTime;
      await this.updateMetrics(routeDecision.selectedProvider, latency, totalCost, true);

      // Track usage
      const mockResponse: AIResponse = {
        id: 'stream_' + Date.now(),
        model: routeDecision.selectedModel,
        provider: routeDecision.selectedProvider,
        choices: [],
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, cost: totalCost },
        created: Math.floor(Date.now() / 1000),
      };

      await this.trackUsage(userId, routeDecision.selectedProvider, request, mockResponse, latency);

    } catch (error) {
      const latency = Date.now() - startTime;
      
      if (error instanceof AIError) {
        await this.updateMetrics(error.provider, latency, 0, false);
        throw error;
      }

      throw error;
    }
  }

  /**
   * Analyze costs across all providers for a given request
   */
  async analyzeCosts(request: AIRequest): Promise<CostAnalysis> {
    const costByProvider: Record<ApiProvider, number> = {} as any;
    const recommendations: CostRecommendation[] = [];
    let cheapestProvider = ApiProvider.OPENAI;
    let lowestCost = Infinity;

    for (const [providerType, providerWithMetrics] of this.providers) {
      if (!providerWithMetrics.status.isHealthy) continue;

      try {
        // Find equivalent model for this provider
        const equivalentModel = this.findEquivalentModel(request.model, providerType);
        if (!equivalentModel) continue;

        const cost = await providerWithMetrics.provider.estimateCost({
          ...request,
          model: equivalentModel,
        });

        costByProvider[providerType] = cost;

        if (cost < lowestCost) {
          lowestCost = cost;
          cheapestProvider = providerType;
        }

        // Generate recommendation
        const qualityScore = this.calculateQualityScore(providerType, equivalentModel);
        const reasonCode = cost === lowestCost ? 'cheapest' : 
                          cost < COST_THRESHOLDS.CHEAP_REQUEST ? 'best_value' :
                          qualityScore > 0.8 ? 'highest_quality' : 'fastest';

        recommendations.push({
          provider: providerType,
          model: equivalentModel,
          estimatedCost: cost,
          qualityScore,
          reasonCode,
          description: this.generateRecommendationDescription(providerType, reasonCode, cost),
        });

      } catch (error) {
        console.warn(`Failed to estimate cost for ${providerType}:`, error);
      }
    }

    // Sort recommendations by value (cost vs quality balance)
    recommendations.sort((a, b) => {
      const aValue = a.qualityScore / (a.estimatedCost + 0.001);
      const bValue = b.qualityScore / (b.estimatedCost + 0.001);
      return bValue - aValue;
    });

    return {
      estimatedCost: lowestCost,
      cheapestProvider,
      costByProvider,
      recommendations,
    };
  }

  /**
   * Get current status of all providers
   */
  async getProviderStatuses(): Promise<ProviderStatus[]> {
    const statuses: ProviderStatus[] = [];

    for (const [providerType, providerWithMetrics] of this.providers) {
      // Refresh status if it's stale
      if (Date.now() - providerWithMetrics.lastStatusCheck > 30000) { // 30 seconds
        try {
          const status = await providerWithMetrics.provider.healthCheck();
          providerWithMetrics.status = status;
          providerWithMetrics.lastStatusCheck = Date.now();
        } catch (error) {
          console.error(`Health check failed for ${providerType}:`, error);
        }
      }

      statuses.push(providerWithMetrics.status);
    }

    return statuses;
  }

  /**
   * Get performance metrics for all providers
   */
  getPerformanceMetrics(): Record<ApiProvider, {
    totalRequests: number;
    successRate: number;
    avgLatency: number;
    avgCost: number;
  }> {
    const metrics: any = {};

    for (const [providerType, providerWithMetrics] of this.providers) {
      const successRate = providerWithMetrics.totalRequests > 0 
        ? providerWithMetrics.successfulRequests / providerWithMetrics.totalRequests
        : 0;

      metrics[providerType] = {
        totalRequests: providerWithMetrics.totalRequests,
        successRate,
        avgLatency: providerWithMetrics.avgLatency,
        avgCost: providerWithMetrics.avgCost,
      };
    }

    return metrics;
  }

  /**
   * Update router configuration
   */
  updateConfig(newConfig: Partial<RouterConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.info('Router configuration updated:', newConfig);
  }

  // Private methods

  private initializeProviders(): void {
    const providers = [
      new OpenAIProvider(),
      new AnthropicProvider(),
      new GoogleProvider(),
    ];

    for (const provider of providers) {
      this.providers.set(provider.provider, {
        provider,
        status: {
          provider: provider.provider,
          isHealthy: true,
          latency: 0,
          errorRate: 0,
          lastCheck: new Date(),
          issues: [],
        },
        lastStatusCheck: 0,
        totalRequests: 0,
        successfulRequests: 0,
        avgLatency: 0,
        avgCost: 0,
      });
    }
  }

  private async selectOptimalRoute(
    request: AIRequest,
    options: {
      preferredProvider?: ApiProvider;
      maxCost?: number;
      requireStreaming?: boolean;
      requireTools?: boolean;
    }
  ): Promise<RouteDecision> {
    // If a specific provider is preferred and available, use it
    if (options.preferredProvider) {
      const providerWithMetrics = this.providers.get(options.preferredProvider);
      if (providerWithMetrics?.status.isHealthy) {
        const model = this.findEquivalentModel(request.model, options.preferredProvider) || request.model;
        const cost = await providerWithMetrics.provider.estimateCost({ ...request, model });
        
        if (!options.maxCost || cost <= options.maxCost) {
          return {
            selectedProvider: options.preferredProvider,
            selectedModel: model,
            estimatedCost: cost,
            reasoning: 'User preferred provider',
            fallbackOptions: [],
          };
        }
      }
    }

    const costAnalysis = await this.analyzeCosts(request);
    const candidates: Array<{
      provider: ApiProvider;
      model: string;
      cost: number;
      score: number;
    }> = [];

    for (const recommendation of costAnalysis.recommendations) {
      const providerWithMetrics = this.providers.get(recommendation.provider);
      if (!providerWithMetrics?.status.isHealthy) continue;

      // Check requirements
      if (options.requireStreaming) {
        const models = await providerWithMetrics.provider.getModels();
        const model = models.find(m => m.id === recommendation.model || m.name === recommendation.model);
        if (!model?.supportsStreaming) continue;
      }

      if (options.requireTools) {
        const models = await providerWithMetrics.provider.getModels();
        const model = models.find(m => m.id === recommendation.model || m.name === recommendation.model);
        if (!model?.supportsTools) continue;
      }

      if (options.maxCost && recommendation.estimatedCost > options.maxCost) continue;

      // Calculate comprehensive score
      const performanceScore = this.calculatePerformanceScore(recommendation.provider);
      const costScore = 1 - (recommendation.estimatedCost / Math.max(...costAnalysis.recommendations.map(r => r.estimatedCost)));
      const qualityScore = recommendation.qualityScore;

      const score = (
        performanceScore * this.config.performanceWeighting +
        costScore * (1 - this.config.performanceWeighting) +
        qualityScore * 0.1
      );

      candidates.push({
        provider: recommendation.provider,
        model: recommendation.model,
        cost: recommendation.estimatedCost,
        score,
      });
    }

    if (candidates.length === 0) {
      throw new AIError({
        code: 'NO_AVAILABLE_PROVIDERS',
        message: 'No providers available that meet the requirements',
        type: 'api_error',
        provider: ApiProvider.OPENAI, // Default fallback
        retryable: true,
      });
    }

    // Sort by score and select the best
    candidates.sort((a, b) => b.score - a.score);
    const selected = candidates[0];
    const fallbackOptions = candidates.slice(1, 4).map(c => ({
      provider: c.provider,
      model: c.model,
      cost: c.cost,
    }));

    return {
      selectedProvider: selected.provider,
      selectedModel: selected.model,
      estimatedCost: selected.cost,
      reasoning: this.generateRoutingReasoning(selected, candidates),
      fallbackOptions,
    };
  }

  private async executeWithFallback(
    request: AIRequest,
    routeDecision: RouteDecision,
    userId: string
  ): Promise<AIResponse> {
    const attempts = [
      { provider: routeDecision.selectedProvider, model: routeDecision.selectedModel },
      ...routeDecision.fallbackOptions.map(opt => ({ provider: opt.provider, model: opt.model })),
    ];

    let lastError: AIError | null = null;

    for (let i = 0; i < attempts.length && i < this.config.maxRetries; i++) {
      const attempt = attempts[i];
      
      try {
        const apiKey = await this.getUserApiKey(userId, attempt.provider);
        if (!apiKey) continue;

        const provider = this.providers.get(attempt.provider)?.provider;
        if (!provider) continue;

        const response = await provider.chat({ ...request, model: attempt.model }, apiKey);
        
        if (i > 0) {
          console.info(`Fallback successful on attempt ${i + 1}`, {
            originalProvider: routeDecision.selectedProvider,
            fallbackProvider: attempt.provider,
          });
        }

        return response;

      } catch (error) {
        if (error instanceof AIError) {
          lastError = error;
          
          // Don't retry on authentication errors
          if (error.type === 'authentication') {
            break;
          }
          
          // Add delay between retries
          if (i < attempts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, this.config.retryDelayMs * (i + 1)));
          }
        }
      }
    }

    throw lastError || new AIError({
      code: 'ALL_PROVIDERS_FAILED',
      message: 'All provider attempts failed',
      type: 'api_error',
      provider: routeDecision.selectedProvider,
      retryable: false,
    });
  }

  private async getUserApiKey(userId: string, provider: ApiProvider): Promise<string | null> {
    try {
      const apiKeys = await this.apiKeyManager.listApiKeys(userId);
      const providerKey = apiKeys.find(key => key.provider === provider && key.isActive);
      
      if (!providerKey) return null;

      const keyWithSecret = await this.apiKeyManager.retrieveApiKey({
        userId,
        apiKeyId: providerKey.id,
      });

      return keyWithSecret?.decryptedKey || null;
    } catch (error) {
      console.error(`Failed to retrieve API key for ${provider}:`, error);
      return null;
    }
  }

  private findEquivalentModel(originalModel: string, targetProvider: ApiProvider): string | null {
    // Direct model mapping
    for (const [category, providerModels] of Object.entries(MODEL_EQUIVALENTS)) {
      if (Object.values(providerModels).includes(originalModel)) {
        return providerModels[targetProvider] || null;
      }
    }

    // Fallback to provider's default model
    const providerWithMetrics = this.providers.get(targetProvider);
    if (providerWithMetrics) {
      // Use provider-specific method to get recommended model
      if (targetProvider === ApiProvider.OPENAI && 'getRecommendedModel' in providerWithMetrics.provider) {
        return (providerWithMetrics.provider as any).getRecommendedModel('chat');
      }
      if (targetProvider === ApiProvider.ANTHROPIC && 'getRecommendedModel' in providerWithMetrics.provider) {
        return (providerWithMetrics.provider as any).getRecommendedModel('chat');
      }
      if (targetProvider === ApiProvider.GOOGLE && 'getRecommendedModel' in providerWithMetrics.provider) {
        return (providerWithMetrics.provider as any).getRecommendedModel('chat');
      }
    }

    return null;
  }

  private calculateQualityScore(provider: ApiProvider, model: string): number {
    // Quality scoring based on provider and model capabilities
    const providerScores = {
      [ApiProvider.OPENAI]: 0.9,
      [ApiProvider.ANTHROPIC]: 0.95,
      [ApiProvider.GOOGLE]: 0.85,
    };

    const modelBonus = model.includes('gpt-4') || model.includes('opus') || model.includes('pro') ? 0.1 : 0;
    return Math.min(1.0, providerScores[provider] + modelBonus);
  }

  private calculatePerformanceScore(provider: ApiProvider): number {
    const providerWithMetrics = this.providers.get(provider);
    if (!providerWithMetrics) return 0;

    const successRate = providerWithMetrics.totalRequests > 0 
      ? providerWithMetrics.successfulRequests / providerWithMetrics.totalRequests
      : 1;

    const latencyScore = Math.max(0, 1 - (providerWithMetrics.avgLatency / PERFORMANCE_TARGETS.MAX_RESPONSE_TIME));
    
    return (successRate * 0.7) + (latencyScore * 0.3);
  }

  private generateRecommendationDescription(provider: ApiProvider, reasonCode: string, cost: number): string {
    const costStr = `$${cost.toFixed(4)}`;
    
    switch (reasonCode) {
      case 'cheapest':
        return `Lowest cost option at ${costStr}`;
      case 'best_value':
        return `Best balance of cost (${costStr}) and quality`;
      case 'highest_quality':
        return `Premium quality option at ${costStr}`;
      case 'fastest':
        return `Fastest response time at ${costStr}`;
      default:
        return `Available at ${costStr}`;
    }
  }

  private generateRoutingReasoning(selected: any, candidates: any[]): string {
    const reasons = [];
    
    if (selected === candidates[0]) {
      reasons.push('highest overall score');
    }
    
    if (selected.cost === Math.min(...candidates.map(c => c.cost))) {
      reasons.push('lowest cost');
    }
    
    return `Selected ${selected.provider} (${reasons.join(', ')})`;
  }

  private generateCacheKey(request: AIRequest): string {
    if (this.cacheConfig.keyStrategy === 'content_hash') {
      const content = JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature,
        maxTokens: request.maxTokens,
      });
      
      // Simple hash function
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      return `cache_${Math.abs(hash).toString(36)}`;
    }
    
    return `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async updateMetrics(
    provider: ApiProvider,
    latency: number,
    cost: number,
    success: boolean
  ): Promise<void> {
    const providerWithMetrics = this.providers.get(provider);
    if (!providerWithMetrics) return;

    providerWithMetrics.totalRequests++;
    if (success) {
      providerWithMetrics.successfulRequests++;
    }

    // Update running averages
    const alpha = 0.1; // Smoothing factor
    providerWithMetrics.avgLatency = 
      providerWithMetrics.avgLatency * (1 - alpha) + latency * alpha;
    providerWithMetrics.avgCost = 
      providerWithMetrics.avgCost * (1 - alpha) + cost * alpha;
  }

  private async trackUsage(
    userId: string,
    provider: ApiProvider,
    request: AIRequest,
    response: AIResponse,
    latency: number
  ): Promise<void> {
    try {
      // This would integrate with your usage tracking system
      await this.prisma.aiUsageRecord.create({
        data: {
          userId,
          provider,
          model: request.model,
          requestId: response.id,
          endpoint: 'chat',
          tokensUsed: response.usage.totalTokens,
          cost: response.usage.cost,
          latency,
          successful: true,
          metadata: {
            originalModel: request.model,
            messages: request.messages.length,
            streaming: request.stream || false,
          },
        },
      });
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  }

  private startHealthChecks(): void {
    setInterval(async () => {
      for (const [providerType, providerWithMetrics] of this.providers) {
        try {
          const status = await providerWithMetrics.provider.healthCheck();
          providerWithMetrics.status = status;
          providerWithMetrics.lastStatusCheck = Date.now();
        } catch (error) {
          console.error(`Health check failed for ${providerType}:`, error);
          providerWithMetrics.status.isHealthy = false;
          providerWithMetrics.status.issues = ['Health check failed'];
        }
      }
    }, 60000); // Every minute
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const expiry = this.cacheConfig.ttlSeconds * 1000;
      
      for (const [key, entry] of this.cache) {
        if (now - entry.timestamp > expiry) {
          this.cache.delete(key);
        }
      }
      
      // Also enforce max cache size
      if (this.cache.size > this.cacheConfig.maxSize) {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        const toDelete = entries.slice(0, entries.length - this.cacheConfig.maxSize);
        for (const [key] of toDelete) {
          this.cache.delete(key);
        }
      }
    }, 300000); // Every 5 minutes
  }
}