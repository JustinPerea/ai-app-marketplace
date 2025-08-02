/**
 * SDK Protection Phase 3B - Protected ML Routing Service
 * 
 * This service provides ML routing decisions via authenticated API calls,
 * protecting the core ML logic from being exposed in the client SDK.
 */

import { PrismaClient, ApiProvider } from '@prisma/client';
import { MLIntelligentRouter, MLRouteDecision } from '@/lib/ai/ml-router';
import { AuthenticatedSdkApp, SdkAuthContext } from './auth';
import { v4 as uuidv4 } from 'uuid';

export interface SanitizedMLRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  optimizeFor?: 'cost' | 'speed' | 'quality' | 'balanced';
  constraints?: {
    maxCost?: number;
    minQuality?: number;
    maxResponseTime?: number;
    preferredProviders?: ApiProvider[];
    excludeProviders?: ApiProvider[];
  };
  metadata?: {
    userAgent?: string;
    appVersion?: string;
    requestContext?: string;
  };
}

export interface SanitizedMLResponse {
  requestId: string;
  provider: ApiProvider;
  model: string;
  estimatedCost: number;
  estimatedLatency: number;
  confidence: number;
  reasoning: string;
  alternatives?: Array<{
    provider: ApiProvider;
    model: string;
    estimatedCost: number;
    estimatedLatency: number;
    reasoning: string;
  }>;
  optimizationType: 'cost' | 'speed' | 'quality' | 'balanced';
  timestamp: string;
  // NO INTERNAL ML DETAILS EXPOSED
}

export interface BatchMLRequest {
  requests: SanitizedMLRequest[];
  batchOptimization?: {
    optimizeFor?: 'cost' | 'speed' | 'quality' | 'balanced';
    loadBalance?: boolean;
    priorityOrder?: number[]; // Indices of requests in priority order
  };
}

export interface BatchMLResponse {
  batchId: string;
  responses: SanitizedMLResponse[];
  batchMetrics: {
    totalEstimatedCost: number;
    avgEstimatedLatency: number;
    providerDistribution: Record<ApiProvider, number>;
    processingTime: number;
  };
  timestamp: string;
}

export interface MLRoutingAnalytics {
  requestId: string;
  actualProvider: ApiProvider;
  actualModel: string;
  actualCost: number;
  actualLatency: number;
  actualQuality?: number; // 0-1 score if available
  userSatisfaction?: number; // 1-5 rating if provided
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Protected ML Routing Service
 * 
 * This service handles all ML routing decisions server-side, ensuring
 * the core ML algorithms remain protected while providing sanitized
 * routing recommendations to authenticated SDK applications.
 */
export class ProtectedMLRoutingService {
  private mlRouter: MLIntelligentRouter;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.mlRouter = new MLIntelligentRouter(prisma);
  }

  /**
   * Get ML routing decision for a single request
   */
  async route(
    request: SanitizedMLRequest,
    context: SdkAuthContext
  ): Promise<SanitizedMLResponse> {
    const requestId = uuidv4();
    
    try {
      // Convert sanitized request to internal ML request format
      const mlRequest = this.convertToMLRequest(request);
      
      // Get ML routing decision using the protected ML router
      const decision = await this.mlRouter.intelligentRoute(
        mlRequest,
        context.app.userId,
        {
          optimizeFor: request.optimizeFor || 'balanced',
          maxCost: request.constraints?.maxCost,
          minQuality: request.constraints?.minQuality,
          maxResponseTime: request.constraints?.maxResponseTime,
        }
      );

      // Filter providers based on constraints
      const filteredDecision = this.applyProviderConstraints(decision, request.constraints);

      // Log the routing decision for analytics and learning
      await this.logRoutingDecision(requestId, context.app.id, request, filteredDecision);

      // Return sanitized response (hide internal ML details)
      return this.sanitizeMLResponse(requestId, filteredDecision, request);

    } catch (error) {
      console.error('ML routing error:', error);
      
      // Log the error
      await this.logRoutingError(requestId, context.app.id, request, error);
      
      // Return fallback routing decision
      return this.getFallbackResponse(requestId, request);
    }
  }

  /**
   * Batch ML routing optimization
   */
  async batchRoute(
    batchRequest: BatchMLRequest,
    context: SdkAuthContext
  ): Promise<BatchMLResponse> {
    const batchId = uuidv4();
    const startTime = Date.now();
    
    try {
      // Process requests in parallel for speed
      const routingPromises = batchRequest.requests.map(async (request, index) => {
        // Add batch context to individual requests
        const requestWithContext = {
          ...request,
          metadata: {
            ...request.metadata,
            batchId,
            batchIndex: index,
            batchSize: batchRequest.requests.length,
          },
        };
        
        return this.route(requestWithContext, context);
      });

      const responses = await Promise.all(routingPromises);

      // Apply batch optimization if requested
      const optimizedResponses = this.applyBatchOptimization(
        responses,
        batchRequest.batchOptimization
      );

      // Calculate batch metrics
      const batchMetrics = this.calculateBatchMetrics(optimizedResponses, startTime);

      // Log batch operation
      await this.logBatchOperation(batchId, context.app.id, batchRequest, optimizedResponses);

      return {
        batchId,
        responses: optimizedResponses,
        batchMetrics,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Batch ML routing error:', error);
      throw new Error('Batch routing failed');
    }
  }

  /**
   * Record actual performance for ML learning
   */
  async recordActualPerformance(
    analytics: MLRoutingAnalytics,
    context: SdkAuthContext
  ): Promise<void> {
    try {
      // Update ML routing log with actual performance
      await this.prisma.mlRoutingLog.update({
        where: { requestId: analytics.requestId },
        data: {
          actualCost: analytics.actualCost,
          actualLatency: analytics.actualLatency,
          actualProvider: analytics.actualProvider,
          actualModel: analytics.actualModel,
          success: analytics.success,
          errorMessage: analytics.errorMessage,
          errorCode: analytics.errorCode,
        },
      });

      // Feed data back to ML router for learning
      if (analytics.success) {
        // Create mock response for learning (we don't store actual AI responses)
        const mockResponse = {
          choices: [{ finishReason: 'stop' as const }],
          usage: { cost: analytics.actualCost },
        };

        await this.mlRouter.learnFromExecution(
          this.createMockRequestForLearning(analytics),
          context.app.userId,
          analytics.actualProvider,
          analytics.actualModel,
          mockResponse,
          analytics.actualLatency,
          analytics.userSatisfaction
        );
      }

    } catch (error) {
      console.error('Error recording actual performance:', error);
      // Don't throw - this shouldn't break the client request
    }
  }

  // Private helper methods

  private convertToMLRequest(request: SanitizedMLRequest): any {
    return {
      messages: request.messages,
      maxTokens: 4000, // Default reasonable limit
      temperature: 0.7,
      // Don't expose internal request structure to clients
    };
  }

  private applyProviderConstraints(
    decision: MLRouteDecision,
    constraints?: SanitizedMLRequest['constraints']
  ): MLRouteDecision {
    if (!constraints) return decision;

    // Filter out excluded providers
    if (constraints.excludeProviders?.includes(decision.selectedProvider)) {
      // Find alternative from decision.alternatives
      const alternative = decision.alternatives.find(
        alt => !constraints.excludeProviders!.includes(alt.provider)
      );
      
      if (alternative) {
        return {
          ...decision,
          selectedProvider: alternative.provider,
          selectedModel: alternative.model,
          predictedCost: alternative.predictedCost,
          predictedResponseTime: alternative.predictedResponseTime,
          predictedQuality: alternative.predictedQuality,
          confidence: alternative.confidence,
          reasoning: `Excluded preferred provider, using alternative: ${alternative.reasoning}`,
        };
      }
    }

    // Prefer specific providers if specified
    if (constraints.preferredProviders?.length) {
      const preferredAlternative = decision.alternatives.find(
        alt => constraints.preferredProviders!.includes(alt.provider)
      );
      
      if (preferredAlternative && 
          constraints.preferredProviders.includes(preferredAlternative.provider)) {
        return {
          ...decision,
          selectedProvider: preferredAlternative.provider,
          selectedModel: preferredAlternative.model,
          predictedCost: preferredAlternative.predictedCost,
          predictedResponseTime: preferredAlternative.predictedResponseTime,
          predictedQuality: preferredAlternative.predictedQuality,
          confidence: preferredAlternative.confidence,
          reasoning: `Using preferred provider: ${preferredAlternative.reasoning}`,
        };
      }
    }

    return decision;
  }

  private sanitizeMLResponse(
    requestId: string,
    decision: MLRouteDecision,
    originalRequest: SanitizedMLRequest
  ): SanitizedMLResponse {
    // Remove all internal ML implementation details
    const sanitizedReasoning = this.sanitizeReasoning(decision.reasoning);
    
    const alternatives = decision.alternatives.slice(0, 3).map(alt => ({
      provider: alt.provider,
      model: alt.model,
      estimatedCost: Math.round(alt.predictedCost * 10000) / 10000, // Round to 4 decimal places
      estimatedLatency: Math.round(alt.predictedResponseTime),
      reasoning: this.sanitizeReasoning(alt.reasoning),
    }));

    return {
      requestId,
      provider: decision.selectedProvider,
      model: decision.selectedModel,
      estimatedCost: Math.round(decision.predictedCost * 10000) / 10000,
      estimatedLatency: Math.round(decision.predictedResponseTime),
      confidence: Math.round(decision.confidence * 100) / 100,
      reasoning: sanitizedReasoning,
      alternatives,
      optimizationType: decision.optimizationType,
      timestamp: new Date().toISOString(),
    };
  }

  private sanitizeReasoning(reasoning: string): string {
    // Remove internal ML implementation details
    return reasoning
      .replace(/Feature vector:.*$/gm, '')
      .replace(/ML score:.*$/gm, '')
      .replace(/Neural network.*$/gm, '')
      .replace(/Training data.*$/gm, '')
      .replace(/Algorithm:.*$/gm, '')
      .replace(/Model weights.*$/gm, '')
      .replace(/Internal.*$/gm, '')
      .trim() || 'Optimized selection based on historical performance';
  }

  private async logRoutingDecision(
    requestId: string,
    appId: string,
    request: SanitizedMLRequest,
    decision: MLRouteDecision
  ): Promise<void> {
    try {
      // Create sanitized request data (no sensitive information)
      const sanitizedRequestData = {
        messageCount: request.messages.length,
        promptLength: request.messages.reduce((sum, msg) => sum + msg.content.length, 0),
        optimizeFor: request.optimizeFor || 'balanced',
        hasConstraints: !!request.constraints,
        appVersion: request.metadata?.appVersion,
        requestContext: request.metadata?.requestContext,
      };

      // Create sanitized routing decision data
      const sanitizedDecision = {
        provider: decision.selectedProvider,
        model: decision.selectedModel,
        estimatedCost: decision.predictedCost,
        estimatedLatency: decision.predictedResponseTime,
        confidence: decision.confidence,
        optimizationType: decision.optimizationType,
        alternativeCount: decision.alternatives.length,
      };

      await this.prisma.mlRoutingLog.create({
        data: {
          appId,
          requestId,
          requestData: sanitizedRequestData,
          routingDecision: sanitizedDecision,
          confidence: decision.confidence,
          mlReasoning: this.sanitizeReasoning(decision.reasoning),
        },
      });
    } catch (error) {
      console.error('Error logging routing decision:', error);
    }
  }

  private async logRoutingError(
    requestId: string,
    appId: string,
    request: SanitizedMLRequest,
    error: any
  ): Promise<void> {
    try {
      await this.prisma.mlRoutingLog.create({
        data: {
          appId,
          requestId,
          requestData: {
            messageCount: request.messages.length,
            optimizeFor: request.optimizeFor || 'balanced',
            error: true,
          },
          routingDecision: {},
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorCode: 'ML_ROUTING_FAILED',
        },
      });
    } catch (logError) {
      console.error('Error logging routing error:', logError);
    }
  }

  private getFallbackResponse(
    requestId: string,
    request: SanitizedMLRequest
  ): SanitizedMLResponse {
    // Provide safe fallback when ML routing fails
    return {
      requestId,
      provider: ApiProvider.OPENAI,
      model: 'gpt-4o-mini',
      estimatedCost: 0.01,
      estimatedLatency: 2000,
      confidence: 0.5,
      reasoning: 'Fallback routing - ML service temporarily unavailable',
      optimizationType: request.optimizeFor || 'balanced',
      timestamp: new Date().toISOString(),
    };
  }

  private applyBatchOptimization(
    responses: SanitizedMLResponse[],
    optimization?: BatchMLRequest['batchOptimization']
  ): SanitizedMLResponse[] {
    if (!optimization) return responses;

    // Apply load balancing if requested
    if (optimization.loadBalance) {
      return this.applyLoadBalancing(responses);
    }

    // Apply priority ordering if specified
    if (optimization.priorityOrder) {
      const reordered = new Array(responses.length);
      optimization.priorityOrder.forEach((originalIndex, newIndex) => {
        if (originalIndex < responses.length) {
          reordered[newIndex] = responses[originalIndex];
        }
      });
      return reordered.filter(Boolean);
    }

    return responses;
  }

  private applyLoadBalancing(responses: SanitizedMLResponse[]): SanitizedMLResponse[] {
    // Simple load balancing: distribute requests across providers
    const providerCounts = new Map<ApiProvider, number>();
    
    return responses.map(response => {
      const currentCount = providerCounts.get(response.provider) || 0;
      providerCounts.set(response.provider, currentCount + 1);
      
      // If a provider is getting too many requests, try to use an alternative
      if (currentCount > responses.length / 3 && response.alternatives?.length) {
        const lessUsedAlternative = response.alternatives.find(alt => 
          (providerCounts.get(alt.provider) || 0) < currentCount
        );
        
        if (lessUsedAlternative) {
          providerCounts.set(response.provider, currentCount - 1);
          providerCounts.set(lessUsedAlternative.provider, 
            (providerCounts.get(lessUsedAlternative.provider) || 0) + 1);
          
          return {
            ...response,
            provider: lessUsedAlternative.provider,
            model: lessUsedAlternative.model,
            estimatedCost: lessUsedAlternative.estimatedCost,
            estimatedLatency: lessUsedAlternative.estimatedLatency,
            reasoning: `Load balanced: ${lessUsedAlternative.reasoning}`,
          };
        }
      }
      
      return response;
    });
  }

  private calculateBatchMetrics(
    responses: SanitizedMLResponse[],
    startTime: number
  ): BatchMLResponse['batchMetrics'] {
    const totalEstimatedCost = responses.reduce((sum, r) => sum + r.estimatedCost, 0);
    const avgEstimatedLatency = responses.reduce((sum, r) => sum + r.estimatedLatency, 0) / responses.length;
    
    const providerDistribution: Record<ApiProvider, number> = {} as any;
    responses.forEach(r => {
      providerDistribution[r.provider] = (providerDistribution[r.provider] || 0) + 1;
    });
    
    return {
      totalEstimatedCost: Math.round(totalEstimatedCost * 10000) / 10000,
      avgEstimatedLatency: Math.round(avgEstimatedLatency),
      providerDistribution,
      processingTime: Date.now() - startTime,
    };
  }

  private async logBatchOperation(
    batchId: string,
    appId: string,
    request: BatchMLRequest,
    responses: SanitizedMLResponse[]
  ): Promise<void> {
    try {
      await this.prisma.sdkAnalytics.create({
        data: {
          appId,
          eventType: 'batch_ml_route',
          eventData: {
            batchId,
            requestCount: request.requests.length,
            totalEstimatedCost: responses.reduce((sum, r) => sum + r.estimatedCost, 0),
            providerDistribution: responses.reduce((acc, r) => {
              acc[r.provider] = (acc[r.provider] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
          },
          successful: true,
        },
      });
    } catch (error) {
      console.error('Error logging batch operation:', error);
    }
  }

  private createMockRequestForLearning(analytics: MLRoutingAnalytics): any {
    // Create minimal request structure for ML learning without exposing sensitive data
    return {
      messages: [{ role: 'user', content: 'placeholder' }],
      // Minimal structure needed for learning algorithm
    };
  }
}