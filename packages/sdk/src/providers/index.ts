/**
 * AI Providers Module - Native Zero-Dependency Exports
 * 
 * Unified exports for all native AI provider implementations
 * Eliminates 263KB+ of external dependencies (openai: 186KB, @anthropic-ai/sdk: 50KB, axios: 15KB, zod: 12KB)
 */

// Base provider exports
export { BaseProvider, ProviderRegistry, providerRegistry, type ProviderFactory } from './base';

// Native provider factories
import { openAIFactory } from './openai';
import { anthropicFactory } from './claude';
import { googleFactory } from './google';
import { providerRegistry } from './base';

// OpenAI provider exports (native implementation)
export { OpenAIProvider, createOpenAIProvider, openAIFactory } from './openai';

// Anthropic/Claude provider exports (native implementation)
export { AnthropicProvider, createAnthropicProvider, anthropicFactory, claude } from './claude';
export { AnthropicProvider as ClaudeProvider } from './claude';

// Google Gemini provider exports (native implementation)
export { GoogleProvider, createGoogleProvider, googleFactory, gemini } from './google';

// Register all native providers (including legacy alias 'claude')
providerRegistry.register('openai', openAIFactory);
providerRegistry.register('anthropic', anthropicFactory);
providerRegistry.register('claude', anthropicFactory); // alias
providerRegistry.register('google', googleFactory);

// Re-export types for external use
export type {
  BaseProviderOptions
} from './base';

/**
 * Provider convenience functions
 */
export const providers = {
  openai: (config: any) => ({ provider: 'openai', model: 'gpt-4o', ...config }),
  claude: (config: any) => ({ provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', ...config }),
  gemini: (config: any) => ({ provider: 'google', model: 'gemini-1.5-flash', ...config })
} as const;

/**
 * Individual provider factory functions
 */
export const openai = (config: any) => ({ provider: 'openai', model: 'gpt-4o', ...config });

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