"use strict";
/**
 * Real-time ML Accuracy Monitoring System
 *
 * Monitors and tracks ML routing accuracy in real-time with:
 * - Performance drift detection for Claude 4 integration
 * - Statistical analysis of accuracy metrics
 * - Real-time quality score updates
 * - Production-ready monitoring with minimal overhead
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLAccuracyMonitor = void 0;
const types_1 = require("../types");
const DEFAULT_MONITORING_CONFIG = {
    driftThreshold: 0.05, // 5% threshold for drift detection
    accuracyThreshold: 0.95, // 95% accuracy target
    minSampleSize: 10,
    confidenceLevel: 0.95,
    alertCooldownMs: 300000, // 5 minutes
    maxHistorySize: 1000,
    samplingRate: 1.0, // Sample 100% for now, can be reduced for high volume
    asyncProcessing: true,
};
class MLAccuracyMonitor {
    constructor(config = {}) {
        this.accuracyHistory = new Map();
        this.predictionHistory = new Map();
        this.qualityScores = new Map();
        this.alerts = [];
        this.lastAlertTime = new Map();
        // Claude 4 specific tracking
        this.claude4Baseline = null;
        this.claude3SonnetBaseline = null;
        // Performance tracking
        this.monitoringOverhead = [];
        this.processingQueue = [];
        this.isProcessing = false;
        this.config = { ...DEFAULT_MONITORING_CONFIG, ...config };
        this.initializeBaselines();
    }
    /**
     * Main method to track ML prediction accuracy
     */
    async trackPredictionAccuracy(prediction, actualResult, requestFeatures) {
        const startTime = performance.now();
        try {
            // Apply sampling
            if (Math.random() > this.config.samplingRate) {
                return;
            }
            const modelKey = `${prediction.provider}_${prediction.model}`;
            if (this.config.asyncProcessing) {
                // Queue for async processing to minimize latency impact
                this.processingQueue.push(async () => {
                    await this.processAccuracyTracking(prediction, actualResult, requestFeatures, modelKey);
                });
                this.processQueue();
            }
            else {
                await this.processAccuracyTracking(prediction, actualResult, requestFeatures, modelKey);
            }
        }
        finally {
            // Track monitoring overhead
            const overhead = performance.now() - startTime;
            this.monitoringOverhead.push(overhead);
            if (this.monitoringOverhead.length > 100) {
                this.monitoringOverhead.shift();
            }
        }
    }
    /**
     * Detect performance drift for Claude 4 vs previous models
     */
    async detectClaude4Drift() {
        const claude4Key = `${types_1.APIProvider.ANTHROPIC}_claude-sonnet-4-20250514`;
        const claude3Key = `${types_1.APIProvider.ANTHROPIC}_claude-3-5-sonnet-20241022`;
        const claude4Metrics = this.getCurrentAccuracyMetrics(claude4Key);
        const claude3Metrics = this.getCurrentAccuracyMetrics(claude3Key);
        if (!claude4Metrics || !claude3Metrics) {
            return null;
        }
        return this.performDriftDetection(claude3Metrics, claude4Metrics, 'claude4_vs_claude3');
    }
    /**
     * Compare Claude 4 performance against other providers
     */
    async compareModelPerformance(baselineProvider, baselineModel, comparisonProvider, comparisonModel) {
        const baselineKey = `${baselineProvider}_${baselineModel}`;
        const comparisonKey = `${comparisonProvider}_${comparisonModel}`;
        const baselineMetrics = this.getCurrentAccuracyMetrics(baselineKey);
        const comparisonMetrics = this.getCurrentAccuracyMetrics(comparisonKey);
        if (!baselineMetrics || !comparisonMetrics) {
            return {
                baselineModel: { provider: baselineProvider, model: baselineModel },
                comparisonModel: { provider: comparisonProvider, model: comparisonModel },
                performanceDelta: { costDifference: 0, responseTimeDifference: 0, qualityDifference: 0 },
                isSignificant: false,
                confidence: 0,
                recommendation: 'insufficient_data',
            };
        }
        return this.performModelComparison(baselineMetrics, comparisonMetrics, baselineProvider, baselineModel, comparisonProvider, comparisonModel);
    }
    /**
     * Update quality scores based on production data
     */
    async updateQualityScores(provider, model, newData) {
        const modelKey = `${provider}_${model}`;
        const currentScore = this.qualityScores.get(modelKey) || 0.8;
        if (newData.length === 0)
            return null;
        // Calculate new quality score from recent data
        const avgQuality = newData.reduce((sum, data) => sum + data.actualQuality, 0) / newData.length;
        const sampleSize = newData.length;
        const confidence = Math.min(1.0, sampleSize / this.config.minSampleSize);
        // Weighted update: blend current score with new data
        const learningRate = 0.1;
        const newScore = currentScore * (1 - learningRate) + avgQuality * learningRate;
        // Determine update reason
        let updateReason = 'new_data';
        const scoreDelta = newScore - currentScore;
        if (Math.abs(scoreDelta) > this.config.driftThreshold) {
            updateReason = scoreDelta > 0 ? 'performance_improvement' : 'performance_degradation';
        }
        // Update the score
        this.qualityScores.set(modelKey, newScore);
        return {
            provider,
            model,
            previousScore: currentScore,
            newScore,
            confidence,
            sampleSize,
            updateReason,
            timestamp: Date.now(),
        };
    }
    /**
     * Get current accuracy metrics for a model
     */
    getCurrentAccuracyMetrics(modelKey) {
        const history = this.accuracyHistory.get(modelKey);
        if (!history || history.length === 0)
            return null;
        return history[history.length - 1];
    }
    /**
     * Get monitoring alerts
     */
    getAlerts(unresolved = false) {
        return unresolved ? this.alerts.filter(alert => !alert.resolved) : this.alerts;
    }
    /**
     * Get monitoring performance metrics
     */
    getMonitoringPerformance() {
        if (this.monitoringOverhead.length === 0) {
            return {
                averageOverheadMs: 0,
                maxOverheadMs: 0,
                overheadPercentile95: 0,
                queueSize: this.processingQueue.length,
            };
        }
        const sorted = [...this.monitoringOverhead].sort((a, b) => a - b);
        const avg = sorted.reduce((sum, val) => sum + val, 0) / sorted.length;
        const max = sorted[sorted.length - 1];
        const p95Index = Math.floor(sorted.length * 0.95);
        const p95 = sorted[p95Index];
        return {
            averageOverheadMs: Math.round(avg * 100) / 100,
            maxOverheadMs: Math.round(max * 100) / 100,
            overheadPercentile95: Math.round(p95 * 100) / 100,
            queueSize: this.processingQueue.length,
        };
    }
    /**
     * Get comprehensive monitoring insights
     */
    getMonitoringInsights() {
        const insights = {
            totalModelsTracked: this.accuracyHistory.size,
            totalPredictionsAnalyzed: Array.from(this.predictionHistory.values()).reduce((sum, arr) => sum + arr.length, 0),
            averageAccuracy: this.calculateOverallAccuracy(),
            driftDetections: this.alerts.filter(alert => alert.type === 'drift_detected').length,
            alertsSummary: this.getAlertsSummary(),
            topPerformingModels: this.getTopPerformingModels(),
            monitoringPerformance: this.getMonitoringPerformance(),
        };
        return insights;
    }
    // Private Methods
    async processAccuracyTracking(prediction, actualResult, requestFeatures, modelKey) {
        // Store prediction vs actual result
        const predictionHistory = this.predictionHistory.get(modelKey) || [];
        predictionHistory.push({ prediction, actual: actualResult });
        // Keep history size manageable
        if (predictionHistory.length > this.config.maxHistorySize) {
            predictionHistory.shift();
        }
        this.predictionHistory.set(modelKey, predictionHistory);
        // Calculate accuracy metrics
        const accuracyMetrics = this.calculateAccuracyMetrics(predictionHistory);
        // Update accuracy history
        const accuracyHistory = this.accuracyHistory.get(modelKey) || [];
        accuracyHistory.push(accuracyMetrics);
        if (accuracyHistory.length > 100) { // Keep last 100 accuracy snapshots
            accuracyHistory.shift();
        }
        this.accuracyHistory.set(modelKey, accuracyHistory);
        // Check for drift and alerts
        await this.checkForAnomalies(modelKey, accuracyMetrics, prediction);
    }
    calculateAccuracyMetrics(predictionHistory) {
        if (predictionHistory.length === 0) {
            return {
                costAccuracy: 0,
                responseTimeAccuracy: 0,
                qualityAccuracy: 0,
                overallAccuracy: 0,
                sampleSize: 0,
                confidenceInterval: [0, 0],
                timestamp: Date.now(),
            };
        }
        // Calculate individual metric accuracies
        const costAccuracies = predictionHistory.map(({ prediction, actual }) => 1 - Math.abs(prediction.predictedCost - actual.actualCost) / Math.max(actual.actualCost, 0.001));
        const timeAccuracies = predictionHistory.map(({ prediction, actual }) => 1 - Math.abs(prediction.predictedResponseTime - actual.actualResponseTime) / Math.max(actual.actualResponseTime, 1));
        const qualityAccuracies = predictionHistory.map(({ prediction, actual }) => 1 - Math.abs(prediction.predictedQuality - actual.actualQuality));
        const costAccuracy = Math.max(0, costAccuracies.reduce((sum, acc) => sum + acc, 0) / costAccuracies.length);
        const responseTimeAccuracy = Math.max(0, timeAccuracies.reduce((sum, acc) => sum + acc, 0) / timeAccuracies.length);
        const qualityAccuracy = Math.max(0, qualityAccuracies.reduce((sum, acc) => sum + acc, 0) / qualityAccuracies.length);
        const overallAccuracy = (costAccuracy + responseTimeAccuracy + qualityAccuracy) / 3;
        // Calculate confidence interval for overall accuracy
        const confidenceInterval = this.calculateConfidenceInterval(overallAccuracy, predictionHistory.length);
        return {
            costAccuracy: Math.round(costAccuracy * 10000) / 10000,
            responseTimeAccuracy: Math.round(responseTimeAccuracy * 10000) / 10000,
            qualityAccuracy: Math.round(qualityAccuracy * 10000) / 10000,
            overallAccuracy: Math.round(overallAccuracy * 10000) / 10000,
            sampleSize: predictionHistory.length,
            confidenceInterval,
            timestamp: Date.now(),
        };
    }
    calculateConfidenceInterval(accuracy, sampleSize) {
        if (sampleSize < 2)
            return [0, 1];
        // Using normal approximation for confidence interval
        const z = 1.96; // 95% confidence level
        const se = Math.sqrt((accuracy * (1 - accuracy)) / sampleSize);
        const margin = z * se;
        return [
            Math.max(0, accuracy - margin),
            Math.min(1, accuracy + margin)
        ];
    }
    performDriftDetection(baseline, current, context) {
        const costDrift = Math.abs(current.costAccuracy - baseline.costAccuracy);
        const timeDrift = Math.abs(current.responseTimeAccuracy - baseline.responseTimeAccuracy);
        const qualityDrift = Math.abs(current.qualityAccuracy - baseline.qualityAccuracy);
        const maxDrift = Math.max(costDrift, timeDrift, qualityDrift);
        const isDriftDetected = maxDrift > this.config.driftThreshold;
        const affectedMetrics = [];
        if (costDrift > this.config.driftThreshold)
            affectedMetrics.push('cost');
        if (timeDrift > this.config.driftThreshold)
            affectedMetrics.push('responseTime');
        if (qualityDrift > this.config.driftThreshold)
            affectedMetrics.push('quality');
        // Statistical significance test (simplified)
        const significance = this.calculateStatisticalSignificance(baseline, current);
        let recommendedAction = 'monitor';
        if (maxDrift > 0.1)
            recommendedAction = 'alert';
        else if (maxDrift > 0.15)
            recommendedAction = 'fallback';
        else if (maxDrift > 0.05)
            recommendedAction = 'investigate';
        return {
            isDriftDetected,
            driftMagnitude: maxDrift,
            affectedMetrics,
            significance,
            recommendedAction,
            details: {
                baseline,
                current,
                statisticalTests: {
                    costDrift,
                    timeDrift,
                    qualityDrift,
                    significance,
                },
            },
        };
    }
    performModelComparison(baseline, comparison, baselineProvider, baselineModel, comparisonProvider, comparisonModel) {
        const costDifference = comparison.costAccuracy - baseline.costAccuracy;
        const responseTimeDifference = comparison.responseTimeAccuracy - baseline.responseTimeAccuracy;
        const qualityDifference = comparison.qualityAccuracy - baseline.qualityAccuracy;
        const significance = this.calculateStatisticalSignificance(baseline, comparison);
        const isSignificant = significance > 0.95;
        let recommendation = 'equivalent';
        const overallDifference = (costDifference + responseTimeDifference + qualityDifference) / 3;
        if (isSignificant) {
            if (overallDifference > 0.05) {
                recommendation = 'prefer_comparison';
            }
            else if (overallDifference < -0.05) {
                recommendation = 'prefer_baseline';
            }
        }
        return {
            baselineModel: { provider: baselineProvider, model: baselineModel },
            comparisonModel: { provider: comparisonProvider, model: comparisonModel },
            performanceDelta: {
                costDifference: Math.round(costDifference * 10000) / 10000,
                responseTimeDifference: Math.round(responseTimeDifference * 10000) / 10000,
                qualityDifference: Math.round(qualityDifference * 10000) / 10000,
            },
            isSignificant,
            confidence: significance,
            recommendation,
        };
    }
    calculateStatisticalSignificance(baseline, current) {
        // Simplified statistical significance calculation
        // In production, this should use proper statistical tests
        const minSampleSize = Math.min(baseline.sampleSize, current.sampleSize);
        if (minSampleSize < this.config.minSampleSize)
            return 0;
        const sampleSizeConfidence = Math.min(1, minSampleSize / 50);
        const accuracyDifference = Math.abs(baseline.overallAccuracy - current.overallAccuracy);
        const significanceScore = sampleSizeConfidence * (1 - accuracyDifference);
        return Math.max(0, Math.min(1, significanceScore));
    }
    async checkForAnomalies(modelKey, metrics, prediction) {
        // Check for accuracy degradation
        if (metrics.overallAccuracy < this.config.accuracyThreshold && metrics.sampleSize >= this.config.minSampleSize) {
            await this.createAlert({
                type: 'accuracy_degradation',
                severity: metrics.overallAccuracy < 0.8 ? 'high' : 'medium',
                provider: prediction.provider,
                model: prediction.model,
                metrics,
                message: `Accuracy dropped to ${(metrics.overallAccuracy * 100).toFixed(1)}% (target: ${(this.config.accuracyThreshold * 100).toFixed(1)}%)`,
            });
        }
        // Check for drift if we have baseline
        const baseline = this.getBaseline(prediction.provider, prediction.model);
        if (baseline) {
            const driftResult = this.performDriftDetection(baseline, metrics, `${modelKey}_drift`);
            if (driftResult.isDriftDetected && driftResult.recommendedAction !== 'monitor') {
                await this.createAlert({
                    type: 'drift_detected',
                    severity: driftResult.recommendedAction === 'fallback' ? 'critical' : 'high',
                    provider: prediction.provider,
                    model: prediction.model,
                    metrics,
                    message: `Performance drift detected: ${(driftResult.driftMagnitude * 100).toFixed(1)}% change in ${driftResult.affectedMetrics.join(', ')}`,
                });
            }
        }
    }
    async createAlert(alertData) {
        const alertKey = `${alertData.provider}_${alertData.model}_${alertData.type}`;
        const lastAlert = this.lastAlertTime.get(alertKey) || 0;
        // Implement cooldown to prevent alert spam
        if (Date.now() - lastAlert < this.config.alertCooldownMs) {
            return;
        }
        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            resolved: false,
            ...alertData,
        };
        this.alerts.push(alert);
        this.lastAlertTime.set(alertKey, Date.now());
        // Keep alerts list manageable
        if (this.alerts.length > 1000) {
            this.alerts = this.alerts.slice(-500);
        }
        // In production, this would trigger external alerting systems
        console.warn(`ML Monitoring Alert [${alert.severity.toUpperCase()}]: ${alert.message}`, {
            provider: alert.provider,
            model: alert.model,
            type: alert.type,
        });
    }
    async processQueue() {
        if (this.isProcessing || this.processingQueue.length === 0)
            return;
        this.isProcessing = true;
        try {
            while (this.processingQueue.length > 0) {
                const task = this.processingQueue.shift();
                if (task) {
                    await task();
                }
            }
        }
        finally {
            this.isProcessing = false;
        }
    }
    initializeBaselines() {
        // Initialize with baseline performance for known models
        // This would be populated from historical data in production
        const claude4Baseline = {
            costAccuracy: 0.85,
            responseTimeAccuracy: 0.82,
            qualityAccuracy: 0.92,
            overallAccuracy: 0.863,
            sampleSize: 50,
            confidenceInterval: [0.82, 0.91],
            timestamp: Date.now(),
        };
        const claude3Baseline = {
            costAccuracy: 0.88,
            responseTimeAccuracy: 0.85,
            qualityAccuracy: 0.89,
            overallAccuracy: 0.873,
            sampleSize: 100,
            confidenceInterval: [0.84, 0.91],
            timestamp: Date.now(),
        };
        this.claude4Baseline = claude4Baseline;
        this.claude3SonnetBaseline = claude3Baseline;
    }
    getBaseline(provider, model) {
        if (provider === types_1.APIProvider.ANTHROPIC) {
            if (model === 'claude-sonnet-4-20250514')
                return this.claude4Baseline;
            if (model === 'claude-3-5-sonnet-20241022')
                return this.claude3SonnetBaseline;
        }
        return null;
    }
    calculateOverallAccuracy() {
        const allMetrics = Array.from(this.accuracyHistory.values()).flat();
        if (allMetrics.length === 0)
            return 0;
        return allMetrics.reduce((sum, metrics) => sum + metrics.overallAccuracy, 0) / allMetrics.length;
    }
    getAlertsSummary() {
        const summary = {};
        for (const alert of this.alerts) {
            const key = `${alert.type}_${alert.severity}`;
            summary[key] = (summary[key] || 0) + 1;
        }
        return summary;
    }
    getTopPerformingModels() {
        const modelAccuracies = [];
        for (const [modelKey, history] of this.accuracyHistory.entries()) {
            if (history.length > 0) {
                const latestMetrics = history[history.length - 1];
                modelAccuracies.push({ modelKey, accuracy: latestMetrics.overallAccuracy });
            }
        }
        return modelAccuracies
            .sort((a, b) => b.accuracy - a.accuracy)
            .slice(0, 5);
    }
}
exports.MLAccuracyMonitor = MLAccuracyMonitor;
//# sourceMappingURL=accuracy-monitor.js.map