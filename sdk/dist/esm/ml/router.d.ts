/**
 * ML-Powered Intelligent AI Provider Router
 *
 * Simplified version of the ML router for the standalone SDK
 * Features:
 * - Basic machine learning for optimal provider selection
 * - Context-aware routing based on request patterns
 * - Cost and performance optimization
 * - Learning from usage patterns
 */
import { APIProvider, AIRequest, AIResponse, MLRouteDecision, RequestType } from '../types';
interface RoutingOptions {
    optimizeFor?: 'cost' | 'speed' | 'quality' | 'balanced';
    maxCost?: number;
    minQuality?: number;
    maxResponseTime?: number;
}
export declare class MLIntelligentRouter {
    private performanceHistory;
    private learningData;
    private userPatterns;
    private readonly LEARNING_RATE;
    private readonly MIN_SAMPLES_FOR_PREDICTION;
    private readonly CONFIDENCE_THRESHOLD;
    private readonly MAX_LEARNING_DATA;
    constructor();
    /**
     * Main ML-powered routing method
     */
    intelligentRoute(request: AIRequest, userId: string, availableProviders: APIProvider[], options?: RoutingOptions): Promise<MLRouteDecision>;
    /**
     * Learn from actual performance to improve predictions
     */
    learnFromExecution(request: AIRequest, userId: string, actualProvider: APIProvider, actualModel: string, actualResponse: AIResponse, actualResponseTime: number, userSatisfaction?: number): Promise<void>;
    /**
     * Get ML insights and recommendations
     */
    getMLInsights(userId?: string): Promise<{
        totalPredictions: number;
        averageConfidence: number;
        accuracyMetrics: {
            costAccuracy: number;
            timeAccuracy: number;
            qualityAccuracy: number;
        };
        userPatterns?: {
            commonRequestTypes: Array<{
                type: RequestType;
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
    }>;
    private initializeMLSystem;
    private extractRequestFeatures;
    private calculateComplexityScore;
    private classifyRequestType;
    private getUserPatternId;
    private getMostCommonRequestType;
    private predictProviderPerformance;
    private predictSingleProviderPerformance;
    private getBaselineEstimate;
    private filterRelevantHistoricalData;
    private calculateWeightedPredictions;
    private calculatePredictionConfidence;
    private filterPredictions;
    private selectOptimalProvider;
    private calculateOptimizationScore;
    private fallbackRouting;
    private generateMLReasoning;
    private calculateActualQuality;
    private updatePerformanceHistory;
    private updateUserPatterns;
    private getProviderModels;
    private initializeBaselinePerformance;
    private calculateAverageConfidence;
    private calculateAccuracyMetrics;
    private generateModelRecommendations;
    private analyzeUserPatterns;
}
export {};
//# sourceMappingURL=router.d.ts.map