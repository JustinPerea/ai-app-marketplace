/**
 * Auth0 Provider Wrapper Component
 * 
 * This wraps the application with Auth0's UserProvider to enable:
 * - Social login with Google
 * - Session management
 * - User context throughout the app
 * 
 * IMPLEMENTATION REASONING:
 * Using Auth0's UserProvider which handles session state automatically
 * Alternative manual session management rejected because Auth0 provider handles edge cases
 * This affects the entire app by providing user context, but preserves existing functionality
 * If this breaks, check Auth0 SDK version and configuration
 */

'use client';

import { UserProvider } from '@auth0/nextjs-auth0';
import { ReactNode } from 'react';

// DEPENDENCIES:
// - Requires @auth0/nextjs-auth0 client components to be available
// - Assumes Auth0 configuration is properly set up
// - Performance: Auth0 provider handles optimized state management

interface Auth0ProviderProps {
  children: ReactNode;
}

/**
 * Wrapper component that provides Auth0 context to the application
 * This enables social login while preserving existing simple auth functionality
 */
export function Auth0Provider({ children }: Auth0ProviderProps) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}

/**
 * Custom hook to use Auth0 user data with fallback
 * This provides compatibility with existing auth patterns
 */
export { useUser } from '@auth0/nextjs-auth0';