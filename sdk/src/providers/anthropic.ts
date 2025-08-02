/**
 * Anthropic Provider Implementation
 * 
 * Implements Anthropic Claude API integration with support for:
 * - Claude 3 model family
 * - Streaming responses
 * - Tool use
 * - Cost optimization
 */

import { BaseAIProvider } from './base';
import {
  AIRequest,
  AIResponse,
  AIStreamChunk,
  AIModel,
  AIMessage,
  AIUsage,
  AIChoice,
  AIStreamChoice,
  APIProvider,
  AIError,
} from '../types';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | Array<{
    type: 'text';
    text: string;
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
}

interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' | 'refusal' | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface AnthropicStreamChunk {
  type: 'ping' | 'message_start' | 'content_block_start' | 'content_block_delta' | 'content_block_stop' | 'message_delta' | 'message_stop';
  message?: {
    id: string;
    type: 'message';
    role: 'assistant';
    content: Array<any>;
    model: string;
    stop_reason: string | null;
    stop_sequence: string | null;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  };
  content_block?: {
    type: 'text';
    text: string;
  };
  delta?: {
    type: 'text_delta';
    text: string;
  };
  index?: number;
}

export class AnthropicProvider extends BaseAIProvider {
  readonly provider = APIProvider.ANTHROPIC;
  protected readonly baseUrl = 'https://api.anthropic.com/v1';
  protected readonly defaultHeaders = {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
    'User-Agent': 'AI-Marketplace-SDK/1.0',
  };

  private models: AIModel[] = [
    {
      id: 'claude-3-haiku-20240307',
      provider: APIProvider.ANTHROPIC,
      name: 'claude-3-haiku-20240307',
      displayName: 'Claude 3 Haiku',
      description: 'Fast and cost-effective model for light tasks',
      maxTokens: 4096,
      inputCostPer1K: 0.00025,
      outputCostPer1K: 0.00125,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 200000,
      isActive: true,
    },
    {
      id: 'claude-sonnet-4-20250514',
      provider: APIProvider.ANTHROPIC,
      name: 'claude-sonnet-4-20250514',
      displayName: 'Claude 4 Sonnet',
      description: 'Balanced model for a wide range of tasks - 2025 updated version',
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
      provider: APIProvider.ANTHROPIC,
      name: 'claude-3-opus-20240229',
      displayName: 'Claude 3 Opus',
      description: 'Most capable model for complex tasks',
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
      provider: APIProvider.ANTHROPIC,
      name: 'claude-3-5-sonnet-20241022',
      displayName: 'Claude 3.5 Sonnet',
      description: 'Latest and most capable Sonnet model',
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

  async getModels(): Promise<AIModel[]> {
    return this.models.filter(model => model.isActive);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // Anthropic doesn't have a simple endpoint to validate keys, so we make a minimal request
      const testRequest: AnthropicRequest = {
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }],
      };

      await this.makeRequest<AnthropicResponse>(
        `${this.baseUrl}/messages`,
        {
          method: 'POST',
          body: JSON.stringify(testRequest),
        },
        apiKey
      );
      return true;
    } catch (error) {
      if (error instanceof AIError && error.type === 'authentication') {
        return false;
      }
      throw error;
    }
  }

  async chat(request: AIRequest, apiKey: string): Promise<AIResponse> {
    const anthropicRequest = this.transformRequest(request);
    
    const response = await this.makeRequest<AnthropicResponse>(
      `${this.baseUrl}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(anthropicRequest),
      },
      apiKey
    );

    return this.transformResponse(response, request);
  }

  async *chatStream(request: AIRequest, apiKey: string): AsyncIterable<AIStreamChunk> {
    const anthropicRequest = this.transformRequest(request, true);
    
    const stream = await this.makeStreamRequest(
      `${this.baseUrl}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(anthropicRequest),
      },
      apiKey
    );

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let messageId = '';
    let model = request.model;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === '' || !trimmed.startsWith('data: ')) continue;
          
          try {
            const data = JSON.parse(trimmed.slice(6)) as AnthropicStreamChunk;
            
            if (data.type === 'message_start' && data.message) {
              messageId = data.message.id;
              model = data.message.model;
            }
            
            const chunk = this.transformStreamChunk(data, request, messageId, model);
            if (chunk) yield chunk;
          } catch (e) {
            // Skip malformed chunks
            continue;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private transformRequest(request: AIRequest, stream = false): AnthropicRequest {
    // Extract system message
    const systemMessage = request.messages.find(msg => msg.role === 'system');
    const nonSystemMessages = request.messages.filter(msg => msg.role !== 'system');

    const anthropicRequest: AnthropicRequest = {
      model: request.model,
      max_tokens: request.maxTokens || 4096,
      messages: nonSystemMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      stream,
    };

    if (systemMessage) {
      anthropicRequest.system = systemMessage.content;
    }
    if (request.temperature !== undefined) {
      anthropicRequest.temperature = request.temperature;
    }
    if (request.topP !== undefined) {
      anthropicRequest.top_p = request.topP;
    }
    if (request.tools) {
      anthropicRequest.tools = request.tools.map(tool => ({
        name: tool.function.name,
        description: tool.function.description,
        input_schema: tool.function.parameters,
      }));
    }

    return anthropicRequest;
  }

  private transformResponse(response: AnthropicResponse, originalRequest: AIRequest): AIResponse {
    const model = this.models.find(m => m.name === response.model || m.id === response.model);
    const usage = this.calculateUsage(response.usage, model);

    const content = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    return {
      id: response.id,
      model: response.model,
      provider: this.provider,
      choices: [{
        index: 0,
        message: {
          role: 'assistant' as const,
          content,
          metadata: originalRequest.metadata,
        },
        finishReason: this.mapStopReason(response.stop_reason),
      }],
      usage,
      created: Date.now(),
      metadata: originalRequest.metadata,
    };
  }

  private transformStreamChunk(
    chunk: AnthropicStreamChunk, 
    originalRequest: AIRequest, 
    messageId: string, 
    model: string
  ): AIStreamChunk | null {
    if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
      return {
        id: messageId,
        model,
        provider: this.provider,
        choices: [{
          index: 0,
          delta: {
            role: 'assistant' as const,
            content: chunk.delta.text,
          },
        }],
        created: Date.now(),
      };
    }

    if (chunk.type === 'message_stop') {
      return {
        id: messageId,
        model,
        provider: this.provider,
        choices: [{
          index: 0,
          delta: {},
          finishReason: 'stop',
        }],
        created: Date.now(),
      };
    }

    return null;
  }

  private calculateUsage(usage: { input_tokens: number; output_tokens: number }, model?: AIModel): AIUsage {
    const inputCost = model ? (usage.input_tokens / 1000) * model.inputCostPer1K : 0;
    const outputCost = model ? (usage.output_tokens / 1000) * model.outputCostPer1K : 0;

    return {
      promptTokens: usage.input_tokens,
      completionTokens: usage.output_tokens,
      totalTokens: usage.input_tokens + usage.output_tokens,
      cost: inputCost + outputCost,
    };
  }

  private mapStopReason(reason: string | null): 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'refusal' | null {
    switch (reason) {
      case 'end_turn':
        return 'stop';
      case 'max_tokens':
        return 'length';
      case 'tool_use':
        return 'tool_calls';
      case 'refusal':
        return 'refusal';
      default:
        return null;
    }
  }
}