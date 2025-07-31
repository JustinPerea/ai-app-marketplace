import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  provider: string;
  model: string;
}

// Get API key from localStorage (would be sent in headers in real implementation)
async function getApiKey(provider: string): Promise<string | null> {
  // In a real implementation, this would get the key from secure storage
  // For now, we'll try to get it from the request headers or return null
  return null;
}

async function callOpenAI(messages: ChatMessage[], model: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response generated';
}

async function callAnthropic(messages: ChatMessage[], model: string, apiKey: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 1000,
      messages: messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0]?.text || 'No response generated';
}

async function callGoogleAI(messages: ChatMessage[], model: string, apiKey: string) {
  // Convert messages to Google AI format - take only the user message for simplicity
  const userMessage = messages.find(m => m.role === 'user')?.content || messages[messages.length - 1]?.content || 'Hello';
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: userMessage }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `Google AI API error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  const data = await response.json();  
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
}

async function callOllama(messages: ChatMessage[], model: string) {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.message?.content || 'No response generated';
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { messages, provider, model } = body;

    if (!messages || !provider || !model) {
      return NextResponse.json(
        { error: 'Missing required fields: messages, provider, model' },
        { status: 400 }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages must be a non-empty array' },
        { status: 400 }
      );
    }

    let response: string;

    switch (provider.toUpperCase()) {
      case 'OPENAI': {
        const apiKey = req.headers.get('x-openai-key');
        if (!apiKey) {
          return NextResponse.json(
            { error: 'OpenAI API key not provided. Please add your API key in the Setup page.' },
            { status: 401 }
          );
        }
        response = await callOpenAI(messages, model, apiKey);
        break;
      }

      case 'ANTHROPIC': {
        const apiKey = req.headers.get('x-anthropic-key');
        if (!apiKey) {
          return NextResponse.json(
            { error: 'Anthropic API key not provided. Please add your API key in the Setup page.' },
            { status: 401 }
          );
        }
        response = await callAnthropic(messages, model, apiKey);
        break;
      }

      case 'GOOGLE': {
        const apiKey = req.headers.get('x-google-key');
        if (!apiKey) {
          return NextResponse.json(
            { error: 'Google AI API key not provided. Please add your API key in the Setup page.' },
            { status: 401 }
          );
        }
        response = await callGoogleAI(messages, model, apiKey);
        break;
      }

      case 'LOCAL':
      case 'OLLAMA': {
        response = await callOllama(messages, model);
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unsupported provider: ${provider}. Supported providers: OPENAI, ANTHROPIC, GOOGLE, LOCAL` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      response,
      provider,
      model,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        provider: '',
        model: '',
      },
      { status: 500 }
    );
  }
}