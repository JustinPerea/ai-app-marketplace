/**
 * SDK Protection Phase 3B - Batch ML Routing API
 * 
 * POST /api/v1/ml/route/batch - Get batch ML routing decisions
 * 
 * This endpoint provides optimized batch ML routing for multiple requests
 * with load balancing and cost optimization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSdkAuthMiddleware, getSdkUsageTracker } from '@/lib/sdk/auth';
import { ProtectedMLRoutingService, BatchMLRequest } from '@/lib/sdk/ml-routing';
import { z } from 'zod';

const prisma = new PrismaClient();

// Batch request validation schema
const BatchMLRouteRequestSchema = z.object({
  requests: z.array(z.object({
    messages: z.array(z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string().min(1, 'Message content cannot be empty'),
    })).min(1, 'At least one message is required'),
    
    optimizeFor: z.enum(['cost', 'speed', 'quality', 'balanced']).optional().default('balanced'),
    
    constraints: z.object({
      maxCost: z.number().positive().optional(),
      minQuality: z.number().min(0).max(1).optional(),
      maxResponseTime: z.number().positive().optional(),
      preferredProviders: z.array(z.enum(['OPENAI', 'ANTHROPIC', 'GOOGLE'])).optional(),
      excludeProviders: z.array(z.enum(['OPENAI', 'ANTHROPIC', 'GOOGLE'])).optional(),
    }).optional(),
    
    metadata: z.object({
      userAgent: z.string().optional(),
      appVersion: z.string().optional(),
      requestContext: z.string().optional(),
    }).optional(),
  })).min(1, 'At least one request is required').max(50, 'Maximum 50 requests per batch'),
  
  batchOptimization: z.object({
    optimizeFor: z.enum(['cost', 'speed', 'quality', 'balanced']).optional(),
    loadBalance: z.boolean().optional().default(false),
    priorityOrder: z.array(z.number()).optional(),
  }).optional(),
});

/**
 * POST /api/v1/ml/route/batch - Get batch ML routing decisions
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
    
    // Check if app has batch routing feature access
    if (!authMiddleware.checkFeatureAccess(authContext, 'batchRouting')) {
      return NextResponse.json(
        {
          error: 'Feature Not Available',
          message: 'Batch ML routing is not available in your tier. Upgrade to Developer tier to access this feature.',
          tier: authContext.app.tier,
          upgradeUrl: '/pricing',
        },
        { status: 403 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validation = BatchMLRouteRequestSchema.safeParse(body);
    
    if (!validation.success) {
      // Track failed request
      const usageTracker = getSdkUsageTracker();
      await usageTracker.trackUsage(authContext.app.id, 'ml_route', {
        successful: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: 'Batch request validation failed',
        responseTime: Date.now() - startTime,
      });
      
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid batch request format',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }
    
    const batchRequest: BatchMLRequest = {
      ...validation.data,
      requests: validation.data.requests.map(req => ({
        ...req,
        metadata: {
          ...req.metadata,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      })),
    };
    
    // Check if batch size would exceed rate limits
    const batchSize = batchRequest.requests.length;
    if (authContext.remainingRequests < batchSize) {
      return NextResponse.json(
        {
          error: 'Rate Limit Exceeded',
          message: `Batch size (${batchSize}) exceeds remaining requests (${authContext.remainingRequests})`,
          remainingRequests: authContext.remainingRequests,
          rateLimitReset: authContext.rateLimitResetTime,
        },
        { status: 429 }
      );
    }
    
    // Process batch ML routing
    const mlService = new ProtectedMLRoutingService(prisma);
    const batchResponse = await mlService.batchRoute(batchRequest, authContext);
    
    // Track successful batch usage
    const usageTracker = getSdkUsageTracker();
    await usageTracker.trackUsage(authContext.app.id, 'ml_route', {
      cost: batchResponse.batchMetrics.totalEstimatedCost,
      responseTime: Date.now() - startTime,
      successful: true,
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });
    
    // Return batch routing response
    return NextResponse.json({
      success: true,
      data: batchResponse,
      meta: {
        tier: authContext.app.tier,
        remainingRequests: Math.max(0, authContext.remainingRequests - batchSize),
        rateLimitReset: authContext.rateLimitResetTime,
        processingTime: Date.now() - startTime,
        batchSize,
      },
    });
    
  } catch (error) {
    console.error('Batch ML routing API error:', error);
    
    // Track failed request if we have auth context
    if (authContext) {
      try {
        const usageTracker = getSdkUsageTracker();
        await usageTracker.trackUsage(authContext.app.id, 'ml_route', {
          successful: false,
          errorCode: 'INTERNAL_ERROR',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          responseTime: Date.now() - startTime,
        });
      } catch (trackingError) {
        console.error('Error tracking failed batch request:', trackingError);
      }
    }
    
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Batch ML routing service temporarily unavailable',
        batchId: `batch_${Date.now()}`,
      },
      { status: 500 }
    );
  }
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