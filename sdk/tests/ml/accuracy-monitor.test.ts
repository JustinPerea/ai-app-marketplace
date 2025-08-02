/**
 * Unit Tests for ML Accuracy Monitor
 * 
 * Tests the core accuracy monitoring functionality including:
 * - Drift detection algorithms
 * - Statistical analysis
 * - Alert generation
 * - Performance metrics calculation
 */

import { MLAccuracyMonitor } from '../../src/ml/accuracy-monitor';
import { APIProvider, PredictionResult, LearningData, RequestFeatures, RequestType } from '../../src/types';

describe('MLAccuracyMonitor', () => {
  let monitor: MLAccuracyMonitor;
  
  beforeEach(() => {
    monitor = new MLAccuracyMonitor({
      driftThreshold: 0.05,
      accuracyThreshold: 0.95,
      minSampleSize: 5,
      asyncProcessing: false, // Synchronous for testing
    });
  });

  afterEach(() => {
    // Clean up any timers or resources
  });

  describe('Prediction Accuracy Tracking', () => {
    it('should track prediction accuracy correctly', async () => {
      const prediction: PredictionResult = {
        provider: APIProvider.ANTHROPIC,
        model: 'claude-sonnet-4-20250514',
        predictedCost: 0.01,
        predictedResponseTime: 2000,
        predictedQuality: 0.9,
        confidence: 0.8,
        reasoning: 'Test prediction',
      };

      const actualResult: LearningData = {
        requestFeatures: createMockRequestFeatures(),
        actualProvider: APIProvider.ANTHROPIC,
        actualModel: 'claude-sonnet-4-20250514',
        actualCost: 0.012,
        actualResponseTime: 1800,
        actualQuality: 0.95,
        timestamp: Date.now(),
      };

      await monitor.trackPredictionAccuracy(prediction, actualResult, actualResult.requestFeatures);

      const metrics = monitor.getCurrentAccuracyMetrics('ANTHROPIC_claude-sonnet-4-20250514');
      expect(metrics).toBeDefined();
      expect(metrics!.sampleSize).toBe(1);
      expect(metrics!.overallAccuracy).toBeGreaterThan(0);
    });

    it('should calculate accuracy metrics correctly', async () => {
      const predictions = [
        {
          prediction: {
            provider: APIProvider.ANTHROPIC,
            model: 'claude-sonnet-4-20250514',
            predictedCost: 0.01,
            predictedResponseTime: 2000,
            predictedQuality: 0.9,
            confidence: 0.8,
            reasoning: 'Test',
          },
          actual: {
            requestFeatures: createMockRequestFeatures(),
            actualProvider: APIProvider.ANTHROPIC,
            actualModel: 'claude-sonnet-4-20250514',
            actualCost: 0.01, // Perfect match
            actualResponseTime: 2000, // Perfect match
            actualQuality: 0.9, // Perfect match
            timestamp: Date.now(),
          },
        },
      ];

      for (const { prediction, actual } of predictions) {
        await monitor.trackPredictionAccuracy(prediction, actual, actual.requestFeatures);
      }

      const metrics = monitor.getCurrentAccuracyMetrics('ANTHROPIC_claude-sonnet-4-20250514');
      expect(metrics!.costAccuracy).toBe(1.0);
      expect(metrics!.responseTimeAccuracy).toBe(1.0);
      expect(metrics!.qualityAccuracy).toBe(1.0);
      expect(metrics!.overallAccuracy).toBe(1.0);
    });

    it('should handle partial accuracy correctly', async () => {
      const prediction: PredictionResult = {
        provider: APIProvider.ANTHROPIC,
        model: 'claude-sonnet-4-20250514',
        predictedCost: 0.01,
        predictedResponseTime: 2000,
        predictedQuality: 0.9,
        confidence: 0.8,
        reasoning: 'Test',
      };

      const actual: LearningData = {
        requestFeatures: createMockRequestFeatures(),
        actualProvider: APIProvider.ANTHROPIC,
        actualModel: 'claude-sonnet-4-20250514',
        actualCost: 0.02, // 100% error
        actualResponseTime: 3000, // 50% error
        actualQuality: 0.8, // 11% error
        timestamp: Date.now(),
      };

      await monitor.trackPredictionAccuracy(prediction, actual, actual.requestFeatures);

      const metrics = monitor.getCurrentAccuracyMetrics('ANTHROPIC_claude-sonnet-4-20250514');
      expect(metrics!.costAccuracy).toBeLessThan(0.5);
      expect(metrics!.responseTimeAccuracy).toBeLessThan(0.8);
      expect(metrics!.qualityAccuracy).toBeGreaterThan(0.8);
    });
  });

  describe('Drift Detection', () => {
    it('should detect Claude 4 drift when performance changes significantly', async () => {
      // Create baseline data for Claude 3.5
      const claude35Predictions = Array.from({ length: 10 }, () => ({
        prediction: {
          provider: APIProvider.ANTHROPIC,
          model: 'claude-3-5-sonnet-20241022',
          predictedCost: 0.01,
          predictedResponseTime: 2000,
          predictedQuality: 0.9,
          confidence: 0.8,
          reasoning: 'Baseline',
        },
        actual: {
          requestFeatures: createMockRequestFeatures(),
          actualProvider: APIProvider.ANTHROPIC,
          actualModel: 'claude-3-5-sonnet-20241022',
          actualCost: 0.01,
          actualResponseTime: 2000,
          actualQuality: 0.9,
          timestamp: Date.now(),
        },
      }));

      // Create degraded performance data for Claude 4
      const claude4Predictions = Array.from({ length: 10 }, () => ({
        prediction: {
          provider: APIProvider.ANTHROPIC,
          model: 'claude-sonnet-4-20250514',
          predictedCost: 0.01,
          predictedResponseTime: 2000,
          predictedQuality: 0.9,
          confidence: 0.8,
          reasoning: 'Test',
        },
        actual: {
          requestFeatures: createMockRequestFeatures(),
          actualProvider: APIProvider.ANTHROPIC,
          actualModel: 'claude-sonnet-4-20250514',
          actualCost: 0.015, // 50% higher cost
          actualResponseTime: 2500, // 25% slower
          actualQuality: 0.8, // 11% lower quality
          timestamp: Date.now(),
        },
      }));

      // Track baseline performance
      for (const { prediction, actual } of claude35Predictions) {
        await monitor.trackPredictionAccuracy(prediction, actual, actual.requestFeatures);
      }

      // Track new model performance
      for (const { prediction, actual } of claude4Predictions) {
        await monitor.trackPredictionAccuracy(prediction, actual, actual.requestFeatures);
      }

      const driftResult = await monitor.detectClaude4Drift();
      expect(driftResult).toBeDefined();
      expect(driftResult!.isDriftDetected).toBe(true);
      expect(driftResult!.affectedMetrics).toContain('cost');
      expect(driftResult!.affectedMetrics).toContain('responseTime');
      expect(driftResult!.recommendedAction).toBe('investigate');
    });

    it('should not detect drift when performance is similar', async () => {
      // Create similar performance data for both models
      const predictions = [
        ...Array.from({ length: 10 }, () => ({
          model: 'claude-3-5-sonnet-20241022',
          actual: { actualCost: 0.01, actualResponseTime: 2000, actualQuality: 0.9 },
        })),
        ...Array.from({ length: 10 }, () => ({
          model: 'claude-sonnet-4-20250514',
          actual: { actualCost: 0.01, actualResponseTime: 2000, actualQuality: 0.9 },
        })),
      ];

      for (const { model, actual } of predictions) {
        const prediction: PredictionResult = {
          provider: APIProvider.ANTHROPIC,
          model,
          predictedCost: actual.actualCost,
          predictedResponseTime: actual.actualResponseTime,
          predictedQuality: actual.actualQuality,
          confidence: 0.8,
          reasoning: 'Test',
        };

        const learningData: LearningData = {
          requestFeatures: createMockRequestFeatures(),
          actualProvider: APIProvider.ANTHROPIC,
          actualModel: model,
          ...actual,
          timestamp: Date.now(),
        };

        await monitor.trackPredictionAccuracy(prediction, learningData, learningData.requestFeatures);
      }

      const driftResult = await monitor.detectClaude4Drift();
      expect(driftResult).toBeDefined();
      expect(driftResult!.isDriftDetected).toBe(false);
    });
  });

  describe('Model Performance Comparison', () => {
    it('should compare model performance correctly', async () => {
      // Setup baseline model data
      const baselineData = Array.from({ length: 15 }, () => ({
        prediction: {
          provider: APIProvider.ANTHROPIC,
          model: 'claude-3-5-sonnet-20241022',
          predictedCost: 0.01,
          predictedResponseTime: 2000,
          predictedQuality: 0.85,
          confidence: 0.8,
          reasoning: 'Baseline',
        },
        actual: {
          requestFeatures: createMockRequestFeatures(),
          actualProvider: APIProvider.ANTHROPIC,
          actualModel: 'claude-3-5-sonnet-20241022',
          actualCost: 0.01,
          actualResponseTime: 2000,
          actualQuality: 0.85,
          timestamp: Date.now(),
        },
      }));

      // Setup comparison model data (better performance)
      const comparisonData = Array.from({ length: 15 }, () => ({
        prediction: {
          provider: APIProvider.ANTHROPIC,
          model: 'claude-sonnet-4-20250514',
          predictedCost: 0.01,
          predictedResponseTime: 1800,
          predictedQuality: 0.95,
          confidence: 0.9,
          reasoning: 'Comparison',
        },
        actual: {
          requestFeatures: createMockRequestFeatures(),
          actualProvider: APIProvider.ANTHROPIC,
          actualModel: 'claude-sonnet-4-20250514',
          actualCost: 0.01,
          actualResponseTime: 1800,
          actualQuality: 0.95,
          timestamp: Date.now(),
        },
      }));

      // Track both models
      for (const { prediction, actual } of [...baselineData, ...comparisonData]) {
        await monitor.trackPredictionAccuracy(prediction, actual, actual.requestFeatures);
      }

      const comparison = await monitor.compareModelPerformance(
        APIProvider.ANTHROPIC,
        'claude-3-5-sonnet-20241022',
        APIProvider.ANTHROPIC,
        'claude-sonnet-4-20250514'
      );

      expect(comparison).toBeDefined();
      expect(comparison!.performanceDelta.qualityDifference).toBeGreaterThan(0);
      expect(comparison!.performanceDelta.responseTimeDifference).toBeGreaterThan(0);
      expect(comparison!.recommendation).toBe('prefer_comparison');
    });

    it('should handle insufficient data gracefully', async () => {
      const comparison = await monitor.compareModelPerformance(
        APIProvider.OPENAI,
        'gpt-4',
        APIProvider.GOOGLE,
        'gemini-pro'
      );

      expect(comparison).toBeDefined();
      expect(comparison!.recommendation).toBe('insufficient_data');
      expect(comparison!.isSignificant).toBe(false);
    });
  });

  describe('Quality Score Updates', () => {
    it('should update quality scores based on new data', async () => {
      const newData: LearningData[] = Array.from({ length: 10 }, () => ({
        requestFeatures: createMockRequestFeatures(),
        actualProvider: APIProvider.ANTHROPIC,
        actualModel: 'claude-sonnet-4-20250514',
        actualCost: 0.01,
        actualResponseTime: 2000,
        actualQuality: 0.95, // High quality
        timestamp: Date.now(),
      }));

      const update = await monitor.updateQualityScores(
        APIProvider.ANTHROPIC,
        'claude-sonnet-4-20250514',
        newData
      );

      expect(update).toBeDefined();
      expect(update!.newScore).toBeGreaterThan(update!.previousScore);
      expect(update!.updateReason).toBe('performance_improvement');
      expect(update!.sampleSize).toBe(10);
    });

    it('should detect performance degradation', async () => {
      const newData: LearningData[] = Array.from({ length: 10 }, () => ({
        requestFeatures: createMockRequestFeatures(),
        actualProvider: APIProvider.ANTHROPIC,
        actualModel: 'claude-sonnet-4-20250514',
        actualCost: 0.01,
        actualResponseTime: 2000,
        actualQuality: 0.6, // Low quality
        timestamp: Date.now(),
      }));

      const update = await monitor.updateQualityScores(
        APIProvider.ANTHROPIC,
        'claude-sonnet-4-20250514',
        newData
      );

      expect(update).toBeDefined();
      expect(update!.newScore).toBeLessThan(update!.previousScore);
      expect(update!.updateReason).toBe('performance_degradation');
    });
  });

  describe('Alert Generation', () => {
    it('should generate alerts for accuracy degradation', async () => {
      // Create data with poor accuracy
      const predictions = Array.from({ length: 15 }, () => ({
        prediction: {
          provider: APIProvider.ANTHROPIC,
          model: 'claude-sonnet-4-20250514',
          predictedCost: 0.01,
          predictedResponseTime: 2000,
          predictedQuality: 0.9,
          confidence: 0.8,
          reasoning: 'Test',
        },
        actual: {
          requestFeatures: createMockRequestFeatures(),
          actualProvider: APIProvider.ANTHROPIC,
          actualModel: 'claude-sonnet-4-20250514',
          actualCost: 0.05, // Much higher than predicted
          actualResponseTime: 5000, // Much slower than predicted
          actualQuality: 0.6, // Much lower than predicted
          timestamp: Date.now(),
        },
      }));

      for (const { prediction, actual } of predictions) {
        await monitor.trackPredictionAccuracy(prediction, actual, actual.requestFeatures);
      }

      const alerts = monitor.getAlerts(true); // Get unresolved alerts
      expect(alerts.length).toBeGreaterThan(0);
      
      const accuracyAlert = alerts.find(a => a.type === 'accuracy_degradation');
      expect(accuracyAlert).toBeDefined();
      expect(accuracyAlert!.severity).toBeOneOf(['medium', 'high']);
    });

    it('should not generate duplicate alerts within cooldown period', async () => {
      // Create monitor with short cooldown for testing
      const testMonitor = new MLAccuracyMonitor({
        alertCooldownMs: 100,
        asyncProcessing: false,
      });

      const prediction: PredictionResult = {
        provider: APIProvider.ANTHROPIC,
        model: 'claude-sonnet-4-20250514',
        predictedCost: 0.01,
        predictedResponseTime: 2000,
        predictedQuality: 0.9,
        confidence: 0.8,
        reasoning: 'Test',
      };

      const actual: LearningData = {
        requestFeatures: createMockRequestFeatures(),
        actualProvider: APIProvider.ANTHROPIC,
        actualModel: 'claude-sonnet-4-20250514',
        actualCost: 0.1, // Very poor prediction
        actualResponseTime: 10000,
        actualQuality: 0.3,
        timestamp: Date.now(),
      };

      // Track multiple times rapidly
      for (let i = 0; i < 5; i++) {
        await testMonitor.trackPredictionAccuracy(prediction, actual, actual.requestFeatures);
      }

      const alerts = testMonitor.getAlerts();
      const accuracyAlerts = alerts.filter(a => a.type === 'accuracy_degradation');
      
      // Should not have more alerts than reasonable (accounting for cooldown)
      expect(accuracyAlerts.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track monitoring overhead', () => {
      const performance = monitor.getMonitoringPerformance();
      
      expect(performance).toBeDefined();
      expect(performance.averageOverheadMs).toBeGreaterThanOrEqual(0);
      expect(performance.maxOverheadMs).toBeGreaterThanOrEqual(0);
      expect(performance.overheadPercentile95).toBeGreaterThanOrEqual(0);
      expect(performance.queueSize).toBeGreaterThanOrEqual(0);
    });

    it('should provide comprehensive monitoring insights', () => {
      const insights = monitor.getMonitoringInsights();
      
      expect(insights).toBeDefined();
      expect(insights.totalModelsTracked).toBeGreaterThanOrEqual(0);
      expect(insights.totalPredictionsAnalyzed).toBeGreaterThanOrEqual(0);
      expect(insights.averageAccuracy).toBeGreaterThanOrEqual(0);
      expect(insights.driftDetections).toBeGreaterThanOrEqual(0);
      expect(insights.alertsSummary).toBeDefined();
      expect(insights.topPerformingModels).toBeDefined();
      expect(insights.monitoringPerformance).toBeDefined();
    });

    it('should maintain monitoring overhead under threshold', async () => {
      const startTime = performance.now();
      
      // Simulate high-volume monitoring
      const promises = [];
      for (let i = 0; i < 100; i++) {
        const prediction: PredictionResult = {
          provider: APIProvider.ANTHROPIC,
          model: 'claude-sonnet-4-20250514',
          predictedCost: 0.01,
          predictedResponseTime: 2000,
          predictedQuality: 0.9,
          confidence: 0.8,
          reasoning: 'Load test',
        };

        const actual: LearningData = {
          requestFeatures: createMockRequestFeatures(),
          actualProvider: APIProvider.ANTHROPIC,
          actualModel: 'claude-sonnet-4-20250514',
          actualCost: 0.01 + (Math.random() * 0.005),
          actualResponseTime: 2000 + (Math.random() * 500),
          actualQuality: 0.9 + (Math.random() * 0.1),
          timestamp: Date.now(),
        };

        promises.push(monitor.trackPredictionAccuracy(prediction, actual, actual.requestFeatures));
      }

      await Promise.all(promises);
      
      const totalTime = performance.now() - startTime;
      const avgTimePerOperation = totalTime / 100;
      
      // Monitoring overhead should be minimal (less than 5ms per operation)
      expect(avgTimePerOperation).toBeLessThan(5);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero actual values gracefully', async () => {
      const prediction: PredictionResult = {
        provider: APIProvider.ANTHROPIC,
        model: 'claude-sonnet-4-20250514',
        predictedCost: 0.01,
        predictedResponseTime: 2000,
        predictedQuality: 0.9,
        confidence: 0.8,
        reasoning: 'Test',
      };

      const actual: LearningData = {
        requestFeatures: createMockRequestFeatures(),
        actualProvider: APIProvider.ANTHROPIC,
        actualModel: 'claude-sonnet-4-20250514',
        actualCost: 0, // Edge case: zero cost
        actualResponseTime: 0, // Edge case: zero time
        actualQuality: 0, // Edge case: zero quality
        timestamp: Date.now(),
      };

      await monitor.trackPredictionAccuracy(prediction, actual, actual.requestFeatures);

      const metrics = monitor.getCurrentAccuracyMetrics('ANTHROPIC_claude-sonnet-4-20250514');
      expect(metrics).toBeDefined();
      expect(metrics!.sampleSize).toBe(1);
      // Should handle gracefully without throwing errors
    });

    it('should handle empty data gracefully', async () => {
      const metrics = monitor.getCurrentAccuracyMetrics('nonexistent_model');
      expect(metrics).toBeNull();

      const insights = monitor.getMonitoringInsights();
      expect(insights.totalModelsTracked).toBe(0);
      expect(insights.averageAccuracy).toBe(0);
    });

    it('should maintain data size limits', async () => {
      // Create monitor with small limits for testing
      const testMonitor = new MLAccuracyMonitor({
        maxHistorySize: 10,
        asyncProcessing: false,
      });

      // Add more data than the limit
      for (let i = 0; i < 20; i++) {
        const prediction: PredictionResult = {
          provider: APIProvider.ANTHROPIC,
          model: 'claude-sonnet-4-20250514',
          predictedCost: 0.01,
          predictedResponseTime: 2000,
          predictedQuality: 0.9,
          confidence: 0.8,
          reasoning: `Test ${i}`,
        };

        const actual: LearningData = {
          requestFeatures: createMockRequestFeatures(),
          actualProvider: APIProvider.ANTHROPIC,
          actualModel: 'claude-sonnet-4-20250514',
          actualCost: 0.01,
          actualResponseTime: 2000,
          actualQuality: 0.9,
          timestamp: Date.now(),
        };

        await testMonitor.trackPredictionAccuracy(prediction, actual, actual.requestFeatures);
      }

      // Should maintain size limits
      const insights = testMonitor.getMonitoringInsights();
      expect(insights.totalPredictionsAnalyzed).toBeLessThanOrEqual(10);
    });
  });
});

// Helper function to create mock request features
function createMockRequestFeatures(): RequestFeatures {
  return {
    promptLength: 100,
    messageCount: 2,
    hasSystemMessage: false,
    complexityScore: 0.5,
    requestType: RequestType.SIMPLE_CHAT,
    timeOfDay: 12,
    dayOfWeek: 3,
  };
}

// Custom Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(values: any[]): R;
    }
  }
}

expect.extend({
  toBeOneOf(received, values) {
    const pass = values.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${values.join(', ')}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${values.join(', ')}`,
        pass: false,
      };
    }
  },
});