/**
 * Provider Tests
 * 
 * Tests for OpenAI and Claude provider implementations
 */

import { OpenAIProvider, ClaudeProvider, providerRegistry } from '../providers';
import { openai, claude } from '../providers';
import {
  createTestChatRequest,
  createTestChatResponse,
  createMockResponse,
  createMockStreamResponse,
  createTestStreamChunk,
  simulateRateLimitError,
  simulateAuthError
} from './setup';

describe('OpenAI Provider', () => {
  let provider: OpenAIProvider;

  beforeEach(() => {
    const config = openai({ apiKey: 'test-key', model: 'gpt-4o' });
    provider = new OpenAIProvider(config);

    // Mock successful response by default
    (global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse(createTestChatResponse())
    );
  });

  describe('configuration', () => {
    it('creates provider with valid config', () => {
      expect(provider).toBeInstanceOf(OpenAIProvider);
      expect(provider.getCapabilities()).toMatchObject({
        chat: true,
        images: true,
        tools: true,
        streaming: true,
        vision: true
      });
    });

    it('validates OpenAI models', () => {
      expect(provider.validateModel('gpt-4o')).toBe(true);
      expect(provider.validateModel('gpt-3.5-turbo')).toBe(true);
      expect(provider.validateModel('invalid-model')).toBe(false);
    });

    it('returns available models', () => {
      const models = provider.getAvailableModels();
      expect(models).toContain('gpt-4o');
      expect(models).toContain('gpt-3.5-turbo');
      expect(models.length).toBeGreaterThan(0);
    });
  });

  describe('chat completion', () => {
    it('makes chat completion request', async () => {
      const request = createTestChatRequest();
      const response = await provider.chatCompletion(request);

      expect(response).toMatchObject({
        provider: 'openai',
        choices: expect.arrayContaining([
          expect.objectContaining({
            message: expect.objectContaining({
              role: 'assistant',
              content: expect.any(String)
            })
          })
        ]),
        usage: expect.objectContaining({
          prompt_tokens: expect.any(Number),
          completion_tokens: expect.any(Number),
          total_tokens: expect.any(Number),
          estimated_cost: expect.any(Number)
        })
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key',
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"model":"gpt-4o"')
        })
      );
    });

    it('handles OpenAI-specific parameters', async () => {
      const request = createTestChatRequest({
        temperature: 0.8,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.2,
        stop: ['END'],
        user: 'test-user'
      });

      await provider.chatCompletion(request);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody).toMatchObject({
        temperature: 0.8,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.2,
        stop: ['END'],
        user: 'test-user'
      });
    });

    it('handles tools in request', async () => {
      const request = createTestChatRequest({
        tools: [{
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get weather information',
            parameters: {
              type: 'object',
              properties: {
                location: { type: 'string' }
              }
            }
          }
        }],
        tool_choice: 'auto'
      });

      await provider.chatCompletion(request);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.tools).toHaveLength(1);
      expect(callBody.tools[0].function.name).toBe('get_weather');
      expect(callBody.tool_choice).toBe('auto');
    });
  });

  describe('streaming', () => {
    it('streams chat completion', async () => {
      const chunks = [
        createTestStreamChunk('Hello'),
        createTestStreamChunk(' there'),
        createTestStreamChunk('!')
      ];

      (global.fetch as jest.Mock).mockResolvedValue(
        createMockStreamResponse(chunks)
      );

      const request = createTestChatRequest({ stream: true });
      const stream = provider.streamChatCompletion(request);

      const receivedChunks = [];
      for await (const chunk of stream) {
        receivedChunks.push(chunk);
      }

      expect(receivedChunks).toHaveLength(3);
      expect(receivedChunks[0].choices[0].delta.content).toBe('Hello');
      expect(receivedChunks[1].choices[0].delta.content).toBe(' there');
      expect(receivedChunks[2].choices[0].delta.content).toBe('!');
    });
  });

  describe('image generation', () => {
    it('generates images', async () => {
      const imageResponse = {
        created: Math.floor(Date.now() / 1000),
        data: [{
          url: 'https://example.com/image.png',
          revised_prompt: 'A beautiful landscape'
        }]
      };

      (global.fetch as jest.Mock).mockResolvedValue(
        createMockResponse(imageResponse)
      );

      const request = {
        prompt: 'A beautiful landscape',
        n: 1,
        size: '1024x1024' as const
      };

      const response = await provider.generateImages(request);

      expect(response).toMatchObject({
        provider: 'openai',
        data: expect.arrayContaining([
          expect.objectContaining({
            url: 'https://example.com/image.png'
          })
        ])
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/images/generations',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"prompt":"A beautiful landscape"')
        })
      );
    });
  });

  describe('error handling', () => {
    it('handles rate limit errors', async () => {
      simulateRateLimitError();

      const request = createTestChatRequest();

      await expect(provider.chatCompletion(request)).rejects.toBeRateLimitError();
    });

    it('handles authentication errors', async () => {
      simulateAuthError();

      const request = createTestChatRequest();

      await expect(provider.chatCompletion(request)).rejects.toBeAuthError();
    });

    it('transforms OpenAI errors to unified format', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        createMockResponse({
          error: {
            message: 'Model not found',
            type: 'invalid_request_error',
            param: 'model',
            code: 'model_not_found'
          }
        }, 400)
      );

      const request = createTestChatRequest();

      await expect(provider.chatCompletion(request)).rejects.toMatchObject({
        code: 'OPENAI_API_ERROR',
        provider: 'openai',
        statusCode: 400
      });
    });
  });

  describe('cost estimation', () => {
    it('estimates cost for requests', () => {
      const request = createTestChatRequest();
      const cost = provider.estimateCost(request);

      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('calculates cost based on model pricing', () => {
      const gpt4Request = createTestChatRequest({ model: 'gpt-4' });
      const gpt35Request = createTestChatRequest({ model: 'gpt-3.5-turbo' });

      const gpt4Cost = provider.estimateCost(gpt4Request);
      const gpt35Cost = provider.estimateCost(gpt35Request);

      expect(gpt4Cost).toBeGreaterThan(gpt35Cost); // GPT-4 should be more expensive
    });
  });

  describe('health check', () => {
    it('returns healthy status on successful connection', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        createMockResponse({ data: [] }) // Models endpoint response
      );

      const health = await provider.healthCheck();

      expect(health).toMatchObject({
        provider: 'openai',
        healthy: true,
        latency: expect.any(Number),
        capabilities: expect.any(Object)
      });
    });

    it('returns unhealthy status on connection failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      const health = await provider.healthCheck();

      expect(health).toMatchObject({
        provider: 'openai',
        healthy: false,
        error: expect.any(String)
      });
    });
  });
});

describe('Claude Provider', () => {
  let provider: ClaudeProvider;

  beforeEach(() => {
    const config = claude({ apiKey: 'test-key', model: 'claude-3-5-sonnet-20241022' });
    provider = new ClaudeProvider(config);

    // Mock successful Claude response by default
    (global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({
        id: 'msg_test_123',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'Hello! How can I help you today?' }],
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 10,
          output_tokens: 15
        }
      })
    );
  });

  describe('configuration', () => {
    it('creates provider with valid config', () => {
      expect(provider).toBeInstanceOf(ClaudeProvider);
      expect(provider.getCapabilities()).toMatchObject({
        chat: true,
        images: false, // Claude doesn't generate images
        tools: true,
        streaming: true,
        vision: true
      });
    });

    it('validates Claude models', () => {
      expect(provider.validateModel('claude-3-5-sonnet-20241022')).toBe(true);
      expect(provider.validateModel('claude-3-haiku-20240307')).toBe(true);
      expect(provider.validateModel('gpt-4')).toBe(false);
    });

    it('returns available models', () => {
      const models = provider.getAvailableModels();
      expect(models).toContain('claude-3-5-sonnet-20241022');
      expect(models).toContain('claude-3-haiku-20240307');
      expect(models.length).toBeGreaterThan(0);
    });
  });

  describe('chat completion', () => {
    it('makes chat completion request', async () => {
      const request = createTestChatRequest();
      const response = await provider.chatCompletion(request);

      expect(response).toMatchObject({
        provider: 'claude',
        choices: expect.arrayContaining([
          expect.objectContaining({
            message: expect.objectContaining({
              role: 'assistant',
              content: expect.any(String)
            })
          })
        ]),
        usage: expect.objectContaining({
          prompt_tokens: expect.any(Number),
          completion_tokens: expect.any(Number),
          total_tokens: expect.any(Number),
          estimated_cost: expect.any(Number)
        })
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key',
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          })
        })
      );
    });

    it('transforms system messages correctly', async () => {
      const request = createTestChatRequest({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello' }
        ]
      });

      await provider.chatCompletion(request);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.system).toBe('You are a helpful assistant.');
      expect(callBody.messages).toHaveLength(1); // Only user message in messages array
      expect(callBody.messages[0].role).toBe('user');
    });

    it('handles multimodal content', async () => {
      const request = createTestChatRequest({
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'What is in this image?' },
            { 
              type: 'image_url', 
              image_url: { 
                url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcU...' 
              } 
            }
          ]
        }]
      });

      await provider.chatCompletion(request);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.messages[0].content).toHaveLength(2);
      expect(callBody.messages[0].content[0].type).toBe('text');
      expect(callBody.messages[0].content[1].type).toBe('image');
    });
  });

  describe('error handling', () => {
    it('handles Claude-specific errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        createMockResponse({
          error: {
            type: 'invalid_request_error',
            message: 'Invalid model'
          }
        }, 400)
      );

      const request = createTestChatRequest();

      await expect(provider.chatCompletion(request)).rejects.toMatchObject({
        code: 'CLAUDE_API_ERROR',
        provider: 'claude',
        statusCode: 400
      });
    });
  });

  describe('cost estimation', () => {
    it('estimates cost for requests', () => {
      const request = createTestChatRequest();
      const cost = provider.estimateCost(request);

      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('calculates cost based on Claude model pricing', () => {
      const opusRequest = createTestChatRequest({ model: 'claude-3-opus-20240229' });
      const haikuRequest = createTestChatRequest({ model: 'claude-3-haiku-20240307' });

      const opusCost = provider.estimateCost(opusRequest);
      const haikuCost = provider.estimateCost(haikuRequest);

      expect(opusCost).toBeGreaterThan(haikuCost); // Opus should be more expensive
    });
  });
});

describe('Provider Registry', () => {
  it('registers providers correctly', () => {
    expect(providerRegistry.supports('openai')).toBe(true);
    expect(providerRegistry.supports('claude')).toBe(true);
    expect(providerRegistry.supports('nonexistent' as any)).toBe(false);
  });

  it('gets provider instances', () => {
    const openaiConfig = openai({ apiKey: 'test', model: 'gpt-4o' });
    const claudeConfig = claude({ apiKey: 'test', model: 'claude-3-5-sonnet-20241022' });

    const openaiProvider = providerRegistry.getProvider(openaiConfig);
    const claudeProvider = providerRegistry.getProvider(claudeConfig);

    expect(openaiProvider).toBeInstanceOf(OpenAIProvider);
    expect(claudeProvider).toBeInstanceOf(ClaudeProvider);
  });

  it('returns registered provider list', () => {
    const providers = providerRegistry.getRegisteredProviders();
    expect(providers).toContain('openai');
    expect(providers).toContain('claude');
  });

  it('health checks all providers', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({ data: [] })
    );

    const healthResults = await providerRegistry.healthCheckAll();
    
    expect(healthResults).toHaveProperty('openai');
    expect(healthResults).toHaveProperty('claude');
    expect(healthResults.openai).toMatchObject({
      provider: 'openai'
    });
    expect(healthResults.claude).toMatchObject({
      provider: 'claude'
    });
  });
});