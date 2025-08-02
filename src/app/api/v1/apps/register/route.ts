/**
 * SDK Protection Phase 3 - App Registration API
 * 
 * POST /api/v1/apps/register
 * Register a new SDK app and generate API credentials
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, SdkTier } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { SdkApiKeyManager, TIER_LIMITS } from '@/lib/sdk/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

// Request validation schema
const RegisterAppSchema = z.object({
  name: z.string()
    .min(1, 'App name is required')
    .max(100, 'App name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  tier: z.enum(['COMMUNITY', 'DEVELOPER', 'PROFESSIONAL', 'ENTERPRISE'])
    .optional()
    .default('COMMUNITY'),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = RegisterAppSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, description, tier } = validation.data;

    // Check if user already has apps (for free tier limits)
    if (tier === 'COMMUNITY') {
      const existingApps = await prisma.sdkApp.count({
        where: {
          userId: user.id,
          tier: SdkTier.COMMUNITY,
        },
      });

      // Limit community tier to 3 apps per user
      if (existingApps >= 3) {
        return NextResponse.json(
          {
            error: 'Free tier limit exceeded',
            message: 'Community tier is limited to 3 apps per user. Upgrade to Developer tier for unlimited apps.',
            upgradeUrl: '/pricing',
          },
          { status: 403 }
        );
      }
    }

    // Generate secure API credentials
    const keyManager = new SdkApiKeyManager(prisma);
    const credentials = await keyManager.generateAppCredentials();

    // Get tier configuration
    const tierLimits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS];

    // Calculate billing period
    const now = new Date();
    const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Create SDK app
    const sdkApp = await prisma.sdkApp.create({
      data: {
        name,
        description,
        appId: credentials.appId,
        secretKey: credentials.hashedSecretKey,
        userId: user.id,
        tier: tier as SdkTier,
        requestsPerMonth: tierLimits.requestsPerMonth,
        requestsPerMinute: tierLimits.requestsPerMinute,
        features: tierLimits.features as any,
        currentPeriodStart,
        currentPeriodEnd,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create initial usage record
    await prisma.sdkUsage.create({
      data: {
        appId: sdkApp.id,
        billingPeriod: currentPeriodStart,
      },
    });

    // Return app details with credentials (only shown once)
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
        },
        createdAt: sdkApp.createdAt,
      },
      credentials: {
        appId: credentials.appId,
        secretKey: credentials.secretKey, // Only shown once during registration
        authFormat: `Bearer ${credentials.appId}:${credentials.secretKey}`,
      },
      warning: 'Store these credentials securely. The secret key will not be shown again.',
    });

  } catch (error) {
    console.error('Error registering SDK app:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to register SDK app. Please try again.',
      },
      { status: 500 }
    );
  }
}

// Export allowed methods
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';