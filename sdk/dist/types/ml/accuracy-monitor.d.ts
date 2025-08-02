/**
 * Real-time ML Accuracy Monitoring System
 *
 * Monitors and tracks ML routing accuracy in real-time with:
 * - Performance drift detection for Claude 4 integration
 * - Statistical analysis of accuracy metrics
 * - Real-time quality score updates
 * - Production-ready monitoring with minimal overhead
 */
import { APIProvider, RequestFeatures, PredictionResult, LearningData } from '../types';
export interface AccuracyMetrics {
    costAccuracy: number;
    responseTimeAccuracy: number;
    qualityAccuracy: number;
    overallAccuracy: number;
    sampleSize: number;
    confidenceInterval: [number, number];
    timestamp: number;
}
export interface DriftDetectionResult {
    isDriftDetected: boolean;
    driftMagnitude: number;
    affectedMetrics: ('cost' | 'responseTime' | 'quality')[];
    significance: number;
    recommendedAction: 'monitor' | 'investigate' | 'alert' | 'fallback';
    details: {
        baseline: AccuracyMetrics;
        current: AccuracyMetrics;
        statisticalTests: Record<string, number>;
    };
}
export interface ModelComparisonResult {
    baselineModel: {
        provider: APIProvider;
        model: string;
    };
    comparisonModel: {
        provider: APIProvider;
        model: string;
    };
    performanceDelta: {
        costDifference: number;
        responseTimeDifference: number;
        qualityDifference: number;
    };
    isSignificant: boolean;
    confidence: number;
    recommendation: 'prefer_baseline' | 'prefer_comparison' | 'equivalent' | 'insufficient_data';
}
export interface MonitoringAlert {
    id: string;
    type: 'accuracy_degradation' | 'drift_detected' | 'performance_anomaly' | 'statistical_significance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    provider: APIProvider;
    model: string;
    metrics: Partial<AccuracyMetrics>;
    message: string;
    timestamp: number;
    resolved: boolean;
}
export interface QualityScoreUpdate {
    provider: APIProvider;
    model: string;
    previousScore: number;
    newScore: number;
    confidence: number;
    sampleSize: number;
    updateReason: 'drift_correction' | 'new_data' | 'performance_improvement' | 'performance_degradation';
    timestamp: number;
}
interface MonitoringConfig {
    driftThreshold: number;
    accuracyThreshold: number;
    minSampleSize: number;
    confidenceLevel: number;
    alertCooldownMs: number;
    maxHistorySize: number;
    samplingRate: number;
    asyncProcessing: boolean;
}
export declare class MLAccuracyMonitor {
    private config;
    private accuracyHistory;
    private predictionHistory;
    private qualityScores;
    private alerts;
    private lastAlertTime;
    private claude4Baseline;
    private claude3SonnetBaseline;
    private monitoringOverhead;
    private processingQueue;
    private isProcessing;
    constructor(config?: Partial<MonitoringConfig>);
    /**
     * Main method to track ML prediction accuracy
     */
    trackPredictionAccuracy(prediction: PredictionResult, actualResult: LearningData, requestFeatures: RequestFeatures): Promise<void>;
    /**
     * Detect performance drift for Claude 4 vs previous models
     */
    detectClaude4Drift(): Promise<DriftDetectionResult | null>;
    /**
     * Compare Claude 4 performance against other providers
     */
    compareModelPerformance(baselineProvider: APIProvider, baselineModel: string, comparisonProvider: APIProvider, comparisonModel: string): Promise<ModelComparisonResult | null>;
    /**
     * Update quality scores based on production data
     */
    updateQualityScores(provider: APIProvider, model: string, newData: LearningData[]): Promise<QualityScoreUpdate | null>;
    /**
     * Get current accuracy metrics for a model
     */
    getCurrentAccuracyMetrics(modelKey: string): AccuracyMetrics | null;
    /**
     * Get monitoring alerts
     */
    getAlerts(unresolved?: boolean): MonitoringAlert[];
    /**
     * Get monitoring performance metrics
     */
    getMonitoringPerformance(): {
        averageOverheadMs: number;
        maxOverheadMs: number;
        overheadPercentile95: number;
        queueSize: number;
    };
    /**
     * Get comprehensive monitoring insights
     */
    getMonitoringInsights(): {
        totalModelsTracked: number;
        totalPredictionsAnalyzed: number;
        averageAccuracy: number;
        driftDetections: number;
        alertsSummary: Record<string, number>;
        topPerformingModels: Array<{
            modelKey: string;
            accuracy: number;
        }>;
        monitoringPerformance: ReturnType<MLAccuracyMonitor['getMonitoringPerformance']>;
    };
    private processAccuracyTracking;
    private calculateAccuracyMetrics;
    private calculateConfidenceInterval;
    private performDriftDetection;
    private performModelComparison;
    private calculateStatisticalSignificance;
    private checkForAnomalies;
    private createAlert;
    private processQueue;
    private initializeBaselines;
    private getBaseline;
    private calculateOverallAccuracy;
    private getAlertsSummary;
    private getTopPerformingModels;
}
export {};
//# sourceMappingURL=accuracy-monitor.d.ts.map