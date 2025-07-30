/**
 * Advanced Error Handling and Recovery System
 * 
 * Comprehensive error handling with:
 * - Intelligent retry strategies
 * - Circuit breaker patterns
 * - Error classification and recovery
 * - Detailed logging and monitoring
 * - Graceful degradation
 */

import { ApiProvider } from '@prisma/client';
import { AIError } from './providers/base';
import {
  AIRequest,
  AIResponse,
  AIStreamChunk,
  ProviderStatus,
} from './types';

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeoutMs: number;
  monitoringWindowMs: number;
}

export interface ErrorRecoveryStrategy {
  retryableErrors: string[];
  fallbackProviders: ApiProvider[];
  gracefulDegradation: boolean;
  maxCostIncrease: number; // Percentage increase allowed for fallback
}

export interface ErrorContext {
  userId: string;
  provider: ApiProvider;
  model: string;
  requestId: string;
  attempt: number;
  totalCost: number;
  startTime: number;
  metadata?: Record<string, any>;
}

export interface RecoveryResult {
  success: boolean;
  response?: AIResponse;
  finalProvider?: ApiProvider;
  finalModel?: string;
  totalAttempts: number;
  totalLatency: number;
  recoveryStrategy: string;
  costIncurred: number;
}

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  nextAttemptTime: number;
}

export class AIErrorHandler {
  private retryConfig: RetryConfig;
  private circuitConfig: CircuitBreakerConfig;
  private recoveryStrategy: ErrorRecoveryStrategy;
  private circuitStates: Map<ApiProvider, CircuitBreakerState> = new Map();
  private errorMetrics: Map<string, {
    count: number;
    lastOccurrence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> = new Map();

  constructor(
    retryConfig: Partial<RetryConfig> = {},
    circuitConfig: Partial<CircuitBreakerConfig> = {},
    recoveryStrategy: Partial<ErrorRecoveryStrategy> = {}
  ) {
    this.retryConfig = {
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      backoffMultiplier: 2,
      jitterFactor: 0.1,
      ...retryConfig,
    };

    this.circuitConfig = {
      failureThreshold: 5,
      successThreshold: 3,
      timeoutMs: 60000,
      monitoringWindowMs: 300000, // 5 minutes
      ...circuitConfig,
    };

    this.recoveryStrategy = {
      retryableErrors: [
        'RATE_LIMIT_ERROR',
        'SERVER_ERROR',
        'NETWORK_ERROR',
        'TIMEOUT',
        'CIRCUIT_BREAKER_OPEN',
      ],
      fallbackProviders: [ApiProvider.OPENAI, ApiProvider.ANTHROPIC, ApiProvider.GOOGLE],
      gracefulDegradation: true,
      maxCostIncrease: 50, // 50% increase allowed
      ...recoveryStrategy,
    };

    this.initializeCircuitBreakers();
  }

  /**
   * Execute request with comprehensive error handling and recovery
   */
  async executeWithRecovery<T extends AIResponse | AsyncIterable<AIStreamChunk>>(
    context: ErrorContext,
    executor: (provider: ApiProvider, model: string) => Promise<T>
  ): Promise<RecoveryResult> {
    const startTime = Date.now();
    let lastError: AIError | null = null;
    let totalAttempts = 0;
    let totalCost = 0;

    // Primary attempt
    try {
      const result = await this.executeWithCircuitBreaker(
        context.provider,
        () => executor(context.provider, context.model),
        context
      );

      return {
        success: true,
        response: result as AIResponse,
        finalProvider: context.provider,
        finalModel: context.model,
        totalAttempts: 1,
        totalLatency: Date.now() - startTime,
        recoveryStrategy: 'primary_success',
        costIncurred: totalCost,
      };

    } catch (error) {
      if (error instanceof AIError) {
        lastError = error;
        totalAttempts++;
        
        await this.recordError(error, context);
        
        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          return {
            success: false,
            totalAttempts,
            totalLatency: Date.now() - startTime,
            recoveryStrategy: 'non_retryable_error',
            costIncurred: totalCost,
          };
        }
      }
    }

    // Retry attempts on same provider
    if (this.retryConfig.maxRetries > 0) {
      const retryResult = await this.attemptRetries(context, executor, lastError);
      if (retryResult.success) {
        return {
          ...retryResult,
          totalLatency: Date.now() - startTime,
          recoveryStrategy: 'retry_success',
        };
      }
      totalAttempts += retryResult.totalAttempts;
      totalCost += retryResult.costIncurred;
      lastError = retryResult.lastError || lastError;
    }

    // Fallback to alternative providers
    const fallbackResult = await this.attemptFallbacks(context, executor, lastError);
    if (fallbackResult.success) {
      return {
        ...fallbackResult,
        totalLatency: Date.now() - startTime,
        totalAttempts: totalAttempts + fallbackResult.totalAttempts,
        recoveryStrategy: 'fallback_success',
        costIncurred: totalCost + fallbackResult.costIncurred,
      };
    }

    // Graceful degradation
    if (this.recoveryStrategy.gracefulDegradation) {
      const degradedResult = await this.attemptGracefulDegradation(context, executor);
      if (degradedResult.success) {
        return {
          ...degradedResult,
          totalLatency: Date.now() - startTime,
          totalAttempts: totalAttempts + fallbackResult.totalAttempts + 1,
          recoveryStrategy: 'graceful_degradation',
          costIncurred: totalCost + fallbackResult.costIncurred + degradedResult.costIncurred,
        };
      }
    }

    // All recovery attempts failed
    return {
      success: false,
      totalAttempts: totalAttempts + fallbackResult.totalAttempts,
      totalLatency: Date.now() - startTime,
      recoveryStrategy: 'all_failed',
      costIncurred: totalCost + fallbackResult.costIncurred,
    };
  }

  /**
   * Check if provider is available (circuit breaker state)
   */
  isProviderAvailable(provider: ApiProvider): boolean {
    const state = this.circuitStates.get(provider);
    if (!state) return true;

    switch (state.state) {
      case CircuitState.CLOSED:
        return true;
      
      case CircuitState.OPEN:
        return Date.now() >= state.nextAttemptTime;
      
      case CircuitState.HALF_OPEN:
        return true;
      
      default:
        return false;
    }
  }

  /**
   * Get current error statistics
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByProvider: Record<ApiProvider, number>;
    criticalErrors: number;
    recentErrors: number; // Last hour
  } {
    const stats = {
      totalErrors: 0,
      errorsByType: {} as Record<string, number>,
      errorsByProvider: {} as Record<ApiProvider, number>,
      criticalErrors: 0,
      recentErrors: 0,
    };

    const oneHourAgo = Date.now() - 3600000;

    for (const [errorKey, metrics] of this.errorMetrics) {
      stats.totalErrors += metrics.count;
      
      if (metrics.severity === 'critical') {
        stats.criticalErrors += metrics.count;
      }
      
      if (metrics.lastOccurrence > oneHourAgo) {
        stats.recentErrors += metrics.count;
      }

      // Parse error key (format: "provider:errorCode")
      const [provider, errorCode] = errorKey.split(':');
      
      if (errorCode) {
        stats.errorsByType[errorCode] = (stats.errorsByType[errorCode] || 0) + metrics.count;
      }
      
      if (provider && Object.values(ApiProvider).includes(provider as ApiProvider)) {
        stats.errorsByProvider[provider as ApiProvider] = 
          (stats.errorsByProvider[provider as ApiProvider] || 0) + metrics.count;
      }
    }

    return stats;
  }

  /**
   * Get circuit breaker statuses
   */
  getCircuitBreakerStatuses(): Record<ApiProvider, {
    state: CircuitState;
    failures: number;
    successes: number;
    isAvailable: boolean;
  }> {
    const statuses: any = {};

    for (const provider of Object.values(ApiProvider)) {
      const state = this.circuitStates.get(provider);
      statuses[provider] = {
        state: state?.state || CircuitState.CLOSED,
        failures: state?.failures || 0,
        successes: state?.successes || 0,
        isAvailable: this.isProviderAvailable(provider),
      };
    }

    return statuses;
  }

  // Private methods

  private async executeWithCircuitBreaker<T>(
    provider: ApiProvider,
    executor: () => Promise<T>,
    context: ErrorContext
  ): Promise<T> {
    const state = this.circuitStates.get(provider);
    if (!state) {
      throw new Error(`Circuit breaker not initialized for ${provider}`);
    }

    // Check if circuit is open
    if (state.state === CircuitState.OPEN) {
      if (Date.now() < state.nextAttemptTime) {
        throw new AIError({
          code: 'CIRCUIT_BREAKER_OPEN',
          message: `Circuit breaker is open for ${provider}`,
          type: 'api_error',
          provider,
          retryable: true,
        });
      } else {
        // Transition to half-open
        state.state = CircuitState.HALF_OPEN;
        state.successes = 0;
      }
    }

    try {
      const result = await executor();
      
      // Record success
      this.recordSuccess(provider);
      
      return result;

    } catch (error) {
      // Record failure
      this.recordFailure(provider);
      throw error;
    }
  }

  private async attemptRetries(
    context: ErrorContext,
    executor: (provider: ApiProvider, model: string) => Promise<any>,
    initialError: AIError | null
  ): Promise<{
    success: boolean;
    response?: any;
    totalAttempts: number;
    costIncurred: number;
    lastError?: AIError;
  }> {
    let attempts = 0;
    let totalCost = 0;
    let lastError = initialError;

    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      attempts++;

      // Calculate delay with exponential backoff and jitter
      const baseDelay = Math.min(
        this.retryConfig.baseDelayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
        this.retryConfig.maxDelayMs
      );
      
      const jitter = baseDelay * this.retryConfig.jitterFactor * (Math.random() * 2 - 1);
      const delay = Math.max(0, baseDelay + jitter);

      await new Promise(resolve => setTimeout(resolve, delay));

      try {
        const result = await this.executeWithCircuitBreaker(
          context.provider,
          () => executor(context.provider, context.model),
          { ...context, attempt }
        );

        return {
          success: true,
          response: result,
          totalAttempts: attempts,
          costIncurred: totalCost,
        };

      } catch (error) {
        if (error instanceof AIError) {
          lastError = error;
          
          await this.recordError(error, { ...context, attempt });
          
          // Stop retrying if error is not retryable
          if (!this.isRetryableError(error)) {
            break;
          }
        }
      }
    }

    return {
      success: false,
      totalAttempts: attempts,
      costIncurred: totalCost,
      lastError,
    };
  }

  private async attemptFallbacks(
    context: ErrorContext,
    executor: (provider: ApiProvider, model: string) => Promise<any>,
    lastError: AIError | null
  ): Promise<{
    success: boolean;
    response?: any;
    finalProvider?: ApiProvider;
    finalModel?: string;
    totalAttempts: number;
    costIncurred: number;
    lastError?: AIError;
  }> {
    let attempts = 0;
    let totalCost = 0;

    for (const fallbackProvider of this.recoveryStrategy.fallbackProviders) {
      if (fallbackProvider === context.provider) continue;
      if (!this.isProviderAvailable(fallbackProvider)) continue;

      attempts++;

      // Find equivalent model for fallback provider
      const fallbackModel = this.findEquivalentModel(context.model, fallbackProvider);
      if (!fallbackModel) continue;

      try {
        const result = await this.executeWithCircuitBreaker(
          fallbackProvider,
          () => executor(fallbackProvider, fallbackModel),
          { ...context, provider: fallbackProvider, model: fallbackModel }
        );

        return {
          success: true,
          response: result,
          finalProvider: fallbackProvider,
          finalModel: fallbackModel,
          totalAttempts: attempts,
          costIncurred: totalCost,
        };

      } catch (error) {
        if (error instanceof AIError) {
          lastError = error;
          await this.recordError(error, { 
            ...context, 
            provider: fallbackProvider, 
            model: fallbackModel 
          });
        }
      }
    }

    return {
      success: false,
      totalAttempts: attempts,
      costIncurred: totalCost,
      lastError,
    };
  }

  private async attemptGracefulDegradation(
    context: ErrorContext,
    executor: (provider: ApiProvider, model: string) => Promise<any>
  ): Promise<{
    success: boolean;
    response?: any;
    finalProvider?: ApiProvider;
    finalModel?: string;
    costIncurred: number;
  }> {
    // Implement graceful degradation strategies
    // For example, use a simpler model or cached response
    
    // Try with the simplest/cheapest model available
    const degradedModels = [
      'gpt-3.5-turbo',
      'claude-3-haiku-20240307',
      'gemini-1.5-flash-8b',
    ];

    for (const model of degradedModels) {
      for (const provider of this.recoveryStrategy.fallbackProviders) {
        if (!this.isProviderAvailable(provider)) continue;

        try {
          const result = await this.executeWithCircuitBreaker(
            provider,
            () => executor(provider, model),
            { ...context, provider, model }
          );

          return {
            success: true,
            response: result,
            finalProvider: provider,
            finalModel: model,
            costIncurred: 0, // Assume lower cost for degraded service
          };

        } catch (error) {
          // Continue to next option
          continue;
        }
      }
    }

    return {
      success: false,
      costIncurred: 0,
    };
  }

  private isRetryableError(error: AIError): boolean {
    return this.recoveryStrategy.retryableErrors.includes(error.code) || error.retryable;
  }

  private findEquivalentModel(originalModel: string, targetProvider: ApiProvider): string | null {
    // Simple model mapping - in production this would be more sophisticated
    const modelMappings: Record<string, Record<ApiProvider, string>> = {
      'gpt-4': {
        [ApiProvider.OPENAI]: 'gpt-4',
        [ApiProvider.ANTHROPIC]: 'claude-3-opus-20240229',
        [ApiProvider.GOOGLE]: 'gemini-1.5-pro',
      },
      'gpt-3.5-turbo': {
        [ApiProvider.OPENAI]: 'gpt-3.5-turbo',
        [ApiProvider.ANTHROPIC]: 'claude-3-haiku-20240307',
        [ApiProvider.GOOGLE]: 'gemini-1.5-flash',
      },
    };

    // Try exact mapping first
    for (const [category, mappings] of Object.entries(modelMappings)) {
      if (Object.values(mappings).includes(originalModel)) {
        return mappings[targetProvider] || null;
      }
    }

    // Fallback to basic model for provider
    const fallbackModels = {
      [ApiProvider.OPENAI]: 'gpt-3.5-turbo',
      [ApiProvider.ANTHROPIC]: 'claude-3-haiku-20240307',
      [ApiProvider.GOOGLE]: 'gemini-1.5-flash',
    };

    return fallbackModels[targetProvider] || null;
  }

  private initializeCircuitBreakers(): void {
    for (const provider of Object.values(ApiProvider)) {
      this.circuitStates.set(provider, {
        state: CircuitState.CLOSED,
        failures: 0,
        successes: 0,
        lastFailureTime: 0,
        lastSuccessTime: 0,
        nextAttemptTime: 0,
      });
    }
  }

  private recordSuccess(provider: ApiProvider): void {
    const state = this.circuitStates.get(provider);
    if (!state) return;

    state.successes++;
    state.lastSuccessTime = Date.now();

    if (state.state === CircuitState.HALF_OPEN) {
      if (state.successes >= this.circuitConfig.successThreshold) {
        state.state = CircuitState.CLOSED;
        state.failures = 0;
      }
    } else if (state.state === CircuitState.CLOSED) {
      // Reset failure count on success
      state.failures = 0;
    }
  }

  private recordFailure(provider: ApiProvider): void {
    const state = this.circuitStates.get(provider);
    if (!state) return;

    state.failures++;
    state.lastFailureTime = Date.now();

    if (state.state === CircuitState.CLOSED) {
      if (state.failures >= this.circuitConfig.failureThreshold) {
        state.state = CircuitState.OPEN;
        state.nextAttemptTime = Date.now() + this.circuitConfig.timeoutMs;
      }
    } else if (state.state === CircuitState.HALF_OPEN) {
      // Go back to open on any failure in half-open state
      state.state = CircuitState.OPEN;
      state.nextAttemptTime = Date.now() + this.circuitConfig.timeoutMs;
    }
  }

  private async recordError(error: AIError, context: ErrorContext): Promise<void> {
    const errorKey = `${context.provider}:${error.code}`;
    
    const existing = this.errorMetrics.get(errorKey);
    const severity = this.classifyErrorSeverity(error);
    
    this.errorMetrics.set(errorKey, {
      count: (existing?.count || 0) + 1,
      lastOccurrence: Date.now(),
      severity,
    });

    // Log error for monitoring (in production, this would go to your logging system)
    console.error('AI Provider Error:', {
      provider: context.provider,
      model: context.model,
      errorCode: error.code,
      errorType: error.type,
      userId: context.userId,
      requestId: context.requestId,
      attempt: context.attempt,
      severity,
      timestamp: new Date().toISOString(),
    });
  }

  private classifyErrorSeverity(error: AIError): 'low' | 'medium' | 'high' | 'critical' {
    switch (error.type) {
      case 'authentication':
        return 'high';
      case 'rate_limit':
        return 'medium';
      case 'invalid_request':
        return 'low';
      case 'api_error':
        return error.code.includes('SERVER') ? 'high' : 'medium';
      case 'network_error':
        return 'medium';
      default:
        return 'medium';
    }
  }
}