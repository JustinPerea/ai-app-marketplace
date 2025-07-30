/**
 * AI Providers Module - Exports
 * 
 * Unified exports for all AI provider implementations with factory functions
 */

// Base provider exports
export { BaseProvider, ProviderRegistry, providerRegistry, type ProviderFactory } from './base';

// Provider registry setup (import first)
import { OpenAIProviderFactory, openai } from './openai';
import { ClaudeProviderFactory, claude } from './claude';
import { providerRegistry } from './base';

// OpenAI provider exports
export { OpenAIProvider, OpenAIProviderFactory, openai, type OpenAIConfig } from './openai';

// Claude provider exports
export { ClaudeProvider, ClaudeProviderFactory, claude, type ClaudeConfig } from './claude';

// Register all providers
providerRegistry.register('openai', new OpenAIProviderFactory());
providerRegistry.register('claude', new ClaudeProviderFactory());

// Re-export types for external use
export type {
  BaseProviderOptions
} from './base';

/**
 * Provider convenience functions
 */
export const providers = {
  openai,
  claude
} as const;

/**
 * Get all registered provider types
 */
export function getSupportedProviders() {
  return providerRegistry.getRegisteredProviders();
}

/**
 * Check if a provider is supported
 */
export function isProviderSupported(provider: string) {
  return providerRegistry.supports(provider as any);
}

/**
 * Health check all providers
 */
export async function checkProviderHealth() {
  return providerRegistry.healthCheckAll();
}