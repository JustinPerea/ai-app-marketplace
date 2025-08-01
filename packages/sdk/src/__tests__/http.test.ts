/**
 * HTTP Client Tests
 * 
 * Tests for native HTTP client implementation (replacing axios 15KB)
 */

import { HTTPClient, HTTPError, HTTPTimeoutError, createHTTPClient } from '../utils/http';

// Mock fetch globally
global.fetch = jest.fn();

describe('HTTPClient - Native Implementation', () => {
  let client: HTTPClient;

  beforeEach(() => {
    client = new HTTPClient({
      baseURL: 'https://api.example.com',
      timeout: 5000,
      maxRetries: 3,
      retryDelay: 100
    });
    jest.clearAllMocks();
  });

  describe('Basic HTTP Operations', () => {
    it('makes GET requests correctly', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true })
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await client.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );

      expect(response.data).toEqual({ success: true });
      expect(response.status).toBe(200);
      expect(response.ok).toBe(true);
    });

    it('makes POST requests with body', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ id: 123 })
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const payload = { name: 'test', value: 42 };
      const response = await client.post('/create', payload);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/create',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(payload)
        })
      );

      expect(response.data).toEqual({ id: 123 });
      expect(response.status).toBe(201);
    });

    it('handles PUT and DELETE requests', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ updated: true })
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await client.put('/update/123', { name: 'updated' });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/update/123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'updated' })
        })
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      await client.delete('/delete/123');

      expect(global.fetch).toHaveBeenLastCalledWith(
        'https://api.example.com/delete/123',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('URL Building', () => {
    it('handles absolute URLs correctly', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({})
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await client.get('https://different.com/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://different.com/api/test',
        expect.any(Object)
      );
    });

    it('constructs relative URLs with baseURL', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({})
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await client.get('/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/test',
        expect.any(Object)
      );
    });

    it('handles trailing slashes correctly', async () => {
      const clientWithSlash = new HTTPClient({ baseURL: 'https://api.example.com/' });
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({})
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await clientWithSlash.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.any(Object)
      );
    });
  });

  describe('Headers Management', () => {
    it('applies default headers', async () => {
      const clientWithHeaders = new HTTPClient({
        baseURL: 'https://api.example.com',
        headers: {
          'Authorization': 'Bearer token123',
          'X-Custom': 'custom-value'
        }
      });

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({})
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await clientWithHeaders.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token123',
            'X-Custom': 'custom-value'
          })
        })
      );
    });

    it('allows request-specific headers to override defaults', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({})
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await client.get('/test', {
        headers: {
          'Content-Type': 'application/xml',
          'X-Request-ID': 'req-123'
        }
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/xml',
            'X-Request-ID': 'req-123'
          })
        })
      );
    });
  });

  describe('Response Parsing', () => {
    it('parses JSON responses correctly', async () => {
      const mockData = { message: 'success', data: [1, 2, 3] };
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData)
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await client.get('/json');

      expect(response.data).toEqual(mockData);
    });

    it('parses text responses correctly', async () => {
      const mockText = 'plain text response';
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: () => Promise.resolve(mockText)
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await client.get('/text');

      expect(response.data).toBe(mockText);
    });

    it('handles binary responses', async () => {
      const mockBuffer = new ArrayBuffer(8);
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/octet-stream' }),
        arrayBuffer: () => Promise.resolve(mockBuffer)
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await client.get('/binary');

      expect(response.data).toBe(mockBuffer);
    });
  });

  describe('Error Handling', () => {
    it('throws HTTPError for non-2xx responses', async () => {
      const errorData = { error: 'Not found', code: 404 };
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(errorData)
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await expect(client.get('/not-found')).rejects.toThrow(HTTPError);

      try {
        await client.get('/not-found');
      } catch (error) {
        expect(error).toBeInstanceOf(HTTPError);
        expect((error as HTTPError).status).toBe(404);
        expect((error as HTTPError).statusText).toBe('Not Found');
        expect((error as HTTPError).data).toEqual(errorData);
      }
    });

    it('handles network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(client.get('/test')).rejects.toThrow('Network error');
    });

    it('handles timeout errors', async () => {
      const timeoutClient = new HTTPClient({ timeout: 100 });

      // Mock a delayed response
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      );

      await expect(timeoutClient.get('/slow')).rejects.toThrow(HTTPTimeoutError);
    });
  });

  describe('Retry Logic', () => {
    it('retries on 5xx server errors', async () => {
      const serverError = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ error: 'Server error' })
      };

      const successResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true })
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(serverError)
        .mockResolvedValueOnce(serverError)
        .mockResolvedValueOnce(successResponse);

      const response = await client.get('/retry-test');

      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(response.data).toEqual({ success: true });
    });

    it('does not retry on 4xx client errors', async () => {
      const clientError = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ error: 'Bad request' })
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(clientError);

      await expect(client.get('/bad-request')).rejects.toThrow(HTTPError);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('exhausts all retry attempts on persistent failures', async () => {
      const serverError = {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ error: 'Service unavailable' })
      };

      (global.fetch as jest.Mock).mockResolvedValue(serverError);

      await expect(client.get('/always-fails')).rejects.toThrow(HTTPError);

      // Should try initial request + 3 retries = 4 total
      expect(global.fetch).toHaveBeenCalledTimes(4);
    });

    it('applies exponential backoff', async () => {
      const retryClient = new HTTPClient({
        maxRetries: 2,
        retryDelay: 100
      });

      const serverError = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ error: 'Server error' })
      };

      (global.fetch as jest.Mock).mockResolvedValue(serverError);

      const startTime = Date.now();
      
      try {
        await retryClient.get('/retry-backoff');
      } catch (error) {
        // Should have waited approximately 100ms + 200ms = 300ms for retries
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeGreaterThan(250); // Account for timing variations
      }

      expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('Streaming Support', () => {
    it('handles streaming responses', async () => {
      const chunks = ['chunk1', 'chunk2', 'chunk3'];
      let chunkIndex = 0;

      const mockStream = {
        getReader: () => ({
          read: () => {
            if (chunkIndex < chunks.length) {
              const chunk = chunks[chunkIndex++];
              return Promise.resolve({
                done: false,
                value: new TextEncoder().encode(chunk)
              });
            }
            return Promise.resolve({ done: true, value: undefined });
          },
          releaseLock: () => {}
        })
      };

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'text/plain' }),
        body: mockStream
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const stream = client.stream({
        url: '/stream',
        method: 'POST',
        body: { prompt: 'test' }
      });

      const receivedChunks = [];
      for await (const chunk of stream) {
        receivedChunks.push(chunk);
      }

      expect(receivedChunks).toEqual(chunks);
    });

    it('handles streaming errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ error: 'Invalid request' })
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const stream = client.stream({
        url: '/stream-error',
        method: 'POST',
        body: { prompt: 'test' }
      });

      await expect(async () => {
        for await (const chunk of stream) {
          // Should not reach here
        }
      }).rejects.toThrow(HTTPError);
    });
  });

  describe('Factory Function', () => {
    it('creates HTTPClient with custom configuration', () => {
      const customClient = createHTTPClient({
        baseURL: 'https://custom.api.com',
        timeout: 10000,
        maxRetries: 5,
        retryDelay: 500,
        headers: {
          'X-API-Key': 'secret123'
        }
      });

      expect(customClient).toBeInstanceOf(HTTPClient);
    });
  });
});

describe('HTTPError', () => {
  it('creates error with proper properties', () => {
    const error = new HTTPError('Test error', 404, 'Not Found', { details: 'test' });
    
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('HTTPError');
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(404);
    expect(error.statusText).toBe('Not Found');
    expect(error.data).toEqual({ details: 'test' });
  });
});

describe('HTTPTimeoutError', () => {
  it('creates timeout error with proper message', () => {
    const error = new HTTPTimeoutError(5000);
    
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('HTTPTimeoutError');
    expect(error.message).toBe('Request timeout after 5000ms');
  });
});