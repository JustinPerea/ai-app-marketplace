'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CosmicPageLayout } from '@/components/layouts/cosmic-page-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { APIKeyManager } from '@/lib/api-keys-hybrid';
import { 
  ArrowRight, 
  Check, 
  Code2, 
  Package, 
  Rocket, 
  Terminal,
  FileText,
  Settings,
  Users,
  DollarSign,
  Star,
  TrendingUp
} from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Set Up Your Environment',
    description: 'Install the SDK and configure your development environment',
    icon: Terminal,
    duration: '5 minutes',
    tasks: [
      'Install Node.js 18+ and npm',
      'Install the COSMARA Community SDK',
      'Configure your development environment',
      'Authenticate with the platform'
    ],
    codeExample: `npm install @cosmara-ai/community-sdk
npm create next-app@latest my-app
cd my-app
npm install @cosmara-ai/community-sdk
npm run dev`
  },
  {
    id: 2,
    title: 'Build Your Application',
    description: 'Create your AI application using our comprehensive SDK',
    icon: Code2,
    duration: '30 minutes',
    tasks: [
      'Define your application structure',
      'Implement AI provider integrations',
      'Add user interface components',
      'Configure application settings'
    ],
    codeExample: `import { createClient, APIProvider } from '@cosmara-ai/community-sdk';

const client = createClient({
  apiKey: process.env.COSMARA_API_KEY,
  baseURL: 'https://api.cosmara.ai/v1'
});

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'user', content: 'Hello from my AI app!' }
  ]
});

console.log(response.choices[0].message.content);`
  },
  {
    id: 3,
    title: 'Test & Validate',
    description: 'Test your application thoroughly before publishing',
    icon: Settings,
    duration: '15 minutes',
    tasks: [
      'Run local tests and validation',
      'Test with different AI providers',
      'Verify error handling',
      'Check performance metrics'
    ],
    codeExample: `npm run test
npm run validate
npm run build
npm run preview`
  },
  {
    id: 4,
    title: 'Publish to Marketplace',
    description: 'Submit your application for review and publication',
    icon: Package,
    duration: '10 minutes',
    tasks: [
      'Complete application metadata',
      'Upload screenshots and assets',
      'Submit for marketplace review',
      'Monitor approval status'
    ],
    codeExample: `npm run publish
# Application submitted for review
# Review typically takes 24-48 hours`
  }
];

const requirements = [
  'Node.js 18 or higher',
  'npm or yarn package manager',
  'Git for version control',
  'Code editor (VS Code recommended)',
  'Valid AI provider API keys for testing'
];

const resources = [
  {
    title: 'SDK Documentation',
    description: 'Complete API reference and guides',
    href: '/developers/docs',
    icon: FileText
  },
  {
    title: 'Hello World Scaffold',
    description: 'Copy two files and run',
    href: '/developers/hello-world',
    icon: Code2
  },
  {
    title: 'Example Applications',
    description: 'Browse open-source examples',
    href: '/developers/examples',
    icon: Code2
  },
  {
    title: 'Developer Community',
    description: 'Connect with other developers',
    href: '/developers/community',
    icon: Users
  },
  {
    title: 'Revenue Guidelines',
    description: 'Monetization best practices',
    href: '/developers/revenue',
    icon: DollarSign
  }
];

export default function GettingStartedPage() {
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loadingNotice, setLoadingNotice] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const keys = await APIKeyManager.getAll();
        const active = keys.filter((k: any) => k.isActive);
        if (mounted) setNeedsSetup(active.length === 0);
      } catch {
        if (mounted) setNeedsSetup(true);
      } finally {
        if (mounted) setLoadingNotice(false);
      }
    })();
    return () => { mounted = false; };
  }, []);
  return (
    <CosmicPageLayout starCount={30} parallaxSpeed={0.2} gradientOverlay="none">
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb 
            items={[
              { label: 'Developers', href: '/developers' },
              { label: 'Getting Started' }
            ]} 
          />
        </div>
        
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-6" 
               style={{ 
                 background: 'rgba(139, 92, 246, 0.1)', 
                 borderColor: 'rgba(139, 92, 246, 0.3)' 
               }}>
            <Code2 className="h-3 w-3 mr-2" style={{ color: '#8B5CF6' }} />
            <span className="text-sm font-medium text-text-primary">Getting Started Guide</span>
          </div>
        {/* Compact TOC */}
        <nav aria-label="Table of contents" className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full glass-card">
            <a href="#prerequisites" className="text-xs sm:text-sm text-text-secondary hover:text-text-primary">Prerequisites</a>
            <span className="text-text-secondary/40">•</span>
            <a href="#steps" className="text-xs sm:text-sm text-text-secondary hover:text-text-primary">Steps</a>
            <span className="text-text-secondary/40">•</span>
            <a href="#resources" className="text-xs sm:text-sm text-text-secondary hover:text-text-primary">Resources</a>
            <span className="text-text-secondary/40">•</span>
            <a href="#next" className="text-xs sm:text-sm text-text-secondary hover:text-text-primary">Next</a>
          </div>
        </nav>
          <h1 className="text-hero-glass mb-6">
            <span className="text-glass-gradient">Build Your First</span>
            <br />
            <span className="text-stardust-muted">AI Application</span>
          </h1>
          <p className="text-body-lg text-text-secondary mb-8 leading-relaxed max-w-3xl mx-auto">
            Follow this step-by-step guide to create, test, and publish your AI application to our marketplace.
          </p>
          {loadingNotice ? (
            <div className="max-w-2xl mx-auto">
              <div className="h-12 w-full rounded-md bg-white/10 animate-pulse" />
            </div>
          ) : needsSetup && (
            <div className="max-w-2xl mx-auto">
              <Alert className="border-amber-200 bg-amber-50">
                <AlertDescription className="text-amber-800">
                  You haven’t connected any AI providers yet. Some steps require keys.{' '}
                  <Link href="/setup" className="underline hover:no-underline">Go to Setup</Link>.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* Prerequisites */}
        <section id="prerequisites">
        <Card className="glass-card mb-12">
          <CardHeader>
            <CardTitle className="flex items-center text-text-primary">
              <Check className="h-5 w-5 mr-2 text-green-500" />
              Prerequisites
            </CardTitle>
            <CardDescription className="text-text-secondary">
              Make sure you have these requirements before getting started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">System Requirements</h3>
                <ul className="space-y-2">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Account Setup</h3>
                <div className="space-y-3">
                  <button className="px-6 py-3 text-sm rounded-lg font-medium border-2 transition-all duration-300 hover:scale-105" 
                          style={{ 
                            background: 'rgba(59, 130, 246, 0.1)', 
                            borderColor: '#3B82F6',
                            color: '#3B82F6'
                          }}>
                    <Link href="/api/auth/login" className="flex items-center justify-center">
                      Create Developer Account
                    </Link>
                  </button>
                  <p className="text-sm text-text-secondary">
                    Sign up for a free developer account to access the SDK and publish applications.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </section>

        {/* Step-by-Step Guide */}
        <section id="steps" className="space-y-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.id} className="glass-card overflow-hidden hover:scale-105 transition-transform duration-300">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0" 
                         style={{ 
                           background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                           border: '1px solid rgba(255, 255, 255, 0.1)'
                         }}>
                      <Icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl text-text-primary">
                          {step.id}. {step.title}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                          {step.duration}
                        </Badge>
                      </div>
                      <CardDescription className="text-base text-text-secondary">
                        {step.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Tasks */}
                    <div>
                      <h4 className="font-semibold mb-3">Tasks to complete:</h4>
                      <ul className="space-y-2">
                        {step.tasks.map((task, taskIndex) => (
                          <li key={taskIndex} className="flex items-start text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Code Example */}
                    <div>
                      <h4 className="font-semibold mb-3">Example code:</h4>
                      <div className="bg-dark-graphite text-text-primary p-4 rounded-lg overflow-x-auto border border-dark-ash">
                        <pre className="text-sm">
                          <code>{step.codeExample}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Resources */}
        <section id="resources" className="mb-12">
          <h2 className="text-section-header mb-6">Additional Resources</h2>
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <Link key={index} href={resource.href} className="glass-card p-6 cursor-pointer group hover:scale-105 transition-all duration-300 block">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform group-hover:shadow-lg"
                         style={{ 
                           background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                           boxShadow: '0 0 0 rgba(139, 92, 246, 0.3)',
                           transition: 'box-shadow 0.3s ease'
                         }}
                         className="group-hover:shadow-purple-500/50">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-h3 mb-3 text-text-primary group-hover:text-purple-300 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-body-glass group-hover:text-gray-200 transition-colors">
                      {resource.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Next Steps */}
        <section id="next">
        <Card className="glass-card relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center text-text-primary">
              <Rocket className="h-5 w-5 mr-2 text-blue-400" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-text-secondary">
              Once you've completed these steps, you'll be ready to start building amazing AI applications!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 flex items-center justify-center space-x-2 rounded-xl font-medium transition-all duration-300 hover:scale-105" 
                      style={{ 
                        background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
                        color: 'white',
                        boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.3)'
                      }}>
                <Link href="/developers/docs" className="flex items-center space-x-2">
                  <span>Explore SDK Documentation</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </button>
              <button className="px-8 py-4 flex items-center justify-center space-x-2 rounded-xl font-medium border-2 transition-all duration-300 hover:scale-105" 
                      style={{ 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        borderColor: '#3B82F6',
                        color: '#3B82F6'
                      }}>
                <Link href="/developers/examples" className="flex items-center space-x-2">
                  <span>Browse Examples</span>
                </Link>
              </button>
              <button className="px-8 py-4 flex items-center justify-center space-x-2 rounded-xl font-medium border-2 transition-all duration-300 hover:scale-105" 
                      style={{ 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        borderColor: '#3B82F6',
                        color: '#3B82F6'
                      }}>
                <Link href="/developers/community" className="flex items-center space-x-2">
                  <span>Join Community</span>
                </Link>
              </button>
            </div>
          </CardContent>
        </Card>
        </section>
      </div>
    </CosmicPageLayout>
  );
}