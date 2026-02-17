import { NextRequest, NextResponse } from 'next/server';
import { access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

type Provider = 'openai' | 'anthropic' | 'google';

interface ValidateBody {
  appName: string;
  provider?: Provider;
  prompt?: string;
  apiKeys?: { openai?: string; anthropic?: string; google?: string };
}

async function fileExists(relativePath: string): Promise<boolean> {
  try {
    const abs = path.join(process.cwd(), relativePath);
    await access(abs, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ValidateBody;
    const { appName, provider = 'openai', prompt = 'Say hello from my app.', apiKeys } = body;

    if (!appName || !appName.trim()) {
      return NextResponse.json({ ok: false, error: 'appName is required' }, { status: 400 });
    }

    // 1) Structure checks
    const base = `src/app/marketplace/apps/${appName}`;
    const structure = {
      page: await fileExists(`${base}/page.tsx`),
      api: await fileExists(`${base}/api/route.ts`),
    };

    // 2) Endpoint smoke test (optional if api file exists)
    let endpoint: { tried: boolean; status?: number; ok?: boolean; error?: string } = { tried: false };
    if (structure.api) {
      try {
        const origin = new URL(req.url).origin;
        const res = await fetch(`${origin}/marketplace/apps/${appName}/api`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: prompt, provider, apiKeys }),
        });
        endpoint = { tried: true, status: res.status, ok: res.ok };
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          endpoint.error = data?.error || `HTTP ${res.status}`;
        }
      } catch (e: any) {
        endpoint = { tried: true, ok: false, error: String(e?.message || e) };
      }
    }

    return NextResponse.json({
      ok: structure.page && structure.api,
      checks: {
        structure,
        endpoint,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}


