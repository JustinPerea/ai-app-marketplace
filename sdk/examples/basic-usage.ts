/**
 * Basic Usage Example
 * 
 * This example shows the basic usage of the AI Marketplace SDK
 */

import { createClient, APIProvider } from '../src/index';

async function basicExample() {
  // Create a client with your API keys
  const client = createClient({
    apiKeys: {
      openai: process.env.OPENAI_API_KEY!,
      anthropic: process.env.ANTHROPIC_API_KEY!,
      google: process.env.GOOGLE_API_KEY!,
    },
    config: {
      enableMLRouting: true,
      defaultProvider: APIProvider.OPENAI,
    },
  });

  try {
    // Simple chat completion
    console.log('🚀 Basic Chat Completion');
    const response = await client.chat({
      messages: [
        { role: 'user', content: 'Hello! Can you explain what machine learning is in simple terms?' }
      ],
    });

    console.log('Response:', response.choices[0].message.content);
    console.log('Provider used:', response.provider);
    console.log('Cost:', `$${response.usage.cost.toFixed(6)}`);
    console.log('---\n');

    // Chat with specific provider
    console.log('🎯 Using Specific Provider (Claude)');
    const claudeResponse = await client.chat({
      messages: [
        { role: 'user', content: 'Write a haiku about artificial intelligence' }
      ],
    }, {
      provider: APIProvider.ANTHROPIC,
    });

    console.log('Claude Response:', claudeResponse.choices[0].message.content);
    console.log('---\n');

    // ML-optimized routing
    console.log('🧠 ML-Optimized for Cost');
    const costOptimized = await client.chat({
      messages: [
        { role: 'user', content: 'What are the main benefits of renewable energy?' }
      ],
    }, {
      optimizeFor: 'cost',
    });

    console.log('Cost-optimized response from:', costOptimized.provider);
    console.log('Cost:', `$${costOptimized.usage.cost.toFixed(6)}`);
    console.log('---\n');

    // Get cost estimates
    console.log('💰 Cost Estimates Across Providers');
    const estimates = await client.estimateCost({
      messages: [
        { role: 'user', content: 'Explain quantum computing in detail' }
      ],
    });

    estimates.forEach(({ provider, cost }) => {
      console.log(`${provider}: $${cost.toFixed(6)}`);
    });
    console.log('---\n');

    // Get analytics
    console.log('📊 ML Analytics');
    const analytics = await client.getAnalytics();
    console.log('Total predictions made:', analytics.totalPredictions);
    console.log('Average confidence:', (analytics.averageConfidence * 100).toFixed(1) + '%');
    console.log('Model recommendations:');
    analytics.modelRecommendations.forEach(rec => {
      console.log(`  ${rec.scenario}: ${rec.recommendedProvider} (${rec.expectedSavings}% savings)`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  basicExample();
}