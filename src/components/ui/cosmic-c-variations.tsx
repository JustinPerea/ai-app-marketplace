/**
 * COSMARA Cosmic "C" Logo Variations
 * 
 * Enhanced variations of the top 3 concepts: Nebula C, Constellation C, and Cosmic Portal C
 * Includes color and black & white versions for different use cases
 */

import React from 'react';

interface CosmicCVariationProps {
  size?: number;
  className?: string;
  showLabel?: boolean;
  monochrome?: boolean;
}

// NEBULA C VARIATIONS

// Nebula C - Original
export function NebulaCOriginal({ size = 80, className = '', showLabel = false, monochrome = false }: CosmicCVariationProps) {
  const strokeWidth = size * 0.08;
  const radius = size * 0.35;
  
  const colors = monochrome ? {
    primary: '#000000',
    secondary: '#333333',
    accent: '#666666',
    highlight: '#000000'
  } : {
    primary: '#FFD700',
    secondary: '#FF6B35', 
    accent: '#8B5CF6',
    highlight: '#FFF'
  };
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        <defs>
          <radialGradient id={`nebulaGradient-${monochrome ? 'bw' : 'color'}`} cx="40%" cy="40%" r="60%">
            {monochrome ? (
              <>
                <stop offset="0%" stopColor="#000000" stopOpacity="0.9"/>
                <stop offset="30%" stopColor="#333333" stopOpacity="0.7"/>
                <stop offset="60%" stopColor="#666666" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#999999" stopOpacity="0.3"/>
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9"/>
                <stop offset="30%" stopColor="#FF6B35" stopOpacity="0.7"/>
                <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3"/>
              </>
            )}
          </radialGradient>
          
          <filter id={`nebularglow-${monochrome ? 'bw' : 'color'}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Swirling Nebula Background */}
        <circle 
          cx={size * 0.45} 
          cy={size * 0.5} 
          r={radius * 1.2} 
          fill={`url(#nebulaGradient-${monochrome ? 'bw' : 'color'})`}
          opacity="0.6"
          filter={`url(#nebularglow-${monochrome ? 'bw' : 'color'})`}
          className="animate-pulse"
          style={{ animationDuration: '4s' }}
        />

        {/* Letter C Structure */}
        <path
          d={`M ${size * 0.7} ${size * 0.25} 
             A ${radius} ${radius} 0 1 0 ${size * 0.7} ${size * 0.75}`}
          fill="none"
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          filter={`url(#nebularglow-${monochrome ? 'bw' : 'color'})`}
        />

        {/* Inner C Highlight */}
        <path
          d={`M ${size * 0.65} ${size * 0.3} 
             A ${radius * 0.7} ${radius * 0.7} 0 1 0 ${size * 0.65} ${size * 0.7}`}
          fill="none"
          stroke={monochrome ? '#FFFFFF' : '#FFF'}
          strokeWidth={strokeWidth * 0.3}
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Cosmic Dust Particles */}
        <g fill={colors.primary} opacity="0.7">
          <circle cx={size * 0.3} cy={size * 0.3} r="1.5" className="animate-pulse" style={{ animationDelay: '0s', animationDuration: '3s' }}/>
          <circle cx={size * 0.25} cy={size * 0.6} r="1" className="animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }}/>
          <circle cx={size * 0.35} cy={size * 0.75} r="1.5" className="animate-pulse" style={{ animationDelay: '2s', animationDuration: '3s' }}/>
          <circle cx={size * 0.8} cy={size * 0.4} r="1" className="animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '3s' }}/>
          <circle cx={size * 0.75} cy={size * 0.65} r="1.2" className="animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '3s' }}/>
        </g>
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Nebula C {monochrome ? '(B&W)' : '(Color)'}
        </div>
      )}
    </div>
  );
}

// Nebula C - Dense variation (more particles, tighter nebula)
export function NebulaCDense({ size = 80, className = '', showLabel = false, monochrome = false }: CosmicCVariationProps) {
  const strokeWidth = size * 0.08;
  const radius = size * 0.35;
  
  const colors = monochrome ? {
    primary: '#000000',
    secondary: '#333333',
    accent: '#666666'
  } : {
    primary: '#FFD700',
    secondary: '#FF6B35', 
    accent: '#8B5CF6'
  };
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        <defs>
          <radialGradient id={`denseNebulaGradient-${monochrome ? 'bw' : 'color'}`} cx="40%" cy="40%" r="50%">
            {monochrome ? (
              <>
                <stop offset="0%" stopColor="#000000" stopOpacity="0.95"/>
                <stop offset="20%" stopColor="#333333" stopOpacity="0.8"/>
                <stop offset="40%" stopColor="#666666" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#999999" stopOpacity="0.2"/>
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.95"/>
                <stop offset="20%" stopColor="#FF6B35" stopOpacity="0.8"/>
                <stop offset="40%" stopColor="#8B5CF6" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2"/>
              </>
            )}
          </radialGradient>
        </defs>

        {/* Dense Nebula Background */}
        <ellipse 
          cx={size * 0.45} 
          cy={size * 0.5} 
          rx={radius * 1.0} 
          ry={radius * 0.8}
          fill={`url(#denseNebulaGradient-${monochrome ? 'bw' : 'color'})`}
          opacity="0.8"
          className="animate-pulse"
          style={{ animationDuration: '5s' }}
        />

        {/* Letter C Structure - Thicker */}
        <path
          d={`M ${size * 0.7} ${size * 0.25} 
             A ${radius} ${radius} 0 1 0 ${size * 0.7} ${size * 0.75}`}
          fill="none"
          stroke={colors.primary}
          strokeWidth={strokeWidth * 1.2}
          strokeLinecap="round"
        />

        {/* Dense Particle Field */}
        <g fill={colors.primary} opacity="0.8">
          {/* More particles in tighter formation */}
          <circle cx={size * 0.28} cy={size * 0.35} r="1.2" className="animate-pulse" style={{ animationDelay: '0s', animationDuration: '2.5s' }}/>
          <circle cx={size * 0.32} cy={size * 0.45} r="0.8" className="animate-pulse" style={{ animationDelay: '0.3s', animationDuration: '2.5s' }}/>
          <circle cx={size * 0.25} cy={size * 0.55} r="1.5" className="animate-pulse" style={{ animationDelay: '0.6s', animationDuration: '2.5s' }}/>
          <circle cx={size * 0.35} cy={size * 0.65} r="1" className="animate-pulse" style={{ animationDelay: '0.9s', animationDuration: '2.5s' }}/>
          <circle cx={size * 0.4} cy={size * 0.3} r="0.9" className="animate-pulse" style={{ animationDelay: '1.2s', animationDuration: '2.5s' }}/>
          <circle cx={size * 0.38} cy={size * 0.7} r="1.3" className="animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '2.5s' }}/>
          <circle cx={size * 0.82} cy={size * 0.35} r="0.7" className="animate-pulse" style={{ animationDelay: '1.8s', animationDuration: '2.5s' }}/>
          <circle cx={size * 0.78} cy={size * 0.65} r="1.1" className="animate-pulse" style={{ animationDelay: '2.1s', animationDuration: '2.5s' }}/>
        </g>
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Dense Nebula C {monochrome ? '(B&W)' : '(Color)'}
        </div>
      )}
    </div>
  );
}

// Nebula C - Minimal variation (cleaner, less busy)
export function NebulaCMinimal({ size = 80, className = '', showLabel = false, monochrome = false }: CosmicCVariationProps) {
  const strokeWidth = size * 0.08;
  const radius = size * 0.35;
  
  const colors = monochrome ? {
    primary: '#000000',
    secondary: '#666666'
  } : {
    primary: '#FFD700',
    secondary: '#8B5CF6'
  };
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        <defs>
          <radialGradient id={`minimalNebulaGradient-${monochrome ? 'bw' : 'color'}`} cx="40%" cy="50%" r="40%">
            {monochrome ? (
              <>
                <stop offset="0%" stopColor="#333333" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#666666" stopOpacity="0.1"/>
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1"/>
              </>
            )}
          </radialGradient>
        </defs>

        {/* Subtle Nebula Background */}
        <circle 
          cx={size * 0.42} 
          cy={size * 0.5} 
          r={radius * 0.9} 
          fill={`url(#minimalNebulaGradient-${monochrome ? 'bw' : 'color'})`}
          opacity="0.5"
        />

        {/* Clean Letter C */}
        <path
          d={`M ${size * 0.7} ${size * 0.25} 
             A ${radius} ${radius} 0 1 0 ${size * 0.7} ${size * 0.75}`}
          fill="none"
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Minimal Accent Points */}
        <g fill={colors.primary} opacity="0.9">
          <circle cx={size * 0.7} cy={size * 0.25} r="2.5"/>
          <circle cx={size * 0.7} cy={size * 0.75} r="2.5"/>
        </g>
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Minimal Nebula C {monochrome ? '(B&W)' : '(Color)'}
        </div>
      )}
    </div>
  );
}

// CONSTELLATION C VARIATIONS

// Constellation C - Original
export function ConstellationCOriginal({ size = 80, className = '', showLabel = false, monochrome = false }: CosmicCVariationProps) {
  const radius = size * 0.35;
  
  const colors = monochrome ? {
    primary: '#000000',
    lines: '#333333',
    highlight: '#FFFFFF'
  } : {
    primary: '#FFD700',
    lines: '#FFD700',
    highlight: '#FFF'
  };
  
  // Calculate star positions along C curve
  const stars = [
    { x: size * 0.7, y: size * 0.25, size: 3 },
    { x: size * 0.55, y: size * 0.15, size: 2 },
    { x: size * 0.4, y: size * 0.2, size: 2.5 },
    { x: size * 0.25, y: size * 0.35, size: 2 },
    { x: size * 0.2, y: size * 0.5, size: 3.5 }, // Center star
    { x: size * 0.25, y: size * 0.65, size: 2 },
    { x: size * 0.4, y: size * 0.8, size: 2.5 },
    { x: size * 0.55, y: size * 0.85, size: 2 },
    { x: size * 0.7, y: size * 0.75, size: 3 },
  ];

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        <defs>
          <filter id={`starGlow-${monochrome ? 'bw' : 'color'}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Connection Lines */}
        <g stroke={colors.lines} strokeWidth="1.5" fill="none" opacity={monochrome ? "0.8" : "0.6"}>
          {stars.slice(0, -1).map((star, i) => (
            <line 
              key={i}
              x1={star.x} 
              y1={star.y} 
              x2={stars[i + 1].x} 
              y2={stars[i + 1].y}
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.3}s`, animationDuration: '2s' }}
            />
          ))}
        </g>

        {/* Stars forming the C */}
        <g fill={colors.primary} filter={`url(#starGlow-${monochrome ? 'bw' : 'color'})`}>
          {stars.map((star, i) => (
            <circle 
              key={i}
              cx={star.x} 
              cy={star.y} 
              r={star.size}
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.2}s`, animationDuration: '3s' }}
            />
          ))}
        </g>

        {/* Center highlight on main star */}
        <circle 
          cx={size * 0.2} 
          cy={size * 0.5} 
          r="2"
          fill={colors.highlight}
          opacity="0.9"
          className="animate-pulse"
          style={{ animationDuration: '2s' }}
        />
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Constellation C {monochrome ? '(B&W)' : '(Color)'}
        </div>
      )}
    </div>
  );
}

// Constellation C - Simplified (fewer stars, stronger connections)
export function ConstellationCSimplified({ size = 80, className = '', showLabel = false, monochrome = false }: CosmicCVariationProps) {
  const colors = monochrome ? {
    primary: '#000000',
    lines: '#333333',
    highlight: '#FFFFFF'
  } : {
    primary: '#FFD700',
    lines: '#FFD700',
    highlight: '#FFF'
  };
  
  // Simplified star positions (5 key stars)
  const stars = [
    { x: size * 0.7, y: size * 0.25, size: 4 },
    { x: size * 0.35, y: size * 0.15, size: 3 },
    { x: size * 0.18, y: size * 0.5, size: 5 }, // Center star - largest
    { x: size * 0.35, y: size * 0.85, size: 3 },
    { x: size * 0.7, y: size * 0.75, size: 4 },
  ];

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {/* Stronger Connection Lines */}
        <g stroke={colors.lines} strokeWidth="2.5" fill="none" opacity={monochrome ? "0.9" : "0.7"}>
          {stars.slice(0, -1).map((star, i) => (
            <line 
              key={i}
              x1={star.x} 
              y1={star.y} 
              x2={stars[i + 1].x} 
              y2={stars[i + 1].y}
            />
          ))}
        </g>

        {/* Key Stars */}
        <g fill={colors.primary}>
          {stars.map((star, i) => (
            <circle 
              key={i}
              cx={star.x} 
              cy={star.y} 
              r={star.size}
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.4}s`, animationDuration: '3s' }}
            />
          ))}
        </g>

        {/* Center star highlight */}
        <circle 
          cx={size * 0.18} 
          cy={size * 0.5} 
          r="3"
          fill={colors.highlight}
          opacity="0.8"
        />
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Simplified Constellation C {monochrome ? '(B&W)' : '(Color)'}
        </div>
      )}
    </div>
  );
}

// Constellation C - Binary (two main star groups)
export function ConstellationCBinary({ size = 80, className = '', showLabel = false, monochrome = false }: CosmicCVariationProps) {
  const colors = monochrome ? {
    primary: '#000000',
    secondary: '#333333',
    lines: '#666666'
  } : {
    primary: '#FFD700',
    secondary: '#FF6B35',
    lines: '#8B5CF6'
  };
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {/* Connection Arc */}
        <path
          d={`M ${size * 0.7} ${size * 0.25} 
             A ${size * 0.35} ${size * 0.35} 0 1 0 ${size * 0.7} ${size * 0.75}`}
          fill="none"
          stroke={colors.lines}
          strokeWidth="2"
          strokeDasharray="3,2"
          opacity="0.6"
        />

        {/* Top Star Cluster */}
        <g fill={colors.primary}>
          <circle cx={size * 0.7} cy={size * 0.25} r="4" className="animate-pulse" style={{ animationDuration: '2s' }}/>
          <circle cx={size * 0.62} cy={size * 0.22} r="2.5" className="animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '2s' }}/>
          <circle cx={size * 0.68} cy={size * 0.32} r="2" className="animate-pulse" style={{ animationDelay: '1s', animationDuration: '2s' }}/>
        </g>

        {/* Bottom Star Cluster */}
        <g fill={colors.secondary}>
          <circle cx={size * 0.7} cy={size * 0.75} r="4" className="animate-pulse" style={{ animationDuration: '2s' }}/>
          <circle cx={size * 0.62} cy={size * 0.78} r="2.5" className="animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '2s' }}/>
          <circle cx={size * 0.68} cy={size * 0.68} r="2" className="animate-pulse" style={{ animationDelay: '1s', animationDuration: '2s' }}/>
        </g>

        {/* Central Navigation Point */}
        <circle 
          cx={size * 0.25} 
          cy={size * 0.5} 
          r="3"
          fill={colors.primary}
          className="animate-pulse"
          style={{ animationDuration: '1.5s' }}
        />
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Binary Constellation C {monochrome ? '(B&W)' : '(Color)'}
        </div>
      )}
    </div>
  );
}

// COSMIC PORTAL C VARIATIONS

// Cosmic Portal C - Original
export function CosmicPortalCOriginal({ size = 80, className = '', showLabel = false, monochrome = false }: CosmicCVariationProps) {
  const strokeWidth = size * 0.06;
  const radius = size * 0.35;
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        <defs>
          <radialGradient id={`portalGradient-${monochrome ? 'bw' : 'color'}`} cx="30%" cy="50%" r="70%">
            {monochrome ? (
              <>
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9"/>
                <stop offset="20%" stopColor="#CCCCCC" stopOpacity="0.8"/>
                <stop offset="50%" stopColor="#666666" stopOpacity="0.6"/>
                <stop offset="80%" stopColor="#333333" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#000000" stopOpacity="0.2"/>
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#FFF" stopOpacity="0.9"/>
                <stop offset="20%" stopColor="#FFD700" stopOpacity="0.8"/>
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6"/>
                <stop offset="80%" stopColor="#3B82F4" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.2"/>
              </>
            )}
          </radialGradient>
          
          <filter id={`portalGlow-${monochrome ? 'bw' : 'color'}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Portal Background */}
        <ellipse 
          cx={size * 0.4} 
          cy={size * 0.5} 
          rx={radius * 1.1} 
          ry={radius * 0.9}
          fill={`url(#portalGradient-${monochrome ? 'bw' : 'color'})`}
          filter={`url(#portalGlow-${monochrome ? 'bw' : 'color'})`}
          className="animate-pulse"
          style={{ animationDuration: '5s' }}
        />

        {/* Multiple C Rings for Depth */}
        <g fill="none" strokeLinecap="round">
          {/* Outer C */}
          <path
            d={`M ${size * 0.75} ${size * 0.22} 
               A ${radius * 1.1} ${radius * 1.1} 0 1 0 ${size * 0.75} ${size * 0.78}`}
            stroke={monochrome ? '#000000' : '#FFD700'}
            strokeWidth={strokeWidth}
            opacity="0.9"
          />
          
          {/* Middle C */}
          <path
            d={`M ${size * 0.68} ${size * 0.28} 
               A ${radius * 0.85} ${radius * 0.85} 0 1 0 ${size * 0.68} ${size * 0.72}`}
            stroke={monochrome ? '#333333' : '#FF6B35'}
            strokeWidth={strokeWidth * 0.8}
            opacity="0.7"
          />
          
          {/* Inner C */}
          <path
            d={`M ${size * 0.62} ${size * 0.34} 
               A ${radius * 0.6} ${radius * 0.6} 0 1 0 ${size * 0.62} ${size * 0.66}`}
            stroke={monochrome ? '#666666' : '#8B5CF6'}
            strokeWidth={strokeWidth * 0.6}
            opacity="0.6"
          />
        </g>

        {/* Central Light Core */}
        <circle 
          cx={size * 0.35} 
          cy={size * 0.5} 
          r={size * 0.08}
          fill={monochrome ? '#FFFFFF' : '#FFF'}
          filter={`url(#portalGlow-${monochrome ? 'bw' : 'color'})`}
          className="animate-pulse"
          style={{ animationDuration: '3s' }}
        />
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Cosmic Portal C {monochrome ? '(B&W)' : '(Color)'}
        </div>
      )}
    </div>
  );
}

// Cosmic Portal C - Dimensional (more rings, deeper effect)
export function CosmicPortalCDimensional({ size = 80, className = '', showLabel = false, monochrome = false }: CosmicCVariationProps) {
  const strokeWidth = size * 0.04;
  const radius = size * 0.35;
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {/* Multiple Portal Rings */}
        <g fill="none" strokeLinecap="round">
          {[1.2, 1.0, 0.85, 0.7, 0.55, 0.4].map((scale, i) => (
            <path
              key={i}
              d={`M ${size * (0.75 - i * 0.02)} ${size * (0.2 + i * 0.02)} 
                 A ${radius * scale} ${radius * scale} 0 1 0 ${size * (0.75 - i * 0.02)} ${size * (0.8 - i * 0.02)}`}
              stroke={monochrome ? 
                `rgba(${51 * (6-i)}, ${51 * (6-i)}, ${51 * (6-i)}, ${0.9 - i * 0.1})` : 
                i % 2 === 0 ? '#FFD700' : '#8B5CF6'
              }
              strokeWidth={strokeWidth * (1.5 - i * 0.15)}
              opacity={0.9 - i * 0.1}
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.3}s`, animationDuration: '4s' }}
            />
          ))}
        </g>

        {/* Dimensional Core */}
        <circle 
          cx={size * 0.32} 
          cy={size * 0.5} 
          r={size * 0.12}
          fill={monochrome ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.8)'}
          className="animate-pulse"
          style={{ animationDuration: '2s' }}
        />
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Dimensional Portal C {monochrome ? '(B&W)' : '(Color)'}
        </div>
      )}
    </div>
  );
}

// Cosmic Portal C - Wormhole (rotating effect)
export function CosmicPortalCWormhole({ size = 80, className = '', showLabel = false, monochrome = false }: CosmicCVariationProps) {
  const strokeWidth = size * 0.05;
  const radius = size * 0.35;
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        <defs>
          <radialGradient id={`wormholeGradient-${monochrome ? 'bw' : 'color'}`} cx="35%" cy="50%" r="50%">
            {monochrome ? (
              <>
                <stop offset="0%" stopColor="#000000" stopOpacity="0.1"/>
                <stop offset="50%" stopColor="#333333" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#666666" stopOpacity="0.9"/>
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.1"/>
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.9"/>
              </>
            )}
          </radialGradient>
        </defs>

        {/* Wormhole Background */}
        <circle 
          cx={size * 0.4} 
          cy={size * 0.5} 
          r={radius * 1.1}
          fill={`url(#wormholeGradient-${monochrome ? 'bw' : 'color'})`}
          className="animate-spin"
          style={{ animationDuration: '15s' }}
        />

        {/* Spiraling C Structure */}
        <g fill="none" strokeLinecap="round">
          <path
            d={`M ${size * 0.72} ${size * 0.24} 
               A ${radius * 1.05} ${radius * 1.05} 0 1 0 ${size * 0.72} ${size * 0.76}`}
            stroke={monochrome ? '#000000' : '#FFD700'}
            strokeWidth={strokeWidth * 1.2}
            strokeDasharray="8,4"
            opacity="0.9"
            className="animate-spin"
            style={{ animationDuration: '20s', animationDirection: 'reverse' }}
          />
          
          <path
            d={`M ${size * 0.66} ${size * 0.3} 
               A ${radius * 0.8} ${radius * 0.8} 0 1 0 ${size * 0.66} ${size * 0.7}`}
            stroke={monochrome ? '#333333' : '#8B5CF6'}
            strokeWidth={strokeWidth * 0.9}
            strokeDasharray="6,3"
            opacity="0.7"
            className="animate-spin"
            style={{ animationDuration: '25s' }}
          />
        </g>

        {/* Central Vortex */}
        <circle 
          cx={size * 0.35} 
          cy={size * 0.5} 
          r={size * 0.06}
          fill={monochrome ? '#FFFFFF' : '#FFF'}
          className="animate-pulse"
          style={{ animationDuration: '1.5s' }}
        />
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Wormhole Portal C {monochrome ? '(B&W)' : '(Color)'}
        </div>
      )}
    </div>
  );
}

// Showcase Component for all variations
export function CosmicCVariationsShowcase({ className = '' }: { className?: string }) {
  return (
    <div className={`p-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl ${className}`}>
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        COSMARA Cosmic "C" Variations & B&W Versions
      </h2>
      
      {/* NEBULA C VARIATIONS */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-center mb-6 text-gray-700">Nebula C Variations</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {/* Color Versions */}
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
            <NebulaCOriginal size={80} />
            <div className="text-xs text-center mt-2 text-gray-600">Original</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
            <NebulaCDense size={80} />
            <div className="text-xs text-center mt-2 text-gray-600">Dense</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
            <NebulaCMinimal size={80} />
            <div className="text-xs text-center mt-2 text-gray-600">Minimal</div>
          </div>
          
          {/* B&W Versions */}
          <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-sm">
            <NebulaCOriginal size={80} monochrome={true} />
            <div className="text-xs text-center mt-2 text-gray-600">Original B&W</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-sm">
            <NebulaCDense size={80} monochrome={true} />
            <div className="text-xs text-center mt-2 text-gray-600">Dense B&W</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-sm">
            <NebulaCMinimal size={80} monochrome={true} />
            <div className="text-xs text-center mt-2 text-gray-600">Minimal B&W</div>
          </div>
        </div>
      </div>

      {/* CONSTELLATION C VARIATIONS */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-center mb-6 text-gray-700">Constellation C Variations</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {/* Color Versions */}
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
            <ConstellationCOriginal size={80} />
            <div className="text-xs text-center mt-2 text-gray-600">Original</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
            <ConstellationCSimplified size={80} />
            <div className="text-xs text-center mt-2 text-gray-600">Simplified</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
            <ConstellationCBinary size={80} />
            <div className="text-xs text-center mt-2 text-gray-600">Binary</div>
          </div>
          
          {/* B&W Versions */}
          <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-sm">
            <ConstellationCOriginal size={80} monochrome={true} />
            <div className="text-xs text-center mt-2 text-gray-600">Original B&W</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-sm">
            <ConstellationCSimplified size={80} monochrome={true} />
            <div className="text-xs text-center mt-2 text-gray-600">Simplified B&W</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-sm">
            <ConstellationCBinary size={80} monochrome={true} />
            <div className="text-xs text-center mt-2 text-gray-600">Binary B&W</div>
          </div>
        </div>
      </div>

      {/* COSMIC PORTAL C VARIATIONS */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-center mb-6 text-gray-700">Cosmic Portal C Variations</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {/* Color Versions */}
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
            <CosmicPortalCOriginal size={80} />
            <div className="text-xs text-center mt-2 text-gray-600">Original</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
            <CosmicPortalCDimensional size={80} />
            <div className="text-xs text-center mt-2 text-gray-600">Dimensional</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
            <CosmicPortalCWormhole size={80} />
            <div className="text-xs text-center mt-2 text-gray-600">Wormhole</div>
          </div>
          
          {/* B&W Versions */}
          <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-sm">
            <CosmicPortalCOriginal size={80} monochrome={true} />
            <div className="text-xs text-center mt-2 text-gray-600">Original B&W</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-sm">
            <CosmicPortalCDimensional size={80} monochrome={true} />
            <div className="text-xs text-center mt-2 text-gray-600">Dimensional B&W</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-sm">
            <CosmicPortalCWormhole size={80} monochrome={true} />
            <div className="text-xs text-center mt-2 text-gray-600">Wormhole B&W</div>
          </div>
        </div>
      </div>

      {/* Scalability Test */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Size & Usage Testing</h3>
        <div className="grid grid-cols-3 gap-8">
          <div className="text-center">
            <h4 className="font-medium mb-3">Large (120px)</h4>
            <div className="space-y-4">
              <NebulaCOriginal size={120} />
              <ConstellationCSimplified size={120} />
              <CosmicPortalCOriginal size={120} />
            </div>
          </div>
          
          <div className="text-center">
            <h4 className="font-medium mb-3">Medium (64px)</h4>
            <div className="space-y-4">
              <NebulaCOriginal size={64} />
              <ConstellationCSimplified size={64} />
              <CosmicPortalCOriginal size={64} />
            </div>
          </div>
          
          <div className="text-center">
            <h4 className="font-medium mb-3">Small (32px)</h4>
            <div className="space-y-4">
              <NebulaCOriginal size={32} />
              <ConstellationCSimplified size={32} />
              <CosmicPortalCOriginal size={32} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p className="font-medium">Logo Variations for Different Use Cases:</p>
        <p>• Color versions for digital applications • B&W for print/monochrome • Multiple variations for brand flexibility</p>
      </div>
    </div>
  );
}