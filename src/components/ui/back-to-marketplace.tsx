'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import { ChevronLeft, Play } from 'lucide-react';

interface BackToMarketplaceProps {
  className?: string;
  appName?: string;
  categoryName?: string;
  categorySlug?: string;
  onTryDemo?: () => void;
  showBreadcrumbs?: boolean;
  customBreadcrumbs?: BreadcrumbItem[];
}

export function BackToMarketplace({ 
  className = '', 
  appName,
  categoryName,
  categorySlug,
  onTryDemo,
  showBreadcrumbs = false,
  customBreadcrumbs
}: BackToMarketplaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBackToMarketplace = () => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy');
    const viewMode = searchParams.get('viewMode');
    
    let marketplaceUrl = '/marketplace';
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (category && category !== 'all') params.set('category', category);
    if (sortBy && sortBy !== 'popular') params.set('sortBy', sortBy);
    if (viewMode && viewMode !== 'grid') params.set('viewMode', viewMode);
    
    if (params.toString()) {
      marketplaceUrl += '?' + params.toString();
    }
    
    router.push(marketplaceUrl);
  };

  const getMarketplaceUrl = () => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy');
    const viewMode = searchParams.get('viewMode');
    
    let marketplaceUrl = '/marketplace';
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (category && category !== 'all') params.set('category', category);
    if (sortBy && sortBy !== 'popular') params.set('sortBy', sortBy);
    if (viewMode && viewMode !== 'grid') params.set('viewMode', viewMode);
    
    if (params.toString()) {
      marketplaceUrl += '?' + params.toString();
    }
    
    return marketplaceUrl;
  };

  // Generate breadcrumbs if app info is provided
  const breadcrumbs = customBreadcrumbs || (appName && categoryName && categorySlug ? [
    { label: 'Marketplace', href: getMarketplaceUrl() },
    { label: categoryName, href: `/marketplace?category=${categorySlug}` },
    { label: appName }
  ] : []);

  return (
    <div className={`mb-8 ${className}`}>
      {/* Back to Marketplace Button - Glass Design */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBackToMarketplace}
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
      
      {/* Breadcrumb Navigation - Show if enabled and breadcrumbs exist */}
      {showBreadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb 
          items={breadcrumbs}
          className="mb-6"
        />
      )}
    </div>
  );
}