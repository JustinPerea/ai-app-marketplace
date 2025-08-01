import { NextRequest, NextResponse } from 'next/server';

// Enhanced Team Billing Management
// Phase 2: Advanced Enterprise Features

interface BillingPeriod {
  start_date: string;
  end_date: string;
  total_cost: number;
  total_requests: number;
  total_tokens: {
    input: number;
    output: number;
  };
  breakdown_by_provider: {
    [provider: string]: {
      cost: number;
      requests: number;
      tokens: { input: number; output: number };
      models: { [model: string]: { cost: number; requests: number } };
    };
  };
  breakdown_by_member: {
    [user_id: string]: {
      email: string;
      cost: number;
      requests: number;
      top_models: string[];
    };
  };
}

interface BudgetAlert {
  id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'rate_limit_warning' | 'unusual_usage';
  threshold: number;
  current_value: number;
  message: string;
  created_at: string;
  acknowledged: boolean;
}

interface CostPrediction {
  current_month_projection: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: string[];
  recommendations: string[];
}

interface TeamBillingSettings {
  monthly_budget: number;
  budget_alerts: {
    warning_threshold: number; // Percentage (e.g., 80 for 80%)
    exceeded_action: 'notify' | 'restrict' | 'suspend';
  };
  cost_allocation: {
    method: 'equal' | 'usage_based' | 'role_based';
    custom_rates?: { [role: string]: number };
  };
  reporting: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    include_member_breakdown: boolean;
  };
}

// Mock teams data (shared with parent route)
let teams: any[] = [
  {
    id: 'team-demo-1',
    name: 'Demo Enterprise Team',
    description: 'Sample enterprise team for demonstration',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: 'user-demo-1',
    settings: {
      model_access: ['gpt-4o', 'claude-3-5-sonnet-20241022', 'gemini-1.5-pro'],
      monthly_budget: 1000,
      rate_limits: {
        requests_per_minute: 100,
        requests_per_day: 10000,
      },
      allowed_providers: ['openai', 'anthropic', 'google'],
      cost_center: 'AI-RESEARCH-DEPT',
    },
    members: [
      {
        user_id: 'user-demo-1',
        email: 'admin@company.com',
        role: 'owner',
        joined_at: new Date().toISOString(),
        permissions: {
          can_create_apps: true,
          can_manage_keys: true,
          can_view_usage: true,
          can_manage_members: true,
        },
      },
      {
        user_id: 'user-demo-2',
        email: 'developer@company.com',
        role: 'member',
        joined_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: {
          can_create_apps: true,
          can_manage_keys: false,
          can_view_usage: true,
          can_manage_members: false,
        },
      },
    ],
    billing: {
      settings: {
        monthly_budget: 1000,
        budget_alerts: {
          warning_threshold: 80,
          exceeded_action: 'notify',
        },
        cost_allocation: {
          method: 'usage_based',
        },
        reporting: {
          frequency: 'weekly',
          recipients: ['admin@company.com'],
          include_member_breakdown: true,
        },
      },
      current_period: {
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
        total_cost: 247.89,
        total_requests: 15420,
        total_tokens: {
          input: 890456,
          output: 234567,
        },
        breakdown_by_provider: {
          openai: {
            cost: 156.42,
            requests: 8920,
            tokens: { input: 567890, output: 123456 },
            models: {
              'gpt-4o': { cost: 134.20, requests: 6780 },
              'gpt-4o-mini': { cost: 22.22, requests: 2140 },
            },
          },
          anthropic: {
            cost: 67.89,
            requests: 4200,
            tokens: { input: 234567, output: 89012 },
            models: {
              'claude-3-5-sonnet-20241022': { cost: 67.89, requests: 4200 },
            },
          },
          google: {
            cost: 23.58,
            requests: 2300,
            tokens: { input: 87999, output: 22099 },
            models: {
              'gemini-1.5-pro': { cost: 18.90, requests: 1800 },
              'gemini-1.5-flash': { cost: 4.68, requests: 500 },
            },
          },
        },
        breakdown_by_member: {
          'user-demo-1': {
            email: 'admin@company.com',
            cost: 178.45,
            requests: 11200,
            top_models: ['gpt-4o', 'claude-3-5-sonnet-20241022', 'gemini-1.5-pro'],
          },
          'user-demo-2': {
            email: 'developer@company.com',
            cost: 69.44,
            requests: 4220,
            top_models: ['gpt-4o-mini', 'gemini-1.5-flash'],
          },
        },
      },
      alerts: [
        {
          id: 'alert-1',
          type: 'budget_warning',
          threshold: 80,
          current_value: 82.3,
          message: 'Team has exceeded 80% of monthly budget ($800 of $1000)',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          acknowledged: false,
        },
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

function hasTeamAccess(team: any, user_id: string, action: string): boolean {
  const member = team.members.find((m: any) => m.user_id === user_id);
  if (!member) return false;
  
  switch (action) {
    case 'view_billing':
      return member.permissions.can_view_usage;
    case 'manage_billing':
      return member.role === 'owner' || member.role === 'admin';
    default:
      return false;
  }
}

function generateCostPrediction(currentPeriod: BillingPeriod): CostPrediction {
  const currentDate = new Date();
  const startDate = new Date(currentPeriod.start_date);
  const endDate = new Date(currentPeriod.end_date);
  
  const daysPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const progressRatio = daysPassed / totalDays;
  
  const dailyAverageCost = currentPeriod.total_cost / Math.max(daysPassed, 1);
  const projectedMonthlyCost = dailyAverageCost * totalDays;
  
  // Simple trend analysis
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (projectedMonthlyCost > currentPeriod.total_cost * 1.2) trend = 'increasing';
  else if (projectedMonthlyCost < currentPeriod.total_cost * 0.8) trend = 'decreasing';
  
  const recommendations: string[] = [];
  if (projectedMonthlyCost > 800) {
    recommendations.push('Consider switching to more cost-effective models like GPT-4o-mini or Gemini Flash');
  }
  if (currentPeriod.breakdown_by_provider.openai?.cost > projectedMonthlyCost * 0.7) {
    recommendations.push('OpenAI usage is high - explore Claude or Gemini alternatives for cost savings');
  }
  
  return {
    current_month_projection: Math.round(projectedMonthlyCost * 100) / 100,
    confidence: Math.min(0.95, progressRatio * 1.2), // Higher confidence as month progresses
    trend,
    factors: [
      `${daysPassed} days of ${totalDays} completed (${Math.round(progressRatio * 100)}%)`,
      `Daily average: $${dailyAverageCost.toFixed(2)}`,
      `Top provider: ${Object.entries(currentPeriod.breakdown_by_provider).sort((a, b) => b[1].cost - a[1].cost)[0][0]}`,
    ],
    recommendations,
  };
}

// GET /v1/teams/:teamId/billing - Get team billing information
export async function GET(req: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    const team = teams.find(t => t.id === params.teamId);
    if (!team) {
      return NextResponse.json(
        { error: { message: 'Team not found', type: 'not_found_error' } },
        { status: 404 }
      );
    }

    if (!hasTeamAccess(team, user.user_id, 'view_billing')) {
      return NextResponse.json(
        { error: { message: 'Access denied', type: 'permission_error' } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'current';
    
    if (period === 'current') {
      const prediction = generateCostPrediction(team.billing.current_period);
      
      return NextResponse.json({
        team_id: team.id,
        team_name: team.name,
        billing_period: team.billing.current_period,
        budget_info: {
          monthly_budget: team.billing.settings.monthly_budget,
          spent: team.billing.current_period.total_cost,
          remaining: team.billing.settings.monthly_budget - team.billing.current_period.total_cost,
          percentage_used: Math.round((team.billing.current_period.total_cost / team.billing.settings.monthly_budget) * 100),
        },
        cost_prediction: prediction,
        active_alerts: team.billing.alerts.filter((a: BudgetAlert) => !a.acknowledged),
        settings: team.billing.settings,
        cost_center: team.settings.cost_center,
      });
    }

    return NextResponse.json(
      { error: { message: 'Invalid period parameter', type: 'validation_error' } },
      { status: 400 }
    );

  } catch (error) {
    console.error('Team billing error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}

// POST /v1/teams/:teamId/billing/alerts/:alertId/acknowledge - Acknowledge alert
export async function POST(req: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    const team = teams.find(t => t.id === params.teamId);
    if (!team) {
      return NextResponse.json(
        { error: { message: 'Team not found', type: 'not_found_error' } },
        { status: 404 }
      );
    }

    if (!hasTeamAccess(team, user.user_id, 'manage_billing')) {
      return NextResponse.json(
        { error: { message: 'Access denied', type: 'permission_error' } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, alert_id } = body;

    if (action === 'acknowledge_alert' && alert_id) {
      const alert = team.billing.alerts.find((a: BudgetAlert) => a.id === alert_id);
      if (alert) {
        alert.acknowledged = true;
        return NextResponse.json({ 
          message: 'Alert acknowledged',
          alert_id: alert_id,
          timestamp: new Date().toISOString(),
        });
      }
      return NextResponse.json(
        { error: { message: 'Alert not found', type: 'not_found_error' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: { message: 'Invalid action', type: 'validation_error' } },
      { status: 400 }
    );

  } catch (error) {
    console.error('Team billing action error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}

// PUT /v1/teams/:teamId/billing/settings - Update billing settings
export async function PUT(req: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    const team = teams.find(t => t.id === params.teamId);
    if (!team) {
      return NextResponse.json(
        { error: { message: 'Team not found', type: 'not_found_error' } },
        { status: 404 }
      );
    }

    if (!hasTeamAccess(team, user.user_id, 'manage_billing')) {
      return NextResponse.json(
        { error: { message: 'Access denied', type: 'permission_error' } },
        { status: 403 }
      );
    }

    const body: Partial<TeamBillingSettings> = await req.json();

    // Update billing settings
    if (body.monthly_budget) {
      team.billing.settings.monthly_budget = body.monthly_budget;
      team.settings.monthly_budget = body.monthly_budget; // Sync with main settings
    }
    
    if (body.budget_alerts) {
      team.billing.settings.budget_alerts = {
        ...team.billing.settings.budget_alerts,
        ...body.budget_alerts,
      };
    }

    if (body.cost_allocation) {
      team.billing.settings.cost_allocation = {
        ...team.billing.settings.cost_allocation,
        ...body.cost_allocation,
      };
    }

    if (body.reporting) {
      team.billing.settings.reporting = {
        ...team.billing.settings.reporting,
        ...body.reporting,
      };
    }

    team.updated_at = new Date().toISOString();

    return NextResponse.json({
      message: 'Billing settings updated successfully',
      settings: team.billing.settings,
      updated_at: team.updated_at,
    });

  } catch (error) {
    console.error('Team billing settings update error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}