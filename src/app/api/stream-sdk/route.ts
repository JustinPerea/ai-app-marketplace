import { NextRequest } from 'next/server';
import { createClient, APIProvider } from '@cosmara-ai/community-sdk';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const [openaiKey, anthropicKey, googleKey] = await Promise.all([
        fetch(req.nextUrl.origin + '/api/keys/active?provider=openai', { headers: { cookie: req.headers.get('cookie') || '' }, cache: 'no-store' })
          .then(r => r.ok ? r.json() : { apiKey: undefined }).then(j => j.apiKey),
        fetch(req.nextUrl.origin + '/api/keys/active?provider=anthropic', { headers: { cookie: req.headers.get('cookie') || '' }, cache: 'no-store' })
          .then(r => r.ok ? r.json() : { apiKey: undefined }).then(j => j.apiKey),
        fetch(req.nextUrl.origin + '/api/keys/active?provider=google', { headers: { cookie: req.headers.get('cookie') || '' }, cache: 'no-store' })
          .then(r => r.ok ? r.json() : { apiKey: undefined }).then(j => j.apiKey),
      ]);

      const client = createClient({
        apiKeys: { openai: openaiKey, anthropic: anthropicKey, google: googleKey }
      });

      try {
        for await (const chunk of client.chatStream({ model: 'gpt-4o', messages: [{ role: 'user', content: 'Stream via SDK' }] }, { provider: APIProvider.OPENAI })) {
          const delta = chunk?.choices?.[0]?.delta?.content || '';
          if (delta) controller.enqueue(encoder.encode(`data: ${delta}\n\n`));
        }
      } catch (e) {
        controller.enqueue(encoder.encode(`data: [error]\n\n`));
      } finally {
        controller.enqueue(encoder.encode('data: done\n\n'));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}


