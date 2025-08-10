'use client';

import { useEffect, useMemo, useState } from 'react';
import { listModels, refreshDynamicModels, ModelDef } from '@/lib/ai/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ModelsDocsPage() {
  const [provider, setProvider] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const models = useMemo(() => {
    if (provider === 'all') return listModels();
    return listModels({ provider: provider as any });
  }, [provider]);

  const filtered = useMemo<ModelDef[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return models;
    return models.filter(m =>
      m.id.toLowerCase().includes(q) ||
      m.displayName.toLowerCase().includes(q) ||
      (m.family?.toLowerCase().includes(q) ?? false)
    );
  }, [models, query]);

  const refresh = async () => {
    setRefreshing(true);
    try { await refreshDynamicModels(true); } finally { setRefreshing(false); }
  };

  useEffect(() => { refreshDynamicModels(false); }, []);

  const providers = ['all','openai','anthropic','google','azure-openai','cohere','mistral','perplexity','ollama'];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Models & Providers</h1>
      <p className="text-text-secondary mb-6">Search or filter the supported models. This list is a combination of curated defaults and optional dynamic fetches (OpenAI/Google/Ollama).</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {providers.map(p => (
          <button
            key={p}
            onClick={() => setProvider(p)}
            className={`px-3 py-1.5 rounded border ${provider===p? 'bg-white/10 border-white/30':'border-white/10 hover:border-white/20'}`}
          >{p}</button>
        ))}
        <div className="ml-auto flex gap-2 items-center">
          <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search models" />
          <button onClick={refresh} className="px-3 py-1.5 rounded border border-white/10 hover:border-white/20">{refreshing? 'Refreshing...':'Refresh'}</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => (
          <Card key={`${m.provider}:${m.id}`} className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">{m.displayName} <span className="text-xs text-text-secondary">({m.id})</span></CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-text-secondary">
              <div>Provider: <span className="text-text-primary font-medium">{m.provider}</span></div>
              {m.family && <div>Family: {m.family}</div>}
              <div>Modalities: {m.modalities.join(', ')}</div>
              {m.supports && (
                <div>Supports: {Object.entries(m.supports).filter(([_,v])=>v).map(([k])=>k).join(', ') || 'basic'}</div>
              )}
              {m.deprecated && <div className="text-amber-400">Deprecated</div>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


