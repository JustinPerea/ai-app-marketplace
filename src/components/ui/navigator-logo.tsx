'use client';

interface NavigatorLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export function NavigatorLogo({ size = 64, className = '', animated = true }: NavigatorLogoProps) {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animated ? 'group-hover:scale-110 transition-transform duration-300' : ''}
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="navigatorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="navigatorAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
          <radialGradient id="navigatorGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Glow Effect */}
        <circle cx="32" cy="32" r="28" fill="url(#navigatorGlow)" />
        
        {/* Cosmic Compass Ring - Outer */}
        <circle 
          cx="32" 
          cy="32" 
          r="26" 
          stroke="url(#navigatorGradient)" 
          strokeWidth="2" 
          fill="none" 
          opacity="0.4"
        />
        
        {/* Cosmic Compass Ring - Inner */}
        <circle 
          cx="32" 
          cy="32" 
          r="20" 
          stroke="url(#navigatorGradient)" 
          strokeWidth="1.5" 
          fill="none" 
          opacity="0.6"
        />
        
        {/* Navigation Points - Cardinal Directions */}
        {/* North */}
        <path 
          d="M32 8 L28 16 L32 14 L36 16 Z" 
          fill="url(#navigatorAccent)"
          opacity="0.9"
        />
        {/* East */}
        <path 
          d="M56 32 L48 28 L50 32 L48 36 Z" 
          fill="url(#navigatorGradient)"
          opacity="0.8"
        />
        {/* South */}
        <path 
          d="M32 56 L36 48 L32 50 L28 48 Z" 
          fill="url(#navigatorGradient)"
          opacity="0.8"
        />
        {/* West */}
        <path 
          d="M8 32 L16 36 L14 32 L16 28 Z" 
          fill="url(#navigatorGradient)"
          opacity="0.8"
        />
        
        {/* Central Navigation Hub */}
        <circle 
          cx="32" 
          cy="32" 
          r="8" 
          fill="url(#navigatorGradient)"
          opacity="0.8"
        />
        
        {/* Central Compass Core */}
        <circle 
          cx="32" 
          cy="32" 
          r="4" 
          fill="url(#navigatorAccent)"
        />
        
        {/* Navigation Needle */}
        <path 
          d="M32 24 L30 32 L32 28 L34 32 Z" 
          fill="url(#navigatorAccent)"
          className={animated ? 'origin-center animate-spin' : ''}
          style={{ animationDuration: '20s' }}
        />
        
        {/* Constellation Navigation Points */}
        <g opacity="0.7">
          {/* North-East Constellation */}
          <circle cx="44" cy="20" r="1.5" fill="url(#navigatorAccent)" className={animated ? 'animate-pulse' : ''} />
          <circle cx="46" cy="18" r="1" fill="url(#navigatorAccent)" className={animated ? 'animate-pulse' : ''} style={{ animationDelay: '0.5s' }} />
          <line x1="44" y1="20" x2="46" y2="18" stroke="url(#navigatorAccent)" strokeWidth="0.5" opacity="0.6" />
          
          {/* South-West Constellation */}
          <circle cx="20" cy="44" r="1.5" fill="url(#navigatorGradient)" className={animated ? 'animate-pulse' : ''} style={{ animationDelay: '1s' }} />
          <circle cx="18" cy="46" r="1" fill="url(#navigatorGradient)" className={animated ? 'animate-pulse' : ''} style={{ animationDelay: '1.5s' }} />
          <line x1="20" y1="44" x2="18" y2="46" stroke="url(#navigatorGradient)" strokeWidth="0.5" opacity="0.6" />
        </g>
        
        {/* Navigation Markers */}
        <g opacity="0.6">
          <rect x="31" y="6" width="2" height="4" rx="1" fill="url(#navigatorAccent)" />
          <rect x="31" y="54" width="2" height="4" rx="1" fill="url(#navigatorGradient)" />
          <rect x="6" y="31" width="4" height="2" rx="1" fill="url(#navigatorGradient)" />
          <rect x="54" y="31" width="4" height="2" rx="1" fill="url(#navigatorGradient)" />
        </g>
        
        {/* Cosmic Navigation Trails */}
        <path 
          d="M 14 14 Q 32 8 50 14 Q 56 32 50 50 Q 32 56 14 50 Q 8 32 14 14" 
          stroke="url(#navigatorGradient)" 
          strokeWidth="0.5" 
          fill="none" 
          opacity="0.3"
          strokeDasharray="2,2"
          className={animated ? 'animate-pulse' : ''}
        />
      </svg>
    </div>
  );
}