/**
 * SDK Protection Phase 3C - Billing Upgrade API
 * 
 * POST /api/v1/billing/upgrade - Handle tier upgrade requests
 * 
 * This endpoint manages SDK app tier upgrades, including validation,
 * billing integration, and feature activation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, SdkTier, SdkAppStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { TIER_LIMITS } from '@/lib/sdk/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

// Upgrade request validation schema
const UpgradeRequestSchema = z.object({
  appId: z.string().min(1, 'App ID is required'),
  targetTier: z.enum(['DEVELOPER', 'PROFESSIONAL', 'ENTERPRISE']),
  billingPeriod: z.enum(['monthly', 'annual']).optional().default('monthly'),
  paymentMethodId: z.string().optional(), // Stripe payment method ID
  confirmUpgrade: z.boolean().default(false),
});

/**
 * POST /api/v1/billing/upgrade - Process tier upgrade
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Authenticate user (not SDK app - this is a user-initiated action)
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
    const validation = UpgradeRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { appId, targetTier, billingPeriod, paymentMethodId, confirmUpgrade } = validation.data;

    // Find and verify SDK app ownership
    const sdkApp = await prisma.sdkApp.findFirst({
      where: {
        id: appId,
        userId: user.id,
      },
    });

    if (!sdkApp) {
      return NextResponse.json(
        { error: 'SDK app not found or not authorized' },
        { status: 404 }
      );
    }

    // Check if upgrade is valid
    const currentTierOrder = ['COMMUNITY', 'DEVELOPER', 'PROFESSIONAL', 'ENTERPRISE'];
    const currentIndex = currentTierOrder.indexOf(sdkApp.tier);
    const targetIndex = currentTierOrder.indexOf(targetTier);

    if (targetIndex <= currentIndex) {
      return NextResponse.json(
        {
          error: 'Invalid upgrade',
          message: 'Can only upgrade to a higher tier',
          currentTier: sdkApp.tier,
          targetTier,
        },
        { status: 400 }
      );
    }

    // Get tier configurations
    const currentTierConfig = TIER_LIMITS[sdkApp.tier];
    const targetTierConfig = TIER_LIMITS[targetTier];

    // Calculate upgrade cost and billing
    const upgradeCost = this.calculateUpgradeCost(
      sdkApp.tier,
      targetTier,
      billingPeriod,
      sdkApp.currentPeriodStart
    );

    // If not confirming, return upgrade preview
    if (!confirmUpgrade) {
      return NextResponse.json({
        success: true,
        preview: true,
        upgrade: {
          from: {
            tier: sdkApp.tier,
            price: currentTierConfig.price,
            features: currentTierConfig.features,
            limits: {
              requestsPerMonth: currentTierConfig.requestsPerMonth,
              requestsPerMinute: currentTierConfig.requestsPerMinute,
            },
          },
          to: {
            tier: targetTier,
            price: targetTierConfig.price,
            features: targetTierConfig.features,
            limits: {
              requestsPerMonth: targetTierConfig.requestsPerMonth,
              requestsPerMinute: targetTierConfig.requestsPerMinute,
            },
          },
          billing: {
            period: billingPeriod,
            cost: upgradeCost,
            effectiveDate: new Date().toISOString(),
            nextBillingDate: this.getNextBillingDate(billingPeriod),
          },
          newFeatures: this.getNewFeatures(currentTierConfig.features, targetTierConfig.features),
        },
        requiresPayment: targetTier !== 'DEVELOPER' || upgradeCost.total > 0,
        paymentRequired: upgradeCost.total,
      });
    }

    // Process actual upgrade
    if (targetTier !== 'DEVELOPER' && upgradeCost.total > 0) {
      // For paid tiers, integrate with billing system (Stripe, etc.)
      if (!paymentMethodId) {
        return NextResponse.json(
          {
            error: 'Payment method required',
            message: 'Payment method is required for paid tier upgrades',
          },
          { status: 400 }
        );
      }

      // Process payment (simplified - would integrate with actual billing system)
      const paymentResult = await this.processUpgradePayment(
        user,
        sdkApp,
        targetTier,
        upgradeCost,
        paymentMethodId
      );

      if (!paymentResult.success) {
        return NextResponse.json(
          {
            error: 'Payment failed',
            message: paymentResult.error,
          },
          { status: 402 }
        );
      }
    }

    // Update SDK app tier
    const updatedApp = await prisma.sdkApp.update({
      where: { id: sdkApp.id },
      data: {
        tier: targetTier as SdkTier,
        requestsPerMonth: targetTierConfig.requestsPerMonth,
        requestsPerMinute: targetTierConfig.requestsPerMinute,
        features: targetTierConfig.features as any,
        status: SdkAppStatus.ACTIVE,
        updatedAt: new Date(),
      },
    });

    // Log the upgrade event
    await prisma.sdkAnalytics.create({
      data: {
        appId: sdkApp.id,
        eventType: 'tier_upgrade',
        eventData: {
          fromTier: sdkApp.tier,
          toTier: targetTier,
          billingPeriod,
          upgradeCost: upgradeCost.total,
          upgradeDate: new Date().toISOString(),
          upgradedBy: user.email,
        },
        successful: true,
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Tier upgraded successfully',
      upgrade: {
        appId: updatedApp.id,
        previousTier: sdkApp.tier,
        newTier: updatedApp.tier,
        features: updatedApp.features,
        limits: {
          requestsPerMonth: updatedApp.requestsPerMonth,
          requestsPerMinute: updatedApp.requestsPerMinute,
        },
        billing: {
          cost: upgradeCost.total,
          period: billingPeriod,
          nextBillingDate: this.getNextBillingDate(billingPeriod),
        },
        effectiveImmediately: true,
      },
      meta: {
        processingTime: Date.now() - startTime,
        upgradeDate: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Billing upgrade API error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Upgrade process failed. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate upgrade cost based on tiers and billing period
 */
function calculateUpgradeCost(
  currentTier: string,
  targetTier: string,
  billingPeriod: string,
  currentPeriodStart: Date
): {
  base: number;
  prorated: number;
  total: number;
  currency: string;
} {
  const currentTierConfig = TIER_LIMITS[currentTier as keyof typeof TIER_LIMITS];
  const targetTierConfig = TIER_LIMITS[targetTier as keyof typeof TIER_LIMITS];

  let basePrice = 0;
  
  if (typeof targetTierConfig.price === 'number') {
    basePrice = targetTierConfig.price;
    
    // Apply annual discount
    if (billingPeriod === 'annual') {
      basePrice = basePrice * 12 * 0.85; // 15% annual discount
    }
  }

  // Calculate prorated amount for current billing period
  const now = new Date();
  const daysIntoMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - daysIntoMonth;
  
  const proratedAmount = billingPeriod === 'monthly' 
    ? (basePrice * remainingDays) / daysInMonth
    : basePrice;

  // Subtract current tier cost if applicable
  let currentTierCredit = 0;
  if (typeof currentTierConfig.price === 'number' && currentTier !== 'COMMUNITY') {
    currentTierCredit = billingPeriod === 'monthly'
      ? (currentTierConfig.price * remainingDays) / daysInMonth
      : currentTierConfig.price * 12 * 0.85;
  }

  const totalCost = Math.max(0, proratedAmount - currentTierCredit);

  return {
    base: basePrice,
    prorated: proratedAmount,
    total: Math.round(totalCost * 100) / 100,
    currency: 'USD',
  };
}

/**
 * Get next billing date based on billing period
 */
function getNextBillingDate(billingPeriod: string): string {
  const now = new Date();
  
  if (billingPeriod === 'annual') {
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString();
  } else {
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString();
  }
}

/**
 * Get list of new features available in target tier
 */
function getNewFeatures(currentFeatures: any, targetFeatures: any): string[] {
  const newFeatures = [];
  
  for (const [feature, enabled] of Object.entries(targetFeatures)) {
    if (enabled && !currentFeatures[feature]) {
      // Convert camelCase to readable format
      const readableFeature = feature
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      newFeatures.push(readableFeature);
    }
  }
  
  return newFeatures;
}

/**
 * Process upgrade payment (simplified - would integrate with Stripe)
 */
async function processUpgradePayment(
  user: any,
  sdkApp: any,
  targetTier: string,
  upgradeCost: any,
  paymentMethodId: string
): Promise<{ success: boolean; error?: string; transactionId?: string }> {
  // This is a simplified implementation
  // In production, this would integrate with Stripe or another payment processor
  
  try {
    // Validate payment method
    if (!paymentMethodId.startsWith('pm_')) {
      return {
        success: false,
        error: 'Invalid payment method ID',
      };
    }

    // Simulate payment processing
    // In production: create Stripe payment intent, process payment, handle webhooks
    
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // For demo purposes, always succeed
    return {
      success: true,
      transactionId,
    };
    
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      error: 'Payment processing failed',
    };
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';