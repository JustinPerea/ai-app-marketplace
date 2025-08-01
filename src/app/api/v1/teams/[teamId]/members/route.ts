import { NextRequest, NextResponse } from 'next/server';

// Team Member Management
// Phase 2: Enterprise Features Implementation

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

interface InviteMemberRequest {
  email: string;
  role: TeamMember['role'];
  permissions?: Partial<TeamMember['permissions']>;
}

interface UpdateMemberRequest {
  role?: TeamMember['role'];
  permissions?: Partial<TeamMember['permissions']>;
}

// Mock data storage
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
      {
        user_id: 'user-demo-2',
        email: 'developer@company.com',
        role: 'member',
        joined_at: new Date().toISOString(),
        permissions: {
          can_create_apps: true,
          can_manage_keys: false,
          can_view_usage: true,
          can_manage_members: false,
        },
      },
    ],
  },
];

// Mock user database
const users = [
  { user_id: 'user-demo-1', email: 'admin@company.com', name: 'Admin User' },
  { user_id: 'user-demo-2', email: 'developer@company.com', name: 'Developer User' },
  { user_id: 'user-demo-3', email: 'viewer@company.com', name: 'Viewer User' },
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
    case 'manage_members':
      return member.permissions.can_manage_members;
    case 'view_members':
      return true; // All team members can view other members
    default:
      return false;
  }
}

function getDefaultPermissions(role: TeamMember['role']): TeamMember['permissions'] {
  switch (role) {
    case 'owner':
      return {
        can_create_apps: true,
        can_manage_keys: true,
        can_view_usage: true,
        can_manage_members: true,
      };
    case 'admin':
      return {
        can_create_apps: true,
        can_manage_keys: true,
        can_view_usage: true,
        can_manage_members: true,
      };
    case 'member':
      return {
        can_create_apps: true,
        can_manage_keys: false,
        can_view_usage: true,
        can_manage_members: false,
      };
    case 'viewer':
      return {
        can_create_apps: false,
        can_manage_keys: false,
        can_view_usage: true,
        can_manage_members: false,
      };
    default:
      return {
        can_create_apps: false,
        can_manage_keys: false,
        can_view_usage: false,
        can_manage_members: false,
      };
  }
}

function generateUserId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET /v1/teams/:teamId/members - List team members
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

    if (!hasPermission(team, user.user_id, 'view_members')) {
      return NextResponse.json(
        { error: { message: 'Access denied', type: 'permission_error' } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      object: 'list',
      data: team.members,
      total: team.members.length,
    });

  } catch (error) {
    console.error('Team members list error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}

// POST /v1/teams/:teamId/members - Invite new member
export async function POST(req: NextRequest, { params }: { params: { teamId: string } }) {
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
    if (!hasPermission(team, user.user_id, 'manage_members')) {
      return NextResponse.json(
        { error: { message: 'Access denied', type: 'permission_error' } },
        { status: 403 }
      );
    }

    const body: InviteMemberRequest = await req.json();

    if (!body.email || !body.role) {
      return NextResponse.json(
        { error: { message: 'Email and role are required', type: 'validation_error' } },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingMember = team.members.find(m => m.email === body.email);
    if (existingMember) {
      return NextResponse.json(
        { error: { message: 'User is already a team member', type: 'validation_error' } },
        { status: 400 }
      );
    }

    // Find or create user
    let targetUser = users.find(u => u.email === body.email);
    if (!targetUser) {
      // In production, this would send an invitation email
      targetUser = {
        user_id: generateUserId(),
        email: body.email,
        name: body.email.split('@')[0],
      };
      users.push(targetUser);
    }

    // Create new member
    const newMember: TeamMember = {
      user_id: targetUser.user_id,
      email: body.email,
      role: body.role,
      joined_at: new Date().toISOString(),
      permissions: {
        ...getDefaultPermissions(body.role),
        ...body.permissions,
      },
    };

    // Add member to team
    teams[teamIndex].members.push(newMember);
    teams[teamIndex].updated_at = new Date().toISOString();

    return NextResponse.json(newMember, { status: 201 });

  } catch (error) {
    console.error('Team member invite error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'api_error' } },
      { status: 500 }
    );
  }
}