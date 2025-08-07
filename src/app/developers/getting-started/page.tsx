import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CosmicPageLayout } from '@/components/layouts/cosmic-page-layout';
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
  return (
    <CosmicPageLayout starCount={30} parallaxSpeed={0.2} gradientOverlay="none">
      <div className="container mx-auto px-4 py-8 relative z-10">
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
          <h1 className="text-hero-glass mb-6">
            <span className="text-glass-gradient">Build Your First</span>
            <br />
            <span className="text-stardust-muted">AI Application</span>
          </h1>
          <p className="text-body-lg text-text-secondary mb-8 leading-relaxed max-w-3xl mx-auto">
            Follow this step-by-step guide to create, test, and publish your AI application to our marketplace.
          </p>
        </div>

        {/* Prerequisites */}
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
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/api/auth/login">Create Developer Account</Link>
                  </Button>
                  <p className="text-sm text-gray-600">
                    Sign up for a free developer account to access the SDK and publish applications.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Guide */}
        <div className="space-y-8 mb-12">
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
        </div>

        {/* Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer" asChild>
                  <Link href={resource.href}>
                    <CardHeader className="text-center pb-4">
                      <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                        <Icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                        {resource.title}
                      </CardTitle>
                      <CardDescription className="text-center">
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Next Steps */}
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
              <Button asChild>
                <Link href="/developers/docs">
                  Explore SDK Documentation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="glass-button-secondary" asChild>
                <Link href="/developers/examples">
                  Browse Examples
                </Link>
              </Button>
              <Button variant="outline" className="glass-button-secondary" asChild>
                <Link href="/developers/community">
                  Join Community
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CosmicPageLayout>
  );
}