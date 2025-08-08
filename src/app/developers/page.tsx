"use client";

import Link from 'next/link';
import { CosmicPageLayout } from '@/components/layouts/cosmic-page-layout';
import { useAuth } from '@/lib/auth/auth-context';
import { useEffect, useState } from 'react';
import { APIKeyManager } from '@/lib/api-keys-hybrid';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CosmicPageHeader } from '@/components/ui/cosmic-page-header';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProviderLogo } from '@/components/ui/provider-logo';
import { Lock } from 'lucide-react';
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
  Bot,
  Copy,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  { label: 'Active Developers', value: '0' },
  { label: 'Apps Published', value: '0' },
  { label: 'Monthly Downloads', value: '0' },
  { label: 'Revenue Generated', value: '$0' }
];

const popularApps: Array<{
  name: string;
  developer: string;
  category: string;
  downloads: string;
  rating: number;
  revenue: string;
}> = [];

const quickLinks = [
  {
    title: 'Getting Started Guide',
    description: 'Learn how to build and publish your first AI application',
    href: '/developers/getting-started',
    icon: BookOpen
  },
  {
    title: 'Hello World Scaffold',
    description: 'Create two files and run',
    href: '/developers/hello-world',
    icon: Code2
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
    title: 'ROI Calculator',
    description: 'Calculate your potential revenue from building apps on COSMARA',
    href: '/developers/roi-calculator',
    icon: Calculator
  },
  {
    title: 'Developer Analytics',
    description: 'Manage your apps, view analytics, and track revenue',
    href: '/dashboard/analytics',
    icon: BarChart3
  }
];

export default function DevelopersPage() {
  const [needsSetup, setNeedsSetup] = useState(false);
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(new Set());
  const [tocOpen, setTocOpen] = useState(true);
  const [showQuick, setShowQuick] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const copyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const keys = await APIKeyManager.getAll();
        const active = keys.filter(k => k.isActive);
        if (mounted) {
          setNeedsSetup(active.length === 0);
          setConnectedProviders(new Set(active.map(k => k.provider)));
        }
      } catch {
        if (mounted) setNeedsSetup(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <CosmicPageLayout gradientOverlay="default" starCount={50} parallaxSpeed={0.3}>
      {/* Subtle brand background gradient layer */}
      <div 
        className="fixed inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 100%)',
          zIndex: 0
        }}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mb-3"
                 style={{ 
                   background: 'rgba(255, 215, 0, 0.1)', 
                   borderColor: 'rgba(255, 215, 0, 0.3)' 
                 }}>
              <Code2 className="h-3 w-3 mr-2" style={{ color: '#FFD700' }} />
              <span className="text-sm font-medium text-text-primary">Developer Portal</span>
            </div>
            {/* Compact in-page TOC */}
            <nav aria-label="Table of contents" className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full glass-card">
                <a href="#start" className="text-xs sm:text-sm text-text-secondary hover:text-text-primary">Start</a>
                <span className="text-text-secondary/40">•</span>
                <a href="#setup" className="text-xs sm:text-sm text-text-secondary hover:text-text-primary">Setup</a>
                <span className="text-text-secondary/40">•</span>
                <a href="#scaffold" className="text-xs sm:text-sm text-text-secondary hover:text-text-primary">Scaffold</a>
                <span className="text-text-secondary/40">•</span>
                <a href="#tools" className="text-xs sm:text-sm text-text-secondary hover:text-text-primary">Tools</a>
                <span className="text-text-secondary/40">•</span>
                <a href="#docs" className="text-xs sm:text-sm text-text-secondary hover:text-text-primary">Docs</a>
                <span className="text-text-secondary/40">•</span>
                <a href="#publish" className="text-xs sm:text-sm text-text-secondary hover:text-text-primary">Publish</a>
              </div>
            </nav>
            <h1 className="text-hero-glass mb-6 leading-tight">
              <span className="text-stardust-muted">Build the Future of</span>
              <br />
              <span className="text-glass-gradient">AI Applications</span>
            </h1>
            <p className="text-body-lg text-text-secondary mb-6 leading-relaxed max-w-3xl mx-auto">
              Join thousands of developers building and monetizing AI applications on our platform. 
              With our BYOK model, comprehensive SDK, and generous revenue sharing, success starts here.
            </p>

            {needsSetup && (
              <div className="max-w-2xl mx-auto mb-6">
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertDescription className="text-amber-800">
                    You haven’t connected any AI providers yet. Connect keys to test apps and SDK examples.{' '}
                    <Link href="/setup" className="underline hover:no-underline">Go to Setup</Link>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {!needsSetup && connectedProviders.size > 0 && (
              <div className="max-w-2xl mx-auto mb-6 flex items-center justify-center gap-3">
                <span className="text-sm text-text-secondary">Connected providers:</span>
                <div className="flex items-center gap-2">
                  {Array.from(connectedProviders).map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        borderColor: 'rgba(255,255,255,0.12)'
                      }}
                      title={p}
                    >
                      <ProviderLogo provider={p} size={16} />
                      <span className="text-xs text-text-secondary">{p}</span>
                    </span>
                  ))}
                </div>
                <Link href="/setup" className="underline text-sm">Manage</Link>
              </div>
            )}
            
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
            
            <div id="start" className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6 glass-button-primary" asChild>
                <Link href="/developers/ai-coding-tools">
                  <Bot className="mr-2 h-5 w-5" />
                  Use AI Coding Tools
                </Link>
              </Button>
              <Button size="lg" className="text-lg px-8 py-6 glass-button-secondary" asChild>
                <Link href="/developers/getting-started">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 glass-button-secondary" asChild>
                <Link href="/developers/roi-calculator">
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculate ROI
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 glass-button-secondary" asChild>
                <Link href="/developers/docs">
                  View Documentation
                  <BookOpen className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* 3-step checklist */}
            <div id="setup" className="grid md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
              {[{n:1,label:'Sign in to your account',desc:'Unlock analytics and account-backed key storage.'},{n:2,label:'Connect at least one provider',desc:'Add OpenAI, Anthropic, or Google keys in Setup.'},{n:3,label:'Create your first app',desc:'Scaffold a page and API route using our starter.'}].map((step)=> (
                <Card key={step.n} className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-text-primary">{step.n}. {step.label}</CardTitle>
                    <CardDescription className="text-text-secondary">
                      {step.n === 2 ? (
                        <>
                          Connect providers: <Link className="underline" href="/setup#openai">OpenAI</Link>,{' '}
                          <Link className="underline" href="/setup#anthropic">Anthropic</Link>,{' '}
                          <Link className="underline" href="/setup#google">Google</Link>
                        </>
                      ) : step.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Create new app CTA */}
            <div id="scaffold" className="mt-6">
              <Button size="lg" className="text-lg px-8 py-6 glass-button-primary" asChild>
                <Link href="/developers/quick-start">
                  Create a new app
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Quick commands + Hello World */}
            <section className="mt-6 max-w-4xl mx-auto w-full">
              <Card className="glass-card">
                <CardHeader className="flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-text-primary">Quick commands</CardTitle>
                    <CardDescription className="text-text-secondary">Install, run, and a minimal API example</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowQuick(v => !v)}>
                    {showQuick ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" /> Hide
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" /> Show
                      </>
                    )}
                  </Button>
                </CardHeader>
                {showQuick && (
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-text-secondary">Install + run</div>
                        <Button variant="outline" size="icon" onClick={() => copyText(`pnpm add @cosmara/sdk\npnpm dev`, 'cmds')}>
                          {copiedId === 'cmds' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <pre className="bg-black rounded-lg p-4 text-green-400 text-sm font-mono overflow-x-auto"><code>{`pnpm add @cosmara/sdk
pnpm dev`}</code></pre>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-text-secondary">Minimal API route: src/app/marketplace/my-app/api/route.ts</div>
                        <Button variant="outline" size="icon" onClick={() => copyText(`import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();
    if (!input?.trim()) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }
    return NextResponse.json({ result: ` + "`Hello ${input}!`" + ` });
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
`, 'api')}>
                          {copiedId === 'api' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <pre className="bg-black rounded-lg p-4 text-green-400 text-xs sm:text-sm font-mono overflow-x-auto"><code>{`import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();
    if (!input?.trim()) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }
    return NextResponse.json({ result: 'Hello ' + input + '!' });
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
`}</code></pre>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-text-secondary">Client call example</div>
                        <Button variant="outline" size="icon" onClick={() => copyText(`const res = await fetch('/marketplace/my-app/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: 'world' }) });\nconst data = await res.json();\nconsole.log(data.result);`, 'client')}>
                          {copiedId === 'client' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <pre className="bg-black rounded-lg p-4 text-green-400 text-xs sm:text-sm font-mono overflow-x-auto"><code>{`const res = await fetch('/marketplace/my-app/api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: 'world' })
});
const data = await res.json();
console.log(data.result);
`}</code></pre>
                    </div>
                  </CardContent>
                )}
              </Card>
            </section>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {isLoading
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="text-center">
                      <div className="h-8 w-16 mx-auto rounded-md bg-white/10 animate-pulse mb-2" />
                      <div className="h-3 w-24 mx-auto rounded bg-white/5 animate-pulse" />
                    </div>
                  ))
                : stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-text-primary">{stat.value}</div>
                      <div className="text-sm text-text-secondary">{stat.label}</div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="tools" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-section-header">Everything You Need to Succeed</h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">Our platform provides all the tools, infrastructure, and support you need to build and scale AI applications.</p>
            {/* Connected providers chips */}
            {isLoading ? (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-7 w-28 rounded-md bg-white/10 animate-pulse" />
                ))}
              </div>
            ) : connectedProviders.size > 0 ? (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {Array.from(connectedProviders).map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      borderColor: 'rgba(255,255,255,0.12)'
                    }}
                    title={p}
                  >
                    <ProviderLogo provider={p} size={18} />
                    <span className="text-sm text-text-secondary">{p}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-sm text-text-secondary">
                No providers connected yet. <Link href="/setup" className="underline">Connect providers</Link>
              </div>
            )}
          </div>

          <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="glass-card h-full group hover:scale-105 transition-all duration-300">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center mb-4"
                         style={{
                           background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(59, 130, 246, 0.18))'
                         }}>
                      <Icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-text-primary">{feature.title}</CardTitle>
                    <CardDescription className="leading-relaxed text-text-secondary">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {popularApps.length > 0 && (
        <section id="stories" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-section-header">Success Stories</h2>
              <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">See how developers are building successful businesses on our platform.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {popularApps.map((app, index) => (
                <Card key={index} className="glass-card hover:scale-105 transition-transform">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-text-primary">{app.name}</CardTitle>
                        <CardDescription className="text-text-secondary">by {app.developer}</CardDescription>
                      </div>
                      <Badge variant="outline">{app.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-text-secondary">Downloads</p>
                        <p className="font-semibold text-lg">{app.downloads}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary">Revenue</p>
                        <p className="font-semibold text-lg text-green-600">{app.revenue}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary">Rating</p>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="font-semibold">{app.rating}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-text-secondary">Growth</p>
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
      )}

      {/* Quick Links */}
      <section id="docs" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-section-header">Get Started Today</h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">Everything you need to start building, publishing, and monetizing AI applications.</p>
          </div>

          <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              const gated = link.href.startsWith('/dashboard');
              const targetHref = gated && !user ? `/auth/login?redirect=${encodeURIComponent(link.href)}` : link.href;
              return (
                <Card key={index} className="glass-card h-full group hover:scale-105 transition-all duration-300 cursor-pointer" asChild>
                  <Link href={targetHref}>
                    <CardHeader className="text-center pb-4">
                      <div className="h-12 w-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                           style={{
                             background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(59, 130, 246, 0.18))'
                           }}>
                        <Icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <CardTitle className="text-lg text-text-primary group-hover:text-purple-300 transition-colors flex items-center justify-center gap-2">
                        {link.title}
                        {gated && (
                          <Lock className="h-4 w-4 text-text-secondary" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-center text-text-secondary">
                        {link.description}{gated && !user ? ' • Requires sign-in' : ''}
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Publish Checklist */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="glass-card">
              <CardHeader className="text-center">
                <CardTitle className="text-text-primary">Publish checklist</CardTitle>
                <CardDescription className="text-text-secondary">
                  Ensure your app meets these requirements before submitting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                  <li>BYOK compliant: app works with user-provided API keys (no hardcoded secrets)</li>
                  <li>Clear error handling and validation across UI and API routes</li>
                  <li>Responsive UI using the cosmic design system and brand tokens</li>
                  <li>Performance: avoids blocking calls, handles loading states</li>
                  <li>Documentation: short README or help text inside the app</li>
                  <li>Assets: screenshots/logo and clear app description</li>
                  <li>Pricing/usage notes if applicable</li>
                </ul>
                <div className="mt-6 text-center">
                  <Button className="glass-button-primary" asChild>
                    <Link href="/developers/submit">Go to Submit</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Help Footer */}
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="text-sm text-text-secondary">Need help?</div>
          <div className="mt-3 flex items-center justify-center gap-4">
            <Link href="/developers/docs" className="underline">Docs</Link>
            <span className="text-text-secondary/40">•</span>
            <Link href="/roadmap" className="underline">Roadmap</Link>
            <span className="text-text-secondary/40">•</span>
            <Link href="mailto:support@cosmara.ai" className="underline">Support</Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="publish" className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
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