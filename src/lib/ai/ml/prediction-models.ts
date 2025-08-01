/**
 * Prediction Models for Cost and Performance Forecasting
 * 
 * Lightweight ML models for predicting optimal provider selection,
 * cost estimation, and performance forecasting using decision trees,
 * linear regression, and ensemble methods.
 */

import { ApiProvider } from '@prisma/client';
import {
  MLModel,
  RoutingPrediction,
  TrainingData,
  ContextualFeatures,
  MLError,
  ML_PERFORMANCE_TARGETS,
} from './types';

export interface ModelPrediction {
  provider: ApiProvider;
  model: string;
  confidence: number;
  expectedCost: number;
  expectedLatency: number;
  expectedQuality: number;
  score: number; // composite score
}

export interface EnsemblePrediction {
  predictions: ModelPrediction[];
  consensus: ModelPrediction;
  uncertainty: number; // variance across models
  recommendedAction: 'use_ml' | 'fallback_to_rules' | 'explore';
}

// Decision Tree Node for routing decisions
export interface DecisionNode {
  feature: string;
  threshold?: number;
  value?: string;
  left?: DecisionNode;
  right?: DecisionNode;
  prediction?: {
    provider: ApiProvider;
    confidence: number;
    samples: number;
  };
}

// Linear regression model for cost/latency prediction
export interface LinearModel {
  coefficients: Record<string, number>;
  intercept: number;
  r2Score: number;
  features: string[];
}

export class MLPredictionEngine {
  private costModel: LinearModel | null = null;
  private latencyModel: LinearModel | null = null;
  private qualityModel: LinearModel | null = null;
  private routingTree: DecisionNode | null = null;
  private ensembleModels: Map<string, MLModel> = new Map();
  private modelAccuracy: Map<string, number> = new Map();
  private featureImportance: Map<string, number> = new Map();

  constructor() {
    this.initializeDefaultModels();
  }

  /**
   * Train all prediction models with new data
   */
  async trainModels(trainingData: TrainingData[]): Promise<void> {
    if (trainingData.length < 50) {
      throw new MLError({
        code: 'INSUFFICIENT_TRAINING_DATA',
        message: `Need at least 50 training examples, got ${trainingData.length}`,
        type: 'training_error',
        retryable: false,
      });
    }

    try {
      console.info(`Training ML models with ${trainingData.length} examples`);

      // Prepare feature vectors
      const features = await this.extractFeatureVectors(trainingData);
      
      // Train individual models
      await Promise.all([
        this.trainCostModel(features, trainingData),
        this.trainLatencyModel(features, trainingData),
        this.trainQualityModel(features, trainingData),
        this.trainRoutingTree(features, trainingData),
      ]);

      // Update ensemble models
      await this.updateEnsembleModels(trainingData);

      console.info('ML model training completed successfully');

    } catch (error) {
      throw new MLError({
        code: 'MODEL_TRAINING_FAILED',
        message: `Model training failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'training_error',
        retryable: true,
      });
    }
  }

  /**
   * Predict optimal routing decision
   */
  async predictOptimalRouting(
    features: ContextualFeatures,
    availableProviders: ApiProvider[] = [ApiProvider.OPENAI, ApiProvider.ANTHROPIC, ApiProvider.GOOGLE]
  ): Promise<RoutingPrediction> {
    try {
      const predictions: ModelPrediction[] = [];
      
      // Get predictions from each model
      for (const provider of availableProviders) {
        const prediction = await this.predictForProvider(features, provider);
        predictions.push(prediction);
      }

      // Sort by composite score
      predictions.sort((a, b) => b.score - a.score);
      const best = predictions[0];

      // Generate alternatives
      const alternatives = predictions.slice(1, 4).map(p => ({
        provider: p.provider,
        model: p.model,
        score: p.score,
        cost: p.expectedCost,
        latency: p.expectedLatency,
        quality: p.expectedQuality,
      }));

      // Generate reasoning
      const reasoning = this.generateReasoning(best, predictions, features);

      return {
        recommendedProvider: best.provider,
        recommendedModel: best.model,
        confidence: best.confidence,
        expectedCost: best.expectedCost,
        expectedLatency: best.expectedLatency,
        expectedQuality: best.expectedQuality,
        reasoning,
        alternatives,
      };

    } catch (error) {
      throw new MLError({
        code: 'PREDICTION_FAILED',
        message: `Prediction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'prediction_error',
        retryable: true,
      });
    }
  }

  /**
   * Get ensemble prediction with uncertainty estimation
   */
  async getEnsemblePrediction(features: ContextualFeatures): Promise<EnsemblePrediction> {
    const predictions: ModelPrediction[] = [];
    
    // Get predictions from multiple models
    for (const [modelId, model] of this.ensembleModels.entries()) {
      try {
        const prediction = await this.predictWithModel(features, model);
        predictions.push(prediction);
      } catch (error) {
        console.warn(`Model ${modelId} failed to predict:`, error);
      }
    }

    if (predictions.length === 0) {
      throw new MLError({
        code: 'NO_PREDICTIONS_AVAILABLE',
        message: 'All models failed to generate predictions',
        type: 'prediction_error',
        retryable: true,
      });
    }

    // Calculate consensus
    const consensus = this.calculateConsensus(predictions);
    
    // Calculate uncertainty (variance across models)
    const uncertainty = this.calculateUncertainty(predictions);
    
    // Decide on action based on confidence and uncertainty
    const recommendedAction = this.determineAction(consensus, uncertainty);

    return {
      predictions,
      consensus,
      uncertainty,
      recommendedAction,
    };
  }

  /**
   * Predict cost for a specific request
   */
  async predictCost(features: ContextualFeatures, provider: ApiProvider, model: string): Promise<number> {
    if (!this.costModel) {
      throw new MLError({
        code: 'MODEL_NOT_TRAINED',
        message: 'Cost model not trained',
        type: 'model_error',
        retryable: false,
      });
    }

    const featureVector = this.contextualFeaturesToVector(features);
    const providerFeatures = this.addProviderFeatures(featureVector, provider, model);
    
    return this.predictWithLinearModel(this.costModel, providerFeatures);
  }

  /**
   * Predict latency for a specific request
   */
  async predictLatency(features: ContextualFeatures, provider: ApiProvider, model: string): Promise<number> {
    if (!this.latencyModel) {
      throw new MLError({
        code: 'MODEL_NOT_TRAINED',
        message: 'Latency model not trained',
        type: 'model_error',
        retryable: false,
      });
    }

    const featureVector = this.contextualFeaturesToVector(features);
    const providerFeatures = this.addProviderFeatures(featureVector, provider, model);
    
    return Math.max(100, this.predictWithLinearModel(this.latencyModel, providerFeatures));
  }

  /**
   * Predict quality score for a specific request
   */
  async predictQuality(features: ContextualFeatures, provider: ApiProvider, model: string): Promise<number> {
    if (!this.qualityModel) {
      // Use default quality scores if model not trained
      const defaultScores = {
        [ApiProvider.OPENAI]: 0.85,
        [ApiProvider.ANTHROPIC]: 0.90,
        [ApiProvider.GOOGLE]: 0.80,
      };
      return defaultScores[provider] || 0.8;
    }

    const featureVector = this.contextualFeaturesToVector(features);
    const providerFeatures = this.addProviderFeatures(featureVector, provider, model);
    
    const quality = this.predictWithLinearModel(this.qualityModel, providerFeatures);
    return Math.max(0, Math.min(1, quality));
  }

  /**
   * Get model performance metrics
   */
  getModelMetrics(): Record<string, any> {
    return {
      costModelAccuracy: this.costModel?.r2Score || 0,
      latencyModelAccuracy: this.latencyModel?.r2Score || 0,
      qualityModelAccuracy: this.qualityModel?.r2Score || 0,
      routingTreeDepth: this.calculateTreeDepth(this.routingTree),
      ensembleSize: this.ensembleModels.size,
      featureImportance: Object.fromEntries(this.featureImportance),
      modelAccuracy: Object.fromEntries(this.modelAccuracy),
    };
  }

  /**
   * Update model with online learning
   */
  async updateModelOnline(
    features: ContextualFeatures,
    actualProvider: ApiProvider,
    actualCost: number,
    actualLatency: number,
    actualQuality: number,
    wasOptimal: boolean
  ): Promise<void> {
    // Simplified online learning - update feature importance
    const featureVector = this.contextualFeaturesToVector(features);
    const error = wasOptimal ? 0 : 1;
    
    // Update feature importance based on prediction accuracy
    const featureNames = this.getFeatureNames();
    for (let i = 0; i < featureVector.length && i < featureNames.length; i++) {
      const featureName = featureNames[i];
      const currentImportance = this.featureImportance.get(featureName) || 0;
      
      // Adjust importance based on error (simplified gradient)
      const adjustment = error * featureVector[i] * 0.01;
      this.featureImportance.set(featureName, Math.max(0, currentImportance - adjustment));
    }

    console.debug('Updated model with online learning', { wasOptimal, error });
  }

  // Private methods

  private async extractFeatureVectors(trainingData: TrainingData[]): Promise<number[][]> {
    const vectors: number[][] = [];
    
    for (const data of trainingData) {
      // Convert training data features to vector format
      // This is a simplified conversion - in practice, would use the full feature extraction
      const vector = [
        data.features.promptLength / 10000,
        data.features.messageCount / 10,
        data.features.hasSystemMessage ? 1 : 0,
        data.features.complexity,
        data.features.timeOfDay / 24,
        data.features.dayOfWeek / 7,
        data.features.userTier === 'enterprise' ? 1 : data.features.userTier === 'pro' ? 0.5 : 0,
      ];
      
      vectors.push(vector);
    }
    
    return vectors;
  }

  private async trainCostModel(features: number[][], trainingData: TrainingData[]): Promise<void> {
    const targets = trainingData.map(d => d.actualCost);
    this.costModel = this.trainLinearRegression(features, targets, 'cost');
    console.debug(`Cost model trained with R² = ${this.costModel.r2Score.toFixed(3)}`);
  }

  private async trainLatencyModel(features: number[][], trainingData: TrainingData[]): Promise<void> {
    const targets = trainingData.map(d => d.actualLatency);
    this.latencyModel = this.trainLinearRegression(features, targets, 'latency');
    console.debug(`Latency model trained with R² = ${this.latencyModel.r2Score.toFixed(3)}`);
  }

  private async trainQualityModel(features: number[][], trainingData: TrainingData[]): Promise<void> {
    const targets = trainingData.map(d => d.actualQuality);
    this.qualityModel = this.trainLinearRegression(features, targets, 'quality');
    console.debug(`Quality model trained with R² = ${this.qualityModel.r2Score.toFixed(3)}`);
  }

  private async trainRoutingTree(features: number[][], trainingData: TrainingData[]): Promise<void> {
    // Simplified decision tree training
    const samples = trainingData.map((data, i) => ({
      features: features[i],
      provider: data.actualProvider,
      wasOptimal: data.wasOptimal,
    }));

    this.routingTree = this.buildDecisionTree(samples, 0, 5); // max depth 5
    console.debug('Routing decision tree trained');
  }

  private trainLinearRegression(features: number[][], targets: number[], modelType: string): LinearModel {
    const n = features.length;
    const m = features[0]?.length || 0;
    
    if (n === 0 || m === 0) {
      throw new MLError({
        code: 'INVALID_TRAINING_DATA',
        message: 'Empty feature matrix',
        type: 'training_error',
        retryable: false,
      });
    }

    // Add bias term (intercept)
    const X = features.map(row => [1, ...row]);
    const featureNames = ['intercept', ...this.getFeatureNames().slice(0, m)];

    // Simplified linear regression using normal equation: θ = (X'X)^-1 X'y
    const coefficients = this.solveLinearSystem(X, targets);
    
    // Calculate R² score
    const predictions = X.map(row => this.dotProduct(row, coefficients));
    const r2Score = this.calculateR2Score(targets, predictions);

    return {
      coefficients: Object.fromEntries(featureNames.map((name, i) => [name, coefficients[i]])),
      intercept: coefficients[0],
      r2Score,
      features: featureNames.slice(1),
    };
  }

  private buildDecisionTree(
    samples: Array<{features: number[], provider: ApiProvider, wasOptimal: boolean}>,
    depth: number,
    maxDepth: number
  ): DecisionNode {
    // Simple decision tree implementation
    if (depth >= maxDepth || samples.length < 10) {
      // Leaf node - return most common provider
      const providerCounts = new Map<ApiProvider, number>();
      for (const sample of samples) {
        providerCounts.set(sample.provider, (providerCounts.get(sample.provider) || 0) + 1);
      }
      
      const bestProvider = Array.from(providerCounts.entries())
        .sort((a, b) => b[1] - a[1])[0][0];
      
      return {
        feature: 'leaf',
        prediction: {
          provider: bestProvider,
          confidence: (providerCounts.get(bestProvider) || 0) / samples.length,
          samples: samples.length,
        },
      };
    }

    // Find best split
    const bestSplit = this.findBestSplit(samples);
    if (!bestSplit) {
      // No good split found, create leaf
      const providers = samples.map(s => s.provider);
      const mostCommon = this.getMostCommon(providers);
      return {
        feature: 'leaf',
        prediction: {
          provider: mostCommon,
          confidence: 0.5,
          samples: samples.length,
        },
      };
    }

    // Split samples
    const leftSamples = samples.filter(s => s.features[bestSplit.featureIndex] <= bestSplit.threshold);
    const rightSamples = samples.filter(s => s.features[bestSplit.featureIndex] > bestSplit.threshold);

    return {
      feature: this.getFeatureNames()[bestSplit.featureIndex],
      threshold: bestSplit.threshold,
      left: this.buildDecisionTree(leftSamples, depth + 1, maxDepth),
      right: this.buildDecisionTree(rightSamples, depth + 1, maxDepth),
    };
  }

  private findBestSplit(samples: Array<{features: number[], provider: ApiProvider, wasOptimal: boolean}>): 
    {featureIndex: number, threshold: number, gain: number} | null {
    
    let bestSplit = null;
    let bestGain = 0;

    const featureCount = samples[0]?.features.length || 0;
    
    for (let featureIndex = 0; featureIndex < featureCount; featureIndex++) {
      const values = samples.map(s => s.features[featureIndex]).sort((a, b) => a - b);
      const uniqueValues = [...new Set(values)];
      
      for (const threshold of uniqueValues) {
        const gain = this.calculateInformationGain(samples, featureIndex, threshold);
        if (gain > bestGain) {
          bestGain = gain;
          bestSplit = { featureIndex, threshold, gain };
        }
      }
    }

    return bestSplit;
  }

  private calculateInformationGain(
    samples: Array<{features: number[], provider: ApiProvider, wasOptimal: boolean}>,
    featureIndex: number,
    threshold: number
  ): number {
    const left = samples.filter(s => s.features[featureIndex] <= threshold);
    const right = samples.filter(s => s.features[featureIndex] > threshold);
    
    if (left.length === 0 || right.length === 0) return 0;

    const totalEntropy = this.calculateEntropy(samples);
    const leftEntropy = this.calculateEntropy(left);
    const rightEntropy = this.calculateEntropy(right);
    
    const weightedEntropy = (left.length / samples.length) * leftEntropy + 
                           (right.length / samples.length) * rightEntropy;
    
    return totalEntropy - weightedEntropy;
  }

  private calculateEntropy(samples: Array<{provider: ApiProvider}>): number {
    const counts = new Map<ApiProvider, number>();
    for (const sample of samples) {
      counts.set(sample.provider, (counts.get(sample.provider) || 0) + 1);
    }
    
    let entropy = 0;
    const total = samples.length;
    
    for (const count of counts.values()) {
      const p = count / total;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }
    
    return entropy;
  }

  private async predictForProvider(features: ContextualFeatures, provider: ApiProvider): Promise<ModelPrediction> {
    const model = this.getDefaultModelForProvider(provider);
    
    const [cost, latency, quality] = await Promise.all([
      this.predictCost(features, provider, model),
      this.predictLatency(features, provider, model),
      this.predictQuality(features, provider, model),
    ]);

    // Calculate composite score (higher is better)
    const costScore = Math.max(0, 1 - (cost / 0.1)); // normalize to $0.10 max
    const latencyScore = Math.max(0, 1 - (latency / 5000)); // normalize to 5s max
    const qualityScore = quality;
    
    const score = (qualityScore * 0.4) + (costScore * 0.3) + (latencyScore * 0.3);
    
    return {
      provider,
      model,
      confidence: 0.8, // Default confidence
      expectedCost: cost,
      expectedLatency: latency,
      expectedQuality: quality,
      score,
    };
  }

  private async predictWithModel(features: ContextualFeatures, model: MLModel): Promise<ModelPrediction> {
    // Simplified prediction using model weights
    const featureVector = this.contextualFeaturesToVector(features);
    const score = this.calculateWeightedScore(featureVector, model.weights || {});
    
    // Map score to provider (simplified)
    const providers = [ApiProvider.OPENAI, ApiProvider.ANTHROPIC, ApiProvider.GOOGLE];
    const providerIndex = Math.floor(score * providers.length) % providers.length;
    const provider = providers[providerIndex];
    
    return {
      provider,
      model: this.getDefaultModelForProvider(provider),
      confidence: Math.min(1, Math.max(0, score)),
      expectedCost: 0.01 * (1 + Math.random()),
      expectedLatency: 1000 * (1 + Math.random()),
      expectedQuality: 0.8 + (Math.random() * 0.2),
      score,
    };
  }

  private calculateConsensus(predictions: ModelPrediction[]): ModelPrediction {
    // Simple voting mechanism
    const providerVotes = new Map<ApiProvider, number>();
    
    for (const prediction of predictions) {
      const currentVotes = providerVotes.get(prediction.provider) || 0;
      providerVotes.set(prediction.provider, currentVotes + prediction.confidence);
    }

    const winningProvider = Array.from(providerVotes.entries())
      .sort((a, b) => b[1] - a[1])[0][0];

    const providerPredictions = predictions.filter(p => p.provider === winningProvider);
    const avgPrediction = providerPredictions.reduce((acc, p) => ({
      provider: winningProvider,
      model: p.model,
      confidence: acc.confidence + p.confidence,
      expectedCost: acc.expectedCost + p.expectedCost,
      expectedLatency: acc.expectedLatency + p.expectedLatency,
      expectedQuality: acc.expectedQuality + p.expectedQuality,
      score: acc.score + p.score,
    }), {
      provider: winningProvider,
      model: '',
      confidence: 0,
      expectedCost: 0,
      expectedLatency: 0,
      expectedQuality: 0,
      score: 0,
    });

    const count = providerPredictions.length;
    return {
      provider: avgPrediction.provider,
      model: providerPredictions[0].model,
      confidence: avgPrediction.confidence / count,
      expectedCost: avgPrediction.expectedCost / count,
      expectedLatency: avgPrediction.expectedLatency / count,
      expectedQuality: avgPrediction.expectedQuality / count,
      score: avgPrediction.score / count,
    };
  }

  private calculateUncertainty(predictions: ModelPrediction[]): number {
    if (predictions.length < 2) return 0;
    
    const scores = predictions.map(p => p.score);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    return Math.sqrt(variance);
  }

  private determineAction(consensus: ModelPrediction, uncertainty: number): 'use_ml' | 'fallback_to_rules' | 'explore' {
    if (consensus.confidence > ML_PERFORMANCE_TARGETS.CONFIDENCE_THRESHOLD && uncertainty < 0.2) {
      return 'use_ml';
    } else if (uncertainty > 0.5) {
      return 'explore';
    } else {
      return 'fallback_to_rules';
    }
  }

  private generateReasoning(best: ModelPrediction, predictions: ModelPrediction[], features: ContextualFeatures): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`Selected ${best.provider} with ${(best.confidence * 100).toFixed(1)}% confidence`);
    
    if (best.expectedCost < 0.01) {
      reasoning.push('Low cost option');
    }
    
    if (best.expectedLatency < 2000) {
      reasoning.push('Fast response expected');
    }
    
    if (best.expectedQuality > 0.9) {
      reasoning.push('High quality expected');
    }
    
    if (features.content.complexityIndicators.requiresCreativity && best.provider === ApiProvider.ANTHROPIC) {
      reasoning.push('Optimal for creative tasks');
    }
    
    if (features.content.complexityIndicators.technicalTerms > 5 && best.provider === ApiProvider.OPENAI) {
      reasoning.push('Best for technical content');
    }

    return reasoning;
  }

  private contextualFeaturesToVector(features: ContextualFeatures): number[] {
    // Convert contextual features to numerical vector
    return [
      features.content.textMetrics.totalLength / 10000,
      features.content.textMetrics.vocabularyRichness,
      features.content.textMetrics.readabilityScore,
      features.content.semanticFeatures.sentimentScore,
      features.content.semanticFeatures.formalityLevel,
      features.content.structuralFeatures.hasCodeBlocks ? 1 : 0,
      features.content.structuralFeatures.hasQuestions / 10,
      features.content.complexityIndicators.technicalTerms / 20,
      features.user.behavior.sessionLength / 120,
      features.user.preferences.qualityTolerance,
      features.user.preferences.costSensitivity,
      features.temporal.timing.hour / 24,
      features.temporal.patterns.isBusinessHours ? 1 : 0,
    ];
  }

  private addProviderFeatures(baseFeatures: number[], provider: ApiProvider, model: string): number[] {
    const providerFeatures = [
      provider === ApiProvider.OPENAI ? 1 : 0,
      provider === ApiProvider.ANTHROPIC ? 1 : 0,
      provider === ApiProvider.GOOGLE ? 1 : 0,
      model.includes('gpt-4') || model.includes('opus') || model.includes('pro') ? 1 : 0,
    ];
    
    return [...baseFeatures, ...providerFeatures];
  }

  private predictWithLinearModel(model: LinearModel, features: number[]): number {
    const featuresWithBias = [1, ...features];
    const coefficients = [model.intercept, ...Object.values(model.coefficients).slice(1)];
    
    return this.dotProduct(featuresWithBias, coefficients);
  }

  private dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
  }

  private solveLinearSystem(X: number[][], y: number[]): number[] {
    // Simplified normal equation solver
    const n = X[0].length;
    const coefficients = new Array(n).fill(0);
    
    // Use gradient descent for simplicity
    const learningRate = 0.01;
    const iterations = 1000;
    
    for (let iter = 0; iter < iterations; iter++) {
      const predictions = X.map(row => this.dotProduct(row, coefficients));
      const errors = predictions.map((pred, i) => pred - y[i]);
      
      // Update coefficients
      for (let j = 0; j < n; j++) {
        const gradient = errors.reduce((sum, error, i) => sum + error * X[i][j], 0) / X.length;
        coefficients[j] -= learningRate * gradient;
      }
    }
    
    return coefficients;
  }

  private calculateR2Score(actual: number[], predicted: number[]): number {
    const actualMean = actual.reduce((sum, val) => sum + val, 0) / actual.length;
    const totalSumSquares = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
    const residualSumSquares = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
    
    return 1 - (residualSumSquares / totalSumSquares);
  }

  private calculateTreeDepth(node: DecisionNode | null): number {
    if (!node || node.prediction) return 1;
    
    const leftDepth = node.left ? this.calculateTreeDepth(node.left) : 0;
    const rightDepth = node.right ? this.calculateTreeDepth(node.right) : 0;
    
    return 1 + Math.max(leftDepth, rightDepth);
  }

  private calculateWeightedScore(features: number[], weights: Record<string, number>): number {
    const featureNames = this.getFeatureNames();
    let score = 0;
    
    for (let i = 0; i < Math.min(features.length, featureNames.length); i++) {
      const weight = weights[featureNames[i]] || 0;
      score += features[i] * weight;
    }
    
    return Math.max(0, Math.min(1, score));
  }

  private getFeatureNames(): string[] {
    return [
      'textLength', 'vocabularyRichness', 'readability', 'sentiment', 'formality',
      'hasCode', 'questionCount', 'technicalTerms', 'sessionLength',
      'qualityTolerance', 'costSensitivity', 'hourOfDay', 'isBusinessHours',
    ];
  }

  private getDefaultModelForProvider(provider: ApiProvider): string {
    const defaultModels = {
      [ApiProvider.OPENAI]: 'gpt-4o-mini',
      [ApiProvider.ANTHROPIC]: 'claude-3-haiku-20240307',
      [ApiProvider.GOOGLE]: 'gemini-1.5-flash',
    };
    
    return defaultModels[provider] || 'gpt-4o-mini';
  }

  private getMostCommon<T>(items: T[]): T {
    const counts = new Map<T, number>();
    for (const item of items) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }
    
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  private async updateEnsembleModels(trainingData: TrainingData[]): Promise<void> {
    // Create simple ensemble models
    const costModel: MLModel = {
      id: 'cost_ensemble',
      name: 'Cost Prediction Ensemble',
      type: 'ensemble',
      version: '1.0',
      accuracy: this.costModel?.r2Score || 0.8,
      trainedAt: new Date(),
      features: this.getFeatureNames(),
      weights: Object.fromEntries(this.getFeatureNames().map(name => [name, Math.random()])),
      hyperparameters: { learningRate: 0.01, regularization: 0.001 },
    };

    this.ensembleModels.set(costModel.id, costModel);
    this.modelAccuracy.set(costModel.id, costModel.accuracy);
  }

  private initializeDefaultModels(): void {
    // Initialize with reasonable default values for cold start
    this.featureImportance.set('textLength', 0.2);
    this.featureImportance.set('technicalTerms', 0.15);
    this.featureImportance.set('qualityTolerance', 0.1);
    this.featureImportance.set('costSensitivity', 0.1);
    this.featureImportance.set('isBusinessHours', 0.05);

    console.debug('Initialized default ML models');
  }
}