/**
 * OpenAI Provider Implementation
 * 
 * Provides OpenAI API integration with unified interface
 */

import type {
  ApiProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  ImageGenerationRequest,
  ImageGenerationResponse,
  ProviderConfig,
  ProviderCapabilities,
  RequestMetrics,
  Usage
} from '../types';

import { BaseProvider, type BaseProviderOptions, type ProviderFactory } from './base';
import { ErrorFactory } from '../utils/errors';

/**
 * OpenAI-specific configuration
 */
export interface OpenAIConfig extends BaseProviderOptions {
  organization?: string;
  project?: string;
}

/**
 * OpenAI Provider Implementation
 */
export class OpenAIProvider extends BaseProvider {
  private readonly openaiConfig: OpenAIConfig;

  constructor(config: ProviderConfig & OpenAIConfig) {
    super('openai', config);
    this.openaiConfig = config;
  }

  /**
   * Get OpenAI provider capabilities
   */
  getCapabilities(): ProviderCapabilities {
    return {
      chat: true,
      images: true,
      embeddings: true,
      tools: true,
      streaming: true,
      vision: true,
      maxTokens: 128000,
      costPer1kTokens: { input: 0.01, output: 0.03 }
    };
  }

  /**
   * Validate OpenAI model
   */
  validateModel(model: string): boolean {
    const validModels = this.getAvailableModels();
    return validModels.includes(model);
  }

  /**
   * Get available OpenAI models
   */
  getAvailableModels(): string[] {
    return [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k'
    ];
  }

  /**
   * Estimate cost for OpenAI request
   */
  estimateCost(request: ChatCompletionRequest): number {
    const model = request.model || this.config.model;
    const tokenCount = this.estimateTokenCount(request);
    
    // Model-specific pricing (per 1k tokens)
    const pricing = this.getModelPricing(model);
    const inputCost = (tokenCount.input / 1000) * pricing.input;
    const outputCost = (tokenCount.output / 1000) * pricing.output;
    
    return inputCost + outputCost;
  }

  /**
   * Chat completion implementation
   */
  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    const metrics = this.createRequestMetrics(requestId, request.model || this.config.model, startTime);

    return this.executeWithRetry(async () => {
      const openaiRequest = this.transformRequest(request);
      
      const response = await this.executeWithTimeout(
        this.makeOpenAIRequest('/chat/completions', openaiRequest),
        'chat_completion'
      );

      const usage = this.calculateUsage(response, request);
      const transformedResponse = this.transformResponse(response, request, metrics);
      
      // Log successful request metrics
      this.logRequestMetrics(this.finalizeMetrics(metrics, usage, true));
      
      return transformedResponse;
    }, { requestId, operation: 'chat_completion' });
  }

  /**
   * Streaming chat completion implementation
   */
  async* streamChatCompletion(
    request: ChatCompletionRequest
  ): AsyncGenerator<ChatCompletionChunk, void, unknown> {
    const requestId = this.generateRequestId();
    const openaiRequest = { ...this.transformRequest(request), stream: true };

    const response = await this.executeWithTimeout(
      this.makeOpenAIStreamRequest('/chat/completions', openaiRequest),
      'stream_chat_completion'
    );

    let totalUsage: Usage = {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      estimated_cost: 0
    };

    try {
      for await (const chunk of response) {
        const transformedChunk = this.transformStreamChunk(chunk, request);
        if (transformedChunk) {
          if (transformedChunk.usage) {
            totalUsage = transformedChunk.usage;
          }
          yield transformedChunk;
        }
      }
    } catch (error) {
      throw ErrorFactory.fromProviderError(error, 'openai', requestId);
    }
  }

  /**
   * Image generation implementation
   */
  async generateImages(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const requestId = this.generateRequestId();

    return this.executeWithRetry(async () => {
      const openaiRequest = this.transformImageRequest(request);
      
      const response = await this.executeWithTimeout(
        this.makeOpenAIRequest('/images/generations', openaiRequest),
        'image_generation'
      );

      return this.transformImageResponse(response);
    }, { requestId, operation: 'image_generation' });
  }

  /**
   * Transform unified request to OpenAI format
   */
  private transformRequest(request: ChatCompletionRequest): any {
    const openaiRequest: any = {
      model: request.model || this.config.model,
      messages: request.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        ...(msg.name && { name: msg.name }),
        ...(msg.tool_calls && { tool_calls: msg.tool_calls }),
        ...(msg.tool_call_id && { tool_call_id: msg.tool_call_id })
      })),
      ...(request.temperature !== undefined && { temperature: request.temperature }),
      ...(request.max_tokens !== undefined && { max_tokens: request.max_tokens }),
      ...(request.top_p !== undefined && { top_p: request.top_p }),
      ...(request.frequency_penalty !== undefined && { frequency_penalty: request.frequency_penalty }),
      ...(request.presence_penalty !== undefined && { presence_penalty: request.presence_penalty }),
      ...(request.stop && { stop: request.stop }),
      ...(request.tools && { tools: request.tools }),
      ...(request.tool_choice && { tool_choice: request.tool_choice }),
      ...(request.user && { user: request.user })
    };

    return openaiRequest;
  }

  /**
   * Transform OpenAI response to unified format
   */
  protected transformResponse(
    response: any,
    request: ChatCompletionRequest,
    metrics: Partial<RequestMetrics>
  ): ChatCompletionResponse {
    return {
      id: response.id,
      object: 'chat.completion',
      created: response.created,
      model: response.model,
      provider: 'openai',
      choices: response.choices.map((choice: any) => ({
        index: choice.index,
        message: {
          role: choice.message.role,
          content: choice.message.content,
          ...(choice.message.tool_calls && { tool_calls: choice.message.tool_calls })
        },
        finish_reason: choice.finish_reason,
        ...(choice.logprobs && { logprobs: choice.logprobs })
      })),
      usage: {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
        estimated_cost: this.calculateCost(response.usage, request.model || this.config.model)
      },
      ...(response.system_fingerprint && { system_fingerprint: response.system_fingerprint })
    };
  }

  /**
   * Transform OpenAI streaming chunk to unified format
   */
  protected transformStreamChunk(
    chunk: any,
    request: ChatCompletionRequest
  ): ChatCompletionChunk | null {
    if (!chunk || chunk === '[DONE]') {
      return null;
    }

    // Parse SSE data
    let data;
    try {
      data = typeof chunk === 'string' ? JSON.parse(chunk) : chunk;
    } catch {
      return null;
    }

    return {
      id: data.id,
      object: 'chat.completion.chunk',
      created: data.created,
      model: data.model,
      provider: 'openai',
      choices: data.choices.map((choice: any) => ({
        index: choice.index,
        delta: {
          ...(choice.delta.role && { role: choice.delta.role }),
          ...(choice.delta.content && { content: choice.delta.content }),
          ...(choice.delta.tool_calls && { tool_calls: choice.delta.tool_calls })
        },
        finish_reason: choice.finish_reason
      })),
      ...(data.usage && {
        usage: {
          prompt_tokens: data.usage.prompt_tokens,
          completion_tokens: data.usage.completion_tokens,
          total_tokens: data.usage.total_tokens,
          estimated_cost: this.calculateCost(data.usage, request.model || this.config.model)
        }
      })
    };
  }

  /**
   * Transform unified image request to OpenAI format
   */
  private transformImageRequest(request: ImageGenerationRequest): any {
    return {
      prompt: request.prompt,
      model: request.model || 'dall-e-3',
      n: request.n || 1,
      size: request.size || '1024x1024',
      quality: request.quality || 'standard',
      style: request.style || 'vivid',
      response_format: request.response_format || 'url',
      ...(request.user && { user: request.user })
    };
  }

  /**
   * Transform OpenAI image response to unified format
   */
  private transformImageResponse(response: any): ImageGenerationResponse {
    return {
      created: response.created,
      data: response.data.map((item: any) => ({
        url: item.url,
        b64_json: item.b64_json,
        revised_prompt: item.revised_prompt
      })),
      provider: 'openai',
      usage: {
        estimated_cost: this.calculateImageCost(response.data.length)
      }
    };
  }

  /**
   * Make HTTP request to OpenAI API
   */
  private async makeOpenAIRequest(endpoint: string, data: any): Promise<any> {
    const url = `${this.config.baseURL || 'https://api.openai.com/v1'}${endpoint}`;
    const headers = this.getDefaultHeaders();

    // Add OpenAI-specific headers
    if (this.openaiConfig.organization) {
      headers['OpenAI-Organization'] = this.openaiConfig.organization;
    }
    if (this.openaiConfig.project) {
      headers['OpenAI-Project'] = this.openaiConfig.project;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw ErrorFactory.fromProviderError({ ...error, status: response.status }, 'openai');
      }

      return await response.json();
    } catch (error) {
      throw ErrorFactory.fromProviderError(error, 'openai');
    }
  }

  /**
   * Make streaming HTTP request to OpenAI API
   */
  private async makeOpenAIStreamRequest(endpoint: string, data: any): Promise<AsyncGenerator<any>> {
    const url = `${this.config.baseURL || 'https://api.openai.com/v1'}${endpoint}`;
    const headers = { ...this.getDefaultHeaders(), 'Accept': 'text/event-stream' };

    // Add OpenAI-specific headers
    if (this.openaiConfig.organization) {
      headers['OpenAI-Organization'] = this.openaiConfig.organization;
    }
    if (this.openaiConfig.project) {
      headers['OpenAI-Project'] = this.openaiConfig.project;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw ErrorFactory.fromProviderError({ ...error, status: response.status }, 'openai');
    }

    return this.parseSSEStream(response);
  }

  /**
   * Parse Server-Sent Events stream
   */
  private async* parseSSEStream(response: Response): AsyncGenerator<any> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

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
            if (data === '[DONE]') return;
            
            try {
              yield JSON.parse(data);
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Validate OpenAI API key format
   */
  protected validateApiKey(apiKey: string): boolean {
    return /^sk-[a-zA-Z0-9]{48}$/.test(apiKey);
  }

  /**
   * Get OpenAI authorization header
   */
  protected getAuthHeader(apiKey: string): string {
    return `Bearer ${apiKey}`;
  }

  /**
   * Test connection to OpenAI API
   */
  protected async testConnection(): Promise<void> {
    await this.makeOpenAIRequest('/models', {}).catch(() => {
      // Simple connectivity test - models endpoint
    });
  }

  /**
   * Calculate usage and cost
   */
  private calculateUsage(response: any, request: ChatCompletionRequest): Usage {
    const usage = response.usage;
    const cost = this.calculateCost(usage, request.model || this.config.model);
    
    return {
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens,
      estimated_cost: cost
    };
  }

  /**
   * Calculate cost based on usage and model
   */
  private calculateCost(usage: any, model: string): number {
    const pricing = this.getModelPricing(model);
    const inputCost = (usage.prompt_tokens / 1000) * pricing.input;
    const outputCost = (usage.completion_tokens / 1000) * pricing.output;
    return inputCost + outputCost;
  }

  /**
   * Get model-specific pricing
   */
  private getModelPricing(model: string): { input: number; output: number } {
    const pricingMap: Record<string, { input: number; output: number }> = {
      'gpt-4o': { input: 0.005, output: 0.015 },
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
      'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 }
    };

    return pricingMap[model] || { input: 0.01, output: 0.03 }; // Default pricing
  }

  /**
   * Calculate image generation cost
   */
  private calculateImageCost(imageCount: number): number {
    return imageCount * 0.04; // $0.04 per image for DALL-E 3
  }

  /**
   * Estimate token count for cost calculation
   */
  private estimateTokenCount(request: ChatCompletionRequest): { input: number; output: number } {
    // Rough estimation - 4 characters per token
    const messageText = request.messages
      .map(m => typeof m.content === 'string' ? m.content : JSON.stringify(m.content))
      .join(' ');
    
    const inputTokens = Math.ceil(messageText.length / 4);
    const outputTokens = request.max_tokens || 1000;

    return { input: inputTokens, output: outputTokens };
  }

  /**
   * Log request metrics for analytics
   */
  private logRequestMetrics(metrics: RequestMetrics): void {
    if (this.config.debug) {
      console.log('OpenAI Request Metrics:', {
        requestId: metrics.requestId,
        provider: metrics.provider,
        model: metrics.model,
        duration: metrics.endTime - metrics.startTime,
        tokens: metrics.tokens,
        cost: metrics.cost,
        success: metrics.success
      });
    }
  }
}

/**
 * OpenAI Provider Factory
 */
export class OpenAIProviderFactory implements ProviderFactory {
  create(config: ProviderConfig): OpenAIProvider {
    return new OpenAIProvider(config as ProviderConfig & OpenAIConfig);
  }

  supports(provider: ApiProvider): boolean {
    return provider === 'openai';
  }
}

/**
 * Convenience function to create OpenAI provider
 */
export function openai(options: OpenAIConfig = {}): ProviderConfig & OpenAIConfig {
  return {
    provider: 'openai',
    model: options.model || 'gpt-4o',
    ...options
  };
}