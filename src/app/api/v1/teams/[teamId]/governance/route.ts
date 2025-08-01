import { NextRequest, NextResponse } from 'next/server';

// Advanced Team Governance and Access Control
// Phase 2: Enterprise-Grade Team Management

interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  type: 'data_handling' | 'model_usage' | 'cost_control' | 'access_control' | 'compliance';
  status: 'active' | 'draft' | 'disabled';
  created_at: string;
  updated_at: string;
  created_by: string;
  rules: {
    conditions: {
      field: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
      value: any;
    }[];
    actions: {
      type: 'allow' | 'deny' | 'require_approval' | 'log' | 'redirect' | 'transform';
      parameters?: { [key: string]: any };
    }[];
  };
  exceptions: {
    user_ids?: string[];
    roles?: string[];
    time_windows?: { start: string; end: string }[];
  };
}

interface AccessAuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  action: string;
  resource: string;
  result: 'allowed' | 'denied' | 'requires_approval';
  policy_id?: string;
  metadata: {
    ip_address?: string;
    user_agent?: string;
    request_details?: any;
  };
}

interface ComplianceRule {
  id: string;
  name: string;
  regulation: 'GDPR' | 'CCPA' | 'HIPAA' | 'SOC2' | 'PCI_DSS' | 'custom';
  description: string;
  mandatory: boolean;
  auto_enforce: boolean;
  violation_severity: 'low' | 'medium' | 'high' | 'critical';
  remediation_steps: string[];
}

interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  categories: string[];
  handling_requirements: {
    encryption_required: boolean;
    access_logging: boolean;
    retention_period_days?: number;
    geographic_restrictions?: string[];
    approval_required: boolean;
  };
}

interface TeamGovernanceConfig {
  data_classification: {
    auto_classify: boolean;
    default_level: DataClassification['level'];
    classifications: { [level: string]: DataClassification };
  };
  access_controls: {
    multi_factor_required: boolean;
    session_timeout_minutes: number;
    ip_restrictions?: string[];
    allowed_countries?: string[];
    require_vpn: boolean;
  };
  approval_workflows: {
    high_cost_threshold: number; // Requests above this amount require approval
    sensitive_model_access: string[]; // Models requiring approval
    external_data_sharing: boolean;
    custom_workflows: {
      id: string;
      name: string;
      triggers: string[];
      approvers: string[];
      timeout_hours: number;
    }[];
  };
  monitoring: {
    real_time_alerts: boolean;
    anomaly_detection: boolean;
    compliance_scanning: boolean;
    audit_retention_days: number;
  };
}

// Mock governance data
const mockGovernanceData = {
  'team-demo-1': {
    config: {
      data_classification: {
        auto_classify: true,
        default_level: 'internal',
        classifications: {
          public: {
            level: 'public',
            categories: ['marketing', 'general'],
            handling_requirements: {
              encryption_required: false,
              access_logging: false,
              approval_required: false,
            },
          },
          internal: {
            level: 'internal',
            categories: ['business', 'product'],
            handling_requirements: {
              encryption_required: true,
              access_logging: true,
              retention_period_days: 365,
              approval_required: false,
            },
          },
          confidential: {
            level: 'confidential',
            categories: ['customer_data', 'financial'],
            handling_requirements: {
              encryption_required: true,
              access_logging: true,
              retention_period_days: 180,
              geographic_restrictions: ['US', 'EU'],
              approval_required: true,
            },
          },
          restricted: {
            level: 'restricted',
            categories: ['medical', 'legal', 'security'],
            handling_requirements: {
              encryption_required: true,
              access_logging: true,
              retention_period_days: 90,
              geographic_restrictions: ['US'],
              approval_required: true,
            },
          },
        },
      },
      access_controls: {
        multi_factor_required: true,
        session_timeout_minutes: 120,
        ip_restrictions: ['192.168.1.0/24', '10.0.0.0/16'],
        allowed_countries: ['US', 'CA', 'GB'],
        require_vpn: true,
      },
      approval_workflows: {
        high_cost_threshold: 100,
        sensitive_model_access: ['gpt-4o', 'claude-3-5-sonnet-20241022'],
        external_data_sharing: true,
        custom_workflows: [
          {
            id: 'wf-medical-data',
            name: 'Medical Data Processing',
            triggers: ['medical_content_detected', 'healthcare_model_request'],
            approvers: ['user-compliance-officer', 'user-demo-1'],
            timeout_hours: 24,
          },
        ],
      },
      monitoring: {
        real_time_alerts: true,
        anomaly_detection: true,
        compliance_scanning: true,
        audit_retention_days: 2555, // 7 years
      },
    },
    policies: [
      {
        id: 'pol-cost-control-1',
        name: 'Cost Control - High Usage Alert',
        description: 'Require approval for requests exceeding $50/day per user',
        type: 'cost_control',
        status: 'active',
        created_at: '2025-07-15T10:00:00Z',
        updated_at: '2025-07-28T14:30:00Z',
        created_by: 'user-demo-1',
        rules: {
          conditions: [
            {
              field: 'daily_cost_per_user',
              operator: 'greater_than',
              value: 50,
            },
          ],
          actions: [
            {
              type: 'require_approval',
              parameters: {
                approvers: ['user-demo-1'],
                timeout_hours: 4,
              },
            },
            {
              type: 'log',
              parameters: {
                severity: 'high',
                notify: ['admin@company.com'],
              },
            },
          ],
        },
        exceptions: {
          roles: ['owner'],
          time_windows: [
            { start: '09:00', end: '17:00' }, // Business hours exception
          ],
        },
      },
      {
        id: 'pol-data-classification-1',
        name: 'Restricted Data Processing',
        description: 'Restrict processing of medical/legal data to approved models only',
        type: 'data_handling',
        status: 'active',
        created_at: '2025-07-20T09:00:00Z',
        updated_at: '2025-07-20T09:00:00Z',
        created_by: 'user-demo-1',
        rules: {
          conditions: [
            {
              field: 'data_classification',
              operator: 'in',
              value: ['medical', 'legal'],
            },
          ],
          actions: [
            {
              type: 'allow',
              parameters: {
                allowed_models: ['claude-3-5-sonnet-20241022'],
                require_audit_log: true,
              },
            },
          ],
        },
        exceptions: {
          user_ids: ['user-demo-1'],
        },
      },
    ],
    compliance_rules: [
      {
        id: 'comp-gdpr-1',
        name: 'GDPR Data Retention',
        regulation: 'GDPR',
        description: 'Ensure personal data is deleted after retention period',
        mandatory: true,
        auto_enforce: true,
        violation_severity: 'high',
        remediation_steps: [
          'Identify personal data in request logs',
          'Apply automated deletion after retention period',
          'Generate compliance report for audit',
        ],
      },
      {
        id: 'comp-soc2-1',
        name: 'SOC2 Access Logging',
        regulation: 'SOC2',
        description: 'Log all access to sensitive systems and data',
        mandatory: true,
        auto_enforce: true,
        violation_severity: 'medium',
        remediation_steps: [
          'Enable comprehensive access logging',
          'Monitor for unauthorized access attempts',
          'Generate quarterly access reports',
        ],
      },
    ],
    audit_logs: [
      {
        id: 'audit-1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user_id: 'user-demo-2',
        user_email: 'developer@company.com',
        action: 'model_request',
        resource: 'gpt-4o',
        result: 'requires_approval',
        policy_id: 'pol-cost-control-1',
        metadata: {
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          request_details: {
            model: 'gpt-4o',
            estimated_cost: 75.50,
            prompt_tokens: 1200,
          },
        },
      },
      {
        id: 'audit-2',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        user_id: 'user-demo-1',
        user_email: 'admin@company.com',
        action: 'policy_update',
        resource: 'pol-cost-control-1',
        result: 'allowed',
        metadata: {
          ip_address: '192.168.1.50',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          request_details: {
            changes: ['updated threshold from $40 to $50'],
          },
        },
      },
    ],
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

function hasGovernanceAccess(teamId: string, user_id: string, action: string): boolean {
  // In production, check team membership and governance permissions
  switch (action) {
    case 'view':
      return user_id === 'user-demo-1' || user_id === 'user-demo-2';
    case 'manage':
      return user_id === 'user-demo-1'; // Only team owner can manage
    default:
      return false;
  }
}

function evaluatePolicy(policy: GovernancePolicy, context: any): {
  applies: boolean;
  result: 'allow' | 'deny' | 'require_approval';
  actions: any[];
} {
  // Simplified policy evaluation - in production, this would be more sophisticated
  const conditionsMet = policy.rules.conditions.every(condition => {
    const fieldValue = context[condition.field];
    switch (condition.operator) {
      case 'greater_than':
        return fieldValue > condition.value;
      case 'equals':
        return fieldValue === condition.value;
      case 'in':
        return condition.value.includes(fieldValue);
      default:
        return false;
    }
  });

  if (!conditionsMet) {
    return { applies: false, result: 'allow', actions: [] };
  }

  const requiresApproval = policy.rules.actions.some(action => action.type === 'require_approval');
  const isDenied = policy.rules.actions.some(action => action.type === 'deny');

  return {
    applies: true,
    result: isDenied ? 'deny' : requiresApproval ? 'require_approval' : 'allow',
    actions: policy.rules.actions,
  };
}

// GET /v1/teams/:teamId/governance - Get team governance configuration
export async function GET(req: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    if (!hasGovernanceAccess(params.teamId, user.user_id, 'view')) {
      return NextResponse.json(
        { error: { message: 'Access denied', type: 'permission_error' } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const include = searchParams.get('include')?.split(',') || ['config', 'policies', 'compliance'];

    const governanceData = mockGovernanceData[params.teamId as keyof typeof mockGovernanceData];
    if (!governanceData) {
      return NextResponse.json(
        { error: { message: 'Governance data not found', type: 'not_found_error' } },
        { status: 404 }
      );
    }

    const response: any = {
      team_id: params.teamId,
      generated_at: new Date().toISOString(),
    };

    if (include.includes('config')) {
      response.governance_config = governanceData.config;
    }

    if (include.includes('policies')) {
      response.policies = governanceData.policies;
      response.policy_summary = {
        total: governanceData.policies.length,
        active: governanceData.policies.filter(p => p.status === 'active').length,
        by_type: governanceData.policies.reduce((acc, p) => {
          acc[p.type] = (acc[p.type] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number }),
      };
    }

    if (include.includes('compliance')) {
      response.compliance_rules = governanceData.compliance_rules;
      response.compliance_summary = {
        total_rules: governanceData.compliance_rules.length,
        mandatory_rules: governanceData.compliance_rules.filter(r => r.mandatory).length,
        auto_enforced: governanceData.compliance_rules.filter(r => r.auto_enforce).length,
        by_regulation: governanceData.compliance_rules.reduce((acc, r) => {
          acc[r.regulation] = (acc[r.regulation] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number }),
      };
    }

    if (include.includes('audit')) {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      response.recent_audit_logs = governanceData.audit_logs
        .filter(log => new Date(log.timestamp) > last24h)
        .slice(0, 50); // Last 50 events in 24h
      
      response.audit_summary = {
        total_events_24h: governanceData.audit_logs.filter(log => new Date(log.timestamp) > last24h).length,
        violations_24h: governanceData.audit_logs.filter(log => 
          new Date(log.timestamp) > last24h && log.result === 'denied'
        ).length,
        pending_approvals: governanceData.audit_logs.filter(log => 
          log.result === 'requires_approval'
        ).length,
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Team governance error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}

// POST /v1/teams/:teamId/governance/policies - Create or update governance policy
export async function POST(req: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    if (!hasGovernanceAccess(params.teamId, user.user_id, 'manage')) {
      return NextResponse.json(
        { error: { message: 'Access denied', type: 'permission_error' } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, policy } = body;

    const governanceData = mockGovernanceData[params.teamId as keyof typeof mockGovernanceData];
    if (!governanceData) {
      return NextResponse.json(
        { error: { message: 'Governance data not found', type: 'not_found_error' } },
        { status: 404 }
      );
    }

    if (action === 'create_policy') {
      const newPolicy: GovernancePolicy = {
        id: `pol-${Date.now()}`,
        name: policy.name,
        description: policy.description,
        type: policy.type,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user.user_id,
        rules: policy.rules,
        exceptions: policy.exceptions || {},
      };

      governanceData.policies.push(newPolicy);

      return NextResponse.json({
        message: 'Policy created successfully',
        policy: newPolicy,
      });
    }

    if (action === 'update_policy') {
      const policyIndex = governanceData.policies.findIndex(p => p.id === policy.id);
      if (policyIndex === -1) {
        return NextResponse.json(
          { error: { message: 'Policy not found', type: 'not_found_error' } },
          { status: 404 }
        );
      }

      governanceData.policies[policyIndex] = {
        ...governanceData.policies[policyIndex],
        ...policy,
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json({
        message: 'Policy updated successfully',
        policy: governanceData.policies[policyIndex],
      });
    }

    if (action === 'evaluate_policy') {
      const targetPolicy = governanceData.policies.find(p => p.id === policy.id);
      if (!targetPolicy) {
        return NextResponse.json(
          { error: { message: 'Policy not found', type: 'not_found_error' } },
          { status: 404 }
        );
      }

      const evaluation = evaluatePolicy(targetPolicy, policy.context);
      
      return NextResponse.json({
        policy_id: policy.id,
        evaluation,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: { message: 'Invalid action', type: 'validation_error' } },
      { status: 400 }
    );

  } catch (error) {
    console.error('Team governance policy error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}

// PUT /v1/teams/:teamId/governance/config - Update governance configuration
export async function PUT(req: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    if (!hasGovernanceAccess(params.teamId, user.user_id, 'manage')) {
      return NextResponse.json(
        { error: { message: 'Access denied', type: 'permission_error' } },
        { status: 403 }
      );
    }

    const body: Partial<TeamGovernanceConfig> = await req.json();

    const governanceData = mockGovernanceData[params.teamId as keyof typeof mockGovernanceData];
    if (!governanceData) {
      return NextResponse.json(
        { error: { message: 'Governance data not found', type: 'not_found_error' } },
        { status: 404 }
      );
    }

    // Update governance configuration
    governanceData.config = {
      ...governanceData.config,
      ...body,
    };

    // Log the configuration change
    const auditEntry: AccessAuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_id: user.user_id,
      user_email: user.email,
      action: 'governance_config_update',
      resource: `team-${params.teamId}-governance`,
      result: 'allowed',
      metadata: {
        request_details: { updated_sections: Object.keys(body) },
      },
    };

    governanceData.audit_logs.unshift(auditEntry);

    return NextResponse.json({
      message: 'Governance configuration updated successfully',
      config: governanceData.config,
      updated_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Team governance config update error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}