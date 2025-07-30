'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InstallAppModal } from '@/components/ui/install-app-modal';
import { useAppInstallation, useSubscriptions } from '@/lib/hooks/useSubscriptions';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  Download, 
  TrendingUp,
  Code2,
  Palette,
  BarChart3,
  MessageSquare,
  Image,
  FileText,
  Music,
  Video,
  Database,
  CheckCircle,
  Loader2
} from 'lucide-react';

const categories = [
  { id: 'all', name: 'All Apps', icon: Grid3X3, count: 47 },
  { id: 'LEGAL_TOOLS', name: 'Legal Tools', icon: FileText, count: 8 },
  { id: 'MEDICAL_TOOLS', name: 'Medical Tools', icon: Database, count: 6 },
  { id: 'DEVELOPER_TOOLS', name: 'Developer Tools', icon: Code2, count: 12 },
  { id: 'CONTENT_CREATION', name: 'Content Creation', icon: Palette, count: 9 },
  { id: 'DATA_ANALYSIS', name: 'Data Analysis', icon: BarChart3, count: 7 },
  { id: 'RESEARCH_TOOLS', name: 'Research Tools', icon: Search, count: 5 },
  { id: 'MARKETING_TOOLS', name: 'Marketing Tools', icon: TrendingUp, count: 4 },
  { id: 'BUSINESS', name: 'Business', icon: MessageSquare, count: 6 }
];

const apps = [
  {
    id: 9,
    name: "PDF Notes Generator",
    description: "Transform any PDF into structured, actionable notes using your choice of AI model. Perfect for research papers, reports, and documents with local or cloud processing.",
    category: "CONTENT_CREATION",
    rating: 4.8,
    installs: "2.1K",
    price: "Free + API costs",
    featured: true,
    verified: true,
    tags: ["Multi-Model", "PDF", "Notes", "Research", "Local AI"],
    publisher: "AI Marketplace",
    lastUpdated: "Today",
    providers: ["LOCAL", "OPENAI", "ANTHROPIC", "GOOGLE"],
    status: "active" // Fully functional app
  },
  {
    id: 1,
    name: "Legal Contract Analyzer",
    description: "AI-powered contract analysis that identifies risks, missing clauses, and negotiation points. Save 3-5 hours per contract review with Claude 3.5 Sonnet analysis.",
    category: "LEGAL_TOOLS",
    rating: 4.9,
    installs: "3.2K",
    price: "$299/mo",
    featured: true,
    verified: true,
    tags: ["Claude", "Legal", "Contracts", "Risk Analysis"],
    publisher: "LegalAI Solutions",
    lastUpdated: "2 days ago",
    providers: ["ANTHROPIC"],
    status: "active" // Fully functional app
  },
  {
    id: 2,
    name: "HIPAA Medical Scribe",
    description: "Voice-to-structured medical notes with local AI processing. Complete HIPAA compliance using Ollama models for patient privacy protection.",
    category: "MEDICAL_TOOLS",
    rating: 4.8,
    installs: "1.8K",
    price: "$149/mo",
    featured: true,
    verified: true,
    tags: ["Ollama", "HIPAA", "Medical", "Local AI"],
    publisher: "HealthTech AI",
    lastUpdated: "1 day ago",
    providers: ["LOCAL"],
    status: "active" // Fully functional app
  },
  {
    id: 3,
    name: "Code Review Bot",
    description: "Automated code review for security issues, performance optimizations, and style improvements. Integrates with GitHub PRs and supports 20+ languages.",
    category: "DEVELOPER_TOOLS",
    rating: 4.7,
    installs: "15.4K",
    price: "$49/mo",
    featured: true,
    verified: true,
    tags: ["GPT-4", "Code Review", "Security", "GitHub"],
    publisher: "DevSecure",
    lastUpdated: "3 days ago",
    providers: ["OPENAI", "ANTHROPIC"],
    status: "active" // Fully functional app
  },
  {
    id: 4,
    name: "Financial Report Analyzer",
    description: "Transform P&L statements and cash flow data into professional financial insights. Get analyst-level recommendations at 1/10th the cost.",
    category: "BUSINESS",
    rating: 4.6,
    installs: "4.7K",
    price: "$199/mo",
    featured: false,
    verified: true,
    tags: ["GPT-4", "Finance", "Analytics", "SMB"],
    publisher: "FinanceAI Pro",
    lastUpdated: "1 week ago",
    providers: ["OPENAI"],
    status: "in_development" // App in development, features limited
  },
  {
    id: 5,
    name: "Research Paper Synthesizer",
    description: "Academic literature review automation. Upload papers and get comprehensive synthesis with key insights and research gaps identified.",
    category: "RESEARCH_TOOLS",
    rating: 4.5,
    installs: "2.3K",
    price: "$79/mo",
    featured: false,
    verified: true,
    tags: ["Claude", "Academic", "Research", "Literature"],
    publisher: "AcademicAI",
    lastUpdated: "4 days ago",
    providers: ["ANTHROPIC"],
    status: "active" // Fully functional app
  },
  {
    id: 6,
    name: "Content Marketing Suite",
    description: "10x faster content creation with SEO optimization. Generate blog posts, social media content, and marketing copy from company data.",
    category: "MARKETING_TOOLS",
    rating: 4.4,
    installs: "8.1K",
    price: "$99/mo",
    featured: false,
    verified: true,
    tags: ["GPT-4", "Content", "SEO", "Marketing"],
    publisher: "ContentScale AI",
    lastUpdated: "2 days ago",
    providers: ["OPENAI", "ANTHROPIC"],
    status: "active" // Fully functional app
  },
  {
    id: 7,
    name: "Data Visualization Engine",
    description: "Transform complex datasets into interactive charts and dashboards using natural language queries. Perfect for business intelligence.",
    category: "DATA_ANALYSIS",
    rating: 4.3,
    installs: "6.8K",
    price: "$149/mo",
    featured: false,
    verified: true,
    tags: ["Gemini", "Data Viz", "BI", "Charts"],
    publisher: "DataViz Pro",
    lastUpdated: "1 week ago",
    providers: ["GOOGLE"],
    status: "active" // Fully functional app
  },
  {
    id: 8,
    name: "Brand Voice Designer",
    description: "Create consistent brand messaging and tone guidelines using AI analysis of your existing content. Maintain voice across all channels.",
    category: "CONTENT_CREATION",  
    rating: 4.2,
    installs: "3.9K",
    price: "$89/mo",
    featured: false,
    verified: false,
    tags: ["Claude", "Branding", "Voice", "Content"],
    publisher: "BrandAI Studio",
    lastUpdated: "5 days ago",
    providers: ["ANTHROPIC"],
    status: "in_development" // App in development, limited functionality
  }
];

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Subscription hooks
  const { subscriptions, loading: subscriptionsLoading, refetch } = useSubscriptions('ACTIVE');
  const { installing, installApp } = useAppInstallation();

  // Set search query from URL params on component mount
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Check if app is installed
  const isAppInstalled = (appId: string) => {
    return subscriptions.some(sub => sub.appId === String(appId) && sub.status === 'ACTIVE');
  };

  // Handle install button click
  const handleInstallClick = (app: any) => {
    if (isAppInstalled(app.id)) {
      toast.info('App already installed', {
        description: 'You can access this app from your dashboard',
      });
      return;
    }

    setSelectedApp({
      id: app.id.toString(),
      name: app.name,
      description: app.description,
      category: app.category,
      rating: app.rating,
      installs: app.installs,
      price: app.price,
      featured: app.featured,
      verified: app.verified,
      tags: app.tags,
      publisher: app.publisher,
      providers: app.providers,
      requirements: [], // Add app-specific requirements here
    });
    setShowInstallModal(true);
  };

  // Handle installation success
  const handleInstallSuccess = () => {
    refetch(); // Refresh subscriptions
    router.push('/dashboard'); // Navigate to dashboard
  };

  const filteredApps = apps.filter(app => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Professional AI App Marketplace</h1>
          <p className="text-muted-foreground mb-4">
            Discover specialized AI applications built by developers for professionals. Use your own API keys or local models for maximum cost control and privacy.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <Code2 className="h-3 w-3 mr-1" />
              BYOK Architecture
            </Badge>
            <Badge variant="outline" className="text-xs">
              🏠 Local AI Support
            </Badge>
            <Badge variant="outline" className="text-xs">
              🔒 Enterprise Ready
            </Badge>
            <Badge variant="outline" className="text-xs">
              💰 50-90% Cost Savings
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications, categories, or publishers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredApps.length} applications
            {selectedCategory !== 'all' && (
              <span> in {categories.find(c => c.id === selectedCategory)?.name}</span>
            )}
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border rounded-md px-3 py-1 bg-background"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* Apps Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredApps.map((app) => (
            <Card key={app.id} className={`group hover:shadow-lg transition-all duration-300 ${
              app.status === 'in_development' ? 'opacity-60 border-dashed' : ''
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className={`text-lg ${app.status === 'in_development' ? 'text-muted-foreground' : ''}`}>
                        {app.name}
                      </CardTitle>
                      {app.verified && (
                        <Badge variant="success" className="text-xs">
                          Verified
                        </Badge>
                      )}
                      {app.featured && (
                        <Badge variant="default" className="text-xs">
                          Featured
                        </Badge>
                      )}
                      {app.status === 'in_development' && (
                        <Badge variant="outline" className="text-xs border-orange-200 text-orange-600 bg-orange-50">
                          In Development
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <span>by {app.publisher}</span>
                      <span className="mx-2">•</span>
                      <span>{app.lastUpdated}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-primary">
                      {app.price}
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm leading-relaxed line-clamp-3">
                  {app.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Tags and Providers */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {app.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {app.providers && (
                      <div className="flex flex-wrap gap-1">
                        {app.providers.map((provider, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {provider === 'LOCAL' ? '🏠 Local AI' : 
                             provider === 'OPENAI' ? '🤖 OpenAI' :
                             provider === 'ANTHROPIC' ? '🔮 Claude' :
                             provider === 'GOOGLE' ? '🟡 Gemini' : provider}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{app.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>{app.installs}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        asChild
                      >
                        <Link href={
                          app.id === 1 ? '/marketplace/apps/legal-contract-analyzer' :
                          app.id === 2 ? '/marketplace/apps/hipaa-medical-scribe' :
                          app.id === 3 ? '/marketplace/apps/code-review-bot' :
                          app.id === 9 ? '/marketplace/apps/pdf-notes-generator' :
                          '#'
                        }>
                          View Details
                        </Link>
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleInstallClick(app)}
                        disabled={installing[app.id] || subscriptionsLoading || app.status === 'in_development'}
                        className={`${isAppInstalled(app.id) ? 'bg-green-600 hover:bg-green-700' : ''} ${
                          app.status === 'in_development' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {app.status === 'in_development' ? (
                          <>
                            <Code2 className="h-3 w-3 mr-1" />
                            Coming Soon
                          </>
                        ) : installing[app.id] ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Installing...
                          </>
                        ) : isAppInstalled(app.id) ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Installed
                          </>
                        ) : (
                          <>
                            <Download className="h-3 w-3 mr-1" />
                            Install
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredApps.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No applications found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or browse different categories
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredApps.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Applications
            </Button>
          </div>
        )}

        {/* Install App Modal */}
        <InstallAppModal
          open={showInstallModal}
          onOpenChange={setShowInstallModal}
          app={selectedApp}
          isInstalling={installing[selectedApp?.id] || false}
          onInstall={installApp}
          onSuccess={handleInstallSuccess}
        />
      </div>
    </MainLayout>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading marketplace...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}