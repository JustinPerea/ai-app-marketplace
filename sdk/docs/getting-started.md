# Getting Started with AI Marketplace SDK

Welcome to the AI Marketplace SDK! This guide will walk you through everything you need to know to get up and running with our intelligent AI provider routing system in under 10 minutes.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [API Key Setup](#api-key-setup)
4. [First API Call](#first-api-call)
5. [Understanding ML Routing](#understanding-ml-routing)
6. [Common Use Cases](#common-use-cases)
7. [Next Steps](#next-steps)

## Prerequisites

Before you begin, ensure you have:

- **Node.js 14.0.0 or higher** installed on your system
- **npm** or **yarn** package manager
- At least one API key from supported providers:
  - [OpenAI API Key](https://platform.openai.com/api-keys)
  - [Anthropic API Key](https://console.anthropic.com/)
  - [Google AI API Key](https://makersuite.google.com/app/apikey)

## Installation

### Using npm

```bash
npm install @ai-marketplace/sdk
```

### Using yarn

```bash
yarn add @ai-marketplace/sdk
```

### Verify Installation

Create a simple test file to verify the installation:

```bash
# Create a test file
touch test-sdk.js

# Add basic import test
echo "const { createClient } = require('@ai-marketplace/sdk'); console.log('SDK imported successfully!');" > test-sdk.js

# Run the test
node test-sdk.js
```

You should see: `SDK imported successfully!`

## API Key Setup

### Environment Variables (Recommended)

Create a `.env` file in your project root:

```bash
# .env file
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
```

Install dotenv to load environment variables:

```bash
npm install dotenv
```

### Direct Configuration (Development Only)

```typescript
// Only for development - never commit API keys to version control
const client = createClient({
  apiKeys: {
    openai: 'sk-...',
    anthropic: 'sk-ant-...',
    google: 'AI...',
  },
});
```

> **Security Warning**: Never hardcode API keys in production code. Always use environment variables or secure key management systems.

## First API Call

Let's create your first AI application using the SDK:

### Step 1: Create Your First App

Create a new file called `my-first-ai-app.js`:

```javascript
// my-first-ai-app.js
require('dotenv').config();
const { createClient, APIProvider } = require('@ai-marketplace/sdk');

async function myFirstAIApp() {
  // Create the SDK client
  const client = createClient({
    apiKeys: {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY,
    },
    config: {
      enableMLRouting: true, // Enable intelligent routing
      defaultProvider: APIProvider.OPENAI,
    },
  });

  try {
    console.log('🚀 Making your first AI request...');
    
    // Make your first AI request
    const response = await client.chat({
      messages: [
        { 
          role: 'user', 
          content: 'Hello! Please introduce yourself and explain what you can help me with.' 
        }
      ],
    });

    // Display the results
    console.log('\n✨ Response from AI:');
    console.log(response.choices[0].message.content);
    console.log('\n📊 Request Details:');
    console.log(`Provider used: ${response.provider}`);
    console.log(`Cost: $${response.usage.cost.toFixed(6)}`);
    console.log(`Tokens: ${response.usage.totalTokens}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the app
myFirstAIApp();
```

### Step 2: Run Your First App

```bash
node my-first-ai-app.js
```

Expected output:
```
🚀 Making your first AI request...

✨ Response from AI:
Hello! I'm an AI assistant powered by the AI Marketplace SDK. I can help you with a wide variety of tasks including...

📊 Request Details:
Provider used: openai
Cost: $0.000015
Tokens: 45
```

Congratulations! You've successfully made your first AI API call using the SDK.

## Understanding ML Routing

The SDK's ML routing system automatically selects the best AI provider for each request. Here's how to leverage it:

### Basic ML Routing

```javascript
// Let the SDK choose the best provider automatically
const response = await client.chat({
  messages: [
    { role: 'user', content: 'Explain quantum computing' }
  ],
}, {
  optimizeFor: 'balanced' // Options: 'cost', 'speed', 'quality', 'balanced'
});

console.log(`AI chose: ${response.provider}`);
```

### Cost Optimization

```javascript
// Optimize for lowest cost
const costOptimized = await client.chat({
  messages: [
    { role: 'user', content: 'Write a short poem about technology' }
  ],
}, {
  optimizeFor: 'cost'
});

console.log(`Cost-optimized choice: ${costOptimized.provider}`);
console.log(`Cost: $${costOptimized.usage.cost.toFixed(6)}`);
```

### Speed Optimization

```javascript
// Optimize for fastest response
const speedOptimized = await client.chat({
  messages: [
    { role: 'user', content: 'What is 2+2?' }
  ],
}, {
  optimizeFor: 'speed'
});

console.log(`Fastest provider: ${speedOptimized.provider}`);
```

### Quality Optimization

```javascript
// Optimize for highest quality responses
const qualityOptimized = await client.chat({
  messages: [
    { role: 'user', content: 'Write a detailed analysis of climate change impacts' }
  ],
}, {
  optimizeFor: 'quality'
});

console.log(`Quality-optimized choice: ${qualityOptimized.provider}`);
```

## Common Use Cases

### 1. Simple Chatbot

```javascript
async function simpleChatbot() {
  const client = createClient({
    apiKeys: { openai: process.env.OPENAI_API_KEY },
  });

  const response = await client.chat({
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'How do I bake a chocolate cake?' }
    ],
  });

  return response.choices[0].message.content;
}
```

### 2. Streaming Responses

```javascript
async function streamingChat() {
  const client = createClient({
    apiKeys: { openai: process.env.OPENAI_API_KEY },
  });

  console.log('AI: ');
  const stream = client.chatStream({
    messages: [
      { role: 'user', content: 'Tell me a story about a robot' }
    ],
  });

  for await (const chunk of stream) {
    if (chunk.choices[0].delta.content) {
      process.stdout.write(chunk.choices[0].delta.content);
    }
  }
  console.log('\n');
}
```

### 3. Cost Comparison

```javascript
async function compareCosts() {
  const client = createClient({
    apiKeys: {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY,
    },
  });

  const request = {
    messages: [
      { role: 'user', content: 'Explain machine learning in 100 words' }
    ],
  };

  const estimates = await client.estimateCost(request);
  
  console.log('💰 Cost Comparison:');
  estimates.forEach(({ provider, cost }) => {
    console.log(`${provider}: $${cost.toFixed(6)}`);
  });
}
```

### 4. Function Calling

```javascript
async function weatherBot() {
  const client = createClient({
    apiKeys: { openai: process.env.OPENAI_API_KEY },
  });

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

  return response;
}
```

## Advanced Configuration

### Complete Configuration Example

```javascript
const client = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
  },
  config: {
    // ML Routing Settings
    enableMLRouting: true,
    enableAnalytics: true,
    defaultProvider: APIProvider.OPENAI,
    timeout: 30000,
    
    // Router Configuration
    router: {
      fallbackEnabled: true,
      fallbackOrder: [APIProvider.GOOGLE, APIProvider.ANTHROPIC, APIProvider.OPENAI],
      costOptimizationEnabled: true,
      maxRetries: 3,
    },
    
    // Cache Configuration
    cache: {
      enabled: true,
      ttlSeconds: 300, // 5 minutes
      maxSize: 1000,
    },
  },
});
```

### Analytics and Insights

```javascript
async function getInsights() {
  const analytics = await client.getAnalytics();
  
  console.log('📊 ML Analytics:');
  console.log(`Total predictions: ${analytics.totalPredictions}`);
  console.log(`Average confidence: ${(analytics.averageConfidence * 100).toFixed(1)}%`);
  
  console.log('\n🎯 Model Recommendations:');
  analytics.modelRecommendations.forEach(rec => {
    console.log(`${rec.scenario}: Use ${rec.recommendedProvider} (${rec.expectedSavings}% savings)`);
  });
}
```

## Error Handling

Always wrap your API calls in try-catch blocks:

```javascript
const { AIError } = require('@ai-marketplace/sdk');

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
      console.log('This error is retryable');
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Next Steps

Congratulations! You now have a solid foundation with the AI Marketplace SDK. Here's what to explore next:

### 1. Explore More Examples
- Check out the `/examples` directory in the SDK
- Try the streaming examples
- Experiment with function calling

### 2. Learn Advanced Features
- [API Reference Documentation](./api-reference.md)
- [Best Practices Guide](./best-practices.md)
- [Integration Guides](./integrations/)

### 3. Build Real Applications
- Start with our [test applications](../test-applications/)
- Review the [troubleshooting guide](./troubleshooting.md)
- Check [performance benchmarks](./performance.md)

### 4. Join the Community
- Submit issues on [GitHub](https://github.com/JustinPerea/cosmara-ai-sdk/issues)
- Share your use cases
- Contribute to the project

## Quick Reference

### Essential Imports
```javascript
const { createClient, APIProvider, AIError } = require('@ai-marketplace/sdk');
```

### Basic Client Creation
```javascript
const client = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    // Add other providers as needed
  },
});
```

### Basic Chat Request
```javascript
const response = await client.chat({
  messages: [
    { role: 'user', content: 'Your message here' }
  ],
});
```

### Optimization Options
- `optimizeFor: 'cost'` - Cheapest provider
- `optimizeFor: 'speed'` - Fastest response
- `optimizeFor: 'quality'` - Highest quality
- `optimizeFor: 'balanced'` - Balanced approach

---

## Need Help?

- 📖 [Full API Reference](./api-reference.md)
- 🛠️ [Troubleshooting Guide](./troubleshooting.md)
- 💡 [Best Practices](./best-practices.md)
- 🐛 [Report Issues](https://github.com/JustinPerea/cosmara-ai-sdk/issues)

Happy coding with AI Marketplace SDK!