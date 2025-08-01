// A/B Testing Framework - Experiment Tracking Middleware
// Integrates with chat completions API to route requests and collect data

interface ExperimentTrackingData {
  experimentId: string;
  variantId: string;
  provider: string;
  model: string;
  requestId: string;
  userId: string;
  teamId?: string;
  startTime: number;
  endTime?: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  latency: number;
  success: boolean;
  errorMessage?: string;
  qualityScore?: number;
}

interface ActiveExperiment {
  id: string;
  config: {
    type: 'provider_comparison' | 'cost_optimization' | 'quality_test' | 'latency_test';
    traffic_split: number;
    providers: {
      provider: string;
      weight: number;
      models: string[];
    }[];
    filters: {
      teams?: string[];
      models?: string[];
      request_types?: string[];
    };
  };
  status: 'running';
}

class ExperimentTracker {
  private activeExperiments: ActiveExperiment[] = [];
  private trackingData: ExperimentTrackingData[] = [];

  constructor() {
    this.loadActiveExperiments();
  }

  private async loadActiveExperiments() {
    // In production, this would query the database
    // For now, use the mock data to simulate running experiments
    const mockActiveExperiment: ActiveExperiment = {
      id: 'exp-cost-optimization-demo',
      config: {
        type: 'cost_optimization',
        traffic_split: 25,
        providers: [
          { provider: 'openai', weight: 33, models: ['gpt-4o'] },
          { provider: 'anthropic', weight: 34, models: ['claude-3-5-sonnet-20241022'] },
          { provider: 'google', weight: 33, models: ['gemini-1.5-pro'] },
        ],
        filters: {
          request_types: ['chat_completion'],
        },
      },
      status: 'running',
    };

    // Only add if we want to simulate an active experiment
    // this.activeExperiments = [mockActiveExperiment];
  }

  shouldIncludeInExperiment(
    userId: string,
    teamId?: string,
    model?: string,
    requestType: string = 'chat_completion'
  ): { experiment: ActiveExperiment; variant: string } | null {
    for (const experiment of this.activeExperiments) {
      // Check traffic split
      const userHash = this.hashUserId(userId);
      if (userHash > experiment.config.traffic_split) continue;

      // Check filters
      if (experiment.config.filters.teams && teamId && 
          !experiment.config.filters.teams.includes(teamId)) continue;
      
      if (experiment.config.filters.models && model && 
          !experiment.config.filters.models.includes(model)) continue;
      
      if (experiment.config.filters.request_types && 
          !experiment.config.filters.request_types.includes(requestType)) continue;

      // Select variant based on weights
      const variant = this.selectVariant(experiment, userId);
      return { experiment, variant };
    }

    return null;
  }

  private hashUserId(userId: string): number {
    // Simple hash function to determine if user should be in experiment
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }

  private selectVariant(experiment: ActiveExperiment, userId: string): string {
    const hash = this.hashUserId(userId + experiment.id);
    let cumulativeWeight = 0;
    
    for (const provider of experiment.config.providers) {
      cumulativeWeight += provider.weight;
      if (hash < cumulativeWeight) {
        return `${provider.provider}-${provider.models[0].replace(/[^a-z0-9]/gi, '')}`;
      }
    }
    
    // Fallback to first provider
    const firstProvider = experiment.config.providers[0];
    return `${firstProvider.provider}-${firstProvider.models[0].replace(/[^a-z0-9]/gi, '')}`;
  }

  getProviderForVariant(experiment: ActiveExperiment, variantId: string): { provider: string; model: string } | null {
    for (const providerConfig of experiment.config.providers) {
      const expectedVariantId = `${providerConfig.provider}-${providerConfig.models[0].replace(/[^a-z0-9]/gi, '')}`;
      if (variantId === expectedVariantId) {
        return {
          provider: providerConfig.provider,
          model: providerConfig.models[0]
        };
      }
    }
    return null;
  }

  startTracking(
    experimentId: string,
    variantId: string,
    provider: string,
    model: string,
    requestId: string,
    userId: string,
    teamId?: string
  ): void {
    const trackingEntry: ExperimentTrackingData = {
      experimentId,
      variantId,
      provider,
      model,
      requestId,
      userId,
      teamId,
      startTime: Date.now(),
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
      latency: 0,
      success: false,
    };

    this.trackingData.push(trackingEntry);
  }

  completeTracking(
    requestId: string,
    inputTokens: number,
    outputTokens: number,
    cost: number,
    success: boolean,
    errorMessage?: string,
    qualityScore?: number
  ): void {
    const entry = this.trackingData.find(d => d.requestId === requestId);
    if (!entry) return;

    entry.endTime = Date.now();
    entry.latency = entry.endTime - entry.startTime;
    entry.inputTokens = inputTokens;
    entry.outputTokens = outputTokens;
    entry.cost = cost;
    entry.success = success;
    entry.errorMessage = errorMessage;
    entry.qualityScore = qualityScore;

    // In production, this would be sent to analytics/database
    this.saveTrackingData(entry);
  }

  private async saveTrackingData(data: ExperimentTrackingData): Promise<void> {
    // In production, save to database or analytics service
    console.log('Experiment tracking data:', {
      experiment: data.experimentId,
      variant: data.variantId,
      provider: data.provider,
      latency: data.latency,
      cost: data.cost,
      success: data.success,
    });
  }

  getTrackingData(experimentId: string): ExperimentTrackingData[] {
    return this.trackingData.filter(d => d.experimentId === experimentId);
  }

  calculateExperimentResults(experimentId: string): {
    totalRequests: number;
    variants: { [variantId: string]: {
      requests: number;
      avgCost: number;
      avgLatency: number;
      successRate: number;
      avgQualityScore: number;
    }};
    winner?: string;
  } {
    const data = this.getTrackingData(experimentId);
    const variants: { [variantId: string]: any } = {};

    // Group by variant
    for (const entry of data) {
      if (!variants[entry.variantId]) {
        variants[entry.variantId] = {
          requests: 0,
          totalCost: 0,
          totalLatency: 0,
          successCount: 0,
          totalQualityScore: 0,
          qualityScoreCount: 0,
        };
      }

      const variant = variants[entry.variantId];
      variant.requests++;
      variant.totalCost += entry.cost;
      variant.totalLatency += entry.latency;
      if (entry.success) variant.successCount++;
      if (entry.qualityScore) {
        variant.totalQualityScore += entry.qualityScore;
        variant.qualityScoreCount++;
      }
    }

    // Calculate averages
    const results: any = { totalRequests: data.length, variants: {} };
    let bestVariant = null;
    let bestScore = -1;

    for (const [variantId, variant] of Object.entries(variants) as [string, any][]) {
      results.variants[variantId] = {
        requests: variant.requests,
        avgCost: variant.totalCost / variant.requests,
        avgLatency: variant.totalLatency / variant.requests,
        successRate: variant.successCount / variant.requests,
        avgQualityScore: variant.qualityScoreCount > 0 
          ? variant.totalQualityScore / variant.qualityScoreCount 
          : 0,
      };

      // Simple scoring: lower cost + higher success rate + lower latency
      const score = (1 / results.variants[variantId].avgCost) * 
                   results.variants[variantId].successRate * 
                   (1 / Math.max(results.variants[variantId].avgLatency, 1));
      
      if (score > bestScore) {
        bestScore = score;
        bestVariant = variantId;
      }
    }

    if (bestVariant) {
      results.winner = bestVariant;
    }

    return results;
  }
}

// Global experiment tracker instance
export const experimentTracker = new ExperimentTracker();

// Middleware function for Next.js API routes
export function withExperimentTracking(handler: any) {
  return async (req: any, res: any) => {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract user/team info (in production, from JWT or session)
    const userId = req.headers['x-user-id'] || 'user-demo-1';
    const teamId = req.headers['x-team-id'];
    const model = req.body?.model;

    // Check if request should be included in experiment
    const experimentMatch = experimentTracker.shouldIncludeInExperiment(
      userId, teamId, model, 'chat_completion'
    );

    if (experimentMatch) {
      const { experiment, variant } = experimentMatch;
      const providerInfo = experimentTracker.getProviderForVariant(experiment, variant);
      
      if (providerInfo) {
        // Override provider/model for experiment
        req.experimentContext = {
          experimentId: experiment.id,
          variantId: variant,
          provider: providerInfo.provider,
          model: providerInfo.model,
          requestId,
        };

        // Start tracking
        experimentTracker.startTracking(
          experiment.id,
          variant,
          providerInfo.provider,
          providerInfo.model,
          requestId,
          userId,
          teamId
        );
      }
    }

    // Call the original handler
    return handler(req, res);
  };
}

export default experimentTracker;