### COSMARA Developer Update — 8-10-25

**What’s new**
- CI wired with provider secrets: `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `ANTHROPIC_API_KEY` for model refresh and checks
- Added dynamic model refresh for OpenAI, Google, Ollama; Models & Providers docs page with search/filter/refresh
- Setup page now includes a registry-backed Model Picker
- Fixed UI import by adding shadcn-style `Select`
- Expanded model registry seeds: OpenAI, Anthropic, Google (incl. Veo), plus seeds for Azure OpenAI, Cohere, Mistral, Perplexity
- Chat API now supports providers: OpenAI, Anthropic, Google, Ollama, Azure OpenAI, Cohere, Mistral, Perplexity
- Provider test endpoint extended to validate Cohere, Mistral, Perplexity (soft pass for Azure)
- Claude Code prompt updated to align with Next.js 15, BYOK, SDK use, Tailwind PostCSS guidance, and safe example references

**How to add your keys**
- In-app: `/setup` → select provider → Connect & Test (BYOK). Signed-in: encrypted in account; guest: localStorage.
- Optional for docs/CI: add `.env.local` with `OPENAI_API_KEY`, `GOOGLE_API_KEY` to enable dynamic model refresh locally.

**Supported providers (runtime)**
- OpenAI (gpt-4o, gpt-4o-mini)
- Anthropic (claude-3-5-sonnet-20240620, claude-3-haiku-20240307)
- Google (gemini-1.5-pro, gemini-1.5-flash, gemini-veo-2)
- Azure OpenAI (deployment-based; provide endpoint/deployment headers)
- Cohere (command-r, command-r7b)
- Mistral (mistral-large-latest, ministral-8b)
- Perplexity (sonar-small/large-online)
- Ollama (local; no key)

**Next up**
- Azure setup UX in `/setup` (endpoint + deployment fields) and header plumbing
- Centralized client header helper to pass provider keys to `/api/ai/chat`
- Streaming API `/api/ai/chat/stream` + demo + E2E for SSE
- Model capabilities/pricing table in Docs
- Dynamic list fetchers for Cohere/Mistral/Perplexity (where available)
- Provider health panel on `/setup`
- Developer validator: sample chat check and clearer error surfacing
- Unit tests for provider parameter validation and error handling
- Sync other agent prompts (Copilot/Cursor/Windsurf) with latest guidance

Questions or feedback? Open an issue or ping us in the Developers section.


