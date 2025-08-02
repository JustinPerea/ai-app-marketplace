'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Star,
  Zap,
  Target,
  Brain,
  AlertTriangle,
  TrendingDown,
  Calculator,
  Eye,
  Clock,
  Shield,
  Award,
  Settings,
  Search,
  Filter
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Area,
  AreaChart,
  ComposedChart,
  Line,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  Legend
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    monthlyRevenue: number;
    totalUsers: number;
    activeSubscriptions: number;
    averageRevenuePerUser: number;
    growthRate: number;
    costSavings: number;
    costSavingsPercent: number;
    totalApiCalls: number;
    avgResponseTime: number;
  };
  revenueChart: Array<{
    date: string;
    revenue: number;
    subscriptions: number;
    users: number;
    costSavings: number;
    predictions?: number;
  }>;
  topApps: Array<{
    id: string;
    name: string;
    developer: string;
    revenue: number;
    users: number;
    rating: number;
    growth: number;
    costEfficiency: number;
    performance: number;
  }>;
  userEngagement: Array<{
    metric: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  categoryBreakdown: Array<{
    category: string;
    apps: number;
    revenue: number;
    users: number;
    color: string;
    efficiency: number;
  }>;
  aiUsage: Array<{
    provider: string;
    requests: number;
    cost: number;
    apps: number;
    avgLatency: number;
    reliability: number;
    costPerRequest: number;
  }>;
  // NEW: Phase 3 Advanced Analytics
  usagePatterns: {
    peakHours: Array<{ hour: number; usage: number }>;
    dailyTrends: Array<{ day: string; usage: number; cost: number }>;
    seasonality: Array<{ month: string; usage: number; forecast: number }>;
  };
  costOptimization: {
    currentSavings: number;
    potentialSavings: number;
    recommendations: Array<{
      title: string;
      impact: string;
      effort: 'low' | 'medium' | 'high';
      priority: 'low' | 'medium' | 'high';
      description: string;
      expectedSavings: number;
    }>;
    efficiency: {
      current: number;
      target: number;
      improvement: number;
    };
  };
  performanceBenchmarks: {
    responseTime: { current: number; target: number; percentile95: number };
    availability: { current: number; target: number; sla: number };
    errorRate: { current: number; target: number; threshold: number };
    throughput: { current: number; target: number; peak: number };
  };
  predictiveInsights: {
    costForecast: Array<{ month: string; predicted: number; confidence: number }>;
    usageForecast: Array<{ month: string; predicted: number; confidence: number }>;
    anomalies: Array<{
      type: 'cost' | 'usage' | 'performance';
      severity: 'low' | 'medium' | 'high';
      description: string;
      timestamp: string;
      impact: string;
    }>;
    trends: Array<{
      metric: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      velocity: number;
      projection: string;
    }>;
  };
  roiAnalysis: {
    totalInvestment: number;
    totalSavings: number;
    netReturn: number;
    roiPercentage: number;
    paybackPeriod: number;
    breakdown: Array<{
      category: string;
      investment: number;
      savings: number;
      roi: number;
    }>;
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [viewType, setViewType] = useState<'platform' | 'developer'>('platform');
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, viewType]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}&type=${viewType}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!data) {
    // Show mock data for demo purposes
    const mockData: AnalyticsData = {
      overview: {
        totalRevenue: 24567.89,
        monthlyRevenue: 8952.34,
        totalUsers: 1234,
        activeSubscriptions: 892,
        averageRevenuePerUser: 19.92,
        growthRate: 15.2,
      },
      revenueChart: [
        { date: '2025-07-18', revenue: 1200, subscriptions: 45, users: 38 },
        { date: '2025-07-19', revenue: 1450, subscriptions: 52, users: 41 },
        { date: '2025-07-20', revenue: 1680, subscriptions: 48, users: 45 },
        { date: '2025-07-21', revenue: 1320, subscriptions: 39, users: 35 },
        { date: '2025-07-22', revenue: 1890, subscriptions: 67, users: 58 },
        { date: '2025-07-23', revenue: 2100, subscriptions: 71, users: 62 },
        { date: '2025-07-24', revenue: 1950, subscriptions: 63, users: 55 },
      ],
      topApps: [
        { id: '1', name: 'Legal Contract Analyzer', developer: 'LegalTech Pro', revenue: 8943.21, users: 156, rating: 4.8, growth: 23.4 },
        { id: '2', name: 'HIPAA Medical Scribe', developer: 'HealthAI Solutions', revenue: 7234.56, users: 134, rating: 4.6, growth: 18.9 },
        { id: '3', name: 'Code Review Bot', developer: 'DevTools Inc', revenue: 5678.90, users: 98, rating: 4.7, growth: 15.2 },
        { id: '4', name: 'Financial Report Generator', developer: 'FinanceAI', revenue: 4321.45, users: 87, rating: 4.5, growth: 12.8 },
      ],
      userEngagement: [
        { metric: 'Daily Active Users', value: 456, change: 12.5 },
        { metric: 'Session Duration (min)', value: 24, change: -3.2 },
        { metric: 'Apps per User', value: 2.3, change: 8.7 },
      ],
      categoryBreakdown: [
        { category: 'Legal Tools', apps: 12, revenue: 12450.32, users: 234, color: '#3B82F6' },
        { category: 'Medical Tools', apps: 8, revenue: 9876.54, users: 187, color: '#10B981' },
        { category: 'Developer Tools', apps: 15, revenue: 8765.43, users: 156, color: '#F59E0B' },
        { category: 'Financial Tools', apps: 6, revenue: 6543.21, users: 98, color: '#EF4444' },
      ],
      aiUsage: [
        { provider: 'OPENAI', requests: 45231, cost: 1234.56, apps: 23 },
        { provider: 'ANTHROPIC', requests: 32145, cost: 987.65, apps: 18 },
        { provider: 'GOOGLE', requests: 28934, cost: 765.43, apps: 15 },
        { provider: 'AZURE_OPENAI', requests: 19876, cost: 543.21, apps: 12 },
      ],
    };
    
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-2">
                  Track marketplace performance, revenue, and user engagement (Demo Data)
                </p>
              </div>
            </div>
          </div>

          {/* Overview Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(mockData.overview.totalRevenue)}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+{mockData.overview.growthRate}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{formatNumber(mockData.overview.totalUsers)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatNumber(mockData.overview.activeSubscriptions)} active subscriptions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">ARPU</p>
                    <p className="text-2xl font-bold">{formatCurrency(mockData.overview.averageRevenuePerUser)}</p>
                    <p className="text-xs text-gray-500 mt-1">Average Revenue Per User</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(mockData.overview.monthlyRevenue)}</p>
                    <p className="text-xs text-gray-500 mt-1">Recurring monthly revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Revenue Trends (Demo)
                </CardTitle>
                <CardDescription>
                  Revenue, subscriptions, and user growth over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockData.revenueChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: any, name: any) => {
                        if (name === 'revenue') return [formatCurrency(value as number), 'Revenue'];
                        return [formatNumber(value as number), name];
                      }} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stackId="1"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="subscriptions"
                        stackId="2"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Category Performance (Demo)
                </CardTitle>
                <CardDescription>
                  Revenue distribution by app category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={mockData.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, revenue }: any) => `${category}: ${formatCurrency(revenue)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {mockData.categoryBreakdown.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(value as number)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Track marketplace performance, revenue, and user engagement
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* View Type Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewType('platform')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewType === 'platform' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Platform View
                </button>
                <button
                  onClick={() => setViewType('developer')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewType === 'developer' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Developer View
                </button>
              </div>

              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>

              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.overview.totalRevenue)}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+{data.overview.growthRate}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{formatNumber(data.overview.totalUsers)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatNumber(data.overview.activeSubscriptions)} active subscriptions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ARPU</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.overview.averageRevenuePerUser)}</p>
                  <p className="text-xs text-gray-500 mt-1">Average Revenue Per User</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.overview.monthlyRevenue)}</p>
                  <p className="text-xs text-gray-500 mt-1">Recurring monthly revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="h-5 w-5 mr-2" />
                Revenue Trends
              </CardTitle>
              <CardDescription>
                Revenue, subscriptions, and user growth over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any, name: any) => {
                      if (name === 'revenue') return [formatCurrency(value as number), 'Revenue'];
                      return [formatNumber(value as number), name];
                    }} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="subscriptions"
                      stackId="2"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Category Performance
              </CardTitle>
              <CardDescription>
                Revenue distribution by app category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, revenue }: any) => `${category}: ${formatCurrency(revenue)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {data.categoryBreakdown.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value as number)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Apps and AI Usage */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performing Apps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Top Performing Apps
              </CardTitle>
              <CardDescription>
                Highest revenue generating applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topApps.map((app, _index) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mr-3">
                        #{_index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{app.name}</h4>
                        <p className="text-sm text-gray-600">by {app.developer}</p>
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          <span className="text-xs text-gray-600">{app.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-400 mx-2">•</span>
                          <span className="text-xs text-gray-600">{formatNumber(app.users)} users</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(app.revenue)}</p>
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-600">+{app.growth}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Provider Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                AI Provider Usage
              </CardTitle>
              <CardDescription>
                API usage and costs by provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.aiUsage.map((provider, _index) => (
                  <div key={provider.provider} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="text-lg mr-3">
                        {provider.provider === 'OPENAI' && '🤖'}
                        {provider.provider === 'ANTHROPIC' && '🔮'}
                        {provider.provider === 'GOOGLE' && '🟡'}
                        {provider.provider === 'AZURE_OPENAI' && '🔷'}
                      </div>
                      <div>
                        <h4 className="font-semibold">{provider.provider}</h4>
                        <p className="text-sm text-gray-600">
                          {formatNumber(provider.requests)} requests • {provider.apps} apps
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(provider.cost)}</p>
                      <p className="text-xs text-gray-500">Total cost</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              User Engagement Metrics
            </CardTitle>
            <CardDescription>
              Key performance indicators for user behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {data.userEngagement.map((metric, index) => (
                <div key={metric.metric} className="text-center">
                  <h3 className="text-2xl font-bold">{formatNumber(metric.value)}</h3>
                  <p className="text-sm text-gray-600 mb-2">{metric.metric}</p>
                  <div className="flex items-center justify-center">
                    {metric.change > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />
                    )}
                    <span className={`text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}