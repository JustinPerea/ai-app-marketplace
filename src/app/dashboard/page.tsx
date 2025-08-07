'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimpleStars } from '@/components/ui/simple-stars';
import { useSubscriptions, useSubscriptionStats, useAppInstallation } from '@/lib/hooks/useSubscriptions';
import { getAppRoute } from '@/lib/utils/app-mapping';
import { 
  ShoppingBag, 
  Key, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Plus,
  DollarSign,
  ExternalLink,
  Trash2,
  Loader2,
  CheckCircle,
  Settings,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const { subscriptions, loading: subscriptionsLoading, refetch } = useSubscriptions('ACTIVE');
  const stats = useSubscriptionStats();
  const { uninstalling, uninstallApp } = useAppInstallation();

  const handleUninstall = async (subscriptionId: string, appName: string) => {
    if (confirm(`Are you sure you want to uninstall "${appName}"? This action cannot be undone.`)) {
      const success = await uninstallApp(subscriptionId);
      if (success) {
        refetch(); // Refresh the subscription list
      }
    }
  };

  const handleOpenApp = (marketplaceId: string) => {
    const route = getAppRoute(marketplaceId);
    window.open(route, '_blank');
  };

  return (
    <DashboardLayout>
      {/* Simple stars background with parallax scrolling */}
      <SimpleStars starCount={50} parallaxSpeed={0.3} />
      
      {/* Cosmara stellar background with cosmic gradients */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{ 
             background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(59, 130, 246, 0.04) 50%, rgba(139, 92, 246, 0.06) 100%)' 
           }}>
      </div>
      
      {/* Page Content */}
      <div className="min-h-screen relative z-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-hero-glass mb-4">
            <span className="text-glass-gradient">Dashboard Overview</span>
          </h1>
          <p className="text-body-lg text-text-secondary">
            Monitor your AI applications, API usage, and spending in one place
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-0 bg-[rgba(255,255,255,0.05)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#E2E8F0]">Installed Apps</CardTitle>
              <ShoppingBag className="h-4 w-4 text-[#94A3B8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#E2E8F0]">
                {stats.loading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2 text-[#3B82F6]" />
                    --
                  </div>
                ) : (
                  stats.activeSubscriptions
                )}
              </div>
              <div className="flex items-center text-xs text-[#94A3B8]">
                <TrendingUp className="h-3 w-3 mr-1" style={{color: '#FFD700'}} />
                +{stats.recentInstalls} recent installs
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 bg-[rgba(255,255,255,0.05)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#E2E8F0]">Active API Keys</CardTitle>
              <Key className="h-4 w-4 text-[#94A3B8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#E2E8F0]">{stats.activeKeys}</div>
              <p className="text-xs text-[#94A3B8]">
                Across 3 providers
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 bg-[rgba(255,255,255,0.05)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#E2E8F0]">Monthly Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-[#94A3B8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#E2E8F0]">${stats.monthlySpend}</div>
              <div className="flex items-center text-xs text-[#94A3B8]">
                <TrendingDown className="h-3 w-3 mr-1" style={{color: '#FFD700'}} />
                {Math.abs(stats.trends.spend)}% decrease
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 bg-[rgba(255,255,255,0.05)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#E2E8F0]">Total Requests</CardTitle>
              <BarChart3 className="h-4 w-4 text-[#94A3B8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#E2E8F0]">{stats.totalUsage.toLocaleString()}</div>
              <div className="flex items-center text-xs text-[#94A3B8]">
                <TrendingUp className="h-3 w-3 mr-1" style={{color: '#FFD700'}} />
                +{stats.trends.usage}% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions & Provider Shortcuts */}
        {subscriptions.length > 0 && stats.activeKeys < 7 && (
          <Card className="glass-card border-2 bg-[rgba(255,215,0,0.08)] border-[rgba(255,215,0,0.3)] mb-6 hover:scale-[1.01] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                     style={{
                       background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                       boxShadow: '0 4px 14px 0 rgba(255, 215, 0, 0.3)'
                     }}>
                  <Zap className="h-6 w-6 text-[#0B1426]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#FFD700] mb-1">🚀 Expand Your AI Fleet</h3>
                  <p className="text-sm text-[#94A3B8] mb-4">
                    You're connected to {stats.activeKeys} providers. Add more to unlock powerful applications and maximize cost savings.
                  </p>
                  
                  {/* Provider Shortcuts Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <Link href="/setup?provider=openai" 
                          className="flex flex-col items-center p-3 rounded-lg border border-[#94A3B8]/20 hover:border-[#FFD700]/50 hover:bg-[rgba(255,215,0,0.1)] transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-[#10A37F] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold text-xs">AI</span>
                      </div>
                      <span className="text-xs text-[#94A3B8] group-hover:text-[#FFD700]">OpenAI</span>
                    </Link>
                    
                    <Link href="/setup?provider=anthropic" 
                          className="flex flex-col items-center p-3 rounded-lg border border-[#94A3B8]/20 hover:border-[#FFD700]/50 hover:bg-[rgba(255,215,0,0.1)] transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-[#D4915D] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold text-xs">C</span>
                      </div>
                      <span className="text-xs text-[#94A3B8] group-hover:text-[#FFD700]">Claude</span>
                    </Link>
                    
                    <Link href="/setup?provider=google" 
                          className="flex flex-col items-center p-3 rounded-lg border border-[#94A3B8]/20 hover:border-[#FFD700]/50 hover:bg-[rgba(255,215,0,0.1)] transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-[#4285F4] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold text-xs">G</span>
                      </div>
                      <span className="text-xs text-[#94A3B8] group-hover:text-[#FFD700]">Gemini</span>
                    </Link>
                    
                    <Link href="/setup?provider=local" 
                          className="flex flex-col items-center p-3 rounded-lg border border-[#94A3B8]/20 hover:border-[#FFD700]/50 hover:bg-[rgba(255,215,0,0.1)] transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold text-xs">🏠</span>
                      </div>
                      <span className="text-xs text-[#94A3B8] group-hover:text-[#FFD700]">Local AI</span>
                    </Link>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <Button size="sm" className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0B1426] hover:opacity-90 hover:scale-105 transition-all" asChild>
                      <Link href="/setup">
                        <Plus className="h-3 w-3 mr-1" />
                        Connect All Providers
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white hover:scale-105 transition-all" asChild>
                      <Link href="/marketplace">
                        <ShoppingBag className="h-3 w-3 mr-1" />
                        Browse More Apps
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" className="text-[#94A3B8] hover:text-[#E2E8F0] text-xs" asChild>
                      <Link href="/developers/revenue">
                        💰 Save 50-90% vs subscriptions
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Applications */}
        <Card className="glass-card border-0 bg-[rgba(255,255,255,0.05)]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-[#E2E8F0]">
              My Applications
              <Button size="sm" asChild className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0B1426] hover:opacity-90">
                <Link href="/marketplace">Install More Apps</Link>
              </Button>
            </CardTitle>
            <CardDescription className="text-[#94A3B8]">
              Applications you've installed and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2 text-[#3B82F6]" />
                <span className="text-[#94A3B8]">Loading your applications...</span>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-[#94A3B8] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#E2E8F0] mb-2">No applications installed</h3>
                <p className="text-[#94A3B8] mb-6">
                  Get started by connecting your AI providers and exploring our marketplace
                </p>
                
                {/* Quick Start Actions */}
                <div className="grid md:grid-cols-2 gap-4 mb-6 max-w-md mx-auto">
                  <Button asChild variant="outline" className="border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white h-auto py-3">
                    <Link href="/setup" className="flex flex-col items-center gap-2">
                      <Settings className="h-5 w-5" />
                      <div>
                        <div className="font-medium">Setup Providers</div>
                        <div className="text-xs opacity-80">Connect AI services</div>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white h-auto py-3">
                    <Link href="/marketplace" className="flex flex-col items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      <div>
                        <div className="font-medium">Browse Apps</div>
                        <div className="text-xs opacity-80">Discover AI tools</div>
                      </div>
                    </Link>
                  </Button>
                </div>
                
                {/* Recommended Quick Actions */}
                <div className="glass-card p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,215,0,0.2)] max-w-lg mx-auto">
                  <h4 className="text-sm font-medium text-[#FFD700] mb-3 flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4" />
                    Quick Start Recommendations
                  </h4>
                  <div className="space-y-2 text-sm">
                    {stats.activeKeys === 0 ? (
                      <Link href="/setup" className="flex items-center justify-between text-[#94A3B8] hover:text-[#E2E8F0] transition-colors group">
                        <span>1. Connect your first AI provider</span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between text-[#4ADE80]">
                        <span>1. ✓ AI providers connected</span>
                        <CheckCircle className="h-3 w-3" />
                      </div>
                    )}
                    
                    <Link href="/marketplace?category=DEVELOPER_TOOLS" className="flex items-center justify-between text-[#94A3B8] hover:text-[#E2E8F0] transition-colors group">
                      <span>2. Try developer tools</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    
                    <Link href="/marketplace/apps/simple-ai-chat" className="flex items-center justify-between text-[#94A3B8] hover:text-[#E2E8F0] transition-colors group">
                      <span>3. Test with Simple AI Chat</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button asChild className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0B1426] hover:opacity-90">
                    <Link href="/marketplace">
                      <Plus className="h-4 w-4 mr-2" />
                      Explore Marketplace
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-4 border border-[rgba(255,255,255,0.1)] rounded-lg bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] transition-all">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-[#E2E8F0]">{subscription.app.name}</h3>
                        {subscription.app.developer.verified && (
                          <Badge variant="outline" className="text-xs border-[#FFD700] bg-[rgba(255,215,0,0.1)]" style={{color: '#FFD700'}}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                        <span>{subscription.app.category.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>by {subscription.app.developer.displayName}</span>
                        <span>•</span>
                        <span>{subscription.app.pricing}</span>
                      </div>
                      <div className="text-xs text-[#94A3B8] mt-1">
                        Installed {new Date(subscription.startedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success" className="text-xs bg-[rgba(255,215,0,0.2)] border-[#FFD700]" style={{color: '#FFD700'}}>
                        {subscription.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white"
                        onClick={() => handleOpenApp(subscription.marketplaceId)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white"
                        onClick={() => handleUninstall(subscription.id, subscription.app.name)}
                        disabled={uninstalling[subscription.id]}
                      >
                        {uninstalling[subscription.id] ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}