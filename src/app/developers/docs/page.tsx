'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layouts/main-layout';
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
    code: 'npm install @ai-marketplace/sdk',
    icon: Package
  },
  {
    title: 'Initialize',
    description: 'Set up the AI orchestration client',
    code: `import { ai } from '@ai-marketplace/sdk';`,
    icon: Code2
  },
  {
    title: 'Make Request',
    description: 'Use intelligent multi-provider routing',
    code: `const result = await ai.complete({
  messages: [{ role: 'user', content: 'Hello' }],
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
    endpoint: '/api/security/api-keys',
    description: 'List user API keys (MFA required)',
    public: false
  },
  {
    method: 'POST',
    endpoint: '/api/developers/apps/{id}/submit',
    description: 'Submit app for review',
    public: false
  }
];

const features = [
  {
    icon: Code2,
    title: 'Multi-Provider SDK',
    description: 'Single SDK supporting OpenAI, Claude, Gemini, and local models with intelligent routing',
    link: '#sdk-reference'
  },
  {
    icon: DollarSign,
    title: 'Cost Optimization',
    description: 'Automatic cost optimization with 50-80% savings through smart provider selection',
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
    code: `const result = await ai.complete({
  messages: [
    { role: 'user', content: 'Explain quantum computing' }
  ],
  strategy: 'balanced' // or 'cost_optimized', 'performance'
});

console.log(result.content);
console.log(\`Cost: $\${result.cost.total}\`);`
  },
  {
    title: 'Cost-Constrained Request',
    description: 'Set maximum cost limits with automatic provider selection',
    code: `const result = await ai.complete({
  messages: [{ role: 'user', content: userQuery }],
  constraints: {
    maxCost: 0.05,      // Maximum $0.05 per request
    maxLatency: 5000    // Maximum 5 second response
  },
  strategy: 'cost_optimized'
});`
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
    title: 'Multi-Step Workflow',
    description: 'Chain multiple AI operations with different providers',
    code: `const workflow = await ai.workflow([
  {
    name: 'extract',
    prompt: 'Extract key info from: {{ input }}',
    strategy: 'cost_optimized'
  },
  {
    name: 'analyze', 
    prompt: 'Analyze: {{ extract.output }}',
    strategy: 'performance',
    requirements: { reasoning: true }
  },
  {
    name: 'summarize',
    prompt: 'Summarize: {{ analyze.output }}',
    strategy: 'balanced'
  }
]);`
  }
];

export default function DeveloperDocsPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              <BookOpen className="h-3 w-3 mr-1" />
              SDK Documentation
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Build AI Apps with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"> Multi-Provider Intelligence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Comprehensive documentation for our TypeScript SDK with multi-provider support, 
              cost optimization, and HIPAA-compliant local processing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="#quick-start">
                  Quick Start
                  <Play className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/developers/getting-started">
                  Full Guide
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Platform Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to build and deploy professional AI applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer" asChild>
                  <Link href={feature.link}>
                    <CardHeader className="text-center pb-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-4 group-hover:from-purple-200 group-hover:to-blue-200 transition-colors">
                        <Icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-center">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section id="quick-start" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Quick Start
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get up and running with our SDK in minutes.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {quickStartSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="relative">
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm mr-3">
                        {index + 1}
                      </div>
                      <Icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{step.code}</pre>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/developers/getting-started">
                Complete Setup Guide
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Code Examples
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real-world examples showing the power of our multi-provider SDK.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {codeExamples.map((example, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code2 className="h-5 w-5 mr-2 text-purple-600" />
                    {example.title}
                  </CardTitle>
                  <CardDescription>{example.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{example.code}</pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              API Reference
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              RESTful APIs for marketplace integration and app management.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Terminal className="h-5 w-5 mr-2" />
                Available Endpoints
              </CardTitle>
              <CardDescription>
                Core API endpoints for developer integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'} className="font-mono">
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono text-gray-800">{endpoint.endpoint}</code>
                      {endpoint.public && (
                        <Badge variant="outline" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      )}
                      {!endpoint.public && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Auth Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{endpoint.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Auth0 Integration</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Secure authentication with MFA support for sensitive operations.
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono">
                      Authorization: Bearer &lt;auth0_token&gt;
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Security Levels</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">LOW</Badge>
                        <span className="text-gray-600">Basic authentication</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">HIGH</Badge>
                        <span className="text-gray-600">MFA required for API keys</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Rate Limits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Default Limits</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Standard APIs</span>
                        <span className="font-mono">100/15min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">AI Processing</span>
                        <span className="font-mono">20/min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">File Uploads</span>
                        <span className="font-mono">5/min</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Higher limits available for verified developers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Resources & Links */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Resources & Support
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed as a developer on our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer" asChild>
              <Link href="/developers/getting-started">
                <CardHeader className="text-center pb-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-4 group-hover:from-green-200 group-hover:to-emerald-200 transition-colors">
                    <Lightbulb className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                    Getting Started
                  </CardTitle>
                  <CardDescription className="text-center">
                    Complete guide to building your first AI app
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer" asChild>
              <Link href="/developers/submit">
                <CardHeader className="text-center pb-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    Submit App
                  </CardTitle>
                  <CardDescription className="text-center">
                    Publish your app to the marketplace
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer" asChild>
              <Link href="/dashboard/developer/analytics">
                <CardHeader className="text-center pb-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-100 to-violet-100 flex items-center justify-center mx-auto mb-4 group-hover:from-purple-200 group-hover:to-violet-200 transition-colors">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                    Analytics
                  </CardTitle>
                  <CardDescription className="text-center">
                    Track your app performance and revenue
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center mx-auto mb-4 group-hover:from-orange-200 group-hover:to-red-200 transition-colors">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg group-hover:text-orange-600 transition-colors">
                  Community
                </CardTitle>
                <CardDescription className="text-center">
                  Join our Discord community for support
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Start Building?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of developers using our platform to create next-generation AI applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
                <Link href="/developers/getting-started">
                  Start Building
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}