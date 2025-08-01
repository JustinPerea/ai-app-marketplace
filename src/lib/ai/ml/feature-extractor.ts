/**
 * Feature Extraction System for Context-Aware Routing
 * 
 * Advanced feature extraction that analyzes request content, user behavior,
 * system state, and historical patterns to enable intelligent routing decisions.
 */

import { ApiProvider } from '@prisma/client';
import { AIRequest } from '../types';
import { RequestFeatures, PerformanceSnapshot } from './types';

export interface ContextualFeatures {
  content: ContentFeatures;
  user: UserFeatures;
  system: SystemFeatures;
  temporal: TemporalFeatures;
  historical: HistoricalFeatures;
}

export interface ContentFeatures {
  textMetrics: {
    totalLength: number;
    avgSentenceLength: number;
    vocabularyRichness: number; // unique words / total words
    readabilityScore: number; // 0-1, higher = more complex
  };
  
  semanticFeatures: {
    topicCategory: 'technical' | 'creative' | 'analytical' | 'conversational' | 'educational';
    sentimentScore: number; // -1 to 1
    formalityLevel: number; // 0-1, higher = more formal
    urgencyIndicators: string[]; // words indicating urgency
  };
  
  structuralFeatures: {
    messageTypes: Record<'system' | 'user' | 'assistant', number>;
    hasCodeBlocks: boolean;
    hasLists: boolean;
    hasQuestions: number;
    hasInstructions: boolean;
  };
  
  complexityIndicators: {
    technicalTerms: number;
    multiStepReasoning: boolean;
    requiresCreativity: boolean;
    requiresPrecision: boolean;
  };
}

export interface UserFeatures {
  behavior: {
    sessionLength: number; // minutes since first request
    requestFrequency: number; // requests per hour
    avgResponseTime: number; // user's typical response time
    interactionStyle: 'brief' | 'detailed' | 'conversational';
  };
  
  preferences: {
    preferredProviders: Record<ApiProvider, number>; // usage percentage
    preferredModels: string[];
    qualityTolerance: number; // 0-1, willingness to accept lower quality for speed/cost
    costSensitivity: number; // 0-1, how much cost matters
  };
  
  context: {
    tier: 'free' | 'pro' | 'enterprise';
    geography: string; // region code
    timezone: string;
    device: 'mobile' | 'desktop' | 'api';
  };
}

export interface SystemFeatures {
  load: {
    providerLoad: Record<ApiProvider, number>; // 0-1 current load
    queueDepth: Record<ApiProvider, number>; // pending requests
    responseTime: Record<ApiProvider, number>; // current avg response time
  };
  
  availability: {
    providerStatus: Record<ApiProvider, 'healthy' | 'degraded' | 'down'>;
    serviceLevel: Record<ApiProvider, number>; // 0-1 service quality
    rateLimitStatus: Record<ApiProvider, number>; // 0-1 how close to limit
  };
  
  performance: {
    recentErrors: Record<ApiProvider, number>; // error count in last hour
    latencyTrend: Record<ApiProvider, 'improving' | 'stable' | 'degrading'>;
    costEfficiency: Record<ApiProvider, number>; // quality/cost ratio
  };
}

export interface TemporalFeatures {
  timing: {
    hour: number; // 0-23
    dayOfWeek: number; // 0-6
    dayOfMonth: number; // 1-31
    month: number; // 1-12
    season: 'spring' | 'summer' | 'fall' | 'winter';
  };
  
  patterns: {
    isBusinessHours: boolean;
    isPeakUsage: boolean; // based on historical patterns
    timezoneBias: number; // -12 to 12 UTC offset
  };
  
  cyclical: {
    hourlyPattern: number; // 0-1 typical activity for this hour
    weeklyPattern: number; // 0-1 typical activity for this day
    monthlyPattern: number; // 0-1 typical activity for this time of month
  };
}

export interface HistoricalFeatures {
  performance: {
    providerReliability: Record<ApiProvider, number>; // 0-1 success rate
    avgQualityScores: Record<ApiProvider, number>; // 0-1 quality
    costEffectiveness: Record<ApiProvider, number>; // value for money
  };
  
  trends: {
    usageGrowth: Record<ApiProvider, number>; // growth rate
    qualityTrend: Record<ApiProvider, 'up' | 'stable' | 'down'>;
    costTrend: Record<ApiProvider, 'up' | 'stable' | 'down'>;
  };
  
  optimization: {
    successfulRoutes: Record<string, number>; // feature hash -> success rate
    failedRoutes: Record<string, number>; // feature hash -> failure rate
    bestProviderForContext: Record<string, ApiProvider>; // context -> optimal provider
  };
}

export class AdvancedFeatureExtractor {
  private vocabularyCache: Map<string, Set<string>> = new Map();
  private topicKeywords: Record<string, string[]> = {
    technical: ['code', 'api', 'function', 'algorithm', 'debug', 'error', 'implementation'],
    creative: ['write', 'story', 'poem', 'creative', 'imagine', 'design', 'art'],
    analytical: ['analyze', 'data', 'statistics', 'research', 'study', 'compare', 'evaluate'],
    conversational: ['hello', 'how', 'what', 'tell', 'explain', 'help', 'please'],
    educational: ['learn', 'teach', 'explain', 'understand', 'study', 'lesson', 'tutorial'],
  };

  /**
   * Extract comprehensive contextual features
   */
  async extractContextualFeatures(
    request: AIRequest,
    userId: string,
    systemState: any,
    userHistory: any
  ): Promise<ContextualFeatures> {
    const [content, user, system, temporal, historical] = await Promise.all([
      this.extractContentFeatures(request),
      this.extractUserFeatures(userId, userHistory),
      this.extractSystemFeatures(systemState),
      this.extractTemporalFeatures(),
      this.extractHistoricalFeatures(userId, systemState),
    ]);

    return { content, user, system, temporal, historical };
  }

  /**
   * Extract features from request content
   */
  private async extractContentFeatures(request: AIRequest): Promise<ContentFeatures> {
    const allText = request.messages.map(m => m.content).join(' ');
    const words = allText.toLowerCase().match(/\b\w+\b/g) || [];
    const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Text metrics
    const uniqueWords = new Set(words);
    const textMetrics = {
      totalLength: allText.length,
      avgSentenceLength: sentences.reduce((sum, s) => sum + s.length, 0) / Math.max(sentences.length, 1),
      vocabularyRichness: uniqueWords.size / Math.max(words.length, 1),
      readabilityScore: this.calculateReadabilityScore(sentences, words),
    };

    // Semantic features
    const semanticFeatures = {
      topicCategory: this.classifyTopic(words) as ContentFeatures['semanticFeatures']['topicCategory'],
      sentimentScore: this.analyzeSentiment(allText),
      formalityLevel: this.analyzeFormalityLevel(allText),
      urgencyIndicators: this.extractUrgencyIndicators(words),
    };

    // Structural features
    const structuralFeatures = {
      messageTypes: this.countMessageTypes(request.messages),
      hasCodeBlocks: /```[\s\S]*?```/.test(allText),
      hasLists: /^[\s]*[-*•]\s/m.test(allText) || /^\d+\.\s/m.test(allText),
      hasQuestions: (allText.match(/\?/g) || []).length,
      hasInstructions: this.detectInstructions(allText),
    };

    // Complexity indicators
    const complexityIndicators = {
      technicalTerms: this.countTechnicalTerms(words),
      multiStepReasoning: this.detectMultiStepReasoning(allText),
      requiresCreativity: this.detectCreativityRequirement(allText),
      requiresPrecision: this.detectPrecisionRequirement(allText),
    };

    return {
      textMetrics,
      semanticFeatures,
      structuralFeatures,
      complexityIndicators,
    };
  }

  /**
   * Extract user-specific features
   */
  private async extractUserFeatures(userId: string, userHistory: any): Promise<UserFeatures> {
    const behavior = {
      sessionLength: userHistory.sessionLength || 0,
      requestFrequency: userHistory.requestFrequency || 1,
      avgResponseTime: userHistory.avgResponseTime || 30,
      interactionStyle: this.determineInteractionStyle(userHistory) as UserFeatures['behavior']['interactionStyle'],
    };

    const preferences = {
      preferredProviders: userHistory.providerPreference || {},
      preferredModels: userHistory.preferredModels || [],
      qualityTolerance: userHistory.qualityTolerance || 0.8,
      costSensitivity: userHistory.costSensitivity || 0.5,
    };

    const context = {
      tier: userHistory.tier || 'pro' as UserFeatures['context']['tier'],
      geography: userHistory.geography || 'US',
      timezone: userHistory.timezone || 'UTC',
      device: userHistory.device || 'api' as UserFeatures['context']['device'],
    };

    return { behavior, preferences, context };
  }

  /**
   * Extract system state features
   */
  private async extractSystemFeatures(systemState: any): Promise<SystemFeatures> {
    const load = {
      providerLoad: systemState.currentLoad || {},
      queueDepth: systemState.queueDepth || {},
      responseTime: systemState.responseTime || {},
    };

    const availability = {
      providerStatus: systemState.providerStatus || {},
      serviceLevel: systemState.serviceLevel || {},
      rateLimitStatus: systemState.rateLimitStatus || {},
    };

    const performance = {
      recentErrors: systemState.recentErrors || {},
      latencyTrend: systemState.latencyTrend || {},
      costEfficiency: systemState.costEfficiency || {},
    };

    return { load, availability, performance };
  }

  /**
   * Extract temporal features
   */
  private async extractTemporalFeatures(): Promise<TemporalFeatures> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const dayOfMonth = now.getDate();
    const month = now.getMonth() + 1;

    const timing = {
      hour,
      dayOfWeek,
      dayOfMonth,
      month,
      season: this.getSeason(month) as TemporalFeatures['timing']['season'],
    };

    const patterns = {
      isBusinessHours: hour >= 9 && hour <= 17 && dayOfWeek >= 1 && dayOfWeek <= 5,
      isPeakUsage: this.isPeakUsageTime(hour, dayOfWeek),
      timezoneBias: now.getTimezoneOffset() / -60,
    };

    const cyclical = {
      hourlyPattern: this.getHourlyPattern(hour),
      weeklyPattern: this.getWeeklyPattern(dayOfWeek),
      monthlyPattern: this.getMonthlyPattern(dayOfMonth),
    };

    return { timing, patterns, cyclical };
  }

  /**
   * Extract historical performance features
   */
  private async extractHistoricalFeatures(userId: string, systemState: any): Promise<HistoricalFeatures> {
    const performance = {
      providerReliability: systemState.historicalReliability || {},
      avgQualityScores: systemState.avgQualityScores || {},
      costEffectiveness: systemState.costEffectiveness || {},
    };

    const trends = {
      usageGrowth: systemState.usageGrowth || {},
      qualityTrend: systemState.qualityTrend || {},
      costTrend: systemState.costTrend || {},
    };

    const optimization = {
      successfulRoutes: systemState.successfulRoutes || {},
      failedRoutes: systemState.failedRoutes || {},
      bestProviderForContext: systemState.bestProviderForContext || {},
    };

    return { performance, trends, optimization };
  }

  // Helper methods for content analysis

  private calculateReadabilityScore(sentences: string[], words: string[]): number {
    if (sentences.length === 0 || words.length === 0) return 0.5;

    const avgSentenceLength = words.length / sentences.length;
    const avgSyllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0) / words.length;

    // Simplified Flesch Reading Ease formula
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllables);
    return Math.max(0, Math.min(1, score / 100));
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = word.match(/[aeiouy]/g);
    let syllables = vowels ? vowels.length : 1;
    
    if (word.endsWith('e')) syllables--;
    if (word.includes('le') && word.length > 2) syllables++;
    
    return Math.max(1, syllables);
  }

  private classifyTopic(words: string[]): string {
    const scores: Record<string, number> = {};
    
    for (const [topic, keywords] of Object.entries(this.topicKeywords)) {
      scores[topic] = keywords.filter(keyword => words.includes(keyword)).length;
    }

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'conversational';

    return Object.keys(scores).find(topic => scores[topic] === maxScore) || 'conversational';
  }

  private analyzeSentiment(text: string): number {
    // Simplified sentiment analysis - in production, use a proper library
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'problem', 'error', 'wrong'];

    const words = text.toLowerCase().split(/\s+/);
    const positive = words.filter(word => positiveWords.includes(word)).length;
    const negative = words.filter(word => negativeWords.includes(word)).length;

    if (positive + negative === 0) return 0; // neutral
    return (positive - negative) / (positive + negative);
  }

  private analyzeFormalityLevel(text: string): number {
    const formalIndicators = [
      /\b(therefore|furthermore|however|nevertheless|consequently)\b/gi,
      /\b(pursuant|regarding|aforementioned|heretofore)\b/gi,
      /\b(shall|ought|must|should)\b/gi,
    ];

    const informalIndicators = [
      /\b(gonna|wanna|gotta|yeah|nope|ok|hey)\b/gi,
      /[!]{2,}/g, // multiple exclamation marks
      /[?]{2,}/g, // multiple question marks
    ];

    const formalCount = formalIndicators.reduce((sum, pattern) => 
      sum + (text.match(pattern) || []).length, 0);
    const informalCount = informalIndicators.reduce((sum, pattern) => 
      sum + (text.match(pattern) || []).length, 0);

    if (formalCount + informalCount === 0) return 0.5;
    return formalCount / (formalCount + informalCount);
  }

  private extractUrgencyIndicators(words: string[]): string[] {
    const urgentWords = ['urgent', 'asap', 'immediately', 'quickly', 'fast', 'emergency', 'rush', 'critical'];
    return words.filter(word => urgentWords.includes(word.toLowerCase()));
  }

  private countMessageTypes(messages: any[]): Record<'system' | 'user' | 'assistant', number> {
    const counts = { system: 0, user: 0, assistant: 0 };
    
    for (const message of messages) {
      if (message.role === 'system') counts.system++;
      else if (message.role === 'user') counts.user++;
      else if (message.role === 'assistant') counts.assistant++;
    }

    return counts;
  }

  private detectInstructions(text: string): boolean {
    const instructionPatterns = [
      /^(please|can you|could you|would you|help me)/i,
      /\b(create|generate|make|write|build|develop|implement)\b/gi,
      /\b(step by step|instructions|how to|guide|tutorial)\b/gi,
    ];

    return instructionPatterns.some(pattern => pattern.test(text));
  }

  private countTechnicalTerms(words: string[]): number {
    const technicalTerms = [
      'api', 'database', 'algorithm', 'function', 'variable', 'array', 'object',
      'server', 'client', 'http', 'json', 'xml', 'sql', 'nosql', 'rest',
      'microservice', 'container', 'kubernetes', 'docker', 'aws', 'cloud',
      'machine learning', 'neural network', 'ai', 'model', 'training',
    ];

    return words.filter(word => technicalTerms.includes(word.toLowerCase())).length;
  }

  private detectMultiStepReasoning(text: string): boolean {
    const patterns = [
      /\b(first|second|third|fourth|then|next|after|finally)\b/gi,
      /\b(step \d+|stage \d+|phase \d+)\b/gi,
      /\b(because|since|therefore|thus|consequently|as a result)\b/gi,
    ];

    return patterns.some(pattern => (text.match(pattern) || []).length > 1);
  }

  private detectCreativityRequirement(text: string): boolean {
    const creativeWords = [
      'creative', 'original', 'unique', 'innovative', 'artistic', 'imaginative',
      'story', 'poem', 'song', 'design', 'brainstorm', 'idea',
    ];

    const words = text.toLowerCase().split(/\s+/);
    return creativeWords.some(word => words.includes(word));
  }

  private detectPrecisionRequirement(text: string): boolean {
    const precisionWords = [
      'exact', 'precise', 'accurate', 'specific', 'detailed', 'comprehensive',
      'calculate', 'measure', 'analyze', 'data', 'statistics', 'research',
    ];

    const words = text.toLowerCase().split(/\s+/);
    return precisionWords.some(word => words.includes(word));
  }

  private determineInteractionStyle(userHistory: any): string {
    const avgMessageLength = userHistory.avgMessageLength || 100;
    
    if (avgMessageLength < 50) return 'brief';
    if (avgMessageLength > 200) return 'detailed';
    return 'conversational';
  }

  private getSeason(month: number): string {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
  }

  private isPeakUsageTime(hour: number, dayOfWeek: number): boolean {
    // Business hours on weekdays
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour <= 17) return true;
    // Evening hours
    if (hour >= 19 && hour <= 22) return true;
    return false;
  }

  private getHourlyPattern(hour: number): number {
    // Simplified hourly pattern - peak during business hours and evening
    if (hour >= 9 && hour <= 17) return 0.8 + (Math.random() * 0.2);
    if (hour >= 19 && hour <= 22) return 0.7 + (Math.random() * 0.2);
    if (hour >= 0 && hour <= 6) return 0.1 + (Math.random() * 0.2);
    return 0.4 + (Math.random() * 0.3);
  }

  private getWeeklyPattern(dayOfWeek: number): number {
    // Higher activity on weekdays
    if (dayOfWeek >= 1 && dayOfWeek <= 5) return 0.7 + (Math.random() * 0.2);
    return 0.4 + (Math.random() * 0.3);
  }

  private getMonthlyPattern(dayOfMonth: number): number {
    // Slightly higher activity at beginning and end of month
    if (dayOfMonth <= 5 || dayOfMonth >= 25) return 0.6 + (Math.random() * 0.2);
    return 0.5 + (Math.random() * 0.2);
  }

  /**
   * Convert contextual features to a numerical vector for ML models
   */
  featuresToVector(features: ContextualFeatures): number[] {
    const vector: number[] = [];

    // Content features (20 dimensions)
    vector.push(
      features.content.textMetrics.totalLength / 10000, // normalized
      features.content.textMetrics.avgSentenceLength / 100,
      features.content.textMetrics.vocabularyRichness,
      features.content.textMetrics.readabilityScore,
      features.content.semanticFeatures.sentimentScore,
      features.content.semanticFeatures.formalityLevel,
      features.content.structuralFeatures.hasCodeBlocks ? 1 : 0,
      features.content.structuralFeatures.hasLists ? 1 : 0,
      features.content.structuralFeatures.hasQuestions / 10, // normalized
      features.content.structuralFeatures.hasInstructions ? 1 : 0,
      features.content.complexityIndicators.technicalTerms / 20, // normalized
      features.content.complexityIndicators.multiStepReasoning ? 1 : 0,
      features.content.complexityIndicators.requiresCreativity ? 1 : 0,
      features.content.complexityIndicators.requiresPrecision ? 1 : 0,
    );

    // User features (10 dimensions)
    vector.push(
      features.user.behavior.sessionLength / 120, // normalized to 2 hours
      features.user.behavior.requestFrequency / 10, // normalized
      features.user.preferences.qualityTolerance,
      features.user.preferences.costSensitivity,
      features.user.context.tier === 'enterprise' ? 1 : features.user.context.tier === 'pro' ? 0.5 : 0,
    );

    // Temporal features (8 dimensions)
    vector.push(
      features.temporal.timing.hour / 24,
      features.temporal.timing.dayOfWeek / 7,
      features.temporal.patterns.isBusinessHours ? 1 : 0,
      features.temporal.patterns.isPeakUsage ? 1 : 0,
      features.temporal.cyclical.hourlyPattern,
      features.temporal.cyclical.weeklyPattern,
      features.temporal.cyclical.monthlyPattern,
    );

    // System features (6 dimensions) - averaged across providers
    const providerCount = Object.keys(features.system.load.providerLoad).length || 1;
    const avgLoad = Object.values(features.system.load.providerLoad).reduce((sum, load) => sum + load, 0) / providerCount;
    const avgResponseTime = Object.values(features.system.load.responseTime).reduce((sum, time) => sum + time, 0) / providerCount;
    const healthyProviders = Object.values(features.system.availability.providerStatus).filter(status => status === 'healthy').length;
    
    vector.push(
      avgLoad,
      avgResponseTime / 5000, // normalized to 5 seconds
      healthyProviders / providerCount,
    );

    return vector;
  }

  /**
   * Create a feature hash for caching and pattern recognition
   */
  createFeatureHash(features: ContextualFeatures): string {
    const key = [
      features.content.semanticFeatures.topicCategory,
      features.content.complexityIndicators.requiresCreativity ? 'creative' : 'factual',
      features.user.context.tier,
      features.temporal.patterns.isBusinessHours ? 'business' : 'after-hours',
      Math.floor(features.content.textMetrics.totalLength / 1000), // bucket by length
    ].join('_');

    return key;
  }
}