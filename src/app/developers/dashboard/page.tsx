'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  BarChart3, 
  DollarSign, 
  Users, 
  Package, 
  TrendingUp,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Settings,
  Plus,
  Eye,
  Edit,
  Upload
} from 'lucide-react';

const quickStats = [
  { label: 'Total Apps', value: '—', icon: Package, color: 'text-blue-600' },
  { label: 'Active Users', value: '—', icon: Users, color: 'text-green-600' },
  { label: 'Total Earnings', value: '—', icon: DollarSign, color: 'text-purple-600' },
  { label: 'This Month', value: '—', icon: TrendingUp, color: 'text-orange-600' }
];

const quickActions = [
  {
    title: 'Submit New App',
    description: 'Upload and publish a new AI application',
    href: '/developers/submit',
    icon: Plus,
    primary: true
  },
  {
    title: 'View Analytics',
    description: 'Detailed performance and revenue analytics',
    href: '/dashboard/developer/analytics',
    icon: BarChart3,
    primary: false
  },
  {
    title: 'Documentation',
    description: 'SDK guides and API reference',
    href: '/developers/docs',
    icon: Eye,
    primary: false
  },
  {
    title: 'Getting Started',
    description: 'Complete developer onboarding guide',
    href: '/developers/getting-started',
    icon: Edit,
    primary: false
  }
];

const recentApps = [
  {
    name: 'Your First App',
    status: 'draft',
    updated: 'Start building...',
    action: 'Create'
  }
];

export default function DeveloperDashboardPage() {
  const router = useRouter();

  // After 3 seconds, auto-redirect to the comprehensive analytics page
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard/developer/analytics');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Developer Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Manage your apps, track performance, and grow your business
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Redirecting to full analytics...
              </Badge>
            </div>
          </div>
        </div>

        {/* Redirect Notice */}
        <Card className="mb-8 border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600 mr-4" />
                <div>
                  <h3 className="font-semibold text-purple-900">Enhanced Analytics Available</h3>
                  <p className="text-purple-700 text-sm">
                    You're being redirected to our comprehensive developer analytics dashboard with detailed metrics and charts.
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/dashboard/developer/analytics">
                  Go Now
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common developer tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-lg ${action.primary ? 'bg-purple-100' : 'bg-gray-100'} flex items-center justify-center mr-4`}>
                          <Icon className={`h-5 w-5 ${action.primary ? 'text-purple-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{action.title}</h4>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                      <Button variant={action.primary ? 'default' : 'outline'} size="sm" asChild>
                        <Link href={action.href}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Apps</CardTitle>
              <CardDescription>
                Your latest app projects and submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApps.map((app, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-semibold text-gray-500">{app.name}</h4>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="text-xs mr-2">
                          {app.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{app.updated}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/developers/submit">
                        {app.action}
                      </Link>
                    </Button>
                  </div>
                ))}
                
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No apps yet. Ready to build something amazing?</p>
                  <Button className="mt-4" asChild>
                    <Link href="/developers/getting-started">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Ready to Build Your First App?
            </CardTitle>
            <CardDescription>
              Follow our step-by-step guide to create and publish your AI application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold text-purple-600">1</span>
                </div>
                <h4 className="font-semibold mb-2">Learn the SDK</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Understand our multi-provider AI orchestration platform
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/developers/docs">
                    View Docs
                  </Link>
                </Button>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold text-blue-600">2</span>
                </div>
                <h4 className="font-semibold mb-2">Build Your App</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Follow our comprehensive getting started guide
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/developers/getting-started">
                    Start Guide
                  </Link>
                </Button>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold text-green-600">3</span>
                </div>
                <h4 className="font-semibold mb-2">Publish & Earn</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Submit your app and start earning with 85% revenue share
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/developers/submit">
                    Submit App
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}