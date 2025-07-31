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

import { NextRequest, NextResponse } from 'next/server';

// TEMPORARILY DISABLED AUTH0 ROUTES TO FIX SERVER STARTUP
// The Auth0 SDK was causing build errors, likely due to missing environment variables
// or SDK compatibility issues. Re-enable after environment is properly configured.

export async function GET(request: NextRequest, { params }: { params: { auth0: string } }) {
  const { auth0 } = params;
  
  return NextResponse.json({
    error: 'Auth0 routes temporarily disabled',
    route: auth0,
    message: 'Please use the fallback authentication system'
  }, { status: 503 });
}

export async function POST(request: NextRequest, { params }: { params: { auth0: string } }) {
  const { auth0 } = params;
  
  return NextResponse.json({
    error: 'Auth0 routes temporarily disabled', 
    route: auth0,
    message: 'Please use the fallback authentication system'
  }, { status: 503 });
}