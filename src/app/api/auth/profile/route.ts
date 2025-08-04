import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/simple-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { 
          error: 'Not authenticated', 
          isAuthenticated: false,
          loginUrl: '/auth/login' 
        },
        { status: 401 }
      );
    }

    // Return user profile with extended details
    return NextResponse.json({
      user: {
        id: user.id,
        sub: user.id, // For compatibility with Auth0-style expectations
        name: user.name,
        email: user.email,
        picture: user.picture || '/api/placeholder-avatar.jpg',
        email_verified: true,
        plan: user.plan,
        roles: user.roles,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      isAuthenticated: true,
      development: process.env.NODE_ENV === 'development'
    });

  } catch (error) {
    console.error('Auth profile error:', error);
    
    // Return detailed error info for debugging
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        isAuthenticated: false,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // For now, return the existing user data with requested updates
    // In a full implementation, you would persist these changes to a database
    return NextResponse.json({
      user: {
        id: user.id,
        sub: user.id,
        name: body.name || user.name,
        email: body.email || user.email,
        picture: body.picture || user.picture || '/api/placeholder-avatar.jpg',
        email_verified: true,
        plan: user.plan,
        roles: user.roles,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      message: 'Profile updated successfully',
      development: process.env.NODE_ENV === 'development'
    });

  } catch (error) {
    console.error('Auth profile update error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}