/**
 * COSMARA Cosmic "C" Logo Concepts
 * 
 * Letter-based logo designs with cosmic/nebula themes
 * Designed for standalone brand recognition
 */

import React from 'react';

interface CosmicCLogoProps {
  size?: number;
  className?: string;
  showLabel?: boolean;
}

// Concept 1: Nebula C with Swirling Cosmic Dust
export function NebulaC({ size = 80, className = '', showLabel = false }: CosmicCLogoProps) {
  const strokeWidth = size * 0.08;
  const radius = size * 0.35;
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {/* Nebula Background */}
        <defs>
          <radialGradient id="nebulaGradient" cx="58%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9"/>
            <stop offset="30%" stopColor="#FF6B35" stopOpacity="0.7"/>
            <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3"/>
          </radialGradient>
          
          <filter id="nebularglow" x="-50%" y="-50%" width="200%" height="200%">
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
          fill="url(#nebulaGradient)"
          opacity="0.6"
          filter="url(#nebularglow)"
          className="animate-pulse"
          style={{ animationDuration: '4s' }}
        />

        {/* Letter C Structure */}
        <path
          d={`M ${size * 0.7} ${size * 0.25} 
             A ${radius} ${radius} 0 1 0 ${size * 0.7} ${size * 0.75}`}
          fill="none"
          stroke="#FFD700"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          filter="url(#nebularglow)"
        />

        {/* Inner C Highlight */}
        <path
          d={`M ${size * 0.65} ${size * 0.3} 
             A ${radius * 0.7} ${radius * 0.7} 0 1 0 ${size * 0.65} ${size * 0.7}`}
          fill="none"
          stroke="#FFF"
          strokeWidth={strokeWidth * 0.3}
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Cosmic Dust Particles */}
        <g fill="#FFD700" opacity="0.7">
          <circle cx={size * 0.3} cy={size * 0.3} r="1.5" className="animate-pulse" style={{ animationDelay: '0s', animationDuration: '3s' }}/>
          <circle cx={size * 0.25} cy={size * 0.6} r="1" className="animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }}/>
          <circle cx={size * 0.35} cy={size * 0.75} r="1.5" className="animate-pulse" style={{ animationDelay: '2s', animationDuration: '3s' }}/>
          <circle cx={size * 0.8} cy={size * 0.4} r="1" className="animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '3s' }}/>
          <circle cx={size * 0.75} cy={size * 0.65} r="1.2" className="animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '3s' }}/>
        </g>
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Nebula C
          <div className="text-xs text-gray-500">Swirling cosmic dust • Ethereal</div>
        </div>
      )}
    </div>
  );
}

// Concept 2: Constellation C with Connected Stars
export function ConstellationC({ size = 80, className = '', showLabel = false }: CosmicCLogoProps) {
  const radius = size * 0.35;
  
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
          <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Connection Lines */}
        <g stroke="#FFD700" strokeWidth="1.5" fill="none" opacity="0.6">
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
        <g fill="#FFD700" filter="url(#starGlow)">
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
          fill="#FFF"
          opacity="0.9"
          className="animate-pulse"
          style={{ animationDuration: '2s' }}
        />
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Constellation C
          <div className="text-xs text-gray-500">Connected stars • Navigation theme</div>
        </div>
      )}
    </div>
  );
}

// Concept 3: Cosmic Portal C
export function CosmicPortalC({ size = 80, className = '', showLabel = false }: CosmicPortalC) {
  const strokeWidth = size * 0.06;
  const radius = size * 0.35;
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        <defs>
          <radialGradient id="portalGradient" cx="30%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#FFF" stopOpacity="0.9"/>
            <stop offset="20%" stopColor="#FFD700" stopOpacity="0.8"/>
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6"/>
            <stop offset="80%" stopColor="#3B82F6" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.2"/>
          </radialGradient>
          
          <filter id="portalGlow" x="-50%" y="-50%" width="200%" height="200%">
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
          fill="url(#portalGradient)"
          filter="url(#portalGlow)"
          className="animate-pulse"
          style={{ animationDuration: '5s' }}
        />

        {/* Multiple C Rings for Depth */}
        <g fill="none" strokeLinecap="round">
          {/* Outer C */}
          <path
            d={`M ${size * 0.75} ${size * 0.22} 
               A ${radius * 1.1} ${radius * 1.1} 0 1 0 ${size * 0.75} ${size * 0.78}`}
            stroke="#FFD700"
            strokeWidth={strokeWidth}
            opacity="0.9"
          />
          
          {/* Middle C */}
          <path
            d={`M ${size * 0.68} ${size * 0.28} 
               A ${radius * 0.85} ${radius * 0.85} 0 1 0 ${size * 0.68} ${size * 0.72}`}
            stroke="#FF6B35"
            strokeWidth={strokeWidth * 0.8}
            opacity="0.7"
          />
          
          {/* Inner C */}
          <path
            d={`M ${size * 0.62} ${size * 0.34} 
               A ${radius * 0.6} ${radius * 0.6} 0 1 0 ${size * 0.62} ${size * 0.66}`}
            stroke="#8B5CF6"
            strokeWidth={strokeWidth * 0.6}
            opacity="0.6"
          />
        </g>

        {/* Central Light Core */}
        <circle 
          cx={size * 0.35} 
          cy={size * 0.5} 
          r={size * 0.08}
          fill="#FFF"
          filter="url(#portalGlow)"
          className="animate-pulse"
          style={{ animationDuration: '3s' }}
        />
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Cosmic Portal C
          <div className="text-xs text-gray-500">Dimensional depth • Gateway theme</div>
        </div>
      )}
    </div>
  );
}

// Cosmic Portal C Variations
// Variation 1: Deep Space Portal C - Darker, more mysterious
export function DeepSpacePortalC({ size = 80, className = '', showLabel = false }: CosmicCLogoProps) {
  const strokeWidth = size * 0.06;
  const radius = size * 0.35;
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        <defs>
          <radialGradient id="deepPortalGradient" cx="30%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#FFF" stopOpacity="0.9"/>
            <stop offset="15%" stopColor="#FFD700" stopOpacity="0.8"/>
            <stop offset="35%" stopColor="#FF6B35" stopOpacity="0.7"/>
            <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.5"/>
            <stop offset="85%" stopColor="#1E1B4B" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#0F0A1A" stopOpacity="0.1"/>
          </radialGradient>
          
          <filter id="deepPortalGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Deep Portal Background */}
        <ellipse 
          cx={size * 0.4} 
          cy={size * 0.5} 
          rx={radius * 1.3} 
          ry={radius * 1.0}
          fill="url(#deepPortalGradient)"
          filter="url(#deepPortalGlow)"
          className="animate-pulse"
          style={{ animationDuration: '6s' }}
        />

        {/* Multiple C Rings with Enhanced Depth */}
        <g fill="none" strokeLinecap="round">
          {/* Outer C - Bright */}
          <path
            d={`M ${size * 0.75} ${size * 0.20} 
               A ${radius * 1.15} ${radius * 1.15} 0 1 0 ${size * 0.75} ${size * 0.80}`}
            stroke="#FFD700"
            strokeWidth={strokeWidth * 1.1}
            opacity="0.95"
            className="animate-pulse"
            style={{ animationDelay: '0s', animationDuration: '4s' }}
          />
          
          {/* Middle C - Orange */}
          <path
            d={`M ${size * 0.67} ${size * 0.26} 
               A ${radius * 0.88} ${radius * 0.88} 0 1 0 ${size * 0.67} ${size * 0.74}`}
            stroke="#FF6B35"
            strokeWidth={strokeWidth * 0.9}
            opacity="0.8"
            className="animate-pulse"
            style={{ animationDelay: '1s', animationDuration: '4s' }}
          />
          
          {/* Inner C - Purple */}
          <path
            d={`M ${size * 0.60} ${size * 0.32} 
               A ${radius * 0.65} ${radius * 0.65} 0 1 0 ${size * 0.60} ${size * 0.68}`}
            stroke="#8B5CF6"
            strokeWidth={strokeWidth * 0.7}
            opacity="0.7"
            className="animate-pulse"
            style={{ animationDelay: '2s', animationDuration: '4s' }}
          />
          
          {/* Innermost C - Blue */}
          <path
            d={`M ${size * 0.54} ${size * 0.37} 
               A ${radius * 0.45} ${radius * 0.45} 0 1 0 ${size * 0.54} ${size * 0.63}`}
            stroke="#3B82F6"
            strokeWidth={strokeWidth * 0.5}
            opacity="0.6"
            className="animate-pulse"
            style={{ animationDelay: '3s', animationDuration: '4s' }}
          />
        </g>

        {/* Enhanced Central Light Core */}
        <circle 
          cx={size * 0.33} 
          cy={size * 0.5} 
          r={size * 0.1}
          fill="#FFF"
          filter="url(#deepPortalGlow)"
          className="animate-pulse"
          style={{ animationDuration: '2s' }}
        />
        
        {/* Inner bright core */}
        <circle 
          cx={size * 0.33} 
          cy={size * 0.5} 
          r={size * 0.06}
          fill="#FFD700"
          opacity="0.9"
        />
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Deep Space Portal C
          <div className="text-xs text-gray-500">Enhanced depth • Mysterious gateway</div>
        </div>
      )}
    </div>
  );
}

// Variation 2: Energy Vortex Portal C - More dynamic with swirling effects
export function EnergyVortexPortalC({ size = 80, className = '', showLabel = false }: CosmicCLogoProps) {
  const strokeWidth = size * 0.06;
  const radius = size * 0.35;
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        <defs>
          <radialGradient id="vortexGradient" cx="35%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#FFF" stopOpacity="1.0"/>
            <stop offset="10%" stopColor="#FFD700" stopOpacity="0.9"/>
            <stop offset="30%" stopColor="#FF6B35" stopOpacity="0.8"/>
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6"/>
            <stop offset="70%" stopColor="#3B82F6" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.2"/>
          </radialGradient>
          
          <filter id="vortexGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Rotating Vortex Background */}
        <ellipse 
          cx={size * 0.38} 
          cy={size * 0.5} 
          rx={radius * 1.2} 
          ry={radius * 0.85}
          fill="url(#vortexGradient)"
          filter="url(#vortexGlow)"
          className="animate-spin"
          style={{ animationDuration: '12s' }}
        />

        {/* Swirling C Rings */}
        <g fill="none" strokeLinecap="round">
          {/* Outer C - Counter-rotating */}
          <path
            d={`M ${size * 0.76} ${size * 0.21} 
               A ${radius * 1.12} ${radius * 1.12} 0 1 0 ${size * 0.76} ${size * 0.79}`}
            stroke="#FFD700"
            strokeWidth={strokeWidth * 1.0}
            opacity="0.9"
            className="animate-pulse"
            style={{ animationDelay: '0s', animationDuration: '3s' }}
          />
          
          {/* Middle C */}
          <path
            d={`M ${size * 0.68} ${size * 0.27} 
               A ${radius * 0.87} ${radius * 0.87} 0 1 0 ${size * 0.68} ${size * 0.73}`}
            stroke="#FF6B35"
            strokeWidth={strokeWidth * 0.85}
            opacity="0.8"
            className="animate-pulse"
            style={{ animationDelay: '0.5s', animationDuration: '3s' }}
          />
          
          {/* Inner C */}
          <path
            d={`M ${size * 0.61} ${size * 0.33} 
               A ${radius * 0.62} ${radius * 0.62} 0 1 0 ${size * 0.61} ${size * 0.67}`}
            stroke="#8B5CF6"
            strokeWidth={strokeWidth * 0.7}
            opacity="0.7"
            className="animate-pulse"
            style={{ animationDelay: '1s', animationDuration: '3s' }}
          />
        </g>

        {/* Energy Swirls */}
        <g stroke="#FFD700" strokeWidth="1.5" fill="none" opacity="0.6">
          <path 
            d={`M ${size * 0.25} ${size * 0.4} Q ${size * 0.35} ${size * 0.35} ${size * 0.45} ${size * 0.4}`}
            className="animate-pulse"
            style={{ animationDelay: '0s', animationDuration: '2s' }}
          />
          <path 
            d={`M ${size * 0.25} ${size * 0.6} Q ${size * 0.35} ${size * 0.65} ${size * 0.45} ${size * 0.6}`}
            className="animate-pulse"
            style={{ animationDelay: '1s', animationDuration: '2s' }}
          />
        </g>

        {/* Bright Central Core */}
        <circle 
          cx={size * 0.34} 
          cy={size * 0.5} 
          r={size * 0.09}
          fill="#FFF"
          filter="url(#vortexGlow)"
          className="animate-pulse"
          style={{ animationDuration: '1.5s' }}
        />
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Energy Vortex Portal C
          <div className="text-xs text-gray-500">Dynamic swirls • Energy gateway</div>
        </div>
      )}
    </div>
  );
}

// Variation 3: Minimalist Portal C - Clean and professional
export function MinimalistPortalC({ size = 80, className = '', showLabel = false }: CosmicCLogoProps) {
  const strokeWidth = size * 0.08;
  const radius = size * 0.35;
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        <defs>
          <radialGradient id="minimalPortalGradient" cx="40%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF" stopOpacity="0.8"/>
            <stop offset="40%" stopColor="#FFD700" stopOpacity="0.6"/>
            <stop offset="80%" stopColor="#8B5CF6" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1"/>
          </radialGradient>
          
          <filter id="minimalGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Subtle Portal Background */}
        <circle 
          cx={size * 0.42} 
          cy={size * 0.5} 
          r={radius * 0.8} 
          fill="url(#minimalPortalGradient)"
          opacity="0.5"
          filter="url(#minimalGlow)"
        />

        {/* Clean C Rings */}
        <g fill="none" strokeLinecap="round">
          {/* Outer C */}
          <path
            d={`M ${size * 0.72} ${size * 0.24} 
               A ${radius * 1.05} ${radius * 1.05} 0 1 0 ${size * 0.72} ${size * 0.76}`}
            stroke="#FFD700"
            strokeWidth={strokeWidth}
            opacity="0.9"
          />
          
          {/* Inner C */}
          <path
            d={`M ${size * 0.64} ${size * 0.32} 
               A ${radius * 0.75} ${radius * 0.75} 0 1 0 ${size * 0.64} ${size * 0.68}`}
            stroke="#8B5CF6"
            strokeWidth={strokeWidth * 0.6}
            opacity="0.7"
          />
        </g>

        {/* Simple Central Point */}
        <circle 
          cx={size * 0.38} 
          cy={size * 0.5} 
          r={size * 0.05}
          fill="#FFD700"
          filter="url(#minimalGlow)"
        />
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Minimalist Portal C
          <div className="text-xs text-gray-500">Clean design • Professional gateway</div>
        </div>
      )}
    </div>
  );
}

// Variation 4: Quantum Portal C - Futuristic with geometric elements
export function QuantumPortalC({ size = 80, className = '', showLabel = false }: CosmicCLogoProps) {
  const strokeWidth = size * 0.05;
  const radius = size * 0.35;
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        <defs>
          <radialGradient id="quantumPortalGradient" cx="35%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#FFF" stopOpacity="0.9"/>
            <stop offset="25%" stopColor="#00FFFF" stopOpacity="0.8"/>
            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.7"/>
            <stop offset="75%" stopColor="#8B5CF6" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.2"/>
          </radialGradient>
          
          <filter id="quantumGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Quantum Field Background */}
        <polygon 
          points={`${size * 0.25},${size * 0.35} ${size * 0.55},${size * 0.25} ${size * 0.6},${size * 0.5} ${size * 0.55},${size * 0.75} ${size * 0.25},${size * 0.65}`}
          fill="url(#quantumPortalGradient)"
          opacity="0.4"
          filter="url(#quantumGlow)"
          className="animate-pulse"
          style={{ animationDuration: '4s' }}
        />

        {/* Geometric C Rings */}
        <g fill="none" strokeLinecap="round">
          {/* Outer C with segments */}
          <path
            d={`M ${size * 0.74} ${size * 0.22} 
               A ${radius * 1.08} ${radius * 1.08} 0 0 0 ${size * 0.58} ${size * 0.15}
               M ${size * 0.52} ${size * 0.18}
               A ${radius * 1.08} ${radius * 1.08} 0 0 0 ${size * 0.2} ${size * 0.5}
               A ${radius * 1.08} ${radius * 1.08} 0 0 0 ${size * 0.52} ${size * 0.82}
               M ${size * 0.58} ${size * 0.85}
               A ${radius * 1.08} ${radius * 1.08} 0 0 0 ${size * 0.74} ${size * 0.78}`}
            stroke="#00FFFF"
            strokeWidth={strokeWidth * 1.2}
            opacity="0.9"
            strokeDasharray="3,2"
            className="animate-pulse"
            style={{ animationDelay: '0s', animationDuration: '3s' }}
          />
          
          {/* Middle C */}
          <path
            d={`M ${size * 0.66} ${size * 0.28} 
               A ${radius * 0.82} ${radius * 0.82} 0 1 0 ${size * 0.66} ${size * 0.72}`}
            stroke="#FFD700"
            strokeWidth={strokeWidth * 0.9}
            opacity="0.8"
          />
          
          {/* Inner C */}
          <path
            d={`M ${size * 0.59} ${size * 0.34} 
               A ${radius * 0.58} ${radius * 0.58} 0 1 0 ${size * 0.59} ${size * 0.66}`}
            stroke="#8B5CF6"
            strokeWidth={strokeWidth * 0.7}
            opacity="0.7"
          />
        </g>

        {/* Quantum Core with geometric shape */}
        <polygon 
          points={`${size * 0.35},${size * 0.45} ${size * 0.4},${size * 0.47} ${size * 0.4},${size * 0.53} ${size * 0.35},${size * 0.55} ${size * 0.3},${size * 0.53} ${size * 0.3},${size * 0.47}`}
          fill="#00FFFF"
          filter="url(#quantumGlow)"
          className="animate-pulse"
          style={{ animationDuration: '2s' }}
        />
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Quantum Portal C
          <div className="text-xs text-gray-500">Futuristic geometry • Quantum gateway</div>
        </div>
      )}
    </div>
  );
}

// COSMARA Complete Logo with Portal C as "O" - WITH ALIGNMENT GRID
export function CosmarcPortalLogo({ size = 200, className = '', showLabel = false, showGrid = false }: CosmicCLogoProps & { showGrid?: boolean }) {
  const strokeWidth = size * 0.03;
  const radius = size * 0.18;
  const fontSize = size * 0.12;
  const letterSpacing = size * 0.02;
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`} className="drop-shadow-lg">
        <defs>
          <radialGradient id="cosmaraPortalGradient" cx="30%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#FFF" stopOpacity="0.9"/>
            <stop offset="20%" stopColor="#FFD700" stopOpacity="0.8"/>
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6"/>
            <stop offset="80%" stopColor="#3B82F6" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.2"/>
          </radialGradient>
          
          <filter id="cosmaraPortalGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="textBlur"/>
            <feMerge> 
              <feMergeNode in="textBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Alignment Grid System (when showGrid is true) */}
        {showGrid && (
          <g opacity="0.5">
            {/* Calculate actual C center position */}
            {(() => {
              const cCenterX = size * 0.08 + radius * 1.15; // Actual portal center X
              const portalTransformY = size * 0.1; // Portal C transform Y position
              const cCenterY = portalTransformY + radius * 1.4; // Actual cosmic "O" center position
              
              return (
                <>
                  {/* Main crosshairs at actual C center */}
                  <line x1={cCenterX - size * 0.05} y1={cCenterY} x2={cCenterX + size * 0.05} y2={cCenterY} stroke="#00FF00" strokeWidth="2" strokeDasharray="4,4"/>
                  <line x1={cCenterX} y1={cCenterY - size * 0.05} x2={cCenterX} y2={cCenterY + size * 0.05} stroke="#00FF00" strokeWidth="2" strokeDasharray="4,4"/>
                  
                  {/* C opening center guide circles at actual position */}
                  <circle cx={cCenterX} cy={cCenterY} r={radius * 1.2} fill="none" stroke="#FF0000" strokeWidth="2" strokeDasharray="5,5"/>
                  <circle cx={cCenterX} cy={cCenterY} r={radius * 1.5} fill="none" stroke="#FF0000" strokeWidth="2" strokeDasharray="5,5"/>
                  <circle cx={cCenterX} cy={cCenterY} r={radius * 1.8} fill="none" stroke="#FF0000" strokeWidth="2" strokeDasharray="5,5"/>
                  
                  {/* Center point marker at actual position */}
                  <circle cx={cCenterX} cy={cCenterY} r="3" fill="#FF0000"/>
                  
                  {/* Grid lines for alignment */}
                  <line x1="0" y1={cCenterY - radius} x2={size} y2={cCenterY - radius} stroke="#0000FF" strokeWidth="1" opacity="0.4"/>
                  <line x1="0" y1={cCenterY} x2={size} y2={cCenterY} stroke="#0000FF" strokeWidth="1" opacity="0.4"/>
                  <line x1="0" y1={cCenterY + radius} x2={size} y2={cCenterY + radius} stroke="#0000FF" strokeWidth="1" opacity="0.4"/>
                  
                  {/* Vertical alignment guides */}
                  <line x1={cCenterX - radius} y1="0" x2={cCenterX - radius} y2={size * 0.6} stroke="#0000FF" strokeWidth="1" opacity="0.4"/>
                  <line x1={cCenterX} y1="0" x2={cCenterX} y2={size * 0.6} stroke="#0000FF" strokeWidth="1" opacity="0.4"/>
                  <line x1={cCenterX + radius} y1="0" x2={cCenterX + radius} y2={size * 0.6} stroke="#0000FF" strokeWidth="1" opacity="0.4"/>
                  
                  {/* Labels */}
                  <text x={cCenterX + 5} y={cCenterY - 5} fontSize="10" fill="#FF0000" fontFamily="monospace" fontWeight="bold">CENTER</text>
                  
                  {/* "O" Text Space Grid - showing where O would be in text flow */}
                  <rect 
                    x={size * 0.28} 
                    y={size * 0.32} 
                    width={fontSize * 0.8} 
                    height={fontSize * 1.2} 
                    fill="none" 
                    stroke="#00FFFF" 
                    strokeWidth="2" 
                    strokeDasharray="3,3"
                    opacity="0.7"
                  />
                  <text x={size * 0.32} y={size * 0.3} fontSize="8" fill="#00FFFF" fontFamily="monospace" fontWeight="bold">O SPACE</text>
                </>
              );
            })()}
          </g>
        )}

        {/* "C" - Cosmic Portal C - SIMPLIFIED VERSION */}
        <g transform={`translate(${size * 0.0}, ${size * 0.1})`}>
          {/* Simplified Portal Background - Subtle circular glow */}
          <circle 
            cx={radius * 1.15} 
            cy={radius * 1.4} 
            r={radius * 0.8} 
            fill="url(#cosmaraPortalGradient)"
            opacity="0.3"
            filter="url(#cosmaraPortalGlow)"
            className="animate-pulse"
            style={{ animationDuration: '6s' }}
          />

          {/* Simplified C Rings - Only 2 rings for cleaner look */}
          <g fill="none" strokeLinecap="round">
            {/* Outer C - Main golden ring */}
            <path
              d={`M ${radius * 2.1} ${radius * 0.7} 
                 A ${radius * 1.1} ${radius * 1.1} 0 1 0 ${radius * 2.1} ${radius * 2.1}`}
              stroke="#FFD700"
              strokeWidth={strokeWidth * 1.2}
              opacity="0.95"
            />
            
            {/* Inner C - Subtle accent */}
            <path
              d={`M ${radius * 1.8} ${radius * 0.95} 
                 A ${radius * 0.75} ${radius * 0.75} 0 1 0 ${radius * 1.8} ${radius * 1.85}`}
              stroke="#FF6B35"
              strokeWidth={strokeWidth * 0.6}
              opacity="0.5"
            />
          </g>

          {/* Simplified Central Core - Brighter and cleaner */}
          <circle 
            cx={radius * 1.15} 
            cy={radius * 1.4} 
            r={radius * 0.2}
            fill="#FFF"
            filter="url(#cosmaraPortalGlow)"
            className="animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          
          {/* Inner core glow */}
          <circle 
            cx={radius * 1.15} 
            cy={radius * 1.4} 
            r={radius * 0.12}
            fill="#FFD700"
            opacity="0.8"
          />
        </g>

        {/* "COSMARA" Text - Portal C as "O" */}
        <g fill="#FFD700" filter="url(#textGlow)" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold">
          {/* "S" */}
          <text 
            x={size * 0.38} 
            y={size * 0.4} 
            fontSize={fontSize}
            textAnchor="middle"
          >S</text>
          
          {/* "M" */}
          <text 
            x={size * 0.48} 
            y={size * 0.4} 
            fontSize={fontSize}
            textAnchor="middle"
          >M</text>
          
          {/* "A" */}
          <text 
            x={size * 0.58} 
            y={size * 0.4} 
            fontSize={fontSize}
            textAnchor="middle"
          >A</text>
          
          {/* "R" */}
          <text 
            x={size * 0.68} 
            y={size * 0.4} 
            fontSize={fontSize}
            textAnchor="middle"
          >R</text>
          
          {/* "A" */}
          <text 
            x={size * 0.78} 
            y={size * 0.4} 
            fontSize={fontSize}
            textAnchor="middle"
          >A</text>
        </g>
      </svg>
      {showLabel && (
        <div className="mt-4 text-sm font-medium text-center text-gray-600">
          COSMARA Complete Logo
          <div className="text-xs text-gray-500">Portal C as "O" • Integrated text design</div>
        </div>
      )}
    </div>
  );
}

// REFINED COSMARA LOGO SYSTEM - Research-Based Improvements
interface CosmarcLogoProps extends CosmicCLogoProps {
  showGrid?: boolean;
  variant?: 'primary' | 'minimal' | 'professional' | 'monochrome' | 'reverse' | 'cosmic' | 'enterprise' | 'stellar' | 'aurora' | 'sunset';
  rings?: 2 | 3;
}

// Research-Optimized Portal C - 2 Ring Version
export function CosmarcPortalRefined2Ring({ size = 200, className = '', showLabel = false, showGrid = false, variant = 'primary' }: CosmarcLogoProps) {
  // Edge-to-edge spacing fix applied - debug grid available
  const debugGrid = showGrid;
  const strokeWidth = size * 0.04;
  const radius = size * 0.18;
  const fontSize = size * 0.12;
  
  // Consistent spacing system - optimized for visual balance
  const spacingUnit = fontSize * 0.85; // Reference spacing unit for consistent gaps
  const portalCenterX = radius * 1.15; // Portal C center X within group
  const portalCenterY = radius * 1.4;  // Portal C center Y within group
  
  // MATHEMATICAL BREAKDOWN - Ring-to-Ring Spacing Analysis (200px logo)
  // Blue Outer Ring: center=36px, stroke=9.6px, inner edge=31.2px, outer edge=40.8px
  // Orange Inner Ring: center=25.2px, stroke=6.4px, inner edge=22px, outer edge=28.4px
  // Ring-to-ring gap: 31.2px - 28.4px = 2.8px (measured from blue inner to orange outer)
  //
  // CORRECTED CALCULATION: For text "C" positioning INSIDE orange ring with matching 2.8px spacing:
  
  // Step 1: Calculate orange ring's actual inner edge position
  // Orange ring center radius: radius * 0.7 = 25.2px at 200px
  // Orange stroke extends inward by: (strokeWidth * 0.8) / 2 = 3.2px at 200px  
  // So inner edge is at: center - radius + stroke_inward = portalCenterX - 25.2 + 3.2
  const orangeRingCenterRadius = radius * 0.7; // 25.2px at 200px
  const orangeStrokeHalfWidth = (strokeWidth * 0.8) / 2; // 3.2px at 200px
  const orangeRingLeftInnerEdge = portalCenterX - orangeRingCenterRadius + orangeStrokeHalfWidth;
  
  // Step 2: SIMPLIFIED APPROACH - Position text "C" left edge exactly 2.8px from orange inner edge
  // Since we know the current center position gives us wrong edge spacing, let's work backwards
  // Current: Orange inner at X=31, want left edge at X=33.8 (31+2.8)
  // If character is ~fontSize*0.4 wide, then center should be at leftEdge + width/2
  // But let's be more direct: position the center to achieve the desired left edge spacing
  
  const targetGap = size * 0.02; // Increased for more visible spacing (4px gap base)  
  
  // DIRECT CALCULATION: If orange inner is at X=31 and we want 2.8px gap,
  // then text left edge should be at X=33.8
  // DIRECT APPROACH: Move text significantly to the right to create obvious spacing
  // Add a large offset to ensure visible spacing
  const characterWidth = fontSize * 0.35;
  const textCLeftEdge = 35.54 + 19.564; // Direct left edge positioning + offset to align with orange ring grid
  const textCPosition = textCLeftEdge; // Same for textAnchor="start"
  
  // Calculate cosmic "O" position with 0.12em gap from right edge of "C"
  const actualCharWidth = fontSize * 0.8; // Increased to account for actual "C" character width
  const textCRightEdge = textCLeftEdge + actualCharWidth;
  const cosmicOLeftEdge = textCRightEdge + (fontSize * 0.12); // 0.12em gap matching SMARA spacing
  const cosmicORadius = fontSize * 0.55;
  const cosmicOCenterX = cosmicOLeftEdge + cosmicORadius;
  
  // Calculate "S" text position with 0.12em gap from right edge of cosmic "O" (matching SMARA internal spacing)
  const cosmicORightEdge = cosmicOLeftEdge + (cosmicORadius * 2);
  const textSLeftEdge = cosmicORightEdge + (fontSize * 0.12); // 0.12em = fontSize * 0.12
  const textSPosition = textSLeftEdge;
  
  // Calculate "M" text position with 4.5px gap from right edge of "S"
  const textSCharWidth = fontSize * 0.71; // Adjusted based on actual rendering (27.3px for fontSize=38.4)
  const textSRightEdge = textSLeftEdge + textSCharWidth;
  const textMLeftEdge = textSRightEdge + 4.5;
  const textMPosition = textMLeftEdge;
  const estimatedCharWidth = fontSize * 0.4; // For display calculations
  
  // DEBUG: Verify calculations (size=400)
  console.log('Aurora Logo Debug - size:', size);
  console.log('targetGap (should be 5.6px for size=400):', targetGap);
  console.log('orangeRingLeftInnerEdge:', orangeRingLeftInnerEdge);
  console.log('fontSize * 0.2 offset:', fontSize * 0.2);
  console.log('textCPosition (final):', textCPosition);
  console.log('Calculated gap (textCPosition - orangeRingLeftInnerEdge):', textCPosition - orangeRingLeftInnerEdge);
  
  // For measurement display
  const textCLeftEdgePosition = textCPosition - (fontSize * 0.2); // Approximate left edge
  const textCRightEdgePosition = textCLeftEdgePosition + estimatedCharWidth;
  const cosmicOLeftEdgePosition = textCRightEdgePosition + targetGap;
  const cosmicOCenterY = portalCenterY; // Cosmic O center Y (same as portal center)
  const textBaselineY = cosmicOCenterY + fontSize * 0.35; // Text baseline relative to cosmic O center
  
  // Color variants following brand style guide
  const colorSchemes = {
    primary: {
      outerRing: 'url(#cosmaraOrangeGradient)',
      innerRing: '#8B5CF6', 
      core: '#FFFACD',
      coreAccent: '#FFE135',
      text: 'url(#cosmaraOrangeGradient)',
      background: 'url(#cosmaraPortalGradient)',
      cosmicO: '#000000'
    },
    minimal: {
      outerRing: '#FFD700',
      innerRing: '#FFD700',
      core: '#FFF',
      coreAccent: '#FFD700',
      text: '#FFD700',
      background: 'transparent',
      cosmicO: '#000000'
    },
    professional: {
      outerRing: '#2D3748',
      innerRing: '#4A5568',
      core: '#FFD700',
      coreAccent: '#FFF',
      text: '#2D3748',
      background: 'transparent',
      cosmicO: '#000000'
    },
    monochrome: {
      outerRing: '#000',
      innerRing: '#666',
      core: '#000',
      coreAccent: '#FFF',
      text: '#000',
      background: 'transparent',
      cosmicO: '#000000'
    },
    reverse: {
      outerRing: '#FFF',
      innerRing: '#E2E8F0',
      core: '#FFF',
      coreAccent: '#FFD700',
      text: '#FFF',
      background: 'transparent',
      cosmicO: '#FFFFFF'
    },
    cosmic: {
      outerRing: 'url(#stellarPurpleGradient)',
      innerRing: 'url(#cosmaraOrangeGradient)',
      core: '#FFD700',
      coreAccent: '#FFFFFF',
      text: 'url(#stellarPurpleGradient)',
      background: 'transparent',
      cosmicO: '#000000'
    },
    enterprise: {
      outerRing: 'url(#goldToWhiteGradient)',
      innerRing: '#8B5CF6',
      core: '#FFFFFF',
      coreAccent: '#FFD700',
      text: 'url(#goldToWhiteGradient)',
      background: 'transparent',
      cosmicO: '#000000'
    },
    stellar: {
      outerRing: '#FFD700',
      innerRing: 'url(#stellarPurpleGradient)',
      core: '#FFFFFF',
      coreAccent: '#8B5CF6',
      text: '#FFD700',
      background: 'transparent',
      cosmicO: '#000000'
    },
    aurora: {
      outerRing: 'url(#cosmicBlueGradient)',
      innerRing: 'url(#cosmaraOrangeGradient)',
      core: 'transparent',
      coreAccent: 'transparent',
      text: 'url(#cosmaraUnifiedTextGradient)',
      background: 'transparent',
      cosmicO: 'url(#cosmaraOrangeGradient)'
    },
    sunset: {
      outerRing: 'url(#cosmaraOrangeGradient)',
      innerRing: '#FFD700',
      core: '#FFFFFF',
      coreAccent: '#FF6B35',
      text: 'url(#cosmaraOrangeGradient)',
      background: 'transparent',
      cosmicO: '#000000'
    }
  };
  
  const colors = colorSchemes[variant];
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg 
        width={(() => {
          // Calculate actual logo bounds - SMARA text extends to fontSize * 3.8 as used in gradient
          const minX = portalCenterX - radius * 1.0 - strokeWidth * 1.2 / 2; // Portal C outer ring left edge
          const maxX = textSPosition + fontSize * 3.8; // SMARA text right edge (matches gradient calculation)
          const logoWidth = maxX - minX;
          return logoWidth * 1.24; // 12% padding on each side
        })()} 
        height={(() => {
          // Calculate actual logo bounds with accurate measurements
          const minY = portalCenterY - radius * 1.0 - strokeWidth * 1.2 / 2; // Portal C outer ring top edge
          const maxY = portalCenterY + radius * 1.0 + strokeWidth * 1.2 / 2; // Portal C outer ring bottom edge
          const logoHeight = maxY - minY;
          return logoHeight * 1.24; // 12% padding on top/bottom
        })()} 
        viewBox={`0 0 ${(() => {
          const minX = portalCenterX - radius * 1.0 - strokeWidth * 1.2 / 2;
          const maxX = textSPosition + fontSize * 3.8; // SMARA text right edge (matches gradient calculation)
          const logoWidth = maxX - minX;
          return logoWidth * 1.24;
        })()} ${(() => {
          const minY = portalCenterY - radius * 1.0 - strokeWidth * 1.2 / 2;
          const maxY = portalCenterY + radius * 1.0 + strokeWidth * 1.2 / 2;
          const logoHeight = maxY - minY;
          return logoHeight * 1.24;
        })()}`}>
        <defs>
          <radialGradient id="cosmaraPortalGradient2Ring" cx="30%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#FFF" stopOpacity="0.9"/>
            <stop offset="40%" stopColor="#FFD700" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2"/>
          </radialGradient>
          
          <linearGradient id="cosmaraOrangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700"/>
            <stop offset="50%" stopColor="#FFA500"/>
            <stop offset="100%" stopColor="#FF6B35"/>
          </linearGradient>
          
          <radialGradient id="cosmaraOrangeRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700"/>
            <stop offset="50%" stopColor="#FFA500"/>
            <stop offset="100%" stopColor="#FF6B35"/>
          </radialGradient>
          
          <linearGradient id="cosmicBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6"/>
            <stop offset="50%" stopColor="#1E40AF"/>
            <stop offset="100%" stopColor="#1E3A8A"/>
          </linearGradient>
          
          <linearGradient id="whiteCoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF"/>
            <stop offset="50%" stopColor="#F8FAFC"/>
            <stop offset="100%" stopColor="#E2E8F0"/>
          </linearGradient>
          
          <linearGradient id="stellarPurpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7"/>
            <stop offset="50%" stopColor="#8B5CF6"/>
            <stop offset="100%" stopColor="#7C3AED"/>
          </linearGradient>
          
          <linearGradient id="goldToWhiteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700"/>
            <stop offset="100%" stopColor="#FFFFFF"/>
          </linearGradient>
          
          <linearGradient id="cosmaraUnifiedTextGradient" x1={textCPosition} y1={textBaselineY} x2={textSPosition + fontSize * 3.8} y2={textBaselineY} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFD700"/>
            <stop offset="50%" stopColor="#FFA500"/>
            <stop offset="100%" stopColor="#FF6B35"/>
          </linearGradient>
          
          <filter id="portalGlow2Ring" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="textGlow2Ring" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="textBlur"/>
            <feMerge> 
              <feMergeNode in="textBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>


        {/* Unified Aurora Full Logo Group - All elements move together - ACCURATE BOUNDS CENTERED */}
        <g transform={`translate(${(() => {
          // Calculate position using accurate bounds with 12% padding
          const minX = portalCenterX - radius * 1.0 - strokeWidth * 1.2 / 2;
          const maxX = textSPosition + fontSize * 3.8; // SMARA text right edge (matches gradient calculation)
          const logoWidth = maxX - minX;
          const svgWidth = logoWidth * 1.24;
          const padding = (svgWidth - logoWidth) / 2;
          return padding - minX;
        })()}, ${(() => {
          // Calculate Y position using accurate bounds with 12% padding
          const minY = portalCenterY - radius * 1.0 - strokeWidth * 1.2 / 2;
          const maxY = portalCenterY + radius * 1.0 + strokeWidth * 1.2 / 2;
          const logoHeight = maxY - minY;
          const svgHeight = logoHeight * 1.24;
          const padding = (svgHeight - logoHeight) / 2;
          return padding - minY;
        })()})`}>

          {/* Portal C - 2-Ring System - CLEAN ELEMENTS ONLY */}

          <g fill="none" strokeLinecap="round">
            {/* Outer Portal Ring - White stroke for background compatibility */}
            <path
              d={`M ${portalCenterX + radius * 1.0 * Math.cos(-Math.PI * 0.25)} ${portalCenterY + radius * 1.0 * Math.sin(-Math.PI * 0.25)} 
                 A ${radius * 1.0} ${radius * 1.0} 0 1 0 ${portalCenterX + radius * 1.0 * Math.cos(Math.PI * 0.25)} ${portalCenterY + radius * 1.0 * Math.sin(Math.PI * 0.25)}`}
              stroke="#FFFFFF"
              strokeWidth={strokeWidth * 1.2 + 2}
              opacity="0.8"
            />
            <path
              d={`M ${portalCenterX + radius * 1.0 * Math.cos(-Math.PI * 0.25)} ${portalCenterY + radius * 1.0 * Math.sin(-Math.PI * 0.25)} 
                 A ${radius * 1.0} ${radius * 1.0} 0 1 0 ${portalCenterX + radius * 1.0 * Math.cos(Math.PI * 0.25)} ${portalCenterY + radius * 1.0 * Math.sin(Math.PI * 0.25)}`}
              stroke={colors.outerRing}
              strokeWidth={strokeWidth * 1.2}
              opacity="0.9"
            />
            
            {/* Inner Portal Ring - White stroke for background compatibility */}
            <path
              d={`M ${portalCenterX + radius * 0.7 * Math.cos(-Math.PI * 0.25)} ${portalCenterY + radius * 0.7 * Math.sin(-Math.PI * 0.25)} 
                 A ${radius * 0.7} ${radius * 0.7} 0 1 0 ${portalCenterX + radius * 0.7 * Math.cos(Math.PI * 0.25)} ${portalCenterY + radius * 0.7 * Math.sin(Math.PI * 0.25)}`}
              stroke="#FFFFFF"
              strokeWidth={strokeWidth * 0.8 + 2}
              opacity="0.8"
            />
            <path
              d={`M ${portalCenterX + radius * 0.7 * Math.cos(-Math.PI * 0.25)} ${portalCenterY + radius * 0.7 * Math.sin(-Math.PI * 0.25)} 
                 A ${radius * 0.7} ${radius * 0.7} 0 1 0 ${portalCenterX + radius * 0.7 * Math.cos(Math.PI * 0.25)} ${portalCenterY + radius * 0.7 * Math.sin(Math.PI * 0.25)}`}
              stroke={colors.innerRing}
              strokeWidth={strokeWidth * 0.8}
              opacity="0.8"
            />
          </g>
          

          {/* Cosmic "O" - White stroke for background compatibility */}
          <circle cx={cosmicOCenterX} cy={cosmicOCenterY} r={fontSize * 0.55} fill="none" stroke="#FFFFFF" strokeWidth={fontSize * 0.08 + 1} opacity="0.8"/>
          <circle cx={cosmicOCenterX} cy={cosmicOCenterY} r={fontSize * 0.55} fill="none" stroke={colors.cosmicO || '#000000'} strokeWidth={fontSize * 0.08} opacity="0.8"/>


          {/* COSMARA Text - White strokes for background compatibility */}
          <g fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" fontWeight="600">
            {/* Text C - White stroke */}
            <text x={textCPosition} y={textBaselineY} fontSize={fontSize * 1.1} textAnchor="start" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.9">C</text>
            <text x={textCPosition} y={textBaselineY} fontSize={fontSize * 1.1} textAnchor="start" fill={colors.text}>C</text>
            
            {/* Text SMARA - White stroke */}
            <text x={textSPosition} y={textBaselineY} fontSize={fontSize * 1.1} textAnchor="start" letterSpacing="0.12em" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.9">SMARA</text>
            <text x={textSPosition} y={textBaselineY} fontSize={fontSize * 1.1} textAnchor="start" letterSpacing="0.12em" fill={colors.text}>SMARA</text>
          </g>

        </g>
      </svg>
      {showLabel && (
        <div className="mt-4 text-sm font-medium text-center text-gray-600">
          2-Ring Portal (Research Optimized)
          <div className="text-xs text-gray-500">{variant} variant • Enhanced scalability</div>
        </div>
      )}
    </div>
  );
}

// Aurora Icon Version - Portal C + Cosmic O Only (No Text)
// IDENTICAL to Aurora full logo positioning but without text letters
export function CosmarcAuroraIcon({ size = 120, className = '', showLabel = false }: CosmarcLogoProps) {
  const strokeWidth = size * 0.04; // Increased for better scalability
  const radius = size * 0.18; // Reverted back to proper size
  const fontSize = size * 0.12;
  
  // Calculated positioning for perfect grid alignment - SAME AS FULL AURORA LOGO
  const portalTransformY = size * 0.1; // Portal C transform Y position
  const cosmicOCenterY = portalTransformY + radius * 1.4; // Actual cosmic "O" center position
  const textBaselineY = cosmicOCenterY + fontSize * 0.35; // Align text baseline with cosmic "O" center
  const portalCenterX = size * 0.0 + radius * 1.15; // Portal C center for text positioning
  
  // Aurora color scheme - IDENTICAL to full Aurora logo (using same gradient IDs)
  const colors = {
    outerRing: 'url(#cosmicBlueGradient)',
    innerRing: 'url(#cosmaraOrangeGradient)',
    core: '#FFFFFF',
    coreAccent: '#FFD700',
    text: 'url(#cosmaraOrangeGradient)',
    background: 'transparent',
    cosmicO: 'url(#cosmaraOrangeGradient)'
  };
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {/* DEBUG: SVG boundary box with center lines and measurements */}
        <rect x="0" y="0" width={size} height={size} fill="none" stroke="#0000ff" strokeWidth="2" strokeDasharray="5,5" />
        
        {/* Logo Content Center Lines */}
        {(() => {
          // Calculate actual center of logo content (Portal C + Cosmic O)
          const portalCenterX = size * 0.1 - 10 + radius * 1.15; // Portal C center X
          const cosmicOCenterX = size * 0.1 - 10 + radius * 1.15 + fontSize * 1.0; // Cosmic O center X  
          const contentCenterX = (portalCenterX + cosmicOCenterX) / 2; // Midpoint between Portal C and Cosmic O
          
          const contentTopY = size * 0.1; // Top of Portal C
          const contentBottomY = size * 0.1 + radius * 1.4 + fontSize * 0.6; // Bottom of cosmic O
          const contentCenterY = (contentTopY + contentBottomY) / 2; // Vertical center of content
          
          return (
            <g stroke="#ff0000" strokeWidth="2" strokeDasharray="8,4" opacity="0.8">
              {/* Horizontal centerline through logo content */}
              <line x1="0" y1={contentCenterY} x2={size} y2={contentCenterY} />
              {/* Vertical centerline through logo content */}
              <line x1={contentCenterX} y1="0" x2={contentCenterX} y2={size} />
              {/* Center point marker */}
              <circle cx={contentCenterX} cy={contentCenterY} r="3" fill="#ff0000" />
            </g>
          );
        })()}
        
        {/* Container center lines (for reference) */}
        <line x1={size * 0.5} y1="0" x2={size * 0.5} y2={size} stroke="#0000ff" strokeWidth="1" strokeDasharray="2,2" opacity="0.3" />
        <line x1="0" y1={size * 0.5} x2={size} y2={size * 0.5} stroke="#0000ff" strokeWidth="1" strokeDasharray="2,2" opacity="0.3" />
        
        {/* Pixel measurements for icon */}
        {(() => { 
          // Content bounds for icon - from Portal C to cosmic O (matching corrected structure)
          const contentLeft = size * 0.1; // Start of Portal C
          const contentRight = size * 0.1 - 10 + radius * 1.15 + fontSize * 1.5; // End of cosmic O
          const contentTop = size * 0.1; // Top of Portal C
          const contentBottom = size * 0.1 + radius * 1.4 + fontSize * 0.8; // Bottom of cosmic O
          
          const leftMargin = contentLeft;
          const rightMargin = size - contentRight;
          const topMargin = contentTop;
          const bottomMargin = size - contentBottom;
          
          return (
            <g fill="#0000ff" fontSize="8" fontFamily="monospace">
              {/* Left margin */}
              <text x="3" y={size * 0.5} textAnchor="start">L: {leftMargin.toFixed(0)}</text>
              {/* Right margin */}
              <text x={size - 3} y={size * 0.5} textAnchor="end">R: {rightMargin.toFixed(0)}</text>
              {/* Top margin */}
              <text x={size * 0.5} y="12" textAnchor="middle">T: {topMargin.toFixed(0)}</text>
              {/* Bottom margin */}
              <text x={size * 0.5} y={size - 3} textAnchor="middle">B: {bottomMargin.toFixed(0)}</text>
            </g>
          );
        })()}
        <defs>
          <radialGradient id="auroraIconPortalGradient" cx="30%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#FFF" stopOpacity="0.9"/>
            <stop offset="40%" stopColor="#FFD700" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2"/>
          </radialGradient>
          
          <linearGradient id="cosmaraOrangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700"/>
            <stop offset="50%" stopColor="#FFA500"/>
            <stop offset="100%" stopColor="#FF6B35"/>
          </linearGradient>
          
          <radialGradient id="cosmaraOrangeRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700"/>
            <stop offset="50%" stopColor="#FFA500"/>
            <stop offset="100%" stopColor="#FF6B35"/>
          </radialGradient>
          
          <linearGradient id="cosmicBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6"/>
            <stop offset="50%" stopColor="#1E40AF"/>
            <stop offset="100%" stopColor="#1E3A8A"/>
          </linearGradient>
          
          <filter id="cosmicGlow2Ring" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Portal C - EXACT COPY FROM WORKING AURORA FULL LOGO */}
        <g transform={`translate(${size * 0.1}, ${portalTransformY})`}>
          {/* 2-Ring System for Maximum Clarity - CONCENTRIC ALIGNMENT FIXED */}
          <g fill="none" strokeLinecap="round">
            {(() => {
              const centerX = radius * 1.15; // Fixed center X position
              const centerY = radius * 1.4;  // Fixed center Y position
              
              // Define ring radii for perfect concentricity
              const outerRadius = radius * 1.0;    // Outer ring radius
              const innerRadius = radius * 0.7;    // Inner ring radius  
              
              // Account for stroke width to maintain visual spacing
              const outerStrokeWidth = strokeWidth * 1.4;
              const innerStrokeWidth = strokeWidth * 1.0;
              
              // Calculate start and end points for C opening (facing right) 
              const openingAngle = Math.PI * 0.25; // 45 degrees opening on each side
              
              // For C opening RIGHT: start at top-right, end at bottom-right
              // Outer ring points
              const outerStartX = centerX + outerRadius * Math.cos(-openingAngle);
              const outerStartY = centerY + outerRadius * Math.sin(-openingAngle);
              const outerEndX = centerX + outerRadius * Math.cos(openingAngle);
              const outerEndY = centerY + outerRadius * Math.sin(openingAngle);
              
              // Inner ring points
              const innerStartX = centerX + innerRadius * Math.cos(-openingAngle);
              const innerStartY = centerY + innerRadius * Math.sin(-openingAngle);
              const innerEndX = centerX + innerRadius * Math.cos(openingAngle);
              const innerEndY = centerY + innerRadius * Math.sin(openingAngle);
              
              return (
                <>
                  {/* Outer Portal Ring - Perfectly concentric, opens RIGHT */}
                  <path
                    d={`M ${outerStartX} ${outerStartY} 
                       A ${outerRadius} ${outerRadius} 0 1 0 ${outerEndX} ${outerEndY}`}
                    stroke={colors.outerRing}
                    strokeWidth={outerStrokeWidth}
                    opacity="1"
                  />
                  {/* Inner Portal Ring - Perfectly concentric, opens RIGHT */}
                  <path
                    d={`M ${innerStartX} ${innerStartY} 
                       A ${innerRadius} ${innerRadius} 0 1 0 ${innerEndX} ${innerEndY}`}
                    stroke={colors.innerRing}
                    strokeWidth={innerStrokeWidth}
                    opacity="0.8"
                  />
                </>
              );
            })()}
          </g>
        </g>
        
        {/* Cosmic "O" - EXACT COPY FROM WORKING AURORA FULL LOGO */}
        <g>
          <circle cx={size * 0.1 - 10 + radius * 1.15 + fontSize * 1.0} cy={cosmicOCenterY} r={fontSize * 0.55} fill={colors.cosmicO || '#000000'} opacity="0.8"/>
          <circle cx={size * 0.1 - 10 + radius * 1.15 + fontSize * 1.0} cy={cosmicOCenterY} r={fontSize * 0.45} fill="#FFFFFF" opacity="0.9"/>
        </g>

        {/* Text Letters - ALL REMOVED: Aurora Icon is now text-free */}
        <g fill={colors.text} fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" fontWeight="600" letterSpacing="0.05em">
          {/* All text letters removed - Aurora Icon complete */}
          {/* <text x={portalCenterX} y={textBaselineY} fontSize={fontSize * 1.1} textAnchor="middle">C</text> */}
          {/* <text x={portalCenterX + fontSize * 2.0} y={textBaselineY} fontSize={fontSize * 1.1} textAnchor="middle">S</text> */}
          {/* <text x={portalCenterX + fontSize * 3.0} y={textBaselineY} fontSize={fontSize * 1.1} textAnchor="middle">M</text> */}
          {/* <text x={portalCenterX + fontSize * 4.0} y={textBaselineY} fontSize={fontSize * 1.1} textAnchor="middle">A</text> */}
          {/* <text x={portalCenterX + fontSize * 5.0} y={textBaselineY} fontSize={fontSize * 1.1} textAnchor="middle">R</text> */}
          {/* <text x={portalCenterX + fontSize * 6.0} y={textBaselineY} fontSize={fontSize * 1.1} textAnchor="middle">A</text> */}
        </g>
      </svg>
      {showLabel && (
        <div className="mt-3 text-center">
          <div className="text-xs font-medium text-gray-600">Aurora Icon</div>
        </div>
      )}
    </div>
  );
}

// Research-Optimized Portal C - 3 Ring Version
export function CosmarcPortalRefined3Ring({ size = 200, className = '', showLabel = false, showGrid = false, variant = 'primary' }: CosmarcLogoProps) {
  const strokeWidth = size * 0.035;
  const radius = size * 0.18; // Reverted back to proper size
  const fontSize = size * 0.12;
  
  // Calculated positioning for perfect grid alignment
  const portalTransformY = size * 0.1; // Portal C transform Y position
  const cosmicOCenterY = portalTransformY + radius * 1.4; // Actual cosmic "O" center position
  const textBaselineY = cosmicOCenterY + fontSize * 0.35; // Align text baseline with cosmic "O" center
  const portalCenterX = size * 0.0 + radius * 1.15; // Portal C center for text positioning
  
  // Spacing calculations for Aurora Full Logo (matching 2-ring version)
  const portalCenterY = portalTransformY + radius * 0.8; // Portal center Y
  const targetGap = size * 0.02; // Increased for more visible spacing (4px gap base) matching 2-ring version
  const estimatedCharWidth = fontSize * 0.4; // Character width estimate
  const textCLeftEdge = 35.54 + 19.564; // Direct left edge positioning + offset to align with orange ring grid
  const textCPosition = textCLeftEdge; // Same for textAnchor="start"
  
  // Calculate cosmic "O" position with 0.12em gap from right edge of "C"
  const actualCharWidth = fontSize * 0.8; // Increased to account for actual "C" character width
  const textCRightEdge = textCLeftEdge + actualCharWidth;
  const cosmicOLeftEdge = textCRightEdge + (fontSize * 0.12); // 0.12em gap matching SMARA spacing
  const cosmicORadius = fontSize * 0.55;
  const cosmicOCenterX = cosmicOLeftEdge + cosmicORadius;
  
  // Calculate "S" text position with 0.12em gap from right edge of cosmic "O" (matching SMARA internal spacing)
  const cosmicORightEdge = cosmicOLeftEdge + (cosmicORadius * 2);
  const textSLeftEdge = cosmicORightEdge + (fontSize * 0.12); // 0.12em = fontSize * 0.12
  const textSPosition = textSLeftEdge;
  
  // Calculate "M" text position with 4.5px gap from right edge of "S"
  const textSCharWidth = fontSize * 0.71; // Adjusted based on actual rendering (27.3px for fontSize=38.4)
  const textSRightEdge = textSLeftEdge + textSCharWidth;
  const textMLeftEdge = textSRightEdge + 4.5;
  const textMPosition = textMLeftEdge;
  const textCLeftEdgePosition = textCPosition - (estimatedCharWidth / 2);
  const textCRightEdgePosition = textCPosition + (estimatedCharWidth / 2);
  const cosmicOLeftEdgePosition = textCRightEdgePosition + targetGap;
  
  const colorSchemes = {
    primary: {
      outerRing: 'url(#cosmaraOrangeGradient3Ring)',
      middleRing: '#8B5CF6',
      innerRing: '#8B5CF6', 
      core: '#FFF',
      coreAccent: '#FFD700',
      text: 'url(#cosmaraOrangeGradient3Ring)',
      background: 'url(#cosmaraPortalGradient3Ring)',
      cosmicO: '#000000'
    },
    minimal: {
      outerRing: '#FFD700',
      middleRing: '#FFD700',
      innerRing: '#FFD700',
      core: '#FFF',
      coreAccent: '#FFD700',
      text: '#FFD700',
      background: 'transparent',
      cosmicO: '#000000'
    },
    professional: {
      outerRing: '#2D3748',
      middleRing: '#4A5568',
      innerRing: '#718096',
      core: '#FFD700',
      coreAccent: '#FFF',
      text: '#2D3748',
      background: 'transparent',
      cosmicO: '#000000'
    },
    monochrome: {
      outerRing: '#000',
      middleRing: '#444',
      innerRing: '#888',
      core: '#000',
      coreAccent: '#FFF',
      text: '#000',
      background: 'transparent',
      cosmicO: '#000000'
    },
    reverse: {
      outerRing: '#FFF',
      middleRing: '#E2E8F0',
      innerRing: '#CBD5E0',
      core: '#FFF',
      coreAccent: '#FFD700',
      text: '#FFF',
      background: 'transparent',
      cosmicO: '#FFFFFF'
    },
    cosmic: {
      outerRing: 'url(#stellarPurpleGradient3Ring)',
      middleRing: 'url(#cosmaraOrangeGradient3Ring)',
      innerRing: '#8B5CF6',
      core: '#FFD700',
      coreAccent: '#FFFFFF',
      text: 'url(#stellarPurpleGradient3Ring)',
      background: 'transparent',
      cosmicO: '#000000'
    },
    enterprise: {
      outerRing: 'url(#goldToWhiteGradient3Ring)',
      middleRing: '#8B5CF6',
      innerRing: '#7C3AED',
      core: '#FFFFFF',
      coreAccent: '#FFD700',
      text: 'url(#goldToWhiteGradient3Ring)',
      background: 'transparent',
      cosmicO: '#000000'
    },
    stellar: {
      outerRing: '#FFD700',
      middleRing: 'url(#stellarPurpleGradient3Ring)',
      innerRing: '#8B5CF6',
      core: '#FFFFFF',
      coreAccent: '#8B5CF6',
      text: '#FFD700',
      background: 'transparent',
      cosmicO: '#000000'
    },
    aurora: {
      outerRing: 'url(#cosmicBlueGradient3Ring)',
      middleRing: 'url(#cosmaraOrangeGradient3Ring)',
      innerRing: '#8B5CF6',
      core: 'transparent',
      coreAccent: 'transparent',
      text: 'url(#cosmaraOrangeGradient3Ring)',
      background: 'transparent',
      cosmicO: 'url(#cosmaraOrangeGradient3Ring)'
    },
    sunset: {
      outerRing: 'url(#cosmaraOrangeGradient3Ring)',
      middleRing: '#FFD700',
      innerRing: '#FF6B35',
      core: '#FFFFFF',
      coreAccent: '#FF6B35',
      text: 'url(#cosmaraOrangeGradient3Ring)',
      background: 'transparent',
      cosmicO: '#000000'
    }
  };
  
  const colors = colorSchemes[variant];
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size * 1.8} height={size * 0.6} viewBox={`0 0 ${size * 1.8} ${size * 0.6}`} className="drop-shadow-lg">
        <defs>
          <radialGradient id="cosmaraPortalGradient3Ring" cx="30%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#FFF" stopOpacity="0.9"/>
            <stop offset="30%" stopColor="#FFD700" stopOpacity="0.7"/>
            <stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2"/>
          </radialGradient>
          
          <linearGradient id="cosmaraOrangeGradient3Ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700"/>
            <stop offset="50%" stopColor="#FFA500"/>
            <stop offset="100%" stopColor="#FF6B35"/>
          </linearGradient>
          
          <radialGradient id="cosmaraOrangeRadial3Ring" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700"/>
            <stop offset="50%" stopColor="#FFA500"/>
            <stop offset="100%" stopColor="#FF6B35"/>
          </radialGradient>
          
          <linearGradient id="cosmicBlueGradient3Ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6"/>
            <stop offset="50%" stopColor="#1E40AF"/>
            <stop offset="100%" stopColor="#1E3A8A"/>
          </linearGradient>
          
          <linearGradient id="stellarPurpleGradient3Ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7"/>
            <stop offset="50%" stopColor="#8B5CF6"/>
            <stop offset="100%" stopColor="#7C3AED"/>
          </linearGradient>
          
          <linearGradient id="goldToWhiteGradient3Ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700"/>
            <stop offset="100%" stopColor="#FFFFFF"/>
          </linearGradient>
          
          <filter id="portalGlow3Ring" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Grid System */}
        {showGrid && (
          <g opacity="0.4">
            {(() => {
              const cCenterX = size * 0.08 + radius * 1.15;
              const portalTransformY = size * 0.1; // Portal C transform Y position  
              const cCenterY = portalTransformY + radius * 1.4; // Actual cosmic "O" center position
              return (
                <>
                  <line x1={cCenterX - size * 0.05} y1={cCenterY} x2={cCenterX + size * 0.05} y2={cCenterY} stroke="#00FF00" strokeWidth="1" strokeDasharray="4,4"/>
                  <line x1={cCenterX} y1={cCenterY - size * 0.05} x2={cCenterX} y2={cCenterY + size * 0.05} stroke="#00FF00" strokeWidth="1" strokeDasharray="4,4"/>
                  <circle cx={cCenterX} cy={cCenterY} r={radius * 1.5} fill="none" stroke="#FF0000" strokeWidth="1" strokeDasharray="5,5"/>
                </>
              );
            })()}
          </g>
        )}

        {/* 3-Ring Portal C */}
        <g transform={`translate(${size * 0.0}, ${portalTransformY})`}>
          {/* 3-Ring Portal C */}
          <g fill="none" strokeLinecap="round">
            <path d={`M ${radius * 2.1} ${radius * 0.7} A ${radius * 1.1} ${radius * 1.1} 0 1 0 ${radius * 2.1} ${radius * 2.1}`} stroke={colors.outerRing} strokeWidth={strokeWidth * 1.4} opacity="1"/>
            <path d={`M ${radius * 1.9} ${radius * 0.85} A ${radius * 0.9} ${radius * 0.9} 0 1 0 ${radius * 1.9} ${radius * 1.95}`} stroke={colors.middleRing} strokeWidth={strokeWidth * 1.0} opacity="0.8"/>
            <path d={`M ${radius * 1.7} ${radius * 1.0} A ${radius * 0.7} ${radius * 0.7} 0 1 0 ${radius * 1.7} ${radius * 1.8}`} stroke={colors.innerRing} strokeWidth={strokeWidth * 0.7} opacity="0.6"/>
          </g>

          {/* Central core removed - C text will be positioned here instead */}
        </g>

        {/* Separate Cosmic "O" positioned 4.5px from right edge of text C */}
        <g>
          <circle cx={cosmicOCenterX} cy={cosmicOCenterY} r={fontSize * 0.55} fill="none" stroke={colors.cosmicO || '#000000'} strokeWidth={fontSize * 0.08} opacity="0.8"/>
          <circle cx={cosmicOCenterX} cy={cosmicOCenterY} r={fontSize * 0.45} fill="none" stroke={colors.cosmicO || '#000000'} strokeWidth={fontSize * 0.06} opacity="0.6"/>
        </g>

        {/* Geometric Sans-Serif Typography - "C" separate, "SMARA" as unified element with controlled kerning */}
        <g fill={colors.text} fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" fontWeight="600">
          <text x={textCPosition} y={textBaselineY} fontSize={fontSize * 1.1} textAnchor="start">C</text>
          <text x={textSPosition} y={textBaselineY} fontSize={fontSize * 1.1} textAnchor="start" letterSpacing="0.12em">SMARA</text>
        </g>
      </svg>
      {showLabel && (
        <div className="mt-4 text-sm font-medium text-center text-gray-600">
          3-Ring Portal (Research Optimized)
          <div className="text-xs text-gray-500">{variant} variant • Enhanced depth</div>
        </div>
      )}
    </div>
  );
}

// Portal Symbol Only - For Favicons and Standalone Use
export function CosmarcPortalSymbol({ size = 64, className = '', rings = 2, variant = 'primary' }: CosmarcLogoProps) {
  const strokeWidth = size * 0.08; // Thicker for small sizes
  const radius = size * 0.35;
  
  const colorSchemes = {
    primary: { outer: '#FFD700', inner: '#FF6B35', core: '#FFF', accent: '#FFD700' },
    minimal: { outer: '#FFD700', inner: '#FFD700', core: '#FFF', accent: '#FFD700' },
    professional: { outer: '#2D3748', inner: '#4A5568', core: '#FFD700', accent: '#FFF' },
    monochrome: { outer: '#000', inner: '#666', core: '#000', accent: '#FFF' },
    reverse: { outer: '#FFF', inner: '#E2E8F0', core: '#FFF', accent: '#FFD700' }
  };
  
  const colors = colorSchemes[variant];
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        <defs>
          <filter id="symbolGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <g fill="none" strokeLinecap="round">
          <path d={`M ${size * 0.85} ${size * 0.2} A ${radius} ${radius} 0 1 0 ${size * 0.85} ${size * 0.8}`} stroke={colors.outer} strokeWidth={strokeWidth} opacity="1"/>
          {rings === 3 && (
            <path d={`M ${size * 0.75} ${size * 0.3} A ${radius * 0.7} ${radius * 0.7} 0 1 0 ${size * 0.75} ${size * 0.7}`} stroke={colors.inner} strokeWidth={strokeWidth * 0.7} opacity="0.8"/>
          )}
          <path d={`M ${size * 0.65} ${size * 0.35} A ${radius * 0.5} ${radius * 0.5} 0 1 0 ${size * 0.65} ${size * 0.65}`} stroke={colors.inner} strokeWidth={strokeWidth * 0.6} opacity="0.7"/>
        </g>

        <circle cx={size * 0.4} cy={size * 0.5} r={size * 0.12} fill={colors.core} filter="url(#symbolGlow)"/>
        <circle cx={size * 0.4} cy={size * 0.5} r={size * 0.08} fill={colors.accent} opacity="0.8"/>
      </svg>
    </div>
  );
}

// Concept 4: Solar Wind C
export function SolarWindC({ size = 80, className = '', showLabel = false }: CosmicCLogoProps) {
  const strokeWidth = size * 0.06;
  const radius = size * 0.35;
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        <defs>
          <linearGradient id="solarWindGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9"/>
            <stop offset="50%" stopColor="#FF6B35" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0"/>
          </linearGradient>
          
          <filter id="windGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Main C Structure */}
        <path
          d={`M ${size * 0.7} ${size * 0.25} 
             A ${radius} ${radius} 0 1 0 ${size * 0.7} ${size * 0.75}`}
          fill="none"
          stroke="url(#solarWindGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Solar Wind Trails */}
        <g stroke="#FFD700" strokeWidth="2" fill="none" opacity="0.7">
          {/* Top trail */}
          <path 
            d={`M ${size * 0.7} ${size * 0.25} Q ${size * 0.85} ${size * 0.2} ${size * 0.95} ${size * 0.15}`}
            className="animate-pulse"
            style={{ animationDelay: '0s', animationDuration: '2s' }}
          />
          <path 
            d={`M ${size * 0.68} ${size * 0.3} Q ${size * 0.8} ${size * 0.26} ${size * 0.9} ${size * 0.22}`}
            opacity="0.5"
            className="animate-pulse"
            style={{ animationDelay: '0.5s', animationDuration: '2s' }}
          />
          
          {/* Bottom trail */}
          <path 
            d={`M ${size * 0.7} ${size * 0.75} Q ${size * 0.85} ${size * 0.8} ${size * 0.95} ${size * 0.85}`}
            className="animate-pulse"
            style={{ animationDelay: '1s', animationDuration: '2s' }}
          />
          <path 
            d={`M ${size * 0.68} ${size * 0.7} Q ${size * 0.8} ${size * 0.74} ${size * 0.9} ${size * 0.78}`}
            opacity="0.5"
            className="animate-pulse"
            style={{ animationDelay: '1.5s', animationDuration: '2s' }}
          />
        </g>

        {/* Energy particles */}
        <g fill="#FFD700" opacity="0.8">
          <circle cx={size * 0.8} cy={size * 0.2} r="1" className="animate-pulse" style={{ animationDelay: '0s', animationDuration: '1.5s' }}/>
          <circle cx={size * 0.85} cy={size * 0.18} r="0.8" className="animate-pulse" style={{ animationDelay: '0.3s', animationDuration: '1.5s' }}/>
          <circle cx={size * 0.82} cy={size * 0.78} r="1" className="animate-pulse" style={{ animationDelay: '0.6s', animationDuration: '1.5s' }}/>
          <circle cx={size * 0.87} cy={size * 0.82} r="0.8" className="animate-pulse" style={{ animationDelay: '0.9s', animationDuration: '1.5s' }}/>
        </g>
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Solar Wind C
          <div className="text-xs text-gray-500">Energy flow • Dynamic movement</div>
        </div>
      )}
    </div>
  );
}

// Concept 5: Galaxy Spiral C
export function GalaxySpiralC({ size = 80, className = '', showLabel = false }: CosmicCLogoProps) {
  const radius = size * 0.35;
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        <defs>
          <radialGradient id="galaxyGradient" cx="40%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#FFF" stopOpacity="0.9"/>
            <stop offset="30%" stopColor="#FFD700" stopOpacity="0.8"/>
            <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.3"/>
          </radialGradient>
          
          <filter id="galaxyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Galaxy Background */}
        <ellipse 
          cx={size * 0.4} 
          cy={size * 0.5} 
          rx={radius * 1.2} 
          ry={radius * 0.8}
          fill="url(#galaxyGradient)"
          opacity="0.7"
          filter="url(#galaxyGlow)"
          className="animate-spin"
          style={{ animationDuration: '30s' }}
        />

        {/* Main C Spiral */}
        <path
          d={`M ${size * 0.7} ${size * 0.25} 
             A ${radius} ${radius} 0 1 0 ${size * 0.7} ${size * 0.75}`}
          fill="none"
          stroke="#FFD700"
          strokeWidth={size * 0.05}
          strokeLinecap="round"
          filter="url(#galaxyGlow)"
        />

        {/* Inner Spiral Arms */}
        <g fill="none" stroke="#FF6B35" strokeWidth="2" opacity="0.8">
          <path 
            d={`M ${size * 0.4} ${size * 0.35} Q ${size * 0.3} ${size * 0.5} ${size * 0.4} ${size * 0.65}`}
            className="animate-pulse"
            style={{ animationDelay: '0s', animationDuration: '4s' }}
          />
          <path 
            d={`M ${size * 0.45} ${size * 0.4} Q ${size * 0.35} ${size * 0.5} ${size * 0.45} ${size * 0.6}`}
            opacity="0.6"
            className="animate-pulse"
            style={{ animationDelay: '2s', animationDuration: '4s' }}
          />
        </g>

        {/* Galactic Core */}
        <circle 
          cx={size * 0.38} 
          cy={size * 0.5} 
          r={size * 0.06}
          fill="#FFF"
          filter="url(#galaxyGlow)"
          className="animate-pulse"
          style={{ animationDuration: '2s' }}
        />

        {/* Star Field */}
        <g fill="#FFD700" opacity="0.6">
          <circle cx={size * 0.25} cy={size * 0.3} r="0.8" className="animate-pulse" style={{ animationDelay: '0s', animationDuration: '3s' }}/>
          <circle cx={size * 0.3} cy={size * 0.7} r="1" className="animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }}/>
          <circle cx={size * 0.6} cy={size * 0.2} r="0.6" className="animate-pulse" style={{ animationDelay: '2s', animationDuration: '3s' }}/>
          <circle cx={size * 0.65} cy={size * 0.8} r="0.8" className="animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '3s' }}/>
        </g>
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Galaxy Spiral C
          <div className="text-xs text-gray-500">Rotating galaxy • Cosmic scale</div>
        </div>
      )}
    </div>
  );
}

// Research-Optimized COSMARA Logo System Showcase
export function CosmarcRefinedShowcase({ className = '' }: { className?: string }) {
  return (
    <div className={`p-8 bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl ${className}`}>
      <h2 className="text-2xl font-bold text-center mb-8 text-white">
        Research-Optimized COSMARA Logo System
      </h2>
      
      {/* Ring Comparison - 2 vs 3 Ring Systems */}
      <div className="mb-12 bg-gray-800/30 backdrop-blur p-8 rounded-lg">
        <h3 className="text-xl font-semibold text-center mb-6 text-white">
          Ring System Comparison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <CosmarcPortalRefined2Ring size={300} showLabel={true} variant="primary" />
            </div>
            <div className="text-center text-sm text-gray-300">
              <p className="font-medium text-green-400">✓ Recommended: 2-Ring System</p>
              <div className="text-xs text-gray-400 mt-1">Maximum clarity • Perfect for favicons • Research-optimized</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <CosmarcPortalRefined3Ring size={300} showLabel={true} variant="primary" />
            </div>
            <div className="text-center text-sm text-gray-300">
              <p className="font-medium text-purple-400">Alternative: 3-Ring System</p>
              <div className="text-xs text-gray-400 mt-1">Enhanced depth • More complex • Better for large displays</div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Color Variants - 2 Ring System */}
      <div className="mb-12 bg-gray-800/30 backdrop-blur p-8 rounded-lg">
        <h3 className="text-xl font-semibold text-center mb-6 text-white">
          Brand Color Variants (2-Ring System)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col items-center p-4 bg-gray-800/50 backdrop-blur rounded-lg">
            <CosmarcPortalRefined2Ring size={180} variant="primary" />
            <div className="mt-3 text-center">
              <div className="text-sm font-semibold text-yellow-400">Primary</div>
              <div className="text-xs text-gray-400 mt-1">Golden brand • Full cosmic effect</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-gray-800/50 backdrop-blur rounded-lg">
            <CosmarcPortalRefined2Ring size={180} variant="professional" />
            <div className="mt-3 text-center">
              <div className="text-sm font-semibold text-gray-400">Professional</div>
              <div className="text-xs text-gray-400 mt-1">Enterprise • B2B presentations</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-gray-800/50 backdrop-blur rounded-lg">
            <CosmarcPortalRefined2Ring size={180} variant="minimal" />
            <div className="mt-3 text-center">
              <div className="text-sm font-semibold text-yellow-400">Minimal</div>
              <div className="text-xs text-gray-400 mt-1">Clean • Single color • Simplified</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-gray-800/50 backdrop-blur rounded-lg">
            <CosmarcPortalRefined2Ring size={180} variant="monochrome" />
            <div className="mt-3 text-center">
              <div className="text-sm font-semibold text-gray-300">Monochrome</div>
              <div className="text-xs text-gray-400 mt-1">Print ready • Black & white</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-gray-700/50 backdrop-blur rounded-lg">
            <CosmarcPortalRefined2Ring size={180} variant="reverse" />
            <div className="mt-3 text-center">
              <div className="text-sm font-semibold text-white">Reverse</div>
              <div className="text-xs text-gray-400 mt-1">Dark backgrounds • High contrast</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scalability Testing */}
      <div className="mb-12 bg-gray-800/30 backdrop-blur p-8 rounded-lg">
        <h3 className="text-xl font-semibold text-center mb-6 text-white">
          Scalability Testing - Research Validated
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Full Logo Scaling */}
          <div className="text-center">
            <h4 className="text-lg font-medium mb-4 text-gray-300">Complete Logo System</h4>
            <div className="flex items-end justify-center space-x-4 mb-4">
              <div className="text-center">
                <CosmarcPortalRefined2Ring size={256} variant="primary" />
                <div className="text-xs text-gray-400 mt-2">256px</div>
              </div>
              <div className="text-center">
                <CosmarcPortalRefined2Ring size={128} variant="primary" />
                <div className="text-xs text-gray-400 mt-2">128px</div>
              </div>
              <div className="text-center">
                <CosmarcPortalRefined2Ring size={64} variant="primary" />
                <div className="text-xs text-gray-400 mt-2">64px</div>
              </div>
              <div className="text-center">
                <CosmarcPortalRefined2Ring size={32} variant="primary" />
                <div className="text-xs text-gray-400 mt-2">32px</div>
              </div>
            </div>
          </div>
          
          {/* Symbol Only Scaling */}
          <div className="text-center">
            <h4 className="text-lg font-medium mb-4 text-gray-300">Portal Symbol Only</h4>
            <div className="flex items-end justify-center space-x-4 mb-4">
              <div className="text-center">
                <CosmarcPortalSymbol size={128} rings={2} variant="primary" />
                <div className="text-xs text-gray-400 mt-2">128px</div>
              </div>
              <div className="text-center">
                <CosmarcPortalSymbol size={64} rings={2} variant="primary" />
                <div className="text-xs text-gray-400 mt-2">64px</div>
              </div>
              <div className="text-center">
                <CosmarcPortalSymbol size={32} rings={2} variant="primary" />
                <div className="text-xs text-gray-400 mt-2">32px</div>
              </div>
              <div className="text-center">
                <CosmarcPortalSymbol size={16} rings={2} variant="primary" />
                <div className="text-xs text-gray-400 mt-2">16px (favicon)</div>
              </div>
            </div>
            <div className="text-xs text-green-400">✓ Optimized for favicons and small applications</div>
          </div>
        </div>
      </div>

      {/* Typography & Grid Analysis */}
      <div className="mb-8 bg-gray-800/30 backdrop-blur p-8 rounded-lg">
        <h3 className="text-xl font-semibold text-center mb-6 text-white">
          Typography & Alignment Analysis
        </h3>
        <div className="flex justify-center">
          <CosmarcPortalRefined2Ring size={400} showGrid={true} variant="primary" />
        </div>
        <div className="text-center text-sm text-gray-300 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-green-400 font-medium">Green: Crosshairs</div>
              <div className="text-xs text-gray-400">Portal center alignment</div>
            </div>
            <div>
              <div className="text-red-400 font-medium">Red: Center Guide</div>
              <div className="text-xs text-gray-400">Optimal portal position</div>
            </div>
            <div>
              <div className="text-cyan-400 font-medium">Cyan: O Space</div>
              <div className="text-xs text-gray-400">Text flow boundary</div>
            </div>
          </div>
        </div>
      </div>

      {/* Research Highlights */}
      <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-center mb-4 text-yellow-300">
          Research-Based Improvements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
          <div>
            <h4 className="font-semibold text-green-400 mb-2">✓ Implemented</h4>
            <ul className="space-y-1 text-xs">
              <li>• Increased stroke weights for 16px visibility</li>
              <li>• Geometric sans-serif typography</li>
              <li>• 2-ring system for maximum clarity</li>
              <li>• 5 professional color variants</li>
              <li>• Standalone symbol for favicons</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-400 mb-2">⚡ Enhanced</h4>
            <ul className="space-y-1 text-xs">
              <li>• Portal concept maintains differentiation</li>
              <li>• Professional appeal for B2B customers</li>
              <li>• Scalable from 16px to large displays</li>
              <li>• Consistent brand system across variants</li>
              <li>• Optimized letter spacing and alignment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Portal C Variations Showcase
export function PortalCVariationsShowcase({ className = '' }: { className?: string }) {
  return (
    <div className={`p-8 bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl ${className}`}>
      <h2 className="text-2xl font-bold text-center mb-8 text-white">
        Cosmic Portal C - Design Variations
      </h2>
      
      {/* Complete COSMARA Logo */}
      <div className="mb-12 bg-gray-800/30 backdrop-blur p-8 rounded-lg">
        <h3 className="text-xl font-semibold text-center mb-6 text-white">
          Complete COSMARA Logo Concept
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Regular Version */}
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <CosmarcPortalLogo size={300} showLabel={true} />
            </div>
            <div className="text-center text-sm text-gray-300">
              <p className="font-medium">Final Logo</p>
            </div>
          </div>
          
          {/* Grid Version for Alignment */}
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <CosmarcPortalLogo size={300} showLabel={true} showGrid={true} />
            </div>
            <div className="text-center text-sm text-gray-300">
              <p className="font-medium">With Alignment Grid</p>
              <div className="text-xs text-gray-400 mt-1">
                <span className="text-red-400">Red:</span> Center guides • 
                <span className="text-green-400">Green:</span> Crosshairs • 
                <span className="text-blue-400">Blue:</span> Grid lines
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-gray-300">
          <p className="font-medium">Portal C as "O" • Cosmic dimensional gateway effect</p>
        </div>
      </div>
      
      {/* Original + 4 Variations */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
        <div className="flex flex-col items-center p-4 bg-gray-800/50 backdrop-blur rounded-lg">
          <CosmicPortalC size={100} showLabel={true} />
          <div className="mt-3 text-center">
            <div className="text-sm font-semibold text-purple-400">Original</div>
            <div className="text-xs text-gray-400 mt-1">Classic portal</div>
          </div>
        </div>
        
        <div className="flex flex-col items-center p-4 bg-gray-800/50 backdrop-blur rounded-lg">
          <DeepSpacePortalC size={100} showLabel={true} />
          <div className="mt-3 text-center">
            <div className="text-sm font-semibold text-indigo-400">Deep Space</div>
            <div className="text-xs text-gray-400 mt-1">Mysterious depths</div>
          </div>
        </div>
        
        <div className="flex flex-col items-center p-4 bg-gray-800/50 backdrop-blur rounded-lg">
          <EnergyVortexPortalC size={100} showLabel={true} />
          <div className="mt-3 text-center">
            <div className="text-sm font-semibold text-orange-400">Energy Vortex</div>
            <div className="text-xs text-gray-400 mt-1">Dynamic motion</div>
          </div>
        </div>
        
        <div className="flex flex-col items-center p-4 bg-gray-800/50 backdrop-blur rounded-lg">
          <MinimalistPortalC size={100} showLabel={true} />
          <div className="mt-3 text-center">
            <div className="text-sm font-semibold text-green-400">Minimalist</div>
            <div className="text-xs text-gray-400 mt-1">Clean & professional</div>
          </div>
        </div>
        
        <div className="flex flex-col items-center p-4 bg-gray-800/50 backdrop-blur rounded-lg">
          <QuantumPortalC size={100} showLabel={true} />
          <div className="mt-3 text-center">
            <div className="text-sm font-semibold text-cyan-400">Quantum</div>
            <div className="text-xs text-gray-400 mt-1">Futuristic geometry</div>
          </div>
        </div>
      </div>

      {/* Size Comparison */}
      <div className="bg-gray-800/30 backdrop-blur p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-white">Scalability Test - All Variations</h3>
        <div className="flex items-end justify-center space-x-6">
          <div className="text-center">
            <div className="mb-2 space-y-2">
              <CosmicPortalC size={48} />
              <CosmicPortalC size={32} />
              <CosmicPortalC size={16} />
            </div>
            <div className="text-xs text-gray-400">Original</div>
          </div>
          
          <div className="text-center">
            <div className="mb-2 space-y-2">
              <DeepSpacePortalC size={48} />
              <DeepSpacePortalC size={32} />
              <DeepSpacePortalC size={16} />
            </div>
            <div className="text-xs text-gray-400">Deep Space</div>
          </div>
          
          <div className="text-center">
            <div className="mb-2 space-y-2">
              <EnergyVortexPortalC size={48} />
              <EnergyVortexPortalC size={32} />
              <EnergyVortexPortalC size={16} />
            </div>
            <div className="text-xs text-gray-400">Energy Vortex</div>
          </div>
          
          <div className="text-center">
            <div className="mb-2 space-y-2">
              <MinimalistPortalC size={48} />
              <MinimalistPortalC size={32} />
              <MinimalistPortalC size={16} />
            </div>
            <div className="text-xs text-gray-400">Minimalist</div>
          </div>
          
          <div className="text-center">
            <div className="mb-2 space-y-2">
              <QuantumPortalC size={48} />
              <QuantumPortalC size={32} />
              <QuantumPortalC size={16} />
            </div>
            <div className="text-xs text-gray-400">Quantum</div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-300">
        <p className="font-medium">Portal Theme Variations:</p>
        <p>• Deep dimensional effects • Gateway metaphor • Professional scalability • Cosmic brand alignment</p>
      </div>
    </div>
  );
}

// Showcase Component for all Cosmic C concepts
export function CosmicCShowcase({ className = '' }: { className?: string }) {
  return (
    <div className={`p-8 bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl ${className}`}>
      <h2 className="text-2xl font-bold text-center mb-8 text-white">
        COSMARA Cosmic "C" Logo Concepts
      </h2>
      
      {/* Large Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="flex flex-col items-center p-6 bg-gray-800/50 backdrop-blur rounded-lg">
          <NebulaC size={120} showLabel={true} />
          <div className="mt-4 text-center">
            <div className="text-sm font-semibold text-blue-400">Most Ethereal</div>
            <div className="text-xs text-gray-400 mt-1">Swirling cosmic nebula</div>
          </div>
        </div>
        
        <div className="flex flex-col items-center p-6 bg-gray-800/50 backdrop-blur rounded-lg">
          <ConstellationC size={120} showLabel={true} />
          <div className="mt-4 text-center">
            <div className="text-sm font-semibold text-green-400">✓ Brand Connection</div>
            <div className="text-xs text-gray-400 mt-1">Maintains connection theme</div>
          </div>
        </div>
        
        <div className="flex flex-col items-center p-6 bg-gray-800/50 backdrop-blur rounded-lg">
          <CosmicPortalC size={120} showLabel={true} />
          <div className="mt-4 text-center">
            <div className="text-sm font-semibold text-purple-400">⭐ Selected Choice</div>
            <div className="text-xs text-gray-400 mt-1">Dimensional portal aesthetic</div>
          </div>
        </div>
      </div>

      {/* Additional Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="flex flex-col items-center p-6 bg-gray-800/50 backdrop-blur rounded-lg">
          <SolarWindC size={120} showLabel={true} />
          <div className="mt-4 text-center">
            <div className="text-sm font-semibold text-orange-400">Dynamic Energy</div>
            <div className="text-xs text-gray-400 mt-1">Solar wind energy flows</div>
          </div>
        </div>
        
        <div className="flex flex-col items-center p-6 bg-gray-800/50 backdrop-blur rounded-lg">
          <GalaxySpiralC size={120} showLabel={true} />
          <div className="mt-4 text-center">
            <div className="text-sm font-semibold text-indigo-400">Cosmic Scale</div>
            <div className="text-xs text-gray-400 mt-1">Rotating galaxy aesthetic</div>
          </div>
        </div>
      </div>

      {/* Size Comparison */}
      <div className="bg-gray-800/30 backdrop-blur p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-white">Scalability Test</h3>
        <div className="flex items-end justify-center space-x-8">
          <div className="text-center">
            <div className="mb-2 space-y-2">
              <NebulaC size={64} />
              <NebulaC size={32} />
              <NebulaC size={16} />
            </div>
            <div className="text-xs text-gray-400">Nebula C</div>
          </div>
          
          <div className="text-center">
            <div className="mb-2 space-y-2">
              <ConstellationC size={64} />
              <ConstellationC size={32} />
              <ConstellationC size={16} />
            </div>
            <div className="text-xs text-gray-400">Constellation C</div>
          </div>
          
          <div className="text-center">
            <div className="mb-2 space-y-2">
              <CosmicPortalC size={64} />
              <CosmicPortalC size={32} />
              <CosmicPortalC size={16} />
            </div>
            <div className="text-xs text-gray-400">⭐ Portal C</div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-300">
        <p className="font-medium">Letter-Based Brand Recognition:</p>
        <p>• Immediate "C" for COSMARA association • Cosmic themes • Standalone recognition • Scalable design</p>
      </div>
    </div>
  );
}