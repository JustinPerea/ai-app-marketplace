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
      const res = await fetch('/api/sdk-test', { method: 'POST', body: JSON.stringify({ request: { messages: [{ role: 'user', content: 'Stream?' }] } }), headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      setOutput(JSON.stringify(data, null, 2));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // no auto-call; let user choose
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">SDK Test</h1>
      <div className="flex gap-2 mb-4">
        <button className="px-4 py-2 rounded border" onClick={callMock}>Mock</button>
        <button className="px-4 py-2 rounded border" onClick={callServer}>Server (BYOK)</button>
        <button className="px-4 py-2 rounded border" onClick={callStream}>POST</button>
      </div>
      <pre className="glass-card p-4 rounded border text-sm whitespace-pre-wrap">{output}</pre>
    </div>
  );
}


