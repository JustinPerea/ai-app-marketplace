# Troubleshooting Guide

This guide covers common issues, error messages, and solutions when using the AI Marketplace SDK.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Authentication Errors](#authentication-errors)
3. [API Request Failures](#api-request-failures)
4. [Performance Issues](#performance-issues)
5. [ML Routing Problems](#ml-routing-problems)
6. [Framework Integration Issues](#framework-integration-issues)
7. [Production Deployment Issues](#production-deployment-issues)
8. [Error Code Reference](#error-code-reference)

## Installation Issues

### Package Not Found

**Error**: `Module '@ai-marketplace/sdk' not found`

**Solutions**:
1. Ensure the package is installed:
   ```bash
   npm install @ai-marketplace/sdk
   ```

2. Check if you're using the correct import:
   ```javascript
   // Correct
   import { createClient } from '@ai-marketplace/sdk';
   
   // Also correct
   const { createClient } = require('@ai-marketplace/sdk');
   ```

3. Clear npm cache if installation seems corrupted:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

### TypeScript Declaration Issues

**Error**: `Could not find a declaration file for module '@ai-marketplace/sdk'`

**Solution**: The SDK includes TypeScript declarations. If you're still getting this error:

1. Check your `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true
     }
   }
   ```

2. Try importing types explicitly:
   ```typescript
   import { createClient, type AIRequest, type AIResponse } from '@ai-marketplace/sdk';
   ```

### Build Errors in Webpack/Bundlers

**Error**: `Module not found: Can't resolve 'fs'` or similar Node.js module errors

**Solution**: The SDK is designed for Node.js environments. For browser usage:

1. Use a server-side proxy:
   ```javascript
   // Don't use the SDK directly in browser
   // Instead, make requests to your API
   fetch('/api/ai/chat', {
     method: 'POST',
     body: JSON.stringify({ message: 'Hello' })
   });
   ```

2. For Next.js, ensure API calls are in API routes:
   ```javascript
   // pages/api/chat.js - Server-side only
   import { createClient } from '@ai-marketplace/sdk';
   ```

## Authentication Errors

### Invalid API Key

**Error**: `API_KEY_INVALID` or `401 Unauthorized`

**Solutions**:
1. Verify your API keys are correct:
   ```javascript
   console.log('OpenAI key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10));
   ```

2. Check environment variable loading:
   ```javascript
   require('dotenv').config();
   console.log('Environment loaded:', !!process.env.OPENAI_API_KEY);
   ```

3. Validate keys manually:
   ```javascript
   const client = createClient({
     apiKeys: {
       openai: process.env.OPENAI_API_KEY,
     }
   });
   
   const validation = await client.validateApiKeys();
   console.log('Key validation:', validation);
   ```

### Missing API Key

**Error**: `API_KEY_MISSING`

**Solution**: Ensure at least one API key is provided:

```javascript
const client = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,    // At least one required
    anthropic: process.env.ANTHROPIC_API_KEY, // Optional
    google: process.env.GOOGLE_API_KEY,    // Optional
  }
});
```

### Environment Variables Not Loading

**Issue**: API keys are undefined even though they're in `.env`

**Solutions**:
1. Ensure `.env` file is in the correct location (project root)
2. Load dotenv before importing the SDK:
   ```javascript
   require('dotenv').config();
   const { createClient } = require('@ai-marketplace/sdk');
   ```

3. For Next.js, use `.env.local`:
   ```bash
   # .env.local (not .env)
   OPENAI_API_KEY=your_key_here
   ```

## API Request Failures

### Request Timeout

**Error**: `REQUEST_TIMEOUT`

**Solutions**:
1. Increase timeout in client configuration:
   ```javascript
   const client = createClient({
     apiKeys: { /* ... */ },
     config: {
       timeout: 60000, // 60 seconds
     }
   });
   ```

2. Use speed optimization for faster responses:
   ```javascript
   const response = await client.chat({
     messages: [{ role: 'user', content: 'Quick question' }],
   }, {
     optimizeFor: 'speed'
   });
   ```

3. Check network connectivity and provider status

### Rate Limit Exceeded

**Error**: `RATE_LIMIT_EXCEEDED`

**Solutions**:
1. Implement exponential backoff:
   ```javascript
   async function chatWithRetry(request, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await client.chat(request);
       } catch (error) {
         if (error.code === 'RATE_LIMIT_EXCEEDED' && i < maxRetries - 1) {
           const delay = Math.pow(2, i) * 1000; // Exponential backoff
           await new Promise(resolve => setTimeout(resolve, delay));
           continue;
         }
         throw error;
       }
     }
   }
   ```

2. Use caching to reduce requests:
   ```javascript
   const client = createClient({
     config: {
       cache: {
         enabled: true,
         ttlSeconds: 600, // 10 minutes
       }
     }
   });
   ```

3. Consider upgrading your API plan with the provider

### Content Filter

**Error**: `CONTENT_FILTER`

**Solutions**:
1. Review and modify your content:
   ```javascript
   function sanitizeContent(content) {
     // Remove potentially problematic content
     return content
       .replace(/explicit-content-pattern/g, '[content removed]')
       .trim();
   }
   
   const response = await client.chat({
     messages: [{ role: 'user', content: sanitizeContent(userInput) }],
   });
   ```

2. Use system messages to guide behavior:
   ```javascript
   const response = await client.chat({
     messages: [
       { 
         role: 'system', 
         content: 'You are a helpful, harmless, and honest assistant. Always provide appropriate responses.' 
       },
       { role: 'user', content: userMessage }
     ],
   });
   ```

### Provider Not Available

**Error**: `PROVIDER_NOT_AVAILABLE`

**Solutions**:
1. Enable fallback routing:
   ```javascript
   const client = createClient({
     config: {
       router: {
         fallbackEnabled: true,
         fallbackOrder: [APIProvider.GOOGLE, APIProvider.ANTHROPIC, APIProvider.OPENAI],
       }
     }
   });
   ```

2. Check provider API key validity:
   ```javascript
   const validation = await client.validateApiKeys();
   console.log('Available providers:', 
     Object.entries(validation)
       .filter(([_, valid]) => valid)
       .map(([provider, _]) => provider)
   );
   ```

## Performance Issues

### Slow Response Times

**Issue**: Requests taking longer than expected

**Solutions**:
1. Use speed optimization:
   ```javascript
   const response = await client.chat({
     messages: [{ role: 'user', content: 'Fast response needed' }],
     maxTokens: 100, // Limit response length
   }, {
     optimizeFor: 'speed'
   });
   ```

2. Enable caching:
   ```javascript
   const client = createClient({
     config: {
       cache: {
         enabled: true,
         ttlSeconds: 300,
         maxSize: 5000,
       }
     }
   });
   ```

3. Use streaming for better perceived performance:
   ```javascript
   const stream = client.chatStream({
     messages: [{ role: 'user', content: 'Long response expected' }],
   });
   
   for await (const chunk of stream) {
     if (chunk.choices[0].delta.content) {
       process.stdout.write(chunk.choices[0].delta.content);
     }
   }
   ```

### High Memory Usage

**Issue**: Application using excessive memory

**Solutions**:
1. Configure cache limits:
   ```javascript
   const client = createClient({
     config: {
       cache: {
         enabled: true,
         maxSize: 1000, // Limit cache entries
         ttlSeconds: 300, // Shorter TTL
       }
     }
   });
   ```

2. Clear cache periodically:
   ```javascript
   // Clear cache every hour
   setInterval(() => {
     client.clearCache();
   }, 3600000);
   ```

3. Avoid storing large conversation histories:
   ```javascript
   // Keep only recent messages
   function trimConversation(messages, maxMessages = 10) {
     if (messages.length <= maxMessages) return messages;
     
     // Keep system message + recent messages
     const systemMessages = messages.filter(m => m.role === 'system');
     const otherMessages = messages.filter(m => m.role !== 'system');
     const recentMessages = otherMessages.slice(-maxMessages + systemMessages.length);
     
     return [...systemMessages, ...recentMessages];
   }
   ```

## ML Routing Problems

### Poor Provider Selection

**Issue**: ML routing not selecting optimal providers

**Solutions**:
1. Provide user context for better learning:
   ```javascript
   const response = await client.chat({
     messages: [{ role: 'user', content: 'Technical question about APIs' }],
   }, {
     userId: 'consistent_user_id', // Important for learning
     optimizeFor: 'quality',
   });
   ```

2. Monitor ML performance:
   ```javascript
   const analytics = await client.getAnalytics();
   console.log('ML Confidence:', analytics.averageConfidence);
   
   if (analytics.averageConfidence < 0.7) {
     console.warn('ML routing confidence is low');
   }
   ```

3. Temporarily disable ML routing if needed:
   ```javascript
   const response = await client.chat({
     messages: [{ role: 'user', content: 'Message' }],
   }, {
     enableMLRouting: false,
     provider: APIProvider.OPENAI, // Force specific provider
   });
   ```

### Inconsistent Cost Optimization

**Issue**: Cost optimization not working as expected

**Solutions**:
1. Verify all providers are configured:
   ```javascript
   const estimates = await client.estimateCost({
     messages: [{ role: 'user', content: 'Test message' }],
   });
   
   console.log('Cost estimates:', estimates);
   ```

2. Check provider-specific pricing:
   ```javascript
   const models = await client.getModels();
   models.forEach(model => {
     console.log(`${model.provider} - ${model.id}:`, model.pricing);
   });
   ```

## Framework Integration Issues

### Express.js Middleware Issues

**Issue**: Middleware not working correctly

**Solution**: Ensure proper middleware order:
```javascript
app.use(express.json()); // Parse JSON first
app.use(aiMiddleware);   // Then AI middleware
app.use('/api/ai', aiRoutes); // Then routes
app.use(errorHandler);   // Error handler last
```

### Next.js API Route Errors

**Issue**: API routes not working in Next.js

**Solutions**:
1. Ensure correct file structure:
   ```
   pages/
   ├── api/
   │   └── ai/
   │       └── chat.js  # Must be in pages/api/
   ```

2. Use correct export format:
   ```javascript
   // pages/api/ai/chat.js
   export default async function handler(req, res) {
     // Handler code
   }
   ```

3. Handle method validation:
   ```javascript
   export default async function handler(req, res) {
     if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Method not allowed' });
     }
     // Rest of handler
   }
   ```

### React Hook Issues

**Issue**: Custom hooks not updating correctly

**Solution**: Ensure proper dependency arrays:
```javascript
const { chat, loading, error } = useAI();

useEffect(() => {
  // Effect code
}, [chat]); // Include chat in dependencies
```

## Production Deployment Issues

### Environment Variable Issues in Production

**Issue**: Environment variables not available in production

**Solutions**:
1. For Vercel:
   ```bash
   # Set in Vercel dashboard or CLI
   vercel env add OPENAI_API_KEY
   ```

2. For Heroku:
   ```bash
   heroku config:set OPENAI_API_KEY=your_key
   ```

3. For Docker:
   ```dockerfile
   # Dockerfile
   ENV OPENAI_API_KEY=""
   # Or use docker-compose with env_file
   ```

### CORS Issues

**Issue**: CORS errors in browser

**Solution**: Configure CORS properly:
```javascript
// Express.js
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// Next.js API routes
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Rest of handler
}
```

### Memory Leaks in Production

**Issue**: Memory usage increasing over time

**Solutions**:
1. Implement proper cleanup:
   ```javascript
   process.on('SIGTERM', () => {
     client.clearCache();
     // Other cleanup
     process.exit(0);
   });
   ```

2. Monitor memory usage:
   ```javascript
   setInterval(() => {
     const usage = process.memoryUsage();
     console.log('Memory usage:', {
       rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
       heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
     });
   }, 60000); // Log every minute
   ```

## Error Code Reference

### Authentication Errors
- `API_KEY_MISSING`: No API key provided for the selected provider
- `API_KEY_INVALID`: API key is invalid or expired
- `PROVIDER_NOT_AVAILABLE`: Requested provider is not configured

### Request Errors
- `INVALID_REQUEST`: Request format or parameters are invalid
- `REQUEST_TIMEOUT`: Request exceeded timeout limit
- `MODEL_NOT_FOUND`: Specified model is not available
- `CONTENT_FILTER`: Content was filtered by provider safety systems

### Rate Limiting
- `RATE_LIMIT_EXCEEDED`: Provider rate limit exceeded
- `QUOTA_EXCEEDED`: Monthly/daily quota exceeded

### Server Errors
- `SERVER_ERROR`: Provider server error (5xx responses)
- `NETWORK_ERROR`: Network connectivity issues
- `SERVICE_UNAVAILABLE`: Provider service temporarily unavailable

### SDK Errors
- `ML_ROUTING_DISABLED`: ML routing is disabled but required for operation
- `CACHE_ERROR`: Error with caching system
- `CONFIGURATION_ERROR`: Invalid SDK configuration

### Handling Errors

```javascript
import { AIError } from '@ai-marketplace/sdk';

try {
  const response = await client.chat({ messages: [/* ... */] });
} catch (error) {
  if (error instanceof AIError) {
    switch (error.code) {
      case 'RATE_LIMIT_EXCEEDED':
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, 5000));
        break;
        
      case 'API_KEY_INVALID':
        // Check API key configuration
        console.error('Invalid API key for', error.provider);
        break;
        
      case 'CONTENT_FILTER':
        // Modify content and retry
        console.warn('Content was filtered');
        break;
        
      default:
        console.error('AI Error:', error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Getting Help

If you're still experiencing issues:

1. **Check the logs**: Enable debug logging and check for detailed error messages
2. **Review documentation**: Check the [API Reference](./api-reference.md) and [Best Practices](./best-practices.md)
3. **Test with minimal example**: Try with a simple, isolated test case
4. **Check provider status**: Verify the AI provider services are operational
5. **Update the SDK**: Ensure you're using the latest version

```bash
npm update @ai-marketplace/sdk
```

For additional support, check the [GitHub Issues](https://github.com/JustinPerea/cosmara-ai-sdk/issues) or create a new issue with:
- SDK version
- Node.js version
- Complete error message
- Minimal reproduction code
- Environment details