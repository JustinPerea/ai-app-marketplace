/**
 * Base AI Provider Implementation
 *
 * Abstract base class providing common functionality for all AI providers
 * Includes rate limiting, error handling, and performance monitoring
 */
import { AIProvider, AIRequest, AIResponse, AIStreamChunk, AIModel, ProviderStatus, AIError, APIProvider } from '../types';
export interface RateLimitState {
    requests: number;
    tokens: number;
    windowStart: number;
}
export interface CircuitBreakerState {
    failures: number;
    lastFailure: number;
    isOpen: boolean;
}
export declare abstract class BaseAIProvider implements AIProvider {
    abstract readonly provider: APIProvider;
    protected abstract readonly baseUrl: string;
    protected abstract readonly defaultHeaders: Record<string, string>;
    private rateLimitState;
    private circuitBreakerState;
    private performanceMetrics;
    private readonly maxMetricsHistory;
    abstract chat(request: AIRequest, apiKey: string): Promise<AIResponse>;
    abstract chatStream(request: AIRequest, apiKey: string): AsyncIterable<AIStreamChunk>;
    abstract getModels(): Promise<AIModel[]>;
    abstract validateApiKey(apiKey: string): Promise<boolean>;
    getModel(modelId: string): Promise<AIModel | null>;
    estimateCost(request: AIRequest): Promise<number>;
    healthCheck(): Promise<ProviderStatus>;
    protected makeRequest<T>(url: string, options: RequestInit, apiKey: string): Promise<T>;
    protected makeStreamRequest(url: string, options: RequestInit, apiKey: string): Promise<ReadableStream<Uint8Array>>;
    protected abstract getAuthHeaders(apiKey: string): Record<string, string>;
    protected handleHttpError(response: Response): Promise<AIError>;
    private isRateLimited;
    private updateRateLimit;
    private recordSuccess;
    private recordFailure;
    private recordMetric;
    private getRecentMetrics;
    protected generateRequestId(): string;
}
//# sourceMappingURL=base.d.ts.map