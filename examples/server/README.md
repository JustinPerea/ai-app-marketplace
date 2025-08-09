# Cosmara Examples — Server (Node/Express)

Quick minimal example showing how to use `@cosmara-ai/community-sdk` in a server-only context.

## Run

```bash
npm i
node server.js
```

Then POST to `http://localhost:4001/chat` with a JSON body:

```json
{
  "messages": [{ "role": "user", "content": "Hello from example" }]
}
```

Environment variables:
- `OPENAI_API_KEY` (optional for validation-only; required for real OpenAI calls)


