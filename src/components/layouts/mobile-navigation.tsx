'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Menu, 
  ShoppingBag, 
  Code, 
  Settings, 
  LogOut, 
  User,
  Home,
  Search,
  BarChart3,
  Key,
  Map
} from 'lucide-react';
import { CosmaraLogo } from '@/components/ui/cosmara-logo';

const navigationItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/setup', label: 'Setup', icon: Settings },
  { href: '/developers', label: 'Developer Portal', icon: Code },
];

const dashboardItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/dashboard/apps', label: 'My Apps', icon: ShoppingBag },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: Key },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, error, isLoading } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Development auth bypass - always show Settings tab in development
  // This activates when we're on localhost and no real user is authenticated
  const [isLocalhost, setIsLocalhost] = useState(false);
  
  useEffect(() => {
    if (mounted) {
      setIsLocalhost(
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1'
      );
    }
  }, [mounted]);
  
  // Create a development user when running locally without authentication
  // Only require that we're on localhost, mounted, and don't have a real user
  const devUser = isLocalhost && !user && mounted ? {
    name: 'Developer User',
    email: 'dev@localhost',
    picture: null
  } : null;

  // Use actual user in production, fall back to devUser in development when Auth0 isn't configured
  const effectiveUser = user || devUser;

  const closeSheet = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {/* Enhanced touch target for mobile hamburger menu */}
        <Button variant="ghost" className="md:hidden p-3 min-w-12 min-h-12 touch-manipulation">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 sm:w-96">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <CosmaraLogo size={24} />
            <span className="text-cosmara-brand font-bold">COSMARA</span>
          </SheetTitle>
          <SheetDescription>
            Navigate through your AI universe
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Enhanced User Section */}
          {mounted && effectiveUser && (
            <div className="flex items-center space-x-3 p-4 bg-muted rounded-xl touch-manipulation">
              <Avatar className="h-12 w-12">
                <AvatarImage src={effectiveUser.picture || ''} alt={effectiveUser.name || ''} />
                <AvatarFallback className="text-base font-semibold">
                  {effectiveUser.name?.charAt(0) || effectiveUser.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium truncate">{effectiveUser.name}</p>
                <p className="text-sm text-muted-foreground truncate">{effectiveUser.email}</p>
                {!user && <Badge variant="secondary" className="text-xs mt-1">Dev Mode</Badge>}
              </div>
            </div>
          )}

          {/* Enhanced Main Navigation */}
          <nav className="space-y-1">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
              Navigate
            </h3>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSheet}
                  className="flex items-center space-x-4 px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors touch-manipulation min-h-12"
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Enhanced Dashboard Navigation - Only show if user is logged in */}
          {mounted && effectiveUser && (
            <nav className="space-y-1">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                Dashboard
              </h3>
              {dashboardItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSheet}
                    className="flex items-center space-x-4 px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors touch-manipulation min-h-12"
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Enhanced Quick Actions Section */}
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
              Quick Actions
            </h3>
            <Link
              href="/marketplace"
              onClick={closeSheet}
              className="flex items-center space-x-4 px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors touch-manipulation min-h-12"
            >
              <Search className="h-5 w-5 flex-shrink-0" />
              <span>Search Apps</span>
            </Link>
          </div>

          {/* Enhanced Authentication Section */}
          <div className="border-t pt-6 space-y-3">
            {mounted && !effectiveUser && !isLoading && (
              <div className="space-y-3">
                <Button className="w-full h-12 text-base touch-manipulation" onClick={closeSheet}>
                  <Link href="/api/auth/login">Sign In</Link>
                </Button>
                <Button variant="outline" className="w-full h-12 text-base touch-manipulation" onClick={closeSheet}>
                  <Link href="/api/auth/login">Get Started</Link>
                </Button>
              </div>
            )}

            {mounted && effectiveUser && user && (
              <Link
                href="/api/auth/logout"
                onClick={closeSheet}
                className="flex items-center space-x-4 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors touch-manipulation min-h-12"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span>Sign Out</span>
              </Link>
            )}

            {mounted && effectiveUser && !user && (
              <div className="flex items-center space-x-4 px-4 py-3 rounded-xl text-base font-medium text-muted-foreground min-h-12">
                <User className="h-5 w-5 flex-shrink-0" />
                <span>Development Mode</span>
              </div>
            )}
          </div>

          {/* Enhanced Footer */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" onClick={closeSheet} className="hover:text-foreground py-2 px-1 touch-manipulation">
                Privacy
              </Link>
              <Link href="/terms" onClick={closeSheet} className="hover:text-foreground py-2 px-1 touch-manipulation">
                Terms
              </Link>
              <Link href="/help" onClick={closeSheet} className="hover:text-foreground py-2 px-1 touch-manipulation">
                Help
              </Link>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              &copy; 2025 COSMARA
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}