/**
 * AI Integration Layer - Main Export File
 * 
 * Exports all AI integration components for use throughout the application
 */

// Core types and interfaces
export * from './types';

// Provider implementations
export { OpenAIProvider } from './providers/openai';
export { AnthropicProvider } from './providers/anthropic';
export { GoogleProvider } from './providers/google';
export { BaseAIProvider, AIError } from './providers/base';

// Router and optimization
export { AIProviderRouter } from './router';

// Error handling and recovery
export { AIErrorHandler } from './error-handler';

// Caching and performance
export { AIResponseCache, CachedAIService } from './cache';

// Analytics and monitoring
export { AIAnalyticsService } from './analytics';

// Main service
export { AIService, createAIService, getAIService } from './service';

// Configuration constants
export {
  DEFAULT_ROUTER_CONFIG,
  DEFAULT_CACHE_CONFIG,
  PERFORMANCE_TARGETS,
  COST_THRESHOLDS,
  MODEL_EQUIVALENTS,
} from './types';