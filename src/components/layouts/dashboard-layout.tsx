'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SimpleStars } from '@/components/ui/simple-stars';
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
  X
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'My Apps', href: '/dashboard/apps', icon: ShoppingBag },
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { name: 'Usage & Billing', href: '/dashboard/usage', icon: BarChart3 },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(135deg, #0B1426 0%, #1E2A4A 50%, #2D1B69 100%)'
    }}>
      {/* Cosmic Background with Animated Stars */}
      <SimpleStars starCount={40} parallaxSpeed={0.15} />
      
      {/* Mobile sidebar overlay */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 glass-card border-0 bg-[rgba(255,255,255,0.05)] shadow-xl z-50">
          <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-gradient-to-r from-[#FFD700] to-[#FFA500] flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-[#0B1426]" />
              </div>
              <span className="text-lg font-semibold text-[#E2E8F0]">Dashboard</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
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

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-30">
        <div className="flex flex-col flex-grow glass-card border-0 bg-[rgba(255,255,255,0.05)] border-r border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center px-4 py-4 border-b border-[rgba(255,255,255,0.1)]">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-gradient-to-r from-[#FFD700] to-[#FFA500] flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-[#0B1426]" />
              </div>
              <span className="text-lg font-semibold text-[#E2E8F0]">Dashboard</span>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
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

      {/* Main content */}
      <div className="lg:pl-64 relative z-20">
        {/* Top bar with cosmic theme */}
        <div className="sticky top-0 z-40 glass-nav border-b border-[rgba(255,255,255,0.1)] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-[#94A3B8] hover:text-[#E2E8F0]"
              >
                <Menu className="h-4 w-4" />
              </Button>
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

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-transparent relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}