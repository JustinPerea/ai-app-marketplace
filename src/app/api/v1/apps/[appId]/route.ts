/**
 * SDK Protection Phase 3 - App Management API
 * 
 * GET /api/v1/apps/[appId] - Get SDK app details
 * PUT /api/v1/apps/[appId] - Update SDK app
 * DELETE /api/v1/apps/[appId] - Delete/deactivate SDK app
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, SdkAppStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

const prisma = new PrismaClient();

// Update schema
const UpdateAppSchema = z.object({
  name: z.string()
    .min(1, 'App name is required')
    .max(100, 'App name must be less than 100 characters')
    .optional(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    .optional(),
});

/**
 * GET /api/v1/apps/[appId] - Get SDK app details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { appId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find SDK app
    const sdkApp = await prisma.sdkApp.findFirst({
      where: {
        id: params.appId,
        userId: user.id, // Ensure user owns the app
      },
      include: {
        usageRecords: {
          orderBy: { billingPeriod: 'desc' },
          take: 6, // Last 6 months
        },
        analyticsRecords: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    });

    if (!sdkApp) {
      return NextResponse.json(
        { error: 'SDK app not found' },
        { status: 404 }
      );
    }

    // Calculate usage statistics
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const currentUsage = sdkApp.usageRecords.find(
      record => record.billingPeriod.getTime() === currentMonth.getTime()
    );

    const analytics = {
      totalRequests: sdkApp.analyticsRecords.length,
      successfulRequests: sdkApp.analyticsRecords.filter(r => r.successful).length,
      failedRequests: sdkApp.analyticsRecords.filter(r => !r.successful).length,
      avgResponseTime: sdkApp.analyticsRecords.reduce((sum, r) => 
        sum + (r.responseTime || 0), 0) / Math.max(1, sdkApp.analyticsRecords.length),
      totalCost: sdkApp.analyticsRecords.reduce((sum, r) => 
        sum + Number(r.cost || 0), 0),
    };

    return NextResponse.json({
      success: true,
      app: {
        id: sdkApp.id,
        name: sdkApp.name,
        description: sdkApp.description,
        appId: sdkApp.appId,
        tier: sdkApp.tier,
        status: sdkApp.status,
        features: sdkApp.features,
        limits: {
          requestsPerMonth: sdkApp.requestsPerMonth,
          requestsPerMinute: sdkApp.requestsPerMinute,
        },
        usage: {
          currentPeriodStart: sdkApp.currentPeriodStart,
          currentPeriodEnd: sdkApp.currentPeriodEnd,
          requestsThisPeriod: sdkApp.requestsThisPeriod,
          currentMonthUsage: currentUsage || {
            requestsCount: 0,
            mlRoutingCount: 0,
            analyticsRequests: 0,
            totalCost: 0,
          },
        },
        analytics,
        lastUsed: sdkApp.lastUsed,
        userAgent: sdkApp.userAgent,
        createdAt: sdkApp.createdAt,
        updatedAt: sdkApp.updatedAt,
      },
      usageHistory: sdkApp.usageRecords.map(record => ({
        period: record.billingPeriod,
        requestsCount: record.requestsCount,
        mlRoutingCount: record.mlRoutingCount,
        analyticsRequests: record.analyticsRequests,
        totalCost: record.totalCost,
        successfulRequests: record.successfulRequests,
        failedRequests: record.failedRequests,
      })),
    });

  } catch (error) {
    console.error('Error fetching SDK app:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/apps/[appId] - Update SDK app
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { appId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validation = UpdateAppSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    // Update SDK app
    const updatedApp = await prisma.sdkApp.updateMany({
      where: {
        id: params.appId,
        userId: user.id, // Ensure user owns the app
      },
      data: {
        ...validation.data,
        updatedAt: new Date(),
      },
    });

    if (updatedApp.count === 0) {
      return NextResponse.json(
        { error: 'SDK app not found or not authorized' },
        { status: 404 }
      );
    }

    // Fetch updated app
    const sdkApp = await prisma.sdkApp.findUnique({
      where: { id: params.appId },
    });

    return NextResponse.json({
      success: true,
      app: {
        id: sdkApp!.id,
        name: sdkApp!.name,
        description: sdkApp!.description,
        appId: sdkApp!.appId,
        tier: sdkApp!.tier,
        status: sdkApp!.status,
        features: sdkApp!.features,
        updatedAt: sdkApp!.updatedAt,
      },
    });

  } catch (error) {
    console.error('Error updating SDK app:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/apps/[appId] - Deactivate SDK app
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { appId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Deactivate SDK app (don't actually delete to preserve usage history)
    const updatedApp = await prisma.sdkApp.updateMany({
      where: {
        id: params.appId,
        userId: user.id, // Ensure user owns the app
      },
      data: {
        status: SdkAppStatus.INACTIVE,
        updatedAt: new Date(),
      },
    });

    if (updatedApp.count === 0) {
      return NextResponse.json(
        { error: 'SDK app not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SDK app deactivated successfully',
    });

  } catch (error) {
    console.error('Error deactivating SDK app:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';