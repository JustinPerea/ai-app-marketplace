'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Input } from './input';
import { listModels, ProviderId, ModelDef } from '@/lib/ai/models';

export default function ModelPicker() {
  const [provider, setProvider] = useState<ProviderId>('openai');
  const [query, setQuery] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('defaultModel');
      if (saved) setModel(saved);
      const savedProv = localStorage.getItem('defaultProvider') as ProviderId | null;
      if (savedProv) setProvider(savedProv);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('defaultModel', model);
      localStorage.setItem('defaultProvider', provider);
    } catch {}
  }, [model, provider]);

  const models = useMemo(() => listModels({ provider }), [provider]);
  const filtered = useMemo<ModelDef[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return models;
    return models.filter(m =>
      m.id.toLowerCase().includes(q) ||
      m.displayName.toLowerCase().includes(q) ||
      (m.family?.toLowerCase().includes(q) ?? false)
    );
  }, [models, query]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Default Model (optional)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select value={provider} onValueChange={(v) => setProvider(v as ProviderId)}>
            <SelectTrigger><SelectValue placeholder="Provider" /></SelectTrigger>
            <SelectContent>
              {(['openai','anthropic','google','mistral','cohere','perplexity','ollama'] as ProviderId[]).map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Search models" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select value={model} onValueChange={(v) => setModel(v)}>
            <SelectTrigger><SelectValue placeholder="Model" /></SelectTrigger>
            <SelectContent>
              {filtered.map(m => (
                <SelectItem key={m.id} value={m.id}>
                  {m.displayName} ({m.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-text-secondary">
          Tip: Apps can override this per request. Features differ by model (stream/tools/json).
        </p>
      </CardContent>
    </Card>
  );
}


