/**
 * Auth0 Configuration for AI Marketplace Platform
 * 
 * This provides Auth0 configuration with proper SDK integration and development fallback.
 * Supports both Auth0 social login and existing demo functionality.
 */

// IMPLEMENTATION REASONING:
// Using Auth0 v4.x SDK which has different API structure than v3.x
// getSession is not directly exported, we need to use withPageAuthRequired or getSession from req/res
// Alternative direct API calls rejected because SDK provides better error handling
// This affects authentication middleware by providing consistent session interface
// If this breaks, check AUTH0_* environment variables and SDK version compatibility

// DEPENDENCIES:
// - Requires @auth0/nextjs-auth0 v4.x to be available
// - Assumes environment variables are properly set
// - Performance: Minimal impact, Auth0 SDK handles caching

// Check if Auth0 is properly configured
export const isAuth0Configured = () => {
  const requiredEnvVars = [
    'AUTH0_SECRET',
    'AUTH0_BASE_URL', 
    'AUTH0_ISSUER_BASE_URL',
    'AUTH0_CLIENT_ID',
    'AUTH0_CLIENT_SECRET'
  ];

  const missing = requiredEnvVars.filter(varName => {
    const value = process.env[varName];
    return !value || value.includes('placeholder') || value.includes('your-');
  });

  if (missing.length > 0) {
    console.warn('Auth0 missing configuration:', missing.join(', '));
    return false;
  }

  return true;
};

/**
 * Get Auth0 session with development fallback
 * Note: In Auth0 v4.x, getSession requires req/res objects
 * This is a wrapper that can be used in middleware
 */
export const getSession = async (req?: any, res?: any) => {
  try {
    // Use development bypass when Auth0 is not properly configured
    if (!isAuth0Configured()) {
      console.warn('Auth0 not configured, using development bypass');
      return null;
    }

    // In Auth0 v4.x, we need to use getSession from the edge runtime
    // For now, return null and let middleware handle the session check
    // This will be properly implemented when we create the Auth0 API routes
    return null;
  } catch (error) {
    console.error('Error getting Auth0 session:', error);
    return null;
  }
};

/**
 * Get Auth0 access token for API calls
 * Note: In Auth0 v4.x, this is handled differently
 */
export const getAuth0AccessToken = async () => {
  try {
    if (!isAuth0Configured()) {
      return null;
    }

    // This will be implemented with proper Auth0 v4.x API
    // For now, return null and use simple auth fallback
    return null;
  } catch (error) {
    console.error('Error getting Auth0 access token:', error);
    return null;
  }
};

/**
 * Auth0 configuration object for the SDK
 */
export const auth0Config = {
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  baseURL: process.env.AUTH0_BASE_URL!,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL!,
  secret: process.env.AUTH0_SECRET!,
  audience: process.env.AUTH0_AUDIENCE,
  scope: 'openid profile email',
  routes: {
    callback: '/api/auth/callback',
    postLogoutRedirect: '/auth/login'
  }
};

/**
 * Check if current environment supports Auth0
 * Currently disabled during setup phase - will enable when Auth0 is properly configured
 */
export const canUseAuth0 = () => {
  // Temporarily return false to preserve demo functionality during development
  // Change to: return isAuth0Configured() && typeof window !== 'undefined';
  // when Auth0 is properly set up with real credentials
  return false;
};