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

// src/utils/errors.ts
var BaseSDKError = class extends Error {
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
var SDKRateLimitError = class extends BaseSDKError {
  constructor(message, limitType, options) {
    super(message, "RATE_LIMIT_EXCEEDED", options);
    __publicField(this, "code", "RATE_LIMIT_EXCEEDED");
    __publicField(this, "retryAfter");
    __publicField(this, "limitType");
    this.limitType = limitType;
    this.retryAfter = options?.retryAfter;
  }
};
var SDKAuthenticationError = class extends BaseSDKError {
  constructor(message, provider, options) {
    super(message, "AUTHENTICATION_FAILED", { ...options, provider });
    __publicField(this, "code", "AUTHENTICATION_FAILED");
    __publicField(this, "provider");
    this.provider = provider;
  }
};
var SDKValidationError = class extends BaseSDKError {
  constructor(message, field, value, options) {
    super(message, "VALIDATION_ERROR", options);
    __publicField(this, "code", "VALIDATION_ERROR");
    __publicField(this, "field");
    __publicField(this, "value");
    this.field = field;
    this.value = value;
  }
};
var DEFAULT_RETRY_CONFIG = {
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
var RetryHandler = class {
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
var CircuitBreaker = class {
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

// src/providers/base.ts
var BaseProvider = class {
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

// src/utils/http.ts
var HTTPError = class extends Error {
  constructor(message, status, statusText, data) {
    super(message);
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.name = "HTTPError";
  }
};
var HTTPTimeoutError = class extends Error {
  constructor(timeout) {
    super(`Request timeout after ${timeout}ms`);
    this.name = "HTTPTimeoutError";
  }
};
var HTTPClient = class {
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
function createHTTPClient(config) {
  return new HTTPClient(config);
}

// src/utils/validation.ts
var ValidationError = class extends Error {
  constructor(message, path = [], received) {
    super(message);
    this.path = path;
    this.received = received;
    this.name = "ValidationError";
  }
};
var BaseValidator = class {
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
var StringValidator = class _StringValidator extends BaseValidator {
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
var NumberValidator = class _NumberValidator extends BaseValidator {
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
var BooleanValidator = class extends BaseValidator {
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
var ArrayValidator = class _ArrayValidator extends BaseValidator {
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
var ObjectValidator = class extends BaseValidator {
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
var UnionValidator = class extends BaseValidator {
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
var OptionalValidator = class extends BaseValidator {
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
var NullableValidator = class extends BaseValidator {
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
var DefaultValidator = class extends BaseValidator {
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
var v = {
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
function parse(validator, value) {
  const result = validator.validate(value);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

// src/providers/openai.ts
var OPENAI_PRICING = {
  "gpt-4o": { input: 25e-4, output: 0.01 },
  "gpt-4o-mini": { input: 15e-5, output: 6e-4 },
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-4": { input: 0.03, output: 0.06 },
  "gpt-3.5-turbo": { input: 5e-4, output: 15e-4 },
  "gpt-3.5-turbo-instruct": { input: 15e-4, output: 2e-3 }
};
var openAIMessageSchema = v.object({
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
var openAIRequestSchema = v.object({
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
var OpenAIProvider = class extends BaseProvider {
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
function createOpenAIProvider(config) {
  return new OpenAIProvider({ ...config, provider: "openai" });
}
var openAIFactory = {
  create: (config) => new OpenAIProvider(config),
  supports: (provider) => provider === "openai"
};

// src/providers/claude.ts
var ANTHROPIC_PRICING = {
  "claude-3-5-sonnet-20241022": { input: 3e-3, output: 0.015 },
  "claude-3-5-haiku-20241022": { input: 25e-5, output: 125e-5 },
  "claude-3-opus-20240229": { input: 0.015, output: 0.075 },
  "claude-3-sonnet-20240229": { input: 3e-3, output: 0.015 },
  "claude-3-haiku-20240307": { input: 25e-5, output: 125e-5 }
};
var anthropicContentSchema = v.union(
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
var anthropicMessageSchema = v.object({
  role: v.string().enum("user", "assistant"),
  content: anthropicContentSchema
});
var anthropicRequestSchema = v.object({
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
var AnthropicProvider = class extends BaseProvider {
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
function createAnthropicProvider(config) {
  return new AnthropicProvider({ ...config, provider: "anthropic" });
}
var anthropicFactory = {
  create: (config) => new AnthropicProvider(config),
  supports: (provider) => provider === "anthropic"
};
function claude(options = {}) {
  return {
    provider: "anthropic",
    model: options.model || "claude-3-5-sonnet-20241022",
    ...options
  };
}

// src/providers/google.ts
var GEMINI_PRICING = {
  "gemini-1.5-pro": { input: 125e-5, output: 5e-3 },
  "gemini-1.5-flash": { input: 75e-6, output: 3e-4 },
  "gemini-pro": { input: 5e-4, output: 15e-4 },
  "gemini-pro-vision": { input: 25e-5, output: 5e-4 }
};
var geminiPartSchema = v.object({
  text: v.string().optional(),
  inlineData: v.object({
    mimeType: v.string(),
    data: v.string()
  }).optional()
});
var geminiContentSchema = v.object({
  role: v.string().enum("user", "model"),
  parts: v.array(geminiPartSchema)
});
var geminiRequestSchema = v.object({
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
var GoogleProvider = class extends BaseProvider {
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
function createGoogleProvider(config) {
  return new GoogleProvider({ ...config, provider: "google" });
}
var googleFactory = {
  create: (config) => new GoogleProvider(config),
  supports: (provider) => provider === "google"
};
function gemini(options = {}) {
  return {
    provider: "google",
    model: options.model || "gemini-1.5-flash",
    // Default to Flash for cost optimization
    ...options
  };
}

// src/providers/index.ts
providerRegistry.register("openai", openAIFactory);
providerRegistry.register("anthropic", anthropicFactory);
providerRegistry.register("claude", anthropicFactory);
providerRegistry.register("google", googleFactory);
var providers = {
  openai: (config) => ({ provider: "openai", model: "gpt-4o", ...config }),
  claude: (config) => ({ provider: "anthropic", model: "claude-3-5-sonnet-20241022", ...config }),
  gemini: (config) => ({ provider: "google", model: "gemini-1.5-flash", ...config })
};
var openai = (config) => ({ provider: "openai", model: "gpt-4o", ...config });
function getSupportedProviders() {
  return providerRegistry.getRegisteredProviders();
}
function isProviderSupported(provider) {
  return providerRegistry.supports(provider);
}
async function checkProviderHealth() {
  return providerRegistry.healthCheckAll();
}

exports.AnthropicProvider = AnthropicProvider;
exports.BaseProvider = BaseProvider;
exports.ClaudeProvider = AnthropicProvider;
exports.GoogleProvider = GoogleProvider;
exports.OpenAIProvider = OpenAIProvider;
exports.ProviderRegistry = ProviderRegistry;
exports.anthropicFactory = anthropicFactory;
exports.checkProviderHealth = checkProviderHealth;
exports.claude = claude;
exports.createAnthropicProvider = createAnthropicProvider;
exports.createGoogleProvider = createGoogleProvider;
exports.createOpenAIProvider = createOpenAIProvider;
exports.gemini = gemini;
exports.getSupportedProviders = getSupportedProviders;
exports.googleFactory = googleFactory;
exports.isProviderSupported = isProviderSupported;
exports.openAIFactory = openAIFactory;
exports.openai = openai;
exports.providerRegistry = providerRegistry;
exports.providers = providers;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map