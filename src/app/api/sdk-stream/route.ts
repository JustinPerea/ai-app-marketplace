export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      const send = (data: string) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // Heartbeat to keep connection open in some environments
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`:\n\n`));
      }, 15000);

      // Simulated stream chunks
      send('hello');
      setTimeout(() => send('this is'), 150);
      setTimeout(() => send('a streamed'), 300);
      setTimeout(() => send('response'), 450);
      setTimeout(() => {
        send('done');
        clearInterval(heartbeat);
        closed = true;
        controller.close();
      }, 650);
    },
    cancel() {
      // no-op
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


