import { NextRequest, NextResponse } from 'next/server';

// OpenAI-compatible streaming interfaces
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  name?: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

interface OpenAICompletionRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream: true; // Always true for this endpoint
  stop?: string | string[];
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  user?: string;
  tools?: any[];
  tool_choice?: any;
  response_format?: { type: 'text' | 'json_object' };
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

// Streaming provider implementations
class StreamingProviderRouter {
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
    
    // Local models
    if (model.includes('llama') || model.includes('mistral') || model.includes('codellama')) {
      return { provider: 'ollama', actualModel: model };
    }
    
    // Default to OpenAI for unknown models
    return { provider: 'openai', actualModel: model };
  }

  static async *streamRequest(request: OpenAICompletionRequest, headers: Headers): AsyncGenerator<OpenAIStreamChunk> {
    const { provider, actualModel } = this.getProviderFromModel(request.model);
    
    switch (provider) {
      case 'openai':
        yield* this.streamOpenAI(request, actualModel, headers);
        break;
      case 'anthropic':
        yield* this.streamAnthropic(request, actualModel, headers);
        break;
      case 'google':
        yield* this.streamGoogle(request, actualModel, headers);
        break;
      case 'ollama':
        yield* this.streamOllama(request, actualModel);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private static async *streamOpenAI(request: OpenAICompletionRequest, model: string, headers: Headers): AsyncGenerator<OpenAIStreamChunk> {
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
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${error.error?.message || response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body received from OpenAI');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              yield parsed;
            } catch (e) {
              // Skip invalid JSON
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private static async *streamAnthropic(request: OpenAICompletionRequest, model: string, headers: Headers): AsyncGenerator<OpenAIStreamChunk> {
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
      stream: true,
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

    if (!response.body) {
      throw new Error('No response body received from Anthropic');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const id = `chatcmpl-${Date.now()}`;
    const created = Math.floor(Date.now() / 1000);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                // Convert Anthropic streaming format to OpenAI format
                yield {
                  id,
                  object: 'chat.completion.chunk',
                  created,
                  model: request.model,
                  choices: [{
                    index: 0,
                    delta: {
                      content: parsed.delta.text,
                    },
                    logprobs: null,
                    finish_reason: null,
                  }],
                };
              } else if (parsed.type === 'message_stop') {
                // Send final chunk with finish_reason
                yield {
                  id,
                  object: 'chat.completion.chunk',
                  created,
                  model: request.model,
                  choices: [{
                    index: 0,
                    delta: {},
                    logprobs: null,
                    finish_reason: 'stop',
                  }],
                };
              }
            } catch (e) {
              // Skip invalid JSON
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private static async *streamGoogle(request: OpenAICompletionRequest, model: string, headers: Headers): AsyncGenerator<OpenAIStreamChunk> {
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`, {
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

    if (!response.body) {
      throw new Error('No response body received from Google AI');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const id = `chatcmpl-${Date.now()}`;
    const created = Math.floor(Date.now() / 1000);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
                // Convert Google streaming format to OpenAI format
                yield {
                  id,
                  object: 'chat.completion.chunk',
                  created,
                  model: request.model,
                  choices: [{
                    index: 0,
                    delta: {
                      content: parsed.candidates[0].content.parts[0].text,
                    },
                    logprobs: null,
                    finish_reason: null,
                  }],
                };
              }
            } catch (e) {
              // Skip invalid JSON
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Send final chunk
    yield {
      id,
      object: 'chat.completion.chunk',
      created,
      model: request.model,
      choices: [{
        index: 0,
        delta: {},
        logprobs: null,
        finish_reason: 'stop',
      }],
    };
  }

  private static async *streamOllama(request: OpenAICompletionRequest, model: string): AsyncGenerator<OpenAIStreamChunk> {
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
        stream: true,
        options: {
          temperature: request.temperature,
          num_predict: request.max_tokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body received from Ollama');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const id = `chatcmpl-${Date.now()}`;
    const created = Math.floor(Date.now() / 1000);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            
            if (parsed.message?.content) {
              // Convert Ollama streaming format to OpenAI format
              yield {
                id,
                object: 'chat.completion.chunk',
                created,
                model: request.model,
                choices: [{
                  index: 0,
                  delta: {
                    content: parsed.message.content,
                  },
                  logprobs: null,
                  finish_reason: parsed.done ? 'stop' : null,
                }],
              };
            }

            if (parsed.done) {
              break;
            }
          } catch (e) {
            // Skip invalid JSON
            continue;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
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

    // Set up Server-Sent Events response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          for await (const chunk of StreamingProviderRouter.streamRequest(body, req.headers)) {
            const data = `data: ${JSON.stringify(chunk)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
          
          // Send final [DONE] message
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          const errorChunk = {
            error: {
              message: error instanceof Error ? error.message : 'An unexpected error occurred',
              type: 'api_error',
              param: null,
              code: null,
            }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-openai-key, x-anthropic-key, x-google-key',
      },
    });

  } catch (error) {
    console.error('Streaming API error:', error);
    
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