/**
 * Real-time Monitoring Card Component
 * 
 * IMPLEMENTATION REASONING:
 * Provides live monitoring of API health, response times, and system status.
 * Critical for identifying issues before they impact users significantly.
 * Alternative simple status display rejected because actionable monitoring is essential.
 * This assumes usage tracking data contains recent timestamp information.
 * If this breaks, check that real-time data refresh is working correctly.
 * 
 * DEPENDENCIES:
 * - Requires useUsageAnalytics hook for real-time usage data
 * - Assumes React environment with proper component lifecycle
 * - Performance: Updates every 30 seconds, minimal overhead
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUsageAnalytics } from '@/lib/hooks/useUsageAnalytics';
import { 
  Activity, 
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Signal,
  Users,
  Settings
} from 'lucide-react';

interface ProviderStatus {
  provider: string;
  emoji: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  responseTime: number;
  uptime: number;
  lastCheck: Date;
  recentErrors: number;
  trend: 'up' | 'down' | 'stable';
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  provider?: string;
  resolved: boolean;
}

export function RealtimeMonitoringCard() {
  const { stats, loading, error, refresh } = useUsageAnalytics(1); // Last 1 day for real-time
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refresh();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  const getProviderEmoji = (provider: string): string => {
    const emojis: { [key: string]: string } = {
      'OPENAI': '🤖',
      'ANTHROPIC': '🔮',
      'GOOGLE': '🟡',
      'COHERE': '🟢',
      'HUGGING_FACE': '🤗',
      'OLLAMA': '🦙'
    };
    return emojis[provider] || '⚡';
  };

  const getProviderStatuses = (): ProviderStatus[] => {
    if (!stats || stats.providerBreakdown.length === 0) return [];

    const now = new Date();
    const last30Min = now.getTime() - (30 * 60 * 1000);

    return stats.providerBreakdown.map(provider => {
      // Simulate real-time status based on recent performance
      let status: ProviderStatus['status'] = 'healthy';
      let trend: ProviderStatus['trend'] = 'stable';

      if (provider.successRate < 70) {
        status = 'error';
      } else if (provider.successRate < 90) {
        status = 'warning';
      } else if (provider.averageLatency > 5000) {
        status = 'warning';
      }

      // Simple trend calculation based on cost efficiency
      const avgCostPerRequest = provider.cost / provider.requests;
      if (avgCostPerRequest < 0.001) trend = 'up';
      else if (avgCostPerRequest > 0.01) trend = 'down';

      return {
        provider: provider.provider,
        emoji: getProviderEmoji(provider.provider),
        status,
        responseTime: provider.averageLatency,
        uptime: provider.successRate,
        lastCheck: new Date(),
        recentErrors: Math.round((100 - provider.successRate) / 10),
        trend
      };
    });
  };

  const generateSystemAlerts = (): SystemAlert[] => {
    if (!stats) return [];

    const alerts: SystemAlert[] = [];
    const providers = getProviderStatuses();

    // Check for provider issues
    providers.forEach(provider => {
      if (provider.status === 'error') {
        alerts.push({
          id: `error-${provider.provider}`,
          type: 'error',
          title: `${provider.provider} Service Issues`,
          message: `Success rate dropped to ${provider.uptime.toFixed(1)}%. Consider switching to backup provider.`,
          timestamp: new Date(),
          provider: provider.provider,
          resolved: false
        });
      } else if (provider.status === 'warning') {
        alerts.push({
          id: `warning-${provider.provider}`,
          type: 'warning',
          title: `${provider.provider} Performance Degraded`,
          message: `Response time increased to ${provider.responseTime.toFixed(0)}ms or success rate at ${provider.uptime.toFixed(1)}%.`,
          timestamp: new Date(),
          provider: provider.provider,
          resolved: false
        });
      }
    });

    // Check for cost spikes
    if (stats.totalCost > 1.0) { // $1+ total cost
      alerts.push({
        id: 'cost-spike',
        type: 'warning',
        title: 'High Usage Detected',
        message: `Total cost reached $${stats.totalCost.toFixed(4)}. Consider enabling cost optimization.`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Check for low activity
    const recentRequests = stats.dailyUsage.slice(-1)[0]?.requests || 0;
    if (recentRequests === 0 && stats.totalRequests > 10) {
      alerts.push({
        id: 'low-activity',
        type: 'info',
        title: 'No Recent Activity',
        message: 'No API requests detected in the last 24 hours.',
        timestamp: new Date(),
        resolved: false
      });
    }

    return alerts.slice(0, 5); // Top 5 most critical
  };

  const providerStatuses = getProviderStatuses();
  const systemAlerts = generateSystemAlerts();
  const healthyProviders = providerStatuses.filter(p => p.status === 'healthy').length;
  const totalProviders = providerStatuses.length;

  const systemHealth = totalProviders > 0 ? (healthyProviders / totalProviders) * 100 : 100;

  if (loading && !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Real-time Monitoring
          </CardTitle>
          <CardDescription>Initializing monitoring...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
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
            <Activity className="h-5 w-5 mr-2" />
            Real-time Monitoring
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={systemHealth >= 90 ? 'success' : systemHealth >= 70 ? 'warning' : 'destructive'}
              className="text-xs"
            >
              <Signal className="h-3 w-3 mr-1" />
              {systemHealth.toFixed(0)}% healthy
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'text-green-600' : 'text-gray-400'}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Live system status • Last updated: {lastUpdate.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* System Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Wifi className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-xl font-bold">{healthyProviders}/{totalProviders}</span>
            </div>
            <p className="text-sm text-gray-600">Providers Online</p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-xl font-bold">
                {stats ? Math.round(stats.averageLatency) : 0}ms
              </span>
            </div>
            <p className="text-sm text-gray-600">Avg Response</p>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-xl font-bold">
                {stats ? Math.round(stats.successRate) : 0}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-xl font-bold">{systemAlerts.length}</span>
            </div>
            <p className="text-sm text-gray-600">Active Alerts</p>
          </div>
        </div>

        {/* Provider Status Grid */}
        {providerStatuses.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Provider Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {providerStatuses.map((provider) => (
                <div key={provider.provider} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{provider.emoji}</span>
                    <div>
                      <h5 className="font-medium">{provider.provider}</h5>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            provider.status === 'healthy' ? 'success' :
                            provider.status === 'warning' ? 'warning' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {provider.status === 'healthy' ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                          {provider.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {provider.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
                           provider.trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : 
                           <Activity className="h-3 w-3 mr-1" />}
                          {provider.trend}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-600">
                    <p>{Math.round(provider.responseTime)}ms</p>
                    <p>{provider.uptime.toFixed(1)}% uptime</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Alerts */}
        {systemAlerts.length > 0 ? (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">System Alerts</h4>
            <div className="space-y-2">
              {systemAlerts.map((alert) => (
                <Alert key={alert.id} className={`${
                  alert.type === 'error' ? 'border-red-200 bg-red-50' :
                  alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  {alert.type === 'error' ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                   alert.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                   <CheckCircle className="h-4 w-4 text-blue-600" />}
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className={`font-medium mb-1 ${
                          alert.type === 'error' ? 'text-red-800' :
                          alert.type === 'warning' ? 'text-yellow-800' :
                          'text-blue-800'
                        }`}>
                          {alert.title}
                        </h5>
                        <p className={`text-sm ${
                          alert.type === 'error' ? 'text-red-700' :
                          alert.type === 'warning' ? 'text-yellow-700' :
                          'text-blue-700'
                        }`}>
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.timestamp.toLocaleTimeString()}
                          {alert.provider && ` • ${alert.provider}`}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Resolve
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Systems Operational</h3>
            <p className="text-gray-600">No active alerts or issues detected</p>
          </div>
        )}

        {/* Real-time Controls */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium">
                {autoRefresh ? 'Live Monitoring' : 'Monitoring Paused'}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              Updates every 30 seconds
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Now
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {autoRefresh ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}