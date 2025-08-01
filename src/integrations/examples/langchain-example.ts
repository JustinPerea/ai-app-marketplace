// LangChain Integration Examples
// Demonstrates how to use AI Marketplace Platform with LangChain

import { AIMarketplaceChatModel, AIMarketplaceModelFactory } from '../langchain/provider';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';

/**
 * Example 1: Basic chat completion with LangChain
 */
export async function basicChatExample() {
  console.log('🚀 LangChain Basic Chat Example');
  
  const model = new AIMarketplaceChatModel({
    apiKey: process.env.AI_MARKETPLACE_API_KEY!,
    defaultModel: 'gpt-4o-mini',
    teamId: 'team-example',
    userId: 'user-example',
    enableExperiments: true,
  });

  const messages = [
    new SystemMessage('You are a helpful AI assistant that explains complex topics simply.'),
    new HumanMessage('Explain quantum computing in simple terms.'),
  ];

  try {
    const response = await model.invoke(messages);
    console.log('Response:', response.content);
    
    // Get usage statistics
    const stats = model.getUsageStats();
    console.log('Usage Stats:', stats);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 2: Using different model configurations
 */
export async function modelConfigurationExample() {
  console.log('🚀 LangChain Model Configuration Example');
  
  const factory = new AIMarketplaceModelFactory({
    apiKey: process.env.AI_MARKETPLACE_API_KEY!,
    teamId: 'team-example',
    userId: 'user-example',
  });

  // Cost-optimized model
  const costOptimized = factory.createCostOptimized();
  console.log('Cost-optimized model created with:', costOptimized.getUsageStats());

  // Performance-optimized model
  const performanceOptimized = factory.createPerformanceOptimized();
  console.log('Performance-optimized model created');

  // Privacy-focused model (local processing)
  const privacyFocused = factory.createPrivacyFocused();
  console.log('Privacy-focused model created');

  const prompt = 'What are the benefits of renewable energy?';
  
  try {
    // Test all three models
    const [costResponse, perfResponse, privacyResponse] = await Promise.all([
      costOptimized.invoke([new HumanMessage(prompt)]),
      performanceOptimized.invoke([new HumanMessage(prompt)]),
      privacyFocused.invoke([new HumanMessage(prompt)]),
    ]);

    console.log('Cost-optimized response length:', costResponse.content.length);
    console.log('Performance-optimized response length:', perfResponse.content.length);
    console.log('Privacy-focused response length:', privacyResponse.content.length);

    // Compare usage stats
    console.log('Cost stats:', costOptimized.getUsageStats());
    console.log('Performance stats:', performanceOptimized.getUsageStats());
    console.log('Privacy stats:', privacyFocused.getUsageStats());

  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 3: Advanced prompt templating with chains
 */
export async function promptTemplateExample() {
  console.log('🚀 LangChain Prompt Template Example');
  
  const model = new AIMarketplaceChatModel({
    apiKey: process.env.AI_MARKETPLACE_API_KEY!,
    defaultModel: 'claude-3-5-sonnet-20241022',
    enableExperiments: true,
  });

  // Create a prompt template
  const template = PromptTemplate.fromTemplate(`
    You are an expert {role} with deep knowledge in {domain}.
    
    Task: {task}
    
    Context: {context}
    
    Please provide a comprehensive response that:
    1. Addresses the task directly
    2. Uses your expertise in {domain}
    3. Considers the given context
    4. Provides actionable insights
  `);

  const formattedPrompt = await template.format({
    role: 'data scientist',
    domain: 'machine learning',
    task: 'analyze customer churn patterns',
    context: 'E-commerce company with 100K monthly active users, seeing 5% monthly churn rate',
  });

  try {
    const response = await model.invoke([new HumanMessage(formattedPrompt)]);
    console.log('Expert analysis response:', response.content.substring(0, 200) + '...');
    
    const stats = model.getUsageStats();
    console.log('Token usage:', {
      requests: stats.requestCount,
      avgCost: stats.averageCostPerRequest,
      totalCost: stats.totalCost,
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 4: Streaming responses with LangChain
 */
export async function streamingExample() {
  console.log('🚀 LangChain Streaming Example');
  
  const model = new AIMarketplaceChatModel({
    apiKey: process.env.AI_MARKETPLACE_API_KEY!,
    defaultModel: 'gpt-4o-mini',
    enableExperiments: false, // Disable for consistent streaming
  });

  const prompt = new HumanMessage('Write a short story about a robot learning to paint. Make it creative and engaging.');

  try {
    console.log('Starting streaming response...');
    
    // Note: Streaming implementation would depend on LangChain's streaming interface
    const response = await model.invoke([prompt], {
      // LangChain streaming options would go here
    });

    console.log('Complete response received:', response.content.length, 'characters');
    
  } catch (error) {
    console.error('Streaming error:', error);
  }
}

/**
 * Example 5: Cost tracking and optimization
 */
export async function costTrackingExample() {
  console.log('🚀 LangChain Cost Tracking Example');
  
  const models = [
    new AIMarketplaceChatModel({
      apiKey: process.env.AI_MARKETPLACE_API_KEY!,
      defaultModel: 'gpt-4o',
      costTracking: true,
    }),
    new AIMarketplaceChatModel({
      apiKey: process.env.AI_MARKETPLACE_API_KEY!,
      defaultModel: 'gpt-4o-mini',
      costTracking: true,
    }),
    new AIMarketplaceChatModel({
      apiKey: process.env.AI_MARKETPLACE_API_KEY!,
      defaultModel: 'gemini-1.5-flash',
      costTracking: true,
    }),
  ];

  const testPrompts = [
    'Summarize the benefits of cloud computing.',
    'Explain machine learning in simple terms.',
    'What are the key principles of good software design?',
    'Describe the impact of AI on modern business.',
    'How does renewable energy work?',
  ];

  console.log('Testing cost efficiency across models...');

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const modelName = ['GPT-4o', 'GPT-4o-mini', 'Gemini Flash'][i];
    
    console.log(`\nTesting ${modelName}:`);
    
    for (const prompt of testPrompts) {
      try {
        await model.invoke([new HumanMessage(prompt)]);
      } catch (error) {
        console.error(`Error with ${modelName}:`, error);
      }
    }
    
    const stats = model.getUsageStats();
    console.log(`${modelName} results:`, {
      requests: stats.requestCount,
      totalCost: `$${stats.totalCost.toFixed(6)}`,
      avgCost: `$${stats.averageCostPerRequest.toFixed(6)}`,
    });
  }
}

/**
 * Example 6: Error handling and retries
 */
export async function errorHandlingExample() {
  console.log('🚀 LangChain Error Handling Example');
  
  const model = new AIMarketplaceChatModel({
    apiKey: 'invalid-key', // Intentionally invalid
    defaultModel: 'gpt-4o-mini',
  });

  try {
    await model.invoke([new HumanMessage('This should fail due to invalid API key.')]);
  } catch (error) {
    console.log('Expected error caught:', error instanceof Error ? error.message : error);
    
    // Now try with valid configuration
    const validModel = new AIMarketplaceChatModel({
      apiKey: process.env.AI_MARKETPLACE_API_KEY!,
      defaultModel: 'gpt-4o-mini',
    });

    try {
      const response = await validModel.invoke([new HumanMessage('This should work now.')]);
      console.log('Recovery successful:', response.content.substring(0, 100) + '...');
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
    }
  }
}

/**
 * Example 7: Experiment tracking integration
 */
export async function experimentTrackingExample() {
  console.log('🚀 LangChain Experiment Tracking Example');
  
  const model = new AIMarketplaceChatModel({
    apiKey: process.env.AI_MARKETPLACE_API_KEY!,
    defaultModel: 'gpt-4o', // This might get overridden by experiments
    teamId: 'team-experiments',
    userId: 'user-researcher',
    enableExperiments: true,
  });

  const testCases = [
    'Write a product description for eco-friendly water bottles.',
    'Create a technical explanation of blockchain technology.',
    'Draft a customer service response for a billing inquiry.',
    'Generate creative ideas for a team building event.',
    'Explain the importance of data privacy in simple terms.',
  ];

  console.log('Running requests that may participate in A/B tests...');

  for (let i = 0; i < testCases.length; i++) {
    try {
      const response = await model.invoke([new HumanMessage(testCases[i])]);
      
      // Check if response includes experiment metadata
      const generationInfo = response.response_metadata;
      if (generationInfo?.experiment) {
        console.log(`Request ${i + 1} - Experiment:`, {
          experimentId: generationInfo.experiment.experiment_id,
          variant: generationInfo.experiment.variant_id,
          provider: generationInfo.experiment.provider_used,
          model: generationInfo.experiment.model_used,
        });
      } else {
        console.log(`Request ${i + 1} - No experiment (control group)`);
      }
      
      console.log(`Response length: ${response.content.length} characters`);
      
    } catch (error) {
      console.error(`Request ${i + 1} failed:`, error);
    }
  }

  const finalStats = model.getUsageStats();
  console.log('Final experiment session stats:', finalStats);
}

// Run all examples
async function runAllExamples() {
  if (!process.env.AI_MARKETPLACE_API_KEY) {
    console.error('Please set AI_MARKETPLACE_API_KEY environment variable');
    return;
  }

  try {
    await basicChatExample();
    await modelConfigurationExample();
    await promptTemplateExample();
    await streamingExample();
    await costTrackingExample();
    await errorHandlingExample();
    await experimentTrackingExample();
  } catch (error) {
    console.error('Example execution failed:', error);
  }
}

// Export for use in other modules
export {
  runAllExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}