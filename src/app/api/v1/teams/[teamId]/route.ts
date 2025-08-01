import { NextRequest, NextResponse } from 'next/server';

// Individual Team Management
// Phase 2: Enterprise Features Implementation

interface Team {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  settings: {
    model_access: string[];
    monthly_budget?: number;
    rate_limits: {
      requests_per_minute?: number;
      requests_per_day?: number;
    };
    allowed_providers: string[];
    cost_center?: string;
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

interface UpdateTeamRequest {
  name?: string;
  description?: string;
  settings?: Partial<Team['settings']>;
}

// Mock data storage (same as parent route)
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

function getUserFromRequest(req: NextRequest): { user_id: string; email: string } | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  
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
      return true;
    default:
      return false;
  }
}

// GET /v1/teams/:teamId - Get specific team details
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

    if (!hasPermission(team, user.user_id, 'view_team')) {
      return NextResponse.json(
        { error: { message: 'Access denied', type: 'permission_error' } },
        { status: 403 }
      );
    }

    return NextResponse.json(team);

  } catch (error) {
    console.error('Team get error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}

// PUT /v1/teams/:teamId - Update team
export async function PUT(req: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    const teamIndex = teams.findIndex(t => t.id === params.teamId);
    if (teamIndex === -1) {
      return NextResponse.json(
        { error: { message: 'Team not found', type: 'not_found_error' } },
        { status: 404 }
      );
    }

    const team = teams[teamIndex];
    if (!hasPermission(team, user.user_id, 'manage_team')) {
      return NextResponse.json(
        { error: { message: 'Access denied', type: 'permission_error' } },
        { status: 403 }
      );
    }

    const body: UpdateTeamRequest = await req.json();

    // Update team fields
    const updatedTeam: Team = {
      ...team,
      ...(body.name && { name: body.name.trim() }),
      ...(body.description !== undefined && { description: body.description }),
      updated_at: new Date().toISOString(),
      settings: {
        ...team.settings,
        ...body.settings,
        ...(body.settings?.rate_limits && {
          rate_limits: {
            ...team.settings.rate_limits,
            ...body.settings.rate_limits,
          },
        }),
      },
    };

    teams[teamIndex] = updatedTeam;

    return NextResponse.json(updatedTeam);

  } catch (error) {
    console.error('Team update error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}

// DELETE /v1/teams/:teamId - Delete team
export async function DELETE(req: NextRequest, { params }: { params: { teamId: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Authentication required', type: 'auth_error' } },
        { status: 401 }
      );
    }

    const teamIndex = teams.findIndex(t => t.id === params.teamId);
    if (teamIndex === -1) {
      return NextResponse.json(
        { error: { message: 'Team not found', type: 'not_found_error' } },
        { status: 404 }
      );
    }

    const team = teams[teamIndex];
    
    // Only team owner can delete team
    if (team.owner_id !== user.user_id) {
      return NextResponse.json(
        { error: { message: 'Only team owner can delete team', type: 'permission_error' } },
        { status: 403 }
      );
    }

    // Remove team from array
    teams.splice(teamIndex, 1);

    return NextResponse.json({ message: 'Team deleted successfully' });

  } catch (error) {
    console.error('Team delete error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}