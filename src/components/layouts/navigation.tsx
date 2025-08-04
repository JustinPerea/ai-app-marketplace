'use client';

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
import { Search, ShoppingBag, Code, Settings, LogOut, User, Link as LinkIcon, Building2, LogIn, Zap, Map } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MobileNavigation } from './mobile-navigation';
import { CosmaraLogo } from '@/components/ui/cosmara-logo';
import { useAuth } from '@/lib/auth/auth-context';

export function Navigation() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show settings when user is authenticated
  const shouldShowSettings = mounted && !!user;

  // Debug logging for auth state
  useEffect(() => {
    if (mounted) {
      console.log('🔍 Navigation Auth State:', {
        mounted,
        user: !!user,
        loading,
        shouldShowSettings,
      });
    }
  }, [user, mounted, loading, shouldShowSettings]);

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
            <span className="text-xl font-bold text-cosmara-brand">COSMARA</span>
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
              href="/my-apps"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center"
            >
              <Zap className="h-4 w-4 mr-1" />
              My Apps
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
              href="/roadmap"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center"
            >
              <Map className="h-4 w-4 mr-1" />
              Roadmap
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
            ) : loading ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            ) : !user ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Link href="/auth/login" className="flex items-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs px-2 py-1 rounded-full border text-center mt-2"
                         style={{
                           background: user.plan === 'ENTERPRISE' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                           color: user.plan === 'ENTERPRISE' ? '#FFD700' : '#8B5CF6',
                           borderColor: user.plan === 'ENTERPRISE' ? 'rgba(255, 215, 0, 0.3)' : 'rgba(139, 92, 246, 0.3)'
                         }}>
                        {user.plan}
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
                      <span>API Keys</span>
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
                  <DropdownMenuItem>
                    <button 
                      onClick={logout} 
                      className="flex items-center cursor-pointer w-full text-left"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

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