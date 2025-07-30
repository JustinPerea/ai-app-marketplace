/**
 * Jest Test Setup
 * 
 * Global test configuration and utilities for SDK testing
 */

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeSDKError(): R;
      toBeRateLimitError(): R;
      toBeAuthError(): R;
      toBeValidationError(): R;
    }
  }
}

// Custom Jest matchers for SDK errors
expect.extend({
  toBeSDKError(received) {
    const pass = received && 
                 typeof received === 'object' && 
                 'code' in received && 
                 typeof received.code === 'string' &&
                 received instanceof Error;

    if (pass) {
      return {
        message: () => `expected ${received} not to be an SDK error`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be an SDK error with a code property`,
        pass: false,
      };
    }
  },

  toBeRateLimitError(received) {
    const pass = received && 
                 received.code === 'RATE_LIMIT_EXCEEDED';

    if (pass) {
      return {
        message: () => `expected ${received.code} not to be a rate limit error`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received?.code} to be 'RATE_LIMIT_EXCEEDED'`,
        pass: false,
      };
    }
  },

  toBeAuthError(received) {
    const pass = received && 
                 received.code === 'AUTHENTICATION_FAILED';

    if (pass) {
      return {
        message: () => `expected ${received.code} not to be an authentication error`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received?.code} to be 'AUTHENTICATION_FAILED'`,
        pass: false,
      };
    }
  },

  toBeValidationError(received) {
    const pass = received && 
                 received.code === 'VALIDATION_ERROR';

    if (pass) {
      return {
        message: () => `expected ${received.code} not to be a validation error`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received?.code} to be 'VALIDATION_ERROR'`,
        pass: false,
      };
    }
  },
});

// Global test timeout
jest.setTimeout(30000);

// Mock console methods in tests to reduce noise
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
};

// Restore console for specific tests that need it
export const restoreConsole = () => {
  global.console = originalConsole;
};

// Test utilities
export const createMockResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  json: jest.fn().mockResolvedValue(data),
  text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  headers: new Map([['content-type', 'application/json']]),
});

export const createMockStreamResponse = (chunks: any[]) => {
  const encoder = new TextEncoder();
  let index = 0;

  return {
    ok: true,
    status: 200,
    headers: new Map([['content-type', 'text/event-stream']]),
    body: {
      getReader: () => ({
        read: jest.fn().mockImplementation(() => {
          if (index >= chunks.length) {
            return Promise.resolve({ done: true, value: undefined });
          }
          const chunk = `data: ${JSON.stringify(chunks[index])}\n\n`;
          index++;
          return Promise.resolve({
            done: false,
            value: encoder.encode(chunk)
          });
        }),
        releaseLock: jest.fn(),
      }),
    },
  };
};

// Mock fetch globally
global.fetch = jest.fn();

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockReset();
});

// Test data factories
export const createTestChatRequest = (overrides: any = {}) => ({
  messages: [
    { role: 'user' as const, content: 'Hello, world!' }
  ],
  model: 'gpt-4o',
  temperature: 0.7,
  max_tokens: 1000,
  ...overrides
});

export const createTestChatResponse = (overrides: any = {}) => ({
  id: 'chatcmpl-test-123',
  object: 'chat.completion',
  created: Math.floor(Date.now() / 1000),
  model: 'gpt-4o',
  provider: 'openai',
  choices: [{
    index: 0,
    message: {
      role: 'assistant' as const,
      content: 'Hello! How can I help you today?'
    },
    finish_reason: 'stop' as const
  }],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 15,
    total_tokens: 25,
    estimated_cost: 0.0005
  },
  ...overrides
});

export const createTestStreamChunk = (content: string, overrides: any = {}) => ({
  id: 'chatcmpl-test-123',
  object: 'chat.completion.chunk',
  created: Math.floor(Date.now() / 1000),
  model: 'gpt-4o',
  provider: 'openai',
  choices: [{
    index: 0,
    delta: { content },
    finish_reason: null
  }],
  ...overrides
});

// Error simulation helpers
export const simulateNetworkError = () => {
  (global.fetch as jest.Mock).mockRejectedValue(
    Object.assign(new Error('Network error'), { code: 'ECONNRESET' })
  );
};

export const simulateRateLimitError = () => {
  (global.fetch as jest.Mock).mockResolvedValue(
    createMockResponse(
      {
        error: {
          message: 'Rate limit exceeded',
          type: 'rate_limit_error',
          code: 'rate_limit_exceeded'
        }
      },
      429
    )
  );
};

export const simulateAuthError = () => {
  (global.fetch as jest.Mock).mockResolvedValue(
    createMockResponse(
      {
        error: {
          message: 'Invalid API key',
          type: 'authentication_error',
          code: 'invalid_api_key'
        }
      },
      401
    )
  );
};

export const simulateValidationError = () => {
  (global.fetch as jest.Mock).mockResolvedValue(
    createMockResponse(
      {
        error: {
          message: 'Invalid model',
          type: 'invalid_request_error',
          param: 'model',
          code: 'model_not_found'
        }
      },
      400
    )
  );
};

// Test environment helpers
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const expectToEventuallyResolve = async (
  promiseFn: () => Promise<any>,
  maxAttempts = 5,
  delayMs = 100
) => {
  let lastError: any;
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await promiseFn();
    } catch (error) {
      lastError = error;
      if (i < maxAttempts - 1) {
        await waitFor(delayMs);
      }
    }
  }
  
  throw lastError;
};

// Clean up after all tests
afterAll(() => {
  // Restore original console
  global.console = originalConsole;
});