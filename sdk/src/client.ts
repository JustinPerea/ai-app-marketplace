/**
 * AI Marketplace SDK Client
 * 
 * Main client class for the AI Marketplace SDK
 * Provides a unified interface for multiple AI providers with ML-powered routing
 */

import {
  APIProvider,
  AIRequest,
  AIResponse,
  AIStreamChunk,
  AIModel,
  ClientOptions,
  SDKConfig,
  RouterConfig,
  CacheConfig,
  DEFAULT_ROUTER_CONFIG,
  DEFAULT_CACHE_CONFIG,
  AIError,
  MLRouteDecision,
} from './types';

import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GoogleProvider } from './providers/google';
import { MLIntelligentRouter } from './ml/router';

interface CacheEntry {
  response: AIResponse;
  timestamp: number;
  ttl: number;
}

interface InternalConfig {
  router: RouterConfig;
  cache: CacheConfig;
  enableMLRouting: boolean;
  enableAnalytics: boolean;
  defaultProvider: APIProvider;
  timeout: number;
}

export class AIMarketplaceClient {
  private providers: Map<APIProvider, any> = new Map();
  private apiKeys: { openai?: string; anthropic?: string; google?: string };
  private config: InternalConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private mlRouter: MLIntelligentRouter;
  private userId: string;

  constructor(options: ClientOptions) {
    this.apiKeys = options.apiKeys;
    this.userId = this.generateUserId();
    
    // Merge configuration with defaults
    this.config = {
      router: { ...DEFAULT_ROUTER_CONFIG, ...options.config?.router },
      cache: { ...DEFAULT_CACHE_CONFIG, ...options.config?.cache },
      enableMLRouting: options.config?.enableMLRouting ?? true,
      enableAnalytics: options.config?.enableAnalytics ?? true,
      defaultProvider: options.config?.defaultProvider ?? APIProvider.OPENAI,
      timeout: options.config?.timeout ?? 30000,
    };

    this.initializeProviders(options.baseUrls);
    this.mlRouter = new MLIntelligentRouter();
    this.startCacheCleanup();
  }

  /**
   * Send a chat completion request with intelligent routing
   */
  async chat(
    request: AIRequest,
    options: {
      provider?: APIProvider;
      userId?: string;
      useCache?: boolean;
      enableMLRouting?: boolean;
      optimizeFor?: 'cost' | 'speed' | 'quality' | 'balanced';
    } = {}
  ): Promise<AIResponse> {
    const userId = options.userId || this.userId;
    const useCache = options.useCache ?? this.config.cache.enabled;
    const enableMLRouting = options.enableMLRouting ?? this.config.enableMLRouting;

    // Check cache first
    if (useCache) {
      const cachedResponse = this.getCachedResponse(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Determine which provider to use
    let selectedProvider: APIProvider;
    let selectedModel: string;
    let mlDecision: MLRouteDecision | null = null;

    if (options.provider) {
      // Use specified provider
      selectedProvider = options.provider;
      selectedModel = this.getDefaultModelForProvider(selectedProvider);
    } else if (enableMLRouting) {
      // Use ML routing
      const availableProviders = this.getAvailableProviders();
      mlDecision = await this.mlRouter.intelligentRoute(
        request,
        userId,
        availableProviders,
        { optimizeFor: options.optimizeFor }
      );
      selectedProvider = mlDecision.selectedProvider;
      selectedModel = mlDecision.selectedModel;
    } else {
      // Use default provider
      selectedProvider = this.config.defaultProvider;
      selectedModel = this.getDefaultModelForProvider(selectedProvider);
    }

    // Update request with selected model
    const finalRequest = { ...request, model: selectedModel };

    // Get provider and API key
    const provider = this.providers.get(selectedProvider);
    const apiKey = this.getApiKey(selectedProvider);

    if (!provider) {
      throw new AIError({
        code: 'PROVIDER_NOT_AVAILABLE',
        message: `Provider ${selectedProvider} is not available`,
        type: 'invalid_request',
        provider: selectedProvider,
        retryable: false,
      });
    }

    if (!apiKey) {
      throw new AIError({
        code: 'API_KEY_MISSING',
        message: `API key for ${selectedProvider} is not provided`,
        type: 'authentication',
        provider: selectedProvider,
        retryable: false,
      });
    }

    try {
      const startTime = Date.now();
      
      // Make the request
      const response = await provider.chat(finalRequest, apiKey);
      
      const responseTime = Date.now() - startTime;

      // Learn from execution for ML improvement
      if (enableMLRouting && mlDecision) {
        await this.mlRouter.learnFromExecution(
          finalRequest,
          userId,
          selectedProvider,
          selectedModel,
          response,
          responseTime
        );
      }

      // Cache the response
      if (useCache) {
        this.setCachedResponse(request, response);
      }

      return response;

    } catch (error) {
      // Handle fallback logic if enabled
      if (this.config.router.fallbackEnabled && !options.provider) {
        return this.handleFallback(finalRequest, selectedProvider, error as AIError);
      }
      
      throw error;
    }
  }

  /**
   * Send a streaming chat completion request
   */
  async *chatStream(
    request: AIRequest,
    options: {
      provider?: APIProvider;
      userId?: string;
      enableMLRouting?: boolean;
      optimizeFor?: 'cost' | 'speed' | 'quality' | 'balanced';
    } = {}
  ): AsyncIterable<AIStreamChunk> {
    const userId = options.userId || this.userId;
    const enableMLRouting = options.enableMLRouting ?? this.config.enableMLRouting;

    // Determine which provider to use
    let selectedProvider: APIProvider;
    let selectedModel: string;

    if (options.provider) {
      selectedProvider = options.provider;
      selectedModel = this.getDefaultModelForProvider(selectedProvider);
    } else if (enableMLRouting) {
      const availableProviders = this.getAvailableProviders();
      const mlDecision = await this.mlRouter.intelligentRoute(
        request,
        userId,
        availableProviders,
        { optimizeFor: options.optimizeFor }
      );
      selectedProvider = mlDecision.selectedProvider;
      selectedModel = mlDecision.selectedModel;
    } else {
      selectedProvider = this.config.defaultProvider;
      selectedModel = this.getDefaultModelForProvider(selectedProvider);
    }

    // Update request with selected model
    const finalRequest = { ...request, model: selectedModel, stream: true };

    // Get provider and API key
    const provider = this.providers.get(selectedProvider);
    const apiKey = this.getApiKey(selectedProvider);

    if (!provider || !apiKey) {
      throw new AIError({
        code: 'PROVIDER_NOT_AVAILABLE',
        message: `Provider ${selectedProvider} is not available or API key is missing`,
        type: 'invalid_request',
        provider: selectedProvider,
        retryable: false,
      });
    }

    yield* provider.chatStream(finalRequest, apiKey);
  }

  /**
   * Get available models from all providers
   */
  async getModels(provider?: APIProvider): Promise<AIModel[]> {
    if (provider) {
      const providerInstance = this.providers.get(provider);
      const apiKey = this.getApiKey(provider);
      
      if (!providerInstance || !apiKey) {
        return [];
      }
      
      try {
        return await providerInstance.getModels();
      } catch (error) {
        console.error(`Failed to get models from ${provider}:`, error);
        return [];
      }
    }

    // Get models from all available providers
    const allModels: AIModel[] = [];
    
    for (const [providerType, providerInstance] of this.providers) {
      const apiKey = this.getApiKey(providerType);
      if (apiKey) {
        try {
          const models = await providerInstance.getModels();
          allModels.push(...models);
        } catch (error) {
          console.error(`Failed to get models from ${providerType}:`, error);
        }
      }
    }
    
    return allModels;
  }

  /**
   * Validate API keys for all providers
   */
  async validateApiKeys(): Promise<Record<APIProvider, boolean>> {
    const results: Record<APIProvider, boolean> = {} as any;
    
    for (const [provider, providerInstance] of this.providers) {
      const apiKey = this.getApiKey(provider);
      if (apiKey) {
        try {
          results[provider] = await providerInstance.validateApiKey(apiKey);
        } catch (error) {
          results[provider] = false;
        }
      } else {
        results[provider] = false;
      }
    }
    
    return results;
  }

  /**
   * Get ML insights and analytics
   */
  async getAnalytics(userId?: string) {
    if (!this.config.enableMLRouting) {
      throw new AIError({
        code: 'ML_ROUTING_DISABLED',
        message: 'ML routing is disabled, no analytics available',
        type: 'invalid_request',
        provider: APIProvider.OPENAI,
        retryable: false,
      });
    }

    return this.mlRouter.getMLInsights(userId || this.userId);
  }

  /**
   * Estimate cost for a request
   */
  async estimateCost(
    request: AIRequest,
    provider?: APIProvider
  ): Promise<{ provider: APIProvider; cost: number }[]> {
    const estimates: { provider: APIProvider; cost: number }[] = [];
    
    const providersToCheck = provider ? [provider] : this.getAvailableProviders();
    
    for (const providerType of providersToCheck) {
      const providerInstance = this.providers.get(providerType);
      const apiKey = this.getApiKey(providerType);
      
      if (providerInstance && apiKey) {
        try {
          const cost = await providerInstance.estimateCost(request);
          estimates.push({ provider: providerType, cost });
        } catch (error) {
          console.error(`Failed to estimate cost for ${providerType}:`, error);
        }
      }
    }
    
    return estimates.sort((a, b) => a.cost - b.cost);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SDKConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      router: { ...this.config.router, ...config.router },
      cache: { ...this.config.cache, ...config.cache },
    };
  }

  // Private methods

  private initializeProviders(baseUrls?: { openai?: string; anthropic?: string; google?: string }): void {
    // Initialize providers only if API keys are provided
    if (this.apiKeys.openai) {
      this.providers.set(APIProvider.OPENAI, new OpenAIProvider());
    }
    
    if (this.apiKeys.anthropic) {
      this.providers.set(APIProvider.ANTHROPIC, new AnthropicProvider());
    }
    
    if (this.apiKeys.google) {
      this.providers.set(APIProvider.GOOGLE, new GoogleProvider());
    }
  }

  private getAvailableProviders(): APIProvider[] {
    return Array.from(this.providers.keys());
  }

  private getApiKey(provider: APIProvider): string | undefined {
    switch (provider) {
      case APIProvider.OPENAI:
        return this.apiKeys.openai;
      case APIProvider.ANTHROPIC:
        return this.apiKeys.anthropic;
      case APIProvider.GOOGLE:
        return this.apiKeys.google;
      default:
        return undefined;
    }
  }

  private getDefaultModelForProvider(provider: APIProvider): string {
    switch (provider) {
      case APIProvider.OPENAI:
        return 'gpt-4o-mini';
      case APIProvider.ANTHROPIC:
        return 'claude-3-haiku-20240307';
      case APIProvider.GOOGLE:
        return 'gemini-1.5-flash';
      default:
        return 'gpt-4o-mini';
    }
  }

  private generateCacheKey(request: AIRequest): string {
    if (this.config.cache.keyStrategy === 'content_hash') {
      return this.hashContent(JSON.stringify({
        messages: request.messages,
        temperature: request.temperature,
        maxTokens: request.maxTokens,
        tools: request.tools,
      }));
    } else {
      return JSON.stringify(request);
    }
  }

  private hashContent(content: string): string {
    // Simple hash function for cache keys
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private getCachedResponse(request: AIRequest): AIResponse | null {
    const key = this.generateCacheKey(request);
    const entry = this.cache.get(key);
    
    if (entry && Date.now() - entry.timestamp < entry.ttl * 1000) {
      return entry.response;
    }
    
    if (entry) {
      this.cache.delete(key);
    }
    
    return null;
  }

  private setCachedResponse(request: AIRequest, response: AIResponse): void {
    if (this.cache.size >= this.config.cache.maxSize) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    const key = this.generateCacheKey(request);
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      ttl: this.config.cache.ttlSeconds,
    });
  }

  private async handleFallback(
    request: AIRequest,
    failedProvider: APIProvider,
    error: AIError
  ): Promise<AIResponse> {
    const fallbackOrder = this.config.router.fallbackOrder.filter(p => p !== failedProvider);
    
    for (const provider of fallbackOrder) {
      const providerInstance = this.providers.get(provider);
      const apiKey = this.getApiKey(provider);
      
      if (providerInstance && apiKey) {
        try {
          const fallbackRequest = { ...request, model: this.getDefaultModelForProvider(provider) };
          return await providerInstance.chat(fallbackRequest, apiKey);
        } catch (fallbackError) {
          console.error(`Fallback to ${provider} failed:`, fallbackError);
          continue;
        }
      }
    }
    
    // If all fallbacks fail, throw the original error
    throw error;
  }

  private startCacheCleanup(): void {
    // Clean up expired cache entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl * 1000) {
          this.cache.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}