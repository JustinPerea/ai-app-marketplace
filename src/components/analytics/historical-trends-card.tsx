/**
 * Historical Usage Trends Card Component
 * 
 * IMPLEMENTATION REASONING:
 * Visualizes usage patterns over time to identify trends and seasonal patterns.
 * Helps users understand growth, provider adoption, and cost evolution.
 * Alternative simple line chart rejected because detailed insights are more valuable.
 * This assumes usage tracking data contains historical timestamp information.
 * If this breaks, check that daily usage aggregation is working correctly.
 * 
 * DEPENDENCIES:
 * - Requires useUsageAnalytics hook for historical usage data
 * - Assumes React environment with proper component lifecycle
 * - Performance: Lightweight calculations on cached localStorage data
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUsageAnalytics } from '@/lib/hooks/useUsageAnalytics';
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  BarChart3,
  Activity,
  DollarSign,
  Clock,
  Users,
  RefreshCw
} from 'lucide-react';

interface TrendInsight {
  type: 'growth' | 'decline' | 'stable' | 'seasonal';
  title: string;
  description: string;
  value: string;
  change: number;
  confidence: 'high' | 'medium' | 'low';
  icon: any;
}

interface PeriodComparison {
  period: string;
  requests: number;
  cost: number;
  providers: number;
  avgLatency: number;
  successRate: number;
  change: {
    requests: number;
    cost: number;
    avgLatency: number;
    successRate: number;
  };
}

export function HistoricalTrendsCard() {
  const { stats, loading, error, refresh } = useUsageAnalytics(30);

  const analyzeTrends = (): TrendInsight[] => {
    if (!stats || stats.dailyUsage.length < 7) return [];

    const insights: TrendInsight[] = [];
    const dailyData = stats.dailyUsage.slice(-14); // Last 14 days
    
    if (dailyData.length < 7) return insights;

    // Calculate week-over-week trends
    const thisWeek = dailyData.slice(-7);
    const prevWeek = dailyData.slice(-14, -7);
    
    const thisWeekRequests = thisWeek.reduce((sum, day) => sum + day.requests, 0);
    const prevWeekRequests = prevWeek.reduce((sum, day) => sum + day.requests, 0);
    const requestsChange = prevWeekRequests > 0 ? ((thisWeekRequests - prevWeekRequests) / prevWeekRequests) * 100 : 0;

    const thisWeekCost = thisWeek.reduce((sum, day) => sum + day.cost, 0);
    const prevWeekCost = prevWeek.reduce((sum, day) => sum + day.cost, 0);
    const costChange = prevWeekCost > 0 ? ((thisWeekCost - prevWeekCost) / prevWeekCost) * 100 : 0;

    // Usage trend
    if (Math.abs(requestsChange) > 15) {
      insights.push({
        type: requestsChange > 0 ? 'growth' : 'decline',
        title: requestsChange > 0 ? 'Usage Growth Detected' : 'Usage Decline Noted',
        description: `${Math.abs(requestsChange).toFixed(1)}% ${requestsChange > 0 ? 'increase' : 'decrease'} in requests vs last week`,
        value: `${thisWeekRequests} requests this week`,
        change: requestsChange,
        confidence: Math.abs(requestsChange) > 30 ? 'high' : 'medium',
        icon: requestsChange > 0 ? TrendingUp : TrendingDown
      });
    }

    // Cost trend
    if (Math.abs(costChange) > 10) {
      insights.push({
        type: costChange > 0 ? 'growth' : 'decline',
        title: costChange > 0 ? 'Cost Increase Alert' : 'Cost Reduction Success',
        description: `${Math.abs(costChange).toFixed(1)}% ${costChange > 0 ? 'increase' : 'decrease'} in spending vs last week`,
        value: `$${thisWeekCost.toFixed(4)} this week`,
        change: costChange,
        confidence: Math.abs(costChange) > 25 ? 'high' : 'medium',
        icon: DollarSign
      });
    }

    // Check for pattern stability
    const dailyVariance = thisWeek.map(day => day.requests);
    const avgDaily = dailyVariance.reduce((sum, val) => sum + val, 0) / dailyVariance.length;
    const variance = dailyVariance.reduce((sum, val) => sum + Math.pow(val - avgDaily, 2), 0) / dailyVariance.length;
    const stability = Math.sqrt(variance) / avgDaily;

    if (stability < 0.3 && thisWeekRequests > 10) {
      insights.push({
        type: 'stable',
        title: 'Stable Usage Pattern',
        description: 'Consistent daily usage indicates reliable workflow integration',
        value: `${Math.round(avgDaily)} avg daily requests`,
        change: 0,
        confidence: 'high',
        icon: Activity
      });
    }

    // Weekend vs weekday pattern
    const weekdays = thisWeek.slice(0, 5).reduce((sum, day) => sum + day.requests, 0) / 5;
    const weekends = thisWeek.slice(5).reduce((sum, day) => sum + day.requests, 0) / 2;
    
    if (weekdays > 0 && weekends > 0) {
      const weekendRatio = (weekends / weekdays) * 100;
      if (weekendRatio < 30) {
        insights.push({
          type: 'seasonal',
          title: 'Business Hours Usage Pattern',
          description: 'Lower weekend activity suggests business-focused usage',
          value: `${Math.round(weekendRatio)}% weekend usage`,
          change: 0,
          confidence: 'medium',
          icon: Calendar
        });
      } else if (weekendRatio > 80) {
        insights.push({
          type: 'seasonal',
          title: 'Consistent 24/7 Usage',
          description: 'High weekend activity indicates automated or personal usage',
          value: `${Math.round(weekendRatio)}% weekend usage`,
          change: 0,
          confidence: 'medium',
          icon: Clock
        });
      }
    }

    return insights.slice(0, 4); // Top 4 insights
  };

  const getPeriodComparisons = (): PeriodComparison[] => {
    if (!stats || stats.dailyUsage.length < 7) return [];

    const comparisons: PeriodComparison[] = [];
    const dailyData = stats.dailyUsage;

    // Last 7 days
    const last7Days = dailyData.slice(-7);
    const prev7Days = dailyData.slice(-14, -7);
    
    if (last7Days.length >= 7) {
      const thisWeekStats = {
        requests: last7Days.reduce((sum, day) => sum + day.requests, 0),
        cost: last7Days.reduce((sum, day) => sum + day.cost, 0),
        providers: new Set(stats.providerBreakdown.map(p => p.provider)).size,
        avgLatency: stats.averageLatency,
        successRate: stats.successRate
      };

      const prevWeekStats = {
        requests: prev7Days.reduce((sum, day) => sum + day.requests, 0),
        cost: prev7Days.reduce((sum, day) => sum + day.cost, 0),
        providers: new Set(stats.providerBreakdown.map(p => p.provider)).size, // Same for now
        avgLatency: stats.averageLatency, // Approximation
        successRate: stats.successRate // Approximation
      };

      comparisons.push({
        period: 'Last 7 Days',
        requests: thisWeekStats.requests,
        cost: thisWeekStats.cost,
        providers: thisWeekStats.providers,
        avgLatency: thisWeekStats.avgLatency,
        successRate: thisWeekStats.successRate,
        change: {
          requests: prevWeekStats.requests > 0 ? ((thisWeekStats.requests - prevWeekStats.requests) / prevWeekStats.requests) * 100 : 0,
          cost: prevWeekStats.cost > 0 ? ((thisWeekStats.cost - prevWeekStats.cost) / prevWeekStats.cost) * 100 : 0,
          avgLatency: 0, // Placeholder
          successRate: 0 // Placeholder
        }
      });
    }

    // Last 30 days (current period)
    comparisons.push({
      period: 'Last 30 Days',
      requests: stats.totalRequests,
      cost: stats.totalCost,
      providers: stats.providerBreakdown.length,
      avgLatency: stats.averageLatency,
      successRate: stats.successRate,
      change: {
        requests: 0, // No comparison data
        cost: 0,
        avgLatency: 0,
        successRate: 0
      }
    });

    return comparisons;
  };

  const trends = analyzeTrends();
  const periodComparisons = getPeriodComparisons();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Usage Trends
          </CardTitle>
          <CardDescription>Analyzing historical patterns...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Usage Trends
          </CardTitle>
          <CardDescription>Historical analysis unavailable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Need more historical data to show trends</p>
            <Button onClick={refresh} variant="outline" className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
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
            <TrendingUp className="h-5 w-5 mr-2" />
            Historical Usage Trends
          </div>
          <Button onClick={refresh} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Pattern analysis and growth insights from your usage history
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Period Comparisons */}
        {periodComparisons.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Period Comparison</h4>
            <div className="space-y-3">
              {periodComparisons.map((period, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{period.period}</h5>
                    <div className="flex items-center space-x-2">
                      {period.change.requests !== 0 && (
                        <Badge 
                          variant={period.change.requests > 0 ? 'success' : 'destructive'}
                          className="text-xs"
                        >
                          {period.change.requests > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {Math.abs(period.change.requests).toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Requests</p>
                      <p className="font-semibold">{period.requests.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cost</p>
                      <p className="font-semibold">${period.cost.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Providers</p>
                      <p className="font-semibold">{period.providers}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Success Rate</p>
                      <p className="font-semibold">{Math.round(period.successRate)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trend Insights */}
        {trends.length > 0 ? (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Trend Insights</h4>
            <div className="space-y-3">
              {trends.map((trend, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className={`p-2 rounded-full ${
                    trend.type === 'growth' ? 'bg-green-100' :
                    trend.type === 'decline' ? 'bg-red-100' :
                    trend.type === 'seasonal' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    <trend.icon className={`h-4 w-4 ${
                      trend.type === 'growth' ? 'text-green-600' :
                      trend.type === 'decline' ? 'text-red-600' :
                      trend.type === 'seasonal' ? 'text-blue-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-900">{trend.title}</h5>
                      <div className="flex items-center space-x-2">
                        {trend.change !== 0 && (
                          <Badge 
                            variant={trend.change > 0 ? 'success' : 'destructive'}
                            className="text-xs"
                          >
                            {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                          </Badge>
                        )}
                        <Badge 
                          variant={trend.confidence === 'high' ? 'success' : trend.confidence === 'medium' ? 'warning' : 'secondary'}
                          className="text-xs"
                        >
                          {trend.confidence}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{trend.description}</p>
                    <p className="text-xs font-medium text-blue-600">{trend.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Building Trend History</h3>
            <p className="text-gray-600 mb-4">
              Keep using the platform to see usage patterns and trends emerge
            </p>
            <div className="text-sm text-gray-500">
              Current data: {stats.dailyUsage.length} days • Need 7+ days for trend analysis
            </div>
          </div>
        )}

        {/* Usage Pattern Visualization */}
        {stats.dailyUsage.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Recent Activity Pattern
            </h4>
            
            {/* Simple bar visualization */}
            <div className="flex items-end space-x-1 h-16 mb-3">
              {stats.dailyUsage.slice(-7).map((day, index) => {
                const maxRequests = Math.max(...stats.dailyUsage.slice(-7).map(d => d.requests));
                const height = maxRequests > 0 ? (day.requests / maxRequests) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-indigo-400 rounded-t-sm min-h-[2px]"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${day.date}: ${day.requests} requests`}
                    />
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between text-xs text-gray-600">
              {stats.dailyUsage.slice(-7).map((day, index) => (
                <span key={index} className="text-center">
                  {day.date.split('-')[2]}
                </span>
              ))}
            </div>
            
            <div className="text-center mt-2 text-sm text-indigo-700">
              Last 7 days • Total: {stats.dailyUsage.slice(-7).reduce((sum, day) => sum + day.requests, 0)} requests
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}