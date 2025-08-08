import { NextRequest, NextResponse } from 'next/server';
import { createClient, APIProvider } from '@cosmara-ai/community-sdk';

// Personalized provider health using the signed-in user's BYOK keys
export async function GET(req: NextRequest) {
  try {
    const isCliToken = req.nextUrl.searchParams.get('token') && process.env.CLI_HEALTH_TOKEN && req.nextUrl.searchParams.get('token') === process.env.CLI_HEALTH_TOKEN;
    const headers: Record<string, string> = {};
    if (!isCliToken) {
      const cookie = req.headers.get('cookie') || '';
      if (cookie) headers['cookie'] = cookie;
    }

    async function getActiveKey(provider: 'openai' | 'anthropic' | 'google'): Promise<string | undefined> {
      const r = await fetch(`${req.nextUrl.origin}/api/keys/active?provider=${provider}${isCliToken ? `&token=${req.nextUrl.searchParams.get('token')}` : ''}`, { headers, cache: 'no-store' });
      if (!r.ok) return undefined;
      const j = await r.json();
      return j?.apiKey as string | undefined;
    }

    const [openaiKey, anthropicKey, googleKey] = await Promise.all([
      getActiveKey('openai'), getActiveKey('anthropic'), getActiveKey('google')
    ]);

    const client = createClient({
      apiKeys: { openai: openaiKey, anthropic: anthropicKey, google: googleKey }
    });

    const validation = await client.validateApiKeys();
    const results = {
      openai: { provider: 'openai', healthy: !!validation[APIProvider.OPENAI] },
      anthropic: { provider: 'anthropic', healthy: !!validation[APIProvider.ANTHROPIC] },
      google: { provider: 'google', healthy: !!validation[APIProvider.GOOGLE] },
    };
    return NextResponse.json({ ok: true, results });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: 'Provider health check unavailable', details: String(error?.message || error) }, { status: 200 });
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

    const { providerRegistry } = await import('@cosmara-ai/community-sdk');
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



