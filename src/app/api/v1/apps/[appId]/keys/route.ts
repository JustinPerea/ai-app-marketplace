/**
 * SDK Protection Phase 3 - API Key Management
 * 
 * POST /api/v1/apps/[appId]/keys - Rotate API keys for SDK app
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { SdkApiKeyManager } from '@/lib/sdk/auth';

const prisma = new PrismaClient();

/**
 * POST /api/v1/apps/[appId]/keys - Rotate secret key
 */
export async function POST(
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

    // Verify user owns the app
    const sdkApp = await prisma.sdkApp.findFirst({
      where: {
        id: params.appId,
        userId: user.id,
      },
    });

    if (!sdkApp) {
      return NextResponse.json(
        { error: 'SDK app not found or not authorized' },
        { status: 404 }
      );
    }

    // Rotate the secret key
    const keyManager = new SdkApiKeyManager(prisma);
    const result = await keyManager.rotateSecretKey(sdkApp.appId);

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to rotate secret key' },
        { status: 500 }
      );
    }

    // Log the key rotation for security audit
    await prisma.sdkAnalytics.create({
      data: {
        appId: sdkApp.id,
        eventType: 'key_rotation',
        eventData: {
          rotatedBy: user.email,
          rotatedAt: new Date().toISOString(),
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
        successful: true,
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Secret key rotated successfully',
      credentials: {
        appId: sdkApp.appId,
        secretKey: result.secretKey, // New secret key
        authFormat: `Bearer ${sdkApp.appId}:${result.secretKey}`,
      },
      warning: 'Update your applications with the new secret key. The old key is no longer valid.',
      rotatedAt: new Date(),
    });

  } catch (error) {
    console.error('Error rotating API key:', error);
    
    // Log failed attempt
    try {
      await prisma.sdkAnalytics.create({
        data: {
          appId: params.appId,
          eventType: 'key_rotation_failed',
          eventData: {
            error: error instanceof Error ? error.message : 'Unknown error',
            attemptedAt: new Date().toISOString(),
          },
          successful: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || undefined,
        },
      });
    } catch (logError) {
      console.error('Failed to log key rotation attempt:', logError);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';