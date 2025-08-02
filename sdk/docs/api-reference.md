# AI Marketplace SDK API Reference

Complete API reference for the AI Marketplace SDK with detailed method documentation, parameters, return types, and examples.

## Table of Contents

1. [Client Creation](#client-creation)
2. [Core Methods](#core-methods)
3. [Configuration](#configuration)
4. [Types and Interfaces](#types-and-interfaces)
5. [Error Handling](#error-handling)
6. [Examples](#examples)

## Client Creation

### `createClient(options: ClientOptions): AIMarketplaceClient`

Creates a new AI Marketplace SDK client instance.

#### Parameters

- `options` (ClientOptions): Configuration options for the client

```typescript
interface ClientOptions {
  apiKeys: {
    openai?: string;
    anthropic?: string;
    google?: string;
  };
  config?: SDKConfig;
  baseUrls?: {
    openai?: string;
    anthropic?: string;
    google?: string;
  };
}
```

#### Example

```typescript
import { createClient, APIProvider } from '@ai-marketplace/sdk';

const client = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
  },
  config: {
    enableMLRouting: true,
    defaultProvider: APIProvider.OPENAI,
  },
});
```

---

## Core Methods

### `chat(request: AIRequest, options?: ChatOptions): Promise<AIResponse>`

Sends a chat completion request with intelligent provider routing.

#### Parameters

- `request` (AIRequest): The chat request configuration
- `options` (ChatOptions, optional): Additional request options

```typescript
interface AIRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: Tool[];
  stream?: boolean;
}

interface ChatOptions {
  provider?: APIProvider;
  userId?: string;
  useCache?: boolean;
  enableMLRouting?: boolean;
  optimizeFor?: 'cost' | 'speed' | 'quality' | 'balanced';
}
```

#### Returns

`Promise<AIResponse>` - The AI response with metadata

```typescript
interface AIResponse {
  id: string;
  choices: Choice[];
  usage: Usage;
  provider: APIProvider;
  model: string;
  created: number;
}
```

#### Example

```typescript
const response = await client.chat({
  messages: [
    { role: 'user', content: 'Explain quantum computing' }
  ],
  temperature: 0.7,
  maxTokens: 500
}, {
  optimizeFor: 'quality',
  userId: 'user123'
});

console.log(response.choices[0].message.content);
console.log(`Cost: $${response.usage.cost.toFixed(6)}`);
console.log(`Provider: ${response.provider}`);
```

---

### `chatStream(request: AIRequest, options?: ChatOptions): AsyncIterable<AIStreamChunk>`

Sends a streaming chat completion request.

#### Parameters

- `request` (AIRequest): The chat request configuration (stream will be set to true)
- `options` (ChatOptions, optional): Additional request options

#### Returns

`AsyncIterable<AIStreamChunk>` - Stream of response chunks

```typescript
interface AIStreamChunk {
  id: string;
  choices: StreamChoice[];
  provider?: APIProvider;
  model?: string;
  created: number;
}
```

#### Example

```typescript
const stream = client.chatStream({
  messages: [
    { role: 'user', content: 'Write a story about AI' }
  ]
}, {
  optimizeFor: 'speed'
});

for await (const chunk of stream) {
  if (chunk.choices[0].delta.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}
```

---

### `getModels(provider?: APIProvider): Promise<AIModel[]>`

Retrieves available models from providers.

#### Parameters

- `provider` (APIProvider, optional): Specific provider to query. If omitted, returns models from all providers.

#### Returns

`Promise<AIModel[]>` - Array of available models

```typescript
interface AIModel {
  id: string;
  provider: APIProvider;
  name: string;
  description?: string;
  contextLength?: number;
  pricing?: {
    input: number;
    output: number;
    unit: string;
  };
}
```

#### Example

```typescript
// Get all models
const allModels = await client.getModels();

// Get OpenAI models only
const openaiModels = await client.getModels(APIProvider.OPENAI);

console.log('Available models:', allModels.map(m => m.id));
```

---

### `validateApiKeys(): Promise<Record<APIProvider, boolean>>`

Validates all configured API keys.

#### Returns

`Promise<Record<APIProvider, boolean>>` - Object mapping providers to validation status

#### Example

```typescript
const validation = await client.validateApiKeys();

console.log('OpenAI key valid:', validation[APIProvider.OPENAI]);
console.log('Anthropic key valid:', validation[APIProvider.ANTHROPIC]);
console.log('Google key valid:', validation[APIProvider.GOOGLE]);
```

---

### `estimateCost(request: AIRequest, provider?: APIProvider): Promise<CostEstimate[]>`

Estimates the cost of a request across providers.

#### Parameters

- `request` (AIRequest): The request to estimate cost for
- `provider` (APIProvider, optional): Specific provider to estimate. If omitted, estimates for all providers.

#### Returns

`Promise<CostEstimate[]>` - Array of cost estimates sorted by cost (lowest first)

```typescript
interface CostEstimate {
  provider: APIProvider;
  cost: number;
  breakdown?: {
    inputTokens: number;
    outputTokens: number;
    inputCost: number;
    outputCost: number;
  };
}
```

#### Example

```typescript
const estimates = await client.estimateCost({
  messages: [
    { role: 'user', content: 'Explain machine learning' }
  ]
});

estimates.forEach(({ provider, cost }) => {
  console.log(`${provider}: $${cost.toFixed(6)}`);
});
```

---

### `getAnalytics(userId?: string): Promise<MLAnalytics>`

Retrieves ML routing analytics and insights.

#### Parameters

- `userId` (string, optional): Specific user to get analytics for. If omitted, returns global analytics.

#### Returns

`Promise<MLAnalytics>` - Analytics data and insights

```typescript
interface MLAnalytics {
  totalPredictions: number;
  averageConfidence: number;
  accuracyMetrics: {
    costPredictionAccuracy: number;
    speedPredictionAccuracy: number;
    qualityPredictionAccuracy: number;
  };
  userPatterns?: {
    commonRequestTypes: string[];
    preferredProviders: APIProvider[];
    costSavingsAchieved: number;
  };
  modelRecommendations: ModelRecommendation[];
}
```

#### Example

```typescript
const analytics = await client.getAnalytics('user123');

console.log('Total predictions:', analytics.totalPredictions);
console.log('Average confidence:', analytics.averageConfidence);
console.log('Cost savings:', analytics.userPatterns?.costSavingsAchieved);

analytics.modelRecommendations.forEach(rec => {
  console.log(`${rec.scenario}: Use ${rec.recommendedProvider}`);
});
```

---

### `clearCache(): void`

Clears the response cache.

#### Example

```typescript
client.clearCache();
console.log('Cache cleared');
```

---

### `updateConfig(config: Partial<SDKConfig>): void`

Updates the client configuration.

#### Parameters

- `config` (Partial<SDKConfig>): Configuration updates to apply

#### Example

```typescript
client.updateConfig({
  router: {
    fallbackEnabled: false,
    maxRetries: 5
  },
  cache: {
    enabled: false
  }
});
```

---

## Configuration

### `SDKConfig`

Complete SDK configuration interface.

```typescript
interface SDKConfig {
  enableMLRouting?: boolean;
  enableAnalytics?: boolean;
  defaultProvider?: APIProvider;
  timeout?: number;
  router?: RouterConfig;
  cache?: CacheConfig;
}
```

### `RouterConfig`

Configuration for request routing behavior.

```typescript
interface RouterConfig {
  fallbackEnabled?: boolean;
  fallbackOrder?: APIProvider[];
  costOptimizationEnabled?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  circuitBreakerThreshold?: number;
  circuitBreakerTimeout?: number;
}
```

**Default Values:**
```typescript
const DEFAULT_ROUTER_CONFIG: RouterConfig = {
  fallbackEnabled: true,
  fallbackOrder: [APIProvider.GOOGLE, APIProvider.ANTHROPIC, APIProvider.OPENAI],
  costOptimizationEnabled: true,
  maxRetries: 3,
  retryDelay: 1000,
  circuitBreakerThreshold: 5,
  circuitBreakerTimeout: 30000,
};
```

### `CacheConfig`

Configuration for response caching.

```typescript
interface CacheConfig {
  enabled?: boolean;
  ttlSeconds?: number;
  maxSize?: number;
  keyStrategy?: 'full_request' | 'content_hash';
}
```

**Default Values:**
```typescript
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  ttlSeconds: 300,
  maxSize: 1000,
  keyStrategy: 'content_hash',
};
```

---

## Types and Interfaces

### `APIProvider`

Enumeration of supported AI providers.

```typescript
enum APIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google'
}
```

### `AIMessage`

Message in a conversation.

```typescript
interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
}
```

### `Tool`

Function/tool definition for function calling.

```typescript
interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}
```

### `Choice`

Response choice from AI model.

```typescript
interface Choice {
  index: number;
  message: AIMessage;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
}
```

### `Usage`

Token usage and cost information.

```typescript
interface Usage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  costBreakdown?: {
    inputCost: number;
    outputCost: number;
    inputTokens: number;
    outputTokens: number;
  };
}
```

### `MLRouteDecision`

ML routing decision details.

```typescript
interface MLRouteDecision {
  selectedProvider: APIProvider;
  selectedModel: string;
  confidence: number;
  reasoning: string;
  alternatives: {
    provider: APIProvider;
    model: string;
    score: number;
  }[];
  features: RequestFeatures;
}
```

---

## Error Handling

### `AIError`

Custom error class for AI Marketplace SDK errors.

```typescript
class AIError extends Error {
  code: string;
  type: 'authentication' | 'invalid_request' | 'rate_limit' | 'server_error' | 'network_error';
  provider: APIProvider;
  retryable: boolean;
  details?: any;
}
```

### Error Codes

Common error codes and their meanings:

- `API_KEY_MISSING`: API key not provided for the selected provider
- `API_KEY_INVALID`: API key is invalid or expired
- `PROVIDER_NOT_AVAILABLE`: Requested provider is not configured
- `RATE_LIMIT_EXCEEDED`: Provider rate limit exceeded
- `REQUEST_TIMEOUT`: Request timed out
- `INVALID_REQUEST`: Request format or parameters are invalid
- `MODEL_NOT_FOUND`: Specified model is not available
- `CONTENT_FILTER`: Content was filtered by provider safety systems
- `SERVER_ERROR`: Provider server error
- `NETWORK_ERROR`: Network connectivity issues
- `ML_ROUTING_DISABLED`: ML routing is disabled but required for operation

### Error Handling Example

```typescript
import { AIError } from '@ai-marketplace/sdk';

try {
  const response = await client.chat({
    messages: [{ role: 'user', content: 'Hello' }]
  });
} catch (error) {
  if (error instanceof AIError) {
    console.error('AI Error:', {
      code: error.code,
      type: error.type,
      provider: error.provider,
      retryable: error.retryable,
      message: error.message
    });
    
    if (error.retryable) {
      // Implement retry logic
      console.log('Error is retryable, consider retrying...');
    }
    
    switch (error.code) {
      case 'API_KEY_MISSING':
        console.log('Please provide an API key for', error.provider);
        break;
      case 'RATE_LIMIT_EXCEEDED':
        console.log('Rate limit exceeded, waiting before retry...');
        break;
      case 'REQUEST_TIMEOUT':
        console.log('Request timed out, consider increasing timeout');
        break;
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## Examples

### Basic Chat Completion

```typescript
import { createClient } from '@ai-marketplace/sdk';

const client = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
  }
});

const response = await client.chat({
  messages: [
    { role: 'user', content: 'What is the capital of France?' }
  ]
});

console.log(response.choices[0].message.content);
```

### Function Calling

```typescript
const response = await client.chat({
  messages: [
    { role: 'user', content: 'What\'s the weather like in San Francisco?' }
  ],
  tools: [
    {
      type: 'function',
      function: {
        name: 'get_weather',
        description: 'Get current weather for a location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'The city and state, e.g. San Francisco, CA'
            }
          },
          required: ['location']
        }
      }
    }
  ]
});

// Check if the model wants to call a function
if (response.choices[0].message.toolCalls) {
  const toolCall = response.choices[0].message.toolCalls[0];
  console.log('Function to call:', toolCall.function.name);
  console.log('Arguments:', toolCall.function.arguments);
}
```

### Streaming Response

```typescript
console.log('AI: ');

const stream = client.chatStream({
  messages: [
    { role: 'user', content: 'Tell me a story about a robot' }
  ]
});

for await (const chunk of stream) {
  if (chunk.choices[0].delta.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}

console.log('\n'); // New line after streaming
```

### Cost Optimization

```typescript
// Get cost estimates before making request
const estimates = await client.estimateCost({
  messages: [
    { role: 'user', content: 'Explain quantum computing in detail' }
  ]
});

console.log('Cost estimates:');
estimates.forEach(({ provider, cost }) => {
  console.log(`${provider}: $${cost.toFixed(6)}`);
});

// Make cost-optimized request
const response = await client.chat({
  messages: [
    { role: 'user', content: 'Explain quantum computing in detail' }
  ]
}, {
  optimizeFor: 'cost'
});

console.log(`Selected provider: ${response.provider}`);
console.log(`Actual cost: $${response.usage.cost.toFixed(6)}`);
```

### Multi-Provider Setup with Fallback

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
      fallbackEnabled: true,
      fallbackOrder: [APIProvider.GOOGLE, APIProvider.ANTHROPIC, APIProvider.OPENAI],
      maxRetries: 3
    }
  }
});

// This will automatically use the best provider and fallback if needed
const response = await client.chat({
  messages: [
    { role: 'user', content: 'Explain the benefits of renewable energy' }
  ]
}, {
  optimizeFor: 'balanced'
});
```

### Advanced Configuration

```typescript
const client = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
  },
  config: {
    enableMLRouting: true,
    enableAnalytics: true,
    defaultProvider: APIProvider.OPENAI,
    timeout: 45000,
    
    router: {
      fallbackEnabled: true,
      fallbackOrder: [APIProvider.GOOGLE, APIProvider.ANTHROPIC, APIProvider.OPENAI],
      costOptimizationEnabled: true,
      maxRetries: 5,
      retryDelay: 2000,
      circuitBreakerThreshold: 3,
      circuitBreakerTimeout: 60000,
    },
    
    cache: {
      enabled: true,
      ttlSeconds: 600, // 10 minutes
      maxSize: 5000,
      keyStrategy: 'content_hash',
    },
  },
});

// Use with custom user ID for analytics
const response = await client.chat({
  messages: [
    { role: 'user', content: 'Write a Python function to calculate Fibonacci numbers' }
  ]
}, {
  userId: 'developer_123',
  optimizeFor: 'quality',
  useCache: true
});

// Later, get analytics for this user
const analytics = await client.getAnalytics('developer_123');
console.log('User patterns:', analytics.userPatterns);
```

### Browser Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>AI Marketplace SDK Browser Example</title>
</head>
<body>
    <div id="output"></div>
    
    <script type="module">
        import { createClient } from 'https://unpkg.com/@ai-marketplace/sdk';
        
        // Note: In production, get API keys securely from your backend
        const client = createClient({
            apiKeys: {
                openai: await getApiKeyFromBackend(), // Implement this function
            }
        });
        
        async function askAI() {
            const response = await client.chat({
                messages: [
                    { role: 'user', content: 'Hello from the browser!' }
                ]
            });
            
            document.getElementById('output').textContent = 
                response.choices[0].message.content;
        }
        
        askAI();
    </script>
</body>
</html>
```

---

For more examples and use cases, see the [Getting Started Guide](./getting-started.md) and check out the example applications in the `/test-applications` directory.