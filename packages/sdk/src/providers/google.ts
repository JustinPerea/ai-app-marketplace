/**
 * Native Google Gemini Provider Implementation
 * 
 * Zero-dependency Google Gemini provider with full API compatibility
 * Supports both Gemini Pro and Flash models for cost optimization
 */

import { BaseProvider, BaseProviderOptions } from './base';
import { HTTPClient, createHTTPClient, HTTPError } from '../utils/http';
import { v, parse, ValidationError } from '../utils/validation';
import type {
  ApiProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  ProviderConfig,
  ProviderCapabilities,
  Usage,
  Message
} from '../types';

// Google Gemini-specific types
export interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }>;
}

export interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER';
    index: number;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

/**
 * Google Gemini model pricing (per 1K tokens)
 */
const GEMINI_PRICING = {
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  'gemini-pro': { input: 0.0005, output: 0.0015 },
  'gemini-pro-vision': { input: 0.00025, output: 0.0005 }
} as const;

/**
 * Request validation schemas
 */
const geminiPartSchema = v.object({
  text: v.string().optional(),
  inlineData: v.object({
    mimeType: v.string(),
    data: v.string()
  }).optional()
});

const geminiContentSchema = v.object({
  role: v.string().enum('user', 'model'),
  parts: v.array(geminiPartSchema)
});

const geminiRequestSchema = v.object({
  contents: v.array(geminiContentSchema),
  generationConfig: v.object({
    temperature: v.number().min(0).max(1).optional(),
    topP: v.number().min(0).max(1).optional(),
    topK: v.number().int().min(1).optional(),
    maxOutputTokens: v.number().int().min(1).optional(),
    stopSequences: v.array(v.string()).optional()
  }).optional(),
  safetySettings: v.array(v.object({
    category: v.string(),
    threshold: v.string()
  })).optional()
});

/**
 * Native Google Gemini Provider
 */
export class GoogleProvider extends BaseProvider {
  private client: HTTPClient;
  private apiKey: string;

  constructor(config: ProviderConfig) {
    super('google', config);
    
    if (!config.apiKey) {
      throw new Error('Google API key is required');
    }

    this.apiKey = config.apiKey;
    this.client = createHTTPClient({
      baseURL: config.baseURL || 'https://generativelanguage.googleapis.com/v1beta',
      timeout: config.timeout || 30000
    });
  }

  getCapabilities(): ProviderCapabilities {
    return {
      chatCompletion: true,
      streamingCompletion: true,
      functionCalling: false, // Not yet implemented in this version
      imageGeneration: false,
      imageAnalysis: true,
      jsonMode: false,
      systemMessages: false, // Gemini doesn't have system messages
      toolUse: false, // Not yet implemented
      multipleMessages: true,
      maxContextTokens: this.getContextLimit(),
      supportedModels: this.getAvailableModels()
    };
  }

  validateModel(model: string): boolean {
    return this.getAvailableModels().includes(model);
  }

  getAvailableModels(): string[] {
    return [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-pro',
      'gemini-pro-vision'
    ];
  }

  estimateCost(request: ChatCompletionRequest): number {
    const model = request.model as keyof typeof GEMINI_PRICING;
    const pricing = GEMINI_PRICING[model];
    
    if (!pricing) {
      return 0; // Unknown model
    }

    // Rough token estimation: ~4 characters per token
    const inputText = request.messages.map(m => 
      typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
    ).join(' ');
    const estimatedInputTokens = Math.ceil(inputText.length / 4);
    const estimatedOutputTokens = request.max_tokens || 1000;

    return (estimatedInputTokens * pricing.input / 1000) + 
           (estimatedOutputTokens * pricing.output / 1000);
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    try {
      // Validate and transform request
      const geminiRequest = this.transformRequest(request);
      
      // Make API call
      const url = `/models/${request.model}:generateContent?key=${this.apiKey}`;
      const response = await this.executeWithRetry(
        () => this.client.post<GeminiResponse>(url, geminiRequest),
        { requestId, operation: 'chat_completion' }
      );

      // Transform response to unified format
      return this.transformResponse(
        response.data,
        request,
        this.createRequestMetrics(requestId, request.model, startTime)
      );
    } catch (error) {
      throw this.handleError(error, requestId);
    }
  }

  async *streamChatCompletion(
    request: ChatCompletionRequest
  ): AsyncGenerator<ChatCompletionChunk, void, unknown> {
    const requestId = this.generateRequestId();
    
    try {
      // Validate and transform request
      const geminiRequest = this.transformRequest(request);
      
      // Start streaming request
      const url = `/models/${request.model}:streamGenerateContent?key=${this.apiKey}`;
      const stream = this.client.stream({
        url,
        method: 'POST',
        body: geminiRequest
      });

      for await (const chunk of stream) {
        // Parse streaming response
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              return;
            }
            
            try {
              const parsed = JSON.parse(data) as GeminiResponse;
              const transformedChunk = this.transformStreamChunk(parsed, request);
              
              if (transformedChunk) {
                yield transformedChunk;
              }
            } catch (parseError) {
              // Skip invalid JSON chunks
              continue;
            }
          }
        }
      }
    } catch (error) {
      throw this.handleError(error, requestId);
    }
  }

  protected transformResponse(
    response: GeminiResponse,
    request: ChatCompletionRequest,
    metrics: Partial<any>
  ): ChatCompletionResponse {
    const candidate = response.candidates[0];
    if (!candidate) {
      throw new Error('No response candidate from Gemini');
    }

    const usage: Usage = {
      prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
      completion_tokens: response.usageMetadata?.candidatesTokenCount || 0,
      total_tokens: response.usageMetadata?.totalTokenCount || 0,
      estimated_cost: this.calculateActualCost(response.usageMetadata, request.model)
    };

    const content = candidate.content.parts
      .map(part => part.text)
      .join('');

    return {
      id: `gemini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      provider: 'google',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content
        },
        finish_reason: this.mapFinishReason(candidate.finishReason)
      }],
      usage
    };
  }

  protected transformStreamChunk(
    response: GeminiResponse,
    request: ChatCompletionRequest
  ): ChatCompletionChunk | null {
    const candidate = response.candidates?.[0];
    if (!candidate) {
      return null;
    }

    const content = candidate.content?.parts?.[0]?.text || '';
    
    return {
      id: `gemini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      provider: 'google',
      choices: [{
        index: 0,
        delta: {
          content
        },
        finish_reason: candidate.finishReason ? this.mapFinishReason(candidate.finishReason) : null
      }],
      usage: response.usageMetadata ? {
        prompt_tokens: response.usageMetadata.promptTokenCount,
        completion_tokens: response.usageMetadata.candidatesTokenCount,
        total_tokens: response.usageMetadata.totalTokenCount,
        estimated_cost: this.calculateActualCost(response.usageMetadata, request.model)
      } : undefined
    };
  }

  protected validateApiKey(apiKey: string): boolean {
    return /^AIza[0-9A-Za-z\-_]{35}$/.test(apiKey);
  }

  protected getAuthHeader(apiKey: string): string {
    return apiKey; // Google uses query parameter authentication
  }

  protected async testConnection(): Promise<void> {
    try {
      const testRequest: GeminiRequest = {
        contents: [{
          role: 'user',
          parts: [{ text: 'Hi' }]
        }]
      };
      
      const url = `/models/${this.config.model || 'gemini-pro'}:generateContent?key=${this.apiKey}`;
      await this.client.post(url, testRequest);
    } catch (error) {
      if (error instanceof HTTPError && error.status === 401) {
        throw new Error('Invalid Google API key');
      }
      throw error;
    }
  }

  private transformRequest(request: ChatCompletionRequest): GeminiRequest {
    try {
      // Filter out system messages as Gemini doesn't support them
      const filteredMessages = request.messages.filter(m => m.role !== 'system');
      
      // Convert messages to Gemini format
      const contents: GeminiContent[] = filteredMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: this.transformMessageContent(msg)
      }));

      const geminiRequest: GeminiRequest = {
        contents,
        generationConfig: {
          ...(request.temperature !== undefined && { temperature: request.temperature }),
          ...(request.top_p !== undefined && { topP: request.top_p }),
          ...(request.max_tokens !== undefined && { maxOutputTokens: request.max_tokens }),
          ...(request.stop && { 
            stopSequences: Array.isArray(request.stop) ? request.stop : [request.stop] 
          })
        }
      };

      // Validate request
      return parse(geminiRequestSchema, geminiRequest);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(`Invalid request: ${error.message}`);
      }
      throw error;
    }
  }

  private transformMessageContent(message: Message): Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> {
    if (typeof message.content === 'string') {
      return [{ text: message.content }];
    }

    // Handle multimodal content (text + images)
    return message.content.map(content => {
      if (content.type === 'text') {
        return { text: content.text };
      } else if (content.type === 'image_url') {
        // Extract base64 data from data URL
        const dataUrl = content.image_url?.url || '';
        const [header, data] = dataUrl.split(',');
        const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
        
        return {
          inlineData: {
            mimeType,
            data: data || ''
          }
        };
      }
      
      // Fallback for other content types
      return { text: JSON.stringify(content) };
    });
  }

  private mapFinishReason(finishReason: string): 'stop' | 'length' | 'content_filter' | null {
    const reasonMap: Record<string, 'stop' | 'length' | 'content_filter'> = {
      'STOP': 'stop',
      'MAX_TOKENS': 'length',
      'SAFETY': 'content_filter',
      'RECITATION': 'content_filter',
      'OTHER': 'stop'
    };
    return reasonMap[finishReason] || 'stop';
  }

  private calculateActualCost(
    usageMetadata: { promptTokenCount: number; candidatesTokenCount: number } | undefined,
    model: string
  ): number {
    if (!usageMetadata) return 0;
    
    const modelKey = model as keyof typeof GEMINI_PRICING;
    const pricing = GEMINI_PRICING[modelKey];
    
    if (!pricing) {
      return 0;
    }

    return (usageMetadata.promptTokenCount * pricing.input / 1000) + 
           (usageMetadata.candidatesTokenCount * pricing.output / 1000);
  }

  private getContextLimit(): number {
    const model = this.config.model;
    
    switch (model) {
      case 'gemini-1.5-pro':
        return 1000000; // 1M tokens
      case 'gemini-1.5-flash':
        return 1000000; // 1M tokens
      case 'gemini-pro':
        return 30720;
      case 'gemini-pro-vision':
        return 12288;
      default:
        return 30720;
    }
  }

  private handleError(error: unknown, requestId: string): Error {
    if (error instanceof HTTPError) {
      switch (error.status) {
        case 400:
          return new Error(`Invalid request: ${error.data?.error?.message || error.statusText}`);
        case 401:
          return new Error('Invalid Google API key');
        case 429:
          return new Error('Google API rate limit exceeded');
        case 500:
        case 502:
        case 503:
          return new Error('Google API service temporarily unavailable');
        default:
          return new Error(`Google API error: ${error.message}`);
      }
    }
    
    if (error instanceof Error) {
      return error;
    }
    
    return new Error(`Unknown error in Google request ${requestId}`);
  }
}

/**
 * Create Google provider instance
 */
export function createGoogleProvider(config: Omit<ProviderConfig, 'provider'>): GoogleProvider {
  return new GoogleProvider({ ...config, provider: 'google' });
}

/**
 * Google provider factory
 */
export const googleFactory = {
  create: (config: ProviderConfig) => new GoogleProvider(config),
  supports: (provider: ApiProvider) => provider === 'google'
};

/**
 * Convenience function to create Gemini provider
 */
export function gemini(options: Omit<ProviderConfig, 'provider'> = {}): ProviderConfig {
  return {
    provider: 'google',
    model: options.model || 'gemini-1.5-flash', // Default to Flash for cost optimization
    ...options
  };
}