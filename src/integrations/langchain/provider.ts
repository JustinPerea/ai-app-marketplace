// LangChain Integration for AI Marketplace Platform
// Provides seamless LangChain compatibility with multi-provider routing

import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseMessage, AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import { ChatResult, ChatGeneration } from '@langchain/core/outputs';

interface AIMarketplaceConfig {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  teamId?: string;
  userId?: string;
  enableExperiments?: boolean;
  costTracking?: boolean;
}

interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  _experiment?: {
    experiment_id: string;
    variant_id: string;
    provider_used: string;
    model_used: string;
  };
}

/**
 * LangChain chat model that integrates with AI Marketplace Platform
 * Supports multi-provider routing, cost optimization, and A/B testing
 */
export class AIMarketplaceChatModel extends BaseChatModel {
  private config: AIMarketplaceConfig;
  private requestCount: number = 0;
  private totalCost: number = 0;

  constructor(config: AIMarketplaceConfig) {
    super({
      ...config,
    });
    this.config = {
      baseURL: 'http://localhost:3001/api/v1',
      defaultModel: 'gpt-4o-mini',
      enableExperiments: true,
      costTracking: true,
      ...config,
    };
  }

  _llmType(): string {
    return 'ai-marketplace';
  }

  /**
   * Convert LangChain messages to AI Marketplace format
   */
  private formatMessages(messages: BaseMessage[]): Array<{ role: string; content: string }> {
    return messages.map(message => {
      let role: string;
      
      if (message instanceof SystemMessage) {
        role = 'system';
      } else if (message instanceof HumanMessage) {
        role = 'user';
      } else if (message instanceof AIMessage) {
        role = 'assistant';
      } else {
        role = 'user'; // Default fallback
      }

      return {
        role,
        content: message.content.toString(),
      };
    });
  }

  /**
   * Make API call to AI Marketplace Platform
   */
  private async callAPI(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };

    // Add team and user context for experiments and analytics
    if (this.config.teamId) {
      headers['x-team-id'] = this.config.teamId;
    }
    if (this.config.userId) {
      headers['x-user-id'] = this.config.userId;
    }

    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`AI Marketplace API error: ${response.status} - ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate chat completion using AI Marketplace Platform
   */
  async _generate(
    messages: BaseMessage[],
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun
  ): Promise<ChatResult> {
    const formattedMessages = this.formatMessages(messages);
    
    const request: ChatCompletionRequest = {
      model: options.model || this.config.defaultModel || 'gpt-4o-mini',
      messages: formattedMessages,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
      stream: false,
    };

    try {
      // Track request start time for latency measurement
      const startTime = Date.now();
      
      const response = await this.callAPI(request);
      
      const latency = Date.now() - startTime;
      
      // Update internal metrics
      this.requestCount++;
      if (this.config.costTracking && response.usage) {
        // Estimate cost based on usage (simplified calculation)
        const estimatedCost = this.estimateCost(request.model, response.usage);
        this.totalCost += estimatedCost;
      }

      // Log experiment information if available
      if (response._experiment && runManager) {
        await runManager.handleLLMStart?.(
          { name: this._llmType() },
          [formattedMessages],
          undefined,
          undefined,
          {
            experiment_id: response._experiment.experiment_id,
            variant_id: response._experiment.variant_id,
            provider_used: response._experiment.provider_used,
            actual_model: response._experiment.model_used,
            latency_ms: latency,
          }
        );
      }

      const generations: ChatGeneration[] = response.choices.map((choice, index) => ({
        text: choice.message.content,
        message: new AIMessage(choice.message.content),
        generationInfo: {
          finish_reason: choice.finish_reason,
          index,
          usage: response.usage,
          experiment: response._experiment,
          latency_ms: latency,
        },
      }));

      return {
        generations,
        llmOutput: {
          tokenUsage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          },
          model: response.model,
          experiment: response._experiment,
        },
      };

    } catch (error) {
      if (runManager) {
        await runManager.handleLLMError?.(error as Error);
      }
      throw error;
    }
  }

  /**
   * Estimate cost based on model and usage
   */
  private estimateCost(model: string, usage: { prompt_tokens: number; completion_tokens: number }): number {
    // Simplified cost estimation - in production, this would use real-time pricing
    const costPerToken = this.getCostPerToken(model);
    return (usage.prompt_tokens * costPerToken.input) + (usage.completion_tokens * costPerToken.output);
  }

  private getCostPerToken(model: string): { input: number; output: number } {
    const costs: { [key: string]: { input: number; output: number } } = {
      'gpt-4o': { input: 0.000005, output: 0.000015 },
      'gpt-4o-mini': { input: 0.00000015, output: 0.0000006 },
      'claude-3-5-sonnet-20241022': { input: 0.000003, output: 0.000015 },
      'claude-3-haiku-20240307': { input: 0.00000025, output: 0.00000125 },
      'gemini-1.5-pro': { input: 0.0000035, output: 0.0000105 },
      'gemini-1.5-flash': { input: 0.000000075, output: 0.0000003 },
    };

    return costs[model] || { input: 0.000001, output: 0.000003 }; // Default fallback
  }

  /**
   * Get usage statistics for this model instance
   */
  getUsageStats(): {
    requestCount: number;
    totalCost: number;
    averageCostPerRequest: number;
  } {
    return {
      requestCount: this.requestCount,
      totalCost: this.totalCost,
      averageCostPerRequest: this.requestCount > 0 ? this.totalCost / this.requestCount : 0,
    };
  }

  /**
   * Reset usage statistics
   */
  resetUsageStats(): void {
    this.requestCount = 0;
    this.totalCost = 0;
  }
}

/**
 * Convenience function to create AI Marketplace chat model
 */
export function createAIMarketplaceChatModel(config: AIMarketplaceConfig): AIMarketplaceChatModel {
  return new AIMarketplaceChatModel(config);
}

/**
 * Factory function for different model configurations
 */
export class AIMarketplaceModelFactory {
  private baseConfig: AIMarketplaceConfig;

  constructor(baseConfig: AIMarketplaceConfig) {
    this.baseConfig = baseConfig;
  }

  /**
   * Create a cost-optimized model instance
   */
  createCostOptimized(): AIMarketplaceChatModel {
    return new AIMarketplaceChatModel({
      ...this.baseConfig,
      defaultModel: 'gemini-1.5-flash', // Most cost-effective option
      enableExperiments: true, // Enable A/B testing for further optimization
    });
  }

  /**
   * Create a performance-optimized model instance
   */
  createPerformanceOptimized(): AIMarketplaceChatModel {
    return new AIMarketplaceChatModel({
      ...this.baseConfig,
      defaultModel: 'gpt-4o', // High-quality option
      enableExperiments: false, // Disable experiments for consistent performance
    });
  }

  /**
   * Create a balanced model instance
   */
  createBalanced(): AIMarketplaceChatModel {
    return new AIMarketplaceChatModel({
      ...this.baseConfig,
      defaultModel: 'gpt-4o-mini', // Good balance of cost and quality
      enableExperiments: true,
    });
  }

  /**
   * Create a privacy-focused model instance (local processing)
   */
  createPrivacyFocused(): AIMarketplaceChatModel {
    return new AIMarketplaceChatModel({
      ...this.baseConfig,
      defaultModel: 'llama3.2:3b', // Local Ollama model
      enableExperiments: false,
    });
  }
}

// Export types for TypeScript users
export type {
  AIMarketplaceConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
};