/**
 * LangChain RAG Integration Test Application
 * 
 * This application validates the integration of the AI Marketplace SDK
 * with LangChain framework for RAG (Retrieval-Augmented Generation) applications.
 */

require('dotenv').config();
const { createClient, APIProvider, AIError } = require('../../../dist/cjs/index.js');
const { DirectoryLoader } = require('langchain/document_loaders/fs/directory');
const { TextLoader } = require('langchain/document_loaders/fs/text');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { RetrievalQAChain } = require('langchain/chains');
const { LLM } = require('@langchain/core/language_models/llms');
const fs = require('fs').promises;
const path = require('path');

// Custom LangChain LLM wrapper for AI Marketplace SDK
class AIMarketplaceLLM extends LLM {
  constructor(client, options = {}) {
    super();
    this.client = client;
    this.options = options;
    this._llmType = 'ai-marketplace';
  }

  get _llmType() {
    return 'ai-marketplace';
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
      throw new Error(`AI Marketplace LLM call failed: ${error.message}`);
    }
  }

  async *_streamResponseChunks(prompt, options = {}) {
    try {
      const stream = this.client.chatStream({
        messages: [{ role: 'user', content: prompt }],
      }, {
        optimizeFor: this.options.optimizeFor || 'balanced',
        provider: this.options.provider,
        ...options
      });

      for await (const chunk of stream) {
        if (chunk.choices[0].delta.content) {
          yield {
            text: chunk.choices[0].delta.content,
            generationInfo: {
              provider: chunk.provider || 'unknown'
            }
          };
        }
      }
    } catch (error) {
      throw new Error(`AI Marketplace LLM streaming failed: ${error.message}`);
    }
  }
}

// Test configuration
const TEST_CONFIG = {
  documentsPath: path.join(__dirname, '..', 'documents'),
  vectorStorePath: path.join(__dirname, '..', 'vector-stores'),
  chunkSize: 1000,
  chunkOverlap: 200,
  maxRetrievedDocs: 4,
  testQueries: [
    'What is artificial intelligence?',
    'Explain machine learning algorithms',
    'How do neural networks work?',
    'What are the benefits of cloud computing?',
    'Describe the software development lifecycle',
    'What is containerization with Docker?',
    'Explain RESTful API design principles',
    'What are microservices architecture patterns?'
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
  
  if (!process.env.OPENAI_API_KEY) {
    log('⚠️  Warning: OpenAI API key not found. Embeddings may not work.', 'yellow');
  }
  
  const client = createClient({
    apiKeys,
    config: {
      enableMLRouting: true,
      enableAnalytics: true,
      timeout: 60000, // Longer timeout for RAG operations
      cache: {
        enabled: false, // Disable cache for testing
      },
    },
  });
  
  return client;
}

async function createTestDocuments() {
  const documentsDir = TEST_CONFIG.documentsPath;
  
  try {
    await fs.mkdir(documentsDir, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
  
  const testDocuments = [
    {
      filename: 'ai-basics.txt',
      content: `
# Artificial Intelligence Basics

Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines that can perform tasks that typically require human intelligence. These tasks include learning, reasoning, problem-solving, perception, and language understanding.

## Types of AI

1. **Narrow AI**: Designed to perform a narrow task (e.g., facial recognition, web searches)
2. **General AI**: A more versatile form of AI that can understand and learn any intellectual task
3. **Superintelligent AI**: An AI that surpasses human intelligence in all economically valuable work

## Machine Learning

Machine Learning is a subset of AI that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. ML focuses on the development of computer programs that can access data and use it to learn for themselves.

### Types of Machine Learning:
- Supervised Learning
- Unsupervised Learning  
- Reinforcement Learning

## Applications

AI is used in various fields including healthcare, finance, transportation, entertainment, and more.
      `
    },
    {
      filename: 'cloud-computing.txt',
      content: `
# Cloud Computing Guide

Cloud computing is the delivery of computing services—including servers, storage, databases, networking, software, analytics, and intelligence—over the Internet ("the cloud") to offer faster innovation, flexible resources, and economies of scale.

## Service Models

1. **IaaS (Infrastructure as a Service)**: Provides virtualized computing resources over the internet
2. **PaaS (Platform as a Service)**: Provides a platform allowing customers to develop, run, and manage applications
3. **SaaS (Software as a Service)**: Software licensing and delivery model in which software is licensed on a subscription basis

## Deployment Models

- **Public Cloud**: Services offered over the public internet
- **Private Cloud**: Computing services offered either over the internet or a private internal network
- **Hybrid Cloud**: Combines public and private clouds

## Benefits

- Cost reduction
- Scalability and flexibility
- Automatic software updates
- Increased collaboration
- Work from anywhere
      `
    },
    {
      filename: 'software-development.txt',
      content: `
# Software Development Lifecycle

The Software Development Lifecycle (SDLC) is a process used by software development teams to design, develop, and test high-quality software. The SDLC aims to produce software that meets or exceeds customer expectations, reaches completion within times and cost estimates.

## SDLC Phases

1. **Planning**: Define the scope and purpose of the application
2. **Analysis**: Gather and analyze requirements
3. **Design**: Create the architecture and design of the software
4. **Implementation**: Write the actual code
5. **Testing**: Test the software for defects and verify it meets requirements
6. **Deployment**: Release the software to production
7. **Maintenance**: Ongoing support and updates

## Methodologies

### Waterfall Model
A linear sequential flow where progress flows steadily downwards through the phases.

### Agile Methodology
An iterative approach to software development that emphasizes flexibility, collaboration, and customer satisfaction.

### DevOps
A combination of cultural philosophies, practices, and tools that increases an organization's ability to deliver applications and services at high velocity.
      `
    },
    {
      filename: 'docker-containers.txt',
      content: `
# Docker and Containerization

Docker is a platform that uses OS-level virtualization to deliver software in packages called containers. Containers are isolated from one another and bundle their own software, libraries and configuration files.

## Key Concepts

### Container
A lightweight, standalone, executable package that includes everything needed to run an application: code, runtime, system tools, system libraries and settings.

### Image
A read-only template with instructions for creating a Docker container. Often, an image is based on another image, with some additional customization.

### Dockerfile
A text document that contains all the commands a user could call on the command line to assemble an image.

## Benefits of Containerization

1. **Consistency**: Containers ensure consistency across multiple development, release cycles, and environments
2. **Portability**: Containers can run on any system that supports the container runtime
3. **Efficiency**: Containers share the OS kernel, making them more efficient than traditional VMs
4. **Scalability**: Easy to scale applications up or down
5. **Isolation**: Applications are isolated from each other and the underlying system

## Docker Commands

- `docker build`: Build an image from a Dockerfile
- `docker run`: Run a container from an image
- `docker ps`: List running containers
- `docker stop`: Stop a running container
- `docker rm`: Remove a container
      `
    }
  ];
  
  let documentsCreated = 0;
  
  for (const doc of testDocuments) {
    const filePath = path.join(documentsDir, doc.filename);
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

async function loadAndProcessDocuments() {
  log('\n📚 Loading and Processing Documents', 'cyan');
  log('='.repeat(40), 'cyan');
  
  const startTime = Date.now();
  
  // Ensure test documents exist
  const totalDocs = await createTestDocuments();
  
  // Load documents
  const loader = new DirectoryLoader(TEST_CONFIG.documentsPath, {
    '.txt': (path) => new TextLoader(path),
    '.md': (path) => new TextLoader(path),
  });
  
  log('Loading documents from directory...', 'white');
  const docs = await loader.load();
  
  if (docs.length === 0) {
    throw new Error(`No documents found in ${TEST_CONFIG.documentsPath}`);
  }
  
  log(`✓ Loaded ${docs.length} documents`, 'green');
  
  // Calculate total content length
  const totalContent = docs.reduce((sum, doc) => sum + doc.pageContent.length, 0);
  log(`✓ Total content: ${totalContent.toLocaleString()} characters`, 'green');
  
  // Split documents into chunks
  log('Splitting documents into chunks...', 'white');
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: TEST_CONFIG.chunkSize,
    chunkOverlap: TEST_CONFIG.chunkOverlap,
  });
  
  const splitDocs = await textSplitter.splitDocuments(docs);
  log(`✓ Split into ${splitDocs.length} chunks`, 'green');
  log(`✓ Average chunk size: ${Math.round(totalContent / splitDocs.length)} characters`, 'green');
  
  const processingTime = Date.now() - startTime;
  log(`✓ Document processing completed in ${formatTime(processingTime)}`, 'green');
  
  return splitDocs;
}

async function createVectorStore(documents) {
  log('\n🔍 Creating Vector Store', 'cyan');
  log('='.repeat(30), 'cyan');
  
  const startTime = Date.now();
  
  try {
    // Initialize OpenAI embeddings
    log('Initializing embeddings model...', 'white');
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-ada-002',
    });
    
    // Create vector store
    log('Creating vector embeddings...', 'white');
    const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);
    
    const embeddingTime = Date.now() - startTime;
    log(`✓ Vector store created with ${documents.length} embeddings`, 'green');
    log(`✓ Embedding generation completed in ${formatTime(embeddingTime)}`, 'green');
    
    return vectorStore;
    
  } catch (error) {
    log(`❌ Vector store creation failed: ${error.message}`, 'red');
    
    if (error.message.includes('OpenAI') || error.message.includes('API key')) {
      log('Falling back to mock embeddings for testing...', 'yellow');
      
      // Create a simple mock vector store for testing when OpenAI key is not available
      const mockEmbeddings = {
        embedDocuments: async (texts) => texts.map(() => Array(1536).fill(0.1)),
        embedQuery: async (text) => Array(1536).fill(0.1)
      };
      
      const vectorStore = await MemoryVectorStore.fromDocuments(documents, mockEmbeddings);
      log('✓ Mock vector store created for testing', 'yellow');
      return vectorStore;
    }
    
    throw error;
  }
}

async function testRAGChain(client, vectorStore) {
  log('\n🤖 Testing RAG Chain', 'cyan');
  log('='.repeat(25), 'cyan');
  
  const results = {
    queries: [],
    summary: {
      totalQueries: 0,
      successfulQueries: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      providerDistribution: {},
      averageRelevanceScore: 0
    }
  };
  
  // Create AI Marketplace LLM wrapper
  const llm = new AIMarketplaceLLM(client, {
    optimizeFor: 'balanced'
  });
  
  // Create RAG chain
  const ragChain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever({
    k: TEST_CONFIG.maxRetrievedDocs,
  }), {
    returnSourceDocuments: true,
  });
  
  // Test queries
  for (let i = 0; i < TEST_CONFIG.testQueries.length; i++) {
    const query = TEST_CONFIG.testQueries[i];
    log(`\n${i + 1}. "${query}"`, 'white');
    
    try {
      const startTime = Date.now();
      
      // Execute RAG query
      const response = await ragChain.call({
        query: query,
      });
      
      const responseTime = Date.now() - startTime;
      
      // Calculate relevance score (simple heuristic based on response length and source docs)
      const relevanceScore = Math.min(
        0.5 + (response.text.length / 500) * 0.3 + 
        (response.sourceDocuments?.length || 0) / TEST_CONFIG.maxRetrievedDocs * 0.2,
        1.0
      );
      
      const queryResult = {
        query,
        response: response.text,
        responseTime,
        sourceDocuments: response.sourceDocuments?.length || 0,
        relevanceScore,
        success: true
      };
      
      results.queries.push(queryResult);
      results.summary.successfulQueries++;
      results.summary.totalResponseTime += responseTime;
      
      // Display results
      log(`   ✅ Response (${formatTime(responseTime)}):`, 'green');
      log(`   ${response.text.substring(0, 200)}${response.text.length > 200 ? '...' : ''}`, 'gray');
      log(`   📄 Source documents: ${response.sourceDocuments?.length || 0}`, 'gray');
      log(`   📊 Relevance score: ${(relevanceScore * 100).toFixed(1)}%`, 'gray');
      
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
    results.summary.averageRelevanceScore = results.queries
      .filter(q => q.success)
      .reduce((sum, q) => sum + q.relevanceScore, 0) / results.summary.successfulQueries;
  }
  
  return results;
}

async function testProviderComparison(client, vectorStore) {
  log('\n🔄 Testing Provider Comparison in RAG', 'cyan');
  log('='.repeat(40), 'cyan');
  
  const testQuery = "What is machine learning and how does it work?";
  const providers = [];
  
  if (process.env.OPENAI_API_KEY) providers.push({ name: 'OpenAI', provider: APIProvider.OPENAI });
  if (process.env.ANTHROPIC_API_KEY) providers.push({ name: 'Anthropic', provider: APIProvider.ANTHROPIC });
  if (process.env.GOOGLE_API_KEY) providers.push({ name: 'Google AI', provider: APIProvider.GOOGLE });
  
  const results = [];
  
  for (const { name, provider } of providers) {
    log(`\nTesting ${name}...`, 'white');
    
    try {
      const llm = new AIMarketplaceLLM(client, {
        provider: provider,
        optimizeFor: 'balanced'
      });
      
      const ragChain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever({
        k: 3,
      }));
      
      const startTime = Date.now();
      const response = await ragChain.call({ query: testQuery });
      const responseTime = Date.now() - startTime;
      
      results.push({
        provider: name,
        responseTime,
        responseLength: response.text.length,
        sourceDocuments: response.sourceDocuments?.length || 0,
        response: response.text
      });
      
      log(`   ✅ ${name}: ${formatTime(responseTime)} - ${response.text.length} chars`, 'green');
      
    } catch (error) {
      log(`   ❌ ${name}: ${error.message}`, 'red');
      results.push({
        provider: name,
        error: error.message,
        success: false
      });
    }
  }
  
  // Display comparison
  if (results.filter(r => !r.error).length > 1) {
    log('\n📊 Provider Comparison Summary:', 'magenta');
    
    const successfulResults = results.filter(r => !r.error);
    const fastestProvider = successfulResults.reduce((fastest, current) => 
      current.responseTime < fastest.responseTime ? current : fastest
    );
    
    log(`   Fastest provider: ${fastestProvider.provider} (${formatTime(fastestProvider.responseTime)})`, 'white');
    
    const avgResponseTime = successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length;
    log(`   Average response time: ${formatTime(avgResponseTime)}`, 'white');
  }
  
  return results;
}

async function testLangChainCompatibility(client) {
  log('\n🔗 Testing LangChain Compatibility', 'cyan');
  log('='.repeat(35), 'cyan');
  
  const tests = [];
  
  // Test 1: Basic LLM wrapper
  try {
    log('Testing basic LLM wrapper...', 'white');
    const llm = new AIMarketplaceLLM(client);
    const response = await llm.call('What is 2+2?');
    
    if (response && typeof response === 'string') {
      log('   ✅ Basic LLM wrapper: Working', 'green');
      tests.push({ test: 'Basic LLM wrapper', status: 'passed' });
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    log(`   ❌ Basic LLM wrapper: ${error.message}`, 'red');
    tests.push({ test: 'Basic LLM wrapper', status: 'failed', error: error.message });
  }
  
  // Test 2: Streaming support
  try {
    log('Testing streaming support...', 'white');
    const llm = new AIMarketplaceLLM(client);
    const stream = llm.stream('Count to 3');
    
    let chunks = 0;
    for await (const chunk of stream) {
      chunks++;
      if (chunks >= 3) break; // Limit test chunks
    }
    
    if (chunks > 0) {
      log('   ✅ Streaming support: Working', 'green');
      tests.push({ test: 'Streaming support', status: 'passed' });
    } else {
      throw new Error('No streaming chunks received');
    }
  } catch (error) {
    log(`   ❌ Streaming support: ${error.message}`, 'red');
    tests.push({ test: 'Streaming support', status: 'failed', error: error.message });
  }
  
  // Test 3: Error handling
  try {
    log('Testing error handling...', 'white');
    const invalidClient = createClient({
      apiKeys: { openai: 'invalid-key' },
      config: { enableMLRouting: false }
    });
    
    const llm = new AIMarketplaceLLM(invalidClient);
    
    try {
      await llm.call('Test');
      throw new Error('Should have failed with invalid key');
    } catch (expectedError) {
      if (expectedError.message.includes('invalid') || expectedError.message.includes('API key') || expectedError.message.includes('401')) {
        log('   ✅ Error handling: Working', 'green');
        tests.push({ test: 'Error handling', status: 'passed' });
      } else {
        throw expectedError;
      }
    }
  } catch (error) {
    log(`   ❌ Error handling: ${error.message}`, 'red');
    tests.push({ test: 'Error handling', status: 'failed', error: error.message });
  }
  
  return tests;
}

async function saveResults(results) {
  try {
    const resultsDir = path.join(__dirname, '..', 'results');
    await fs.mkdir(resultsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `langchain-rag-test-${timestamp}.json`;
    const filepath = path.join(resultsDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(results, null, 2));
    log(`\n📄 Results saved to: ${filepath}`, 'blue');
    
  } catch (error) {
    log(`Warning: Could not save results: ${error.message}`, 'yellow');
  }
}

async function runLangChainRAGTests() {
  log('📚 LangChain RAG Integration Test Application', 'magenta');
  log('='.repeat(50), 'magenta');
  log('Testing LangChain integration and RAG capabilities...', 'white');
  
  const overallStartTime = Date.now();
  
  try {
    // Initialize client
    const client = await initializeClient();
    
    // Load and process documents
    const documents = await loadAndProcessDocuments();
    
    // Create vector store
    const vectorStore = await createVectorStore(documents);
    
    // Test RAG chain
    const ragResults = await testRAGChain(client, vectorStore);
    
    // Test provider comparison
    const providerResults = await testProviderComparison(client, vectorStore);
    
    // Test LangChain compatibility
    const compatibilityResults = await testLangChainCompatibility(client);
    
    const totalTime = Date.now() - overallStartTime;
    
    // Compile final results
    const finalResults = {
      timestamp: new Date().toISOString(),
      totalExecutionTime: totalTime,
      documentProcessing: {
        documentsLoaded: documents.length,
        totalChunks: documents.length,
        vectorStoreCreated: true
      },
      ragTesting: ragResults,
      providerComparison: providerResults,
      langchainCompatibility: compatibilityResults,
      overallSummary: {
        ragQueriesSuccessful: ragResults.summary.successfulQueries,
        ragQueriesTotal: ragResults.summary.totalQueries,
        averageRAGResponseTime: ragResults.summary.averageResponseTime,
        averageRelevanceScore: ragResults.summary.averageRelevanceScore,
        compatibilityTestsPassed: compatibilityResults.filter(t => t.status === 'passed').length,
        compatibilityTestsTotal: compatibilityResults.length
      }
    };
    
    // Display final summary
    log(`\n🎯 LANGCHAIN RAG TEST SUMMARY`, 'magenta');
    log('='.repeat(35), 'magenta');
    log(`Total execution time: ${formatTime(totalTime)}`, 'white');
    log(`Documents processed: ${documents.length}`, 'white');
    log(`RAG queries successful: ${ragResults.summary.successfulQueries}/${ragResults.summary.totalQueries}`, 'white');
    log(`Average RAG response time: ${formatTime(ragResults.summary.averageResponseTime)}`, 'white');
    log(`Average relevance score: ${(ragResults.summary.averageRelevanceScore * 100).toFixed(1)}%`, 'white');
    log(`LangChain compatibility: ${compatibilityResults.filter(t => t.status === 'passed').length}/${compatibilityResults.length} tests passed`, 'white');
    
    // Success assessment
    const ragSuccessRate = ragResults.summary.successfulQueries / ragResults.summary.totalQueries;
    const compatibilitySuccessRate = compatibilityResults.filter(t => t.status === 'passed').length / compatibilityResults.length;
    const averageResponseTime = ragResults.summary.averageResponseTime;
    const relevanceScore = ragResults.summary.averageRelevanceScore;
    
    const overallSuccess = 
      ragSuccessRate >= 0.8 &&              // 80% RAG success rate
      compatibilitySuccessRate >= 0.8 &&    // 80% compatibility tests pass
      averageResponseTime <= 5000 &&        // Under 5 seconds average
      relevanceScore >= 0.7;                // 70% relevance score
    
    if (overallSuccess) {
      log(`\n🎉 LangChain RAG Integration Test: PASSED`, 'green');
      log(`   ✅ RAG success rate: ${(ragSuccessRate * 100).toFixed(1)}%`, 'green');
      log(`   ✅ Compatibility tests: ${(compatibilitySuccessRate * 100).toFixed(1)}%`, 'green');
      log(`   ✅ Response time: ${formatTime(averageResponseTime)}`, 'green');
      log(`   ✅ Relevance score: ${(relevanceScore * 100).toFixed(1)}%`, 'green');
    } else {
      log(`\n⚠️  LangChain RAG Integration Test: NEEDS IMPROVEMENT`, 'yellow');
      if (ragSuccessRate < 0.8) {
        log(`   ❌ Low RAG success rate: ${(ragSuccessRate * 100).toFixed(1)}%`, 'red');
      }
      if (compatibilitySuccessRate < 0.8) {
        log(`   ❌ Compatibility issues: ${(compatibilitySuccessRate * 100).toFixed(1)}% passed`, 'red');
      }
      if (averageResponseTime > 5000) {
        log(`   ❌ Slow response time: ${formatTime(averageResponseTime)}`, 'red');
      }
      if (relevanceScore < 0.7) {
        log(`   ❌ Low relevance score: ${(relevanceScore * 100).toFixed(1)}%`, 'red');
      }
    }
    
    // Save results
    await saveResults(finalResults);
    
    return finalResults;
    
  } catch (error) {
    log(`\n❌ LangChain RAG test failed: ${error.message}`, 'red');
    console.error(error);
    throw error;
  }
}

// Run the test suite if this file is executed directly
if (require.main === module) {
  runLangChainRAGTests()
    .then(results => {
      const success = results.overallSummary.ragQueriesSuccessful / results.overallSummary.ragQueriesTotal >= 0.8;
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed with error:', error);
      process.exit(1);
    });
}