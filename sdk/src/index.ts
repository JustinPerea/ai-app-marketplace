/**
 * AI Marketplace SDK
 * 
 * A TypeScript SDK for intelligent AI provider routing with ML-powered optimization
 * Supports OpenAI, Anthropic, and Google AI with zero external dependencies
 */

// Main client
export { AIMarketplaceClient } from './client';

// Core types and interfaces
export * from './types';

// Provider implementations
export { OpenAIProvider } from './providers/openai';
export { AnthropicProvider } from './providers/anthropic';
export { GoogleProvider } from './providers/google';
export { BaseAIProvider } from './providers/base';

// ML routing
export { MLIntelligentRouter } from './ml/router';

// Re-export key types for convenience
export type {
  AIRequest,
  AIResponse,
  AIStreamChunk,
  AIMessage,
  AIModel,
  AIError,
  ClientOptions,
  SDKConfig,
  RouterConfig,
  CacheConfig,
  ProviderStatus,
  CostAnalysis,
  MLRouteDecision,
  RequestFeatures,
  PredictionResult,
} from './types';

// Constants
export {
  APIProvider,
  RequestType,
  MODEL_EQUIVALENTS,
  DEFAULT_ROUTER_CONFIG,
  DEFAULT_CACHE_CONFIG,
  PERFORMANCE_TARGETS,
  COST_THRESHOLDS,
} from './types';

// Import the client class and types
import { AIMarketplaceClient } from './client';
import type { ClientOptions } from './types';

// Convenience factory function
export function createClient(options: ClientOptions): AIMarketplaceClient {
  return new AIMarketplaceClient(options);
}

// Version
export const VERSION = '1.0.0';