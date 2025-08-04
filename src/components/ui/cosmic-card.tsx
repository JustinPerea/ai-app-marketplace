import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface CosmicCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'featured';
}

export function CosmicCard({ 
  title, 
  description, 
  icon: Icon, 
  iconColor = 'text-glass-gradient',
  children, 
  className = '',
  variant = 'glass'
}: CosmicCardProps) {
  const baseClasses = 'transition-all duration-300 hover:scale-[1.02]';
  
  const variantClasses = {
    default: 'bg-card border-border',
    glass: 'glass-card border-glass-border',
    featured: 'glass-card border-glass-border ring-2 ring-glass-accent/20'
  };

  return (
    <Card className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {(title || description || Icon) && (
        <CardHeader>
          {Icon && (
            <Icon className={`h-8 w-8 ${iconColor} mb-2`} />
          )}
          {title && (
            <CardTitle className="text-text-primary">
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-text-secondary">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}