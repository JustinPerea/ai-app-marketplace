import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layouts/main-layout';
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
  DollarSign
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
      'Install the AI Marketplace SDK',
      'Configure your development environment',
      'Authenticate with the platform'
    ],
    codeExample: `npm install @ai-marketplace/sdk
npx ai-marketplace init my-app
cd my-app
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
    codeExample: `import { AIApp, OpenAIProvider } from '@ai-marketplace/sdk';

const app = new AIApp({
  name: 'My AI App',
  version: '1.0.0',
  description: 'An amazing AI application'
});

app.addProvider(new OpenAIProvider({
  model: 'gpt-4',
  temperature: 0.7
}));

export default app;`
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
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            <Code2 className="h-3 w-3 mr-1" />
            Getting Started Guide
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Build Your First AI Application
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Follow this step-by-step guide to create, test, and publish your AI application to our marketplace.
          </p>
        </div>

        {/* Prerequisites */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-500" />
              Prerequisites
            </CardTitle>
            <CardDescription>
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
              <Card key={step.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          {step.id}. {step.title}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {step.duration}
                        </Badge>
                      </div>
                      <CardDescription className="text-base">
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
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
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
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Rocket className="h-5 w-5 mr-2" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-blue-800">
              Once you've completed these steps, you'll be ready to start building amazing AI applications!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <Link href="/developers/docs">
                  Explore SDK Documentation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100" asChild>
                <Link href="/developers/examples">
                  Browse Examples
                </Link>
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100" asChild>
                <Link href="/developers/community">
                  Join Community
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}