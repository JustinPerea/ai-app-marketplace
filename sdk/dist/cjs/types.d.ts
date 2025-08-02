/**
 * AI Marketplace SDK - Core Types
 *
 * TypeScript definitions for the AI Marketplace SDK
 * Supports OpenAI, Anthropic, and Google AI with unified interface
 */
export declare enum APIProvider {
    OPENAI = "OPENAI",
    ANTHROPIC = "ANTHROPIC",
    GOOGLE = "GOOGLE"
}
export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    name?: string;
    metadata?: Record<string, any>;
}
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
export interface AIRequest {
    model: string;
    messages: AIMessage[];
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    stream?: boolean;
    tools?: AITool[];
    toolChoice?: 'auto' | 'none' | {
        type: 'function';
        name: string;
    };
    metadata?: Record<string, any>;
}
export interface AITool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, any>;
    };
}
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
export interface AIErrorConfig {
    code: string;
    message: string;
    type: 'authentication' | 'rate_limit' | 'invalid_request' | 'api_error' | 'network_error';
    provider: APIProvider;
    retryable: boolean;
    details?: Record<string, any>;
}
export declare class AIError extends Error {
    readonly code: string;
    readonly type: 'authentication' | 'rate_limit' | 'invalid_request' | 'api_error' | 'network_error';
    readonly provider: APIProvider;
    readonly retryable: boolean;
    readonly details?: Record<string, any>;
    constructor(config: AIErrorConfig);
}
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
export interface PerformanceMetrics {
    latency: number;
    throughput: number;
    errorRate: number;
    availability: number;
    provider: APIProvider;
    timestamp: Date;
}
export interface ProviderStatus {
    provider: APIProvider;
    isHealthy: boolean;
    latency: number;
    errorRate: number;
    lastCheck: Date;
    issues: string[];
}
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
export interface AIProvider {
    provider: APIProvider;
    chat(request: AIRequest, apiKey: string): Promise<AIResponse>;
    chatStream(request: AIRequest, apiKey: string): AsyncIterable<AIStreamChunk>;
    getModels(): Promise<AIModel[]>;
    getModel(modelId: string): Promise<AIModel | null>;
    validateApiKey(apiKey: string): Promise<boolean>;
    estimateCost(request: AIRequest): Promise<number>;
    healthCheck(): Promise<ProviderStatus>;
}
export interface RouterConfig {
    fallbackEnabled: boolean;
    fallbackOrder: APIProvider[];
    costOptimizationEnabled: boolean;
    performanceWeighting: number;
    maxRetries: number;
    retryDelayMs: number;
    circuitBreakerThreshold: number;
}
export interface FallbackStrategy {
    primaryProvider: APIProvider;
    fallbackProviders: APIProvider[];
    fallbackTriggers: ('rate_limit' | 'api_error' | 'timeout' | 'authentication')[];
    maxFallbackAttempts: number;
}
export interface CacheConfig {
    enabled: boolean;
    ttlSeconds: number;
    maxSize: number;
    keyStrategy: 'content_hash' | 'request_fingerprint';
}
export declare const MODEL_EQUIVALENTS: Record<string, Record<APIProvider, string>>;
export declare const DEFAULT_ROUTER_CONFIG: RouterConfig;
export declare const DEFAULT_CACHE_CONFIG: CacheConfig;
export declare const PERFORMANCE_TARGETS: {
    readonly MAX_RESPONSE_TIME: 200;
    readonly MAX_STREAM_FIRST_TOKEN: 100;
    readonly MAX_FALLBACK_TIME: 500;
};
export declare const COST_THRESHOLDS: {
    readonly CHEAP_REQUEST: 0.001;
    readonly EXPENSIVE_REQUEST: 0.1;
    readonly SAVINGS_THRESHOLD: 0.2;
};
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
export declare enum RequestType {
    SIMPLE_CHAT = "simple_chat",
    COMPLEX_ANALYSIS = "complex_analysis",
    CODE_GENERATION = "code_generation",
    CREATIVE_WRITING = "creative_writing",
    TECHNICAL_SUPPORT = "technical_support",
    DATA_PROCESSING = "data_processing",
    UNKNOWN = "unknown"
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
export interface SDKConfig {
    router?: Partial<RouterConfig>;
    cache?: Partial<CacheConfig>;
    enableMLRouting?: boolean;
    enableAnalytics?: boolean;
    defaultProvider?: APIProvider;
    timeout?: number;
}
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
//# sourceMappingURL=types.d.ts.map