/**
 * Simple Authentication System for Development
 * 
 * This provides a basic username/password auth system for testing API key storage
 * without requiring external services. Can be easily upgraded to Auth0 later.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

// Simple user database (in production this would be PostgreSQL)
const DEMO_USERS = [
  {
    id: 'user-1',
    email: 'demo@example.com',
    password: 'demo123', // In production: hashed password
    name: 'Demo User',
    plan: 'PRO' as const,
    roles: ['USER', 'DEVELOPER'] as const,
  },
  {
    id: 'user-2', 
    email: 'developer@example.com',
    password: 'dev123',
    name: 'Developer User',
    plan: 'ENTERPRISE' as const,
    roles: ['USER', 'DEVELOPER', 'ADMIN'] as const,
  }
];

const JWT_SECRET = process.env.AUTH0_SECRET || 'development-secret-key-for-testing';
const secret = new TextEncoder().encode(JWT_SECRET);

export interface SimpleUser {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE';
  roles: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Authenticate user with email/password
 */
export async function authenticateUser(credentials: LoginCredentials): Promise<SimpleUser | null> {
  const user = DEMO_USERS.find(u => 
    u.email === credentials.email && u.password === credentials.password
  );
  
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    roles: [...user.roles],
  };
}

/**
 * Create JWT session token
 */
export async function createSessionToken(user: SimpleUser): Promise<string> {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    roles: user.roles,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);

  return token;
}

/**
 * Verify and decode JWT session token
 */
export async function verifySessionToken(token: string): Promise<SimpleUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    
    return {
      id: payload.sub!,
      email: payload.email as string,
      name: payload.name as string,
      plan: payload.plan as 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE',
      roles: payload.roles as string[],
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Get current user from session cookie
 * Note: This function requires server context for cookies access
 */
export async function getCurrentUser(): Promise<SimpleUser | null> {
  try {
    // Dynamic import to avoid Next.js server/client boundary issues
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session-token')?.value;
    
    if (!sessionToken) {
      return null;
    }

    return await verifySessionToken(sessionToken);
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Set session cookie
 */
export function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set('session-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
  
  return response;
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.delete('session-token');
  return response;
}

/**
 * API route wrapper for authenticated requests
 */
export function withSimpleAuth(
  handler: (request: NextRequest, user: SimpleUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required', loginUrl: '/auth/login' },
          { status: 401 }
        );
      }

      return await handler(request, user);
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Component-level auth check
 */
export async function requireAuth(): Promise<SimpleUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

/**
 * Get demo users for testing
 */
export function getDemoUsers() {
  return DEMO_USERS.map(user => ({
    email: user.email,
    name: user.name,
    plan: user.plan,
    roles: user.roles,
  }));
}