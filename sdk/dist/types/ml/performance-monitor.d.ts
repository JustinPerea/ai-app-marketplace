/**
 * Performance Monitoring System
 *
 * Monitors system performance with:
 * - Async processing to minimize latency impact
 * - Intelligent sampling strategies for high-volume scenarios
 * - Real-time performance metrics collection
 * - Resource usage tracking and alerts
 */
import { APIProvider, AIRequest, AIResponse, PredictionResult, LearningData } from '../types';
export interface PerformanceMetric {
    timestamp: number;
    metric: string;
    value: number;
    provider?: APIProvider;
    model?: string;
    userId?: string;
    tags?: Record<string, string>;
}
export interface SystemPerformanceSnapshot {
    timestamp: number;
    avgResponseTime: number;
    p50ResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    requestsPerSecond: number;
    totalRequests: number;
    errorRate: number;
    timeoutRate: number;
    memoryUsage: number;
    cpuUsage: number;
    routingAccuracy: number;
    routingLatency: number;
    predictionConfidence: number;
    providerDistribution: Record<APIProvider, number>;
    avgQualityScore: number;
    userSatisfactionScore: number;
}
export interface PerformanceAlert {
    id: string;
    type: 'latency_spike' | 'error_rate_high' | 'memory_usage_high' | 'throughput_low' | 'accuracy_drop';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    value: number;
    threshold: number;
    timestamp: number;
    resolved: boolean;
    duration?: number;
}
interface SamplingConfig {
    strategy: 'uniform' | 'adaptive' | 'tiered';
    baseRate: number;
    highVolumeThreshold: number;
    errorSamplingRate: number;
    slowRequestThreshold: number;
}
interface PerformanceThresholds {
    maxResponseTime: number;
    maxErrorRate: number;
    maxMemoryUsage: number;
    minThroughput: number;
    minAccuracy: number;
    maxRoutingLatency: number;
}
export declare class PerformanceMonitor {
    private metrics;
    private snapshots;
    private alerts;
    private samplingConfig;
    private thresholds;
    private metricQueue;
    private processingTimer?;
    private isProcessing;
    private requestTimes;
    private errorCount;
    private totalRequests;
    private currentRPS;
    private rpsWindow;
    private memoryUsage;
    private cpuUsage;
    private snapshotInterval;
    private snapshotTimer?;
    constructor(samplingConfig?: Partial<SamplingConfig>, thresholds?: Partial<PerformanceThresholds>);
    /**
     * Record a performance metric (async processing)
     */
    recordMetric(metric: PerformanceMetric): void;
    /**
     * Record request completion
     */
    recordRequest(request: AIRequest, response: AIResponse | null, responseTime: number, error?: Error, provider?: APIProvider, model?: string): void;
    /**
     * Record ML routing performance
     */
    recordRoutingPerformance(routingTime: number, prediction: PredictionResult, actualResult?: LearningData): void;
    /**
     * Get current performance snapshot
     */
    getCurrentSnapshot(): SystemPerformanceSnapshot;
    /**
     * Get performance alerts
     */
    getAlerts(unresolved?: boolean): PerformanceAlert[];
    /**
     * Get performance trends over time
     */
    getPerformanceTrends(hours?: number): {
        responseTime: Array<{
            timestamp: number;
            value: number;
        }>;
        throughput: Array<{
            timestamp: number;
            value: number;
        }>;
        errorRate: Array<{
            timestamp: number;
            value: number;
        }>;
        accuracy: Array<{
            timestamp: number;
            value: number;
        }>;
    };
    /**
     * Get system health status
     */
    getHealthStatus(): {
        status: 'healthy' | 'warning' | 'critical';
        issues: string[];
        score: number;
    };
    /**
     * Get monitoring overhead metrics
     */
    getMonitoringOverhead(): {
        queueSize: number;
        processingLatency: number;
        memoryFootprint: number;
        samplingRate: number;
    };
    private shouldSample;
    private getCurrentSamplingRate;
    private updateRPS;
    private checkImmediateAlerts;
    private calculateRecentErrorRate;
    private createAlert;
    private processQueue;
    private startPeriodicProcessing;
    private startPeriodicSnapshots;
    private startResourceMonitoring;
    private calculateAverage;
    private calculatePercentile;
    private calculateTimeoutRate;
    private calculateRoutingAccuracy;
    private calculateAverageRoutingLatency;
    private calculateAveragePredictionConfidence;
    private calculateProviderDistribution;
    private getCurrentMemoryUsage;
    private getCurrentCPUUsage;
    private estimateMemoryFootprint;
    /**
     * Cleanup method
     */
    destroy(): void;
}
export {};
//# sourceMappingURL=performance-monitor.d.ts.map