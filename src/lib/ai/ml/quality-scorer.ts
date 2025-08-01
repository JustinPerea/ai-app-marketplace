/**
 * Real-time Quality Scoring System
 * 
 * Advanced quality assessment system that evaluates AI model responses
 * across multiple dimensions and continuously learns quality patterns
 * for different providers and use cases.
 */

import { ApiProvider } from '@prisma/client';
import { AIRequest, AIResponse } from '../types';
import {
  QualityMetrics,
  QualityModel,
  ContextualFeatures,
  MLError,
} from './types';

export interface QualityAssessment {
  overallScore: number; // 0-1
  metrics: QualityMetrics;
  breakdown: {
    relevance: QualityScore;
    coherence: QualityScore;
    completion: QualityScore;
    format: QualityScore;
    accuracy: QualityScore;
  };
  confidence: number; // 0-1 confidence in the assessment
  reasoning: string[];
}

export interface QualityScore {
  score: number; // 0-1
  evidence: string[];
  confidence: number; // 0-1
}

export interface QualityBenchmark {
  provider: ApiProvider;
  model: string;
  taskType: string;
  averageQuality: number;
  sampleCount: number;
  lastUpdated: Date;
  trend: 'improving' | 'stable' | 'declining';
}

export interface QualityPrediction {
  expectedQuality: number; // 0-1 predicted quality
  confidence: number; // 0-1 confidence in prediction
  factors: Array<{
    factor: string;
    impact: number; // positive or negative
    description: string;
  }>;
}

export class RealTimeQualityScorer {
  private qualityModels: Map<string, QualityModel> = new Map();
  private benchmarks: Map<string, QualityBenchmark> = new Map();
  private qualityHistory: Map<string, QualityMetrics[]> = new Map();
  private contextPatterns: Map<string, number> = new Map();
  
  // Quality assessment patterns
  private relevancePatterns = {
    positive: [
      /directly answers?.*question/i,
      /addresses?.*request/i,
      /relevant.*information/i,
      /on.topic/i,
    ],
    negative: [
      /off.topic/i,
      /unrelated/i,
      /doesn't answer/i,
      /irrelevant/i,
    ],
  };

  private coherencePatterns = {
    positive: [
      /clear.*structure/i,
      /logical.*flow/i,
      /well.organized/i,
      /coherent/i,
    ],
    negative: [
      /confusing/i,
      /incoherent/i,
      /jumbled/i,
      /disorganized/i,
    ],
  };

  constructor() {
    this.initializeQualityModels();
  }

  /**
   * Assess the quality of an AI response in real-time
   */
  async assessQuality(
    request: AIRequest,
    response: AIResponse,
    features: ContextualFeatures
  ): Promise<QualityAssessment> {
    try {
      const startTime = Date.now();

      // Extract response content
      const responseContent = response.choices[0]?.message?.content || '';
      const requestContent = request.messages.map(m => m.content).join(' ');

      // Assess each quality dimension
      const [relevance, coherence, completion, format, accuracy] = await Promise.all([
        this.assessRelevance(requestContent, responseContent, features),
        this.assessCoherence(responseContent, features),
        this.assessCompletion(requestContent, responseContent, features),
        this.assessFormat(responseContent, features),
        this.assessAccuracy(responseContent, features),
      ]);

      // Calculate overall score
      const metrics: QualityMetrics = {
        responseRelevance: relevance.score,
        responseCoherence: coherence.score,
        taskCompletion: completion.score,
        outputFormat: format.score,
        factualAccuracy: accuracy.score,
        overallScore: this.calculateOverallScore(relevance, coherence, completion, format, accuracy),
      };

      // Generate reasoning
      const reasoning = this.generateQualityReasoning(
        { relevance, coherence, completion, format, accuracy },
        features
      );

      // Calculate confidence based on assessment certainty
      const confidence = this.calculateAssessmentConfidence(
        [relevance, coherence, completion, format, accuracy]
      );

      const assessment: QualityAssessment = {
        overallScore: metrics.overallScore,
        metrics,
        breakdown: { relevance, coherence, completion, format, accuracy },
        confidence,
        reasoning,
      };

      // Update quality history
      await this.updateQualityHistory(response.provider, response.model, metrics, features);

      const assessmentTime = Date.now() - startTime;
      console.debug(`Quality assessment completed in ${assessmentTime}ms`, {
        provider: response.provider,
        model: response.model,
        overallScore: metrics.overallScore,
        confidence,
      });

      return assessment;

    } catch (error) {
      throw new MLError({
        code: 'QUALITY_ASSESSMENT_FAILED',
        message: `Quality assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'model_error',
        retryable: true,
      });
    }
  }

  /**
   * Predict expected quality before making a request
   */
  async predictQuality(
    features: ContextualFeatures,
    provider: ApiProvider,
    model: string
  ): Promise<QualityPrediction> {
    const modelKey = `${provider}_${model}`;
    const qualityModel = this.qualityModels.get(modelKey);

    if (!qualityModel) {
      // Return default prediction for unknown models
      return {
        expectedQuality: 0.8,
        confidence: 0.5,
        factors: [
          {
            factor: 'unknown_model',
            impact: -0.2,
            description: 'Model quality not yet assessed',
          },
        ],
      };
    }

    // Analyze factors that might affect quality
    const factors = this.analyzeQualityFactors(features, provider, model);
    
    // Base quality from historical data
    let expectedQuality = qualityModel.currentAverageQuality;
    
    // Adjust based on context factors
    for (const factor of factors) {
      expectedQuality += factor.impact * 0.1; // Scale impact
    }

    expectedQuality = Math.max(0, Math.min(1, expectedQuality));

    // Calculate confidence based on historical data volume and consistency
    const sampleCount = qualityModel.historicalQuality.length;
    const variance = this.calculateQualityVariance(qualityModel.historicalQuality);
    const confidence = Math.min(0.95, Math.max(0.1, (sampleCount / 100) * (1 - variance)));

    return {
      expectedQuality,
      confidence,
      factors,
    };
  }

  /**
   * Get quality benchmarks for comparison
   */
  async getQualityBenchmarks(
    taskType?: string,
    provider?: ApiProvider
  ): Promise<QualityBenchmark[]> {
    const benchmarks = Array.from(this.benchmarks.values());
    
    let filtered = benchmarks;
    if (taskType) {
      filtered = filtered.filter(b => b.taskType === taskType);
    }
    if (provider) {
      filtered = filtered.filter(b => b.provider === provider);
    }

    return filtered.sort((a, b) => b.averageQuality - a.averageQuality);
  }

  /**
   * Update quality model with new data
   */
  async updateQualityModel(
    provider: ApiProvider,
    model: string,
    qualityMetrics: QualityMetrics,
    features: ContextualFeatures
  ): Promise<void> {
    const modelKey = `${provider}_${model}`;
    let qualityModel = this.qualityModels.get(modelKey);

    if (!qualityModel) {
      qualityModel = {
        provider,
        model,
        historicalQuality: [],
        currentAverageQuality: 0.8,
        qualityTrend: 'stable',
        lastUpdated: new Date(),
      };
      this.qualityModels.set(modelKey, qualityModel);
    }

    // Add new quality data
    qualityModel.historicalQuality.push(qualityMetrics);
    
    // Keep only recent history (last 1000 samples)
    if (qualityModel.historicalQuality.length > 1000) {
      qualityModel.historicalQuality = qualityModel.historicalQuality.slice(-1000);
    }

    // Update average quality
    const recentQuality = qualityModel.historicalQuality.slice(-100); // Last 100 samples
    qualityModel.currentAverageQuality = recentQuality.reduce(
      (sum, q) => sum + q.overallScore, 0
    ) / recentQuality.length;

    // Update trend
    qualityModel.qualityTrend = this.calculateQualityTrend(qualityModel.historicalQuality);
    qualityModel.lastUpdated = new Date();

    // Update benchmark
    await this.updateBenchmark(provider, model, features.content.semanticFeatures.topicCategory, qualityMetrics);

    console.debug(`Updated quality model for ${provider}_${model}`, {
      averageQuality: qualityModel.currentAverageQuality.toFixed(3),
      trend: qualityModel.qualityTrend,
      sampleCount: qualityModel.historicalQuality.length,
    });
  }

  /**
   * Get quality insights and recommendations
   */
  async getQualityInsights(provider?: ApiProvider): Promise<{
    topPerformers: Array<{provider: ApiProvider, model: string, quality: number}>;
    qualityTrends: Array<{provider: ApiProvider, trend: string, change: number}>;
    recommendations: Array<{type: string, description: string, impact: string}>;
  }> {
    const models = Array.from(this.qualityModels.values());
    const filtered = provider ? models.filter(m => m.provider === provider) : models;

    // Top performers
    const topPerformers = filtered
      .sort((a, b) => b.currentAverageQuality - a.currentAverageQuality)
      .slice(0, 5)
      .map(m => ({
        provider: m.provider,
        model: m.model,
        quality: m.currentAverageQuality,
      }));

    // Quality trends
    const qualityTrends = filtered
      .filter(m => m.historicalQuality.length > 10)
      .map(m => {
        const recent = m.historicalQuality.slice(-20);
        const older = m.historicalQuality.slice(-40, -20);
        const recentAvg = recent.reduce((sum, q) => sum + q.overallScore, 0) / recent.length;
        const olderAvg = older.reduce((sum, q) => sum + q.overallScore, 0) / older.length;
        const change = recentAvg - olderAvg;

        return {
          provider: m.provider,
          trend: m.qualityTrend,
          change,
        };
      })
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 5);

    // Generate recommendations
    const recommendations = this.generateQualityRecommendations(filtered);

    return {
      topPerformers,
      qualityTrends,
      recommendations,
    };
  }

  // Private assessment methods

  private async assessRelevance(
    request: string,
    response: string,
    features: ContextualFeatures
  ): Promise<QualityScore> {
    const evidence: string[] = [];
    let score = 0.5; // baseline

    // Check if response addresses the request
    const requestWords = request.toLowerCase().split(/\s+/);
    const responseWords = response.toLowerCase().split(/\s+/);
    const commonWords = requestWords.filter(word => responseWords.includes(word));
    const relevanceRatio = commonWords.length / Math.max(requestWords.length, 1);

    if (relevanceRatio > 0.3) {
      score += 0.3;
      evidence.push(`High word overlap (${(relevanceRatio * 100).toFixed(1)}%)`);
    }

    // Pattern matching
    for (const pattern of this.relevancePatterns.positive) {
      if (pattern.test(response)) {
        score += 0.1;
        evidence.push('Contains positive relevance indicators');
        break;
      }
    }

    for (const pattern of this.relevancePatterns.negative) {
      if (pattern.test(response)) {
        score -= 0.2;
        evidence.push('Contains negative relevance indicators');
        break;
      }
    }

    // Task-specific relevance
    if (features.content.semanticFeatures.topicCategory === 'technical' && 
        this.containsTechnicalContent(response)) {
      score += 0.1;
      evidence.push('Contains relevant technical content');
    }

    if (features.content.structuralFeatures.hasQuestions > 0 && 
        this.containsAnswers(response)) {
      score += 0.1;
      evidence.push('Directly answers questions');
    }

    score = Math.max(0, Math.min(1, score));
    const confidence = evidence.length > 0 ? 0.8 : 0.5;

    return { score, evidence, confidence };
  }

  private async assessCoherence(
    response: string,
    features: ContextualFeatures
  ): Promise<QualityScore> {
    const evidence: string[] = [];
    let score = 0.6; // baseline

    // Sentence structure analysis
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) {
      return { score: 0, evidence: ['Empty response'], confidence: 1.0 };
    }

    // Check for logical flow indicators
    const transitionWords = ['however', 'therefore', 'furthermore', 'meanwhile', 'consequently'];
    const hasTransitions = transitionWords.some(word => 
      response.toLowerCase().includes(word)
    );

    if (hasTransitions) {
      score += 0.1;
      evidence.push('Contains logical transitions');
    }

    // Check sentence length variation (good for readability)
    const lengths = sentences.map(s => s.trim().length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const lengthVariance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;

    if (lengthVariance > 100) { // Some variation is good
      score += 0.1;
      evidence.push('Good sentence length variation');
    }

    // Pattern matching for coherence
    for (const pattern of this.coherencePatterns.positive) {
      if (pattern.test(response)) {
        score += 0.1;
        evidence.push('Contains coherence indicators');
        break;
      }
    }

    for (const pattern of this.coherencePatterns.negative) {
      if (pattern.test(response)) {
        score -= 0.2;
        evidence.push('Contains incoherence indicators');
        break;
      }
    }

    // Check for repetition (negative for coherence)
    const words = response.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const repetitionRatio = 1 - (uniqueWords.size / words.length);

    if (repetitionRatio > 0.3) {
      score -= 0.1;
      evidence.push('High repetition detected');
    }

    score = Math.max(0, Math.min(1, score));
    const confidence = 0.7; // Medium confidence for coherence assessment

    return { score, evidence, confidence };
  }

  private async assessCompletion(
    request: string,
    response: string,
    features: ContextualFeatures
  ): Promise<QualityScore> {
    const evidence: string[] = [];
    let score = 0.7; // baseline

    // Check if response seems complete
    const endsWithPeriod = /[.!]$/.test(response.trim());
    const endsWithEllipsis = /\.\.\.$/.test(response.trim());

    if (endsWithPeriod) {
      score += 0.1;
      evidence.push('Response ends properly');
    }

    if (endsWithEllipsis) {
      score -= 0.2;
      evidence.push('Response appears incomplete (ends with ellipsis)');
    }

    // Check response length relative to request complexity
    const expectedLength = this.estimateExpectedLength(request, features);
    const actualLength = response.length;
    const lengthRatio = actualLength / expectedLength;

    if (lengthRatio >= 0.5 && lengthRatio <= 2.0) {
      score += 0.1;
      evidence.push('Appropriate response length');
    } else if (lengthRatio < 0.3) {
      score -= 0.2;
      evidence.push('Response too short for request complexity');
    }

    // Check for completion indicators
    const completionWords = ['in conclusion', 'to summarize', 'finally', 'in summary'];
    if (completionWords.some(word => response.toLowerCase().includes(word))) {
      score += 0.1;
      evidence.push('Contains completion indicators');
    }

    // Multi-part requests
    if (features.content.structuralFeatures.hasQuestions > 1) {
      const questionWords = ['what', 'how', 'why', 'when', 'where', 'who'];
      const answeredQuestions = questionWords.filter(word => 
        request.toLowerCase().includes(word) && response.toLowerCase().includes(word)
      ).length;
      
      if (answeredQuestions >= features.content.structuralFeatures.hasQuestions * 0.8) {
        score += 0.2;
        evidence.push('Addresses most questions');
      }
    }

    score = Math.max(0, Math.min(1, score));
    const confidence = 0.8;

    return { score, evidence, confidence };
  }

  private async assessFormat(
    response: string,
    features: ContextualFeatures
  ): Promise<QualityScore> {
    const evidence: string[] = [];
    let score = 0.8; // baseline - most responses have acceptable format

    // Check for proper formatting elements
    if (features.content.structuralFeatures.hasCodeBlocks) {
      const hasCodeFormat = /```[\s\S]*?```/.test(response) || /`[^`]+`/.test(response);
      if (hasCodeFormat) {
        score += 0.1;
        evidence.push('Proper code formatting');
      } else {
        score -= 0.1;
        evidence.push('Missing code formatting');
      }
    }

    if (features.content.structuralFeatures.hasLists) {
      const hasList = /^[\s]*[-*•]\s/m.test(response) || /^\d+\.\s/m.test(response);
      if (hasList) {
        score += 0.1;
        evidence.push('Proper list formatting');
      }
    }

    // Check for appropriate structure
    const hasHeaders = /^#{1,6}\s/m.test(response);
    if (response.length > 500 && hasHeaders) {
      score += 0.05;
      evidence.push('Good structural formatting');
    }

    // Check for proper spacing and readability
    const linesWithContent = response.split('\n').filter(line => line.trim().length > 0);
    const totalLines = response.split('\n').length;
    const contentRatio = linesWithContent.length / totalLines;

    if (contentRatio > 0.8 && contentRatio < 1.0) {
      score += 0.05;
      evidence.push('Good spacing and readability');
    }

    score = Math.max(0, Math.min(1, score));
    const confidence = 0.9; // High confidence for format assessment

    return { score, evidence, confidence };
  }

  private async assessAccuracy(
    response: string,
    features: ContextualFeatures
  ): Promise<QualityScore> {
    const evidence: string[] = [];
    let score = 0.8; // baseline - assume generally accurate

    // This is a simplified accuracy assessment
    // In production, this would involve fact-checking APIs, knowledge bases, etc.

    // Check for uncertainty expressions (positive for accuracy)
    const uncertaintyWords = ['might', 'could', 'possibly', 'likely', 'probably', 'seems'];
    const hasUncertainty = uncertaintyWords.some(word => response.toLowerCase().includes(word));

    if (hasUncertainty && features.content.complexityIndicators.requiresPrecision) {
      score += 0.1;
      evidence.push('Appropriately expresses uncertainty');
    }

    // Check for absolute claims without evidence (negative for accuracy)
    const absoluteWords = ['always', 'never', 'definitely', 'certainly', 'absolutely'];
    const hasAbsolutes = absoluteWords.some(word => response.toLowerCase().includes(word));

    if (hasAbsolutes) {
      score -= 0.05;
      evidence.push('Contains absolute claims');
    }

    // Check for source citations or references (positive for accuracy)
    const hasCitations = /\[[^\]]+\]/.test(response) || /according to/i.test(response);
    if (hasCitations) {
      score += 0.1;
      evidence.push('Contains citations or references');
    }

    // Technical accuracy checks for code
    if (features.content.semanticFeatures.topicCategory === 'technical' && 
        features.content.structuralFeatures.hasCodeBlocks) {
      const codeBlocks = response.match(/```[\s\S]*?```/g) || [];
      let syntaxScore = 0.8;

      for (const block of codeBlocks) {
        // Basic syntax checking (very simplified)
        if (this.hasBasicSyntaxErrors(block)) {
          syntaxScore -= 0.2;
        }
      }

      score = (score + syntaxScore) / 2;
      evidence.push(`Code syntax assessment: ${syntaxScore.toFixed(2)}`);
    }

    score = Math.max(0, Math.min(1, score));
    const confidence = 0.6; // Lower confidence for accuracy without external verification

    return { score, evidence, confidence };
  }

  // Helper methods

  private calculateOverallScore(
    relevance: QualityScore,
    coherence: QualityScore,
    completion: QualityScore,
    format: QualityScore,
    accuracy: QualityScore
  ): number {
    // Weighted average with relevance being most important
    const weights = {
      relevance: 0.35,
      coherence: 0.25,
      completion: 0.2,
      format: 0.1,
      accuracy: 0.1,
    };

    return (
      relevance.score * weights.relevance +
      coherence.score * weights.coherence +
      completion.score * weights.completion +
      format.score * weights.format +
      accuracy.score * weights.accuracy
    );
  }

  private calculateAssessmentConfidence(scores: QualityScore[]): number {
    const avgConfidence = scores.reduce((sum, s) => sum + s.confidence, 0) / scores.length;
    const evidenceCount = scores.reduce((sum, s) => sum + s.evidence.length, 0);
    
    // Confidence increases with evidence
    const evidenceBoost = Math.min(0.2, evidenceCount * 0.02);
    
    return Math.min(1.0, avgConfidence + evidenceBoost);
  }

  private generateQualityReasoning(
    breakdown: QualityAssessment['breakdown'],
    features: ContextualFeatures
  ): string[] {
    const reasoning: string[] = [];

    // Add reasoning based on scores
    if (breakdown.relevance.score > 0.8) {
      reasoning.push('Response highly relevant to request');
    } else if (breakdown.relevance.score < 0.5) {
      reasoning.push('Response relevance could be improved');
    }

    if (breakdown.coherence.score > 0.8) {
      reasoning.push('Response is well-structured and coherent');
    }

    if (breakdown.completion.score < 0.6) {
      reasoning.push('Response appears incomplete or too brief');
    }

    if (breakdown.accuracy.score > 0.9) {
      reasoning.push('Response appears highly accurate');
    }

    // Add context-specific reasoning
    if (features.content.semanticFeatures.topicCategory === 'technical' && 
        breakdown.format.score > 0.8) {
      reasoning.push('Technical content properly formatted');
    }

    if (reasoning.length === 0) {
      reasoning.push('Standard quality response');
    }

    return reasoning;
  }

  private async updateQualityHistory(
    provider: ApiProvider,
    model: string,
    metrics: QualityMetrics,
    features: ContextualFeatures
  ): Promise<void> {
    const key = `${provider}_${model}`;
    
    if (!this.qualityHistory.has(key)) {
      this.qualityHistory.set(key, []);
    }

    const history = this.qualityHistory.get(key)!;
    history.push(metrics);

    // Keep only recent history
    if (history.length > 500) {
      history.splice(0, history.length - 500);
    }

    // Update context patterns
    const contextKey = features.content.semanticFeatures.topicCategory;
    const currentPattern = this.contextPatterns.get(contextKey) || 0;
    this.contextPatterns.set(contextKey, currentPattern + metrics.overallScore * 0.1);
  }

  private analyzeQualityFactors(
    features: ContextualFeatures,
    provider: ApiProvider,
    model: string
  ): Array<{factor: string, impact: number, description: string}> {
    const factors = [];

    // Provider-specific factors
    if (provider === ApiProvider.ANTHROPIC && features.content.complexityIndicators.requiresCreativity) {
      factors.push({
        factor: 'creative_task_anthropic',
        impact: 0.1,
        description: 'Anthropic models excel at creative tasks',
      });
    }

    if (provider === ApiProvider.OPENAI && features.content.complexityIndicators.technicalTerms > 10) {
      factors.push({
        factor: 'technical_task_openai',
        impact: 0.05,
        description: 'OpenAI models are strong for technical content',
      });
    }

    // Task complexity factors
    if (features.content.textMetrics.totalLength > 5000) {
      factors.push({
        factor: 'long_request',
        impact: -0.05,
        description: 'Very long requests may reduce quality',
      });
    }

    if (features.temporal.patterns.isBusinessHours) {
      factors.push({
        factor: 'business_hours',
        impact: 0.02,
        description: 'Business hours typically have better performance',
      });
    }

    // User tier factors
    if (features.user.context.tier === 'enterprise') {
      factors.push({
        factor: 'enterprise_tier',
        impact: 0.05,
        description: 'Enterprise tier may receive priority treatment',
      });
    }

    return factors;
  }

  private calculateQualityVariance(metrics: QualityMetrics[]): number {
    if (metrics.length < 2) return 0.5;

    const scores = metrics.map(m => m.overallScore);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;

    return Math.sqrt(variance);
  }

  private calculateQualityTrend(metrics: QualityMetrics[]): 'improving' | 'stable' | 'declining' {
    if (metrics.length < 10) return 'stable';

    const recent = metrics.slice(-20);
    const older = metrics.slice(-40, -20);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, m) => sum + m.overallScore, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.overallScore, 0) / older.length;

    const change = recentAvg - olderAvg;

    if (change > 0.05) return 'improving';
    if (change < -0.05) return 'declining';
    return 'stable';
  }

  private async updateBenchmark(
    provider: ApiProvider,
    model: string,
    taskType: string,
    metrics: QualityMetrics
  ): Promise<void> {
    const key = `${provider}_${model}_${taskType}`;
    let benchmark = this.benchmarks.get(key);

    if (!benchmark) {
      benchmark = {
        provider,
        model,
        taskType,
        averageQuality: metrics.overallScore,
        sampleCount: 1,
        lastUpdated: new Date(),
        trend: 'stable',
      };
    } else {
      // Update running average
      const totalScore = benchmark.averageQuality * benchmark.sampleCount + metrics.overallScore;
      benchmark.sampleCount += 1;
      benchmark.averageQuality = totalScore / benchmark.sampleCount;
      benchmark.lastUpdated = new Date();
    }

    this.benchmarks.set(key, benchmark);
  }

  private generateQualityRecommendations(models: QualityModel[]): Array<{
    type: string;
    description: string;
    impact: string;
  }> {
    const recommendations = [];

    // Find declining models
    const decliningModels = models.filter(m => m.qualityTrend === 'declining');
    if (decliningModels.length > 0) {
      recommendations.push({
        type: 'quality_alert',
        description: `${decliningModels.length} models showing quality decline`,
        impact: 'Monitor closely and consider switching providers',
      });
    }

    // Find top performers
    const topPerformers = models
      .filter(m => m.currentAverageQuality > 0.9)
      .sort((a, b) => b.currentAverageQuality - a.currentAverageQuality);

    if (topPerformers.length > 0) {
      recommendations.push({
        type: 'optimization',
        description: `Route more traffic to ${topPerformers[0].provider} ${topPerformers[0].model}`,
        impact: 'Potential 5-10% quality improvement',
      });
    }

    // Check for low sample counts
    const lowSampleModels = models.filter(m => m.historicalQuality.length < 20);
    if (lowSampleModels.length > 0) {
      recommendations.push({
        type: 'data_collection',
        description: 'Increase sampling for models with limited quality data',
        impact: 'Improve prediction accuracy',
      });
    }

    return recommendations;
  }

  private containsTechnicalContent(response: string): boolean {
    const technicalWords = [
      'function', 'variable', 'algorithm', 'database', 'api', 'server',
      'framework', 'library', 'protocol', 'architecture', 'implementation',
    ];
    
    const words = response.toLowerCase().split(/\s+/);
    return technicalWords.some(word => words.includes(word));
  }

  private containsAnswers(response: string): boolean {
    const answerIndicators = [
      'the answer is', 'the solution is', 'this means', 'this is because',
      'here\'s how', 'here\'s why', 'the result is', 'it works by',
    ];
    
    const lowerResponse = response.toLowerCase();
    return answerIndicators.some(indicator => lowerResponse.includes(indicator));
  }

  private estimateExpectedLength(request: string, features: ContextualFeatures): number {
    let baseLength = 200; // Base response length

    // Adjust based on request length
    baseLength += request.length * 0.5;

    // Adjust based on complexity
    baseLength += features.content.complexityIndicators.technicalTerms * 50;
    
    if (features.content.complexityIndicators.multiStepReasoning) {
      baseLength += 300;
    }

    if (features.content.complexityIndicators.requiresCreativity) {
      baseLength += 200;
    }

    // Adjust based on question count
    baseLength += features.content.structuralFeatures.hasQuestions * 100;

    return Math.max(100, Math.min(2000, baseLength));
  }

  private hasBasicSyntaxErrors(codeBlock: string): boolean {
    // Very basic syntax checking - in production would use proper parsers
    const code = codeBlock.replace(/```\w*\n?/, '').replace(/```$/, '');
    
    // Check for unmatched brackets
    const brackets = { '(': 0, '[': 0, '{': 0 };
    for (const char of code) {
      if (char === '(') brackets['(']++;
      else if (char === ')') brackets['(']--;
      else if (char === '[') brackets['[']++;
      else if (char === ']') brackets['[']--;
      else if (char === '{') brackets['{']++;
      else if (char === '}') brackets['{']--;
    }

    return Object.values(brackets).some(count => count !== 0);
  }

  private initializeQualityModels(): void {
    // Initialize with some default quality models for cold start
    const providers = [ApiProvider.OPENAI, ApiProvider.ANTHROPIC, ApiProvider.GOOGLE];
    
    for (const provider of providers) {
      const modelKey = `${provider}_default`;
      this.qualityModels.set(modelKey, {
        provider,
        model: 'default',
        historicalQuality: [],
        currentAverageQuality: 0.8,
        qualityTrend: 'stable',
        lastUpdated: new Date(),
      });
    }

    console.debug('Initialized quality scoring models');
  }
}