/**
 * Developer Authentication Helper
 * 
 * Provides authentication utilities for developer API endpoints
 * Supports both Auth0 and demo mode for development
 */

import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { isAuth0Configured } from './auth0-config';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  auth0Id?: string;
  developerId?: string;
}

/**
 * Extract user information from request headers or session
 * Returns demo user if Auth0 is not configured
 */
export async function authenticateRequest(request: NextRequest): Promise<{
  user: AuthenticatedUser | null;
  error?: string;
}> {
  try {
    // Check if Auth0 is configured
    if (!isAuth0Configured()) {
      console.log('Using demo user for development');
      
      // Return demo user for development
      const demoUser = await getDemoUser();
      return { user: demoUser };
    }

    // In production, extract user from Auth0 session
    // For now, we'll use a simple header-based approach for testing
    const authHeader = request.headers.get('authorization');
    const userIdHeader = request.headers.get('x-user-id');
    const userEmailHeader = request.headers.get('x-user-email');

    if (userIdHeader && userEmailHeader) {
      // Look up user in database
      const user = await prisma.user.findUnique({
        where: { id: userIdHeader },
        include: {
          developerProfile: true
        }
      });

      if (user) {
        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            auth0Id: user.auth0Id || undefined,
            developerId: user.developerProfile?.id
          }
        };
      }
    }

    // If no valid authentication found, return demo user in development
    if (process.env.NODE_ENV === 'development') {
      const demoUser = await getDemoUser();
      return { user: demoUser };
    }

    return { user: null, error: 'Unauthorized' };

  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

/**
 * Get or create demo user and developer profile
 */
async function getDemoUser(): Promise<AuthenticatedUser> {
  const demoUserId = 'demo-user-id';
  
  // Ensure demo user exists
  const user = await prisma.user.upsert({
    where: { id: demoUserId },
    update: {},
    create: {
      id: demoUserId,
      email: 'demo@developer.com',
      name: 'Demo Developer',
      plan: 'FREE'
    },
    include: {
      developerProfile: true
    }
  });

  // Ensure developer profile exists
  let developerProfile = user.developerProfile;
  if (!developerProfile) {
    developerProfile = await prisma.developerProfile.create({
      data: {
        userId: demoUserId,
        displayName: 'Demo Developer',
        description: 'Demo developer account for testing submissions'
      }
    });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    developerId: developerProfile.id
  };
}

/**
 * Require authentication middleware for API routes
 */
export async function requireAuth(request: NextRequest): Promise<{
  user: AuthenticatedUser;
  error?: string;
}> {
  const { user, error } = await authenticateRequest(request);
  
  if (!user) {
    return { user: null as any, error: error || 'Authentication required' };
  }

  return { user };
}

/**
 * Require developer profile for developer-specific operations
 */
export async function requireDeveloper(request: NextRequest): Promise<{
  user: AuthenticatedUser;
  developerId: string;
  error?: string;
}> {
  const { user, error } = await requireAuth(request);
  
  if (error || !user) {
    return { user: null as any, developerId: '', error: error || 'Authentication required' };
  }

  if (!user.developerId) {
    // Try to create developer profile if it doesn't exist
    try {
      const developerProfile = await prisma.developerProfile.create({
        data: {
          userId: user.id,
          displayName: user.name || 'Developer',
          description: 'New developer on the platform'
        }
      });

      user.developerId = developerProfile.id;
    } catch (createError) {
      console.error('Error creating developer profile:', createError);
      return { user: null as any, developerId: '', error: 'Developer profile required' };
    }
  }

  return { user, developerId: user.developerId };
}

/**
 * Check if user can modify a specific app
 */
export async function canModifyApp(userId: string, appId: string): Promise<boolean> {
  try {
    const app = await prisma.marketplaceApp.findFirst({
      where: {
        id: appId,
        developer: {
          userId: userId
        }
      }
    });

    return !!app;
  } catch (error) {
    console.error('Error checking app permissions:', error);
    return false;
  }
}

/**
 * Get apps owned by user
 */
export async function getUserApps(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        developerProfile: {
          include: {
            apps: {
              include: {
                developer: {
                  select: {
                    displayName: true,
                    verified: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        }
      }
    });

    return user?.developerProfile?.apps || [];
  } catch (error) {
    console.error('Error fetching user apps:', error);
    return [];
  }
}