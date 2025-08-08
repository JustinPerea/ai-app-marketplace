import { NextRequest, NextResponse } from 'next/server';
import { withSimpleAuth } from '@/lib/auth/simple-auth';
import { prisma } from '@/lib/db';
import { createApiKeyManager } from '@/lib/security/api-key-manager';
import { ApiProvider } from '@prisma/client';
import { z } from 'zod';

// Input validation schema
const ApiKeyInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  provider: z.nativeEnum(ApiProvider),
  apiKey: z.string().min(10, 'API key too short').max(500, 'API key too long'),
});

// Provider validation mapping
const PROVIDER_VALIDATION_MAP = {
  OPENAI: 'OPENAI',
  ANTHROPIC: 'ANTHROPIC', 
  GOOGLE: 'GOOGLE',
  AZURE_OPENAI: 'AZURE_OPENAI',
  COHERE: 'COHERE',
  HUGGING_FACE: 'HUGGING_FACE',
  OLLAMA: 'OLLAMA',
} as const;

// GET /api/keys - Get all API keys for the authenticated user
export const GET = withSimpleAuth(async (request, user) => {
  try {
    const apiKeyManager = createApiKeyManager(prisma);
    const apiKeys = await apiKeyManager.listApiKeys(user.id);

    return NextResponse.json({ 
      success: true,
      keys: apiKeys.map(key => ({
        id: key.id,
        name: key.name,
        provider: key.provider,
        keyPreview: key.keyPreview,
        isActive: key.isActive,
        createdAt: key.createdAt,
        lastUsed: key.lastUsed,
        totalRequests: key.totalRequests,
        totalCost: key.totalCost,
      }))
    });
  } catch (error) {
    console.error('Failed to get API keys:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve API keys' },
      { status: 500 }
    );
  }
});

// Helper function to validate API key with provider
async function validateApiKeyWithProvider(request: NextRequest, provider: ApiProvider, apiKey: string): Promise<{
  isValid: boolean;
  error?: string;
  model?: string;
}> {
  try {
    // Use existing validation endpoint through internal API call using the current origin (supports non-default ports)
    const origin = request.nextUrl.origin;
    const response = await fetch(`${origin}/api/test-provider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        isValid: data.success,
        error: data.error,
        model: data.model,
      };
    } else {
      return { isValid: false, error: 'Provider validation failed' };
    }
  } catch (error) {
    console.error('API key validation error:', error);
    return { isValid: false, error: 'Validation service unavailable' };
  }
}

// POST /api/keys - Add a new API key
export const POST = withSimpleAuth(async (request, user) => {
  try {
    const body = await request.json();
    
    // Validate input with Zod schema
    const validationResult = ApiKeyInputSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.issues.map(i => i.message).join(', ')
        },
        { status: 400 }
      );
    }

    const { name, provider, apiKey } = validationResult.data;

    // Validate API key with provider
    const validation = await validateApiKeyWithProvider(request, provider, apiKey);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid API key' },
        { status: 400 }
      );
    }

    // Store the API key using secure database storage
    const apiKeyManager = createApiKeyManager(prisma);
    const storedKey = await apiKeyManager.storeApiKey({
      userId: user.id,
      name,
      provider,
      apiKey,
    });

    return NextResponse.json({ 
      success: true, 
      key: {
        id: storedKey.id,
        name: storedKey.name,
        provider: storedKey.provider,
        keyPreview: storedKey.keyPreview,
        isActive: storedKey.isActive,
        createdAt: storedKey.createdAt,
        totalRequests: storedKey.totalRequests,
        totalCost: storedKey.totalCost,
      },
      validation: {
        provider: provider,
        model: validation.model,
      }
    });

  } catch (error) {
    console.error('Failed to add API key:', error);
    return NextResponse.json(
      { error: 'Failed to add API key securely' },
      { status: 500 }
    );
  }
});

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}