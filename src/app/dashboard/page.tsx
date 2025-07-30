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
import { UsageStatsCard } from '@/components/analytics/usage-stats-card';
import { CostOptimizationCard } from '@/components/analytics/cost-optimization-card';
import { PerformanceComparisonCard } from '@/components/analytics/performance-comparison-card';
import { HistoricalTrendsCard } from '@/components/analytics/historical-trends-card';
import { RealtimeMonitoringCard } from '@/components/analytics/realtime-monitoring-card';
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
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Monitor your AI applications, API usage, and spending in one place
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Installed Apps</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  --
                </div>
              ) : (
                stats.activeSubscriptions
              )}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{stats.recentInstalls} recent installs
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeKeys}</div>
            <p className="text-xs text-muted-foreground">
              Across 3 providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlySpend}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              {Math.abs(stats.trends.spend)}% decrease
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsage.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{stats.trends.usage}% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Monitoring */}
      <div className="mb-8">
        <RealtimeMonitoringCard />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <CostOptimizationCard />
        <PerformanceComparisonCard />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Activity
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardTitle>
              <CardDescription>
                Your latest app installations, API changes, and usage alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-100' :
                      activity.status === 'warning' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {activity.type === 'app_install' && <ShoppingBag className="h-4 w-4 text-green-600" />}
                      {activity.type === 'api_key' && <Key className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'billing' && <BarChart3 className="h-4 w-4 text-green-600" />}
                      {activity.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Installed Apps */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                My Applications
                <Button size="sm" asChild>
                  <Link href="/marketplace">Install More Apps</Link>
                </Button>
              </CardTitle>
              <CardDescription>
                Applications you've installed and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading your applications...
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications installed</h3>
                  <p className="text-gray-600 mb-4">
                    Browse our marketplace to find and install AI applications
                  </p>
                  <Button asChild>
                    <Link href="/marketplace">
                      <Plus className="h-4 w-4 mr-2" />
                      Browse Marketplace
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium">{subscription.app.name}</h3>
                          {subscription.app.developer.verified && (
                            <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{subscription.app.category.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>by {subscription.app.developer.displayName}</span>
                          <span>•</span>
                          <span>{subscription.app.pricing}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Installed {new Date(subscription.startedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="success" className="text-xs">
                          {subscription.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenApp(subscription.marketplaceId)}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
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

        {/* Right Column - Usage Analytics & API Keys */}
        <div>
          {/* Usage Analytics */}
          <UsageStatsCard />

          {/* Historical Trends */}
          <div className="mt-6">
            <HistoricalTrendsCard />
          </div>

          {/* API Keys Status */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                API Keys
                <Button variant="outline" size="sm" asChild>
                  <a href="/dashboard/api-keys">Manage</a>
                </Button>
              </CardTitle>
              <CardDescription>
                Current usage across your API providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{key.provider}</p>
                      <p className="text-xs text-gray-500">{key.name}</p>
                    </div>
                    <Badge variant={key.status === 'healthy' ? 'success' : 'warning'}>
                      {key.usage}%
                    </Badge>
                  </div>
                  <Progress value={key.usage} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/marketplace">
                  <Plus className="h-4 w-4 mr-2" />
                  Install New App
                </a>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/dashboard/api-keys">
                  <Key className="h-4 w-4 mr-2" />
                  Add API Key
                </a>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/dashboard/usage">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Usage Report
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}