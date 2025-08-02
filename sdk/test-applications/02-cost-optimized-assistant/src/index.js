/**
 * Cost-Optimized Assistant Test Application
 * 
 * This application validates the ML routing and cost optimization capabilities
 * of the AI Marketplace SDK through comprehensive testing scenarios.
 */

require('dotenv').config();
const { createClient, APIProvider, AIError } = require('../../../dist/cjs/index.js');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  scenarios: {
    simple_questions: 10,
    creative_tasks: 8, 
    technical_analysis: 6,
    speed_tests: 5
  },
  costBudgets: {
    simple: 0.0001,      // $0.0001 per simple question
    creative: 0.002,     // $0.002 per creative task
    technical: 0.001,    // $0.001 per technical analysis
    speed: 0.0005        // $0.0005 per speed test
  },
  qualityThresholds: {
    simple: 0.7,         // 70% quality threshold for simple questions
    creative: 0.9,       // 90% quality threshold for creative tasks
    technical: 0.85,     // 85% quality threshold for technical analysis
    speed: 0.6           // 60% quality threshold for speed tests (speed over quality)
  }
};

// Test scenarios data
const TEST_SCENARIOS = {
  simple_questions: [
    "What is 2 + 2?",
    "What's the capital of France?",
    "Define machine learning in one sentence.",
    "What color is the sky?",
    "Who invented the telephone?",
    "What is H2O?",
    "How many days are in a week?",
    "What does CPU stand for?",
    "What is the largest planet?",
    "When did World War II end?"
  ],
  
  creative_tasks: [
    "Write a short story about a robot learning to paint",
    "Create a haiku about artificial intelligence",
    "Compose a business email declining a meeting politely",
    "Write a product description for a smart coffee maker",
    "Create a brief character backstory for a video game",
    "Write a persuasive paragraph about renewable energy",
    "Compose a thank you note for a job interview",
    "Create a tagline for a fitness app"
  ],
  
  technical_analysis: [
    "Explain the difference between machine learning and deep learning",
    "Compare REST APIs vs GraphQL APIs",
    "What are the pros and cons of microservices architecture?",
    "Explain how blockchain technology works",
    "Compare SQL vs NoSQL databases",
    "What is the difference between Docker and Kubernetes?"
  ],
  
  speed_tests: [
    "Quick fact: What year was JavaScript created?",
    "One word: What's the opposite of hot?",
    "Quick answer: Is Python compiled or interpreted?",
    "Fast fact: What does HTML stand for?",
    "Quick: What's 15% of 200?"
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
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatCost(cost) {
  return `$${cost.toFixed(6)}`;
}

function formatTime(ms) {
  return `${ms.toFixed(0)}ms`;
}

function formatPercentage(value) {
  return `${(value * 100).toFixed(1)}%`;
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
  
  if (Object.keys(apiKeys).length < 2) {
    log('⚠️  Warning: Less than 2 providers configured. ML routing effectiveness will be limited.', 'yellow');
  }
  
  if (Object.keys(apiKeys).length === 0) {
    log('❌ No API keys found! Please set at least one API key.', 'red');
    process.exit(1);
  }
  
  const client = createClient({
    apiKeys,
    config: {
      enableMLRouting: true,
      enableAnalytics: true,
      timeout: 30000,
      router: {
        fallbackEnabled: true,
        costOptimizationEnabled: true,
        maxRetries: 2,
      },
      cache: {
        enabled: false, // Disable cache for testing
      },
    },
  });
  
  return { client, availableProviders: Object.keys(apiKeys) };
}

async function getCostEstimates(client, request) {
  try {
    const estimates = await client.estimateCost(request);
    return estimates.reduce((acc, { provider, cost }) => {
      acc[provider] = cost;
      return acc;
    }, {});
  } catch (error) {
    log(`Warning: Could not get cost estimates: ${error.message}`, 'yellow');
    return {};
  }
}

async function testScenario(client, scenarioName, requests, optimizeFor) {
  log(`\n🧪 Testing ${scenarioName.replace('_', ' ').toUpperCase()} (${optimizeFor}-optimized)`, 'cyan');
  log('='.repeat(60), 'cyan');
  
  const results = {
    scenario: scenarioName,
    optimization: optimizeFor,
    requests: [],
    summary: {
      totalRequests: requests.length,
      successfulRequests: 0,
      totalCost: 0,
      totalTime: 0,
      costBudget: TEST_CONFIG.costBudgets[scenarioName.split('_')[0]] * requests.length,
      providerSelections: {},
      averageConfidence: 0,
      costSavings: 0
    }
  };
  
  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];
    log(`\n${i + 1}. "${request.substring(0, 50)}${request.length > 50 ? '...' : ''}"`, 'white');
    
    const chatRequest = {
      messages: [{ role: 'user', content: request }],
    };
    
    // Get cost estimates for comparison
    const costEstimates = await getCostEstimates(client, chatRequest);
    
    try {
      const startTime = Date.now();
      const response = await client.chat(chatRequest, {
        optimizeFor: optimizeFor,
        userId: `test_user_${scenarioName}`,
      });
      const responseTime = Date.now() - startTime;
      
      // Track provider selection
      const provider = response.provider;
      results.summary.providerSelections[provider] = (results.summary.providerSelections[provider] || 0) + 1;
      
      // Calculate potential savings
      const selectedCost = response.usage.cost;
      const alternativeCosts = Object.values(costEstimates).filter(cost => cost !== selectedCost);
      const cheapestAlternative = alternativeCosts.length > 0 ? Math.min(...alternativeCosts) : selectedCost;
      const savings = cheapestAlternative > 0 ? (cheapestAlternative - selectedCost) / cheapestAlternative : 0;
      
      const requestResult = {
        request,
        provider,
        cost: selectedCost,
        responseTime,
        costEstimates,
        savings,
        success: true,
        response: response.choices[0].message.content.substring(0, 100) + '...'
      };
      
      results.requests.push(requestResult);
      results.summary.successfulRequests++;
      results.summary.totalCost += selectedCost;
      results.summary.totalTime += responseTime;
      results.summary.costSavings += savings;
      
      // Display results
      log(`   ✅ ${provider} - ${formatCost(selectedCost)} - ${formatTime(responseTime)}`, 'green');
      
      if (Object.keys(costEstimates).length > 1) {
        log(`   💰 Alternatives: ${Object.entries(costEstimates)
          .filter(([p]) => p !== provider)
          .map(([p, c]) => `${p}: ${formatCost(c)}`)
          .join(', ')}`, 'gray');
        
        if (savings > 0) {
          log(`   📊 Savings: ${formatPercentage(savings)} vs cheapest alternative`, 'green');
        } else if (savings < 0) {
          log(`   📊 Premium: ${formatPercentage(Math.abs(savings))} vs alternatives`, 'yellow');
        }
      }
      
    } catch (error) {
      log(`   ❌ Failed: ${error.message}`, 'red');
      results.requests.push({
        request,
        error: error.message,
        success: false
      });
    }
  }
  
  // Calculate summary statistics
  if (results.summary.successfulRequests > 0) {
    results.summary.averageCost = results.summary.totalCost / results.summary.successfulRequests;
    results.summary.averageTime = results.summary.totalTime / results.summary.successfulRequests;
    results.summary.averageSavings = results.summary.costSavings / results.summary.successfulRequests;
  }
  
  // Display scenario summary
  log(`\n📊 ${scenarioName.toUpperCase()} SUMMARY:`, 'magenta');
  log(`   Success rate: ${results.summary.successfulRequests}/${results.summary.totalRequests} (${formatPercentage(results.summary.successfulRequests / results.summary.totalRequests)})`, 'white');
  log(`   Total cost: ${formatCost(results.summary.totalCost)}`, 'white');
  log(`   Budget: ${formatCost(results.summary.costBudget)}`, 'white');
  log(`   Budget utilization: ${formatPercentage(results.summary.totalCost / results.summary.costBudget)}`, 
    results.summary.totalCost <= results.summary.costBudget ? 'green' : 'red');
  log(`   Average cost per request: ${formatCost(results.summary.averageCost || 0)}`, 'white');
  log(`   Average response time: ${formatTime(results.summary.averageTime || 0)}`, 'white');
  log(`   Average savings: ${formatPercentage(results.summary.averageSavings || 0)}`, 'white');
  
  if (Object.keys(results.summary.providerSelections).length > 0) {
    log(`   Provider distribution:`, 'white');
    Object.entries(results.summary.providerSelections).forEach(([provider, count]) => {
      const percentage = (count / results.summary.successfulRequests) * 100;
      log(`     ${provider}: ${count}/${results.summary.successfulRequests} (${percentage.toFixed(1)}%)`, 'white');
    });
  }
  
  return results;
}

async function generateMLAnalytics(client) {
  log(`\n🧠 ML Routing Analytics`, 'cyan');
  log('='.repeat(30), 'cyan');
  
  try {
    const analytics = await client.getAnalytics();
    
    log(`Total ML predictions: ${analytics.totalPredictions}`, 'white');
    log(`Average confidence: ${formatPercentage(analytics.averageConfidence)}`, 'white');
    
    if (analytics.accuracyMetrics) {
      log(`Accuracy metrics:`, 'white');
      Object.entries(analytics.accuracyMetrics).forEach(([metric, value]) => {
        log(`  ${metric}: ${formatPercentage(value)}`, 'white');
      });
    }
    
    if (analytics.userPatterns) {
      log(`User patterns:`, 'white');
      if (analytics.userPatterns.commonRequestTypes) {
        log(`  Common request types: ${analytics.userPatterns.commonRequestTypes.join(', ')}`, 'white');
      }
      if (analytics.userPatterns.costSavingsAchieved !== undefined) {
        log(`  Cost savings achieved: ${formatPercentage(analytics.userPatterns.costSavingsAchieved)}`, 'white');
      }
    }
    
    if (analytics.modelRecommendations && analytics.modelRecommendations.length > 0) {
      log(`Model recommendations:`, 'white');
      analytics.modelRecommendations.slice(0, 5).forEach(rec => {
        log(`  ${rec.scenario}: ${rec.recommendedProvider} (${rec.expectedSavings}% savings)`, 'white');
      });
    }
    
    return analytics;
    
  } catch (error) {
    log(`Warning: Could not retrieve ML analytics: ${error.message}`, 'yellow');
    return null;
  }
}

async function saveResults(results) {
  try {
    const resultsDir = path.join(__dirname, '..', 'results');
    await fs.mkdir(resultsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `cost-optimization-test-${timestamp}.json`;
    const filepath = path.join(resultsDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(results, null, 2));
    log(`\n📄 Results saved to: ${filepath}`, 'blue');
    
  } catch (error) {
    log(`Warning: Could not save results: ${error.message}`, 'yellow');
  }
}

async function runCostOptimizationTests() {
  log('💰 Cost-Optimized Assistant Test Application', 'magenta');
  log('='.repeat(50), 'magenta');
  log('Testing ML routing and cost optimization capabilities...', 'white');
  
  const { client, availableProviders } = await initializeClient();
  
  log(`\nAvailable providers: ${availableProviders.join(', ')}`, 'white');
  log(`Total test requests: ${Object.values(TEST_CONFIG.scenarios).reduce((a, b) => a + b, 0)}`, 'white');
  
  const testResults = {
    timestamp: new Date().toISOString(),
    availableProviders,
    scenarios: {},
    mlAnalytics: null,
    overallSummary: {
      totalRequests: 0,
      successfulRequests: 0,
      totalCost: 0,
      totalBudget: 0,
      totalSavings: 0,
      averageResponseTime: 0
    }
  };
  
  // Test different scenarios with different optimization strategies
  testResults.scenarios.simple_cost = await testScenario(
    client, 
    'simple_questions', 
    TEST_SCENARIOS.simple_questions.slice(0, TEST_CONFIG.scenarios.simple_questions),
    'cost'
  );
  
  testResults.scenarios.creative_quality = await testScenario(
    client, 
    'creative_tasks', 
    TEST_SCENARIOS.creative_tasks.slice(0, TEST_CONFIG.scenarios.creative_tasks),
    'quality'
  );
  
  testResults.scenarios.technical_balanced = await testScenario(
    client, 
    'technical_analysis', 
    TEST_SCENARIOS.technical_analysis.slice(0, TEST_CONFIG.scenarios.technical_analysis),
    'balanced'
  );
  
  testResults.scenarios.speed_speed = await testScenario(
    client, 
    'speed_tests', 
    TEST_SCENARIOS.speed_tests.slice(0, TEST_CONFIG.scenarios.speed_tests),
    'speed'
  );
  
  // Generate ML analytics
  testResults.mlAnalytics = await generateMLAnalytics(client);
  
  // Calculate overall summary
  Object.values(testResults.scenarios).forEach(scenario => {
    testResults.overallSummary.totalRequests += scenario.summary.totalRequests;
    testResults.overallSummary.successfulRequests += scenario.summary.successfulRequests;
    testResults.overallSummary.totalCost += scenario.summary.totalCost;
    testResults.overallSummary.totalBudget += scenario.summary.costBudget;
    testResults.overallSummary.totalSavings += scenario.summary.costSavings;
  });
  
  if (testResults.overallSummary.successfulRequests > 0) {
    testResults.overallSummary.averageCostPerRequest = testResults.overallSummary.totalCost / testResults.overallSummary.successfulRequests;
    testResults.overallSummary.averageSavingsPerRequest = testResults.overallSummary.totalSavings / testResults.overallSummary.successfulRequests;
  }
  
  // Display final results
  log(`\n🎯 OVERALL TEST RESULTS`, 'magenta');
  log('='.repeat(30), 'magenta');
  log(`Total requests: ${testResults.overallSummary.totalRequests}`, 'white');
  log(`Successful requests: ${testResults.overallSummary.successfulRequests}`, 'white');
  log(`Success rate: ${formatPercentage(testResults.overallSummary.successfulRequests / testResults.overallSummary.totalRequests)}`, 'white');
  log(`Total cost: ${formatCost(testResults.overallSummary.totalCost)}`, 'white');
  log(`Total budget: ${formatCost(testResults.overallSummary.totalBudget)}`, 'white');
  log(`Budget efficiency: ${formatPercentage(testResults.overallSummary.totalCost / testResults.overallSummary.totalBudget)}`, 
    testResults.overallSummary.totalCost <= testResults.overallSummary.totalBudget ? 'green' : 'red');
  log(`Average cost per request: ${formatCost(testResults.overallSummary.averageCostPerRequest || 0)}`, 'white');
  log(`Average savings per request: ${formatPercentage(testResults.overallSummary.averageSavingsPerRequest || 0)}`, 'white');
  
  // Calculate projected monthly savings
  const dailyRequests = 100; // Assume 100 requests per day
  const monthlyRequests = dailyRequests * 30;
  const projectedMonthlySavings = (testResults.overallSummary.averageSavingsPerRequest || 0) * (testResults.overallSummary.averageCostPerRequest || 0) * monthlyRequests;
  
  log(`\n💡 Projected Monthly Savings (100 requests/day):`, 'yellow');
  log(`   Monthly cost savings: ${formatCost(projectedMonthlySavings)}`, 'white');
  log(`   Annual cost savings: ${formatCost(projectedMonthlySavings * 12)}`, 'white');
  
  // Success assessment
  const overallSuccess = 
    testResults.overallSummary.successfulRequests / testResults.overallSummary.totalRequests >= 0.9 &&
    testResults.overallSummary.totalCost <= testResults.overallSummary.totalBudget &&
    (testResults.overallSummary.averageSavingsPerRequest || 0) > 0.1; // 10% savings
  
  if (overallSuccess) {
    log(`\n🎉 Cost Optimization Test: PASSED`, 'green');
    log(`   ✅ High success rate (${formatPercentage(testResults.overallSummary.successfulRequests / testResults.overallSummary.totalRequests)})`, 'green');
    log(`   ✅ Within budget (${formatPercentage(testResults.overallSummary.totalCost / testResults.overallSummary.totalBudget)})`, 'green');
    log(`   ✅ Achieving cost savings (${formatPercentage(testResults.overallSummary.averageSavingsPerRequest || 0)})`, 'green');
  } else {
    log(`\n⚠️  Cost Optimization Test: NEEDS IMPROVEMENT`, 'yellow');
    if (testResults.overallSummary.successfulRequests / testResults.overallSummary.totalRequests < 0.9) {
      log(`   ❌ Low success rate (${formatPercentage(testResults.overallSummary.successfulRequests / testResults.overallSummary.totalRequests)})`, 'red');
    }
    if (testResults.overallSummary.totalCost > testResults.overallSummary.totalBudget) {
      log(`   ❌ Over budget (${formatPercentage(testResults.overallSummary.totalCost / testResults.overallSummary.totalBudget)})`, 'red');
    }
    if ((testResults.overallSummary.averageSavingsPerRequest || 0) <= 0.1) {
      log(`   ❌ Insufficient cost savings (${formatPercentage(testResults.overallSummary.averageSavingsPerRequest || 0)})`, 'red');
    }
  }
  
  // Save results
  await saveResults(testResults);
  
  return testResults;
}

// Run the test suite if this file is executed directly
if (require.main === module) {
  runCostOptimizationTests()
    .then(results => {
      const success = results.overallSummary.successfulRequests / results.overallSummary.totalRequests >= 0.9;
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`\n❌ Test suite failed with unexpected error: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}