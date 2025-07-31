'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubscriptions } from '@/lib/hooks/useSubscriptions';
import { 
  Zap, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Package,
  Grid3X3,
  List,
  Search,
  Calendar,
  Star,
  Settings
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// App definitions - this would typically come from a database
const appDefinitions = [
  {
    id: 10,
    name: "Simple AI Chat",
    description: "Direct conversation with your preferred AI model. Test API connections, compare responses, and chat with OpenAI, Claude, Gemini, or local models.",
    route: "/marketplace/apps/simple-ai-chat",
    category: "DEVELOPER_TOOLS",
    icon: "💬",
    publisher: "AI Marketplace",
    providers: ["OPENAI", "ANTHROPIC", "GOOGLE", "COHERE", "HUGGING_FACE", "LOCAL"],
    features: ["Multi-Model Chat", "API Testing", "Real-time Responses"]
  },
  {
    id: 9,
    name: "PDF Notes Generator",
    description: "Transform any PDF into structured, actionable notes using your choice of AI model.",
    route: "/marketplace/apps/pdf-notes-generator",
    category: "CONTENT_CREATION",
    icon: "📄",
    publisher: "AI Marketplace",
    providers: ["LOCAL", "OPENAI", "ANTHROPIC", "GOOGLE"],
    features: ["PDF Processing", "Multi-Model Support", "Structured Output"]
  },
  {
    id: 1,
    name: "Legal Contract Analyzer",
    description: "AI-powered contract analysis that identifies risks, missing clauses, and negotiation points.",
    route: "/marketplace/apps/legal-contract-analyzer",
    category: "LEGAL_TOOLS",
    icon: "⚖️",
    publisher: "LegalAI Solutions",
    providers: ["ANTHROPIC"],
    features: ["Risk Analysis", "Contract Review", "Legal Insights"]
  },
  {
    id: 2,
    name: "HIPAA Medical Scribe",
    description: "Voice-to-structured medical notes with local AI processing for HIPAA compliance.",
    route: "/marketplace/apps/hipaa-medical-scribe",
    category: "MEDICAL_TOOLS",
    icon: "🏥",
    publisher: "HealthTech AI",
    providers: ["LOCAL"],
    features: ["HIPAA Compliant", "Voice-to-Text", "Medical Templates"]
  },
  {
    id: 3,
    name: "Code Review Bot",
    description: "Automated code review for security issues, performance optimizations, and style improvements.",
    route: "/marketplace/apps/code-review-bot",
    category: "DEVELOPER_TOOLS",
    icon: "🤖",
    publisher: "DevSecure",
    providers: ["OPENAI", "ANTHROPIC"],
    features: ["Security Analysis", "Performance Review", "Multi-Language Support"]
  }
];

export default function MyAppsPage() {
  const { subscriptions, loading, error } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get installed apps by matching subscriptions with app definitions
  const installedApps = subscriptions
    .filter(sub => sub.status === 'ACTIVE')
    .map(sub => {
      const appDef = appDefinitions.find(app => app.id === parseInt(sub.appId));
      return appDef ? {
        ...appDef,
        subscription: sub,
        installedDate: new Date(sub.createdAt),
        lastUsed: new Date(sub.lastUsedAt || sub.createdAt)
      } : null;
    })
    .filter(Boolean);

  // Filter apps based on search query
  const filteredApps = installedApps.filter(app => 
    app && (
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'OPENAI': return '🤖';
      case 'ANTHROPIC': return '🔮';
      case 'GOOGLE': return '🟡';
      case 'COHERE': return '🟢';
      case 'HUGGING_FACE': return '🤗';
      case 'LOCAL': return '🦙';
      default: return '⚡';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'DEVELOPER_TOOLS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONTENT_CREATION': return 'bg-green-100 text-green-800 border-green-200';
      case 'LEGAL_TOOLS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MEDICAL_TOOLS': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Apps</h1>
                <p className="text-gray-600">Manage and access your installed AI applications</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Package className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{installedApps.length}</p>
                      <p className="text-sm text-gray-600">Installed Apps</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{installedApps.length}</p>
                      <p className="text-sm text-gray-600">Active Subscriptions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {installedApps.length > 0 ? formatDate(Math.max(...installedApps.map(app => app.lastUsed.getTime()))) : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">Last Activity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search your apps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          {error && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading your apps: {error}
              </AlertDescription>
            </Alert>
          )}

          {installedApps.length === 0 ? (
            <Card className="glass-card text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Apps Installed</h3>
                <p className="text-gray-600 mb-6">
                  Browse the marketplace to discover and install AI applications that fit your needs.
                </p>
                <Button asChild>
                  <Link href="/marketplace">
                    Browse Marketplace
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Apps Grid/List */}
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredApps.map((app) => (
                  <Card key={app.id} className="glass-card group hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl">
                            {app.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{app.name}</CardTitle>
                            <CardDescription className="text-sm">
                              by {app.publisher}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getCategoryColor(app.category)}>
                          {app.category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {app.description}
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {app.features.slice(0, 2).map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {app.features.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{app.features.length - 2} more
                          </Badge>
                        )}
                      </div>

                      {/* Providers */}
                      <div className="flex items-center space-x-1 mb-4">
                        <span className="text-xs text-gray-500">Supports:</span>
                        {app.providers.slice(0, 4).map((provider) => (
                          <span key={provider} className="text-sm" title={provider}>
                            {getProviderIcon(provider)}
                          </span>
                        ))}
                        {app.providers.length > 4 && (
                          <span className="text-xs text-gray-500">
                            +{app.providers.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>Installed: {formatDate(app.installedDate)}</span>
                        <span>Last used: {formatDate(app.lastUsed)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button asChild className="flex-1">
                          <Link href={app.route}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open App
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredApps.length === 0 && searchQuery && (
                <Card className="glass-card text-center py-8">
                  <CardContent>
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No apps found</h3>
                    <p className="text-gray-600">
                      No installed apps match your search for "{searchQuery}"
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}