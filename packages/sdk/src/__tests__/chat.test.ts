/**
 * Chat Module Tests
 * 
 * Tests for the unified Chat interface and provider abstraction
 */

import { Chat, createChat, ask, chat } from '../chat';
import { openai, claude } from '../providers';
import { 
  createTestChatRequest, 
  createTestChatResponse, 
  createMockResponse,
  simulateRateLimitError,
  simulateAuthError,
  simulateNetworkError
} from './setup';

describe('Chat', () => {
  beforeEach(() => {
    // Mock successful response by default
    (global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse(createTestChatResponse())
    );
  });

  describe('constructor', () => {
    it('creates Chat instance with default options', () => {
      const chatInstance = new Chat();
      expect(chatInstance).toBeInstanceOf(Chat);
    });

    it('creates Chat instance with provider configuration', () => {
      const chatInstance = new Chat({
        provider: openai({ model: 'gpt-4o' })
      });
      expect(chatInstance).toBeInstanceOf(Chat);
    });

    it('creates Chat instance with constraints', () => {
      const chatInstance = new Chat({
        constraints: {
          maxCost: 0.01,
          maxLatency: 5000,
          requiredCapabilities: ['chat', 'tools']
        }
      });
      expect(chatInstance).toBeInstanceOf(Chat);
    });
  });

  describe('complete', () => {
    it('completes chat with OpenAI provider', async () => {
      const chatInstance = new Chat({
        provider: openai({ apiKey: 'test-key', model: 'gpt-4o' })
      });

      const request = createTestChatRequest();
      const response = await chatInstance.complete(request);

      expect(response).toMatchObject({
        id: expect.any(String),
        provider: 'openai',
        choices: expect.arrayContaining([
          expect.objectContaining({
            message: expect.objectContaining({
              role: 'assistant',
              content: expect.any(String)
            })
          })
        ])
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key',
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('completes chat with Claude provider', async () => {
      const chatInstance = new Chat({
        provider: claude({ apiKey: 'test-key', model: 'claude-3-5-sonnet-20241022' })
      });

      // Mock Claude response format
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

      const request = createTestChatRequest();
      const response = await chatInstance.complete(request);

      expect(response).toMatchObject({
        provider: 'claude',
        choices: expect.arrayContaining([
          expect.objectContaining({
            message: expect.objectContaining({
              role: 'assistant',
              content: expect.any(String)
            })
          })
        ])
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

    it('handles provider errors gracefully', async () => {
      simulateAuthError();

      const chatInstance = new Chat({
        provider: openai({ apiKey: 'invalid-key' })
      });

      const request = createTestChatRequest();

      await expect(chatInstance.complete(request)).rejects.toBeAuthError();
    });

    it('implements fallback when enabled', async () => {
      const chatInstance = new Chat({
        provider: openai({ apiKey: 'test-key' }),
        enableFallback: true
      });

      // First call fails with rate limit
      simulateRateLimitError();

      const request = createTestChatRequest();

      // Should attempt fallback (but will also fail in this test setup)
      await expect(chatInstance.complete(request)).rejects.toThrow();
      
      // Verify initial call was made
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('ask', () => {
    it('handles simple text completion', async () => {
      const chatInstance = new Chat({
        provider: openai({ apiKey: 'test-key' })
      });

      const response = await chatInstance.ask('Hello, world!');
      
      expect(response).toBe('Hello! How can I help you today?');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"messages":[{"role":"user","content":"Hello, world!"}]')
        })
      );
    });

    it('includes system message when provided', async () => {
      const chatInstance = new Chat({
        provider: openai({ apiKey: 'test-key' })
      });

      await chatInstance.ask('Hello', {
        system: 'You are a helpful assistant.'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('"role":"system","content":"You are a helpful assistant."')
        })
      );
    });

    it('applies temperature and max tokens', async () => {
      const chatInstance = new Chat({
        provider: openai({ apiKey: 'test-key' })
      });

      await chatInstance.ask('Hello', {
        temperature: 0.5,
        maxTokens: 500
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('"temperature":0.5')
        })
      );
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('"max_tokens":500')
        })
      );
    });
  });

  describe('conversation', () => {
    it('creates conversation instance', () => {
      const chatInstance = new Chat({
        provider: openai({ apiKey: 'test-key' })
      });

      const conversation = chatInstance.conversation();
      expect(conversation).toBeDefined();
      expect(typeof conversation.say).toBe('function');
    });

    it('maintains conversation state', async () => {
      const chatInstance = new Chat({
        provider: openai({ apiKey: 'test-key' })
      });

      const conversation = chatInstance.conversation({
        system: 'You are a helpful assistant.'
      });

      // First message
      await conversation.say('Hello');
      
      // Second message - should include conversation history
      await conversation.say('How are you?');

      // Check that the second call includes previous messages
      const calls = (global.fetch as jest.Mock).mock.calls;
      const secondCall = calls[1];
      const requestBody = JSON.parse(secondCall[1].body);
      
      expect(requestBody.messages).toHaveLength(4); // system + user1 + assistant1 + user2
      expect(requestBody.messages[0].role).toBe('system');
      expect(requestBody.messages[1].content).toBe('Hello');
      expect(requestBody.messages[2].role).toBe('assistant');
      expect(requestBody.messages[3].content).toBe('How are you?');
    });

    it('provides conversation history', async () => {
      const chatInstance = new Chat({
        provider: openai({ apiKey: 'test-key' })
      });

      const conversation = chatInstance.conversation();
      await conversation.say('Hello');

      const history = conversation.getHistory();
      expect(history).toHaveLength(2); // user + assistant
      expect(history[0].role).toBe('user');
      expect(history[0].content).toBe('Hello');
      expect(history[1].role).toBe('assistant');
    });

    it('clears conversation history', async () => {
      const chatInstance = new Chat({
        provider: openai({ apiKey: 'test-key' })
      });

      const conversation = chatInstance.conversation({
        system: 'You are helpful.'
      });
      
      await conversation.say('Hello');
      expect(conversation.getHistory()).toHaveLength(3); // system + user + assistant

      conversation.clear();
      expect(conversation.getHistory()).toHaveLength(1); // just system message
    });
  });

  describe('provider selection', () => {
    it('uses explicit provider when specified', async () => {
      const chatInstance = new Chat();

      const request = createTestChatRequest();
      await chatInstance.complete(request, {
        provider: openai({ apiKey: 'test-key' })
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.any(Object)
      );
    });

    it('selects provider based on constraints', async () => {
      const chatInstance = new Chat({
        constraints: {
          maxCost: 0.001, // Very low cost constraint
          preferredProviders: ['claude']
        }
      });

      // Mock Claude response
      (global.fetch as jest.Mock).mockResolvedValue(
        createMockResponse({
          id: 'msg_test',
          content: [{ type: 'text', text: 'Response' }],
          model: 'claude-3-5-sonnet-20241022',
          usage: { input_tokens: 5, output_tokens: 5 }
        })
      );

      const request = createTestChatRequest();
      await chatInstance.complete(request);

      // Should select Claude based on constraints
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('anthropic.com'),
        expect.any(Object)
      );
    });
  });

  describe('utility functions', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue(
        createMockResponse(createTestChatResponse())
      );
    });

    it('createChat creates Chat instance', () => {
      const chatInstance = createChat();
      expect(chatInstance).toBeInstanceOf(Chat);
    });

    it('ask function works as standalone', async () => {
      const response = await ask('Hello', {
        provider: openai({ apiKey: 'test-key' })
      });

      expect(response).toBe('Hello! How can I help you today?');
    });

    it('chat function works as standalone', async () => {
      const messages = [{ role: 'user' as const, content: 'Hello' }];
      const response = await chat(messages, {
        provider: openai({ apiKey: 'test-key' })
      });

      expect(response.choices[0].message.content).toBe('Hello! How can I help you today?');
    });
  });

  describe('error handling', () => {
    it('handles network errors', async () => {
      simulateNetworkError();

      const chatInstance = new Chat({
        provider: openai({ apiKey: 'test-key' }),
        enableAutoRetry: false
      });

      await expect(chatInstance.ask('Hello')).rejects.toThrow('Network error');
    });

    it('handles rate limit errors', async () => {
      simulateRateLimitError();

      const chatInstance = new Chat({
        provider: openai({ apiKey: 'test-key' }),
        enableAutoRetry: false
      });

      await expect(chatInstance.ask('Hello')).rejects.toBeRateLimitError();
    });

    it('retries on transient errors when enabled', async () => {
      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(Object.assign(new Error('Network error'), { code: 'ECONNRESET' }));
        }
        return Promise.resolve(createMockResponse(createTestChatResponse()));
      });

      const chatInstance = new Chat({
        provider: openai({ apiKey: 'test-key' }),
        enableAutoRetry: true
      });

      const response = await chatInstance.ask('Hello');
      expect(response).toBe('Hello! How can I help you today?');
      expect(callCount).toBe(3); // 2 failures + 1 success
    });
  });
});