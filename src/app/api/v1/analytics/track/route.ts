/**
 * SDK Protection Phase 3B - Analytics Tracking API
 * 
 * POST /api/v1/analytics/track - Track ML routing actual performance
 * 
 * This endpoint allows SDK applications to report actual performance
 * data back to the ML system for continuous learning and improvement.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ApiProvider } from '@prisma/client';
import { getSdkAuthMiddleware, getSdkUsageTracker } from '@/lib/sdk/auth';
import { ProtectedMLRoutingService, MLRoutingAnalytics } from '@/lib/sdk/ml-routing';
import { z } from 'zod';

const prisma = new PrismaClient();

// Analytics tracking validation schema
const AnalyticsTrackRequestSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  actualProvider: z.enum(['OPENAI', 'ANTHROPIC', 'GOOGLE']),
  actualModel: z.string().min(1, 'Model name is required'),
  actualCost: z.number().min(0, 'Cost must be non-negative'),
  actualLatency: z.number().int().min(0, 'Latency must be non-negative integer'),
  actualQuality: z.number().min(0).max(1).optional(),
  userSatisfaction: z.number().int().min(1).max(5).optional(),
  success: z.boolean(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  metadata: z.object({
    userAgent: z.string().optional(),
    appVersion: z.string().optional(),
    requestContext: z.string().optional(),
  }).optional(),
});

/**
 * POST /api/v1/analytics/track - Track actual ML routing performance
 */
export async function POST(request: NextRequest) {
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
          message: 'Analytics tracking is not available in your tier. Upgrade to Developer tier to access this feature.',
          tier: authContext.app.tier,
          upgradeUrl: '/pricing',
        },
        { status: 403 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validation = AnalyticsTrackRequestSchema.safeParse(body);
    
    if (!validation.success) {
      // Track failed analytics request
      const usageTracker = getSdkUsageTracker();
      await usageTracker.trackUsage(authContext.app.id, 'analytics', {
        successful: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: 'Analytics data validation failed',
        responseTime: Date.now() - startTime,
      });
      
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid analytics data format',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }
    
    const analyticsData: MLRoutingAnalytics = {
      ...validation.data,
      actualProvider: validation.data.actualProvider as ApiProvider,
    };
    
    // Verify the request ID belongs to this app
    const mlRoutingLog = await prisma.mlRoutingLog.findFirst({
      where: {
        requestId: analyticsData.requestId,
        appId: authContext.app.id,
      },
    });
    
    if (!mlRoutingLog) {
      return NextResponse.json(
        {
          error: 'Invalid Request ID',
          message: 'Request ID not found or does not belong to this app',
        },
        { status: 404 }
      );
    }
    
    // Check if analytics data has already been submitted for this request
    if (mlRoutingLog.actualCost !== null || mlRoutingLog.actualLatency !== null) {
      return NextResponse.json(
        {
          error: 'Already Tracked',
          message: 'Analytics data has already been submitted for this request',
          requestId: analyticsData.requestId,
        },
        { status: 409 }
      );
    }
    
    // Record actual performance data
    const mlService = new ProtectedMLRoutingService(prisma);
    await mlService.recordActualPerformance(analyticsData, authContext);
    
    // Track successful analytics submission
    const usageTracker = getSdkUsageTracker();
    await usageTracker.trackUsage(authContext.app.id, 'analytics', {
      cost: 0, // Analytics tracking is free
      responseTime: Date.now() - startTime,
      successful: true,
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });
    
    // Calculate prediction accuracy for feedback
    const predictionAccuracy = this.calculatePredictionAccuracy(
      mlRoutingLog,
      analyticsData
    );
    
    return NextResponse.json({
      success: true,
      message: 'Analytics data recorded successfully',
      data: {
        requestId: analyticsData.requestId,
        recorded: true,
        predictionAccuracy,
        contributoToLearning: true,
      },
      meta: {
        tier: authContext.app.tier,
        remainingRequests: authContext.remainingRequests,
        processingTime: Date.now() - startTime,
      },
    });
    
  } catch (error) {
    console.error('Analytics tracking API error:', error);
    
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
        console.error('Error tracking failed analytics request:', trackingError);
      }
    }
    
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Analytics tracking service temporarily unavailable',
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate prediction accuracy for feedback
 */
function calculatePredictionAccuracy(
  mlRoutingLog: any,
  analyticsData: MLRoutingAnalytics
): {
  costAccuracy: number;
  latencyAccuracy: number;
  providerMatch: boolean;
  modelMatch: boolean;
  overallScore: number;
} {
  const routingDecision = mlRoutingLog.routingDecision as any;
  
  // Calculate cost accuracy (percentage)
  const costAccuracy = routingDecision.estimatedCost > 0 
    ? Math.max(0, 100 - Math.abs(
        (analyticsData.actualCost - routingDecision.estimatedCost) / 
        routingDecision.estimatedCost * 100
      ))
    : 100;
  
  // Calculate latency accuracy (percentage)
  const latencyAccuracy = routingDecision.estimatedLatency > 0
    ? Math.max(0, 100 - Math.abs(
        (analyticsData.actualLatency - routingDecision.estimatedLatency) / 
        routingDecision.estimatedLatency * 100
      ))
    : 100;
  
  // Check provider and model matches
  const providerMatch = analyticsData.actualProvider === routingDecision.provider;
  const modelMatch = analyticsData.actualModel === routingDecision.model;
  
  // Calculate overall accuracy score
  const overallScore = (
    (costAccuracy * 0.3) +
    (latencyAccuracy * 0.3) +
    (providerMatch ? 20 : 0) +
    (modelMatch ? 20 : 0)
  );
  
  return {
    costAccuracy: Math.round(costAccuracy * 100) / 100,
    latencyAccuracy: Math.round(latencyAccuracy * 100) / 100,
    providerMatch,
    modelMatch,
    overallScore: Math.round(overallScore * 100) / 100,
  };
}

// Method not allowed for other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';