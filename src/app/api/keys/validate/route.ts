import { NextRequest, NextResponse } from 'next/server';
import { withSimpleAuth } from '@/lib/auth/simple-auth';
import { validateApiKey } from '@/lib/storage/simple-api-keys';

// POST /api/keys/validate - Validate an API key before storing
export const POST = withSimpleAuth(async (request, user) => {
  try {
    const body = await request.json();
    const { provider, apiKey } = body;
    
    // Validate input
    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: 'Provider and API key are required' },
        { status: 400 }
      );
    }

    // Validate API key with provider
    const validation = await validateApiKey(provider, apiKey);
    
    if (validation.isValid) {
      return NextResponse.json({
        isValid: true,
        provider: validation.provider,
        model: validation.model,
        message: 'API key is valid and working',
      });
    } else {
      return NextResponse.json({
        isValid: false,
        error: validation.error,
        message: 'API key validation failed',
      });
    }

  } catch (error) {
    console.error('API key validation error:', error);
    return NextResponse.json(
      { error: 'Validation service error' },
      { status: 500 }
    );
  }
});

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}