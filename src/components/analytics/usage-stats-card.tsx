/**
 * Usage Statistics Card Component
 * 
 * IMPLEMENTATION REASONING:
 * Shows real usage statistics from localStorage tracking data.
 * Provides dashboard insights into API usage patterns and costs.
 * Alternative database approach rejected to avoid complexity during development.
 * This assumes usage tracking data is available and properly formatted.
 * If this breaks, check that useUsageAnalytics hook is properly imported and working.
 * 
 * DEPENDENCIES:
 * - Requires useUsageAnalytics hook for data retrieval
 * - Assumes React environment with proper component lifecycle
 * - Performance: Lightweight as it only displays cached localStorage data
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUsageAnalytics } from '@/lib/hooks/useUsageAnalytics';
import { 
  BarChart3, 
  DollarSign, 
  Activity, 
  TrendingUp,
  RefreshCw,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';

export function UsageStatsCard() {
  const { stats, loading, error, refresh, clearData } = useUsageAnalytics(30);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Usage Analytics
          </CardTitle>
          <CardDescription>Loading real usage data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Usage Analytics
          </CardTitle>
          <CardDescription>Error loading usage data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalRequests === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Usage Analytics
          </CardTitle>
          <CardDescription>Real usage tracking from API tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No usage data yet</h3>
            <p className="text-gray-600 mb-4">
              Test your API keys to see real usage statistics here
            </p>
            <Button variant="outline" asChild>
              <a href="/setup">
                <Zap className="h-4 w-4 mr-2" />
                Test API Keys
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Usage Analytics (30 days)
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={refresh} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={clearData} variant="ghost" size="sm" title="Clear data">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Real usage statistics from API key testing and usage
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-2xl font-bold">{stats.totalRequests}</span>
            </div>
            <p className="text-sm text-gray-600">Total Requests</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold">${stats.totalCost.toFixed(4)}</span>
            </div>
            <p className="text-sm text-gray-600">Total Cost</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-2xl font-bold">{Math.round(stats.averageLatency)}ms</span>
            </div>
            <p className="text-sm text-gray-600">Avg Latency</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold">{Math.round(stats.successRate)}%</span>
            </div>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
        </div>

        {/* Provider Breakdown */}
        {stats.providerBreakdown.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Provider Breakdown</h4>
            <div className="space-y-3">
              {stats.providerBreakdown.map((provider) => (
                <div key={provider.provider} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-lg mr-3">
                      {provider.provider === 'OPENAI' && '🤖'}
                      {provider.provider === 'ANTHROPIC' && '🔮'} 
                      {provider.provider === 'GOOGLE' && '🟡'}
                      {provider.provider === 'COHERE' && '🟢'}
                      {provider.provider === 'HUGGING_FACE' && '🤗'}
                      {provider.provider === 'OLLAMA' && '🦙'}
                    </div>
                    <div>
                      <h5 className="font-medium">{provider.provider}</h5>
                      <p className="text-sm text-gray-600">
                        {provider.requests} requests • {Math.round(provider.averageLatency)}ms avg
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${provider.cost.toFixed(4)}</p>
                    <div className="flex items-center">
                      <Badge variant={provider.successRate > 90 ? 'success' : 'warning'} className="text-xs">
                        {Math.round(provider.successRate)}% success
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Usage Trend */}
        {stats.dailyUsage.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {stats.dailyUsage.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <span className="text-sm text-gray-600">{day.date}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm">{day.requests} requests</span>
                    <span className="text-sm font-medium">${day.cost.toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}