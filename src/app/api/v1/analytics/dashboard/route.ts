/**
 * SDK Protection Phase 3C - Analytics Dashboard API
 * 
 * GET /api/v1/analytics/dashboard - Get SDK app analytics and insights
 * 
 * This endpoint provides comprehensive analytics and insights for SDK applications,
 * including usage patterns, cost optimization opportunities, and ML routing performance.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ApiProvider } from '@prisma/client';
import { getSdkAuthMiddleware, getSdkUsageTracker } from '@/lib/sdk/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

// Query parameters validation
const DashboardQuerySchema = z.object({
  period: z.enum(['24h', '7d', '30d', '90d']).optional().default('30d'),
  includeInsights: z.string().transform(val => val === 'true').optional().default(true),
  includeRecommendations: z.string().transform(val => val === 'true').optional().default(true),
});

/**
 * GET /api/v1/analytics/dashboard - Get comprehensive analytics dashboard
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let authContext: any;
  
  try {
    // Authenticate SDK request
    const authMiddleware = getSdkAuthMiddleware();
    const authResult = await authMiddleware.authenticateRequest(request);
    
    if (!authResult.success) {
      return authMiddleware.createErrorResponse(
        authResult.error || 'Authentication failed',
        authResult.status || 401
      );
    }
    
    authContext = authResult.context!;
    
    // Check if app has analytics feature access
    if (!authMiddleware.checkFeatureAccess(authContext, 'analytics')) {
      return NextResponse.json(
        {
          error: 'Feature Not Available',
          message: 'Analytics dashboard is not available in your tier. Upgrade to Developer tier to access this feature.',
          tier: authContext.app.tier,
          upgradeUrl: '/pricing',
        },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryValidation = DashboardQuerySchema.safeParse({
      period: searchParams.get('period'),
      includeInsights: searchParams.get('includeInsights'),
      includeRecommendations: searchParams.get('includeRecommendations'),
    });
    
    if (!queryValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid Query Parameters',
          details: queryValidation.error.issues,
        },
        { status: 400 }
      );
    }
    
    const { period, includeInsights, includeRecommendations } = queryValidation.data;
    
    // Calculate time range
    const timeRanges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
    };
    
    const startDate = new Date(Date.now() - timeRanges[period]);
    
    // Fetch analytics data
    const [usageStats, mlRoutingStats, errorStats, providerDistribution] = await Promise.all([
      this.getUsageStats(authContext.app.id, startDate),
      this.getMLRoutingStats(authContext.app.id, startDate),
      this.getErrorStats(authContext.app.id, startDate),
      this.getProviderDistribution(authContext.app.id, startDate),
    ]);
    
    // Prepare dashboard response
    const dashboard = {
      overview: {
        period,
        totalRequests: usageStats.totalRequests,
        successfulRequests: usageStats.successfulRequests,
        failedRequests: usageStats.failedRequests,
        successRate: usageStats.totalRequests > 0 
          ? Math.round((usageStats.successfulRequests / usageStats.totalRequests) * 100)
          : 100,
        totalCost: usageStats.totalCost,
        avgResponseTime: usageStats.avgResponseTime,
        mlRoutingRequests: mlRoutingStats.totalRequests,
        mlRoutingSavings: mlRoutingStats.estimatedSavings,
      },
      
      usage: {
        requestsOverTime: usageStats.requestsOverTime,
        costOverTime: usageStats.costOverTime,
        responseTimeOverTime: usageStats.responseTimeOverTime,
      },
      
      mlRouting: {
        totalDecisions: mlRoutingStats.totalRequests,
        avgConfidence: mlRoutingStats.avgConfidence,
        providerDistribution,
        topOptimizations: mlRoutingStats.topOptimizations,
        predictionAccuracy: mlRoutingStats.predictionAccuracy,
      },
      
      errors: {
        totalErrors: errorStats.totalErrors,
        errorRate: usageStats.totalRequests > 0 
          ? Math.round((errorStats.totalErrors / usageStats.totalRequests) * 100)
          : 0,
        topErrorCodes: errorStats.topErrorCodes,
        errorsByProvider: errorStats.errorsByProvider,
      },
      
      billing: {
        currentPeriodUsage: {
          requests: authContext.app.requestsThisPeriod,
          limit: authContext.app.requestsPerMonth,
          percentage: authContext.app.requestsPerMonth > 0 
            ? Math.round((authContext.app.requestsThisPeriod / authContext.app.requestsPerMonth) * 100)
            : 0,
        },
        estimatedMonthlyCost: usageStats.estimatedMonthlyCost,
        tier: authContext.app.tier,
      },
    };
    
    // Add insights if requested
    if (includeInsights) {
      dashboard.insights = await this.generateInsights(authContext.app.id, dashboard, startDate);
    }
    
    // Add recommendations if requested
    if (includeRecommendations) {
      dashboard.recommendations = await this.generateRecommendations(authContext.app.id, dashboard);
    }
    
    // Track analytics dashboard access
    const usageTracker = getSdkUsageTracker();
    await usageTracker.trackUsage(authContext.app.id, 'analytics', {
      cost: 0, // Dashboard access is free
      responseTime: Date.now() - startTime,
      successful: true,
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });
    
    return NextResponse.json({
      success: true,
      data: dashboard,
      meta: {
        tier: authContext.app.tier,
        generatedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        dataFreshness: 'real-time',
      },
    });
    
  } catch (error) {
    console.error('Analytics dashboard API error:', error);
    
    // Track failed request if we have auth context
    if (authContext) {
      try {
        const usageTracker = getSdkUsageTracker();
        await usageTracker.trackUsage(authContext.app.id, 'analytics', {
          successful: false,
          errorCode: 'INTERNAL_ERROR',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          responseTime: Date.now() - startTime,
        });
      } catch (trackingError) {
        console.error('Error tracking failed dashboard request:', trackingError);
      }
    }
    
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Analytics dashboard temporarily unavailable',
      },
      { status: 500 }
    );
  }
}

/**
 * Get usage statistics for the specified period
 */
async function getUsageStats(appId: string, startDate: Date) {
  const analytics = await prisma.sdkAnalytics.findMany({
    where: {
      appId,
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'asc' },
  });
  
  const totalRequests = analytics.length;
  const successfulRequests = analytics.filter(a => a.successful).length;
  const failedRequests = totalRequests - successfulRequests;
  const totalCost = analytics.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
  const avgResponseTime = analytics.length > 0 
    ? analytics.reduce((sum, a) => sum + (a.responseTime || 0), 0) / analytics.length
    : 0;
  
  // Group by day for time series
  const dailyStats = new Map<string, { requests: number; cost: number; responseTime: number; count: number }>();
  
  analytics.forEach(a => {
    const day = a.createdAt.toISOString().split('T')[0];
    const existing = dailyStats.get(day) || { requests: 0, cost: 0, responseTime: 0, count: 0 };
    existing.requests += 1;
    existing.cost += Number(a.cost) || 0;
    existing.responseTime += a.responseTime || 0;
    existing.count += 1;
    dailyStats.set(day, existing);
  });
  
  const requestsOverTime = Array.from(dailyStats.entries()).map(([date, stats]) => ({
    date,
    requests: stats.requests,
  }));
  
  const costOverTime = Array.from(dailyStats.entries()).map(([date, stats]) => ({
    date,
    cost: Math.round(stats.cost * 10000) / 10000,
  }));
  
  const responseTimeOverTime = Array.from(dailyStats.entries()).map(([date, stats]) => ({
    date,
    avgResponseTime: stats.count > 0 ? Math.round(stats.responseTime / stats.count) : 0,
  }));
  
  // Estimate monthly cost based on current usage
  const daysInPeriod = (Date.now() - startDate.getTime()) / (24 * 60 * 60 * 1000);
  const estimatedMonthlyCost = daysInPeriod > 0 ? (totalCost / daysInPeriod) * 30 : 0;
  
  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    totalCost: Math.round(totalCost * 10000) / 10000,
    avgResponseTime: Math.round(avgResponseTime),
    requestsOverTime,
    costOverTime,
    responseTimeOverTime,
    estimatedMonthlyCost: Math.round(estimatedMonthlyCost * 100) / 100,
  };
}

/**
 * Get ML routing statistics
 */
async function getMLRoutingStats(appId: string, startDate: Date) {
  const mlLogs = await prisma.mlRoutingLog.findMany({
    where: {
      appId,
      createdAt: { gte: startDate },
    },
  });
  
  const totalRequests = mlLogs.length;
  const avgConfidence = mlLogs.length > 0 
    ? mlLogs.reduce((sum, log) => sum + (log.confidence || 0), 0) / mlLogs.length
    : 0;
  
  // Calculate optimization types
  const optimizationCounts = new Map<string, number>();
  mlLogs.forEach(log => {
    const decision = log.routingDecision as any;
    const optimization = decision?.optimizationType || 'balanced';
    optimizationCounts.set(optimization, (optimizationCounts.get(optimization) || 0) + 1);
  });
  
  const topOptimizations = Array.from(optimizationCounts.entries())
    .map(([type, count]) => ({ type, count, percentage: Math.round((count / totalRequests) * 100) }))
    .sort((a, b) => b.count - a.count);
  
  // Calculate prediction accuracy for completed requests
  const completedRequests = mlLogs.filter(log => log.actualCost !== null && log.actualLatency !== null);
  let predictionAccuracy = { cost: 0, latency: 0, provider: 0 };
  
  if (completedRequests.length > 0) {
    const costAccuracies = completedRequests.map(log => {
      const decision = log.routingDecision as any;
      const predicted = decision?.estimatedCost || 0;
      const actual = Number(log.actualCost) || 0;
      return predicted > 0 ? Math.max(0, 100 - Math.abs((actual - predicted) / predicted * 100)) : 100;
    });
    
    const latencyAccuracies = completedRequests.map(log => {
      const decision = log.routingDecision as any;
      const predicted = decision?.estimatedLatency || 0;
      const actual = log.actualLatency || 0;
      return predicted > 0 ? Math.max(0, 100 - Math.abs((actual - predicted) / predicted * 100)) : 100;
    });
    
    const providerMatches = completedRequests.filter(log => {
      const decision = log.routingDecision as any;
      return log.actualProvider === decision?.provider;
    }).length;
    
    predictionAccuracy = {
      cost: Math.round(costAccuracies.reduce((sum, acc) => sum + acc, 0) / costAccuracies.length),
      latency: Math.round(latencyAccuracies.reduce((sum, acc) => sum + acc, 0) / latencyAccuracies.length),
      provider: Math.round((providerMatches / completedRequests.length) * 100),
    };
  }
  
  // Estimate savings (simplified calculation)
  const estimatedSavings = completedRequests.reduce((savings, log) => {
    const decision = log.routingDecision as any;
    const alternatives = decision?.alternatives || [];
    if (alternatives.length > 0) {
      const maxAlternativeCost = Math.max(...alternatives.map((alt: any) => alt.estimatedCost || 0));
      const actualCost = Number(log.actualCost) || 0;
      return savings + Math.max(0, maxAlternativeCost - actualCost);
    }
    return savings;
  }, 0);
  
  return {
    totalRequests,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    topOptimizations,
    predictionAccuracy,
    estimatedSavings: Math.round(estimatedSavings * 100) / 100,
  };
}

/**
 * Get error statistics
 */
async function getErrorStats(appId: string, startDate: Date) {
  const errors = await prisma.sdkAnalytics.findMany({
    where: {
      appId,
      createdAt: { gte: startDate },
      successful: false,
    },
  });
  
  const totalErrors = errors.length;
  
  // Count error codes
  const errorCodeCounts = new Map<string, number>();
  errors.forEach(error => {
    const code = error.errorCode || 'UNKNOWN';
    errorCodeCounts.set(code, (errorCodeCounts.get(code) || 0) + 1);
  });
  
  const topErrorCodes = Array.from(errorCodeCounts.entries())
    .map(([code, count]) => ({ code, count, percentage: Math.round((count / totalErrors) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Errors by provider (from ML routing logs)
  const mlErrors = await prisma.mlRoutingLog.findMany({
    where: {
      appId,
      createdAt: { gte: startDate },
      success: false,
    },
  });
  
  const providerErrorCounts = new Map<string, number>();
  mlErrors.forEach(error => {
    const decision = error.routingDecision as any;
    const provider = decision?.provider || 'UNKNOWN';
    providerErrorCounts.set(provider, (providerErrorCounts.get(provider) || 0) + 1);
  });
  
  const errorsByProvider = Array.from(providerErrorCounts.entries())
    .map(([provider, count]) => ({ provider, count }));
  
  return {
    totalErrors,
    topErrorCodes,
    errorsByProvider,
  };
}

/**
 * Get provider distribution
 */
async function getProviderDistribution(appId: string, startDate: Date) {
  const mlLogs = await prisma.mlRoutingLog.findMany({
    where: {
      appId,
      createdAt: { gte: startDate },
      success: true,
    },
  });
  
  const providerCounts = new Map<string, number>();
  mlLogs.forEach(log => {
    const decision = log.routingDecision as any;
    const provider = decision?.provider || 'UNKNOWN';
    providerCounts.set(provider, (providerCounts.get(provider) || 0) + 1);
  });
  
  const totalDecisions = mlLogs.length;
  
  return Array.from(providerCounts.entries())
    .map(([provider, count]) => ({
      provider,
      count,
      percentage: totalDecisions > 0 ? Math.round((count / totalDecisions) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Generate insights based on usage patterns
 */
async function generateInsights(appId: string, dashboard: any, startDate: Date) {
  const insights = [];
  
  // Usage trend insight
  if (dashboard.usage.requestsOverTime.length >= 7) {
    const recent = dashboard.usage.requestsOverTime.slice(-3);
    const earlier = dashboard.usage.requestsOverTime.slice(-7, -3);
    
    const recentAvg = recent.reduce((sum, day) => sum + day.requests, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, day) => sum + day.requests, 0) / earlier.length;
    
    if (recentAvg > earlierAvg * 1.2) {
      insights.push({
        type: 'trend',
        severity: 'info',
        title: 'Usage Trending Up',
        description: `Your API usage has increased by ${Math.round(((recentAvg - earlierAvg) / earlierAvg) * 100)}% in recent days.`,
        recommendation: 'Consider monitoring your usage to avoid hitting rate limits.',
      });
    }
  }
  
  // Cost optimization insight
  if (dashboard.mlRouting.totalDecisions > 50 && dashboard.mlRouting.estimatedSavings < 5) {
    insights.push({
      type: 'cost',
      severity: 'warning',
      title: 'Limited Cost Savings',
      description: 'ML routing is not achieving significant cost savings for your usage patterns.',
      recommendation: 'Review your optimization preferences or consider adjusting request patterns.',
    });
  }
  
  // Error rate insight
  if (dashboard.errors.errorRate > 5) {
    insights.push({
      type: 'error',
      severity: 'warning',
      title: 'High Error Rate',
      description: `Your error rate is ${dashboard.errors.errorRate}%, which is above the recommended 5%.`,
      recommendation: 'Review error patterns and consider implementing better error handling.',
    });
  }
  
  // Prediction accuracy insight
  if (dashboard.mlRouting.predictionAccuracy.cost < 80) {
    insights.push({
      type: 'accuracy',
      severity: 'info',
      title: 'Prediction Accuracy Learning',
      description: 'ML predictions are still learning your patterns. Accuracy will improve over time.',
      recommendation: 'Continue providing feedback through analytics tracking for better predictions.',
    });
  }
  
  return insights;
}

/**
 * Generate recommendations for optimization
 */
async function generateRecommendations(appId: string, dashboard: any) {
  const recommendations = [];
  
  // Tier upgrade recommendation
  if (dashboard.billing.currentPeriodUsage.percentage > 80) {
    recommendations.push({
      type: 'upgrade',
      priority: 'high',
      title: 'Consider Tier Upgrade',
      description: `You've used ${dashboard.billing.currentPeriodUsage.percentage}% of your monthly quota.`,
      action: 'Upgrade to a higher tier to avoid service interruption.',
      estimatedSavings: null,
    });
  }
  
  // Provider optimization
  const dominantProvider = dashboard.mlRouting.providerDistribution[0];
  if (dominantProvider && dominantProvider.percentage > 70) {
    recommendations.push({
      type: 'diversification',
      priority: 'medium',
      title: 'Provider Diversification',
      description: `${dominantProvider.percentage}% of requests use ${dominantProvider.provider}.`,
      action: 'Consider enabling more providers for better cost optimization and resilience.',
      estimatedSavings: '10-25%',
    });
  }
  
  // Cost optimization for high usage
  if (dashboard.overview.totalCost > 50 && dashboard.mlRouting.estimatedSavings < dashboard.overview.totalCost * 0.1) {
    recommendations.push({
      type: 'optimization',
      priority: 'medium',
      title: 'Cost Optimization Opportunity',
      description: 'Your usage volume suggests potential for significant cost savings.',
      action: 'Experiment with different optimization strategies (cost vs quality vs speed).',
      estimatedSavings: '15-30%',
    });
  }
  
  return recommendations;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';