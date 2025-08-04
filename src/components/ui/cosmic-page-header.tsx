import { LucideIcon } from 'lucide-react';

interface CosmicPageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  accentIcon?: LucideIcon;
  badge?: string;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export function CosmicPageHeader({ 
  icon: Icon, 
  title, 
  subtitle, 
  accentIcon: AccentIcon,
  badge,
  maxWidth = '3xl'
}: CosmicPageHeaderProps) {
  const maxWidthClasses = {
    'md': 'max-w-md',
    'lg': 'max-w-lg', 
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl'
  };

  return (
    <div className="text-center mb-16">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="relative">
          <Icon className="h-16 w-16 text-glass-gradient" />
          {AccentIcon && (
            <AccentIcon className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
          )}
        </div>
      </div>
      
      <div className="relative z-10 mb-6">
        <h1 className="text-hero-glass">
          {title}
        </h1>
        {badge && (
          <div className="glass-base px-4 py-2 rounded-full border inline-flex items-center mt-4" 
               style={{ 
                 background: 'rgba(255, 215, 0, 0.1)', 
                 borderColor: 'rgba(255, 215, 0, 0.3)' 
               }}>
            <span className="text-sm font-medium text-text-primary">{badge}</span>
          </div>
        )}
      </div>
      
      <p className={`text-body-lg text-text-secondary leading-relaxed ${maxWidthClasses[maxWidth]} mx-auto`}>
        {subtitle}
      </p>
    </div>
  );
}