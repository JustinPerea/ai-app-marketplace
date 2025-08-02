/**
 * SDK Protection Phase 3B - Protected ML Routing API
 * 
 * POST /api/v1/ml/route - Get ML routing decision
 * 
 * This endpoint provides ML routing decisions to authenticated SDK applications
 * while keeping the core ML logic protected server-side.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSdkAuthMiddleware, getSdkUsageTracker } from '@/lib/sdk/auth';
import { ProtectedMLRoutingService, SanitizedMLRequest } from '@/lib/sdk/ml-routing';
import { z } from 'zod';

const prisma = new PrismaClient();

// Request validation schema
const MLRouteRequestSchema = z.object({
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
});

/**
 * POST /api/v1/ml/route - Get ML routing decision
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
    
    // Check if app has ML routing feature access
    if (!authMiddleware.checkFeatureAccess(authContext, 'mlRouting')) {
      return NextResponse.json(
        {
          error: 'Feature Not Available',
          message: 'ML routing is not available in your tier. Upgrade to Developer tier to access this feature.',
          tier: authContext.app.tier,
          upgradeUrl: '/pricing',
        },
        { status: 403 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validation = MLRouteRequestSchema.safeParse(body);
    
    if (!validation.success) {
      // Track failed request
      const usageTracker = getSdkUsageTracker();
      await usageTracker.trackUsage(authContext.app.id, 'ml_route', {
        successful: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: 'Request validation failed',
        responseTime: Date.now() - startTime,
      });
      
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid request format',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }
    
    const mlRequest: SanitizedMLRequest = {
      ...validation.data,
      metadata: {
        ...validation.data.metadata,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    };
    
    // Get ML routing decision
    const mlService = new ProtectedMLRoutingService(prisma);
    const routingResponse = await mlService.route(mlRequest, authContext);
    
    // Track successful usage
    const usageTracker = getSdkUsageTracker();
    await usageTracker.trackUsage(authContext.app.id, 'ml_route', {
      cost: routingResponse.estimatedCost,
      responseTime: Date.now() - startTime,
      successful: true,
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });
    
    // Return sanitized ML routing decision
    return NextResponse.json({
      success: true,
      data: routingResponse,
      meta: {
        tier: authContext.app.tier,
        remainingRequests: authContext.remainingRequests,
        rateLimitReset: authContext.rateLimitResetTime,
        processingTime: Date.now() - startTime,
      },
    });
    
  } catch (error) {
    console.error('ML routing API error:', error);
    
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
        console.error('Error tracking failed request:', trackingError);
      }
    }
    
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'ML routing service temporarily unavailable',
        requestId: `req_${Date.now()}`,
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

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';