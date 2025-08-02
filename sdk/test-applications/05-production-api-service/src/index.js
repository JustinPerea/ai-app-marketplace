/**
 * Production API Service Test Application
 * 
 * This application validates the AI Marketplace SDK's readiness for production
 * deployment by testing enterprise features, scalability, and reliability.
 */

require('dotenv').config();
const { createClient, APIProvider, AIError } = require('../../../dist/cjs/index.js');
const fs = require('fs').promises;
const path = require('path');

// Production testing configuration
const PRODUCTION_CONFIG = {
  loadTesting: {
    concurrentUsers: 50,        // Concurrent simulated users
    requestsPerUser: 20,        // Requests per user
    rampUpTime: 30000,          // 30 seconds ramp up
    testDuration: 120000,       // 2 minutes test duration
  },
  
  reliabilityTesting: {
    errorInjectionRate: 0.1,    // 10% error injection
    circuitBreakerThreshold: 5,  // Failure threshold
    recoveryTimeout: 30000,      // 30 seconds recovery
    maxRetries: 3,              // Maximum retry attempts
  },
  
  performanceTargets: {
    averageResponseTime: 2000,   // 2 seconds
    p95ResponseTime: 5000,       // 5 seconds
    p99ResponseTime: 10000,      // 10 seconds
    errorRate: 0.05,            // 5% error rate
    throughput: 25,             // 25 requests/second minimum
  },
  
  enterpriseFeatures: {
    rateLimiting: true,
    authentication: true,
    caching: true,
    monitoring: true,
    logging: true,
    healthChecks: true,
  }
};

// Circuit breaker implementation
class CircuitBreaker {
  constructor(threshold = 5, timeout = 30000, monitoringPeriod = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.monitoringPeriod = monitoringPeriod;
    
    this.failures = 0;
    this.lastFailTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      circuitOpenCount: 0
    };
  }

  async execute(fn, context = 'default') {
    this.stats.totalRequests++;
    
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailTime > this.timeout) {
        this.state = 'HALF_OPEN';
        log(`Circuit breaker ${context} moved to HALF_OPEN`, 'yellow');
      } else {
        this.stats.failedRequests++;
        throw new Error(`Circuit breaker ${context} is OPEN`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
    this.stats.successfulRequests++;
  }

  onFailure() {
    this.failures++;
    this.lastFailTime = Date.now();
    this.stats.failedRequests++;
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      this.stats.circuitOpenCount++;
    }
  }

  getStats() {
    return {
      ...this.stats,
      state: this.state,
      failures: this.failures,
      successRate: this.stats.totalRequests > 0 
        ? (this.stats.successfulRequests / this.stats.totalRequests) * 100 
        : 0
    };
  }
}

// Rate limiter implementation
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map(); // userId -> { count, resetTime }
  }

  isAllowed(userId = 'anonymous') {
    const now = Date.now();
    const userRequests = this.requests.get(userId);
    
    if (!userRequests || now > userRequests.resetTime) {
      // Reset or create new window
      this.requests.set(userId, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }
    
    if (userRequests.count >= this.maxRequests) {
      return false;
    }
    
    userRequests.count++;
    return true;
  }

  getStats() {
    const now = Date.now();
    let activeUsers = 0;
    let totalRequests = 0;
    
    for (const [userId, data] of this.requests.entries()) {
      if (now <= data.resetTime) {
        activeUsers++;
        totalRequests += data.count;
      }
    }
    
    return { activeUsers, totalRequests };
  }
}

// Performance metrics collector
class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byProvider: {}
      },
      responseTimes: [],
      errors: [],
      costs: [],
      startTime: Date.now()
    };
  }

  recordRequest(provider, responseTime, cost, success, error = null) {
    this.metrics.requests.total++;
    
    if (success) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
      if (error) {
        this.metrics.errors.push({
          error: error.message,
          provider,
          timestamp: Date.now()
        });
      }
    }
    
    if (!this.metrics.requests.byProvider[provider]) {
      this.metrics.requests.byProvider[provider] = { count: 0, totalTime: 0, totalCost: 0 };
    }
    
    this.metrics.requests.byProvider[provider].count++;
    this.metrics.requests.byProvider[provider].totalTime += responseTime;
    this.metrics.requests.byProvider[provider].totalCost += cost || 0;
    
    this.metrics.responseTimes.push(responseTime);
    if (cost) this.metrics.costs.push(cost);
  }

  getStats() {
    const now = Date.now();
    const duration = (now - this.metrics.startTime) / 1000; // seconds
    
    // Calculate percentiles
    const sortedTimes = [...this.metrics.responseTimes].sort((a, b) => a - b);
    const p50 = this.percentile(sortedTimes, 0.5);
    const p95 = this.percentile(sortedTimes, 0.95);
    const p99 = this.percentile(sortedTimes, 0.99);
    
    const avgResponseTime = sortedTimes.length > 0 
      ? sortedTimes.reduce((sum, time) => sum + time, 0) / sortedTimes.length 
      : 0;
    
    const errorRate = this.metrics.requests.total > 0 
      ? (this.metrics.requests.failed / this.metrics.requests.total) * 100 
      : 0;
    
    const throughput = duration > 0 ? this.metrics.requests.total / duration : 0;
    
    const totalCost = this.metrics.costs.reduce((sum, cost) => sum + cost, 0);
    
    return {
      duration,
      requests: this.metrics.requests,
      performance: {
        avgResponseTime,
        p50ResponseTime: p50,
        p95ResponseTime: p95,
        p99ResponseTime: p99,
        errorRate,
        throughput
      },
      costs: {
        total: totalCost,
        average: this.metrics.costs.length > 0 ? totalCost / this.metrics.costs.length : 0
      },
      errors: this.metrics.errors.slice(-10) // Last 10 errors
    };
  }

  percentile(sortedArray, percentile) {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil(sortedArray.length * percentile) - 1;
    return sortedArray[Math.max(0, index)];
  }
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatTime(ms) {
  return `${ms.toFixed(0)}ms`;
}

function formatCurrency(amount) {
  return `$${amount.toFixed(6)}`;
}

function formatPercentage(value) {
  return `${value.toFixed(2)}%`;
}

async function initializeProductionClient() {
  const apiKeys = {};
  const missingKeys = [];
  
  if (process.env.OPENAI_API_KEY) {
    apiKeys.openai = process.env.OPENAI_API_KEY;
    log('✓ OpenAI API key loaded', 'green');
  } else {
    missingKeys.push('OPENAI_API_KEY');
  }
  
  if (process.env.ANTHROPIC_API_KEY) {
    apiKeys.anthropic = process.env.ANTHROPIC_API_KEY;
    log('✓ Anthropic API key loaded', 'green');
  } else {
    missingKeys.push('ANTHROPIC_API_KEY');
  }
  
  if (process.env.GOOGLE_API_KEY) {
    apiKeys.google = process.env.GOOGLE_API_KEY;
    log('✓ Google AI API key loaded', 'green');
  } else {
    missingKeys.push('GOOGLE_API_KEY');
  }
  
  if (Object.keys(apiKeys).length === 0) {
    log('❌ No API keys found! Production testing requires at least one API key.', 'red');
    process.exit(1);
  }
  
  if (missingKeys.length > 0) {
    log(`⚠️  Missing API keys: ${missingKeys.join(', ')}`, 'yellow');
    log('Production testing is more effective with all providers configured.', 'yellow');
  }
  
  // Production-grade configuration
  const client = createClient({
    apiKeys,
    config: {
      enableMLRouting: true,
      enableAnalytics: true,
      timeout: 30000,
      router: {
        fallbackEnabled: true,
        fallbackOrder: [APIProvider.GOOGLE, APIProvider.ANTHROPIC, APIProvider.OPENAI],
        costOptimizationEnabled: true,
        maxRetries: 3,
      },
      cache: {
        enabled: true,
        ttlSeconds: 300,
        maxSize: 10000,
        keyStrategy: 'content_hash',
      },
    },
  });
  
  return { client, availableProviders: Object.keys(apiKeys) };
}

async function runLoadTest(client, circuitBreaker, rateLimiter, metrics) {
  log('\n🚀 Running Load Test', 'cyan');
  log('='.repeat(25), 'cyan');
  
  const config = PRODUCTION_CONFIG.loadTesting;
  const testRequests = [
    'What is artificial intelligence?',
    'Explain machine learning in simple terms.',
    'Write a short summary about climate change.',
    'List the benefits of renewable energy.',
    'Describe how neural networks work.',
    'What are the applications of AI in healthcare?',
    'Compare different programming languages.',
    'Explain the concept of cloud computing.',
    'What is the future of autonomous vehicles?',
    'Describe the importance of data privacy.'
  ];
  
  log(`Configuration:`, 'white');
  log(`  Concurrent users: ${config.concurrentUsers}`, 'white');
  log(`  Requests per user: ${config.requestsPerUser}`, 'white');
  log(`  Total requests: ${config.concurrentUsers * config.requestsPerUser}`, 'white');
  log(`  Test duration: ${config.testDuration / 1000}s`, 'white');
  
  const startTime = Date.now();
  const workers = [];
  
  // Create worker functions for concurrent users
  for (let userId = 0; userId < config.concurrentUsers; userId++) {
    workers.push(
      simulateUser(userId, client, circuitBreaker, rateLimiter, metrics, testRequests, config)
    );
  }
  
  // Wait for all workers to complete
  const results = await Promise.allSettled(workers);
  
  const totalTime = Date.now() - startTime;
  const successfulWorkers = results.filter(r => r.status === 'fulfilled').length;
  const failedWorkers = results.filter(r => r.status === 'rejected').length;
  
  log(`\n📊 Load Test Results:`, 'magenta');
  log(`  Total execution time: ${formatTime(totalTime)}`, 'white');
  log(`  Successful workers: ${successfulWorkers}/${config.concurrentUsers}`, 'white');
  log(`  Failed workers: ${failedWorkers}`, failedWorkers > 0 ? 'red' : 'white');
  
  return {
    totalTime,
    successfulWorkers,
    failedWorkers,
    workerResults: results
  };
}

async function simulateUser(userId, client, circuitBreaker, rateLimiter, metrics, testRequests, config) {
  const userStartTime = Date.now();
  const userRequests = [];
  
  // Stagger user start times for realistic ramp-up
  const delay = (userId * config.rampUpTime) / config.concurrentUsers;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  for (let i = 0; i < config.requestsPerUser; i++) {
    // Check if we've exceeded test duration
    if (Date.now() - userStartTime > config.testDuration) {
      break;
    }
    
    // Check rate limiting
    if (!rateLimiter.isAllowed(`user_${userId}`)) {
      metrics.recordRequest('rate_limited', 0, 0, false, new Error('Rate limit exceeded'));
      continue;
    }
    
    const requestText = testRequests[i % testRequests.length];
    const requestStartTime = Date.now();
    
    try {
      // Execute request through circuit breaker
      const response = await circuitBreaker.execute(async () => {
        return await client.chat({
          messages: [{ role: 'user', content: requestText }],
        }, {
          userId: `load_test_user_${userId}`,
          optimizeFor: ['cost', 'speed', 'balanced'][i % 3], // Vary optimization
        });
      }, `user_${userId}`);
      
      const responseTime = Date.now() - requestStartTime;
      metrics.recordRequest(response.provider, responseTime, response.usage.cost, true);
      
      userRequests.push({
        success: true,
        responseTime,
        provider: response.provider,
        cost: response.usage.cost
      });
      
    } catch (error) {
      const responseTime = Date.now() - requestStartTime;
      metrics.recordRequest('unknown', responseTime, 0, false, error);
      
      userRequests.push({
        success: false,
        responseTime,
        error: error.message
      });
    }
    
    // Small delay between requests to simulate realistic usage
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  }
  
  return {
    userId,
    totalRequests: userRequests.length,
    successfulRequests: userRequests.filter(r => r.success).length,
    failedRequests: userRequests.filter(r => !r.success).length,
    averageResponseTime: userRequests.length > 0 
      ? userRequests.reduce((sum, r) => sum + r.responseTime, 0) / userRequests.length 
      : 0
  };
}

async function runReliabilityTest(client, circuitBreaker, metrics) {
  log('\n🛡️  Running Reliability Test', 'cyan');
  log('='.repeat(30), 'cyan');
  
  const config = PRODUCTION_CONFIG.reliabilityTesting;
  const testScenarios = [
    'Test basic functionality',
    'Handle provider failures gracefully',
    'Recover from network timeouts',
    'Process requests during high load',
    'Maintain service during provider outages'
  ];
  
  log(`Configuration:`, 'white');
  log(`  Error injection rate: ${config.errorInjectionRate * 100}%`, 'white');
  log(`  Circuit breaker threshold: ${config.circuitBreakerThreshold}`, 'white');
  log(`  Recovery timeout: ${config.recoveryTimeout / 1000}s`, 'white');
  
  const results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    circuitBreakerActivations: 0,
    recoveryTime: []
  };
  
  // Test normal operation
  log('\nTesting normal operation...', 'white');
  for (let i = 0; i < 10; i++) {
    results.totalTests++;
    try {
      const response = await circuitBreaker.execute(async () => {
        return await client.chat({
          messages: [{ role: 'user', content: testScenarios[i % testScenarios.length] }],
        });
      });
      
      results.passedTests++;
      log(`  ✅ Normal request ${i + 1}: ${response.provider}`, 'green');
    } catch (error) {
      results.failedTests++;
      log(`  ❌ Normal request ${i + 1}: ${error.message}`, 'red');
    }
  }
  
  // Test circuit breaker by injecting failures
  log('\nTesting circuit breaker with injected failures...', 'white');
  const failureClient = createFailureInjectingClient(client, config.errorInjectionRate);
  
  let circuitBreakerTriggeredTime = null;
  
  for (let i = 0; i < 15; i++) {
    results.totalTests++;
    try {
      const response = await circuitBreaker.execute(async () => {
        if (Math.random() < config.errorInjectionRate) {
          throw new Error('Injected failure for testing');
        }
        return await failureClient.chat({
          messages: [{ role: 'user', content: 'Test reliability' }],
        });
      });
      
      results.passedTests++;
      log(`  ✅ Reliability test ${i + 1}: Success`, 'green');
    } catch (error) {
      results.failedTests++;
      
      if (error.message.includes('Circuit breaker')) {
        if (!circuitBreakerTriggeredTime) {
          circuitBreakerTriggeredTime = Date.now();
          results.circuitBreakerActivations++;
          log(`  🔴 Circuit breaker activated at test ${i + 1}`, 'yellow');
        }
      } else {
        log(`  ❌ Reliability test ${i + 1}: ${error.message}`, 'red');
      }
    }
  }
  
  // Test recovery
  if (circuitBreakerTriggeredTime) {
    log('\nTesting circuit breaker recovery...', 'white');
    const recoveryStartTime = Date.now();
    
    // Wait for recovery timeout
    await new Promise(resolve => setTimeout(resolve, config.recoveryTimeout + 5000));
    
    try {
      const response = await circuitBreaker.execute(async () => {
        return await client.chat({
          messages: [{ role: 'user', content: 'Test recovery' }],
        });
      });
      
      const recoveryTime = Date.now() - recoveryStartTime;
      results.recoveryTime.push(recoveryTime);
      log(`  ✅ Circuit breaker recovered in ${formatTime(recoveryTime)}`, 'green');
    } catch (error) {
      log(`  ❌ Circuit breaker recovery failed: ${error.message}`, 'red');
    }
  }
  
  return results;
}

function createFailureInjectingClient(originalClient, failureRate) {
  return {
    chat: async (request, options) => {
      if (Math.random() < failureRate) {
        throw new Error('Simulated provider failure');
      }
      return await originalClient.chat(request, options);
    }
  };
}

async function assessPerformance(metrics) {
  log('\n📈 Performance Assessment', 'cyan');
  log('='.repeat(30), 'cyan');
  
  const stats = metrics.getStats();
  const targets = PRODUCTION_CONFIG.performanceTargets;
  
  const assessment = {
    avgResponseTime: {
      actual: stats.performance.avgResponseTime,
      target: targets.averageResponseTime,
      passed: stats.performance.avgResponseTime <= targets.averageResponseTime
    },
    p95ResponseTime: {
      actual: stats.performance.p95ResponseTime,
      target: targets.p95ResponseTime,
      passed: stats.performance.p95ResponseTime <= targets.p95ResponseTime
    },
    p99ResponseTime: {
      actual: stats.performance.p99ResponseTime,
      target: targets.p99ResponseTime,
      passed: stats.performance.p99ResponseTime <= targets.p99ResponseTime
    },
    errorRate: {
      actual: stats.performance.errorRate / 100,
      target: targets.errorRate,
      passed: stats.performance.errorRate / 100 <= targets.errorRate
    },
    throughput: {
      actual: stats.performance.throughput,
      target: targets.throughput,
      passed: stats.performance.throughput >= targets.throughput
    }
  };
  
  log('Performance Metrics vs Targets:', 'white');
  
  Object.entries(assessment).forEach(([metric, data]) => {
    const status = data.passed ? '✅' : '❌';
    const color = data.passed ? 'green' : 'red';
    
    let actualFormatted, targetFormatted;
    if (metric.includes('Time')) {
      actualFormatted = formatTime(data.actual);
      targetFormatted = formatTime(data.target);
    } else if (metric === 'errorRate') {
      actualFormatted = formatPercentage(data.actual * 100);
      targetFormatted = formatPercentage(data.target * 100);
    } else {
      actualFormatted = data.actual.toFixed(2);
      targetFormatted = data.target.toFixed(2);
    }
    
    log(`  ${status} ${metric}: ${actualFormatted} (target: ${targetFormatted})`, color);
  });
  
  const overallPassed = Object.values(assessment).every(a => a.passed);
  
  log(`\n🎯 Overall Performance: ${overallPassed ? 'PASSED' : 'FAILED'}`, 
    overallPassed ? 'green' : 'red');
  
  return { assessment, overallPassed };
}

async function saveResults(results) {
  try {
    const resultsDir = path.join(__dirname, '..', 'results');
    await fs.mkdir(resultsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `production-api-service-test-${timestamp}.json`;
    const filepath = path.join(resultsDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(results, null, 2));
    log(`\n📄 Results saved to: ${filepath}`, 'blue');
    
  } catch (error) {
    log(`Warning: Could not save results: ${error.message}`, 'yellow');
  }
}

async function runProductionTests() {
  log('🏭 Production API Service Test Application', 'magenta');
  log('='.repeat(50), 'magenta');
  log('Testing production readiness and enterprise features...', 'white');
  
  const overallStartTime = Date.now();
  
  try {
    // Initialize production client
    const { client, availableProviders } = await initializeProductionClient();
    
    // Initialize enterprise components
    const circuitBreaker = new CircuitBreaker(
      PRODUCTION_CONFIG.reliabilityTesting.circuitBreakerThreshold,
      PRODUCTION_CONFIG.reliabilityTesting.recoveryTimeout
    );
    
    const rateLimiter = new RateLimiter(
      100, // 100 requests per minute
      60000
    );
    
    const metrics = new MetricsCollector();
    
    log(`\nAvailable providers: ${availableProviders.join(', ')}`, 'white');
    
    // Run load test
    const loadTestResults = await runLoadTest(client, circuitBreaker, rateLimiter, metrics);
    
    // Run reliability test
    const reliabilityResults = await runReliabilityTest(client, circuitBreaker, metrics);
    
    // Assess performance
    const performanceResults = await assessPerformance(metrics);
    
    // Get final metrics
    const finalStats = metrics.getStats();
    const circuitBreakerStats = circuitBreaker.getStats();
    const rateLimiterStats = rateLimiter.getStats();
    
    const totalTime = Date.now() - overallStartTime;
    
    // Compile comprehensive results
    const finalResults = {
      timestamp: new Date().toISOString(),
      totalExecutionTime: totalTime,
      configuration: PRODUCTION_CONFIG,
      availableProviders,
      
      loadTesting: {
        ...loadTestResults,
        configuration: PRODUCTION_CONFIG.loadTesting
      },
      
      reliabilityTesting: {
        ...reliabilityResults,
        configuration: PRODUCTION_CONFIG.reliabilityTesting
      },
      
      performanceAssessment: performanceResults,
      
      enterpriseFeatures: {
        circuitBreaker: circuitBreakerStats,
        rateLimiter: rateLimiterStats,
        metrics: finalStats
      },
      
      overallSummary: {
        totalRequests: finalStats.requests.total,
        successfulRequests: finalStats.requests.successful,
        failedRequests: finalStats.requests.failed,
        overallSuccessRate: finalStats.requests.total > 0 
          ? (finalStats.requests.successful / finalStats.requests.total) * 100 
          : 0,
        averageResponseTime: finalStats.performance.avgResponseTime,
        totalCost: finalStats.costs.total,
        averageCostPerRequest: finalStats.costs.average
      }
    };
    
    // Display comprehensive summary
    log(`\n🎯 PRODUCTION API SERVICE TEST SUMMARY`, 'magenta');
    log('='.repeat(45), 'magenta');
    log(`Total execution time: ${formatTime(totalTime)}`, 'white');
    log(`Available providers: ${availableProviders.length}`, 'white');
    log(`Total requests processed: ${finalStats.requests.total}`, 'white');
    log(`Success rate: ${formatPercentage(finalResults.overallSummary.overallSuccessRate)}`, 'white');
    log(`Average response time: ${formatTime(finalStats.performance.avgResponseTime)}`, 'white');
    log(`P95 response time: ${formatTime(finalStats.performance.p95ResponseTime)}`, 'white');
    log(`P99 response time: ${formatTime(finalStats.performance.p99ResponseTime)}`, 'white');
    log(`Throughput: ${finalStats.performance.throughput.toFixed(2)} req/s`, 'white');
    log(`Error rate: ${formatPercentage(finalStats.performance.errorRate)}`, 'white');
    log(`Total cost: ${formatCurrency(finalStats.costs.total)}`, 'white');
    log(`Average cost per request: ${formatCurrency(finalStats.costs.average)}`, 'white');
    log(`Circuit breaker activations: ${circuitBreakerStats.circuitOpenCount}`, 'white');
    
    // Provider distribution
    if (Object.keys(finalStats.requests.byProvider).length > 0) {
      log(`\nProvider distribution:`, 'white');
      Object.entries(finalStats.requests.byProvider).forEach(([provider, data]) => {
        const percentage = (data.count / finalStats.requests.total) * 100;
        const avgTime = data.totalTime / data.count;
        const avgCost = data.totalCost / data.count;
        log(`  ${provider}: ${data.count} requests (${formatPercentage(percentage)}) - ${formatTime(avgTime)} avg - ${formatCurrency(avgCost)} avg`, 'white');
      });
    }
    
    // Overall success assessment
    const loadTestSuccess = loadTestResults.successfulWorkers / PRODUCTION_CONFIG.loadTesting.concurrentUsers >= 0.9;
    const reliabilitySuccess = reliabilityResults.passedTests / reliabilityResults.totalTests >= 0.8;
    const performanceSuccess = performanceResults.overallPassed;
    const costEfficiency = finalStats.costs.average <= 0.01; // $0.01 per request
    
    const overallSuccess = loadTestSuccess && reliabilitySuccess && performanceSuccess;
    
    if (overallSuccess) {
      log(`\n🎉 Production API Service Test: PASSED`, 'green');
      log(`   ✅ Load testing: ${formatPercentage((loadTestResults.successfulWorkers / PRODUCTION_CONFIG.loadTesting.concurrentUsers) * 100)} worker success rate`, 'green');
      log(`   ✅ Reliability: ${formatPercentage((reliabilityResults.passedTests / reliabilityResults.totalTests) * 100)} test pass rate`, 'green');
      log(`   ✅ Performance: All targets met`, 'green');
      log(`   ✅ Cost efficiency: ${formatCurrency(finalStats.costs.average)} per request`, costEfficiency ? 'green' : 'yellow');
    } else {
      log(`\n⚠️  Production API Service Test: NEEDS IMPROVEMENT`, 'yellow');
      if (!loadTestSuccess) {
        log(`   ❌ Load testing: ${formatPercentage((loadTestResults.successfulWorkers / PRODUCTION_CONFIG.loadTesting.concurrentUsers) * 100)} worker success rate`, 'red');
      }
      if (!reliabilitySuccess) {
        log(`   ❌ Reliability: ${formatPercentage((reliabilityResults.passedTests / reliabilityResults.totalTests) * 100)} test pass rate`, 'red');
      }
      if (!performanceSuccess) {
        log(`   ❌ Performance: Some targets not met`, 'red');
      }
    }
    
    // Save results
    await saveResults(finalResults);
    
    return finalResults;
    
  } catch (error) {
    log(`\n❌ Production API service test failed: ${error.message}`, 'red');
    console.error(error);
    throw error;
  }
}

// Run the test suite if this file is executed directly
if (require.main === module) {
  runProductionTests()
    .then(results => {
      const success = results.overallSummary.overallSuccessRate >= 80; // 80% success rate minimum
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed with error:', error);
      process.exit(1);
    });
}