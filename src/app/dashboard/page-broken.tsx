'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscriptions, useSubscriptionStats, useAppInstallation } from '@/lib/hooks/useSubscriptions';
import { getAppRoute } from '@/lib/utils/app-mapping';
import { toast } from 'sonner';
import { 
  ShoppingBag, 
  Key, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Settings,
  Activity,
  DollarSign,
  Users,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Loader2,
  CheckCircle
} from 'lucide-react';

const recentActivity = [
  {
    id: 1,
    type: 'app_install',
    title: 'Installed "Content Studio Pro"',
    description: 'New application added to your dashboard',
    timestamp: '2 hours ago',
    status: 'success'
  },
  {
    id: 2,
    type: 'api_key',
    title: 'OpenAI API key updated',
    description: 'Key rotated successfully',
    timestamp: '1 day ago',
    status: 'info'
  },
  {
    id: 3,
    type: 'billing',
    title: 'Monthly usage report generated',
    description: 'Usage decreased by 12% compared to last month',
    timestamp: '2 days ago',
    status: 'success'
  },
  {
    id: 4,
    type: 'warning',
    title: 'API rate limit approached',
    description: 'Anthropic API usage at 85% of monthly limit',
    timestamp: '3 days ago',
    status: 'warning'
  }
];

const installedApps = [
  {
    id: 1,
    name: 'Content Studio Pro',
    category: 'Content Creation',
    lastUsed: '2 hours ago',
    usage: 'High',
    status: 'active'
  },
  {
    id: 2,
    name: 'Code Assistant Ultimate',
    category: 'Development',
    lastUsed: '1 day ago',
    usage: 'Medium',
    status: 'active'
  },
  {
    id: 3,
    name: 'Analytics Insight Engine',
    category: 'Analytics',
    lastUsed: '3 days ago',
    usage: 'Low',
    status: 'inactive'
  }
];

const apiKeys = [
  {
    id: 1,
    provider: 'OpenAI',
    name: 'GPT-4 Production',
    usage: 67,
    limit: 100,
    status: 'healthy'
  },
  {
    id: 2,
    provider: 'Anthropic',
    name: 'Claude Production',
    usage: 85,
    limit: 100,
    status: 'warning'
  },
  {
    id: 3,
    provider: 'Google AI',
    name: 'Gemini Development', 
    usage: 23,
    limit: 100,
    status: 'healthy'
  }
];



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
      {/* Cosmic Background Wrapper */}
      <div className="min-h-screen" style={{
        background: 'linear-gradient(135deg, #0B1426 0%, #1E2A4A 50%, #2D1B69 100%)'
      }}>
        {/* Page Header with Stardust Colors */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#E2E8F0]">Dashboard Overview</h1>
          <p className="text-[#94A3B8] mt-2">
            Monitor your AI applications, API usage, and spending in one place
          </p>
        </div>

        {/* Stats Grid with Glass Effects */}
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

        {/* Analytics Placeholder - Temporarily removed for debugging */}
        <div className="mb-8">
          <Card className="glass-card border-0 bg-[rgba(255,255,255,0.05)]">
            <CardHeader>
              <CardTitle className="text-[#E2E8F0]">Analytics Dashboard</CardTitle>
              <CardDescription className="text-[#94A3B8]">
                Real-time monitoring and analytics will be displayed here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[#94A3B8]">Analytics components temporarily disabled for debugging</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-0 bg-[rgba(255,255,255,0.05)]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-[#E2E8F0]">
                  Recent Activity
                  <Button variant="outline" size="sm" className="border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white">
                    View All
                  </Button>
                </CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  Your latest app installations, API changes, and usage alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-[rgba(255,255,255,0.1)] last:border-b-0">
                      <div className={`p-2 rounded-full ${
                        activity.status === 'success' ? 'bg-[rgba(255,215,0,0.2)]' :
                        activity.status === 'warning' ? 'bg-[rgba(255,165,0,0.2)]' :
                        'bg-[rgba(59,130,246,0.2)]'
                      }`}>
                        {activity.type === 'app_install' && <ShoppingBag className="h-4 w-4" style={{color: '#FFD700'}} />}
                        {activity.type === 'api_key' && <Key className="h-4 w-4 text-[#3B82F6]" />}
                        {activity.type === 'billing' && <BarChart3 className="h-4 w-4" style={{color: '#FFD700'}} />}
                        {activity.type === 'warning' && <AlertTriangle className="h-4 w-4 text-[#FFA500]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#E2E8F0]">{activity.title}</p>
                        <p className="text-sm text-[#94A3B8]">{activity.description}</p>
                        <p className="text-xs text-[#94A3B8] mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
          </Card>

            {/* Installed Apps */}
            <Card className="mt-6 glass-card border-0 bg-[rgba(255,255,255,0.05)]">
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

          {/* Right Column - API Keys & Actions */}
          <div>
            {/* Usage Analytics Placeholder */}
            <Card className="glass-card border-0 bg-[rgba(255,255,255,0.05)]">
              <CardHeader>
                <CardTitle className="text-[#E2E8F0]">Usage Analytics</CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  Analytics temporarily disabled for debugging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[#94A3B8]">Usage statistics will be displayed here</p>
              </CardContent>
            </Card>

            {/* API Keys Status */}
            <Card className="mt-6 glass-card border-0 bg-[rgba(255,255,255,0.05)]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-[#E2E8F0]">
                  API Keys
                  <Button variant="outline" size="sm" asChild className="border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white">
                    <a href="/dashboard/api-keys">Manage</a>
                  </Button>
                </CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  Current usage across your API providers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#E2E8F0]">{key.provider}</p>
                        <p className="text-xs text-[#94A3B8]">{key.name}</p>
                      </div>
                      <Badge variant={key.status === 'healthy' ? 'success' : 'warning'} 
                             className={key.status === 'healthy' ? 
                               'bg-[rgba(255,215,0,0.2)] border-[#FFD700] text-[#FFD700]' : 
                               'bg-[rgba(255,165,0,0.2)] border-[#FFA500] text-[#FFA500]'}>
                        {key.usage}%
                      </Badge>
                    </div>
                    <Progress value={key.usage} className="bg-[rgba(255,255,255,0.1)]" />
                  </div>
                ))}
              </CardContent>
          </Card>

            {/* Quick Actions */}
            <Card className="mt-6 glass-card border-0 bg-[rgba(255,255,255,0.05)]">
              <CardHeader>
                <CardTitle className="text-[#E2E8F0]">Quick Actions</CardTitle>
                <CardDescription className="text-[#94A3B8]">
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white" variant="outline" asChild>
                  <a href="/marketplace">
                    <Plus className="h-4 w-4 mr-2" />
                    Install New App
                  </a>
                </Button>
                <Button className="w-full justify-start border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white" variant="outline" asChild>
                  <a href="/dashboard/api-keys">
                    <Key className="h-4 w-4 mr-2" />
                    Add API Key
                  </a>
                </Button>
                <Button className="w-full justify-start border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white" variant="outline" asChild>
                  <a href="/dashboard/usage">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Usage Report
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}