import { NextRequest, NextResponse } from 'next/server';

// Team Usage Analytics
// Phase 2: Enterprise Features Implementation

interface UsageRecord {
  id: string;
  team_id: string;
  user_id: string;
  timestamp: string;
  provider: string;
  model: string;
  request_type: 'chat_completion' | 'embedding' | 'image_generation';
  tokens_used: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost_usd: number;
  duration_ms: number;
  status: 'success' | 'error' | 'rate_limited';
  metadata: {
    app_id?: string;
    user_agent?: string;
    ip_address?: string;
  };
}

interface UsageAnalytics {
  team_id: string;
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    total_cost_usd: number;
    total_tokens: number;
    avg_response_time_ms: number;
  };
  by_provider: {
    [provider: string]: {
      requests: number;
      cost_usd: number;
      tokens: number;
      avg_response_time_ms: number;
    };
  };
  by_model: {
    [model: string]: {
      requests: number;
      cost_usd: number;
      tokens: number;
      avg_response_time_ms: number;
    };
  };
  by_user: {
    [user_id: string]: {
      email: string;
      requests: number;
      cost_usd: number;
      tokens: number;
    };
  };
  daily_breakdown: {
    date: string;
    requests: number;
    cost_usd: number;
    tokens: number;
  }[];
  cost_center_allocation?: {
    cost_center: string;
    allocated_cost_usd: number;
    percentage: number;
  };
}

// Mock usage data
const usageRecords: UsageRecord[] = [
  {
    id: 'usage-1',
    team_id: 'team-demo-1',
    user_id: 'user-demo-1',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    provider: 'openai',
    model: 'gpt-4o',
    request_type: 'chat_completion',
    tokens_used: {
      prompt_tokens: 150,
      completion_tokens: 300,
      total_tokens: 450,
    },
    cost_usd: 0.0225,
    duration_ms: 2400,
    status: 'success',
    metadata: {
      app_id: 'app-chat-demo',
      user_agent: 'AI-Marketplace-SDK/1.0',
    },
  },
  {
    id: 'usage-2',
    team_id: 'team-demo-1',
    user_id: 'user-demo-2',
    timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    request_type: 'chat_completion',
    tokens_used: {
      prompt_tokens: 200,
      completion_tokens: 500,
      total_tokens: 700,
    },
    cost_usd: 0.021,
    duration_ms: 3200,
    status: 'success',
    metadata: {
      app_id: 'app-content-generator',
    },
  },
  {
    id: 'usage-3',
    team_id: 'team-demo-1',
    user_id: 'user-demo-1',
    timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
    provider: 'google',
    model: 'gemini-1.5-pro',
    request_type: 'chat_completion',
    tokens_used: {
      prompt_tokens: 100,
      completion_tokens: 200,
      total_tokens: 300,
    },
    cost_usd: 0.0045,
    duration_ms: 1800,
    status: 'success',
    metadata: {
      app_id: 'app-code-assistant',
    },
  },
];

// Mock team data
const teams = [
  {
    id: 'team-demo-1',
    name: 'Demo Enterprise Team',
    owner_id: 'user-demo-1',
    settings: {
      cost_center: 'AI-RESEARCH-DEPT',
    },
    members: [
      { user_id: 'user-demo-1', email: 'admin@company.com', role: 'owner' },
      { user_id: 'user-demo-2', email: 'developer@company.com', role: 'member' },
    ],
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

function hasPermission(team: any, user_id: string, action: string): boolean {
  const member = team.members.find((m: any) => m.user_id === user_id);
  if (!member) return false;
  
  switch (action) {
    case 'view_usage':
      return true; // All team members can view usage
    case 'export_usage':
      return member.role === 'owner' || member.role === 'admin';
    default:
      return false;
  }
}

function calculateUsageAnalytics(teamId: string, startDate: Date, endDate: Date): UsageAnalytics {
  const teamUsage = usageRecords.filter(record => 
    record.team_id === teamId &&
    new Date(record.timestamp) >= startDate &&
    new Date(record.timestamp) <= endDate
  );

  const team = teams.find(t => t.id === teamId);
  
  const summary = {
    total_requests: teamUsage.length,
    successful_requests: teamUsage.filter(r => r.status === 'success').length,
    failed_requests: teamUsage.filter(r => r.status !== 'success').length,
    total_cost_usd: teamUsage.reduce((sum, r) => sum + r.cost_usd, 0),
    total_tokens: teamUsage.reduce((sum, r) => sum + r.tokens_used.total_tokens, 0),
    avg_response_time_ms: teamUsage.length > 0 
      ? teamUsage.reduce((sum, r) => sum + r.duration_ms, 0) / teamUsage.length 
      : 0,
  };

  const by_provider: { [key: string]: any } = {};
  const by_model: { [key: string]: any } = {};
  const by_user: { [key: string]: any } = {};

  teamUsage.forEach(record => {
    // By provider
    if (!by_provider[record.provider]) {
      by_provider[record.provider] = {
        requests: 0,
        cost_usd: 0,
        tokens: 0,
        response_times: [],
      };
    }
    by_provider[record.provider].requests++;
    by_provider[record.provider].cost_usd += record.cost_usd;
    by_provider[record.provider].tokens += record.tokens_used.total_tokens;
    by_provider[record.provider].response_times.push(record.duration_ms);

    // By model
    if (!by_model[record.model]) {
      by_model[record.model] = {
        requests: 0,
        cost_usd: 0,
        tokens: 0,
        response_times: [],
      };
    }
    by_model[record.model].requests++;
    by_model[record.model].cost_usd += record.cost_usd;
    by_model[record.model].tokens += record.tokens_used.total_tokens;
    by_model[record.model].response_times.push(record.duration_ms);

    // By user
    const member = team?.members.find(m => m.user_id === record.user_id);
    if (!by_user[record.user_id]) {
      by_user[record.user_id] = {
        email: member?.email || 'unknown@example.com',
        requests: 0,
        cost_usd: 0,
        tokens: 0,
      };
    }
    by_user[record.user_id].requests++;
    by_user[record.user_id].cost_usd += record.cost_usd;
    by_user[record.user_id].tokens += record.tokens_used.total_tokens;
  });

  // Calculate averages
  Object.keys(by_provider).forEach(provider => {
    const times = by_provider[provider].response_times;
    by_provider[provider].avg_response_time_ms = times.reduce((a: number, b: number) => a + b, 0) / times.length;
    delete by_provider[provider].response_times;
  });

  Object.keys(by_model).forEach(model => {
    const times = by_model[model].response_times;
    by_model[model].avg_response_time_ms = times.reduce((a: number, b: number) => a + b, 0) / times.length;
    delete by_model[model].response_times;
  });

  // Daily breakdown
  const daily_breakdown: { [key: string]: any } = {};
  teamUsage.forEach(record => {
    const date = record.timestamp.split('T')[0];
    if (!daily_breakdown[date]) {
      daily_breakdown[date] = {
        date,
        requests: 0,
        cost_usd: 0,
        tokens: 0,
      };
    }
    daily_breakdown[date].requests++;
    daily_breakdown[date].cost_usd += record.cost_usd;
    daily_breakdown[date].tokens += record.tokens_used.total_tokens;
  });

  return {
    team_id: teamId,
    period: {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    },
    summary,
    by_provider,
    by_model,
    by_user,
    daily_breakdown: Object.values(daily_breakdown),
    ...(team?.settings?.cost_center && {
      cost_center_allocation: {
        cost_center: team.settings.cost_center,
        allocated_cost_usd: summary.total_cost_usd,
        percentage: 100,
      },
    }),
  };
}

// GET /v1/teams/:teamId/usage - Get team usage analytics
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

    if (!hasPermission(team, user.user_id, 'view_usage')) {
      return NextResponse.json(
        { error: { message: 'Access denied', type: 'permission_error' } },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('start_date');
    const endDateParam = searchParams.get('end_date');
    const format = searchParams.get('format') || 'json';

    // Default to last 30 days if no dates provided
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam ? new Date(startDateParam) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const analytics = calculateUsageAnalytics(params.teamId, startDate, endDate);

    if (format === 'csv') {
      // Generate CSV export
      const csv = generateCSVReport(analytics);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="team-${params.teamId}-usage-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Team usage analytics error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}

function generateCSVReport(analytics: UsageAnalytics): string {
  const headers = ['Date', 'Provider', 'Model', 'Requests', 'Cost (USD)', 'Tokens'];
  const rows = [headers.join(',')];

  // Add daily breakdown data
  analytics.daily_breakdown.forEach(day => {
    Object.keys(analytics.by_provider).forEach(provider => {
      Object.keys(analytics.by_model).forEach(model => {
        rows.push([
          day.date,
          provider,
          model,
          analytics.by_provider[provider].requests.toString(),
          analytics.by_provider[provider].cost_usd.toFixed(4),
          analytics.by_provider[provider].tokens.toString(),
        ].join(','));
      });
    });
  });

  return rows.join('\n');
}