import { NextRequest, NextResponse } from 'next/server';
import { 
  authenticateUser, 
  createSessionToken, 
  setSessionCookie,
  type LoginCredentials 
} from '@/lib/auth/simple-auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LoginCredentials;
    
    // Validate input
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser(body);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Ensure user exists in database for API key management
    await ensureUserInDatabase(user);

    // Create session token
    const sessionToken = await createSessionToken(user);
    
    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        roles: user.roles,
      },
    });

    // Set session cookie
    setSessionCookie(response, sessionToken);
    
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * Ensure user exists in database for API key storage
 * This creates or updates the user record to support the BYOK system
 */
async function ensureUserInDatabase(user: any) {
  try {
    // Use upsert to create or update user atomically
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name || '',
        plan: user.plan || 'FREE',
        updatedAt: new Date(),
      },
      create: {
        id: user.id, // Use the simple auth user ID for consistency
        email: user.email,
        name: user.name || '',
        plan: user.plan || 'FREE',
      },
    });

    console.info('User synchronized with database:', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to ensure user in database:', error);
    // Don't fail login if database sync fails - user can still use localStorage fallback
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}