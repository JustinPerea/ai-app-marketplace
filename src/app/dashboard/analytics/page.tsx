'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SimpleStars } from '@/components/ui/simple-stars';
import { 
  TrendingUp, 
  DollarSign, 
  Activity,
  Download,
  BarChart3,
  RefreshCw,
  Zap,
  Target,
  Brain,
  TrendingDown,
  Calculator,
  Eye,
  Settings,
  ChevronRight,
  CheckCircle2,
  Lightbulb,
  Users
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
  AreaChart
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalQueries: number;
    totalCost: number;
    monthlyCost: number;
    predictedCost: number;
    costSavings: number;
    costSavingsPercent: number;
    optimizationScore: number;
    avgResponseTime: number;
    successRate: number;
  };
  providers: Array<{
    name: string;
    displayName: string;
    usage: number;
    usagePercent: number;
    cost: number;
    costPercent: number;
    avgResponseTime: number;
    successRate: number;
    requests: number;
    savings: number;
    color: string;
  }>;
  usageTrends: Array<{
    date: string;
    queries: number;
    cost: number;
    predicted: number;
    savings: number;
  }>;
  costAnalysis: {
    currentMonth: number;
    previousMonth: number;
    roiPrediction: number;
    actualSavings: number;
    trend: 'up' | 'down' | 'stable';
    projectedAnnual: number;
  };
  optimizations: Array<{
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    expectedSavings: number;
    category: 'routing' | 'caching' | 'model' | 'usage';
    status: 'available' | 'active' | 'completed';
  }>;
  performanceMetrics: {
    averageLatency: number;
    p95Latency: number;
    errorRate: number;
    uptime: number;
    throughput: number;
  };
  insights: Array<{
    type: 'cost' | 'performance' | 'optimization' | 'usage';
    title: string;
    description: string;
    action?: string;
    priority: 'high' | 'medium' | 'low';
    link?: string;
  }>;
}

const CHART_COLORS = ['#FFD700', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`);
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

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <SimpleStars starCount={40} parallaxSpeed={0.15} />
        <div className="absolute inset-0 pointer-events-none" 
             style={{ 
               background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(59, 130, 246, 0.04) 50%, rgba(139, 92, 246, 0.06) 100%)' 
             }}>
        </div>
        <div className="min-h-screen relative z-10">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-[#3B82F6]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Mock data for demo
  const mockData: AnalyticsData = {
    overview: {
      totalQueries: 125340,
      totalCost: 1234.56,
      monthlyCost: 456.78,
      predictedCost: 1800.00,
      costSavings: 565.44,
      costSavingsPercent: 73.2,
      optimizationScore: 8.4,
      avgResponseTime: 1.2,
      successRate: 99.8,
    },
    providers: [
      { name: 'gemini-flash', displayName: 'Gemini 1.5 Flash', usage: 45231, usagePercent: 42.1, cost: 234.56, costPercent: 35.2, avgResponseTime: 0.8, successRate: 99.9, requests: 45231, savings: 123.45, color: '#4285F4' },
      { name: 'claude-haiku', displayName: 'Claude 3 Haiku', usage: 32145, usagePercent: 29.8, cost: 345.67, costPercent: 42.1, avgResponseTime: 1.1, successRate: 99.7, requests: 32145, savings: 98.76, color: '#FF6B35' },
      { name: 'gpt-4o-mini', displayName: 'GPT-4o Mini', usage: 28934, usagePercent: 26.8, cost: 187.23, costPercent: 22.7, avgResponseTime: 1.4, successRate: 99.5, requests: 28934, savings: 67.89, color: '#10A37F' },
    ],
    usageTrends: [
      { date: '2025-07-18', queries: 1200, cost: 45.32, predicted: 78.50, savings: 33.18 },
      { date: '2025-07-19', queries: 1450, cost: 52.14, predicted: 89.75, savings: 37.61 },
      { date: '2025-07-20', queries: 1680, cost: 61.23, predicted: 98.40, savings: 37.17 },
      { date: '2025-07-21', queries: 1320, cost: 48.76, predicted: 82.15, savings: 33.39 },
      { date: '2025-07-22', queries: 1890, cost: 67.45, predicted: 105.20, savings: 37.75 },
      { date: '2025-07-23', queries: 2100, cost: 75.30, predicted: 118.50, savings: 43.20 },
      { date: '2025-07-24', queries: 1950, cost: 71.22, predicted: 112.30, savings: 41.08 },
    ],
    costAnalysis: {
      currentMonth: 456.78,
      previousMonth: 523.45,
      roiPrediction: 1200.00,
      actualSavings: 565.44,
      trend: 'down',
      projectedAnnual: 5481.36,
    },
    optimizations: [
      { id: '1', title: 'Switch to Faster Models', description: 'Use Gemini Flash for simple queries to reduce costs by 40%', impact: 'high', effort: 'low', expectedSavings: 89.50, category: 'routing', status: 'available' },
      { id: '2', title: 'Enable Smart Caching', description: 'Cache common responses to reduce API calls by 25%', impact: 'medium', effort: 'medium', expectedSavings: 67.25, category: 'caching', status: 'active' },
      { id: '3', title: 'Optimize Query Length', description: 'Reduce average tokens per query through better prompting', impact: 'medium', effort: 'low', expectedSavings: 45.75, category: 'usage', status: 'available' },
    ],
    performanceMetrics: {
      averageLatency: 1.2,
      p95Latency: 2.8,
      errorRate: 0.2,
      uptime: 99.8,
      throughput: 1250,
    },
    insights: [
      { type: 'cost', title: 'Significant Cost Savings Achieved', description: 'You\'re saving 73% compared to single-provider usage', action: 'View detailed breakdown', priority: 'high' },
      { type: 'performance', title: 'Excellent Response Times', description: 'Average response time of 1.2s is 40% faster than baseline', action: 'See performance trends', priority: 'medium' },
      { type: 'optimization', title: 'Smart Routing Active', description: 'Intelligent provider selection is optimizing your costs automatically', action: 'Configure routing rules', priority: 'low' },
      { type: 'usage', title: 'Peak Usage Detected', description: 'Consider enabling auto-scaling for better performance during peak times', action: 'Enable auto-scaling', priority: 'medium' },
    ],
  };

  const analyticsData = data || mockData;

  return (
    <DashboardLayout>
      <SimpleStars starCount={40} parallaxSpeed={0.15} />
      <div className="absolute inset-0 pointer-events-none" 
           style={{ 
             background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(59, 130, 246, 0.04) 50%, rgba(139, 92, 246, 0.06) 100%)' 
           }}>
      </div>
      
      <div className="min-h-screen relative z-10">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-hero-glass mb-4">
                <span className="text-glass-gradient">Intelligent Analytics</span>
              </h1>
              <p className="text-body-lg text-text-secondary">
                Track AI usage, optimize costs, and discover efficiency opportunities
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="glass-card px-3 py-2 border border-[rgba(255,255,255,0.1)] rounded-md text-sm bg-[rgba(255,255,255,0.05)] text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchAnalytics}
                className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#0B1426]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-0 bg-[rgba(255,255,255,0.05)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#E2E8F0]">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-[#94A3B8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#E2E8F0]">{formatCurrency(analyticsData.overview.totalCost)}</div>
              <div className="flex items-center text-xs text-[#94A3B8]">
                <TrendingDown className="h-3 w-3 mr-1" style={{color: '#10B981'}} />
                {formatCurrency(analyticsData.overview.costSavings)} saved vs predicted
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 bg-[rgba(255,255,255,0.05)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#E2E8F0]">Total Queries</CardTitle>
              <Activity className="h-4 w-4 text-[#94A3B8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#E2E8F0]">{formatNumber(analyticsData.overview.totalQueries)}</div>
              <div className="flex items-center text-xs text-[#94A3B8]">
                <TrendingUp className="h-3 w-3 mr-1" style={{color: '#10B981'}} />
                {formatPercent(analyticsData.overview.successRate)} success rate
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 bg-[rgba(255,255,255,0.05)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#E2E8F0]">Cost Savings</CardTitle>
              <Target className="h-4 w-4 text-[#94A3B8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#10B981]">{formatPercent(analyticsData.overview.costSavingsPercent)}</div>
              <p className="text-xs text-[#94A3B8]">
                {formatCurrency(analyticsData.overview.costSavings)} monthly savings
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 bg-[rgba(255,255,255,0.05)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#E2E8F0]">Avg Response</CardTitle>
              <Zap className="h-4 w-4 text-[#94A3B8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#E2E8F0]">{analyticsData.overview.avgResponseTime}s</div>
              <p className="text-xs text-[#94A3B8]">
                Score: {analyticsData.overview.optimizationScore}/10
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Usage Trends Chart */}
          <Card className="glass-card border-0 bg-[rgba(255,255,255,0.05)]">
            <CardHeader>
              <CardTitle className="flex items-center text-[#E2E8F0]">
                <BarChart3 className="h-5 w-5 mr-2" />
                Usage & Cost Trends
              </CardTitle>
              <CardDescription className="text-[#94A3B8]">
                Query volume, costs, and savings over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.usageTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '8px' 
                      }}
                      formatter={(value: any, name: any) => {
                        if (name === 'cost' || name === 'predicted' || name === 'savings') 
                          return [formatCurrency(value as number), name];
                        return [formatNumber(value as number), name];
                      }} 
                    />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
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

          {/* Provider Distribution */}
          <Card className="glass-card border-0 bg-[rgba(255,255,255,0.05)]">
            <CardHeader>
              <CardTitle className="flex items-center text-[#E2E8F0]">
                <Zap className="h-5 w-5 mr-2" style={{color: '#FFD700'}} />
                Provider Performance
              </CardTitle>
              <CardDescription className="text-[#94A3B8]">
                Usage distribution and cost efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.providers.map((provider, index) => (
                  <div key={provider.name} className="flex items-center justify-between p-4 border border-[rgba(255,255,255,0.1)] rounded-lg bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] transition-all">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3" 
                        style={{ backgroundColor: provider.color }}
                      />
                      <div>
                        <h4 className="font-semibold text-[#E2E8F0]">{provider.displayName}</h4>
                        <div className="flex items-center gap-4 text-sm text-[#94A3B8]">
                          <span>{formatNumber(provider.requests)} requests</span>
                          <span>•</span>
                          <span>{provider.avgResponseTime}s avg</span>
                          <span>•</span>
                          <span>{formatPercent(provider.successRate)} uptime</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#E2E8F0]">{formatCurrency(provider.cost)}</p>
                      <div className="flex items-center">
                        <TrendingDown className="h-3 w-3 text-[#10B981] mr-1" />
                        <span className="text-xs text-[#10B981]">-{formatCurrency(provider.savings)} saved</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-card border-0 bg-[rgba(255,255,255,0.05)]">
          <CardHeader>
            <CardTitle className="flex items-center text-[#E2E8F0]">
              <Settings className="h-5 w-5 mr-2" style={{color: '#FFD700'}} />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-[#94A3B8]">
              Optimize your AI usage and costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                asChild
                className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0B1426] hover:opacity-90"
              >
                <Link href="/business">
                  <Calculator className="h-4 w-4 mr-2" />
                  Update ROI Calculator
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline" 
                className="w-full border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white"
              >
                <Link href="/setup">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Providers
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}