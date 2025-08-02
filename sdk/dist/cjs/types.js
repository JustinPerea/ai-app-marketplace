"use strict";
/**
 * AI Marketplace SDK - Core Types
 *
 * TypeScript definitions for the AI Marketplace SDK
 * Supports OpenAI, Anthropic, and Google AI with unified interface
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestType = exports.COST_THRESHOLDS = exports.PERFORMANCE_TARGETS = exports.DEFAULT_CACHE_CONFIG = exports.DEFAULT_ROUTER_CONFIG = exports.MODEL_EQUIVALENTS = exports.AIError = exports.APIProvider = void 0;
// Provider Enumeration
var APIProvider;
(function (APIProvider) {
    APIProvider["OPENAI"] = "OPENAI";
    APIProvider["ANTHROPIC"] = "ANTHROPIC";
    APIProvider["GOOGLE"] = "GOOGLE";
})(APIProvider || (exports.APIProvider = APIProvider = {}));
class AIError extends Error {
    constructor(config) {
        super(config.message);
        this.name = 'AIError';
        this.code = config.code;
        this.type = config.type;
        this.provider = config.provider;
        this.retryable = config.retryable;
        this.details = config.details;
    }
}
exports.AIError = AIError;
// Model mapping for cross-provider compatibility
exports.MODEL_EQUIVALENTS = {
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
exports.DEFAULT_ROUTER_CONFIG = {
    fallbackEnabled: true,
    fallbackOrder: [APIProvider.GOOGLE, APIProvider.ANTHROPIC, APIProvider.OPENAI],
    costOptimizationEnabled: true,
    performanceWeighting: 0.3,
    maxRetries: 3,
    retryDelayMs: 1000,
    circuitBreakerThreshold: 5,
};
exports.DEFAULT_CACHE_CONFIG = {
    enabled: true,
    ttlSeconds: 300,
    maxSize: 1000,
    keyStrategy: 'content_hash',
};
// Performance targets (ms)
exports.PERFORMANCE_TARGETS = {
    MAX_RESPONSE_TIME: 200,
    MAX_STREAM_FIRST_TOKEN: 100,
    MAX_FALLBACK_TIME: 500,
};
// Cost optimization thresholds
exports.COST_THRESHOLDS = {
    CHEAP_REQUEST: 0.001,
    EXPENSIVE_REQUEST: 0.1,
    SAVINGS_THRESHOLD: 0.2,
};
var RequestType;
(function (RequestType) {
    RequestType["SIMPLE_CHAT"] = "simple_chat";
    RequestType["COMPLEX_ANALYSIS"] = "complex_analysis";
    RequestType["CODE_GENERATION"] = "code_generation";
    RequestType["CREATIVE_WRITING"] = "creative_writing";
    RequestType["TECHNICAL_SUPPORT"] = "technical_support";
    RequestType["DATA_PROCESSING"] = "data_processing";
    RequestType["UNKNOWN"] = "unknown";
})(RequestType || (exports.RequestType = RequestType = {}));
//# sourceMappingURL=types.js.map