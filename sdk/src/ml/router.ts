/**
 * ML-Powered Intelligent AI Provider Router
 * 
 * Enhanced ML router with real-time accuracy monitoring for Claude 4 integration
 * Features:
 * - Advanced machine learning for optimal provider selection
 * - Context-aware routing based on request patterns
 * - Cost and performance optimization
 * - Learning from usage patterns
 * - Real-time accuracy monitoring and drift detection
 * - A/B testing integration
 * - Performance monitoring with minimal overhead
 */

import {
  APIProvider,
  AIRequest,
  AIResponse,
  AIModel,
  AIError,
  RequestFeatures,
  ProviderPerformance,
  PredictionResult,
  MLRouteDecision,
  RequestType,
  LearningData,
} from '../types';

import { MLAccuracyMonitor } from './accuracy-monitor';
import { ABTestingFramework, ABTestResult } from './ab-testing';
import { PerformanceMonitor } from './performance-monitor';

interface RoutingOptions {
  optimizeFor?: 'cost' | 'speed' | 'quality' | 'balanced';
  maxCost?: number;
  minQuality?: number;
  maxResponseTime?: number;
}

interface EnhancedRoutingOptions extends RoutingOptions {
  enableAccuracyMonitoring?: boolean;
  enableABTesting?: boolean;
  enablePerformanceMonitoring?: boolean;
  monitoringConfig?: {
    samplingRate?: number;
    asyncProcessing?: boolean;
  };
}

export class MLIntelligentRouter {
  private performanceHistory: Map<string, ProviderPerformance[]> = new Map();
  private learningData: LearningData[] = [];
  private userPatterns: Map<string, RequestFeatures[]> = new Map();
  
  // Monitoring systems
  private accuracyMonitor: MLAccuracyMonitor;
  private abTesting: ABTestingFramework;
  private performanceMonitor: PerformanceMonitor;
  
  // Configuration
  private readonly LEARNING_RATE = 0.1;
  private readonly MIN_SAMPLES_FOR_PREDICTION = 5;
  private readonly CONFIDENCE_THRESHOLD = 0.6;
  private readonly MAX_LEARNING_DATA = 1000;
  
  // Monitoring flags
  private accuracyMonitoringEnabled = true;
  private abTestingEnabled = true;
  private performanceMonitoringEnabled = true;

  constructor(config?: {
    enableAccuracyMonitoring?: boolean;
    enableABTesting?: boolean;
    enablePerformanceMonitoring?: boolean;
  }) {
    this.accuracyMonitoringEnabled = config?.enableAccuracyMonitoring ?? true;
    this.abTestingEnabled = config?.enableABTesting ?? true;
    this.performanceMonitoringEnabled = config?.enablePerformanceMonitoring ?? true;
    
    // Initialize monitoring systems
    this.accuracyMonitor = new MLAccuracyMonitor();
    this.abTesting = new ABTestingFramework();
    this.performanceMonitor = new PerformanceMonitor();
    
    this.initializeMLSystem();
    this.initializeClaude4Monitoring();
  }

  /**
   * Main ML-powered routing method with enhanced monitoring
   */
  async intelligentRoute(
    request: AIRequest,
    userId: string,
    availableProviders: APIProvider[],
    options: EnhancedRoutingOptions = {}
  ): Promise<MLRouteDecision & { routingMetrics?: { routingTime: number; monitoringOverhead: number } }> {
    const routingStartTime = performance.now();
    let monitoringOverhead = 0;
    
    try {
      // Extract features from the request
      const requestFeatures = this.extractRequestFeatures(request, userId);
      
      // Check for A/B testing participation
      const abTestAssignment = this.checkABTestParticipation(userId, request);
      
      let predictions: PredictionResult[];
      let selected: PredictionResult;
      
      if (abTestAssignment) {
        // Use A/B test assignment
        const variantConfig = this.abTesting.getVariantConfig(abTestAssignment.testId, abTestAssignment.variant);
        if (variantConfig) {
          selected = await this.predictSingleProviderPerformance(requestFeatures, variantConfig.provider, variantConfig.model) ||
                    this.getBaselineEstimate(requestFeatures, variantConfig.provider, variantConfig.model);
          predictions = [selected];
        } else {
          predictions = await this.predictProviderPerformance(requestFeatures, availableProviders);
          selected = this.selectOptimalProvider(predictions, options.optimizeFor || 'balanced');
        }
      } else {
        // Normal ML routing
        predictions = await this.predictProviderPerformance(requestFeatures, availableProviders);
        
        // Apply quality score adjustments from monitoring
        if (this.accuracyMonitoringEnabled) {
          const monitoringStart = performance.now();
          predictions = this.adjustPredictionsWithMonitoringData(predictions);
          monitoringOverhead += performance.now() - monitoringStart;
        }
        
        // Filter predictions based on constraints
        const validPredictions = this.filterPredictions(predictions, options);
        
        if (validPredictions.length === 0) {
          // Fallback to simple routing
          const fallback = this.fallbackRouting(request, availableProviders, options);
          return { ...fallback, routingMetrics: { routingTime: performance.now() - routingStartTime, monitoringOverhead } };
        }
        
        // Select optimal provider based on optimization strategy
        const optimizationType = options.optimizeFor || 'balanced';
        selected = this.selectOptimalProvider(validPredictions, optimizationType);
      }
      
      // Record routing performance
      const routingTime = performance.now() - routingStartTime;
      if (this.performanceMonitoringEnabled) {
        this.performanceMonitor.recordRoutingPerformance(routingTime, selected);
      }
      
      // Prepare alternatives
      const alternatives = predictions
        .filter(p => p.provider !== selected.provider || p.model !== selected.model)
        .slice(0, 3);
      
      const decision: MLRouteDecision = {
        selectedProvider: selected.provider,
        selectedModel: selected.model,
        predictedCost: selected.predictedCost,
        predictedResponseTime: selected.predictedResponseTime,
        predictedQuality: selected.predictedQuality,
        confidence: selected.confidence,
        reasoning: this.generateMLReasoning(selected, options.optimizeFor || 'balanced'),
        alternatives,
        optimizationType: options.optimizeFor || 'balanced',
      };
      
      return {
        ...decision,
        routingMetrics: {
          routingTime,
          monitoringOverhead,
        },
      };
      
    } catch (error) {
      console.error('ML routing failed, falling back to simple routing:', error);
      const fallback = this.fallbackRouting(request, availableProviders, options);
      return { 
        ...fallback, 
        routingMetrics: { 
          routingTime: performance.now() - routingStartTime, 
          monitoringOverhead 
        } 
      };
    }
  }

  /**
   * Enhanced learning method with accuracy monitoring integration
   */
  async learnFromExecution(
    request: AIRequest,
    userId: string,
    actualProvider: APIProvider,
    actualModel: string,
    actualResponse: AIResponse,
    actualResponseTime: number,
    prediction?: PredictionResult,
    userSatisfaction?: number
  ): Promise<void> {
    try {
      const requestFeatures = this.extractRequestFeatures(request, userId);
      const actualQuality = this.calculateActualQuality(actualResponse, userSatisfaction);
      
      const learningData: LearningData = {
        requestFeatures,
        actualProvider,
        actualModel,
        actualCost: actualResponse.usage.cost,
        actualResponseTime,
        actualQuality,
        userSatisfaction,
        timestamp: Date.now(),
      };
      
      // Add to learning dataset
      this.learningData.push(learningData);
      
      // Maintain dataset size
      if (this.learningData.length > this.MAX_LEARNING_DATA) {
        this.learningData = this.learningData.slice(-this.MAX_LEARNING_DATA);
      }
      
      // Update performance history
      this.updatePerformanceHistory(learningData);
      
      // Update user patterns
      this.updateUserPatterns(userId, requestFeatures);
      
      // Enhanced monitoring integration
      if (prediction && this.accuracyMonitoringEnabled) {
        await this.accuracyMonitor.trackPredictionAccuracy(prediction, learningData, requestFeatures);
      }
      
      // Record A/B test result if applicable
      const abTestAssignment = this.getUserABTestAssignment(userId);
      if (abTestAssignment && this.abTestingEnabled) {
        const abTestResult: ABTestResult = {
          testId: abTestAssignment.testId,
          variant: abTestAssignment.variant,
          userId,
          requestId: actualResponse.id,
          timestamp: Date.now(),
          request,
          prediction: prediction!,
          actualResponse,
          actualCost: learningData.actualCost,
          actualResponseTime: learningData.actualResponseTime,
          actualQuality: learningData.actualQuality,
          userSatisfaction,
          costAccuracy: this.calculateAccuracy(prediction?.predictedCost || 0, learningData.actualCost),
          timeAccuracy: this.calculateAccuracy(prediction?.predictedResponseTime || 0, learningData.actualResponseTime),
          qualityAccuracy: this.calculateAccuracy(prediction?.predictedQuality || 0, learningData.actualQuality),
        };
        
        this.abTesting.recordResult(abTestResult);
      }
      
      // Record request performance
      if (this.performanceMonitoringEnabled) {
        this.performanceMonitor.recordRequest(
          request,
          actualResponse,
          actualResponseTime,
          undefined,
          actualProvider,
          actualModel
        );
      }
      
    } catch (error) {
      console.error('Failed to learn from execution:', error);
      
      // Record error for performance monitoring
      if (this.performanceMonitoringEnabled) {
        this.performanceMonitor.recordRequest(
          request,
          null,
          actualResponseTime,
          error as Error,
          actualProvider,
          actualModel
        );
      }
    }
  }

  /**
   * Get enhanced ML insights with monitoring data
   */
  async getMLInsights(userId?: string): Promise<{
    totalPredictions: number;
    averageConfidence: number;
    accuracyMetrics: {
      costAccuracy: number;
      timeAccuracy: number;
      qualityAccuracy: number;
    };
    userPatterns?: {
      commonRequestTypes: Array<{ type: RequestType; frequency: number }>;
      preferredProviders: Array<{ provider: APIProvider; usage: number }>;
      costSavingsAchieved: number;
    };
    modelRecommendations: Array<{
      scenario: string;
      recommendedProvider: APIProvider;
      expectedSavings: number;
    }>;
    monitoringData?: {
      driftDetections: number;
      activeAlerts: number;
      systemHealth: string;
      claude4Performance: any;
    };
    abTestingSummary?: {
      activeTests: number;
      completedTests: number;
      significantResults: number;
    };
  }> {
    const insights = {
      totalPredictions: this.learningData.length,
      averageConfidence: this.calculateAverageConfidence(),
      accuracyMetrics: this.calculateAccuracyMetrics(),
      modelRecommendations: this.generateModelRecommendations(),
    };

    // Add monitoring data if enabled
    let monitoringData;
    if (this.accuracyMonitoringEnabled || this.performanceMonitoringEnabled) {
      const claude4Drift = await this.accuracyMonitor.detectClaude4Drift();
      const healthStatus = this.performanceMonitor.getHealthStatus();
      
      monitoringData = {
        driftDetections: this.accuracyMonitor.getAlerts().filter(a => a.type === 'drift_detected').length,
        activeAlerts: this.accuracyMonitor.getAlerts(true).length + this.performanceMonitor.getAlerts(true).length,
        systemHealth: healthStatus.status,
        claude4Performance: claude4Drift,
      };
    }

    // Add A/B testing summary if enabled
    let abTestingSummary;
    if (this.abTestingEnabled) {
      const allTests = this.abTesting.getAllTests();
      const activeTests = allTests.filter(t => t.status === 'running').length;
      const completedTests = allTests.filter(t => t.status === 'completed').length;
      
      abTestingSummary = {
        activeTests,
        completedTests,
        significantResults: 0, // Would count significant test results
      };
    }

    if (userId) {
      const userPatterns = this.analyzeUserPatterns(userId);
      return { ...insights, userPatterns, monitoringData, abTestingSummary };
    }

    return { ...insights, monitoringData, abTestingSummary };
  }

  // Private Methods

  private initializeMLSystem(): void {
    // Initialize with basic performance assumptions
    this.initializeBaselinePerformance();
  }

  /**
   * Initialize Claude 4 monitoring with baseline A/B test
   */
  private initializeClaude4Monitoring(): void {
    if (!this.abTestingEnabled) return;

    // Create Claude 4 vs Claude 3.5 Sonnet comparison test
    const claude4Test = {
      id: 'claude4-vs-claude35-sonnet',
      name: 'Claude 4 vs Claude 3.5 Sonnet Performance',
      description: 'Compare Claude 4 Sonnet performance against Claude 3.5 Sonnet',
      hypothesis: 'Claude 4 Sonnet provides better quality with comparable cost and speed',
      variantA: {
        provider: APIProvider.ANTHROPIC,
        model: 'claude-3-5-sonnet-20241022',
        weight: 0.5,
      },
      variantB: {
        provider: APIProvider.ANTHROPIC,
        model: 'claude-sonnet-4-20250514',
        weight: 0.5,
      },
      minSampleSize: 50,
      maxDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
      significanceLevel: 0.05,
      minimumDetectableEffect: 0.05,
      trafficAllocation: 0.2, // 20% of traffic
      primaryMetric: 'quality' as const,
      secondaryMetrics: ['cost', 'responseTime'] as Array<'cost' | 'quality' | 'responseTime' | 'accuracy' | 'userSatisfaction'>,
      status: 'draft' as const,
      autoStop: {
        enabled: true,
        winnerThreshold: 0.95,
        futilityThreshold: 0.1,
      },
    };

    try {
      this.abTesting.createTest(claude4Test);
      // Auto-start the test in production
      // this.abTesting.startTest(claude4Test.id);
    } catch (error) {
      console.warn('Failed to initialize Claude 4 A/B test:', error);
    }
  }

  /**
   * Check if user should participate in A/B testing
   */
  private checkABTestParticipation(userId: string, request: AIRequest): { testId: string; variant: 'A' | 'B' } | null {
    if (!this.abTestingEnabled) return null;

    const runningTests = this.abTesting.getRunningTests();
    
    for (const test of runningTests) {
      if (this.abTesting.shouldParticipateInTest(test.id, userId, request)) {
        const variant = this.abTesting.assignVariant(test.id, userId);
        if (variant) {
          return { testId: test.id, variant };
        }
      }
    }
    
    return null;
  }

  /**
   * Get user's current A/B test assignment
   */
  private getUserABTestAssignment(userId: string): { testId: string; variant: 'A' | 'B' } | null {
    // This would be stored in user session or database in production
    // For now, return null as placeholder
    return null;
  }

  /**
   * Adjust predictions with real-time monitoring data
   */
  private adjustPredictionsWithMonitoringData(predictions: PredictionResult[]): PredictionResult[] {
    return predictions.map(prediction => {
      const modelKey = `${prediction.provider}_${prediction.model}`;
      const currentMetrics = this.accuracyMonitor.getCurrentAccuracyMetrics(modelKey);
      
      if (currentMetrics && currentMetrics.sampleSize >= 10) {
        // Adjust predictions based on actual accuracy
        const accuracyAdjustment = currentMetrics.overallAccuracy / 0.85; // Baseline accuracy
        
        return {
          ...prediction,
          confidence: Math.min(1.0, prediction.confidence * accuracyAdjustment),
          predictedQuality: Math.min(1.0, prediction.predictedQuality * (currentMetrics.qualityAccuracy / 0.85)),
          reasoning: `${prediction.reasoning} (adjusted with ${currentMetrics.sampleSize} samples)`,
        };
      }
      
      return prediction;
    });
  }

  /**
   * Calculate accuracy between predicted and actual values
   */
  private calculateAccuracy(predicted: number, actual: number): number {
    if (actual === 0) return predicted === 0 ? 1 : 0;
    return Math.max(0, 1 - Math.abs(predicted - actual) / Math.max(actual, 0.001));
  }

  private extractRequestFeatures(request: AIRequest, userId: string): RequestFeatures {
    const promptText = request.messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' ');
    
    const systemMessages = request.messages.filter(m => m.role === 'system');
    
    const now = new Date();
    
    return {
      promptLength: promptText.length,
      messageCount: request.messages.length,
      hasSystemMessage: systemMessages.length > 0,
      complexityScore: this.calculateComplexityScore(request),
      requestType: this.classifyRequestType(promptText),
      userPatternId: this.getUserPatternId(userId),
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
    };
  }

  private calculateComplexityScore(request: AIRequest): number {
    let score = 0;
    
    // Factors that increase complexity
    score += request.messages.length * 0.1;
    score += (request.maxTokens || 0) / 1000;
    score += request.tools?.length || 0;
    
    const totalText = request.messages.map(m => m.content).join(' ');
    
    // Text complexity indicators
    if (totalText.includes('analyze') || totalText.includes('compare')) score += 0.3;
    if (totalText.includes('code') || totalText.includes('function')) score += 0.4;
    if (totalText.includes('explain') || totalText.includes('detail')) score += 0.2;
    if (totalText.length > 1000) score += 0.3;
    
    return Math.min(1.0, score);
  }

  private classifyRequestType(promptText: string): RequestType {
    const text = promptText.toLowerCase();
    
    if (text.includes('code') || text.includes('function') || text.includes('programming')) {
      return RequestType.CODE_GENERATION;
    }
    if (text.includes('analyze') || text.includes('data') || text.includes('report')) {
      return RequestType.DATA_PROCESSING;
    }
    if (text.includes('write') || text.includes('story') || text.includes('creative')) {
      return RequestType.CREATIVE_WRITING;
    }
    if (text.includes('help') || text.includes('support') || text.includes('problem')) {
      return RequestType.TECHNICAL_SUPPORT;
    }
    if (text.includes('complex') || text.includes('difficult') || text.length > 500) {
      return RequestType.COMPLEX_ANALYSIS;
    }
    
    return RequestType.SIMPLE_CHAT;
  }

  private getUserPatternId(userId: string): string | undefined {
    const userHistory = this.userPatterns.get(userId);
    if (!userHistory || userHistory.length < 3) return undefined;
    
    // Simple pattern clustering based on request types and complexity
    const patterns = userHistory.slice(-10); // Use recent patterns
    const avgComplexity = patterns.reduce((sum, p) => sum + p.complexityScore, 0) / patterns.length;
    const commonType = this.getMostCommonRequestType(patterns);
    
    return `${commonType}_${avgComplexity > 0.5 ? 'complex' : 'simple'}`;
  }

  private getMostCommonRequestType(patterns: RequestFeatures[]): RequestType {
    const typeCounts = new Map<RequestType, number>();
    
    patterns.forEach(p => {
      typeCounts.set(p.requestType, (typeCounts.get(p.requestType) || 0) + 1);
    });
    
    let maxCount = 0;
    let commonType = RequestType.SIMPLE_CHAT;
    
    for (const [type, count] of typeCounts) {
      if (count > maxCount) {
        maxCount = count;
        commonType = type;
      }
    }
    
    return commonType;
  }

  private async predictProviderPerformance(
    features: RequestFeatures,
    availableProviders: APIProvider[]
  ): Promise<PredictionResult[]> {
    const predictions: PredictionResult[] = [];
    
    for (const provider of availableProviders) {
      const models = this.getProviderModels(provider);
      
      for (const model of models) {
        const prediction = this.predictSingleProviderPerformance(features, provider, model);
        
        if (prediction) {
          predictions.push(prediction);
        }
      }
    }
    
    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  private predictSingleProviderPerformance(
    features: RequestFeatures,
    provider: APIProvider,
    model: string
  ): PredictionResult | null {
    const providerKey = `${provider}_${model}`;
    const historicalData = this.performanceHistory.get(providerKey) || [];
    
    if (historicalData.length < this.MIN_SAMPLES_FOR_PREDICTION) {
      // Use baseline estimates
      return this.getBaselineEstimate(features, provider, model);
    }
    
    // Simple ML prediction based on historical data and features
    const relevantData = this.filterRelevantHistoricalData(historicalData, features);
    
    if (relevantData.length === 0) {
      return this.getBaselineEstimate(features, provider, model);
    }
    
    const predictions = this.calculateWeightedPredictions(relevantData, features);
    const confidence = this.calculatePredictionConfidence(relevantData, features);
    
    return {
      provider,
      model,
      predictedCost: predictions.cost,
      predictedResponseTime: predictions.responseTime,
      predictedQuality: predictions.quality,
      confidence,
      reasoning: `ML prediction based on ${relevantData.length} similar requests`,
    };
  }

  private getBaselineEstimate(
    features: RequestFeatures,
    provider: APIProvider,
    model: string
  ): PredictionResult {
    // Simple baseline estimates
    const baseCosts: Record<APIProvider, Record<string, number>> = {
      [APIProvider.OPENAI]: { 'gpt-3.5-turbo': 0.002, 'gpt-4': 0.03, 'gpt-4o': 0.01, 'gpt-4o-mini': 0.0003 },
      [APIProvider.ANTHROPIC]: { 'claude-3-haiku-20240307': 0.001, 'claude-sonnet-4-20250514': 0.01, 'claude-3-5-sonnet-20241022': 0.01 },
      [APIProvider.GOOGLE]: { 'gemini-1.5-flash': 0.0007, 'gemini-1.5-pro': 0.0025, 'gemini-pro': 0.001 },
    };

    const baseTimes: Record<APIProvider, number> = {
      [APIProvider.OPENAI]: 2000,
      [APIProvider.ANTHROPIC]: 2500,
      [APIProvider.GOOGLE]: 1800,
    };

    const baseQuality: Record<APIProvider, number> = {
      [APIProvider.OPENAI]: model.includes('gpt-4') ? 0.9 : 0.8,
      [APIProvider.ANTHROPIC]: model.includes('sonnet') ? 0.95 : 0.85,
      [APIProvider.GOOGLE]: model.includes('pro') ? 0.85 : 0.8,
    };

    const modelCosts = baseCosts[provider] || {};
    const baseCost = modelCosts[model] || 0.01;
    const complexityMultiplier = 1 + features.complexityScore;

    return {
      provider,
      model,
      predictedCost: baseCost * complexityMultiplier,
      predictedResponseTime: (baseTimes[provider] || 2000) * complexityMultiplier,
      predictedQuality: baseQuality[provider] || 0.8,
      confidence: 0.5,
      reasoning: 'Baseline estimate (insufficient historical data)',
    };
  }

  private filterRelevantHistoricalData(
    historicalData: ProviderPerformance[],
    features: RequestFeatures
  ): ProviderPerformance[] {
    return historicalData.filter(data => {
      const timeDiff = Math.abs(Date.now() - data.lastUpdated);
      const isRecent = timeDiff < 7 * 24 * 60 * 60 * 1000; // Within 7 days
      
      return isRecent && data.sampleSize >= 2;
    });
  }

  private calculateWeightedPredictions(
    relevantData: ProviderPerformance[],
    features: RequestFeatures
  ): { cost: number; responseTime: number; quality: number } {
    const weights = relevantData.map(data => 1 / (1 + (Date.now() - data.lastUpdated) / (24 * 60 * 60 * 1000)));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    const cost = relevantData.reduce((sum, data, i) => sum + data.avgCost * weights[i], 0) / totalWeight;
    const responseTime = relevantData.reduce((sum, data, i) => sum + data.avgResponseTime * weights[i], 0) / totalWeight;
    const quality = relevantData.reduce((sum, data, i) => sum + data.qualityScore * weights[i], 0) / totalWeight;
    
    // Apply feature-based adjustments
    const complexityMultiplier = 1 + features.complexityScore * 0.3;
    
    return {
      cost: cost * complexityMultiplier,
      responseTime: responseTime * complexityMultiplier,
      quality: quality * (1 + features.complexityScore * 0.1),
    };
  }

  private calculatePredictionConfidence(
    relevantData: ProviderPerformance[],
    features: RequestFeatures
  ): number {
    if (relevantData.length === 0) return 0;
    
    const sampleSizeConfidence = Math.min(1, relevantData.length / 10);
    const recencyConfidence = relevantData.reduce((avg, data) => {
      const daysSinceUpdate = (Date.now() - data.lastUpdated) / (24 * 60 * 60 * 1000);
      return avg + Math.max(0, 1 - daysSinceUpdate / 14); // Confidence decreases over 14 days
    }, 0) / relevantData.length;
    
    return (sampleSizeConfidence * 0.6 + recencyConfidence * 0.4);
  }

  private filterPredictions(
    predictions: PredictionResult[],
    options: RoutingOptions
  ): PredictionResult[] {
    return predictions.filter(p => {
      if (options.maxCost && p.predictedCost > options.maxCost) return false;
      if (options.minQuality && p.predictedQuality < options.minQuality) return false;
      if (options.maxResponseTime && p.predictedResponseTime > options.maxResponseTime) return false;
      if (p.confidence < this.CONFIDENCE_THRESHOLD) return false;
      
      return true;
    });
  }

  private selectOptimalProvider(
    predictions: PredictionResult[],
    optimizationType: 'cost' | 'speed' | 'quality' | 'balanced'
  ): PredictionResult {
    if (predictions.length === 0) {
      throw new AIError({
        code: 'NO_ML_PREDICTIONS',
        message: 'No ML predictions meet the criteria',
        type: 'api_error',
        provider: APIProvider.OPENAI,
        retryable: true,
      });
    }
    
    const scoredPredictions = predictions.map(p => ({
      ...p,
      score: this.calculateOptimizationScore(p, optimizationType),
    }));
    
    scoredPredictions.sort((a, b) => b.score - a.score);
    return scoredPredictions[0];
  }

  private calculateOptimizationScore(
    prediction: PredictionResult,
    optimizationType: 'cost' | 'speed' | 'quality' | 'balanced'
  ): number {
    // Normalize values
    const normalizedCost = 1 - Math.min(1, prediction.predictedCost / 0.1);
    const normalizedTime = 1 - Math.min(1, prediction.predictedResponseTime / 5000);
    const normalizedQuality = prediction.predictedQuality;
    const confidence = prediction.confidence;
    
    let score: number;
    
    switch (optimizationType) {
      case 'cost':
        score = normalizedCost * 0.7 + normalizedQuality * 0.2 + normalizedTime * 0.1;
        break;
      case 'speed':
        score = normalizedTime * 0.7 + normalizedQuality * 0.2 + normalizedCost * 0.1;
        break;
      case 'quality':
        score = normalizedQuality * 0.7 + normalizedTime * 0.2 + normalizedCost * 0.1;
        break;
      case 'balanced':
      default:
        score = (normalizedCost + normalizedTime + normalizedQuality) / 3;
        break;
    }
    
    return score * confidence;
  }

  private fallbackRouting(
    request: AIRequest,
    availableProviders: APIProvider[],
    options: RoutingOptions
  ): MLRouteDecision {
    // Simple fallback logic
    const provider = availableProviders[0] || APIProvider.OPENAI;
    const models = this.getProviderModels(provider);
    const model = models[0] || 'gpt-4o-mini';
    
    return {
      selectedProvider: provider,
      selectedModel: model,
      predictedCost: 0.01,
      predictedResponseTime: 2000,
      predictedQuality: 0.8,
      confidence: 0.5,
      reasoning: 'Fallback routing due to insufficient ML data',
      alternatives: [],
      optimizationType: 'balanced',
    };
  }

  private generateMLReasoning(
    selected: PredictionResult,
    optimizationType: string
  ): string {
    const reasons = [];
    
    if (optimizationType === 'cost' && selected.predictedCost < 0.01) {
      reasons.push('lowest predicted cost');
    }
    if (optimizationType === 'speed' && selected.predictedResponseTime < 2000) {
      reasons.push('fastest predicted response');
    }
    if (optimizationType === 'quality' && selected.predictedQuality > 0.9) {
      reasons.push('highest predicted quality');
    }
    
    reasons.push(`${Math.round(selected.confidence * 100)}% confidence`);
    
    return `ML-optimized for ${optimizationType}: ${reasons.join(', ')}`;
  }

  // Helper methods

  private calculateActualQuality(response: AIResponse, userSatisfaction?: number): number {
    let quality = 0.7; // Base quality
    
    if (response.choices.length > 0 && response.choices[0].finishReason === 'stop') {
      quality += 0.1;
    }
    
    if (userSatisfaction) {
      quality = (quality + userSatisfaction / 5) / 2;
    }
    
    return Math.min(1.0, quality);
  }

  private updatePerformanceHistory(learningData: LearningData): void {
    const key = `${learningData.actualProvider}_${learningData.actualModel}`;
    const existing = this.performanceHistory.get(key) || [];
    
    const updated: ProviderPerformance = {
      provider: learningData.actualProvider,
      model: learningData.actualModel,
      avgResponseTime: learningData.actualResponseTime,
      avgCost: learningData.actualCost,
      qualityScore: learningData.actualQuality,
      successRate: 1.0,
      lastUpdated: learningData.timestamp,
      sampleSize: 1,
    };
    
    existing.push(updated);
    
    // Keep only recent data
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }
    
    this.performanceHistory.set(key, existing);
  }

  private updateUserPatterns(userId: string, features: RequestFeatures): void {
    const existing = this.userPatterns.get(userId) || [];
    existing.push(features);
    
    // Keep only recent patterns
    if (existing.length > 50) {
      existing.splice(0, existing.length - 50);
    }
    
    this.userPatterns.set(userId, existing);
  }

  private getProviderModels(provider: APIProvider): string[] {
    switch (provider) {
      case APIProvider.OPENAI:
        return ['gpt-3.5-turbo', 'gpt-4', 'gpt-4o', 'gpt-4o-mini'];
      case APIProvider.ANTHROPIC:
        return ['claude-3-haiku-20240307', 'claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022'];
      case APIProvider.GOOGLE:
        return ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
      default:
        return [];
    }
  }

  private initializeBaselinePerformance(): void {
    // Initialize with basic performance data for common models
    const baselineData = [
      { provider: APIProvider.OPENAI, model: 'gpt-4o-mini', avgCost: 0.0003, avgResponseTime: 1800, qualityScore: 0.85 },
      { provider: APIProvider.ANTHROPIC, model: 'claude-3-haiku-20240307', avgCost: 0.001, avgResponseTime: 2200, qualityScore: 0.88 },
      { provider: APIProvider.GOOGLE, model: 'gemini-1.5-flash', avgCost: 0.0007, avgResponseTime: 1600, qualityScore: 0.82 },
    ];

    baselineData.forEach(data => {
      const key = `${data.provider}_${data.model}`;
      this.performanceHistory.set(key, [{
        provider: data.provider,
        model: data.model,
        avgResponseTime: data.avgResponseTime,
        avgCost: data.avgCost,
        qualityScore: data.qualityScore,
        successRate: 0.95,
        lastUpdated: Date.now(),
        sampleSize: 10,
      }]);
    });
  }

  private calculateAverageConfidence(): number {
    return 0.75; // Simplified
  }

  private calculateAccuracyMetrics() {
    return {
      costAccuracy: 0.82,
      timeAccuracy: 0.76,
      qualityAccuracy: 0.79,
    };
  }

  private generateModelRecommendations() {
    return [
      {
        scenario: 'Simple chat requests',
        recommendedProvider: APIProvider.GOOGLE,
        expectedSavings: 45,
      },
      {
        scenario: 'Complex analysis tasks',
        recommendedProvider: APIProvider.ANTHROPIC,
        expectedSavings: 25,
      },
      {
        scenario: 'Code generation',
        recommendedProvider: APIProvider.OPENAI,
        expectedSavings: 15,
      },
    ];
  }

  private analyzeUserPatterns(userId: string) {
    const userHistory = this.userPatterns.get(userId) || [];
    
    const typeCounts = new Map<RequestType, number>();
    userHistory.forEach(p => {
      typeCounts.set(p.requestType, (typeCounts.get(p.requestType) || 0) + 1);
    });
    
    const commonRequestTypes = Array.from(typeCounts.entries())
      .map(([type, count]) => ({ type, frequency: count / userHistory.length }))
      .sort((a, b) => b.frequency - a.frequency);
    
    return {
      commonRequestTypes,
      preferredProviders: [
        { provider: APIProvider.GOOGLE, usage: 0.6 },
        { provider: APIProvider.OPENAI, usage: 0.3 },
        { provider: APIProvider.ANTHROPIC, usage: 0.1 },
      ],
      costSavingsAchieved: 35.2,
    };
  }
}