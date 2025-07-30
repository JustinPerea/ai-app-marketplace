'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/utils/errors.ts
function withTimeout(promise, timeoutMs, context) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new exports.BaseSDKError(
          `Operation timed out after ${timeoutMs}ms`,
          "TIMEOUT",
          {
            provider: context?.provider,
            details: { timeoutMs, operation: context?.operation }
          }
        ));
      }, timeoutMs);
    })
  ]);
}
function sanitizeErrorForLogging(error) {
  const sanitized = {
    name: error.name || "Error",
    message: error.message || "Unknown error",
    code: error.code,
    statusCode: error.statusCode,
    provider: error.provider,
    requestId: error.requestId
  };
  if (error.details) {
    sanitized.details = { ...error.details };
    if (sanitized.details.apiKey) {
      sanitized.details.apiKey = "[REDACTED]";
    }
    if (sanitized.details.headers?.authorization) {
      sanitized.details.headers.authorization = "[REDACTED]";
    }
  }
  return sanitized;
}
exports.BaseSDKError = void 0; exports.SDKRateLimitError = void 0; exports.SDKAuthenticationError = void 0; exports.SDKValidationError = void 0; exports.ErrorFactory = void 0; var DEFAULT_RETRY_CONFIG; exports.RetryHandler = void 0; exports.CircuitBreaker = void 0;
var init_errors = __esm({
  "src/utils/errors.ts"() {
    exports.BaseSDKError = class extends Error {
      constructor(message, code, options) {
        super(message, { cause: options?.cause });
        __publicField(this, "code");
        __publicField(this, "statusCode");
        __publicField(this, "provider");
        __publicField(this, "requestId");
        __publicField(this, "details");
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = options?.statusCode;
        this.provider = options?.provider;
        this.requestId = options?.requestId;
        this.details = options?.details;
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }
      }
    };
    exports.SDKRateLimitError = class extends exports.BaseSDKError {
      constructor(message, limitType, options) {
        super(message, "RATE_LIMIT_EXCEEDED", options);
        __publicField(this, "code", "RATE_LIMIT_EXCEEDED");
        __publicField(this, "retryAfter");
        __publicField(this, "limitType");
        this.limitType = limitType;
        this.retryAfter = options?.retryAfter;
      }
    };
    exports.SDKAuthenticationError = class extends exports.BaseSDKError {
      constructor(message, provider, options) {
        super(message, "AUTHENTICATION_FAILED", { ...options, provider });
        __publicField(this, "code", "AUTHENTICATION_FAILED");
        __publicField(this, "provider");
        this.provider = provider;
      }
    };
    exports.SDKValidationError = class extends exports.BaseSDKError {
      constructor(message, field, value, options) {
        super(message, "VALIDATION_ERROR", options);
        __publicField(this, "code", "VALIDATION_ERROR");
        __publicField(this, "field");
        __publicField(this, "value");
        this.field = field;
        this.value = value;
      }
    };
    exports.ErrorFactory = class {
      static fromProviderError(error, provider, requestId) {
        if (provider === "openai") {
          return this.fromOpenAIError(error, requestId);
        }
        if (provider === "claude") {
          return this.fromClaudeError(error, requestId);
        }
        return this.fromGenericError(error, provider, requestId);
      }
      static fromOpenAIError(error, requestId) {
        const statusCode = error.status || error.statusCode || 500;
        const message = error.message || error.error?.message || "OpenAI API error";
        if (statusCode === 429) {
          const retryAfter = error.headers?.["retry-after"] ? parseInt(error.headers["retry-after"], 10) : void 0;
          return new exports.SDKRateLimitError(
            message,
            "requests",
            {
              retryAfter,
              statusCode,
              provider: "openai",
              requestId,
              details: { originalError: error }
            }
          );
        }
        if (statusCode === 401) {
          return new exports.SDKAuthenticationError(
            message,
            "openai",
            {
              statusCode,
              requestId,
              details: { originalError: error }
            }
          );
        }
        if (statusCode === 400) {
          return new exports.SDKValidationError(
            message,
            error.error?.param || "unknown",
            error.error?.code || "unknown",
            {
              statusCode,
              provider: "openai",
              requestId,
              details: { originalError: error }
            }
          );
        }
        return new exports.BaseSDKError(
          message,
          "OPENAI_API_ERROR",
          {
            statusCode,
            provider: "openai",
            requestId,
            details: { originalError: error },
            cause: error
          }
        );
      }
      static fromClaudeError(error, requestId) {
        const statusCode = error.status || error.statusCode || 500;
        const message = error.message || error.error?.message || "Claude API error";
        if (statusCode === 429) {
          const retryAfter = error.headers?.["retry-after"] ? parseInt(error.headers["retry-after"], 10) : void 0;
          return new exports.SDKRateLimitError(
            message,
            "requests",
            {
              retryAfter,
              statusCode,
              provider: "claude",
              requestId,
              details: { originalError: error }
            }
          );
        }
        if (statusCode === 401) {
          return new exports.SDKAuthenticationError(
            message,
            "claude",
            {
              statusCode,
              requestId,
              details: { originalError: error }
            }
          );
        }
        if (statusCode === 400) {
          return new exports.SDKValidationError(
            message,
            error.error?.param || "unknown",
            error.error?.code || "unknown",
            {
              statusCode,
              provider: "claude",
              requestId,
              details: { originalError: error }
            }
          );
        }
        return new exports.BaseSDKError(
          message,
          "CLAUDE_API_ERROR",
          {
            statusCode,
            provider: "claude",
            requestId,
            details: { originalError: error },
            cause: error
          }
        );
      }
      static fromGenericError(error, provider, requestId) {
        const statusCode = error.status || error.statusCode || 500;
        const message = error.message || `${provider} API error`;
        return new exports.BaseSDKError(
          message,
          "API_ERROR",
          {
            statusCode,
            provider,
            requestId,
            details: { originalError: error },
            cause: error
          }
        );
      }
    };
    DEFAULT_RETRY_CONFIG = {
      maxRetries: 3,
      baseDelay: 1e3,
      // 1 second
      maxDelay: 3e4,
      // 30 seconds
      backoffMultiplier: 2,
      jitter: true,
      retryableErrors: [
        "RATE_LIMIT_EXCEEDED",
        "NETWORK_ERROR",
        "TIMEOUT",
        "SERVER_ERROR",
        "TEMPORARY_FAILURE"
      ]
    };
    exports.RetryHandler = class {
      constructor(config = {}) {
        __publicField(this, "config");
        this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
      }
      /**
       * Execute a function with retry logic
       */
      async execute(fn, context) {
        let lastError = null;
        let attempt = 0;
        while (attempt <= this.config.maxRetries) {
          try {
            return await fn();
          } catch (error) {
            lastError = error instanceof exports.BaseSDKError ? error : this.convertToSDKError(error, context?.provider);
            if (attempt === this.config.maxRetries) {
              break;
            }
            if (!this.isRetryableError(lastError)) {
              break;
            }
            const delay = this.calculateDelay(attempt, lastError);
            console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms`, {
              error: lastError.code,
              provider: context?.provider,
              requestId: context?.requestId,
              operation: context?.operation
            });
            await this.sleep(delay);
            attempt++;
          }
        }
        throw lastError;
      }
      /**
       * Check if an error should trigger a retry
       */
      isRetryableError(error) {
        if (error.code === "AUTHENTICATION_FAILED" || error.code === "VALIDATION_ERROR") {
          return false;
        }
        if (error.code === "RATE_LIMIT_EXCEEDED") {
          return true;
        }
        if (error.statusCode && error.statusCode >= 500) {
          return true;
        }
        if (this.config.retryableErrors.includes(error.code)) {
          return true;
        }
        return false;
      }
      /**
       * Calculate exponential backoff delay with jitter
       */
      calculateDelay(attempt, error) {
        if (error instanceof exports.SDKRateLimitError && error.retryAfter) {
          return error.retryAfter * 1e3;
        }
        let delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt);
        delay = Math.min(delay, this.config.maxDelay);
        if (this.config.jitter) {
          delay = delay * (0.5 + Math.random() * 0.5);
        }
        return Math.floor(delay);
      }
      /**
       * Convert generic error to SDK error
       */
      convertToSDKError(error, provider) {
        if (error instanceof exports.BaseSDKError) {
          return error;
        }
        if (error.code === "ECONNRESET" || error.code === "ENOTFOUND" || error.code === "ETIMEDOUT") {
          return new exports.BaseSDKError(
            `Network error: ${error.message}`,
            "NETWORK_ERROR",
            { provider, cause: error }
          );
        }
        return new exports.BaseSDKError(
          error.message || "Unknown error",
          "UNKNOWN_ERROR",
          { provider, cause: error }
        );
      }
      /**
       * Sleep utility
       */
      sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    };
    exports.CircuitBreaker = class {
      constructor(config = {}) {
        __publicField(this, "state", "closed" /* CLOSED */);
        __publicField(this, "failures", 0);
        __publicField(this, "lastFailureTime", 0);
        __publicField(this, "nextAttempt", 0);
        __publicField(this, "config");
        this.config = {
          failureThreshold: 5,
          recoveryTimeout: 6e4,
          // 1 minute
          monitoringPeriod: 6e4,
          // 1 minute
          ...config
        };
      }
      /**
       * Execute function through circuit breaker
       */
      async execute(fn) {
        if (this.state === "open" /* OPEN */) {
          if (Date.now() < this.nextAttempt) {
            throw new exports.BaseSDKError(
              "Circuit breaker is OPEN - too many recent failures",
              "CIRCUIT_BREAKER_OPEN"
            );
          } else {
            this.state = "half_open" /* HALF_OPEN */;
          }
        }
        try {
          const result = await fn();
          this.onSuccess();
          return result;
        } catch (error) {
          this.onFailure();
          throw error;
        }
      }
      onSuccess() {
        this.failures = 0;
        this.state = "closed" /* CLOSED */;
      }
      onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.config.failureThreshold) {
          this.state = "open" /* OPEN */;
          this.nextAttempt = Date.now() + this.config.recoveryTimeout;
        }
      }
      /**
       * Get current circuit breaker status
       */
      getStatus() {
        return {
          state: this.state,
          failures: this.failures,
          lastFailureTime: this.lastFailureTime,
          nextAttempt: this.nextAttempt
        };
      }
    };
  }
});

// src/providers/base.ts
exports.BaseProvider = void 0; var ProviderRegistry; exports.providerRegistry = void 0;
var init_base = __esm({
  "src/providers/base.ts"() {
    init_errors();
    exports.BaseProvider = class {
      constructor(provider, config) {
        __publicField(this, "provider");
        __publicField(this, "config");
        __publicField(this, "retryHandler");
        __publicField(this, "circuitBreaker");
        this.provider = provider;
        this.config = config;
        this.retryHandler = new exports.RetryHandler({
          maxRetries: config.maxRetries || 3,
          baseDelay: config.retryDelay || 1e3
        });
        this.circuitBreaker = new exports.CircuitBreaker();
      }
      /**
       * Image generation - optional, defaults to error if not supported
       */
      generateImages(request) {
        throw new Error(`Image generation not supported by ${this.provider} provider`);
      }
      /**
       * Execute request with retry logic and circuit breaker
       */
      async executeWithRetry(fn, context) {
        const requestId = context?.requestId || this.generateRequestId();
        return this.circuitBreaker.execute(async () => {
          return this.retryHandler.execute(fn, {
            provider: this.provider,
            requestId,
            operation: context?.operation
          });
        });
      }
      /**
       * Execute request with timeout
       */
      async executeWithTimeout(promise, operation) {
        const timeout = this.config.timeout || 3e4;
        return withTimeout(promise, timeout, {
          operation,
          provider: this.provider
        });
      }
      /**
       * Create request metrics for tracking
       */
      createRequestMetrics(requestId, model, startTime) {
        return {
          requestId,
          provider: this.provider,
          model,
          startTime,
          endTime: 0,
          tokens: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, estimated_cost: 0 },
          cost: 0,
          success: false
        };
      }
      /**
       * Finalize request metrics
       */
      finalizeMetrics(metrics, usage, success, error) {
        return {
          ...metrics,
          endTime: Date.now(),
          tokens: usage,
          cost: usage.estimated_cost,
          success,
          error
        };
      }
      /**
       * Generate unique request ID
       */
      generateRequestId() {
        return `${this.provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      /**
       * Get default headers for requests
       */
      getDefaultHeaders() {
        const headers = {
          "Content-Type": "application/json",
          "User-Agent": this.config.userAgent || `ai-marketplace-sdk/0.1.0 (${this.provider})`
        };
        if (this.config.apiKey) {
          headers["Authorization"] = this.getAuthHeader(this.config.apiKey);
        }
        return headers;
      }
      /**
       * Health check for the provider
       */
      async healthCheck() {
        const startTime = Date.now();
        try {
          await this.executeWithTimeout(
            this.testConnection(),
            "health_check"
          );
          return {
            provider: this.provider,
            healthy: true,
            latency: Date.now() - startTime,
            capabilities: this.getCapabilities(),
            circuitBreakerStatus: this.circuitBreaker.getStatus()
          };
        } catch (error) {
          return {
            provider: this.provider,
            healthy: false,
            latency: Date.now() - startTime,
            error: error instanceof Error ? error.message : "Unknown error",
            capabilities: this.getCapabilities(),
            circuitBreakerStatus: this.circuitBreaker.getStatus()
          };
        }
      }
      /**
       * Get provider configuration (without sensitive data)
       */
      getConfig() {
        const { apiKey, ...safeConfig } = this.config;
        return safeConfig;
      }
      /**
       * Update provider configuration
       */
      updateConfig(updates) {
        Object.assign(this.config, updates);
      }
    };
    ProviderRegistry = class {
      constructor() {
        __publicField(this, "factories", /* @__PURE__ */ new Map());
        __publicField(this, "instances", /* @__PURE__ */ new Map());
      }
      /**
       * Register a provider factory
       */
      register(provider, factory) {
        this.factories.set(provider, factory);
      }
      /**
       * Get or create a provider instance
       */
      getProvider(config) {
        const key = `${config.provider}-${config.model}`;
        if (this.instances.has(key)) {
          return this.instances.get(key);
        }
        const factory = this.factories.get(config.provider);
        if (!factory) {
          throw new Error(`No factory registered for provider: ${config.provider}`);
        }
        const instance = factory.create(config);
        this.instances.set(key, instance);
        return instance;
      }
      /**
       * Get all registered providers
       */
      getRegisteredProviders() {
        return Array.from(this.factories.keys());
      }
      /**
       * Check if provider is supported
       */
      supports(provider) {
        return this.factories.has(provider);
      }
      /**
       * Clear all cached instances
       */
      clearCache() {
        this.instances.clear();
      }
      /**
       * Health check all providers
       */
      async healthCheckAll() {
        const results = {};
        for (const [provider, factory] of this.factories) {
          try {
            const testInstance = factory.create({
              provider,
              model: "test",
              apiKey: "test"
            });
            results[provider] = await testInstance.healthCheck();
          } catch (error) {
            results[provider] = {
              provider,
              healthy: false,
              error: error instanceof Error ? error.message : "Unknown error"
            };
          }
        }
        return results;
      }
    };
    exports.providerRegistry = new ProviderRegistry();
  }
});

// src/providers/openai.ts
function openai(options = {}) {
  return {
    provider: "openai",
    model: options.model || "gpt-4o",
    ...options
  };
}
var OpenAIProvider, OpenAIProviderFactory;
var init_openai = __esm({
  "src/providers/openai.ts"() {
    init_base();
    init_errors();
    OpenAIProvider = class extends exports.BaseProvider {
      constructor(config) {
        super("openai", config);
        __publicField(this, "openaiConfig");
        this.openaiConfig = config;
      }
      /**
       * Get OpenAI provider capabilities
       */
      getCapabilities() {
        return {
          chat: true,
          images: true,
          embeddings: true,
          tools: true,
          streaming: true,
          vision: true,
          maxTokens: 128e3,
          costPer1kTokens: { input: 0.01, output: 0.03 }
        };
      }
      /**
       * Validate OpenAI model
       */
      validateModel(model) {
        const validModels = this.getAvailableModels();
        return validModels.includes(model);
      }
      /**
       * Get available OpenAI models
       */
      getAvailableModels() {
        return [
          "gpt-4o",
          "gpt-4o-mini",
          "gpt-4-turbo",
          "gpt-4",
          "gpt-3.5-turbo",
          "gpt-3.5-turbo-16k"
        ];
      }
      /**
       * Estimate cost for OpenAI request
       */
      estimateCost(request) {
        const model = request.model || this.config.model;
        const tokenCount = this.estimateTokenCount(request);
        const pricing = this.getModelPricing(model);
        const inputCost = tokenCount.input / 1e3 * pricing.input;
        const outputCost = tokenCount.output / 1e3 * pricing.output;
        return inputCost + outputCost;
      }
      /**
       * Chat completion implementation
       */
      async chatCompletion(request) {
        const requestId = this.generateRequestId();
        const startTime = Date.now();
        const metrics = this.createRequestMetrics(requestId, request.model || this.config.model, startTime);
        return this.executeWithRetry(async () => {
          const openaiRequest = this.transformRequest(request);
          const response = await this.executeWithTimeout(
            this.makeOpenAIRequest("/chat/completions", openaiRequest),
            "chat_completion"
          );
          const usage = this.calculateUsage(response, request);
          const transformedResponse = this.transformResponse(response, request, metrics);
          this.logRequestMetrics(this.finalizeMetrics(metrics, usage, true));
          return transformedResponse;
        }, { requestId, operation: "chat_completion" });
      }
      /**
       * Streaming chat completion implementation
       */
      async *streamChatCompletion(request) {
        const requestId = this.generateRequestId();
        const openaiRequest = { ...this.transformRequest(request), stream: true };
        const response = await this.executeWithTimeout(
          this.makeOpenAIStreamRequest("/chat/completions", openaiRequest),
          "stream_chat_completion"
        );
        let totalUsage = {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          estimated_cost: 0
        };
        try {
          for await (const chunk of response) {
            const transformedChunk = this.transformStreamChunk(chunk, request);
            if (transformedChunk) {
              if (transformedChunk.usage) {
                totalUsage = transformedChunk.usage;
              }
              yield transformedChunk;
            }
          }
        } catch (error) {
          throw exports.ErrorFactory.fromProviderError(error, "openai", requestId);
        }
      }
      /**
       * Image generation implementation
       */
      async generateImages(request) {
        const requestId = this.generateRequestId();
        return this.executeWithRetry(async () => {
          const openaiRequest = this.transformImageRequest(request);
          const response = await this.executeWithTimeout(
            this.makeOpenAIRequest("/images/generations", openaiRequest),
            "image_generation"
          );
          return this.transformImageResponse(response);
        }, { requestId, operation: "image_generation" });
      }
      /**
       * Transform unified request to OpenAI format
       */
      transformRequest(request) {
        const openaiRequest = {
          model: request.model || this.config.model,
          messages: request.messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            ...msg.name && { name: msg.name },
            ...msg.tool_calls && { tool_calls: msg.tool_calls },
            ...msg.tool_call_id && { tool_call_id: msg.tool_call_id }
          })),
          ...request.temperature !== void 0 && { temperature: request.temperature },
          ...request.max_tokens !== void 0 && { max_tokens: request.max_tokens },
          ...request.top_p !== void 0 && { top_p: request.top_p },
          ...request.frequency_penalty !== void 0 && { frequency_penalty: request.frequency_penalty },
          ...request.presence_penalty !== void 0 && { presence_penalty: request.presence_penalty },
          ...request.stop && { stop: request.stop },
          ...request.tools && { tools: request.tools },
          ...request.tool_choice && { tool_choice: request.tool_choice },
          ...request.user && { user: request.user }
        };
        return openaiRequest;
      }
      /**
       * Transform OpenAI response to unified format
       */
      transformResponse(response, request, metrics) {
        return {
          id: response.id,
          object: "chat.completion",
          created: response.created,
          model: response.model,
          provider: "openai",
          choices: response.choices.map((choice) => ({
            index: choice.index,
            message: {
              role: choice.message.role,
              content: choice.message.content,
              ...choice.message.tool_calls && { tool_calls: choice.message.tool_calls }
            },
            finish_reason: choice.finish_reason,
            ...choice.logprobs && { logprobs: choice.logprobs }
          })),
          usage: {
            prompt_tokens: response.usage.prompt_tokens,
            completion_tokens: response.usage.completion_tokens,
            total_tokens: response.usage.total_tokens,
            estimated_cost: this.calculateCost(response.usage, request.model || this.config.model)
          },
          ...response.system_fingerprint && { system_fingerprint: response.system_fingerprint }
        };
      }
      /**
       * Transform OpenAI streaming chunk to unified format
       */
      transformStreamChunk(chunk, request) {
        if (!chunk || chunk === "[DONE]") {
          return null;
        }
        let data;
        try {
          data = typeof chunk === "string" ? JSON.parse(chunk) : chunk;
        } catch {
          return null;
        }
        return {
          id: data.id,
          object: "chat.completion.chunk",
          created: data.created,
          model: data.model,
          provider: "openai",
          choices: data.choices.map((choice) => ({
            index: choice.index,
            delta: {
              ...choice.delta.role && { role: choice.delta.role },
              ...choice.delta.content && { content: choice.delta.content },
              ...choice.delta.tool_calls && { tool_calls: choice.delta.tool_calls }
            },
            finish_reason: choice.finish_reason
          })),
          ...data.usage && {
            usage: {
              prompt_tokens: data.usage.prompt_tokens,
              completion_tokens: data.usage.completion_tokens,
              total_tokens: data.usage.total_tokens,
              estimated_cost: this.calculateCost(data.usage, request.model || this.config.model)
            }
          }
        };
      }
      /**
       * Transform unified image request to OpenAI format
       */
      transformImageRequest(request) {
        return {
          prompt: request.prompt,
          model: request.model || "dall-e-3",
          n: request.n || 1,
          size: request.size || "1024x1024",
          quality: request.quality || "standard",
          style: request.style || "vivid",
          response_format: request.response_format || "url",
          ...request.user && { user: request.user }
        };
      }
      /**
       * Transform OpenAI image response to unified format
       */
      transformImageResponse(response) {
        return {
          created: response.created,
          data: response.data.map((item) => ({
            url: item.url,
            b64_json: item.b64_json,
            revised_prompt: item.revised_prompt
          })),
          provider: "openai",
          usage: {
            estimated_cost: this.calculateImageCost(response.data.length)
          }
        };
      }
      /**
       * Make HTTP request to OpenAI API
       */
      async makeOpenAIRequest(endpoint, data) {
        const url = `${this.config.baseURL || "https://api.openai.com/v1"}${endpoint}`;
        const headers = this.getDefaultHeaders();
        if (this.openaiConfig.organization) {
          headers["OpenAI-Organization"] = this.openaiConfig.organization;
        }
        if (this.openaiConfig.project) {
          headers["OpenAI-Project"] = this.openaiConfig.project;
        }
        try {
          const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(data)
          });
          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw exports.ErrorFactory.fromProviderError({ ...error, status: response.status }, "openai");
          }
          return await response.json();
        } catch (error) {
          throw exports.ErrorFactory.fromProviderError(error, "openai");
        }
      }
      /**
       * Make streaming HTTP request to OpenAI API
       */
      async makeOpenAIStreamRequest(endpoint, data) {
        const url = `${this.config.baseURL || "https://api.openai.com/v1"}${endpoint}`;
        const headers = { ...this.getDefaultHeaders(), "Accept": "text/event-stream" };
        if (this.openaiConfig.organization) {
          headers["OpenAI-Organization"] = this.openaiConfig.organization;
        }
        if (this.openaiConfig.project) {
          headers["OpenAI-Project"] = this.openaiConfig.project;
        }
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(data)
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: response.statusText }));
          throw exports.ErrorFactory.fromProviderError({ ...error, status: response.status }, "openai");
        }
        return this.parseSSEStream(response);
      }
      /**
       * Parse Server-Sent Events stream
       */
      async *parseSSEStream(response) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");
        const decoder = new TextDecoder();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") return;
                try {
                  yield JSON.parse(data);
                } catch {
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
      /**
       * Validate OpenAI API key format
       */
      validateApiKey(apiKey) {
        return /^sk-[a-zA-Z0-9]{48}$/.test(apiKey);
      }
      /**
       * Get OpenAI authorization header
       */
      getAuthHeader(apiKey) {
        return `Bearer ${apiKey}`;
      }
      /**
       * Test connection to OpenAI API
       */
      async testConnection() {
        await this.makeOpenAIRequest("/models", {}).catch(() => {
        });
      }
      /**
       * Calculate usage and cost
       */
      calculateUsage(response, request) {
        const usage = response.usage;
        const cost = this.calculateCost(usage, request.model || this.config.model);
        return {
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens,
          estimated_cost: cost
        };
      }
      /**
       * Calculate cost based on usage and model
       */
      calculateCost(usage, model) {
        const pricing = this.getModelPricing(model);
        const inputCost = usage.prompt_tokens / 1e3 * pricing.input;
        const outputCost = usage.completion_tokens / 1e3 * pricing.output;
        return inputCost + outputCost;
      }
      /**
       * Get model-specific pricing
       */
      getModelPricing(model) {
        const pricingMap = {
          "gpt-4o": { input: 5e-3, output: 0.015 },
          "gpt-4o-mini": { input: 15e-5, output: 6e-4 },
          "gpt-4-turbo": { input: 0.01, output: 0.03 },
          "gpt-4": { input: 0.03, output: 0.06 },
          "gpt-3.5-turbo": { input: 15e-4, output: 2e-3 },
          "gpt-3.5-turbo-16k": { input: 3e-3, output: 4e-3 }
        };
        return pricingMap[model] || { input: 0.01, output: 0.03 };
      }
      /**
       * Calculate image generation cost
       */
      calculateImageCost(imageCount) {
        return imageCount * 0.04;
      }
      /**
       * Estimate token count for cost calculation
       */
      estimateTokenCount(request) {
        const messageText = request.messages.map((m) => typeof m.content === "string" ? m.content : JSON.stringify(m.content)).join(" ");
        const inputTokens = Math.ceil(messageText.length / 4);
        const outputTokens = request.max_tokens || 1e3;
        return { input: inputTokens, output: outputTokens };
      }
      /**
       * Log request metrics for analytics
       */
      logRequestMetrics(metrics) {
        if (this.config.debug) {
          console.log("OpenAI Request Metrics:", {
            requestId: metrics.requestId,
            provider: metrics.provider,
            model: metrics.model,
            duration: metrics.endTime - metrics.startTime,
            tokens: metrics.tokens,
            cost: metrics.cost,
            success: metrics.success
          });
        }
      }
    };
    OpenAIProviderFactory = class {
      create(config) {
        return new OpenAIProvider(config);
      }
      supports(provider) {
        return provider === "openai";
      }
    };
  }
});

// src/providers/claude.ts
function claude(options = {}) {
  return {
    provider: "claude",
    model: options.model || "claude-3-5-sonnet-20241022",
    ...options
  };
}
var ClaudeProvider, ClaudeProviderFactory;
var init_claude = __esm({
  "src/providers/claude.ts"() {
    init_base();
    init_errors();
    ClaudeProvider = class extends exports.BaseProvider {
      constructor(config) {
        super("claude", config);
        __publicField(this, "claudeConfig");
        this.claudeConfig = config;
      }
      /**
       * Get Claude provider capabilities
       */
      getCapabilities() {
        return {
          chat: true,
          images: false,
          embeddings: false,
          tools: true,
          streaming: true,
          vision: true,
          maxTokens: 2e5,
          costPer1kTokens: { input: 3e-3, output: 0.015 }
        };
      }
      /**
       * Validate Claude model
       */
      validateModel(model) {
        const validModels = this.getAvailableModels();
        return validModels.includes(model);
      }
      /**
       * Get available Claude models
       */
      getAvailableModels() {
        return [
          "claude-3-5-sonnet-20241022",
          "claude-3-5-haiku-20241022",
          "claude-3-opus-20240229",
          "claude-3-sonnet-20240229",
          "claude-3-haiku-20240307"
        ];
      }
      /**
       * Estimate cost for Claude request
       */
      estimateCost(request) {
        const model = request.model || this.config.model;
        const tokenCount = this.estimateTokenCount(request);
        const pricing = this.getModelPricing(model);
        const inputCost = tokenCount.input / 1e3 * pricing.input;
        const outputCost = tokenCount.output / 1e3 * pricing.output;
        return inputCost + outputCost;
      }
      /**
       * Chat completion implementation
       */
      async chatCompletion(request) {
        const requestId = this.generateRequestId();
        const startTime = Date.now();
        const metrics = this.createRequestMetrics(requestId, request.model || this.config.model, startTime);
        return this.executeWithRetry(async () => {
          const claudeRequest = this.transformRequest(request);
          const response = await this.executeWithTimeout(
            this.makeClaudeRequest("/messages", claudeRequest),
            "chat_completion"
          );
          const usage = this.calculateUsage(response, request);
          const transformedResponse = this.transformResponse(response, request, metrics);
          this.logRequestMetrics(this.finalizeMetrics(metrics, usage, true));
          return transformedResponse;
        }, { requestId, operation: "chat_completion" });
      }
      /**
       * Streaming chat completion implementation
       */
      async *streamChatCompletion(request) {
        const requestId = this.generateRequestId();
        const claudeRequest = { ...this.transformRequest(request), stream: true };
        const response = await this.executeWithTimeout(
          this.makeClaudeStreamRequest("/messages", claudeRequest),
          "stream_chat_completion"
        );
        let totalUsage = {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          estimated_cost: 0
        };
        try {
          for await (const chunk of response) {
            const transformedChunk = this.transformStreamChunk(chunk, request);
            if (transformedChunk) {
              if (transformedChunk.usage) {
                totalUsage = transformedChunk.usage;
              }
              yield transformedChunk;
            }
          }
        } catch (error) {
          throw exports.ErrorFactory.fromProviderError(error, "claude", requestId);
        }
      }
      /**
       * Transform unified request to Claude format
       */
      transformRequest(request) {
        const systemMessage = request.messages.find((m) => m.role === "system");
        const messages = request.messages.filter((m) => m.role !== "system");
        const claudeMessages = messages.map((msg) => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: this.transformMessageContent(msg)
        }));
        const claudeRequest = {
          model: request.model || this.config.model,
          messages: claudeMessages,
          max_tokens: request.max_tokens || 1e3,
          ...systemMessage && { system: systemMessage.content },
          ...request.temperature !== void 0 && { temperature: request.temperature },
          ...request.top_p !== void 0 && { top_p: request.top_p },
          ...request.stop && { stop_sequences: Array.isArray(request.stop) ? request.stop : [request.stop] },
          ...request.tools && { tools: this.transformTools(request.tools) }
        };
        return claudeRequest;
      }
      /**
       * Transform message content for Claude format
       */
      transformMessageContent(message) {
        if (typeof message.content === "string") {
          return message.content;
        }
        return message.content.map((content) => {
          if (content.type === "text") {
            return {
              type: "text",
              text: content.text
            };
          } else if (content.type === "image_url") {
            return {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                // Assume JPEG, could be improved
                data: content.image_url?.url.split(",")[1] || ""
                // Remove data:image/jpeg;base64, prefix
              }
            };
          }
          return content;
        });
      }
      /**
       * Transform tools for Claude format
       */
      transformTools(tools) {
        return tools.map((tool) => ({
          name: tool.function.name,
          description: tool.function.description,
          input_schema: tool.function.parameters
        }));
      }
      /**
       * Transform Claude response to unified format
       */
      transformResponse(response, request, metrics) {
        const usage = {
          prompt_tokens: response.usage?.input_tokens || 0,
          completion_tokens: response.usage?.output_tokens || 0,
          total_tokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
          estimated_cost: this.calculateCost(response.usage, request.model || this.config.model)
        };
        return {
          id: response.id,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1e3),
          model: response.model,
          provider: "claude",
          choices: [{
            index: 0,
            message: {
              role: "assistant",
              content: this.extractContentFromResponse(response),
              ...response.tool_calls && { tool_calls: this.transformToolCallsFromClaude(response.tool_calls) }
            },
            finish_reason: this.mapStopReason(response.stop_reason)
          }],
          usage
        };
      }
      /**
       * Extract content from Claude response
       */
      extractContentFromResponse(response) {
        if (response.content && Array.isArray(response.content)) {
          return response.content.filter((item) => item.type === "text").map((item) => item.text).join("");
        }
        return response.content || "";
      }
      /**
       * Transform tool calls from Claude format
       */
      transformToolCallsFromClaude(toolCalls) {
        return toolCalls.map((call, index) => ({
          id: `call_${index}`,
          type: "function",
          function: {
            name: call.name,
            arguments: JSON.stringify(call.input)
          }
        }));
      }
      /**
       * Map Claude stop reason to unified format
       */
      mapStopReason(stopReason) {
        const reasonMap = {
          "end_turn": "stop",
          "max_tokens": "length",
          "stop_sequence": "stop",
          "tool_use": "tool_calls"
        };
        return reasonMap[stopReason] || "stop";
      }
      /**
       * Transform Claude streaming chunk to unified format
       */
      transformStreamChunk(chunk, request) {
        if (!chunk || !chunk.type) {
          return null;
        }
        if (chunk.type === "message_start") {
          return {
            id: chunk.message.id,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1e3),
            model: chunk.message.model,
            provider: "claude",
            choices: [{
              index: 0,
              delta: { role: "assistant" },
              finish_reason: null
            }]
          };
        }
        if (chunk.type === "content_block_delta") {
          return {
            id: chunk.message?.id || "unknown",
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1e3),
            model: request.model || this.config.model,
            provider: "claude",
            choices: [{
              index: 0,
              delta: { content: chunk.delta.text },
              finish_reason: null
            }]
          };
        }
        if (chunk.type === "message_delta") {
          const usage = chunk.usage ? {
            prompt_tokens: chunk.usage.input_tokens || 0,
            completion_tokens: chunk.usage.output_tokens || 0,
            total_tokens: (chunk.usage.input_tokens || 0) + (chunk.usage.output_tokens || 0),
            estimated_cost: this.calculateCost(chunk.usage, request.model || this.config.model)
          } : void 0;
          return {
            id: chunk.message?.id || "unknown",
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1e3),
            model: request.model || this.config.model,
            provider: "claude",
            choices: [{
              index: 0,
              delta: {},
              finish_reason: this.mapStopReason(chunk.delta.stop_reason || "end_turn")
            }],
            ...usage && { usage }
          };
        }
        return null;
      }
      /**
       * Make HTTP request to Claude API
       */
      async makeClaudeRequest(endpoint, data) {
        const url = `${this.config.baseURL || "https://api.anthropic.com/v1"}${endpoint}`;
        const headers = this.getDefaultHeaders();
        headers["anthropic-version"] = this.claudeConfig.anthropicVersion || "2023-06-01";
        try {
          const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(data)
          });
          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw exports.ErrorFactory.fromProviderError({ ...error, status: response.status }, "claude");
          }
          return await response.json();
        } catch (error) {
          throw exports.ErrorFactory.fromProviderError(error, "claude");
        }
      }
      /**
       * Make streaming HTTP request to Claude API
       */
      async makeClaudeStreamRequest(endpoint, data) {
        const url = `${this.config.baseURL || "https://api.anthropic.com/v1"}${endpoint}`;
        const headers = { ...this.getDefaultHeaders(), "Accept": "text/event-stream" };
        headers["anthropic-version"] = this.claudeConfig.anthropicVersion || "2023-06-01";
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(data)
        });
        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: response.statusText }));
          throw exports.ErrorFactory.fromProviderError({ ...error, status: response.status }, "claude");
        }
        return this.parseSSEStream(response);
      }
      /**
       * Parse Server-Sent Events stream for Claude
       */
      async *parseSSEStream(response) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");
        const decoder = new TextDecoder();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") return;
                try {
                  yield JSON.parse(data);
                } catch {
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
      /**
       * Validate Claude API key format
       */
      validateApiKey(apiKey) {
        return /^sk-ant-api[a-zA-Z0-9\-]{95}$/.test(apiKey);
      }
      /**
       * Get Claude authorization header
       */
      getAuthHeader(apiKey) {
        return `Bearer ${apiKey}`;
      }
      /**
       * Test connection to Claude API
       */
      async testConnection() {
        const testRequest = {
          model: this.config.model,
          messages: [{ role: "user", content: "Hi" }],
          max_tokens: 1
        };
        await this.makeClaudeRequest("/messages", testRequest).catch(() => {
        });
      }
      /**
       * Calculate usage and cost
       */
      calculateUsage(response, request) {
        const usage = response.usage || {};
        const cost = this.calculateCost(usage, request.model || this.config.model);
        return {
          prompt_tokens: usage.input_tokens || 0,
          completion_tokens: usage.output_tokens || 0,
          total_tokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
          estimated_cost: cost
        };
      }
      /**
       * Calculate cost based on usage and model
       */
      calculateCost(usage, model) {
        const pricing = this.getModelPricing(model);
        const inputCost = (usage.input_tokens || 0) / 1e3 * pricing.input;
        const outputCost = (usage.output_tokens || 0) / 1e3 * pricing.output;
        return inputCost + outputCost;
      }
      /**
       * Get model-specific pricing
       */
      getModelPricing(model) {
        const pricingMap = {
          "claude-3-5-sonnet-20241022": { input: 3e-3, output: 0.015 },
          "claude-3-5-haiku-20241022": { input: 25e-5, output: 125e-5 },
          "claude-3-opus-20240229": { input: 0.015, output: 0.075 },
          "claude-3-sonnet-20240229": { input: 3e-3, output: 0.015 },
          "claude-3-haiku-20240307": { input: 25e-5, output: 125e-5 }
        };
        return pricingMap[model] || { input: 3e-3, output: 0.015 };
      }
      /**
       * Estimate token count for cost calculation
       */
      estimateTokenCount(request) {
        const messageText = request.messages.map((m) => typeof m.content === "string" ? m.content : JSON.stringify(m.content)).join(" ");
        const inputTokens = Math.ceil(messageText.length / 4);
        const outputTokens = request.max_tokens || 1e3;
        return { input: inputTokens, output: outputTokens };
      }
      /**
       * Log request metrics for analytics
       */
      logRequestMetrics(metrics) {
        if (this.config.debug) {
          console.log("Claude Request Metrics:", {
            requestId: metrics.requestId,
            provider: metrics.provider,
            model: metrics.model,
            duration: metrics.endTime - metrics.startTime,
            tokens: metrics.tokens,
            cost: metrics.cost,
            success: metrics.success
          });
        }
      }
    };
    ClaudeProviderFactory = class {
      create(config) {
        return new ClaudeProvider(config);
      }
      supports(provider) {
        return provider === "claude";
      }
    };
  }
});

// src/providers/index.ts
var providers_exports = {};
__export(providers_exports, {
  BaseProvider: () => exports.BaseProvider,
  ClaudeProvider: () => ClaudeProvider,
  ClaudeProviderFactory: () => ClaudeProviderFactory,
  OpenAIProvider: () => OpenAIProvider,
  OpenAIProviderFactory: () => OpenAIProviderFactory,
  ProviderRegistry: () => ProviderRegistry,
  checkProviderHealth: () => checkProviderHealth,
  claude: () => claude,
  getSupportedProviders: () => getSupportedProviders,
  isProviderSupported: () => isProviderSupported,
  openai: () => openai,
  providerRegistry: () => exports.providerRegistry,
  providers: () => exports.providers
});
function getSupportedProviders() {
  return exports.providerRegistry.getRegisteredProviders();
}
function isProviderSupported(provider) {
  return exports.providerRegistry.supports(provider);
}
async function checkProviderHealth() {
  return exports.providerRegistry.healthCheckAll();
}
exports.providers = void 0;
var init_providers = __esm({
  "src/providers/index.ts"() {
    init_base();
    init_openai();
    init_claude();
    init_base();
    init_openai();
    init_claude();
    exports.providerRegistry.register("openai", new OpenAIProviderFactory());
    exports.providerRegistry.register("claude", new ClaudeProviderFactory());
    exports.providers = {
      openai,
      claude
    };
  }
});

// src/chat/index.ts
init_base();
init_errors();
var Chat2 = class {
  constructor(options = {}) {
    __publicField(this, "defaultProvider");
    __publicField(this, "options");
    this.options = {
      enableAutoRetry: true,
      enableFallback: true,
      trackUsage: true,
      ...options
    };
    this.defaultProvider = options.provider;
  }
  /**
   * Complete a chat conversation
   */
  async complete(request, options) {
    const mergedOptions = { ...this.options, ...options };
    const providerConfig = await this.selectProvider(request, mergedOptions);
    const provider = exports.providerRegistry.getProvider(providerConfig);
    try {
      return await provider.chatCompletion(request);
    } catch (error) {
      if (mergedOptions.enableFallback && this.shouldFallback(error)) {
        return this.executeWithFallback(request, providerConfig, mergedOptions);
      }
      throw error;
    }
  }
  /**
   * Stream a chat conversation
   */
  async *stream(request, options) {
    const mergedOptions = { ...this.options, ...options };
    const providerConfig = await this.selectProvider(request, mergedOptions);
    const provider = exports.providerRegistry.getProvider(providerConfig);
    try {
      yield* provider.streamChatCompletion(request);
    } catch (error) {
      throw error;
    }
  }
  /**
   * Simple text completion (convenience method)
   */
  async ask(message, options) {
    const messages = [];
    if (options?.system) {
      messages.push({ role: "system", content: options.system });
    }
    messages.push({ role: "user", content: message });
    const request = {
      messages,
      ...options?.temperature && { temperature: options.temperature },
      ...options?.maxTokens && { max_tokens: options.maxTokens }
    };
    const response = await this.complete(request, options);
    return response.choices[0]?.message.content || "";
  }
  /**
   * Chat with conversation history
   */
  async chat(messages, options) {
    const request = {
      messages,
      ...options?.temperature && { temperature: options.temperature },
      ...options?.maxTokens && { max_tokens: options.maxTokens },
      ...options?.tools && { tools: options.tools }
    };
    return this.complete(request, options);
  }
  /**
   * Create a conversation instance for stateful chat
   */
  conversation(options) {
    return new Conversation(this, options);
  }
  /**
   * Select optimal provider based on request and constraints
   */
  async selectProvider(request, options) {
    if (options.provider) {
      return options.provider;
    }
    if (this.defaultProvider && !options.constraints) {
      return this.defaultProvider;
    }
    return this.intelligentProviderSelection(request, options.constraints);
  }
  /**
   * Intelligent provider selection based on constraints and request characteristics
   */
  async intelligentProviderSelection(request, constraints) {
    const supportedProviders = exports.providerRegistry.getRegisteredProviders();
    const candidates = [];
    for (const provider of supportedProviders) {
      if (constraints?.excludeProviders?.includes(provider)) {
        continue;
      }
      const config = {
        provider,
        model: this.getDefaultModel(provider),
        apiKey: ""
        // Will be resolved later
      };
      const providerInstance = exports.providerRegistry.getProvider(config);
      const capabilities = providerInstance.getCapabilities();
      if (constraints?.requiredCapabilities) {
        const hasRequired = constraints.requiredCapabilities.every(
          (cap) => capabilities[cap] === true
        );
        if (!hasRequired) continue;
      }
      const estimatedCost = providerInstance.estimateCost(request);
      const estimatedLatency = this.estimateLatency(provider);
      const qualityScore = this.calculateQualityScore(provider, request);
      if (constraints?.maxCost && estimatedCost > constraints.maxCost) {
        continue;
      }
      if (constraints?.maxLatency && estimatedLatency > constraints.maxLatency) {
        continue;
      }
      if (constraints?.qualityThreshold && qualityScore < constraints.qualityThreshold) {
        continue;
      }
      candidates.push({
        provider,
        model: config.model,
        estimatedCost,
        estimatedLatency,
        qualityScore,
        reasoning: this.generateSelectionReasoning(provider, estimatedCost, qualityScore)
      });
    }
    if (candidates.length === 0) {
      throw new exports.BaseSDKError(
        "No providers meet the specified constraints",
        "NO_SUITABLE_PROVIDER",
        { details: { constraints } }
      );
    }
    const bestCandidate = candidates.reduce((best, current) => {
      const bestScore = best.qualityScore / best.estimatedCost;
      const currentScore = current.qualityScore / current.estimatedCost;
      return currentScore > bestScore ? current : best;
    });
    if (constraints?.preferredProviders) {
      const preferredCandidate = candidates.find(
        (c) => constraints.preferredProviders.includes(c.provider)
      );
      if (preferredCandidate) {
        return {
          provider: preferredCandidate.provider,
          model: preferredCandidate.model,
          apiKey: ""
          // Will be resolved later
        };
      }
    }
    return {
      provider: bestCandidate.provider,
      model: bestCandidate.model,
      apiKey: ""
      // Will be resolved later
    };
  }
  /**
   * Execute request with fallback providers
   */
  async executeWithFallback(request, failedProvider, options) {
    const fallbackProviders = this.getFallbackProviders(failedProvider);
    for (const provider of fallbackProviders) {
      try {
        const providerInstance = exports.providerRegistry.getProvider(provider);
        return await providerInstance.chatCompletion(request);
      } catch (error) {
        continue;
      }
    }
    throw new exports.BaseSDKError(
      "All fallback providers failed",
      "ALL_PROVIDERS_FAILED",
      { details: { originalProvider: failedProvider.provider } }
    );
  }
  /**
   * Determine if error should trigger fallback
   */
  shouldFallback(error) {
    if (error.code === "RATE_LIMIT_EXCEEDED") return true;
    if (error.statusCode && error.statusCode >= 500) return true;
    if (error.code === "NETWORK_ERROR") return true;
    return false;
  }
  /**
   * Get fallback providers for a failed provider
   */
  getFallbackProviders(failedProvider) {
    const fallbackMap = {
      "openai": ["claude"],
      "claude": ["openai"],
      "google": ["openai", "claude"],
      "azure": ["openai", "claude"],
      "cohere": ["openai", "claude"],
      "huggingface": ["openai", "claude"]
    };
    const fallbacks = fallbackMap[failedProvider.provider] || ["openai"];
    return fallbacks.map((provider) => ({
      provider,
      model: this.getDefaultModel(provider),
      apiKey: ""
      // Will be resolved later
    }));
  }
  /**
   * Get default model for provider
   */
  getDefaultModel(provider) {
    const defaultModels = {
      "openai": "gpt-4o",
      "claude": "claude-3-5-sonnet-20241022",
      "google": "gemini-pro",
      "azure": "gpt-4",
      "cohere": "command-r-plus",
      "huggingface": "meta-llama/Llama-2-70b-chat-hf"
    };
    return defaultModels[provider] || "gpt-4o";
  }
  /**
   * Estimate latency for provider (placeholder implementation)
   */
  estimateLatency(provider) {
    const latencyMap = {
      "openai": 2e3,
      "claude": 3e3,
      "google": 1500,
      "azure": 2500,
      "cohere": 2e3,
      "huggingface": 4e3
    };
    return latencyMap[provider] || 2e3;
  }
  /**
   * Calculate quality score for provider (placeholder implementation)
   */
  calculateQualityScore(provider, request) {
    const qualityMap = {
      "openai": 0.9,
      "claude": 0.95,
      "google": 0.8,
      "azure": 0.9,
      "cohere": 0.7,
      "huggingface": 0.6
    };
    return qualityMap[provider] || 0.5;
  }
  /**
   * Generate reasoning for provider selection
   */
  generateSelectionReasoning(provider, cost, quality) {
    return `Selected ${provider} for optimal cost/quality ratio (cost: $${cost.toFixed(4)}, quality: ${quality.toFixed(2)})`;
  }
};
var Conversation = class {
  constructor(chat2, options = {}) {
    __publicField(this, "messages", []);
    __publicField(this, "chat");
    __publicField(this, "options");
    this.chat = chat2;
    this.options = options;
    if (options.system) {
      this.messages.push({ role: "system", content: options.system });
    }
  }
  /**
   * Send a message and get response
   */
  async say(message) {
    this.messages.push({ role: "user", content: message });
    const response = await this.chat.chat(this.messages, this.options);
    const assistantMessage = response.choices[0]?.message.content || "";
    this.messages.push({ role: "assistant", content: assistantMessage });
    return assistantMessage;
  }
  /**
   * Get conversation history
   */
  getHistory() {
    return [...this.messages];
  }
  /**
   * Clear conversation history (keeping system message)
   */
  clear() {
    const systemMessage = this.messages.find((m) => m.role === "system");
    this.messages = systemMessage ? [systemMessage] : [];
  }
  /**
   * Get conversation summary
   */
  async summarize() {
    if (this.messages.length < 3) {
      return "Conversation too short to summarize";
    }
    const summaryRequest = [
      { role: "system", content: "Summarize the following conversation concisely." },
      { role: "user", content: JSON.stringify(this.messages) }
    ];
    const response = await this.chat.chat(summaryRequest, { ...this.options, maxTokens: 200 });
    return response.choices[0]?.message.content || "Unable to generate summary";
  }
};
function createChat(options) {
  return new Chat2(options);
}
async function ask(message, options) {
  const chat2 = new Chat2({ provider: options?.provider });
  return chat2.ask(message, options);
}
async function chat(messages, options) {
  const chatInstance = new Chat2({ provider: options?.provider });
  return chatInstance.chat(messages, options);
}

// src/index.ts
init_providers();
init_errors();

// src/types/index.ts
function isSDKError(error) {
  return error && typeof error === "object" && "code" in error && typeof error.code === "string";
}
function isRateLimitError(error) {
  return isSDKError(error) && error.code === "RATE_LIMIT_EXCEEDED";
}
function isAuthenticationError(error) {
  return isSDKError(error) && error.code === "AUTHENTICATION_FAILED";
}
function isValidationError(error) {
  return isSDKError(error) && error.code === "VALIDATION_ERROR";
}

// src/index.ts
init_base();
var VERSION = "0.1.0";
var DEFAULT_CONFIG = {
  enableUsageTracking: true,
  enableRetries: true,
  maxRetries: 3,
  retryDelay: 1e3,
  timeout: 3e4,
  debug: false
};
var _SDK = class _SDK {
  constructor(config) {
    __publicField(this, "config");
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  /**
   * Initialize SDK singleton
   */
  static init(config) {
    if (_SDK.instance) {
      throw new Error("SDK already initialized. Use SDK.getInstance() to access the initialized instance.");
    }
    _SDK.instance = new _SDK(config);
    return _SDK.instance;
  }
  /**
   * Get SDK singleton instance
   */
  static getInstance() {
    if (!_SDK.instance) {
      throw new Error("SDK not initialized. Call SDK.init(config) first.");
    }
    return _SDK.instance;
  }
  /**
   * Create Chat instance with SDK config
   */
  createChat(options = {}) {
    return new Chat({
      provider: this.config.defaultProvider ? {
        provider: this.config.defaultProvider,
        model: this.config.defaultModel || "gpt-4o",
        apiKey: this.config.apiKey,
        timeout: this.config.timeout,
        maxRetries: this.config.maxRetries
      } : void 0,
      enableAutoRetry: this.config.enableRetries,
      trackUsage: this.config.enableUsageTracking,
      ...options
    });
  }
  /**
   * Get SDK configuration
   */
  getConfig() {
    const { apiKey, ...safeConfig } = this.config;
    return safeConfig;
  }
  /**
   * Update SDK configuration
   */
  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
  }
  /**
   * Health check all providers
   */
  async healthCheck() {
    const providerHealth = await (await Promise.resolve().then(() => (init_providers(), providers_exports))).checkProviderHealth();
    return {
      sdk: {
        version: VERSION,
        config: this.getConfig()
      },
      providers: providerHealth,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Reset SDK instance (for testing)
   */
  static reset() {
    _SDK.instance = null;
  }
};
__publicField(_SDK, "instance", null);
var SDK = _SDK;
function initSDK(config) {
  return SDK.init(config);
}
var defaultExports = {
  SDK,
  initSDK,
  VERSION,
  DEFAULT_CONFIG
};
var src_default = defaultExports;

exports.Chat = Chat2;
exports.Conversation = Conversation;
exports.DEFAULT_CONFIG = DEFAULT_CONFIG;
exports.SDK = SDK;
exports.VERSION = VERSION;
exports.ask = ask;
exports.chat = chat;
exports.checkProviderHealth = checkProviderHealth;
exports.claude = claude;
exports.createChat = createChat;
exports.default = src_default;
exports.getSupportedProviders = getSupportedProviders;
exports.initSDK = initSDK;
exports.isAuthenticationError = isAuthenticationError;
exports.isProviderSupported = isProviderSupported;
exports.isRateLimitError = isRateLimitError;
exports.isSDKError = isSDKError;
exports.isValidationError = isValidationError;
exports.openai = openai;
exports.sanitizeErrorForLogging = sanitizeErrorForLogging;
exports.withTimeout = withTimeout;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map