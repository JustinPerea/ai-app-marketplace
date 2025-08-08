import { NextRequest, NextResponse } from 'next/server';
import { withSimpleAuth } from '@/lib/auth/simple-auth';
import { prisma } from '@/lib/db';
import { createApiKeyManager } from '@/lib/security/api-key-manager';

// GET /api/keys/active?provider=OPENAI|ANTHROPIC|GOOGLE
export const GET = withSimpleAuth(async (req: NextRequest, user) => {
  const provider = req.nextUrl.searchParams.get('provider');
  if (!provider) {
    return NextResponse.json({ error: 'provider is required' }, { status: 400 });
  }

  try {
    const key = await prisma.apiKey.findFirst({
      where: { userId: user.id, provider: provider as any, isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    if (!key) {
      return NextResponse.json({ error: 'No active key' }, { status: 404 });
    }
    const manager = createApiKeyManager(prisma);
    const decrypted = await manager.retrieveApiKey({ userId: user.id, apiKeyId: key.id });
    if (!decrypted?.isValid) {
      return NextResponse.json({ error: 'Decryption failed' }, { status: 500 });
    }
    return NextResponse.json({ apiKey: decrypted.decryptedKey, provider: key.provider, id: key.id });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to retrieve key' }, { status: 500 });
  }
});


