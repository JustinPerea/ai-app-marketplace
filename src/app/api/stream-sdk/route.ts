import { NextRequest } from 'next/server';
import { createChat } from '@byok-marketplace/sdk';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const chat = createChat({
        resolveApiKey: async (provider) => {
          const r = await fetch(req.nextUrl.origin + '/api/keys/active?provider=' + provider, {
            headers: { cookie: req.headers.get('cookie') || '' },
            cache: 'no-store'
          });
          if (!r.ok) return undefined;
          const { apiKey } = await r.json();
          return apiKey as string;
        }
      });

      try {
        for await (const chunk of chat.stream({
          messages: [{ role: 'user', content: 'Stream via SDK' }],
          stream: true
        })) {
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


