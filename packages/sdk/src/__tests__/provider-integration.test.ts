/**
 * Provider Integration Tests
 * 
 * Tests for all native provider implementations with realistic scenarios
 */

import { OpenAIProvider, AnthropicProvider, GoogleProvider } from '../providers';
import { HTTPClient } from '../utils/http';
import { v } from '../utils/validation';

// Mock fetch globally
global.fetch = jest.fn();

describe('Provider Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('OpenAI Provider - Native Implementation', () => {
    let provider: OpenAIProvider;

    beforeEach(() => {
      provider = new OpenAIProvider({
        provider: 'openai',
        model: 'gpt-4o',
        apiKey: 'sk-test123456789'
      });
    });

    it('validates API key format correctly', () => {
      expect(() => new OpenAIProvider({
        provider: 'openai',
        model: 'gpt-4o',
        apiKey: 'invalid-key'
      })).toThrow('OpenAI API key is required');
    });

    it('returns correct capabilities', () => {
      const capabilities = provider.getCapabilities();
      
      expect(capabilities).toEqual({
        chatCompletion: true,
        streamingCompletion: true,
        functionCalling: true,
        imageGeneration: true,
        imageAnalysis: true,
        jsonMode: true,
        systemMessages: true,
        toolUse: true,
        multipleMessages: true,
        maxContextTokens: 128000,
        supportedModels: expect.arrayContaining(['gpt-4o', 'gpt-3.5-turbo'])
      });
    });

    it('validates models correctly', () => {
      expect(provider.validateModel('gpt-4o')).toBe(true);
      expect(provider.validateModel('gpt-3.5-turbo')).toBe(true);
      expect(provider.validateModel('invalid-model')).toBe(false);
    });

    it('estimates costs accurately', () => {
      const request = {
        model: 'gpt-4o',
        messages: [
          { role: 'user' as const, content: 'Hello, world!' }
        ],
        max_tokens: 100
      };

      const cost = provider.estimateCost(request);
      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('handles chat completion with mock response', async () => {
      const mockResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: 1699000000,
        model: 'gpt-4o',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: 'Hello! How can I help you today?'
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse)
      });

      const request = {
        model: 'gpt-4o',
        messages: [
          { role: 'user' as const, content: 'Hello!' }
        ]
      };

      const response = await provider.chatCompletion(request);

      expect(response.provider).toBe('openai');
      expect(response.choices[0].message.content).toBe('Hello! How can I help you today?');
      expect(response.usage.total_tokens).toBe(25);
      expect(response.usage.estimated_cost).toBeGreaterThan(0);
    });

    it('handles tool calls correctly', async () => {
      const mockResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: 1699000000,
        model: 'gpt-4o',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: null,
            tool_calls: [{
              id: 'call-123',
              type: 'function',
              function: {
                name: 'get_weather',
                arguments: '{"location": "New York"}'
              }
            }]
          },
          finish_reason: 'tool_calls'
        }],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 25,
          total_tokens: 75
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse)
      });

      const request = {
        model: 'gpt-4o',
        messages: [
          { role: 'user' as const, content: 'What is the weather in New York?' }
        ],
        tools: [{
          type: 'function' as const,
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
        }]
      };

      const response = await provider.chatCompletion(request);

      expect(response.choices[0].message.tool_calls).toHaveLength(1);
      expect(response.choices[0].message.tool_calls![0].function.name).toBe('get_weather');
    });
  });

  describe('Anthropic Provider - Native Implementation', () => {
    let provider: AnthropicProvider;

    beforeEach(() => {
      provider = new AnthropicProvider({
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        apiKey: 'sk-ant-api03-test123'
      });
    });

    it('returns correct capabilities', () => {
      const capabilities = provider.getCapabilities();
      
      expect(capabilities).toEqual({
        chatCompletion: true,
        streamingCompletion: true,
        functionCalling: true,
        imageGeneration: false,
        imageAnalysis: true,
        jsonMode: false,
        systemMessages: true,
        toolUse: true,
        multipleMessages: true,
        maxContextTokens: 200000,
        supportedModels: expect.arrayContaining(['claude-3-5-sonnet-20241022'])
      });
    });

    it('validates models correctly', () => {
      expect(provider.validateModel('claude-3-5-sonnet-20241022')).toBe(true);
      expect(provider.validateModel('claude-3-haiku-20240307')).toBe(true);
      expect(provider.validateModel('gpt-4')).toBe(false);
    });

    it('handles system messages correctly', async () => {
      const mockResponse = {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: 'I am a helpful assistant.'
        }],
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 20,
          output_tokens: 10
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse)
      });

      const request = {
        model: 'claude-3-5-sonnet-20241022',
        messages: [
          { role: 'system' as const, content: 'You are a helpful assistant.' },
          { role: 'user' as const, content: 'Hello!' }
        ]
      };

      await provider.chatCompletion(request);

      // Verify that the API was called with system parameter
      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.system).toBe('You are a helpful assistant.');
      expect(callBody.messages).toHaveLength(1); // Only user message in messages array
    });

    it('handles multimodal content', async () => {
      const mockResponse = {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        content: [{
          type: 'text',
          text: 'I can see an image with a cat.'
        }],
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 100,
          output_tokens: 20
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse)
      });

      const request = {
        model: 'claude-3-5-sonnet-20241022',
        messages: [{
          role: 'user' as const,
          content: [
            { type: 'text' as const, text: 'What is in this image?' },
            {
              type: 'image_url' as const,
              image_url: {
                url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//2Q=='
              }
            }
          ]
        }]
      };

      await provider.chatCompletion(request);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.messages[0].content).toHaveLength(2);
      expect(callBody.messages[0].content[0].type).toBe('text');
      expect(callBody.messages[0].content[1].type).toBe('image');
      expect(callBody.messages[0].content[1].source.type).toBe('base64');
    });
  });

  describe('Google Provider - Native Implementation', () => {
    let provider: GoogleProvider;

    beforeEach(() => {
      provider = new GoogleProvider({
        provider: 'google',
        model: 'gemini-1.5-flash',
        apiKey: 'AIzaSyTest123456789'
      });
    });

    it('returns correct capabilities', () => {
      const capabilities = provider.getCapabilities();
      
      expect(capabilities).toEqual({
        chatCompletion: true,
        streamingCompletion: true,
        functionCalling: false, // Not yet implemented
        imageGeneration: false,
        imageAnalysis: true,
        jsonMode: false,
        systemMessages: false, // Gemini doesn't have system messages
        toolUse: false, // Not yet implemented
        multipleMessages: true,
        maxContextTokens: 1000000,
        supportedModels: expect.arrayContaining(['gemini-1.5-flash', 'gemini-pro'])
      });
    });

    it('validates models correctly', () => {
      expect(provider.validateModel('gemini-1.5-flash')).toBe(true);
      expect(provider.validateModel('gemini-pro')).toBe(true);
      expect(provider.validateModel('gpt-4')).toBe(false);
    });

    it('handles chat completion', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: 'Hello! I am Gemini, how can I help you?'
            }],
            role: 'model'
          },
          finishReason: 'STOP',
          index: 0
        }],
        usageMetadata: {
          promptTokenCount: 5,
          candidatesTokenCount: 12,
          totalTokenCount: 17
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse)
      });

      const request = {
        model: 'gemini-1.5-flash',
        messages: [
          { role: 'user' as const, content: 'Hello!' }
        ]
      };

      const response = await provider.chatCompletion(request);

      expect(response.provider).toBe('google');
      expect(response.choices[0].message.content).toBe('Hello! I am Gemini, how can I help you?');
      expect(response.usage.total_tokens).toBe(17);
    });

    it('filters out system messages', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{ text: 'Response without system message' }],
            role: 'model'
          },
          finishReason: 'STOP',
          index: 0
        }],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 15,
          totalTokenCount: 25
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse)
      });

      const request = {
        model: 'gemini-pro',
        messages: [
          { role: 'system' as const, content: 'You are a helpful assistant.' },
          { role: 'user' as const, content: 'Hello!' }
        ]
      };

      await provider.chatCompletion(request);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      // Should only have the user message, system message filtered out
      expect(callBody.contents).toHaveLength(1);
      expect(callBody.contents[0].role).toBe('user');
    });
  });

  describe('Cross-Provider Comparison', () => {
    it('all providers implement required interface methods', () => {
      const providers = [
        new OpenAIProvider({ provider: 'openai', model: 'gpt-4o', apiKey: 'test' }),
        new AnthropicProvider({ provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', apiKey: 'test' }),
        new GoogleProvider({ provider: 'google', model: 'gemini-pro', apiKey: 'test' })
      ];

      providers.forEach(provider => {
        expect(typeof provider.getCapabilities).toBe('function');
        expect(typeof provider.validateModel).toBe('function');
        expect(typeof provider.getAvailableModels).toBe('function');
        expect(typeof provider.estimateCost).toBe('function');
        expect(typeof provider.chatCompletion).toBe('function');
        expect(typeof provider.streamChatCompletion).toBe('function');
      });
    });

    it('cost estimation varies by provider', () => {
      const providers = [
        new OpenAIProvider({ provider: 'openai', model: 'gpt-4o', apiKey: 'test' }),
        new AnthropicProvider({ provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', apiKey: 'test' }),
        new GoogleProvider({ provider: 'google', model: 'gemini-1.5-flash', apiKey: 'test' })
      ];

      const request = {
        model: 'test',
        messages: [
          { role: 'user' as const, content: 'This is a test message for cost estimation.' }
        ],
        max_tokens: 100
      };

      const costs = providers.map(provider => provider.estimateCost(request));
      
      // All should return valid numbers
      costs.forEach(cost => {
        expect(typeof cost).toBe('number');
        expect(cost).toBeGreaterThanOrEqual(0);
      });

      // Costs should vary between providers (not all the same)
      const uniqueCosts = [...new Set(costs)];
      expect(uniqueCosts.length).toBeGreaterThan(1);
    });

    it('context limits vary by provider', () => {
      const openaiProvider = new OpenAIProvider({ provider: 'openai', model: 'gpt-4o', apiKey: 'test' });
      const claudeProvider = new AnthropicProvider({ provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', apiKey: 'test' });
      const googleProvider = new GoogleProvider({ provider: 'google', model: 'gemini-1.5-pro', apiKey: 'test' });

      const openaiLimit = openaiProvider.getCapabilities().maxContextTokens;
      const claudeLimit = claudeProvider.getCapabilities().maxContextTokens;
      const googleLimit = googleProvider.getCapabilities().maxContextTokens;

      expect(openaiLimit).toBe(128000);
      expect(claudeLimit).toBe(200000);
      expect(googleLimit).toBe(1000000);
    });
  });

  describe('Error Handling Across Providers', () => {
    it('handles rate limiting errors consistently', async () => {
      const providers = [
        new OpenAIProvider({ provider: 'openai', model: 'gpt-4o', apiKey: 'test' }),
        new AnthropicProvider({ provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', apiKey: 'test' }),
        new GoogleProvider({ provider: 'google', model: 'gemini-pro', apiKey: 'test' })
      ];

      const rateLimitResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } })
      };

      const request = {
        model: 'test',
        messages: [{ role: 'user' as const, content: 'Test' }]
      };

      for (const provider of providers) {
        (global.fetch as jest.Mock).mockResolvedValueOnce(rateLimitResponse);
        
        await expect(provider.chatCompletion(request)).rejects.toThrow();
      }

      expect(global.fetch).toHaveBeenCalledTimes(providers.length);
    });

    it('handles authentication errors consistently', async () => {
      const providers = [
        new OpenAIProvider({ provider: 'openai', model: 'gpt-4o', apiKey: 'test' }),
        new AnthropicProvider({ provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', apiKey: 'test' }),
        new GoogleProvider({ provider: 'google', model: 'gemini-pro', apiKey: 'test' })
      ];

      const authErrorResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ error: { message: 'Invalid API key' } })
      };

      const request = {
        model: 'test',
        messages: [{ role: 'user' as const, content: 'Test' }]
      };

      for (const provider of providers) {
        (global.fetch as jest.Mock).mockResolvedValueOnce(authErrorResponse);
        
        await expect(provider.chatCompletion(request)).rejects.toThrow();
      }
    });
  });
});