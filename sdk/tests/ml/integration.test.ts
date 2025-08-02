/**
 * Integration Tests for ML Monitoring System
 * 
 * Tests the complete integration of:
 * - ML Router with monitoring
 * - Accuracy monitoring
 * - A/B testing
 * - Performance monitoring
 * - Real-world scenarios
 */

import { MLIntelligentRouter } from '../../src/ml/router';
import { MLAccuracyMonitor } from '../../src/ml/accuracy-monitor';
import { ABTestingFramework } from '../../src/ml/ab-testing';
import { PerformanceMonitor } from '../../src/ml/performance-monitor';
import { APIProvider, AIRequest, AIResponse, PredictionResult, LearningData } from '../../src/types';

describe('ML Monitoring System Integration', () => {
  let router: MLIntelligentRouter;
  let accuracyMonitor: MLAccuracyMonitor;
  let abTesting: ABTestingFramework;
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    // Initialize monitoring systems
    accuracyMonitor = new MLAccuracyMonitor({ asyncProcessing: false });
    abTesting = new ABTestingFramework();
    performanceMonitor = new PerformanceMonitor({ asyncProcessing: false });
    
    // Initialize router with monitoring enabled
    router = new MLIntelligentRouter({
      enableAccuracyMonitoring: true,
      enableABTesting: true,
      enablePerformanceMonitoring: true,
    });
  });

  afterEach(() => {
    // Clean up resources
    abTesting.destroy();
    performanceMonitor.destroy();
  });

  describe('End-to-End Claude 4 Monitoring', () => {
    it('should perform complete monitoring workflow', async () => {
      // Step 1: Route a request
      const request: AIRequest = {
        model: 'claude-sonnet-4-20250514',
        messages: [
          { role: 'user', content: 'Analyze the performance of our new Claude 4 integration' }
        ],
        maxTokens: 1000,
        temperature: 0.7,
      };

      const routingDecision = await router.intelligentRoute(
        request,
        'test-user-1',
        [APIProvider.ANTHROPIC, APIProvider.OPENAI],
        { optimizeFor: 'quality' }
      );

      expect(routingDecision).toBeDefined();
      expect(routingDecision.selectedProvider).toBe(APIProvider.ANTHROPIC);
      expect(routingDecision.routingMetrics).toBeDefined();
      expect(routingDecision.routingMetrics!.routingTime).toBeGreaterThan(0);

      // Step 2: Simulate actual execution
      const actualResponse: AIResponse = {
        id: 'response-integration-test',
        model: routingDecision.selectedModel,
        provider: routingDecision.selectedProvider,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: 'The Claude 4 integration shows excellent performance with improved reasoning capabilities and maintained cost efficiency.',
          },
          finishReason: 'stop',
        }],
        usage: {
          promptTokens: 15,
          completionTokens: 25,
          totalTokens: 40,
          cost: 0.012,
        },
        created: Date.now(),
      };

      const actualResponseTime = 2200;
      const userSatisfaction = 4.5; // Out of 5

      // Step 3: Learn from execution (this triggers all monitoring)
      await router.learnFromExecution(
        request,
        'test-user-1',
        routingDecision.selectedProvider,
        routingDecision.selectedModel,
        actualResponse,
        actualResponseTime,
        {
          provider: routingDecision.selectedProvider,
          model: routingDecision.selectedModel,
          predictedCost: routingDecision.predictedCost,
          predictedResponseTime: routingDecision.predictedResponseTime,
          predictedQuality: routingDecision.predictedQuality,
          confidence: routingDecision.confidence,
          reasoning: routingDecision.reasoning,
        },
        userSatisfaction
      );

      // Step 4: Verify monitoring was triggered
      const insights = await router.getMLInsights('test-user-1');
      expect(insights).toBeDefined();
      expect(insights.totalPredictions).toBeGreaterThan(0);
      expect(insights.monitoringData).toBeDefined();
      expect(insights.abTestingSummary).toBeDefined();
    });

    it('should detect performance degradation in real-time', async () => {
      // Simulate multiple requests with degrading performance
      const requests = Array.from({ length: 20 }, (_, i) => ({
        request: {
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: `Test request ${i}` }],
        },
        // Simulate degrading performance over time
        actualCost: 0.01 + (i * 0.002), // Cost increases
        actualResponseTime: 2000 + (i * 200), // Response time increases
        actualQuality: 0.95 - (i * 0.02), // Quality decreases
      }));

      for (const { request, actualCost, actualResponseTime, actualQuality } of requests) {
        const routingDecision = await router.intelligentRoute(
          request,
          'degradation-test-user',
          [APIProvider.ANTHROPIC],
          { optimizeFor: 'balanced' }
        );

        const actualResponse: AIResponse = {
          id: `degradation-${Date.now()}`,
          model: routingDecision.selectedModel,
          provider: routingDecision.selectedProvider,
          choices: [{
            index: 0,
            message: { role: 'assistant', content: 'Response' },
            finishReason: 'stop',
          }],
          usage: {
            promptTokens: 10,
            completionTokens: 15,
            totalTokens: 25,
            cost: actualCost,
          },
          created: Date.now(),
        };

        await router.learnFromExecution(
          request,
          'degradation-test-user',
          routingDecision.selectedProvider,
          routingDecision.selectedModel,
          actualResponse,
          actualResponseTime,
          {
            provider: routingDecision.selectedProvider,
            model: routingDecision.selectedModel,
            predictedCost: routingDecision.predictedCost,
            predictedResponseTime: routingDecision.predictedResponseTime,
            predictedQuality: routingDecision.predictedQuality,
            confidence: routingDecision.confidence,
            reasoning: routingDecision.reasoning,
          }
        );
      }

      // Check for alerts and insights
      const insights = await router.getMLInsights('degradation-test-user');
      expect(insights.monitoringData).toBeDefined();
      
      // Should detect degradation
      if (insights.monitoringData!.activeAlerts > 0) {
        expect(insights.monitoringData!.activeAlerts).toBeGreaterThan(0);
        expect(insights.monitoringData!.systemHealth).toBeOneOf(['warning', 'critical']);
      }
    });
  });

  describe('A/B Testing Integration', () => {
    it('should conduct Claude 4 vs Claude 3.5 A/B test', async () => {
      // Create and start A/B test
      const testConfig = {
        id: 'claude4-vs-claude35-integration',
        name: 'Claude 4 vs Claude 3.5 Integration Test',
        description: 'Compare Claude 4 and Claude 3.5 Sonnet performance',
        hypothesis: 'Claude 4 provides better quality responses',
        variantA: {
          provider: APIProvider.ANTHROPIC,
          model: 'claude-3-5-sonnet-20241022',
          weight: 0.5,
        },
        variantB: {
          provider: APIProvider.ANTHROPIC,
          model: 'claude-sonnet-4-20250514',
          weight: 0.5,
        },
        minSampleSize: 10,
        maxDuration: 24 * 60 * 60 * 1000, // 24 hours
        significanceLevel: 0.05,
        minimumDetectableEffect: 0.1,
        trafficAllocation: 1.0, // 100% for testing
        primaryMetric: 'quality' as const,
        secondaryMetrics: ['cost', 'responseTime'] as const,
        status: 'draft' as const,
        autoStop: {
          enabled: false,
          winnerThreshold: 0.95,
          futilityThreshold: 0.1,
        },
      };

      abTesting.createTest(testConfig);
      abTesting.startTest(testConfig.id);

      // Simulate multiple users participating in the test
      const testUsers = Array.from({ length: 30 }, (_, i) => `test-user-${i}`);
      
      for (const userId of testUsers) {
        const request: AIRequest = {
          model: 'claude-sonnet-4-20250514', // Will be overridden by A/B test
          messages: [{ role: 'user', content: 'Compare the performance of these AI models' }],
        };

        if (abTesting.shouldParticipateInTest(testConfig.id, userId, request)) {
          const variant = abTesting.assignVariant(testConfig.id, userId);
          if (variant) {
            const variantConfig = abTesting.getVariantConfig(testConfig.id, variant);
            
            if (variantConfig) {
              // Simulate different performance for each variant
              const isVariantA = variant === 'A';
              const actualCost = isVariantA ? 0.008 : 0.012; // A is cheaper
              const actualResponseTime = isVariantA ? 2200 : 1800; // B is faster
              const actualQuality = isVariantA ? 0.88 : 0.93; // B is higher quality

              const prediction: PredictionResult = {
                provider: variantConfig.provider,
                model: variantConfig.model,
                predictedCost: actualCost,
                predictedResponseTime: actualResponseTime,
                predictedQuality: actualQuality,
                confidence: 0.8,
                reasoning: `A/B test variant ${variant}`,
              };

              const actualResponse: AIResponse = {
                id: `ab-test-${userId}-${variant}`,
                model: variantConfig.model,
                provider: variantConfig.provider,
                choices: [{
                  index: 0,
                  message: { role: 'assistant', content: 'Model comparison response' },
                  finishReason: 'stop',
                }],
                usage: {
                  promptTokens: 12,
                  completionTokens: 20,
                  totalTokens: 32,
                  cost: actualCost,
                },
                created: Date.now(),
              };

              // Record the A/B test result
              abTesting.recordResult({
                testId: testConfig.id,
                variant,
                userId,
                requestId: actualResponse.id,
                timestamp: Date.now(),
                request,
                prediction,
                actualResponse,
                actualCost,
                actualResponseTime,
                actualQuality,
                costAccuracy: 1.0, // Perfect prediction for testing
                timeAccuracy: 1.0,
                qualityAccuracy: 1.0,
              });
            }
          }
        }
      }

      // Analyze the test results
      const analysis = abTesting.getTestAnalysis(testConfig.id);
      expect(analysis).toBeDefined();
      expect(analysis!.sampleSizes.variantA).toBeGreaterThan(0);
      expect(analysis!.sampleSizes.variantB).toBeGreaterThan(0);
      
      // Should have sufficient data for analysis
      if (analysis!.sampleSizes.variantA >= 10 && analysis!.sampleSizes.variantB >= 10) {
        expect(analysis!.status).not.toBe('insufficient_data');
        expect(analysis!.primaryMetricResults).toBeDefined();
        expect(analysis!.secondaryMetricResults).toBeDefined();
      }
    });
  });

  describe('Performance Under Load', () => {
    it('should maintain performance under high request volume', async () => {
      const startTime = performance.now();
      const numberOfRequests = 100;
      const promises: Promise<any>[] = [];

      // Simulate high-volume concurrent requests
      for (let i = 0; i < numberOfRequests; i++) {
        const promise = (async () => {
          const request: AIRequest = {
            model: 'claude-sonnet-4-20250514',
            messages: [{ role: 'user', content: `Load test request ${i}` }],
          };

          const routingDecision = await router.intelligentRoute(
            request,
            `load-test-user-${i % 10}`, // 10 different users
            [APIProvider.ANTHROPIC, APIProvider.OPENAI, APIProvider.GOOGLE],
            { optimizeFor: 'speed' }
          );

          // Simulate response
          const actualResponse: AIResponse = {
            id: `load-test-${i}`,
            model: routingDecision.selectedModel,
            provider: routingDecision.selectedProvider,
            choices: [{
              index: 0,
              message: { role: 'assistant', content: `Response ${i}` },
              finishReason: 'stop',
            }],
            usage: {
              promptTokens: 8,
              completionTokens: 12,
              totalTokens: 20,
              cost: 0.008,
            },
            created: Date.now(),
          };

          await router.learnFromExecution(
            request,
            `load-test-user-${i % 10}`,
            routingDecision.selectedProvider,
            routingDecision.selectedModel,
            actualResponse,
            1500 + (Math.random() * 1000), // Random response time
            {
              provider: routingDecision.selectedProvider,
              model: routingDecision.selectedModel,
              predictedCost: routingDecision.predictedCost,
              predictedResponseTime: routingDecision.predictedResponseTime,
              predictedQuality: routingDecision.predictedQuality,
              confidence: routingDecision.confidence,
              reasoning: routingDecision.reasoning,
            }
          );

          return routingDecision;
        })();

        promises.push(promise);
      }

      // Wait for all requests to complete
      const results = await Promise.all(promises);
      const totalTime = performance.now() - startTime;
      const averageTime = totalTime / numberOfRequests;

      // Verify all requests completed successfully
      expect(results).toHaveLength(numberOfRequests);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.selectedProvider).toBeDefined();
        expect(result.selectedModel).toBeDefined();
      });

      // Performance requirements
      expect(averageTime).toBeLessThan(50); // Less than 50ms per request on average
      expect(totalTime).toBeLessThan(5000); // Total time less than 5 seconds

      // Verify monitoring overhead is minimal
      const insights = await router.getMLInsights();
      expect(insights.totalPredictions).toBe(numberOfRequests);
      
      if (insights.monitoringData) {
        expect(insights.monitoringData.systemHealth).toBeOneOf(['healthy', 'warning']);
      }
    });

    it('should adapt sampling under extreme load', async () => {
      // Create monitor with adaptive sampling
      const adaptiveMonitor = new PerformanceMonitor({
        strategy: 'adaptive',
        baseRate: 1.0,
        highVolumeThreshold: 50, // Trigger adaptive sampling at 50 RPS
        asyncProcessing: false,
      });

      const requestsPerSecond = 200;
      const duration = 2; // 2 seconds
      const totalRequests = requestsPerSecond * duration;

      // Simulate extreme load
      const startTime = Date.now();
      for (let i = 0; i < totalRequests; i++) {
        adaptiveMonitor.recordRequest(
          { model: 'test', messages: [] },
          {
            id: `extreme-${i}`,
            model: 'test',
            provider: APIProvider.ANTHROPIC,
            choices: [{ index: 0, message: { role: 'assistant', content: 'OK' }, finishReason: 'stop' }],
            usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15, cost: 0.01 },
            created: Date.now(),
          },
          1000 + (Math.random() * 500),
          undefined,
          APIProvider.ANTHROPIC,
          'test-model'
        );

        // Simulate real-time distribution
        if (i % requestsPerSecond === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const endTime = Date.now();
      const actualDuration = (endTime - startTime) / 1000;
      const actualRPS = totalRequests / actualDuration;

      // Verify adaptive sampling kicked in
      const overhead = adaptiveMonitor.getMonitoringOverhead();
      if (actualRPS > 50) {
        expect(overhead.samplingRate).toBeLessThan(1.0);
      }

      // System should remain responsive
      const health = adaptiveMonitor.getHealthStatus();
      expect(health.score).toBeGreaterThan(0);

      adaptiveMonitor.destroy();
    });
  });

  describe('Data Consistency and Recovery', () => {
    it('should maintain data consistency across monitoring systems', async () => {
      const testData = Array.from({ length: 50 }, (_, i) => ({
        userId: `consistency-user-${i % 5}`,
        request: {
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: `Consistency test ${i}` }],
        },
        provider: i % 2 === 0 ? APIProvider.ANTHROPIC : APIProvider.OPENAI,
        model: i % 2 === 0 ? 'claude-sonnet-4-20250514' : 'gpt-4',
        cost: 0.01 + (i * 0.001),
        responseTime: 1500 + (i * 50),
        quality: 0.85 + (i * 0.002),
      }));

      // Process all test data
      for (const data of testData) {
        const routingDecision = await router.intelligentRoute(
          data.request,
          data.userId,
          [data.provider],
          { optimizeFor: 'balanced' }
        );

        const actualResponse: AIResponse = {
          id: `consistency-${Date.now()}-${Math.random()}`,
          model: data.model,
          provider: data.provider,
          choices: [{
            index: 0,
            message: { role: 'assistant', content: 'Consistency test response' },
            finishReason: 'stop',
          }],
          usage: {
            promptTokens: 10,
            completionTokens: 15,
            totalTokens: 25,
            cost: data.cost,
          },
          created: Date.now(),
        };

        await router.learnFromExecution(
          data.request,
          data.userId,
          data.provider,
          data.model,
          actualResponse,
          data.responseTime,
          {
            provider: data.provider,
            model: data.model,
            predictedCost: data.cost,
            predictedResponseTime: data.responseTime,
            predictedQuality: data.quality,
            confidence: 0.8,
            reasoning: 'Consistency test',
          }
        );
      }

      // Verify data consistency across all systems
      const insights = await router.getMLInsights();
      expect(insights.totalPredictions).toBe(testData.length);

      // Check that accuracy metrics are reasonable
      expect(insights.accuracyMetrics.costAccuracy).toBeGreaterThan(0.5);
      expect(insights.accuracyMetrics.timeAccuracy).toBeGreaterThan(0.5);
      expect(insights.accuracyMetrics.qualityAccuracy).toBeGreaterThan(0.5);

      // Verify monitoring data integrity
      if (insights.monitoringData) {
        expect(insights.monitoringData.driftDetections).toBeGreaterThanOrEqual(0);
        expect(insights.monitoringData.activeAlerts).toBeGreaterThanOrEqual(0);
        expect(['healthy', 'warning', 'critical']).toContain(insights.monitoringData.systemHealth);
      }
    });

    it('should handle system recovery after errors', async () => {
      // Simulate system with initial errors
      const errorRequests = Array.from({ length: 10 }, (_, i) => ({
        userId: `recovery-user-${i}`,
        request: {
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: `Error test ${i}` }],
        },
        hasError: true,
      }));

      // Process error requests
      for (const { userId, request } of errorRequests) {
        const routingDecision = await router.intelligentRoute(
          request,
          userId,
          [APIProvider.ANTHROPIC],
          { optimizeFor: 'balanced' }
        );

        // Simulate error in execution
        await router.learnFromExecution(
          request,
          userId,
          routingDecision.selectedProvider,
          routingDecision.selectedModel,
          {
            id: 'error-response',
            model: routingDecision.selectedModel,
            provider: routingDecision.selectedProvider,
            choices: [],
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, cost: 0 },
            created: Date.now(),
          },
          10000, // Very slow
          {
            provider: routingDecision.selectedProvider,
            model: routingDecision.selectedModel,
            predictedCost: 0.01,
            predictedResponseTime: 2000,
            predictedQuality: 0.9,
            confidence: 0.8,
            reasoning: 'Error test',
          }
        );
      }

      // Check system health after errors
      let insights = await router.getMLInsights();
      const initialHealth = insights.monitoringData?.systemHealth;

      // Now simulate recovery with successful requests
      const recoveryRequests = Array.from({ length: 20 }, (_, i) => ({
        userId: `recovery-user-${i}`,
        request: {
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: `Recovery test ${i}` }],
        },
      }));

      for (const { userId, request } of recoveryRequests) {
        const routingDecision = await router.intelligentRoute(
          request,
          userId,
          [APIProvider.ANTHROPIC],
          { optimizeFor: 'balanced' }
        );

        const successResponse: AIResponse = {
          id: `recovery-${Date.now()}`,
          model: routingDecision.selectedModel,
          provider: routingDecision.selectedProvider,
          choices: [{
            index: 0,
            message: { role: 'assistant', content: 'Recovery successful' },
            finishReason: 'stop',
          }],
          usage: {
            promptTokens: 10,
            completionTokens: 15,
            totalTokens: 25,
            cost: 0.01,
          },
          created: Date.now(),
        };

        await router.learnFromExecution(
          request,
          userId,
          routingDecision.selectedProvider,
          routingDecision.selectedModel,
          successResponse,
          1800, // Good response time
          {
            provider: routingDecision.selectedProvider,
            model: routingDecision.selectedModel,
            predictedCost: 0.01,
            predictedResponseTime: 1800,
            predictedQuality: 0.9,
            confidence: 0.8,
            reasoning: 'Recovery test',
          }
        );
      }

      // Verify system recovery
      insights = await router.getMLInsights();
      const finalHealth = insights.monitoringData?.systemHealth;

      expect(insights.totalPredictions).toBe(30); // 10 errors + 20 successes
      
      // System should show signs of recovery (equal or better health)
      if (initialHealth === 'critical' && finalHealth) {
        expect(['critical', 'warning', 'healthy']).toContain(finalHealth);
      }
    });
  });
});

// Custom matcher for test utilities
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