import { NextRequest, NextResponse } from 'next/server';

// Experiment Control Endpoints
// POST /v1/experiments/:experimentId/control - Control experiment lifecycle

interface ExperimentControlRequest {
  action: 'start' | 'pause' | 'resume' | 'stop' | 'archive';
  reason?: string;
  force?: boolean;
}

interface ExperimentControlResponse {
  experiment_id: string;
  action: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  message: string;
  timestamp: string;
  next_actions?: string[];
}

// Mock experiments storage (shared with other experiment endpoints)
let experiments: any[] = [
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

function hasExperimentAccess(experiment: any, user_id: string): boolean {
  return experiment.created_by === user_id || user_id === 'user-demo-1';
}

function validateStatusTransition(currentStatus: string, action: string): { valid: boolean; newStatus?: string; error?: string } {
  const transitions: { [key: string]: { [action: string]: string } } = {
    'draft': {
      'start': 'running',
      'archive': 'archived',
    },
    'running': {
      'pause': 'paused',
      'stop': 'completed',
    },
    'paused': {
      'resume': 'running',
      'stop': 'completed',
      'archive': 'archived',
    },
    'completed': {
      'archive': 'archived',
    },
    'archived': {
      // No valid transitions from archived state
    },
  };

  const validTransitions = transitions[currentStatus] || {};
  const newStatus = validTransitions[action];
  
  if (!newStatus) {
    return {
      valid: false,
      error: `Cannot ${action} experiment in ${currentStatus} status. Valid actions: ${Object.keys(validTransitions).join(', ') || 'none'}`
    };
  }

  return { valid: true, newStatus };
}

function getNextActions(status: string): string[] {
  const actionMap: { [key: string]: string[] } = {
    'draft': ['start', 'archive'],
    'running': ['pause', 'stop'],
    'paused': ['resume', 'stop', 'archive'],
    'completed': ['archive'],
    'archived': [], // No actions available
  };

  return actionMap[status] || [];
}

function performPreflightChecks(experiment: any, action: string): { passed: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (action === 'start') {
    // Check experiment configuration
    if (!experiment.config.providers || experiment.config.providers.length < 2) {
      errors.push('Experiment requires at least 2 provider variants');
    }

    const totalWeight = experiment.config.providers.reduce((sum: number, p: any) => sum + p.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      errors.push('Provider weights must sum to 100%');
    }

    if (experiment.config.traffic_split < 1) {
      warnings.push('Low traffic split may result in insufficient data');
    }

    if (experiment.config.sample_size_target < 100) {
      warnings.push('Sample size target is low for statistical significance');
    }
  }

  if (action === 'stop') {
    // Check if experiment has sufficient data
    if (experiment.results?.total_requests < 30) {
      warnings.push('Stopping experiment with limited data may not provide reliable results');
    }
  }

  return {
    passed: errors.length === 0,
    warnings,
    errors,
  };
}

export async function POST(req: NextRequest, { params }: { params: { experimentId: string } }) {
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

    const body: ExperimentControlRequest = await req.json();
    
    if (!body.action) {
      return NextResponse.json(
        { error: { message: 'Action is required', type: 'validation_error' } },
        { status: 400 }
      );
    }

    // Validate status transition
    const transition = validateStatusTransition(experiment.status, body.action);
    if (!transition.valid) {
      return NextResponse.json(
        { error: { message: transition.error, type: 'validation_error' } },
        { status: 400 }
      );
    }

    // Perform preflight checks
    const preflightChecks = performPreflightChecks(experiment, body.action);
    if (!preflightChecks.passed && !body.force) {
      return NextResponse.json(
        {
          error: {
            message: 'Preflight checks failed',
            type: 'validation_error',
            details: {
              errors: preflightChecks.errors,
              warnings: preflightChecks.warnings,
              suggestion: 'Use force=true to override warnings, but errors must be resolved',
            },
          }
        },
        { status: 400 }
      );
    }

    // Update experiment status
    const timestamp = new Date().toISOString();
    experiment.status = transition.newStatus;
    experiment.updated_at = timestamp;

    // Handle specific actions
    switch (body.action) {
      case 'start':
        if (!experiment.results) {
          experiment.results = {
            total_requests: 0,
            start_date: timestamp,
            statistical_significance: 0,
            variants: {},
            recommendations: [],
          };
        } else {
          experiment.results.start_date = timestamp;
        }
        break;

      case 'stop':
        if (experiment.results) {
          experiment.results.end_date = timestamp;
        }
        break;

      case 'pause':
        // Add pause timestamp to experiment metadata
        if (!experiment.metadata) experiment.metadata = {};
        experiment.metadata.paused_at = timestamp;
        experiment.metadata.pause_reason = body.reason;
        break;

      case 'resume':
        // Remove pause metadata
        if (experiment.metadata) {
          delete experiment.metadata.paused_at;
          delete experiment.metadata.pause_reason;
        }
        break;

      case 'archive':
        if (!experiment.metadata) experiment.metadata = {};
        experiment.metadata.archived_at = timestamp;
        experiment.metadata.archive_reason = body.reason;
        break;
    }

    // Save updated experiment
    experiments[experimentIndex] = experiment;

    const response: ExperimentControlResponse = {
      experiment_id: experiment.id,
      action: body.action,
      status: experiment.status,
      message: getActionMessage(body.action, experiment.name),
      timestamp,
      next_actions: getNextActions(experiment.status),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Experiment control error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}

function getActionMessage(action: string, experimentName: string): string {
  const messages: { [key: string]: string } = {
    'start': `Experiment "${experimentName}" has been started and is now collecting data`,
    'pause': `Experiment "${experimentName}" has been paused and will not collect new data`,
    'resume': `Experiment "${experimentName}" has been resumed and is collecting data again`,
    'stop': `Experiment "${experimentName}" has been completed and results are final`,
    'archive': `Experiment "${experimentName}" has been archived`,
  };

  return messages[action] || `Action ${action} completed for experiment "${experimentName}"`;
}

// GET endpoint to check experiment status and available actions
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

    return NextResponse.json({
      experiment_id: experiment.id,
      name: experiment.name,
      status: experiment.status,
      created_at: experiment.created_at,
      updated_at: experiment.updated_at,
      next_actions: getNextActions(experiment.status),
      runtime_info: {
        duration_seconds: experiment.results?.start_date 
          ? Math.floor((Date.now() - new Date(experiment.results.start_date).getTime()) / 1000)
          : 0,
        total_requests: experiment.results?.total_requests || 0,
        last_request: experiment.results?.last_request_at || null,
      },
      metadata: experiment.metadata || {},
    });

  } catch (error) {
    console.error('Experiment control status error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}