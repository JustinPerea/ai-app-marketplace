'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import { ChevronLeft, Play } from 'lucide-react';

interface AppDetailNavigationProps {
  appName: string;
  categoryName: string;
  categorySlug: string;
  onTryDemo?: () => void;
  customBreadcrumbs?: BreadcrumbItem[];
}

export function AppDetailNavigation({ 
  appName, 
  categoryName, 
  categorySlug, 
  onTryDemo,
  customBreadcrumbs 
}: AppDetailNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get preserved search and category params from marketplace
  const getBackToMarketplaceUrl = () => {
    const search = searchParams?.get('search') || undefined;
    const category = searchParams?.get('category') || undefined;
    let url = '/marketplace';
    
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'all') params.append('category', category);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  };

  // Default breadcrumbs if none provided
  const breadcrumbs = customBreadcrumbs || [
    { label: 'Marketplace', href: getBackToMarketplaceUrl() },
    { label: categoryName, href: `/marketplace?category=${categorySlug}` },
    { label: appName }
  ];

  return (
    <div className="mb-8">
      {/* Back to Marketplace Button - Glass Design */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push(getBackToMarketplaceUrl())}
          className="glass-card px-4 py-2 border hover:scale-105 transition-all duration-300 hover:shadow-lg"
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 0.3)'
          }}
        >
          <ChevronLeft className="h-4 w-4 mr-2" style={{ color: '#3B82F6' }} />
          <span style={{ color: '#3B82F6' }}>Back to Marketplace</span>
        </Button>
        
        {/* Contextual Help Button - Only show if onTryDemo is provided */}
        {onTryDemo && (
          <Button 
            variant="outline" 
            size="sm"
            className="glass-card border hover:scale-105 transition-all duration-300"
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              borderColor: 'rgba(139, 92, 246, 0.3)',
              color: '#8B5CF6'
            }}
            onClick={onTryDemo}
          >
            <Play className="h-4 w-4 mr-2" />
            Try Demo
          </Button>
        )}
      </div>
      
      {/* Breadcrumb Navigation */}
      <Breadcrumb 
        items={breadcrumbs}
        className="mb-6"
      />
    </div>
  );
}