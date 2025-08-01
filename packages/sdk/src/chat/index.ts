/**
 * Chat Module - Unified Chat Interface
 * 
 * Provides high-level chat interface with provider abstraction and intelligent routing
 */

import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  ProviderConfig,
  ProviderConstraints,
  ProviderSelection,
  Message,
  Tool
} from '../types';

import { providerRegistry } from '../providers/base';
import { BaseSDKError } from '../utils/errors';

export interface ChatOptions {
  provider?: ProviderConfig;
  constraints?: ProviderConstraints;
  enableAutoRetry?: boolean;
  enableFallback?: boolean;
  trackUsage?: boolean;
}

/**
 * High-level Chat interface with provider abstraction
 */
export class Chat {
  private defaultProvider?: ProviderConfig;
  private options: ChatOptions;

  constructor(options: ChatOptions = {}) {
    this.options = {
      enableAutoRetry: true,
      enableFallback: true,
      trackUsage: true,
      ...options
    };
    
    this.defaultProvider = options.provider;
  }

  /**
   * Complete a chat conversation
   */
  async complete(
    request: ChatCompletionRequest,
    options?: Partial<ChatOptions>
  ): Promise<ChatCompletionResponse> {
    const mergedOptions = { ...this.options, ...options };
    
    // Select optimal provider
    const providerConfig = await this.selectProvider(request, mergedOptions);
    
    // Get provider instance
    const provider = providerRegistry.getProvider(providerConfig);
    
    try {
      return await provider.chatCompletion(request);
    } catch (error) {
      // Handle fallback if enabled
      if (mergedOptions.enableFallback && this.shouldFallback(error)) {
        return this.executeWithFallback(request, providerConfig, mergedOptions);
      }
      throw error;
    }
  }

  /**
   * Stream a chat conversation
   */
  async* stream(
    request: ChatCompletionRequest,
    options?: Partial<ChatOptions>
  ): AsyncGenerator<ChatCompletionChunk, void, unknown> {
    const mergedOptions = { ...this.options, ...options };
    
    // Select optimal provider
    const providerConfig = await this.selectProvider(request, mergedOptions);
    
    // Get provider instance
    const provider = providerRegistry.getProvider(providerConfig);
    
    try {
      yield* provider.streamChatCompletion(request);
    } catch (error) {
      // Fallback for streaming is more complex, for now just throw
      throw error;
    }
  }

  /**
   * Simple text completion (convenience method)
   */
  async ask(
    message: string,
    options?: {
      system?: string;
      temperature?: number;
      maxTokens?: number;
    } & Partial<ChatOptions>
  ): Promise<string> {
    const messages: Message[] = [];
    
    if (options?.system) {
      messages.push({ role: 'system', content: options.system });
    }
    
    messages.push({ role: 'user', content: message });

    const request: ChatCompletionRequest = {
      messages,
      ...(options?.temperature && { temperature: options.temperature }),
      ...(options?.maxTokens && { max_tokens: options.maxTokens })
    };

    const response = await this.complete(request, options);
    const content = response.choices[0]?.message.content || '';
    return typeof content === 'string' ? content : JSON.stringify(content);
  }

  /**
   * Chat with conversation history
   */
  async chat(
    messages: Message[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      tools?: Tool[];
    } & Partial<ChatOptions>
  ): Promise<ChatCompletionResponse> {
    const request: ChatCompletionRequest = {
      messages,
      ...(options?.temperature && { temperature: options.temperature }),
      ...(options?.maxTokens && { max_tokens: options.maxTokens }),
      ...(options?.tools && { tools: options.tools })
    };

    return this.complete(request, options);
  }

  /**
   * Create a conversation instance for stateful chat
   */
  conversation(options?: {
    system?: string;
    temperature?: number;
    maxTokens?: number;
  } & Partial<ChatOptions>): Conversation {
    return new Conversation(this, options);
  }

  /**
   * Select optimal provider based on request and constraints
   */
  private async selectProvider(
    request: ChatCompletionRequest,
    options: ChatOptions
  ): Promise<ProviderConfig> {
    // Use explicit provider if specified
    if (options.provider) {
      return options.provider;
    }

    // Use default provider if no constraints
    if (this.defaultProvider && !options.constraints) {
      return this.defaultProvider;
    }

    // Implement intelligent provider selection
    return this.intelligentProviderSelection(request, options.constraints);
  }

  /**
   * Intelligent provider selection based on constraints and request characteristics
   */
  private async intelligentProviderSelection(
    request: ChatCompletionRequest,
    constraints?: ProviderConstraints
  ): Promise<ProviderConfig> {
    const supportedProviders = providerRegistry.getRegisteredProviders();
    const candidates: ProviderSelection[] = [];

    for (const provider of supportedProviders) {
      // Skip excluded providers
      if (constraints?.excludeProviders?.includes(provider)) {
        continue;
      }

      // Get provider instance for evaluation
      const config: ProviderConfig = {
        provider,
        model: this.getDefaultModel(provider),
        apiKey: '' // Will be resolved later
      };

      const providerInstance = providerRegistry.getProvider(config);
      const capabilities = providerInstance.getCapabilities();

      // Check required capabilities
      if (constraints?.requiredCapabilities) {
        const hasRequired = constraints.requiredCapabilities.every(
          cap => capabilities[cap] === true
        );
        if (!hasRequired) continue;
      }

      // Estimate cost and quality
      const estimatedCost = providerInstance.estimateCost(request);
      const estimatedLatency = this.estimateLatency(provider);
      const qualityScore = this.calculateQualityScore(provider, request);

      // Apply constraints
      if (constraints?.maxCost && estimatedCost > constraints.maxCost) {
        continue;
      }
      if (constraints?.maxLatency && estimatedLatency > constraints.maxLatency) {
        continue;
      }
      if (constraints?.qualityThreshold && qualityScore < constraints.qualityThreshold) {
        continue;
      }

      candidates.push({
        provider,
        model: config.model,
        estimatedCost,
        estimatedLatency,
        qualityScore,
        reasoning: this.generateSelectionReasoning(provider, estimatedCost, qualityScore)
      });
    }

    if (candidates.length === 0) {
      throw new BaseSDKError(
        'No providers meet the specified constraints',
        'NO_SUITABLE_PROVIDER',
        { details: { constraints } }
      );
    }

    // Select best candidate (optimize for cost/quality ratio)
    const bestCandidate = candidates.reduce((best, current) => {
      const bestScore = best.qualityScore / best.estimatedCost;
      const currentScore = current.qualityScore / current.estimatedCost;
      return currentScore > bestScore ? current : best;
    });

    // Check for preferred providers
    if (constraints?.preferredProviders) {
      const preferredCandidate = candidates.find(c => 
        constraints.preferredProviders!.includes(c.provider)
      );
      if (preferredCandidate) {
        return {
          provider: preferredCandidate.provider,
          model: preferredCandidate.model,
          apiKey: '' // Will be resolved later
        };
      }
    }

    return {
      provider: bestCandidate.provider,
      model: bestCandidate.model,
      apiKey: '' // Will be resolved later
    };
  }

  /**
   * Execute request with fallback providers
   */
  private async executeWithFallback(
    request: ChatCompletionRequest,
    failedProvider: ProviderConfig,
    options: ChatOptions
  ): Promise<ChatCompletionResponse> {
    const fallbackProviders = this.getFallbackProviders(failedProvider);
    
    for (const provider of fallbackProviders) {
      try {
        const providerInstance = providerRegistry.getProvider(provider);
        return await providerInstance.chatCompletion(request);
      } catch (error) {
        // Continue to next fallback
        continue;
      }
    }

    throw new BaseSDKError(
      'All fallback providers failed',
      'ALL_PROVIDERS_FAILED',
      { details: { originalProvider: failedProvider.provider } }
    );
  }

  /**
   * Determine if error should trigger fallback
   */
  private shouldFallback(error: any): boolean {
    // Fallback on rate limits, server errors, but not auth/validation errors
    if (error.code === 'RATE_LIMIT_EXCEEDED') return true;
    if (error.statusCode && error.statusCode >= 500) return true;
    if (error.code === 'NETWORK_ERROR') return true;
    return false;
  }

  /**
   * Get fallback providers for a failed provider
   */
  private getFallbackProviders(failedProvider: ProviderConfig): ProviderConfig[] {
    const fallbackMap: Record<string, string[]> = {
      'openai': ['claude'],
      'claude': ['openai'],
      'google': ['openai', 'claude'],
      'azure': ['openai', 'claude'],
      'cohere': ['openai', 'claude'],
      'huggingface': ['openai', 'claude']
    };

    const fallbacks = fallbackMap[failedProvider.provider] || ['openai'];
    return fallbacks.map(provider => ({
      provider: provider as any,
      model: this.getDefaultModel(provider as any),
      apiKey: '' // Will be resolved later
    }));
  }

  /**
   * Get default model for provider
   */
  private getDefaultModel(provider: string): string {
    const defaultModels: Record<string, string> = {
      'openai': 'gpt-4o',
      'claude': 'claude-3-5-sonnet-20241022',
      'google': 'gemini-pro',
      'azure': 'gpt-4',
      'cohere': 'command-r-plus',
      'huggingface': 'meta-llama/Llama-2-70b-chat-hf'
    };
    return defaultModels[provider] || 'gpt-4o';
  }

  /**
   * Estimate latency for provider (placeholder implementation)
   */
  private estimateLatency(provider: string): number {
    const latencyMap: Record<string, number> = {
      'openai': 2000,
      'claude': 3000,
      'google': 1500,
      'azure': 2500,
      'cohere': 2000,
      'huggingface': 4000
    };
    return latencyMap[provider] || 2000;
  }

  /**
   * Calculate quality score for provider (placeholder implementation)
   */
  private calculateQualityScore(provider: string, request: ChatCompletionRequest): number {
    // Simple quality scoring based on provider capabilities
    const qualityMap: Record<string, number> = {
      'openai': 0.9,
      'claude': 0.95,
      'google': 0.8,
      'azure': 0.9,
      'cohere': 0.7,
      'huggingface': 0.6
    };
    return qualityMap[provider] || 0.5;
  }

  /**
   * Generate reasoning for provider selection
   */
  private generateSelectionReasoning(provider: string, cost: number, quality: number): string {
    return `Selected ${provider} for optimal cost/quality ratio (cost: $${cost.toFixed(4)}, quality: ${quality.toFixed(2)})`;
  }
}

/**
 * Stateful conversation class
 */
export class Conversation {
  private messages: Message[] = [];
  private chat: Chat;
  private options: any;

  constructor(chat: Chat, options: any = {}) {
    this.chat = chat;
    this.options = options;

    // Add system message if provided
    if (options.system) {
      this.messages.push({ role: 'system', content: options.system });
    }
  }

  /**
   * Send a message and get response
   */
  async say(message: string): Promise<string> {
    this.messages.push({ role: 'user', content: message });

    const response = await this.chat.chat(this.messages, this.options);
    const assistantMessage = response.choices[0]?.message.content || '';

    this.messages.push({ role: 'assistant', content: assistantMessage });

    return assistantMessage;
  }

  /**
   * Get conversation history
   */
  getHistory(): Message[] {
    return [...this.messages];
  }

  /**
   * Clear conversation history (keeping system message)
   */
  clear(): void {
    const systemMessage = this.messages.find(m => m.role === 'system');
    this.messages = systemMessage ? [systemMessage] : [];
  }

  /**
   * Get conversation summary
   */
  async summarize(): Promise<string> {
    if (this.messages.length < 3) {
      return 'Conversation too short to summarize';
    }

    const summaryRequest: Message[] = [
      { role: 'system', content: 'Summarize the following conversation concisely.' },
      { role: 'user', content: JSON.stringify(this.messages) }
    ];

    const response = await this.chat.chat(summaryRequest, { ...this.options, maxTokens: 200 });
    return response.choices[0]?.message.content || 'Unable to generate summary';
  }
}

/**
 * Convenience function to create a Chat instance
 */
export function createChat(options?: ChatOptions): Chat {
  return new Chat(options);
}

/**
 * Quick helper functions
 */
export async function ask(
  message: string,
  options?: {
    provider?: ProviderConfig;
    system?: string;
    temperature?: number;
  }
): Promise<string> {
  const chat = new Chat({ provider: options?.provider });
  return chat.ask(message, options);
}

export async function chat(
  messages: Message[],
  options?: {
    provider?: ProviderConfig;
    temperature?: number;
    tools?: Tool[];
  }
): Promise<ChatCompletionResponse> {
  const chatInstance = new Chat({ provider: options?.provider });
  return chatInstance.chat(messages, options);
}