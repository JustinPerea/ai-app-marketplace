/**
 * AI Marketplace SDK
 *
 * A TypeScript SDK for intelligent AI provider routing with ML-powered optimization
 * Supports OpenAI, Anthropic, and Google AI with zero external dependencies
 */
export { AIMarketplaceClient } from './client';
export * from './types';
export { OpenAIProvider } from './providers/openai';
export { AnthropicProvider } from './providers/anthropic';
export { GoogleProvider } from './providers/google';
export { BaseAIProvider } from './providers/base';
export { MLIntelligentRouter } from './ml/router';
export type { AIRequest, AIResponse, AIStreamChunk, AIMessage, AIModel, AIError, ClientOptions, SDKConfig, RouterConfig, CacheConfig, ProviderStatus, CostAnalysis, MLRouteDecision, RequestFeatures, PredictionResult, } from './types';
export { APIProvider, RequestType, MODEL_EQUIVALENTS, DEFAULT_ROUTER_CONFIG, DEFAULT_CACHE_CONFIG, PERFORMANCE_TARGETS, COST_THRESHOLDS, } from './types';
import { AIMarketplaceClient } from './client';
import type { ClientOptions } from './types';
export declare function createClient(options: ClientOptions): AIMarketplaceClient;
export declare const VERSION = "1.0.0";
//# sourceMappingURL=index.d.ts.map