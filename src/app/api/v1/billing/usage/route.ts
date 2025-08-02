/**
 * SDK Protection Phase 3C - Billing Usage API
 * 
 * GET /api/v1/billing/usage - Get detailed usage and billing information
 * 
 * This endpoint provides comprehensive billing and usage data for SDK applications,
 * including current period usage, historical billing, and cost breakdowns.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSdkAuthMiddleware, TIER_LIMITS } from '@/lib/sdk/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

// Query parameters validation
const BillingUsageQuerySchema = z.object({
  period: z.enum(['current', '3months', '6months', '12months']).optional().default('current'),
  includeProjections: z.string().transform(val => val === 'true').optional().default(true),
  includeBreakdown: z.string().transform(val => val === 'true').optional().default(true),
});

/**
 * GET /api/v1/billing/usage - Get billing usage information
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
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryValidation = BillingUsageQuerySchema.safeParse({
      period: searchParams.get('period'),
      includeProjections: searchParams.get('includeProjections'),
      includeBreakdown: searchParams.get('includeBreakdown'),
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
    
    const { period, includeProjections, includeBreakdown } = queryValidation.data;
    
    // Get tier configuration
    const tierConfig = TIER_LIMITS[authContext.app.tier];
    
    // Get current period usage
    const currentPeriodUsage = await this.getCurrentPeriodUsage(authContext.app.id);
    
    // Get historical usage based on period
    const historicalUsage = await this.getHistoricalUsage(authContext.app.id, period);
    
    // Prepare billing response
    const billing = {
      app: {
        id: authContext.app.id,
        name: authContext.app.name,
        tier: authContext.app.tier,
        status: authContext.app.status,
      },
      
      currentPeriod: {
        start: authContext.app.currentPeriodStart,
        end: authContext.app.currentPeriodEnd,
        usage: currentPeriodUsage,
        limits: {
          requestsPerMonth: authContext.app.requestsPerMonth,
          requestsPerMinute: authContext.app.requestsPerMinute,
        },
        utilization: {
          requests: authContext.app.requestsPerMonth > 0 
            ? Math.round((currentPeriodUsage.requestsCount / authContext.app.requestsPerMonth) * 100)
            : 0,
          cost: tierConfig.price !== 'custom' && typeof tierConfig.price === 'number'
            ? Math.round((currentPeriodUsage.totalCost / (tierConfig.price * 0.1)) * 100) // Assume 10% of tier price is usage allowance
            : 0,
        },
      },
      
      tierInfo: {
        current: authContext.app.tier,
        price: tierConfig.price,
        limits: {
          requestsPerMonth: tierConfig.requestsPerMonth,
          requestsPerMinute: tierConfig.requestsPerMinute,
        },
        features: tierConfig.features,
      },
      
      historical: historicalUsage,
    };
    
    // Add usage breakdown if requested
    if (includeBreakdown) {
      billing.breakdown = await this.getUsageBreakdown(authContext.app.id);
    }
    
    // Add projections if requested
    if (includeProjections) {
      billing.projections = await this.generateUsageProjections(authContext.app.id, currentPeriodUsage);
    }
    
    // Add upgrade recommendations if applicable
    if (billing.currentPeriod.utilization.requests > 80) {
      billing.recommendations = this.generateUpgradeRecommendations(authContext.app.tier, billing);
    }
    
    return NextResponse.json({
      success: true,
      data: billing,
      meta: {
        tier: authContext.app.tier,
        generatedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        currency: 'USD',
      },
    });
    
  } catch (error) {
    console.error('Billing usage API error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Billing service temporarily unavailable',
      },
      { status: 500 }
    );
  }
}

/**
 * Get current billing period usage
 */
async function getCurrentPeriodUsage(appId: string) {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const usage = await prisma.sdkUsage.findFirst({
    where: {
      appId,
      billingPeriod: currentMonth,
    },
  });
  
  return usage || {
    requestsCount: 0,
    mlRoutingCount: 0,
    analyticsRequests: 0,
    totalCost: 0,
    successfulRequests: 0,
    failedRequests: 0,
    avgResponseTime: 0,
  };
}

/**
 * Get historical usage data
 */
async function getHistoricalUsage(appId: string, period: string) {
  let monthsBack = 1;
  
  switch (period) {
    case '3months':
      monthsBack = 3;
      break;
    case '6months':
      monthsBack = 6;
      break;
    case '12months':
      monthsBack = 12;
      break;
    default:
      monthsBack = 1;
  }
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);
  
  const historicalUsage = await prisma.sdkUsage.findMany({
    where: {
      appId,
      billingPeriod: {
        gte: startDate,
      },
    },
    orderBy: {
      billingPeriod: 'asc',
    },
  });
  
  return historicalUsage.map(usage => ({
    period: usage.billingPeriod,
    requestsCount: usage.requestsCount,
    mlRoutingCount: usage.mlRoutingCount,
    analyticsRequests: usage.analyticsRequests,
    totalCost: Number(usage.totalCost),
    successfulRequests: usage.successfulRequests,
    failedRequests: usage.failedRequests,
    avgResponseTime: usage.avgResponseTime,
    successRate: usage.requestsCount > 0 
      ? Math.round((usage.successfulRequests / usage.requestsCount) * 100)
      : 100,
  }));
}

/**
 * Get detailed usage breakdown
 */
async function getUsageBreakdown(appId: string) {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Get analytics breakdown by event type
  const analyticsBreakdown = await prisma.sdkAnalytics.groupBy({
    by: ['eventType'],
    where: {
      appId,
      createdAt: {
        gte: currentMonth,
      },
    },
    _count: {
      id: true,
    },
    _sum: {
      cost: true,
      responseTime: true,
    },
    _avg: {
      responseTime: true,
    },
  });
  
  // Get ML routing breakdown by provider
  const mlRoutingBreakdown = await prisma.mlRoutingLog.groupBy({
    by: ['actualProvider'],
    where: {
      appId,
      createdAt: {
        gte: currentMonth,
      },
      actualProvider: {
        not: null,
      },
    },
    _count: {
      id: true,
    },
    _sum: {
      actualCost: true,
      actualLatency: true,
    },
    _avg: {
      actualLatency: true,
      confidence: true,
    },
  });
  
  // Daily usage pattern
  const dailyUsage = await prisma.sdkAnalytics.groupBy({
    by: ['createdAt'],
    where: {
      appId,
      createdAt: {
        gte: currentMonth,
      },
    },
    _count: {
      id: true,
    },
    _sum: {
      cost: true,
    },
  });
  
  // Process daily usage into date buckets
  const dailyUsageMap = new Map<string, { requests: number; cost: number }>();
  
  dailyUsage.forEach(day => {
    const dateKey = new Date(day.createdAt).toISOString().split('T')[0];
    const existing = dailyUsageMap.get(dateKey) || { requests: 0, cost: 0 };
    existing.requests += day._count.id;
    existing.cost += Number(day._sum.cost) || 0;
    dailyUsageMap.set(dateKey, existing);
  });
  
  const dailyUsageArray = Array.from(dailyUsageMap.entries())
    .map(([date, data]) => ({
      date,
      requests: data.requests,
      cost: Math.round(data.cost * 10000) / 10000,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    byEventType: analyticsBreakdown.map(item => ({
      eventType: item.eventType,
      count: item._count.id,
      totalCost: Math.round((Number(item._sum.cost) || 0) * 10000) / 10000,
      avgResponseTime: Math.round(item._avg.responseTime || 0),
    })),
    
    byProvider: mlRoutingBreakdown.map(item => ({
      provider: item.actualProvider,
      count: item._count.id,
      totalCost: Math.round((Number(item._sum.actualCost) || 0) * 10000) / 10000,
      avgLatency: Math.round(item._avg.actualLatency || 0),
      avgConfidence: Math.round((item._avg.confidence || 0) * 100) / 100,
    })),
    
    dailyUsage: dailyUsageArray,
  };
}

/**
 * Generate usage projections
 */
async function generateUsageProjections(appId: string, currentUsage: any) {
  const now = new Date();
  const daysIntoMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  if (daysIntoMonth < 3) {
    return {
      endOfMonth: {
        projectedRequests: 'Insufficient data',
        projectedCost: 'Insufficient data',
        confidence: 0,
      },
      warning: 'Projections require at least 3 days of usage data',
    };
  }
  
  // Simple linear projection based on current usage
  const dailyAvgRequests = currentUsage.requestsCount / daysIntoMonth;
  const dailyAvgCost = currentUsage.totalCost / daysIntoMonth;
  
  const remainingDays = daysInMonth - daysIntoMonth;
  const projectedRequests = Math.round(currentUsage.requestsCount + (dailyAvgRequests * remainingDays));
  const projectedCost = Math.round((currentUsage.totalCost + (dailyAvgCost * remainingDays)) * 10000) / 10000;
  
  // Calculate confidence based on usage consistency
  const confidence = Math.min(100, Math.round((daysIntoMonth / daysInMonth) * 100));
  
  return {
    endOfMonth: {
      projectedRequests,
      projectedCost,
      confidence,
    },
    methodology: 'Linear projection based on current period usage',
    dataPoints: daysIntoMonth,
  };
}

/**
 * Generate upgrade recommendations
 */
function generateUpgradeRecommendations(currentTier: string, billing: any) {
  const recommendations = [];
  
  const tierOrder = ['COMMUNITY', 'DEVELOPER', 'PROFESSIONAL', 'ENTERPRISE'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex < tierOrder.length - 1) {
    const nextTier = tierOrder[currentIndex + 1];
    const nextTierConfig = TIER_LIMITS[nextTier as keyof typeof TIER_LIMITS];
    
    recommendations.push({
      tier: nextTier,
      price: nextTierConfig.price,
      benefits: [
        `${nextTierConfig.requestsPerMonth === -1 ? 'Unlimited' : nextTierConfig.requestsPerMonth.toLocaleString()} requests per month`,
        `${nextTierConfig.requestsPerMinute} requests per minute`,
        'Additional features: ' + Object.entries(nextTierConfig.features)
          .filter(([, enabled]) => enabled)
          .map(([feature]) => feature)
          .join(', '),
      ],
      estimatedSavings: billing.projections?.endOfMonth?.projectedCost > (nextTierConfig.price as number)
        ? `Potential savings with included usage allowance`
        : null,
    });
  }
  
  return recommendations;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';