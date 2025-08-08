'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Download,
  RefreshCw,
  Star,
  Eye,
  MessageSquare,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
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

interface DeveloperAnalytics {
  overview: {
    totalRevenue: number;
    monthlyRevenue: number;
    totalUsers: number;
    activeSubscriptions: number;
    averageRevenuePerUser: number;
    growthRate: number;
  };
  revenueChart: Array<{
    date: string;
    revenue: number;
    subscriptions: number;
    users: number;
  }>;
  topApps: Array<{
    id: string;
    name: string;
    revenue: number;
    users: number;
    rating: number;
    reviews: number;
    views: number;
    conversion: number;
  }>;
  userEngagement: Array<{
    metric: string;
    value: number;
    change: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    apps: number;
    revenue: number;
    users: number;
    color: string;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function DeveloperAnalyticsPage() {
  const [data, setData] = useState<DeveloperAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}&type=developer`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Failed to fetch developer analytics:', error);
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
    );
  }

  if (!data) {
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">No Analytics Data</h1>
            <p className="text-gray-600 mt-2">Publish your first app to see analytics data.</p>
          </div>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Developer Analytics</h1>
              <p className="text-gray-600 mt-2">
                Track your app performance, revenue, and user engagement
              </p>
            </div>
            <div className="flex items-center space-x-4">
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
                Export Report
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
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
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
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{formatNumber(data.overview.totalUsers)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatNumber(data.overview.activeSubscriptions)} subscriptions
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
                  <p className="text-sm font-medium text-gray-600">Revenue per User</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.overview.averageRevenuePerUser)}</p>
                  <p className="text-xs text-gray-500 mt-1">Average lifetime value</p>
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
                  <p className="text-xs text-gray-500 mt-1">85% developer share</p>
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
                Your earnings and subscription growth over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => {
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
                Revenue by Category
              </CardTitle>
              <CardDescription>
                Revenue distribution across your app categories
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
                      label={({ category, revenue }) => `${category}: ${formatCurrency(revenue)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {data.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* App Performance Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              App Performance
            </CardTitle>
            <CardDescription>
              Detailed metrics for each of your published apps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">App Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Revenue</th>
                    <th className="text-left py-3 px-4 font-semibold">Users</th>
                    <th className="text-left py-3 px-4 font-semibold">Rating</th>
                    <th className="text-left py-3 px-4 font-semibold">Conversion</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topApps.map((app) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <h4 className="font-semibold">{app.name}</h4>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Eye className="h-3 w-3 mr-1" />
                            <span>{formatNumber(app.views)} views</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold">{formatCurrency(app.revenue)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span>{formatNumber(app.users)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span>{app.rating.toFixed(1)}</span>
                          <span className="text-gray-500 text-sm ml-1">({app.reviews})</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline">
                          {app.conversion.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Key Performance Indicators
            </CardTitle>
            <CardDescription>
              Important metrics for tracking your success
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {data.userEngagement.map((metric, index) => (
                <div key={metric.metric} className="text-center p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-3xl font-bold mb-2">{formatNumber(metric.value)}</h3>
                  <p className="text-sm text-gray-600 mb-3">{metric.metric}</p>
                  <div className="flex items-center justify-center">
                    {metric.change > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />
                    )}
                    <span className={`text-sm font-medium ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(metric.change)}% from last period
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}