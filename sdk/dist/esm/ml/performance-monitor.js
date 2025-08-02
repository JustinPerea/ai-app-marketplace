/**
 * Performance Monitoring System
 *
 * Monitors system performance with:
 * - Async processing to minimize latency impact
 * - Intelligent sampling strategies for high-volume scenarios
 * - Real-time performance metrics collection
 * - Resource usage tracking and alerts
 */
import { APIProvider, } from '../types';
const DEFAULT_SAMPLING_CONFIG = {
    strategy: 'adaptive',
    baseRate: 1.0,
    highVolumeThreshold: 100, // 100 RPS
    errorSamplingRate: 1.0, // Always sample errors
    slowRequestThreshold: 5000, // 5 seconds
};
const DEFAULT_THRESHOLDS = {
    maxResponseTime: 5000, // 5 seconds
    maxErrorRate: 0.05, // 5%
    maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
    minThroughput: 10, // 10 RPS minimum
    minAccuracy: 0.95, // 95%
    maxRoutingLatency: 200, // 200ms for ML routing
};
export class PerformanceMonitor {
    constructor(samplingConfig = {}, thresholds = {}) {
        this.metrics = [];
        this.snapshots = [];
        this.alerts = [];
        // Processing queues
        this.metricQueue = [];
        this.isProcessing = false;
        // Performance tracking
        this.requestTimes = [];
        this.errorCount = 0;
        this.totalRequests = 0;
        this.currentRPS = 0;
        this.rpsWindow = [];
        // Resource monitoring
        this.memoryUsage = [];
        this.cpuUsage = [];
        // Snapshot interval
        this.snapshotInterval = 60000; // 1 minute
        this.samplingConfig = { ...DEFAULT_SAMPLING_CONFIG, ...samplingConfig };
        this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
        this.startPeriodicProcessing();
        this.startPeriodicSnapshots();
        this.startResourceMonitoring();
    }
    /**
     * Record a performance metric (async processing)
     */
    recordMetric(metric) {
        // Apply sampling
        if (!this.shouldSample(metric)) {
            return;
        }
        // Queue for async processing
        this.metricQueue.push(metric);
        // Process immediately if queue is getting large
        if (this.metricQueue.length > 1000) {
            this.processQueue();
        }
    }
    /**
     * Record request completion
     */
    recordRequest(request, response, responseTime, error, provider, model) {
        this.totalRequests++;
        // Track response time
        this.requestTimes.push(responseTime);
        if (this.requestTimes.length > 10000) {
            this.requestTimes = this.requestTimes.slice(-5000);
        }
        // Track errors
        if (error || !response) {
            this.errorCount++;
        }
        // Update RPS
        this.updateRPS();
        // Record detailed metrics
        const timestamp = Date.now();
        this.recordMetric({
            timestamp,
            metric: 'request_response_time',
            value: responseTime,
            provider,
            model,
            tags: {
                status: error ? 'error' : 'success',
                messageCount: request.messages.length.toString(),
            },
        });
        if (error) {
            this.recordMetric({
                timestamp,
                metric: 'request_error',
                value: 1,
                provider,
                model,
                tags: {
                    errorType: error.constructor.name,
                    errorMessage: error.message,
                },
            });
        }
        // Check for immediate alerts
        this.checkImmediateAlerts(responseTime, error !== undefined);
    }
    /**
     * Record ML routing performance
     */
    recordRoutingPerformance(routingTime, prediction, actualResult) {
        const timestamp = Date.now();
        this.recordMetric({
            timestamp,
            metric: 'routing_latency',
            value: routingTime,
            provider: prediction.provider,
            model: prediction.model,
            tags: {
                confidence: prediction.confidence.toString(),
            },
        });
        this.recordMetric({
            timestamp,
            metric: 'prediction_confidence',
            value: prediction.confidence,
            provider: prediction.provider,
            model: prediction.model,
        });
        if (actualResult) {
            const costAccuracy = 1 - Math.abs(prediction.predictedCost - actualResult.actualCost) / Math.max(actualResult.actualCost, 0.001);
            this.recordMetric({
                timestamp,
                metric: 'prediction_accuracy',
                value: Math.max(0, costAccuracy),
                provider: prediction.provider,
                model: prediction.model,
                tags: {
                    metricType: 'cost',
                },
            });
        }
    }
    /**
     * Get current performance snapshot
     */
    getCurrentSnapshot() {
        const now = Date.now();
        const recentMetrics = this.metrics.filter(m => now - m.timestamp < 300000); // Last 5 minutes
        return {
            timestamp: now,
            avgResponseTime: this.calculateAverage(this.requestTimes),
            p50ResponseTime: this.calculatePercentile(this.requestTimes, 0.5),
            p95ResponseTime: this.calculatePercentile(this.requestTimes, 0.95),
            p99ResponseTime: this.calculatePercentile(this.requestTimes, 0.99),
            requestsPerSecond: this.currentRPS,
            totalRequests: this.totalRequests,
            errorRate: this.totalRequests > 0 ? this.errorCount / this.totalRequests : 0,
            timeoutRate: this.calculateTimeoutRate(recentMetrics),
            memoryUsage: this.getCurrentMemoryUsage(),
            cpuUsage: this.getCurrentCPUUsage(),
            routingAccuracy: this.calculateRoutingAccuracy(recentMetrics),
            routingLatency: this.calculateAverageRoutingLatency(recentMetrics),
            predictionConfidence: this.calculateAveragePredictionConfidence(recentMetrics),
            providerDistribution: this.calculateProviderDistribution(recentMetrics),
            avgQualityScore: 0.85, // Placeholder - would be calculated from actual quality data
            userSatisfactionScore: 0.82, // Placeholder - would be calculated from user feedback
        };
    }
    /**
     * Get performance alerts
     */
    getAlerts(unresolved = false) {
        return unresolved ? this.alerts.filter(a => !a.resolved) : this.alerts;
    }
    /**
     * Get performance trends over time
     */
    getPerformanceTrends(hours = 24) {
        const cutoff = Date.now() - (hours * 60 * 60 * 1000);
        const recentSnapshots = this.snapshots.filter(s => s.timestamp > cutoff);
        return {
            responseTime: recentSnapshots.map(s => ({ timestamp: s.timestamp, value: s.avgResponseTime })),
            throughput: recentSnapshots.map(s => ({ timestamp: s.timestamp, value: s.requestsPerSecond })),
            errorRate: recentSnapshots.map(s => ({ timestamp: s.timestamp, value: s.errorRate })),
            accuracy: recentSnapshots.map(s => ({ timestamp: s.timestamp, value: s.routingAccuracy })),
        };
    }
    /**
     * Get system health status
     */
    getHealthStatus() {
        const snapshot = this.getCurrentSnapshot();
        const issues = [];
        let score = 100;
        // Check response time
        if (snapshot.avgResponseTime > this.thresholds.maxResponseTime) {
            issues.push(`High response time: ${snapshot.avgResponseTime.toFixed(0)}ms`);
            score -= 20;
        }
        // Check error rate
        if (snapshot.errorRate > this.thresholds.maxErrorRate) {
            issues.push(`High error rate: ${(snapshot.errorRate * 100).toFixed(1)}%`);
            score -= 25;
        }
        // Check memory usage
        if (snapshot.memoryUsage > this.thresholds.maxMemoryUsage) {
            issues.push(`High memory usage: ${(snapshot.memoryUsage / 1024 / 1024).toFixed(0)}MB`);
            score -= 15;
        }
        // Check throughput
        if (snapshot.requestsPerSecond < this.thresholds.minThroughput && this.totalRequests > 100) {
            issues.push(`Low throughput: ${snapshot.requestsPerSecond.toFixed(1)} RPS`);
            score -= 10;
        }
        // Check routing accuracy
        if (snapshot.routingAccuracy < this.thresholds.minAccuracy) {
            issues.push(`Low routing accuracy: ${(snapshot.routingAccuracy * 100).toFixed(1)}%`);
            score -= 15;
        }
        // Check routing latency
        if (snapshot.routingLatency > this.thresholds.maxRoutingLatency) {
            issues.push(`High routing latency: ${snapshot.routingLatency.toFixed(0)}ms`);
            score -= 10;
        }
        let status = 'healthy';
        if (score < 70)
            status = 'critical';
        else if (score < 85)
            status = 'warning';
        return {
            status,
            issues,
            score: Math.max(0, score),
        };
    }
    /**
     * Get monitoring overhead metrics
     */
    getMonitoringOverhead() {
        return {
            queueSize: this.metricQueue.length,
            processingLatency: 0, // Would measure actual processing time
            memoryFootprint: this.estimateMemoryFootprint(),
            samplingRate: this.getCurrentSamplingRate(),
        };
    }
    // Private Methods
    shouldSample(metric) {
        // Always sample errors and slow requests
        if (metric.metric === 'request_error' ||
            (metric.metric === 'request_response_time' && metric.value > this.samplingConfig.slowRequestThreshold)) {
            return true;
        }
        // Adaptive sampling based on volume
        const currentSamplingRate = this.getCurrentSamplingRate();
        return Math.random() < currentSamplingRate;
    }
    getCurrentSamplingRate() {
        switch (this.samplingConfig.strategy) {
            case 'uniform':
                return this.samplingConfig.baseRate;
            case 'adaptive':
                // Reduce sampling rate when volume is high
                if (this.currentRPS > this.samplingConfig.highVolumeThreshold) {
                    return Math.max(0.1, this.samplingConfig.baseRate * (this.samplingConfig.highVolumeThreshold / this.currentRPS));
                }
                return this.samplingConfig.baseRate;
            case 'tiered':
                // Implement tiered sampling based on RPS
                if (this.currentRPS > 1000)
                    return 0.01;
                if (this.currentRPS > 500)
                    return 0.05;
                if (this.currentRPS > 100)
                    return 0.1;
                return this.samplingConfig.baseRate;
            default:
                return this.samplingConfig.baseRate;
        }
    }
    updateRPS() {
        const now = Date.now();
        const windowStart = now - 60000; // 1 minute window
        // Remove old entries
        this.rpsWindow = this.rpsWindow.filter(entry => entry.timestamp > windowStart);
        // Add current request
        const lastEntry = this.rpsWindow[this.rpsWindow.length - 1];
        if (lastEntry && now - lastEntry.timestamp < 1000) {
            lastEntry.count++;
        }
        else {
            this.rpsWindow.push({ timestamp: now, count: 1 });
        }
        // Calculate current RPS
        const totalRequests = this.rpsWindow.reduce((sum, entry) => sum + entry.count, 0);
        this.currentRPS = totalRequests / 60; // Requests per second over the last minute
    }
    checkImmediateAlerts(responseTime, hasError) {
        const now = Date.now();
        // Check for latency spikes
        if (responseTime > this.thresholds.maxResponseTime) {
            this.createAlert({
                type: 'latency_spike',
                severity: responseTime > this.thresholds.maxResponseTime * 2 ? 'critical' : 'high',
                message: `Request took ${responseTime.toFixed(0)}ms (threshold: ${this.thresholds.maxResponseTime}ms)`,
                value: responseTime,
                threshold: this.thresholds.maxResponseTime,
            });
        }
        // Check error rate
        const recentErrorRate = this.calculateRecentErrorRate();
        if (recentErrorRate > this.thresholds.maxErrorRate) {
            this.createAlert({
                type: 'error_rate_high',
                severity: recentErrorRate > this.thresholds.maxErrorRate * 2 ? 'critical' : 'high',
                message: `Error rate is ${(recentErrorRate * 100).toFixed(1)}% (threshold: ${(this.thresholds.maxErrorRate * 100).toFixed(1)}%)`,
                value: recentErrorRate,
                threshold: this.thresholds.maxErrorRate,
            });
        }
    }
    calculateRecentErrorRate() {
        const recentWindow = 300000; // 5 minutes
        const now = Date.now();
        const recentErrors = this.metrics.filter(m => m.metric === 'request_error' &&
            now - m.timestamp < recentWindow).length;
        const recentRequests = Math.max(1, this.rpsWindow
            .filter(entry => now - entry.timestamp < recentWindow)
            .reduce((sum, entry) => sum + entry.count, 0));
        return recentErrors / recentRequests;
    }
    createAlert(alertData) {
        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            resolved: false,
            ...alertData,
        };
        this.alerts.push(alert);
        // Keep alerts manageable
        if (this.alerts.length > 1000) {
            this.alerts = this.alerts.slice(-500);
        }
        console.warn(`Performance Alert [${alert.severity.toUpperCase()}]: ${alert.message}`);
    }
    processQueue() {
        if (this.isProcessing || this.metricQueue.length === 0)
            return;
        this.isProcessing = true;
        // Process metrics in batches
        const batchSize = Math.min(1000, this.metricQueue.length);
        const batch = this.metricQueue.splice(0, batchSize);
        // Add to main metrics store
        this.metrics.push(...batch);
        // Keep metrics size manageable
        if (this.metrics.length > 100000) {
            this.metrics = this.metrics.slice(-50000);
        }
        this.isProcessing = false;
        // Continue processing if there are more items
        if (this.metricQueue.length > 0) {
            setTimeout(() => this.processQueue(), 0);
        }
    }
    startPeriodicProcessing() {
        this.processingTimer = setInterval(() => {
            this.processQueue();
        }, 1000); // Process every second
    }
    startPeriodicSnapshots() {
        this.snapshotTimer = setInterval(() => {
            const snapshot = this.getCurrentSnapshot();
            this.snapshots.push(snapshot);
            // Keep snapshots for 7 days
            const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
            this.snapshots = this.snapshots.filter(s => s.timestamp > cutoff);
        }, this.snapshotInterval);
    }
    startResourceMonitoring() {
        setInterval(() => {
            // In a real implementation, this would use process.memoryUsage() and CPU monitoring
            const memUsage = process.memoryUsage().heapUsed;
            this.memoryUsage.push(memUsage);
            if (this.memoryUsage.length > 1440) { // Keep 24 hours of minute-by-minute data
                this.memoryUsage.shift();
            }
            // CPU usage would be calculated here
            this.cpuUsage.push(0); // Placeholder
        }, 60000); // Every minute
    }
    calculateAverage(values) {
        if (values.length === 0)
            return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    calculatePercentile(values, percentile) {
        if (values.length === 0)
            return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil(percentile * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }
    calculateTimeoutRate(metrics) {
        const timeoutRequests = metrics.filter(m => m.metric === 'request_response_time' &&
            m.value > this.thresholds.maxResponseTime).length;
        const totalRequests = metrics.filter(m => m.metric === 'request_response_time').length;
        return totalRequests > 0 ? timeoutRequests / totalRequests : 0;
    }
    calculateRoutingAccuracy(metrics) {
        const accuracyMetrics = metrics.filter(m => m.metric === 'prediction_accuracy');
        return accuracyMetrics.length > 0 ? this.calculateAverage(accuracyMetrics.map(m => m.value)) : 0.85;
    }
    calculateAverageRoutingLatency(metrics) {
        const routingMetrics = metrics.filter(m => m.metric === 'routing_latency');
        return routingMetrics.length > 0 ? this.calculateAverage(routingMetrics.map(m => m.value)) : 0;
    }
    calculateAveragePredictionConfidence(metrics) {
        const confidenceMetrics = metrics.filter(m => m.metric === 'prediction_confidence');
        return confidenceMetrics.length > 0 ? this.calculateAverage(confidenceMetrics.map(m => m.value)) : 0.8;
    }
    calculateProviderDistribution(metrics) {
        const distribution = {
            [APIProvider.OPENAI]: 0,
            [APIProvider.ANTHROPIC]: 0,
            [APIProvider.GOOGLE]: 0,
        };
        const requestMetrics = metrics.filter(m => m.metric === 'request_response_time' && m.provider);
        for (const metric of requestMetrics) {
            if (metric.provider) {
                distribution[metric.provider]++;
            }
        }
        const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        if (total > 0) {
            for (const provider in distribution) {
                distribution[provider] = distribution[provider] / total;
            }
        }
        return distribution;
    }
    getCurrentMemoryUsage() {
        return this.memoryUsage[this.memoryUsage.length - 1] || 0;
    }
    getCurrentCPUUsage() {
        return this.cpuUsage[this.cpuUsage.length - 1] || 0;
    }
    estimateMemoryFootprint() {
        // Rough estimate of monitoring system memory usage
        const metricsSize = this.metrics.length * 200; // ~200 bytes per metric
        const snapshotsSize = this.snapshots.length * 500; // ~500 bytes per snapshot
        const alertsSize = this.alerts.length * 300; // ~300 bytes per alert
        return metricsSize + snapshotsSize + alertsSize;
    }
    /**
     * Cleanup method
     */
    destroy() {
        if (this.processingTimer) {
            clearInterval(this.processingTimer);
        }
        if (this.snapshotTimer) {
            clearInterval(this.snapshotTimer);
        }
    }
}
//# sourceMappingURL=performance-monitor.js.map