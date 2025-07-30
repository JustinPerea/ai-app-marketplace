import { NextRequest, NextResponse } from 'next/server';

/**
 * Test API Provider Connection
 * POST /api/test-provider
 * 
 * Tests if an API key is valid for a specific provider
 */
export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey } = await request.json();

    if (!provider || !apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Provider and API key are required'
      }, { status: 400 });
    }

    // Test the API key based on provider
    const result = await testProviderConnection(provider, apiKey);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Provider test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test provider connection'
    }, { status: 500 });
  }
}

async function testProviderConnection(provider: string, apiKey: string) {
  try {
    switch (provider.toLowerCase()) {
      case 'openai':
        return await testOpenAI(apiKey);
      
      case 'anthropic':
        return await testAnthropic(apiKey);
      
      case 'google':
      case 'google-ai':
        return await testGoogleAI(apiKey);
      
      case 'cohere':
        return await testCohere(apiKey);
      
      case 'huggingface':
        return await testHuggingFace(apiKey);
      
      default:
        return {
          success: false,
          error: `Provider "${provider}" is not supported`
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

async function testOpenAI(apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
  }

  return {
    success: true,
    message: 'OpenAI connection successful',
    provider: 'openai'
  };
}

async function testAnthropic(apiKey: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hello' }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Anthropic API error: ${response.status}`);
  }

  return {
    success: true,
    message: 'Anthropic connection successful',
    provider: 'anthropic'
  };
}

async function testGoogleAI(apiKey: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: 'Hello' }]
      }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Google AI API error: ${response.status}`);
  }

  return {
    success: true,
    message: 'Google AI connection successful',
    provider: 'google-ai'
  };
}

async function testCohere(apiKey: string) {
  const response = await fetch('https://api.cohere.ai/v1/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'command-light',
      prompt: 'Hello',
      max_tokens: 10
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Cohere API error: ${response.status}`);
  }

  return {
    success: true,
    message: 'Cohere connection successful',
    provider: 'cohere'
  };
}

async function testHuggingFace(apiKey: string) {
  const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: 'Hello'
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Hugging Face API error: ${response.status}`);
  }

  return {
    success: true,
    message: 'Hugging Face connection successful',
    provider: 'huggingface'
  };
}