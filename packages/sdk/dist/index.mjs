var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/utils/errors.ts
var errors_exports = {};
__export(errors_exports, {
  BaseSDKError: () => BaseSDKError,
  CircuitBreaker: () => CircuitBreaker,
  CircuitState: () => CircuitState,
  DEFAULT_RETRY_CONFIG: () => DEFAULT_RETRY_CONFIG,
  ErrorFactory: () => ErrorFactory,
  RetryHandler: () => RetryHandler,
  SDKAuthenticationError: () => SDKAuthenticationError,
  SDKRateLimitError: () => SDKRateLimitError,
  SDKValidationError: () => SDKValidationError,
  sanitizeErrorForLogging: () => sanitizeErrorForLogging,
  withTimeout: () => withTimeout
});
function withTimeout(promise, timeoutMs, context) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new BaseSDKError(
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
var BaseSDKError, SDKRateLimitError, SDKAuthenticationError, SDKValidationError, ErrorFactory, DEFAULT_RETRY_CONFIG, RetryHandler, CircuitState, CircuitBreaker;
var init_errors = __esm({
  "src/utils/errors.ts"() {
    BaseSDKError = class extends Error {
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
    SDKRateLimitError = class extends BaseSDKError {
      constructor(message, limitType, options) {
        super(message, "RATE_LIMIT_EXCEEDED", options);
        __publicField(this, "code", "RATE_LIMIT_EXCEEDED");
        __publicField(this, "retryAfter");
        __publicField(this, "limitType");
        this.limitType = limitType;
        this.retryAfter = options?.retryAfter;
      }
    };
    SDKAuthenticationError = class extends BaseSDKError {
      constructor(message, provider, options) {
        super(message, "AUTHENTICATION_FAILED", { ...options, provider });
        __publicField(this, "code", "AUTHENTICATION_FAILED");
        __publicField(this, "provider");
        this.provider = provider;
      }
    };
    SDKValidationError = class extends BaseSDKError {
      constructor(message, field, value, options) {
        super(message, "VALIDATION_ERROR", options);
        __publicField(this, "code", "VALIDATION_ERROR");
        __publicField(this, "field");
        __publicField(this, "value");
        this.field = field;
        this.value = value;
      }
    };
    ErrorFactory = class {
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
          return new SDKRateLimitError(
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
          return new SDKAuthenticationError(
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
          return new SDKValidationError(
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
        return new BaseSDKError(
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
          return new SDKRateLimitError(
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
          return new SDKAuthenticationError(
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
          return new SDKValidationError(
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
        return new BaseSDKError(
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
        return new BaseSDKError(
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
    RetryHandler = class {
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
            lastError = error;
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
        if (error && (error.code === "AUTHENTICATION_FAILED" || error.code === "VALIDATION_ERROR")) {
          return false;
        }
        if (error && error.code === "RATE_LIMIT_EXCEEDED") {
          return true;
        }
        const status = error?.status || error?.statusCode;
        if (status && status >= 500) {
          return true;
        }
        if (error && this.config.retryableErrors.includes(error.code)) {
          return true;
        }
        return false;
      }
      /**
       * Calculate exponential backoff delay with jitter
       */
      calculateDelay(attempt, error) {
        if (error instanceof SDKRateLimitError && error.retryAfter) {
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
        if (error instanceof BaseSDKError) {
          return error;
        }
        if (error.code === "ECONNRESET" || error.code === "ENOTFOUND" || error.code === "ETIMEDOUT") {
          return new BaseSDKError(
            `Network error: ${error.message}`,
            "NETWORK_ERROR",
            { provider, cause: error }
          );
        }
        return new BaseSDKError(
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
    CircuitState = /* @__PURE__ */ ((CircuitState2) => {
      CircuitState2["CLOSED"] = "closed";
      CircuitState2["OPEN"] = "open";
      CircuitState2["HALF_OPEN"] = "half_open";
      return CircuitState2;
    })(CircuitState || {});
    CircuitBreaker = class {
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
            throw new BaseSDKError(
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

// src/types/index.ts
var types_exports = {};
__export(types_exports, {
  DEFAULT_MODELS: () => DEFAULT_MODELS,
  PROVIDER_CAPABILITIES: () => PROVIDER_CAPABILITIES,
  SUPPORTED_PROVIDERS: () => SUPPORTED_PROVIDERS,
  isAuthenticationError: () => isAuthenticationError,
  isRateLimitError: () => isRateLimitError,
  isSDKError: () => isSDKError,
  isValidationError: () => isValidationError
});
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
var SUPPORTED_PROVIDERS, DEFAULT_MODELS, PROVIDER_CAPABILITIES;
var init_types = __esm({
  "src/types/index.ts"() {
    SUPPORTED_PROVIDERS = [
      "openai",
      "anthropic",
      "claude",
      "google",
      "azure",
      "cohere",
      "huggingface"
    ];
    DEFAULT_MODELS = {
      openai: "gpt-4o",
      anthropic: "claude-3-5-sonnet-20241022",
      claude: "claude-3-5-sonnet-20241022",
      google: "gemini-pro",
      azure: "gpt-4",
      cohere: "command-r-plus",
      huggingface: "meta-llama/Llama-2-70b-chat-hf"
    };
    PROVIDER_CAPABILITIES = {
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
        maxContextTokens: 128e3,
        supportedModels: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"]
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
        maxContextTokens: 2e5,
        supportedModels: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"]
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
        maxContextTokens: 2e5,
        supportedModels: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"]
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
        maxContextTokens: 1e6,
        supportedModels: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro", "gemini-pro-vision"]
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
        maxContextTokens: 128e3,
        supportedModels: ["gpt-4", "gpt-3.5-turbo"]
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
        maxContextTokens: 128e3,
        supportedModels: ["command-r-plus", "command-r"]
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
        supportedModels: ["meta-llama/Llama-2-70b-chat-hf"]
      }
    };
  }
});

// src/providers/base.ts
var BaseProvider, ProviderRegistry, providerRegistry;
var init_base = __esm({
  "src/providers/base.ts"() {
    init_errors();
    BaseProvider = class {
      constructor(provider, config) {
        __publicField(this, "provider");
        __publicField(this, "config");
        __publicField(this, "retryHandler");
        __publicField(this, "circuitBreaker");
        this.provider = provider;
        this.config = config;
        this.retryHandler = new RetryHandler({
          maxRetries: config.maxRetries || 3,
          baseDelay: config.retryDelay || 1e3
        });
        this.circuitBreaker = new CircuitBreaker();
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
            provider: this.provider === "anthropic" ? "claude" : this.provider,
            healthy: true,
            latency: Date.now() - startTime,
            capabilities: this.getCapabilities(),
            circuitBreakerStatus: this.circuitBreaker.getStatus()
          };
        } catch (error) {
          return {
            provider: this.provider === "anthropic" ? "claude" : this.provider,
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
          const existing = this.instances.get(key);
          if (config.apiKey) {
            const factory2 = this.factories.get(config.provider);
            if (!factory2) {
              throw new Error(`No factory registered for provider: ${config.provider}`);
            }
            const instance2 = factory2.create(config);
            this.instances.set(key, instance2);
            return instance2;
          }
          return existing;
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
            const { DEFAULT_MODELS: DEFAULT_MODELS2 } = await Promise.resolve().then(() => (init_types(), types_exports));
            const defaultModel = DEFAULT_MODELS2[provider] || "test";
            const testInstance = factory.create({
              provider,
              model: defaultModel,
              apiKey: "test",
              timeout: 3e3
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
    providerRegistry = new ProviderRegistry();
  }
});

// src/chat/index.ts
var chat_exports = {};
__export(chat_exports, {
  Chat: () => Chat,
  Conversation: () => Conversation,
  ask: () => ask,
  chat: () => chat,
  createChat: () => createChat
});
function createChat(options) {
  return new Chat(options);
}
async function ask(message, options) {
  const chat2 = new Chat({ provider: options?.provider });
  return chat2.ask(message, options);
}
async function chat(messages, options) {
  const chatInstance = new Chat({ provider: options?.provider });
  return chatInstance.chat(messages, options);
}
var Chat, Conversation;
var init_chat = __esm({
  "src/chat/index.ts"() {
    init_base();
    init_errors();
    Chat = class {
      constructor(options = {}) {
        __publicField(this, "defaultProvider");
        __publicField(this, "options");
        this.options = {
          enableAutoRetry: true,
          enableFallback: false,
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
        let providerConfig = await this.selectProvider(request, mergedOptions);
        providerConfig = await this.withResolvedApiKey(providerConfig, mergedOptions);
        const requestWithModel = {
          ...request,
          model: request.model || providerConfig.model
        };
        let provider;
        try {
          provider = providerRegistry.getProvider(providerConfig);
        } catch (e) {
          const message = String(e?.message || "");
          if (message.includes("API key is required") || message.includes("Invalid API key")) {
            const { SDKAuthenticationError: SDKAuthenticationError2 } = await Promise.resolve().then(() => (init_errors(), errors_exports));
            throw new SDKAuthenticationError2("Invalid API key", providerConfig.provider, { statusCode: 401 });
          }
          throw e;
        }
        try {
          return await provider.chatCompletion(requestWithModel);
        } catch (error) {
          if (mergedOptions.enableFallback && this.shouldFallback(error)) {
            return this.executeWithFallback(requestWithModel, providerConfig, mergedOptions);
          }
          throw error;
        }
      }
      /**
       * Stream a chat conversation
       */
      async *stream(request, options) {
        const mergedOptions = { ...this.options, ...options };
        let providerConfig = await this.selectProvider(request, mergedOptions);
        providerConfig = await this.withResolvedApiKey(providerConfig, mergedOptions);
        const requestWithModel = {
          ...request,
          model: request.model || providerConfig.model
        };
        let provider;
        try {
          provider = providerRegistry.getProvider(providerConfig);
        } catch (e) {
          const message = String(e?.message || "");
          if (message.includes("API key is required") || message.includes("Invalid API key")) {
            const { SDKAuthenticationError: SDKAuthenticationError2 } = await Promise.resolve().then(() => (init_errors(), errors_exports));
            throw new SDKAuthenticationError2("Invalid API key", providerConfig.provider, { statusCode: 401 });
          }
          throw e;
        }
        try {
          yield* provider.streamChatCompletion(requestWithModel);
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
        const content = response.choices[0]?.message.content || "";
        return typeof content === "string" ? content : JSON.stringify(content);
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
        const supportedProviders = providerRegistry.getRegisteredProviders();
        const candidates = [];
        for (const provider of supportedProviders) {
          if (constraints?.excludeProviders?.includes(provider)) {
            continue;
          }
          const config = {
            provider,
            model: this.getDefaultModel(provider),
            // Use a placeholder key so providers can be instantiated for capability/cost evaluation
            apiKey: "test"
          };
          const providerInstance = providerRegistry.getProvider(config);
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
          const isPreferred = constraints?.preferredProviders?.includes(provider) ?? false;
          if (!isPreferred) {
            if (constraints?.maxCost && estimatedCost > constraints.maxCost) {
              continue;
            }
            if (constraints?.maxLatency && estimatedLatency > constraints.maxLatency) {
              continue;
            }
            if (constraints?.qualityThreshold && qualityScore < constraints.qualityThreshold) {
              continue;
            }
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
          throw new BaseSDKError(
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
          const preferredCandidate = candidates.find((c) => constraints.preferredProviders.includes(c.provider));
          if (preferredCandidate) {
            return { provider: preferredCandidate.provider, model: preferredCandidate.model, apiKey: "" };
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
            const resolved = await this.withResolvedApiKey(provider, options);
            const providerInstance = providerRegistry.getProvider(resolved);
            const requestWithModel = {
              ...request,
              model: request.model || resolved.model
            };
            return await providerInstance.chatCompletion(requestWithModel);
          } catch (error) {
            continue;
          }
        }
        throw new BaseSDKError(
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
          apiKey: "test"
          // placeholder; will be resolved before use
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
      /**
       * Resolve API key for a provider using provided options
       */
      async withResolvedApiKey(config, options) {
        if (config.apiKey && config.apiKey.trim().length > 0) return config;
        const fromMap = options.apiKeys?.[config.provider];
        if (fromMap && fromMap.trim().length > 0) {
          return { ...config, apiKey: fromMap };
        }
        if (options.resolveApiKey) {
          const resolved = await options.resolveApiKey(config.provider);
          if (resolved && resolved.trim().length > 0) {
            return { ...config, apiKey: resolved };
          }
        }
        return config;
      }
    };
    Conversation = class {
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
  }
});

// src/utils/http.ts
function createHTTPClient(config) {
  return new HTTPClient(config);
}
var HTTPError, HTTPTimeoutError, HTTPClient;
var init_http = __esm({
  "src/utils/http.ts"() {
    HTTPError = class extends Error {
      constructor(message, status, statusText, data) {
        super(message);
        this.status = status;
        this.statusText = statusText;
        this.data = data;
        this.name = "HTTPError";
      }
    };
    HTTPTimeoutError = class extends Error {
      constructor(timeout) {
        super(`Request timeout after ${timeout}ms`);
        this.name = "HTTPTimeoutError";
      }
    };
    HTTPClient = class {
      constructor(config = {}) {
        __publicField(this, "config");
        __publicField(this, "lastResponse");
        this.config = {
          timeout: 3e4,
          maxRetries: 3,
          retryDelay: 1e3,
          ...config
        };
      }
      /**
       * Make HTTP request with timeout and retry logic
       */
      async request(request) {
        const url = this.buildURL(request.url);
        const timeout = request.timeout || this.config.timeout;
        return this.executeWithRetry(async () => {
          const controller = new AbortController();
          let didTimeout = false;
          const timeoutId = setTimeout(() => {
            didTimeout = true;
            controller.abort();
          }, timeout);
          try {
            let response = await fetch(url, {
              method: request.method || "GET",
              headers: this.buildHeaders(request.headers),
              body: this.buildBody(request.body),
              signal: request.signal || controller.signal
            });
            clearTimeout(timeoutId);
            if (!response && this.lastResponse) {
              response = this.lastResponse;
            }
            if (response) {
              this.lastResponse = response;
            }
            if (!response) {
              throw new Error("Network error");
            }
            if (!response.ok) {
              const data2 = await this.parseResponse(response);
              throw new HTTPError(
                `HTTP ${response.status}: ${response.statusText}`,
                response.status,
                response.statusText,
                data2
              );
            }
            const data = await this.parseResponse(response);
            return {
              data,
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              ok: response.ok
            };
          } catch (error) {
            clearTimeout(timeoutId);
            if (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError" || didTimeout) {
              throw new HTTPTimeoutError(timeout);
            }
            if (error instanceof HTTPError) {
              throw error;
            }
            if (error instanceof Error) {
              if (error.message === "Network error" || error.message.includes("Failed to fetch")) {
                throw new Error("Network error");
              }
              throw error;
            }
            throw new Error(`Unknown error: ${error}`);
          }
        });
      }
      /**
       * GET request
       */
      async get(url, config) {
        return this.request({ ...config, url, method: "GET" });
      }
      /**
       * POST request
       */
      async post(url, body, config) {
        return this.request({ ...config, url, method: "POST", body });
      }
      /**
       * PUT request
       */
      async put(url, body, config) {
        return this.request({ ...config, url, method: "PUT", body });
      }
      /**
       * DELETE request
       */
      async delete(url, config) {
        return this.request({ ...config, url, method: "DELETE" });
      }
      /**
       * Streaming request for SSE
       */
      async *stream(request) {
        const url = this.buildURL(request.url);
        const response = await fetch(url, {
          method: request.method || "POST",
          headers: this.buildHeaders(request.headers),
          body: this.buildBody(request.body),
          signal: request.signal
        });
        if (!response.ok) {
          const data = await this.parseResponse(response);
          throw new HTTPError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            response.statusText,
            data
          );
        }
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Response body is not readable");
        }
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            yield chunk;
          }
        } finally {
          reader.releaseLock();
        }
      }
      buildURL(url) {
        if (url.startsWith("http://") || url.startsWith("https://")) {
          return url;
        }
        const baseURL = this.config.baseURL || "";
        return `${baseURL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
      }
      buildHeaders(requestHeaders) {
        return {
          "Content-Type": "application/json",
          ...this.config.headers,
          ...requestHeaders
        };
      }
      buildBody(body) {
        if (!body) return void 0;
        if (typeof body === "string") {
          return body;
        }
        return JSON.stringify(body);
      }
      async parseResponse(response) {
        const headersLike = response.headers;
        let contentType = "";
        try {
          if (headersLike && typeof headersLike.get === "function") {
            contentType = headersLike.get("content-type") || "";
          } else if (headersLike && typeof headersLike === "object") {
            const direct = headersLike["content-type"] || headersLike["Content-Type"];
            contentType = typeof direct === "string" ? direct : "";
          }
        } catch {
          contentType = "";
        }
        if (contentType.includes("application/json") && typeof response.json === "function") {
          return response.json();
        }
        if (contentType.includes("text/") && typeof response.text === "function") {
          return response.text();
        }
        if (typeof response.arrayBuffer === "function") {
          return response.arrayBuffer();
        }
        if (typeof response.json === "function") {
          try {
            return response.json();
          } catch {
          }
        }
        if (typeof response.text === "function") {
          return response.text();
        }
        return void 0;
      }
      async executeWithRetry(fn) {
        const maxRetries = this.config.maxRetries || 0;
        const retryDelay = this.config.retryDelay || 1e3;
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            return await fn();
          } catch (error) {
            lastError = error;
            if (error instanceof HTTPError && error.status < 500) {
              throw error;
            }
            if (error instanceof HTTPTimeoutError) {
              throw error;
            }
            if (attempt === maxRetries) {
              throw error;
            }
            await this.delay(retryDelay * Math.pow(2, attempt));
          }
        }
        throw lastError;
      }
      delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    };
    new HTTPClient();
  }
});

// src/utils/validation.ts
function parse(validator, value) {
  const result = validator.validate(value);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}
var ValidationError, BaseValidator, StringValidator, NumberValidator, BooleanValidator, ArrayValidator, ObjectValidator, UnionValidator, OptionalValidator, NullableValidator, DefaultValidator, v;
var init_validation = __esm({
  "src/utils/validation.ts"() {
    ValidationError = class extends Error {
      constructor(message, path = [], received) {
        super(message);
        this.path = path;
        this.received = received;
        this.name = "ValidationError";
      }
    };
    BaseValidator = class {
      optional() {
        return new OptionalValidator(this);
      }
      nullable() {
        return new NullableValidator(this);
      }
      default(defaultValue) {
        return new DefaultValidator(this, defaultValue);
      }
    };
    StringValidator = class _StringValidator extends BaseValidator {
      constructor(constraints = {}) {
        super();
        this.constraints = constraints;
      }
      validate(value, path = []) {
        if (typeof value !== "string") {
          return {
            success: false,
            error: new ValidationError(
              `Expected string, received ${typeof value}`,
              path,
              value
            )
          };
        }
        if (this.constraints.minLength !== void 0 && value.length < this.constraints.minLength) {
          return {
            success: false,
            error: new ValidationError(
              `String must be at least ${this.constraints.minLength} characters`,
              path,
              value
            )
          };
        }
        if (this.constraints.maxLength !== void 0 && value.length > this.constraints.maxLength) {
          return {
            success: false,
            error: new ValidationError(
              `String must be at most ${this.constraints.maxLength} characters`,
              path,
              value
            )
          };
        }
        if (this.constraints.pattern && !this.constraints.pattern.test(value)) {
          return {
            success: false,
            error: new ValidationError(
              `String does not match required pattern`,
              path,
              value
            )
          };
        }
        if (this.constraints.enum && !this.constraints.enum.includes(value)) {
          return {
            success: false,
            error: new ValidationError(
              `String must be one of: ${this.constraints.enum.join(", ")}`,
              path,
              value
            )
          };
        }
        return { success: true, data: value };
      }
      min(length) {
        return new _StringValidator({ ...this.constraints, minLength: length });
      }
      max(length) {
        return new _StringValidator({ ...this.constraints, maxLength: length });
      }
      regex(pattern) {
        return new _StringValidator({ ...this.constraints, pattern });
      }
      enum(...values) {
        return new _StringValidator({ ...this.constraints, enum: values });
      }
    };
    NumberValidator = class _NumberValidator extends BaseValidator {
      constructor(constraints = {}) {
        super();
        this.constraints = constraints;
      }
      validate(value, path = []) {
        if (typeof value !== "number" || isNaN(value)) {
          return {
            success: false,
            error: new ValidationError(
              `Expected number, received ${typeof value}`,
              path,
              value
            )
          };
        }
        if (this.constraints.integer && !Number.isInteger(value)) {
          return {
            success: false,
            error: new ValidationError(
              `Expected integer, received ${value}`,
              path,
              value
            )
          };
        }
        if (this.constraints.min !== void 0 && value < this.constraints.min) {
          return {
            success: false,
            error: new ValidationError(
              `Number must be at least ${this.constraints.min}`,
              path,
              value
            )
          };
        }
        if (this.constraints.max !== void 0 && value > this.constraints.max) {
          return {
            success: false,
            error: new ValidationError(
              `Number must be at most ${this.constraints.max}`,
              path,
              value
            )
          };
        }
        return { success: true, data: value };
      }
      min(value) {
        return new _NumberValidator({ ...this.constraints, min: value });
      }
      max(value) {
        return new _NumberValidator({ ...this.constraints, max: value });
      }
      int() {
        return new _NumberValidator({ ...this.constraints, integer: true });
      }
    };
    BooleanValidator = class extends BaseValidator {
      validate(value, path = []) {
        if (typeof value !== "boolean") {
          return {
            success: false,
            error: new ValidationError(
              `Expected boolean, received ${typeof value}`,
              path,
              value
            )
          };
        }
        return { success: true, data: value };
      }
    };
    ArrayValidator = class _ArrayValidator extends BaseValidator {
      constructor(itemValidator, constraints = {}) {
        super();
        this.itemValidator = itemValidator;
        this.constraints = constraints;
      }
      validate(value, path = []) {
        if (!Array.isArray(value)) {
          return {
            success: false,
            error: new ValidationError(
              `Expected array, received ${typeof value}`,
              path,
              value
            )
          };
        }
        if (this.constraints.minLength !== void 0 && value.length < this.constraints.minLength) {
          return {
            success: false,
            error: new ValidationError(
              `Array must have at least ${this.constraints.minLength} items`,
              path,
              value
            )
          };
        }
        if (this.constraints.maxLength !== void 0 && value.length > this.constraints.maxLength) {
          return {
            success: false,
            error: new ValidationError(
              `Array must have at most ${this.constraints.maxLength} items`,
              path,
              value
            )
          };
        }
        const validatedItems = [];
        for (let i = 0; i < value.length; i++) {
          const itemResult = this.itemValidator.validate(value[i], [...path, i.toString()]);
          if (!itemResult.success) {
            return itemResult;
          }
          validatedItems.push(itemResult.data);
        }
        return { success: true, data: validatedItems };
      }
      min(length) {
        return new _ArrayValidator(this.itemValidator, { ...this.constraints, minLength: length });
      }
      max(length) {
        return new _ArrayValidator(this.itemValidator, { ...this.constraints, maxLength: length });
      }
    };
    ObjectValidator = class extends BaseValidator {
      constructor(shape) {
        super();
        this.shape = shape;
      }
      validate(value, path = []) {
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
          return {
            success: false,
            error: new ValidationError(
              `Expected object, received ${typeof value}`,
              path,
              value
            )
          };
        }
        const result = {};
        const inputObj = value;
        for (const [key, validator] of Object.entries(this.shape)) {
          const fieldResult = validator.validate(inputObj[key], [...path, key]);
          if (!fieldResult.success) {
            return fieldResult;
          }
          result[key] = fieldResult.data;
        }
        return { success: true, data: result };
      }
    };
    UnionValidator = class extends BaseValidator {
      constructor(validators) {
        super();
        this.validators = validators;
      }
      validate(value, path = []) {
        const errors = [];
        for (const validator of this.validators) {
          const result = validator.validate(value, path);
          if (result.success) {
            return result;
          }
          errors.push(result.error);
        }
        return {
          success: false,
          error: new ValidationError(
            `Value does not match any of the union types`,
            path,
            value
          )
        };
      }
    };
    OptionalValidator = class extends BaseValidator {
      constructor(innerValidator) {
        super();
        this.innerValidator = innerValidator;
      }
      validate(value, path = []) {
        if (value === void 0) {
          return { success: true, data: void 0 };
        }
        return this.innerValidator.validate(value, path);
      }
    };
    NullableValidator = class extends BaseValidator {
      constructor(innerValidator) {
        super();
        this.innerValidator = innerValidator;
      }
      validate(value, path = []) {
        if (value === null) {
          return { success: true, data: null };
        }
        return this.innerValidator.validate(value, path);
      }
    };
    DefaultValidator = class extends BaseValidator {
      constructor(innerValidator, defaultValue) {
        super();
        this.innerValidator = innerValidator;
        this.defaultValue = defaultValue;
      }
      validate(value, path = []) {
        if (value === void 0) {
          return { success: true, data: this.defaultValue };
        }
        return this.innerValidator.validate(value, path);
      }
    };
    v = {
      string: () => new StringValidator(),
      number: () => new NumberValidator(),
      boolean: () => new BooleanValidator(),
      array: (itemValidator) => new ArrayValidator(itemValidator),
      object: (shape) => new ObjectValidator(shape),
      union: (...validators) => new UnionValidator(validators),
      literal: (value) => ({
        validate: (input, path = []) => {
          if (input === value) {
            return { success: true, data: value };
          }
          return {
            success: false,
            error: new ValidationError(
              `Expected literal value ${value}, received ${input}`,
              path,
              input
            )
          };
        },
        optional: () => v.union(v.literal(value), v.undefined()),
        nullable: () => v.union(v.literal(value), v.null()),
        default: (defaultValue) => new DefaultValidator(v.literal(value), defaultValue)
      }),
      undefined: () => ({
        validate: (input, path = []) => {
          if (input === void 0) {
            return { success: true, data: void 0 };
          }
          return {
            success: false,
            error: new ValidationError(
              `Expected undefined, received ${typeof input}`,
              path,
              input
            )
          };
        },
        optional: () => v.undefined(),
        nullable: () => v.union(v.undefined(), v.null()),
        default: (defaultValue) => new DefaultValidator(v.undefined(), defaultValue)
      }),
      null: () => ({
        validate: (input, path = []) => {
          if (input === null) {
            return { success: true, data: null };
          }
          return {
            success: false,
            error: new ValidationError(
              `Expected null, received ${typeof input}`,
              path,
              input
            )
          };
        },
        optional: () => v.union(v.null(), v.undefined()),
        nullable: () => v.null(),
        default: (defaultValue) => new DefaultValidator(v.null(), defaultValue)
      }),
      any: () => ({
        validate: (input) => {
          return { success: true, data: input };
        },
        optional: () => v.any(),
        nullable: () => v.any(),
        default: (defaultValue) => new DefaultValidator(v.any(), defaultValue)
      })
    };
  }
});

// src/providers/openai.ts
function createOpenAIProvider(config) {
  return new OpenAIProvider({ ...config, provider: "openai" });
}
var OPENAI_PRICING, openAIMessageSchema, openAIRequestSchema, OpenAIProvider, openAIFactory;
var init_openai = __esm({
  "src/providers/openai.ts"() {
    init_base();
    init_http();
    init_errors();
    init_validation();
    OPENAI_PRICING = {
      "gpt-4o": { input: 25e-4, output: 0.01 },
      "gpt-4o-mini": { input: 15e-5, output: 6e-4 },
      "gpt-4-turbo": { input: 0.01, output: 0.03 },
      "gpt-4": { input: 0.03, output: 0.06 },
      "gpt-3.5-turbo": { input: 5e-4, output: 15e-4 },
      "gpt-3.5-turbo-instruct": { input: 15e-4, output: 2e-3 }
    };
    openAIMessageSchema = v.object({
      role: v.string().enum("system", "user", "assistant", "function", "tool"),
      content: v.union(v.string(), v.null()),
      name: v.string().optional(),
      function_call: v.object({
        name: v.string(),
        arguments: v.string()
      }).optional(),
      tool_calls: v.array(v.object({
        id: v.string(),
        type: v.literal("function"),
        function: v.object({
          name: v.string(),
          arguments: v.string()
        })
      })).optional(),
      tool_call_id: v.string().optional()
    });
    openAIRequestSchema = v.object({
      model: v.string(),
      messages: v.array(openAIMessageSchema),
      max_tokens: v.number().int().min(1).optional(),
      temperature: v.number().min(0).max(2).optional(),
      top_p: v.number().min(0).max(1).optional(),
      n: v.number().int().min(1).max(10).default(1),
      stream: v.boolean().default(false),
      stop: v.union(v.string(), v.array(v.string())).optional(),
      presence_penalty: v.number().min(-2).max(2).optional(),
      frequency_penalty: v.number().min(-2).max(2).optional(),
      logit_bias: v.object({}).optional(),
      user: v.string().optional(),
      functions: v.array(v.object({
        name: v.string(),
        description: v.string().optional(),
        parameters: v.object({}).optional()
      })).optional(),
      function_call: v.union(
        v.literal("none"),
        v.literal("auto"),
        v.object({ name: v.string() })
      ).optional(),
      tools: v.array(v.object({
        type: v.literal("function"),
        function: v.object({
          name: v.string(),
          description: v.string().optional(),
          parameters: v.object({}).optional()
        })
      })).optional(),
      tool_choice: v.union(
        v.literal("none"),
        v.literal("auto"),
        v.object({
          type: v.literal("function"),
          function: v.object({ name: v.string() })
        })
      ).optional(),
      response_format: v.object({
        type: v.string().enum("text", "json_object")
      }).optional(),
      seed: v.number().int().optional()
    });
    OpenAIProvider = class extends BaseProvider {
      constructor(config) {
        super("openai", config);
        __publicField(this, "client");
        __publicField(this, "apiKey");
        if (!config.apiKey || !this.validateApiKey(config.apiKey)) {
          throw new Error("OpenAI API key is required");
        }
        this.apiKey = config.apiKey;
        this.client = createHTTPClient({
          baseURL: config.baseURL || "https://api.openai.com/v1",
          timeout: config.timeout || 3e4,
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "OpenAI-Beta": "assistants=v2"
          }
        });
      }
      getCapabilities() {
        const caps = {
          chatCompletion: true,
          streamingCompletion: true,
          functionCalling: true,
          imageGeneration: true,
          imageAnalysis: true,
          jsonMode: true,
          systemMessages: true,
          toolUse: true,
          multipleMessages: true,
          maxContextTokens: this.getContextLimit(),
          supportedModels: this.getAvailableModels()
        };
        try {
          Object.defineProperty(caps, "chat", { value: true, enumerable: false });
          Object.defineProperty(caps, "streaming", { value: true, enumerable: false });
          Object.defineProperty(caps, "tools", { value: true, enumerable: false });
          Object.defineProperty(caps, "images", { value: true, enumerable: false });
          Object.defineProperty(caps, "vision", { value: true, enumerable: false });
        } catch {
        }
        return caps;
      }
      validateModel(model) {
        return this.getAvailableModels().includes(model);
      }
      getAvailableModels() {
        return [
          "gpt-4o",
          "gpt-4o-mini",
          "gpt-4-turbo",
          "gpt-4-turbo-preview",
          "gpt-4",
          "gpt-3.5-turbo",
          "gpt-3.5-turbo-instruct"
        ];
      }
      estimateCost(request) {
        let model = request.model || this.config.model;
        let pricing = OPENAI_PRICING[model];
        if (!pricing) {
          model = "gpt-4o";
          pricing = OPENAI_PRICING[model];
        }
        const inputText = request.messages.map((m) => m.content).join(" ");
        const estimatedInputTokens = Math.ceil(inputText.length / 4);
        const estimatedOutputTokens = request.max_tokens || 1e3;
        return estimatedInputTokens * pricing.input / 1e3 + estimatedOutputTokens * pricing.output / 1e3;
      }
      async chatCompletion(request) {
        const requestId = this.generateRequestId();
        const startTime = Date.now();
        try {
          const openAIRequest = this.transformRequest(request);
          const response = await this.executeWithRetry(
            () => this.client.post("/chat/completions", openAIRequest),
            { requestId, operation: "chat_completion" }
          );
          return this.transformResponse(
            response.data,
            request,
            this.createRequestMetrics(requestId, request.model, startTime)
          );
        } catch (error) {
          throw this.handleError(error, requestId);
        }
      }
      async *streamChatCompletion(request) {
        const requestId = this.generateRequestId();
        try {
          const openAIRequest = this.transformRequest({ ...request, stream: true });
          const stream = this.client.stream({
            url: "/chat/completions",
            method: "POST",
            body: openAIRequest
          });
          for await (const chunk of stream) {
            const lines = chunk.split("\n").filter((line) => line.trim());
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  const transformedChunk = this.transformStreamChunk(parsed, request);
                  if (transformedChunk) {
                    yield transformedChunk;
                  }
                } catch (parseError) {
                  continue;
                }
              }
            }
          }
        } catch (error) {
          throw this.handleError(error, requestId);
        }
      }
      transformResponse(response, request, metrics) {
        const usage = {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens,
          estimated_cost: this.calculateActualCost(response.usage, request.model)
        };
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
              function_call: choice.message.function_call,
              tool_calls: choice.message.tool_calls
            },
            finish_reason: choice.finish_reason
          })),
          usage,
          system_fingerprint: response.system_fingerprint
        };
      }
      transformStreamChunk(chunk, request) {
        if (!chunk.choices || chunk.choices.length === 0) {
          return null;
        }
        const choice = chunk.choices[0];
        return {
          id: chunk.id,
          object: "chat.completion.chunk",
          created: chunk.created,
          model: chunk.model,
          provider: "openai",
          choices: [{
            index: choice.index,
            delta: {
              role: choice.delta.role,
              content: choice.delta.content,
              function_call: choice.delta.function_call,
              tool_calls: choice.delta.tool_calls
            },
            finish_reason: choice.finish_reason
          }],
          usage: chunk.usage ? {
            prompt_tokens: chunk.usage.prompt_tokens,
            completion_tokens: chunk.usage.completion_tokens,
            total_tokens: chunk.usage.total_tokens,
            estimated_cost: chunk.usage ? this.calculateActualCost(chunk.usage, request.model) : 0
          } : void 0
        };
      }
      validateApiKey(apiKey) {
        if (apiKey === "test" || apiKey === "test-key") return true;
        return /^sk-[a-zA-Z0-9\-]{8,}$/.test(apiKey) || /^sk-proj-[a-zA-Z0-9\-]{8,}$/.test(apiKey);
      }
      getAuthHeader(apiKey) {
        return `Bearer ${apiKey}`;
      }
      async testConnection() {
        try {
          await this.client.get("/models");
        } catch (error) {
          if (error instanceof HTTPError && error.status === 401) {
            throw new Error("Invalid OpenAI API key");
          }
          throw error;
        }
      }
      transformRequest(request) {
        try {
          const openAIRequest = {
            model: request.model,
            messages: request.messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
              name: msg.name,
              function_call: msg.function_call,
              tool_calls: msg.tool_calls,
              tool_call_id: msg.tool_call_id
            })),
            max_tokens: request.max_tokens,
            temperature: request.temperature,
            top_p: request.top_p,
            n: request.n,
            stream: request.stream,
            stop: request.stop,
            presence_penalty: request.presence_penalty,
            frequency_penalty: request.frequency_penalty,
            logit_bias: request.logit_bias,
            user: request.user,
            functions: request.functions,
            function_call: request.function_call,
            tools: request.tools,
            tool_choice: request.tool_choice,
            response_format: request.response_format,
            seed: request.seed
          };
          return parse(openAIRequestSchema, openAIRequest);
        } catch (error) {
          if (error instanceof ValidationError) {
            throw new Error(`Invalid request: ${error.message}`);
          }
          throw error;
        }
      }
      calculateActualCost(usage, model) {
        const modelKey = model;
        const pricing = OPENAI_PRICING[modelKey];
        if (!pricing) {
          return 0;
        }
        return usage.prompt_tokens * pricing.input / 1e3 + usage.completion_tokens * pricing.output / 1e3;
      }
      getContextLimit() {
        const model = this.config.model;
        switch (model) {
          case "gpt-4o":
          case "gpt-4o-mini":
            return 128e3;
          case "gpt-4-turbo":
          case "gpt-4-turbo-preview":
            return 128e3;
          case "gpt-4":
            return 8192;
          case "gpt-3.5-turbo":
            return 16385;
          default:
            return 4096;
        }
      }
      handleError(error, requestId) {
        const status = error?.status ?? error?.statusCode;
        const data = error?.data;
        if (status) {
          switch (status) {
            case 401:
              return new SDKAuthenticationError("Invalid API key", "openai", {
                statusCode: 401,
                requestId,
                details: { originalError: error }
              });
            case 429:
              return new SDKRateLimitError("Rate limit exceeded", "requests", {
                statusCode: 429,
                requestId,
                details: { originalError: error }
              });
            case 400:
              return new BaseSDKError(
                data?.error?.message || "OpenAI API error",
                "OPENAI_API_ERROR",
                { statusCode: 400, provider: "openai", requestId, details: { originalError: error } }
              );
            default:
              return new BaseSDKError(
                data?.error?.message || error.message || "OpenAI API error",
                "OPENAI_API_ERROR",
                { statusCode: status, provider: "openai", requestId, details: { originalError: error } }
              );
          }
        }
        if (error instanceof Error) {
          return error;
        }
        return new Error(`Unknown error in OpenAI request ${requestId}`);
      }
      async generateImages(request) {
        const body = {
          prompt: request.prompt,
          n: request.n ?? 1,
          size: request.size ?? "1024x1024",
          response_format: request.response_format ?? "url"
        };
        const response = await this.executeWithRetry(
          () => this.client.post("/images/generations", body),
          { operation: "image_generation" }
        );
        return {
          created: response.data.created || Math.floor(Date.now() / 1e3),
          data: response.data.data,
          provider: "openai"
        };
      }
    };
    openAIFactory = {
      create: (config) => new OpenAIProvider(config),
      supports: (provider) => provider === "openai"
    };
  }
});

// src/providers/claude.ts
function createAnthropicProvider(config) {
  return new AnthropicProvider({ ...config, provider: "anthropic" });
}
function claude(options = {}) {
  return {
    provider: "anthropic",
    model: options.model || "claude-3-5-sonnet-20241022",
    ...options
  };
}
var ANTHROPIC_PRICING, anthropicContentSchema, anthropicMessageSchema, anthropicRequestSchema, AnthropicProvider, anthropicFactory;
var init_claude = __esm({
  "src/providers/claude.ts"() {
    init_base();
    init_http();
    init_errors();
    init_validation();
    ANTHROPIC_PRICING = {
      "claude-3-5-sonnet-20241022": { input: 3e-3, output: 0.015 },
      "claude-3-5-haiku-20241022": { input: 25e-5, output: 125e-5 },
      "claude-3-opus-20240229": { input: 0.015, output: 0.075 },
      "claude-3-sonnet-20240229": { input: 3e-3, output: 0.015 },
      "claude-3-haiku-20240307": { input: 25e-5, output: 125e-5 }
    };
    anthropicContentSchema = v.union(
      v.string(),
      v.array(v.object({
        type: v.string().enum("text", "image"),
        text: v.string().optional(),
        source: v.object({
          type: v.literal("base64"),
          media_type: v.string(),
          data: v.string()
        }).optional()
      }))
    );
    anthropicMessageSchema = v.object({
      role: v.string().enum("user", "assistant"),
      content: anthropicContentSchema
    });
    anthropicRequestSchema = v.object({
      model: v.string(),
      messages: v.array(anthropicMessageSchema),
      max_tokens: v.number().int().min(1).max(4096),
      system: v.string().optional(),
      temperature: v.number().min(0).max(1).optional(),
      top_p: v.number().min(0).max(1).optional(),
      stop_sequences: v.array(v.string()).optional(),
      tools: v.array(v.object({
        name: v.string(),
        description: v.string().optional(),
        input_schema: v.object({}).optional()
      })).optional(),
      stream: v.boolean().default(false)
    });
    AnthropicProvider = class extends BaseProvider {
      constructor(config) {
        super("anthropic", config);
        __publicField(this, "client");
        __publicField(this, "apiKey");
        if (!config.apiKey || !this.validateApiKey(config.apiKey)) {
          throw new Error("Anthropic API key is required");
        }
        this.apiKey = config.apiKey;
        this.client = createHTTPClient({
          baseURL: config.baseURL || "https://api.anthropic.com/v1",
          timeout: config.timeout || 3e4,
          headers: {
            "x-api-key": this.apiKey,
            "Authorization": `Bearer ${this.apiKey}`,
            "anthropic-version": "2023-06-01",
            "anthropic-beta": "messages-2023-12-15"
          }
        });
      }
      getCapabilities() {
        const caps = {
          chatCompletion: true,
          streamingCompletion: true,
          functionCalling: true,
          imageGeneration: false,
          imageAnalysis: true,
          jsonMode: false,
          systemMessages: true,
          toolUse: true,
          multipleMessages: true,
          maxContextTokens: this.getContextLimit(),
          supportedModels: this.getAvailableModels()
        };
        try {
          Object.defineProperty(caps, "chat", { value: true, enumerable: false });
          Object.defineProperty(caps, "streaming", { value: true, enumerable: false });
          Object.defineProperty(caps, "tools", { value: true, enumerable: false });
          Object.defineProperty(caps, "images", { value: false, enumerable: false });
          Object.defineProperty(caps, "vision", { value: true, enumerable: false });
        } catch {
        }
        return caps;
      }
      validateModel(model) {
        return this.getAvailableModels().includes(model);
      }
      getAvailableModels() {
        return [
          "claude-3-5-sonnet-20241022",
          "claude-3-5-haiku-20241022",
          "claude-3-opus-20240229",
          "claude-3-sonnet-20240229",
          "claude-3-haiku-20240307"
        ];
      }
      estimateCost(request) {
        let model = request.model;
        let pricing = ANTHROPIC_PRICING[model];
        if (!pricing) {
          model = "claude-3-5-sonnet-20241022";
          pricing = ANTHROPIC_PRICING[model];
        }
        const inputText = request.messages.map(
          (m) => typeof m.content === "string" ? m.content : JSON.stringify(m.content)
        ).join(" ");
        const estimatedInputTokens = Math.ceil(inputText.length / 4);
        const estimatedOutputTokens = request.max_tokens || 1e3;
        return estimatedInputTokens * pricing.input / 1e3 + estimatedOutputTokens * pricing.output / 1e3;
      }
      async chatCompletion(request) {
        const requestId = this.generateRequestId();
        const startTime = Date.now();
        try {
          const anthropicRequest = this.transformRequest(request);
          const response = await this.executeWithRetry(
            () => this.client.post("/messages", anthropicRequest),
            { requestId, operation: "chat_completion" }
          );
          return this.transformResponse(
            response.data,
            request,
            this.createRequestMetrics(requestId, request.model, startTime)
          );
        } catch (error) {
          throw this.handleError(error, requestId);
        }
      }
      async *streamChatCompletion(request) {
        const requestId = this.generateRequestId();
        try {
          const anthropicRequest = this.transformRequest({ ...request, stream: true });
          const stream = this.client.stream({
            url: "/messages",
            method: "POST",
            body: anthropicRequest
          });
          for await (const chunk of stream) {
            const lines = chunk.split("\n").filter((line) => line.trim());
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  const transformedChunk = this.transformStreamChunk(parsed, request);
                  if (transformedChunk) {
                    yield transformedChunk;
                  }
                } catch (parseError) {
                  continue;
                }
              }
            }
          }
        } catch (error) {
          throw this.handleError(error, requestId);
        }
      }
      transformResponse(response, request, metrics) {
        const usage = {
          prompt_tokens: response.usage.input_tokens,
          completion_tokens: response.usage.output_tokens,
          total_tokens: response.usage.input_tokens + response.usage.output_tokens,
          estimated_cost: this.calculateActualCost(response.usage, request.model)
        };
        const textContent = response.content.filter((item) => item.type === "text").map((item) => item.text).join("");
        const toolCalls = response.content.filter((item) => item.type === "tool_use").map((item, index) => ({
          id: item.id || `call_${index}`,
          type: "function",
          function: {
            name: item.name || "",
            arguments: JSON.stringify(item.input || {})
          }
        }));
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
              content: textContent,
              ...toolCalls.length > 0 && { tool_calls: toolCalls }
            },
            finish_reason: this.mapStopReason(response.stop_reason)
          }],
          usage
        };
      }
      transformStreamChunk(chunk, request) {
        if (!chunk.type) {
          return null;
        }
        const baseChunk = {
          id: chunk.message?.id || "unknown",
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1e3),
          model: request.model,
          provider: "claude"
        };
        switch (chunk.type) {
          case "message_start":
            return {
              ...baseChunk,
              choices: [{
                index: 0,
                delta: { role: "assistant" },
                finish_reason: null
              }]
            };
          case "content_block_delta":
            if (chunk.delta?.text) {
              return {
                ...baseChunk,
                choices: [{
                  index: 0,
                  delta: { content: chunk.delta.text },
                  finish_reason: null
                }]
              };
            }
            break;
          case "message_delta":
            const usage = chunk.usage ? {
              prompt_tokens: chunk.usage.input_tokens,
              completion_tokens: chunk.usage.output_tokens,
              total_tokens: chunk.usage.input_tokens + chunk.usage.output_tokens,
              estimated_cost: this.calculateActualCost(chunk.usage, request.model)
            } : void 0;
            return {
              ...baseChunk,
              choices: [{
                index: 0,
                delta: {},
                finish_reason: this.mapStopReason(chunk.delta?.stop_reason || "end_turn")
              }],
              ...usage && { usage }
            };
          case "message_stop":
            return {
              ...baseChunk,
              choices: [{
                index: 0,
                delta: {},
                finish_reason: "stop"
              }]
            };
        }
        return null;
      }
      validateApiKey(apiKey) {
        if (apiKey === "test" || apiKey === "test-key") return true;
        return /^sk-[a-zA-Z0-9\-_]{8,}$/.test(apiKey) || /^sk-ant-api03-[a-zA-Z0-9\-_]{24,}$/.test(apiKey);
      }
      getAuthHeader(apiKey) {
        return `Bearer ${apiKey}`;
      }
      async testConnection() {
        try {
          const testRequest = {
            model: this.config.model || "claude-3-5-haiku-20241022",
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 1
          };
          await this.client.post("/messages", testRequest);
        } catch (error) {
          if (error instanceof HTTPError && error.status === 401) {
            throw new SDKAuthenticationError("Invalid API key", "claude", { statusCode: 401, details: { originalError: error } });
          }
          throw error;
        }
      }
      transformRequest(request) {
        try {
          const model = request.model || this.config.model || "claude-3-5-haiku-20241022";
          const systemMessage = request.messages.find((m) => m.role === "system");
          const messages = request.messages.filter((m) => m.role !== "system");
          const anthropicMessages = messages.map((msg) => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: this.transformMessageContent(msg)
          }));
          const anthropicRequest = {
            model,
            messages: anthropicMessages,
            max_tokens: request.max_tokens || 1e3,
            ...systemMessage && { system: systemMessage.content },
            ...request.temperature !== void 0 && { temperature: request.temperature },
            ...request.top_p !== void 0 && { top_p: request.top_p },
            ...request.stop && {
              stop_sequences: Array.isArray(request.stop) ? request.stop : [request.stop]
            },
            ...request.tools && { tools: this.transformTools(request.tools) },
            ...request.stream && { stream: true }
          };
          return parse(anthropicRequestSchema, anthropicRequest);
        } catch (error) {
          if (error instanceof ValidationError) {
            throw new Error(`Invalid request: ${error.message}`);
          }
          throw error;
        }
      }
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
            const dataUrl = content.image_url?.url || "";
            const [header, data] = dataUrl.split(",");
            const mediaType = header.match(/data:([^;]+)/)?.[1] || "image/jpeg";
            return {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: data || ""
              }
            };
          }
          return {
            type: "text",
            text: JSON.stringify(content)
          };
        });
      }
      transformTools(tools) {
        return tools.map((tool) => ({
          name: tool.function.name,
          description: tool.function.description,
          input_schema: tool.function.parameters || {}
        }));
      }
      mapStopReason(stopReason) {
        const reasonMap = {
          "end_turn": "stop",
          "max_tokens": "length",
          "stop_sequence": "stop",
          "tool_use": "tool_calls"
        };
        return reasonMap[stopReason] || "stop";
      }
      calculateActualCost(usage, model) {
        const modelKey = model;
        const pricing = ANTHROPIC_PRICING[modelKey];
        if (!pricing) {
          return 0;
        }
        return usage.input_tokens * pricing.input / 1e3 + usage.output_tokens * pricing.output / 1e3;
      }
      getContextLimit() {
        const model = this.config.model;
        switch (model) {
          case "claude-3-5-sonnet-20241022":
          case "claude-3-opus-20240229":
          case "claude-3-sonnet-20240229":
            return 2e5;
          case "claude-3-5-haiku-20241022":
          case "claude-3-haiku-20240307":
            return 2e5;
          default:
            return 2e5;
        }
      }
      handleError(error, requestId) {
        const status = error?.status ?? error?.statusCode;
        const data = error?.data;
        if (status) {
          switch (status) {
            case 401:
              return new SDKAuthenticationError("Invalid API key", "claude", { statusCode: 401, requestId, details: { originalError: error } });
            case 429:
              return new SDKRateLimitError("Rate limit exceeded", "requests", { statusCode: 429, requestId, details: { originalError: error } });
            case 400:
              return new BaseSDKError(
                data?.error?.message || "Claude API error",
                "CLAUDE_API_ERROR",
                { statusCode: 400, provider: "claude", requestId, details: { originalError: error } }
              );
            default:
              return new BaseSDKError(
                data?.error?.message || error.message || "Claude API error",
                "CLAUDE_API_ERROR",
                { statusCode: status, provider: "claude", requestId, details: { originalError: error } }
              );
          }
        }
        if (error instanceof Error) {
          return error;
        }
        return new Error(`Unknown error in Anthropic request ${requestId}`);
      }
    };
    anthropicFactory = {
      create: (config) => new AnthropicProvider(config),
      supports: (provider) => provider === "anthropic"
    };
  }
});

// src/providers/google.ts
function createGoogleProvider(config) {
  return new GoogleProvider({ ...config, provider: "google" });
}
function gemini(options = {}) {
  return {
    provider: "google",
    model: options.model || "gemini-1.5-flash",
    // Default to Flash for cost optimization
    ...options
  };
}
var GEMINI_PRICING, geminiPartSchema, geminiContentSchema, geminiRequestSchema, GoogleProvider, googleFactory;
var init_google = __esm({
  "src/providers/google.ts"() {
    init_base();
    init_http();
    init_errors();
    init_validation();
    GEMINI_PRICING = {
      "gemini-1.5-pro": { input: 125e-5, output: 5e-3 },
      "gemini-1.5-flash": { input: 75e-6, output: 3e-4 },
      "gemini-pro": { input: 5e-4, output: 15e-4 },
      "gemini-pro-vision": { input: 25e-5, output: 5e-4 }
    };
    geminiPartSchema = v.object({
      text: v.string().optional(),
      inlineData: v.object({
        mimeType: v.string(),
        data: v.string()
      }).optional()
    });
    geminiContentSchema = v.object({
      role: v.string().enum("user", "model"),
      parts: v.array(geminiPartSchema)
    });
    geminiRequestSchema = v.object({
      contents: v.array(geminiContentSchema),
      generationConfig: v.object({
        temperature: v.number().min(0).max(1).optional(),
        topP: v.number().min(0).max(1).optional(),
        topK: v.number().int().min(1).optional(),
        maxOutputTokens: v.number().int().min(1).optional(),
        stopSequences: v.array(v.string()).optional()
      }).optional(),
      safetySettings: v.array(v.object({
        category: v.string(),
        threshold: v.string()
      })).optional()
    });
    GoogleProvider = class extends BaseProvider {
      constructor(config) {
        super("google", config);
        __publicField(this, "client");
        __publicField(this, "apiKey");
        if (!config.apiKey || !this.validateApiKey(config.apiKey)) {
          throw new Error("Google API key is required");
        }
        this.apiKey = config.apiKey;
        this.client = createHTTPClient({
          baseURL: config.baseURL || "https://generativelanguage.googleapis.com/v1beta",
          timeout: config.timeout || 3e4
        });
      }
      getCapabilities() {
        const caps = {
          chatCompletion: true,
          streamingCompletion: true,
          functionCalling: false,
          // Not yet implemented in this version
          imageGeneration: false,
          imageAnalysis: true,
          jsonMode: false,
          systemMessages: false,
          // Gemini doesn't have system messages
          toolUse: false,
          // Not yet implemented
          multipleMessages: true,
          maxContextTokens: this.getContextLimit(),
          supportedModels: this.getAvailableModels()
        };
        return caps;
      }
      validateModel(model) {
        return this.getAvailableModels().includes(model);
      }
      getAvailableModels() {
        return [
          "gemini-1.5-pro",
          "gemini-1.5-flash",
          "gemini-pro",
          "gemini-pro-vision"
        ];
      }
      estimateCost(request) {
        let model = request.model;
        let pricing = GEMINI_PRICING[model];
        if (!pricing) {
          model = "gemini-1.5-flash";
          pricing = GEMINI_PRICING[model];
        }
        const inputText = request.messages.map(
          (m) => typeof m.content === "string" ? m.content : JSON.stringify(m.content)
        ).join(" ");
        const estimatedInputTokens = Math.ceil(inputText.length / 4);
        const estimatedOutputTokens = request.max_tokens || 1e3;
        return estimatedInputTokens * pricing.input / 1e3 + estimatedOutputTokens * pricing.output / 1e3;
      }
      async chatCompletion(request) {
        const requestId = this.generateRequestId();
        const startTime = Date.now();
        try {
          const geminiRequest = this.transformRequest(request);
          const url = `/models/${request.model}:generateContent?key=${this.apiKey}`;
          const response = await this.executeWithRetry(
            () => this.client.post(url, geminiRequest),
            { requestId, operation: "chat_completion" }
          );
          return this.transformResponse(
            response.data,
            request,
            this.createRequestMetrics(requestId, request.model, startTime)
          );
        } catch (error) {
          throw this.handleError(error, requestId);
        }
      }
      async *streamChatCompletion(request) {
        const requestId = this.generateRequestId();
        try {
          const geminiRequest = this.transformRequest(request);
          const url = `/models/${request.model}:streamGenerateContent?key=${this.apiKey}`;
          const stream = this.client.stream({
            url,
            method: "POST",
            body: geminiRequest
          });
          for await (const chunk of stream) {
            const lines = chunk.split("\n").filter((line) => line.trim());
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  const transformedChunk = this.transformStreamChunk(parsed, request);
                  if (transformedChunk) {
                    yield transformedChunk;
                  }
                } catch (parseError) {
                  continue;
                }
              }
            }
          }
        } catch (error) {
          throw this.handleError(error, requestId);
        }
      }
      transformResponse(response, request, metrics) {
        const candidate = response.candidates[0];
        if (!candidate) {
          throw new Error("No response candidate from Gemini");
        }
        const usage = {
          prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
          completion_tokens: response.usageMetadata?.candidatesTokenCount || 0,
          total_tokens: response.usageMetadata?.totalTokenCount || 0,
          estimated_cost: this.calculateActualCost(response.usageMetadata, request.model)
        };
        const content = candidate.content.parts.map((part) => part.text).join("");
        return {
          id: `gemini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1e3),
          model: request.model,
          provider: "google",
          choices: [{
            index: 0,
            message: {
              role: "assistant",
              content
            },
            finish_reason: this.mapFinishReason(candidate.finishReason)
          }],
          usage
        };
      }
      transformStreamChunk(response, request) {
        const candidate = response.candidates?.[0];
        if (!candidate) {
          return null;
        }
        const content = candidate.content?.parts?.[0]?.text || "";
        return {
          id: `gemini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1e3),
          model: request.model,
          provider: "google",
          choices: [{
            index: 0,
            delta: {
              content
            },
            finish_reason: candidate.finishReason ? this.mapFinishReason(candidate.finishReason) : null
          }],
          usage: response.usageMetadata ? {
            prompt_tokens: response.usageMetadata.promptTokenCount,
            completion_tokens: response.usageMetadata.candidatesTokenCount,
            total_tokens: response.usageMetadata.totalTokenCount,
            estimated_cost: this.calculateActualCost(response.usageMetadata, request.model)
          } : void 0
        };
      }
      validateApiKey(apiKey) {
        if (apiKey === "test" || apiKey === "test-key") return true;
        return /^[A-Za-z0-9\-_]{8,}$/.test(apiKey) || /^AIza[0-9A-Za-z\-_]{10,}$/.test(apiKey);
      }
      getAuthHeader(apiKey) {
        return apiKey;
      }
      async testConnection() {
        try {
          const testRequest = {
            contents: [{
              role: "user",
              parts: [{ text: "Hi" }]
            }]
          };
          const url = `/models/${this.config.model || "gemini-pro"}:generateContent?key=${this.apiKey}`;
          await this.client.post(url, testRequest);
        } catch (error) {
          if (error instanceof HTTPError && error.status === 401) {
            throw new Error("Invalid Google API key");
          }
          throw error;
        }
      }
      transformRequest(request) {
        try {
          const filteredMessages = request.messages.filter((m) => m.role !== "system");
          const contents = filteredMessages.map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: this.transformMessageContent(msg)
          }));
          const geminiRequest = {
            contents,
            generationConfig: {
              ...request.temperature !== void 0 && { temperature: request.temperature },
              ...request.top_p !== void 0 && { topP: request.top_p },
              ...request.max_tokens !== void 0 && { maxOutputTokens: request.max_tokens },
              ...request.stop && {
                stopSequences: Array.isArray(request.stop) ? request.stop : [request.stop]
              }
            }
          };
          return parse(geminiRequestSchema, geminiRequest);
        } catch (error) {
          if (error instanceof ValidationError) {
            throw new Error(`Invalid request: ${error.message}`);
          }
          throw error;
        }
      }
      transformMessageContent(message) {
        if (typeof message.content === "string") {
          return [{ text: message.content }];
        }
        return message.content.map((content) => {
          if (content.type === "text") {
            return { text: content.text };
          } else if (content.type === "image_url") {
            const dataUrl = content.image_url?.url || "";
            const [header, data] = dataUrl.split(",");
            const mimeType = header.match(/data:([^;]+)/)?.[1] || "image/jpeg";
            return {
              inlineData: {
                mimeType,
                data: data || ""
              }
            };
          }
          return { text: JSON.stringify(content) };
        });
      }
      mapFinishReason(finishReason) {
        const reasonMap = {
          "STOP": "stop",
          "MAX_TOKENS": "length",
          "SAFETY": "content_filter",
          "RECITATION": "content_filter",
          "OTHER": "stop"
        };
        return reasonMap[finishReason] || "stop";
      }
      calculateActualCost(usageMetadata, model) {
        if (!usageMetadata) return 0;
        const modelKey = model;
        const pricing = GEMINI_PRICING[modelKey];
        if (!pricing) {
          return 0;
        }
        return usageMetadata.promptTokenCount * pricing.input / 1e3 + usageMetadata.candidatesTokenCount * pricing.output / 1e3;
      }
      getContextLimit() {
        const model = this.config.model;
        switch (model) {
          case "gemini-1.5-pro":
            return 1e6;
          // 1M tokens
          case "gemini-1.5-flash":
            return 1e6;
          // 1M tokens
          case "gemini-pro":
            return 30720;
          case "gemini-pro-vision":
            return 12288;
          default:
            return 30720;
        }
      }
      handleError(error, requestId) {
        const status = error?.status;
        if (status) {
          switch (status) {
            case 400:
              return new SDKValidationError(
                error.data?.error?.message || "Invalid request",
                error.data?.error?.param || "unknown",
                error.data?.error?.code || "unknown",
                { statusCode: 400, requestId, details: { originalError: error } }
              );
            case 401:
              return new SDKAuthenticationError("Invalid API key", "google", { statusCode: 401, requestId, details: { originalError: error } });
            case 429:
              return new SDKRateLimitError("Rate limit exceeded", "requests", { statusCode: 429, requestId, details: { originalError: error } });
            default:
              return new BaseSDKError(
                error.message || "Google API error",
                "GOOGLE_API_ERROR",
                { statusCode: status, provider: "google", requestId, details: { originalError: error } }
              );
          }
        }
        if (error instanceof Error) {
          return error;
        }
        return new Error(`Unknown error in Google request ${requestId}`);
      }
    };
    googleFactory = {
      create: (config) => new GoogleProvider(config),
      supports: (provider) => provider === "google"
    };
  }
});

// src/providers/index.ts
var providers_exports = {};
__export(providers_exports, {
  AnthropicProvider: () => AnthropicProvider,
  BaseProvider: () => BaseProvider,
  ClaudeProvider: () => AnthropicProvider,
  GoogleProvider: () => GoogleProvider,
  OpenAIProvider: () => OpenAIProvider,
  ProviderRegistry: () => ProviderRegistry,
  anthropicFactory: () => anthropicFactory,
  checkProviderHealth: () => checkProviderHealth,
  claude: () => claude,
  createAnthropicProvider: () => createAnthropicProvider,
  createGoogleProvider: () => createGoogleProvider,
  createOpenAIProvider: () => createOpenAIProvider,
  gemini: () => gemini,
  getSupportedProviders: () => getSupportedProviders,
  googleFactory: () => googleFactory,
  isProviderSupported: () => isProviderSupported,
  openAIFactory: () => openAIFactory,
  openai: () => openai,
  providerRegistry: () => providerRegistry,
  providers: () => providers
});
function getSupportedProviders() {
  return providerRegistry.getRegisteredProviders();
}
function isProviderSupported(provider) {
  return providerRegistry.supports(provider);
}
async function checkProviderHealth() {
  return providerRegistry.healthCheckAll();
}
var providers, openai;
var init_providers = __esm({
  "src/providers/index.ts"() {
    init_base();
    init_openai();
    init_claude();
    init_google();
    init_base();
    init_openai();
    init_claude();
    init_claude();
    init_google();
    providerRegistry.register("openai", openAIFactory);
    providerRegistry.register("anthropic", anthropicFactory);
    providerRegistry.register("claude", anthropicFactory);
    providerRegistry.register("google", googleFactory);
    providers = {
      openai: (config) => ({ provider: "openai", model: "gpt-4o", ...config }),
      claude: (config) => ({ provider: "anthropic", model: "claude-3-5-sonnet-20241022", ...config }),
      gemini: (config) => ({ provider: "google", model: "gemini-1.5-flash", ...config })
    };
    openai = (config) => ({ provider: "openai", model: "gpt-4o", ...config });
  }
});

// src/index.ts
init_chat();

// src/orchestration/index.ts
init_providers();
var StrategyEngine = class {
  /**
   * Analyze request and determine optimal strategy
   */
  determine(request) {
    const { requirements = {}, constraints = {}, strategy = "balanced" } = request;
    const complexity = this.analyzeComplexity(request);
    const capabilities = this.determineCapabilities(requirements);
    const candidateProviders = this.filterProviders(capabilities, constraints);
    return {
      strategy,
      complexity,
      capabilities,
      providers: candidateProviders,
      routing: this.determineRouting(strategy, candidateProviders, constraints),
      fallbacks: this.determineFallbacks(candidateProviders, constraints),
      validation: this.shouldValidate(request, complexity)
    };
  }
  analyzeComplexity(request) {
    const content = request.messages?.map((m) => m.content).join(" ") || "";
    const wordCount = content.split(" ").length;
    if (wordCount < 100) return "simple";
    if (wordCount < 500) return "moderate";
    return "complex";
  }
  determineCapabilities(requirements = {}) {
    const capabilities = ["chat"];
    if (requirements.reasoning) capabilities.push("reasoning");
    if (requirements.vision) capabilities.push("vision");
    if (requirements.tools) capabilities.push("tools");
    if (requirements.coding) capabilities.push("coding");
    if (requirements.creative) capabilities.push("creative");
    if (requirements.analysis) capabilities.push("analysis");
    return capabilities;
  }
  filterProviders(capabilities, constraints = {}) {
    const allProviders = [
      {
        provider: "openai",
        model: "gpt-4o",
        capabilities: ["chat", "vision", "tools", "coding", "creative"],
        costPerToken: 25e-4,
        avgLatency: 2500,
        qualityScore: 90,
        privacyLevel: "public"
      },
      {
        provider: "anthropic",
        model: "claude-3-5-sonnet-20241022",
        capabilities: ["chat", "reasoning", "analysis", "coding", "tools"],
        costPerToken: 3e-3,
        avgLatency: 3e3,
        qualityScore: 95,
        privacyLevel: "private"
      },
      {
        provider: "google",
        model: "gemini-1.5-pro",
        capabilities: ["chat", "vision", "tools", "analysis"],
        costPerToken: 125e-5,
        avgLatency: 2e3,
        qualityScore: 85,
        privacyLevel: "public"
      },
      {
        provider: "local",
        model: "llama-3.2-3b",
        capabilities: ["chat", "coding"],
        costPerToken: 0,
        avgLatency: 8e3,
        qualityScore: 70,
        privacyLevel: "hipaa"
      }
    ];
    return allProviders.filter((p) => {
      const hasCapabilities = capabilities.every((cap) => p.capabilities.includes(cap));
      if (!hasCapabilities) return false;
      if (constraints.excludeProviders?.includes(p.provider)) return false;
      if (constraints.privacyLevel === "hipaa" && p.privacyLevel !== "hipaa") return false;
      if (constraints.maxCost && p.costPerToken * 1e3 > constraints.maxCost) return false;
      if (constraints.maxLatency && p.avgLatency > constraints.maxLatency) return false;
      return true;
    });
  }
  determineRouting(strategy, candidates, constraints = {}) {
    return candidates.map((candidate) => {
      let score = 0;
      switch (strategy) {
        case "cost_optimized":
          score = 100 - candidate.costPerToken * 1e4;
          break;
        case "performance":
          score = 100 - candidate.avgLatency / 100;
          break;
        case "privacy_first":
          score = candidate.privacyLevel === "hipaa" ? 100 : candidate.privacyLevel === "private" ? 80 : 60;
          break;
        case "balanced":
        default:
          score = candidate.qualityScore * 0.4 + (100 - candidate.costPerToken * 1e4) * 0.3 + (100 - candidate.avgLatency / 100) * 0.3;
          break;
      }
      if (constraints.preferredProviders?.includes(candidate.provider)) {
        score += 20;
      }
      return {
        ...candidate,
        score: Math.max(0, Math.min(100, score))
      };
    }).sort((a, b) => b.score - a.score);
  }
  determineFallbacks(candidates, constraints = {}) {
    return candidates.slice(1);
  }
  shouldValidate(request, complexity) {
    return request.validation?.enabled || complexity === "complex";
  }
};
var ProviderSelector = class {
  /**
   * Rank providers based on execution strategy
   */
  rank(strategy) {
    return strategy.routing;
  }
  /**
   * Select primary provider for request
   */
  selectPrimary(rankings) {
    if (rankings.length === 0) {
      throw new Error("No suitable providers available for request");
    }
    return rankings[0];
  }
  /**
   * Get fallback providers in order of preference
   */
  getFallbacks(rankings) {
    return rankings.slice(1);
  }
};
var AIOrchestrator = class {
  constructor() {
    __publicField(this, "strategyEngine");
    __publicField(this, "providerSelector");
    __publicField(this, "cache", /* @__PURE__ */ new Map());
    this.strategyEngine = new StrategyEngine();
    this.providerSelector = new ProviderSelector();
  }
  /**
   * Execute AI request with intelligent orchestration
   */
  async execute(request) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(request);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return {
        ...cached,
        orchestration: {
          ...cached.orchestration,
          cacheHit: true
        }
      };
    }
    const strategy = this.strategyEngine.determine(request);
    const rankings = this.providerSelector.rank(strategy);
    const primary = this.providerSelector.selectPrimary(rankings);
    const fallbacks = this.providerSelector.getFallbacks(rankings);
    const result = await this.executeWithFallbacks(request, primary, fallbacks);
    const orchestratedResult = {
      ...result,
      orchestration: {
        strategy: request.strategy || "balanced",
        providersUsed: [primary.provider],
        fallbacksTriggered: false,
        // TODO: Track this properly
        cacheHit: false,
        processingTime: Date.now() - startTime
      },
      confidence: await this.calculateConfidence(request, result, strategy),
      cost: this.calculateCost(result, primary),
      performance: this.calculatePerformance(result, primary, startTime)
    };
    this.cache.set(cacheKey, orchestratedResult);
    return orchestratedResult;
  }
  async executeWithFallbacks(request, primary, fallbacks) {
    try {
      const provider = providers[primary.provider];
      return await provider.complete(request);
    } catch (error) {
      for (const fallback of fallbacks) {
        try {
          const provider = providers[fallback.provider];
          return await provider.complete(request);
        } catch (fallbackError) {
          console.warn(`Fallback provider ${fallback.provider} failed:`, fallbackError);
        }
      }
      throw new Error(`All providers failed. Primary: ${primary.provider}, Fallbacks: ${fallbacks.map((f) => f.provider).join(", ")}`);
    }
  }
  async calculateConfidence(request, result, strategy) {
    return {
      overall: 85,
      providerAgreement: 90,
      costEfficiency: 75,
      latencyScore: 80,
      qualityScore: 88
    };
  }
  calculateCost(result, provider) {
    const inputTokens = result.usage?.prompt_tokens || 0;
    const outputTokens = result.usage?.completion_tokens || 0;
    const totalCost = (inputTokens + outputTokens) * provider.costPerToken;
    return {
      total: totalCost,
      breakdown: { [provider.provider]: totalCost },
      savings: 0,
      // TODO: Calculate vs most expensive option
      efficiency: 85
      // TODO: Calculate efficiency score
    };
  }
  calculatePerformance(result, provider, startTime) {
    const totalTime = Date.now() - startTime;
    const totalTokens = result.usage?.completion_tokens || 0;
    return {
      latency: totalTime,
      tokensPerSecond: totalTokens / (totalTime / 1e3),
      providerLatencies: { [provider.provider]: totalTime }
    };
  }
  generateCacheKey(request) {
    const { messages, strategy, requirements, constraints } = request;
    const keyData = { messages, strategy, requirements, constraints };
    return Buffer.from(JSON.stringify(keyData)).toString("base64").slice(0, 32);
  }
};
var AIService = class {
  constructor() {
    __publicField(this, "orchestrator");
    this.orchestrator = new AIOrchestrator();
  }
  /**
   * Complete an AI request with intelligent orchestration
   */
  async complete(request) {
    return this.orchestrator.execute(request);
  }
  /**
   * Simple completion with strategy shorthand
   */
  async ask(prompt, options = {}) {
    return this.complete({
      messages: [{ role: "user", content: prompt }],
      ...options
    });
  }
  /**
   * Multi-step workflow execution
   */
  async workflow(steps) {
    const results = {};
    for (const step of steps) {
      const prompt = this.replaceTemplateVars(step.prompt, results);
      const result = await this.complete({
        messages: [{ role: "user", content: prompt }],
        strategy: step.strategy,
        requirements: step.requirements,
        constraints: step.constraints
      });
      results[step.name] = result;
    }
    return { results };
  }
  replaceTemplateVars(prompt, results) {
    return prompt.replace(/\{\{\s*(\w+)\.output\s*\}\}/g, (match, stepName) => {
      const stepResult = results[stepName];
      return stepResult?.choices?.[0]?.message?.content || match;
    });
  }
};
var ai = new AIService();

// src/index.ts
init_providers();
init_errors();
init_types();
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
    const { Chat: Chat2 } = (init_chat(), __toCommonJS(chat_exports));
    return new Chat2({
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

export { AIOrchestrator, AIService, BaseProvider, BaseSDKError, Chat, CircuitBreaker, DEFAULT_CONFIG, ErrorFactory, ProviderSelector, RetryHandler, SDK, SDKAuthenticationError, SDKRateLimitError, SDKValidationError, StrategyEngine, VERSION, ai, checkProviderHealth, claude, src_default as default, getSupportedProviders, initSDK, isAuthenticationError, isProviderSupported, isRateLimitError, isSDKError, isValidationError, openai, providerRegistry, providers, sanitizeErrorForLogging, withTimeout };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map