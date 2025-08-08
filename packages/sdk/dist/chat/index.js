'use strict';

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
var ProviderRegistry = class {
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
var providerRegistry = new ProviderRegistry();

// src/chat/index.ts
init_errors();
var Chat = class {
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

exports.Chat = Chat;
exports.Conversation = Conversation;
exports.ask = ask;
exports.chat = chat;
exports.createChat = createChat;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map