import Link from 'next/link';
import { CosmicPageLayout } from '@/components/layouts/cosmic-page-layout';
import { CosmicPageHeader } from '@/components/ui/cosmic-page-header';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Code2, 
  DollarSign, 
  Users, 
  BarChart3,
  Shield,
  Zap,
  BookOpen,
  Github,
  Terminal,
  Package,
  Rocket,
  Star,
  TrendingUp,
  Calculator,
  Bot
} from 'lucide-react';

const features = [
  {
    icon: DollarSign,
    title: 'Revenue Sharing',
    description: '0% commission on your first $100K in revenue, then industry-leading rates'
  },
  {
    icon: Code2,
    title: 'TypeScript SDK',
    description: 'Comprehensive SDK with multi-provider abstraction and type safety'
  },
  {
    icon: Shield,
    title: 'BYOK Security',
    description: 'Users bring their own API keys, ensuring maximum security and cost transparency'
  },
  {
    icon: Users,
    title: 'Growing Ecosystem',
    description: '10K+ developers and 50K+ users discovering new AI applications daily'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Real-time insights into usage, revenue, and user feedback'
  },
  {
    icon: Zap,
    title: 'Instant Deployment',
    description: 'Deploy your applications instantly with our automated CI/CD pipeline'
  }
];

const stats = [
  { label: 'Active Developers', value: '—' },
  { label: 'Apps Published', value: '—' },
  { label: 'Monthly Downloads', value: '—' },
  { label: 'Revenue Generated', value: '—' }
];

const popularApps = [
  {
    name: 'Content Studio Pro',
    developer: 'ContentCorp',
    category: 'Content Creation',
    downloads: '12.5K',
    rating: 4.8,
    revenue: '$48K'
  },
  {
    name: 'Code Assistant Ultimate', 
    developer: 'DevTools Inc',
    category: 'Development',
    downloads: '28.3K',
    rating: 4.9,
    revenue: '$92K'
  },
  {
    name: 'Analytics Insight Engine',
    developer: 'DataViz Solutions', 
    category: 'Analytics',
    downloads: '8.9K',
    rating: 4.7,
    revenue: '$31K'
  }
];

const quickLinks = [
  {
    title: 'ROI Calculator',
    description: 'Calculate your potential revenue from building apps on COSMARA',
    href: '/developers/roi-calculator',
    icon: Calculator
  },
  {
    title: 'Getting Started Guide',
    description: 'Learn how to build and publish your first AI application',
    href: '/developers/getting-started',
    icon: BookOpen
  },
  {
    title: 'SDK Documentation',
    description: 'Complete API reference and code examples',
    href: '/developers/docs',
    icon: Code2
  },
  {
    title: 'Submit Your App',
    description: 'Publish your application to the marketplace',
    href: '/developers/submit',
    icon: Package
  },
  {
    title: 'Developer Dashboard',
    description: 'Manage your apps, view analytics, and track revenue',
    href: '/developers/dashboard',
    icon: BarChart3
  }
];

export default function DevelopersPage() {
  return (
    <CosmicPageLayout gradientOverlay="default" starCount={50} parallaxSpeed={0.3}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-6"
                 style={{ 
                   background: 'rgba(255, 215, 0, 0.1)', 
                   borderColor: 'rgba(255, 215, 0, 0.3)' 
                 }}>
              <Code2 className="h-3 w-3 mr-2" style={{ color: '#FFD700' }} />
              <span className="text-sm font-medium text-text-primary">Developer Portal</span>
            </div>
            <h1 className="text-hero-glass mb-6 leading-tight">
              <span className="text-stardust-muted">Build the Future of</span>
              <br />
              <span className="text-glass-gradient">AI Applications</span>
            </h1>
            <p className="text-body-lg text-text-secondary mb-6 leading-relaxed max-w-3xl mx-auto">
              Join thousands of developers building and monetizing AI applications on our platform. 
              With our BYOK model, comprehensive SDK, and generous revenue sharing, success starts here.
            </p>
            
            {/* ROI Calculator Promotion Banner */}
            <div className="glass-card max-w-2xl mx-auto mb-8 p-6 border border-golden-nebula/30" 
                 style={{ background: 'rgba(255, 215, 0, 0.05)' }}>
              <div className="flex items-center justify-center gap-3 mb-3">
                <Calculator className="h-5 w-5" style={{ color: '#FFD700' }} />
                <span className="text-lg font-semibold text-golden-nebula">NEW: Revenue Calculator</span>
              </div>
              <p className="text-sm text-text-secondary text-center">
                Calculate your potential earnings with our 0% commission advantage. 
                See how much you could make in your first year.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6 glass-button-primary" asChild>
                <Link href="/developers/claude-code">
                  <Bot className="mr-2 h-5 w-5" />
                  Using Claude Code?
                </Link>
              </Button>
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/developers/getting-started">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/developers/roi-calculator">
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculate ROI
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/developers/docs">
                  View Documentation
                  <BookOpen className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools, infrastructure, and support you need to build and scale AI applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="relative group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center mb-4 group-hover:from-purple-200 group-hover:to-blue-200 transition-colors">
                      <Icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how developers are building successful businesses on our platform.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {popularApps.map((app, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      <CardDescription>by {app.developer}</CardDescription>
                    </div>
                    <Badge variant="outline">{app.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Downloads</p>
                      <p className="font-semibold text-lg">{app.downloads}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Revenue</p>
                      <p className="font-semibold text-lg text-green-600">{app.revenue}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Rating</p>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-semibold">{app.rating}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Growth</p>
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span className="font-semibold">+23%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get Started Today
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to start building, publishing, and monetizing AI applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer" asChild>
                  <Link href={link.href}>
                    <CardHeader className="text-center pb-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-4 group-hover:from-purple-200 group-hover:to-blue-200 transition-colors">
                        <Icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                        {link.title}
                      </CardTitle>
                      <CardDescription className="text-center">
                        {link.description}
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Launch Your AI Application?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join our developer community and start earning from day one with our generous revenue sharing model.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
                <Link href="/developers/getting-started">
                  Start Building
                  <Rocket className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/developers/submit">
                  Submit Your App
                  <Package className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </CosmicPageLayout>
  );
}