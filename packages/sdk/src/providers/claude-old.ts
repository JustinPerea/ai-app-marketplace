/**
 * Claude Provider Implementation
 * 
 * Provides Anthropic Claude API integration with unified interface
 */

import type {
  ApiProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  ProviderConfig,
  ProviderCapabilities,
  RequestMetrics,
  Usage,
  Message
} from '../types';

import { BaseProvider, type BaseProviderOptions, type ProviderFactory } from './base';
import { ErrorFactory } from '../utils/errors';

/**
 * Claude-specific configuration
 */
export interface ClaudeConfig extends BaseProviderOptions {
  anthropicVersion?: string;
}

/**
 * Claude Provider Implementation
 */
export class ClaudeProvider extends BaseProvider {
  private readonly claudeConfig: ClaudeConfig;

  constructor(config: ProviderConfig & ClaudeConfig) {
    super('claude', config);
    this.claudeConfig = config;
  }

  /**
   * Get Claude provider capabilities
   */
  getCapabilities(): ProviderCapabilities {
    return {
      chat: true,
      images: false,
      embeddings: false,
      tools: true,
      streaming: true,
      vision: true,
      maxTokens: 200000,
      costPer1kTokens: { input: 0.003, output: 0.015 }
    };
  }

  /**
   * Validate Claude model
   */
  validateModel(model: string): boolean {
    const validModels = this.getAvailableModels();
    return validModels.includes(model);
  }

  /**
   * Get available Claude models
   */
  getAvailableModels(): string[] {
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ];
  }

  /**
   * Estimate cost for Claude request
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
      const claudeRequest = this.transformRequest(request);
      
      const response = await this.executeWithTimeout(
        this.makeClaudeRequest('/messages', claudeRequest),
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
    const claudeRequest = { ...this.transformRequest(request), stream: true };

    const response = await this.executeWithTimeout(
      this.makeClaudeStreamRequest('/messages', claudeRequest),
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
      throw ErrorFactory.fromProviderError(error, 'claude', requestId);
    }
  }

  /**
   * Transform unified request to Claude format
   */
  private transformRequest(request: ChatCompletionRequest): any {
    // Extract system message if present
    const systemMessage = request.messages.find(m => m.role === 'system');
    const messages = request.messages.filter(m => m.role !== 'system');

    // Convert messages to Claude format
    const claudeMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: this.transformMessageContent(msg)
    }));

    const claudeRequest: any = {
      model: request.model || this.config.model,
      messages: claudeMessages,
      max_tokens: request.max_tokens || 1000,
      ...(systemMessage && { system: systemMessage.content }),
      ...(request.temperature !== undefined && { temperature: request.temperature }),
      ...(request.top_p !== undefined && { top_p: request.top_p }),
      ...(request.stop && { stop_sequences: Array.isArray(request.stop) ? request.stop : [request.stop] }),
      ...(request.tools && { tools: this.transformTools(request.tools) })
    };

    return claudeRequest;
  }

  /**
   * Transform message content for Claude format
   */
  private transformMessageContent(message: Message): any {
    if (typeof message.content === 'string') {
      return message.content;
    }

    // Handle multimodal content (text + images)
    return message.content.map(content => {
      if (content.type === 'text') {
        return {
          type: 'text',
          text: content.text
        };
      } else if (content.type === 'image_url') {
        return {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg', // Assume JPEG, could be improved
            data: content.image_url?.url.split(',')[1] || '' // Remove data:image/jpeg;base64, prefix
          }
        };
      }
      return content;
    });
  }

  /**
   * Transform tools for Claude format
   */
  private transformTools(tools: any[]): any[] {
    return tools.map(tool => ({
      name: tool.function.name,
      description: tool.function.description,
      input_schema: tool.function.parameters
    }));
  }

  /**
   * Transform Claude response to unified format
   */
  protected transformResponse(
    response: any,
    request: ChatCompletionRequest,
    metrics: Partial<RequestMetrics>
  ): ChatCompletionResponse {
    // Calculate usage from Claude response
    const usage: Usage = {
      prompt_tokens: response.usage?.input_tokens || 0,
      completion_tokens: response.usage?.output_tokens || 0,
      total_tokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
      estimated_cost: this.calculateCost(response.usage, request.model || this.config.model)
    };

    return {
      id: response.id,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: response.model,
      provider: 'claude',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: this.extractContentFromResponse(response),
          ...(response.tool_calls && { tool_calls: this.transformToolCallsFromClaude(response.tool_calls) })
        },
        finish_reason: this.mapStopReason(response.stop_reason)
      }],
      usage
    };
  }

  /**
   * Extract content from Claude response
   */
  private extractContentFromResponse(response: any): string {
    if (response.content && Array.isArray(response.content)) {
      return response.content
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text)
        .join('');
    }
    return response.content || '';
  }

  /**
   * Transform tool calls from Claude format
   */
  private transformToolCallsFromClaude(toolCalls: any[]): any[] {
    return toolCalls.map((call, index) => ({
      id: `call_${index}`,
      type: 'function',
      function: {
        name: call.name,
        arguments: JSON.stringify(call.input)
      }
    }));
  }

  /**
   * Map Claude stop reason to unified format
   */
  private mapStopReason(stopReason: string): string {
    const reasonMap: Record<string, string> = {
      'end_turn': 'stop',
      'max_tokens': 'length',
      'stop_sequence': 'stop',
      'tool_use': 'tool_calls'
    };
    return reasonMap[stopReason] || 'stop';
  }

  /**
   * Transform Claude streaming chunk to unified format
   */
  protected transformStreamChunk(
    chunk: any,
    request: ChatCompletionRequest
  ): ChatCompletionChunk | null {
    if (!chunk || !chunk.type) {
      return null;
    }

    // Handle different event types
    if (chunk.type === 'message_start') {
      return {
        id: chunk.message.id,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: chunk.message.model,
        provider: 'claude',
        choices: [{
          index: 0,
          delta: { role: 'assistant' },
          finish_reason: null
        }]
      };
    }

    if (chunk.type === 'content_block_delta') {
      return {
        id: chunk.message?.id || 'unknown',
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: request.model || this.config.model,
        provider: 'claude',
        choices: [{
          index: 0,
          delta: { content: chunk.delta.text },
          finish_reason: null
        }]
      };
    }

    if (chunk.type === 'message_delta') {
      const usage = chunk.usage ? {
        prompt_tokens: chunk.usage.input_tokens || 0,
        completion_tokens: chunk.usage.output_tokens || 0,
        total_tokens: (chunk.usage.input_tokens || 0) + (chunk.usage.output_tokens || 0),
        estimated_cost: this.calculateCost(chunk.usage, request.model || this.config.model)
      } : undefined;

      return {
        id: chunk.message?.id || 'unknown',
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: request.model || this.config.model,
        provider: 'claude',
        choices: [{
          index: 0,
          delta: {},
          finish_reason: this.mapStopReason(chunk.delta.stop_reason || 'end_turn')
        }],
        ...(usage && { usage })
      };
    }

    return null;
  }

  /**
   * Make HTTP request to Claude API
   */
  private async makeClaudeRequest(endpoint: string, data: any): Promise<any> {
    const url = `${this.config.baseURL || 'https://api.anthropic.com/v1'}${endpoint}`;
    const headers = this.getDefaultHeaders();

    // Add Claude-specific headers
    headers['anthropic-version'] = this.claudeConfig.anthropicVersion || '2023-06-01';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw ErrorFactory.fromProviderError({ ...error, status: response.status }, 'claude');
      }

      return await response.json();
    } catch (error) {
      throw ErrorFactory.fromProviderError(error, 'claude');
    }
  }

  /**
   * Make streaming HTTP request to Claude API
   */
  private async makeClaudeStreamRequest(endpoint: string, data: any): Promise<AsyncGenerator<any>> {
    const url = `${this.config.baseURL || 'https://api.anthropic.com/v1'}${endpoint}`;
    const headers = { ...this.getDefaultHeaders(), 'Accept': 'text/event-stream' };

    // Add Claude-specific headers
    headers['anthropic-version'] = this.claudeConfig.anthropicVersion || '2023-06-01';

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw ErrorFactory.fromProviderError({ ...error, status: response.status }, 'claude');
    }

    return this.parseSSEStream(response);
  }

  /**
   * Parse Server-Sent Events stream for Claude
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
   * Validate Claude API key format
   */
  protected validateApiKey(apiKey: string): boolean {
    return /^sk-ant-api[a-zA-Z0-9\-]{95}$/.test(apiKey);
  }

  /**
   * Get Claude authorization header
   */
  protected getAuthHeader(apiKey: string): string {
    return `Bearer ${apiKey}`;
  }

  /**
   * Test connection to Claude API
   */
  protected async testConnection(): Promise<void> {
    // Simple test with minimal request
    const testRequest = {
      model: this.config.model,
      messages: [{ role: 'user' as const, content: 'Hi' }],
      max_tokens: 1
    };
    
    await this.makeClaudeRequest('/messages', testRequest).catch(() => {
      // Simple connectivity test
    });
  }

  /**
   * Calculate usage and cost
   */
  private calculateUsage(response: any, request: ChatCompletionRequest): Usage {
    const usage = response.usage || {};
    const cost = this.calculateCost(usage, request.model || this.config.model);
    
    return {
      prompt_tokens: usage.input_tokens || 0,
      completion_tokens: usage.output_tokens || 0,
      total_tokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
      estimated_cost: cost
    };
  }

  /**
   * Calculate cost based on usage and model
   */
  private calculateCost(usage: any, model: string): number {
    const pricing = this.getModelPricing(model);
    const inputCost = ((usage.input_tokens || 0) / 1000) * pricing.input;
    const outputCost = ((usage.output_tokens || 0) / 1000) * pricing.output;
    return inputCost + outputCost;
  }

  /**
   * Get model-specific pricing
   */
  private getModelPricing(model: string): { input: number; output: number } {
    const pricingMap: Record<string, { input: number; output: number }> = {
      'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
      'claude-3-5-haiku-20241022': { input: 0.00025, output: 0.00125 },
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
    };

    return pricingMap[model] || { input: 0.003, output: 0.015 }; // Default to Sonnet pricing
  }

  /**
   * Estimate token count for cost calculation
   */
  private estimateTokenCount(request: ChatCompletionRequest): { input: number; output: number } {
    // Rough estimation - Claude typically uses ~4 characters per token
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
      console.log('Claude Request Metrics:', {
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
 * Claude Provider Factory
 */
export class ClaudeProviderFactory implements ProviderFactory {
  create(config: ProviderConfig): ClaudeProvider {
    return new ClaudeProvider(config as ProviderConfig & ClaudeConfig);
  }

  supports(provider: ApiProvider): boolean {
    return provider === 'claude';
  }
}

/**
 * Convenience function to create Claude provider
 */
export function claude(options: ClaudeConfig = {}): ProviderConfig & ClaudeConfig {
  return {
    provider: 'claude',
    model: options.model || 'claude-3-5-sonnet-20241022',
    ...options
  };
}