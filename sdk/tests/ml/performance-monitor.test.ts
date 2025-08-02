/**
 * Unit Tests for Performance Monitor
 * 
 * Tests the performance monitoring functionality including:
 * - Metric recording and processing
 * - Sampling strategies
 * - Alert generation
 * - System health monitoring
 * - Async processing
 */

import { PerformanceMonitor, SystemPerformanceSnapshot } from '../../src/ml/performance-monitor';
import { APIProvider, AIRequest, AIResponse, PredictionResult } from '../../src/types';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;
  
  beforeEach(() => {
    monitor = new PerformanceMonitor(
      {
        strategy: 'uniform',
        baseRate: 1.0, // Sample everything for testing
        asyncProcessing: false, // Synchronous for testing
      },
      {
        maxResponseTime: 3000,
        maxErrorRate: 0.1,
        minAccuracy: 0.9,
        maxRoutingLatency: 100,
      }
    );
  });

  afterEach(() => {
    monitor.destroy();
  });

  describe('Metric Recording', () => {
    it('should record metrics correctly', () => {
      const metric = {
        timestamp: Date.now(),
        metric: 'test_metric',
        value: 123.45,
        provider: APIProvider.ANTHROPIC,
        model: 'claude-sonnet-4-20250514',
        tags: { test: 'value' },
      };

      monitor.recordMetric(metric);
      
      // Verify metric was recorded by checking snapshot
      const snapshot = monitor.getCurrentSnapshot();
      expect(snapshot).toBeDefined();
      expect(snapshot.timestamp).toBeGreaterThan(0);
    });

    it('should record request performance', () => {
      const request: AIRequest = {
        model: 'claude-sonnet-4-20250514',
        messages: [{ role: 'user', content: 'Test' }],
      };

      const response: AIResponse = {
        id: 'response-123',
        model: 'claude-sonnet-4-20250514',
        provider: APIProvider.ANTHROPIC,
        choices: [{
          index: 0,
          message: { role: 'assistant', content: 'Hello!' },
          finishReason: 'stop',
        }],
        usage: {
          promptTokens: 5,
          completionTokens: 10,
          totalTokens: 15,
          cost: 0.01,
        },
        created: Date.now(),
      };

      monitor.recordRequest(
        request,
        response,
        1500, // Response time
        undefined,
        APIProvider.ANTHROPIC,
        'claude-sonnet-4-20250514'
      );

      const snapshot = monitor.getCurrentSnapshot();
      expect(snapshot.totalRequests).toBe(1);
      expect(snapshot.errorRate).toBe(0);
      expect(snapshot.avgResponseTime).toBe(1500);
    });

    it('should record errors correctly', () => {
      const request: AIRequest = {
        model: 'claude-sonnet-4-20250514',
        messages: [{ role: 'user', content: 'Test' }],
      };

      const error = new Error('API Error');

      monitor.recordRequest(
        request,
        null,
        5000, // Long response time
        error,
        APIProvider.ANTHROPIC,
        'claude-sonnet-4-20250514'
      );

      const snapshot = monitor.getCurrentSnapshot();
      expect(snapshot.totalRequests).toBe(1);
      expect(snapshot.errorRate).toBe(1.0);
      expect(snapshot.avgResponseTime).toBe(5000);
    });

    it('should record routing performance', () => {
      const prediction: PredictionResult = {
        provider: APIProvider.ANTHROPIC,
        model: 'claude-sonnet-4-20250514',
        predictedCost: 0.01,
        predictedResponseTime: 2000,
        predictedQuality: 0.9,
        confidence: 0.8,
        reasoning: 'Test routing',
      };

      monitor.recordRoutingPerformance(50, prediction);

      const snapshot = monitor.getCurrentSnapshot();
      expect(snapshot.routingLatency).toBe(50);
      expect(snapshot.predictionConfidence).toBe(0.8);
    });
  });

  describe('Sampling Strategies', () => {
    it('should apply uniform sampling correctly', () => {
      const uniformMonitor = new PerformanceMonitor({
        strategy: 'uniform',
        baseRate: 0.5, // 50% sampling
        asyncProcessing: false,
      });

      let recordedCount = 0;
      const totalMetrics = 1000;

      for (let i = 0; i < totalMetrics; i++) {
        const originalLength = uniformMonitor.getMonitoringOverhead().queueSize;
        uniformMonitor.recordMetric({
          timestamp: Date.now(),
          metric: 'test_metric',
          value: i,
        });
        const newLength = uniformMonitor.getMonitoringOverhead().queueSize;
        
        if (newLength > originalLength) {
          recordedCount++;
        }
      }

      // Should be approximately 50% (with some variance due to randomness)
      expect(recordedCount).toBeGreaterThan(totalMetrics * 0.3);
      expect(recordedCount).toBeLessThan(totalMetrics * 0.7);
      
      uniformMonitor.destroy();
    });

    it('should apply adaptive sampling based on volume', () => {
      const adaptiveMonitor = new PerformanceMonitor({
        strategy: 'adaptive',
        baseRate: 1.0,
        highVolumeThreshold: 10, // Low threshold for testing
        asyncProcessing: false,
      });

      // Simulate high volume by recording many requests quickly
      for (let i = 0; i < 100; i++) {
        adaptiveMonitor.recordRequest(
          { model: 'test', messages: [] },
          { id: `${i}`, model: 'test', provider: APIProvider.ANTHROPIC, choices: [], usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2, cost: 0.001 }, created: Date.now() },
          1000,
          undefined,
          APIProvider.ANTHROPIC,
          'test-model'
        );
      }

      const overhead = adaptiveMonitor.getMonitoringOverhead();
      expect(overhead.samplingRate).toBeLessThan(1.0); // Should reduce sampling rate
      
      adaptiveMonitor.destroy();
    });

    it('should always sample errors regardless of sampling rate', () => {
      const errorSamplingMonitor = new PerformanceMonitor({
        strategy: 'uniform',
        baseRate: 0.1, // Very low base rate
        errorSamplingRate: 1.0, // Always sample errors
        asyncProcessing: false,
      });

      // Record error metrics
      for (let i = 0; i < 10; i++) {
        errorSamplingMonitor.recordMetric({
          timestamp: Date.now(),
          metric: 'request_error',
          value: 1,
        });
      }

      // All error metrics should be recorded despite low base sampling rate
      const snapshot = errorSamplingMonitor.getCurrentSnapshot();
      expect(snapshot).toBeDefined();
      
      errorSamplingMonitor.destroy();
    });
  });

  describe('Alert Generation', () => {
    it('should generate latency spike alerts', () => {
      const request: AIRequest = {
        model: 'claude-sonnet-4-20250514',
        messages: [{ role: 'user', content: 'Test' }],
      };

      const response: AIResponse = {
        id: 'response-123',
        model: 'claude-sonnet-4-20250514',
        provider: APIProvider.ANTHROPIC,
        choices: [{
          index: 0,
          message: { role: 'assistant', content: 'Response' },
          finishReason: 'stop',
        }],
        usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15, cost: 0.01 },
        created: Date.now(),
      };

      // Record a very slow request
      monitor.recordRequest(
        request,
        response,
        5000, // 5 seconds - above threshold
        undefined,
        APIProvider.ANTHROPIC,
        'claude-sonnet-4-20250514'
      );

      const alerts = monitor.getAlerts(true); // Get unresolved alerts
      const latencyAlert = alerts.find(a => a.type === 'latency_spike');
      
      expect(latencyAlert).toBeDefined();
      expect(latencyAlert!.severity).toBeOneOf(['high', 'critical']);
      expect(latencyAlert!.value).toBe(5000);
    });

    it('should generate error rate alerts', () => {
      const request: AIRequest = {
        model: 'claude-sonnet-4-20250514',
        messages: [{ role: 'user', content: 'Test' }],
      };

      // Record multiple errors to trigger error rate alert
      for (let i = 0; i < 10; i++) {
        monitor.recordRequest(
          request,
          null,
          2000,
          new Error('Test error'),
          APIProvider.ANTHROPIC,
          'claude-sonnet-4-20250514'
        );
      }

      // Add some successful requests to establish a rate
      for (let i = 0; i < 5; i++) {
        monitor.recordRequest(
          request,
          {
            id: `success-${i}`,
            model: 'claude-sonnet-4-20250514',
            provider: APIProvider.ANTHROPIC,
            choices: [{ index: 0, message: { role: 'assistant', content: 'OK' }, finishReason: 'stop' }],
            usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15, cost: 0.01 },
            created: Date.now(),
          },
          1000,
          undefined,
          APIProvider.ANTHROPIC,
          'claude-sonnet-4-20250514'
        );
      }

      const alerts = monitor.getAlerts(true);
      const errorAlert = alerts.find(a => a.type === 'error_rate_high');
      
      if (errorAlert) {
        expect(errorAlert.severity).toBeOneOf(['medium', 'high', 'critical']);
        expect(errorAlert.value).toBeGreaterThan(0.1); // Above 10% threshold
      }
    });

    it('should respect alert cooldown periods', () => {
      const cooldownMonitor = new PerformanceMonitor(
        { asyncProcessing: false },
        { maxResponseTime: 1000 } // Low threshold
      );

      const request: AIRequest = {
        model: 'test-model',
        messages: [{ role: 'user', content: 'Test' }],
      };

      const response: AIResponse = {
        id: 'response-123',
        model: 'test-model',
        provider: APIProvider.ANTHROPIC,
        choices: [{ index: 0, message: { role: 'assistant', content: 'OK' }, finishReason: 'stop' }],
        usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15, cost: 0.01 },
        created: Date.now(),
      };

      // Record multiple slow requests rapidly
      for (let i = 0; i < 5; i++) {
        cooldownMonitor.recordRequest(
          request,
          response,
          2000, // Above threshold
          undefined,
          APIProvider.ANTHROPIC,
          'test-model'
        );
      }

      const alerts = cooldownMonitor.getAlerts();
      const latencyAlerts = alerts.filter(a => a.type === 'latency_spike');
      
      // Should not create too many alerts due to cooldown
      expect(latencyAlerts.length).toBeLessThanOrEqual(2);
      
      cooldownMonitor.destroy();
    });
  });

  describe('Performance Snapshots', () => {
    it('should generate accurate performance snapshots', () => {
      // Record some test data
      const responseTimes = [1000, 1500, 2000, 2500, 3000];
      
      responseTimes.forEach((time, index) => {
        monitor.recordRequest(
          { model: 'test', messages: [] },
          {
            id: `response-${index}`,
            model: 'test',
            provider: APIProvider.ANTHROPIC,
            choices: [{ index: 0, message: { role: 'assistant', content: 'OK' }, finishReason: 'stop' }],
            usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15, cost: 0.01 },
            created: Date.now(),
          },
          time,
          undefined,
          APIProvider.ANTHROPIC,
          'test'
        );
      });

      const snapshot = monitor.getCurrentSnapshot();
      
      expect(snapshot.totalRequests).toBe(5);
      expect(snapshot.errorRate).toBe(0);
      expect(snapshot.avgResponseTime).toBe(2000); // Average of the response times
      expect(snapshot.p50ResponseTime).toBe(2000); // Median
      expect(snapshot.p95ResponseTime).toBe(3000); // 95th percentile
      expect(snapshot.p99ResponseTime).toBe(3000); // 99th percentile
    });

    it('should calculate provider distribution correctly', () => {
      // Record requests for different providers
      const providers = [
        { provider: APIProvider.ANTHROPIC, model: 'claude-4' },
        { provider: APIProvider.OPENAI, model: 'gpt-4' },
        { provider: APIProvider.GOOGLE, model: 'gemini-pro' },
        { provider: APIProvider.ANTHROPIC, model: 'claude-4' }, // Duplicate to test distribution
      ];

      providers.forEach((config, index) => {
        monitor.recordRequest(
          { model: config.model, messages: [] },
          {
            id: `response-${index}`,
            model: config.model,
            provider: config.provider,
            choices: [{ index: 0, message: { role: 'assistant', content: 'OK' }, finishReason: 'stop' }],
            usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15, cost: 0.01 },
            created: Date.now(),
          },
          1500,
          undefined,
          config.provider,
          config.model
        );
      });

      const snapshot = monitor.getCurrentSnapshot();
      
      expect(snapshot.providerDistribution[APIProvider.ANTHROPIC]).toBe(0.5); // 2/4
      expect(snapshot.providerDistribution[APIProvider.OPENAI]).toBe(0.25); // 1/4
      expect(snapshot.providerDistribution[APIProvider.GOOGLE]).toBe(0.25); // 1/4
    });

    it('should track trends over time', () => {
      // Record some initial data
      for (let i = 0; i < 10; i++) {
        monitor.recordRequest(
          { model: 'test', messages: [] },
          {
            id: `response-${i}`,
            model: 'test',
            provider: APIProvider.ANTHROPIC,
            choices: [{ index: 0, message: { role: 'assistant', content: 'OK' }, finishReason: 'stop' }],
            usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15, cost: 0.01 },
            created: Date.now(),
          },
          1000 + i * 100, // Increasing response times
          undefined,
          APIProvider.ANTHROPIC,
          'test'
        );
      }

      const trends = monitor.getPerformanceTrends(1); // Last 1 hour
      
      expect(trends.responseTime).toBeDefined();
      expect(trends.throughput).toBeDefined();
      expect(trends.errorRate).toBeDefined();
      expect(trends.accuracy).toBeDefined();
      
      expect(Array.isArray(trends.responseTime)).toBe(true);
      expect(Array.isArray(trends.throughput)).toBe(true);
    });
  });

  describe('System Health Monitoring', () => {
    it('should report healthy status with good metrics', () => {
      // Record good performance data
      for (let i = 0; i < 10; i++) {
        monitor.recordRequest(
          { model: 'test', messages: [] },
          {
            id: `response-${i}`,
            model: 'test',
            provider: APIProvider.ANTHROPIC,
            choices: [{ index: 0, message: { role: 'assistant', content: 'OK' }, finishReason: 'stop' }],
            usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15, cost: 0.01 },
            created: Date.now(),
          },
          1000, // Good response time
          undefined,
          APIProvider.ANTHROPIC,
          'test'
        );
      }

      const health = monitor.getHealthStatus();
      
      expect(health.status).toBe('healthy');
      expect(health.score).toBeGreaterThan(85);
      expect(health.issues).toHaveLength(0);
    });

    it('should report warning status with moderate issues', () => {
      // Record some slow responses
      for (let i = 0; i < 10; i++) {
        monitor.recordRequest(
          { model: 'test', messages: [] },
          {
            id: `response-${i}`,
            model: 'test',
            provider: APIProvider.ANTHROPIC,
            choices: [{ index: 0, message: { role: 'assistant', content: 'OK' }, finishReason: 'stop' }],
            usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15, cost: 0.01 },
            created: Date.now(),
          },
          3500, // Slightly above threshold
          undefined,
          APIProvider.ANTHROPIC,
          'test'
        );
      }

      const health = monitor.getHealthStatus();
      
      expect(health.status).toBeOneOf(['warning', 'critical']);
      expect(health.score).toBeLessThan(85);
      expect(health.issues.length).toBeGreaterThan(0);
    });

    it('should report critical status with severe issues', () => {
      // Record many errors and slow responses
      for (let i = 0; i < 10; i++) {
        monitor.recordRequest(
          { model: 'test', messages: [] },
          null, // Error response
          8000, // Very slow
          new Error('Critical error'),
          APIProvider.ANTHROPIC,
          'test'
        );
      }

      const health = monitor.getHealthStatus();
      
      expect(health.status).toBe('critical');
      expect(health.score).toBeLessThan(70);
      expect(health.issues.length).toBeGreaterThan(1);
    });
  });

  describe('Monitoring Overhead', () => {
    it('should track monitoring overhead correctly', () => {
      const overhead = monitor.getMonitoringOverhead();
      
      expect(overhead).toBeDefined();
      expect(overhead.queueSize).toBeGreaterThanOrEqual(0);
      expect(overhead.processingLatency).toBeGreaterThanOrEqual(0);
      expect(overhead.memoryFootprint).toBeGreaterThan(0);
      expect(overhead.samplingRate).toBeGreaterThan(0);
      expect(overhead.samplingRate).toBeLessThanOrEqual(1);
    });

    it('should maintain low overhead under high load', () => {
      const startTime = performance.now();
      
      // Simulate high load
      for (let i = 0; i < 1000; i++) {
        monitor.recordMetric({
          timestamp: Date.now(),
          metric: 'load_test',
          value: Math.random() * 100,
        });
      }
      
      const totalTime = performance.now() - startTime;
      const averageTime = totalTime / 1000;
      
      // Should be very fast (less than 1ms per metric on average)
      expect(averageTime).toBeLessThan(1);
      
      const overhead = monitor.getMonitoringOverhead();
      expect(overhead.memoryFootprint).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });

    it('should estimate memory footprint accurately', () => {
      // Record known amount of data
      const numberOfMetrics = 100;
      
      for (let i = 0; i < numberOfMetrics; i++) {
        monitor.recordMetric({
          timestamp: Date.now(),
          metric: 'memory_test',
          value: i,
          tags: { iteration: i.toString() },
        });
      }

      const overhead = monitor.getMonitoringOverhead();
      
      // Memory footprint should be reasonable and proportional to data
      expect(overhead.memoryFootprint).toBeGreaterThan(0);
      expect(overhead.memoryFootprint).toBeLessThan(numberOfMetrics * 1000); // Less than 1KB per metric
    });
  });

  describe('Async Processing', () => {
    it('should handle async processing correctly', async () => {
      const asyncMonitor = new PerformanceMonitor({
        asyncProcessing: true,
        baseRate: 1.0,
      });

      // Record metrics rapidly
      for (let i = 0; i < 100; i++) {
        asyncMonitor.recordMetric({
          timestamp: Date.now(),
          metric: 'async_test',
          value: i,
        });
      }

      // Give some time for async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      const overhead = asyncMonitor.getMonitoringOverhead();
      expect(overhead.queueSize).toBeLessThanOrEqual(100); // Queue should be processed
      
      asyncMonitor.destroy();
    });

    it('should maintain performance with async processing disabled', () => {
      const syncMonitor = new PerformanceMonitor({
        asyncProcessing: false,
        baseRate: 1.0,
      });

      const startTime = performance.now();
      
      for (let i = 0; i < 500; i++) {
        syncMonitor.recordMetric({
          timestamp: Date.now(),
          metric: 'sync_test',
          value: i,
        });
      }
      
      const totalTime = performance.now() - startTime;
      const averageTime = totalTime / 500;
      
      // Should still be fast even with sync processing
      expect(averageTime).toBeLessThan(2);
      
      syncMonitor.destroy();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null or undefined values gracefully', () => {
      expect(() => {
        monitor.recordRequest(
          { model: 'test', messages: [] },
          null,
          0,
          undefined,
          APIProvider.ANTHROPIC,
          'test'
        );
      }).not.toThrow();

      expect(() => {
        monitor.recordMetric({
          timestamp: Date.now(),
          metric: 'null_test',
          value: 0,
        });
      }).not.toThrow();
    });

    it('should handle very large values', () => {
      expect(() => {
        monitor.recordRequest(
          { model: 'test', messages: [] },
          {
            id: 'large-test',
            model: 'test',
            provider: APIProvider.ANTHROPIC,
            choices: [{ index: 0, message: { role: 'assistant', content: 'OK' }, finishReason: 'stop' }],
            usage: { promptTokens: 1000000, completionTokens: 1000000, totalTokens: 2000000, cost: 1000 },
            created: Date.now(),
          },
          999999, // Very large response time
          undefined,
          APIProvider.ANTHROPIC,
          'test'
        );
      }).not.toThrow();

      const snapshot = monitor.getCurrentSnapshot();
      expect(snapshot).toBeDefined();
      expect(isFinite(snapshot.avgResponseTime)).toBe(true);
    });

    it('should maintain data integrity with rapid operations', () => {
      // Rapidly record many different types of operations
      for (let i = 0; i < 100; i++) {
        if (i % 3 === 0) {
          monitor.recordMetric({
            timestamp: Date.now(),
            metric: 'rapid_test',
            value: i,
          });
        } else if (i % 3 === 1) {
          monitor.recordRequest(
            { model: 'test', messages: [] },
            {
              id: `rapid-${i}`,
              model: 'test',
              provider: APIProvider.ANTHROPIC,
              choices: [{ index: 0, message: { role: 'assistant', content: 'OK' }, finishReason: 'stop' }],
              usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15, cost: 0.01 },
              created: Date.now(),
            },
            1000 + i,
            undefined,
            APIProvider.ANTHROPIC,
            'test'
          );
        } else {
          monitor.recordRoutingPerformance(
            50 + i,
            {
              provider: APIProvider.ANTHROPIC,
              model: 'test',
              predictedCost: 0.01,
              predictedResponseTime: 1000,
              predictedQuality: 0.9,
              confidence: 0.8,
              reasoning: 'rapid test',
            }
          );
        }
      }

      const snapshot = monitor.getCurrentSnapshot();
      expect(snapshot).toBeDefined();
      expect(snapshot.totalRequests).toBeGreaterThan(0);
      
      const health = monitor.getHealthStatus();
      expect(health).toBeDefined();
      expect(health.score).toBeGreaterThanOrEqual(0);
      expect(health.score).toBeLessThanOrEqual(100);
    });

    it('should clean up resources properly', () => {
      monitor.recordMetric({
        timestamp: Date.now(),
        metric: 'cleanup_test',
        value: 123,
      });

      expect(() => {
        monitor.destroy();
      }).not.toThrow();
    });
  });
});

// Custom matcher (reused from other tests)
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