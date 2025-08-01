import { NextRequest, NextResponse } from 'next/server';

// Advanced Team Analytics and Insights
// Phase 2: Enhanced Team Management Features

interface UsageMetrics {
  requests: {
    total: number;
    by_period: { [date: string]: number };
    by_provider: { [provider: string]: number };
    by_model: { [model: string]: number };
    by_member: { [user_id: string]: number };
  };
  tokens: {
    total_input: number;
    total_output: number;
    by_period: { [date: string]: { input: number; output: number } };
    by_provider: { [provider: string]: { input: number; output: number } };
    efficiency_ratio: number; // output/input ratio
  };
  costs: {
    total: number;
    by_period: { [date: string]: number };
    by_provider: { [provider: string]: number };
    average_per_request: number;
    cost_per_token: number;
  };
  performance: {
    average_latency: number;
    success_rate: number;
    error_rate: number;
    by_provider: {
      [provider: string]: {
        avg_latency: number;
        success_rate: number;
        reliability_score: number;
      };
    };
  };
}

interface TeamInsights {
  efficiency_score: number; // 0-100
  cost_optimization_opportunities: {
    potential_savings: number;
    recommendations: {
      priority: 'high' | 'medium' | 'low';
      category: 'provider_switch' | 'model_optimization' | 'usage_pattern' | 'budget_allocation';
      description: string;
      estimated_monthly_savings: number;
      implementation_effort: 'easy' | 'moderate' | 'complex';
    }[];
  };
  usage_patterns: {
    peak_hours: number[]; // Hours of day (0-23)
    busiest_days: string[]; // Days of week
    seasonal_trends: string[];
    growth_rate: number; // Monthly growth percentage
  };
  member_productivity: {
    [user_id: string]: {
      email: string;
      requests_per_day: number;
      cost_per_request: number;
      preferred_models: string[];
      efficiency_score: number;
      activity_trend: 'increasing' | 'stable' | 'decreasing';
    };
  };
  model_performance_ranking: {
    model: string;
    provider: string;
    usage_share: number;
    cost_efficiency: number;
    performance_score: number;
    recommendation: 'increase' | 'maintain' | 'decrease' | 'replace';
  }[];
}

interface ComplianceReport {
  data_governance: {
    requests_by_region: { [region: string]: number };
    sensitive_data_detection: {
      flagged_requests: number;
      auto_redacted: number;
      manual_review_pending: number;
    };
    retention_compliance: {
      requests_within_policy: number;
      requests_to_purge: number;
      last_purge_date: string;
    };
  };
  access_control: {
    permission_violations: number;
    unauthorized_access_attempts: number;
    role_compliance_score: number;
    last_audit_date: string;
  };
  cost_controls: {
    budget_compliance: {
      within_budget: boolean;
      variance_percentage: number;
      alert_triggers: number;
    };
    rate_limiting: {
      limits_enforced: number;
      violations: number;
      throttled_requests: number;
    };
  };
}

// Mock analytics data
const mockTeamAnalytics = {
  'team-demo-1': {
    usage_metrics: {
      requests: {
        total: 15420,
        by_period: {
          '2025-07-25': 2100,
          '2025-07-26': 2400,
          '2025-07-27': 1800,
          '2025-07-28': 2200,
          '2025-07-29': 2300,
          '2025-07-30': 2400,
          '2025-07-31': 2220,
        },
        by_provider: {
          openai: 8920,
          anthropic: 4200,
          google: 2300,
        },
        by_model: {
          'gpt-4o': 6780,
          'gpt-4o-mini': 2140,
          'claude-3-5-sonnet-20241022': 4200,
          'gemini-1.5-pro': 1800,
          'gemini-1.5-flash': 500,
        },
        by_member: {
          'user-demo-1': 11200,
          'user-demo-2': 4220,
        },
      },
      tokens: {
        total_input: 890456,
        total_output: 234567,
        by_period: {
          '2025-07-25': { input: 127208, output: 33509 },
          '2025-07-26': { input: 144685, output: 38093 },
          '2025-07-27': { input: 108482, output: 28567 },
          '2025-07-28': { input: 132600, output: 34922 },
          '2025-07-29': { input: 138634, output: 36509 },
          '2025-07-30': { input: 144685, output: 38093 },
          '2025-07-31': { input: 134162, output: 35874 },
        },
        by_provider: {
          openai: { input: 567890, output: 123456 },
          anthropic: { input: 234567, output: 89012 },
          google: { input: 87999, output: 22099 },
        },
        efficiency_ratio: 0.263, // 234567 / 890456
      },
      costs: {
        total: 247.89,
        by_period: {
          '2025-07-25': 33.42,
          '2025-07-26': 38.16,
          '2025-07-27': 28.68,
          '2025-07-28': 35.04,
          '2025-07-29': 36.63,
          '2025-07-30': 38.16,
          '2025-07-31': 37.80,
        },
        by_provider: {
          openai: 156.42,
          anthropic: 67.89,
          google: 23.58,
        },
        average_per_request: 0.0161,
        cost_per_token: 0.000220,
      },
      performance: {
        average_latency: 2200,
        success_rate: 0.973,
        error_rate: 0.027,
        by_provider: {
          openai: {
            avg_latency: 2400,
            success_rate: 0.98,
            reliability_score: 0.92,
          },
          anthropic: {
            avg_latency: 3100,
            success_rate: 0.97,
            reliability_score: 0.89,
          },
          google: {
            avg_latency: 1800,
            success_rate: 0.96,
            reliability_score: 0.91,
          },
        },
      },
    },
    insights: {
      efficiency_score: 78,
      cost_optimization_opportunities: {
        potential_savings: 89.34,
        recommendations: [
          {
            priority: 'high',
            category: 'provider_switch',
            description: 'Switch 40% of GPT-4o requests to Claude 3.5 Sonnet for similar quality at 15% lower cost',
            estimated_monthly_savings: 45.20,
            implementation_effort: 'easy',
          },
          {
            priority: 'high',
            category: 'model_optimization',
            description: 'Use GPT-4o-mini for simple tasks instead of GPT-4o (identified 2,100 suitable requests)',
            estimated_monthly_savings: 32.14,
            implementation_effort: 'moderate',
          },
          {
            priority: 'medium',
            category: 'usage_pattern',
            description: 'Implement request batching during peak hours to reduce API overhead',
            estimated_monthly_savings: 12.00,
            implementation_effort: 'complex',
          },
        ],
      },
      usage_patterns: {
        peak_hours: [9, 10, 14, 15, 16], // 9-10 AM, 2-4 PM
        busiest_days: ['Tuesday', 'Wednesday', 'Thursday'],
        seasonal_trends: ['Higher usage during weekdays', 'Decreased usage during weekends'],
        growth_rate: 15.2, // 15.2% monthly growth
      },
      member_productivity: {
        'user-demo-1': {
          email: 'admin@company.com',
          requests_per_day: 373,
          cost_per_request: 0.0159,
          preferred_models: ['gpt-4o', 'claude-3-5-sonnet-20241022'],
          efficiency_score: 82,
          activity_trend: 'stable',
        },
        'user-demo-2': {
          email: 'developer@company.com',
          requests_per_day: 140,
          cost_per_request: 0.0165,
          preferred_models: ['gpt-4o-mini', 'gemini-1.5-flash'],
          efficiency_score: 74,
          activity_trend: 'increasing',
        },
      },
      model_performance_ranking: [
        {
          model: 'gemini-1.5-flash',
          provider: 'google',
          usage_share: 0.032,
          cost_efficiency: 0.95,
          performance_score: 0.89,
          recommendation: 'increase',
        },
        {
          model: 'gpt-4o-mini',
          provider: 'openai',
          usage_share: 0.139,
          cost_efficiency: 0.88,
          performance_score: 0.91,
          recommendation: 'increase',
        },
        {
          model: 'claude-3-5-sonnet-20241022',
          provider: 'anthropic',
          usage_share: 0.272,
          cost_efficiency: 0.83,
          performance_score: 0.94,
          recommendation: 'maintain',
        },
        {
          model: 'gemini-1.5-pro',
          provider: 'google',
          usage_share: 0.117,
          cost_efficiency: 0.76,
          performance_score: 0.89,
          recommendation: 'decrease',
        },
        {
          model: 'gpt-4o',
          provider: 'openai',
          usage_share: 0.440,
          cost_efficiency: 0.65,
          performance_score: 0.92,
          recommendation: 'decrease',
        },
      ],
    },
    compliance: {
      data_governance: {
        requests_by_region: {
          'us-east': 8920,
          'us-west': 4200,
          'eu-central': 2300,
        },
        sensitive_data_detection: {
          flagged_requests: 23,
          auto_redacted: 21,
          manual_review_pending: 2,
        },
        retention_compliance: {
          requests_within_policy: 15397,
          requests_to_purge: 23,
          last_purge_date: '2025-07-15',
        },
      },
      access_control: {
        permission_violations: 0,
        unauthorized_access_attempts: 2,
        role_compliance_score: 0.98,
        last_audit_date: '2025-07-28',
      },
      cost_controls: {
        budget_compliance: {
          within_budget: false,
          variance_percentage: 2.3,
          alert_triggers: 1,
        },
        rate_limiting: {
          limits_enforced: 156,
          violations: 3,
          throttled_requests: 12,
        },
      },
    },
  },
};

function getUserFromRequest(req: NextRequest): { user_id: string; email: string } | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  
  return {
    user_id: 'user-demo-1',
    email: 'admin@company.com',
  };
}

function hasAnalyticsAccess(teamId: string, user_id: string): boolean {
  // In production, check team membership and permissions
  return user_id === 'user-demo-1'; // Demo user has access
}

function generateInsightsSummary(insights: TeamInsights): {
  key_metrics: { [key: string]: any };
  top_recommendations: string[];
  efficiency_rating: string;
} {
  const efficiency_rating = 
    insights.efficiency_score >= 80 ? 'Excellent' :
    insights.efficiency_score >= 70 ? 'Good' :
    insights.efficiency_score >= 60 ? 'Fair' : 'Needs Improvement';

  const top_recommendations = insights.cost_optimization_opportunities.recommendations
    .slice(0, 3)
    .map(rec => rec.description);

  return {
    key_metrics: {
      efficiency_score: insights.efficiency_score,
      potential_savings: insights.cost_optimization_opportunities.potential_savings,
      growth_rate: insights.usage_patterns.growth_rate,
      top_performing_model: insights.model_performance_ranking[0].model,
    },
    top_recommendations,
    efficiency_rating,
  };
}

// GET /v1/teams/:teamId/analytics - Get comprehensive team analytics
export async function GET(req: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    if (!hasAnalyticsAccess(params.teamId, user.user_id)) {
      return NextResponse.json(
        { error: { message: 'Access denied', type: 'permission_error' } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '7d';
    const include = searchParams.get('include')?.split(',') || ['usage', 'insights', 'compliance'];

    const analytics = mockTeamAnalytics[params.teamId as keyof typeof mockTeamAnalytics];
    if (!analytics) {
      return NextResponse.json(
        { error: { message: 'Analytics data not found', type: 'not_found_error' } },
        { status: 404 }
      );
    }

    const response: any = {
      team_id: params.teamId,
      period,
      generated_at: new Date().toISOString(),
    };

    if (include.includes('usage')) {
      response.usage_metrics = analytics.usage_metrics;
    }

    if (include.includes('insights')) {
      response.insights = analytics.insights;
      response.summary = generateInsightsSummary(analytics.insights);
    }

    if (include.includes('compliance')) {
      response.compliance_report = analytics.compliance;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Team analytics error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}

// POST /v1/teams/:teamId/analytics/export - Export analytics report
export async function POST(req: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    if (!hasAnalyticsAccess(params.teamId, user.user_id)) {
      return NextResponse.json(
        { error: { message: 'Access denied', type: 'permission_error' } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { format = 'json', period = '30d', sections = ['all'] } = body;

    const analytics = mockTeamAnalytics[params.teamId as keyof typeof mockTeamAnalytics];
    if (!analytics) {
      return NextResponse.json(
        { error: { message: 'Analytics data not found', type: 'not_found_error' } },
        { status: 404 }
      );
    }

    // Generate export
    const exportData = {
      export_info: {
        team_id: params.teamId,
        generated_at: new Date().toISOString(),
        generated_by: user.email,
        period,
        format,
        sections,
      },
      data: analytics,
    };

    if (format === 'csv') {
      // In production, convert to CSV format
      return NextResponse.json({
        message: 'CSV export generated',
        download_url: `/api/v1/teams/${params.teamId}/analytics/downloads/export-${Date.now()}.csv`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return NextResponse.json({
      message: 'Analytics export generated',
      export_data: exportData,
    });

  } catch (error) {
    console.error('Team analytics export error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}