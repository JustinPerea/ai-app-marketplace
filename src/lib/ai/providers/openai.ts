/**
 * OpenAI Provider Implementation
 * 
 * Implements OpenAI API integration with support for:
 * - GPT-3.5 and GPT-4 models
 * - Streaming responses
 * - Function calling
 * - Cost optimization
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
  readonly provider = ApiProvider.OPENAI;
  protected readonly baseUrl = 'https://api.openai.com/v1';
  protected readonly defaultHeaders = {
    'Content-Type': 'application/json',
    'User-Agent': 'AI-Marketplace/1.0',
  };

  private models: AIModel[] = [
    {
      id: 'gpt-3.5-turbo',
      provider: ApiProvider.OPENAI,
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
      id: 'gpt-3.5-turbo-16k',
      provider: ApiProvider.OPENAI,
      name: 'gpt-3.5-turbo-16k',
      displayName: 'GPT-3.5 Turbo 16K',
      description: 'Extended context version of GPT-3.5 Turbo',
      maxTokens: 4096,
      inputCostPer1K: 0.003,
      outputCostPer1K: 0.004,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 16385,
      isActive: true,
    },
    {
      id: 'gpt-4',
      provider: ApiProvider.OPENAI,
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
      provider: ApiProvider.OPENAI,
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
      provider: ApiProvider.OPENAI,
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
  ];

  protected getAuthHeaders(apiKey: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${apiKey}`,
    };
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
    const openaiRequest = this.transformRequest(request);
    openaiRequest.stream = true;

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

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data) as OpenAIStreamChunk;
              yield this.transformStreamChunk(parsed, request);
            } catch (error) {
              console.warn('Failed to parse stream chunk:', error);
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
      await this.makeRequest(
        `${this.baseUrl}/models`,
        {
          method: 'GET',
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

  private transformRequest(request: AIRequest): OpenAIRequest {
    const openaiRequest: OpenAIRequest = {
      model: request.model,
      messages: request.messages.map(this.transformMessage),
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      top_p: request.topP,
      stream: request.stream,
    };

    // Transform tools if provided
    if (request.tools && request.tools.length > 0) {
      openaiRequest.tools = request.tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.function.name,
          description: tool.function.description,
          parameters: tool.function.parameters,
        },
      }));

      // Transform tool choice
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
    }

    return openaiRequest;
  }

  private transformMessage(message: AIMessage): OpenAIMessage {
    return {
      role: message.role,
      content: message.content,
      name: message.name,
    };
  }

  private transformResponse(response: OpenAIResponse, originalRequest: AIRequest): AIResponse {
    const model = this.models.find(m => m.name === response.model || m.id === response.model);
    const usage = this.calculateUsage(response.usage, model);

    return {
      id: response.id,
      model: response.model,
      provider: this.provider,
      choices: response.choices.map(choice => this.transformChoice(choice)),
      usage: usage,
      created: response.created,
      metadata: {
        originalRequest: originalRequest,
        openaiResponse: response,
      },
    };
  }

  private transformChoice(choice: OpenAIResponse['choices'][0]): AIChoice {
    const transformedChoice: AIChoice = {
      index: choice.index,
      message: {
        role: 'assistant',
        content: choice.message.content || '',
      },
      finishReason: choice.finish_reason,
    };

    // Transform tool calls if present
    if (choice.message.tool_calls) {
      transformedChoice.toolCalls = choice.message.tool_calls.map(toolCall => ({
        id: toolCall.id,
        type: 'function',
        function: {
          name: toolCall.function.name,
          arguments: toolCall.function.arguments,
        },
      }));
    }

    return transformedChoice;
  }

  private transformStreamChunk(chunk: OpenAIStreamChunk, originalRequest: AIRequest): AIStreamChunk {
    const model = this.models.find(m => m.name === chunk.model || m.id === chunk.model);
    
    return {
      id: chunk.id,
      model: chunk.model,
      provider: this.provider,
      choices: chunk.choices.map(choice => this.transformStreamChoice(choice)),
      usage: chunk.usage ? this.calculateUsage(chunk.usage, model) : undefined,
      created: chunk.created,
    };
  }

  private transformStreamChoice(choice: OpenAIStreamChunk['choices'][0]): AIStreamChoice {
    const transformedChoice: AIStreamChoice = {
      index: choice.index,
      delta: {
        role: choice.delta.role,
        content: choice.delta.content,
      },
      finishReason: choice.finish_reason,
    };

    // Transform tool calls in delta if present
    if (choice.delta.tool_calls) {
      transformedChoice.delta.toolCalls = choice.delta.tool_calls.map(toolCall => ({
        id: toolCall.id || '',
        type: 'function',
        function: {
          name: toolCall.function?.name || '',
          arguments: toolCall.function?.arguments || '',
        },
      }));
    }

    return transformedChoice;
  }

  private calculateUsage(usage: OpenAIResponse['usage'], model?: AIModel): AIUsage {
    const cost = model ? 
      (usage.prompt_tokens / 1000 * model.inputCostPer1K) + 
      (usage.completion_tokens / 1000 * model.outputCostPer1K) : 0;

    return {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      cost: cost,
    };
  }

  // OpenAI-specific helper methods
  async listAvailableModels(apiKey: string) {
    try {
      const response = await this.makeRequest<{ data: Array<{ id: string; object: string; created: number; owned_by: string }> }>(
        `${this.baseUrl}/models`,
        { method: 'GET' },
        apiKey
      );

      return response.data
        .filter(model => model.id.startsWith('gpt-'))
        .map(model => model.id);
    } catch (error) {
      console.error('Failed to list OpenAI models:', error);
      return [];
    }
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

  // Check if model supports specific features
  modelSupportsStreaming(modelId: string): boolean {
    const model = this.models.find(m => m.id === modelId || m.name === modelId);
    return model?.supportsStreaming || false;
  }

  modelSupportsTools(modelId: string): boolean {
    const model = this.models.find(m => m.id === modelId || m.name === modelId);
    return model?.supportsTools || false;
  }

  // Get recommended model for specific use cases
  getRecommendedModel(useCase: 'chat' | 'analysis' | 'coding' | 'creative'): string {
    switch (useCase) {
      case 'chat':
        return 'gpt-3.5-turbo'; // Fast and cost-effective
      case 'analysis':
        return 'gpt-4-turbo'; // Good balance of capability and cost
      case 'coding':
        return 'gpt-4'; // High reasoning capability
      case 'creative':
        return 'gpt-4o'; // Latest capabilities
      default:
        return 'gpt-3.5-turbo';
    }
  }
}