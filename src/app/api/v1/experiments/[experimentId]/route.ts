import { NextRequest, NextResponse } from 'next/server';

// Individual Experiment Management
// Phase 2 Milestone: A/B Testing Framework

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
  traffic_split: number;
  providers: {
    provider: string;
    weight: number;
    models: string[];
  }[];
  success_metrics: {
    primary: 'cost' | 'latency' | 'quality' | 'user_satisfaction';
    secondary?: string[];
  };
  duration_days: number;
  sample_size_target: number;
  confidence_threshold: number;
  filters: {
    teams?: string[];
    models?: string[];
    request_types?: string[];
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

interface UpdateExperimentRequest {
  name?: string;
  description?: string;
  status?: Experiment['status'];
  config?: Partial<ExperimentConfig>;
}

// Mock experiments storage (shared with main route)
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

function hasExperimentAccess(experiment: Experiment, user_id: string): boolean {
  // In production, check team membership, permissions, etc.
  return experiment.created_by === user_id || user_id === 'user-demo-1';
}

// GET /v1/experiments/:experimentId - Get specific experiment
export async function GET(req: NextRequest, { params }: { params: { experimentId: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    const experiment = experiments.find(exp => exp.id === params.experimentId);
    if (!experiment) {
      return NextResponse.json(
        { error: { message: 'Experiment not found', type: 'not_found_error' } },
        { status: 404 }
      );
    }

    if (!hasExperimentAccess(experiment, user.user_id)) {
      return NextResponse.json(
        { error: { message: 'Access denied', type: 'permission_error' } },
        { status: 403 }
      );
    }

    return NextResponse.json(experiment);

  } catch (error) {
    console.error('Experiment get error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}

// PUT /v1/experiments/:experimentId - Update experiment
export async function PUT(req: NextRequest, { params }: { params: { experimentId: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    const experimentIndex = experiments.findIndex(exp => exp.id === params.experimentId);
    if (experimentIndex === -1) {
      return NextResponse.json(
        { error: { message: 'Experiment not found', type: 'not_found_error' } },
        { status: 404 }
      );
    }

    const experiment = experiments[experimentIndex];
    if (!hasExperimentAccess(experiment, user.user_id)) {
      return NextResponse.json(
        { error: { message: 'Access denied', type: 'permission_error' } },
        { status: 403 }
      );
    }

    const body: UpdateExperimentRequest = await req.json();

    // Validate status transitions
    if (body.status && experiment.status === 'completed' && body.status !== 'completed') {
      return NextResponse.json(
        { error: { message: 'Cannot modify completed experiment', type: 'validation_error' } },
        { status: 400 }
      );
    }

    // Update experiment
    const updatedExperiment: Experiment = {
      ...experiment,
      ...(body.name && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status && { status: body.status }),
      updated_at: new Date().toISOString(),
      config: body.config ? { ...experiment.config, ...body.config } : experiment.config,
    };

    // Handle status changes
    if (body.status === 'running' && experiment.status === 'draft') {
      updatedExperiment.results.start_date = new Date().toISOString();
    } else if (body.status === 'completed' && experiment.status === 'running') {
      updatedExperiment.results.end_date = new Date().toISOString();
    }

    experiments[experimentIndex] = updatedExperiment;

    return NextResponse.json(updatedExperiment);

  } catch (error) {
    console.error('Experiment update error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}

// DELETE /v1/experiments/:experimentId - Delete experiment
export async function DELETE(req: NextRequest, { params }: { params: { experimentId: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    const experimentIndex = experiments.findIndex(exp => exp.id === params.experimentId);
    if (experimentIndex === -1) {
      return NextResponse.json(
        { error: { message: 'Experiment not found', type: 'not_found_error' } },
        { status: 404 }
      );
    }

    const experiment = experiments[experimentIndex];
    if (!hasExperimentAccess(experiment, user.user_id)) {
      return NextResponse.json(
        { error: { message: 'Access denied', type: 'permission_error' } },
        { status: 403 }
      );
    }

    // Prevent deletion of running experiments
    if (experiment.status === 'running') {
      return NextResponse.json(
        { error: { message: 'Cannot delete running experiment. Pause or complete first.', type: 'validation_error' } },
        { status: 400 }
      );
    }

    experiments.splice(experimentIndex, 1);

    return NextResponse.json({ message: 'Experiment deleted successfully' });

  } catch (error) {
    console.error('Experiment delete error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}