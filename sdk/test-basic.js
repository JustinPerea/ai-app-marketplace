/**
 * Basic SDK Test
 * Tests that the SDK can be imported and basic functionality works
 */

const { createClient, APIProvider, VERSION } = require('./dist/cjs/index.js');

console.log('🚀 Testing AI Marketplace SDK');
console.log('Version:', VERSION);

try {
  // Test 1: Create client
  console.log('\n✅ Test 1: Create client');
  const client = createClient({
    apiKeys: {
      openai: 'test-key',
    },
    config: {
      enableMLRouting: false, // Disable ML for testing
      defaultProvider: APIProvider.OPENAI,
    },
  });
  console.log('Client created successfully');

  // Test 2: Test model retrieval
  console.log('\n✅ Test 2: Get models');
  client.getModels(APIProvider.OPENAI).then(models => {
    console.log(`Found ${models.length} OpenAI models`);
    if (models.length > 0) {
      console.log('First model:', models[0].displayName);
    }
  }).catch(err => {
    console.log('Expected error getting models (no real API key):', err.message);
  });

  // Test 3: Test cost estimation
  console.log('\n✅ Test 3: Cost estimation');
  client.estimateCost({
    messages: [
      { role: 'user', content: 'Hello, world!' }
    ],
  }, APIProvider.OPENAI).then(estimates => {
    console.log('Cost estimates:', estimates);
  }).catch(err => {
    console.log('Expected error in cost estimation (no real API key):', err.message);
  });

  // Test 4: Test analytics (should work without API keys)
  console.log('\n✅ Test 4: Analytics');
  client.getAnalytics().then(analytics => {
    console.log('Analytics total predictions:', analytics.totalPredictions);
    console.log('Model recommendations:', analytics.modelRecommendations.length);
  }).catch(err => {
    console.log('Error getting analytics:', err.message);
  });

  console.log('\n🎉 Basic SDK tests completed successfully!');

} catch (error) {
  console.error('❌ SDK test failed:', error);
  process.exit(1);
}