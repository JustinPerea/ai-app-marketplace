/**
 * OpenAI Provider Implementation
 * 
 * Implements OpenAI API integration with support for:
 * - GPT-3.5 and GPT-4 models
 * - Streaming responses
 * - Function calling
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

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string | null;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, any>;
    };
  }>;
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
      tool_calls?: Array<{
        index?: number;
        id?: string;
        type?: 'function';
        function?: {
          name?: string;
          arguments?: string;
        };
      }>;
    };
    finish_reason?: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIProvider extends BaseAIProvider {
  readonly provider = APIProvider.OPENAI;
  protected readonly baseUrl = 'https://api.openai.com/v1';
  protected readonly defaultHeaders = {
    'Content-Type': 'application/json',
    'User-Agent': 'AI-Marketplace-SDK/1.0',
  };

  private models: AIModel[] = [
    {
      id: 'gpt-3.5-turbo',
      provider: APIProvider.OPENAI,
      name: 'gpt-3.5-turbo',
      displayName: 'GPT-3.5 Turbo',
      description: 'Fast, cost-effective model for most conversational tasks',
      maxTokens: 4096,
      inputCostPer1K: 0.0015,
      outputCostPer1K: 0.002,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 16385,
      isActive: true,
    },
    {
      id: 'gpt-4',
      provider: APIProvider.OPENAI,
      name: 'gpt-4',
      displayName: 'GPT-4',
      description: 'Most capable model for complex reasoning tasks',
      maxTokens: 8192,
      inputCostPer1K: 0.03,
      outputCostPer1K: 0.06,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 8192,
      isActive: true,
    },
    {
      id: 'gpt-4-turbo',
      provider: APIProvider.OPENAI,
      name: 'gpt-4-turbo-preview',
      displayName: 'GPT-4 Turbo',
      description: 'Latest GPT-4 model with improved speed and cost efficiency',
      maxTokens: 4096,
      inputCostPer1K: 0.01,
      outputCostPer1K: 0.03,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 128000,
      isActive: true,
    },
    {
      id: 'gpt-4o',
      provider: APIProvider.OPENAI,
      name: 'gpt-4o',
      displayName: 'GPT-4 Omni',
      description: 'Multimodal model with vision capabilities',
      maxTokens: 4096,
      inputCostPer1K: 0.005,
      outputCostPer1K: 0.015,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 128000,
      isActive: true,
    },
    {
      id: 'gpt-4o-mini',
      provider: APIProvider.OPENAI,
      name: 'gpt-4o-mini',
      displayName: 'GPT-4 Omni Mini',
      description: 'Efficient and cost-effective model for simple tasks',
      maxTokens: 16384,
      inputCostPer1K: 0.00015,
      outputCostPer1K: 0.0006,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 128000,
      isActive: true,
    },
  ];

  protected getAuthHeaders(apiKey: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${apiKey}`,
    };
  }

  async getModels(): Promise<AIModel[]> {
    return this.models.filter(model => model.isActive);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ data: any[] }>(
        `${this.baseUrl}/models`,
        { method: 'GET' },
        apiKey
      );
      return response.data && response.data.length > 0;
    } catch (error) {
      if (error instanceof AIError && error.type === 'authentication') {
        return false;
      }
      throw error;
    }
  }

  async chat(request: AIRequest, apiKey: string): Promise<AIResponse> {
    const openaiRequest = this.transformRequest(request);
    
    const response = await this.makeRequest<OpenAIResponse>(
      `${this.baseUrl}/chat/completions`,
      {
        method: 'POST',
        body: JSON.stringify(openaiRequest),
      },
      apiKey
    );

    return this.transformResponse(response, request);
  }

  async *chatStream(request: AIRequest, apiKey: string): AsyncIterable<AIStreamChunk> {
    const openaiRequest = this.transformRequest(request, true);
    
    const stream = await this.makeStreamRequest(
      `${this.baseUrl}/chat/completions`,
      {
        method: 'POST',
        body: JSON.stringify(openaiRequest),
      },
      apiKey
    );

    const reader = stream.getReader();
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
          const trimmed = line.trim();
          if (trimmed === '' || trimmed === 'data: [DONE]') continue;
          
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const chunk = this.transformStreamChunk(data, request);
              if (chunk) yield chunk;
            } catch (e) {
              // Skip malformed chunks
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private transformRequest(request: AIRequest, stream = false): OpenAIRequest {
    const openaiRequest: OpenAIRequest = {
      model: request.model,
      messages: request.messages.map(msg => ({
        role: msg.role === 'system' ? 'system' : msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
        name: msg.name,
      })),
      stream,
    };

    if (request.maxTokens !== undefined) {
      openaiRequest.max_tokens = request.maxTokens;
    }
    if (request.temperature !== undefined) {
      openaiRequest.temperature = request.temperature;
    }
    if (request.topP !== undefined) {
      openaiRequest.top_p = request.topP;
    }
    if (request.tools) {
      openaiRequest.tools = request.tools;
    }
    if (request.toolChoice) {
      if (typeof request.toolChoice === 'string') {
        openaiRequest.tool_choice = request.toolChoice;
      } else {
        openaiRequest.tool_choice = {
          type: 'function',
          function: { name: request.toolChoice.name },
        };
      }
    }

    return openaiRequest;
  }

  private transformResponse(response: OpenAIResponse, originalRequest: AIRequest): AIResponse {
    const model = this.models.find(m => m.name === response.model || m.id === response.model);
    const usage = this.calculateUsage(response.usage, model);

    return {
      id: response.id,
      model: response.model,
      provider: this.provider,
      choices: response.choices.map(choice => ({
        index: choice.index,
        message: {
          role: 'assistant' as const,
          content: choice.message.content || '',
          metadata: originalRequest.metadata,
        },
        finishReason: choice.finish_reason,
        toolCalls: choice.message.tool_calls?.map(tc => ({
          id: tc.id,
          type: tc.type,
          function: tc.function,
        })),
      })),
      usage,
      created: response.created,
      metadata: originalRequest.metadata,
    };
  }

  private transformStreamChunk(chunk: OpenAIStreamChunk, originalRequest: AIRequest): AIStreamChunk | null {
    if (!chunk.choices || chunk.choices.length === 0) return null;

    return {
      id: chunk.id,
      model: chunk.model,
      provider: this.provider,
      choices: chunk.choices.map(choice => ({
        index: choice.index,
        delta: {
          role: choice.delta.role,
          content: choice.delta.content,
          toolCalls: choice.delta.tool_calls?.map(tc => ({
            id: tc.id || '',
            type: 'function' as const,
            function: {
              name: tc.function?.name || '',
              arguments: tc.function?.arguments || '',
            },
          })),
        },
        finishReason: choice.finish_reason,
      })),
      usage: chunk.usage ? this.calculateUsage(chunk.usage, this.models.find(m => m.name === chunk.model)) : undefined,
      created: chunk.created,
    };
  }

  private calculateUsage(usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }, model?: AIModel): AIUsage {
    const inputCost = model ? (usage.prompt_tokens / 1000) * model.inputCostPer1K : 0;
    const outputCost = model ? (usage.completion_tokens / 1000) * model.outputCostPer1K : 0;

    return {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      cost: inputCost + outputCost,
    };
  }
}