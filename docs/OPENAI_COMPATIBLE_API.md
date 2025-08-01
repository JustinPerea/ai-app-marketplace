# OpenAI-Compatible API Documentation

*Phase 2 Implementation: API Compatibility & Market Expansion*

## Overview

The AI Marketplace Platform now provides a **100% OpenAI-compatible REST API** that allows developers to use our multi-provider AI orchestration as a drop-in replacement for OpenAI's API. This means you can:

- **Zero-code migration** from OpenAI to our platform
- **Multi-provider routing** with cost optimization
- **Streaming support** for real-time responses
- **Enterprise features** with centralized billing

## Base URL

```
https://your-domain.com/api/v1
```

For local development:
```
http://localhost:3000/api/v1
```

## Authentication

The API supports multiple authentication methods:

### Method 1: Authorization Header (OpenAI Standard)
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://your-domain.com/api/v1/chat/completions
```

### Method 2: Provider-Specific Headers
```bash
# OpenAI
curl -H "x-openai-key: YOUR_OPENAI_KEY" \
  https://your-domain.com/api/v1/chat/completions

# Anthropic Claude  
curl -H "x-anthropic-key: YOUR_ANTHROPIC_KEY" \
  https://your-domain.com/api/v1/chat/completions

# Google AI
curl -H "x-google-key: YOUR_GOOGLE_KEY" \
  https://your-domain.com/api/v1/chat/completions
```

## Supported Endpoints

### 1. Chat Completions

**Endpoint:** `POST /v1/chat/completions`

**OpenAI Compatibility:** 100% compatible with OpenAI's chat completions API

```javascript
const response = await fetch('https://your-domain.com/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello, how are you?' }
    ],
    max_tokens: 1000,
    temperature: 0.7
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

### 2. Streaming Chat Completions

**Endpoint:** `POST /v1/chat/completions` (with `stream: true`)

**Server-Sent Events (SSE) Support:** Full streaming compatibility

```javascript
const response = await fetch('https://your-domain.com/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'user', content: 'Write a short story about AI.' }
    ],
    stream: true,
    max_tokens: 1000
  })
});

// Handle streaming response
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n').filter(line => line.trim() !== '');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') return;
      
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices[0]?.delta?.content || '';
        if (content) {
          process.stdout.write(content); // Stream to console
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }
}
```

### 3. Models List

**Endpoint:** `GET /v1/models`

**Lists all available models** across providers

```javascript
const response = await fetch('https://your-domain.com/api/v1/models');
const data = await response.json();

console.log('Available models:');
data.data.forEach(model => {
  console.log(`- ${model.id} (${model.owned_by})`);
});
```

## Multi-Provider Model Routing

Our API automatically routes requests to the appropriate provider based on the model name:

### OpenAI Models
- `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-4`, `gpt-3.5-turbo`
- Routes to: OpenAI API
- Requires: `x-openai-key` header or OpenAI API key in Authorization header

### Anthropic Claude Models  
- `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`, `claude-3-opus-20240229`
- Routes to: Anthropic API
- Requires: `x-anthropic-key` header

### Google AI Models
- `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-pro`
- Routes to: Google Generative AI API
- Requires: `x-google-key` header

### Local/Ollama Models
- `llama3.2:3b`, `llama3.2:1b`, `mistral:7b`, `codellama:7b`
- Routes to: Local Ollama instance
- Requires: Ollama running on localhost:11434

## Drop-in Replacement Examples

### OpenAI Python SDK
```python
# Before (OpenAI)
from openai import OpenAI
client = OpenAI(api_key="your-openai-key")

# After (AI Marketplace Platform)
from openai import OpenAI
client = OpenAI(
    api_key="your-api-key",
    base_url="https://your-domain.com/api/v1"
)

# Same code works!
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)
```

### Node.js with OpenAI SDK
```javascript
// Before (OpenAI)
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: 'your-openai-key' });

// After (AI Marketplace Platform)
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: 'your-api-key',
  baseURL: 'https://your-domain.com/api/v1'
});

// Same code works!
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

### cURL Examples
```bash
# OpenAI model via our API
curl https://your-domain.com/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "x-openai-key: YOUR_OPENAI_KEY" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Claude model via our API
curl https://your-domain.com/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "x-anthropic-key: YOUR_ANTHROPIC_KEY" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Gemini model via our API
curl https://your-domain.com/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "x-google-key: YOUR_GOOGLE_KEY" \
  -d '{
    "model": "gemini-1.5-pro",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Local Ollama model
curl https://your-domain.com/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2:3b",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Advanced Features

### Cost Optimization
Our API automatically selects the most cost-effective model for your requirements while maintaining quality:

```javascript
// The API will automatically route to the best cost/performance model
const response = await fetch('https://your-domain.com/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-cost-optimization': 'enabled', // Future feature
    'x-max-cost': '0.01', // Maximum cost per request
  },
  body: JSON.stringify({
    model: 'auto', // Let our system choose the best model
    messages: [{ role: 'user', content: 'Summarize this text...' }]
  })
});
```

### Multi-Provider Fallback
If one provider is down, requests automatically failover to backup providers:

```javascript
const response = await fetch('https://your-domain.com/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-fallback-enabled': 'true', // Future feature
    'x-openai-key': 'key1',
    'x-anthropic-key': 'key2',
    'x-google-key': 'key3'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});
```

## Error Handling

Our API returns OpenAI-compatible error responses:

```json
{
  "error": {
    "message": "Invalid API key provided",
    "type": "invalid_request_error",
    "param": null,
    "code": "invalid_api_key"
  }
}
```

Common error types:
- `invalid_request_error`: Invalid request parameters
- `invalid_api_key`: Authentication failed
- `rate_limit_exceeded`: Too many requests
- `api_error`: Server-side error
- `model_not_found`: Requested model not available

## Rate Limits and Usage

### Development Environment
- **No rate limits** for development and testing
- **All models available** (subject to provider availability)
- **Free tier usage** for evaluation

### Production Environment
- **Enterprise-grade rate limiting** based on your plan
- **Usage analytics** and cost tracking
- **Team management** and access controls

## Migration Guide

### From OpenAI API
1. **Change the base URL** from `https://api.openai.com/v1` to `https://your-domain.com/api/v1`
2. **Keep the same API key** or use provider-specific headers
3. **No code changes required** - 100% compatible

### From Other Providers
1. **Use our unified endpoint** instead of provider-specific endpoints
2. **Specify the model name** - we handle provider routing
3. **Benefit from automatic fallback** and cost optimization

## SDK Integration Examples

### Langchain
```python
from langchain.llms import OpenAI

# Use our API as OpenAI replacement
llm = OpenAI(
    openai_api_base="https://your-domain.com/api/v1",
    openai_api_key="your-api-key",
    model_name="gpt-4o"
)

response = llm("Tell me a joke")
```

### LlamaIndex
```python
from llama_index.llms import OpenAI

llm = OpenAI(
    api_base="https://your-domain.com/api/v1",
    api_key="your-api-key", 
    model="gpt-4o"
)
```

## Testing the API

### Health Check
```bash
curl https://your-domain.com/api/v1/models
```

### Simple Test Request
```bash
curl https://your-domain.com/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-key" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Say hello"}],
    "max_tokens": 50
  }'
```

## Support and Documentation

- **API Reference:** [https://docs.aimarketplace.dev/api](https://docs.aimarketplace.dev/api)
- **Developer Portal:** [https://your-domain.com/developers](https://your-domain.com/developers)
- **GitHub Examples:** [https://github.com/ai-marketplace/examples](https://github.com/ai-marketplace/examples)
- **Discord Community:** [https://discord.gg/ai-marketplace](https://discord.gg/ai-marketplace)

## Changelog

### Phase 2.1 - OpenAI Compatibility (Current)
- ✅ **Full OpenAI API compatibility** for chat completions
- ✅ **Multi-provider routing** based on model names
- ✅ **Server-Sent Events streaming** support
- ✅ **Model discovery** via `/v1/models` endpoint
- ✅ **Error handling** with OpenAI-compatible responses

### Phase 2.2 - Coming Soon
- 🔄 **Function calling** support across all providers
- 🔄 **Image input** support for vision models
- 🔄 **Embeddings endpoint** for vector operations
- 🔄 **Cost optimization** with automatic model selection
- 🔄 **Usage analytics** and billing integration

---

**Ready to migrate?** Start with a simple test request and experience the power of multi-provider AI orchestration with zero-code migration!