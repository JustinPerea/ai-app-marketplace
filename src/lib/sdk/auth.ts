/**
 * SDK Protection Phase 3 - Authentication and Authorization
 * 
 * This module provides secure authentication and authorization for the Platform API
 * that protects the ML routing logic from the SDK.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, SdkApp, SdkTier, SdkAppStatus } from '@prisma/client';
import crypto from 'crypto';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Tier configuration
export const TIER_LIMITS = {
  COMMUNITY: {
    requestsPerMonth: 1000,
    requestsPerMinute: 10,
    features: {
      mlRouting: false,
      analytics: false,
      caching: false,
      customModels: false,
      batchRouting: false,
      prioritySupport: false,
    },
  },
  DEVELOPER: {
    price: 49,
    requestsPerMonth: 50000,
    requestsPerMinute: 100,
    features: {
      mlRouting: true,
      analytics: true,
      caching: true,
      customModels: false,
      batchRouting: true,
      prioritySupport: false,
    },
  },
  PROFESSIONAL: {
    price: 199,
    requestsPerMonth: 500000,
    requestsPerMinute: 500,
    features: {
      mlRouting: true,
      analytics: true,
      caching: true,
      customModels: true,
      batchRouting: true,
      prioritySupport: true,
    },
  },
  ENTERPRISE: {
    price: 'custom',
    requestsPerMonth: -1, // Unlimited
    requestsPerMinute: 1000,
    features: {
      mlRouting: true,
      analytics: true,
      caching: true,
      customModels: true,
      batchRouting: true,
      prioritySupport: true,
    },
  },
} as const;

export interface AuthenticatedSdkApp extends SdkApp {
  features: {
    mlRouting: boolean;
    analytics: boolean;
    caching: boolean;
    customModels: boolean;
    batchRouting: boolean;
    prioritySupport: boolean;
  };
}

export interface SdkAuthContext {
  app: AuthenticatedSdkApp;
  remainingRequests: number;
  rateLimitResetTime: Date;
  isRateLimited: boolean;
}

/**
 * SDK API Key Manager - Handles secure key generation and validation
 */
export class SdkApiKeyManager {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Generate secure API credentials for a new SDK app
   */
  async generateAppCredentials(): Promise<{
    appId: string;
    secretKey: string;
    hashedSecretKey: string;
  }> {
    const appId = `app_${crypto.randomUUID()}`;
    const secretKey = `sk_${this.generateSecureKey(32)}`;
    const hashedSecretKey = await this.hashSecretKey(secretKey);

    return {
      appId,
      secretKey,
      hashedSecretKey,
    };
  }

  /**
   * Validate SDK app credentials
   */
  async validateCredentials(appId: string, secretKey: string): Promise<AuthenticatedSdkApp | null> {
    try {
      // Find app by appId
      const app = await this.prisma.sdkApp.findUnique({
        where: { appId },
        include: { user: true },
      });

      if (!app) {
        return null;
      }

      // Verify secret key
      const isValid = await this.verifySecretKey(secretKey, app.secretKey);
      if (!isValid) {
        return null;
      }

      // Check app status
      if (app.status !== SdkAppStatus.ACTIVE) {
        return null;
      }

      // Get tier features
      const tierLimits = TIER_LIMITS[app.tier];
      
      return {
        ...app,
        features: tierLimits.features,
      } as AuthenticatedSdkApp;

    } catch (error) {
      console.error('Error validating SDK credentials:', error);
      return null;
    }
  }

  /**
   * Rotate secret key for an SDK app
   */
  async rotateSecretKey(appId: string): Promise<{ secretKey: string } | null> {
    try {
      const secretKey = `sk_${this.generateSecureKey(32)}`;
      const hashedSecretKey = await this.hashSecretKey(secretKey);

      await this.prisma.sdkApp.update({
        where: { appId },
        data: { 
          secretKey: hashedSecretKey,
          updatedAt: new Date(),
        },
      });

      return { secretKey };
    } catch (error) {
      console.error('Error rotating secret key:', error);
      return null;
    }
  }

  private generateSecureKey(length: number): string {
    const bytes = randomBytes(Math.ceil(length * 3 / 4));
    return bytes
      .toString('base64')
      .replace(/[+/]/g, (char) => char === '+' ? '-' : '_')
      .substring(0, length);
  }

  private async hashSecretKey(secretKey: string): Promise<string> {
    const salt = randomBytes(16);
    const derivedKey = await scryptAsync(secretKey, salt, 64) as Buffer;
    return salt.toString('hex') + ':' + derivedKey.toString('hex');
  }

  private async verifySecretKey(secretKey: string, hashedSecretKey: string): Promise<boolean> {
    const [saltHex, keyHex] = hashedSecretKey.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const key = Buffer.from(keyHex, 'hex');
    
    const derivedKey = await scryptAsync(secretKey, salt, 64) as Buffer;
    
    return timingSafeEqual(key, derivedKey);
  }
}

/**
 * Rate Limiter for SDK apps based on tier limits
 */
export class SdkRateLimiter {
  private prisma: PrismaClient;
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Check if app can make a request and update rate limit counters
   */
  async checkRateLimit(app: AuthenticatedSdkApp): Promise<{
    allowed: boolean;
    remainingRequests: number;
    resetTime: Date;
    error?: string;
  }> {
    const tierLimits = TIER_LIMITS[app.tier];
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const resetTime = new Date(now + windowMs);

    // Check per-minute rate limit
    const rateLimitKey = `${app.appId}:minute`;
    const currentWindow = Math.floor(now / windowMs);
    const windowKey = `${rateLimitKey}:${currentWindow}`;
    
    const currentCount = this.requestCounts.get(windowKey)?.count || 0;
    
    if (currentCount >= tierLimits.requestsPerMinute) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime,
        error: `Rate limit exceeded. Maximum ${tierLimits.requestsPerMinute} requests per minute for ${app.tier} tier.`,
      };
    }

    // Check monthly quota
    const monthlyUsage = await this.getMonthlyUsage(app.appId);
    if (tierLimits.requestsPerMonth > 0 && monthlyUsage >= tierLimits.requestsPerMonth) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: this.getNextBillingPeriod(app.currentPeriodStart),
        error: `Monthly quota exceeded. Maximum ${tierLimits.requestsPerMonth} requests per month for ${app.tier} tier.`,
      };
    }

    // Update counters
    this.requestCounts.set(windowKey, {
      count: currentCount + 1,
      resetTime: now + windowMs,
    });

    // Cleanup old entries
    this.cleanupOldEntries();

    const remainingMinute = Math.max(0, tierLimits.requestsPerMinute - (currentCount + 1));
    const remainingMonthly = tierLimits.requestsPerMonth > 0 
      ? Math.max(0, tierLimits.requestsPerMonth - monthlyUsage - 1)
      : Infinity;

    return {
      allowed: true,
      remainingRequests: Math.min(remainingMinute, remainingMonthly),
      resetTime,
    };
  }

  private async getMonthlyUsage(appId: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const usage = await this.prisma.sdkUsage.findFirst({
      where: {
        appId,
        billingPeriod: startOfMonth,
      },
    });

    return usage?.requestsCount || 0;
  }

  private getNextBillingPeriod(currentPeriodStart: Date): Date {
    const next = new Date(currentPeriodStart);
    next.setMonth(next.getMonth() + 1);
    return next;
  }

  private cleanupOldEntries(): void {
    const now = Date.now();
    for (const [key, value] of this.requestCounts.entries()) {
      if (value.resetTime < now) {
        this.requestCounts.delete(key);
      }
    }
  }
}

/**
 * SDK Authentication Middleware
 */
export class SdkAuthMiddleware {
  private keyManager: SdkApiKeyManager;
  private rateLimiter: SdkRateLimiter;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.keyManager = new SdkApiKeyManager(prisma);
    this.rateLimiter = new SdkRateLimiter(prisma);
  }

  /**
   * Authenticate and authorize SDK request
   */
  async authenticateRequest(request: NextRequest): Promise<{
    success: boolean;
    context?: SdkAuthContext;
    error?: string;
    status?: number;
  }> {
    try {
      // Extract credentials from Authorization header
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          success: false,
          error: 'Missing or invalid Authorization header. Expected: Bearer app_xxx:sk_xxx',
          status: 401,
        };
      }

      const token = authHeader.substring(7); // Remove 'Bearer '
      const [appId, secretKey] = token.split(':');

      if (!appId || !secretKey) {
        return {
          success: false,
          error: 'Invalid token format. Expected: app_xxx:sk_xxx',
          status: 401,
        };
      }

      // Validate credentials
      const app = await this.keyManager.validateCredentials(appId, secretKey);
      if (!app) {
        return {
          success: false,
          error: 'Invalid credentials or app not found',
          status: 401,
        };
      }

      // Check rate limits
      const rateLimitResult = await this.rateLimiter.checkRateLimit(app);
      if (!rateLimitResult.allowed) {
        // Update app status if needed
        if (rateLimitResult.error?.includes('Monthly quota exceeded')) {
          await this.prisma.sdkApp.update({
            where: { id: app.id },
            data: { status: SdkAppStatus.QUOTA_EXCEEDED },
          });
        }

        return {
          success: false,
          error: rateLimitResult.error,
          status: 429,
        };
      }

      // Update last used timestamp
      await this.prisma.sdkApp.update({
        where: { id: app.id },
        data: { 
          lastUsed: new Date(),
          userAgent: request.headers.get('user-agent') || undefined,
        },
      });

      return {
        success: true,
        context: {
          app,
          remainingRequests: rateLimitResult.remainingRequests,
          rateLimitResetTime: rateLimitResult.resetTime,
          isRateLimited: false,
        },
      };

    } catch (error) {
      console.error('SDK authentication error:', error);
      return {
        success: false,
        error: 'Internal server error during authentication',
        status: 500,
      };
    }
  }

  /**
   * Check if app has required feature access
   */
  checkFeatureAccess(
    context: SdkAuthContext, 
    requiredFeature: keyof typeof TIER_LIMITS.COMMUNITY.features
  ): boolean {
    return context.app.features[requiredFeature];
  }

  /**
   * Create authentication error response
   */
  createErrorResponse(error: string, status: number = 401): NextResponse {
    return NextResponse.json(
      { 
        error: 'Authentication Failed',
        message: error,
        code: 'SDK_AUTH_ERROR',
      },
      { status }
    );
  }
}

/**
 * Usage Tracker for billing and analytics
 */
export class SdkUsageTracker {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Track SDK request usage
   */
  async trackUsage(
    appId: string,
    eventType: 'ml_route' | 'analytics' | 'api_call',
    eventData: {
      cost?: number;
      responseTime?: number;
      successful?: boolean;
      errorCode?: string;
      errorMessage?: string;
      userAgent?: string;
      ipAddress?: string;
    } = {}
  ): Promise<void> {
    try {
      // Update analytics record
      await this.prisma.sdkAnalytics.create({
        data: {
          appId,
          eventType,
          eventData: eventData as any,
          responseTime: eventData.responseTime,
          cost: eventData.cost || 0,
          successful: eventData.successful ?? true,
          errorCode: eventData.errorCode,
          errorMessage: eventData.errorMessage,
          userAgent: eventData.userAgent,
          ipAddress: eventData.ipAddress,
        },
      });

      // Update monthly usage
      const now = new Date();
      const billingPeriod = new Date(now.getFullYear(), now.getMonth(), 1);

      await this.prisma.sdkUsage.upsert({
        where: {
          appId_billingPeriod: {
            appId,
            billingPeriod,
          },
        },
        update: {
          requestsCount: { increment: 1 },
          mlRoutingCount: eventType === 'ml_route' ? { increment: 1 } : undefined,
          analyticsRequests: eventType === 'analytics' ? { increment: 1 } : undefined,
          totalCost: { increment: eventData.cost || 0 },
          successfulRequests: eventData.successful !== false ? { increment: 1 } : undefined,
          failedRequests: eventData.successful === false ? { increment: 1 } : undefined,
          updatedAt: new Date(),
        },
        create: {
          appId,
          billingPeriod,
          requestsCount: 1,
          mlRoutingCount: eventType === 'ml_route' ? 1 : 0,
          analyticsRequests: eventType === 'analytics' ? 1 : 0,
          totalCost: eventData.cost || 0,
          successfulRequests: eventData.successful !== false ? 1 : 0,
          failedRequests: eventData.successful === false ? 1 : 0,
        },
      });

      // Update app's current period usage counter
      await this.prisma.sdkApp.update({
        where: { appId },
        data: {
          requestsThisPeriod: { increment: 1 },
        },
      });

    } catch (error) {
      console.error('Error tracking SDK usage:', error);
      // Don't throw - usage tracking failures shouldn't break the request
    }
  }
}

// Export singleton instances
let prisma: PrismaClient;

export function getSdkAuthMiddleware(): SdkAuthMiddleware {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return new SdkAuthMiddleware(prisma);
}

export function getSdkUsageTracker(): SdkUsageTracker {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return new SdkUsageTracker(prisma);
}