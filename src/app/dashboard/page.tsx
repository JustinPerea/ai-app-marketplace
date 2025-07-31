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
  CheckCircle
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
                <p className="text-[#94A3B8] mb-4">
                  Browse our marketplace to find and install AI applications
                </p>
                <Button asChild className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0B1426] hover:opacity-90">
                  <Link href="/marketplace">
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Marketplace
                  </Link>
                </Button>
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