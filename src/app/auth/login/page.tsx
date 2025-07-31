'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, User, Mail, ArrowLeft } from 'lucide-react';
import { CosmaraLogo } from '@/components/ui/cosmara-logo';
import { getDemoUsers } from '@/lib/auth/simple-auth';
import { canUseAuth0 } from '@/lib/auth/auth0-config';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [auth0User, setAuth0User] = useState<any>(null);
  const [checkingAuth0, setCheckingAuth0] = useState(true);
  const router = useRouter();

  const demoUsers = getDemoUsers();
  const showAuth0Options = canUseAuth0();

  // IMPLEMENTATION REASONING:
  // Check Auth0 user status manually to avoid hook dependency issues during development
  // Alternative using useUser hook rejected because it causes build errors with placeholder config
  // This affects login flow by providing Auth0 integration only when properly configured
  // If this breaks, check Auth0 configuration and API routes

  // Check if user is already authenticated via Auth0
  useEffect(() => {
    const checkAuth0User = async () => {
      if (!showAuth0Options) {
        setCheckingAuth0(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data && data.sub) {
            setAuth0User(data);
            router.push('/dashboard');
            return;
          }
        }
      } catch (error) {
        // Auth0 not configured or not authenticated, continue with normal flow
        console.log('Auth0 check failed (expected in development):', error);
      }
      setCheckingAuth0(false);
    };

    checkAuth0User();
  }, [showAuth0Options, router]);

  if (checkingAuth0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-stellar-purple" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to dashboard or intended page
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  // DEPENDENCIES:
  // - Requires Auth0 API routes to be properly configured
  // - Assumes Google connection is set up in Auth0 dashboard
  // - Performance: Auth0 handles the redirect, minimal client-side impact

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      
      // Redirect to Auth0 Google login
      // The Auth0 API route will handle the OAuth flow
      window.location.href = '/api/auth/login?connection=google-oauth2&returnTo=' + encodeURIComponent('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col" 
      style={{ 
        background: 'linear-gradient(135deg, #0B1426 0%, #1E2A4A 50%, #2D1B69 100%)',
      }}
    >
      {/* Header with COSMARA logo */}
      <div className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-3">
          <CosmaraLogo size={32} />
          <span className="text-xl font-bold text-glass-gradient">COSMARA</span>
        </Link>
        <Link 
          href="/" 
          className="flex items-center space-x-2 text-sm text-[#94A3B8] hover:text-[#E2E8F0] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto">
            <CosmaraLogo size={48} />
          </div>
          <CardTitle className="text-h2 text-text-primary">Welcome Back</CardTitle>
          <CardDescription className="text-body-glass">
            Sign in to access your COSMARA AI marketplace
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text-primary">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-text-primary">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              style={{ 
                background: loading ? 'rgba(139, 92, 246, 0.5)' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)', 
                color: 'white'
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Auth0 Social Login Section */}
          {showAuth0Options && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-text-muted/30" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 text-text-muted bg-cosmic-dark">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full"
                style={{
                  background: 'rgba(234, 67, 53, 0.1)',
                  borderColor: 'rgba(234, 67, 53, 0.3)',
                  color: '#EA4335'
                }}
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting to Google...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </>
          )}

          {/* Demo Users Section */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-text-muted/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 text-text-muted bg-cosmic-dark">Demo Accounts</span>
              </div>
            </div>
            
            <div className="grid gap-2">
              {demoUsers.map((user, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleDemoLogin(
                    user.email, 
                    user.email === 'demo@example.com' ? 'demo123' : 'dev123'
                  )}
                  className="flex items-center justify-between w-full h-auto p-3 text-left"
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    color: '#3B82F6'
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs opacity-70">{user.email}</div>
                    </div>
                  </div>
                  <div 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: user.plan === 'ENTERPRISE' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                      color: user.plan === 'ENTERPRISE' ? '#FFD700' : '#8B5CF6'
                    }}
                  >
                    {user.plan}
                  </div>
                </Button>
              ))}
            </div>
            
            <p className="text-xs text-text-muted text-center">
              Click any demo account to auto-fill credentials
            </p>
          </div>

        </CardContent>
      </Card>
      </div>
    </div>
  );
}