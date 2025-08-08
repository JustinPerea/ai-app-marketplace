import { NextRequest, NextResponse } from 'next/server';
import { createClient, APIProvider } from '@cosmara-ai/community-sdk';

async function resolveApiKeyFor(req: NextRequest, provider: string) {
  const origin = req.nextUrl.origin;
  const r = await fetch(`${origin}/api/keys/active?provider=${provider}`, {
    headers: { cookie: req.headers.get('cookie') || '' },
    cache: 'no-store'
  });
  if (!r.ok) return undefined;
  const { apiKey } = await r.json();
  return apiKey as string | undefined;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('mock') === '1') {
    return NextResponse.json({
      id: 'chatcmpl-test',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'gpt-4o',
      provider: 'openai',
      choices: [{ index: 0, message: { role: 'assistant', content: 'Mock response OK' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3, estimated_cost: 0 }
    });
  }

  // Resolve BYOK keys at request time and construct client
  const [openaiKey, anthropicKey, googleKey] = await Promise.all([
    resolveApiKeyFor(req, 'openai'),
    resolveApiKeyFor(req, 'anthropic'),
    resolveApiKeyFor(req, 'google')
  ]);

  const client = createClient({
    apiKeys: {
      openai: openaiKey,
      anthropic: anthropicKey,
      google: googleKey
    }
  });

  try {
    const res = await client.chat({ model: 'gpt-4o', messages: [{ role: 'user', content: 'Hello!' }] }, { provider: APIProvider.OPENAI });
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message, code: error?.code }, { status: error?.statusCode || 500 });
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const body = await req.json().catch(() => ({}));

  if (searchParams.get('mock') === '1') {
    return NextResponse.json({
      id: 'chatcmpl-test',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: body?.model || 'gpt-4o',
      provider: 'openai',
      choices: [{ index: 0, message: { role: 'assistant', content: 'Mock POST OK' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3, estimated_cost: 0 }
    });
  }

  const [openaiKey, anthropicKey, googleKey] = await Promise.all([
    resolveApiKeyFor(req, 'openai'),
    resolveApiKeyFor(req, 'anthropic'),
    resolveApiKeyFor(req, 'google')
  ]);

  const client = createClient({
    apiKeys: {
      openai: openaiKey,
      anthropic: anthropicKey,
      google: googleKey
    }
  });

  try {
    const request = body?.request || { model: 'gpt-4o', messages: [{ role: 'user', content: 'Hello!' }] };
    const res = await client.chat(request, { provider: APIProvider.OPENAI });
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message, code: error?.code }, { status: error?.statusCode || 500 });
  }
}



