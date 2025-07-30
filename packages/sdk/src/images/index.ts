/**
 * Images Module - Image Generation Interface
 * 
 * Provides high-level image generation interface with provider abstraction
 */

import type {
  ImageGenerationRequest,
  ImageGenerationResponse,
  ProviderConfig,
  ProviderConstraints
} from '../types';

import { providerRegistry } from '../providers/base';
import { BaseSDKError } from '../utils/errors';

export interface ImageOptions {
  provider?: ProviderConfig;
  constraints?: ProviderConstraints;
  enableAutoRetry?: boolean;
  enableFallback?: boolean;
}

/**
 * High-level Images interface with provider abstraction
 */
export class Images {
  private defaultProvider?: ProviderConfig;
  private options: ImageOptions;

  constructor(options: ImageOptions = {}) {
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
  async generate(
    request: ImageGenerationRequest,
    options?: Partial<ImageOptions>
  ): Promise<ImageGenerationResponse> {
    const mergedOptions = { ...this.options, ...options };
    
    // Select optimal provider
    const providerConfig = await this.selectProvider(request, mergedOptions);
    
    // Get provider instance
    const provider = providerRegistry.getProvider(providerConfig);
    
    // Check if provider supports image generation
    const capabilities = provider.getCapabilities();
    if (!capabilities.images) {
      throw new BaseSDKError(
        `Provider ${providerConfig.provider} does not support image generation`,
        'UNSUPPORTED_OPERATION',
        { provider: providerConfig.provider }
      );
    }

    try {
      return await provider.generateImages(request);
    } catch (error) {
      // Handle fallback if enabled
      if (mergedOptions.enableFallback && this.shouldFallback(error)) {
        return this.executeWithFallback(request, providerConfig, mergedOptions);
      }
      throw error;
    }
  }

  /**
   * Generate a single image (convenience method)
   */
  async create(
    prompt: string,
    options?: {
      size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
      quality?: 'standard' | 'hd';
      style?: 'vivid' | 'natural';
      model?: string;
    } & Partial<ImageOptions>
  ): Promise<string> {
    const request: ImageGenerationRequest = {
      prompt,
      n: 1,
      response_format: 'url',
      ...(options?.size && { size: options.size }),
      ...(options?.quality && { quality: options.quality }),
      ...(options?.style && { style: options.style }),
      ...(options?.model && { model: options.model })
    };

    const response = await this.generate(request, options);
    
    if (!response.data[0]?.url) {
      throw new BaseSDKError(
        'No image URL returned from provider',
        'INVALID_RESPONSE'
      );
    }

    return response.data[0].url;
  }

  /**
   * Generate multiple images
   */
  async createBatch(
    prompt: string,
    count: number,
    options?: {
      size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
      quality?: 'standard' | 'hd';
      style?: 'vivid' | 'natural';
      model?: string;
    } & Partial<ImageOptions>
  ): Promise<string[]> {
    if (count <= 0 || count > 10) {
      throw new BaseSDKError(
        'Image count must be between 1 and 10',
        'VALIDATION_ERROR',
        { details: { field: 'count', value: count } }
      );
    }

    const request: ImageGenerationRequest = {
      prompt,
      n: count,
      response_format: 'url',
      ...(options?.size && { size: options.size }),
      ...(options?.quality && { quality: options.quality }),
      ...(options?.style && { style: options.style }),
      ...(options?.model && { model: options.model })
    };

    const response = await this.generate(request, options);
    
    return response.data
      .map(item => item.url)
      .filter(url => url !== undefined) as string[];
  }

  /**
   * Generate image variations (if supported by provider)
   */
  async createVariations(
    originalImageUrl: string,
    options?: {
      n?: number;
      size?: '256x256' | '512x512' | '1024x1024';
      response_format?: 'url' | 'b64_json';
    } & Partial<ImageOptions>
  ): Promise<ImageGenerationResponse> {
    // This would need to be implemented per provider
    // For now, throw an error as it's not commonly supported
    throw new BaseSDKError(
      'Image variations not yet supported',
      'UNSUPPORTED_OPERATION'
    );
  }

  /**
   * Get supported image sizes for current provider
   */
  getSupportedSizes(provider?: string): string[] {
    const supportedSizes: Record<string, string[]> = {
      'openai': ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'],
      'azure': ['256x256', '512x512', '1024x1024'],
      // Add other providers as they support image generation
    };

    const providerName = provider || this.defaultProvider?.provider || 'openai';
    return supportedSizes[providerName] || ['1024x1024'];
  }

  /**
   * Estimate cost for image generation
   */
  async estimateCost(
    request: ImageGenerationRequest,
    provider?: string
  ): Promise<number> {
    const providerName = provider || this.defaultProvider?.provider || 'openai';
    
    // Cost estimation based on provider and request
    const costPerImage: Record<string, number> = {
      'openai': request.quality === 'hd' ? 0.08 : 0.04,
      'azure': 0.04
    };

    const baseCost = costPerImage[providerName] || 0.04;
    return baseCost * (request.n || 1);
  }

  /**
   * Select optimal provider based on request and constraints
   */
  private async selectProvider(
    request: ImageGenerationRequest,
    options: ImageOptions
  ): Promise<ProviderConfig> {
    // Use explicit provider if specified
    if (options.provider) {
      return options.provider;
    }

    // Use default provider if no constraints
    if (this.defaultProvider && !options.constraints) {
      return this.defaultProvider;
    }

    // Find providers that support image generation
    const supportedProviders = providerRegistry.getRegisteredProviders()
      .filter(provider => {
        const testConfig: ProviderConfig = {
          provider,
          model: this.getDefaultModel(provider),
          apiKey: ''
        };
        const providerInstance = providerRegistry.getProvider(testConfig);
        return providerInstance.getCapabilities().images;
      });

    if (supportedProviders.length === 0) {
      throw new BaseSDKError(
        'No providers support image generation',
        'NO_SUITABLE_PROVIDER'
      );
    }

    // Apply constraints and select best provider
    const constraints = options.constraints;
    if (constraints?.excludeProviders) {
      const filtered = supportedProviders.filter(
        p => !constraints.excludeProviders!.includes(p)
      );
      if (filtered.length > 0) {
        return {
          provider: filtered[0],
          model: this.getDefaultModel(filtered[0]),
          apiKey: ''
        };
      }
    }

    if (constraints?.preferredProviders) {
      const preferred = supportedProviders.find(
        p => constraints.preferredProviders!.includes(p)
      );
      if (preferred) {
        return {
          provider: preferred,
          model: this.getDefaultModel(preferred),
          apiKey: ''
        };
      }
    }

    // Default to first available provider
    return {
      provider: supportedProviders[0],
      model: this.getDefaultModel(supportedProviders[0]),
      apiKey: ''
    };
  }

  /**
   * Execute request with fallback providers
   */
  private async executeWithFallback(
    request: ImageGenerationRequest,
    failedProvider: ProviderConfig,
    options: ImageOptions
  ): Promise<ImageGenerationResponse> {
    const fallbackProviders = this.getFallbackProviders(failedProvider);
    
    for (const provider of fallbackProviders) {
      try {
        const providerInstance = providerRegistry.getProvider(provider);
        const capabilities = providerInstance.getCapabilities();
        
        if (!capabilities.images) {
          continue; // Skip providers that don't support images
        }

        return await providerInstance.generateImages(request);
      } catch (error) {
        // Continue to next fallback
        continue;
      }
    }

    throw new BaseSDKError(
      'All fallback providers failed for image generation',
      'ALL_PROVIDERS_FAILED',
      { details: { originalProvider: failedProvider.provider } }
    );
  }

  /**
   * Determine if error should trigger fallback
   */
  private shouldFallback(error: any): boolean {
    // Fallback on rate limits, server errors, but not auth/validation errors
    if (error.code === 'RATE_LIMIT_EXCEEDED') return true;
    if (error.statusCode && error.statusCode >= 500) return true;
    if (error.code === 'NETWORK_ERROR') return true;
    return false;
  }

  /**
   * Get fallback providers for image generation
   */
  private getFallbackProviders(failedProvider: ProviderConfig): ProviderConfig[] {
    const fallbackMap: Record<string, string[]> = {
      'openai': ['azure'], // Azure also supports DALL-E
      'azure': ['openai']
    };

    const fallbacks = fallbackMap[failedProvider.provider] || [];
    return fallbacks.map(provider => ({
      provider: provider as any,
      model: this.getDefaultModel(provider as any),
      apiKey: ''
    }));
  }

  /**
   * Get default model for image generation
   */
  private getDefaultModel(provider: string): string {
    const defaultModels: Record<string, string> = {
      'openai': 'dall-e-3',
      'azure': 'dall-e-3'
    };
    return defaultModels[provider] || 'dall-e-3';
  }
}

/**
 * Convenience function to create Images instance
 */
export function createImages(options?: ImageOptions): Images {
  return new Images(options);
}

/**
 * Quick helper functions
 */
export async function generateImage(
  prompt: string,
  options?: {
    provider?: ProviderConfig;
    size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
  }
): Promise<string> {
  const images = new Images({ provider: options?.provider });
  return images.create(prompt, options);
}

export async function generateImages(
  prompt: string,
  count: number,
  options?: {
    provider?: ProviderConfig;
    size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
  }
): Promise<string[]> {
  const images = new Images({ provider: options?.provider });
  return images.createBatch(prompt, count, options);
}