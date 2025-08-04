import { MainLayout } from './main-layout';
import { SimpleStars } from '@/components/ui/simple-stars';

interface CosmicPageLayoutProps {
  children: React.ReactNode;
  starCount?: number;
  parallaxSpeed?: number;
  gradientOverlay?: 'default' | 'purple' | 'blue' | 'green' | 'gold' | 'none';
}

const gradientOverlays = {
  default: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(59, 130, 246, 0.04) 50%, rgba(139, 92, 246, 0.06) 100%)',
  purple: 'linear-gradient(135deg, rgba(139, 92, 246, 0.10) 0%, rgba(59, 130, 246, 0.06) 50%, rgba(16, 185, 129, 0.08) 100%)',
  blue: 'linear-gradient(135deg, rgba(59, 130, 246, 0.10) 0%, rgba(139, 92, 246, 0.06) 50%, rgba(255, 215, 0, 0.08) 100%)',
  green: 'linear-gradient(135deg, rgba(16, 185, 129, 0.10) 0%, rgba(59, 130, 246, 0.06) 50%, rgba(139, 92, 246, 0.08) 100%)',
  gold: 'linear-gradient(135deg, rgba(255, 215, 0, 0.10) 0%, rgba(59, 130, 246, 0.08) 50%, rgba(139, 92, 246, 0.10) 100%)',
  none: 'transparent'
};

export function CosmicPageLayout({ 
  children, 
  starCount = 50, 
  parallaxSpeed = 0.3, 
  gradientOverlay = 'default' 
}: CosmicPageLayoutProps) {
  return (
    <MainLayout>
      {/* Consistent cosmic stars background with parallax */}
      <SimpleStars starCount={starCount} parallaxSpeed={parallaxSpeed} />
      
      {/* Consistent cosmic gradient overlay */}
      <div 
        className="fixed inset-0 pointer-events-none" 
        style={{ 
          background: gradientOverlays[gradientOverlay],
          zIndex: 1
        }}
      />
      
      {/* Main content with proper z-index layering */}
      <div className="relative z-10">
        {children}
      </div>
    </MainLayout>
  );
}