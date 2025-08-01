import { NextRequest, NextResponse } from 'next/server';

// A/B Testing Framework for Provider Optimization
// Phase 2 Milestone: Intelligent provider routing and performance optimization

interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
  created_by: string;
  config: ExperimentConfig;
  results: ExperimentResults;
}

interface ExperimentConfig {
  type: 'provider_comparison' | 'cost_optimization' | 'quality_test' | 'latency_test';
  traffic_split: number; // Percentage of traffic to include in experiment (0-100)
  providers: {
    provider: string;
    weight: number; // Traffic allocation percentage
    models: string[];
  }[];
  success_metrics: {
    primary: 'cost' | 'latency' | 'quality' | 'user_satisfaction';
    secondary?: string[];
  };
  duration_days: number;
  sample_size_target: number;
  confidence_threshold: number; // Statistical significance threshold (e.g., 0.95)
  filters: {
    teams?: string[]; // Limit to specific teams
    models?: string[]; // Limit to specific models
    request_types?: string[]; // chat_completion, embedding, etc.
  };
}

interface ExperimentResults {
  total_requests: number;
  start_date: string;
  end_date?: string;
  statistical_significance: number;
  winner?: string;
  variants: {
    [variantId: string]: VariantResults;
  };
  recommendations: string[];
}

interface VariantResults {
  provider: string;
  requests: number;
  avg_cost_usd: number;
  avg_latency_ms: number;
  success_rate: number;
  quality_score: number;
  user_satisfaction: number;
  cost_per_token: number;
  confidence_interval: {
    lower: number;
    upper: number;
    metric: string;
  };
}

interface CreateExperimentRequest {
  name: string;
  description: string;
  config: ExperimentConfig;
}

interface UpdateExperimentRequest {
  name?: string;
  description?: string;
  status?: Experiment['status'];
  config?: Partial<ExperimentConfig>;
}

// Mock experiments storage (in production, this would be a database)
let experiments: Experiment[] = [
  {
    id: 'exp-cost-optimization-demo',
    name: 'Cost Optimization: GPT-4 vs Claude vs Gemini',
    description: 'Compare cost-effectiveness of different providers for general chat completions',
    status: 'completed',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'user-demo-1',
    config: {
      type: 'cost_optimization',
      traffic_split: 25,
      providers: [
        { provider: 'openai', weight: 33, models: ['gpt-4o'] },
        { provider: 'anthropic', weight: 34, models: ['claude-3-5-sonnet-20241022'] },
        { provider: 'google', weight: 33, models: ['gemini-1.5-pro'] },
      ],
      success_metrics: {
        primary: 'cost',
        secondary: ['quality', 'latency'],
      },
      duration_days: 7,
      sample_size_target: 1000,
      confidence_threshold: 0.95,
      filters: {
        request_types: ['chat_completion'],
      },
    },
    results: {
      total_requests: 1247,
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date().toISOString(),
      statistical_significance: 0.97,
      winner: 'google',
      variants: {
        'openai-gpt4o': {
          provider: 'openai',
          requests: 412,
          avg_cost_usd: 0.0234,
          avg_latency_ms: 2400,
          success_rate: 0.98,
          quality_score: 0.92,
          user_satisfaction: 4.2,
          cost_per_token: 0.00005,
          confidence_interval: {
            lower: 0.0220,
            upper: 0.0248,
            metric: 'avg_cost_usd',
          },
        },
        'anthropic-claude35': {
          provider: 'anthropic',
          requests: 424,
          avg_cost_usd: 0.0198,
          avg_latency_ms: 3100,
          success_rate: 0.97,
          quality_score: 0.94,
          user_satisfaction: 4.3,
          cost_per_token: 0.000042,
          confidence_interval: {
            lower: 0.0186,
            upper: 0.0210,
            metric: 'avg_cost_usd',
          },
        },
        'google-gemini15pro': {
          provider: 'google',
          requests: 411,
          avg_cost_usd: 0.0156,
          avg_latency_ms: 1800,
          success_rate: 0.96,
          quality_score: 0.89,
          user_satisfaction: 4.1,
          cost_per_token: 0.000034,
          confidence_interval: {
            lower: 0.0144,
            upper: 0.0168,
            metric: 'avg_cost_usd',
          },
        },
      },
      recommendations: [
        'Google Gemini 1.5 Pro provides 33% cost savings vs OpenAI GPT-4o',
        'Anthropic Claude offers best quality scores but 29% higher latency',
        'Consider Google for cost-sensitive applications, Claude for quality-critical tasks',
        'All providers maintain >96% success rates - reliability is consistent',
      ],
    },
  },
];

function getUserFromRequest(req: NextRequest): { user_id: string; email: string } | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  
  return {
    user_id: 'user-demo-1',
    email: 'admin@company.com',
  };
}

function generateExperimentId(): string {
  return `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function calculateStatisticalSignificance(variant1: VariantResults, variant2: VariantResults): number {
  // Simplified statistical significance calculation
  // In production, would use proper statistical tests (t-test, z-test)
  const n1 = variant1.requests;
  const n2 = variant2.requests;
  const mean1 = variant1.avg_cost_usd;
  const mean2 = variant2.avg_cost_usd;
  
  // Mock calculation - would use actual variance and proper statistical testing
  const pooledStdError = Math.sqrt((0.001 / n1) + (0.001 / n2)); // Simplified
  const tStatistic = Math.abs(mean1 - mean2) / pooledStdError;
  
  // Convert to confidence level (simplified)
  return Math.min(0.99, Math.max(0.5, tStatistic / 3));
}

// GET /v1/experiments - List experiments
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let filteredExperiments = experiments;

    if (status) {
      filteredExperiments = filteredExperiments.filter(exp => exp.status === status);
    }

    if (type) {
      filteredExperiments = filteredExperiments.filter(exp => exp.config.type === type);
    }

    return NextResponse.json({
      object: 'list',
      data: filteredExperiments,
      total: filteredExperiments.length,
    });

  } catch (error) {
    console.error('Experiments list error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}

// POST /v1/experiments - Create new experiment
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    const body: CreateExperimentRequest = await req.json();

    if (!body.name || !body.config) {
      return NextResponse.json(
        { error: { message: 'Name and config are required', type: 'validation_error' } },
        { status: 400 }
      );
    }

    // Validate provider weights sum to 100
    const totalWeight = body.config.providers.reduce((sum, p) => sum + p.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return NextResponse.json(
        { error: { message: 'Provider weights must sum to 100%', type: 'validation_error' } },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newExperiment: Experiment = {
      id: generateExperimentId(),
      name: body.name,
      description: body.description || '',
      status: 'draft',
      created_at: now,
      updated_at: now,
      created_by: user.user_id,
      config: body.config,
      results: {
        total_requests: 0,
        start_date: now,
        statistical_significance: 0,
        variants: {},
        recommendations: [],
      },
    };

    experiments.push(newExperiment);

    return NextResponse.json(newExperiment, { status: 201 });

  } catch (error) {
    console.error('Experiment creation error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}