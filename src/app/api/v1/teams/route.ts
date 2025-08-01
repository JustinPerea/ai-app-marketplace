import { NextRequest, NextResponse } from 'next/server';

// Enterprise Team Management API
// Phase 2: Enterprise Features Implementation

interface Team {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  settings: {
    model_access: string[]; // Which models the team can use
    monthly_budget?: number; // Budget in USD
    rate_limits: {
      requests_per_minute?: number;
      requests_per_day?: number;
    };
    allowed_providers: string[]; // Which providers team can use
    cost_center?: string; // For enterprise billing
  };
  members: TeamMember[];
}

interface TeamMember {
  user_id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
  permissions: {
    can_create_apps: boolean;
    can_manage_keys: boolean;
    can_view_usage: boolean;
    can_manage_members: boolean;
  };
}

interface CreateTeamRequest {
  name: string;
  description?: string;
  settings?: Partial<Team['settings']>;
}

interface UpdateTeamRequest {
  name?: string;
  description?: string;
  settings?: Partial<Team['settings']>;
}

interface InviteMemberRequest {
  email: string;
  role: TeamMember['role'];
  permissions?: Partial<TeamMember['permissions']>;
}

// Mock data storage (in production, this would be a database)
let teams: Team[] = [
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
    ],
  },
];

// Helper functions
function generateTeamId(): string {
  return `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getUserFromRequest(req: NextRequest): { user_id: string; email: string } | null {
  // In production, this would extract user info from JWT token
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  
  // Mock user extraction (replace with actual JWT parsing)
  return {
    user_id: 'user-demo-1',
    email: 'admin@company.com',
  };
}

function hasPermission(team: Team, user_id: string, action: string): boolean {
  const member = team.members.find(m => m.user_id === user_id);
  if (!member) return false;
  
  switch (action) {
    case 'manage_team':
      return member.role === 'owner' || member.role === 'admin';
    case 'manage_members':
      return member.permissions.can_manage_members;
    case 'view_team':
      return true; // All members can view team
    default:
      return false;
  }
}

// GET /v1/teams - List teams for current user
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    // Filter teams where user is a member
    const userTeams = teams.filter(team => 
      team.members.some(member => member.user_id === user.user_id)
    );

    return NextResponse.json({
      object: 'list',
      data: userTeams,
      total: userTeams.length,
    });

  } catch (error) {
    console.error('Teams list error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}

// POST /v1/teams - Create a new team
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    const body: CreateTeamRequest = await req.json();

    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: { message: 'Team name is required', type: 'validation_error' } },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newTeam: Team = {
      id: generateTeamId(),
      name: body.name.trim(),
      description: body.description,
      created_at: now,
      updated_at: now,
      owner_id: user.user_id,
      settings: {
        model_access: body.settings?.model_access || ['gpt-3.5-turbo'],
        monthly_budget: body.settings?.monthly_budget,
        rate_limits: {
          requests_per_minute: body.settings?.rate_limits?.requests_per_minute || 60,
          requests_per_day: body.settings?.rate_limits?.requests_per_day || 1000,
        },
        allowed_providers: body.settings?.allowed_providers || ['openai'],
        cost_center: body.settings?.cost_center,
      },
      members: [
        {
          user_id: user.user_id,
          email: user.email,
          role: 'owner',
          joined_at: now,
          permissions: {
            can_create_apps: true,
            can_manage_keys: true,
            can_view_usage: true,
            can_manage_members: true,
          },
        },
      ],
    };

    teams.push(newTeam);

    return NextResponse.json(newTeam, { status: 201 });

  } catch (error) {
    console.error('Team creation error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}

// PUT /v1/teams/:id - Update team (handled in dynamic route)
// DELETE /v1/teams/:id - Delete team (handled in dynamic route)