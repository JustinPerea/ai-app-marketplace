/**
 * AI Usage Analytics and Monitoring System
 * 
 * Comprehensive analytics system providing:
 * - Real-time usage tracking
 * - Cost analysis and optimization insights
 * - Performance monitoring
 * - Provider comparison metrics
 * - Usage patterns and predictions
 */

import { PrismaClient, ApiProvider } from '@prisma/client';
import {
  AIUsageRecord,
  PerformanceMetrics,
  ProviderStatus,
} from './types';

export interface UsageMetrics {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageCost: number;
  averageLatency: number;
  successRate: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface ProviderMetrics extends UsageMetrics {
  provider: ApiProvider;
  modelBreakdown: Record<string, UsageMetrics>;
  errorBreakdown: Record<string, number>;
}

export interface CostAnalysis {
  currentPeriodCost: number;
  projectedMonthlyCost: number;
  costByProvider: Record<ApiProvider, number>;
  costByModel: Record<string, number>;
  savingsOpportunities: Array<{
    description: string;
    potentialSavings: number;
    recommendation: string;
  }>;
  trends: {
    costTrend: 'increasing' | 'decreasing' | 'stable';
    usageTrend: 'increasing' | 'decreasing' | 'stable';
    efficiencyTrend: 'improving' | 'declining' | 'stable';
  };
}

export interface PerformanceAnalysis {
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  throughput: number; // requests per minute
  errorRate: number;
  availabilityScore: number;
  bottlenecks: Array<{
    type: 'latency' | 'errors' | 'rate_limits';
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
  }>;
}

export interface UsagePattern {
  peakHours: number[];
  busyDays: string[];
  seasonalTrends: Record<string, number>;
  userBehavior: {
    averageSessionLength: number;
    preferredModels: string[];
    commonTaskTypes: string[];
  };
}

export interface PredictiveInsights {
  predictedUsage: {
    nextWeek: number;
    nextMonth: number;
    confidence: number; // 0-1
  };
  predictedCost: {
    nextWeek: number;
    nextMonth: number;
    confidence: number;
  };
  recommendations: Array<{
    type: 'cost_optimization' | 'performance' | 'capacity';
    priority: 'low' | 'medium' | 'high';
    description: string;
    expectedImpact: string;
  }>;
}

export class AIAnalyticsService {
  private prisma: PrismaClient;
  private metricsCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get usage metrics for a specific user and time period
   */
  async getUserUsageMetrics(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UsageMetrics> {
    const cacheKey = `user_metrics_${userId}_${startDate.getTime()}_${endDate.getTime()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const records = await this.prisma.aiUsageRecord.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const metrics = this.calculateUsageMetrics(records, startDate, endDate);
    this.setCache(cacheKey, metrics);
    
    return metrics;
  }

  /**
   * Get provider-specific metrics
   */
  async getProviderMetrics(
    provider: ApiProvider,
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<ProviderMetrics> {
    const cacheKey = `provider_metrics_${provider}_${startDate.getTime()}_${endDate.getTime()}_${userId || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const whereClause: any = {
      provider,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (userId) {
      whereClause.userId = userId;
    }

    const records = await this.prisma.aiUsageRecord.findMany({
      where: whereClause,
    });

    const baseMetrics = this.calculateUsageMetrics(records, startDate, endDate);
    
    // Calculate model breakdown
    const modelBreakdown: Record<string, UsageMetrics> = {};
    const modelGroups = this.groupBy(records, 'model');
    
    for (const [model, modelRecords] of Object.entries(modelGroups)) {
      modelBreakdown[model] = this.calculateUsageMetrics(modelRecords, startDate, endDate);
    }

    // Calculate error breakdown
    const errorBreakdown = this.groupBy(
      records.filter(r => !r.successful), 
      'errorCode'
    );
    
    const errorCounts: Record<string, number> = {};
    for (const [errorCode, errorRecords] of Object.entries(errorBreakdown)) {
      errorCounts[errorCode || 'unknown'] = errorRecords.length;
    }

    const providerMetrics: ProviderMetrics = {
      ...baseMetrics,
      provider,
      modelBreakdown,
      errorBreakdown: errorCounts,
    };

    this.setCache(cacheKey, providerMetrics);
    return providerMetrics;
  }

  /**
   * Analyze costs and identify savings opportunities
   */
  async analyzeCosts(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CostAnalysis> {
    const records = await this.prisma.aiUsageRecord.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const currentPeriodCost = records.reduce((sum, record) => sum + Number(record.cost), 0);
    
    // Project monthly cost based on current usage
    const periodDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const dailyAverageCost = currentPeriodCost / periodDays;
    const projectedMonthlyCost = dailyAverageCost * 30;

    // Cost by provider
    const costByProvider: Record<ApiProvider, number> = {} as any;
    for (const provider of Object.values(ApiProvider)) {
      costByProvider[provider] = records
        .filter(r => r.provider === provider)
        .reduce((sum, record) => sum + Number(record.cost), 0);
    }

    // Cost by model
    const costByModel: Record<string, number> = {};
    const modelGroups = this.groupBy(records, 'model');
    for (const [model, modelRecords] of Object.entries(modelGroups)) {
      costByModel[model] = modelRecords.reduce((sum, record) => sum + Number(record.cost), 0);
    }

    // Identify savings opportunities
    const savingsOpportunities = await this.identifySavingsOpportunities(records);

    // Calculate trends
    const trends = this.calculateTrends(records);

    return {
      currentPeriodCost,
      projectedMonthlyCost,
      costByProvider,
      costByModel,
      savingsOpportunities,
      trends,
    };
  }

  /**
   * Analyze performance metrics
   */
  async analyzePerformance(
    startDate: Date,
    endDate: Date,
    provider?: ApiProvider,
    userId?: string
  ): Promise<PerformanceAnalysis> {
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (provider) whereClause.provider = provider;
    if (userId) whereClause.userId = userId;

    const records = await this.prisma.aiUsageRecord.findMany({
      where: whereClause,
    });

    const latencies = records.map(r => r.latency).sort((a, b) => a - b);
    const successfulRequests = records.filter(r => r.successful);
    const periodMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);

    const analysis: PerformanceAnalysis = {
      averageLatency: latencies.length > 0 ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length : 0,
      p95Latency: latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : 0,
      p99Latency: latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.99)] : 0,
      throughput: records.length / Math.max(periodMinutes, 1),
      errorRate: records.length > 0 ? (records.length - successfulRequests.length) / records.length : 0,
      availabilityScore: records.length > 0 ? successfulRequests.length / records.length : 1,
      bottlenecks: this.identifyBottlenecks(records),
    };

    return analysis;
  }

  /**
   * Analyze usage patterns
   */
  async analyzeUsagePatterns(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UsagePattern> {
    const records = await this.prisma.aiUsageRecord.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Peak hours analysis
    const hourlyUsage = new Array(24).fill(0);
    records.forEach(record => {
      const hour = new Date(record.createdAt).getHours();
      hourlyUsage[hour]++;
    });
    
    const peakHours = hourlyUsage
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);

    // Busy days analysis
    const dailyUsage = new Map<string, number>();
    records.forEach(record => {
      const dayKey = record.createdAt.toISOString().split('T')[0];
      dailyUsage.set(dayKey, (dailyUsage.get(dayKey) || 0) + 1);
    });

    const busyDays = Array.from(dailyUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(entry => entry[0]);

    // Model preferences
    const modelUsage = this.groupBy(records, 'model');
    const preferredModels = Object.entries(modelUsage)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5)
      .map(entry => entry[0]);

    // Calculate session metrics (simplified)
    const averageSessionLength = this.calculateAverageSessionLength(records);

    return {
      peakHours,
      busyDays,
      seasonalTrends: {}, // Would require longer historical data
      userBehavior: {
        averageSessionLength,
        preferredModels,
        commonTaskTypes: ['chat', 'analysis', 'generation'], // Would be derived from metadata
      },
    };
  }

  /**
   * Generate predictive insights
   */
  async generatePredictiveInsights(
    userId: string,
    historicalDays: number = 30
  ): Promise<PredictiveInsights> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - historicalDays * 24 * 60 * 60 * 1000);

    const records = await this.prisma.aiUsageRecord.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Simple linear trend analysis (in production, would use more sophisticated ML)
    const dailyUsage = this.groupRecordsByDay(records);
    const dailyCosts = this.groupCostsByDay(records);

    const usageTrend = this.calculateLinearTrend(dailyUsage);
    const costTrend = this.calculateLinearTrend(dailyCosts);

    const currentDailyUsage = dailyUsage.length > 0 ? dailyUsage[dailyUsage.length - 1] : 0;
    const currentDailyCost = dailyCosts.length > 0 ? dailyCosts[dailyCosts.length - 1] : 0;

    const predictedUsage = {
      nextWeek: Math.max(0, currentDailyUsage * 7 + usageTrend * 7),
      nextMonth: Math.max(0, currentDailyUsage * 30 + usageTrend * 30),
      confidence: Math.min(0.9, records.length / 100), // Higher confidence with more data
    };

    const predictedCost = {
      nextWeek: Math.max(0, currentDailyCost * 7 + costTrend * 7),
      nextMonth: Math.max(0, currentDailyCost * 30 + costTrend * 30),
      confidence: Math.min(0.9, records.length / 100),
    };

    const recommendations = this.generateRecommendations(records, usageTrend, costTrend);

    return {
      predictedUsage,
      predictedCost,
      recommendations,
    };
  }

  /**
   * Get real-time dashboard metrics
   */
  async getDashboardMetrics(userId: string): Promise<{
    todayUsage: UsageMetrics;
    weekUsage: UsageMetrics;
    monthUsage: UsageMetrics;
    topProviders: Array<{ provider: ApiProvider; usage: number; cost: number }>;
    recentErrors: Array<{ timestamp: Date; provider: ApiProvider; error: string }>;
    performanceAlerts: Array<{ type: string; severity: string; message: string }>;
  }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayUsage, weekUsage, monthUsage] = await Promise.all([
      this.getUserUsageMetrics(userId, todayStart, now),
      this.getUserUsageMetrics(userId, weekStart, now),
      this.getUserUsageMetrics(userId, monthStart, now),
    ]);

    // Get top providers
    const monthRecords = await this.prisma.aiUsageRecord.findMany({
      where: {
        userId,
        createdAt: { gte: monthStart, lte: now },
      },
    });

    const providerStats = Object.values(ApiProvider).map(provider => {
      const providerRecords = monthRecords.filter(r => r.provider === provider);
      return {
        provider,
        usage: providerRecords.length,
        cost: providerRecords.reduce((sum, r) => sum + Number(r.cost), 0),
      };
    }).sort((a, b) => b.usage - a.usage);

    // Get recent errors
    const recentErrors = await this.prisma.aiUsageRecord.findMany({
      where: {
        userId,
        successful: false,
        createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const errorSummary = recentErrors.map(record => ({
      timestamp: record.createdAt,
      provider: record.provider,
      error: record.errorCode || 'Unknown error',
    }));

    // Generate performance alerts
    const performanceAlerts = this.generatePerformanceAlerts(weekUsage);

    return {
      todayUsage,
      weekUsage,
      monthUsage,
      topProviders: providerStats.slice(0, 3),
      recentErrors: errorSummary,
      performanceAlerts,
    };
  }

  // Private helper methods

  private calculateUsageMetrics(
    records: any[],
    startDate: Date,
    endDate: Date
  ): UsageMetrics {
    const totalRequests = records.length;
    const successfulRequests = records.filter(r => r.successful);
    const totalTokens = records.reduce((sum, record) => sum + record.tokensUsed, 0);
    const totalCost = records.reduce((sum, record) => sum + Number(record.cost), 0);
    const totalLatency = records.reduce((sum, record) => sum + record.latency, 0);

    return {
      totalRequests,
      totalTokens,
      totalCost,
      averageCost: totalRequests > 0 ? totalCost / totalRequests : 0,
      averageLatency: totalRequests > 0 ? totalLatency / totalRequests : 0,
      successRate: totalRequests > 0 ? successfulRequests.length / totalRequests : 1,
      period: { start: startDate, end: endDate },
    };
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private async identifySavingsOpportunities(records: any[]): Promise<Array<{
    description: string;
    potentialSavings: number;
    recommendation: string;
  }>> {
    const opportunities = [];

    // Analyze model usage efficiency
    const modelCosts = this.groupBy(records, 'model');
    let expensiveModelUsage = 0;
    let expensiveModelCost = 0;

    for (const [model, modelRecords] of Object.entries(modelCosts)) {
      const modelCost = modelRecords.reduce((sum, r) => sum + Number(r.cost), 0);
      if (model.includes('gpt-4') || model.includes('opus')) {
        expensiveModelUsage += modelRecords.length;
        expensiveModelCost += modelCost;
      }
    }

    if (expensiveModelUsage > 0.5 * records.length) {
      opportunities.push({
        description: `${Math.round(expensiveModelUsage / records.length * 100)}% of requests use premium models`,
        potentialSavings: expensiveModelCost * 0.6, // Assuming 60% savings with cheaper models
        recommendation: 'Consider using faster, cheaper models for simple tasks',
      });
    }

    // Analyze provider distribution
    const providerCosts = this.groupBy(records, 'provider');
    const providerCostAnalysis = Object.entries(providerCosts).map(([provider, providerRecords]) => ({
      provider,
      cost: providerRecords.reduce((sum, r) => sum + Number(r.cost), 0),
      usage: providerRecords.length,
    })).sort((a, b) => b.cost - a.cost);

    if (providerCostAnalysis.length > 1) {
      const mostExpensive = providerCostAnalysis[0];
      const cheapest = providerCostAnalysis[providerCostAnalysis.length - 1];
      
      if (mostExpensive.cost > cheapest.cost * 2) {
        opportunities.push({
          description: `${mostExpensive.provider} costs ${Math.round(mostExpensive.cost / cheapest.cost)}x more than ${cheapest.provider}`,
          potentialSavings: mostExpensive.cost * 0.4,
          recommendation: `Consider routing more requests to ${cheapest.provider} for cost optimization`,
        });
      }
    }

    return opportunities;
  }

  private calculateTrends(records: any[]): CostAnalysis['trends'] {
    if (records.length < 7) {
      return {
        costTrend: 'stable',
        usageTrend: 'stable',
        efficiencyTrend: 'stable',
      };
    }

    const sortedRecords = records.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const midpoint = Math.floor(records.length / 2);
    const firstHalf = sortedRecords.slice(0, midpoint);
    const secondHalf = sortedRecords.slice(midpoint);

    const firstHalfCost = firstHalf.reduce((sum, r) => sum + Number(r.cost), 0);
    const secondHalfCost = secondHalf.reduce((sum, r) => sum + Number(r.cost), 0);
    
    const firstHalfUsage = firstHalf.length;
    const secondHalfUsage = secondHalf.length;

    const costChange = (secondHalfCost - firstHalfCost) / firstHalfCost;
    const usageChange = (secondHalfUsage - firstHalfUsage) / firstHalfUsage;

    const costTrend = costChange > 0.1 ? 'increasing' : costChange < -0.1 ? 'decreasing' : 'stable';
    const usageTrend = usageChange > 0.1 ? 'increasing' : usageChange < -0.1 ? 'decreasing' : 'stable';

    // Efficiency = cost per request
    const firstHalfEfficiency = firstHalfCost / firstHalfUsage;
    const secondHalfEfficiency = secondHalfCost / secondHalfUsage;
    const efficiencyChange = (secondHalfEfficiency - firstHalfEfficiency) / firstHalfEfficiency;

    const efficiencyTrend = efficiencyChange < -0.1 ? 'improving' : efficiencyChange > 0.1 ? 'declining' : 'stable';

    return { costTrend, usageTrend, efficiencyTrend };
  }

  private identifyBottlenecks(records: any[]): PerformanceAnalysis['bottlenecks'] {
    const bottlenecks = [];

    // High latency bottleneck
    const avgLatency = records.reduce((sum, r) => sum + r.latency, 0) / records.length;
    if (avgLatency > 2000) {
      bottlenecks.push({
        type: 'latency' as const,
        severity: avgLatency > 5000 ? 'high' as const : 'medium' as const,
        description: `Average latency is ${Math.round(avgLatency)}ms`,
        recommendation: 'Consider using faster models or enabling caching',
      });
    }

    // High error rate bottleneck
    const errorRate = records.filter(r => !r.successful).length / records.length;
    if (errorRate > 0.05) {
      bottlenecks.push({
        type: 'errors' as const,
        severity: errorRate > 0.15 ? 'high' as const : 'medium' as const,
        description: `Error rate is ${Math.round(errorRate * 100)}%`,
        recommendation: 'Review API keys and provider configurations',
      });
    }

    // Rate limiting bottleneck
    const rateLimitErrors = records.filter(r => r.errorCode === 'RATE_LIMIT_ERROR').length;
    if (rateLimitErrors > records.length * 0.1) {
      bottlenecks.push({
        type: 'rate_limits' as const,
        severity: 'medium' as const,
        description: `${rateLimitErrors} requests hit rate limits`,
        recommendation: 'Implement better request throttling or upgrade API plans',
      });
    }

    return bottlenecks;
  }

  private calculateAverageSessionLength(records: any[]): number {
    // Simplified session calculation - group by time windows
    const sessionWindows = [];
    let currentSession = [];
    const SESSION_GAP_MS = 30 * 60 * 1000; // 30 minutes

    const sortedRecords = records.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    for (const record of sortedRecords) {
      if (currentSession.length === 0) {
        currentSession.push(record);
      } else {
        const lastRecord = currentSession[currentSession.length - 1];
        const gap = new Date(record.createdAt).getTime() - new Date(lastRecord.createdAt).getTime();
        
        if (gap <= SESSION_GAP_MS) {
          currentSession.push(record);
        } else {
          if (currentSession.length > 1) {
            sessionWindows.push(currentSession);
          }
          currentSession = [record];
        }
      }
    }

    if (currentSession.length > 1) {
      sessionWindows.push(currentSession);
    }

    if (sessionWindows.length === 0) return 0;

    const totalSessionTime = sessionWindows.reduce((sum, session) => {
      const start = new Date(session[0].createdAt).getTime();
      const end = new Date(session[session.length - 1].createdAt).getTime();
      return sum + (end - start);
    }, 0);

    return totalSessionTime / sessionWindows.length / (1000 * 60); // Return in minutes
  }

  private groupRecordsByDay(records: any[]): number[] {
    const dailyUsage = new Map<string, number>();
    
    records.forEach(record => {
      const dayKey = record.createdAt.toISOString().split('T')[0];
      dailyUsage.set(dayKey, (dailyUsage.get(dayKey) || 0) + 1);
    });

    return Array.from(dailyUsage.values());
  }

  private groupCostsByDay(records: any[]): number[] {
    const dailyCosts = new Map<string, number>();
    
    records.forEach(record => {
      const dayKey = record.createdAt.toISOString().split('T')[0];
      dailyCosts.set(dayKey, (dailyCosts.get(dayKey) || 0) + Number(record.cost));
    });

    return Array.from(dailyCosts.values());
  }

  private calculateLinearTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + val * index, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6; // 0² + 1² + 2² + ... + (n-1)²

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private generateRecommendations(
    records: any[],
    usageTrend: number,
    costTrend: number
  ): PredictiveInsights['recommendations'] {
    const recommendations = [];

    if (costTrend > 0.1) {
      recommendations.push({
        type: 'cost_optimization' as const,
        priority: 'high' as const,
        description: 'Costs are increasing rapidly',
        expectedImpact: 'Reduce monthly costs by up to 30%',
      });
    }

    if (usageTrend > 0.2) {
      recommendations.push({
        type: 'capacity' as const,
        priority: 'medium' as const,
        description: 'Usage is growing quickly',
        expectedImpact: 'Prepare for 2x usage growth',
      });
    }

    const avgLatency = records.reduce((sum, r) => sum + r.latency, 0) / records.length;
    if (avgLatency > 2000) {
      recommendations.push({
        type: 'performance' as const,
        priority: 'medium' as const,
        description: 'Latency is above target',
        expectedImpact: 'Improve response time by 40%',
      });
    }

    return recommendations;
  }

  private generatePerformanceAlerts(weekUsage: UsageMetrics): Array<{
    type: string;
    severity: string;
    message: string;
  }> {
    const alerts = [];

    if (weekUsage.averageLatency > 3000) {
      alerts.push({
        type: 'latency',
        severity: 'warning',
        message: `Average latency is ${Math.round(weekUsage.averageLatency)}ms (target: <2000ms)`,
      });
    }

    if (weekUsage.successRate < 0.95) {
      alerts.push({
        type: 'reliability',
        severity: 'error',
        message: `Success rate is ${Math.round(weekUsage.successRate * 100)}% (target: >95%)`,
      });
    }

    if (weekUsage.averageCost > 0.01) {
      alerts.push({
        type: 'cost',
        severity: 'info',
        message: `Average cost per request is high: $${weekUsage.averageCost.toFixed(4)}`,
      });
    }

    return alerts;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.metricsCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.metricsCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}