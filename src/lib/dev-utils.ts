/**
 * Development utilities for auth bypass and testing
 */

// Check if we're running in development mode with placeholder Auth0 credentials
export function isDevelopmentMode(): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.AUTH0_CLIENT_ID === 'development-client-id-placeholder'
  );
}

// Create a development user object for testing
export function createDevUser() {
  if (!isDevelopmentMode()) {
    return null;
  }
  
  return {
    name: 'Developer User',
    email: 'dev@localhost',
    picture: null
  };
}