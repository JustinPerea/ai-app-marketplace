// LlamaIndex Integration Examples
// Demonstrates how to use AI Marketplace Platform with LlamaIndex

import {
  AIMarketplaceLLM,
  AIMarketplaceEmbedding,
  AIMarketplaceLlamaIndexFactory,
} from '../llamaindex/provider';

/**
 * Example 1: Basic text completion with LlamaIndex
 */
export async function basicCompletionExample() {
  console.log('🚀 LlamaIndex Basic Completion Example');
  
  const llm = new AIMarketplaceLLM({
    apiKey: process.env.AI_MARKETPLACE_API_KEY!,
    defaultModel: 'gpt-4o-mini',
    teamId: 'team-llamaindex',
    userId: 'user-example',
    enableExperiments: true,
  });

  const prompt = `
    Explain the concept of vector databases and their importance in AI applications.
    Include practical use cases and benefits.
  `;

  try {
    const response = await llm.complete(prompt);
    console.log('Completion response:', response.text.substring(0, 200) + '...');
    console.log('Token usage:', response.usage);
    
    if (response.experiment) {
      console.log('Experiment info:', response.experiment);
    }
    
    const stats = llm.getUsageStats();
    console.log('Usage stats:', stats);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 2: Chat-based conversation
 */
export async function chatConversationExample() {
  console.log('🚀 LlamaIndex Chat Conversation Example');
  
  const llm = new AIMarketplaceLLM({
    apiKey: process.env.AI_MARKETPLACE_API_KEY!,
    defaultModel: 'claude-3-5-sonnet-20241022',
    enableExperiments: true,
  });

  const conversation = [
    { role: 'system' as const, content: 'You are a helpful AI assistant specializing in data science and machine learning.' },
    { role: 'user' as const, content: 'What are the key differences between supervised and unsupervised learning?' },
    { role: 'assistant' as const, content: 'Supervised learning uses labeled data to train models for prediction tasks, while unsupervised learning finds patterns in unlabeled data. Supervised learning includes classification and regression, while unsupervised includes clustering and dimensionality reduction.' },
    { role: 'user' as const, content: 'Can you give me practical examples of each type?' },
  ];

  try {
    const response = await llm.chat(conversation);
    console.log('Chat response:', response.text.substring(0, 300) + '...');
    console.log('Usage stats:', llm.getUsageStats());
    
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 3: Streaming completion
 */
export async function streamingExample() {
  console.log('🚀 LlamaIndex Streaming Example');
  
  const llm = new AIMarketplaceLLM({
    apiKey: process.env.AI_MARKETPLACE_API_KEY!,
    defaultModel: 'gpt-4o-mini',
    enableExperiments: false, // Disable for consistent streaming
  });

  const prompt = `
    Write a comprehensive guide on building a recommendation system.
    Include the following sections:
    1. Introduction to recommendation systems
    2. Types of recommendation algorithms
    3. Data requirements and preprocessing
    4. Implementation considerations
    5. Evaluation metrics
    6. Common challenges and solutions
  `;

  try {
    console.log('Starting streaming completion...');
    let fullText = '';
    let chunkCount = 0;
    
    for await (const chunk of llm.streamComplete(prompt)) {
      if (!chunk.done) {
        process.stdout.write(chunk.text);
        fullText += chunk.text;
        chunkCount++;
      } else {
        console.log(`\n\nStreaming completed. Received ${chunkCount} chunks.`);
        console.log(`Total text length: ${fullText.length} characters`);
        break;
      }
    }
    
    const stats = llm.getUsageStats();
    console.log('Final usage stats:', stats);
    
  } catch (error) {
    console.error('Streaming error:', error);
  }
}

/**
 * Example 4: Embeddings for semantic search
 */
export async function embeddingExample() {
  console.log('🚀 LlamaIndex Embedding Example');
  
  const embedding = new AIMarketplaceEmbedding({
    apiKey: process.env.AI_MARKETPLACE_API_KEY!,
    teamId: 'team-embeddings',
  }, 'text-embedding-3-small');

  const documents = [
    'Machine learning is a subset of artificial intelligence that focuses on algorithms that can learn from data.',
    'Deep learning uses neural networks with multiple layers to model complex patterns in data.',
    'Natural language processing enables computers to understand and generate human language.',
    'Computer vision allows machines to interpret and understand visual information from images and videos.',
    'Reinforcement learning is a type of machine learning where agents learn through interaction with an environment.',
  ];

  const query = 'What is artificial intelligence and how does it work?';

  try {
    // Get embeddings for all documents
    console.log('Generating embeddings for documents...');
    const docEmbeddings = await embedding.getTextEmbeddings(documents);
    
    // Get embedding for query
    console.log('Generating embedding for query...');
    const queryEmbedding = await embedding.getQueryEmbedding(query);
    
    console.log(`Generated embeddings: ${docEmbeddings.length} documents, ${queryEmbedding.length} dimensions`);
    console.log('Embedding dimension:', embedding.getEmbeddingDimension());
    
    // Calculate similarity scores (cosine similarity)
    const similarities = docEmbeddings.map((docEmb, index) => ({
      document: documents[index],
      score: cosineSimilarity(queryEmbedding, docEmb),
    }));
    
    // Sort by similarity
    similarities.sort((a, b) => b.score - a.score);
    
    console.log('\nMost relevant documents:');
    similarities.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. Score: ${item.score.toFixed(3)} - ${item.document.substring(0, 100)}...`);
    });
    
  } catch (error) {
    console.error('Embedding error:', error);
  }
}

/**
 * Example 5: RAG (Retrieval-Augmented Generation) setup
 */
export async function ragExample() {
  console.log('🚀 LlamaIndex RAG Example');
  
  const factory = new AIMarketplaceLlamaIndexFactory({
    apiKey: process.env.AI_MARKETPLACE_API_KEY!,
    teamId: 'team-rag',
    userId: 'user-researcher',
  });

  const { llm, embedding } = factory.createRAGSetup();

  // Sample knowledge base
  const knowledgeBase = [
    'The AI Marketplace Platform supports multiple providers including OpenAI, Anthropic Claude, Google Gemini, Cohere, Hugging Face, and local Ollama models.',
    'Cost optimization is achieved through intelligent provider routing, A/B testing, and real-time usage analytics.',
    'The platform provides enterprise features including team management, usage analytics, and governance policies.',
    'Experiments can be configured to automatically split traffic between providers to find the most cost-effective solution.',
    'Real-time streaming is supported across all providers with consistent API interfaces.',
  ];

  const userQuery = 'How does the AI Marketplace Platform help with cost optimization?';

  try {
    console.log('Setting up RAG pipeline...');
    
    // Step 1: Generate embeddings for knowledge base
    const kbEmbeddings = await embedding.getTextEmbeddings(knowledgeBase);
    
    // Step 2: Generate embedding for user query
    const queryEmbedding = await embedding.getQueryEmbedding(userQuery);
    
    // Step 3: Find most relevant documents
    const relevantDocs = knowledgeBase
      .map((doc, index) => ({
        document: doc,
        score: cosineSimilarity(queryEmbedding, kbEmbeddings[index]),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Top 3 most relevant
      .map(item => item.document);
    
    // Step 4: Create context-aware prompt
    const context = relevantDocs.join('\n\n');
    const ragPrompt = `
      Context information:
      ${context}
      
      Question: ${userQuery}
      
      Based on the context information provided, please answer the question. If the context doesn't contain enough information to fully answer the question, please say so.
    `;

    // Step 5: Generate response
    console.log('Generating RAG response...');
    const response = await llm.complete(ragPrompt, {
      temperature: 0.1, // Lower temperature for more factual responses
    });

    console.log('RAG Response:', response.text);
    console.log('Context used:', relevantDocs.length, 'relevant documents');
    
    const stats = llm.getUsageStats();
    console.log('Usage stats:', stats);
    
  } catch (error) {
    console.error('RAG error:', error);
  }
}

/**
 * Example 6: Model comparison and optimization
 */
export async function modelComparisonExample() {
  console.log('🚀 LlamaIndex Model Comparison Example');
  
  const factory = new AIMarketplaceLlamaIndexFactory({
    apiKey: process.env.AI_MARKETPLACE_API_KEY!,
    teamId: 'team-comparison',
  });

  const models = [
    { name: 'Cost Optimized', llm: factory.createCostOptimizedLLM() },
    { name: 'Performance Optimized', llm: factory.createPerformanceOptimizedLLM() },
    { name: 'Balanced', llm: factory.createBalancedLLM() },
  ];

  const testPrompts = [
    'Explain quantum computing in simple terms.',
    'Write a technical specification for a REST API.',
    'Create a marketing copy for a new mobile app.',
    'Describe the benefits of cloud migration.',
    'Explain the principles of agile development.',
  ];

  console.log('Comparing models across different prompts...');

  for (const { name, llm } of models) {
    console.log(`\nTesting ${name} model:`);
    
    for (let i = 0; i < testPrompts.length; i++) {
      try {
        const startTime = Date.now();
        const response = await llm.complete(testPrompts[i]);
        const duration = Date.now() - startTime;
        
        console.log(`  Prompt ${i + 1}: ${response.text.length} chars, ${duration}ms`);
        
      } catch (error) {
        console.error(`  Prompt ${i + 1} failed:`, error);
      }
    }
    
    const stats = llm.getUsageStats();
    console.log(`  ${name} Final Stats:`, {
      requests: stats.requestCount,
      totalCost: `$${stats.totalCost.toFixed(6)}`,
      avgCost: `$${stats.averageCostPerRequest.toFixed(6)}`,
    });
  }
}

/**
 * Example 7: Advanced configuration and error handling
 */
export async function advancedConfigExample() {
  console.log('🚀 LlamaIndex Advanced Configuration Example');
  
  const llm = new AIMarketplaceLLM({
    apiKey: process.env.AI_MARKETPLACE_API_KEY!,
    baseURL: 'http://localhost:3001/api/v1', // Custom endpoint
    defaultModel: 'gpt-4o-mini',
    teamId: 'team-advanced',
    userId: 'user-power',
    enableExperiments: true,
    costTracking: true,
  });

  // Test model info
  const modelInfo = llm.getModelInfo();
  console.log('Model Info:', modelInfo);

  // Test with various configuration options
  const configurations = [
    { name: 'High Creativity', temperature: 0.9, maxTokens: 500 },
    { name: 'Balanced', temperature: 0.5, maxTokens: 300 },
    { name: 'Factual', temperature: 0.1, maxTokens: 200 },
  ];

  const prompt = 'Generate creative ideas for improving team productivity in remote work environments.';

  for (const config of configurations) {
    try {
      console.log(`\nTesting ${config.name} configuration:`);
      const response = await llm.complete(prompt, config);
      
      console.log(`Response (${response.text.length} chars):`, response.text.substring(0, 150) + '...');
      
      if (response.usage) {
        console.log(`Tokens used: ${response.usage.total_tokens}`);
      }
      
    } catch (error) {
      console.error(`${config.name} configuration failed:`, error);
    }
  }

  // Test error handling with invalid model
  try {
    const invalidLLM = new AIMarketplaceLLM({
      apiKey: process.env.AI_MARKETPLACE_API_KEY!,
      defaultModel: 'invalid-model-name',
    });

    await invalidLLM.complete('This should fail.');
    
  } catch (error) {
    console.log('Expected error for invalid model:', error instanceof Error ? error.message : error);
  }

  const finalStats = llm.getUsageStats();
  console.log('Final advanced config stats:', finalStats);
}

// Utility function for cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Run all examples
async function runAllExamples() {
  if (!process.env.AI_MARKETPLACE_API_KEY) {
    console.error('Please set AI_MARKETPLACE_API_KEY environment variable');
    return;
  }

  try {
    await basicCompletionExample();
    await chatConversationExample();
    await streamingExample();
    await embeddingExample();
    await ragExample();
    await modelComparisonExample();
    await advancedConfigExample();
  } catch (error) {
    console.error('Example execution failed:', error);
  }
}

// Export for use in other modules
export {
  runAllExamples,
  cosineSimilarity,
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}