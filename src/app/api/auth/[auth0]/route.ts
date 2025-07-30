/**
 * Auth0 Dynamic API Routes Handler
 * 
 * This handles all Auth0 authentication routes:
 * - /api/auth/login
 * - /api/auth/logout  
 * - /api/auth/callback
 * - /api/auth/me
 * 
 * IMPLEMENTATION REASONING:
 * Using Auth0's handleAuth() which provides all necessary routes in one handler
 * Alternative manual route creation rejected because Auth0 SDK handles edge cases better
 * This affects existing login functionality by providing Auth0 routes alongside simple auth
 * If this breaks, check Auth0 SDK version and environment variables
 */

import { handleAuth, handleLogin, handleLogout, handleCallback, handleProfile } from '@auth0/nextjs-auth0';

// DEPENDENCIES:
// - Requires @auth0/nextjs-auth0 SDK to be properly configured
// - Assumes AUTH0_* environment variables are set
// - Performance: Handled by Auth0 SDK, includes proper caching

// Create custom handlers to integrate with our existing system
export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      // Add Google as preferred connection for social login
      connection: 'google-oauth2', // This will be the default, but users can still choose others
      prompt: 'select_account', // Allow users to select Google account
      scope: 'openid profile email', // Request basic profile information
    },
    returnTo: '/dashboard' // Redirect to dashboard after successful login
  }),
  
  logout: handleLogout({
    returnTo: '/auth/login' // Redirect to login page after logout
  }),
  
  callback: handleCallback({
    afterCallback: async (req, res, session, state) => {
      // CUSTOM INTEGRATION POINT:
      // Here we can sync the Auth0 user with our database
      // This maintains compatibility with existing API key storage system
      
      try {
        const user = session.user;
        console.log('Auth0 callback - user authenticated:', {
          auth0Id: user.sub,
          email: user.email,
          name: user.name
        });

        // TODO: In the next step, we'll add database sync here
        // to ensure Auth0 users are created in our User table
        // This preserves the existing API key management system
        
        return session;
      } catch (error) {
        console.error('Error in Auth0 callback:', error);
        return session; // Return session anyway, let middleware handle user creation
      }
    }
  }),
  
  profile: handleProfile({
    refetch: true // Always get fresh user data
  })
});

// Handle POST requests (some Auth0 flows use POST)
export const POST = GET;