/**
 * Google AI Provider Implementation
 * 
 * Implements Google Gemini API integration with support for:
 * - Gemini 1.5 models (Flash, Pro)
 * - Streaming responses
 * - Function calling
 * - Vision and multimodal capabilities
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

interface GooglePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
  functionCall?: {
    name: string;
    args: Record<string, any>;
  };
  functionResponse?: {
    name: string;
    response: Record<string, any>;
  };
}

interface GoogleMessage {
  role: 'user' | 'model';
  parts: GooglePart[];
}

interface GoogleRequest {
  contents: GoogleMessage[];
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
  tools?: Array<{
    functionDeclarations: Array<{
      name: string;
      description: string;
      parameters: Record<string, any>;
    }>;
  }>;
  toolConfig?: {
    functionCallingConfig: {
      mode: 'AUTO' | 'ANY' | 'NONE';
      allowedFunctionNames?: string[];
    };
  };
}

interface GoogleResponse {
  candidates: Array<{
    content: {
      parts: GooglePart[];
      role: 'model';
    };
    finishReason: 'FINISH_REASON_UNSPECIFIED' | 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER';
    index: number;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
    citationMetadata?: {
      citationSources: Array<{
        startIndex: number;
        endIndex: number;
        uri: string;
        license: string;
      }>;
    };
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

interface GoogleStreamChunk {
  candidates?: Array<{
    content?: {
      parts: GooglePart[];
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
  readonly provider = ApiProvider.GOOGLE;
  protected readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  protected readonly defaultHeaders = {
    'Content-Type': 'application/json',
    'User-Agent': 'AI-Marketplace/1.0',
  };

  private models: AIModel[] = [
    {
      id: 'gemini-1.5-flash',
      provider: ApiProvider.GOOGLE,
      name: 'gemini-1.5-flash',
      displayName: 'Gemini 1.5 Flash',
      description: 'Fast and efficient model for most tasks',
      maxTokens: 8192,
      inputCostPer1K: 0.000075,
      outputCostPer1K: 0.0003,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 1000000,
      isActive: true,
    },
    {
      id: 'gemini-1.5-flash-8b',
      provider: ApiProvider.GOOGLE,
      name: 'gemini-1.5-flash-8b',
      displayName: 'Gemini 1.5 Flash 8B',
      description: 'Ultra-fast and cost-effective model',
      maxTokens: 8192,
      inputCostPer1K: 0.0000375,
      outputCostPer1K: 0.00015,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 1000000,
      isActive: true,
    },
    {
      id: 'gemini-1.5-pro',
      provider: ApiProvider.GOOGLE,
      name: 'gemini-1.5-pro',
      displayName: 'Gemini 1.5 Pro',
      description: 'Most capable model for complex reasoning and analysis',
      maxTokens: 8192,
      inputCostPer1K: 0.00125,
      outputCostPer1K: 0.005,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 2000000,
      isActive: true,
    },
    {
      id: 'gemini-1.0-pro',
      provider: ApiProvider.GOOGLE,
      name: 'gemini-1.0-pro',
      displayName: 'Gemini 1.0 Pro',
      description: 'Legacy model for compatibility',
      maxTokens: 2048,
      inputCostPer1K: 0.0005,
      outputCostPer1K: 0.0015,
      supportsStreaming: true,
      supportsTools: true,
      contextWindow: 30720,
      isActive: true,
    },
  ];

  protected getAuthHeaders(apiKey: string): Record<string, string> {
    return {
      'x-goog-api-key': apiKey,
    };
  }

  async chat(request: AIRequest, apiKey: string): Promise<AIResponse> {
    const googleRequest = this.transformRequest(request);
    
    const response = await this.makeRequest<GoogleResponse>(
      `${this.baseUrl}/models/${request.model}:generateContent`,
      {
        method: 'POST',
        body: JSON.stringify(googleRequest),
      },
      apiKey
    );

    return this.transformResponse(response, request);
  }

  async *chatStream(request: AIRequest, apiKey: string): AsyncIterable<AIStreamChunk> {
    const googleRequest = this.transformRequest(request);

    const stream = await this.makeStreamRequest(
      `${this.baseUrl}/models/${request.model}:streamGenerateContent`,
      {
        method: 'POST',
        body: JSON.stringify(googleRequest),
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
          if (line.trim() === '') continue;
          
          try {
            // Google's streaming format is plain JSON, not SSE
            const parsed = JSON.parse(line) as GoogleStreamChunk;
            const transformedChunk = this.transformStreamChunk(parsed, request);
            if (transformedChunk) {
              yield transformedChunk;
            }
          } catch (error) {
            console.warn('Failed to parse Google stream chunk:', error);
            // Continue processing other chunks
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
        `${this.baseUrl}/models/gemini-1.5-flash:generateContent`,
        {
          method: 'POST',
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Hi' }] }],
            generationConfig: { maxOutputTokens: 1 },
          }),
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

  private transformRequest(request: AIRequest): GoogleRequest {
    const contents = this.transformMessages(request.messages);
    
    const googleRequest: GoogleRequest = {
      contents,
      generationConfig: {
        temperature: request.temperature,
        topP: request.topP,
        maxOutputTokens: request.maxTokens,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    };

    // Transform tools if provided
    if (request.tools && request.tools.length > 0) {
      googleRequest.tools = [{
        functionDeclarations: request.tools.map(tool => ({
          name: tool.function.name,
          description: tool.function.description,
          parameters: tool.function.parameters,
        })),
      }];

      // Transform tool choice
      if (request.toolChoice) {
        if (typeof request.toolChoice === 'string') {
          googleRequest.toolConfig = {
            functionCallingConfig: {
              mode: request.toolChoice === 'auto' ? 'AUTO' : 'NONE',
            },
          };
        } else {
          googleRequest.toolConfig = {
            functionCallingConfig: {
              mode: 'ANY',
              allowedFunctionNames: [request.toolChoice.name],
            },
          };
        }
      }
    }

    return googleRequest;
  }

  private transformMessages(messages: AIMessage[]): GoogleMessage[] {
    const googleMessages: GoogleMessage[] = [];
    let currentRole: 'user' | 'model' | null = null;
    let currentParts: GooglePart[] = [];

    const addMessage = () => {
      if (currentRole && currentParts.length > 0) {
        googleMessages.push({
          role: currentRole,
          parts: [...currentParts],
        });
        currentParts = [];
      }
    };

    for (const message of messages) {
      const role = message.role === 'assistant' ? 'model' : 'user';
      
      // Google requires alternating user/model messages
      if (currentRole && currentRole !== role) {
        addMessage();
      }

      currentRole = role;
      currentParts.push({ text: message.content });
    }

    addMessage();

    // Ensure messages start with user message
    if (googleMessages.length > 0 && googleMessages[0].role !== 'user') {
      googleMessages.unshift({
        role: 'user',
        parts: [{ text: 'Please respond to the following conversation.' }],
      });
    }

    return googleMessages;
  }

  private transformResponse(response: GoogleResponse, originalRequest: AIRequest): AIResponse {
    const model = this.models.find(m => m.name === originalRequest.model || m.id === originalRequest.model);
    const usage = this.calculateUsage(response.usageMetadata, model);

    if (!response.candidates || response.candidates.length === 0) {
      throw new AIError({
        code: 'NO_CANDIDATES',
        message: 'No candidates returned in response',
        type: 'api_error',
        provider: this.provider,
        retryable: false,
        details: { response },
      });
    }

    const choices: AIChoice[] = response.candidates.map((candidate, index) => {
      const textParts = candidate.content.parts.filter(part => part.text);
      const toolCalls = candidate.content.parts
        .filter(part => part.functionCall)
        .map(part => ({
          id: this.generateRequestId(),
          type: 'function' as const,
          function: {
            name: part.functionCall!.name,
            arguments: JSON.stringify(part.functionCall!.args),
          },
        }));

      return {
        index,
        message: {
          role: 'assistant',
          content: textParts.map(part => part.text).join(''),
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
      metadata: {
        originalRequest: originalRequest,
        googleResponse: response,
      },
    };
  }

  private transformStreamChunk(chunk: GoogleStreamChunk, originalRequest: AIRequest): AIStreamChunk | null {
    if (!chunk.candidates || chunk.candidates.length === 0) {
      return null;
    }

    const candidate = chunk.candidates[0];
    if (!candidate.content) {
      return null;
    }

    const textParts = candidate.content.parts.filter(part => part.text);
    const content = textParts.map(part => part.text).join('');

    const choice: AIStreamChoice = {
      index: candidate.index,
      delta: {
        role: 'assistant',
        content,
      },
      finishReason: candidate.finishReason ? this.mapFinishReason(candidate.finishReason) : undefined,
    };

    // Handle tool calls in stream
    const toolCalls = candidate.content.parts
      .filter(part => part.functionCall)
      .map(part => ({
        id: this.generateRequestId(),
        type: 'function' as const,
        function: {
          name: part.functionCall!.name,
          arguments: JSON.stringify(part.functionCall!.args),
        },
      }));

    if (toolCalls.length > 0) {
      choice.delta.toolCalls = toolCalls;
    }

    return {
      id: this.generateRequestId(),
      model: originalRequest.model,
      provider: this.provider,
      choices: [choice],
      usage: chunk.usageMetadata ? this.calculateUsage(chunk.usageMetadata) : undefined,
      created: Math.floor(Date.now() / 1000),
    };
  }

  private mapFinishReason(reason: string): AIChoice['finishReason'] {
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

  private calculateUsage(usage?: GoogleResponse['usageMetadata'], model?: AIModel): AIUsage {
    if (!usage) {
      return {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
      };
    }

    const cost = model ? 
      (usage.promptTokenCount / 1000 * model.inputCostPer1K) + 
      (usage.candidatesTokenCount / 1000 * model.outputCostPer1K) : 0;

    return {
      promptTokens: usage.promptTokenCount,
      completionTokens: usage.candidatesTokenCount,
      totalTokens: usage.totalTokenCount,
      cost,
    };
  }

  // Google-specific helper methods
  async listAvailableModels(apiKey: string): Promise<string[]> {
    try {
      const response = await this.makeRequest<{ models: Array<{ name: string; displayName: string }> }>(
        `${this.baseUrl}/models`,
        { method: 'GET' },
        apiKey
      );

      return response.models
        .filter(model => model.name.includes('gemini'))
        .map(model => model.name.replace('models/', ''));
    } catch (error) {
      console.error('Failed to list Google models:', error);
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

  // Get recommended model for specific use cases
  getRecommendedModel(useCase: 'chat' | 'analysis' | 'coding' | 'creative'): string {
    switch (useCase) {
      case 'chat':
        return 'gemini-1.5-flash-8b'; // Ultra-fast and cheap
      case 'analysis':
        return 'gemini-1.5-flash'; // Good balance
      case 'coding':
        return 'gemini-1.5-pro'; // Most capable
      case 'creative':
        return 'gemini-1.5-pro'; // Most capable
      default:
        return 'gemini-1.5-flash';
    }
  }

  // Vision support for multimodal capabilities
  async analyzeImage(
    imageData: string,
    mimeType: string,
    prompt: string,
    apiKey: string,
    modelId?: string
  ): Promise<AIResponse> {
    const request: AIRequest = {
      model: modelId || 'gemini-1.5-flash',
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

    // Transform to Google format with inline data
    const googleRequest: GoogleRequest = {
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageData,
            },
          },
        ],
      }],
      generationConfig: {
        maxOutputTokens: 4096,
      },
    };

    const response = await this.makeRequest<GoogleResponse>(
      `${this.baseUrl}/models/${request.model}:generateContent`,
      {
        method: 'POST',
        body: JSON.stringify(googleRequest),
      },
      apiKey
    );

    return this.transformResponse(response, request);
  }

  // Get safety settings
  getSafetySettings(): Array<{ category: string; threshold: string }> {
    return [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ];
  }

  // Update safety settings
  updateSafetySettings(settings: Array<{ category: string; threshold: string }>): void {
    // This would be used in transformRequest
    console.info('Safety settings updated:', settings);
  }

  // Check rate limits specific to Google AI
  getRateLimitInfo(): {
    requestsPerMinute: number;
    tokensPerMinute: number;
    requestsPerDay: number;
  } {
    return {
      requestsPerMinute: 60, // Google AI's default limits
      tokensPerMinute: 32000,
      requestsPerDay: 1500,
    };
  }

  // Get model context window info
  getContextWindowSize(modelId: string): number {
    const model = this.models.find(m => m.id === modelId || m.name === modelId);
    return model?.contextWindow || 30720;
  }
}