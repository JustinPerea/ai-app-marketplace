/**
 * AI Marketplace SDK Client
 *
 * Main client class for the AI Marketplace SDK
 * Provides a unified interface for multiple AI providers with ML-powered routing
 */
import { APIProvider, AIRequest, AIResponse, AIStreamChunk, AIModel, ClientOptions, SDKConfig } from './types';
export declare class AIMarketplaceClient {
    private providers;
    private apiKeys;
    private config;
    private cache;
    private mlRouter;
    private userId;
    constructor(options: ClientOptions);
    /**
     * Send a chat completion request with intelligent routing
     */
    chat(request: AIRequest, options?: {
        provider?: APIProvider;
        userId?: string;
        useCache?: boolean;
        enableMLRouting?: boolean;
        optimizeFor?: 'cost' | 'speed' | 'quality' | 'balanced';
    }): Promise<AIResponse>;
    /**
     * Send a streaming chat completion request
     */
    chatStream(request: AIRequest, options?: {
        provider?: APIProvider;
        userId?: string;
        enableMLRouting?: boolean;
        optimizeFor?: 'cost' | 'speed' | 'quality' | 'balanced';
    }): AsyncIterable<AIStreamChunk>;
    /**
     * Get available models from all providers
     */
    getModels(provider?: APIProvider): Promise<AIModel[]>;
    /**
     * Validate API keys for all providers
     */
    validateApiKeys(): Promise<Record<APIProvider, boolean>>;
    /**
     * Get ML insights and analytics
     */
    getAnalytics(userId?: string): Promise<{
        totalPredictions: number;
        averageConfidence: number;
        accuracyMetrics: {
            costAccuracy: number;
            timeAccuracy: number;
            qualityAccuracy: number;
        };
        userPatterns?: {
            commonRequestTypes: Array<{
                type: import("./types").RequestType;
                frequency: number;
            }>;
            preferredProviders: Array<{
                provider: APIProvider;
                usage: number;
            }>;
            costSavingsAchieved: number;
        };
        modelRecommendations: Array<{
            scenario: string;
            recommendedProvider: APIProvider;
            expectedSavings: number;
        }>;
        monitoringData?: {
            driftDetections: number;
            activeAlerts: number;
            systemHealth: string;
            claude4Performance: any;
        };
        abTestingSummary?: {
            activeTests: number;
            completedTests: number;
            significantResults: number;
        };
    }>;
    /**
     * Estimate cost for a request
     */
    estimateCost(request: AIRequest, provider?: APIProvider): Promise<{
        provider: APIProvider;
        cost: number;
    }[]>;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<SDKConfig>): void;
    private initializeProviders;
    private getAvailableProviders;
    private getApiKey;
    private getDefaultModelForProvider;
    private generateCacheKey;
    private hashContent;
    private getCachedResponse;
    private setCachedResponse;
    private handleFallback;
    private startCacheCleanup;
    private generateUserId;
}
//# sourceMappingURL=client.d.ts.map