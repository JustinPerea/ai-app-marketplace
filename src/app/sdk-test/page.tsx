'use client';

import { useEffect, useState } from 'react';

export default function SDKTestPage() {
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const callServer = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sdk-test');
      const data = await res.json();
      setOutput(JSON.stringify(data, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const callMock = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sdk-test?mock=1');
      const data = await res.json();
      setOutput(JSON.stringify(data, null, 2));
    } finally {
      setLoading(false);
    }
  };

  // Simple streaming check via server route (if you add one later)
  const callStream = async () => {
    setLoading(true);
    try {
      setOutput('');
      const es = new EventSource('/api/sdk-stream');
      es.onmessage = (ev) => {
        const data = ev.data ?? '';
        setOutput((prev) => (prev ? prev + '\n' + data : data));
        if (data === 'done') {
          es.close();
          setLoading(false);
        }
      };
      es.onerror = () => {
        es.close();
        setLoading(false);
      };
      // Return early; state updates happen via events
      return;
    } finally {
      // loading state cleared in handlers
    }
  };

  useEffect(() => {
    // no auto-call; let user choose
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">SDK Test</h1>
      <p className="text-sm text-gray-500 mb-4">
        See the streaming example in <a href="/developers/docs#examples" className="underline">Developers → Docs → Code Examples</a>.
      </p>
      <div className="flex gap-2 mb-4">
        <button className="px-4 py-2 rounded border" onClick={callMock}>Mock</button>
        <button className="px-4 py-2 rounded border" onClick={callServer}>Server (BYOK)</button>
        <button className="px-4 py-2 rounded border" onClick={callStream}>Stream SSE</button>
      </div>
      <pre className="glass-card p-4 rounded border text-sm whitespace-pre-wrap">{output}</pre>
    </div>
  );
}


