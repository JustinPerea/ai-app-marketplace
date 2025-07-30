import { NextRequest, NextResponse } from 'next/server';
import { withSimpleAuth } from '@/lib/auth/simple-auth';
import { prisma } from '@/lib/db';
import { createApiKeyManager } from '@/lib/security/api-key-manager';

/**
 * GET /api/keys/[keyId]/decrypt - Get decrypted API key for application usage
 * 
 * This endpoint provides the actual decrypted API key for applications to use.
 * It includes additional security measures and usage tracking.
 */
export const GET = withSimpleAuth(async (request, user) => {
  try {
    const keyId = request.url.split('/').slice(-2)[0]; // Get keyId from URL path
    
    if (!keyId) {
      return NextResponse.json(
        { error: 'Key ID is required' },
        { status: 400 }
      );
    }

    const apiKeyManager = createApiKeyManager(prisma);
    
    // Retrieve and decrypt the API key
    const apiKeyWithSecret = await apiKeyManager.retrieveApiKey({
      userId: user.id,
      apiKeyId: keyId,
    });
    
    if (!apiKeyWithSecret || !apiKeyWithSecret.isValid) {
      return NextResponse.json(
        { error: 'API key not found or invalid' },
        { status: 404 }
      );
    }

    // Log the access for security monitoring
    console.info('API key accessed for usage:', {
      userId: user.id,
      keyId: keyId,
      provider: apiKeyWithSecret.provider,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ 
      success: true,
      key: {
        id: apiKeyWithSecret.id,
        provider: apiKeyWithSecret.provider,
        decryptedKey: apiKeyWithSecret.decryptedKey,
        // Include metadata for application usage
        lastUsed: apiKeyWithSecret.lastUsed,
        totalRequests: apiKeyWithSecret.totalRequests,
        isActive: apiKeyWithSecret.isActive,
      }
    });
    
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve API key for usage' },
      { status: 500 }
    );
  }
});

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}