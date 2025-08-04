/**
 * Google AI Provider Implementation
 * 
 * Implements Google Gemini API integration with support for:
 * - Gemini 1.5 models (Flash, Pro)
 * - Gemini Veo video generation (Flash, Pro)
 * - Streaming responses
 * - Function calling
 * - Vision and multimodal capabilities
 * - Video generation with polling mechanism
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
  VideoGenerationRequest,
  VideoGenerationResponse,
  VideoGenerationStatus,
  VideoModel,
  VIDEO_GENERATION_DEFAULTS,
  GEMINI_VEO_CONFIG,
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

// Gemini Veo Video Generation Interfaces
interface GeminiVeoRequest {
  prompt: string;
  config?: {
    aspectRatio?: string;
    duration?: number;
    quality?: string;
    seed?: number;
  };
}

interface GeminiVeoResponse {
  videoId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  metadata?: {
    duration?: number;
    aspectRatio?: string;
    prompt: string;
    model: string;
    createdAt: string;
    completedAt?: string;
  };
}

export class GoogleProvider extends BaseAIProvider {
  readonly provider = ApiProvider.GOOGLE;
  protected readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  protected readonly veoBaseUrl = 'https://generativelanguage.googleapis.com/v1beta'; // Gemini Veo endpoint
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
      supportsVideo: false,
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
      supportsVideo: false,
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
      supportsVideo: false,
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
      supportsVideo: false,
      contextWindow: 30720,
      isActive: true,
    },
  ];

  private videoModels: VideoModel[] = [
    {
      id: 'gemini-veo-2-flash',
      provider: ApiProvider.GOOGLE,
      name: 'gemini-veo-2-flash',
      displayName: 'Gemini Veo 2 Flash',
      description: 'Fast video generation model for quick prototyping',
      maxDurationSeconds: GEMINI_VEO_CONFIG.MAX_DURATION,
      costPerSecond: GEMINI_VEO_CONFIG.COST_PER_SECOND['gemini-veo-2-flash'],
      supportedAspectRatios: [...GEMINI_VEO_CONFIG.SUPPORTED_ASPECT_RATIOS],
      supportedQualities: [...GEMINI_VEO_CONFIG.SUPPORTED_QUALITIES],
      averageProcessingTime: GEMINI_VEO_CONFIG.AVERAGE_PROCESSING_TIME,
      supportsStreaming: false,
      supportsTools: false,
      supportsVideo: true,
      contextWindow: 0,
      isActive: true,
    },
    {
      id: 'gemini-veo-2',
      provider: ApiProvider.GOOGLE,
      name: 'gemini-veo-2',
      displayName: 'Gemini Veo 2',
      description: 'High-quality video generation model for production use',
      maxDurationSeconds: GEMINI_VEO_CONFIG.MAX_DURATION,
      costPerSecond: GEMINI_VEO_CONFIG.COST_PER_SECOND['gemini-veo-2'],
      supportedAspectRatios: [...GEMINI_VEO_CONFIG.SUPPORTED_ASPECT_RATIOS],
      supportedQualities: [...GEMINI_VEO_CONFIG.SUPPORTED_QUALITIES],
      averageProcessingTime: GEMINI_VEO_CONFIG.AVERAGE_PROCESSING_TIME,
      supportsStreaming: false,
      supportsTools: false,
      supportsVideo: true,
      contextWindow: 0,
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

  // ========== GEMINI VEO VIDEO GENERATION METHODS ==========

  /**
   * Generate video using Gemini Veo models
   * Initiates video generation and returns a response with video ID for polling
   */
  async generateVideo(request: VideoGenerationRequest, apiKey: string): Promise<VideoGenerationResponse> {
    const model = request.model || 'gemini-veo-2-flash';
    const videoModel = this.videoModels.find(m => m.id === model || m.name === model);
    
    if (!videoModel) {
      throw new AIError({
        code: 'INVALID_MODEL',
        message: `Video model '${model}' not found`,
        type: 'invalid_request',
        provider: this.provider,
        retryable: false,
        details: { availableModels: this.videoModels.map(m => m.id) },
      });
    }

    // Validate request parameters
    this.validateVideoRequest(request, videoModel);

    const veoRequest: GeminiVeoRequest = {
      prompt: request.prompt,
      config: {
        aspectRatio: request.aspectRatio || VIDEO_GENERATION_DEFAULTS.ASPECT_RATIO,
        duration: Math.min(request.duration || VIDEO_GENERATION_DEFAULTS.DURATION, videoModel.maxDurationSeconds),
        quality: request.quality || VIDEO_GENERATION_DEFAULTS.QUALITY,
        seed: request.seed,
      },
    };

    try {
      const response = await this.makeRequest<GeminiVeoResponse>(
        `${this.veoBaseUrl}/models/${model}:generateVideo`,
        {
          method: 'POST',
          body: JSON.stringify(veoRequest),
        },
        apiKey
      );

      // Transform Google response to our interface
      return this.transformVeoResponse(response, request, model);
    } catch (error) {
      throw this.handleVeoError(error, 'video generation');
    }
  }

  /**
   * Get the status of a video generation operation
   * Used for polling until video generation is complete
   */
  async getVideoStatus(videoId: string, apiKey: string): Promise<VideoGenerationStatus> {
    try {
      const response = await this.makeRequest<GeminiVeoResponse>(
        `${this.veoBaseUrl}/videos/${videoId}`,
        { method: 'GET' },
        apiKey
      );

      return {
        id: videoId,
        status: response.status,
        progress: this.calculateProgress(response.status),
        estimatedTimeRemaining: this.estimateTimeRemaining(response.status),
        error: response.error,
      };
    } catch (error) {
      throw this.handleVeoError(error, 'status check');
    }
  }

  /**
   * Get available video generation models
   */
  async getVideoModels(): Promise<VideoModel[]> {
    return this.videoModels.filter(model => model.isActive);
  }

  /**
   * Estimate cost for video generation
   */
  async estimateVideoCost(request: VideoGenerationRequest): Promise<number> {
    const model = request.model || 'gemini-veo-2-flash';
    const videoModel = this.videoModels.find(m => m.id === model || m.name === model);
    
    if (!videoModel) {
      throw new AIError({
        code: 'INVALID_MODEL',
        message: `Video model '${model}' not found`,
        type: 'invalid_request',
        provider: this.provider,
        retryable: false,
      });
    }

    const duration = Math.min(
      request.duration || VIDEO_GENERATION_DEFAULTS.DURATION,
      videoModel.maxDurationSeconds
    );

    return duration * videoModel.costPerSecond;
  }

  // ========== PRIVATE VEO HELPER METHODS ==========

  private validateVideoRequest(request: VideoGenerationRequest, model: VideoModel): void {
    // Validate duration
    if (request.duration && request.duration > model.maxDurationSeconds) {
      throw new AIError({
        code: 'INVALID_DURATION',
        message: `Duration ${request.duration}s exceeds maximum of ${model.maxDurationSeconds}s for model ${model.id}`,
        type: 'invalid_request',
        provider: this.provider,
        retryable: false,
      });
    }

    // Validate aspect ratio
    if (request.aspectRatio && !model.supportedAspectRatios.includes(request.aspectRatio)) {
      throw new AIError({
        code: 'INVALID_ASPECT_RATIO',
        message: `Aspect ratio '${request.aspectRatio}' not supported. Supported ratios: ${model.supportedAspectRatios.join(', ')}`,
        type: 'invalid_request',
        provider: this.provider,
        retryable: false,
      });
    }

    // Validate quality
    if (request.quality && !model.supportedQualities.includes(request.quality)) {
      throw new AIError({
        code: 'INVALID_QUALITY',
        message: `Quality '${request.quality}' not supported. Supported qualities: ${model.supportedQualities.join(', ')}`,
        type: 'invalid_request',
        provider: this.provider,
        retryable: false,
      });
    }

    // Validate prompt length (reasonable limit)
    if (request.prompt.length > 2000) {
      throw new AIError({
        code: 'PROMPT_TOO_LONG',
        message: 'Video generation prompt must be 2000 characters or less',
        type: 'invalid_request',
        provider: this.provider,
        retryable: false,
      });
    }
  }

  private transformVeoResponse(response: GeminiVeoResponse, originalRequest: VideoGenerationRequest, model: string): VideoGenerationResponse {
    const cost = this.calculateVideoCost(originalRequest, model);

    return {
      id: response.videoId,
      status: response.status,
      videoUrl: response.videoUrl,
      thumbnailUrl: response.thumbnailUrl,
      duration: response.metadata?.duration,
      aspectRatio: response.metadata?.aspectRatio,
      model,
      prompt: originalRequest.prompt,
      createdAt: new Date(response.metadata?.createdAt || Date.now()),
      completedAt: response.metadata?.completedAt ? new Date(response.metadata.completedAt) : undefined,
      error: response.error,
      cost,
      metadata: {
        originalRequest,
        geminiResponse: response,
      },
    };
  }

  private calculateVideoCost(request: VideoGenerationRequest, model: string): number {
    const videoModel = this.videoModels.find(m => m.id === model || m.name === model);
    if (!videoModel) return 0;

    const duration = Math.min(
      request.duration || VIDEO_GENERATION_DEFAULTS.DURATION,
      videoModel.maxDurationSeconds
    );

    return duration * videoModel.costPerSecond;
  }

  private calculateProgress(status: string): number {
    switch (status) {
      case 'pending': return 0;
      case 'processing': return 50;
      case 'completed': return 100;
      case 'failed': return 100;
      default: return 0;
    }
  }

  private estimateTimeRemaining(status: string): number {
    switch (status) {
      case 'pending': return GEMINI_VEO_CONFIG.AVERAGE_PROCESSING_TIME;
      case 'processing': return GEMINI_VEO_CONFIG.AVERAGE_PROCESSING_TIME / 2;
      case 'completed':
      case 'failed': return 0;
      default: return GEMINI_VEO_CONFIG.AVERAGE_PROCESSING_TIME;
    }
  }

  private handleVeoError(error: any, operation: string): AIError {
    if (error instanceof AIError) {
      return error;
    }

    // Handle common Gemini Veo errors
    if (error.response?.status === 429) {
      return new AIError({
        code: 'RATE_LIMITED',
        message: `Gemini Veo ${operation} rate limited. Please try again later.`,
        type: 'rate_limit',
        provider: this.provider,
        retryable: true,
        details: { operation, originalError: error.message },
      });
    }

    if (error.response?.status === 400) {
      return new AIError({
        code: 'INVALID_REQUEST',
        message: `Invalid ${operation} request: ${error.message}`,
        type: 'invalid_request',
        provider: this.provider,
        retryable: false,
        details: { operation, originalError: error.message },
      });
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      return new AIError({
        code: 'AUTHENTICATION_ERROR',
        message: `Authentication failed for ${operation}. Check your API key.`,
        type: 'authentication',
        provider: this.provider,
        retryable: false,
        details: { operation, originalError: error.message },
      });
    }

    // Generic error handling
    return new AIError({
      code: 'VEO_ERROR',
      message: `Gemini Veo ${operation} failed: ${error.message}`,
      type: 'api_error',
      provider: this.provider,
      retryable: true,
      details: { operation, originalError: error.message },
    });
  }

  /**
   * Poll video generation status until completion
   * Helper method for applications that want automatic polling
   */
  async pollVideoCompletion(videoId: string, apiKey: string, maxAttempts?: number): Promise<VideoGenerationResponse> {
    const attempts = maxAttempts || VIDEO_GENERATION_DEFAULTS.MAX_POLLING_ATTEMPTS;
    
    for (let i = 0; i < attempts; i++) {
      const status = await this.getVideoStatus(videoId, apiKey);
      
      if (status.status === 'completed') {
        // Get full video response
        const response = await this.makeRequest<GeminiVeoResponse>(
          `${this.veoBaseUrl}/videos/${videoId}`,
          { method: 'GET' },
          apiKey
        );
        
        return this.transformVeoResponse(response, { prompt: '' }, ''); // Basic transform for polling result
      }
      
      if (status.status === 'failed') {
        throw new AIError({
          code: 'VIDEO_GENERATION_FAILED',
          message: status.error || 'Video generation failed',
          type: 'api_error',
          provider: this.provider,
          retryable: false,
          details: { videoId, status },
        });
      }
      
      // Wait before next poll
      if (i < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, VIDEO_GENERATION_DEFAULTS.POLLING_INTERVAL));
      }
    }
    
    throw new AIError({
      code: 'POLLING_TIMEOUT',
      message: `Video generation polling timed out after ${attempts} attempts`,
      type: 'api_error',
      provider: this.provider,
      retryable: true,
      details: { videoId, maxAttempts: attempts },
    });
  }
}