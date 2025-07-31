'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SimpleStars } from '@/components/ui/simple-stars';
import { CosmaraLogo } from '@/components/ui/cosmara-logo';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Settings, 
  Key, 
  BarChart3, 
  ShoppingBag, 
  User, 
  CreditCard,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'My Apps', href: '/dashboard/apps', icon: ShoppingBag },
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { name: 'Usage & Billing', href: '/dashboard/usage', icon: BarChart3 },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

// Simple Tooltip Component for collapsed sidebar
function Tooltip({ children, content, show }: { children: React.ReactNode; content: string; show: boolean }) {
  if (!show) return <>{children}</>;
  
  return (
    <div className="relative group">
      {children}
      <div className="absolute left-full ml-2 px-2 py-1 bg-[rgba(0,0,0,0.8)] text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 backdrop-blur-sm">
        {content}
      </div>
    </div>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  // Load collapsed state from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('cosmara-sidebar-collapsed');
    if (saved) {
      setSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to sessionStorage
  const toggleSidebarCollapsed = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    sessionStorage.setItem('cosmara-sidebar-collapsed', JSON.stringify(newState));
  };

  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(135deg, #0B1426 0%, #1E2A4A 50%, #2D1B69 100%)'
    }}>
      {/* Cosmic Background with Animated Stars */}
      <SimpleStars starCount={40} parallaxSpeed={0.15} />
      
      {/* Fixed Header with COSMARA branding and navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-[rgba(255,255,255,0.1)] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#94A3B8] hover:text-[#E2E8F0] mr-3"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <Link href="/" className="flex items-center space-x-3">
              <CosmaraLogo size={32} />
              <span className="text-xl font-bold text-glass-gradient">COSMARA</span>
            </Link>
            <nav className="hidden lg:flex space-x-8 ml-8">
              <Link href="/marketplace" className="text-sm font-medium text-[#94A3B8] hover:text-[#E2E8F0]">
                Marketplace
              </Link>
              <Link href="/developers" className="text-sm font-medium text-[#94A3B8] hover:text-[#E2E8F0]">
                Developer Portal
              </Link>
              <Link href="/dashboard/api-keys" className="text-sm font-medium text-[#94A3B8] hover:text-[#E2E8F0] flex items-center">
                <Key className="h-4 w-4 mr-1" />
                API Keys
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-[#94A3B8] hover:text-[#E2E8F0]">
              <Bell className="h-4 w-4" />
            </Button>
            <Link href="/" className="text-sm font-medium text-[#94A3B8] hover:text-[#E2E8F0]">
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar overlay */}
      <div className={cn(
        "fixed inset-0 z-40 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed top-20 bottom-0 left-0 w-64 glass-card border-0 bg-[rgba(255,255,255,0.05)] shadow-xl z-40">
          <nav className="p-4 space-y-2 h-full overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0B1426]"
                      : "text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#E2E8F0]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar - positioned below header */}
      <div className={cn(
        "hidden lg:fixed lg:flex lg:flex-col z-30 transition-all duration-300 ease-in-out",
        "top-20 bottom-0 left-0", // Start below header (20 = header height)
        sidebarCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <div className="flex flex-col flex-grow glass-card border-0 bg-[rgba(255,255,255,0.05)] border-r border-[rgba(255,255,255,0.1)] h-full">
          {/* Sidebar collapse toggle */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.1)]">
            <span className={cn(
              "text-sm font-medium text-[#94A3B8] transition-all duration-300",
              sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            )}>
              Dashboard
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebarCollapsed}
              className="text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Tooltip key={item.name} content={item.name} show={sidebarCollapsed}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300",
                      sidebarCollapsed ? "justify-center space-x-0" : "space-x-3",
                      isActive
                        ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0B1426]"
                        : "text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#E2E8F0]"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className={cn(
                      "transition-all duration-300",
                      sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                    )}>
                      {item.name}
                    </span>
                  </Link>
                </Tooltip>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content area - adjusted for fixed header and sidebar */}
      <div className={cn(
        "pt-20 transition-all duration-300 ease-in-out", // Add top padding for fixed header
        sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-transparent relative z-10 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}