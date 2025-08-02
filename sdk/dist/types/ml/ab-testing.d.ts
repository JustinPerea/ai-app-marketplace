/**
 * A/B Testing Framework for ML Provider Comparison
 *
 * Provides statistical A/B testing capabilities for comparing:
 * - Claude 4 vs other providers
 * - Different model configurations
 * - Routing strategies
 *
 * Features:
 * - Statistical significance testing
 * - Experiment management
 * - Real-time results tracking
 * - Automated experiment conclusion
 */
import { APIProvider, AIRequest, AIResponse, PredictionResult } from '../types';
export interface ABTestConfig {
    id: string;
    name: string;
    description: string;
    hypothesis: string;
    variantA: {
        provider: APIProvider;
        model: string;
        weight: number;
    };
    variantB: {
        provider: APIProvider;
        model: string;
        weight: number;
    };
    minSampleSize: number;
    maxDuration: number;
    significanceLevel: number;
    minimumDetectableEffect: number;
    trafficAllocation: number;
    userSegments?: string[];
    requestTypes?: string[];
    primaryMetric: 'cost' | 'responseTime' | 'quality' | 'accuracy' | 'userSatisfaction';
    secondaryMetrics: Array<'cost' | 'responseTime' | 'quality' | 'accuracy' | 'userSatisfaction'>;
    status: 'draft' | 'running' | 'paused' | 'completed' | 'stopped';
    startTime?: number;
    endTime?: number;
    autoStop: {
        enabled: boolean;
        winnerThreshold: number;
        futilityThreshold: number;
    };
}
export interface ABTestResult {
    testId: string;
    variant: 'A' | 'B';
    userId: string;
    requestId: string;
    timestamp: number;
    request: AIRequest;
    prediction: PredictionResult;
    actualResponse: AIResponse;
    actualCost: number;
    actualResponseTime: number;
    actualQuality: number;
    userSatisfaction?: number;
    costAccuracy: number;
    timeAccuracy: number;
    qualityAccuracy: number;
}
export interface ABTestAnalysis {
    testId: string;
    status: 'insufficient_data' | 'no_significant_difference' | 'variant_a_wins' | 'variant_b_wins' | 'inconclusive';
    sampleSizes: {
        variantA: number;
        variantB: number;
    };
    means: {
        variantA: number;
        variantB: number;
    };
    standardDeviations: {
        variantA: number;
        variantB: number;
    };
    effect: number;
    pValue: number;
    confidence: number;
    isSignificant: boolean;
    primaryMetricResults: {
        variantA: {
            mean: number;
            std: number;
            samples: number;
        };
        variantB: {
            mean: number;
            std: number;
            samples: number;
        };
        improvement: number;
        confidenceInterval: [number, number];
    };
    secondaryMetricResults: Record<string, {
        variantA: {
            mean: number;
            std: number;
        };
        variantB: {
            mean: number;
            std: number;
        };
        improvement: number;
        isSignificant: boolean;
    }>;
    recommendation: 'continue_test' | 'choose_variant_a' | 'choose_variant_b' | 'no_clear_winner' | 'stop_test';
    recommendationReason: string;
    confidenceLevel: number;
    projectedTimeToSignificance?: number;
    projectedSampleSizeNeeded?: number;
}
export declare class ABTestingFramework {
    private experiments;
    private userAssignments;
    private analysisInterval;
    private analysisTimer?;
    constructor();
    /**
     * Create a new A/B test
     */
    createTest(config: ABTestConfig): void;
    /**
     * Start an A/B test
     */
    startTest(testId: string): void;
    /**
     * Stop an A/B test
     */
    stopTest(testId: string, reason?: string): void;
    /**
     * Determine if a request should participate in A/B testing
     */
    shouldParticipateInTest(testId: string, userId: string, request: AIRequest): boolean;
    /**
     * Assign a user to a variant for a specific test
     */
    assignVariant(testId: string, userId: string): 'A' | 'B' | null;
    /**
     * Get the provider and model for a specific variant
     */
    getVariantConfig(testId: string, variant: 'A' | 'B'): {
        provider: APIProvider;
        model: string;
    } | null;
    /**
     * Record a test result
     */
    recordResult(result: ABTestResult): void;
    /**
     * Get current test analysis
     */
    getTestAnalysis(testId: string): ABTestAnalysis | null;
    /**
     * Get list of all tests
     */
    getAllTests(): ABTestConfig[];
    /**
     * Get running tests
     */
    getRunningTests(): ABTestConfig[];
    /**
     * Manually trigger analysis for a test
     */
    analyzeTest(testId: string): ABTestAnalysis | null;
    private validateTestConfig;
    private performStatisticalAnalysis;
    private extractMetricValues;
    private calculateMean;
    private calculateStandardDeviation;
    private performTTest;
    private approximatePValue;
    private calculateConfidenceInterval;
    private startPeriodicAnalysis;
    private performPeriodicAnalysis;
    /**
     * Cleanup method to stop timers
     */
    destroy(): void;
}
//# sourceMappingURL=ab-testing.d.ts.map