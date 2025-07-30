import { NextRequest, NextResponse } from 'next/server';
import { withSimpleAuth } from '@/lib/auth/simple-auth';
import { prisma } from '@/lib/db';
import { createApiKeyManager } from '@/lib/security/api-key-manager';

// GET /api/keys/[keyId] - Get a specific API key (metadata only)
export const GET = withSimpleAuth(async (request, user) => {
  try {
    const keyId = request.url.split('/').pop();
    
    if (!keyId) {
      return NextResponse.json(
        { error: 'Key ID is required' },
        { status: 400 }
      );
    }

    const apiKeyManager = createApiKeyManager(prisma);
    const apiKeys = await apiKeyManager.listApiKeys(user.id);
    const apiKey = apiKeys.find(key => key.id === keyId);
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      key: {
        id: apiKey.id,
        name: apiKey.name,
        provider: apiKey.provider,
        keyPreview: apiKey.keyPreview,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
        lastUsed: apiKey.lastUsed,
        totalRequests: apiKey.totalRequests,
        totalCost: apiKey.totalCost,
      }
    });
  } catch (error) {
    console.error('Failed to get API key:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve API key' },
      { status: 500 }
    );
  }
});

// DELETE /api/keys/[keyId] - Deactivate an API key (soft delete)
export const DELETE = withSimpleAuth(async (request, user) => {
  try {
    const keyId = request.url.split('/').pop();
    
    if (!keyId) {
      return NextResponse.json(
        { error: 'Key ID is required' },
        { status: 400 }
      );
    }

    const apiKeyManager = createApiKeyManager(prisma);
    const success = await apiKeyManager.deactivateApiKey(user.id, keyId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'API key not found or cannot be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'API key deactivated successfully' 
    });

  } catch (error) {
    console.error('Failed to delete API key:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
});

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}