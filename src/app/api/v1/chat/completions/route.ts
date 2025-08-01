import { NextRequest, NextResponse } from 'next/server';

// OpenAI-compatible interfaces
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  name?: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

interface OpenAIFunctionCall {
  name: string;
  arguments: string;
}

interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: any;
  };
}

interface OpenAICompletionRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  user?: string;
  tools?: OpenAITool[];
  tool_choice?: 'none' | 'auto' | { type: 'function'; function: { name: string } };
  response_format?: { type: 'text' | 'json_object' };
}

interface OpenAICompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: 'assistant';
      content: string | null;
      tool_calls?: any[];
    };
    logprobs: null;
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  system_fingerprint?: string;
}

interface OpenAIStreamChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
      tool_calls?: any[];
    };
    logprobs: null;
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
  }[];
  system_fingerprint?: string;
}

// Provider routing logic
class ProviderRouter {
  private static getProviderFromModel(model: string): { provider: string; actualModel: string } {
    // OpenAI models
    if (model.startsWith('gpt-') || model.includes('o1-') || model.includes('davinci') || model.includes('curie')) {
      return { provider: 'openai', actualModel: model };
    }
    
    // Claude models
    if (model.includes('claude')) {
      return { provider: 'anthropic', actualModel: model };
    }
    
    // Google models
    if (model.includes('gemini') || model.includes('palm')) {
      return { provider: 'google', actualModel: model };
    }
    
    // Cohere models
    if (model.includes('command') || model.includes('coral')) {
      return { provider: 'cohere', actualModel: model };
    }
    
    // Hugging Face models
    if (model.includes('huggingface/') || model.includes('hf/')) {
      return { provider: 'huggingface', actualModel: model.replace('huggingface/', '').replace('hf/', '') };
    }
    
    // Local models
    if (model.includes('llama') || model.includes('mistral') || model.includes('codellama')) {
      return { provider: 'ollama', actualModel: model };
    }
    
    // Default to OpenAI for unknown models
    return { provider: 'openai', actualModel: model };
  }

  static async routeRequest(request: OpenAICompletionRequest, headers: Headers): Promise<OpenAICompletionResponse> {
    const { provider, actualModel } = this.getProviderFromModel(request.model);
    
    switch (provider) {
      case 'openai':
        return this.callOpenAI(request, actualModel, headers);
      case 'anthropic':
        return this.callAnthropic(request, actualModel, headers);
      case 'google':
        return this.callGoogle(request, actualModel, headers);
      case 'cohere':
        return this.callCohere(request, actualModel, headers);
      case 'huggingface':
        return this.callHuggingFace(request, actualModel, headers);
      case 'ollama':
        return this.callOllama(request, actualModel);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private static async callOpenAI(request: OpenAICompletionRequest, model: string, headers: Headers): Promise<OpenAICompletionResponse> {
    const apiKey = headers.get('authorization')?.replace('Bearer ', '') || headers.get('x-openai-key');
    
    if (!apiKey) {
      throw new Error('OpenAI API key required. Set Authorization header or x-openai-key header.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        model,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  private static async callAnthropic(request: OpenAICompletionRequest, model: string, headers: Headers): Promise<OpenAICompletionResponse> {
    const apiKey = headers.get('x-anthropic-key') || headers.get('authorization')?.replace('Bearer ', '');
    
    if (!apiKey) {
      throw new Error('Anthropic API key required. Set x-anthropic-key header.');
    }

    // Convert OpenAI format to Anthropic format
    const systemMessage = request.messages.find(m => m.role === 'system');
    const conversationMessages = request.messages.filter(m => m.role !== 'system');

    const anthropicRequest = {
      model,
      max_tokens: request.max_tokens || 1000,
      temperature: request.temperature,
      messages: conversationMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content || '',
      })),
      ...(systemMessage && { system: systemMessage.content }),
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicRequest),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API error: ${response.status} - ${error.error?.message || response.statusText}`);
    }

    const anthropicResponse = await response.json();

    // Convert Anthropic response to OpenAI format
    return {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: anthropicResponse.content[0]?.text || null,
        },
        logprobs: null,
        finish_reason: anthropicResponse.stop_reason === 'end_turn' ? 'stop' : 'length',
      }],
      usage: {
        prompt_tokens: anthropicResponse.usage?.input_tokens || 0,
        completion_tokens: anthropicResponse.usage?.output_tokens || 0,
        total_tokens: (anthropicResponse.usage?.input_tokens || 0) + (anthropicResponse.usage?.output_tokens || 0),
      },
    };
  }

  private static async callGoogle(request: OpenAICompletionRequest, model: string, headers: Headers): Promise<OpenAICompletionResponse> {
    const apiKey = headers.get('x-google-key') || headers.get('authorization')?.replace('Bearer ', '');
    
    if (!apiKey) {
      throw new Error('Google AI API key required. Set x-google-key header.');
    }

    // Convert OpenAI messages to Google format
    const contents = request.messages
      .filter(m => m.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content || '' }],
      }));

    const systemInstruction = request.messages.find(m => m.role === 'system')?.content;

    const googleRequest = {
      contents,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.max_tokens || 1000,
        topP: request.top_p,
      },
      ...(systemInstruction && { systemInstruction: { parts: [{ text: systemInstruction }] } }),
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleRequest),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Google AI API error: ${response.status} - ${error.error?.message || response.statusText}`);
    }

    const googleResponse = await response.json();

    // Convert Google response to OpenAI format
    return {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: googleResponse.candidates?.[0]?.content?.parts?.[0]?.text || null,
        },
        logprobs: null,
        finish_reason: googleResponse.candidates?.[0]?.finishReason === 'STOP' ? 'stop' : 'length',
      }],
      usage: {
        prompt_tokens: googleResponse.usageMetadata?.promptTokenCount || 0,
        completion_tokens: googleResponse.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: googleResponse.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  private static async callOllama(request: OpenAICompletionRequest, model: string): Promise<OpenAICompletionResponse> {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: request.messages.map(msg => ({
          role: msg.role,
          content: msg.content || '',
        })),
        stream: false,
        options: {
          temperature: request.temperature,
          num_predict: request.max_tokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const ollamaResponse = await response.json();

    // Convert Ollama response to OpenAI format
    return {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: ollamaResponse.message?.content || null,
        },
        logprobs: null,
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: ollamaResponse.prompt_eval_count || 0,
        completion_tokens: ollamaResponse.eval_count || 0,
        total_tokens: (ollamaResponse.prompt_eval_count || 0) + (ollamaResponse.eval_count || 0),
      },
    };
  }

  private static async callCohere(request: OpenAICompletionRequest, model: string, headers: Headers): Promise<OpenAICompletionResponse> {
    const apiKey = headers.get('x-cohere-key') || headers.get('authorization')?.replace('Bearer ', '');
    
    if (!apiKey) {
      throw new Error('Cohere API key required. Set x-cohere-key header.');
    }

    // Convert OpenAI format to Cohere format
    const conversationMessages = request.messages.filter(m => m.role !== 'system');
    const lastMessage = conversationMessages[conversationMessages.length - 1];
    
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error('Cohere requires the last message to be from user');
    }

    const systemMessage = request.messages.find(m => m.role === 'system');
    const preamble = systemMessage?.content || undefined;

    const cohereRequest = {
      model,
      message: lastMessage.content || '',
      max_tokens: request.max_tokens || 1000,
      temperature: request.temperature,
      p: request.top_p,
      ...(preamble && { preamble }),
      chat_history: conversationMessages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
        message: msg.content || '',
      })),
    };

    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cohereRequest),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Cohere API error: ${response.status} - ${error.message || response.statusText}`);
    }

    const cohereResponse = await response.json();

    // Convert Cohere response to OpenAI format
    return {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: cohereResponse.text || null,
        },
        logprobs: null,
        finish_reason: cohereResponse.finish_reason === 'COMPLETE' ? 'stop' : 'length',
      }],
      usage: {
        prompt_tokens: cohereResponse.meta?.tokens?.input_tokens || 0,
        completion_tokens: cohereResponse.meta?.tokens?.output_tokens || 0,
        total_tokens: (cohereResponse.meta?.tokens?.input_tokens || 0) + (cohereResponse.meta?.tokens?.output_tokens || 0),
      },
    };
  }

  private static async callHuggingFace(request: OpenAICompletionRequest, model: string, headers: Headers): Promise<OpenAICompletionResponse> {
    const apiKey = headers.get('x-huggingface-key') || headers.get('authorization')?.replace('Bearer ', '');
    
    if (!apiKey) {
      throw new Error('Hugging Face API key required. Set x-huggingface-key header.');
    }

    // Convert OpenAI messages to prompt format
    let prompt = '';
    const systemMessage = request.messages.find(m => m.role === 'system');
    if (systemMessage) {
      prompt += `System: ${systemMessage.content}\n\n`;
    }

    const conversationMessages = request.messages.filter(m => m.role !== 'system');
    conversationMessages.forEach(msg => {
      const role = msg.role === 'assistant' ? 'Assistant' : 'Human';
      prompt += `${role}: ${msg.content}\n`;
    });
    prompt += 'Assistant:';

    const hfRequest = {
      inputs: prompt,
      parameters: {
        max_new_tokens: request.max_tokens || 256,
        temperature: request.temperature || 0.7,
        top_p: request.top_p,
        return_full_text: false,
      },
    };

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hfRequest),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Hugging Face API error: ${response.status} - ${error.error || response.statusText}`);
    }

    const hfResponse = await response.json();

    // Handle different response formats
    let generatedText = '';
    if (Array.isArray(hfResponse)) {
      generatedText = hfResponse[0]?.generated_text || '';
    } else if (hfResponse.generated_text) {
      generatedText = hfResponse.generated_text;
    } else {
      generatedText = JSON.stringify(hfResponse);
    }

    // Convert Hugging Face response to OpenAI format
    return {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: generatedText.trim(),
        },
        logprobs: null,
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: Math.ceil(prompt.length / 4), // Rough estimation
        completion_tokens: Math.ceil(generatedText.length / 4), // Rough estimation
        total_tokens: Math.ceil((prompt.length + generatedText.length) / 4),
      },
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: OpenAICompletionRequest = await req.json();

    // Validate required fields
    if (!body.model) {
      return NextResponse.json(
        {
          error: {
            message: 'Model is required',
            type: 'invalid_request_error',
            param: 'model',
            code: null,
          }
        },
        { status: 400 }
      );
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        {
          error: {
            message: 'Messages must be a non-empty array',
            type: 'invalid_request_error',
            param: 'messages',
            code: null,
          }
        },
        { status: 400 }
      );
    }

    // Handle streaming by redirecting to streaming endpoint
    if (body.stream) {
      // Forward to streaming endpoint
      return fetch(`${req.nextUrl.origin}/api/v1/chat/completions/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(req.headers.entries()),
        },
        body: JSON.stringify(body),
      });
    }

    // Route the request through our provider system
    const response = await ProviderRouter.routeRequest(body, req.headers);

    return NextResponse.json(response);

  } catch (error) {
    console.error('OpenAI-compatible API error:', error);
    
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          type: 'api_error',
          param: null,
          code: null,
        }
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for API discovery
export async function GET() {
  return NextResponse.json({
    message: 'AI Marketplace Platform - OpenAI Compatible API',
    version: '1.0.0',
    endpoints: {
      'POST /v1/chat/completions': 'Chat completions with multi-provider routing',
    },
    supported_providers: [
      'OpenAI (gpt-4, gpt-3.5-turbo, etc.)',
      'Anthropic Claude (claude-3-5-sonnet, claude-3-haiku, etc.)',
      'Google AI (gemini-pro, gemini-1.5-pro, etc.)',
      'Local Ollama (llama, mistral, codellama, etc.)',
    ],
    documentation: 'https://docs.aimarketplace.dev/api',
  });
}