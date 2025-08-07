/**
 * Aurora Full Logo Component
 * 
 * Complete COSMARA logo with Portal C rings, cosmic "O", and "SMARA" text.
 * Features perfect spacing orchestration and professional polish.
 * 
 * Usage:
 * ```tsx
 * import { AuroraFullLogo } from './aurora-full-logo';
 * 
 * <AuroraFullLogo size={320} />
 * ```
 */

import React from 'react';

interface AuroraFullLogoProps {
  size?: number;
  className?: string;
  showLabel?: boolean;
}

export function AuroraFullLogo({ 
  size = 320, 
  className = '', 
  showLabel = false 
}: AuroraFullLogoProps) {
  // Consistent scaling system
  const strokeWidth = size * 0.04;
  const radius = size * 0.18;
  const fontSize = size * 0.12;
  
  // Portal positioning (mathematical precision)
  const portalCenterX = radius * 1.15;
  const portalCenterY = radius * 1.4;
  
  // Text and cosmic "O" positioning (Aurora spacing orchestration)
  const textCPosition = 35.54 + 19.564 - 18; // Grid-aligned with 19.564px offset
  const cosmicOCenterX = portalCenterX + (radius * 0.65);
  const cosmicOCenterY = portalCenterY; // Aligned with Portal C rings center
  const textBaselineY = portalCenterY + fontSize * 0.35;
  
  // SMARA text positioning
  const cosmicORadius = fontSize * 0.55;
  const cosmicORightEdge = cosmicOCenterX + cosmicORadius;
  const textSPosition = cosmicORightEdge + (fontSize * 0.12);
  
  // Pre-calculated SVG dimensions (12% padding)
  const svgWidth = (() => {
    const minX = portalCenterX - radius * 1.0 - strokeWidth * 1.2 / 2;
    const maxX = textSPosition + fontSize * 3.8;
    const logoWidth = maxX - minX;
    return logoWidth * 1.24;
  })();
  
  const svgHeight = (() => {
    const minY = portalCenterY - radius * 1.0 - strokeWidth * 1.2 / 2;
    const maxY = portalCenterY + radius * 1.0 + strokeWidth * 1.2 / 2;
    const logoHeight = maxY - minY;
    return logoHeight * 1.24;
  })();
  
  // Transform for perfect centering
  const logoTransformX = (() => {
    const minX = portalCenterX - radius * 1.0 - strokeWidth * 1.2 / 2;
    const maxX = textSPosition + fontSize * 3.8;
    const logoWidth = maxX - minX;
    const svgWidth = logoWidth * 1.24;
    const padding = (svgWidth - logoWidth) / 2;
    return padding - minX;
  })();
  
  const logoTransformY = (() => {
    const minY = portalCenterY - radius * 1.0 - strokeWidth * 1.2 / 2;
    const maxY = portalCenterY + radius * 1.0 + strokeWidth * 1.2 / 2;
    const logoHeight = maxY - minY;
    const svgHeight = logoHeight * 1.24;
    const padding = (svgHeight - logoHeight) / 2;
    return padding - minY;
  })();

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg 
        width={svgWidth} 
        height={svgHeight} 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <defs>
          {/* Cosmic Blue Gradient - Outer Ring */}
          <linearGradient id="auroraCosmicBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6"/>
            <stop offset="50%" stopColor="#1E40AF"/>
            <stop offset="100%" stopColor="#1E3A8A"/>
          </linearGradient>
          
          {/* COSMARA Orange Gradient - Inner Ring & Cosmic O */}
          <linearGradient id="auroraCosmaraOrangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700"/>
            <stop offset="50%" stopColor="#FFA500"/>
            <stop offset="100%" stopColor="#FF6B35"/>
          </linearGradient>
          
          {/* Unified Text Gradient - Spans C to SMARA */}
          <linearGradient 
            id="auroraUnifiedTextGradient" 
            x1={textCPosition} 
            y1={textBaselineY} 
            x2={textSPosition + fontSize * 3.8} 
            y2={textBaselineY} 
            gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFD700"/>
            <stop offset="50%" stopColor="#FFA500"/>
            <stop offset="100%" stopColor="#FF6B35"/>
          </linearGradient>
        </defs>

        {/* Aurora Full Logo Group - Perfect Centering */}
        <g transform={`translate(${logoTransformX}, ${logoTransformY})`}>
          
          {/* Portal C - 2-Ring System */}
          <g fill="none" strokeLinecap="round">
            {/* Outer Portal Ring - Blue Gradient */}
            <path
              d={`M ${portalCenterX + radius * 1.0 * Math.cos(-Math.PI * 0.235)} ${portalCenterY + radius * 1.0 * Math.sin(-Math.PI * 0.235)} 
                 A ${radius * 1.0} ${radius * 1.0} 0 1 0 ${portalCenterX + radius * 1.0 * Math.cos(Math.PI * 0.235)} ${portalCenterY + radius * 1.0 * Math.sin(Math.PI * 0.235)}`}
              stroke="#FFFFFF"
              strokeWidth={strokeWidth * 1.2 + 2}
              opacity="0.8"
            />
            <path
              d={`M ${portalCenterX + radius * 1.0 * Math.cos(-Math.PI * 0.235)} ${portalCenterY + radius * 1.0 * Math.sin(-Math.PI * 0.235)} 
                 A ${radius * 1.0} ${radius * 1.0} 0 1 0 ${portalCenterX + radius * 1.0 * Math.cos(Math.PI * 0.235)} ${portalCenterY + radius * 1.0 * Math.sin(Math.PI * 0.235)}`}
              stroke="url(#auroraCosmicBlueGradient)"
              strokeWidth={strokeWidth * 1.2}
              opacity="0.9"
            />
            
            {/* Inner Portal Ring - Orange Gradient */}
            <path
              d={`M ${portalCenterX + radius * 0.7 * Math.cos(-Math.PI * 0.305)} ${portalCenterY + radius * 0.7 * Math.sin(-Math.PI * 0.305)} 
                 A ${radius * 0.7} ${radius * 0.7} 0 1 0 ${portalCenterX + radius * 0.7 * Math.cos(Math.PI * 0.305)} ${portalCenterY + radius * 0.7 * Math.sin(Math.PI * 0.305)}`}
              stroke="#FFFFFF"
              strokeWidth={strokeWidth * 0.8 + 2}
              opacity="0.8"
            />
            <path
              d={`M ${portalCenterX + radius * 0.7 * Math.cos(-Math.PI * 0.305)} ${portalCenterY + radius * 0.7 * Math.sin(-Math.PI * 0.305)} 
                 A ${radius * 0.7} ${radius * 0.7} 0 1 0 ${portalCenterX + radius * 0.7 * Math.cos(Math.PI * 0.305)} ${portalCenterY + radius * 0.7 * Math.sin(Math.PI * 0.305)}`}
              stroke="url(#auroraCosmaraOrangeGradient)"
              strokeWidth={strokeWidth * 0.8}
              opacity="0.9"
            />
          </g>

          {/* Cosmic "O" - Empty Design with Orange Gradient */}
          <circle 
            cx={cosmicOCenterX} 
            cy={cosmicOCenterY} 
            r={fontSize * 0.55} 
            fill="none" 
            stroke="#FFFFFF" 
            strokeWidth={fontSize * 0.08 + 1 + 1.5} 
            opacity="0.8"
          />
          <circle 
            cx={cosmicOCenterX} 
            cy={cosmicOCenterY} 
            r={fontSize * 0.55} 
            fill="none" 
            stroke="url(#auroraCosmaraOrangeGradient)" 
            strokeWidth={fontSize * 0.08 + 1.5} 
            opacity="0.8"
          />

          {/* COSMARA Text - Unified Gradient System */}
          <g>
            {/* "C" Text - White stroke for universal compatibility */}
            <text x={textCPosition} y={textBaselineY} fontSize={fontSize * 1.1} textAnchor="start" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.9">C</text>
            <text x={textCPosition} y={textBaselineY} fontSize={fontSize * 1.1} textAnchor="start" fill="url(#auroraUnifiedTextGradient)">C</text>
            
            {/* "SMARA" Text - White stroke for universal compatibility */}
            <text x={textSPosition} y={textBaselineY} fontSize={fontSize * 1.1} textAnchor="start" letterSpacing="0.12em" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.9">SMARA</text>
            <text x={textSPosition} y={textBaselineY} fontSize={fontSize * 1.1} textAnchor="start" letterSpacing="0.12em" fill="url(#auroraUnifiedTextGradient)">SMARA</text>
          </g>
        </g>
      </svg>
      
      {showLabel && (
        <div className="text-center mt-2">
          <div className="text-sm font-medium">Aurora Full Logo</div>
          <div className="text-xs text-gray-500">Portal C + Cosmic O + COSMARA Text</div>
        </div>
      )}
    </div>
  );
}

export default AuroraFullLogo;