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
export class ABTestingFramework {
    constructor() {
        this.experiments = new Map();
        this.userAssignments = new Map(); // userId -> testId -> variant
        this.analysisInterval = 60000; // Analyze every minute
        this.startPeriodicAnalysis();
    }
    /**
     * Create a new A/B test
     */
    createTest(config) {
        if (this.experiments.has(config.id)) {
            throw new Error(`A/B test with ID ${config.id} already exists`);
        }
        // Validate configuration
        this.validateTestConfig(config);
        const experimentState = {
            config: { ...config, status: 'draft' },
            results: [],
            lastAnalysisTime: 0,
        };
        this.experiments.set(config.id, experimentState);
    }
    /**
     * Start an A/B test
     */
    startTest(testId) {
        const experiment = this.experiments.get(testId);
        if (!experiment) {
            throw new Error(`A/B test ${testId} not found`);
        }
        if (experiment.config.status !== 'draft') {
            throw new Error(`A/B test ${testId} cannot be started from ${experiment.config.status} status`);
        }
        experiment.config.status = 'running';
        experiment.config.startTime = Date.now();
        console.log(`Started A/B test: ${experiment.config.name} (${testId})`);
    }
    /**
     * Stop an A/B test
     */
    stopTest(testId, reason = 'Manual stop') {
        const experiment = this.experiments.get(testId);
        if (!experiment) {
            throw new Error(`A/B test ${testId} not found`);
        }
        experiment.config.status = 'stopped';
        experiment.config.endTime = Date.now();
        console.log(`Stopped A/B test: ${experiment.config.name} (${testId}) - Reason: ${reason}`);
    }
    /**
     * Determine if a request should participate in A/B testing
     */
    shouldParticipateInTest(testId, userId, request) {
        const experiment = this.experiments.get(testId);
        if (!experiment || experiment.config.status !== 'running') {
            return false;
        }
        // Check if test has expired
        if (experiment.config.startTime &&
            Date.now() - experiment.config.startTime > experiment.config.maxDuration) {
            this.stopTest(testId, 'Test duration expired');
            return false;
        }
        // Check traffic allocation
        if (Math.random() > experiment.config.trafficAllocation) {
            return false;
        }
        // Check user segments (if specified)
        if (experiment.config.userSegments && experiment.config.userSegments.length > 0) {
            // In production, this would check actual user segment data
            // For now, we'll allow all users
        }
        // Check request types (if specified)
        if (experiment.config.requestTypes && experiment.config.requestTypes.length > 0) {
            // In production, this would classify the request type
            // For now, we'll allow all request types
        }
        return true;
    }
    /**
     * Assign a user to a variant for a specific test
     */
    assignVariant(testId, userId) {
        const experiment = this.experiments.get(testId);
        if (!experiment || experiment.config.status !== 'running') {
            return null;
        }
        // Check if user is already assigned
        const userTestAssignments = this.userAssignments.get(userId) || new Map();
        const existingAssignment = userTestAssignments.get(testId);
        if (existingAssignment) {
            return existingAssignment;
        }
        // Assign based on weights
        const random = Math.random();
        const weightA = experiment.config.variantA.weight;
        const variant = random < weightA ? 'A' : 'B';
        // Store assignment
        userTestAssignments.set(testId, variant);
        this.userAssignments.set(userId, userTestAssignments);
        return variant;
    }
    /**
     * Get the provider and model for a specific variant
     */
    getVariantConfig(testId, variant) {
        const experiment = this.experiments.get(testId);
        if (!experiment)
            return null;
        const variantConfig = variant === 'A' ? experiment.config.variantA : experiment.config.variantB;
        return {
            provider: variantConfig.provider,
            model: variantConfig.model,
        };
    }
    /**
     * Record a test result
     */
    recordResult(result) {
        const experiment = this.experiments.get(result.testId);
        if (!experiment || experiment.config.status !== 'running') {
            return;
        }
        experiment.results.push(result);
        // Limit results history to prevent memory issues
        if (experiment.results.length > 10000) {
            experiment.results = experiment.results.slice(-8000);
        }
    }
    /**
     * Get current test analysis
     */
    getTestAnalysis(testId) {
        const experiment = this.experiments.get(testId);
        if (!experiment)
            return null;
        return experiment.currentAnalysis || null;
    }
    /**
     * Get list of all tests
     */
    getAllTests() {
        return Array.from(this.experiments.values()).map(exp => exp.config);
    }
    /**
     * Get running tests
     */
    getRunningTests() {
        return this.getAllTests().filter(config => config.status === 'running');
    }
    /**
     * Manually trigger analysis for a test
     */
    analyzeTest(testId) {
        const experiment = this.experiments.get(testId);
        if (!experiment)
            return null;
        const analysis = this.performStatisticalAnalysis(experiment);
        experiment.currentAnalysis = analysis;
        experiment.lastAnalysisTime = Date.now();
        // Check auto-stopping rules
        if (experiment.config.autoStop.enabled && analysis.isSignificant) {
            if (analysis.confidence >= experiment.config.autoStop.winnerThreshold) {
                this.stopTest(testId, `Auto-stopped: Winner detected with ${(analysis.confidence * 100).toFixed(1)}% confidence`);
                experiment.config.status = 'completed';
            }
        }
        return analysis;
    }
    // Private Methods
    validateTestConfig(config) {
        if (config.variantA.weight + config.variantB.weight !== 1) {
            throw new Error('Variant weights must sum to 1.0');
        }
        if (config.trafficAllocation < 0 || config.trafficAllocation > 1) {
            throw new Error('Traffic allocation must be between 0 and 1');
        }
        if (config.significanceLevel < 0 || config.significanceLevel > 1) {
            throw new Error('Significance level must be between 0 and 1');
        }
        if (config.minSampleSize < 10) {
            throw new Error('Minimum sample size must be at least 10');
        }
    }
    performStatisticalAnalysis(experiment) {
        const { config, results } = experiment;
        const variantAResults = results.filter(r => r.variant === 'A');
        const variantBResults = results.filter(r => r.variant === 'B');
        // Insufficient data check
        if (variantAResults.length < config.minSampleSize || variantBResults.length < config.minSampleSize) {
            return {
                testId: config.id,
                status: 'insufficient_data',
                sampleSizes: { variantA: variantAResults.length, variantB: variantBResults.length },
                means: { variantA: 0, variantB: 0 },
                standardDeviations: { variantA: 0, variantB: 0 },
                effect: 0,
                pValue: 1,
                confidence: 0,
                isSignificant: false,
                primaryMetricResults: {
                    variantA: { mean: 0, std: 0, samples: variantAResults.length },
                    variantB: { mean: 0, std: 0, samples: variantBResults.length },
                    improvement: 0,
                    confidenceInterval: [0, 0],
                },
                secondaryMetricResults: {},
                recommendation: 'continue_test',
                recommendationReason: `Insufficient data. Need ${config.minSampleSize} samples per variant.`,
                confidenceLevel: 0,
            };
        }
        // Extract primary metric values
        const primaryMetricA = this.extractMetricValues(variantAResults, config.primaryMetric);
        const primaryMetricB = this.extractMetricValues(variantBResults, config.primaryMetric);
        // Calculate statistical measures
        const meanA = this.calculateMean(primaryMetricA);
        const meanB = this.calculateMean(primaryMetricB);
        const stdA = this.calculateStandardDeviation(primaryMetricA, meanA);
        const stdB = this.calculateStandardDeviation(primaryMetricB, meanB);
        const effect = meanB - meanA;
        const improvement = meanA !== 0 ? (effect / meanA) * 100 : 0;
        // Perform t-test
        const tTestResult = this.performTTest(primaryMetricA, primaryMetricB);
        const isSignificant = tTestResult.pValue < config.significanceLevel;
        const confidence = 1 - tTestResult.pValue;
        // Calculate confidence interval for the difference
        const confidenceInterval = this.calculateConfidenceInterval(primaryMetricA, primaryMetricB, config.significanceLevel);
        // Analyze secondary metrics
        const secondaryMetricResults = {};
        for (const metric of config.secondaryMetrics) {
            const metricA = this.extractMetricValues(variantAResults, metric);
            const metricB = this.extractMetricValues(variantBResults, metric);
            const metricMeanA = this.calculateMean(metricA);
            const metricMeanB = this.calculateMean(metricB);
            const metricTTest = this.performTTest(metricA, metricB);
            secondaryMetricResults[metric] = {
                variantA: {
                    mean: metricMeanA,
                    std: this.calculateStandardDeviation(metricA, metricMeanA)
                },
                variantB: {
                    mean: metricMeanB,
                    std: this.calculateStandardDeviation(metricB, metricMeanB)
                },
                improvement: metricMeanA !== 0 ? ((metricMeanB - metricMeanA) / metricMeanA) * 100 : 0,
                isSignificant: metricTTest.pValue < config.significanceLevel,
            };
        }
        // Determine status and recommendation
        let status;
        let recommendation;
        let recommendationReason;
        if (!isSignificant) {
            status = 'no_significant_difference';
            recommendation = 'continue_test';
            recommendationReason = `No significant difference detected (p=${tTestResult.pValue.toFixed(4)}). Continue testing.`;
        }
        else {
            if (improvement > 0) {
                status = 'variant_b_wins';
                recommendation = 'choose_variant_b';
                recommendationReason = `Variant B shows ${improvement.toFixed(1)}% improvement with ${(confidence * 100).toFixed(1)}% confidence.`;
            }
            else {
                status = 'variant_a_wins';
                recommendation = 'choose_variant_a';
                recommendationReason = `Variant A shows ${Math.abs(improvement).toFixed(1)}% better performance with ${(confidence * 100).toFixed(1)}% confidence.`;
            }
        }
        return {
            testId: config.id,
            status,
            sampleSizes: { variantA: variantAResults.length, variantB: variantBResults.length },
            means: { variantA: meanA, variantB: meanB },
            standardDeviations: { variantA: stdA, variantB: stdB },
            effect,
            pValue: tTestResult.pValue,
            confidence,
            isSignificant,
            primaryMetricResults: {
                variantA: { mean: meanA, std: stdA, samples: variantAResults.length },
                variantB: { mean: meanB, std: stdB, samples: variantBResults.length },
                improvement,
                confidenceInterval,
            },
            secondaryMetricResults,
            recommendation,
            recommendationReason,
            confidenceLevel: confidence,
        };
    }
    extractMetricValues(results, metric) {
        switch (metric) {
            case 'cost':
                return results.map(r => r.actualCost);
            case 'responseTime':
                return results.map(r => r.actualResponseTime);
            case 'quality':
                return results.map(r => r.actualQuality);
            case 'accuracy':
                return results.map(r => (r.costAccuracy + r.timeAccuracy + r.qualityAccuracy) / 3);
            case 'userSatisfaction':
                return results.filter(r => r.userSatisfaction !== undefined).map(r => r.userSatisfaction);
            default:
                return [];
        }
    }
    calculateMean(values) {
        if (values.length === 0)
            return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    calculateStandardDeviation(values, mean) {
        if (values.length < 2)
            return 0;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
        return Math.sqrt(variance);
    }
    performTTest(samplesA, samplesB) {
        if (samplesA.length < 2 || samplesB.length < 2) {
            return { tStatistic: 0, pValue: 1 };
        }
        const meanA = this.calculateMean(samplesA);
        const meanB = this.calculateMean(samplesB);
        const stdA = this.calculateStandardDeviation(samplesA, meanA);
        const stdB = this.calculateStandardDeviation(samplesB, meanB);
        const nA = samplesA.length;
        const nB = samplesB.length;
        // Welch's t-test (unequal variances)
        const pooledStdError = Math.sqrt((stdA * stdA / nA) + (stdB * stdB / nB));
        const tStatistic = (meanB - meanA) / pooledStdError;
        // Degrees of freedom for Welch's t-test
        const df = Math.pow(pooledStdError, 4) /
            (Math.pow(stdA * stdA / nA, 2) / (nA - 1) + Math.pow(stdB * stdB / nB, 2) / (nB - 1));
        // Simplified p-value calculation (in production, use proper statistical library)
        const pValue = this.approximatePValue(Math.abs(tStatistic), df);
        return { tStatistic, pValue };
    }
    approximatePValue(tStat, df) {
        // Very simplified p-value approximation
        // In production, use a proper statistical library
        if (tStat < 1.96)
            return 0.05;
        if (tStat < 2.58)
            return 0.01;
        if (tStat < 3.29)
            return 0.001;
        return 0.0001;
    }
    calculateConfidenceInterval(samplesA, samplesB, alpha) {
        const meanA = this.calculateMean(samplesA);
        const meanB = this.calculateMean(samplesB);
        const stdA = this.calculateStandardDeviation(samplesA, meanA);
        const stdB = this.calculateStandardDeviation(samplesB, meanB);
        const nA = samplesA.length;
        const nB = samplesB.length;
        const diff = meanB - meanA;
        const pooledStdError = Math.sqrt((stdA * stdA / nA) + (stdB * stdB / nB));
        const criticalValue = 1.96; // Approximate for 95% confidence
        const margin = criticalValue * pooledStdError;
        return [diff - margin, diff + margin];
    }
    startPeriodicAnalysis() {
        this.analysisTimer = setInterval(() => {
            this.performPeriodicAnalysis();
        }, this.analysisInterval);
    }
    performPeriodicAnalysis() {
        for (const [testId, experiment] of this.experiments.entries()) {
            if (experiment.config.status === 'running') {
                // Only analyze if we have new data
                const hasNewData = experiment.results.some(r => r.timestamp > experiment.lastAnalysisTime);
                if (hasNewData) {
                    this.analyzeTest(testId);
                }
            }
        }
    }
    /**
     * Cleanup method to stop timers
     */
    destroy() {
        if (this.analysisTimer) {
            clearInterval(this.analysisTimer);
        }
    }
}
//# sourceMappingURL=ab-testing.js.map