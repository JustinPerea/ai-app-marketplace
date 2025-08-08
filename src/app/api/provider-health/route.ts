import { NextRequest, NextResponse } from 'next/server';

// Personalized provider health using the signed-in user's BYOK keys
export async function GET(req: NextRequest) {
  try {
    const { providerRegistry } = await import('@byok-marketplace/sdk');

    // Fetch user's keys
    const isCliToken = req.nextUrl.searchParams.get('token') && process.env.CLI_HEALTH_TOKEN && req.nextUrl.searchParams.get('token') === process.env.CLI_HEALTH_TOKEN;
    const headers: Record<string, string> = {};
    if (!isCliToken) {
      const cookie = req.headers.get('cookie') || '';
      if (cookie) headers['cookie'] = cookie;
    }

    const listRes = await fetch(`${req.nextUrl.origin}/api/keys`, {
      headers,
      cache: 'no-store',
    });

    const keysJson = listRes.ok ? await listRes.json() : { keys: [] };
    const keys: Array<{ id: string; provider: string; isActive: boolean }> = keysJson.keys || [];

    async function getDecryptedKeyByProvider(provider: string): Promise<string | undefined> {
      const match = keys.find(k => k.provider === provider && k.isActive);
      if (!match) return undefined;
      const decRes = await fetch(`${req.nextUrl.origin}/api/keys/${match.id}/decrypt`, {
        headers,
        cache: 'no-store',
      });
      if (!decRes.ok) return undefined;
      const dec = await decRes.json();
      return dec?.key?.decryptedKey as string | undefined;
    }

    // Map our dashboard providers to SDK providers
    const targets: Array<{ id: string; sdkProvider: 'openai' | 'claude' | 'google'; model: string; keyProviderName: string }>
      = [
        { id: 'openai', sdkProvider: 'openai', model: 'gpt-4o', keyProviderName: 'OPENAI' },
        { id: 'anthropic', sdkProvider: 'claude', model: 'claude-3-5-sonnet-20241022', keyProviderName: 'ANTHROPIC' },
        { id: 'google', sdkProvider: 'google', model: 'gemini-1.5-pro', keyProviderName: 'GOOGLE' },
      ];

    const results: Record<string, any> = {};

    for (const t of targets) {
      try {
        const key = await getDecryptedKeyByProvider(t.keyProviderName);
        if (!key) {
          results[t.id] = { provider: t.sdkProvider, healthy: false, error: 'No key connected' };
          continue;
        }
        const instance = providerRegistry.getProvider({ provider: t.sdkProvider as any, model: t.model, apiKey: key, timeout: 4000 });
        results[t.id] = await instance.healthCheck();
      } catch (e: any) {
        results[t.id] = { provider: t.sdkProvider, healthy: false, error: String(e?.message || e) };
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: 'Provider health check unavailable',
      details: String(error?.message || error)
    }, { status: 200 });
  }
}

// Secure dev-only POST that accepts transient keys when a valid token is supplied
export async function POST(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token || !process.env.CLI_HEALTH_TOKEN || token !== process.env.CLI_HEALTH_TOKEN) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const openaiKey: string | undefined = body?.openai;
    const anthropicKey: string | undefined = body?.anthropic;
    const googleKey: string | undefined = body?.google;

    const { providerRegistry } = await import('@byok-marketplace/sdk');
    const targets: Array<{ id: string; sdkProvider: 'openai' | 'claude' | 'google'; model: string; key?: string }>
      = [
        { id: 'openai', sdkProvider: 'openai', model: 'gpt-4o', key: openaiKey },
        { id: 'anthropic', sdkProvider: 'claude', model: 'claude-3-5-sonnet-20241022', key: anthropicKey },
        { id: 'google', sdkProvider: 'google', model: 'gemini-1.5-pro', key: googleKey },
      ];

    const results: Record<string, any> = {};
    for (const t of targets) {
      try {
        if (!t.key) {
          results[t.id] = { provider: t.sdkProvider, healthy: false, error: 'No key provided' };
          continue;
        }
        const instance = providerRegistry.getProvider({ provider: t.sdkProvider as any, model: t.model, apiKey: t.key, timeout: 4000 });
        results[t.id] = await instance.healthCheck();
      } catch (e: any) {
        results[t.id] = { provider: t.sdkProvider, healthy: false, error: String(e?.message || e) };
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: String(error?.message || error) }, { status: 200 });
  }
}



