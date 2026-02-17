export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'azure-openai'
  | 'cohere'
  | 'mistral'
  | 'perplexity'
  | 'ollama';

export type Modality = 'text' | 'vision' | 'image' | 'audio' | 'video';

export interface ModelDef {
  id: string; // canonical id used in API calls
  provider: ProviderId;
  displayName: string;
  family?: string; // e.g., gpt-4o, claude-3-5, gemini-1.5
  modalities: Modality[];
  maxTokens?: number;
  supports?: { stream?: boolean; tools?: boolean; json?: boolean };
  aliases?: string[]; // alternative names users might use
  deprecated?: boolean;
}

/**
 * Static seed list. We can augment at runtime via provider list endpoints.
 */
export const STATIC_MODELS: ModelDef[] = [
  // OpenAI
  {
    id: 'gpt-4o',
    provider: 'openai',
    displayName: 'GPT-4o',
    family: 'gpt-4o',
    modalities: ['text', 'vision'],
    supports: { stream: true, tools: true, json: true },
    aliases: ['gpt4o']
  },
  // Azure OpenAI (same model families; deployment names vary)
  {
    id: 'gpt-4o',
    provider: 'azure-openai',
    displayName: 'Azure OpenAI (GPT-4o)',
    family: 'gpt-4o',
    modalities: ['text', 'vision'],
    supports: { stream: true, tools: true, json: true },
  },
  {
    id: 'gpt-4o-mini',
    provider: 'azure-openai',
    displayName: 'Azure OpenAI (GPT-4o mini)',
    family: 'gpt-4o',
    modalities: ['text', 'vision'],
    supports: { stream: true, json: true },
  },
  {
    id: 'gpt-4o-mini',
    provider: 'openai',
    displayName: 'GPT-4o mini',
    family: 'gpt-4o',
    modalities: ['text', 'vision'],
    supports: { stream: true, json: true }
  },
  // Anthropic
  {
    id: 'claude-3-5-sonnet-20240620',
    provider: 'anthropic',
    displayName: 'Claude 3.5 Sonnet',
    family: 'claude-3-5',
    modalities: ['text', 'vision'],
    supports: { stream: true, tools: true }
  },
  {
    id: 'claude-3-haiku-20240307',
    provider: 'anthropic',
    displayName: 'Claude 3 Haiku',
    family: 'claude-3',
    modalities: ['text'],
    supports: { stream: true }
  },
  // Google
  {
    id: 'gemini-1.5-pro',
    provider: 'google',
    displayName: 'Gemini 1.5 Pro',
    family: 'gemini-1.5',
    modalities: ['text', 'vision'],
    supports: { stream: true }
  },
  {
    id: 'gemini-1.5-flash',
    provider: 'google',
    displayName: 'Gemini 1.5 Flash',
    family: 'gemini-1.5',
    modalities: ['text', 'vision'],
    supports: { stream: true }
  },
  {
    id: 'gemini-veo-2',
    provider: 'google',
    displayName: 'Gemini Veo 2',
    family: 'gemini-veo',
    modalities: ['video']
  },
  // Mistral/Cohere/Perplexity placeholders (expand later)
  { id: 'mistral-large-latest', provider: 'mistral', displayName: 'Mistral Large Latest', modalities: ['text'], supports: { stream: true } },
  { id: 'ministral-8b', provider: 'mistral', displayName: 'Ministral 8B', modalities: ['text'], supports: { stream: true } },
  { id: 'command-r', provider: 'cohere', displayName: 'Cohere Command R', modalities: ['text'], supports: { stream: true, tools: true } },
  { id: 'command-r7b', provider: 'cohere', displayName: 'Cohere Command R7B', modalities: ['text'], supports: { stream: true } },
  { id: 'sonar-small-online', provider: 'perplexity', displayName: 'Perplexity Sonar Small Online', modalities: ['text'] },
  { id: 'sonar-large-online', provider: 'perplexity', displayName: 'Perplexity Sonar Large Online', modalities: ['text'] },
];

// In-memory dynamic cache (augments STATIC_MODELS)
let dynamicModels: ModelDef[] | null = null;
let lastFetchMs = 0;

export function listModels(filter?: { provider?: ProviderId; modality?: Modality }) {
  const all = [...STATIC_MODELS, ...(dynamicModels ?? [])];
  return all.filter((m) =>
    (!filter?.provider || m.provider === filter.provider) &&
    (!filter?.modality || m.modalities.includes(filter.modality))
  );
}

export function findModel(idOrAlias: string): ModelDef | undefined {
  const all = [...STATIC_MODELS, ...(dynamicModels ?? [])];
  const needle = idOrAlias.toLowerCase();
  return all.find((m) =>
    m.id.toLowerCase() === needle || m.aliases?.some((a) => a.toLowerCase() === needle)
  );
}

export function supports(model: ModelDef, feature: keyof NonNullable<ModelDef['supports']>) {
  return Boolean(model.supports?.[feature]);
}

/**
 * Optional: dynamic augmentation (no-op for now). We can add implementations
 * per provider and call periodically to refresh the cache.
 */
export async function refreshDynamicModels(force = false) {
  const now = Date.now();
  if (!force && dynamicModels && now - lastFetchMs < 24 * 60 * 60 * 1000) return;
  try {
    const results: ModelDef[] = [];

    // OpenAI (optional) – requires OPENAI_API_KEY
    try {
      const key = process.env.OPENAI_API_KEY;
      if (key) {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${key}` },
          next: { revalidate: 86400 },
        });
        if (res.ok) {
          const data = await res.json();
          const mapped: ModelDef[] = (data.data || [])
            .filter((m: any) => typeof m.id === 'string')
            .map((m: any) => ({
              id: m.id,
              provider: 'openai',
              displayName: m.id,
              modalities: ['text'],
            }));
          results.push(...mapped);
        }
      }
    } catch {}

    // Google Generative Language (optional) – requires GOOGLE_API_KEY
    try {
      const key = process.env.GOOGLE_API_KEY;
      if (key) {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {
          next: { revalidate: 86400 },
        });
        if (res.ok) {
          const data = await res.json();
          const mapped: ModelDef[] = (data.models || [])
            .filter((m: any) => typeof m.name === 'string')
            .map((m: any) => ({
              id: (m.name as string).replace('models/', ''),
              provider: 'google',
              displayName: m.displayName || m.name,
              modalities: ['text'],
            }));
          results.push(...mapped);
        }
      }
    } catch {}

    // Ollama (local optional)
    try {
      const res = await fetch('http://localhost:11434/api/tags', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const mapped: ModelDef[] = (data.models || [])
          .filter((m: any) => typeof m.name === 'string')
          .map((m: any) => ({
            id: m.name,
            provider: 'ollama',
            displayName: `Ollama: ${m.name}`,
            modalities: ['text'],
          }));
        results.push(...mapped);
      }
    } catch {}

    dynamicModels = results;
    lastFetchMs = now;
  } catch {
    // keep prior cache
  }
}


