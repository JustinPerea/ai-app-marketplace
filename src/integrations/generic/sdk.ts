// Generic SDK Integration for AI Marketplace Platform
// Framework-agnostic integration that works with any JavaScript/TypeScript project

interface AIMarketplaceConfig {
  apiKey: string;
  baseURL?: string;
  teamId?: string;
  userId?: string;
  enableExperiments?: boolean;
  costTracking?: boolean;
  timeout?: number;
  retries?: number;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string | string[];
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
  experiment?: {
    experiment_id: string;
    variant_id: string;
    provider_used: string;
    model_used: string;
  };
  metadata?: {
    latency_ms: number;
    cost_usd: number;
    provider: string;
  };
}

interface StreamingChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
}

interface EmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

interface ModelInfo {
  id: string;
  object: string;
  provider: string;
  context_length: number;
  cost_per_input_token: number;
  cost_per_output_token: number;
  supports_streaming: boolean;
  supports_function_calling: boolean;
}

interface UsageStats {
  total_requests: number;
  total_cost: number;
  total_tokens: {
    input: number;
    output: number;
  };
  requests_by_provider: { [provider: string]: number };
  requests_by_model: { [model: string]: number };
  average_latency_ms: number;
  success_rate: number;
}

/**
 * Main SDK class for AI Marketplace Platform integration
 */
export class AIMarketplaceSDK {
  private config: Required<AIMarketplaceConfig>;
  private stats: UsageStats;

  constructor(config: AIMarketplaceConfig) {
    this.config = {
      baseURL: 'http://localhost:3001/api/v1',
      teamId: '',
      userId: '',
      enableExperiments: true,
      costTracking: true,
      timeout: 30000,
      retries: 3,
      ...config,
    };

    this.stats = {
      total_requests: 0,
      total_cost: 0,
      total_tokens: { input: 0, output: 0 },
      requests_by_provider: {},
      requests_by_model: {},
      average_latency_ms: 0,
      success_rate: 0,
    };
  }

  /**
   * Create a chat completion
   */
  async createChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<ChatCompletionResponse> {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest('/chat/completions', {
        method: 'POST',
        body: JSON.stringify({
          model: options.model || 'gpt-4o-mini',
          messages,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          stream: options.stream || false,
          top_p: options.topP,
          frequency_penalty: options.frequencyPenalty,
          presence_penalty: options.presencePenalty,
          stop: options.stop,
        }),
      });

      const data: ChatCompletionResponse = await response.json();
      
      // Add metadata
      data.metadata = {
        latency_ms: Date.now() - startTime,
        cost_usd: this.calculateCost(data.model, data.usage),
        provider: this.getProviderFromModel(data.model),
      };

      // Update statistics
      this.updateStats(data);

      return data;

    } catch (error) {
      this.updateStats(null, error as Error);
      throw error;
    }
  }

  /**
   * Create a streaming chat completion
   */
  async createStreamingChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<AsyncIterable<StreamingChunk>> {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest('/chat/completions/stream', {
        method: 'POST',
        body: JSON.stringify({
          model: options.model || 'gpt-4o-mini',
          messages,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          stream: true,
          top_p: options.topP,
          frequency_penalty: options.frequencyPenalty,
          presence_penalty: options.presencePenalty,
          stop: options.stop,
        }),
      });

      return this.processStreamingResponse(response, startTime);

    } catch (error) {
      this.updateStats(null, error as Error);
      throw error;
    }
  }

  /**
   * Create embeddings
   */
  async createEmbedding(
    input: string | string[],
    options: EmbeddingOptions = {}
  ): Promise<EmbeddingResponse> {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest('/embeddings', {
        method: 'POST',
        body: JSON.stringify({
          model: options.model || 'text-embedding-3-small',
          input,
          dimensions: options.dimensions,
        }),
      });

      const data: EmbeddingResponse = await response.json();
      
      // Update statistics for embeddings
      this.stats.total_requests++;
      this.stats.total_tokens.input += data.usage.prompt_tokens;

      return data;

    } catch (error) {
      this.updateStats(null, error as Error);
      throw error;
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<{ data: ModelInfo[] }> {
    try {
      const response = await this.makeRequest('/models', {
        method: 'GET',
      });

      return response.json();

    } catch (error) {
      throw new Error(`Failed to list models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): UsageStats {
    return { ...this.stats };
  }

  /**
   * Reset usage statistics
   */
  resetUsageStats(): void {
    this.stats = {
      total_requests: 0,
      total_cost: 0,
      total_tokens: { input: 0, output: 0 },
      requests_by_provider: {},
      requests_by_model: {},
      average_latency_ms: 0,
      success_rate: 0,
    };
  }

  /**
   * Get cost estimate for a request
   */
  estimateCost(model: string, inputTokens: number, outputTokens: number = 0): number {
    return this.calculateCost(model, {
      prompt_tokens: inputTokens,
      completion_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
    });
  }

  /**
   * Make HTTP request with retries and error handling
   */
  private async makeRequest(endpoint: string, options: RequestInit): Promise<Response> {
    const url = `${this.config.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      ...options.headers,
    };

    if (this.config.teamId) {
      (headers as any)['x-team-id'] = this.config.teamId;
    }
    if (this.config.userId) {
      (headers as any)['x-user-id'] = this.config.userId;
    }

    let lastError: Error;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(`API error: ${response.status} - ${error.error?.message || response.statusText}`);
        }

        return response;

      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.retries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Process streaming response
   */
  private async* processStreamingResponse(response: Response, startTime: number): AsyncIterable<StreamingChunk> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body available for streaming');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              return;
            }

            try {
              const chunk: StreamingChunk = JSON.parse(data);
              yield chunk;
            } catch (e) {
              console.warn('Failed to parse streaming chunk:', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Calculate cost based on model and usage
   */
  private calculateCost(model: string, usage: { prompt_tokens: number; completion_tokens: number }): number {
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
      'text-embedding-3-small': { input: 0.00000002, output: 0 },
      'text-embedding-3-large': { input: 0.00000013, output: 0 },
    };

    return costs[model] || { input: 0.000001, output: 0.000003 };
  }

  /**
   * Get provider from model name
   */
  private getProviderFromModel(model: string): string {
    if (model.startsWith('gpt-')) return 'openai';
    if (model.includes('claude')) return 'anthropic';
    if (model.includes('gemini')) return 'google';
    if (model.includes('command')) return 'cohere';
    if (model.includes('llama')) return 'ollama';
    return 'unknown';
  }

  /**
   * Update internal statistics
   */
  private updateStats(response: ChatCompletionResponse | null, error?: Error): void {
    this.stats.total_requests++;

    if (response) {
      // Successful request
      this.stats.total_cost += response.metadata?.cost_usd || 0;
      this.stats.total_tokens.input += response.usage.prompt_tokens;
      this.stats.total_tokens.output += response.usage.completion_tokens;
      
      const provider = response.metadata?.provider || 'unknown';
      this.stats.requests_by_provider[provider] = (this.stats.requests_by_provider[provider] || 0) + 1;
      this.stats.requests_by_model[response.model] = (this.stats.requests_by_model[response.model] || 0) + 1;
      
      // Update average latency
      const currentAvg = this.stats.average_latency_ms;
      const newLatency = response.metadata?.latency_ms || 0;
      this.stats.average_latency_ms = (currentAvg * (this.stats.total_requests - 1) + newLatency) / this.stats.total_requests;
    }

    // Update success rate
    const successfulRequests = this.stats.total_requests - (error ? 1 : 0);
    this.stats.success_rate = successfulRequests / this.stats.total_requests;
  }
}

/**
 * Factory functions for different use cases
 */
export class AIMarketplaceFactory {
  /**
   * Create cost-optimized SDK instance
   */
  static createCostOptimized(apiKey: string, options?: Partial<AIMarketplaceConfig>): AIMarketplaceSDK {
    return new AIMarketplaceSDK({
      apiKey,
      enableExperiments: true, // Enable A/B testing for cost optimization
      costTracking: true,
      ...options,
    });
  }

  /**
   * Create performance-optimized SDK instance
   */
  static createPerformanceOptimized(apiKey: string, options?: Partial<AIMarketplaceConfig>): AIMarketplaceSDK {
    return new AIMarketplaceSDK({
      apiKey,
      enableExperiments: false, // Disable experiments for consistent performance
      costTracking: false,
      timeout: 10000, // Shorter timeout for performance
      ...options,
    });
  }

  /**
   * Create development SDK instance with debugging
   */
  static createDevelopment(apiKey: string, options?: Partial<AIMarketplaceConfig>): AIMarketplaceSDK {
    return new AIMarketplaceSDK({
      apiKey,
      enableExperiments: true,
      costTracking: true,
      retries: 1, // Fewer retries for faster debugging
      ...options,
    });
  }

  /**
   * Create production SDK instance with reliability features
   */
  static createProduction(apiKey: string, options?: Partial<AIMarketplaceConfig>): AIMarketplaceSDK {
    return new AIMarketplaceSDK({
      apiKey,
      enableExperiments: true,
      costTracking: true,
      timeout: 60000, // Longer timeout for production
      retries: 5, // More retries for reliability
      ...options,
    });
  }
}

// Convenience functions for common operations
export const aiMarketplace = {
  /**
   * Quick chat completion
   */
  async chat(apiKey: string, message: string, options?: ChatCompletionOptions): Promise<string> {
    const sdk = new AIMarketplaceSDK({ apiKey });
    const response = await sdk.createChatCompletion([
      { role: 'user', content: message }
    ], options);
    return response.choices[0]?.message?.content || '';
  },

  /**
   * Quick embedding
   */
  async embed(apiKey: string, text: string, options?: EmbeddingOptions): Promise<number[]> {
    const sdk = new AIMarketplaceSDK({ apiKey });
    const response = await sdk.createEmbedding(text, options);
    return response.data[0]?.embedding || [];
  },

  /**
   * Quick cost estimate
   */
  estimateCost(model: string, inputTokens: number, outputTokens: number = 0): number {
    const sdk = new AIMarketplaceSDK({ apiKey: 'dummy' });
    return sdk.estimateCost(model, inputTokens, outputTokens);
  },
};

// Export types for TypeScript users
export type {
  AIMarketplaceConfig,
  ChatMessage,
  ChatCompletionOptions,
  ChatCompletionResponse,
  StreamingChunk,
  EmbeddingOptions,
  EmbeddingResponse,
  ModelInfo,
  UsageStats,
};