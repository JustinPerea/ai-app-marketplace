'use client';

interface MissionControlLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export function MissionControlLogo({ size = 64, className = '', animated = true }: MissionControlLogoProps) {
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
          <linearGradient id="launchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FF6B35" />
          </linearGradient>
          <linearGradient id="launchSecondary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="launchAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <radialGradient id="launchGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#FFA500" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="thrustGlow" cx="50%" cy="100%" r="40%">
            <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FFA500" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Background Cosmic Glow */}
        <circle cx="32" cy="32" r="30" fill="url(#launchGlow)" />
        
        {/* Launch Platform Base - Hexagonal */}
        <polygon 
          points="20,45 44,45 48,41 48,37 44,33 20,33 16,37 16,41" 
          fill="url(#launchSecondary)" 
          opacity="0.9"
        />
        
        {/* Platform Surface */}
        <polygon 
          points="22,43 42,43 45,40 45,38 42,35 22,35 19,38 19,40" 
          fill="url(#launchGradient)"
        />
        
        {/* Central Launch Pad */}
        <circle 
          cx="32" 
          cy="39" 
          r="8" 
          fill="url(#launchAccent)" 
          opacity="0.8"
        />
        
        {/* Launch Point Core */}
        <circle 
          cx="32" 
          cy="39" 
          r="4" 
          fill="url(#launchGradient)"
        />
        
        {/* Thrust/Exhaust Effect */}
        <ellipse 
          cx="32" 
          cy="50" 
          rx="6" 
          ry="8" 
          fill="url(#thrustGlow)"
          className={animated ? 'animate-pulse' : ''}
        />
        
        {/* Support Structures */}
        <rect x="18" y="35" width="2" height="8" fill="url(#launchSecondary)" opacity="0.7" />
        <rect x="44" y="35" width="2" height="8" fill="url(#launchSecondary)" opacity="0.7" />
        <rect x="28" y="33" width="2" height="4" fill="url(#launchSecondary)" opacity="0.7" />
        <rect x="34" y="33" width="2" height="4" fill="url(#launchSecondary)" opacity="0.7" />
        
        {/* Launch Platform Indicators */}
        <circle cx="24" cy="39" r="1.5" fill="#FFD700" opacity="0.9" />
        <circle cx="40" cy="39" r="1.5" fill="#FFD700" opacity="0.9" />
        <circle cx="32" cy="35" r="1.5" fill="#FFD700" opacity="0.9" />
        
        {/* Cosmic Energy Rings */}
        <circle 
          cx="32" 
          cy="39" 
          r="12" 
          stroke="url(#launchGradient)" 
          strokeWidth="1" 
          fill="none" 
          opacity="0.5"
          className={animated ? 'animate-pulse' : ''}
        />
        <circle 
          cx="32" 
          cy="39" 
          r="16" 
          stroke="url(#launchAccent)" 
          strokeWidth="0.5" 
          fill="none" 
          opacity="0.3"
          className={animated ? 'animate-pulse' : ''}
          style={{ animationDelay: '0.5s' }}
        />
        
        {/* Mission Trajectory Path */}
        <path 
          d="M32,39 Q28,28 32,20 Q36,28 32,39" 
          stroke="url(#launchGradient)" 
          strokeWidth="1.5" 
          fill="none" 
          opacity="0.6"
          strokeDasharray="2,2"
          className={animated ? 'animate-pulse' : ''}
          style={{ animationDelay: '1s' }}
        />
        
        {/* Launch Destination Marker */}
        <circle 
          cx="32" 
          cy="20" 
          r="3" 
          fill="url(#launchGradient)"
          opacity="0.8"
          className={animated ? 'animate-pulse' : ''}
          style={{ animationDelay: '1.5s' }}
        />
        
        {/* Stellar Navigation Points */}
        <circle cx="14" cy="22" r="1" fill="url(#launchGradient)" opacity="0.7" className={animated ? 'animate-pulse' : ''} />
        <circle cx="50" cy="26" r="1" fill="url(#launchAccent)" opacity="0.7" className={animated ? 'animate-pulse' : ''} style={{ animationDelay: '0.3s' }} />
        <circle cx="18" cy="50" r="0.8" fill="url(#launchSecondary)" opacity="0.6" className={animated ? 'animate-pulse' : ''} style={{ animationDelay: '0.8s' }} />
        <circle cx="46" cy="48" r="0.8" fill="url(#launchSecondary)" opacity="0.6" className={animated ? 'animate-pulse' : ''} style={{ animationDelay: '1.2s' }} />
        <circle cx="12" cy="40" r="0.5" fill="url(#launchGradient)" opacity="0.5" className={animated ? 'animate-pulse' : ''} style={{ animationDelay: '2s' }} />
        <circle cx="52" cy="44" r="0.5" fill="url(#launchAccent)" opacity="0.5" className={animated ? 'animate-pulse' : ''} style={{ animationDelay: '2.5s' }} />
      </svg>
    </div>
  );
}