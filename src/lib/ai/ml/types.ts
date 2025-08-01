/**
 * Machine Learning Types for AI Provider Intelligence
 * 
 * Core types for the ML-powered routing system that learns optimal
 * provider selection patterns and continuously improves performance.
 */

import { ApiProvider } from '@prisma/client';

// Feature extraction types
export interface RequestFeatures {
  // Content features
  promptLength: number;
  messageCount: number;
  hasSystemMessage: boolean;
  avgMessageLength: number;
  containsCode: boolean;
  containsQuestions: boolean;
  language: string; // detected language
  complexity: number; // 0-1 complexity score
  
  // Context features
  requestType: 'chat' | 'completion' | 'analysis' | 'creative' | 'code' | 'translation';
  urgency: 'low' | 'medium' | 'high';
  qualityRequirement: 'basic' | 'standard' | 'premium';
  
  // User patterns
  userTier: 'free' | 'pro' | 'enterprise';
  historicalProviderPreference: Record<ApiProvider, number>;
  timeOfDay: number; // 0-23
  dayOfWeek: number; // 0-6
  
  // System features
  currentLoad: Record<ApiProvider, number>;
  providerAvailability: Record<ApiProvider, boolean>;
  recentPerformance: Record<ApiProvider, PerformanceSnapshot>;
}

export interface PerformanceSnapshot {
  avgLatency: number;
  successRate: number;
  avgCost: number;
  qualityScore: number;
  timestamp: number;
}

// ML Model types
export interface MLModel {
  id: string;
  name: string;
  type: 'decision_tree' | 'linear_regression' | 'neural_network' | 'ensemble';
  version: string;
  accuracy: number;
  trainedAt: Date;
  features: string[];
  weights?: Record<string, number>;
  hyperparameters: Record<string, any>;
}

export interface RoutingPrediction {
  recommendedProvider: ApiProvider;
  recommendedModel: string;
  confidence: number; // 0-1
  expectedCost: number;
  expectedLatency: number;
  expectedQuality: number;
  reasoning: string[];
  alternatives: Array<{
    provider: ApiProvider;
    model: string;
    score: number;
    cost: number;
    latency: number;
    quality: number;
  }>;
}

export interface TrainingData {
  id: string;
  requestId: string;
  userId: string;
  timestamp: Date;
  features: RequestFeatures;
  actualProvider: ApiProvider;
  actualModel: string;
  actualCost: number;
  actualLatency: number;
  actualQuality: number;
  userSatisfaction?: number; // 0-1 if available
  wasOptimal: boolean; // determined retrospectively
}

// Quality scoring types
export interface QualityMetrics {
  responseRelevance: number; // 0-1
  responseCoherence: number; // 0-1
  taskCompletion: number; // 0-1
  outputFormat: number; // 0-1
  factualAccuracy: number; // 0-1 (when verifiable)
  overallScore: number; // weighted average
}

export interface QualityModel {
  provider: ApiProvider;
  model: string;
  historicalQuality: QualityMetrics[];
  currentAverageQuality: number;
  qualityTrend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

// Reinforcement learning types
export interface ReinforcementState {
  features: RequestFeatures;
  availableActions: Array<{
    provider: ApiProvider;
    model: string;
  }>;
}

export interface ReinforcementAction {
  provider: ApiProvider;
  model: string;
}

export interface ReinforcementReward {
  cost: number; // negative reward for high cost
  latency: number; // negative reward for high latency
  quality: number; // positive reward for high quality
  userSatisfaction: number; // positive reward for satisfaction
  combined: number; // weighted combination
}

export interface RLAgent {
  id: string;
  type: 'q_learning' | 'policy_gradient' | 'actor_critic';
  qTable?: Record<string, Record<string, number>>; // for Q-learning
  policy?: MLModel; // for policy-based methods
  learningRate: number;
  discountFactor: number;
  explorationRate: number;
  totalReward: number;
  episodeCount: number;
}

// Auto-optimization types
export interface OptimizationGoal {
  type: 'cost' | 'latency' | 'quality' | 'balanced';
  weight: number; // 0-1
  target?: number; // specific target value
  priority: 'low' | 'medium' | 'high';
}

export interface OptimizationStrategy {
  id: string;
  name: string;
  goals: OptimizationGoal[];
  enabled: boolean;
  mlModel: MLModel;
  rlAgent?: RLAgent;
  performance: {
    costSavings: number; // percentage
    latencyImprovement: number; // percentage
    qualityMaintained: number; // percentage
    confidenceInterval: [number, number];
  };
}

// Monitoring and analytics types
export interface MLMetrics {
  modelId: string;
  timestamp: Date;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  costSavings: number;
  latencyImprovement: number;
  qualityScore: number;
  predictionCount: number;
  correctPredictions: number;
}

export interface MLExperiment {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: 'running' | 'completed' | 'failed';
  hypothesis: string;
  modelA: MLModel; // control
  modelB: MLModel; // treatment
  trafficSplit: number; // percentage to model B
  results?: {
    winner: 'A' | 'B' | 'tie';
    significance: number;
    improvement: {
      cost: number;
      latency: number;
      quality: number;
    };
  };
}

// Configuration types
export interface MLConfig {
  enabled: boolean;
  fallbackToRulesBased: boolean;
  modelUpdateInterval: number; // minutes
  trainingDataRetention: number; // days
  minTrainingExamples: number;
  maxModelComplexity: number;
  confidenceThreshold: number; // minimum confidence for ML routing
  
  qualityScoring: {
    enabled: boolean;
    updateInterval: number; // minutes
    features: string[];
  };
  
  reinforcementLearning: {
    enabled: boolean;
    agent: 'q_learning' | 'policy_gradient';
    learningRate: number;
    explorationRate: number;
    rewardWeights: {
      cost: number;
      latency: number;
      quality: number;
      satisfaction: number;
    };
  };
  
  optimization: {
    enabled: boolean;
    strategies: string[]; // enabled strategy IDs
    autoTuning: boolean;
    targetMetrics: {
      costSavings: number; // target percentage
      maxLatencyIncrease: number; // acceptable latency trade-off
      minQualityScore: number; // minimum quality threshold
    };
  };
}

// Error types
export class MLError extends Error {
  public readonly code: string;
  public readonly type: 'model_error' | 'training_error' | 'prediction_error' | 'data_error';
  public readonly retryable: boolean;
  public readonly details?: Record<string, any>;

  constructor(error: {
    code: string;
    message: string;
    type: 'model_error' | 'training_error' | 'prediction_error' | 'data_error';
    retryable: boolean;
    details?: Record<string, any>;
  }) {
    super(error.message);
    this.name = 'MLError';
    this.code = error.code;
    this.type = error.type;
    this.retryable = error.retryable;
    this.details = error.details;
  }
}

// Default configurations
export const DEFAULT_ML_CONFIG: MLConfig = {
  enabled: true,
  fallbackToRulesBased: true,
  modelUpdateInterval: 60, // 1 hour
  trainingDataRetention: 30, // 30 days
  minTrainingExamples: 100,
  maxModelComplexity: 10,
  confidenceThreshold: 0.7,
  
  qualityScoring: {
    enabled: true,
    updateInterval: 15, // 15 minutes
    features: ['relevance', 'coherence', 'completion', 'format'],
  },
  
  reinforcementLearning: {
    enabled: true,
    agent: 'q_learning',
    learningRate: 0.1,
    explorationRate: 0.1,
    rewardWeights: {
      cost: -0.4, // negative because we want to minimize cost
      latency: -0.3, // negative because we want to minimize latency
      quality: 0.8, // positive because we want to maximize quality
      satisfaction: 1.0, // highest weight for user satisfaction
    },
  },
  
  optimization: {
    enabled: true,
    strategies: ['balanced', 'cost_optimized'],
    autoTuning: true,
    targetMetrics: {
      costSavings: 50, // target 50% cost savings
      maxLatencyIncrease: 20, // max 20% latency increase acceptable
      minQualityScore: 0.8, // minimum 80% quality score
    },
  },
};

// Performance targets for ML system
export const ML_PERFORMANCE_TARGETS = {
  PREDICTION_LATENCY: 50, // <50ms for routing decision
  MODEL_ACCURACY: 0.85, // >85% accuracy target
  COST_SAVINGS: 0.5, // >50% cost savings target
  QUALITY_RETENTION: 0.95, // >95% quality retention
  CONFIDENCE_THRESHOLD: 0.7, // minimum confidence for ML routing
} as const;