/**
 * Core Types for AI Marketplace SDK
 * 
 * Unified types supporting OpenAI and Claude providers with tree-shakable exports
 */

// Base Types
export type ApiProvider = 'openai' | 'anthropic' | 'claude' | 'google' | 'azure' | 'cohere' | 'huggingface';

export interface BaseConfig {
  apiKey?: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  userAgent?: string;
}

// Message Types - Unified interface for all providers
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | MessageContent[];
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// Chat Completion Types
export interface ChatCompletionRequest {
  messages: Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  stream?: boolean;
  tools?: Tool[];
  tool_choice?: 'none' | 'auto' | { type: 'function'; function: { name: string } };
  user?: string;
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, any>;
  };
}

export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  provider: ApiProvider;
  choices: ChatChoice[];
  usage: Usage;
  system_fingerprint?: string;
}

export interface ChatChoice {
  index: number;
  message: Message;
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
  logprobs?: ChatCompletionLogprobs | null;
}

export interface ChatCompletionLogprobs {
  content: ChatCompletionTokenLogprob[] | null;
}

export interface ChatCompletionTokenLogprob {
  token: string;
  logprob: number;
  bytes: number[] | null;
  top_logprobs: TopLogprob[];
}

export interface TopLogprob {
  token: string;
  logprob: number;
  bytes: number[] | null;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
}

// Streaming Types
export interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  provider: ApiProvider;
  choices: ChatChunkChoice[];
  usage?: Usage;
}

export interface ChatChunkChoice {
  index: number;
  delta: {
    role?: 'assistant';
    content?: string;
    tool_calls?: ToolCall[];
  };
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

// Image Generation Types
export interface ImageGenerationRequest {
  prompt: string;
  model?: string;
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  response_format?: 'url' | 'b64_json';
  user?: string;
}

export interface ImageGenerationResponse {
  created: number;
  data: ImageData[];
  provider: ApiProvider;
  usage?: {
    estimated_cost: number;
  };
}

export interface ImageData {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

// Provider Configuration Types
export interface ProviderConfig extends BaseConfig {
  provider: ApiProvider;
  model: string;
  defaultParams?: Record<string, any>;
}

export interface ProviderCapabilities {
  chatCompletion: boolean;
  streamingCompletion: boolean;
  functionCalling: boolean;
  imageGeneration: boolean;
  imageAnalysis: boolean;
  jsonMode: boolean;
  systemMessages: boolean;
  toolUse: boolean;
  multipleMessages: boolean;
  maxContextTokens: number;
  supportedModels: string[];
}

// Error Types
export interface SDKError extends Error {
  code: string;
  statusCode?: number;
  provider?: ApiProvider;
  requestId?: string;
  details?: Record<string, any>;
}

export interface RateLimitError extends SDKError {
  code: 'RATE_LIMIT_EXCEEDED';
  retryAfter?: number;
  limitType: 'requests' | 'tokens' | 'cost';
}

export interface AuthenticationError extends SDKError {
  code: 'AUTHENTICATION_FAILED';
  provider: ApiProvider;
}

export interface ValidationError extends SDKError {
  code: 'VALIDATION_ERROR';
  field: string;
  value: any;
}

// Provider Selection Types
export interface ProviderConstraints {
  maxCost?: number;
  maxLatency?: number;
  qualityThreshold?: number;
  requiredCapabilities?: (keyof ProviderCapabilities)[];
  excludeProviders?: ApiProvider[];
  preferredProviders?: ApiProvider[];
}

export interface ProviderSelection {
  provider: ApiProvider;
  model: string;
  estimatedCost: number;
  estimatedLatency: number;
  qualityScore: number;
  reasoning: string;
}

// Usage Tracking Types
export interface UsageMetrics {
  requests: number;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  latency: {
    avg: number;
    p95: number;
    p99: number;
  };
  errors: {
    total: number;
    rate: number;
    byCode: Record<string, number>;
  };
}

export interface RequestMetrics {
  requestId: string;
  provider: ApiProvider;
  model: string;
  startTime: number;
  endTime: number;
  tokens: Usage;
  cost: number;
  success: boolean;
  error?: SDKError;
}

// SDK Configuration Types
export interface SDKConfig {
  apiKey?: string;
  baseURL?: string;
  defaultProvider?: ApiProvider;
  defaultModel?: string;
  providers?: Record<ApiProvider, ProviderConfig>;
  enableUsageTracking?: boolean;
  enableRetries?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  userAgent?: string;
  debug?: boolean;
}

// Model Information Types
export interface ModelInfo {
  id: string;
  provider: ApiProvider;
  name: string;
  description?: string;
  contextWindow: number;
  maxOutputTokens: number;
  capabilities: ProviderCapabilities;
  pricing: {
    input: number; // per 1k tokens
    output: number; // per 1k tokens
  };
  deprecated?: boolean;
  deprecationDate?: string;
}

// Export utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Type guards
export function isSDKError(error: any): error is SDKError {
  return error && typeof error === 'object' && 'code' in error && typeof error.code === 'string';
}

export function isRateLimitError(error: any): error is RateLimitError {
  return isSDKError(error) && error.code === 'RATE_LIMIT_EXCEEDED';
}

export function isAuthenticationError(error: any): error is AuthenticationError {
  return isSDKError(error) && error.code === 'AUTHENTICATION_FAILED';
}

export function isValidationError(error: any): error is ValidationError {
  return isSDKError(error) && error.code === 'VALIDATION_ERROR';
}

// Constants
export const SUPPORTED_PROVIDERS: ApiProvider[] = [
  'openai',
  'anthropic',
  'claude',
  'google',
  'azure',
  'cohere',
  'huggingface'
];

export const DEFAULT_MODELS: Record<ApiProvider, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-3-5-sonnet-20241022',
  claude: 'claude-3-5-sonnet-20241022',
  google: 'gemini-pro',
  azure: 'gpt-4',
  cohere: 'command-r-plus',
  huggingface: 'meta-llama/Llama-2-70b-chat-hf'
};

export const PROVIDER_CAPABILITIES: Record<ApiProvider, ProviderCapabilities> = {
  openai: {
    chatCompletion: true,
    streamingCompletion: true,
    functionCalling: true,
    imageGeneration: true,
    imageAnalysis: true,
    jsonMode: true,
    systemMessages: true,
    toolUse: true,
    multipleMessages: true,
    maxContextTokens: 128000,
    supportedModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']
  },
  anthropic: {
    chatCompletion: true,
    streamingCompletion: true,
    functionCalling: true,
    imageGeneration: false,
    imageAnalysis: true,
    jsonMode: false,
    systemMessages: true,
    toolUse: true,
    multipleMessages: true,
    maxContextTokens: 200000,
    supportedModels: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229']
  },
  claude: {
    chatCompletion: true,
    streamingCompletion: true,
    functionCalling: true,
    imageGeneration: false,
    imageAnalysis: true,
    jsonMode: false,
    systemMessages: true,
    toolUse: true,
    multipleMessages: true,
    maxContextTokens: 200000,
    supportedModels: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229']
  },
  google: {
    chatCompletion: true,
    streamingCompletion: true,
    functionCalling: false,
    imageGeneration: false,
    imageAnalysis: true,
    jsonMode: false,
    systemMessages: false,
    toolUse: false,
    multipleMessages: true,
    maxContextTokens: 1000000,
    supportedModels: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro', 'gemini-pro-vision']
  },
  azure: {
    chatCompletion: true,
    streamingCompletion: true,
    functionCalling: true,
    imageGeneration: true,
    imageAnalysis: true,
    jsonMode: true,
    systemMessages: true,
    toolUse: true,
    multipleMessages: true,
    maxContextTokens: 128000,
    supportedModels: ['gpt-4', 'gpt-3.5-turbo']
  },
  cohere: {
    chatCompletion: true,
    streamingCompletion: true,
    functionCalling: true,
    imageGeneration: false,
    imageAnalysis: false,
    jsonMode: false,
    systemMessages: true,
    toolUse: true,
    multipleMessages: true,
    maxContextTokens: 128000,
    supportedModels: ['command-r-plus', 'command-r']
  },
  huggingface: {
    chatCompletion: true,
    streamingCompletion: true,
    functionCalling: false,
    imageGeneration: false,
    imageAnalysis: false,
    jsonMode: false,
    systemMessages: true,
    toolUse: false,
    multipleMessages: true,
    maxContextTokens: 4096,
    supportedModels: ['meta-llama/Llama-2-70b-chat-hf']
  }
};