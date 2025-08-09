import express from 'express';
import { createClient, APIProvider } from '@cosmara-ai/community-sdk';

const app = express();
app.use(express.json());

const client = createClient({
  apiKeys: {
    [APIProvider.OPENAI]: process.env.OPENAI_API_KEY,
  },
});

app.post('/chat', async (req, res) => {
  try {
    const body = req.body || {};
    const result = await client.chat(
      {
        model: 'gpt-4o',
        messages: body.messages || [{ role: 'user', content: 'Hello from example' }],
      },
      { provider: APIProvider.OPENAI }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Unknown error' });
  }
});

const port = process.env.PORT || 4001;
app.listen(port, () => {
  console.log(`Example server listening on http://localhost:${port}`);
});


