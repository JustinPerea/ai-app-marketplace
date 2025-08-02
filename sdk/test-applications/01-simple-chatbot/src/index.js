/**
 * Simple Chatbot Test Application
 * 
 * This application validates basic functionality of the AI Marketplace SDK
 * by testing chat completions across multiple providers.
 */

require('dotenv').config();
const { createClient, APIProvider, AIError } = require('../../../dist/cjs/index.js');

// Test configuration
const TEST_CONFIG = {
  timeout: 30000,
  retries: 3,
  testMessages: [
    'Hello! Please introduce yourself briefly.',
    'What is artificial intelligence?',
    'Can you write a short haiku about technology?',
    'Explain the concept of machine learning in simple terms.',
    'What are the benefits of renewable energy?'
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

function formatCost(cost) {
  return `$${cost.toFixed(6)}`;
}

function formatTime(ms) {
  return `${(ms / 1000).toFixed(2)}s`;
}

async function initializeClient() {
  const apiKeys = {};
  
  if (process.env.OPENAI_API_KEY) {
    apiKeys.openai = process.env.OPENAI_API_KEY;
    log('✓ OpenAI API key found', 'green');
  }
  
  if (process.env.ANTHROPIC_API_KEY) {
    apiKeys.anthropic = process.env.ANTHROPIC_API_KEY;
    log('✓ Anthropic API key found', 'green');
  }
  
  if (process.env.GOOGLE_API_KEY) {
    apiKeys.google = process.env.GOOGLE_API_KEY;
    log('✓ Google AI API key found', 'green');
  }
  
  if (Object.keys(apiKeys).length === 0) {
    log('❌ No API keys found! Please set at least one:', 'red');
    log('   OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_API_KEY', 'yellow');
    process.exit(1);
  }
  
  const client = createClient({
    apiKeys,
    config: {
      enableMLRouting: true,
      enableAnalytics: true,
      timeout: TEST_CONFIG.timeout,
      router: {
        fallbackEnabled: true,
        fallbackOrder: [APIProvider.GOOGLE, APIProvider.ANTHROPIC, APIProvider.OPENAI],
        maxRetries: TEST_CONFIG.retries,
      },
      cache: {
        enabled: false, // Disable cache for testing
      },
    },
  });
  
  return client;
}

async function testBasicFunctionality(client) {
  log('\n🧪 Testing Basic Functionality', 'cyan');
  log('=====================================', 'cyan');
  
  const testMessage = TEST_CONFIG.testMessages[0];
  
  try {
    const startTime = Date.now();
    const response = await client.chat({
      messages: [
        { role: 'user', content: testMessage }
      ],
    });
    const responseTime = Date.now() - startTime;
    
    log('✅ Basic chat request successful', 'green');
    log(`   Provider: ${response.provider}`, 'white');
    log(`   Response time: ${formatTime(responseTime)}`, 'white');
    log(`   Cost: ${formatCost(response.usage.cost)}`, 'white');
    log(`   Tokens: ${response.usage.totalTokens}`, 'white');
    log(`   Response preview: "${response.choices[0].message.content.substring(0, 100)}..."`, 'white');
    
    return { success: true, provider: response.provider, responseTime, cost: response.usage.cost };
    
  } catch (error) {
    log('❌ Basic chat request failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testSpecificProvider(client, provider, providerName) {
  log(`\n🎯 Testing ${providerName} Provider`, 'cyan');
  log('=====================================', 'cyan');
  
  const testMessage = TEST_CONFIG.testMessages[1];
  
  try {
    const startTime = Date.now();
    const response = await client.chat({
      messages: [
        { role: 'user', content: testMessage }
      ],
    }, {
      provider: provider,
    });
    const responseTime = Date.now() - startTime;
    
    log(`✅ ${providerName} provider test successful`, 'green');
    log(`   Response time: ${formatTime(responseTime)}`, 'white');
    log(`   Cost: ${formatCost(response.usage.cost)}`, 'white');
    log(`   Tokens: ${response.usage.totalTokens}`, 'white');
    log(`   Response preview: "${response.choices[0].message.content.substring(0, 100)}..."`, 'white');
    
    return { success: true, responseTime, cost: response.usage.cost };
    
  } catch (error) {
    log(`❌ ${providerName} provider test failed`, 'red');
    log(`   Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testMLRouting(client) {
  log('\n🧠 Testing ML Routing', 'cyan');
  log('=====================================', 'cyan');
  
  const optimizations = ['cost', 'speed', 'quality', 'balanced'];
  const results = {};
  
  for (const optimization of optimizations) {
    try {
      log(`Testing ${optimization} optimization...`, 'white');
      
      const startTime = Date.now();
      const response = await client.chat({
        messages: [
          { role: 'user', content: TEST_CONFIG.testMessages[2] }
        ],
      }, {
        optimizeFor: optimization,
      });
      const responseTime = Date.now() - startTime;
      
      results[optimization] = {
        success: true,
        provider: response.provider,
        responseTime,
        cost: response.usage.cost
      };
      
      log(`✅ ${optimization} optimization: ${response.provider}`, 'green');
      log(`   Response time: ${formatTime(responseTime)}`, 'white');
      log(`   Cost: ${formatCost(response.usage.cost)}`, 'white');
      
    } catch (error) {
      results[optimization] = { success: false, error: error.message };
      log(`❌ ${optimization} optimization failed: ${error.message}`, 'red');
    }
  }
  
  return results;
}

async function testErrorHandling(client) {
  log('\n🚨 Testing Error Handling', 'cyan');
  log('=====================================', 'cyan');
  
  // Test with invalid API key scenario
  try {
    const invalidClient = createClient({
      apiKeys: {
        openai: 'invalid-key-test',
      },
      config: {
        enableMLRouting: false,
        router: {
          fallbackEnabled: false,
        },
      },
    });
    
    await invalidClient.chat({
      messages: [{ role: 'user', content: 'Test message' }],
    });
    
    log('❌ Error handling test failed - should have thrown an error', 'red');
    return { success: false };
    
  } catch (error) {
    if (error instanceof AIError) {
      log('✅ Error handling test successful', 'green');
      log(`   Error type: ${error.type}`, 'white');
      log(`   Error code: ${error.code}`, 'white');
      log(`   Retryable: ${error.retryable}`, 'white');
      return { success: true, errorType: error.type };
    } else {
      log('❌ Error handling test failed - unexpected error type', 'red');
      return { success: false, error: 'Unexpected error type' };
    }
  }
}

async function testCostEstimation(client) {
  log('\n💰 Testing Cost Estimation', 'cyan');
  log('=====================================', 'cyan');
  
  try {
    const testRequest = {
      messages: [
        { role: 'user', content: TEST_CONFIG.testMessages[3] }
      ],
    };
    
    const estimates = await client.estimateCost(testRequest);
    
    if (estimates.length > 0) {
      log('✅ Cost estimation successful', 'green');
      log('   Cost estimates by provider:', 'white');
      
      estimates.forEach(({ provider, cost }) => {
        log(`   ${provider}: ${formatCost(cost)}`, 'white');
      });
      
      return { success: true, estimates };
    } else {
      log('❌ Cost estimation failed - no estimates returned', 'red');
      return { success: false };
    }
    
  } catch (error) {
    log('❌ Cost estimation failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testAnalytics(client) {
  log('\n📊 Testing Analytics', 'cyan');
  log('=====================================', 'cyan');
  
  try {
    const analytics = await client.getAnalytics();
    
    log('✅ Analytics retrieval successful', 'green');
    log(`   Total predictions: ${analytics.totalPredictions}`, 'white');
    log(`   Average confidence: ${(analytics.averageConfidence * 100).toFixed(1)}%`, 'white');
    
    if (analytics.modelRecommendations && analytics.modelRecommendations.length > 0) {
      log('   Model recommendations:', 'white');
      analytics.modelRecommendations.slice(0, 3).forEach(rec => {
        log(`   - ${rec.scenario}: ${rec.recommendedProvider} (${rec.expectedSavings}% savings)`, 'white');
      });
    }
    
    return { success: true, analytics };
    
  } catch (error) {
    log('❌ Analytics retrieval failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTestSuite() {
  log('🤖 Simple Chatbot Test Application', 'magenta');
  log('=====================================', 'magenta');
  log('Starting comprehensive SDK functionality tests...', 'white');
  
  const client = await initializeClient();
  const results = {
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      totalCost: 0,
      averageResponseTime: 0
    }
  };
  
  // Test 1: Basic Functionality
  const basicTest = await testBasicFunctionality(client);
  results.tests.push({ name: 'Basic Functionality', ...basicTest });
  
  // Test 2: Provider-specific tests
  if (process.env.OPENAI_API_KEY) {
    const openaiTest = await testSpecificProvider(client, APIProvider.OPENAI, 'OpenAI');
    results.tests.push({ name: 'OpenAI Provider', ...openaiTest });
  }
  
  if (process.env.ANTHROPIC_API_KEY) {
    const anthropicTest = await testSpecificProvider(client, APIProvider.ANTHROPIC, 'Anthropic');
    results.tests.push({ name: 'Anthropic Provider', ...anthropicTest });
  }
  
  if (process.env.GOOGLE_API_KEY) {
    const googleTest = await testSpecificProvider(client, APIProvider.GOOGLE, 'Google AI');
    results.tests.push({ name: 'Google AI Provider', ...googleTest });
  }
  
  // Test 3: ML Routing
  const mlRoutingResults = await testMLRouting(client);
  Object.entries(mlRoutingResults).forEach(([optimization, result]) => {
    results.tests.push({ name: `ML Routing (${optimization})`, ...result });
  });
  
  // Test 4: Error Handling
  const errorTest = await testErrorHandling(client);
  results.tests.push({ name: 'Error Handling', ...errorTest });
  
  // Test 5: Cost Estimation
  const costTest = await testCostEstimation(client);
  results.tests.push({ name: 'Cost Estimation', ...costTest });
  
  // Test 6: Analytics
  const analyticsTest = await testAnalytics(client);
  results.tests.push({ name: 'Analytics', ...analyticsTest });
  
  // Calculate summary
  results.summary.total = results.tests.length;
  results.summary.passed = results.tests.filter(t => t.success).length;
  results.summary.failed = results.summary.total - results.summary.passed;
  
  const costsAndTimes = results.tests.filter(t => t.success && t.cost && t.responseTime);
  results.summary.totalCost = costsAndTimes.reduce((sum, t) => sum + t.cost, 0);
  results.summary.averageResponseTime = costsAndTimes.length > 0 
    ? costsAndTimes.reduce((sum, t) => sum + t.responseTime, 0) / costsAndTimes.length 
    : 0;
  
  // Display final results
  log('\n📊 Test Summary', 'magenta');
  log('=====================================', 'magenta');
  log(`Total tests: ${results.summary.total}`, 'white');
  log(`Passed: ${results.summary.passed}`, 'green');
  log(`Failed: ${results.summary.failed}`, results.summary.failed > 0 ? 'red' : 'white');
  log(`Total cost: ${formatCost(results.summary.totalCost)}`, 'white');
  log(`Average response time: ${formatTime(results.summary.averageResponseTime)}`, 'white');
  log('=====================================', 'magenta');
  
  if (results.summary.failed === 0) {
    log('🎉 All tests passed! SDK is working correctly.', 'green');
  } else {
    log('⚠️  Some tests failed. Check the output above for details.', 'yellow');
    
    // Show failed tests
    const failedTests = results.tests.filter(t => !t.success);
    log('\nFailed tests:', 'red');
    failedTests.forEach(test => {
      log(`- ${test.name}: ${test.error || 'Unknown error'}`, 'red');
    });
  }
  
  return results;
}

// Run the test suite if this file is executed directly
if (require.main === module) {
  runTestSuite()
    .then(results => {
      process.exit(results.summary.failed === 0 ? 0 : 1);
    })
    .catch(error => {
      log(`\n❌ Test suite failed with unexpected error: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}