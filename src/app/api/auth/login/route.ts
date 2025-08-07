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

// Handle OAuth redirect requests (for Auth0 Google login)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const connection = searchParams.get('connection');
  const returnTo = searchParams.get('returnTo');

  // Handle Auth0 Google OAuth connection
  if (connection === 'google-oauth2') {
    try {
      // Construct Auth0 login URL
      const auth0Domain = process.env.AUTH0_DOMAIN;
      const clientId = process.env.AUTH0_CLIENT_ID;
      const baseUrl = process.env.AUTH0_BASE_URL || request.nextUrl.origin;
      
      if (!auth0Domain || !clientId) {
        return NextResponse.json(
          { error: 'Auth0 not configured' },
          { status: 500 }
        );
      }

      const redirectUri = `${baseUrl}/api/auth/callback`;
      const state = returnTo ? encodeURIComponent(returnTo) : '';
      
      const auth0LoginUrl = `https://${auth0Domain}/authorize?` +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `connection=${connection}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=openid profile email&` +
        (state ? `state=${state}&` : '') +
        `prompt=login`;

      // Redirect to Auth0
      return NextResponse.redirect(auth0LoginUrl);

    } catch (error) {
      console.error('Auth0 redirect error:', error);
      return NextResponse.json(
        { error: 'OAuth redirect failed' },
        { status: 500 }
      );
    }
  }

  // If no valid OAuth connection, redirect to login page
  return NextResponse.redirect(new URL('/auth/login', request.url));
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}