# AI Marketplace SDK

A TypeScript SDK for intelligent AI provider routing with ML-powered optimization. Supports OpenAI, Anthropic, and Google AI with **zero external dependencies**.

## 🚀 Features

- **Multi-Provider Support**: OpenAI, Anthropic Claude, and Google Gemini
- **ML-Powered Routing**: Intelligent provider selection based on cost, speed, and quality
- **Zero Dependencies**: Completely self-contained with no external dependencies
- **TypeScript Native**: Full TypeScript support with comprehensive type definitions
- **Streaming Support**: Real-time streaming responses from all providers
- **Cost Optimization**: Automatic cost analysis and provider recommendations
- **Caching**: Built-in response caching for improved performance
- **Fallback Logic**: Automatic failover between providers
- **Analytics**: Detailed insights into usage patterns and cost savings

## 📦 Installation

```bash
npm install @ai-marketplace/sdk
```

## 🏃‍♂️ Quick Start

```typescript
import { createClient, APIProvider } from '@ai-marketplace/sdk';

const client = createClient({
  apiKeys: {
    openai: 'your-openai-api-key',
    anthropic: 'your-anthropic-api-key',
    google: 'your-google-api-key',
  },
  config: {
    enableMLRouting: true,
    defaultProvider: APIProvider.OPENAI,
  },
});

// Simple chat completion
const response = await client.chat({
  messages: [
    { role: 'user', content: 'Hello, how are you?' }
  ],
});

console.log(response.choices[0].message.content);
```

## 🧠 ML-Powered Routing

The SDK automatically learns from your usage patterns to optimize provider selection:

```typescript
// Let the ML router choose the best provider
const response = await client.chat({
  messages: [
    { role: 'user', content: 'Write a Python function to calculate fibonacci numbers' }
  ],
}, {
  optimizeFor: 'cost', // 'cost' | 'speed' | 'quality' | 'balanced'
});

// Get analytics and insights
const analytics = await client.getAnalytics();
console.log('Cost savings achieved:', analytics.userPatterns?.costSavingsAchieved);
```

## 🌊 Streaming

Stream responses in real-time:

```typescript
const stream = client.chatStream({
  messages: [
    { role: 'user', content: 'Tell me a story about AI' }
  ],
});

for await (const chunk of stream) {
  if (chunk.choices[0].delta.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}
```

## 💰 Cost Optimization

Get cost estimates and comparisons across providers:

```typescript
const estimates = await client.estimateCost({
  messages: [
    { role: 'user', content: 'Analyze this data...' }
  ],
});

// Results sorted by cost (lowest first)
estimates.forEach(({ provider, cost }) => {
  console.log(`${provider}: $${cost.toFixed(4)}`);
});
```

## 🔧 Configuration

### Basic Configuration

```typescript
import { createClient, APIProvider } from '@ai-marketplace/sdk';

const client = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
  },
  config: {
    // Enable ML-powered routing (default: true)
    enableMLRouting: true,
    
    // Enable analytics collection (default: true)
    enableAnalytics: true,
    
    // Default provider when ML routing is disabled
    defaultProvider: APIProvider.OPENAI,
    
    // Request timeout in milliseconds
    timeout: 30000,
    
    // Router configuration
    router: {
      fallbackEnabled: true,
      fallbackOrder: [APIProvider.GOOGLE, APIProvider.ANTHROPIC, APIProvider.OPENAI],
      costOptimizationEnabled: true,
      maxRetries: 3,
    },
    
    // Cache configuration
    cache: {
      enabled: true,
      ttlSeconds: 300, // 5 minutes
      maxSize: 1000,
    },
  },
});
```

### Provider-Specific Requests

```typescript
// Force a specific provider
const response = await client.chat({
  messages: [{ role: 'user', content: 'Hello!' }],
}, {
  provider: APIProvider.ANTHROPIC,
});

// Use specific model
const response = await client.chat({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
}, {
  provider: APIProvider.OPENAI,
});
```

## 🛠️ Advanced Usage

### Tool/Function Calling

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
              description: 'The city and state, e.g. San Francisco, CA',
            },
          },
          required: ['location'],
        },
      },
    },
  ],
});
```

### Custom User ID for Analytics

```typescript
const response = await client.chat({
  messages: [{ role: 'user', content: 'Hello!' }],
}, {
  userId: 'user123', // Track usage per user
  optimizeFor: 'balanced',
});
```

### Caching Control

```typescript
// Disable cache for this request
const response = await client.chat({
  messages: [{ role: 'user', content: 'What time is it?' }],
}, {
  useCache: false,
});

// Clear all cached responses
client.clearCache();
```

## 📊 Analytics & Insights

```typescript
const insights = await client.getAnalytics('user123');

console.log('Total predictions:', insights.totalPredictions);
console.log('Average confidence:', insights.averageConfidence);
console.log('Accuracy metrics:', insights.accuracyMetrics);

// User-specific patterns
if (insights.userPatterns) {
  console.log('Common request types:', insights.userPatterns.commonRequestTypes);
  console.log('Cost savings achieved:', insights.userPatterns.costSavingsAchieved);
}

// Model recommendations
insights.modelRecommendations.forEach(rec => {
  console.log(`${rec.scenario}: Use ${rec.recommendedProvider} (${rec.expectedSavings}% savings)`);
});
```

## 🔍 Model Information

```typescript
// Get all available models
const allModels = await client.getModels();

// Get models from specific provider
const openaiModels = await client.getModels(APIProvider.OPENAI);

// Validate API keys
const validationResults = await client.validateApiKeys();
console.log('OpenAI key valid:', validationResults[APIProvider.OPENAI]);
```

## 🚨 Error Handling

```typescript
import { AIError } from '@ai-marketplace/sdk';

try {
  const response = await client.chat({
    messages: [{ role: 'user', content: 'Hello!' }],
  });
} catch (error) {
  if (error instanceof AIError) {
    console.error('AI Error:', {
      code: error.code,
      type: error.type,
      provider: error.provider,
      retryable: error.retryable,
      message: error.message,
    });
    
    if (error.retryable) {
      // Implement retry logic
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 🌐 Browser Support

The SDK works in both Node.js and browser environments. For browser usage, make sure to handle API keys securely (preferably through a backend proxy).

```html
<script type="module">
  import { createClient, APIProvider } from 'https://unpkg.com/@ai-marketplace/sdk';
  
  const client = createClient({
    apiKeys: {
      openai: await getApiKeyFromBackend(), // Secure API key handling
    },
  });
</script>
```

## 📈 Performance

- **Bundle Size**: < 50KB minified
- **Zero Dependencies**: No external dependencies
- **Tree Shaking**: Full ES modules support
- **Response Time**: Optimized for <200ms routing decisions
- **Memory Usage**: Efficient caching with configurable limits

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our GitHub repository.

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/JustinPerea/cosmara-ai-sdk)
- [API Documentation](https://github.com/JustinPerea/cosmara-ai-sdk/docs)
- [Examples](https://github.com/JustinPerea/cosmara-ai-sdk/examples)
- [Issues & Support](https://github.com/JustinPerea/cosmara-ai-sdk/issues)

---

Made with ❤️ by the AI Marketplace team