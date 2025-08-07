'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CosmicPageLayout } from '@/components/layouts/cosmic-page-layout';
import { CosmicPageHeader } from '@/components/ui/cosmic-page-header';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { 
  ArrowRight, 
  Code2, 
  BookOpen,
  Terminal,
  Shield,
  Zap,
  DollarSign,
  Users,
  BarChart3,
  Package,
  Github,
  ExternalLink,
  Download,
  Play,
  FileText,
  Lock,
  Globe,
  Lightbulb,
  Target,
  CheckCircle
} from 'lucide-react';

const quickStartSteps = [
  {
    title: 'Install SDK',
    description: 'Get started with our TypeScript SDK',
    code: 'npm install @cosmara-ai/community-sdk',
    icon: Package
  },
  {
    title: 'Initialize',
    description: 'Set up the AI orchestration client',
    code: `import { createClient } from '@cosmara-ai/community-sdk';

const client = createClient({
  apiKey: process.env.COSMARA_API_KEY
});`,
    icon: Code2
  },
  {
    title: 'Make Request',
    description: 'Use intelligent multi-provider routing',
    code: `const result = await client.chat.completions.create({
  messages: [{ role: 'user', content: 'Hello' }],
  model: 'gpt-4o',
  strategy: 'cost_optimized'
});`,
    icon: Zap
  }
];

const apiEndpoints = [
  {
    method: 'GET',
    endpoint: '/api/marketplace/apps',
    description: 'Browse marketplace apps',
    public: true
  },
  {
    method: 'POST',
    endpoint: '/api/developers/apps',
    description: 'Create new app',
    public: false
  },
  {
    method: 'GET',
    endpoint: '/api/keys',
    description: 'Manage API keys with encryption',
    public: false
  },
  {
    method: 'POST',
    endpoint: '/api/ai/chat',
    description: 'Multi-provider AI completions',
    public: false
  }
];

const features = [
  {
    icon: Code2,
    title: 'Multi-Provider SDK',
    description: 'Single SDK supporting GPT-4o, Claude 4 Sonnet, Gemini Veo 2, and local models with intelligent routing',
    link: '#sdk-reference'
  },
  {
    icon: DollarSign,
    title: 'Cost Optimization',
    description: 'Proven 99.5% cost savings through intelligent multi-provider routing and optimization',
    link: '#cost-optimization'
  },
  {
    icon: Shield,
    title: 'BYOK Security',
    description: 'Bring Your Own Key model with envelope encryption and HIPAA compliance options',
    link: '#security'
  },
  {
    icon: BarChart3,
    title: 'Analytics API',
    description: 'Real-time usage analytics, revenue tracking, and performance monitoring',
    link: '#analytics'
  }
];

const codeExamples = [
  {
    title: 'Basic AI Request',
    description: 'Simple text completion with automatic provider selection',
    code: `import { createClient } from '@cosmara-ai/community-sdk';

const client = createClient({
  apiKey: process.env.COSMARA_API_KEY
});

const result = await client.chat.completions.create({
  messages: [
    { role: 'user', content: 'Explain quantum computing' }
  ],
  model: 'gpt-4o',
  strategy: 'balanced' // or 'cost_optimized', 'performance'
});

console.log(result.choices[0].message.content);`
  },
  {
    title: 'Cost-Optimized Request',
    description: 'Achieve up to 99.5% savings with intelligent provider routing',
    code: `const result = await client.chat.completions.create({
  messages: [{ role: 'user', content: userQuery }],
  model: 'gemini-1.5-flash', // Most cost-effective
  strategy: 'cost_optimized',
  maxTokens: 1000
});

console.log('Cost savings: 99.5% vs OpenAI GPT-4');`
  },
  {
    title: 'HIPAA-Compliant Processing',
    description: 'Force local processing for sensitive medical data',
    code: `const medicalAnalysis = await ai.complete({
  messages: [
    { role: 'user', content: medicalDocumentText }
  ],
  constraints: {
    privacyLevel: 'hipaa',  // Forces local processing
    auditTrail: true        // Compliance logging
  }
});

// Guaranteed local processing, no cloud providers`
  },
  {
    title: 'Video Generation with Gemini Veo',
    description: 'Create AI-generated videos from text descriptions',
    code: `// First-to-market Gemini Veo 2 integration
const videoResult = await client.video.generations.create({
  prompt: 'A serene mountain landscape at sunset',
  model: 'gemini-veo-2-flash',
  duration: 5, // seconds
  aspectRatio: '16:9'
});

// Poll for completion
const video = await client.video.generations.retrieve(
  videoResult.id
);

console.log('Video URL:', video.url);`
  }
];

export default function DeveloperDocsPage() {
  return (
    <CosmicPageLayout gradientOverlay="purple" starCount={75} parallaxSpeed={0.4}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <CosmicPageHeader
            icon={BookOpen}
            title="Build AI Apps with Multi-Provider Intelligence"
            subtitle="Comprehensive documentation for our TypeScript SDK with multi-provider support, cost optimization, and HIPAA-compliant local processing."
            badge="SDK Documentation"
            maxWidth="3xl"
          />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" className="glass-button-primary text-lg px-8 py-6 transition-all duration-300 hover:scale-105" asChild>
              <Link href="#quick-start">
                Quick Start
                <Play className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="glass-button-secondary text-lg px-8 py-6 transition-all duration-300 hover:scale-105" asChild>
              <Link href="/developers/getting-started">
                Full Guide
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Platform Features
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              Everything you need to build and deploy professional AI applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={index} href={feature.link} className="block">
                  <CosmicCard variant="glass" className="h-full cursor-pointer hover:scale-[1.02] transition-all duration-300">
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-4 group-hover:from-purple-200 group-hover:to-blue-200 transition-colors">
                        <Icon className="h-6 w-6 text-glass-gradient" />
                      </div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-glass-gradient transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-text-secondary text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </CosmicCard>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section id="quick-start" className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Quick Start
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              Get up and running with our SDK in minutes.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {quickStartSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <CosmicCard key={index} variant="glass" className="relative">
                  <div className="mb-4">
                    <div className="flex items-center mb-4">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center font-bold text-sm mr-3">
                        {index + 1}
                      </div>
                      <Icon className="h-6 w-6 text-glass-gradient" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">{step.title}</h3>
                    <p className="text-text-secondary">{step.description}</p>
                  </div>
                  <div className="glass-card bg-gray-900/80 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-white/10">
                    <pre className="text-gray-100">{step.code}</pre>
                  </div>
                </CosmicCard>
              );
            })}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" className="glass-button-secondary transition-all duration-300 hover:scale-105" asChild>
              <Link href="/developers/getting-started">
                Complete Setup Guide
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Code Examples
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              Real-world examples showing the power of our multi-provider SDK.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {codeExamples.map((example, index) => (
              <CosmicCard key={index} variant="glass" className="overflow-hidden">
                <div className="mb-4">
                  <h3 className="flex items-center text-xl font-semibold text-text-primary mb-2">
                    <Code2 className="h-5 w-5 mr-2 text-glass-gradient" />
                    {example.title}
                  </h3>
                  <p className="text-text-secondary">{example.description}</p>
                </div>
                <div className="glass-card bg-deep-space/80 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-glass-border">
                  <pre className="text-stardust">{example.code}</pre>
                </div>
              </CosmicCard>
            ))}
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              API Reference
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              RESTful APIs for marketplace integration and app management.
            </p>
          </div>

          <CosmicCard variant="glass" className="mb-8">
            <div className="mb-4">
              <h3 className="flex items-center text-xl font-semibold text-text-primary mb-2">
                <Terminal className="h-5 w-5 mr-2 text-glass-gradient" />
                Available Endpoints
              </h3>
              <p className="text-text-secondary">
                Core API endpoints for developer integration
              </p>
            </div>
            <div className="space-y-4">
              {apiEndpoints.map((endpoint, index) => (
                <div key={index} className="glass-card bg-white/10 p-4 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-4 flex-wrap gap-2">
                      <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'} className="font-mono bg-purple-600/20 text-text-primary border-white/10">
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono text-glass-gradient">{endpoint.endpoint}</code>
                      {endpoint.public && (
                        <Badge variant="outline" className="text-xs border-white/10 bg-white/10 text-text-secondary">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      )}
                      {!endpoint.public && (
                        <Badge variant="outline" className="text-xs border-white/10 bg-white/10 text-text-secondary">
                          <Lock className="h-3 w-3 mr-1" />
                          Auth Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary">{endpoint.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CosmicCard>

          <div className="grid md:grid-cols-2 gap-8">
            <CosmicCard variant="glass">
              <div className="mb-4">
                <h3 className="flex items-center text-xl font-semibold text-text-primary mb-2">
                  <Shield className="h-5 w-5 mr-2 text-glass-gradient" />
                  Authentication
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-text-primary">Auth0 Integration</h4>
                  <p className="text-sm text-text-secondary mb-2">
                    Secure authentication with MFA support for sensitive operations.
                  </p>
                  <div className="glass-card bg-gray-900/80 p-3 rounded text-sm font-mono border border-white/10">
                    <span className="text-gray-100">Authorization: Bearer &lt;auth0_token&gt;</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-text-primary">Security Levels</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2 border-white/10 bg-white/10 text-text-secondary">LOW</Badge>
                      <span className="text-text-secondary">Basic authentication</span>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2 border-white/10 bg-white/10 text-text-secondary">HIGH</Badge>
                      <span className="text-text-secondary">MFA required for API keys</span>
                    </div>
                  </div>
                </div>
              </div>
            </CosmicCard>

            <CosmicCard variant="glass">
              <div className="mb-4">
                <h3 className="flex items-center text-xl font-semibold text-text-primary mb-2">
                  <Zap className="h-5 w-5 mr-2 text-glass-gradient" />
                  Rate Limits
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-text-primary">Default Limits</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Standard APIs</span>
                      <span className="font-mono text-glass-gradient">100/15min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">AI Processing</span>
                      <span className="font-mono text-glass-gradient">20/min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">File Uploads</span>
                      <span className="font-mono text-glass-gradient">5/min</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">
                    Higher limits available for verified developers.
                  </p>
                </div>
              </div>
            </CosmicCard>
          </div>
        </div>
      </section>

      {/* Resources & Links */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Resources & Support
            </h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              Everything you need to succeed as a developer on our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/developers/getting-started" className="block">
              <CosmicCard variant="glass" className="group h-full cursor-pointer hover:scale-[1.02] transition-all duration-300">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-glass-accent/20 to-glass-border/20 flex items-center justify-center mx-auto mb-4 group-hover:from-glass-accent/40 group-hover:to-glass-border/40 transition-colors">
                    <Lightbulb className="h-6 w-6 text-glass-gradient" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-glass-gradient transition-colors">
                    Getting Started
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Complete guide to building your first AI app
                  </p>
                </div>
              </CosmicCard>
            </Link>

            <Link href="/developers/submit" className="block">
              <CosmicCard variant="glass" className="group h-full cursor-pointer hover:scale-[1.02] transition-all duration-300">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-glass-accent/20 to-glass-border/20 flex items-center justify-center mx-auto mb-4 group-hover:from-glass-accent/40 group-hover:to-glass-border/40 transition-colors">
                    <Package className="h-6 w-6 text-glass-gradient" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-glass-gradient transition-colors">
                    Submit App
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Publish your app to the marketplace
                  </p>
                </div>
              </CosmicCard>
            </Link>

            <Link href="/dashboard/developer/analytics" className="block">
              <CosmicCard variant="glass" className="group h-full cursor-pointer hover:scale-[1.02] transition-all duration-300">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-glass-accent/20 to-glass-border/20 flex items-center justify-center mx-auto mb-4 group-hover:from-glass-accent/40 group-hover:to-glass-border/40 transition-colors">
                    <BarChart3 className="h-6 w-6 text-glass-gradient" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-glass-gradient transition-colors">
                    Analytics
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Track your app performance and revenue
                  </p>
                </div>
              </CosmicCard>
            </Link>

            <CosmicCard variant="glass" className="group h-full cursor-pointer hover:scale-[1.02] transition-all duration-300">
              <div className="text-center">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-glass-accent/20 to-glass-border/20 flex items-center justify-center mx-auto mb-4 group-hover:from-glass-accent/40 group-hover:to-glass-border/40 transition-colors">
                  <Users className="h-6 w-6 text-glass-gradient" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-glass-gradient transition-colors">
                  Community
                </h3>
                <p className="text-text-secondary text-sm">
                  Join our Discord community for support
                </p>
              </div>
            </CosmicCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-h2 text-text-primary mb-6">
              Ready to Start Building?
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              Join thousands of developers using our platform to create next-generation AI applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="glass-button-primary text-lg px-8 py-6 transition-all duration-300 hover:scale-105" asChild>
                <Link href="/developers/getting-started">
                  Start Building
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="glass-button-secondary text-lg px-8 py-6 transition-all duration-300 hover:scale-105">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </section>
    </CosmicPageLayout>
  );
}