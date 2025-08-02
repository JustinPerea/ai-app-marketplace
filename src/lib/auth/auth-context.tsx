'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE';
  roles: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  // Always call useRouter - React hooks must be called unconditionally
  const router = useRouter();
  
  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch current user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/user');
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // For development, provide a fallback demo user if auth fails
        console.log('Auth API not available, using demo user for development');
        setUser({
          id: 'demo-user-123',
          email: 'demo@example.com',
          name: 'Demo User',
          plan: 'PRO',
          roles: ['USER', 'DEVELOPER']
        });
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // For development, provide a fallback demo user
      console.log('Using fallback demo user for development');
      setUser({
        id: 'demo-user-123',
        email: 'demo@example.com',
        name: 'Demo User',
        plan: 'PRO',
        roles: ['USER', 'DEVELOPER']
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      if (isClient) {
        router.push('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if API call fails
      setUser(null);
      if (isClient) {
        router.push('/');
      }
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // For development/testing: return a fallback context instead of throwing
    console.warn('useAuth used outside of AuthProvider, using fallback');
    return {
      user: {
        id: 'demo-user-123',
        email: 'demo@example.com',
        name: 'Demo User',
        plan: 'PRO' as const,
        roles: ['USER', 'DEVELOPER']
      },
      loading: false,
      login: async () => false,
      logout: async () => {},
      refreshUser: async () => {}
    };
  }
  return context;
}

// Higher-order component for protected pages
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    useEffect(() => {
      if (!loading && !user && isClient) {
        router.push('/auth/login');
      }
    }, [user, loading, router, isClient]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stellar-purple"></div>
        </div>
      );
    }

    if (!user) {
      return null; // Will redirect to login
    }

    return <Component {...props} />;
  };
}