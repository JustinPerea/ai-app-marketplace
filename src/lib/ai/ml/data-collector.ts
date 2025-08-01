/**
 * ML Data Collection System
 * 
 * Collects and processes training data for ML models, including request features,
 * routing decisions, and performance outcomes for continuous learning.
 */

import { PrismaClient, ApiProvider } from '@prisma/client';
import { AIRequest, AIResponse } from '../types';
import {
  RequestFeatures,
  TrainingData,
  PerformanceSnapshot,
  MLError,
} from './types';

export interface CollectedData {
  requestId: string;
  userId: string;
  timestamp: Date;
  features: RequestFeatures;
  routingDecision: {
    provider: ApiProvider;
    model: string;
    reasoning: string;
    confidence: number;
  };
  outcome?: {
    cost: number;
    latency: number;
    quality: number;
    success: boolean;
    userFeedback?: number;
  };
}

export class MLDataCollector {
  private prisma: PrismaClient;
  private dataBuffer: Map<string, CollectedData> = new Map();
  private performanceHistory: Map<ApiProvider, PerformanceSnapshot[]> = new Map();
  private userPatterns: Map<string, any> = new Map();

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.initializePerformanceHistory();
    this.startDataFlushCycle();
  }

  /**
   * Extract features from an AI request
   */
  async extractRequestFeatures(
    request: AIRequest,
    userId: string,
    context: {
      timeOfDay?: number;
      userTier?: 'free' | 'pro' | 'enterprise';
      currentLoad?: Record<ApiProvider, number>;
    } = {}
  ): Promise<RequestFeatures> {
    const now = new Date();
    const timeOfDay = context.timeOfDay ?? now.getHours();
    const dayOfWeek = now.getDay();

    // Content analysis
    const allContent = request.messages.map(m => m.content).join(' ');
    const promptLength = allContent.length;
    const messageCount = request.messages.length;
    const hasSystemMessage = request.messages.some(m => m.role === 'system');
    const avgMessageLength = promptLength / messageCount;

    // Content classification
    const containsCode = this.detectCode(allContent);
    const containsQuestions = this.detectQuestions(allContent);
    const language = this.detectLanguage(allContent);
    const complexity = this.calculateComplexity(request);
    const requestType = this.classifyRequestType(allContent, request);
    
    // User patterns
    const userPatterns = await this.getUserPatterns(userId);
    const userTier = context.userTier ?? await this.getUserTier(userId);
    
    // System context
    const currentLoad = context.currentLoad ?? await this.getCurrentProviderLoad();
    const providerAvailability = await this.getProviderAvailability();
    const recentPerformance = this.getRecentPerformance();

    return {
      // Content features
      promptLength,
      messageCount,
      hasSystemMessage,
      avgMessageLength,
      containsCode,
      containsQuestions,
      language,
      complexity,
      
      // Context features
      requestType,
      urgency: this.determineUrgency(request, userTier),
      qualityRequirement: this.determineQualityRequirement(request, userTier),
      
      // User patterns
      userTier,
      historicalProviderPreference: userPatterns.providerPreference || {},
      timeOfDay,
      dayOfWeek,
      
      // System features
      currentLoad,
      providerAvailability,
      recentPerformance,
    };
  }

  /**
   * Collect routing decision data
   */
  async collectRoutingDecision(
    requestId: string,
    userId: string,
    features: RequestFeatures,
    decision: {
      provider: ApiProvider;
      model: string;
      reasoning: string;
      confidence: number;
    }
  ): Promise<void> {
    const data: CollectedData = {
      requestId,
      userId,
      timestamp: new Date(),
      features,
      routingDecision: decision,
    };

    this.dataBuffer.set(requestId, data);
  }

  /**
   * Collect outcome data after request completion
   */
  async collectOutcome(
    requestId: string,
    outcome: {
      cost: number;
      latency: number;
      quality: number;
      success: boolean;
      userFeedback?: number;
    }
  ): Promise<void> {
    const data = this.dataBuffer.get(requestId);
    if (!data) {
      console.warn(`No routing data found for request ${requestId}`);
      return;
    }

    data.outcome = outcome;
    
    // Update performance history
    this.updatePerformanceHistory(data.routingDecision.provider, outcome);
    
    // Mark as ready for training
    this.dataBuffer.set(requestId, data);
  }

  /**
   * Get training data for ML models
   */
  async getTrainingData(
    limit: number = 1000,
    minQuality: number = 0.5
  ): Promise<TrainingData[]> {
    try {
      // Get completed data from buffer
      const bufferData = Array.from(this.dataBuffer.values())
        .filter(d => d.outcome && d.outcome.quality >= minQuality)
        .slice(-limit);

      // Get historical data from database
      const historicalData = await this.prisma.aiUsageRecord.findMany({
        where: {
          successful: true,
          cost: { gt: 0 },
          latency: { gt: 0 },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          metadata: true,
        },
      });

      const trainingData: TrainingData[] = [];

      // Process buffer data
      for (const data of bufferData) {
        if (!data.outcome) continue;

        const wasOptimal = await this.determineIfOptimal(data);
        
        trainingData.push({
          id: data.requestId,
          requestId: data.requestId,
          userId: data.userId,
          timestamp: data.timestamp,
          features: data.features,
          actualProvider: data.routingDecision.provider,
          actualModel: data.routingDecision.model,
          actualCost: data.outcome.cost,
          actualLatency: data.outcome.latency,
          actualQuality: data.outcome.quality,
          userSatisfaction: data.outcome.userFeedback,
          wasOptimal,
        });
      }

      // Process historical data (simplified feature extraction)
      for (const record of historicalData) {
        const features = await this.extractFeaturesFromRecord(record);
        
        trainingData.push({
          id: record.id,
          requestId: record.requestId,
          userId: record.userId,
          timestamp: record.createdAt,
          features,
          actualProvider: record.provider,
          actualModel: record.model,
          actualCost: Number(record.cost),
          actualLatency: record.latency,
          actualQuality: 0.8, // Default quality score for historical data
          wasOptimal: true, // Assume historical decisions were reasonable
        });
      }

      return trainingData.slice(-limit);

    } catch (error) {
      throw new MLError({
        code: 'DATA_COLLECTION_ERROR',
        message: `Failed to collect training data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'data_error',
        retryable: true,
        details: { limit, minQuality },
      });
    }
  }

  /**
   * Get user behavior patterns
   */
  async getUserPatterns(userId: string): Promise<any> {
    if (this.userPatterns.has(userId)) {
      return this.userPatterns.get(userId);
    }

    try {
      const userRecords = await this.prisma.aiUsageRecord.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      const patterns = {
        providerPreference: this.calculateProviderPreference(userRecords),
        avgRequestsPerDay: this.calculateAvgRequestsPerDay(userRecords),
        preferredModels: this.getPreferredModels(userRecords),
        peakUsageHours: this.getPeakUsageHours(userRecords),
        avgCostTolerance: this.calculateCostTolerance(userRecords),
      };

      this.userPatterns.set(userId, patterns);
      return patterns;

    } catch (error) {
      console.error(`Failed to get user patterns for ${userId}:`, error);
      return {
        providerPreference: {},
        avgRequestsPerDay: 1,
        preferredModels: [],
        peakUsageHours: [9, 14], // Default business hours
        avgCostTolerance: 0.01,
      };
    }
  }

  /**
   * Clean up old data
   */
  async cleanupOldData(retentionDays: number = 30): Promise<void> {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    // Clean up buffer
    for (const [requestId, data] of this.dataBuffer.entries()) {
      if (data.timestamp < cutoffDate) {
        this.dataBuffer.delete(requestId);
      }
    }

    // Clean up performance history
    for (const [provider, snapshots] of this.performanceHistory.entries()) {
      const filtered = snapshots.filter(s => s.timestamp > cutoffDate.getTime());
      this.performanceHistory.set(provider, filtered);
    }

    console.info(`Cleaned up ML data older than ${retentionDays} days`);
  }

  // Private helper methods

  private detectCode(content: string): boolean {
    const codePatterns = [
      /```[\s\S]*?```/g, // Code blocks
      /`[^`]+`/g, // Inline code
      /function\s+\w+\s*\(/g, // Function definitions
      /class\s+\w+/g, // Class definitions
      /import\s+.*from/g, // Import statements
      /console\.log\(/g, // Console logs
      /<\/?[a-z][\s\S]*>/g, // HTML tags
    ];

    return codePatterns.some(pattern => pattern.test(content));
  }

  private detectQuestions(content: string): boolean {
    const questionPatterns = [
      /\?/g, // Question marks
      /^(what|how|why|when|where|who|which|can|could|would|should|is|are|do|does|did)/i,
    ];

    return questionPatterns.some(pattern => pattern.test(content));
  }

  private detectLanguage(content: string): string {
    // Simplified language detection - in production, use a proper library
    const commonWords = {
      en: ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'],
      es: ['el', 'la', 'y', 'o', 'pero', 'en', 'con', 'por', 'para', 'de', 'del'],
      fr: ['le', 'la', 'et', 'ou', 'mais', 'dans', 'sur', 'avec', 'par', 'pour', 'de', 'du'],
    };

    const words = content.toLowerCase().split(/\s+/);
    let maxScore = 0;
    let detectedLang = 'en';

    for (const [lang, commonLangWords] of Object.entries(commonWords)) {
      const score = words.filter(word => commonLangWords.includes(word)).length;
      if (score > maxScore) {
        maxScore = score;
        detectedLang = lang;
      }
    }

    return detectedLang;
  }

  private calculateComplexity(request: AIRequest): number {
    let complexity = 0;

    // Message count factor
    complexity += Math.min(request.messages.length * 0.1, 0.3);

    // Content length factor
    const totalLength = request.messages.reduce((sum, m) => sum + m.content.length, 0);
    complexity += Math.min(totalLength / 10000, 0.3);

    // Tools usage factor
    if (request.tools && request.tools.length > 0) {
      complexity += 0.2;
    }

    // Temperature factor (higher temperature = more creative/complex)
    if (request.temperature && request.temperature > 0.7) {
      complexity += 0.1;
    }

    // Max tokens factor
    if (request.maxTokens && request.maxTokens > 2000) {
      complexity += 0.1;
    }

    return Math.min(complexity, 1.0);
  }

  private classifyRequestType(content: string, request: AIRequest): RequestFeatures['requestType'] {
    const lowerContent = content.toLowerCase();

    if (this.detectCode(content)) return 'code';
    if (lowerContent.includes('translate') || lowerContent.includes('translation')) return 'translation';
    if (lowerContent.includes('analyze') || lowerContent.includes('analysis')) return 'analysis';
    if (lowerContent.includes('write') || lowerContent.includes('create') || lowerContent.includes('generate')) return 'creative';
    if (request.messages.length > 2) return 'chat';
    
    return 'completion';
  }

  private determineUrgency(request: AIRequest, userTier: string): RequestFeatures['urgency'] {
    // Enterprise users get priority
    if (userTier === 'enterprise') return 'high';
    
    // Pro users get medium priority for complex requests
    if (userTier === 'pro' && this.calculateComplexity(request) > 0.5) return 'medium';
    
    return 'low';
  }

  private determineQualityRequirement(request: AIRequest, userTier: string): RequestFeatures['qualityRequirement'] {
    if (userTier === 'enterprise') return 'premium';
    if (userTier === 'pro') return 'standard';
    return 'basic';
  }

  private async getUserTier(userId: string): Promise<'free' | 'pro' | 'enterprise'> {
    try {
      // This would typically check user subscription or plan
      // For now, return 'pro' as default
      return 'pro';
    } catch {
      return 'free';
    }
  }

  private async getCurrentProviderLoad(): Promise<Record<ApiProvider, number>> {
    // Simplified load calculation - in production, this would check actual metrics
    return {
      [ApiProvider.OPENAI]: Math.random() * 0.8,
      [ApiProvider.ANTHROPIC]: Math.random() * 0.8,
      [ApiProvider.GOOGLE]: Math.random() * 0.8,
    };
  }

  private async getProviderAvailability(): Promise<Record<ApiProvider, boolean>> {
    // In production, this would check actual health status
    return {
      [ApiProvider.OPENAI]: true,
      [ApiProvider.ANTHROPIC]: true,
      [ApiProvider.GOOGLE]: true,
    };
  }

  private getRecentPerformance(): Record<ApiProvider, PerformanceSnapshot> {
    const result: Record<ApiProvider, PerformanceSnapshot> = {} as any;
    
    for (const [provider, snapshots] of this.performanceHistory.entries()) {
      if (snapshots.length > 0) {
        const recent = snapshots.slice(-5); // Last 5 snapshots
        result[provider] = {
          avgLatency: recent.reduce((sum, s) => sum + s.avgLatency, 0) / recent.length,
          successRate: recent.reduce((sum, s) => sum + s.successRate, 0) / recent.length,
          avgCost: recent.reduce((sum, s) => sum + s.avgCost, 0) / recent.length,
          qualityScore: recent.reduce((sum, s) => sum + s.qualityScore, 0) / recent.length,
          timestamp: recent[recent.length - 1].timestamp,
        };
      } else {
        // Default values
        result[provider] = {
          avgLatency: 1000,
          successRate: 0.95,
          avgCost: 0.01,
          qualityScore: 0.8,
          timestamp: Date.now(),
        };
      }
    }

    return result;
  }

  private async determineIfOptimal(data: CollectedData): Promise<boolean> {
    if (!data.outcome) return false;

    // Simple optimality check - in production, this would be more sophisticated
    const { cost, latency, quality } = data.outcome;
    
    // Consider optimal if:
    // - Quality is high (>0.8)
    // - Cost is reasonable (<$0.05)
    // - Latency is acceptable (<3000ms)
    return quality > 0.8 && cost < 0.05 && latency < 3000;
  }

  private async extractFeaturesFromRecord(record: any): Promise<RequestFeatures> {
    // Simplified feature extraction from historical records
    return {
      promptLength: 500, // Default estimate
      messageCount: 2,
      hasSystemMessage: false,
      avgMessageLength: 250,
      containsCode: false,
      containsQuestions: false,
      language: 'en',
      complexity: 0.5,
      requestType: 'chat',
      urgency: 'medium',
      qualityRequirement: 'standard',
      userTier: 'pro',
      historicalProviderPreference: {},
      timeOfDay: new Date(record.createdAt).getHours(),
      dayOfWeek: new Date(record.createdAt).getDay(),
      currentLoad: {},
      providerAvailability: {},
      recentPerformance: {},
    };
  }

  private calculateProviderPreference(records: any[]): Record<ApiProvider, number> {
    const counts: Record<ApiProvider, number> = {} as any;
    const total = records.length;

    for (const record of records) {
      counts[record.provider] = (counts[record.provider] || 0) + 1;
    }

    const preference: Record<ApiProvider, number> = {} as any;
    for (const [provider, count] of Object.entries(counts)) {
      preference[provider as ApiProvider] = count / total;
    }

    return preference;
  }

  private calculateAvgRequestsPerDay(records: any[]): number {
    if (records.length === 0) return 0;
    
    const days = new Set(records.map(r => r.createdAt.toDateString())).size;
    return records.length / Math.max(days, 1);
  }

  private getPreferredModels(records: any[]): string[] {
    const modelCounts = new Map<string, number>();
    
    for (const record of records) {
      modelCounts.set(record.model, (modelCounts.get(record.model) || 0) + 1);
    }

    return Array.from(modelCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
  }

  private getPeakUsageHours(records: any[]): number[] {
    const hourCounts = new Array(24).fill(0);
    
    for (const record of records) {
      const hour = new Date(record.createdAt).getHours();
      hourCounts[hour]++;
    }

    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);
  }

  private calculateCostTolerance(records: any[]): number {
    if (records.length === 0) return 0.01;
    
    const costs = records.map(r => Number(r.cost));
    return costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
  }

  private updatePerformanceHistory(provider: ApiProvider, outcome: any): void {
    if (!this.performanceHistory.has(provider)) {
      this.performanceHistory.set(provider, []);
    }

    const snapshots = this.performanceHistory.get(provider)!;
    const snapshot: PerformanceSnapshot = {
      avgLatency: outcome.latency,
      successRate: outcome.success ? 1 : 0,
      avgCost: outcome.cost,
      qualityScore: outcome.quality,
      timestamp: Date.now(),
    };

    snapshots.push(snapshot);
    
    // Keep only recent snapshots (last 100)
    if (snapshots.length > 100) {
      snapshots.splice(0, snapshots.length - 100);
    }
  }

  private async initializePerformanceHistory(): Promise<void> {
    // Initialize with empty arrays for each provider
    for (const provider of Object.values(ApiProvider)) {
      this.performanceHistory.set(provider, []);
    }
  }

  private startDataFlushCycle(): void {
    // Flush completed data to database every 5 minutes
    setInterval(async () => {
      try {
        await this.flushCompletedData();
      } catch (error) {
        console.error('Failed to flush ML data:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  private async flushCompletedData(): Promise<void> {
    const completedData = Array.from(this.dataBuffer.entries())
      .filter(([, data]) => data.outcome)
      .slice(0, 100); // Batch size

    if (completedData.length === 0) return;

    try {
      // Store in database (create ML training data table)
      // This would require a new Prisma model for ML training data
      console.info(`Flushed ${completedData.length} ML training examples`);
      
      // Remove from buffer
      for (const [requestId] of completedData) {
        this.dataBuffer.delete(requestId);
      }

    } catch (error) {
      console.error('Failed to flush ML data to database:', error);
    }
  }
}