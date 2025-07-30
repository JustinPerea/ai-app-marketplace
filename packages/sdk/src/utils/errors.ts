/**
 * Error Handling and Retry Mechanisms
 * 
 * Implements exponential backoff, circuit breaker patterns, and provider-specific error handling
 */

import type { 
  SDKError, 
  RateLimitError, 
  AuthenticationError, 
  ValidationError, 
  ApiProvider,
  RequestMetrics 
} from '../types';

/**
 * Custom SDK Error Classes
 */
export class BaseSDKError extends Error implements SDKError {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly provider?: ApiProvider;
  public readonly requestId?: string;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    options?: {
      statusCode?: number;
      provider?: ApiProvider;
      requestId?: string;
      details?: Record<string, any>;
      cause?: Error;
    }
  ) {
    super(message, { cause: options?.cause });
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = options?.statusCode;
    this.provider = options?.provider;
    this.requestId = options?.requestId;
    this.details = options?.details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class SDKRateLimitError extends BaseSDKError implements RateLimitError {
  public readonly code = 'RATE_LIMIT_EXCEEDED';
  public readonly retryAfter?: number;
  public readonly limitType: 'requests' | 'tokens' | 'cost';

  constructor(
    message: string,
    limitType: 'requests' | 'tokens' | 'cost',
    options?: {
      retryAfter?: number;
      statusCode?: number;
      provider?: ApiProvider;
      requestId?: string;
      details?: Record<string, any>;
      cause?: Error;
    }
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', options);
    this.limitType = limitType;
    this.retryAfter = options?.retryAfter;
  }
}

export class SDKAuthenticationError extends BaseSDKError implements AuthenticationError {
  public readonly code = 'AUTHENTICATION_FAILED';
  public readonly provider: ApiProvider;

  constructor(
    message: string,
    provider: ApiProvider,
    options?: {
      statusCode?: number;
      requestId?: string;
      details?: Record<string, any>;
      cause?: Error;
    }
  ) {
    super(message, 'AUTHENTICATION_FAILED', { ...options, provider });
    this.provider = provider;
  }
}

export class SDKValidationError extends BaseSDKError implements ValidationError {
  public readonly code = 'VALIDATION_ERROR';
  public readonly field: string;
  public readonly value: any;

  constructor(
    message: string,
    field: string,
    value: any,
    options?: {
      statusCode?: number;
      provider?: ApiProvider;
      requestId?: string;
      details?: Record<string, any>;
      cause?: Error;
    }
  ) {
    super(message, 'VALIDATION_ERROR', options);
    this.field = field;
    this.value = value;
  }
}

/**
 * Error Factory - Creates appropriate error types from provider responses
 */
export class ErrorFactory {
  static fromProviderError(
    error: any,
    provider: ApiProvider,
    requestId?: string
  ): SDKError {
    // OpenAI error handling
    if (provider === 'openai') {
      return this.fromOpenAIError(error, requestId);
    }

    // Claude error handling
    if (provider === 'claude') {
      return this.fromClaudeError(error, requestId);
    }

    // Generic error handling
    return this.fromGenericError(error, provider, requestId);
  }

  private static fromOpenAIError(error: any, requestId?: string): SDKError {
    const statusCode = error.status || error.statusCode || 500;
    const message = error.message || error.error?.message || 'OpenAI API error';

    // Rate limiting
    if (statusCode === 429) {
      const retryAfter = error.headers?.['retry-after'] 
        ? parseInt(error.headers['retry-after'], 10) 
        : undefined;
      
      return new SDKRateLimitError(
        message,
        'requests',
        {
          retryAfter,
          statusCode,
          provider: 'openai',
          requestId,
          details: { originalError: error }
        }
      );
    }

    // Authentication errors
    if (statusCode === 401) {
      return new SDKAuthenticationError(
        message,
        'openai',
        {
          statusCode,
          requestId,
          details: { originalError: error }
        }
      );
    }

    // Validation errors
    if (statusCode === 400) {
      return new SDKValidationError(
        message,
        error.error?.param || 'unknown',
        error.error?.code || 'unknown',
        {
          statusCode,
          provider: 'openai',
          requestId,
          details: { originalError: error }
        }
      );
    }

    // Generic OpenAI error
    return new BaseSDKError(
      message,
      'OPENAI_API_ERROR',
      {
        statusCode,
        provider: 'openai',
        requestId,
        details: { originalError: error },
        cause: error
      }
    );
  }

  private static fromClaudeError(error: any, requestId?: string): SDKError {
    const statusCode = error.status || error.statusCode || 500;
    const message = error.message || error.error?.message || 'Claude API error';

    // Rate limiting
    if (statusCode === 429) {
      const retryAfter = error.headers?.['retry-after'] 
        ? parseInt(error.headers['retry-after'], 10) 
        : undefined;
      
      return new SDKRateLimitError(
        message,
        'requests',
        {
          retryAfter,
          statusCode,
          provider: 'claude',
          requestId,
          details: { originalError: error }
        }
      );
    }

    // Authentication errors
    if (statusCode === 401) {
      return new SDKAuthenticationError(
        message,
        'claude',
        {
          statusCode,
          requestId,
          details: { originalError: error }
        }
      );
    }

    // Validation errors
    if (statusCode === 400) {
      return new SDKValidationError(
        message,
        error.error?.param || 'unknown',
        error.error?.code || 'unknown',
        {
          statusCode,
          provider: 'claude',
          requestId,
          details: { originalError: error }
        }
      );
    }

    // Generic Claude error
    return new BaseSDKError(
      message,
      'CLAUDE_API_ERROR',
      {
        statusCode,
        provider: 'claude',
        requestId,
        details: { originalError: error },
        cause: error
      }
    );
  }

  private static fromGenericError(
    error: any,
    provider: ApiProvider,
    requestId?: string
  ): SDKError {
    const statusCode = error.status || error.statusCode || 500;
    const message = error.message || `${provider} API error`;

    return new BaseSDKError(
      message,
      'API_ERROR',
      {
        statusCode,
        provider,
        requestId,
        details: { originalError: error },
        cause: error
      }
    );
  }
}

/**
 * Retry Configuration and Logic
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableErrors: string[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  jitter: true,
  retryableErrors: [
    'RATE_LIMIT_EXCEEDED',
    'NETWORK_ERROR',
    'TIMEOUT',
    'SERVER_ERROR',
    'TEMPORARY_FAILURE'
  ]
};

export class RetryHandler {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * Execute a function with retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    context?: {
      provider?: ApiProvider;
      requestId?: string;
      operation?: string;
    }
  ): Promise<T> {
    let lastError: SDKError | null = null;
    let attempt = 0;

    while (attempt <= this.config.maxRetries) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof BaseSDKError 
          ? error 
          : this.convertToSDKError(error, context?.provider);

        // Don't retry on last attempt
        if (attempt === this.config.maxRetries) {
          break;
        }

        // Check if error is retryable
        if (!this.isRetryableError(lastError)) {
          break;
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, lastError);
        
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms`, {
          error: lastError.code,
          provider: context?.provider,
          requestId: context?.requestId,
          operation: context?.operation
        });

        await this.sleep(delay);
        attempt++;
      }
    }

    // All attempts failed, throw the last error
    throw lastError;
  }

  /**
   * Check if an error should trigger a retry
   */
  private isRetryableError(error: SDKError): boolean {
    // Don't retry authentication or validation errors
    if (error.code === 'AUTHENTICATION_FAILED' || error.code === 'VALIDATION_ERROR') {
      return false;
    }

    // Retry rate limit errors
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      return true;
    }

    // Retry server errors (5xx)
    if (error.statusCode && error.statusCode >= 500) {
      return true;
    }

    // Retry network/timeout errors
    if (this.config.retryableErrors.includes(error.code)) {
      return true;
    }

    return false;
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  private calculateDelay(attempt: number, error: SDKError): number {
    // Use retry-after header if available (rate limit errors)
    if (error instanceof SDKRateLimitError && error.retryAfter) {
      return error.retryAfter * 1000; // Convert seconds to milliseconds
    }

    // Exponential backoff
    let delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt);
    
    // Cap at max delay
    delay = Math.min(delay, this.config.maxDelay);

    // Add jitter to avoid thundering herd
    if (this.config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  /**
   * Convert generic error to SDK error
   */
  private convertToSDKError(error: any, provider?: ApiProvider): SDKError {
    if (error instanceof BaseSDKError) {
      return error;
    }

    // Network/timeout errors
    if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return new BaseSDKError(
        `Network error: ${error.message}`,
        'NETWORK_ERROR',
        { provider, cause: error }
      );
    }

    // Generic error
    return new BaseSDKError(
      error.message || 'Unknown error',
      'UNKNOWN_ERROR',
      { provider, cause: error }
    );
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Circuit Breaker Pattern Implementation
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private nextAttempt: number = 0;
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringPeriod: 60000, // 1 minute
      ...config
    };
  }

  /**
   * Execute function through circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new BaseSDKError(
          'Circuit breaker is OPEN - too many recent failures',
          'CIRCUIT_BREAKER_OPEN'
        );
      } else {
        this.state = CircuitState.HALF_OPEN;
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.config.recoveryTimeout;
    }
  }

  /**
   * Get current circuit breaker status
   */
  getStatus(): {
    state: CircuitState;
    failures: number;
    lastFailureTime: number;
    nextAttempt: number;
  } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt
    };
  }
}

/**
 * Request timeout wrapper
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  context?: { operation?: string; provider?: ApiProvider }
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new BaseSDKError(
          `Operation timed out after ${timeoutMs}ms`,
          'TIMEOUT',
          {
            provider: context?.provider,
            details: { timeoutMs, operation: context?.operation }
          }
        ));
      }, timeoutMs);
    })
  ]);
}

/**
 * Utility function to sanitize errors for logging
 */
export function sanitizeErrorForLogging(error: any): Record<string, any> {
  const sanitized: Record<string, any> = {
    name: error.name || 'Error',
    message: error.message || 'Unknown error',
    code: error.code,
    statusCode: error.statusCode,
    provider: error.provider,
    requestId: error.requestId
  };

  // Remove sensitive information
  if (error.details) {
    sanitized.details = { ...error.details };
    
    // Remove API keys
    if (sanitized.details.apiKey) {
      sanitized.details.apiKey = '[REDACTED]';
    }
    
    // Remove authorization headers
    if (sanitized.details.headers?.authorization) {
      sanitized.details.headers.authorization = '[REDACTED]';
    }
  }

  return sanitized;
}