# Best Practices Guide

This guide covers best practices for using the AI Marketplace SDK effectively, including cost optimization, error handling, performance optimization, and security considerations.

## Table of Contents

1. [Cost Optimization](#cost-optimization)
2. [Error Handling](#error-handling)
3. [Performance Optimization](#performance-optimization)
4. [Security Best Practices](#security-best-practices)
5. [ML Routing Optimization](#ml-routing-optimization)
6. [Production Deployment](#production-deployment)
7. [Monitoring and Observability](#monitoring-and-observability)

## Cost Optimization

### Use ML Routing for Automatic Cost Optimization

Enable ML routing to automatically select the most cost-effective provider for each request:

```typescript
const client = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
  },
  config: {
    enableMLRouting: true,
    router: {
      costOptimizationEnabled: true,
    },
  },
});

// Let ML routing choose the most cost-effective provider
const response = await client.chat({
  messages: [{ role: 'user', content: 'Simple question' }],
}, {
  optimizeFor: 'cost'
});
```

### Estimate Costs Before Making Requests

Use cost estimation to understand and budget for API usage:

```typescript
// Estimate costs before making the request
const estimates = await client.estimateCost({
  messages: [{ role: 'user', content: 'Complex analysis request' }],
});

// Choose based on your budget
const budgetLimit = 0.01; // $0.01
const affordableOptions = estimates.filter(e => e.cost <= budgetLimit);

if (affordableOptions.length > 0) {
  // Use the most affordable option
  const response = await client.chat({
    messages: [{ role: 'user', content: 'Complex analysis request' }],
  }, {
    provider: affordableOptions[0].provider
  });
}
```

### Optimize Request Parameters

#### Use Appropriate Token Limits

```typescript
// For simple questions, use lower token limits
const simpleResponse = await client.chat({
  messages: [{ role: 'user', content: 'What is 2+2?' }],
  maxTokens: 50, // Lower limit for simple answers
});

// For complex tasks, use higher limits
const complexResponse = await client.chat({
  messages: [{ role: 'user', content: 'Write a detailed essay...' }],
  maxTokens: 2000, // Higher limit for detailed responses
});
```

#### Use Lower Temperature for Consistent, Focused Responses

```typescript
// Lower temperature for factual, consistent responses (cheaper)
const factualResponse = await client.chat({
  messages: [{ role: 'user', content: 'What is the capital of France?' }],
  temperature: 0.1, // More deterministic, potentially cheaper
});

// Higher temperature only when creativity is needed
const creativeResponse = await client.chat({
  messages: [{ role: 'user', content: 'Write a creative story...' }],
  temperature: 0.8, // More creative but potentially more expensive
});
```

### Implement Cost Tracking

```typescript
class CostTracker {
  private totalCost = 0;
  private requestCount = 0;
  
  async makeRequest(client, request, options = {}) {
    const response = await client.chat(request, options);
    
    this.totalCost += response.usage.cost;
    this.requestCount++;
    
    console.log(`Request cost: $${response.usage.cost.toFixed(6)}`);
    console.log(`Total cost: $${this.totalCost.toFixed(6)}`);
    console.log(`Average cost per request: $${(this.totalCost / this.requestCount).toFixed(6)}`);
    
    return response;
  }
  
  getStats() {
    return {
      totalCost: this.totalCost,
      requestCount: this.requestCount,
      averageCost: this.requestCount > 0 ? this.totalCost / this.requestCount : 0,
    };
  }
}

const costTracker = new CostTracker();
const response = await costTracker.makeRequest(client, {
  messages: [{ role: 'user', content: 'Hello' }],
});
```

## Error Handling

### Implement Comprehensive Error Handling

```typescript
import { AIError } from '@ai-marketplace/sdk';

async function robustChatCompletion(client, request, options = {}) {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const response = await client.chat(request, options);
      return response;
      
    } catch (error) {
      attempt++;
      
      if (error instanceof AIError) {
        console.error(`AI Error (attempt ${attempt}):`, {
          code: error.code,
          type: error.type,
          provider: error.provider,
          retryable: error.retryable,
        });
        
        // Handle specific error types
        switch (error.code) {
          case 'RATE_LIMIT_EXCEEDED':
            if (error.retryable && attempt < maxRetries) {
              const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
              console.log(`Rate limited, waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            break;
            
          case 'API_KEY_INVALID':
            console.error('Invalid API key, cannot retry');
            throw error; // Don't retry for invalid keys
            
          case 'CONTENT_FILTER':
            console.error('Content was filtered, modifying request...');
            // Implement content modification logic
            request = await moderateContent(request);
            continue;
            
          case 'REQUEST_TIMEOUT':
            if (attempt < maxRetries) {
              console.log('Request timed out, retrying...');
              continue;
            }
            break;
        }
        
        // If not retryable or max attempts reached
        if (!error.retryable || attempt >= maxRetries) {
          throw error;
        }
      } else {
        // Non-AI errors
        console.error('Unexpected error:', error);
        if (attempt >= maxRetries) {
          throw error;
        }
      }
    }
  }
  
  throw new Error('Max retry attempts exceeded');
}
```

### Use Fallback Strategies

```typescript
// Configure automatic fallbacks
const client = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
  },
  config: {
    router: {
      fallbackEnabled: true,
      fallbackOrder: [APIProvider.GOOGLE, APIProvider.ANTHROPIC, APIProvider.OPENAI],
      maxRetries: 3,
    },
  },
});

// Implement custom fallback logic
async function chatWithFallback(request) {
  try {
    // Try with quality optimization first
    return await client.chat(request, { optimizeFor: 'quality' });
  } catch (error) {
    console.warn('Quality request failed, trying balanced approach...');
    
    try {
      return await client.chat(request, { optimizeFor: 'balanced' });
    } catch (error2) {
      console.warn('Balanced request failed, trying cost optimization...');
      
      // Final fallback to cost optimization
      return await client.chat(request, { optimizeFor: 'cost' });
    }
  }
}
```

### Implement Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failures = 0;
    this.lastFailTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failures++;
    this.lastFailTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

const circuitBreaker = new CircuitBreaker();

const response = await circuitBreaker.execute(async () => {
  return await client.chat({
    messages: [{ role: 'user', content: 'Hello' }],
  });
});
```

## Performance Optimization

### Enable Caching

```typescript
const client = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
  },
  config: {
    cache: {
      enabled: true,
      ttlSeconds: 600, // 10 minutes
      maxSize: 5000,
      keyStrategy: 'content_hash', // More efficient than full_request
    },
  },
});

// Repeated requests will be served from cache
const response1 = await client.chat({
  messages: [{ role: 'user', content: 'What is machine learning?' }],
});

// This will be served from cache (much faster)
const response2 = await client.chat({
  messages: [{ role: 'user', content: 'What is machine learning?' }],
});
```

### Use Streaming for Long Responses

```typescript
// For long-form content, use streaming for better perceived performance
async function generateLongContent(prompt) {
  console.log('Generating content...\n');
  
  const stream = client.chatStream({
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 2000,
  });
  
  let fullResponse = '';
  for await (const chunk of stream) {
    if (chunk.choices[0].delta.content) {
      process.stdout.write(chunk.choices[0].delta.content);
      fullResponse += chunk.choices[0].delta.content;
    }
  }
  
  return fullResponse;
}
```

### Optimize for Speed When Needed

```typescript
// For time-sensitive applications
const urgentResponse = await client.chat({
  messages: [{ role: 'user', content: 'Quick question: What is AI?' }],
  maxTokens: 100, // Limit response length
  temperature: 0.1, // Reduce randomness for faster processing
}, {
  optimizeFor: 'speed', // Let ML routing choose fastest provider
});
```

### Batch Requests When Possible

```typescript
// Process multiple requests concurrently
async function batchProcess(requests) {
  const promises = requests.map(request => 
    client.chat({
      messages: [{ role: 'user', content: request }],
    })
  );
  
  const results = await Promise.allSettled(promises);
  
  return results.map((result, index) => ({
    request: requests[index],
    success: result.status === 'fulfilled',
    response: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null,
  }));
}

const requests = [
  'What is AI?',
  'What is ML?',
  'What is deep learning?',
];

const results = await batchProcess(requests);
```

## Security Best Practices

### Secure API Key Management

```typescript
// ❌ Never hardcode API keys
const client = createClient({
  apiKeys: {
    openai: 'sk-hardcoded-key-here', // DON'T DO THIS
  },
});

// ✅ Use environment variables
const client = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
  },
});

// ✅ For production, use secure key management systems
const client = createClient({
  apiKeys: {
    openai: await getSecretFromVault('openai-api-key'),
    anthropic: await getSecretFromVault('anthropic-api-key'),
    google: await getSecretFromVault('google-api-key'),
  },
});
```

### Input Validation and Sanitization

```typescript
function validateAndSanitizeInput(userInput) {
  // Check input length
  if (userInput.length > 10000) {
    throw new Error('Input too long');
  }
  
  // Check for potential injection attempts
  const suspiciousPatterns = [
    /system\s*:/i,
    /ignore\s+previous/i,
    /forget\s+everything/i,
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userInput)) {
      console.warn('Suspicious input detected:', userInput.substring(0, 100));
      // Log for security monitoring
      // Consider blocking or modifying the request
    }
  }
  
  // Sanitize input
  return userInput.trim().replace(/\s+/g, ' ');
}

// Use validation before making requests
const sanitizedInput = validateAndSanitizeInput(userInput);
const response = await client.chat({
  messages: [{ role: 'user', content: sanitizedInput }],
});
```

### Content Filtering

```typescript
async function moderateContent(request) {
  // Implement content moderation before sending to AI
  const moderationResults = await checkContentModeration(request.messages);
  
  if (moderationResults.flagged) {
    throw new Error(`Content flagged: ${moderationResults.categories.join(', ')}`);
  }
  
  return request;
}

async function safeChatCompletion(request) {
  try {
    // Moderate content first
    const moderatedRequest = await moderateContent(request);
    
    // Make the request
    const response = await client.chat(moderatedRequest);
    
    // Optionally moderate the response as well
    await moderateContent([response.choices[0].message]);
    
    return response;
    
  } catch (error) {
    if (error.code === 'CONTENT_FILTER') {
      // Handle content filtering gracefully
      return {
        choices: [{
          message: {
            role: 'assistant',
            content: 'I cannot provide a response to that request due to content policy restrictions.'
          }
        }]
      };
    }
    throw error;
  }
}
```

### Rate Limiting

```typescript
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(userId) {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(userId, validRequests);
    return true;
  }
}

const rateLimiter = new RateLimiter(50, 60000); // 50 requests per minute

async function rateLimitedChat(userId, request) {
  if (!rateLimiter.isAllowed(userId)) {
    throw new Error('Rate limit exceeded for user');
  }
  
  return await client.chat(request, { userId });
}
```

## ML Routing Optimization

### Provide Context for Better Routing

```typescript
// Provide user context for better routing decisions
const response = await client.chat({
  messages: [{ role: 'user', content: 'Explain quantum computing' }],
}, {
  userId: 'user123', // Helps ML learn user preferences
  optimizeFor: 'quality', // Clear optimization goal
});

// Use consistent user IDs for learning
const consistentUserId = `user_${hashUserId(actualUserId)}`;
```

### Monitor ML Performance

```typescript
async function monitorMLPerformance() {
  const analytics = await client.getAnalytics();
  
  console.log('ML Routing Performance:');
  console.log(`Total predictions: ${analytics.totalPredictions}`);
  console.log(`Average confidence: ${(analytics.averageConfidence * 100).toFixed(1)}%`);
  console.log(`Cost prediction accuracy: ${(analytics.accuracyMetrics.costPredictionAccuracy * 100).toFixed(1)}%`);
  
  // Alert if performance degrades
  if (analytics.averageConfidence < 0.7) {
    console.warn('ML routing confidence is low, consider reviewing');
  }
  
  // Show recommendations
  analytics.modelRecommendations.forEach(rec => {
    console.log(`Recommendation: ${rec.scenario} -> ${rec.recommendedProvider} (${rec.expectedSavings}% savings)`);
  });
}

// Monitor periodically
setInterval(monitorMLPerformance, 3600000); // Every hour
```

### Optimize Training Data

```typescript
// Provide feedback to improve ML routing
async function chatWithFeedback(request, expectedOutcome) {
  const startTime = Date.now();
  const response = await client.chat(request, {
    userId: 'feedback_user',
    optimizeFor: 'balanced',
  });
  
  const responseTime = Date.now() - startTime;
  const actualCost = response.usage.cost;
  
  // Implicit feedback through continued usage
  // The ML system learns from actual outcomes
  
  return response;
}
```

## Production Deployment

### Environment Configuration

```typescript
// Use different configurations for different environments
const config = {
  development: {
    enableMLRouting: true,
    enableAnalytics: true,
    cache: { enabled: false }, // Disable cache in development
    router: { maxRetries: 1 },
  },
  staging: {
    enableMLRouting: true,
    enableAnalytics: true,
    cache: { enabled: true, ttlSeconds: 300 },
    router: { maxRetries: 2 },
  },
  production: {
    enableMLRouting: true,
    enableAnalytics: true,
    cache: { enabled: true, ttlSeconds: 600, maxSize: 10000 },
    router: { 
      maxRetries: 3,
      fallbackEnabled: true,
      circuitBreakerThreshold: 5,
    },
  },
};

const client = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
  },
  config: config[process.env.NODE_ENV || 'development'],
});
```

### Health Checks

```typescript
// Implement health checks for monitoring
async function healthCheck() {
  try {
    // Test basic functionality
    const response = await client.chat({
      messages: [{ role: 'user', content: 'health check' }],
      maxTokens: 10,
    });
    
    // Validate API keys
    const validation = await client.validateApiKeys();
    const validProviders = Object.entries(validation)
      .filter(([_, isValid]) => isValid)
      .map(([provider, _]) => provider);
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      validProviders,
      responseTime: response.usage ? 'OK' : 'No usage data',
    };
    
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
}

// Use in Express.js health endpoint
app.get('/health', async (req, res) => {
  const health = await healthCheck();
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### Graceful Shutdown

```typescript
class GracefulShutdownManager {
  constructor(client) {
    this.client = client;
    this.activeRequests = new Set();
    this.isShuttingDown = false;
    
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }
  
  async makeRequest(request, options) {
    if (this.isShuttingDown) {
      throw new Error('Service is shutting down');
    }
    
    const requestPromise = this.client.chat(request, options);
    this.activeRequests.add(requestPromise);
    
    try {
      const response = await requestPromise;
      return response;
    } finally {
      this.activeRequests.delete(requestPromise);
    }
  }
  
  async shutdown() {
    console.log('Graceful shutdown initiated...');
    this.isShuttingDown = true;
    
    // Wait for active requests to complete
    if (this.activeRequests.size > 0) {
      console.log(`Waiting for ${this.activeRequests.size} active requests...`);
      await Promise.allSettled(Array.from(this.activeRequests));
    }
    
    console.log('Graceful shutdown completed');
    process.exit(0);
  }
}

const shutdownManager = new GracefulShutdownManager(client);
```

## Monitoring and Observability

### Structured Logging

```typescript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'ai-requests.log' }),
    new winston.transports.Console()
  ],
});

async function loggedChatCompletion(request, options = {}) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  logger.info('AI request started', {
    requestId,
    userId: options.userId,
    messageCount: request.messages.length,
    optimizeFor: options.optimizeFor,
  });
  
  try {
    const response = await client.chat(request, options);
    const duration = Date.now() - startTime;
    
    logger.info('AI request completed', {
      requestId,
      provider: response.provider,
      model: response.model,
      duration,
      cost: response.usage.cost,
      tokens: response.usage.totalTokens,
    });
    
    return response;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('AI request failed', {
      requestId,
      duration,
      error: error.message,
      code: error.code,
      provider: error.provider,
    });
    
    throw error;
  }
}
```

### Metrics Collection

```typescript
class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: { total: 0, successful: 0, failed: 0 },
      costs: { total: 0, byProvider: {} },
      responseTimes: [],
      providers: {},
    };
  }
  
  recordRequest(provider, cost, responseTime, success) {
    this.metrics.requests.total++;
    
    if (success) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }
    
    this.metrics.costs.total += cost;
    if (!this.metrics.costs.byProvider[provider]) {
      this.metrics.costs.byProvider[provider] = 0;
    }
    this.metrics.costs.byProvider[provider] += cost;
    
    this.metrics.responseTimes.push(responseTime);
    
    if (!this.metrics.providers[provider]) {
      this.metrics.providers[provider] = { count: 0, totalTime: 0 };
    }
    this.metrics.providers[provider].count++;
    this.metrics.providers[provider].totalTime += responseTime;
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      averageResponseTime: this.metrics.responseTimes.length > 0
        ? this.metrics.responseTimes.reduce((a, b) => a + b) / this.metrics.responseTimes.length
        : 0,
      successRate: this.metrics.requests.total > 0
        ? this.metrics.requests.successful / this.metrics.requests.total
        : 0,
    };
  }
}

const metrics = new MetricsCollector();

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
  res.json(metrics.getMetrics());
});
```

### Alerting

```typescript
class AlertManager {
  constructor() {
    this.thresholds = {
      errorRate: 0.05, // 5%
      averageResponseTime: 5000, // 5 seconds
      costPerHour: 10.00, // $10 per hour
    };
    
    this.hourlyStats = { requests: 0, cost: 0, errors: 0 };
    setInterval(() => this.checkAlerts(), 60000); // Check every minute
    setInterval(() => this.resetHourlyStats(), 3600000); // Reset every hour
  }
  
  recordRequest(cost, responseTime, error) {
    this.hourlyStats.requests++;
    this.hourlyStats.cost += cost;
    if (error) this.hourlyStats.errors++;
    
    // Check immediate thresholds
    if (responseTime > this.thresholds.averageResponseTime) {
      this.alert('HIGH_RESPONSE_TIME', `Response time: ${responseTime}ms`);
    }
  }
  
  checkAlerts() {
    if (this.hourlyStats.requests > 0) {
      const errorRate = this.hourlyStats.errors / this.hourlyStats.requests;
      
      if (errorRate > this.thresholds.errorRate) {
        this.alert('HIGH_ERROR_RATE', `Error rate: ${(errorRate * 100).toFixed(2)}%`);
      }
      
      if (this.hourlyStats.cost > this.thresholds.costPerHour) {
        this.alert('HIGH_COST', `Hourly cost: $${this.hourlyStats.cost.toFixed(2)}`);
      }
    }
  }
  
  alert(type, message) {
    console.error(`ALERT [${type}]: ${message}`);
    
    // Send to monitoring system
    // sendToSlack(type, message);
    // sendToEmail(type, message);
    // sendToMonitoringSystem(type, message);
  }
  
  resetHourlyStats() {
    this.hourlyStats = { requests: 0, cost: 0, errors: 0 };
  }
}

const alertManager = new AlertManager();
```

Following these best practices will help you build robust, cost-effective, and scalable applications with the AI Marketplace SDK.