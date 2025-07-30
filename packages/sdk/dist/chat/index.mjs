var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

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
var providerRegistry = new ProviderRegistry();

// src/chat/index.ts
var Chat = class {
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
    const provider = providerRegistry.getProvider(providerConfig);
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
    const provider = providerRegistry.getProvider(providerConfig);
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
    const supportedProviders = providerRegistry.getRegisteredProviders();
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
        const providerInstance = providerRegistry.getProvider(provider);
        return await providerInstance.chatCompletion(request);
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

export { Chat, Conversation, ask, chat, createChat };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map