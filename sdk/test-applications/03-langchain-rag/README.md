# LangChain RAG Application Test

This test application validates the integration of the AI Marketplace SDK with LangChain framework, specifically testing Retrieval-Augmented Generation (RAG) capabilities and framework compatibility.

## Purpose

- **Framework Integration**: Tests seamless integration with LangChain framework
- **RAG Implementation**: Validates RAG capabilities using multiple AI providers
- **Document Processing**: Tests document ingestion, embedding, and retrieval
- **Provider Compatibility**: Ensures all providers work within LangChain context
- **Performance Validation**: Measures performance in real-world RAG scenarios

## Features Tested

- ✅ LangChain integration with AI Marketplace SDK
- ✅ Custom LLM wrapper implementation
- ✅ Document loading and text splitting
- ✅ Vector store creation and similarity search
- ✅ RAG chain construction and execution
- ✅ Multi-provider support within LangChain
- ✅ Streaming support in LangChain context
- ✅ Error handling and fallback mechanisms

## RAG Architecture

```
Documents -> Text Splitter -> Embeddings -> Vector Store
                                               ↓
User Query -> Retriever -> Context + Query -> AI Provider -> Response
```

### Components

1. **Document Loader**: Loads various document formats (PDF, TXT, MD)
2. **Text Splitter**: Splits documents into manageable chunks
3. **Embeddings**: Creates vector embeddings (using OpenAI embeddings)
4. **Vector Store**: Stores and retrieves document chunks (using Chroma)
5. **AI Marketplace LLM**: Custom LangChain LLM wrapper
6. **RAG Chain**: Combines retrieval and generation

## Prerequisites

Before running this test application, ensure you have:

1. **API Keys**: At least one of the following:
   - OpenAI API Key (`OPENAI_API_KEY`) - Required for embeddings
   - Anthropic API Key (`ANTHROPIC_API_KEY`)
   - Google AI API Key (`GOOGLE_API_KEY`)

2. **Dependencies**: LangChain and related packages:
   ```bash
   npm install
   ```

3. **Test Documents**: Sample documents are included in `./documents/` directory

4. **Environment Setup**: Create a `.env` file:
   ```bash
   OPENAI_API_KEY=your_openai_key_here
   ANTHROPIC_API_KEY=your_anthropic_key_here
   GOOGLE_API_KEY=your_google_key_here
   ```

## Running the Tests

### Full RAG Integration Test
```bash
npm start
```

Runs comprehensive RAG tests including document ingestion, vector store creation, and query processing.

### Interactive RAG Assistant
```bash
npm run interactive
```

Interactive RAG system where you can ask questions about the loaded documents.

### Document Processing Test
```bash
npm run process-docs
```

Tests document loading, splitting, and embedding creation.

### Provider Comparison in RAG
```bash
npm run compare-providers
```

Compares different AI providers' performance in RAG scenarios.

### LangChain Compatibility Test
```bash
npm run langchain-compat
```

Tests various LangChain components and chains with the SDK.

## Expected Results

### Successful RAG Implementation
```
📚 LangChain RAG Application Test Results
=========================================

🔄 Document Processing
✅ Loaded 5 documents (15,234 characters)
✅ Split into 47 chunks (average: 324 chars/chunk)
✅ Created embeddings for all chunks
✅ Built vector store with 47 vectors

🔍 RAG Query Testing
✅ Query 1: "What is machine learning?"
   Provider: openai
   Retrieved chunks: 3
   Response time: 1.2s
   Relevance score: 0.89
   Response: "Machine learning is a subset of artificial intelligence..."

✅ Query 2: "Explain neural networks"
   Provider: anthropic (ML-selected)
   Retrieved chunks: 4
   Response time: 0.9s  
   Relevance score: 0.92
   Response: "Neural networks are computational models inspired by..."

📊 RAG Performance Summary:
   Average response time: 1.05s
   Average relevance score: 0.905
   Context retrieval accuracy: 94%
   Provider distribution: openai (40%), anthropic (35%), google (25%)

🧪 LangChain Integration Tests
✅ Custom LLM wrapper: Working
✅ Chain construction: Successful
✅ Streaming support: Functional
✅ Error handling: Robust
✅ Memory integration: Compatible

🎯 Framework Compatibility
✅ LangChain core: Compatible
✅ Document loaders: Working
✅ Text splitters: Functional
✅ Vector stores: Integrated
✅ Embeddings: Compatible
✅ Chains: Functional
```

### Performance Benchmarks
- **Document Processing**: < 30s for 50 documents
- **Query Response**: < 2s average response time
- **Retrieval Accuracy**: > 90% relevant context retrieval
- **Provider Selection**: Effective ML routing in RAG context

## Test Cases Covered

### 1. Document Processing
- [x] PDF document loading
- [x] Text document loading
- [x] Markdown document loading
- [x] Text chunking with overlap
- [x] Embedding generation
- [x] Vector store creation

### 2. RAG Functionality
- [x] Similarity search
- [x] Context retrieval
- [x] Query augmentation
- [x] Response generation
- [x] Relevance scoring
- [x] Multi-document queries

### 3. LangChain Integration
- [x] Custom LLM wrapper
- [x] Chain composition
- [x] Memory integration
- [x] Streaming support
- [x] Error handling
- [x] Prompt templates

### 4. Provider Testing
- [x] OpenAI in RAG context
- [x] Anthropic in RAG context
- [x] Google AI in RAG context
- [x] ML routing effectiveness
- [x] Fallback mechanisms
- [x] Cost optimization

### 5. Real-World Scenarios
- [x] Technical documentation Q&A
- [x] Research paper analysis
- [x] Code documentation queries
- [x] Multi-topic knowledge base
- [x] Long-form document processing

## Implementation Details

### Custom LLM Wrapper
```javascript
class AIMarketplaceLLM extends LLM {
  constructor(client, options = {}) {
    super();
    this.client = client;
    this.options = options;
  }

  async _call(prompt, options) {
    const response = await this.client.chat({
      messages: [{ role: 'user', content: prompt }],
    }, {
      optimizeFor: this.options.optimizeFor || 'balanced',
      ...options
    });
    
    return response.choices[0].message.content;
  }
}
```

### RAG Chain Setup
```javascript
const rag = new RetrievalQAChain({
  llm: new AIMarketplaceLLM(client),
  retriever: vectorStore.asRetriever(),
  returnSourceDocuments: true,
  chainType: 'stuff'
});
```

### Document Processing Pipeline
```javascript
// Load documents
const loader = new DirectoryLoader('./documents/', {
  '.pdf': (path) => new PDFLoader(path),
  '.txt': (path) => new TextLoader(path),
  '.md': (path) => new TextLoader(path),
});

// Split text
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

// Create embeddings and vector store
const embeddings = new OpenAIEmbeddings();
const vectorStore = await Chroma.fromDocuments(docs, embeddings);
```

## Files Structure

```
03-langchain-rag/
├── README.md                    # This file
├── package.json                # Dependencies and scripts
├── .env.example                # Environment variables template
├── src/
│   ├── index.js                # Main RAG test application
│   ├── rag-assistant.js        # Interactive RAG assistant
│   ├── llm-wrapper.js          # Custom LangChain LLM wrapper
│   ├── document-processor.js   # Document processing utilities
│   ├── vector-store.js         # Vector store management
│   └── chains/                 # Custom LangChain chains
│       ├── rag-chain.js
│       ├── qa-chain.js
│       └── summarization-chain.js
├── documents/                  # Test documents
│   ├── ai-guide.md
│   ├── tech-specs.pdf
│   ├── api-docs.txt
│   └── research-papers/
├── vector-stores/              # Generated vector stores
└── results/                    # Test results and reports
```

## Real-World Use Cases

### 1. Technical Documentation Assistant
```javascript
const techDocsRAG = new TechnicalDocsRAG({
  documents: './docs/**/*.md',
  aiClient: client,
  optimizeFor: 'quality'
});

const answer = await techDocsRAG.query(
  "How do I implement authentication in the API?"
);
```

### 2. Research Paper Analysis
```javascript
const researchRAG = new ResearchRAG({
  papers: './papers/**/*.pdf',
  aiClient: client,
  optimizeFor: 'balanced'
});

const insights = await researchRAG.analyze(
  "What are the latest developments in transformer architectures?"
);
```

### 3. Customer Support Knowledge Base
```javascript
const supportRAG = new SupportRAG({
  knowledgeBase: './kb/**/*',
  aiClient: client,
  optimizeFor: 'cost'
});

const solution = await supportRAG.findSolution(
  "Customer can't login to their account"
);
```

## Success Criteria

This test application passes when:

1. **Document Processing Works**: Successfully loads, splits, and embeds documents
2. **RAG Chain Functions**: Retrieves relevant context and generates accurate responses
3. **LangChain Integration**: All LangChain components work with the SDK
4. **Provider Compatibility**: All AI providers function within LangChain context
5. **Performance Acceptable**: Response times under 3 seconds for typical queries
6. **Accuracy High**: >85% relevance in retrieved context and responses

## Troubleshooting

### Common Issues

**Issue: "Embedding generation failed"**
- Ensure OpenAI API key is valid (required for embeddings)
- Check document format compatibility
- Verify text chunk sizes are reasonable

**Issue: "Vector store creation error"**
- Install required vector store dependencies (chroma-db)
- Check disk space for vector store files
- Ensure proper permissions for data directory

**Issue: "RAG responses irrelevant"**
- Review document chunking strategy
- Adjust similarity search parameters
- Check embedding model compatibility

**Issue: "LangChain compatibility errors"**
- Verify LangChain version compatibility
- Check custom wrapper implementation
- Review chain configuration

### Debug Mode

Enable detailed logging:
```bash
DEBUG=true npm start
```

Shows:
- Document processing steps
- Embedding generation progress
- Vector store operations
- Query processing details
- Provider selection reasoning

## Next Steps

After this test passes:
1. Proceed to [LlamaIndex Knowledge Base](../04-llamaindex-knowledge-base/)
2. Document framework integration patterns
3. Create integration guides for other frameworks
4. Optimize RAG performance based on findings