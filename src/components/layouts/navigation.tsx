'use client';

import { useUser } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, ShoppingBag, Code, Settings, LogOut, User, Link as LinkIcon, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MobileNavigation } from './mobile-navigation';
import { CosmaraLogo } from '@/components/ui/cosmara-logo';

export function Navigation() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Development auth bypass - always show Settings tab in development
  // TEMP DEBUG: Force isDevelopment to true to test
  const isDevelopment = true; // process.env.NODE_ENV === 'development';
  
  // Create a development user in development mode when no Auth0 user exists
  const devUser = isDevelopment && !user ? {
    name: 'Developer User',
    email: 'dev@localhost',
    picture: null
  } : null;

  // Use actual user in production, fall back to devUser in development when Auth0 isn't configured
  const effectiveUser = user || devUser;
  
  // Hydration-safe approach: Always render Settings tab, but control visibility with CSS
  // Show in development OR when we have an authenticated user (after mount)
  const shouldShowSettings = isDevelopment || (mounted && !!user);

  // Enhanced debug logging for hydration-safe approach
  useEffect(() => {
    if (mounted) {
      const debugInfo = {
        // Environment
        isDevelopment,
        mounted,
        // User data
        user: !!user,
        devUser: !!devUser,
        effectiveUser: !!effectiveUser,
        // Auth state
        isLoading,
        error: !!error,
        // Decision flags
        shouldShowSettings,
      };
      
      console.log('🔍 Navigation Debug (Hydration-Safe):', debugInfo);
      
      if (isDevelopment) {
        console.log(`🎯 Settings tab should ${shouldShowSettings ? 'SHOW' : 'HIDE'} (shouldShowSettings=${shouldShowSettings})`);
      }
    }
  }, [user, devUser, effectiveUser, mounted, isLoading, error, isDevelopment, shouldShowSettings]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <CosmaraLogo size={32} />
            <span className="text-xl font-bold text-glass-gradient">COSMARA</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" onClick={handleSearch} />
              <Input
                placeholder="Search AI applications..."
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/marketplace"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/ai-guide"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              AI Guide
            </Link>
            <Link
              href="/business"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center"
            >
              <Building2 className="h-4 w-4 mr-1" />
              Business
            </Link>
            <Link
              href="/developers"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center"
            >
              <Code className="h-4 w-4 mr-1" />
              Developers
            </Link>
            <Link
              href="/setup"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center"
            >
              <Settings className="h-4 w-4 mr-1" />
              Setup
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {!mounted ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : !isLoading && !error && !user ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Link href="/api/auth/login">Sign In</Link>
                </Button>
              </div>
            ) : isLoading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : error ? (
              <Button variant="outline" size="sm">
                <Link href="/api/auth/login">Sign In</Link>
              </Button>
            ) : null}

            {/* User Menu - FORCE VISIBLE in development */}
            <div className="block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={effectiveUser?.picture || ''} alt={effectiveUser?.name || 'Developer'} />
                      <AvatarFallback>
                        {effectiveUser?.name?.charAt(0) || effectiveUser?.email?.charAt(0) || 'D'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{effectiveUser?.name || 'Developer User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {effectiveUser?.email || 'dev@localhost'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/dashboard/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/dashboard" className="flex items-center cursor-pointer">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/setup" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Setup</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/developers" className="flex items-center cursor-pointer">
                      <Code className="mr-2 h-4 w-4" />
                      <span>Developer Portal</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user ? (
                    <DropdownMenuItem>
                      <Link href="/api/auth/logout" className="flex items-center cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem>
                      <div className="flex items-center text-muted-foreground">
                        <User className="mr-2 h-4 w-4" />
                        <span>Development Mode</span>
                      </div>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <MobileNavigation />
          </div>
        </nav>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" onClick={handleSearch} />
            <Input
              placeholder="Search AI applications..."
              className="pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
          </div>
        </div>
      </div>
    </header>
  );
}