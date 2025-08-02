# Framework Integration Guides

This directory contains comprehensive guides for integrating the AI Marketplace SDK with popular frameworks and libraries.

## Available Integrations

### Web Frameworks
- [Express.js](./express.md) - Building REST APIs with Express.js
- [Next.js](./nextjs.md) - Full-stack React applications with Next.js
- [FastAPI](./fastapi.md) - Python web framework (using HTTP requests)

### AI/ML Frameworks
- [LangChain](./langchain.md) - Advanced RAG and agent frameworks
- [LlamaIndex](./llamaindex.md) - Data framework for LLM applications
- [Vercel AI SDK](./vercel-ai.md) - Building AI applications with Vercel

### Frontend Frameworks
- [React](./react.md) - Building interactive AI interfaces
- [Vue.js](./vue.md) - Progressive AI-powered web applications
- [Svelte](./svelte.md) - Lightweight AI applications

### Backend Services
- [Node.js](./nodejs.md) - Server-side JavaScript applications
- [Serverless Functions](./serverless.md) - AWS Lambda, Vercel Functions, etc.
- [Docker](./docker.md) - Containerized AI applications

### Chat Interfaces
- [Discord Bot](./discord.md) - Building AI-powered Discord bots
- [Slack Bot](./slack.md) - Creating intelligent Slack applications
- [Telegram Bot](./telegram.md) - Developing Telegram chatbots

### Database Integration
- [Vector Databases](./vector-databases.md) - Integration with Pinecone, Weaviate, etc.
- [Traditional Databases](./databases.md) - PostgreSQL, MongoDB, etc.

## Getting Started

Each integration guide includes:

1. **Setup Instructions** - Step-by-step setup process
2. **Code Examples** - Working examples with best practices
3. **Configuration** - Framework-specific configuration options
4. **Best Practices** - Performance and security recommendations
5. **Common Issues** - Troubleshooting guide
6. **Advanced Usage** - Complex integration patterns

## Quick Start Template

Here's a basic template for integrating the SDK with any framework:

```typescript
import { createClient, APIProvider } from '@ai-marketplace/sdk';

// Initialize the client
const aiClient = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
  },
  config: {
    enableMLRouting: true,
    enableAnalytics: true,
  },
});

// Basic usage in any framework
async function handleAIRequest(userMessage) {
  try {
    const response = await aiClient.chat({
      messages: [
        { role: 'user', content: userMessage }
      ],
    }, {
      optimizeFor: 'balanced',
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI request failed:', error);
    throw error;
  }
}
```

## Integration Patterns

### Request/Response Pattern
Most suitable for traditional web applications and APIs:

```typescript
// HTTP endpoint handler
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const response = await aiClient.chat({
    messages: [{ role: 'user', content: message }],
  });
  res.json({ response: response.choices[0].message.content });
});
```

### Streaming Pattern
Best for real-time applications and better user experience:

```typescript
// Streaming endpoint
app.post('/api/chat/stream', async (req, res) => {
  const { message } = req.body;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  
  const stream = aiClient.chatStream({
    messages: [{ role: 'user', content: message }],
  });
  
  for await (const chunk of stream) {
    if (chunk.choices[0].delta.content) {
      res.write(`data: ${chunk.choices[0].delta.content}\n\n`);
    }
  }
  
  res.end();
});
```

### Middleware Pattern
For frameworks that support middleware:

```typescript
function aiMiddleware(client) {
  return async (req, res, next) => {
    req.ai = {
      chat: async (messages, options) => {
        return await client.chat({ messages }, options);
      },
      stream: (messages, options) => {
        return client.chatStream({ messages }, options);
      },
    };
    next();
  };
}

app.use(aiMiddleware(aiClient));
```

## Environment Configuration

All integrations should use environment variables for configuration:

```bash
# .env file
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key

# Optional configuration
AI_ENABLE_ML_ROUTING=true
AI_DEFAULT_PROVIDER=openai
AI_CACHE_ENABLED=true
AI_CACHE_TTL=300
```

## Error Handling

Implement consistent error handling across all integrations:

```typescript
import { AIError } from '@ai-marketplace/sdk';

function handleAIError(error, req, res, next) {
  if (error instanceof AIError) {
    const statusCode = getStatusCodeForAIError(error);
    res.status(statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        type: error.type,
        retryable: error.retryable,
      },
    });
  } else {
    next(error);
  }
}

function getStatusCodeForAIError(error) {
  switch (error.type) {
    case 'authentication': return 401;
    case 'rate_limit': return 429;
    case 'invalid_request': return 400;
    case 'server_error': return 502;
    default: return 500;
  }
}
```

## Contributing

To contribute a new integration guide:

1. Create a new file in the `/integrations` directory
2. Follow the template structure used in existing guides
3. Include working examples and test them thoroughly
4. Update this README to include your integration
5. Submit a pull request

## Support

For integration-specific questions:
- Check the individual integration guides
- Review the [API Reference](../api-reference.md)
- See [Best Practices](../best-practices.md)
- Check [Troubleshooting Guide](../troubleshooting.md)