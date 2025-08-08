BYOK AI Marketplace SDK

A unified, provider-agnostic SDK for building AI apps on the Cosmara Marketplace. BYOK-first: your users bring their own API keys; you resolve them at runtime and call a single, consistent API across OpenAI, Anthropic/Claude, and Google Gemini.

Install

```bash
npm install @byok-marketplace/sdk
# or
pnpm add @byok-marketplace/sdk
```

Quick start (BYOK)

Use the resolver hook to fetch the signed-in user’s active key per provider at call time. No hardcoding or bundling keys in the app.

```ts
import { createChat } from '@byok-marketplace/sdk';

const chat = createChat({
  // Called before each request if the provider config lacks an apiKey
  resolveApiKey: async (provider) => {
    // Example: fetch from your backend (account-encrypted storage)
    const res = await fetch(`/api/keys/active?provider=${provider}`, { credentials: 'include' });
    if (!res.ok) return undefined; // SDK will surface auth errors downstream
    const { apiKey } = await res.json();
    return apiKey;
  }
});

const answer = await chat.ask('Hello world!');
console.log(answer);
```

Dev-only alternative (map):

```ts
import { createChat } from '@byok-marketplace/sdk';

const chat = createChat({
  apiKeys: {
    openai: process.env.NEXT_PUBLIC_OPENAI_KEY!,
    claude: process.env.NEXT_PUBLIC_ANTHROPIC_KEY!,
    google: process.env.NEXT_PUBLIC_GOOGLE_KEY!
  }
});
```

Explicit provider selection

Use convenience helpers to pin a provider/model while still benefiting from the unified API.

```ts
import { createChat } from '@byok-marketplace/sdk';
import { openai, claude, gemini } from '@byok-marketplace/sdk/providers';

const chatOpenAI = createChat({ provider: openai({ model: 'gpt-4o' }) });
const chatClaude = createChat({ provider: claude({ model: 'claude-3-5-sonnet-20241022' }) });
const chatGemini = createChat({ provider: gemini({ model: 'gemini-1.5-flash' }) });
```

Unified chat API

```ts
import { createChat } from '@byok-marketplace/sdk';

const chat = createChat({ /* resolveApiKey or apiKeys */ });

// Structured request
const response = await chat.complete({
  messages: [
    { role: 'system', content: 'You are helpful.' },
    { role: 'user', content: 'Write a haiku about the ocean.' }
  ],
  max_tokens: 200,
  temperature: 0.7
});

console.log(response.choices[0].message.content);
```

Streaming

```ts
for await (const chunk of chat.stream({
  messages: [{ role: 'user', content: 'Stream a response, please' }],
  stream: true
})) {
  process.stdout.write(chunk.choices[0].delta.content ?? '');
}
```

Minimal SSE example (Next.js)

```ts
// app/api/sdk-stream/route.ts
export async function GET() {
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (d: string) => controller.enqueue(enc.encode(`data: ${d}\n\n`));
      send('hello');
      setTimeout(() => send('this is'), 150);
      setTimeout(() => send('a streamed'), 300);
      setTimeout(() => { send('done'); controller.close(); }, 450);
    }
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  });
}

// Client usage
const es = new EventSource('/api/sdk-stream');
es.onmessage = (ev) => {
  if (ev.data === 'done') es.close();
  else console.log('chunk:', ev.data);
};
```

Convenience helpers

```ts
const text = await chat.ask('Quick answer, please');
const convo = chat.conversation({ system: 'Be concise.' });
await convo.say('Hello');
await convo.say('Summarize this chat');
```

Provider selection, constraints, fallback

Let the SDK pick the provider based on cost/latency/capabilities, with optional fallback.

```ts
import { createChat } from '@byok-marketplace/sdk';

const chat = createChat({
  enableFallback: true,
  constraints: {
    maxCost: 0.001,
    requiredCapabilities: ['chatCompletion', 'toolUse'],
    preferredProviders: ['claude']
  }
});
```

Error handling

All providers map errors to consistent error types.

```ts
import { isAuthenticationError, isRateLimitError } from '@byok-marketplace/sdk/types';

try {
  const res = await chat.ask('hello');
} catch (err: any) {
  if (isAuthenticationError(err)) {
    // Invalid/missing key; prompt user to connect provider
  } else if (isRateLimitError(err)) {
    // Show retry-after/backoff UI
  } else {
    console.error('SDK error', err);
  }
}
```

BYOK storage patterns

- Logged-out (local): store keys client-side (LocalStorage/IndexedDB). The resolver reads from browser storage. Suitable for demos.
- Signed-in (account encrypted): store keys in your backend, encrypted per account. The resolver fetches via your `/api/keys` endpoint.
- Server-only flows: call the SDK on the server and resolve from secure server-side storage.

Security tips

- Never commit keys. Never ship a platform-wide key to browsers.
- Always use HTTPS; redact logs; avoid printing keys.

Health checks (optional)

```ts
import { checkProviderHealth } from '@byok-marketplace/sdk/providers';
const health = await checkProviderHealth();
console.log(health.openai, health.claude, health.google);
```

Images (OpenAI)

```ts
import { createOpenAIProvider } from '@byok-marketplace/sdk/providers';

const provider = createOpenAIProvider({ apiKey: 'sk-...' , model: 'gpt-4o' });
const images = await provider.generateImages({ prompt: 'A serene mountain lake' });
```

TypeScript

All inputs/outputs are typed (`ChatCompletionRequest`, `ChatCompletionResponse`, `ProviderConfig`, etc.). No heavy deps; native providers use fetch.

FAQ

- Do I need to provide keys to the SDK directly?
  - No. Prefer `resolveApiKey(provider)` to fetch the active user key per call. You can pass a dev-only `apiKeys` map locally.
- Which providers are supported?
  - OpenAI, Anthropic/Claude, Google Gemini (with room for more). Use `providers.getSupportedProviders()` if needed.

For marketplace apps, wire your `/setup` and `/api/keys` screens to manage keys, then use `resolveApiKey` in the SDK calls. This keeps apps BYOK-compliant with a unified API surface.

# AI Marketplace SDK 🚀

**The only SDK with intelligent multi-provider orchestration for AI applications.**

A unified TypeScript SDK that automatically optimizes cost, performance, and quality across OpenAI, Claude, Gemini, and local models. No vendor lock-in, maximum flexibility.

## 🎯 Our Unique Competitive Advantage

**Multi-Provider Orchestration Engine** - No other platform offers this:

- 🧠 **Intelligent Provider Selection** - Automatically chooses optimal provider based on cost, performance, privacy, and quality requirements
- 🔄 **Automatic Failover** - Seamless fallbacks when providers are down or rate-limited  
- 💰 **Cost Optimization** - Up to 80% savings through intelligent routing and caching
- 🏥 **HIPAA Compliance** - Local processing for sensitive data with zero cloud exposure
- ✅ **Cross-Provider Validation** - Verify critical decisions across multiple models
- 📊 **Confidence Scoring** - Real-time quality and reliability metrics

## Features

- 🚀 **Multi-Provider Intelligence** - OpenAI, Claude, Gemini, and local models in one API
- 🌳 **Tree-Shakable Exports** - Import only what you need for optimal bundle sizes
- 🛡️ **Enterprise-Grade Reliability** - Circuit breakers, retries, and comprehensive error handling
- 📊 **Advanced Analytics** - Usage tracking, cost analysis, and performance monitoring
- 🔒 **BYOK Security** - Users control their API keys, we handle the complexity

## Installation

```bash
npm install @ai-marketplace/sdk
```

## Quick Start

### ⚡ Intelligent Multi-Provider Orchestration

```typescript
import { ai } from '@ai-marketplace/sdk';

// Simple cost-optimized request
const result = await ai.complete({
  messages: [{ role: 'user', content: 'Analyze this contract for risks' }],
  strategy: 'cost_optimized',
  constraints: {
    maxCost: 0.05,        // Maximum 5 cents
    maxLatency: 5000      // Maximum 5 seconds
  }
});

console.log(`Provider: ${result.orchestration.providersUsed[0]}`);
console.log(`Cost: $${result.cost.total}`);
console.log(`Confidence: ${result.confidence.overall}%`);
```

### 🏥 HIPAA-Compliant Local Processing

```typescript
// Medical data processing with guaranteed local-only execution
const medicalNotes = await ai.complete({
  messages: [{ role: 'user', content: 'Create SOAP notes from: [patient data]' }],
  strategy: 'privacy_first',
  constraints: {
    privacyLevel: 'hipaa'  // Forces local processing only
  }
});

// Result: Processed locally with Ollama, $0.00 cost, 100% privacy
```

### 🔄 Multi-Step Workflows

```typescript
// Complex workflow with optimal provider selection for each step
const analysis = await ai.workflow([
  {
    name: 'extract',
    prompt: 'Extract financial data from this report',
    strategy: 'cost_optimized'
  },
  {
    name: 'analyze', 
    prompt: 'Analyze risks in: {{ extract.output }}',
    strategy: 'performance',
    requirements: { reasoning: true }
  },
  {
    name: 'report',
    prompt: 'Create executive summary: {{ analyze.output }}',
    strategy: 'balanced'
  }
]);
```

### 💰 Automatic Cost Optimization

```typescript
// Platform automatically chooses cheapest provider that meets requirements
const optimized = await ai.ask('Summarize this document', {
  strategy: 'cost_optimized',
  requirements: { analysis: true },
  constraints: { maxCost: 0.02 }
});

// Might use Gemini ($0.00125/1K tokens) instead of GPT-4o ($0.0025/1K)
// Automatic 50%+ cost savings while maintaining quality
```

### Tree-Shakable Imports

```typescript
// Import only what you need
import { Chat } from '@ai-marketplace/sdk/chat';
import { openai, claude } from '@ai-marketplace/sdk/providers';
import { Images } from '@ai-marketplace/sdk/images';
```

### Provider Switching

```typescript
import { Chat, openai, claude } from '@ai-marketplace/sdk';

const chat = new Chat({
  provider: openai({ model: 'gpt-4o' }) // Start with OpenAI
});

// Switch to Claude
const claudeResponse = await chat.complete(request, {
  provider: claude({ model: 'claude-3-5-sonnet-20241022' })
});
```

### Intelligent Provider Selection

```typescript
import { Chat } from '@ai-marketplace/sdk';

const chat = new Chat({
  constraints: {
    maxCost: 0.01,           // Maximum cost per request
    maxLatency: 5000,        // Maximum latency in ms
    preferredProviders: ['claude', 'openai'],
    requiredCapabilities: ['chat', 'tools']
  }
});

// SDK automatically selects the best provider
const response = await chat.ask('Complex reasoning task');
```

## API Reference

### Chat Interface

```typescript
// Simple text completion
const response = await chat.ask('Your question');

// Full chat completion with options
const response = await chat.complete({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ],
  temperature: 0.7,
  max_tokens: 1000
});

// Streaming responses
for await (const chunk of chat.stream({ messages })) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}

// Stateful conversations
const conversation = chat.conversation({
  system: 'You are a helpful assistant.'
});

await conversation.say('Hello!');
await conversation.say('How are you?');
```

### Image Generation

```typescript
import { Images, openai } from '@ai-marketplace/sdk';

const images = new Images({
  provider: openai({ model: 'dall-e-3' })
});

// Generate single image
const imageUrl = await images.create('A beautiful landscape');

// Generate multiple images
const imageUrls = await images.createBatch('A beautiful landscape', 3);
```

### Provider Configuration

```typescript
import { openai, claude } from '@ai-marketplace/sdk/providers';

// OpenAI configuration
const openaiConfig = openai({
  apiKey: 'your-key',
  model: 'gpt-4o',
  organization: 'your-org',
  project: 'your-project',
  timeout: 30000,
  maxRetries: 3
});

// Claude configuration
const claudeConfig = claude({
  apiKey: 'your-key',
  model: 'claude-3-5-sonnet-20241022',
  anthropicVersion: '2023-06-01',
  timeout: 30000,
  maxRetries: 3
});
```

## Error Handling

The SDK provides comprehensive error handling with automatic retries and fallbacks:

```typescript
import { 
  Chat, 
  isRateLimitError, 
  isAuthenticationError,
  isValidationError 
} from '@ai-marketplace/sdk';

try {
  const response = await chat.ask('Your question');
} catch (error) {
  if (isRateLimitError(error)) {
    console.log(`Rate limited. Retry after: ${error.retryAfter}s`);
  } else if (isAuthenticationError(error)) {
    console.log('Invalid API key');
  } else if (isValidationError(error)) {
    console.log(`Validation error: ${error.field}`);
  }
}
```

## Bundle Size Optimization

The SDK is designed for optimal tree-shaking:

```typescript
// ✅ Good - Tree-shakable imports
import { Chat } from '@ai-marketplace/sdk/chat';
import { openai } from '@ai-marketplace/sdk/providers';

// ❌ Avoid - Imports entire SDK
import { Chat, openai } from '@ai-marketplace/sdk';
```

## Provider Support

| Provider | Chat | Images | Tools | Streaming | Vision |
|----------|------|--------|-------|-----------|--------|
| OpenAI   | ✅   | ✅     | ✅    | ✅        | ✅     |
| Claude   | ✅   | ❌     | ✅    | ✅        | ✅     |
| Google   | 🚧   | ❌     | 🚧    | 🚧        | 🚧     |
| Azure    | 🚧   | 🚧     | 🚧    | 🚧        | 🚧     |

## Development

```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests
npm test

# Type checking
npm run type-check

# Development mode
npm run dev
```

## Architecture

The SDK follows these design principles:

1. **Provider Abstraction** - Unified interface across all AI providers
2. **Tree-Shaking** - Modular architecture for minimal bundle sizes
3. **Intelligent Routing** - Cost and quality-based provider selection
4. **Fault Tolerance** - Circuit breakers, retries, and fallbacks
5. **Security Integration** - Seamless integration with marketplace security

## Roadmap

- [ ] Google Gemini provider support
- [ ] Azure OpenAI provider support
- [ ] Embeddings interface
- [ ] Function calling enhancements
- [ ] Real-time usage analytics
- [ ] Provider health monitoring

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📚 [Documentation](https://docs.ai-marketplace.com/sdk)
- 💬 [Discord Community](https://discord.gg/ai-marketplace)
- 🐛 [Issue Tracker](https://github.com/ai-marketplace/sdk/issues)
- 📧 [Email Support](mailto:support@ai-marketplace.com)