/**
 * Aurora Icon Component
 * 
 * Icon version of COSMARA logo with Portal C + Cosmic "O" only (no text).
 * Perfect for favicons, app icons, and small UI spaces.
 * 
 * Usage:
 * ```tsx
 * import { AuroraIcon } from './aurora-icon';
 * 
 * <AuroraIcon size={128} />
 * ```
 */

import React from 'react';

interface AuroraIconProps {
  size?: number;
  className?: string;
  showLabel?: boolean;
}

export function AuroraIcon({ 
  size = 128, 
  className = '', 
  showLabel = false 
}: AuroraIconProps) {
  // IDENTICAL scaling to Aurora Full Logo
  const strokeWidth = size * 0.04;
  const radius = size * 0.18;
  const fontSize = size * 0.12;
  
  // Portal positioning (matching full logo)
  const portalTransformY = size * 0.1;
  const portalCenterX = size * 0.0 + radius * 1.15;
  const portalCenterY = portalTransformY + radius * 1.4;
  
  // Cosmic "O" positioning (identical to full logo)
  const cosmicOCenterX = portalCenterX + (radius * 0.65);
  const cosmicOCenterY = portalCenterY; // Aligned with Portal C rings center
  const cosmicORadius = fontSize * 0.55;
  
  // Pre-calculated SVG dimensions for icon (12% padding)
  const iconSvgWidth = (() => {
    const minX = portalCenterX - radius * 1.0 - strokeWidth * 1.2 / 2;
    const maxX = cosmicOCenterX + cosmicORadius;
    const logoWidth = maxX - minX;
    return logoWidth * 1.24;
  })();
  
  const iconSvgHeight = (() => {
    const minY = portalCenterY - radius * 1.0 - strokeWidth * 1.2 / 2;
    const maxY = portalCenterY + radius * 1.0 + strokeWidth * 1.2 / 2;
    const logoHeight = maxY - minY;
    return logoHeight * 1.24;
  })();
  
  // Transform for perfect centering
  const iconTransformX = (() => {
    const minX = portalCenterX - radius * 1.0 - strokeWidth * 1.2 / 2;
    const maxX = cosmicOCenterX + cosmicORadius;
    const logoWidth = maxX - minX;
    const svgWidth = logoWidth * 1.24;
    const padding = (svgWidth - logoWidth) / 2;
    return padding - minX;
  })();
  
  const iconTransformY = (() => {
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
        width={iconSvgWidth}
        height={iconSvgHeight}
        viewBox={`0 0 ${iconSvgWidth} ${iconSvgHeight}`}>
        <defs>
          {/* Cosmic Blue Gradient - Outer Ring */}
          <linearGradient id="iconCosmicBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6"/>
            <stop offset="50%" stopColor="#1E40AF"/>
            <stop offset="100%" stopColor="#1E3A8A"/>
          </linearGradient>
          
          {/* COSMARA Orange Gradient - Inner Ring & Cosmic O */}
          <linearGradient id="iconCosmaraOrangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700"/>
            <stop offset="50%" stopColor="#FFA500"/>
            <stop offset="100%" stopColor="#FF6B35"/>
          </linearGradient>
        </defs>

        {/* Aurora Icon Group - Perfect Centering */}
        <g transform={`translate(${iconTransformX}, ${iconTransformY})`}>
          
          {/* Portal C - 2-Ring System - IDENTICAL to Full Logo */}
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
              stroke="url(#iconCosmicBlueGradient)"
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
              stroke="url(#iconCosmaraOrangeGradient)"
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
            stroke="url(#iconCosmaraOrangeGradient)" 
            strokeWidth={fontSize * 0.08 + 1.5} 
            opacity="0.8"
          />

          {/* NO SMARA TEXT - Icon version only has Portal C + Cosmic O */}
        </g>
      </svg>
      
      {showLabel && (
        <div className="text-center mt-2">
          <div className="text-sm font-medium">Aurora Icon</div>
          <div className="text-xs text-gray-500">Portal C + Cosmic O Only</div>
        </div>
      )}
    </div>
  );
}

export default AuroraIcon;