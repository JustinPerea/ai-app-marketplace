// LlamaIndex Integration for AI Marketplace Platform
// Provides seamless LlamaIndex compatibility with multi-provider routing

interface AIMarketplaceConfig {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  teamId?: string;
  userId?: string;
  enableExperiments?: boolean;
  costTracking?: boolean;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CompletionResponse {
  text: string;
  usage?: {
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
}

/**
 * LlamaIndex LLM implementation for AI Marketplace Platform
 * Compatible with LlamaIndex's LLM interface
 */
export class AIMarketplaceLLM {
  private config: AIMarketplaceConfig;
  private requestCount: number = 0;
  private totalCost: number = 0;

  constructor(config: AIMarketplaceConfig) {
    this.config = {
      baseURL: 'http://localhost:3001/api/v1',
      defaultModel: 'gpt-4o-mini',
      enableExperiments: true,
      costTracking: true,
      ...config,
    };
  }

  /**
   * Complete method for LlamaIndex compatibility
   */
  async complete(prompt: string, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }): Promise<CompletionResponse> {
    const messages: ChatMessage[] = [
      { role: 'user', content: prompt }
    ];

    return this.chat(messages, options);
  }

  /**
   * Chat method for conversational interactions
   */
  async chat(messages: ChatMessage[], options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }): Promise<CompletionResponse> {
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

    const request = {
      model: options?.model || this.config.defaultModel || 'gpt-4o-mini',
      messages,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      stream: options?.stream || false,
    };

    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`AI Marketplace API error: ${response.status} - ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      // Update internal metrics
      this.requestCount++;
      if (this.config.costTracking && data.usage) {
        const estimatedCost = this.estimateCost(request.model, data.usage);
        this.totalCost += estimatedCost;
      }

      return {
        text: data.choices[0]?.message?.content || '',
        usage: data.usage,
        experiment: data._experiment,
      };

    } catch (error) {
      throw new Error(`LlamaIndex AI Marketplace integration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stream completion for real-time applications
   */
  async *streamComplete(prompt: string, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): AsyncGenerator<{ text: string; done: boolean }, void, unknown> {
    const messages: ChatMessage[] = [
      { role: 'user', content: prompt }
    ];

    yield* this.streamChat(messages, options);
  }

  /**
   * Stream chat for conversational interactions
   */
  async *streamChat(messages: ChatMessage[], options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): AsyncGenerator<{ text: string; done: boolean }, void, unknown> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };

    if (this.config.teamId) {
      headers['x-team-id'] = this.config.teamId;
    }
    if (this.config.userId) {
      headers['x-user-id'] = this.config.userId;
    }

    const request = {
      model: options?.model || this.config.defaultModel || 'gpt-4o-mini',
      messages,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      stream: true,
    };

    try {
      const response = await fetch(`${this.config.baseURL}/chat/completions/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`AI Marketplace API error: ${response.status} - ${error.error?.message || response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body available for streaming');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            yield { text: '', done: true };
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                yield { text: '', done: true };
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                
                if (content) {
                  yield { text: content, done: false };
                }
              } catch (e) {
                // Skip invalid JSON chunks
                console.warn('Failed to parse SSE chunk:', data);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      throw new Error(`LlamaIndex streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get embeddings for text (if supported by the model)
   */
  async getEmbeddings(texts: string[], options?: {
    model?: string;
  }): Promise<number[][]> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };

    if (this.config.teamId) {
      headers['x-team-id'] = this.config.teamId;
    }
    if (this.config.userId) {
      headers['x-user-id'] = this.config.userId;
    }

    const request = {
      model: options?.model || 'text-embedding-3-small',
      input: texts,
    };

    try {
      const response = await fetch(`${this.config.baseURL}/embeddings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`AI Marketplace Embeddings API error: ${response.status} - ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.data.map((item: any) => item.embedding);

    } catch (error) {
      throw new Error(`LlamaIndex embeddings error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Estimate cost based on model and usage
   */
  private estimateCost(model: string, usage: { prompt_tokens: number; completion_tokens: number }): number {
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

    return costs[model] || { input: 0.000001, output: 0.000003 };
  }

  /**
   * Get usage statistics
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

  /**
   * Get model metadata
   */
  getModelInfo(): {
    defaultModel: string;
    supportsStreaming: boolean;
    supportsEmbeddings: boolean;
    supportedModels: string[];
  } {
    return {
      defaultModel: this.config.defaultModel || 'gpt-4o-mini',
      supportsStreaming: true,
      supportsEmbeddings: true,
      supportedModels: [
        'gpt-4o',
        'gpt-4o-mini',
        'claude-3-5-sonnet-20241022',
        'claude-3-haiku-20240307',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'llama3.2:3b',
        'llama3.2:1b',
      ],
    };
  }
}

/**
 * LlamaIndex Embedding implementation for AI Marketplace Platform
 */
export class AIMarketplaceEmbedding {
  private llm: AIMarketplaceLLM;
  private defaultModel: string;

  constructor(config: AIMarketplaceConfig, embeddingModel?: string) {
    this.llm = new AIMarketplaceLLM(config);
    this.defaultModel = embeddingModel || 'text-embedding-3-small';
  }

  /**
   * Get embeddings for a single text
   */
  async getTextEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.llm.getEmbeddings([text], {
      model: this.defaultModel,
    });
    return embeddings[0] || [];
  }

  /**
   * Get embeddings for multiple texts
   */
  async getTextEmbeddings(texts: string[]): Promise<number[][]> {
    return this.llm.getEmbeddings(texts, {
      model: this.defaultModel,
    });
  }

  /**
   * Get query embedding (alias for single text embedding)
   */
  async getQueryEmbedding(query: string): Promise<number[]> {
    return this.getTextEmbedding(query);
  }

  /**
   * Get embedding dimension
   */
  getEmbeddingDimension(): number {
    // Return embedding dimensions based on model
    const dimensions: { [key: string]: number } = {
      'text-embedding-3-small': 1536,
      'text-embedding-3-large': 3072,
      'text-embedding-ada-002': 1536,
    };

    return dimensions[this.defaultModel] || 1536;
  }
}

/**
 * Factory class for creating different LlamaIndex configurations
 */
export class AIMarketplaceLlamaIndexFactory {
  private baseConfig: AIMarketplaceConfig;

  constructor(baseConfig: AIMarketplaceConfig) {
    this.baseConfig = baseConfig;
  }

  /**
   * Create a cost-optimized LLM instance
   */
  createCostOptimizedLLM(): AIMarketplaceLLM {
    return new AIMarketplaceLLM({
      ...this.baseConfig,
      defaultModel: 'gemini-1.5-flash',
      enableExperiments: true,
    });
  }

  /**
   * Create a performance-optimized LLM instance
   */
  createPerformanceOptimizedLLM(): AIMarketplaceLLM {
    return new AIMarketplaceLLM({
      ...this.baseConfig,
      defaultModel: 'gpt-4o',
      enableExperiments: false,
    });
  }

  /**
   * Create a balanced LLM instance
   */
  createBalancedLLM(): AIMarketplaceLLM {
    return new AIMarketplaceLLM({
      ...this.baseConfig,
      defaultModel: 'gpt-4o-mini',
      enableExperiments: true,
    });
  }

  /**
   * Create an embedding instance
   */
  createEmbedding(model?: string): AIMarketplaceEmbedding {
    return new AIMarketplaceEmbedding(this.baseConfig, model);
  }

  /**
   * Create a RAG-optimized setup
   */
  createRAGSetup(): {
    llm: AIMarketplaceLLM;
    embedding: AIMarketplaceEmbedding;
  } {
    return {
      llm: new AIMarketplaceLLM({
        ...this.baseConfig,
        defaultModel: 'gpt-4o-mini', // Good balance for RAG
        enableExperiments: true,
      }),
      embedding: new AIMarketplaceEmbedding(this.baseConfig, 'text-embedding-3-small'),
    };
  }
}

// Export types for TypeScript users
export type {
  AIMarketplaceConfig,
  ChatMessage,
  CompletionResponse,
};