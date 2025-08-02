/**
 * ML-Powered Intelligent AI Provider Router
 *
 * Enhanced ML router with real-time accuracy monitoring for Claude 4 integration
 * Features:
 * - Advanced machine learning for optimal provider selection
 * - Context-aware routing based on request patterns
 * - Cost and performance optimization
 * - Learning from usage patterns
 * - Real-time accuracy monitoring and drift detection
 * - A/B testing integration
 * - Performance monitoring with minimal overhead
 */
import { APIProvider, AIRequest, AIResponse, PredictionResult, MLRouteDecision, RequestType } from '../types';
interface RoutingOptions {
    optimizeFor?: 'cost' | 'speed' | 'quality' | 'balanced';
    maxCost?: number;
    minQuality?: number;
    maxResponseTime?: number;
}
interface EnhancedRoutingOptions extends RoutingOptions {
    enableAccuracyMonitoring?: boolean;
    enableABTesting?: boolean;
    enablePerformanceMonitoring?: boolean;
    monitoringConfig?: {
        samplingRate?: number;
        asyncProcessing?: boolean;
    };
}
export declare class MLIntelligentRouter {
    private performanceHistory;
    private learningData;
    private userPatterns;
    private accuracyMonitor;
    private abTesting;
    private performanceMonitor;
    private readonly LEARNING_RATE;
    private readonly MIN_SAMPLES_FOR_PREDICTION;
    private readonly CONFIDENCE_THRESHOLD;
    private readonly MAX_LEARNING_DATA;
    private accuracyMonitoringEnabled;
    private abTestingEnabled;
    private performanceMonitoringEnabled;
    constructor(config?: {
        enableAccuracyMonitoring?: boolean;
        enableABTesting?: boolean;
        enablePerformanceMonitoring?: boolean;
    });
    /**
     * Main ML-powered routing method with enhanced monitoring
     */
    intelligentRoute(request: AIRequest, userId: string, availableProviders: APIProvider[], options?: EnhancedRoutingOptions): Promise<MLRouteDecision & {
        routingMetrics?: {
            routingTime: number;
            monitoringOverhead: number;
        };
    }>;
    /**
     * Enhanced learning method with accuracy monitoring integration
     */
    learnFromExecution(request: AIRequest, userId: string, actualProvider: APIProvider, actualModel: string, actualResponse: AIResponse, actualResponseTime: number, prediction?: PredictionResult, userSatisfaction?: number): Promise<void>;
    /**
     * Get enhanced ML insights with monitoring data
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
    private initializeMLSystem;
    /**
     * Initialize Claude 4 monitoring with baseline A/B test
     */
    private initializeClaude4Monitoring;
    /**
     * Check if user should participate in A/B testing
     */
    private checkABTestParticipation;
    /**
     * Get user's current A/B test assignment
     */
    private getUserABTestAssignment;
    /**
     * Adjust predictions with real-time monitoring data
     */
    private adjustPredictionsWithMonitoringData;
    /**
     * Calculate accuracy between predicted and actual values
     */
    private calculateAccuracy;
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