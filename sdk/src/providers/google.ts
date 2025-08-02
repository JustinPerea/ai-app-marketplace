/**
 * Google AI Provider Implementation
 * 
 * Implements Google Gemini API integration with support for:
 * - Gemini Pro and Flash models
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

interface GoogleMessage {
  role: 'user' | 'model';
  parts: Array<{
    text: string;
  }>;
}

interface GoogleRequest {
  contents: GoogleMessage[];
  systemInstruction?: {
    parts: Array<{
      text: string;
    }>;
  };
  generationConfig?: {
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
  tools?: Array<{
    functionDeclarations: Array<{
      name: string;
      description: string;
      parameters: Record<string, any>;
    }>;
  }>;
}

interface GoogleResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        functionCall?: {
          name: string;
          args: Record<string, any>;
        };
      }>;
      role: 'model';
    };
    finishReason: 'FINISH_REASON_UNSPECIFIED' | 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER';
    index: number;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

interface GoogleStreamChunk {
  candidates?: Array<{
    content: {
      parts: Array<{
        text?: string;
      }>;
      role: 'model';
    };
    finishReason?: 'FINISH_REASON_UNSPECIFIED' | 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER';
    index: number;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GoogleProvider extends BaseAIProvider {
  readonly provider = APIProvider.GOOGLE;
  protected readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  protected readonly defaultHeaders = {
    'Content-Type': 'application/json',
    'User-Agent': 'AI-Marketplace-SDK/1.0',
  };

  private models: AIModel[] = [
    {
      id: 'gemini-1.5-flash',
      provider: APIProvider.GOOGLE,
      name: 'gemini-1.5-flash',
      displayName: 'Gemini 1.5 Flash',
      description: 'Fast and cost-effective model for most tasks',
      maxTokens: 8192,
      inputCostPer1K: 0.00035,
      outputCostPer1K: 0.00105,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 1000000,
      isActive: true,
    },
    {
      id: 'gemini-1.5-pro',
      provider: APIProvider.GOOGLE,
      name: 'gemini-1.5-pro',
      displayName: 'Gemini 1.5 Pro',
      description: 'Most capable model for complex reasoning tasks',
      maxTokens: 8192,
      inputCostPer1K: 0.00125,
      outputCostPer1K: 0.00375,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 2000000,
      isActive: true,
    },
    {
      id: 'gemini-pro',
      provider: APIProvider.GOOGLE,
      name: 'gemini-pro',
      displayName: 'Gemini Pro',
      description: 'Balanced model for a wide range of tasks',
      maxTokens: 8192,
      inputCostPer1K: 0.0005,
      outputCostPer1K: 0.0015,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 32768,
      isActive: true,
    },
  ];

  protected getAuthHeaders(apiKey: string): Record<string, string> {
    return {};
  }

  async getModels(): Promise<AIModel[]> {
    return this.models.filter(model => model.isActive);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models?key=${apiKey}`, {
        method: 'GET',
        headers: this.defaultHeaders,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async chat(request: AIRequest, apiKey: string): Promise<AIResponse> {
    const googleRequest = this.transformRequest(request);
    
    const response = await fetch(
      `${this.baseUrl}/models/${request.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(googleRequest),
      }
    );

    if (!response.ok) {
      throw await this.handleHttpError(response);
    }

    const data = await response.json() as GoogleResponse;
    return this.transformResponse(data, request);
  }

  async *chatStream(request: AIRequest, apiKey: string): AsyncIterable<AIStreamChunk> {
    const googleRequest = this.transformRequest(request);
    
    const response = await fetch(
      `${this.baseUrl}/models/${request.model}:streamGenerateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(googleRequest),
      }
    );

    if (!response.ok) {
      throw await this.handleHttpError(response);
    }

    if (!response.body) {
      throw new AIError({
        code: 'NO_RESPONSE_BODY',
        message: 'No response body received for streaming request',
        type: 'api_error',
        provider: this.provider,
        retryable: false,
      });
    }

    const reader = response.body.getReader();
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
          if (trimmed === '' || !trimmed.startsWith('[') && !trimmed.startsWith('{')) continue;
          
          try {
            // Google returns JSON lines, some might be arrays
            const data = JSON.parse(trimmed);
            const chunks = Array.isArray(data) ? data : [data];
            
            for (const chunkData of chunks) {
              const chunk = this.transformStreamChunk(chunkData, request);
              if (chunk) yield chunk;
            }
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

  private transformRequest(request: AIRequest): GoogleRequest {
    // Extract system message
    const systemMessage = request.messages.find(msg => msg.role === 'system');
    const nonSystemMessages = request.messages.filter(msg => msg.role !== 'system');

    const googleRequest: GoogleRequest = {
      contents: nonSystemMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    };

    if (systemMessage) {
      googleRequest.systemInstruction = {
        parts: [{ text: systemMessage.content }],
      };
    }

    if (request.temperature !== undefined || request.topP !== undefined || request.maxTokens !== undefined) {
      googleRequest.generationConfig = {};
      if (request.temperature !== undefined) {
        googleRequest.generationConfig.temperature = request.temperature;
      }
      if (request.topP !== undefined) {
        googleRequest.generationConfig.topP = request.topP;
      }
      if (request.maxTokens !== undefined) {
        googleRequest.generationConfig.maxOutputTokens = request.maxTokens;
      }
    }

    if (request.tools) {
      googleRequest.tools = [{
        functionDeclarations: request.tools.map(tool => ({
          name: tool.function.name,
          description: tool.function.description,
          parameters: tool.function.parameters,
        })),
      }];
    }

    return googleRequest;
  }

  private transformResponse(response: GoogleResponse, originalRequest: AIRequest): AIResponse {
    const model = this.models.find(m => m.name === originalRequest.model || m.id === originalRequest.model);
    const usage = this.calculateUsage(response.usageMetadata, model);

    const choices = response.candidates.map((candidate, index) => {
      const textParts = candidate.content.parts.filter(part => part.text);
      const content = textParts.map(part => part.text).join('');

      const functionCalls = candidate.content.parts.filter(part => part.functionCall);
      const toolCalls = functionCalls.map(part => ({
        id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'function' as const,
        function: {
          name: part.functionCall!.name,
          arguments: JSON.stringify(part.functionCall!.args),
        },
      }));

      return {
        index,
        message: {
          role: 'assistant' as const,
          content,
          metadata: originalRequest.metadata,
        },
        finishReason: this.mapFinishReason(candidate.finishReason),
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      };
    });

    return {
      id: this.generateRequestId(),
      model: originalRequest.model,
      provider: this.provider,
      choices,
      usage,
      created: Math.floor(Date.now() / 1000),
      metadata: originalRequest.metadata,
    };
  }

  private transformStreamChunk(chunk: GoogleStreamChunk, originalRequest: AIRequest): AIStreamChunk | null {
    if (!chunk.candidates || chunk.candidates.length === 0) return null;

    const candidate = chunk.candidates[0];
    const textParts = candidate.content.parts.filter(part => part.text);
    const content = textParts.map(part => part.text).join('');

    if (!content && !candidate.finishReason) return null;

    return {
      id: this.generateRequestId(),
      model: originalRequest.model,
      provider: this.provider,
      choices: [{
        index: 0,
        delta: {
          role: 'assistant' as const,
          content: content || undefined,
        },
        finishReason: candidate.finishReason ? this.mapFinishReason(candidate.finishReason) : undefined,
      }],
      usage: chunk.usageMetadata ? this.calculateUsage(chunk.usageMetadata, this.models.find(m => m.name === originalRequest.model)) : undefined,
      created: Math.floor(Date.now() / 1000),
    };
  }

  private calculateUsage(
    usage: { promptTokenCount: number; candidatesTokenCount: number; totalTokenCount: number } | undefined,
    model?: AIModel
  ): AIUsage {
    if (!usage) {
      return {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
      };
    }

    const inputCost = model ? (usage.promptTokenCount / 1000) * model.inputCostPer1K : 0;
    const outputCost = model ? (usage.candidatesTokenCount / 1000) * model.outputCostPer1K : 0;

    return {
      promptTokens: usage.promptTokenCount,
      completionTokens: usage.candidatesTokenCount,
      totalTokens: usage.totalTokenCount,
      cost: inputCost + outputCost,
    };
  }

  private mapFinishReason(reason: string): 'stop' | 'length' | 'tool_calls' | 'content_filter' | null {
    switch (reason) {
      case 'STOP':
        return 'stop';
      case 'MAX_TOKENS':
        return 'length';
      case 'SAFETY':
      case 'RECITATION':
        return 'content_filter';
      default:
        return null;
    }
  }
}