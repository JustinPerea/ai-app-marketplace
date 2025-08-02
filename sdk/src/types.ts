/**
 * AI Marketplace SDK - Core Types
 * 
 * TypeScript definitions for the AI Marketplace SDK
 * Supports OpenAI, Anthropic, and Google AI with unified interface
 */

// Provider Enumeration
export enum APIProvider {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  GOOGLE = 'GOOGLE',
}

// Core AI Message Types
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
  metadata?: Record<string, any>;
}

// AI Model Configuration
export interface AIModel {
  id: string;
  provider: APIProvider;
  name: string;
  displayName: string;
  description: string;
  maxTokens: number;
  inputCostPer1K: number;
  outputCostPer1K: number;
  supportsStreaming: boolean;
  supportsTools: boolean;
  contextWindow: number;
  isActive: boolean;
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
  provider: APIProvider;
  choices: AIChoice[];
  usage: AIUsage;
  created: number;
  metadata?: Record<string, any>;
}

export interface AIChoice {
  index: number;
  message: AIMessage;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'refusal' | null;
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
  provider: APIProvider;
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
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'refusal' | null;
}

// Provider Configuration
export interface ProviderConfig {
  provider: APIProvider;
  baseUrl: string;
  defaultModel: string;
  models: AIModel[];
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  costMultiplier: number;
  priority: number;
  isActive: boolean;
}

// Error Types
export interface AIErrorConfig {
  code: string;
  message: string;
  type: 'authentication' | 'rate_limit' | 'invalid_request' | 'api_error' | 'network_error';
  provider: APIProvider;
  retryable: boolean;
  details?: Record<string, any>;
}

export class AIError extends Error {
  public readonly code: string;
  public readonly type: 'authentication' | 'rate_limit' | 'invalid_request' | 'api_error' | 'network_error';
  public readonly provider: APIProvider;
  public readonly retryable: boolean;
  public readonly details?: Record<string, any>;

  constructor(config: AIErrorConfig) {
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
  cheapestProvider: APIProvider;
  costByProvider: Record<APIProvider, number>;
  recommendations: CostRecommendation[];
}

export interface CostRecommendation {
  provider: APIProvider;
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
  provider: APIProvider;
  timestamp: Date;
}

// Provider Status
export interface ProviderStatus {
  provider: APIProvider;
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
  provider: APIProvider;
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
  provider: APIProvider;
  
  // Core AI Operations
  chat(request: AIRequest, apiKey: string): Promise<AIResponse>;
  chatStream(request: AIRequest, apiKey: string): AsyncIterable<AIStreamChunk>;
  
  // Model Management
  getModels(): Promise<AIModel[]>;
  getModel(modelId: string): Promise<AIModel | null>;
  
  // Validation
  validateApiKey(apiKey: string): Promise<boolean>;
  estimateCost(request: AIRequest): Promise<number>;
  
  // Health Monitoring
  healthCheck(): Promise<ProviderStatus>;
}

// Router Configuration
export interface RouterConfig {
  fallbackEnabled: boolean;
  fallbackOrder: APIProvider[];
  costOptimizationEnabled: boolean;
  performanceWeighting: number;
  maxRetries: number;
  retryDelayMs: number;
  circuitBreakerThreshold: number;
}

// Fallback Strategy
export interface FallbackStrategy {
  primaryProvider: APIProvider;
  fallbackProviders: APIProvider[];
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
export const MODEL_EQUIVALENTS: Record<string, Record<APIProvider, string>> = {
  'chat-small': {
    [APIProvider.OPENAI]: 'gpt-3.5-turbo',
    [APIProvider.ANTHROPIC]: 'claude-3-haiku-20240307',
    [APIProvider.GOOGLE]: 'gemini-1.5-flash',
  },
  'chat-medium': {
    [APIProvider.OPENAI]: 'gpt-4',
    [APIProvider.ANTHROPIC]: 'claude-sonnet-4-20250514',
    [APIProvider.GOOGLE]: 'gemini-1.5-pro',
  },
  'chat-large': {
    [APIProvider.OPENAI]: 'gpt-4-turbo',
    [APIProvider.ANTHROPIC]: 'claude-3-opus-20240229',
    [APIProvider.GOOGLE]: 'gemini-1.5-pro',
  },
};

// Default configurations
export const DEFAULT_ROUTER_CONFIG: RouterConfig = {
  fallbackEnabled: true,
  fallbackOrder: [APIProvider.GOOGLE, APIProvider.ANTHROPIC, APIProvider.OPENAI],
  costOptimizationEnabled: true,
  performanceWeighting: 0.3,
  maxRetries: 3,
  retryDelayMs: 1000,
  circuitBreakerThreshold: 5,
};

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  ttlSeconds: 300,
  maxSize: 1000,
  keyStrategy: 'content_hash',
};

// Performance targets (ms)
export const PERFORMANCE_TARGETS = {
  MAX_RESPONSE_TIME: 200,
  MAX_STREAM_FIRST_TOKEN: 100,
  MAX_FALLBACK_TIME: 500,
} as const;

// Cost optimization thresholds
export const COST_THRESHOLDS = {
  CHEAP_REQUEST: 0.001,
  EXPENSIVE_REQUEST: 0.1,
  SAVINGS_THRESHOLD: 0.2,
} as const;

// ML Types
export interface RequestFeatures {
  promptLength: number;
  messageCount: number;
  hasSystemMessage: boolean;
  complexityScore: number;
  requestType: RequestType;
  userPatternId?: string;
  timeOfDay: number;
  dayOfWeek: number;
}

export interface ProviderPerformance {
  provider: APIProvider;
  model: string;
  avgResponseTime: number;
  avgCost: number;
  qualityScore: number;
  successRate: number;
  lastUpdated: number;
  sampleSize: number;
}

export interface PredictionResult {
  provider: APIProvider;
  model: string;
  predictedCost: number;
  predictedResponseTime: number;
  predictedQuality: number;
  confidence: number;
  reasoning: string;
}

export interface MLRouteDecision {
  selectedProvider: APIProvider;
  selectedModel: string;
  predictedCost: number;
  predictedResponseTime: number;
  predictedQuality: number;
  confidence: number;
  reasoning: string;
  alternatives: PredictionResult[];
  optimizationType: 'cost' | 'speed' | 'quality' | 'balanced';
}

export enum RequestType {
  SIMPLE_CHAT = 'simple_chat',
  COMPLEX_ANALYSIS = 'complex_analysis',
  CODE_GENERATION = 'code_generation',
  CREATIVE_WRITING = 'creative_writing',
  TECHNICAL_SUPPORT = 'technical_support',
  DATA_PROCESSING = 'data_processing',
  UNKNOWN = 'unknown'
}

export interface LearningData {
  requestFeatures: RequestFeatures;
  actualProvider: APIProvider;
  actualModel: string;
  actualCost: number;
  actualResponseTime: number;
  actualQuality: number;
  userSatisfaction?: number;
  timestamp: number;
}

// SDK Configuration
export interface SDKConfig {
  router?: Partial<RouterConfig>;
  cache?: Partial<CacheConfig>;
  enableMLRouting?: boolean;
  enableAnalytics?: boolean;
  defaultProvider?: APIProvider;
  timeout?: number;
}

// SDK Client Options
export interface ClientOptions {
  apiKeys: {
    openai?: string;
    anthropic?: string;
    google?: string;
  };
  config?: SDKConfig;
  baseUrls?: {
    openai?: string;
    anthropic?: string;
    google?: string;
  };
}