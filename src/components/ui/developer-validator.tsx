'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

type Provider = 'openai' | 'anthropic' | 'google';

export default function DeveloperValidator() {
  const [appName, setAppName] = useState('your-app');
  const [provider, setProvider] = useState<Provider>('openai');
  const [prompt, setPrompt] = useState('Say hello from my app.');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    setLoading(true);
    try {
      const apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '{}');
      const res = await fetch('/api/developers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName, provider, prompt, apiKeys }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Validation failed');
      setResult(data);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Developer Validator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="app folder name" />
          <Select value={provider} onValueChange={(v) => setProvider(v as Provider)}>
            <SelectTrigger><SelectValue placeholder="Provider" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="google">Google</SelectItem>
            </SelectContent>
          </Select>
          <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Test prompt" />
        </div>
        <Button onClick={run} disabled={loading}>{loading ? 'Validating...' : 'Run validation'}</Button>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        {result && (
          <pre className="text-xs whitespace-pre-wrap bg-black/40 rounded p-3 overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
        )}
      </CardContent>
    </Card>
  );
}


