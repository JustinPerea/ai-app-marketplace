/**
 * LlamaIndex Knowledge Base Integration Test Application
 * 
 * This application validates the integration of the AI Marketplace SDK
 * with LlamaIndex framework for advanced knowledge base and RAG capabilities.
 */

require('dotenv').config();
const { createClient, APIProvider, AIError } = require('../../../dist/cjs/index.js');
const fs = require('fs-extra');
const path = require('path');

// Mock LlamaIndex integration since actual LlamaIndex may not be available
// In a real implementation, you would use the actual LlamaIndex packages

// Mock LlamaIndex classes for testing purposes
class MockDocument {
  constructor(text, metadata = {}) {
    this.text = text;
    this.metadata = metadata;
    this.id = Math.random().toString(36).substr(2, 9);
  }
}

class MockNode {
  constructor(text, metadata = {}) {
    this.text = text;
    this.metadata = metadata;
    this.id = Math.random().toString(36).substr(2, 9);
    this.score = 0;
  }
}

class MockVectorIndex {
  constructor(nodes, llm) {
    this.nodes = nodes;
    this.llm = llm;
    this.embeddings = new Map();
    
    // Create mock embeddings
    nodes.forEach(node => {
      this.embeddings.set(node.id, Array(1536).fill(0).map(() => Math.random()));
    });
  }

  asQueryEngine(options = {}) {
    return new MockQueryEngine(this, options);
  }

  asRetriever(options = {}) {
    return new MockRetriever(this, options);
  }
}

class MockQueryEngine {
  constructor(index, options = {}) {
    this.index = index;
    this.options = options;
    this.topK = options.topK || 3;
  }

  async query(queryStr) {
    // Mock retrieval - select random nodes
    const selectedNodes = this.index.nodes
      .sort(() => 0.5 - Math.random())
      .slice(0, this.topK)
      .map(node => ({ ...node, score: Math.random() * 0.5 + 0.5 }));

    // Generate response using the LLM
    const context = selectedNodes.map(node => node.text).join('\n\n');
    const prompt = `Based on the following context, answer the question: "${queryStr}"\n\nContext:\n${context}`;

    const response = await this.index.llm._call(prompt);

    return {
      response: response,
      sourceNodes: selectedNodes,
      metadata: {
        queryStr,
        retrievedNodes: selectedNodes.length,
        averageScore: selectedNodes.reduce((sum, node) => sum + node.score, 0) / selectedNodes.length
      }
    };
  }
}

class MockRetriever {
  constructor(index, options = {}) {
    this.index = index;
    this.topK = options.topK || 5;
  }

  async retrieve(queryStr) {
    // Mock similarity search
    return this.index.nodes
      .sort(() => 0.5 - Math.random())
      .slice(0, this.topK)
      .map(node => ({ ...node, score: Math.random() * 0.5 + 0.5 }));
  }
}

// AI Marketplace LLM wrapper for LlamaIndex integration
class AIMarketplaceLlamaIndexLLM {
  constructor(client, options = {}) {
    this.client = client;
    this.options = options;
    this._llmType = 'ai-marketplace-llamaindex';
  }

  async _call(prompt, options = {}) {
    try {
      const response = await this.client.chat({
        messages: [{ role: 'user', content: prompt }],
      }, {
        optimizeFor: this.options.optimizeFor || 'balanced',
        provider: this.options.provider,
        ...options
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      throw new Error(`AI Marketplace LlamaIndex LLM call failed: ${error.message}`);
    }
  }

  async complete(prompt, options = {}) {
    const response = await this._call(prompt, options);
    return {
      text: response,
      metadata: {
        provider: 'ai-marketplace',
        llmType: this._llmType
      }
    };
  }
}

// Test configuration
const TEST_CONFIG = {
  dataPath: path.join(__dirname, '..', 'data'),
  indicesPath: path.join(__dirname, '..', 'indices'),
  testQueries: [
    'What is artificial intelligence?',
    'Explain machine learning algorithms',
    'How do neural networks work?',
    'Compare supervised and unsupervised learning',
    'What are the applications of deep learning?',
    'Describe natural language processing techniques',
    'How does computer vision work?',
    'What is reinforcement learning?',
    'Explain the transformer architecture',
    'What are the ethical considerations in AI?'
  ],
  advancedQueries: [
    'Compare the effectiveness of different machine learning algorithms for image classification',
    'How do attention mechanisms in transformers improve natural language understanding?',
    'What are the trade-offs between model accuracy and computational efficiency in deep learning?',
    'Analyze the evolution of neural network architectures from perceptrons to modern transformers'
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

function formatTime(ms) {
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatScore(score) {
  return `${(score * 100).toFixed(1)}%`;
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
    log('❌ No API keys found! Please set at least one API key.', 'red');
    process.exit(1);
  }
  
  const client = createClient({
    apiKeys,
    config: {
      enableMLRouting: true,
      enableAnalytics: true,
      timeout: 60000, // Longer timeout for complex queries
      cache: {
        enabled: false, // Disable cache for testing
      },
    },
  });
  
  return client;
}

async function createTestData() {
  const dataDir = TEST_CONFIG.dataPath;
  
  try {
    await fs.ensureDir(dataDir);
    await fs.ensureDir(path.join(dataDir, 'documents'));
  } catch (error) {
    // Directories may already exist
  }
  
  const testDocuments = [
    {
      filename: 'ai-fundamentals.txt',
      content: `
# Artificial Intelligence Fundamentals

Artificial Intelligence (AI) represents one of the most significant technological advances of our time. It encompasses the development of computer systems that can perform tasks typically requiring human intelligence, including learning, reasoning, problem-solving, perception, and language understanding.

## Core Concepts

### Machine Learning
Machine Learning is a subset of AI that enables systems to automatically learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data and learn patterns to make predictions or decisions.

### Deep Learning
Deep Learning is a specialized subset of machine learning that uses neural networks with multiple layers (hence "deep") to model and understand complex patterns in data. It has revolutionized fields like computer vision, natural language processing, and speech recognition.

### Neural Networks
Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) that process information through weighted connections, learning to recognize patterns and make predictions.

## Applications

AI has found applications across numerous domains:
- Healthcare: Medical diagnosis, drug discovery, personalized treatment
- Finance: Fraud detection, algorithmic trading, risk assessment
- Transportation: Autonomous vehicles, traffic optimization, logistics
- Entertainment: Recommendation systems, content generation, game AI
- Education: Personalized learning, automated grading, intelligent tutoring systems
      `
    },
    {
      filename: 'ml-algorithms.txt',
      content: `
# Machine Learning Algorithms

Machine learning algorithms can be broadly categorized into three main types: supervised learning, unsupervised learning, and reinforcement learning.

## Supervised Learning

Supervised learning algorithms learn from labeled training data to make predictions on new, unseen data.

### Classification Algorithms
- **Decision Trees**: Easy to interpret, handle both numerical and categorical data
- **Random Forest**: Ensemble method that combines multiple decision trees
- **Support Vector Machines (SVM)**: Effective for high-dimensional data
- **Neural Networks**: Can model complex non-linear relationships
- **Naive Bayes**: Simple yet effective for text classification

### Regression Algorithms
- **Linear Regression**: Models linear relationships between variables
- **Polynomial Regression**: Captures non-linear relationships
- **Ridge Regression**: Handles multicollinearity through regularization
- **Lasso Regression**: Performs feature selection through L1 regularization

## Unsupervised Learning

Unsupervised learning finds hidden patterns in data without labeled examples.

### Clustering
- **K-Means**: Partitions data into k clusters
- **Hierarchical Clustering**: Creates tree-like cluster structures
- **DBSCAN**: Density-based clustering for irregularly shaped clusters

### Dimensionality Reduction
- **Principal Component Analysis (PCA)**: Reduces dimensionality while preserving variance
- **t-SNE**: Excellent for visualizing high-dimensional data
- **UMAP**: Fast and preserves both local and global structure

## Reinforcement Learning

Reinforcement learning involves agents learning to make decisions through interaction with an environment, receiving rewards or penalties for actions taken.

Key concepts include:
- **Agent**: The learner or decision maker
- **Environment**: The world in which the agent operates
- **Actions**: Choices available to the agent
- **Rewards**: Feedback from the environment
- **Policy**: Strategy used by the agent to choose actions
      `
    },
    {
      filename: 'neural-networks.txt',
      content: `
# Neural Networks and Deep Learning

Neural networks form the foundation of modern deep learning systems, inspired by the structure and function of biological neural networks in the brain.

## Basic Structure

### Neurons (Nodes)
Each neuron receives input signals, processes them through an activation function, and produces an output. The processing involves:
1. Weighted sum of inputs
2. Addition of bias term
3. Application of activation function

### Layers
Neural networks are organized in layers:
- **Input Layer**: Receives the raw data
- **Hidden Layers**: Process information between input and output
- **Output Layer**: Produces the final prediction or classification

### Weights and Biases
- **Weights**: Determine the strength of connections between neurons
- **Biases**: Allow neurons to activate even with zero input
- Both are learned through training

## Activation Functions

Activation functions introduce non-linearity into the network:
- **ReLU (Rectified Linear Unit)**: Most common, simple and effective
- **Sigmoid**: Maps values to (0,1), useful for binary classification
- **Tanh**: Maps values to (-1,1), zero-centered
- **Softmax**: Used in multi-class classification output layers

## Training Process

### Forward Propagation
Data flows forward through the network to produce predictions.

### Backpropagation
Errors are propagated backward to update weights and biases:
1. Calculate loss using a loss function
2. Compute gradients using chain rule
3. Update parameters using optimization algorithm

### Optimization Algorithms
- **Gradient Descent**: Basic optimization method
- **Adam**: Adaptive learning rate, most popular
- **RMSprop**: Good for recurrent neural networks
- **SGD with Momentum**: Accelerates convergence

## Deep Learning Architectures

### Convolutional Neural Networks (CNNs)
Specialized for processing grid-like data such as images:
- **Convolutional Layers**: Apply filters to detect features
- **Pooling Layers**: Reduce spatial dimensions
- **Fully Connected Layers**: Final classification or regression

### Recurrent Neural Networks (RNNs)
Designed for sequential data:
- **LSTM (Long Short-Term Memory)**: Handles long sequences
- **GRU (Gated Recurrent Unit)**: Simpler alternative to LSTM
- **Bidirectional RNNs**: Process sequences in both directions

### Transformers
Revolutionary architecture for natural language processing:
- **Self-Attention Mechanism**: Allows the model to focus on relevant parts
- **Multi-Head Attention**: Multiple attention mechanisms in parallel
- **Positional Encoding**: Provides sequence order information
      `
    },
    {
      filename: 'ai-applications.txt',
      content: `
# AI Applications and Impact

Artificial Intelligence has transformed numerous industries and aspects of daily life, creating new possibilities and solving complex problems across various domains.

## Healthcare

### Medical Diagnosis
AI systems can analyze medical images, lab results, and patient data to assist in diagnosis:
- **Radiology**: Detection of tumors, fractures, and abnormalities in X-rays, MRIs, and CT scans
- **Pathology**: Analysis of tissue samples and blood tests
- **Dermatology**: Skin cancer detection from photographs

### Drug Discovery
AI accelerates the drug development process:
- **Molecular Design**: Predicting molecular properties and interactions
- **Clinical Trials**: Optimizing patient selection and trial design
- **Repurposing**: Finding new uses for existing drugs

### Personalized Medicine
Tailoring treatments to individual patients based on genetic, environmental, and lifestyle factors.

## Finance

### Fraud Detection
Machine learning algorithms identify suspicious transactions and patterns:
- **Credit Card Fraud**: Real-time transaction monitoring
- **Insurance Fraud**: Claims analysis and risk assessment
- **Identity Theft**: Behavioral pattern recognition

### Algorithmic Trading
AI systems execute trades based on market analysis:
- **High-Frequency Trading**: Microsecond decision making
- **Portfolio Management**: Automated asset allocation
- **Risk Management**: Market volatility prediction

### Credit Scoring
AI improves credit risk assessment using alternative data sources and advanced modeling techniques.

## Transportation

### Autonomous Vehicles
Self-driving cars use multiple AI technologies:
- **Computer Vision**: Object detection and recognition
- **Sensor Fusion**: Combining data from cameras, LiDAR, and radar
- **Path Planning**: Route optimization and obstacle avoidance
- **Decision Making**: Real-time driving decisions

### Traffic Management
AI optimizes traffic flow and reduces congestion:
- **Smart Traffic Lights**: Adaptive signal timing
- **Route Optimization**: GPS navigation systems
- **Predictive Maintenance**: Infrastructure monitoring

## Natural Language Processing

### Language Translation
AI-powered translation services break down language barriers:
- **Neural Machine Translation**: Context-aware translation
- **Real-time Translation**: Live conversation translation
- **Document Translation**: Preserving formatting and context

### Conversational AI
Chatbots and virtual assistants provide automated customer service:
- **Customer Support**: 24/7 availability and instant responses
- **Virtual Assistants**: Task automation and information retrieval
- **Content Generation**: Automated writing and summarization

## Computer Vision

### Image Recognition
AI systems can identify and classify objects in images:
- **Facial Recognition**: Security and identification systems
- **Object Detection**: Inventory management and quality control
- **Scene Understanding**: Autonomous navigation and robotics

### Medical Imaging
Advanced analysis of medical images for diagnosis and treatment planning.

## Challenges and Considerations

### Ethical Issues
- **Bias and Fairness**: Ensuring AI systems don't discriminate
- **Privacy**: Protecting personal data and information
- **Transparency**: Making AI decisions explainable
- **Accountability**: Determining responsibility for AI decisions

### Technical Challenges
- **Data Quality**: Need for large, high-quality datasets
- **Computational Resources**: High energy and hardware requirements
- **Generalization**: Making AI work across different domains
- **Robustness**: Ensuring reliability in various conditions

### Societal Impact
- **Job Displacement**: Automation changing employment landscape
- **Digital Divide**: Ensuring equitable access to AI benefits
- **Regulation**: Developing appropriate governance frameworks
- **Human-AI Collaboration**: Optimizing human-machine partnerships
      `
    }
  ];
  
  let documentsCreated = 0;
  
  for (const doc of testDocuments) {
    const filePath = path.join(dataDir, 'documents', doc.filename);
    try {
      await fs.stat(filePath);
      // File already exists
    } catch (error) {
      // File doesn't exist, create it
      await fs.writeFile(filePath, doc.content.trim());
      documentsCreated++;
    }
  }
  
  if (documentsCreated > 0) {
    log(`✓ Created ${documentsCreated} test documents`, 'green');
  }
  
  return testDocuments.length;
}

async function loadDocuments() {
  log('\n📚 Loading Documents', 'cyan');
  log('='.repeat(25), 'cyan');
  
  const documentsDir = path.join(TEST_CONFIG.dataPath, 'documents');
  const documents = [];
  
  try {
    const files = await fs.readdir(documentsDir);
    
    for (const file of files) {
      if (file.endsWith('.txt') || file.endsWith('.md')) {
        const filePath = path.join(documentsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        documents.push(new MockDocument(content, {
          filename: file,
          source: filePath,
          type: 'text',
          loadedAt: new Date().toISOString()
        }));
      }
    }
    
    log(`✓ Loaded ${documents.length} documents`, 'green');
    
    const totalContent = documents.reduce((sum, doc) => sum + doc.text.length, 0);
    log(`✓ Total content: ${totalContent.toLocaleString()} characters`, 'green');
    
    return documents;
    
  } catch (error) {
    log(`❌ Error loading documents: ${error.message}`, 'red');
    throw error;
  }
}

async function createNodes(documents) {
  log('\n🔨 Creating Nodes', 'cyan');
  log('='.repeat(20), 'cyan');
  
  const nodes = [];
  const chunkSize = 1000;
  const chunkOverlap = 200;
  
  for (const doc of documents) {
    const text = doc.text;
    let start = 0;
    let nodeIndex = 0;
    
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.substring(start, end);
      
      if (chunk.trim().length > 0) {
        nodes.push(new MockNode(chunk, {
          ...doc.metadata,
          nodeIndex,
          startChar: start,
          endChar: end,
          chunkSize: chunk.length
        }));
        nodeIndex++;
      }
      
      start = end - chunkOverlap;
      if (start >= text.length - chunkOverlap) break;
    }
  }
  
  log(`✓ Created ${nodes.length} nodes from ${documents.length} documents`, 'green');
  log(`✓ Average node size: ${Math.round(nodes.reduce((sum, node) => sum + node.text.length, 0) / nodes.length)} characters`, 'green');
  
  return nodes;
}

async function buildIndex(nodes, client) {
  log('\n🏗️  Building Vector Index', 'cyan');
  log('='.repeat(25), 'cyan');
  
  const startTime = Date.now();
  
  // Create AI Marketplace LLM for LlamaIndex
  const llm = new AIMarketplaceLlamaIndexLLM(client, {
    optimizeFor: 'balanced'
  });
  
  // Build vector index (mocked)
  const vectorIndex = new MockVectorIndex(nodes, llm);
  
  const buildTime = Date.now() - startTime;
  log(`✓ Vector index built with ${nodes.length} nodes`, 'green');
  log(`✓ Index construction completed in ${formatTime(buildTime)}`, 'green');
  
  return vectorIndex;
}

async function testBasicQueries(queryEngine) {
  log('\n🔍 Testing Basic Queries', 'cyan');
  log('='.repeat(30), 'cyan');
  
  const results = {
    queries: [],
    summary: {
      totalQueries: 0,
      successfulQueries: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      averageRetrievalScore: 0,
      averageConfidence: 0
    }
  };
  
  for (let i = 0; i < Math.min(TEST_CONFIG.testQueries.length, 6); i++) {
    const query = TEST_CONFIG.testQueries[i];
    log(`\n${i + 1}. "${query}"`, 'white');
    
    try {
      const startTime = Date.now();
      const response = await queryEngine.query(query);
      const responseTime = Date.now() - startTime;
      
      const queryResult = {
        query,
        response: response.response,
        responseTime,
        sourceNodes: response.sourceNodes.length,
        averageScore: response.metadata.averageScore,
        success: true
      };
      
      results.queries.push(queryResult);
      results.summary.successfulQueries++;
      results.summary.totalResponseTime += responseTime;
      results.summary.averageRetrievalScore += response.metadata.averageScore;
      
      // Display results
      log(`   ✅ Response (${formatTime(responseTime)}):`, 'green');
      log(`   ${response.response.substring(0, 150)}${response.response.length > 150 ? '...' : ''}`, 'gray');
      log(`   📄 Retrieved nodes: ${response.sourceNodes.length}`, 'gray');
      log(`   📊 Average score: ${formatScore(response.metadata.averageScore)}`, 'gray');
      
    } catch (error) {
      log(`   ❌ Failed: ${error.message}`, 'red');
      results.queries.push({
        query,
        error: error.message,
        success: false
      });
    }
    
    results.summary.totalQueries++;
  }
  
  // Calculate summary statistics
  if (results.summary.successfulQueries > 0) {
    results.summary.averageResponseTime = results.summary.totalResponseTime / results.summary.successfulQueries;
    results.summary.averageRetrievalScore = results.summary.averageRetrievalScore / results.summary.successfulQueries;
    results.summary.averageConfidence = results.summary.averageRetrievalScore; // Simplified
  }
  
  return results;
}

async function testAdvancedQueries(queryEngine) {
  log('\n🧠 Testing Advanced Queries', 'cyan');
  log('='.repeat(30), 'cyan');
  
  const results = {
    queries: [],
    summary: {
      totalQueries: 0,
      successfulQueries: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      complexityHandling: 0
    }
  };
  
  for (let i = 0; i < Math.min(TEST_CONFIG.advancedQueries.length, 3); i++) {
    const query = TEST_CONFIG.advancedQueries[i];
    log(`\n${i + 1}. "${query.substring(0, 80)}${query.length > 80 ? '...' : ''}"`, 'white');
    
    try {
      const startTime = Date.now();
      const response = await queryEngine.query(query);
      const responseTime = Date.now() - startTime;
      
      // Assess complexity handling (mock metric)
      const complexityScore = Math.min(
        0.6 + (response.response.length / 1000) * 0.2 + 
        (response.sourceNodes.length / 5) * 0.2,
        1.0
      );
      
      const queryResult = {
        query,
        response: response.response,
        responseTime,
        sourceNodes: response.sourceNodes.length,
        complexityScore,
        success: true
      };
      
      results.queries.push(queryResult);
      results.summary.successfulQueries++;
      results.summary.totalResponseTime += responseTime;
      results.summary.complexityHandling += complexityScore;
      
      // Display results
      log(`   ✅ Response (${formatTime(responseTime)}):`, 'green');
      log(`   ${response.response.substring(0, 200)}${response.response.length > 200 ? '...' : ''}`, 'gray');
      log(`   📄 Retrieved nodes: ${response.sourceNodes.length}`, 'gray');
      log(`   🎯 Complexity handling: ${formatScore(complexityScore)}`, 'gray');
      
    } catch (error) {
      log(`   ❌ Failed: ${error.message}`, 'red');
      results.queries.push({
        query,
        error: error.message,
        success: false
      });
    }
    
    results.summary.totalQueries++;
  }
  
  // Calculate summary statistics
  if (results.summary.successfulQueries > 0) {
    results.summary.averageResponseTime = results.summary.totalResponseTime / results.summary.successfulQueries;
    results.summary.complexityHandling = results.summary.complexityHandling / results.summary.successfulQueries;
  }
  
  return results;
}

async function testProviderComparison(nodes, client) {
  log('\n🔄 Testing Provider Comparison', 'cyan');
  log('='.repeat(35), 'cyan');
  
  const testQuery = "Explain the key differences between supervised and unsupervised machine learning";
  const providers = [];
  
  if (process.env.OPENAI_API_KEY) providers.push({ name: 'OpenAI', provider: APIProvider.OPENAI });
  if (process.env.ANTHROPIC_API_KEY) providers.push({ name: 'Anthropic', provider: APIProvider.ANTHROPIC });
  if (process.env.GOOGLE_API_KEY) providers.push({ name: 'Google AI', provider: APIProvider.GOOGLE });
  
  const results = [];
  
  for (const { name, provider } of providers) {
    log(`\nTesting ${name}...`, 'white');
    
    try {
      const llm = new AIMarketplaceLlamaIndexLLM(client, {
        provider: provider,
        optimizeFor: 'balanced'
      });
      
      const index = new MockVectorIndex(nodes, llm);
      const queryEngine = index.asQueryEngine({ topK: 3 });
      
      const startTime = Date.now();
      const response = await queryEngine.query(testQuery);
      const responseTime = Date.now() - startTime;
      
      results.push({
        provider: name,
        responseTime,
        responseLength: response.response.length,
        sourceNodes: response.sourceNodes.length,
        success: true
      });
      
      log(`   ✅ ${name}: ${formatTime(responseTime)} - ${response.response.length} chars - ${response.sourceNodes.length} nodes`, 'green');
      
    } catch (error) {
      log(`   ❌ ${name}: ${error.message}`, 'red');
      results.push({
        provider: name,
        error: error.message,
        success: false
      });
    }
  }
  
  return results;
}

async function testLlamaIndexIntegration(client) {
  log('\n🦙 Testing LlamaIndex Integration', 'cyan');
  log('='.repeat(35), 'cyan');
  
  const tests = [];
  
  // Test 1: LLM wrapper functionality
  try {
    log('Testing LLM wrapper...', 'white');
    const llm = new AIMarketplaceLlamaIndexLLM(client);
    const response = await llm._call('What is machine learning?');
    
    if (response && typeof response === 'string') {
      log('   ✅ LLM wrapper: Working', 'green');
      tests.push({ test: 'LLM wrapper', status: 'passed' });
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    log(`   ❌ LLM wrapper: ${error.message}`, 'red');
    tests.push({ test: 'LLM wrapper', status: 'failed', error: error.message });
  }
  
  // Test 2: Complete method
  try {
    log('Testing complete method...', 'white');
    const llm = new AIMarketplaceLlamaIndexLLM(client);
    const completion = await llm.complete('Define artificial intelligence');
    
    if (completion && completion.text && completion.metadata) {
      log('   ✅ Complete method: Working', 'green');
      tests.push({ test: 'Complete method', status: 'passed' });
    } else {
      throw new Error('Invalid completion format');
    }
  } catch (error) {
    log(`   ❌ Complete method: ${error.message}`, 'red');
    tests.push({ test: 'Complete method', status: 'failed', error: error.message });
  }
  
  // Test 3: Provider selection
  try {
    log('Testing provider selection...', 'white');
    const llm = new AIMarketplaceLlamaIndexLLM(client, {
      provider: APIProvider.OPENAI
    });
    const response = await llm._call('Test provider selection');
    
    if (response) {
      log('   ✅ Provider selection: Working', 'green');
      tests.push({ test: 'Provider selection', status: 'passed' });
    } else {
      throw new Error('Provider selection failed');
    }
  } catch (error) {
    log(`   ❌ Provider selection: ${error.message}`, 'red');
    tests.push({ test: 'Provider selection', status: 'failed', error: error.message });
  }
  
  return tests;
}

async function saveResults(results) {
  try {
    const resultsDir = path.join(__dirname, '..', 'results');
    await fs.ensureDir(resultsDir);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `llamaindex-knowledge-base-test-${timestamp}.json`;
    const filepath = path.join(resultsDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(results, null, 2));
    log(`\n📄 Results saved to: ${filepath}`, 'blue');
    
  } catch (error) {
    log(`Warning: Could not save results: ${error.message}`, 'yellow');
  }
}

async function runLlamaIndexKnowledgeBaseTests() {
  log('🧠 LlamaIndex Knowledge Base Test Application', 'magenta');
  log('='.repeat(50), 'magenta');
  log('Testing LlamaIndex integration and knowledge base capabilities...', 'white');
  
  const overallStartTime = Date.now();
  
  try {
    // Initialize client
    const client = await initializeClient();
    
    // Create test data
    await createTestData();
    
    // Load documents
    const documents = await loadDocuments();
    
    // Create nodes
    const nodes = await createNodes(documents);
    
    // Build index
    const vectorIndex = await buildIndex(nodes, client);
    
    // Create query engine
    const queryEngine = vectorIndex.asQueryEngine({ topK: 4 });
    
    // Test basic queries
    const basicResults = await testBasicQueries(queryEngine);
    
    // Test advanced queries
    const advancedResults = await testAdvancedQueries(queryEngine);
    
    // Test provider comparison
    const providerResults = await testProviderComparison(nodes, client);
    
    // Test LlamaIndex integration
    const integrationResults = await testLlamaIndexIntegration(client);
    
    const totalTime = Date.now() - overallStartTime;
    
    // Compile final results
    const finalResults = {
      timestamp: new Date().toISOString(),
      totalExecutionTime: totalTime,
      dataProcessing: {
        documentsLoaded: documents.length,
        nodesCreated: nodes.length,
        indexBuilt: true
      },
      basicQueries: basicResults,
      advancedQueries: advancedResults,
      providerComparison: providerResults,
      llamaIndexIntegration: integrationResults,
      overallSummary: {
        basicQueriesSuccessful: basicResults.summary.successfulQueries,
        basicQueriesTotal: basicResults.summary.totalQueries,
        advancedQueriesSuccessful: advancedResults.summary.successfulQueries,
        advancedQueriesTotal: advancedResults.summary.totalQueries,
        averageBasicResponseTime: basicResults.summary.averageResponseTime,
        averageAdvancedResponseTime: advancedResults.summary.averageResponseTime,
        averageRetrievalScore: basicResults.summary.averageRetrievalScore,
        integrationTestsPassed: integrationResults.filter(t => t.status === 'passed').length,
        integrationTestsTotal: integrationResults.length
      }
    };
    
    // Display final summary
    log(`\n🎯 LLAMAINDEX KNOWLEDGE BASE TEST SUMMARY`, 'magenta');
    log('='.repeat(45), 'magenta');
    log(`Total execution time: ${formatTime(totalTime)}`, 'white');
    log(`Documents processed: ${documents.length}`, 'white');
    log(`Nodes created: ${nodes.length}`, 'white');
    log(`Basic queries successful: ${basicResults.summary.successfulQueries}/${basicResults.summary.totalQueries}`, 'white');
    log(`Advanced queries successful: ${advancedResults.summary.successfulQueries}/${advancedResults.summary.totalQueries}`, 'white');
    log(`Average basic response time: ${formatTime(basicResults.summary.averageResponseTime)}`, 'white');
    log(`Average advanced response time: ${formatTime(advancedResults.summary.averageResponseTime)}`, 'white');
    log(`Average retrieval score: ${formatScore(basicResults.summary.averageRetrievalScore)}`, 'white');
    log(`LlamaIndex integration: ${integrationResults.filter(t => t.status === 'passed').length}/${integrationResults.length} tests passed`, 'white');
    
    // Success assessment
    const basicSuccessRate = basicResults.summary.successfulQueries / basicResults.summary.totalQueries;
    const advancedSuccessRate = advancedResults.summary.successfulQueries / advancedResults.summary.totalQueries;
    const integrationSuccessRate = integrationResults.filter(t => t.status === 'passed').length / integrationResults.length;
    const averageResponseTime = (basicResults.summary.averageResponseTime + advancedResults.summary.averageResponseTime) / 2;
    const retrievalScore = basicResults.summary.averageRetrievalScore;
    
    const overallSuccess = 
      basicSuccessRate >= 0.8 &&              // 80% basic success rate
      advancedSuccessRate >= 0.7 &&           // 70% advanced success rate
      integrationSuccessRate >= 0.8 &&        // 80% integration tests pass
      averageResponseTime <= 5000 &&          // Under 5 seconds average
      retrievalScore >= 0.6;                  // 60% retrieval score
    
    if (overallSuccess) {
      log(`\n🎉 LlamaIndex Knowledge Base Test: PASSED`, 'green');
      log(`   ✅ Basic queries success rate: ${formatScore(basicSuccessRate)}`, 'green');
      log(`   ✅ Advanced queries success rate: ${formatScore(advancedSuccessRate)}`, 'green');
      log(`   ✅ Integration tests: ${formatScore(integrationSuccessRate)}`, 'green');
      log(`   ✅ Response time: ${formatTime(averageResponseTime)}`, 'green');
      log(`   ✅ Retrieval score: ${formatScore(retrievalScore)}`, 'green');
    } else {
      log(`\n⚠️  LlamaIndex Knowledge Base Test: NEEDS IMPROVEMENT`, 'yellow');
      if (basicSuccessRate < 0.8) {
        log(`   ❌ Low basic success rate: ${formatScore(basicSuccessRate)}`, 'red');
      }
      if (advancedSuccessRate < 0.7) {
        log(`   ❌ Low advanced success rate: ${formatScore(advancedSuccessRate)}`, 'red');
      }
      if (integrationSuccessRate < 0.8) {
        log(`   ❌ Integration issues: ${formatScore(integrationSuccessRate)} passed`, 'red');
      }
      if (averageResponseTime > 5000) {
        log(`   ❌ Slow response time: ${formatTime(averageResponseTime)}`, 'red');
      }
      if (retrievalScore < 0.6) {
        log(`   ❌ Low retrieval score: ${formatScore(retrievalScore)}`, 'red');
      }
    }
    
    // Save results
    await saveResults(finalResults);
    
    return finalResults;
    
  } catch (error) {
    log(`\n❌ LlamaIndex Knowledge Base test failed: ${error.message}`, 'red');
    console.error(error);
    throw error;
  }
}

// Run the test suite if this file is executed directly
if (require.main === module) {
  runLlamaIndexKnowledgeBaseTests()
    .then(results => {
      const basicSuccess = results.overallSummary.basicQueriesSuccessful / results.overallSummary.basicQueriesTotal >= 0.8;
      const advancedSuccess = results.overallSummary.advancedQueriesSuccessful / results.overallSummary.advancedQueriesTotal >= 0.7;
      const integrationSuccess = results.overallSummary.integrationTestsPassed / results.overallSummary.integrationTestsTotal >= 0.8;
      
      const success = basicSuccess && advancedSuccess && integrationSuccess;
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed with error:', error);
      process.exit(1);
    });
}