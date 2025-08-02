# LlamaIndex Knowledge Base Test Application

This test application validates the integration of the AI Marketplace SDK with LlamaIndex framework, testing knowledge base construction, querying, and advanced RAG capabilities with multiple data sources.

## Purpose

- **LlamaIndex Framework Integration**: Tests seamless integration with LlamaIndex
- **Knowledge Base Construction**: Validates document ingestion and indexing
- **Advanced RAG Capabilities**: Tests sophisticated retrieval and generation patterns
- **Multi-Source Data Handling**: Validates handling different document types and sources
- **Query Engine Testing**: Tests various query engines and retrieval strategies

## Features Tested

- ✅ LlamaIndex integration with AI Marketplace SDK
- ✅ Custom LLM integration for LlamaIndex
- ✅ Document loading from multiple sources
- ✅ Index construction and persistence
- ✅ Query engine creation and optimization
- ✅ Multi-document reasoning
- ✅ Metadata filtering and retrieval
- ✅ Advanced query types (summarization, comparison, analysis)

## LlamaIndex Architecture

```
Data Sources -> Document Loading -> Node Parsing -> Index Construction
                                                         ↓
User Query -> Query Engine -> Retrieval + Synthesis -> AI Provider -> Response
```

### Components

1. **Document Loaders**: Handle PDF, TXT, JSON, CSV, and web sources
2. **Node Parser**: Splits documents into nodes with metadata
3. **Index Construction**: Creates vector, tree, or graph indices
4. **Query Engine**: Processes queries with various strategies
5. **AI Marketplace LLM**: Custom LlamaIndex LLM integration
6. **Response Synthesis**: Combines retrieved information into responses

## Prerequisites

Before running this test application, ensure you have:

1. **API Keys**: At least one of the following:
   - OpenAI API Key (`OPENAI_API_KEY`) - Required for embeddings
   - Anthropic API Key (`ANTHROPIC_API_KEY`)
   - Google AI API Key (`GOOGLE_API_KEY`)

2. **Dependencies**: LlamaIndex and related packages:
   ```bash
   npm install
   ```

3. **Test Data**: Sample documents and structured data included

4. **Environment Setup**: Create a `.env` file:
   ```bash
   OPENAI_API_KEY=your_openai_key_here
   ANTHROPIC_API_KEY=your_anthropic_key_here
   GOOGLE_API_KEY=your_google_key_here
   ```

## Running the Tests

### Full Knowledge Base Test
```bash
npm start
```

Runs comprehensive knowledge base tests including indexing, querying, and analysis.

### Interactive Knowledge Assistant
```bash
npm run interactive
```

Interactive assistant for querying the knowledge base with natural language.

### Index Construction Test
```bash
npm run build-index
```

Tests index construction from various data sources with different strategies.

### Advanced Query Testing
```bash
npm run advanced-queries
```

Tests complex queries including summarization, comparison, and multi-hop reasoning.

### Performance Benchmarks
```bash
npm run benchmark
```

Benchmarks query performance across different index types and providers.

## Expected Results

### Successful Knowledge Base Implementation
```
🧠 LlamaIndex Knowledge Base Test Results
==========================================

📚 Document Processing
✅ Loaded 12 documents (25,847 characters)
✅ Parsed into 89 nodes (avg: 290 chars/node)
✅ Created vector index with 89 embeddings
✅ Built tree index with 3 levels
✅ Constructed graph index with 45 relationships

🔍 Query Engine Testing
✅ Simple Query: "What is machine learning?"
   Engine: vector_store_query
   Provider: openai
   Response time: 0.8s
   Nodes retrieved: 3
   Confidence: 0.91

✅ Complex Query: "Compare supervised vs unsupervised learning"
   Engine: tree_summarize
   Provider: anthropic (ML-selected)
   Response time: 1.4s
   Nodes retrieved: 6
   Confidence: 0.87

✅ Multi-hop Query: "How do neural networks relate to deep learning applications?"
   Engine: graph_rag
   Provider: google
   Response time: 2.1s
   Nodes retrieved: 8
   Reasoning hops: 3
   Confidence: 0.93

📊 Knowledge Base Performance:
   Average query response time: 1.2s
   Average retrieval accuracy: 89%
   Average confidence score: 0.90
   Provider distribution: openai (45%), anthropic (30%), google (25%)

🧪 Advanced Features Testing
✅ Metadata filtering: Working
✅ Semantic search: Accurate
✅ Document summarization: Comprehensive
✅ Multi-document synthesis: Coherent
✅ Citation tracking: Functional

🎯 LlamaIndex Integration
✅ Custom LLM wrapper: Compatible
✅ Index persistence: Working
✅ Query optimization: Effective
✅ Memory management: Efficient
✅ Streaming support: Functional
```

### Performance Benchmarks
- **Index Construction**: < 2 minutes for 100 documents
- **Query Response**: < 3s average for complex queries
- **Retrieval Accuracy**: > 85% relevant document retrieval
- **Memory Usage**: Efficient memory management for large indices

## Test Cases Covered

### 1. Document Processing
- [x] PDF document parsing
- [x] Text document processing
- [x] JSON structured data handling
- [x] CSV data processing
- [x] Web page scraping
- [x] Metadata extraction

### 2. Index Construction
- [x] Vector index creation
- [x] Tree index building
- [x] Graph index construction
- [x] Composite index setup
- [x] Index persistence
- [x] Index loading

### 3. Query Engines
- [x] Vector store query engine
- [x] Tree summarize engine
- [x] Graph RAG engine
- [x] Compose query engine
- [x] Multi-step query engine
- [x] Custom query engine

### 4. Advanced Querying
- [x] Semantic similarity search
- [x] Metadata filtering
- [x] Multi-document reasoning
- [x] Summarization queries
- [x] Comparison queries
- [x] Analytical queries

### 5. Integration Features
- [x] Provider selection in LlamaIndex
- [x] Streaming responses
- [x] Error handling
- [x] Memory management
- [x] Performance optimization
- [x] Citation and source tracking

## Implementation Details

### Custom LlamaIndex LLM Integration
```javascript
class AIMarketplaceLlamaIndexLLM extends BaseLLM {
  constructor(client, options = {}) {
    super();
    this.client = client;
    this.options = options;
  }

  async complete(prompt, options = {}) {
    const response = await this.client.chat({
      messages: [{ role: 'user', content: prompt }],
    }, {
      optimizeFor: this.options.optimizeFor || 'balanced',
      ...options
    });
    
    return new CompletionResponse({
      text: response.choices[0].message.content,
      metadata: {
        provider: response.provider,
        cost: response.usage.cost,
        tokens: response.usage.totalTokens
      }
    });
  }
}
```

### Knowledge Base Setup
```javascript
// Create documents and nodes
const documents = await loadDocuments('./data/');
const nodes = await nodeParser.getNodesFromDocuments(documents);

// Build indices
const vectorIndex = await VectorStoreIndex.fromNodes(nodes, {
  embedModel: new OpenAIEmbedding(),
  llm: new AIMarketplaceLlamaIndexLLM(client)
});

// Create query engine
const queryEngine = vectorIndex.asQueryEngine({
  retriever: vectorIndex.asRetriever({ topK: 5 }),
  responseSynthesizer: new CompactAndRefine({
    llm: new AIMarketplaceLlamaIndexLLM(client, { optimizeFor: 'quality' })
  })
});
```

### Advanced Query Processing
```javascript
// Multi-step reasoning query
const multiStepQuery = new MultiStepQueryEngine({
  queryEngine,
  queryTransform: new HyDEQueryTransform({
    llm: new AIMarketplaceLlamaIndexLLM(client)
  }),
  stepwiseQueryTransform: new StepwiseQueryTransform({
    llm: new AIMarketplaceLlamaIndexLLM(client, { optimizeFor: 'quality' })
  })
});

const response = await multiStepQuery.query(
  "How do machine learning algorithms compare in terms of accuracy and computational efficiency?"
);
```

## Files Structure

```
04-llamaindex-knowledge-base/
├── README.md                    # This file
├── package.json                # Dependencies and scripts
├── .env.example                # Environment variables template
├── src/
│   ├── index.js                # Main knowledge base test
│   ├── knowledge-assistant.js  # Interactive assistant
│   ├── llm-integration.js      # LlamaIndex LLM wrapper
│   ├── index-builder.js        # Index construction utilities
│   ├── query-engines.js        # Custom query engines
│   └── data-loaders.js         # Document loading utilities
├── data/                       # Test data sources
│   ├── documents/              # Text documents
│   ├── structured/             # JSON/CSV data
│   └── web-sources/            # Web content
├── indices/                    # Persisted indices
└── results/                    # Test results and reports
```

## Real-World Use Cases

### 1. Technical Documentation System
```javascript
const techKB = new TechnicalKnowledgeBase({
  sources: ['./docs/**/*.md', './api/**/*.json'],
  aiClient: client,
  indexType: 'vector_tree_composite',
  optimizeFor: 'quality'
});

const answer = await techKB.query(
  "How do I implement rate limiting in the API?",
  { includeCodeExamples: true }
);
```

### 2. Research Paper Analysis
```javascript
const researchKB = new ResearchKnowledgeBase({
  papers: './papers/**/*.pdf',
  aiClient: client,
  indexType: 'graph_enhanced',
  analysisDepth: 'comprehensive'
});

const insights = await researchKB.synthesize([
  "What are the current trends in transformer architectures?",
  "How do these trends compare to previous approaches?",
  "What are the implications for future research?"
]);
```

### 3. Customer Support Knowledge Base
```javascript
const supportKB = new SupportKnowledgeBase({
  sources: {
    faqs: './support/faqs.json',
    manuals: './support/manuals/*.pdf',
    tickets: './support/resolved-tickets.csv'
  },
  aiClient: client,
  optimizeFor: 'speed',
  autoUpdate: true
});

const solution = await supportKB.findSolution(
  "Customer reports slow performance after recent update",
  { priority: 'high', includeSteps: true }
);
```

## Success Criteria

This test application passes when:

1. **Index Construction Works**: Successfully builds indices from multiple data sources
2. **Query Engines Function**: All query engine types work correctly
3. **LlamaIndex Integration**: Seamless integration with all LlamaIndex components
4. **Advanced Features Work**: Metadata filtering, multi-hop reasoning, and synthesis
5. **Performance Acceptable**: Query responses under 5 seconds for complex queries
6. **Accuracy High**: >80% relevant information retrieval and synthesis

## Troubleshooting

### Common Issues

**Issue: "Index construction fails"**
- Check document formats and encoding
- Verify embedding model compatibility
- Ensure sufficient memory for large document sets

**Issue: "Query engine errors"**
- Validate index integrity
- Check LLM integration configuration
- Review query complexity and structure

**Issue: "Poor retrieval accuracy"**
- Adjust chunk sizes and overlap
- Tune similarity thresholds
- Review metadata filtering logic

**Issue: "Slow query performance"**
- Optimize index configuration
- Adjust retrieval parameters
- Consider index type selection

### Debug Mode

Enable detailed logging:
```bash
DEBUG=true npm start
```

Shows:
- Index construction progress
- Query processing steps
- Retrieval and ranking details
- LLM integration calls
- Performance metrics

## Next Steps

After this test passes:
1. Proceed to [Production API Service](../05-production-api-service/)
2. Document framework integration best practices
3. Create LlamaIndex integration guide
4. Optimize knowledge base performance patterns