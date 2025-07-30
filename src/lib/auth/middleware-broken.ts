/**
 * Auth0 Middleware for Next.js App Router
 * 
 * Provides authentication middleware for API routes with:
 * - User session validation
 * - MFA requirement enforcement
 * - Role-based access control
 * - Security context extraction
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, isAuth0Configured } from '@/lib/auth/auth0-config';
import { prisma } from '@/lib/db/index';
import { UserRole, SecurityLevel, type SecurityContext } from '@/lib/security/auth-config';

export interface AuthenticatedUser {
  id: string;
  auth0Id: string;
  email: string;
  name?: string;
  plan: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE';
  roles: UserRole[];
  mfaVerified: boolean;
}

export interface AuthenticatedApiHandler {
  (
    request: NextRequest,
    context: { params?: any },
    user: AuthenticatedUser
  ): Promise<NextResponse>;
}

/**
 * Wrapper for authenticated API routes
 */
export function withAuth(
  handler: AuthenticatedApiHandler,
  options: {
    requireMfa?: boolean;
    requiredRoles?: UserRole[];
    securityLevel?: SecurityLevel;
    allowDevBypass?: boolean;
  } = {}
) {
  return async (request: NextRequest, context: { params?: any }) => {
    try {
      // Check for development bypass
      const isDevelopment = process.env.NODE_ENV === 'development';
      const allowBypass = options.allowDevBypass !== false && isDevelopment;
      
      if (allowBypass && !isAuth0Configured()) {
        // Use development bypass when Auth0 is not properly configured
        console.warn('Using development auth bypass - configure Auth0 for production!');
        
        const mockUser: AuthenticatedUser = {
          id: 'dev-user-1',
          auth0Id: 'dev|development-user',
          email: 'developer@localhost',
          name: 'Development User',
          plan: 'PRO',
          roles: [UserRole.USER, UserRole.DEVELOPER],
          mfaVerified: true,
        };

        return await handler(request, context, mockUser);
      }

      // Get Auth0 session
      const session = await getSession();
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Get or create user from Auth0 session
      // Add timeout to prevent hanging on database operations\n      let user;\n      try {\n        user = await Promise.race([\n          getOrCreateUser(session?.user),\n          new Promise<null>((_, reject) => \n            setTimeout(() => reject(new Error('Database operation timeout')), 10000)\n          )\n        ]);\n      } catch (error) {\n        console.error('User creation/lookup failed:', error);\n        return NextResponse.json(\n          { error: 'Authentication service temporarily unavailable' },\n          { status: 503 }\n        );\n      }
      
      if (!user) {
        return NextResponse.json(
          { error: 'User creation failed' },
          { status: 500 }
        );
      }

      // Check MFA requirement
      if (options.requireMfa && !user.mfaVerified) {
        return NextResponse.json(
          { error: 'MFA verification required' },
          { status: 403 }
        );
      }

      // Check role requirements
      if (options.requiredRoles && options.requiredRoles.length > 0) {
        const hasRequiredRole = options.requiredRoles.some(role => 
          user.roles.includes(role)
        );
        
        if (!hasRequiredRole) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // Call the actual handler with the authenticated user
      return await handler(request, context, user);

    } catch (error) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication service error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Wrapper for API key operations requiring MFA
 */
export function withApiKeyAuth(handler: AuthenticatedApiHandler) {
  return withAuth(handler, {
    requireMfa: true,
    requiredRoles: [UserRole.USER, UserRole.DEVELOPER, UserRole.ADMIN],
    securityLevel: SecurityLevel.MEDIUM,
  });
}

/**
 * Wrapper for admin operations
 */
export function withAdminAuth(handler: AuthenticatedApiHandler) {
  return withAuth(handler, {
    requireMfa: true,
    requiredRoles: [UserRole.ADMIN, UserRole.SECURITY_ADMIN],
    securityLevel: SecurityLevel.HIGH,
  });
}

/**
 * Wrapper for developer operations
 */
export function withDeveloperAuth(handler: AuthenticatedApiHandler) {
  return withAuth(handler, {
    requireMfa: false,
    requiredRoles: [UserRole.DEVELOPER, UserRole.ADMIN],
    securityLevel: SecurityLevel.LOW,
  });
}

/**
 * Get or create user in database from Auth0 session
 */
async function getOrCreateUser(auth0User: any): Promise<AuthenticatedUser | null> {
  try {
    const auth0Id = auth0User.sub;
    const email = auth0User.email;
    
    if (!auth0Id || !email) {
      console.error('Missing required Auth0 user data:', { auth0Id, email });
      return null;
    }

    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { auth0Id },
    });

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          auth0Id,
          email,
          name: auth0User.name || auth0User.nickname || null,
          image: auth0User.picture || null,
          emailVerified: auth0User.email_verified ? new Date() : null,
        },
      });
    } else {
      // Update user info if needed
      const updates: any = {};
      if (user.email !== email) updates.email = email;
      if (user.name !== auth0User.name && auth0User.name) updates.name = auth0User.name;
      if (user.image !== auth0User.picture && auth0User.picture) updates.image = auth0User.picture;
      
      if (Object.keys(updates).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updates,
        });
      }
    }

    // Extract roles from Auth0 metadata
    const roles = extractUserRoles(auth0User);
    const mfaVerified = isMfaVerified(auth0User);

    return {
      id: user.id,
      auth0Id: user.auth0Id!,
      email: user.email,
      name: user.name || undefined,
      plan: user.plan as 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE',
      roles,
      mfaVerified,
    };

  } catch (error) {
    console.error('Error getting or creating user:', error);
    return null;
  }
}

/**
 * Extract user roles from Auth0 metadata
 */
function extractUserRoles(auth0User: any): UserRole[] {
  try {
    const roles = auth0User['https://ai-marketplace.dev/roles'] as string[] || ['user'];
    return roles.filter(role => 
      Object.values(UserRole).includes(role as UserRole)
    ) as UserRole[];
  } catch (error) {
    console.error('Error extracting user roles:', error);
    return [UserRole.USER];
  }
}

/**
 * Check if MFA is verified in current session
 */
function isMfaVerified(auth0User: any): boolean {
  try {
    const mfaTimestamp = auth0User['https://ai-marketplace.dev/mfa_timestamp'] as number;
    if (!mfaTimestamp) return false;

    const mfaAge = Date.now() - mfaTimestamp;
    const MFA_VALIDITY_MS = 15 * 60 * 1000; // 15 minutes
    
    return mfaAge < MFA_VALIDITY_MS;
  } catch (error) {
    console.error('Error checking MFA verification:', error);
    return false;
  }
}

/**
 * Create security context for logging and monitoring
 */
export function createSecurityContext(
  request: NextRequest,
  user: AuthenticatedUser
): SecurityContext {
  return {
    userId: user.id,
    email: user.email,
    roles: user.roles,
    mfaVerified: user.mfaVerified,
    sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ipAddress: extractIpAddress(request),
    userAgent: request.headers.get('user-agent') || undefined,
  };
}

/**
 * Extract IP address from request
 */
function extractIpAddress(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  
  return undefined;
}