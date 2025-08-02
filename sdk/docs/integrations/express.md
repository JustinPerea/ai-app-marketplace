# Express.js Integration Guide

This guide shows how to integrate the AI Marketplace SDK with Express.js to build powerful AI-powered REST APIs.

## Table of Contents

1. [Setup](#setup)
2. [Basic Integration](#basic-integration)
3. [Advanced Features](#advanced-features)
4. [Middleware](#middleware)
5. [Error Handling](#error-handling)
6. [Production Configuration](#production-configuration)
7. [Examples](#examples)

## Setup

### Install Dependencies

```bash
npm install express @ai-marketplace/sdk
npm install --save-dev @types/express  # If using TypeScript
```

### Basic Project Structure

```
project/
├── src/
│   ├── routes/
│   │   └── ai.js
│   ├── middleware/
│   │   ├── ai.js
│   │   └── error.js
│   ├── config/
│   │   └── ai.js
│   └── app.js
├── .env
└── package.json
```

## Basic Integration

### Configure the AI Client

```javascript
// src/config/ai.js
const { createClient, APIProvider } = require('@ai-marketplace/sdk');

const aiClient = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
  },
  config: {
    enableMLRouting: true,
    enableAnalytics: true,
    timeout: 30000,
    cache: {
      enabled: process.env.NODE_ENV === 'production',
      ttlSeconds: 300,
      maxSize: 1000,
    },
    router: {
      fallbackEnabled: true,
      maxRetries: 3,
    },
  },
});

module.exports = aiClient;
```

### Basic Express App

```javascript
// src/app.js
const express = require('express');
const aiClient = require('./config/ai');
const { AIError } = require('@ai-marketplace/sdk');

const app = express();
app.use(express.json());

// Basic chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await aiClient.chat({
      messages: [
        { role: 'user', content: message }
      ],
    }, {
      userId: userId || `user_${Date.now()}`,
      optimizeFor: 'balanced',
    });
    
    res.json({
      response: response.choices[0].message.content,
      provider: response.provider,
      cost: response.usage.cost,
      tokens: response.usage.totalTokens,
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    
    if (error instanceof AIError) {
      const statusCode = error.type === 'rate_limit' ? 429 : 
                        error.type === 'authentication' ? 401 : 500;
      
      res.status(statusCode).json({
        error: {
          code: error.code,
          message: error.message,
          retryable: error.retryable,
        },
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Advanced Features

### Streaming Endpoint

```javascript
// src/routes/ai.js
const express = require('express');
const aiClient = require('../config/ai');
const router = express.Router();

router.post('/chat/stream', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });
    
    const stream = aiClient.chatStream({
      messages: [
        { role: 'user', content: message }
      ],
    }, {
      userId: userId || `user_${Date.now()}`,
      optimizeFor: 'speed',
    });
    
    for await (const chunk of stream) {
      if (chunk.choices[0].delta.content) {
        res.write(`data: ${JSON.stringify({
          content: chunk.choices[0].delta.content,
          provider: chunk.provider,
        })}\n\n`);
      }
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
    
  } catch (error) {
    console.error('Streaming error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

module.exports = router;
```

### Multi-turn Conversations

```javascript
// Conversation management
const conversations = new Map(); // In production, use Redis or database

router.post('/chat/conversation', async (req, res) => {
  try {
    const { message, conversationId, userId } = req.body;
    
    // Get or create conversation
    let conversation = conversations.get(conversationId) || {
      messages: [],
      userId: userId || `user_${Date.now()}`,
    };
    
    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });
    
    // Get AI response
    const response = await aiClient.chat({
      messages: conversation.messages.map(({ role, content }) => ({ role, content })),
    }, {
      userId: conversation.userId,
      optimizeFor: 'balanced',
    });
    
    // Add AI response to conversation
    const aiMessage = {
      role: 'assistant',
      content: response.choices[0].message.content,
      timestamp: new Date().toISOString(),
      metadata: {
        provider: response.provider,
        cost: response.usage.cost,
        tokens: response.usage.totalTokens,
      },
    };
    
    conversation.messages.push(aiMessage);
    conversations.set(conversationId, conversation);
    
    res.json({
      conversationId,
      message: aiMessage,
      totalMessages: conversation.messages.length,
    });
    
  } catch (error) {
    console.error('Conversation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get conversation history
router.get('/chat/conversation/:id', (req, res) => {
  const conversation = conversations.get(req.params.id);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  res.json({
    conversationId: req.params.id,
    messages: conversation.messages,
    totalMessages: conversation.messages.length,
  });
});
```

### Function Calling Endpoint

```javascript
router.post('/chat/function', async (req, res) => {
  try {
    const { message, availableFunctions } = req.body;
    
    // Define available functions
    const functions = {
      get_weather: {
        description: 'Get current weather for a location',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'string', description: 'City and state' },
          },
          required: ['location'],
        },
        handler: async (args) => {
          // Mock weather API call
          return `Weather in ${args.location}: 72°F, sunny`;
        },
      },
      
      calculate: {
        description: 'Perform mathematical calculations',
        parameters: {
          type: 'object',
          properties: {
            expression: { type: 'string', description: 'Mathematical expression' },
          },
          required: ['expression'],
        },
        handler: async (args) => {
          try {
            // Simple evaluation (in production, use a safe math parser)
            const result = eval(args.expression);
            return `Result: ${result}`;
          } catch (error) {
            return 'Invalid mathematical expression';
          }
        },
      },
    };
    
    // Prepare tools for AI
    const tools = Object.entries(functions).map(([name, func]) => ({
      type: 'function',
      function: {
        name,
        description: func.description,
        parameters: func.parameters,
      },
    }));
    
    const response = await aiClient.chat({
      messages: [{ role: 'user', content: message }],
      tools,
    });
    
    const choice = response.choices[0];
    
    // Check if AI wants to call a function
    if (choice.message.toolCalls) {
      const results = [];
      
      for (const toolCall of choice.message.toolCalls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        if (functions[functionName]) {
          const result = await functions[functionName].handler(functionArgs);
          results.push({
            toolCallId: toolCall.id,
            function: functionName,
            arguments: functionArgs,
            result,
          });
        }
      }
      
      res.json({
        response: choice.message.content,
        functionCalls: results,
        provider: response.provider,
      });
    } else {
      res.json({
        response: choice.message.content,
        provider: response.provider,
      });
    }
    
  } catch (error) {
    console.error('Function calling error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

## Middleware

### AI Client Middleware

```javascript
// src/middleware/ai.js
const aiClient = require('../config/ai');

function aiMiddleware(req, res, next) {
  req.ai = {
    client: aiClient,
    
    // Convenience methods
    chat: async (messages, options = {}) => {
      return await aiClient.chat(
        { messages: Array.isArray(messages) ? messages : [{ role: 'user', content: messages }] },
        { userId: req.userId || req.ip, ...options }
      );
    },
    
    stream: (messages, options = {}) => {
      return aiClient.chatStream(
        { messages: Array.isArray(messages) ? messages : [{ role: 'user', content: messages }] },
        { userId: req.userId || req.ip, ...options }
      );
    },
    
    estimate: async (messages) => {
      return await aiClient.estimateCost({
        messages: Array.isArray(messages) ? messages : [{ role: 'user', content: messages }],
      });
    },
  };
  
  next();
}

module.exports = aiMiddleware;
```

### Rate Limiting Middleware

```javascript
// src/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 AI requests per windowMs
  message: {
    error: 'Too many AI requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = aiRateLimit;
```

### Cost Tracking Middleware

```javascript
// src/middleware/costTracking.js
const costTracker = {
  dailyCosts: new Map(), // In production, use Redis or database
  
  track(userId, cost) {
    const today = new Date().toISOString().split('T')[0];
    const key = `${userId}_${today}`;
    const currentCost = this.dailyCosts.get(key) || 0;
    this.dailyCosts.set(key, currentCost + cost);
  },
  
  getDailyCost(userId) {
    const today = new Date().toISOString().split('T')[0];
    const key = `${userId}_${today}`;
    return this.dailyCosts.get(key) || 0;
  },
};

function costTrackingMiddleware(req, res, next) {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Track cost if present in response
    if (data && data.cost) {
      const userId = req.userId || req.ip;
      costTracker.track(userId, data.cost);
      
      // Add daily cost to response
      data.dailyCost = costTracker.getDailyCost(userId);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
}

module.exports = costTrackingMiddleware;
```

## Error Handling

### Global Error Handler

```javascript
// src/middleware/error.js
const { AIError } = require('@ai-marketplace/sdk');

function errorHandler(error, req, res, next) {
  console.error('Error:', error);
  
  if (error instanceof AIError) {
    const statusCode = getStatusCodeForAIError(error);
    
    res.status(statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        type: error.type,
        provider: error.provider,
        retryable: error.retryable,
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  } else if (error.name === 'ValidationError') {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.details,
      },
    });
  } else {
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error.message,
      },
    });
  }
}

function getStatusCodeForAIError(error) {
  switch (error.type) {
    case 'authentication': return 401;
    case 'rate_limit': return 429;
    case 'invalid_request': return 400;
    case 'server_error': return 502;
    case 'network_error': return 503;
    default: return 500;
  }
}

module.exports = errorHandler;
```

## Production Configuration

### Complete Production Setup

```javascript
// src/app.js (Production)
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import middleware and routes
const aiMiddleware = require('./middleware/ai');
const costTrackingMiddleware = require('./middleware/costTracking');
const errorHandler = require('./middleware/error');
const aiRoutes = require('./routes/ai');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// Performance middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
});
app.use(globalRateLimit);

// Custom middleware
app.use(aiMiddleware);
app.use(costTrackingMiddleware);

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test AI client
    const validation = await req.ai.client.validateApiKeys();
    const validProviders = Object.entries(validation)
      .filter(([_, isValid]) => isValid)
      .map(([provider, _]) => provider);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      validProviders,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

// Routes
app.use('/api/ai', aiRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
```

### Environment Configuration

```bash
# .env
NODE_ENV=production
PORT=3000

# AI API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key

# Security
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# AI Configuration
AI_ENABLE_ML_ROUTING=true
AI_DEFAULT_PROVIDER=openai
AI_CACHE_ENABLED=true
AI_CACHE_TTL=300
AI_MAX_RETRIES=3

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Examples

### Complete Chat API Example

```javascript
// Example client usage
const axios = require('axios');

class ChatAPIClient {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
  }
  
  async chat(message, options = {}) {
    const response = await axios.post(`${this.baseURL}/ai/chat`, {
      message,
      userId: options.userId,
    });
    
    return response.data;
  }
  
  async chatStream(message, onChunk, options = {}) {
    const response = await fetch(`${this.baseURL}/ai/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userId: options.userId }),
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            onChunk(parsed);
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
    }
  }
  
  async getAnalytics(userId) {
    const response = await axios.get(`${this.baseURL}/ai/analytics`, {
      params: { userId },
    });
    
    return response.data;
  }
}

// Usage
const client = new ChatAPIClient();

// Simple chat
const response = await client.chat('Hello, how are you?');
console.log(response.response);

// Streaming chat
await client.chatStream('Tell me a story', (chunk) => {
  if (chunk.content) {
    process.stdout.write(chunk.content);
  }
});
```

This Express.js integration provides a solid foundation for building production-ready AI-powered APIs with the AI Marketplace SDK.