export const runtime = 'edge';

import { createClient, APIProvider } from '@cosmara-ai/community-sdk';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get('mock') === '1') {
      return new Response(JSON.stringify({ ok: true, provider: 'mock', message: 'Edge OK' }), { headers: { 'Content-Type': 'application/json' } });
    }

    const client = createClient({ apiKeys: {} });
    await client.chat({ model: 'gpt-4o', messages: [{ role: 'user', content: 'Hello from Edge' }] }, { provider: APIProvider.OPENAI });
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e), code: e?.code }), { headers: { 'Content-Type': 'application/json' }, status: 200 });
  }
}



