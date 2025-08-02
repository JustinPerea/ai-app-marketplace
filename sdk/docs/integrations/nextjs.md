# Next.js Integration Guide

This guide shows how to integrate the AI Marketplace SDK with Next.js to build full-stack AI-powered React applications.

## Table of Contents

1. [Setup](#setup)
2. [API Routes](#api-routes)
3. [Client-Side Integration](#client-side-integration)
4. [Server-Side Rendering](#server-side-rendering)
5. [Streaming](#streaming)
6. [Middleware](#middleware)
7. [Production Deployment](#production-deployment)

## Setup

### Install Dependencies

```bash
npm install @ai-marketplace/sdk
npm install --save-dev @types/node  # If using TypeScript
```

### Project Structure

```
project/
├── pages/
│   ├── api/
│   │   └── ai/
│   │       ├── chat.js
│   │       ├── stream.js
│   │       └── analytics.js
│   ├── chat.js
│   └── _app.js
├── lib/
│   ├── ai-client.js
│   └── ai-utils.js
├── components/
│   ├── ChatInterface.js
│   └── StreamingChat.js
├── .env.local
└── next.config.js
```

## API Routes

### Initialize AI Client

```javascript
// lib/ai-client.js
import { createClient, APIProvider } from '@ai-marketplace/sdk';

const aiClient = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
  },
  config: {
    enableMLRouting: true,
    enableAnalytics: true,
    cache: {
      enabled: process.env.NODE_ENV === 'production',
      ttlSeconds: 300,
    },
  },
});

export default aiClient;
```

### Basic Chat API Route

```javascript
// pages/api/ai/chat.js
import aiClient from '../../../lib/ai-client';
import { AIError } from '@ai-marketplace/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, userId, optimizeFor = 'balanced' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await aiClient.chat({
      messages: [
        { role: 'user', content: message }
      ],
    }, {
      userId: userId || `user_${Date.now()}`,
      optimizeFor,
    });

    res.status(200).json({
      response: response.choices[0].message.content,
      provider: response.provider,
      cost: response.usage.cost,
      tokens: response.usage.totalTokens,
    });

  } catch (error) {
    console.error('Chat API error:', error);

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
}
```

### Streaming API Route

```javascript
// pages/api/ai/stream.js
import aiClient from '../../../lib/ai-client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    console.error('Streaming API error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}
```

### Conversation API Route

```javascript
// pages/api/ai/conversation.js
import aiClient from '../../../lib/ai-client';

// In production, use Redis or a database
const conversations = new Map();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handleNewMessage(req, res);
  } else if (req.method === 'GET') {
    return getConversation(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleNewMessage(req, res) {
  try {
    const { message, conversationId, userId } = req.body;

    // Get or create conversation
    let conversation = conversations.get(conversationId) || {
      messages: [],
      userId: userId || `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
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
    });

    // Add AI response
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
    conversation.updatedAt = new Date().toISOString();
    conversations.set(conversationId, conversation);

    res.status(200).json({
      conversationId,
      message: aiMessage,
      totalMessages: conversation.messages.length,
    });

  } catch (error) {
    console.error('Conversation API error:', error);
    res.status(500).json({ error: error.message });
  }
}

function getConversation(req, res) {
  const { conversationId } = req.query;
  const conversation = conversations.get(conversationId);

  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  res.status(200).json({
    conversationId,
    messages: conversation.messages,
    totalMessages: conversation.messages.length,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  });
}
```

## Client-Side Integration

### Custom Hook for AI Chat

```javascript
// lib/useAI.js
import { useState, useCallback } from 'react';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const chat = useCallback(async (message, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          ...options,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get AI response');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const chatStream = useCallback(async (message, onChunk, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start stream');
      }

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
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    chat,
    chatStream,
    loading,
    error,
  };
}
```

### Chat Interface Component

```jsx
// components/ChatInterface.js
import { useState } from 'react';
import { useAI } from '../lib/useAI';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { chat, loading, error } = useAI();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await chat(input);
      const aiMessage = {
        role: 'assistant',
        content: response.response,
        metadata: {
          provider: response.provider,
          cost: response.cost,
          tokens: response.tokens,
        },
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="chat-interface">
      <div className="messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role} ${message.error ? 'error' : ''}`}
          >
            <div className="content">{message.content}</div>
            {message.metadata && (
              <div className="metadata">
                Provider: {message.metadata.provider} | 
                Cost: ${message.metadata.cost.toFixed(6)} | 
                Tokens: {message.metadata.tokens}
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <div className="error">Error: {error}</div>}

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>

      <style jsx>{`
        .chat-interface {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .messages {
          min-height: 400px;
          max-height: 600px;
          overflow-y: auto;
          border: 1px solid #ddd;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 8px;
        }
        
        .message {
          margin-bottom: 20px;
          padding: 10px;
          border-radius: 8px;
        }
        
        .message.user {
          background: #e3f2fd;
          margin-left: 20%;
        }
        
        .message.assistant {
          background: #f5f5f5;
          margin-right: 20%;
        }
        
        .message.error {
          background: #ffebee;
          color: #c62828;
        }
        
        .metadata {
          font-size: 0.8em;
          color: #666;
          margin-top: 5px;
        }
        
        .input-form {
          display: flex;
          gap: 10px;
        }
        
        .input-form input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .input-form button {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .input-form button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .error {
          color: #c62828;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}
```

### Streaming Chat Component

```jsx
// components/StreamingChat.js
import { useState, useRef } from 'react';
import { useAI } from '../lib/useAI';

export default function StreamingChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const { chatStream, error } = useAI();
  const currentResponseRef = useRef('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    currentResponseRef.current = '';

    // Add empty assistant message that we'll update
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }]);

    try {
      await chatStream(input, (chunk) => {
        if (chunk.content) {
          currentResponseRef.current += chunk.content;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = currentResponseRef.current;
            }
            return newMessages;
          });
        }
      });

      // Mark streaming as complete
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.streaming = false;
        }
        return newMessages;
      });

    } catch (err) {
      console.error('Streaming error:', err);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          error: true,
        };
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="streaming-chat">
      <div className="messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role} ${message.error ? 'error' : ''}`}
          >
            <div className="content">
              {message.content}
              {message.streaming && <span className="cursor">|</span>}
            </div>
          </div>
        ))}
      </div>

      {error && <div className="error">Error: {error}</div>}

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isStreaming}
        />
        <button type="submit" disabled={isStreaming || !input.trim()}>
          {isStreaming ? 'Streaming...' : 'Send'}
        </button>
      </form>

      <style jsx>{`
        .streaming-chat {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .messages {
          min-height: 400px;
          max-height: 600px;
          overflow-y: auto;
          border: 1px solid #ddd;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 8px;
        }
        
        .message {
          margin-bottom: 20px;
          padding: 10px;
          border-radius: 8px;
        }
        
        .message.user {
          background: #e3f2fd;
          margin-left: 20%;
        }
        
        .message.assistant {
          background: #f5f5f5;
          margin-right: 20%;
        }
        
        .cursor {
          animation: blink 1s infinite;
          color: #007bff;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .input-form {
          display: flex;
          gap: 10px;
        }
        
        .input-form input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .input-form button {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .input-form button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
```

## Server-Side Rendering

### Chat Page with SSR

```jsx
// pages/chat.js
import { useState } from 'react';
import Head from 'next/head';
import ChatInterface from '../components/ChatInterface';
import StreamingChat from '../components/StreamingChat';

export default function ChatPage({ initialData }) {
  const [mode, setMode] = useState('regular');

  return (
    <>
      <Head>
        <title>AI Chat - AI Marketplace SDK</title>
        <meta name="description" content="Chat with AI using multiple providers" />
      </Head>

      <div className="container">
        <h1>AI Chat Interface</h1>
        
        <div className="mode-selector">
          <button
            className={mode === 'regular' ? 'active' : ''}
            onClick={() => setMode('regular')}
          >
            Regular Chat
          </button>
          <button
            className={mode === 'streaming' ? 'active' : ''}
            onClick={() => setMode('streaming')}
          >
            Streaming Chat
          </button>
        </div>

        {mode === 'regular' ? <ChatInterface /> : <StreamingChat />}

        {initialData && (
          <div className="initial-data">
            <h3>Available Providers:</h3>
            <ul>
              {initialData.validProviders.map(provider => (
                <li key={provider}>{provider}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .mode-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          justify-content: center;
        }
        
        .mode-selector button {
          padding: 10px 20px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          border-radius: 4px;
        }
        
        .mode-selector button.active {
          background: #007bff;
          color: white;
        }
        
        .initial-data {
          margin-top: 40px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps() {
  try {
    // You can perform server-side AI operations here
    const aiClient = (await import('../lib/ai-client')).default;
    const validation = await aiClient.validateApiKeys();
    const validProviders = Object.entries(validation)
      .filter(([_, isValid]) => isValid)
      .map(([provider, _]) => provider);

    return {
      props: {
        initialData: {
          validProviders,
          timestamp: new Date().toISOString(),
        },
      },
    };
  } catch (error) {
    console.error('SSR error:', error);
    return {
      props: {
        initialData: null,
      },
    };
  }
}
```

## Middleware

### API Route Middleware

```javascript
// lib/middleware.js
import { AIError } from '@ai-marketplace/sdk';

export function withAIErrorHandling(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('API error:', error);

      if (error instanceof AIError) {
        const statusCode = error.type === 'rate_limit' ? 429 : 
                          error.type === 'authentication' ? 401 : 500;
        
        res.status(statusCode).json({
          error: {
            code: error.code,
            message: error.message,
            type: error.type,
            retryable: error.retryable,
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
  };
}

export function withRateLimit(handler, limit = 100, windowMs = 60000) {
  const requests = new Map();

  return async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old requests
    const userRequests = requests.get(ip) || [];
    const validRequests = userRequests.filter(time => time > windowStart);

    if (validRequests.length >= limit) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
        },
      });
    }

    validRequests.push(now);
    requests.set(ip, validRequests);

    return handler(req, res);
  };
}
```

## Production Deployment

### Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables
  env: {
    AI_ENABLE_ML_ROUTING: process.env.AI_ENABLE_ML_ROUTING,
  },
  
  // Headers for API routes
  async headers() {
    return [
      {
        source: '/api/ai/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/api',
        destination: '/api/health',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
```

### Environment Variables

```bash
# .env.local
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key

AI_ENABLE_ML_ROUTING=true
AI_DEFAULT_PROVIDER=openai
AI_CACHE_ENABLED=true
AI_CACHE_TTL=300

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### Deployment Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "export": "next export",
    "deploy": "next build && next start"
  }
}
```

This Next.js integration provides a complete full-stack solution for building AI-powered React applications with the AI Marketplace SDK.