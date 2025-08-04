/**
 * AI Provider Integration Types
 * 
 * Core type definitions for multi-provider AI integration layer
 * Supporting OpenAI, Anthropic, Google AI, and Gemini Veo with unified interface
 * Including video generation capabilities for multi-modal AI applications
 */

import { ApiProvider } from '@prisma/client';

// Core AI Message Types
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
  metadata?: Record<string, any>;
}

// Video Generation Types
export interface VideoGenerationRequest {
  prompt: string;
  duration?: number; // Duration in seconds (default: 8 for Gemini Veo)
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3'; // Video aspect ratio
  quality?: 'standard' | 'high'; // Video quality setting
  model?: string; // Specific video model (e.g., 'gemini-veo-2-flash', 'gemini-veo-2')
  seed?: number; // For reproducible generation
  metadata?: Record<string, any>;
}

export interface VideoGenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string; // URL to generated video (when completed)
  thumbnailUrl?: string; // URL to video thumbnail
  duration?: number; // Actual video duration
  aspectRatio?: string; // Actual aspect ratio
  model: string;
  prompt: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string; // Error message if failed
  cost?: number; // Generation cost
  metadata?: Record<string, any>;
}

export interface VideoGenerationStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // Progress percentage (0-100)
  estimatedTimeRemaining?: number; // Seconds
  error?: string;
}

// AI Model Configuration
export interface AIModel {
  id: string;
  provider: ApiProvider;
  name: string;
  displayName: string;
  description: string;
  maxTokens: number;
  inputCostPer1K: number;
  outputCostPer1K: number;
  supportsStreaming: boolean;
  supportsTools: boolean;
  supportsVideo?: boolean; // Video generation capability
  contextWindow: number;
  isActive: boolean;
}

// Video Model Configuration (extends AIModel for video-specific models)
export interface VideoModel extends Omit<AIModel, 'maxTokens' | 'inputCostPer1K' | 'outputCostPer1K'> {
  maxDurationSeconds: number; // Maximum video duration
  costPerSecond: number; // Cost per second of video generated
  supportedAspectRatios: string[]; // Supported aspect ratios
  supportedQualities: string[]; // Supported quality levels
  averageProcessingTime: number; // Average processing time in seconds
}

// Request Configuration
export interface AIRequest {
  model: string;
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
  tools?: AITool[];
  toolChoice?: 'auto' | 'none' | { type: 'function', name: string };
  metadata?: Record<string, any>;
}

// Tool Definition
export interface AITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

// Response Types
export interface AIResponse {
  id: string;
  model: string;
  provider: ApiProvider;
  choices: AIChoice[];
  usage: AIUsage;
  created: number;
  metadata?: Record<string, any>;
}

export interface AIChoice {
  index: number;
  message: AIMessage;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
  toolCalls?: AIToolCall[];
}

export interface AIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
}

// Streaming Types
export interface AIStreamChunk {
  id: string;
  model: string;
  provider: ApiProvider;
  choices: AIStreamChoice[];
  usage?: AIUsage;
  created: number;
}

export interface AIStreamChoice {
  index: number;
  delta: {
    role?: 'assistant';
    content?: string;
    toolCalls?: AIToolCall[];
  };
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

// Provider Configuration
export interface ProviderConfig {
  provider: ApiProvider;
  baseUrl: string;
  defaultModel: string;
  models: AIModel[];
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  costMultiplier: number; // For cost optimization
  priority: number; // Higher number = higher priority
  isActive: boolean;
}

// Error Types
export interface AIError {
  code: string;
  message: string;
  type: 'authentication' | 'rate_limit' | 'invalid_request' | 'api_error' | 'network_error';
  provider: ApiProvider;
  retryable: boolean;
  details?: Record<string, any>;
}

export class AIError extends Error implements AIError {
  code: string;
  type: 'authentication' | 'rate_limit' | 'invalid_request' | 'api_error' | 'network_error';
  provider: ApiProvider;
  retryable: boolean;
  details?: Record<string, any>;

  constructor(config: {
    code: string;
    message: string;
    type: 'authentication' | 'rate_limit' | 'invalid_request' | 'api_error' | 'network_error';
    provider: ApiProvider;
    retryable: boolean;
    details?: Record<string, any>;
  }) {
    super(config.message);
    this.name = 'AIError';
    this.code = config.code;
    this.type = config.type;
    this.provider = config.provider;
    this.retryable = config.retryable;
    this.details = config.details;
  }
}

// Cost Optimization Types
export interface CostAnalysis {
  estimatedCost: number;
  cheapestProvider: ApiProvider;
  costByProvider: Record<ApiProvider, number>;
  recommendations: CostRecommendation[];
}

export interface CostRecommendation {
  provider: ApiProvider;
  model: string;
  estimatedCost: number;
  qualityScore: number;
  reasonCode: 'cheapest' | 'best_value' | 'highest_quality' | 'fastest';
  description: string;
}

// Performance Metrics
export interface PerformanceMetrics {
  latency: number;
  throughput: number;
  errorRate: number;
  availability: number;
  provider: ApiProvider;
  timestamp: Date;
}

// Provider Status
export interface ProviderStatus {
  provider: ApiProvider;
  isHealthy: boolean;
  latency: number;
  errorRate: number;
  lastCheck: Date;
  issues: string[];
}

// Usage Analytics
export interface AIUsageRecord {
  id: string;
  userId: string;
  apiKeyId: string;
  appId?: string;
  provider: ApiProvider;
  model: string;
  requestId: string;
  endpoint: string;
  tokensUsed: number;
  cost: number;
  latency: number;
  successful: boolean;
  errorCode?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

// Provider Interface
export interface AIProvider {
  provider: ApiProvider;
  
  // Core AI Operations
  chat(request: AIRequest, apiKey: string): Promise<AIResponse>;
  chatStream(request: AIRequest, apiKey: string): AsyncIterable<AIStreamChunk>;
  
  // Video Generation Operations (optional - only for providers that support video)
  generateVideo?(request: VideoGenerationRequest, apiKey: string): Promise<VideoGenerationResponse>;
  getVideoStatus?(videoId: string, apiKey: string): Promise<VideoGenerationStatus>;
  getVideoModels?(): Promise<VideoModel[]>;
  
  // Model Management
  getModels(): Promise<AIModel[]>;
  getModel(modelId: string): Promise<AIModel | null>;
  
  // Validation
  validateApiKey(apiKey: string): Promise<boolean>;
  estimateCost(request: AIRequest): Promise<number>;
  estimateVideoCost?(request: VideoGenerationRequest): Promise<number>;
  
  // Health Monitoring
  healthCheck(): Promise<ProviderStatus>;
}

// Router Configuration
export interface RouterConfig {
  fallbackEnabled: boolean;
  fallbackOrder: ApiProvider[];
  costOptimizationEnabled: boolean;
  performanceWeighting: number; // 0-1, how much to weight performance vs cost
  maxRetries: number;
  retryDelayMs: number;
  circuitBreakerThreshold: number;
}

// Fallback Strategy
export interface FallbackStrategy {
  primaryProvider: ApiProvider;
  fallbackProviders: ApiProvider[];
  fallbackTriggers: ('rate_limit' | 'api_error' | 'timeout' | 'authentication')[];
  maxFallbackAttempts: number;
}

// Cache Configuration
export interface CacheConfig {
  enabled: boolean;
  ttlSeconds: number;
  maxSize: number;
  keyStrategy: 'content_hash' | 'request_fingerprint';
}

// Model mapping for cross-provider compatibility
export const MODEL_EQUIVALENTS: Record<string, Partial<Record<ApiProvider, string>>> = {
  'chat-small': {
    [ApiProvider.OPENAI]: 'gpt-3.5-turbo',
    [ApiProvider.ANTHROPIC]: 'claude-3-haiku-20240307',
    [ApiProvider.GOOGLE]: 'gemini-1.5-flash',
  },
  'chat-medium': {
    [ApiProvider.OPENAI]: 'gpt-4',
    [ApiProvider.ANTHROPIC]: 'claude-3-sonnet-20240229',
    [ApiProvider.GOOGLE]: 'gemini-1.5-pro',
  },
  'chat-large': {
    [ApiProvider.OPENAI]: 'gpt-4-turbo',
    [ApiProvider.ANTHROPIC]: 'claude-3-opus-20240229',
    [ApiProvider.GOOGLE]: 'gemini-1.5-pro',
  },
  'video-fast': {
    [ApiProvider.GOOGLE]: 'gemini-veo-2-flash',
  },
  'video-quality': {
    [ApiProvider.GOOGLE]: 'gemini-veo-2',
  },
};

// Video Model Constants
export const VIDEO_GENERATION_DEFAULTS = {
  DURATION: 8, // seconds
  ASPECT_RATIO: '16:9' as const,
  QUALITY: 'standard' as const,
  MAX_POLLING_ATTEMPTS: 60, // 60 attempts * 5 seconds = 5 minutes max wait
  POLLING_INTERVAL: 5000, // 5 seconds
} as const;

// Gemini Veo Specific Constants (based on research)
export const GEMINI_VEO_CONFIG = {
  MAX_DURATION: 8, // Maximum 8-second videos
  SUPPORTED_ASPECT_RATIOS: ['16:9', '9:16', '1:1', '4:3'],
  SUPPORTED_QUALITIES: ['standard', 'high'],
  COST_PER_SECOND: {
    'gemini-veo-2-flash': 0.35, // $0.35 per second
    'gemini-veo-2': 0.35, // $0.35 per second (corrected from $0.75 - both models same price)
  },
  AVERAGE_PROCESSING_TIME: 180, // 3 minutes average
} as const;

// Default configurations
export const DEFAULT_ROUTER_CONFIG: RouterConfig = {
  fallbackEnabled: true,
  fallbackOrder: [ApiProvider.GOOGLE, ApiProvider.ANTHROPIC, ApiProvider.OPENAI],
  costOptimizationEnabled: true,
  performanceWeighting: 0.3,
  maxRetries: 3,
  retryDelayMs: 1000,
  circuitBreakerThreshold: 5,
};

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  ttlSeconds: 300, // 5 minutes
  maxSize: 1000,
  keyStrategy: 'content_hash',
};

// Response time targets (ms)
export const PERFORMANCE_TARGETS = {
  MAX_RESPONSE_TIME: 200, // <200ms requirement
  MAX_STREAM_FIRST_TOKEN: 100,
  MAX_FALLBACK_TIME: 500,
} as const;

// Cost optimization thresholds
export const COST_THRESHOLDS = {
  CHEAP_REQUEST: 0.001, // $0.001
  EXPENSIVE_REQUEST: 0.1, // $0.10
  SAVINGS_THRESHOLD: 0.2, // 20% savings to trigger provider switch
} as const;