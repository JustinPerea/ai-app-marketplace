/**
 * AI Marketplace SDK - Main Entry Point
 * 
 * Unified TypeScript SDK for AI App Marketplace with tree-shakable exports
 * Supports OpenAI, Claude, and other AI providers with intelligent routing
 * 
 * @example
 * ```typescript
 * import { Chat, openai } from '@ai-marketplace/sdk';
 * 
 * const chat = new Chat({
 *   provider: openai({ model: 'gpt-4o' })
 * });
 * 
 * const response = await chat.ask('Hello, world!');
 * ```
 */

// Core SDK exports
export { Chat } from './chat';

// Enhanced Orchestration Engine (our competitive moat!)
export { 
  AIService, 
  AIOrchestrator, 
  StrategyEngine, 
  ProviderSelector,
  ai 
} from './orchestration';

// Provider exports for tree-shaking
export { 
  providers,
  openai,
  claude,
  getSupportedProviders,
  isProviderSupported,
  checkProviderHealth
} from './providers';

// Type exports
export type {
  // Core types
  ApiProvider,
  SDKConfig,
  Message,
  Tool,
  
  // Request/Response types
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  ImageGenerationRequest,
  ImageGenerationResponse,
  
  // Provider types
  ProviderConfig,
  ProviderCapabilities,
  ProviderConstraints,
  ProviderSelection,
  
  // Usage and metrics
  Usage,
  UsageMetrics,
  RequestMetrics,
  
  // Error types
  SDKError,
  RateLimitError,
  AuthenticationError,
  ValidationError,
  
  // Utility types
  DeepPartial,
  RequiredFields,
  Optional
} from './types';

// Enhanced Orchestration Types
export type {
  AIRequest,
  AIResult,
  WorkflowStep,
  WorkflowResult
} from './orchestration';

// Error exports
export {
  BaseSDKError,
  SDKRateLimitError,
  SDKAuthenticationError,
  SDKValidationError,
  ErrorFactory,
  RetryHandler,
  CircuitBreaker,
  withTimeout,
  sanitizeErrorForLogging
} from './utils/errors';

// Re-export type guards from types
export {
  isSDKError,
  isRateLimitError,
  isAuthenticationError,
  isValidationError
} from './types';

// Provider registry (for advanced usage)
export { providerRegistry, BaseProvider } from './providers/base';

/**
 * SDK Version
 */
export const VERSION = '0.1.0';

/**
 * Default SDK Configuration
 */
export const DEFAULT_CONFIG = {
  enableUsageTracking: true,
  enableRetries: true,
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  debug: false
};

/**
 * Initialize SDK with global configuration
 */
export class SDK {
  private static instance: SDK | null = null;
  private config: any;

  private constructor(config: any) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize SDK singleton
   */
  static init(config: any): SDK {
    if (SDK.instance) {
      throw new Error('SDK already initialized. Use SDK.getInstance() to access the initialized instance.');
    }
    SDK.instance = new SDK(config);
    return SDK.instance;
  }

  /**
   * Get SDK singleton instance
   */
  static getInstance(): SDK {
    if (!SDK.instance) {
      throw new Error('SDK not initialized. Call SDK.init(config) first.');
    }
    return SDK.instance;
  }

  /**
   * Create Chat instance with SDK config
   */
  createChat(options: any = {}): any {
    const { Chat } = require('./chat');
    return new Chat({
      provider: this.config.defaultProvider ? {
        provider: this.config.defaultProvider,
        model: this.config.defaultModel || 'gpt-4o',
        apiKey: this.config.apiKey,
        timeout: this.config.timeout,
        maxRetries: this.config.maxRetries
      } : undefined,
      enableAutoRetry: this.config.enableRetries,
      trackUsage: this.config.enableUsageTracking,
      ...options
    });
  }

  /**
   * Get SDK configuration
   */
  getConfig(): any {
    const { apiKey, ...safeConfig } = this.config;
    return safeConfig;
  }

  /**
   * Update SDK configuration
   */
  updateConfig(updates: any): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Health check all providers
   */
  async healthCheck(): Promise<{
    sdk: { version: string; config: any };
    providers: any;
    timestamp: string;
  }> {
    const providerHealth = await (await import('./providers')).checkProviderHealth();
    
    return {
      sdk: {
        version: VERSION,
        config: this.getConfig()
      },
      providers: providerHealth,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reset SDK instance (for testing)
   */
  static reset(): void {
    SDK.instance = null;
  }
}

/**
 * Quick initialization helper
 */
export function initSDK(config: any): SDK {
  return SDK.init(config);
}

/**
 * Default export for CommonJS compatibility
 */
const defaultExports = {
  SDK,
  initSDK,
  VERSION,
  DEFAULT_CONFIG
};

export default defaultExports;