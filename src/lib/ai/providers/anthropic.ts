/**
 * Anthropic Provider Implementation
 * 
 * Implements Anthropic Claude API integration with support for:
 * - Claude 3 models (Haiku, Sonnet, Opus)
 * - Streaming responses
 * - Tool calling
 * - Vision capabilities
 */

import { ApiProvider } from '@prisma/client';
import { BaseAIProvider, AIError } from './base';
import {
  AIRequest,
  AIResponse,
  AIStreamChunk,
  AIModel,
  AIMessage,
  AIUsage,
  AIChoice,
  AIStreamChoice,
} from '../types';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image';
    text?: string;
    source?: {
      type: 'base64';
      media_type: string;
      data: string;
    };
  }>;
}

interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  system?: string;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  tools?: Array<{
    name: string;
    description: string;
    input_schema: Record<string, any>;
  }>;
  tool_choice?: { type: 'auto' | 'any' | 'tool'; name?: string };
}

interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text' | 'tool_use';
    text?: string;
    id?: string;
    name?: string;
    input?: Record<string, any>;
  }>;
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' | null;
  stop_sequence?: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface AnthropicStreamChunk {
  type: 'message_start' | 'message_delta' | 'content_block_start' | 'content_block_delta' | 'content_block_stop' | 'message_stop';
  message?: {
    id: string;
    type: 'message';
    role: 'assistant';
    content: any[];
    model: string;
    stop_reason: null;
    stop_sequence: null;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  };
  index?: number;
  content_block?: {
    type: 'text' | 'tool_use';
    text?: string;
    id?: string;
    name?: string;
    input?: Record<string, any>;
  };
  delta?: {
    type: 'text_delta' | 'input_json_delta';
    text?: string;
    partial_json?: string;
    stop_reason?: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use';
    stop_sequence?: string;
  };
  usage?: {
    output_tokens: number;
  };
}

export class AnthropicProvider extends BaseAIProvider {
  readonly provider = ApiProvider.ANTHROPIC;
  protected readonly baseUrl = 'https://api.anthropic.com';
  protected readonly defaultHeaders = {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
    'User-Agent': 'AI-Marketplace/1.0',
  };

  private models: AIModel[] = [
    {
      id: 'claude-3-haiku-20240307',
      provider: ApiProvider.ANTHROPIC,
      name: 'claude-3-haiku-20240307',
      displayName: 'Claude 3 Haiku',
      description: 'Fastest and most cost-effective Claude 3 model',
      maxTokens: 4096,
      inputCostPer1K: 0.00025,
      outputCostPer1K: 0.00125,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 200000,
      isActive: true,
    },
    {
      id: 'claude-3-sonnet-20240229',
      provider: ApiProvider.ANTHROPIC,
      name: 'claude-3-sonnet-20240229',
      displayName: 'Claude 3 Sonnet',
      description: 'Balanced performance and cost for most tasks',
      maxTokens: 4096,
      inputCostPer1K: 0.003,
      outputCostPer1K: 0.015,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 200000,
      isActive: true,
    },
    {
      id: 'claude-3-opus-20240229',
      provider: ApiProvider.ANTHROPIC,
      name: 'claude-3-opus-20240229',
      displayName: 'Claude 3 Opus',
      description: 'Most capable Claude 3 model for complex reasoning',
      maxTokens: 4096,
      inputCostPer1K: 0.015,
      outputCostPer1K: 0.075,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 200000,
      isActive: true,
    },
    {
      id: 'claude-3-5-sonnet-20241022',
      provider: ApiProvider.ANTHROPIC,
      name: 'claude-3-5-sonnet-20241022',
      displayName: 'Claude 3.5 Sonnet',
      description: 'Latest Claude model with enhanced capabilities',
      maxTokens: 8192,
      inputCostPer1K: 0.003,
      outputCostPer1K: 0.015,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 200000,
      isActive: true,
    },
  ];

  protected getAuthHeaders(apiKey: string): Record<string, string> {
    return {
      'x-api-key': apiKey,
    };
  }

  async chat(request: AIRequest, apiKey: string): Promise<AIResponse> {
    const anthropicRequest = this.transformRequest(request);
    
    const response = await this.makeRequest<AnthropicResponse>(
      `${this.baseUrl}/v1/messages`,
      {
        method: 'POST',
        body: JSON.stringify(anthropicRequest),
      },
      apiKey
    );

    return this.transformResponse(response, request);
  }

  async *chatStream(request: AIRequest, apiKey: string): AsyncIterable<AIStreamChunk> {
    const anthropicRequest = this.transformRequest(request);
    anthropicRequest.stream = true;

    const stream = await this.makeStreamRequest(
      `${this.baseUrl}/v1/messages`,
      {
        method: 'POST',
        body: JSON.stringify(anthropicRequest),
      },
      apiKey
    );

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

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
              const parsed = JSON.parse(data) as AnthropicStreamChunk;
              const transformedChunk = this.transformStreamChunk(parsed, request);
              if (transformedChunk) {
                yield transformedChunk;
              }
            } catch (error) {
              console.warn('Failed to parse Anthropic stream chunk:', error);
              // Continue processing other chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async getModels(): Promise<AIModel[]> {
    return this.models.filter(model => model.isActive);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // Test with a minimal request
      await this.makeRequest(
        `${this.baseUrl}/v1/messages`,
        {
          method: 'POST',
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'Hi' }],
          }),
        },
        apiKey
      );
      return true;
    } catch (error) {
      if (error instanceof AIError && error.type === 'authentication') {
        return false;
      }
      // Other errors might indicate the API key is valid but there's another issue
      throw error;
    }
  }

  private transformRequest(request: AIRequest): AnthropicRequest {
    // Separate system message from other messages
    const systemMessage = request.messages.find(m => m.role === 'system');
    const nonSystemMessages = request.messages.filter(m => m.role !== 'system');

    const anthropicRequest: AnthropicRequest = {
      model: request.model,
      max_tokens: request.maxTokens || 4096,
      messages: this.transformMessages(nonSystemMessages),
      system: systemMessage?.content,
      temperature: request.temperature,
      top_p: request.topP,
      stream: request.stream,
    };

    // Transform tools if provided
    if (request.tools && request.tools.length > 0) {
      anthropicRequest.tools = request.tools.map(tool => ({
        name: tool.function.name,
        description: tool.function.description,
        input_schema: tool.function.parameters,
      }));

      // Transform tool choice
      if (request.toolChoice) {
        if (typeof request.toolChoice === 'string') {
          anthropicRequest.tool_choice = { type: request.toolChoice as 'auto' };
        } else {
          anthropicRequest.tool_choice = {
            type: 'tool',
            name: request.toolChoice.name,
          };
        }
      }
    }

    return anthropicRequest;
  }

  private transformMessages(messages: AIMessage[]): AnthropicMessage[] {
    const anthropicMessages: AnthropicMessage[] = [];
    
    for (const message of messages) {
      if (message.role === 'system') {
        continue; // System messages are handled separately
      }

      // Ensure alternating user/assistant pattern
      const role = message.role === 'user' ? 'user' : 'assistant';
      
      anthropicMessages.push({
        role,
        content: message.content,
      });
    }

    // Ensure messages start with user message
    if (anthropicMessages.length > 0 && anthropicMessages[0].role !== 'user') {
      anthropicMessages.unshift({
        role: 'user',
        content: 'Please respond to the following conversation.',
      });
    }

    return anthropicMessages;
  }

  private transformResponse(response: AnthropicResponse, originalRequest: AIRequest): AIResponse {
    const model = this.models.find(m => m.name === response.model || m.id === response.model);
    const usage = this.calculateUsage(response.usage, model);

    // Extract text content from response
    const textContent = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    // Extract tool calls
    const toolCalls = response.content
      .filter(block => block.type === 'tool_use')
      .map(block => ({
        id: block.id || '',
        type: 'function' as const,
        function: {
          name: block.name || '',
          arguments: JSON.stringify(block.input || {}),
        },
      }));

    const choice: AIChoice = {
      index: 0,
      message: {
        role: 'assistant',
        content: textContent,
      },
      finishReason: this.mapStopReason(response.stop_reason),
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };

    return {
      id: response.id,
      model: response.model,
      provider: this.provider,
      choices: [choice],
      usage: usage,
      created: Math.floor(Date.now() / 1000),
      metadata: {
        originalRequest: originalRequest,
        anthropicResponse: response,
      },
    };
  }

  private transformStreamChunk(chunk: AnthropicStreamChunk, originalRequest: AIRequest): AIStreamChunk | null {
    switch (chunk.type) {
      case 'message_start':
        if (!chunk.message) return null;
        return {
          id: chunk.message.id,
          model: chunk.message.model,
          provider: this.provider,
          choices: [{
            index: 0,
            delta: { role: 'assistant' },
          }],
          created: Math.floor(Date.now() / 1000),
        };

      case 'content_block_delta':
        if (!chunk.delta) return null;
        return {
          id: this.generateRequestId(),
          model: originalRequest.model,
          provider: this.provider,
          choices: [{
            index: chunk.index || 0,
            delta: {
              content: chunk.delta.text,
            },
          }],
          created: Math.floor(Date.now() / 1000),
        };

      case 'message_delta':
        if (!chunk.delta) return null;
        return {
          id: this.generateRequestId(),
          model: originalRequest.model,
          provider: this.provider,
          choices: [{
            index: 0,
            delta: {},
            finishReason: this.mapStopReason(chunk.delta.stop_reason),
          }],
          usage: chunk.usage ? this.calculateStreamUsage(chunk.usage) : undefined,
          created: Math.floor(Date.now() / 1000),
        };

      case 'message_stop':
        return {
          id: this.generateRequestId(),
          model: originalRequest.model,
          provider: this.provider,
          choices: [{
            index: 0,
            delta: {},
            finishReason: 'stop',
          }],
          created: Math.floor(Date.now() / 1000),
        };

      default:
        return null;
    }
  }

  private mapStopReason(stopReason: string | null | undefined): AIChoice['finishReason'] {
    switch (stopReason) {
      case 'end_turn':
        return 'stop';
      case 'max_tokens':
        return 'length';
      case 'tool_use':
        return 'tool_calls';
      case 'stop_sequence':
        return 'stop';
      default:
        return null;
    }
  }

  private calculateUsage(usage: AnthropicResponse['usage'], model?: AIModel): AIUsage {
    const cost = model ? 
      (usage.input_tokens / 1000 * model.inputCostPer1K) + 
      (usage.output_tokens / 1000 * model.outputCostPer1K) : 0;

    return {
      promptTokens: usage.input_tokens,
      completionTokens: usage.output_tokens,
      totalTokens: usage.input_tokens + usage.output_tokens,
      cost: cost,
    };
  }

  private calculateStreamUsage(usage: { output_tokens: number }): AIUsage {
    return {
      promptTokens: 0,
      completionTokens: usage.output_tokens,
      totalTokens: usage.output_tokens,
      cost: 0, // Can't calculate without knowing input tokens
    };
  }

  // Anthropic-specific helper methods
  async getModelCapabilities(modelId: string): Promise<{
    maxTokens: number;
    contextWindow: number;
    supportsVision: boolean;
    supportsTools: boolean;
  } | null> {
    const model = this.models.find(m => m.id === modelId || m.name === modelId);
    if (!model) return null;

    return {
      maxTokens: model.maxTokens,
      contextWindow: model.contextWindow,
      supportsVision: true, // All Claude 3 models support vision
      supportsTools: model.supportsTools,
    };
  }

  async getModelPricing(modelId: string): Promise<{ inputCost: number; outputCost: number } | null> {
    const model = this.models.find(m => m.id === modelId || m.name === modelId);
    return model ? {
      inputCost: model.inputCostPer1K,
      outputCost: model.outputCostPer1K,
    } : null;
  }

  // Update model pricing (for dynamic pricing updates)
  updateModelPricing(modelId: string, inputCost: number, outputCost: number): void {
    const model = this.models.find(m => m.id === modelId || m.name === modelId);
    if (model) {
      model.inputCostPer1K = inputCost;
      model.outputCostPer1K = outputCost;
    }
  }

  // Get recommended model for specific use cases
  getRecommendedModel(useCase: 'chat' | 'analysis' | 'coding' | 'creative'): string {
    switch (useCase) {
      case 'chat':
        return 'claude-3-haiku-20240307'; // Fast and cost-effective
      case 'analysis':
        return 'claude-3-sonnet-20240229'; // Good balance
      case 'coding':
        return 'claude-3-5-sonnet-20241022'; // Latest capabilities
      case 'creative':
        return 'claude-3-opus-20240229'; // Most capable
      default:
        return 'claude-3-haiku-20240307';
    }
  }

  // Vision support for image analysis
  async analyzeImage(
    imageData: string,
    mimeType: string,
    prompt: string,
    apiKey: string,
    modelId?: string
  ): Promise<AIResponse> {
    const request: AIRequest = {
      model: modelId || 'claude-3-sonnet-20240229',
      messages: [
        {
          role: 'user',
          content: prompt,
          metadata: {
            images: [{
              type: 'base64',
              mediaType: mimeType,
              data: imageData
            }]
          }
        }
      ],
      maxTokens: 4096,
    };

    return this.chat(request, apiKey);
  }

  // Check rate limits specific to Anthropic
  getRateLimitInfo(): {
    requestsPerMinute: number;
    tokensPerMinute: number;
    tokensPerDay: number;
  } {
    return {
      requestsPerMinute: 50, // Anthropic's default limits
      tokensPerMinute: 40000,
      tokensPerDay: 1000000,
    };
  }
}