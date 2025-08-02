/**
 * Performance Benchmark Tests
 * 
 * Tests the performance characteristics of the AI Marketplace SDK
 */

require('dotenv').config();
const { createClient, APIProvider } = require('../../../dist/cjs/index.js');

// Benchmark configuration
const BENCHMARK_CONFIG = {
  iterations: 5,          // Number of iterations per test
  concurrency: 3,         // Number of concurrent requests
  warmupRequests: 2,      // Warmup requests before measurement
  timeout: 60000,         // 60 second timeout
  
  testMessages: [
    'Hello, how are you today?',
    'What is the capital of France?',
    'Explain machine learning briefly.',
    'Write a short poem about nature.',
    'What are the benefits of exercise?'
  ]
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatTime(ms) {
  return `${ms.toFixed(0)}ms`;
}

function formatCost(cost) {
  return `$${cost.toFixed(6)}`;
}

function calculateStats(values) {
  if (values.length === 0) return { min: 0, max: 0, avg: 0, median: 0 };
  
  const sorted = [...values].sort((a, b) => a - b);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const median = values.length % 2 === 0
    ? (sorted[values.length / 2 - 1] + sorted[values.length / 2]) / 2
    : sorted[Math.floor(values.length / 2)];
  
  return { min, max, avg, median };
}

async function initializeClient() {
  const apiKeys = {};
  
  if (process.env.OPENAI_API_KEY) {
    apiKeys.openai = process.env.OPENAI_API_KEY;
  }
  
  if (process.env.ANTHROPIC_API_KEY) {
    apiKeys.anthropic = process.env.ANTHROPIC_API_KEY;
  }
  
  if (process.env.GOOGLE_API_KEY) {
    apiKeys.google = process.env.GOOGLE_API_KEY;
  }
  
  if (Object.keys(apiKeys).length === 0) {
    throw new Error('No API keys found! Please set at least one API key.');
  }
  
  return createClient({
    apiKeys,
    config: {
      enableMLRouting: true,
      timeout: BENCHMARK_CONFIG.timeout,
      cache: {
        enabled: false, // Disable cache for accurate benchmarking
      },
    },
  });
}

async function benchmarkProvider(client, provider, providerName) {
  log(`\n🏃 Benchmarking ${providerName}`, 'cyan');
  log('================================', 'cyan');
  
  const responseTimes = [];
  const costs = [];
  const tokenCounts = [];
  
  // Warmup requests
  log(`Performing ${BENCHMARK_CONFIG.warmupRequests} warmup requests...`, 'yellow');
  for (let i = 0; i < BENCHMARK_CONFIG.warmupRequests; i++) {
    try {
      await client.chat({
        messages: [{ role: 'user', content: 'warmup' }],
      }, { provider });
    } catch (error) {
      log(`Warmup request ${i + 1} failed: ${error.message}`, 'red');
    }
  }
  
  // Benchmark requests
  log(`Running ${BENCHMARK_CONFIG.iterations} benchmark requests...`, 'white');
  
  for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
    const message = BENCHMARK_CONFIG.testMessages[i % BENCHMARK_CONFIG.testMessages.length];
    
    try {
      const startTime = performance.now();
      const response = await client.chat({
        messages: [{ role: 'user', content: message }],
      }, { provider });
      const endTime = performance.now();
      
      const responseTime = endTime - startTime;
      responseTimes.push(responseTime);
      costs.push(response.usage.cost);
      tokenCounts.push(response.usage.totalTokens);
      
      log(`  Request ${i + 1}: ${formatTime(responseTime)} - ${formatCost(response.usage.cost)} - ${response.usage.totalTokens} tokens`, 'white');
      
    } catch (error) {
      log(`  Request ${i + 1} failed: ${error.message}`, 'red');
    }
  }
  
  if (responseTimes.length === 0) {
    log(`❌ All ${providerName} requests failed`, 'red');
    return null;
  }
  
  // Calculate statistics
  const timeStats = calculateStats(responseTimes);
  const costStats = calculateStats(costs);
  const tokenStats = calculateStats(tokenCounts);
  
  const results = {
    provider: providerName,
    successfulRequests: responseTimes.length,
    totalRequests: BENCHMARK_CONFIG.iterations,
    successRate: (responseTimes.length / BENCHMARK_CONFIG.iterations) * 100,
    responseTime: timeStats,
    cost: costStats,
    tokens: tokenStats
  };
  
  // Display results
  log(`\n📊 ${providerName} Results:`, 'green');
  log(`   Success rate: ${results.successRate.toFixed(1)}% (${results.successfulRequests}/${results.totalRequests})`, 'white');
  log(`   Response time (ms):`, 'white');
  log(`     Min: ${formatTime(timeStats.min)}`, 'white');
  log(`     Max: ${formatTime(timeStats.max)}`, 'white');
  log(`     Avg: ${formatTime(timeStats.avg)}`, 'white');
  log(`     Median: ${formatTime(timeStats.median)}`, 'white');
  log(`   Cost:`, 'white');
  log(`     Min: ${formatCost(costStats.min)}`, 'white');
  log(`     Max: ${formatCost(costStats.max)}`, 'white');
  log(`     Avg: ${formatCost(costStats.avg)}`, 'white');
  log(`     Total: ${formatCost(costs.reduce((sum, cost) => sum + cost, 0))}`, 'white');
  log(`   Tokens:`, 'white');
  log(`     Min: ${tokenStats.min.toFixed(0)}`, 'white');
  log(`     Max: ${tokenStats.max.toFixed(0)}`, 'white');
  log(`     Avg: ${tokenStats.avg.toFixed(0)}`, 'white');
  log(`     Total: ${tokenCounts.reduce((sum, tokens) => sum + tokens, 0)}`, 'white');
  
  return results;
}

async function benchmarkMLRouting(client) {
  log(`\n🧠 Benchmarking ML Routing`, 'cyan');
  log('==========================', 'cyan');
  
  const optimizations = ['cost', 'speed', 'quality', 'balanced'];
  const results = {};
  
  for (const optimization of optimizations) {
    log(`\nTesting ${optimization} optimization...`, 'yellow');
    
    const responseTimes = [];
    const costs = [];
    const providerSelections = {};
    
    for (let i = 0; i < BENCHMARK_CONFIG.iterations; i++) {
      const message = BENCHMARK_CONFIG.testMessages[i % BENCHMARK_CONFIG.testMessages.length];
      
      try {
        const startTime = performance.now();
        const response = await client.chat({
          messages: [{ role: 'user', content: message }],
        }, { optimizeFor: optimization });
        const endTime = performance.now();
        
        const responseTime = endTime - startTime;
        responseTimes.push(responseTime);
        costs.push(response.usage.cost);
        
        // Track provider selections
        providerSelections[response.provider] = (providerSelections[response.provider] || 0) + 1;
        
        log(`  ${optimization} ${i + 1}: ${response.provider} - ${formatTime(responseTime)} - ${formatCost(response.usage.cost)}`, 'white');
        
      } catch (error) {
        log(`  ${optimization} ${i + 1} failed: ${error.message}`, 'red');
      }
    }
    
    if (responseTimes.length > 0) {
      const timeStats = calculateStats(responseTimes);
      const costStats = calculateStats(costs);
      
      results[optimization] = {
        optimization,
        successfulRequests: responseTimes.length,
        responseTime: timeStats,
        cost: costStats,
        providerSelections
      };
      
      log(`\n📊 ${optimization} optimization results:`, 'green');
      log(`   Success rate: ${(responseTimes.length / BENCHMARK_CONFIG.iterations * 100).toFixed(1)}%`, 'white');
      log(`   Avg response time: ${formatTime(timeStats.avg)}`, 'white');
      log(`   Avg cost: ${formatCost(costStats.avg)}`, 'white');
      log(`   Provider selections:`, 'white');
      Object.entries(providerSelections).forEach(([provider, count]) => {
        log(`     ${provider}: ${count}/${responseTimes.length} (${(count/responseTimes.length*100).toFixed(1)}%)`, 'white');
      });
    }
  }
  
  return results;
}

async function benchmarkConcurrency(client) {
  log(`\n⚡ Benchmarking Concurrent Requests`, 'cyan');
  log('==================================', 'cyan');
  
  const concurrentRequests = [];
  const startTime = performance.now();
  
  // Create concurrent requests
  for (let i = 0; i < BENCHMARK_CONFIG.concurrency; i++) {
    const message = BENCHMARK_CONFIG.testMessages[i % BENCHMARK_CONFIG.testMessages.length];
    
    const request = client.chat({
      messages: [{ role: 'user', content: `Concurrent request ${i + 1}: ${message}` }],
    }).then(response => ({
      success: true,
      response,
      requestId: i + 1
    })).catch(error => ({
      success: false,
      error: error.message,
      requestId: i + 1
    }));
    
    concurrentRequests.push(request);
  }
  
  log(`Sending ${BENCHMARK_CONFIG.concurrency} concurrent requests...`, 'white');
  
  // Wait for all requests to complete
  const results = await Promise.all(concurrentRequests);
  const totalTime = performance.now() - startTime;
  
  // Analyze results
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  log(`\n📊 Concurrency Results:`, 'green');
  log(`   Total time: ${formatTime(totalTime)}`, 'white');
  log(`   Successful requests: ${successful.length}/${BENCHMARK_CONFIG.concurrency}`, 'white');
  log(`   Failed requests: ${failed.length}`, failed.length > 0 ? 'red' : 'white');
  log(`   Avg time per request: ${formatTime(totalTime / BENCHMARK_CONFIG.concurrency)}`, 'white');
  
  if (successful.length > 0) {
    const totalCost = successful.reduce((sum, r) => sum + r.response.usage.cost, 0);
    const avgCost = totalCost / successful.length;
    log(`   Total cost: ${formatCost(totalCost)}`, 'white');
    log(`   Avg cost per request: ${formatCost(avgCost)}`, 'white');
    
    // Provider distribution
    const providerCount = {};
    successful.forEach(r => {
      providerCount[r.response.provider] = (providerCount[r.response.provider] || 0) + 1;
    });
    
    log(`   Provider distribution:`, 'white');
    Object.entries(providerCount).forEach(([provider, count]) => {
      log(`     ${provider}: ${count}/${successful.length} (${(count/successful.length*100).toFixed(1)}%)`, 'white');
    });
  }
  
  if (failed.length > 0) {
    log(`\n❌ Failed requests:`, 'red');
    failed.forEach(f => {
      log(`   Request ${f.requestId}: ${f.error}`, 'red');
    });
  }
  
  return {
    totalTime,
    successfulRequests: successful.length,
    failedRequests: failed.length,
    averageTimePerRequest: totalTime / BENCHMARK_CONFIG.concurrency
  };
}

async function runBenchmarks() {
  log('🏁 AI Marketplace SDK Performance Benchmarks', 'magenta');
  log('=============================================', 'magenta');
  log(`Configuration:`, 'white');
  log(`  Iterations per test: ${BENCHMARK_CONFIG.iterations}`, 'white');
  log(`  Concurrent requests: ${BENCHMARK_CONFIG.concurrency}`, 'white');
  log(`  Warmup requests: ${BENCHMARK_CONFIG.warmupRequests}`, 'white');
  log(`  Timeout: ${BENCHMARK_CONFIG.timeout}ms`, 'white');
  
  const client = await initializeClient();
  const benchmarkResults = {
    providers: {},
    mlRouting: {},
    concurrency: {},
    summary: {}
  };
  
  // Benchmark individual providers
  if (process.env.OPENAI_API_KEY) {
    benchmarkResults.providers.openai = await benchmarkProvider(client, APIProvider.OPENAI, 'OpenAI');
  }
  
  if (process.env.ANTHROPIC_API_KEY) {
    benchmarkResults.providers.anthropic = await benchmarkProvider(client, APIProvider.ANTHROPIC, 'Anthropic');
  }
  
  if (process.env.GOOGLE_API_KEY) {
    benchmarkResults.providers.google = await benchmarkProvider(client, APIProvider.GOOGLE, 'Google AI');
  }
  
  // Benchmark ML routing
  benchmarkResults.mlRouting = await benchmarkMLRouting(client);
  
  // Benchmark concurrency
  benchmarkResults.concurrency = await benchmarkConcurrency(client);
  
  // Generate summary
  log(`\n🎯 Benchmark Summary`, 'magenta');
  log('===================', 'magenta');
  
  const providerResults = Object.values(benchmarkResults.providers).filter(Boolean);
  if (providerResults.length > 0) {
    const fastestProvider = providerResults.reduce((fastest, current) => 
      current.responseTime.avg < fastest.responseTime.avg ? current : fastest
    );
    
    const cheapestProvider = providerResults.reduce((cheapest, current) => 
      current.cost.avg < cheapest.cost.avg ? current : cheapest
    );
    
    log(`Fastest provider: ${fastestProvider.provider} (${formatTime(fastestProvider.responseTime.avg)} avg)`, 'green');
    log(`Cheapest provider: ${cheapestProvider.provider} (${formatCost(cheapestProvider.cost.avg)} avg)`, 'green');
    
    const avgResponseTime = providerResults.reduce((sum, p) => sum + p.responseTime.avg, 0) / providerResults.length;
    const avgCost = providerResults.reduce((sum, p) => sum + p.cost.avg, 0) / providerResults.length;
    
    log(`Average response time: ${formatTime(avgResponseTime)}`, 'white');
    log(`Average cost: ${formatCost(avgCost)}`, 'white');
  }
  
  if (benchmarkResults.concurrency.successfulRequests > 0) {
    log(`Concurrent requests: ${benchmarkResults.concurrency.successfulRequests}/${BENCHMARK_CONFIG.concurrency} successful`, 'white');
    log(`Concurrency efficiency: ${formatTime(benchmarkResults.concurrency.averageTimePerRequest)} per request`, 'white');
  }
  
  // Performance assessment
  const avgResponseTime = providerResults.length > 0 
    ? providerResults.reduce((sum, p) => sum + p.responseTime.avg, 0) / providerResults.length 
    : 0;
  
  log(`\n🎭 Performance Assessment:`, 'yellow');
  if (avgResponseTime < 1000) {
    log(`✅ Excellent response time (< 1s avg)`, 'green');
  } else if (avgResponseTime < 2000) {
    log(`✅ Good response time (< 2s avg)`, 'green');
  } else if (avgResponseTime < 5000) {
    log(`⚠️  Acceptable response time (< 5s avg)`, 'yellow');
  } else {
    log(`❌ Slow response time (> 5s avg)`, 'red');
  }
  
  log('===================', 'magenta');
  
  return benchmarkResults;
}

// Run benchmarks if this file is executed directly
if (require.main === module) {
  runBenchmarks()
    .catch(error => {
      log(`\n❌ Benchmark failed: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}