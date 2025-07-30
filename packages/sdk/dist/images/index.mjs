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

// src/images/index.ts
var Images = class {
  constructor(options = {}) {
    __publicField(this, "defaultProvider");
    __publicField(this, "options");
    this.options = {
      enableAutoRetry: true,
      enableFallback: true,
      ...options
    };
    this.defaultProvider = options.provider;
  }
  /**
   * Generate images from text prompt
   */
  async generate(request, options) {
    const mergedOptions = { ...this.options, ...options };
    const providerConfig = await this.selectProvider(request, mergedOptions);
    const provider = providerRegistry.getProvider(providerConfig);
    const capabilities = provider.getCapabilities();
    if (!capabilities.images) {
      throw new BaseSDKError(
        `Provider ${providerConfig.provider} does not support image generation`,
        "UNSUPPORTED_OPERATION",
        { provider: providerConfig.provider }
      );
    }
    try {
      return await provider.generateImages(request);
    } catch (error) {
      if (mergedOptions.enableFallback && this.shouldFallback(error)) {
        return this.executeWithFallback(request, providerConfig, mergedOptions);
      }
      throw error;
    }
  }
  /**
   * Generate a single image (convenience method)
   */
  async create(prompt, options) {
    const request = {
      prompt,
      n: 1,
      response_format: "url",
      ...options?.size && { size: options.size },
      ...options?.quality && { quality: options.quality },
      ...options?.style && { style: options.style },
      ...options?.model && { model: options.model }
    };
    const response = await this.generate(request, options);
    if (!response.data[0]?.url) {
      throw new BaseSDKError(
        "No image URL returned from provider",
        "INVALID_RESPONSE"
      );
    }
    return response.data[0].url;
  }
  /**
   * Generate multiple images
   */
  async createBatch(prompt, count, options) {
    if (count <= 0 || count > 10) {
      throw new BaseSDKError(
        "Image count must be between 1 and 10",
        "VALIDATION_ERROR",
        { details: { field: "count", value: count } }
      );
    }
    const request = {
      prompt,
      n: count,
      response_format: "url",
      ...options?.size && { size: options.size },
      ...options?.quality && { quality: options.quality },
      ...options?.style && { style: options.style },
      ...options?.model && { model: options.model }
    };
    const response = await this.generate(request, options);
    return response.data.map((item) => item.url).filter((url) => url !== void 0);
  }
  /**
   * Generate image variations (if supported by provider)
   */
  async createVariations(originalImageUrl, options) {
    throw new BaseSDKError(
      "Image variations not yet supported",
      "UNSUPPORTED_OPERATION"
    );
  }
  /**
   * Get supported image sizes for current provider
   */
  getSupportedSizes(provider) {
    const supportedSizes = {
      "openai": ["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"],
      "azure": ["256x256", "512x512", "1024x1024"]
      // Add other providers as they support image generation
    };
    const providerName = provider || this.defaultProvider?.provider || "openai";
    return supportedSizes[providerName] || ["1024x1024"];
  }
  /**
   * Estimate cost for image generation
   */
  async estimateCost(request, provider) {
    const providerName = provider || this.defaultProvider?.provider || "openai";
    const costPerImage = {
      "openai": request.quality === "hd" ? 0.08 : 0.04,
      "azure": 0.04
    };
    const baseCost = costPerImage[providerName] || 0.04;
    return baseCost * (request.n || 1);
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
    const supportedProviders = providerRegistry.getRegisteredProviders().filter((provider) => {
      const testConfig = {
        provider,
        model: this.getDefaultModel(provider),
        apiKey: ""
      };
      const providerInstance = providerRegistry.getProvider(testConfig);
      return providerInstance.getCapabilities().images;
    });
    if (supportedProviders.length === 0) {
      throw new BaseSDKError(
        "No providers support image generation",
        "NO_SUITABLE_PROVIDER"
      );
    }
    const constraints = options.constraints;
    if (constraints?.excludeProviders) {
      const filtered = supportedProviders.filter(
        (p) => !constraints.excludeProviders.includes(p)
      );
      if (filtered.length > 0) {
        return {
          provider: filtered[0],
          model: this.getDefaultModel(filtered[0]),
          apiKey: ""
        };
      }
    }
    if (constraints?.preferredProviders) {
      const preferred = supportedProviders.find(
        (p) => constraints.preferredProviders.includes(p)
      );
      if (preferred) {
        return {
          provider: preferred,
          model: this.getDefaultModel(preferred),
          apiKey: ""
        };
      }
    }
    return {
      provider: supportedProviders[0],
      model: this.getDefaultModel(supportedProviders[0]),
      apiKey: ""
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
        const capabilities = providerInstance.getCapabilities();
        if (!capabilities.images) {
          continue;
        }
        return await providerInstance.generateImages(request);
      } catch (error) {
        continue;
      }
    }
    throw new BaseSDKError(
      "All fallback providers failed for image generation",
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
   * Get fallback providers for image generation
   */
  getFallbackProviders(failedProvider) {
    const fallbackMap = {
      "openai": ["azure"],
      // Azure also supports DALL-E
      "azure": ["openai"]
    };
    const fallbacks = fallbackMap[failedProvider.provider] || [];
    return fallbacks.map((provider) => ({
      provider,
      model: this.getDefaultModel(provider),
      apiKey: ""
    }));
  }
  /**
   * Get default model for image generation
   */
  getDefaultModel(provider) {
    const defaultModels = {
      "openai": "dall-e-3",
      "azure": "dall-e-3"
    };
    return defaultModels[provider] || "dall-e-3";
  }
};
function createImages(options) {
  return new Images(options);
}
async function generateImage(prompt, options) {
  const images = new Images({ provider: options?.provider });
  return images.create(prompt, options);
}
async function generateImages(prompt, count, options) {
  const images = new Images({ provider: options?.provider });
  return images.createBatch(prompt, count, options);
}

export { Images, createImages, generateImage, generateImages };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map