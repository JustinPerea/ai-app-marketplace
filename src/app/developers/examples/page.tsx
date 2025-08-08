'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { 
  Code2, 
  Copy, 
  Download,
  MessageSquare,
  Zap,
  Calculator,
  Wand2,
  HeadphonesIcon,
  Shield,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Rocket,
  Timer,
  DollarSign
} from 'lucide-react';

export default function ExamplesPage() {
  const examples = [
    {
      id: 'basic-chat',
      title: 'Basic Multi-Provider Chat Bot',
      description: 'Simple chat application that rotates between OpenAI, Anthropic, and Google AI',
      difficulty: 'Beginner',
      time: '15 minutes',
      icon: MessageSquare,
      tags: ['Chat', 'Multi-Provider', 'Basic'],
      features: [
        'Provider rotation logic',
        'Error handling and fallbacks',
        'Console-based interaction',
        'Cost tracking per conversation'
      ]
    },
    {
      id: 'streaming-app',
      title: 'Real-Time Streaming Response App',
      description: 'Interactive streaming application with typing effects and real-time AI responses',
      difficulty: 'Intermediate',
      time: '25 minutes',
      icon: Zap,
      tags: ['Streaming', 'Real-time', 'Interactive'],
      features: [
        'Server-sent events for streaming',
        'Typing effect animation',
        'Stream interruption handling',
        'Buffer management'
      ]
    },
    {
      id: 'cost-comparison',
      title: 'AI Cost Comparison Tool',
      description: 'Compare costs, response times, and quality across all providers for the same request',
      difficulty: 'Intermediate',
      time: '30 minutes',
      icon: Calculator,
      tags: ['Analysis', 'Comparison', 'Optimization'],
      features: [
        'Parallel provider requests',
        'Cost calculation engine',
        'Response time tracking',
        'CSV/JSON export functionality'
      ]
    },
    {
      id: 'content-generator',
      title: 'Smart Content Creation Pipeline',
      description: 'Multi-provider workflow: Claude for writing, Google for video descriptions, OpenAI for images',
      difficulty: 'Advanced',
      time: '45 minutes',
      icon: Wand2,
      tags: ['Workflow', 'Content', 'Multi-AI'],
      features: [
        'Sequential AI provider calls',
        'Content pipeline management',
        'File output handling',
        'Quality validation'
      ]
    },
    {
      id: 'customer-service',
      title: 'Intelligent Customer Service Bot',
      description: 'AI customer service with intent recognition and intelligent routing',
      difficulty: 'Advanced',
      time: '40 minutes',
      icon: HeadphonesIcon,
      tags: ['Customer Service', 'Intent Recognition', 'Routing'],
      features: [
        'Intent classification',
        'Dynamic provider selection',
        'Escalation logic',
        'Conversation history'
      ]
    },
    {
      id: 'fallback-system',
      title: 'Enterprise Fallback System',
      description: 'Production-ready system with health checking, retry logic, and performance monitoring',
      difficulty: 'Expert',
      time: '60 minutes',
      icon: Shield,
      tags: ['Enterprise', 'Reliability', 'Monitoring'],
      features: [
        'Health check monitoring',
        'Intelligent retry logic',
        'Performance analytics',
        'Circuit breaker pattern'
      ]
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Advanced': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Expert': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
      <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 pointer-events-none"
             style={{
               background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.04) 50%, rgba(255, 215, 0, 0.06) 100%)'
             }}>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <Breadcrumb 
              items={[
                { label: 'Developers', href: '/developers' },
                { label: 'Examples' }
              ]} 
            />
          </div>
          
          <div className="text-center max-w-4xl mx-auto">
            <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-6"
                 style={{
                   background: 'rgba(139, 92, 246, 0.1)',
                   borderColor: 'rgba(139, 92, 246, 0.3)'
                 }}>
              <Code2 className="h-3 w-3 mr-2" style={{ color: '#8B5CF6' }} />
              <span className="text-sm font-medium text-text-primary">Complete Examples</span>
            </div>

            <h1 className="text-hero-glass mb-6">
              <span className="text-glass-gradient">Ready-to-Use</span>
              <br />
              <span className="text-stardust-muted">AI Applications</span>
            </h1>

            <p className="text-body-lg text-text-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
              Complete, working applications you can copy and run immediately. Each example includes 
              all necessary code, dependencies, and step-by-step instructions. 
              <strong className="text-blue-400">Zero external knowledge required</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="glass-button-primary">
                <BookOpen className="h-5 w-5 mr-2" />
                Start with Basic Example
              </Button>
              <Button size="lg" variant="outline" className="glass-button-secondary">
                <Download className="h-5 w-5 mr-2" />
                Download All Examples
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Examples Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {examples.map((example) => {
              const Icon = example.icon;
              return (
                <Card key={example.id} className="glass-card group cursor-pointer hover:scale-105 transition-transform duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge className={getDifficultyColor(example.difficulty)}>
                        {example.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-h3 text-text-primary group-hover:text-primary transition-colors">
                      {example.title}
                    </CardTitle>
                    <CardDescription className="text-body text-text-secondary">
                      {example.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4 text-sm text-text-muted">
                      <div className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        {example.time}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {example.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-text-secondary">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {example.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button className="w-full glass-button-primary">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Complete Example
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed Examples */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="basic-chat" className="space-y-8">
            <TabsList className="grid grid-cols-2 lg:grid-cols-6 gap-2">
              {examples.map((example) => (
                <TabsTrigger key={example.id} value={example.id} className="text-xs">
                  {example.title.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Basic Chat Bot Example */}
            <TabsContent value="basic-chat" className="space-y-8">
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <MessageSquare className="h-8 w-8 text-blue-500" />
                    <div>
                      <CardTitle className="text-h2 text-text-primary">Basic Multi-Provider Chat Bot</CardTitle>
                      <CardDescription className="text-body text-text-secondary">
                        A simple chat application that demonstrates provider rotation, error handling, and cost tracking.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Prerequisites */}
                  <div>
                    <h3 className="text-h4 text-text-primary mb-4">Prerequisites</h3>
                    <div className="bg-slate-900 rounded-lg p-4 space-y-2">
                      <p className="text-green-400"># Node.js 16+ required</p>
                      <p className="text-gray-300">node --version</p>
                      <p className="text-green-400"># API keys from OpenAI, Anthropic, Google AI</p>
                    </div>
                  </div>

                  {/* Installation */}
                  <div>
                    <h3 className="text-h4 text-text-primary mb-4">Installation</h3>
                    <div className="bg-slate-900 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-300">mkdir my-chat-bot && cd my-chat-bot</p>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard('mkdir my-chat-bot && cd my-chat-bot')}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-gray-300">npm init -y</p>
                      <p className="text-gray-300">npm install @cosmara-ai/community-sdk dotenv</p>
                    </div>
                  </div>

                  {/* Complete App Code */}
                  <div>
                    <h3 className="text-h4 text-text-primary mb-4">Complete Application Code</h3>
                    <p className="text-body text-text-secondary mb-4">
                      Create a file called <code className="bg-slate-800 px-2 py-1 rounded">chatbot.js</code> with the following content:
                    </p>
                    <div className="bg-slate-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-400">chatbot.js</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`// COSMARA Multi-Provider Chat Bot
// Complete working example with provider rotation and error handling

require('dotenv').config();
const { createClient, APIProvider } = require('@cosmara-ai/community-sdk');

class ChatBot {
  constructor() {
    this.client = createClient({
      apiKeys: {
        openai: process.env.OPENAI_API_KEY,
        anthropic: process.env.ANTHROPIC_API_KEY,
        google: process.env.GOOGLE_API_KEY,
      },
    });
    
    this.providers = [APIProvider.OPENAI, APIProvider.ANTHROPIC, APIProvider.GOOGLE];
    this.currentProviderIndex = 0;
    this.conversationHistory = [];
    this.totalCost = 0;
  }

  getCurrentProvider() {
    return this.providers[this.currentProviderIndex];
  }

  rotateProvider() {
    this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
    console.log(\`🔄 Switched to: \${this.getCurrentProvider()}\`);
  }

  async estimateCost(message) {
    try {
      const estimates = await this.client.estimateCost({
        model: this.getModelForProvider(this.getCurrentProvider()),
        messages: [...this.conversationHistory, { role: 'user', content: message }],
        maxTokens: 500,
      });
      
      const currentProviderEstimate = estimates.find(e => e.provider === this.getCurrentProvider());
      return currentProviderEstimate ? currentProviderEstimate.cost : 0.01;
    } catch (error) {
      console.log('⚠️  Cost estimation unavailable');
      return 0.01;
    }
  }

  getModelForProvider(provider) {
    const models = {
      [APIProvider.OPENAI]: 'gpt-4o-mini',
      [APIProvider.ANTHROPIC]: 'claude-3-haiku-20240307',
      [APIProvider.GOOGLE]: 'gemini-1.5-flash'
    };
    return models[provider];
  }

  async sendMessage(userMessage) {
    console.log(\`\\n👤 You: \${userMessage}\`);
    
    // Add to conversation history
    this.conversationHistory.push({ role: 'user', content: userMessage });
    
    // Estimate cost
    const estimatedCost = await this.estimateCost(userMessage);
    console.log(\`💰 Estimated cost: $\${estimatedCost.toFixed(4)}\`);
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        console.log(\`🤖 \${this.getCurrentProvider()} is thinking...\`);
        
        const response = await this.client.chat({
          model: this.getModelForProvider(this.getCurrentProvider()),
          messages: this.conversationHistory,
          maxTokens: 500,
          temperature: 0.7,
        }, {
          provider: this.getCurrentProvider()
        });
        
        const assistantMessage = response.choices[0].message.content;
        console.log(\`🤖 \${this.getCurrentProvider()}: \${assistantMessage}\`);
        
        // Add to conversation history
        this.conversationHistory.push({ role: 'assistant', content: assistantMessage });
        
        // Track cost
        this.totalCost += estimatedCost;
        console.log(\`📊 Total session cost: $\${this.totalCost.toFixed(4)}\`);
        
        return assistantMessage;
        
      } catch (error) {
        attempts++;
        console.log(\`❌ Error with \${this.getCurrentProvider()}: \${error.message}\`);
        
        if (attempts < maxAttempts) {
          console.log(\`🔄 Trying next provider...\`);
          this.rotateProvider();
        } else {
          console.log('❌ All providers failed. Please check your API keys and try again.');
          return null;
        }
      }
    }
  }

  async startChat() {
    console.log('🚀 COSMARA Multi-Provider Chat Bot Started!');
    console.log('💡 Type "quit" to exit, "rotate" to switch providers, "stats" for statistics');
    console.log(\`🔧 Starting with: \${this.getCurrentProvider()}\\n\`);
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const askQuestion = () => {
      rl.question('Enter your message: ', async (userInput) => {
        if (userInput.toLowerCase() === 'quit') {
          console.log(\`\\n👋 Chat ended. Total cost: $\${this.totalCost.toFixed(4)}\`);
          rl.close();
          return;
        }
        
        if (userInput.toLowerCase() === 'rotate') {
          this.rotateProvider();
          askQuestion();
          return;
        }
        
        if (userInput.toLowerCase() === 'stats') {
          console.log(\`\\n📊 Session Statistics:\`);
          console.log(\`   Current Provider: \${this.getCurrentProvider()}\`);
          console.log(\`   Messages Exchanged: \${this.conversationHistory.length / 2}\`);
          console.log(\`   Total Cost: $\${this.totalCost.toFixed(4)}\`);
          console.log(\`   Average Cost per Message: $\${(this.totalCost / (this.conversationHistory.length / 2 || 1)).toFixed(4)}\\n\`);
          askQuestion();
          return;
        }
        
        await this.sendMessage(userInput);
        askQuestion();
      });
    };

    askQuestion();
  }
}

// Start the chat bot
const bot = new ChatBot();
bot.startChat().catch(console.error);`)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="text-sm text-gray-300 overflow-x-auto">
{`// COSMARA Multi-Provider Chat Bot
// Complete working example with provider rotation and error handling

require('dotenv').config();
const { createClient, APIProvider } = require('@cosmara-ai/community-sdk');

class ChatBot {
  constructor() {
    this.client = createClient({
      apiKeys: {
        openai: process.env.OPENAI_API_KEY,
        anthropic: process.env.ANTHROPIC_API_KEY,
        google: process.env.GOOGLE_API_KEY,
      },
    });
    
    this.providers = [APIProvider.OPENAI, APIProvider.ANTHROPIC, APIProvider.GOOGLE];
    this.currentProviderIndex = 0;
    this.conversationHistory = [];
    this.totalCost = 0;
  }

  getCurrentProvider() {
    return this.providers[this.currentProviderIndex];
  }

  rotateProvider() {
    this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
    console.log(\`🔄 Switched to: \${this.getCurrentProvider()}\`);
  }

  async estimateCost(message) {
    try {
      const estimates = await this.client.estimateCost({
        model: this.getModelForProvider(this.getCurrentProvider()),
        messages: [...this.conversationHistory, { role: 'user', content: message }],
        maxTokens: 500,
      });
      
      const currentProviderEstimate = estimates.find(e => e.provider === this.getCurrentProvider());
      return currentProviderEstimate ? currentProviderEstimate.cost : 0.01;
    } catch (error) {
      console.log('⚠️  Cost estimation unavailable');
      return 0.01;
    }
  }

  getModelForProvider(provider) {
    const models = {
      [APIProvider.OPENAI]: 'gpt-4o-mini',
      [APIProvider.ANTHROPIC]: 'claude-3-haiku-20240307',
      [APIProvider.GOOGLE]: 'gemini-1.5-flash'
    };
    return models[provider];
  }

  async sendMessage(userMessage) {
    console.log(\`\\n👤 You: \${userMessage}\`);
    
    // Add to conversation history
    this.conversationHistory.push({ role: 'user', content: userMessage });
    
    // Estimate cost
    const estimatedCost = await this.estimateCost(userMessage);
    console.log(\`💰 Estimated cost: $\${estimatedCost.toFixed(4)}\`);
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        console.log(\`🤖 \${this.getCurrentProvider()} is thinking...\`);
        
        const response = await this.client.chat({
          model: this.getModelForProvider(this.getCurrentProvider()),
          messages: this.conversationHistory,
          maxTokens: 500,
          temperature: 0.7,
        }, {
          provider: this.getCurrentProvider()
        });
        
        const assistantMessage = response.choices[0].message.content;
        console.log(\`🤖 \${this.getCurrentProvider()}: \${assistantMessage}\`);
        
        // Add to conversation history
        this.conversationHistory.push({ role: 'assistant', content: assistantMessage });
        
        // Track cost
        this.totalCost += estimatedCost;
        console.log(\`📊 Total session cost: $\${this.totalCost.toFixed(4)}\`);
        
        return assistantMessage;
        
      } catch (error) {
        attempts++;
        console.log(\`❌ Error with \${this.getCurrentProvider()}: \${error.message}\`);
        
        if (attempts < maxAttempts) {
          console.log(\`🔄 Trying next provider...\`);
          this.rotateProvider();
        } else {
          console.log('❌ All providers failed. Please check your API keys and try again.');
          return null;
        }
      }
    }
  }

  async startChat() {
    console.log('🚀 COSMARA Multi-Provider Chat Bot Started!');
    console.log('💡 Type "quit" to exit, "rotate" to switch providers, "stats" for statistics');
    console.log(\`🔧 Starting with: \${this.getCurrentProvider()}\\n\`);
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const askQuestion = () => {
      rl.question('Enter your message: ', async (userInput) => {
        if (userInput.toLowerCase() === 'quit') {
          console.log(\`\\n👋 Chat ended. Total cost: $\${this.totalCost.toFixed(4)}\`);
          rl.close();
          return;
        }
        
        if (userInput.toLowerCase() === 'rotate') {
          this.rotateProvider();
          askQuestion();
          return;
        }
        
        if (userInput.toLowerCase() === 'stats') {
          console.log(\`\\n📊 Session Statistics:\`);
          console.log(\`   Current Provider: \${this.getCurrentProvider()}\`);
          console.log(\`   Messages Exchanged: \${this.conversationHistory.length / 2}\`);
          console.log(\`   Total Cost: $\${this.totalCost.toFixed(4)}\`);
          console.log(\`   Average Cost per Message: $\${(this.totalCost / (this.conversationHistory.length / 2 || 1)).toFixed(4)}\\n\`);
          askQuestion();
          return;
        }
        
        await this.sendMessage(userInput);
        askQuestion();
      });
    };

    askQuestion();
  }
}

// Start the chat bot
const bot = new ChatBot();
bot.startChat().catch(console.error);`}
                      </pre>
                    </div>
                  </div>

                  {/* Environment Setup */}
                  <div>
                    <h3 className="text-h4 text-text-primary mb-4">Environment Configuration</h3>
                    <p className="text-body text-text-secondary mb-4">
                      Create a <code className="bg-slate-800 px-2 py-1 rounded">.env</code> file with your API keys:
                    </p>
                    <div className="bg-slate-900 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-400">.env</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`# COSMARA Community SDK API Keys
# Get these from the respective AI provider websites

# OpenAI API Key (from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-openai-key-here

# Anthropic API Key (from https://console.anthropic.com/)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Google AI API Key (from https://aistudio.google.com/app/apikey)
GOOGLE_API_KEY=your-google-ai-key-here`)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="text-sm text-gray-300">
{`# COSMARA Community SDK API Keys
# Get these from the respective AI provider websites

# OpenAI API Key (from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-openai-key-here

# Anthropic API Key (from https://console.anthropic.com/)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Google AI API Key (from https://aistudio.google.com/app/apikey)
GOOGLE_API_KEY=your-google-ai-key-here`}
                      </pre>
                    </div>
                  </div>

                  {/* Running the App */}
                  <div>
                    <h3 className="text-h4 text-text-primary mb-4">Running the Application</h3>
                    <div className="bg-slate-900 rounded-lg p-4 space-y-2">
                      <p className="text-gray-300">node chatbot.js</p>
                    </div>
                  </div>

                  {/* Expected Output */}
                  <div>
                    <h3 className="text-h4 text-text-primary mb-4">Expected Output</h3>
                    <div className="bg-slate-900 rounded-lg p-4">
                      <pre className="text-sm text-green-400">
{`🚀 COSMARA Multi-Provider Chat Bot Started!
💡 Type "quit" to exit, "rotate" to switch providers, "stats" for statistics
🔧 Starting with: OPENAI

Enter your message: Hello, how are you?

👤 You: Hello, how are you?
💰 Estimated cost: $0.0008
🤖 OPENAI is thinking...
🤖 OPENAI: Hello! I'm doing well, thank you for asking. I'm an AI assistant created by OpenAI, so I don't have feelings in the traditional sense, but I'm functioning properly and ready to help you with any questions or tasks you might have. How are you doing today? Is there anything I can assist you with?
📊 Total session cost: $0.0008

Enter your message: rotate

🔄 Switched to: ANTHROPIC

Enter your message: stats

📊 Session Statistics:
   Current Provider: ANTHROPIC
   Messages Exchanged: 1
   Total Cost: $0.0008
   Average Cost per Message: $0.0008`}
                      </pre>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div>
                    <h3 className="text-h4 text-text-primary mb-4">Next Steps</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h4 className="font-semibold text-text-primary mb-2">Customize the Bot</h4>
                        <ul className="text-sm text-text-secondary space-y-1">
                          <li>• Modify the conversation prompts</li>
                          <li>• Add custom commands</li>
                          <li>• Implement conversation memory</li>
                          <li>• Add file output for conversations</li>
                        </ul>
                      </Card>
                      <Card className="p-4">
                        <h4 className="font-semibold text-text-primary mb-2">Explore More Examples</h4>
                        <ul className="text-sm text-text-secondary space-y-1">
                          <li>• Try the Streaming Response App</li>
                          <li>• Build a Cost Comparison Tool</li>
                          <li>• Create a Content Generator</li>
                          <li>• Deploy to production</li>
                        </ul>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Placeholder for other examples */}
            {examples.slice(1).map((example) => (
              <TabsContent key={example.id} value={example.id}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-h2 text-text-primary">{example.title}</CardTitle>
                    <CardDescription className="text-body text-text-secondary">
                      {example.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Rocket className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="text-h3 text-text-primary mb-2">Coming Soon</h3>
                      <p className="text-body text-text-secondary mb-6">
                        This example is being prepared with complete code, documentation, and step-by-step instructions.
                      </p>
                      <Button className="glass-button-primary">
                        Notify Me When Ready
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
             style={{
               background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.10) 0%, rgba(59, 130, 246, 0.08) 50%, rgba(139, 92, 246, 0.10) 100%)'
             }}>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Card className="glass-card p-12 text-center">
            <h2 className="text-hero-glass mb-6">
              Ready to Build Your AI App?
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto mb-8">
              Start with any example above, or explore our Quick Start guide for a complete walkthrough 
              from installation to deployment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="glass-button-primary">
                <Rocket className="h-5 w-5 mr-2" />
                Quick Start Guide
              </Button>
              <Button size="lg" variant="outline" className="glass-button-secondary">
                <BookOpen className="h-5 w-5 mr-2" />
                API Reference
              </Button>
            </div>
          </Card>
        </div>
      </section>
      </>
  );
}