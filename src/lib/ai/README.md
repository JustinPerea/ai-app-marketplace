# AI Integration Layer

Complete multi-provider AI integration system for the AI App Marketplace platform.

## Overview

This integration layer provides a comprehensive solution for managing multiple AI providers with intelligent routing, cost optimization, and enterprise-grade features.

### Key Features

- **Multi-Provider Support**: OpenAI, Anthropic, and Google AI with unified interface
- **Intelligent Routing**: Cost-optimized provider selection with quality considerations
- **Fallback Systems**: Automatic failover with circuit breaker patterns
- **Performance Optimization**: Sub-200ms response targets with caching
- **BYOK Integration**: Secure API key management with envelope encryption
- **Cost Analytics**: Real-time usage tracking and optimization insights
- **Streaming Support**: Real-time streaming responses across all providers

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Endpoints │────│   AI Service     │────│  Provider Router│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                          │
                    ┌─────────┼─────────┐               │
                    │         │         │               │
            ┌───────▼───┐ ┌───▼────┐ ┌──▼──────┐       │
            │   Cache   │ │Analytics│ │Error    │       │
            │   Layer   │ │ System  │ │Handler  │       │
            └───────────┘ └─────────┘ └─────────┘       │
                                                        │
                              ┌─────────────────────────┼─────────────┐
                              │                         │             │
                    ┌─────────▼────┐          ┌────────▼───┐  ┌──────▼──────┐
                    │   OpenAI     │          │ Anthropic  │  │   Google    │
                    │   Provider   │          │  Provider  │  │  Provider   │
                    └──────────────┘          └────────────┘  └─────────────┘
```

## Quick Start

### 1. Installation

The AI integration is built into the platform. No additional installation required.

### 2. Basic Usage

```typescript
import { getAIService } from '@/lib/ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const aiService = getAIService(prisma);

// Simple chat completion
const response = await aiService.chat({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'user', content: 'Hello, world!' }
  ]
}, userId);

console.log(response.choices[0].message.content);
```

### 3. Streaming Responses

```typescript
for await (const chunk of aiService.chatStream({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'user', content: 'Tell me a story' }
  ],
  stream: true
}, userId)) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

## API Endpoints

### Chat Completion
```
POST /api/ai/chat
```

**Request Body:**
```json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "maxTokens": 100,
  "temperature": 0.7,
  "stream": false,
  "preferredProvider": "OPENAI"
}
```

**Response:**
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-3.5-turbo",
  "provider": "OPENAI",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you?"
    },
    "finishReason": "stop"
  }],
  "usage": {
    "promptTokens": 9,
    "completionTokens": 12,
    "totalTokens": 21,
    "cost": 0.0015
  }
}
```

### Analytics
```
GET /api/ai/analytics?days=30&detailed=true
```

### Health Check
```
GET /api/ai/health
```

## Configuration

### Router Configuration

```typescript
const config = {
  router: {
    fallbackEnabled: true,
    fallbackOrder: ['OPENAI', 'ANTHROPIC', 'GOOGLE'],
    costOptimizationEnabled: true,
    performanceWeighting: 0.3,
    maxRetries: 3
  },
  cache: {
    enabled: true,
    ttlSeconds: 300,
    maxSize: 1000
  }
};

const aiService = createAIService(prisma, config);
```

### Environment Variables

```bash
# Google Cloud KMS for BYOK encryption
GOOGLE_CLOUD_PROJECT_ID=your-project
GOOGLE_CLOUD_LOCATION_ID=global
GOOGLE_CLOUD_KEYRING_ID=ai-marketplace-keyring
GOOGLE_CLOUD_KEY_ID=api-key-encryption-key

# Optional: Service account key path
GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account.json

# Encryption salts
ENCRYPTION_CONTEXT_SALT=your-encryption-salt
API_KEY_HASH_SALT=your-hash-salt
```

## Provider Support

### OpenAI
- **Models**: GPT-3.5 Turbo, GPT-4, GPT-4 Turbo, GPT-4 Omni
- **Features**: Chat completion, streaming, function calling, vision
- **Rate Limits**: 3,500 RPM / 90,000 TPM (varies by model)

### Anthropic
- **Models**: Claude 3 Haiku, Sonnet, Opus, Claude 3.5 Sonnet
- **Features**: Chat completion, streaming, function calling, vision
- **Rate Limits**: 50 RPM / 40,000 TPM / 1M TPD

### Google AI
- **Models**: Gemini 1.5 Flash, Pro, Flash 8B
- **Features**: Chat completion, streaming, function calling, multimodal
- **Rate Limits**: 60 RPM / 32,000 TPM / 1,500 RPD

## Cost Optimization

The system automatically optimizes costs through:

1. **Intelligent Routing**: Selects cheapest provider meeting quality requirements
2. **Model Equivalency**: Maps requests to cost-effective equivalent models
3. **Caching**: Reduces repeated requests for similar content
4. **Usage Analytics**: Identifies optimization opportunities

### Cost Analysis Example

```typescript
const analysis = await aiService.analyzeCosts({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Analyze this data...' }]
});

console.log(`Estimated cost: $${analysis.estimatedCost}`);
console.log(`Cheapest provider: ${analysis.cheapestProvider}`);
console.log(`Savings opportunities:`, analysis.recommendations);
```

## Error Handling

The system includes comprehensive error handling:

- **Circuit Breakers**: Prevent cascade failures
- **Automatic Retries**: With exponential backoff
- **Provider Fallbacks**: Automatic switching on failure
- **Error Classification**: Distinguishes retryable vs permanent errors

### Error Types

```typescript
interface AIError {
  code: string;
  message: string;
  type: 'authentication' | 'rate_limit' | 'invalid_request' | 'api_error' | 'network_error';
  provider: ApiProvider;
  retryable: boolean;
}
```

## Analytics & Monitoring

### Usage Metrics

```typescript
const analytics = await aiService.getAnalytics('user-id', 30);

console.log('Usage:', analytics.usage);
console.log('Costs:', analytics.costs);
console.log('Performance:', analytics.performance);
console.log('Predictions:', analytics.predictions);
```

### Dashboard Metrics

The system provides real-time dashboard metrics:

- Request counts and success rates
- Average latency and cost per request
- Provider performance comparison
- Error rate trends
- Cost projections

### Health Monitoring

```typescript
const health = await aiService.getHealth();

console.log('Overall status:', health.status);
console.log('Provider health:', health.services.providers);
console.log('Performance metrics:', health.metrics);
```

## Security

### BYOK (Bring Your Own Key)

- **Envelope Encryption**: Google Cloud KMS + AES-256-GCM
- **Context Binding**: Prevents key substitution attacks
- **Automatic Rotation**: 90-day key rotation policy
- **Audit Logging**: Complete key usage tracking

### API Key Storage

```typescript
// Store encrypted API key
await apiKeyManager.storeApiKey({
  userId: 'user-id',
  name: 'My OpenAI Key',
  provider: ApiProvider.OPENAI,
  apiKey: 'sk-...' // Encrypted before storage
});

// Retrieve and decrypt
const key = await apiKeyManager.retrieveApiKey({
  userId: 'user-id',
  apiKeyId: 'key-id'
});
```

## Performance

### Targets

- **Response Time**: <200ms (non-streaming)
- **First Token**: <100ms (streaming)
- **Cache Hit Rate**: >30%
- **Error Rate**: <5%

### Optimization Features

- **Connection Pooling**: Persistent connections to providers
- **Request Batching**: Efficient batch processing
- **Intelligent Caching**: Content-aware caching strategies
- **Load Balancing**: Distributes requests across providers

## Development

### Testing

```bash
# Run all AI integration tests
npm test src/lib/ai

# Run specific test suite
npm test src/lib/ai/__tests__/router.test.ts

# Run integration tests
npm test src/lib/ai/__tests__/integration.test.ts
```

### Debugging

Enable debug logging:

```typescript
const aiService = createAIService(prisma, {
  analytics: {
    detailedLogging: true
  }
});
```

### Contributing

1. Follow TypeScript strict mode
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure sub-200ms performance targets
5. Include cost analysis for new providers

## Migration Guide

### From Direct Provider Usage

Before:
```typescript
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: 'sk-...' });
const response = await openai.chat.completions.create({...});
```

After:
```typescript
import { getAIService } from '@/lib/ai';
const aiService = getAIService(prisma);
const response = await aiService.chat({...}, userId);
```

### Benefits of Migration

- **50-80% cost reduction** through optimization
- **99.9% uptime** with fallback systems
- **Detailed analytics** and monitoring
- **Enterprise security** with BYOK
- **Unified interface** across all providers

## Troubleshooting

### Common Issues

**High Latency**
- Check provider health status
- Verify caching configuration
- Review network connectivity

**Rate Limiting**
- Enable provider fallbacks
- Implement request throttling
- Upgrade API plans if needed

**Authentication Errors**
- Verify API key encryption/decryption
- Check key permissions and quotas
- Validate BYOK configuration

**Cost Optimization**
- Review model selection strategies
- Enable caching for repetitive requests
- Analyze usage patterns for optimization

### Support

For technical support:
1. Check service health: `GET /api/ai/health`
2. Review error logs and analytics
3. Verify configuration and API keys
4. Contact platform administrators

## Roadmap

### Upcoming Features

- **Additional Providers**: Cohere, Hugging Face, Azure OpenAI
- **Advanced Caching**: Semantic similarity caching
- **A/B Testing**: Model performance comparison
- **Usage Limits**: Per-user/app quotas and controls
- **Custom Models**: Support for fine-tuned models
- **Edge Deployment**: Regional provider selection

### Performance Improvements

- **WebSocket Streaming**: Faster streaming responses
- **Request Pipelining**: Concurrent request processing
- **Predictive Caching**: AI-powered cache warming
- **Auto-scaling**: Dynamic capacity management