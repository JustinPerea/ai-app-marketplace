/**
 * Base Provider Interface and Abstract Implementation
 * 
 * Defines the unified interface that all AI providers must implement
 */

import type {
  ApiProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  ImageGenerationRequest,
  ImageGenerationResponse,
  ProviderConfig,
  ProviderCapabilities,
  SDKError,
  RequestMetrics,
  Usage
} from '../types';

import { RetryHandler, CircuitBreaker, withTimeout } from '../utils/errors';

export interface BaseProviderOptions {
  apiKey?: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  userAgent?: string;
  debug?: boolean;
}

/**
 * Abstract base class for all AI providers
 */
export abstract class BaseProvider {
  protected readonly provider: ApiProvider;
  protected readonly config: ProviderConfig;
  protected readonly retryHandler: RetryHandler;
  protected readonly circuitBreaker: CircuitBreaker;

  constructor(provider: ApiProvider, config: ProviderConfig) {
    this.provider = provider;
    this.config = config;
    this.retryHandler = new RetryHandler({
      maxRetries: config.maxRetries || 3,
      baseDelay: config.retryDelay || 1000
    });
    this.circuitBreaker = new CircuitBreaker();
  }

  /**
   * Provider capabilities - must be implemented by each provider
   */
  abstract getCapabilities(): ProviderCapabilities;

  /**
   * Chat completion - core method all providers must implement
   */
  abstract chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;

  /**
   * Streaming chat completion - optional, defaults to error
   */
  abstract streamChatCompletion(
    request: ChatCompletionRequest
  ): AsyncGenerator<ChatCompletionChunk, void, unknown>;

  /**
   * Image generation - optional, defaults to error if not supported
   */
  generateImages(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    throw new Error(`Image generation not supported by ${this.provider} provider`);
  }

  /**
   * Provider-specific model validation
   */
  abstract validateModel(model: string): boolean;

  /**
   * Get available models for this provider
   */
  abstract getAvailableModels(): string[];

  /**
   * Estimate cost for a request
   */
  abstract estimateCost(request: ChatCompletionRequest): number;

  /**
   * Transform provider-specific response to unified format
   */
  protected abstract transformResponse(
    response: any,
    request: ChatCompletionRequest,
    metrics: Partial<RequestMetrics>
  ): ChatCompletionResponse;

  /**
   * Transform provider-specific streaming response to unified format
   */
  protected abstract transformStreamChunk(
    chunk: any,
    request: ChatCompletionRequest
  ): ChatCompletionChunk | null;

  /**
   * Execute request with retry logic and circuit breaker
   */
  protected async executeWithRetry<T>(
    fn: () => Promise<T>,
    context?: {
      requestId?: string;
      operation?: string;
    }
  ): Promise<T> {
    const requestId = context?.requestId || this.generateRequestId();
    
    return this.circuitBreaker.execute(async () => {
      return this.retryHandler.execute(fn, {
        provider: this.provider,
        requestId,
        operation: context?.operation
      });
    });
  }

  /**
   * Execute request with timeout
   */
  protected async executeWithTimeout<T>(
    promise: Promise<T>,
    operation: string
  ): Promise<T> {
    const timeout = this.config.timeout || 30000; // 30 seconds default
    
    return withTimeout(promise, timeout, {
      operation,
      provider: this.provider
    });
  }

  /**
   * Create request metrics for tracking
   */
  protected createRequestMetrics(
    requestId: string,
    model: string,
    startTime: number
  ): Partial<RequestMetrics> {
    return {
      requestId,
      provider: this.provider,
      model,
      startTime,
      endTime: 0,
      tokens: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, estimated_cost: 0 },
      cost: 0,
      success: false
    };
  }

  /**
   * Finalize request metrics
   */
  protected finalizeMetrics(
    metrics: Partial<RequestMetrics>,
    usage: Usage,
    success: boolean,
    error?: SDKError
  ): RequestMetrics {
    return {
      ...metrics,
      endTime: Date.now(),
      tokens: usage,
      cost: usage.estimated_cost,
      success,
      error
    } as RequestMetrics;
  }

  /**
   * Generate unique request ID
   */
  protected generateRequestId(): string {
    return `${this.provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate API key format for this provider
   */
  protected abstract validateApiKey(apiKey: string): boolean;

  /**
   * Get default headers for requests
   */
  protected getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': this.config.userAgent || `ai-marketplace-sdk/0.1.0 (${this.provider})`
    };

    if (this.config.apiKey) {
      headers['Authorization'] = this.getAuthHeader(this.config.apiKey);
    }

    return headers;
  }

  /**
   * Get provider-specific authorization header
   */
  protected abstract getAuthHeader(apiKey: string): string;

  /**
   * Health check for the provider
   */
  async healthCheck(): Promise<{
    provider: ApiProvider;
    healthy: boolean;
    latency?: number;
    error?: string;
    capabilities: ProviderCapabilities;
    circuitBreakerStatus: any;
  }> {
    const startTime = Date.now();
    
    try {
      // Simple test request to verify provider is accessible
      await this.executeWithTimeout(
        this.testConnection(),
        'health_check'
      );

      return {
        provider: this.provider,
        healthy: true,
        latency: Date.now() - startTime,
        capabilities: this.getCapabilities(),
        circuitBreakerStatus: this.circuitBreaker.getStatus()
      };
    } catch (error) {
      return {
        provider: this.provider,
        healthy: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        capabilities: this.getCapabilities(),
        circuitBreakerStatus: this.circuitBreaker.getStatus()
      };
    }
  }

  /**
   * Test connection to provider - should be implemented by each provider
   */
  protected abstract testConnection(): Promise<void>;

  /**
   * Get provider configuration (without sensitive data)
   */
  getConfig(): Omit<ProviderConfig, 'apiKey'> {
    const { apiKey, ...safeConfig } = this.config;
    return safeConfig;
  }

  /**
   * Update provider configuration
   */
  updateConfig(updates: Partial<BaseProviderOptions>): void {
    Object.assign(this.config, updates);
  }
}

/**
 * Provider factory interface
 */
export interface ProviderFactory {
  create(config: ProviderConfig): BaseProvider;
  supports(provider: ApiProvider): boolean;
}

/**
 * Provider registry for managing multiple providers
 */
export class ProviderRegistry {
  private factories = new Map<ApiProvider, ProviderFactory>();
  private instances = new Map<string, BaseProvider>();

  /**
   * Register a provider factory
   */
  register(provider: ApiProvider, factory: ProviderFactory): void {
    this.factories.set(provider, factory);
  }

  /**
   * Get or create a provider instance
   */
  getProvider(config: ProviderConfig): BaseProvider {
    const key = `${config.provider}-${config.model}`;
    
    if (this.instances.has(key)) {
      return this.instances.get(key)!;
    }

    const factory = this.factories.get(config.provider);
    if (!factory) {
      throw new Error(`No factory registered for provider: ${config.provider}`);
    }

    const instance = factory.create(config);
    this.instances.set(key, instance);
    return instance;
  }

  /**
   * Get all registered providers
   */
  getRegisteredProviders(): ApiProvider[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Check if provider is supported
   */
  supports(provider: ApiProvider): boolean {
    return this.factories.has(provider);
  }

  /**
   * Clear all cached instances
   */
  clearCache(): void {
    this.instances.clear();
  }

  /**
   * Health check all providers
   */
  async healthCheckAll(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    for (const [provider, factory] of this.factories) {
      try {
        // Create a test instance with minimal config
        const testInstance = factory.create({
          provider,
          model: 'test',
          apiKey: 'test'
        });
        
        results[provider] = await testInstance.healthCheck();
      } catch (error) {
        results[provider] = {
          provider,
          healthy: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return results;
  }
}

// Global provider registry instance
export const providerRegistry = new ProviderRegistry();