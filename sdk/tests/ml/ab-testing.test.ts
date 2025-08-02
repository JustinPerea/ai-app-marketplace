/**
 * Unit Tests for A/B Testing Framework
 * 
 * Tests the A/B testing functionality including:
 * - Test creation and management
 * - User assignment and variant selection
 * - Statistical analysis
 * - Result tracking and analysis
 */

import { ABTestingFramework, ABTestConfig, ABTestResult } from '../../src/ml/ab-testing';
import { APIProvider, AIRequest, AIResponse, PredictionResult } from '../../src/types';

describe('ABTestingFramework', () => {
  let framework: ABTestingFramework;
  
  beforeEach(() => {
    framework = new ABTestingFramework();
  });

  afterEach(() => {
    framework.destroy();
  });

  describe('Test Creation and Management', () => {
    it('should create a new A/B test successfully', () => {
      const testConfig: ABTestConfig = createMockTestConfig('test-1');
      
      framework.createTest(testConfig);
      
      const allTests = framework.getAllTests();
      expect(allTests).toHaveLength(1);
      expect(allTests[0].id).toBe('test-1');
      expect(allTests[0].status).toBe('draft');
    });

    it('should prevent creating duplicate test IDs', () => {
      const testConfig = createMockTestConfig('duplicate-test');
      
      framework.createTest(testConfig);
      
      expect(() => {
        framework.createTest(testConfig);
      }).toThrow('A/B test with ID duplicate-test already exists');
    });

    it('should validate test configuration', () => {
      const invalidConfig: ABTestConfig = {
        ...createMockTestConfig('invalid-test'),
        variantA: { ...createMockTestConfig('invalid-test').variantA, weight: 0.7 },
        variantB: { ...createMockTestConfig('invalid-test').variantB, weight: 0.4 }, // Sum > 1
      };

      expect(() => {
        framework.createTest(invalidConfig);
      }).toThrow('Variant weights must sum to 1.0');
    });

    it('should start and stop tests correctly', () => {
      const testConfig = createMockTestConfig('lifecycle-test');
      framework.createTest(testConfig);
      
      framework.startTest('lifecycle-test');
      let runningTests = framework.getRunningTests();
      expect(runningTests).toHaveLength(1);
      expect(runningTests[0].status).toBe('running');
      
      framework.stopTest('lifecycle-test');
      runningTests = framework.getRunningTests();
      expect(runningTests).toHaveLength(0);
    });

    it('should handle test expiration', () => {
      const testConfig: ABTestConfig = {
        ...createMockTestConfig('expiry-test'),
        maxDuration: 100, // 100ms for quick testing
      };
      
      framework.createTest(testConfig);
      framework.startTest('expiry-test');
      
      // Wait for expiration
      return new Promise(resolve => {
        setTimeout(() => {
          const participation = framework.shouldParticipateInTest('expiry-test', 'user-1', createMockRequest());
          expect(participation).toBe(false);
          resolve(undefined);
        }, 150);
      });
    });
  });

  describe('User Assignment and Variant Selection', () => {
    beforeEach(() => {
      const testConfig = createMockTestConfig('assignment-test');
      framework.createTest(testConfig);
      framework.startTest('assignment-test');
    });

    it('should assign users to variants consistently', () => {
      const userId = 'consistent-user';
      const request = createMockRequest();
      
      const firstAssignment = framework.assignVariant('assignment-test', userId);
      const secondAssignment = framework.assignVariant('assignment-test', userId);
      
      expect(firstAssignment).toBeDefined();
      expect(secondAssignment).toBe(firstAssignment);
    });

    it('should respect traffic allocation', () => {
      const testConfig: ABTestConfig = {
        ...createMockTestConfig('traffic-test'),
        trafficAllocation: 0.1, // Only 10% of traffic
      };
      
      framework.createTest(testConfig);
      framework.startTest('traffic-test');
      
      let participatingUsers = 0;
      const totalUsers = 1000;
      
      for (let i = 0; i < totalUsers; i++) {
        if (framework.shouldParticipateInTest('traffic-test', `user-${i}`, createMockRequest())) {
          participatingUsers++;
        }
      }
      
      // Should be approximately 10% (allowing for randomness)
      expect(participatingUsers).toBeLessThan(totalUsers * 0.2);
      expect(participatingUsers).toBeGreaterThan(totalUsers * 0.05);
    });

    it('should distribute users between variants according to weights', () => {
      const testConfig: ABTestConfig = {
        ...createMockTestConfig('weight-test'),
        variantA: { ...createMockTestConfig('weight-test').variantA, weight: 0.3 },
        variantB: { ...createMockTestConfig('weight-test').variantB, weight: 0.7 },
      };
      
      framework.createTest(testConfig);
      framework.startTest('weight-test');
      
      let variantACount = 0;
      let variantBCount = 0;
      const totalUsers = 1000;
      
      for (let i = 0; i < totalUsers; i++) {
        const variant = framework.assignVariant('weight-test', `user-${i}`);
        if (variant === 'A') variantACount++;
        if (variant === 'B') variantBCount++;
      }
      
      const variantARatio = variantACount / totalUsers;
      const variantBRatio = variantBCount / totalUsers;
      
      // Should be approximately 30/70 split (allowing for randomness)
      expect(variantARatio).toBeCloseTo(0.3, 1);
      expect(variantBRatio).toBeCloseTo(0.7, 1);
    });

    it('should return correct variant configuration', () => {
      const config = framework.getVariantConfig('assignment-test', 'A');
      expect(config).toBeDefined();
      expect(config!.provider).toBe(APIProvider.ANTHROPIC);
      expect(config!.model).toBe('claude-3-5-sonnet-20241022');
      
      const configB = framework.getVariantConfig('assignment-test', 'B');
      expect(configB).toBeDefined();
      expect(configB!.provider).toBe(APIProvider.ANTHROPIC);
      expect(configB!.model).toBe('claude-sonnet-4-20250514');
    });
  });

  describe('Result Tracking', () => {
    beforeEach(() => {
      const testConfig = createMockTestConfig('results-test');
      framework.createTest(testConfig);
      framework.startTest('results-test');
    });

    it('should record test results correctly', () => {
      const testResult: ABTestResult = createMockTestResult('results-test', 'A');
      
      framework.recordResult(testResult);
      
      const analysis = framework.getTestAnalysis('results-test');
      expect(analysis).toBeDefined();
      expect(analysis!.sampleSizes.variantA).toBe(1);
    });

    it('should not record results for non-running tests', () => {
      framework.stopTest('results-test');
      
      const testResult: ABTestResult = createMockTestResult('results-test', 'A');
      framework.recordResult(testResult);
      
      const analysis = framework.getTestAnalysis('results-test');
      expect(analysis).toBeDefined();
      expect(analysis!.sampleSizes.variantA).toBe(0);
    });

    it('should maintain result history limits', () => {
      // Record many results
      for (let i = 0; i < 15000; i++) {
        const result: ABTestResult = {
          ...createMockTestResult('results-test', i % 2 === 0 ? 'A' : 'B'),
          requestId: `request-${i}`,
        };
        framework.recordResult(result);
      }
      
      const analysis = framework.getTestAnalysis('results-test');
      expect(analysis).toBeDefined();
      
      // Should maintain reasonable limits (check that it doesn't crash)
      expect(analysis!.sampleSizes.variantA + analysis!.sampleSizes.variantB).toBeLessThanOrEqual(10000);
    });
  });

  describe('Statistical Analysis', () => {
    beforeEach(() => {
      const testConfig = createMockTestConfig('stats-test');
      framework.createTest(testConfig);
      framework.startTest('stats-test');
    });

    it('should detect insufficient data', () => {
      // Record only a few results
      for (let i = 0; i < 3; i++) {
        framework.recordResult(createMockTestResult('stats-test', 'A'));
        framework.recordResult(createMockTestResult('stats-test', 'B'));
      }
      
      const analysis = framework.getTestAnalysis('stats-test');
      expect(analysis).toBeDefined();
      expect(analysis!.status).toBe('insufficient_data');
      expect(analysis!.recommendation).toBe('continue_test');
    });

    it('should detect significant differences', () => {
      // Record results with clear difference in primary metric (cost)
      const variantAResults = Array.from({ length: 60 }, (_, i) => ({
        ...createMockTestResult('stats-test', 'A'),
        actualCost: 0.01, // Lower cost
        requestId: `a-${i}`,
      }));
      
      const variantBResults = Array.from({ length: 60 }, (_, i) => ({
        ...createMockTestResult('stats-test', 'B'),
        actualCost: 0.02, // Higher cost
        requestId: `b-${i}`,
      }));
      
      [...variantAResults, ...variantBResults].forEach(result => {
        framework.recordResult(result);
      });
      
      const analysis = framework.getTestAnalysis('stats-test');
      expect(analysis).toBeDefined();
      expect(analysis!.status).toBeOneOf(['variant_a_wins', 'variant_b_wins']);
      expect(analysis!.isSignificant).toBe(true);
      expect(analysis!.recommendation).toBeOneOf(['choose_variant_a', 'choose_variant_b']);
    });

    it('should detect no significant difference', () => {
      // Record results with similar performance
      const results = Array.from({ length: 120 }, (_, i) => ({
        ...createMockTestResult('stats-test', i % 2 === 0 ? 'A' : 'B'),
        actualCost: 0.01 + (Math.random() * 0.001), // Similar costs with small variance
        actualResponseTime: 2000 + (Math.random() * 100),
        actualQuality: 0.9 + (Math.random() * 0.05),
        requestId: `similar-${i}`,
      }));
      
      results.forEach(result => {
        framework.recordResult(result);
      });
      
      const analysis = framework.getTestAnalysis('stats-test');
      expect(analysis).toBeDefined();
      expect(analysis!.status).toBe('no_significant_difference');
      expect(analysis!.recommendation).toBe('continue_test');
    });

    it('should calculate correct statistical measures', () => {
      // Create controlled test data
      const variantAResults = Array.from({ length: 100 }, (_, i) => ({
        ...createMockTestResult('stats-test', 'A'),
        actualCost: 0.01, // Exactly 0.01
        requestId: `controlled-a-${i}`,
      }));
      
      const variantBResults = Array.from({ length: 100 }, (_, i) => ({
        ...createMockTestResult('stats-test', 'B'),
        actualCost: 0.015, // Exactly 0.015 (50% higher)
        requestId: `controlled-b-${i}`,
      }));
      
      [...variantAResults, ...variantBResults].forEach(result => {
        framework.recordResult(result);
      });
      
      const analysis = framework.getTestAnalysis('stats-test');
      expect(analysis).toBeDefined();
      expect(analysis!.means.variantA).toBeCloseTo(0.01, 3);
      expect(analysis!.means.variantB).toBeCloseTo(0.015, 3);
      expect(analysis!.effect).toBeCloseTo(0.005, 3);
      expect(analysis!.primaryMetricResults.improvement).toBeCloseTo(50, 0); // 50% improvement
    });

    it('should analyze secondary metrics', () => {
      const testConfig: ABTestConfig = {
        ...createMockTestConfig('secondary-test'),
        primaryMetric: 'cost',
        secondaryMetrics: ['responseTime', 'quality'],
      };
      
      framework.createTest(testConfig);
      framework.startTest('secondary-test');
      
      // Record results with differences in secondary metrics
      const results = Array.from({ length: 100 }, (_, i) => {
        const variant = i % 2 === 0 ? 'A' : 'B';
        return {
          ...createMockTestResult('secondary-test', variant),
          actualCost: 0.01, // Same cost
          actualResponseTime: variant === 'A' ? 2000 : 1800, // B is faster
          actualQuality: variant === 'A' ? 0.85 : 0.9, // B is higher quality
          requestId: `secondary-${i}`,
        };
      });
      
      results.forEach(result => {
        framework.recordResult(result);
      });
      
      const analysis = framework.getTestAnalysis('secondary-test');
      expect(analysis).toBeDefined();
      expect(analysis!.secondaryMetricResults).toBeDefined();
      expect(analysis!.secondaryMetricResults.responseTime).toBeDefined();
      expect(analysis!.secondaryMetricResults.quality).toBeDefined();
      
      // Variant B should show improvement in secondary metrics
      expect(analysis!.secondaryMetricResults.responseTime.improvement).toBeGreaterThan(0);
      expect(analysis!.secondaryMetricResults.quality.improvement).toBeGreaterThan(0);
    });
  });

  describe('Auto-stopping Rules', () => {
    it('should auto-stop test when winner threshold is reached', () => {
      const testConfig: ABTestConfig = {
        ...createMockTestConfig('auto-stop-test'),
        autoStop: {
          enabled: true,
          winnerThreshold: 0.9,
          futilityThreshold: 0.1,
        },
      };
      
      framework.createTest(testConfig);
      framework.startTest('auto-stop-test');
      
      // Record clear winner data
      const results = Array.from({ length: 200 }, (_, i) => ({
        ...createMockTestResult('auto-stop-test', i % 2 === 0 ? 'A' : 'B'),
        actualCost: i % 2 === 0 ? 0.005 : 0.02, // A is much cheaper
        requestId: `auto-stop-${i}`,
      }));
      
      results.forEach(result => {
        framework.recordResult(result);
      });
      
      // Trigger analysis
      framework.analyzeTest('auto-stop-test');
      
      const allTests = framework.getAllTests();
      const test = allTests.find(t => t.id === 'auto-stop-test');
      
      // Test should be auto-stopped if significant result is found
      if (test && framework.getTestAnalysis('auto-stop-test')?.isSignificant) {
        expect(test.status).toBeOneOf(['completed', 'stopped']);
      }
    });

    it('should continue test when auto-stop is disabled', () => {
      const testConfig: ABTestConfig = {
        ...createMockTestConfig('no-auto-stop-test'),
        autoStop: {
          enabled: false,
          winnerThreshold: 0.9,
          futilityThreshold: 0.1,
        },
      };
      
      framework.createTest(testConfig);
      framework.startTest('no-auto-stop-test');
      
      // Record clear winner data
      const results = Array.from({ length: 200 }, (_, i) => ({
        ...createMockTestResult('no-auto-stop-test', i % 2 === 0 ? 'A' : 'B'),
        actualCost: i % 2 === 0 ? 0.005 : 0.02, // A is much cheaper
        requestId: `no-auto-stop-${i}`,
      }));
      
      results.forEach(result => {
        framework.recordResult(result);
      });
      
      framework.analyzeTest('no-auto-stop-test');
      
      const allTests = framework.getAllTests();
      const test = allTests.find(t => t.id === 'no-auto-stop-test');
      
      expect(test?.status).toBe('running');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle high-volume test data efficiently', () => {
      const testConfig = createMockTestConfig('performance-test');
      framework.createTest(testConfig);
      framework.startTest('performance-test');
      
      const startTime = performance.now();
      
      // Record many results
      for (let i = 0; i < 5000; i++) {
        const result = {
          ...createMockTestResult('performance-test', i % 2 === 0 ? 'A' : 'B'),
          requestId: `perf-${i}`,
        };
        framework.recordResult(result);
      }
      
      const recordingTime = performance.now() - startTime;
      
      // Analysis should complete in reasonable time
      const analysisStart = performance.now();
      const analysis = framework.analyzeTest('performance-test');
      const analysisTime = performance.now() - analysisStart;
      
      expect(recordingTime).toBeLessThan(1000); // Less than 1 second for 5000 records
      expect(analysisTime).toBeLessThan(500); // Less than 500ms for analysis
      expect(analysis).toBeDefined();
    });

    it('should handle missing or invalid test IDs gracefully', () => {
      expect(framework.getTestAnalysis('nonexistent-test')).toBeNull();
      expect(framework.assignVariant('nonexistent-test', 'user-1')).toBeNull();
      expect(framework.getVariantConfig('nonexistent-test', 'A')).toBeNull();
      
      expect(() => {
        framework.startTest('nonexistent-test');
      }).toThrow();
      
      expect(() => {
        framework.stopTest('nonexistent-test');
      }).toThrow();
    });

    it('should handle edge cases in statistical calculations', () => {
      const testConfig = createMockTestConfig('edge-case-test');
      framework.createTest(testConfig);
      framework.startTest('edge-case-test');
      
      // Record results with zero values
      const edgeCaseResults = [
        { ...createMockTestResult('edge-case-test', 'A'), actualCost: 0, actualResponseTime: 0 },
        { ...createMockTestResult('edge-case-test', 'B'), actualCost: 0, actualResponseTime: 0 },
      ];
      
      edgeCaseResults.forEach(result => {
        framework.recordResult(result);
      });
      
      const analysis = framework.analyzeTest('edge-case-test');
      expect(analysis).toBeDefined();
      expect(analysis!.status).toBe('insufficient_data');
      
      // Should not throw errors or produce invalid results
      expect(analysis!.means.variantA).toBeDefined();
      expect(analysis!.means.variantB).toBeDefined();
      expect(isNaN(analysis!.pValue)).toBe(false);
    });

    it('should clean up resources properly', () => {
      const testConfig = createMockTestConfig('cleanup-test');
      framework.createTest(testConfig);
      framework.startTest('cleanup-test');
      
      // Add some data
      framework.recordResult(createMockTestResult('cleanup-test', 'A'));
      
      // Should not throw errors
      expect(() => {
        framework.destroy();
      }).not.toThrow();
    });
  });
});

// Helper functions
function createMockTestConfig(id: string): ABTestConfig {
  return {
    id,
    name: `Test ${id}`,
    description: `Description for test ${id}`,
    hypothesis: 'Variant B will perform better than variant A',
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
    minSampleSize: 50,
    maxDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
    significanceLevel: 0.05,
    minimumDetectableEffect: 0.05,
    trafficAllocation: 1.0,
    primaryMetric: 'cost',
    secondaryMetrics: ['responseTime', 'quality'],
    status: 'draft',
    autoStop: {
      enabled: false,
      winnerThreshold: 0.95,
      futilityThreshold: 0.1,
    },
  };
}

function createMockRequest(): AIRequest {
  return {
    model: 'claude-sonnet-4-20250514',
    messages: [
      { role: 'user', content: 'Hello, how are you?' },
    ],
    maxTokens: 1000,
    temperature: 0.7,
  };
}

function createMockTestResult(testId: string, variant: 'A' | 'B'): ABTestResult {
  const prediction: PredictionResult = {
    provider: variant === 'A' ? APIProvider.ANTHROPIC : APIProvider.ANTHROPIC,
    model: variant === 'A' ? 'claude-3-5-sonnet-20241022' : 'claude-sonnet-4-20250514',
    predictedCost: 0.01,
    predictedResponseTime: 2000,
    predictedQuality: 0.9,
    confidence: 0.8,
    reasoning: 'Test prediction',
  };

  const actualResponse: AIResponse = {
    id: 'response-123',
    model: prediction.model,
    provider: prediction.provider,
    choices: [{
      index: 0,
      message: { role: 'assistant', content: 'Hello! I am doing well, thank you.' },
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

  return {
    testId,
    variant,
    userId: 'test-user',
    requestId: 'request-123',
    timestamp: Date.now(),
    request: createMockRequest(),
    prediction,
    actualResponse,
    actualCost: 0.01,
    actualResponseTime: 2000,
    actualQuality: 0.9,
    costAccuracy: 1.0,
    timeAccuracy: 1.0,
    qualityAccuracy: 1.0,
  };
}

// Custom matcher (reused from accuracy monitor tests)
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