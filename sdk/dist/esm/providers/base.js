/**
 * Base AI Provider Implementation
 *
 * Abstract base class providing common functionality for all AI providers
 * Includes rate limiting, error handling, and performance monitoring
 */
import { AIError, } from '../types';
export class BaseAIProvider {
    constructor() {
        this.rateLimitState = {
            requests: 0,
            tokens: 0,
            windowStart: Date.now(),
        };
        this.circuitBreakerState = {
            failures: 0,
            lastFailure: 0,
            isOpen: false,
        };
        this.performanceMetrics = [];
        this.maxMetricsHistory = 100;
    }
    // Common implementations
    async getModel(modelId) {
        const models = await this.getModels();
        return models.find(model => model.id === modelId) || null;
    }
    async estimateCost(request) {
        const model = await this.getModel(request.model);
        if (!model) {
            throw new AIError({
                code: 'MODEL_NOT_FOUND',
                message: `Model ${request.model} not found`,
                type: 'invalid_request',
                provider: this.provider,
                retryable: false,
            });
        }
        // Estimate input tokens (rough approximation: 1 token ≈ 4 characters)
        const inputText = request.messages.map(m => m.content).join(' ');
        const estimatedInputTokens = Math.ceil(inputText.length / 4);
        // Estimate output tokens based on maxTokens or default
        const estimatedOutputTokens = request.maxTokens || Math.min(1000, model.maxTokens * 0.1);
        const inputCost = (estimatedInputTokens / 1000) * model.inputCostPer1K;
        const outputCost = (estimatedOutputTokens / 1000) * model.outputCostPer1K;
        return inputCost + outputCost;
    }
    async healthCheck() {
        const startTime = Date.now();
        const issues = [];
        try {
            // Test basic connectivity
            const response = await fetch(this.baseUrl, {
                method: 'HEAD',
                headers: this.defaultHeaders,
            });
            if (!response.ok) {
                issues.push(`HTTP ${response.status}: ${response.statusText}`);
            }
            const latency = Date.now() - startTime;
            const recentMetrics = this.getRecentMetrics(5 * 60 * 1000); // Last 5 minutes
            const errorRate = recentMetrics.length > 0
                ? recentMetrics.filter(m => m.errorRate > 0).length / recentMetrics.length
                : 0;
            // Check circuit breaker state
            if (this.circuitBreakerState.isOpen) {
                issues.push('Circuit breaker is open due to repeated failures');
            }
            // Check rate limits
            if (this.isRateLimited()) {
                issues.push('Rate limit exceeded');
            }
            return {
                provider: this.provider,
                isHealthy: issues.length === 0,
                latency,
                errorRate,
                lastCheck: new Date(),
                issues,
            };
        }
        catch (error) {
            return {
                provider: this.provider,
                isHealthy: false,
                latency: Date.now() - startTime,
                errorRate: 1,
                lastCheck: new Date(),
                issues: [error instanceof Error ? error.message : 'Unknown error'],
            };
        }
    }
    // Protected helper methods for subclasses
    async makeRequest(url, options, apiKey) {
        // Check circuit breaker
        if (this.circuitBreakerState.isOpen) {
            const timeSinceLastFailure = Date.now() - this.circuitBreakerState.lastFailure;
            if (timeSinceLastFailure < 60000) { // 1 minute cooldown
                throw new AIError({
                    code: 'CIRCUIT_BREAKER_OPEN',
                    message: 'Circuit breaker is open, service temporarily unavailable',
                    type: 'api_error',
                    provider: this.provider,
                    retryable: true,
                });
            }
            else {
                // Reset circuit breaker after cooldown
                this.circuitBreakerState.isOpen = false;
                this.circuitBreakerState.failures = 0;
            }
        }
        // Check rate limits
        if (this.isRateLimited()) {
            throw new AIError({
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Rate limit exceeded, please try again later',
                type: 'rate_limit',
                provider: this.provider,
                retryable: true,
            });
        }
        const startTime = Date.now();
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.defaultHeaders,
                    ...this.getAuthHeaders(apiKey),
                    ...options.headers,
                },
            });
            const latency = Date.now() - startTime;
            // Update rate limit tracking
            this.updateRateLimit(1, 0); // TODO: Track actual tokens used
            if (!response.ok) {
                this.recordFailure();
                throw await this.handleHttpError(response);
            }
            // Record success
            this.recordSuccess(latency);
            const data = await response.json();
            return data;
        }
        catch (error) {
            const latency = Date.now() - startTime;
            this.recordFailure();
            if (error instanceof AIError) {
                throw error;
            }
            // Handle network errors
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new AIError({
                    code: 'NETWORK_ERROR',
                    message: 'Network request failed',
                    type: 'network_error',
                    provider: this.provider,
                    retryable: true,
                    details: { latency },
                });
            }
            throw new AIError({
                code: 'UNKNOWN_ERROR',
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                type: 'api_error',
                provider: this.provider,
                retryable: false,
                details: { latency },
            });
        }
    }
    async makeStreamRequest(url, options, apiKey) {
        // Similar checks as makeRequest
        if (this.circuitBreakerState.isOpen) {
            const timeSinceLastFailure = Date.now() - this.circuitBreakerState.lastFailure;
            if (timeSinceLastFailure < 60000) {
                throw new AIError({
                    code: 'CIRCUIT_BREAKER_OPEN',
                    message: 'Circuit breaker is open, service temporarily unavailable',
                    type: 'api_error',
                    provider: this.provider,
                    retryable: true,
                });
            }
        }
        if (this.isRateLimited()) {
            throw new AIError({
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Rate limit exceeded, please try again later',
                type: 'rate_limit',
                provider: this.provider,
                retryable: true,
            });
        }
        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.defaultHeaders,
                ...this.getAuthHeaders(apiKey),
                ...options.headers,
            },
        });
        if (!response.ok) {
            this.recordFailure();
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
        return response.body;
    }
    async handleHttpError(response) {
        let errorData = {};
        try {
            errorData = await response.json();
        }
        catch (_a) {
            // Ignore JSON parsing errors
        }
        const baseError = {
            provider: this.provider,
            retryable: response.status >= 500 || response.status === 429,
            details: {
                status: response.status,
                statusText: response.statusText,
                ...errorData
            },
        };
        switch (response.status) {
            case 401:
                return new AIError({
                    ...baseError,
                    code: 'AUTHENTICATION_ERROR',
                    message: 'Invalid API key or authentication failed',
                    type: 'authentication',
                    retryable: false,
                });
            case 429:
                return new AIError({
                    ...baseError,
                    code: 'RATE_LIMIT_ERROR',
                    message: 'Rate limit exceeded',
                    type: 'rate_limit',
                    retryable: true,
                });
            case 400:
                return new AIError({
                    ...baseError,
                    code: 'INVALID_REQUEST',
                    message: errorData.message || 'Invalid request parameters',
                    type: 'invalid_request',
                    retryable: false,
                });
            case 500:
            case 502:
            case 503:
            case 504:
                return new AIError({
                    ...baseError,
                    code: 'SERVER_ERROR',
                    message: 'Server error occurred',
                    type: 'api_error',
                    retryable: true,
                });
            default:
                return new AIError({
                    ...baseError,
                    code: 'HTTP_ERROR',
                    message: `HTTP ${response.status}: ${response.statusText}`,
                    type: 'api_error',
                    retryable: false,
                });
        }
    }
    isRateLimited() {
        const now = Date.now();
        const windowDuration = 60 * 1000; // 1 minute window
        // Reset window if expired
        if (now - this.rateLimitState.windowStart > windowDuration) {
            this.rateLimitState = {
                requests: 0,
                tokens: 0,
                windowStart: now,
            };
            return false;
        }
        // Check limits (these should be configurable per provider)
        const requestLimit = 100; // requests per minute
        const tokenLimit = 100000; // tokens per minute
        return this.rateLimitState.requests >= requestLimit ||
            this.rateLimitState.tokens >= tokenLimit;
    }
    updateRateLimit(requests, tokens) {
        const now = Date.now();
        const windowDuration = 60 * 1000;
        // Reset window if expired
        if (now - this.rateLimitState.windowStart > windowDuration) {
            this.rateLimitState = {
                requests: requests,
                tokens: tokens,
                windowStart: now,
            };
        }
        else {
            this.rateLimitState.requests += requests;
            this.rateLimitState.tokens += tokens;
        }
    }
    recordSuccess(latency) {
        // Reset circuit breaker on success
        this.circuitBreakerState.failures = 0;
        this.circuitBreakerState.isOpen = false;
        // Record performance metrics
        this.recordMetric(latency, 0);
    }
    recordFailure() {
        this.circuitBreakerState.failures++;
        this.circuitBreakerState.lastFailure = Date.now();
        // Open circuit breaker after threshold failures
        if (this.circuitBreakerState.failures >= 5) {
            this.circuitBreakerState.isOpen = true;
        }
        // Record performance metrics
        this.recordMetric(0, 1);
    }
    recordMetric(latency, errorCount) {
        const metric = {
            latency,
            throughput: 1, // 1 request
            errorRate: errorCount,
            availability: errorCount === 0 ? 1 : 0,
            provider: this.provider,
            timestamp: new Date(),
        };
        this.performanceMetrics.push(metric);
        // Keep only recent metrics
        if (this.performanceMetrics.length > this.maxMetricsHistory) {
            this.performanceMetrics = this.performanceMetrics.slice(-this.maxMetricsHistory);
        }
    }
    getRecentMetrics(windowMs) {
        const cutoff = Date.now() - windowMs;
        return this.performanceMetrics.filter(m => m.timestamp.getTime() > cutoff);
    }
    // Utility method for generating request IDs
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
//# sourceMappingURL=base.js.map