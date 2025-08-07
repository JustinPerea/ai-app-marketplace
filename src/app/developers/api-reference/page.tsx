'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layouts/main-layout';
import { SimpleStars } from '@/components/ui/simple-stars';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { 
  ArrowRight, 
  Copy,
  Check,
  BookOpen,
  Code2,
  FileText,
  Search,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Info,
  ExternalLink,
  Hash,
  Type,
  Zap,
  Settings,
  Database,
  Globe,
  Shield
} from 'lucide-react';

const apiSections = [
  {
    id: 'client',
    title: 'Client Creation',
    description: 'Initialize and configure the COSMARA SDK client',
    icon: Settings,
    methods: [
      {
        name: 'createClient',
        description: 'Factory function to create a new AI client instance',
        signature: 'createClient(config: CommunityConfig): AIMarketplaceCommunityClient',
        parameters: [
          {
            name: 'config',
            type: 'CommunityConfig',
            required: true,
            description: 'Configuration object with API keys and settings'
          }
        ],
        returns: {
          type: 'AIMarketplaceCommunityClient',
          description: 'Configured client instance ready for use'
        },
        example: `import { createClient } from '@cosmara-ai/community-sdk';

const client = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY
  },
  userId: 'user-123',
  enableUsageTracking: true
});`,
        notes: [
          'At least one API key is required',
          'userId is optional but recommended for usage tracking',
          'enableUsageTracking defaults to true'
        ]
      },
      {
        name: 'AIMarketplaceCommunityClient',
        description: 'Main client class for AI operations',
        signature: 'new AIMarketplaceCommunityClient(config: CommunityConfig)',
        parameters: [
          {
            name: 'config',
            type: 'CommunityConfig',
            required: true,
            description: 'Client configuration object'
          }
        ],
        example: `import { AIMarketplaceCommunityClient } from '@cosmara-ai/community-sdk';

const client = new AIMarketplaceCommunityClient({
  apiKeys: {
    openai: 'sk-...',
    anthropic: 'sk-ant-...',
    google: 'AIza...'
  },
  userId: 'unique-user-id'
});`,
        notes: [
          'Prefer using createClient() factory function',
          'Automatically initializes providers based on available API keys'
        ]
      }
    ]
  },
  {
    id: 'chat',
    title: 'Chat Operations',
    description: 'Send messages and receive responses from AI providers',
    icon: Zap,
    methods: [
      {
        name: 'chat',
        description: 'Send a chat completion request to AI providers',
        signature: 'async chat(request: AIRequest, options?: ChatOptions): Promise<AIResponse>',
        parameters: [
          {
            name: 'request',
            type: 'AIRequest',
            required: true,
            description: 'The chat request with messages and configuration'
          },
          {
            name: 'options',
            type: 'ChatOptions',
            required: false,
            description: 'Optional provider selection and user settings'
          }
        ],
        returns: {
          type: 'Promise<AIResponse>',
          description: 'Complete response with content, usage, and metadata'
        },
        example: `// Basic chat request
const response = await client.chat({
  messages: [
    { role: 'user', content: 'Hello, how are you?' }
  ],
  temperature: 0.7,
  maxTokens: 150
});

console.log(response.content); // AI response text
console.log(response.provider); // Provider used
console.log(response.usage); // Token and cost info

// With specific provider
const response = await client.chat({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain quantum computing' }
  ]
}, {
  provider: 'openai',
  userId: 'user-123'
});`,
        notes: [
          'SDK automatically selects best available provider if none specified',
          'Conversation history is maintained in messages array',
          'System messages can be used to set AI behavior'
        ]
      },
      {
        name: 'chatStream',
        description: 'Stream chat responses in real-time for better user experience',
        signature: 'async *chatStream(request: AIRequest, options?: ChatOptions): AsyncIterable<AIStreamChunk>',
        parameters: [
          {
            name: 'request',
            type: 'AIRequest',
            required: true,
            description: 'The chat request configuration'
          },
          {
            name: 'options',
            type: 'ChatOptions',
            required: false,
            description: 'Optional provider and user settings'
          }
        ],
        returns: {
          type: 'AsyncIterable<AIStreamChunk>',
          description: 'Stream of response chunks with incremental content'
        },
        example: `// Stream a chat response
for await (const chunk of client.chatStream({
  messages: [{ role: 'user', content: 'Tell me a story' }],
  temperature: 0.8
})) {
  if (chunk.content) {
    process.stdout.write(chunk.content); // Output as it comes
  }
  
  if (chunk.usage) {
    console.log('\\nFinal usage:', chunk.usage);
  }
}

// With error handling
try {
  let fullResponse = '';
  
  for await (const chunk of client.chatStream({
    messages: [{ role: 'user', content: 'Write a poem' }]
  }, { provider: 'anthropic' })) {
    if (chunk.content) {
      fullResponse += chunk.content;
      // Update UI with chunk.content
    }
  }
  
  console.log('Complete response:', fullResponse);
} catch (error) {
  console.error('Streaming failed:', error.message);
}`,
        notes: [
          'Perfect for real-time chat interfaces',
          'Chunks contain incremental content',
          'Final chunk includes usage statistics',
          'Use try-catch for error handling'
        ]
      }
    ]
  },
  {
    id: 'models',
    title: 'Model Management',
    description: 'Discover and validate available AI models and providers',
    icon: Database,
    methods: [
      {
        name: 'getModels',
        description: 'Retrieve available models from providers',
        signature: 'async getModels(provider?: APIProvider): Promise<AIModel[]>',
        parameters: [
          {
            name: 'provider',
            type: 'APIProvider',
            required: false,
            description: 'Specific provider to query, or all if omitted'
          }
        ],
        returns: {
          type: 'Promise<AIModel[]>',
          description: 'Array of available models with capabilities and pricing'
        },
        example: `// Get all available models
const allModels = await client.getModels();
console.log('Available models:', allModels.length);

allModels.forEach(model => {
  console.log(\`\${model.id} (\${model.provider}): \${model.description}\`);
  console.log(\`  Context: \${model.contextWindow} tokens\`);
  console.log(\`  Cost: \${model.pricing.input}/\${model.pricing.output} per 1K tokens\`);
});

// Get models from specific provider
const openaiModels = await client.getModels('openai');
const anthropicModels = await client.getModels('anthropic');
const googleModels = await client.getModels('google');

// Find the best model for your use case
const longContextModels = allModels.filter(m => m.contextWindow > 32000);
const cheapestModels = allModels.sort((a, b) => a.pricing.input - b.pricing.input);`,
        notes: [
          'Models are fetched from provider APIs',
          'Includes pricing, context limits, and capabilities',
          'May take a moment as it queries multiple providers'
        ]
      },
      {
        name: 'validateApiKeys',
        description: 'Test API key validity for all configured providers',
        signature: 'async validateApiKeys(): Promise<Record<APIProvider, boolean>>',
        returns: {
          type: 'Promise<Record<APIProvider, boolean>>',
          description: 'Object mapping each provider to its validation status'
        },
        example: `// Validate all API keys
const validation = await client.validateApiKeys();

console.log('API Key Validation Results:');
Object.entries(validation).forEach(([provider, isValid]) => {
  const status = isValid ? '✅ Valid' : '❌ Invalid';
  console.log(\`  \${provider}: \${status}\`);
});

// Check specific provider
if (validation.openai) {
  console.log('OpenAI API key is working');
} else {
  console.log('OpenAI API key needs attention');
}

// Count working providers
const workingProviders = Object.values(validation).filter(Boolean).length;
console.log(\`\${workingProviders} providers are working\`);`,
        notes: [
          'Tests actual API connectivity, not just key format',
          'Useful for health checks and diagnostics',
          'Returns false for missing keys'
        ]
      }
    ]
  },
  {
    id: 'usage',
    title: 'Usage Analytics',
    description: 'Track usage, costs, and optimize spending across providers',
    icon: Globe,
    methods: [
      {
        name: 'getUsageStats',
        description: 'Get comprehensive usage statistics and limits',
        signature: 'getUsageStats(): UsageStats',
        returns: {
          type: 'UsageStats',
          description: 'Detailed usage information including limits and recommendations'
        },
        example: `// Get current usage statistics
const stats = client.getUsageStats();

console.log('Usage Overview:');
console.log(\`  Requests this month: \${stats.requestsThisMonth}/\${stats.limits.requestsPerMonth}\`);
console.log(\`  Requests today: \${stats.requestsThisDay}/\${stats.limits.requestsPerDay}\`);
console.log(\`  Total cost: $\${stats.totalCost.toFixed(4)}\`);

// Check if approaching limits
if (stats.requestsThisMonth > stats.limits.requestsPerMonth * 0.8) {
  console.log('⚠️ Approaching monthly limit!');
}

// Provider breakdown
console.log('\\nProvider Usage:');
Object.entries(stats.providerStats).forEach(([provider, providerStats]) => {
  console.log(\`  \${provider}: \${providerStats.requests} requests, $\${providerStats.cost.toFixed(4)}\`);
});

// Upgrade recommendations
if (stats.upgradeMessage) {
  console.log('\\n💡 Upgrade Recommendation:', stats.upgradeMessage);
}`,
        notes: [
          'Updates in real-time with each request',
          'Community edition has specific limits',
          'Includes upgrade recommendations when approaching limits'
        ]
      },
      {
        name: 'estimateCost',
        description: 'Estimate costs across providers before making requests',
        signature: 'async estimateCost(request: AIRequest, provider?: APIProvider): Promise<CostEstimate[]>',
        parameters: [
          {
            name: 'request',
            type: 'AIRequest',
            required: true,
            description: 'The request to estimate costs for'
          },
          {
            name: 'provider',
            type: 'APIProvider',
            required: false,
            description: 'Specific provider to estimate, or all if omitted'
          }
        ],
        returns: {
          type: 'Promise<CostEstimate[]>',
          description: 'Array of cost estimates sorted by price'
        },
        example: `// Estimate costs for a request
const estimates = await client.estimateCost({
  messages: [
    { role: 'user', content: 'Write a 500-word article about renewable energy' }
  ],
  temperature: 0.7,
  maxTokens: 800
});

console.log('Cost Estimates (sorted by price):');
estimates.forEach((estimate, index) => {
  const rank = index === 0 ? '🥇 Cheapest' : index === 1 ? '🥈' : '🥉';
  console.log(\`  \${rank} \${estimate.provider}: $\${estimate.cost.toFixed(6)}\`);
});

// Compare specific providers
const openaiEstimate = estimates.find(e => e.provider === 'openai');
const anthropicEstimate = estimates.find(e => e.provider === 'anthropic');

if (openaiEstimate && anthropicEstimate) {
  const difference = anthropicEstimate.cost - openaiEstimate.cost;
  const percentageDiff = (difference / openaiEstimate.cost * 100).toFixed(1);
  console.log(\`Anthropic costs \${percentageDiff}% more than OpenAI for this request\`);
}

// Use cheapest provider
const cheapest = estimates[0];
const response = await client.chat(request, { provider: cheapest.provider });`,
        notes: [
          'Estimates based on current provider pricing',
          'Actual costs may vary slightly due to token counting differences',
          'Sorted by cost (cheapest first) for easy comparison'
        ]
      },
      {
        name: 'clearCache',
        description: 'Clear the internal response cache',
        signature: 'clearCache(): void',
        example: `// Clear cache when needed
client.clearCache();
console.log('Response cache cleared');

// Useful scenarios:
// 1. After updating system prompts
// 2. When switching user contexts
// 3. During development/testing
// 4. After long periods of inactivity`,
        notes: [
          'Community edition has 5-minute cache TTL',
          'Cache improves performance for identical requests',
          'Automatically manages cache size (max 100 entries)'
        ]
      }
    ]
  }
];

const typeDefinitions = [
  {
    name: 'CommunityConfig',
    description: 'Configuration object for initializing the client',
    properties: [
      { name: 'apiKeys', type: 'APIKeys', required: true, description: 'API keys for AI providers' },
      { name: 'userId', type: 'string', required: false, description: 'Unique user identifier for tracking' },
      { name: 'enableUsageTracking', type: 'boolean', required: false, description: 'Enable usage analytics (default: true)' },
      { name: 'baseUrls', type: 'BaseUrls', required: false, description: 'Custom API endpoints (advanced)' }
    ],
    example: `interface CommunityConfig {
  apiKeys: {
    openai?: string;
    anthropic?: string;
    google?: string;
  };
  userId?: string;
  enableUsageTracking?: boolean;
  baseUrls?: {
    openai?: string;
    anthropic?: string;
    google?: string;
  };
}`
  },
  {
    name: 'AIRequest',
    description: 'Request object for chat completions',
    properties: [
      { name: 'messages', type: 'AIMessage[]', required: true, description: 'Conversation messages' },
      { name: 'model', type: 'string', required: false, description: 'Specific model to use' },
      { name: 'temperature', type: 'number', required: false, description: 'Creativity level (0-2, default: 0.7)' },
      { name: 'maxTokens', type: 'number', required: false, description: 'Maximum tokens in response' },
      { name: 'stream', type: 'boolean', required: false, description: 'Enable streaming (automatic for chatStream)' },
      { name: 'tools', type: 'AITool[]', required: false, description: 'Function calling tools' }
    ],
    example: `interface AIRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  temperature?: number; // 0.0 to 2.0
  maxTokens?: number;
  stream?: boolean;
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: object;
    };
  }>;
}`
  },
  {
    name: 'AIResponse',
    description: 'Complete response from AI providers',
    properties: [
      { name: 'content', type: 'string', required: true, description: 'The AI-generated response text' },
      { name: 'provider', type: 'APIProvider', required: true, description: 'Provider that handled the request' },
      { name: 'model', type: 'string', required: true, description: 'Specific model used' },
      { name: 'usage', type: 'UsageInfo', required: false, description: 'Token usage and cost information' },
      { name: 'finishReason', type: 'string', required: false, description: 'Why the response ended' },
      { name: 'toolCalls', type: 'ToolCall[]', required: false, description: 'Function calls made by AI' }
    ],
    example: `interface AIResponse {
  content: string;
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
  };
  finishReason?: 'stop' | 'length' | 'tool_calls';
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}`
  },
  {
    name: 'AIStreamChunk',
    description: 'Individual chunk in a streaming response',
    properties: [
      { name: 'content', type: 'string', required: false, description: 'Incremental content (empty for metadata chunks)' },
      { name: 'provider', type: 'APIProvider', required: false, description: 'Provider handling the stream' },
      { name: 'usage', type: 'UsageInfo', required: false, description: 'Final usage info (last chunk only)' },
      { name: 'finishReason', type: 'string', required: false, description: 'Stream completion reason' }
    ],
    example: `interface AIStreamChunk {
  content?: string;    // Text to append
  provider?: string;   // Provider info
  usage?: {           // Final chunk only
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
  };
  finishReason?: 'stop' | 'length';
}`
  },
  {
    name: 'UsageStats',
    description: 'Comprehensive usage analytics and limits',
    properties: [
      { name: 'requestsThisMinute', type: 'number', required: true, description: 'Requests in current minute' },
      { name: 'requestsThisDay', type: 'number', required: true, description: 'Requests today' },
      { name: 'requestsThisMonth', type: 'number', required: true, description: 'Requests this month' },
      { name: 'totalCost', type: 'number', required: true, description: 'Total spending across all providers' },
      { name: 'limits', type: 'UsageLimits', required: true, description: 'Community edition limits' },
      { name: 'providerStats', type: 'Record<string, ProviderStats>', required: true, description: 'Per-provider statistics' }
    ],
    example: `interface UsageStats {
  requestsThisMinute: number;
  requestsThisDay: number;
  requestsThisMonth: number;
  totalCost: number;
  limits: {
    requestsPerMinute: 10;
    requestsPerDay: 100;
    requestsPerMonth: 1000;
    maxUniqueUsers: 10;
  };
  providerStats: {
    [provider: string]: {
      requests: number;
      cost: number;
      averageResponseTime: number;
    };
  };
  upgradeMessage?: string;
}`
  }
];

const errorCodes = [
  {
    code: 'API_KEY_MISSING',
    description: 'No API key provided for the selected provider',
    resolution: 'Add the required API key to your configuration',
    example: 'Occurs when trying to use OpenAI but no OPENAI_API_KEY is configured'
  },
  {
    code: 'RATE_LIMIT_ERROR',
    description: 'Provider or Community edition limits exceeded',
    resolution: 'Wait before retrying or upgrade to higher tier',
    example: 'Community edition: 10 requests/minute, 100/day, 1000/month limits hit'
  },
  {
    code: 'PROVIDER_NOT_AVAILABLE',
    description: 'Selected provider is not configured or accessible',
    resolution: 'Check API keys and provider configuration',
    example: 'Trying to use Anthropic but API key is invalid or missing'
  },
  {
    code: 'NETWORK_ERROR',
    description: 'Network connectivity issues with provider APIs',
    resolution: 'Check internet connection and try again',
    example: 'DNS resolution fails or request timeouts'
  },
  {
    code: 'INVALID_REQUEST',
    description: 'Request format or parameters are incorrect',
    resolution: 'Validate request structure and parameter values',
    example: 'Missing required messages array or invalid temperature value'
  },
  {
    code: 'CONTENT_FILTERED',
    description: 'Provider blocked content due to safety policies',
    resolution: 'Modify prompt to comply with provider guidelines',
    example: 'OpenAI content filter blocks harmful or inappropriate requests'
  }
];

export default function APIReferencePage() {
  const [selectedSection, setSelectedSection] = useState('client');
  const [expandedMethods, setExpandedMethods] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const toggleMethodExpansion = (methodName: string) => {
    setExpandedMethods(prev => 
      prev.includes(methodName) 
        ? prev.filter(name => name !== methodName)
        : [...prev, methodName]
    );
  };

  const filteredSections = apiSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.methods.some(method => 
      method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      method.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <MainLayout>
      <SimpleStars starCount={50} parallaxSpeed={0.3} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 pointer-events-none" 
             style={{ 
               background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(59, 130, 246, 0.04) 50%, rgba(139, 92, 246, 0.06) 100%)' 
             }}>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <Breadcrumb 
              items={[
                { label: 'Developers', href: '/developers' },
                { label: 'API Reference' }
              ]} 
            />
          </div>
          
          <div className="text-center max-w-4xl mx-auto">
            <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-6"
                 style={{ 
                   background: 'rgba(139, 92, 246, 0.1)', 
                   borderColor: 'rgba(139, 92, 246, 0.3)' 
                 }}>
              <FileText className="h-3 w-3 mr-2" style={{ color: '#8B5CF6' }} />
              <span className="text-sm font-medium text-text-primary">API Reference</span>
            </div>
            
            <h1 className="text-hero-glass mb-6 leading-tight">
              <span className="text-stardust-muted">Complete SDK</span>
              <br />
              <span className="text-glass-gradient">Documentation</span>
            </h1>
            
            <p className="text-body-lg text-text-secondary mb-8 leading-relaxed max-w-3xl mx-auto">
              Comprehensive reference for every method, type, and feature in the COSMARA Community SDK. 
              Complete with TypeScript signatures, examples, and best practices.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search methods, types, or examples..."
                  className="w-full pl-10 pr-4 py-3 bg-space-depth/50 border border-space-light/30 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-cosmic-blue/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <Card className="glass-card border-space-light/30">
                  <CardHeader>
                    <CardTitle className="text-lg text-text-primary">API Sections</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {apiSections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setSelectedSection(section.id)}
                          className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                            selectedSection === section.id
                              ? 'bg-cosmic-blue/20 text-cosmic-blue border border-cosmic-blue/30'
                              : 'text-text-secondary hover:text-text-primary hover:bg-space-depth/30'
                          }`}
                        >
                          <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                          <div>
                            <div className="font-medium">{section.title}</div>
                            <div className="text-xs opacity-75">{section.methods.length} methods</div>
                          </div>
                        </button>
                      );
                    })}
                    
                    <div className="pt-4 border-t border-space-light/20">
                      <div className="text-sm font-medium text-text-secondary mb-2">Reference</div>
                      <button
                        onClick={() => setSelectedSection('types')}
                        className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                          selectedSection === 'types'
                            ? 'bg-stellar-purple/20 text-stellar-purple border border-stellar-purple/30'
                            : 'text-text-secondary hover:text-text-primary hover:bg-space-depth/30'
                        }`}
                      >
                        <Type className="h-4 w-4 mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Type Definitions</div>
                          <div className="text-xs opacity-75">{typeDefinitions.length} types</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setSelectedSection('errors')}
                        className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                          selectedSection === 'errors'
                            ? 'bg-orange-400/20 text-orange-400 border border-orange-400/30'
                            : 'text-text-secondary hover:text-text-primary hover:bg-space-depth/30'
                        }`}
                      >
                        <AlertCircle className="h-4 w-4 mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Error Codes</div>
                          <div className="text-xs opacity-75">{errorCodes.length} codes</div>
                        </div>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* API Methods */}
              {selectedSection !== 'types' && selectedSection !== 'errors' && (
                <div>
                  {filteredSections
                    .filter(section => section.id === selectedSection)
                    .map((section) => (
                    <div key={section.id}>
                      <div className="mb-8">
                        <div className="flex items-center mb-4">
                          <section.icon className="h-6 w-6 mr-3 text-cosmic-blue" />
                          <div>
                            <h2 className="text-2xl font-bold text-text-primary">{section.title}</h2>
                            <p className="text-text-secondary">{section.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {section.methods.map((method) => (
                          <Card key={method.name} className="glass-card border-space-light/30">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Hash className="h-4 w-4 text-text-secondary mr-2" />
                                  <CardTitle className="text-xl text-text-primary font-mono">
                                    {method.name}
                                  </CardTitle>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleMethodExpansion(method.name)}
                                >
                                  {expandedMethods.includes(method.name) ? 
                                    <ChevronDown className="h-4 w-4" /> : 
                                    <ChevronRight className="h-4 w-4" />
                                  }
                                </Button>
                              </div>
                              <CardDescription className="text-text-secondary">
                                {method.description}
                              </CardDescription>
                            </CardHeader>
                            
                            <CardContent className="space-y-6">
                              {/* Signature */}
                              <div>
                                <h4 className="font-medium text-text-primary mb-2">Signature</h4>
                                <div className="relative">
                                  <pre className="bg-dark-obsidian text-stardust p-4 rounded-lg text-sm overflow-x-auto border border-space-light/20">
                                    <code>{method.signature}</code>
                                  </pre>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="absolute top-2 right-2 h-8 w-8 p-0"
                                    onClick={() => copyToClipboard(method.signature, `sig-${method.name}`)}
                                  >
                                    {copiedCode === `sig-${method.name}` ? 
                                      <Check className="h-3 w-3 text-green-400" /> : 
                                      <Copy className="h-3 w-3" />
                                    }
                                  </Button>
                                </div>
                              </div>

                              {/* Parameters */}
                              {method.parameters && expandedMethods.includes(method.name) && (
                                <div>
                                  <h4 className="font-medium text-text-primary mb-3">Parameters</h4>
                                  <div className="space-y-3">
                                    {method.parameters.map((param, idx) => (
                                      <div key={idx} className="p-3 bg-space-depth/30 rounded-lg border border-space-light/20">
                                        <div className="flex items-center gap-2 mb-1">
                                          <code className="text-cosmic-blue font-mono text-sm">{param.name}</code>
                                          <Badge variant="outline" className="text-xs">
                                            {param.type}
                                          </Badge>
                                          {param.required && (
                                            <Badge className="text-xs bg-orange-400/20 text-orange-400 border-orange-400/30">
                                              required
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-text-secondary text-sm">{param.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Returns */}
                              {method.returns && expandedMethods.includes(method.name) && (
                                <div>
                                  <h4 className="font-medium text-text-primary mb-2">Returns</h4>
                                  <div className="p-3 bg-space-depth/30 rounded-lg border border-space-light/20">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className="text-xs">
                                        {method.returns.type}
                                      </Badge>
                                    </div>
                                    <p className="text-text-secondary text-sm">{method.returns.description}</p>
                                  </div>
                                </div>
                              )}

                              {/* Example */}
                              <div>
                                <h4 className="font-medium text-text-primary mb-2">Example</h4>
                                <div className="relative">
                                  <pre className="bg-dark-obsidian text-stardust p-4 rounded-lg text-sm overflow-x-auto border border-space-light/20 max-h-96 overflow-y-auto">
                                    <code>{method.example}</code>
                                  </pre>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="absolute top-2 right-2 h-8 w-8 p-0"
                                    onClick={() => copyToClipboard(method.example, `ex-${method.name}`)}
                                  >
                                    {copiedCode === `ex-${method.name}` ? 
                                      <Check className="h-3 w-3 text-green-400" /> : 
                                      <Copy className="h-3 w-3" />
                                    }
                                  </Button>
                                </div>
                              </div>

                              {/* Notes */}
                              {method.notes && expandedMethods.includes(method.name) && (
                                <div>
                                  <h4 className="font-medium text-text-primary mb-3">Notes</h4>
                                  <ul className="space-y-2">
                                    {method.notes.map((note, idx) => (
                                      <li key={idx} className="flex items-start text-sm text-text-secondary">
                                        <Info className="h-3 w-3 text-cosmic-blue mr-2 mt-0.5 flex-shrink-0" />
                                        {note}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Type Definitions */}
              {selectedSection === 'types' && (
                <div>
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <Type className="h-6 w-6 mr-3 text-stellar-purple" />
                      <div>
                        <h2 className="text-2xl font-bold text-text-primary">Type Definitions</h2>
                        <p className="text-text-secondary">TypeScript interfaces and types used throughout the SDK</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {typeDefinitions.map((type) => (
                      <Card key={type.name} className="glass-card border-space-light/30">
                        <CardHeader>
                          <div className="flex items-center">
                            <Hash className="h-4 w-4 text-text-secondary mr-2" />
                            <CardTitle className="text-xl text-text-primary font-mono">
                              {type.name}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-text-secondary">
                            {type.description}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                          {/* Properties */}
                          <div>
                            <h4 className="font-medium text-text-primary mb-3">Properties</h4>
                            <div className="space-y-3">
                              {type.properties.map((prop, idx) => (
                                <div key={idx} className="p-3 bg-space-depth/30 rounded-lg border border-space-light/20">
                                  <div className="flex items-center gap-2 mb-1">
                                    <code className="text-stellar-purple font-mono text-sm">{prop.name}</code>
                                    <Badge variant="outline" className="text-xs">
                                      {prop.type}
                                    </Badge>
                                    {prop.required && (
                                      <Badge className="text-xs bg-orange-400/20 text-orange-400 border-orange-400/30">
                                        required
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-text-secondary text-sm">{prop.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* TypeScript Definition */}
                          <div>
                            <h4 className="font-medium text-text-primary mb-2">TypeScript Definition</h4>
                            <div className="relative">
                              <pre className="bg-dark-obsidian text-stardust p-4 rounded-lg text-sm overflow-x-auto border border-space-light/20">
                                <code>{type.example}</code>
                              </pre>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="absolute top-2 right-2 h-8 w-8 p-0"
                                onClick={() => copyToClipboard(type.example, `type-${type.name}`)}
                              >
                                {copiedCode === `type-${type.name}` ? 
                                  <Check className="h-3 w-3 text-green-400" /> : 
                                  <Copy className="h-3 w-3" />
                                }
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Codes */}
              {selectedSection === 'errors' && (
                <div>
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <AlertCircle className="h-6 w-6 mr-3 text-orange-400" />
                      <div>
                        <h2 className="text-2xl font-bold text-text-primary">Error Codes</h2>
                        <p className="text-text-secondary">Common error codes and their resolutions</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {errorCodes.map((error) => (
                      <Card key={error.code} className="glass-card border-space-light/30">
                        <CardHeader>
                          <div className="flex items-center">
                            <Hash className="h-4 w-4 text-text-secondary mr-2" />
                            <CardTitle className="text-xl text-orange-400 font-mono">
                              {error.code}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-text-secondary">
                            {error.description}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-medium text-text-primary mb-2">Resolution</h4>
                            <p className="text-text-secondary text-sm bg-green-400/10 border border-green-400/30 rounded-lg p-3">
                              {error.resolution}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-text-primary mb-2">Example Scenario</h4>
                            <p className="text-text-secondary text-sm bg-space-depth/30 border border-space-light/20 rounded-lg p-3">
                              {error.example}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-20 bg-space-depth/30">
        <div className="container mx-auto px-4">
          <Card className="glass-card border-golden-nebula/30" 
                style={{ background: 'rgba(255, 215, 0, 0.05)' }}>
            <CardHeader>
              <CardTitle className="flex items-center text-golden-nebula text-2xl">
                <BookOpen className="h-6 w-6 mr-3" />
                Ready to Build?
              </CardTitle>
              <CardDescription className="text-text-secondary text-lg">
                Now that you understand the API, start building amazing AI applications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="glass-card border-space-light/20 cursor-pointer hover:border-cosmic-blue/50 transition-colors" asChild>
                  <Link href="/developers/quick-start">
                    <CardHeader className="text-center pb-4">
                      <div className="h-12 w-12 rounded-lg bg-cosmic-blue/20 flex items-center justify-center mx-auto mb-4">
                        <Zap className="h-6 w-6 text-cosmic-blue" />
                      </div>
                      <CardTitle className="text-lg">Quick Start</CardTitle>
                      <CardDescription className="text-center">
                        Build your first AI app in 30 minutes
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>

                <Card className="glass-card border-space-light/20 cursor-pointer hover:border-stellar-purple/50 transition-colors" asChild>
                  <Link href="/developers/examples">
                    <CardHeader className="text-center pb-4">
                      <div className="h-12 w-12 rounded-lg bg-stellar-purple/20 flex items-center justify-center mx-auto mb-4">
                        <Code2 className="h-6 w-6 text-stellar-purple" />
                      </div>
                      <CardTitle className="text-lg">Examples</CardTitle>
                      <CardDescription className="text-center">
                        Complete working applications to learn from
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>

                <Card className="glass-card border-space-light/20 cursor-pointer hover:border-green-400/50 transition-colors" asChild>
                  <Link href="/developers/tutorials">
                    <CardHeader className="text-center pb-4">
                      <div className="h-12 w-12 rounded-lg bg-green-400/20 flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-6 w-6 text-green-400" />
                      </div>
                      <CardTitle className="text-lg">Tutorials</CardTitle>
                      <CardDescription className="text-center">
                        Step-by-step guides for specific use cases
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button size="lg" asChild>
                  <Link href="/developers/quick-start">
                    Start Building Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/developers/examples">
                    View Examples
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="https://cosmara.dev/pricing" target="_blank" rel="noopener noreferrer">
                    Upgrade SDK
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}