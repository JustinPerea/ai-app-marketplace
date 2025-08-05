/**
 * COSMARA Logo Concept Variations
 * 
 * Visual concepts for standalone logo recognition improvements
 * Based on comprehensive logo design research findings
 */

import React from 'react';

interface LogoConceptProps {
  size?: number;
  className?: string;
  showLabel?: boolean;
}

// Concept 1: Stellar Navigation Core
export function StellarNavigationCore({ size = 80, className = '', showLabel = false }: LogoConceptProps) {
  const strokeWidth = size * 0.025; // Responsive stroke width
  const centralRadius = size * 0.15; // Large central star - 40% of logo area
  const nodeRadius = size * 0.08; // Secondary nodes
  const connectionDistance = size * 0.35; // Connection radius

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {/* Connection Lines */}
        <g stroke="#FFD700" strokeWidth={strokeWidth * 1.5} fill="none" opacity="0.8">
          {/* Three connection arms at 120° intervals */}
          <line 
            x1={size/2} 
            y1={size/2} 
            x2={size/2} 
            y2={size/2 - connectionDistance}
          />
          <line 
            x1={size/2} 
            y1={size/2} 
            x2={size/2 + connectionDistance * Math.cos(Math.PI/3)} 
            y2={size/2 + connectionDistance * Math.sin(Math.PI/3)}
          />
          <line 
            x1={size/2} 
            y1={size/2} 
            x2={size/2 - connectionDistance * Math.cos(Math.PI/3)} 
            y2={size/2 + connectionDistance * Math.sin(Math.PI/3)}
          />
        </g>

        {/* Secondary Nodes */}
        <g fill="#FFD700" stroke="#FFD700" strokeWidth={strokeWidth}>
          {/* Top node */}
          <circle 
            cx={size/2} 
            cy={size/2 - connectionDistance} 
            r={nodeRadius}
            className="animate-pulse"
            style={{ animationDelay: '0s', animationDuration: '3s' }}
          />
          {/* Bottom right node */}
          <circle 
            cx={size/2 + connectionDistance * Math.cos(Math.PI/3)} 
            cy={size/2 + connectionDistance * Math.sin(Math.PI/3)} 
            r={nodeRadius}
            className="animate-pulse"
            style={{ animationDelay: '1s', animationDuration: '3s' }}
          />
          {/* Bottom left node */}
          <circle 
            cx={size/2 - connectionDistance * Math.cos(Math.PI/3)} 
            cy={size/2 + connectionDistance * Math.sin(Math.PI/3)} 
            r={nodeRadius}
            className="animate-pulse"
            style={{ animationDelay: '2s', animationDuration: '3s' }}
          />
        </g>

        {/* Central Star - Large and Dominant */}
        <g fill="#FFD700" stroke="#FF6B35" strokeWidth={strokeWidth * 0.5}>
          <circle 
            cx={size/2} 
            cy={size/2} 
            r={centralRadius}
            filter="url(#glow)"
            className="animate-pulse"
            style={{ animationDuration: '2s' }}
          />
          {/* Inner core */}
          <circle 
            cx={size/2} 
            cy={size/2} 
            r={centralRadius * 0.6}
            fill="#FFF"
            opacity="0.9"
          />
        </g>

        {/* Glow Filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Stellar Navigation Core
          <div className="text-xs text-gray-500">Central focus • Simplified • Scalable</div>
        </div>
      )}
    </div>
  );
}

// Concept 2: Cosmic Circuit Compass
export function CosmicCircuitCompass({ size = 80, className = '', showLabel = false }: LogoConceptProps) {
  const strokeWidth = size * 0.02;
  const centerRadius = size * 0.12;
  const compassRadius = size * 0.3;

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {/* Compass Ring */}
        <circle 
          cx={size/2} 
          cy={size/2} 
          r={compassRadius} 
          fill="none" 
          stroke="#3B82F6" 
          strokeWidth={strokeWidth * 1.5}
          opacity="0.6"
          strokeDasharray="5,3"
          className="animate-spin"
          style={{ animationDuration: '20s' }}
        />

        {/* Cardinal Direction Arms */}
        <g stroke="#FFD700" strokeWidth={strokeWidth * 2} fill="none">
          {/* North */}
          <line x1={size/2} y1={size/2} x2={size/2} y2={size/2 - compassRadius * 0.8} />
          {/* East */}
          <line x1={size/2} y1={size/2} x2={size/2 + compassRadius * 0.8} y2={size/2} />
          {/* South */}
          <line x1={size/2} y1={size/2} x2={size/2} y2={size/2 + compassRadius * 0.8} />
          {/* West */}
          <line x1={size/2} y1={size/2} x2={size/2 - compassRadius * 0.8} y2={size/2} />
        </g>

        {/* Circuit Endpoints */}
        <g fill="#8B5CF6">
          <rect x={size/2 - 3} y={size/2 - compassRadius * 0.8 - 3} width="6" height="6" rx="1" />
          <rect x={size/2 + compassRadius * 0.8 - 3} y={size/2 - 3} width="6" height="6" rx="1" />
          <rect x={size/2 - 3} y={size/2 + compassRadius * 0.8 - 3} width="6" height="6" rx="1" />
          <rect x={size/2 - compassRadius * 0.8 - 3} y={size/2 - 3} width="6" height="6" rx="1" />
        </g>

        {/* Central Hub */}
        <circle 
          cx={size/2} 
          cy={size/2} 
          r={centerRadius} 
          fill="url(#compassGradient)"
          stroke="#FFD700" 
          strokeWidth={strokeWidth}
        />

        {/* Gradient Definition */}
        <defs>
          <radialGradient id="compassGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF" stopOpacity="0.9"/>
            <stop offset="70%" stopColor="#FFD700" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#FF6B35" stopOpacity="1"/>
          </radialGradient>
        </defs>
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Cosmic Circuit Compass
          <div className="text-xs text-gray-500">Navigation • Precision • Universal</div>
        </div>
      )}
    </div>
  );
}

// Concept 3: Quantum Network Node
export function QuantumNetworkNode({ size = 80, className = '', showLabel = false }: LogoConceptProps) {
  const strokeWidth = size * 0.02;
  const hexRadius = size * 0.15;
  const armLength = size * 0.25;
  const nodeRadius = size * 0.06;

  // Hexagon points
  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI) / 3;
    return {
      x: size/2 + hexRadius * Math.cos(angle),
      y: size/2 + hexRadius * Math.sin(angle)
    };
  });

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {/* Three Dynamic Arms */}
        <g stroke="#FFD700" strokeWidth={strokeWidth * 1.5} fill="none">
          {/* Top arm */}
          <path 
            d={`M ${size/2} ${size/2} Q ${size/2} ${size/2 - armLength * 0.7} ${size/2} ${size/2 - armLength}`}
            className="animate-pulse"
            style={{ animationDelay: '0s', animationDuration: '2s' }}
          />
          {/* Bottom right arm */}
          <path 
            d={`M ${size/2} ${size/2} Q ${size/2 + armLength * 0.5} ${size/2 + armLength * 0.3} ${size/2 + armLength * 0.8} ${size/2 + armLength * 0.6}`}
            className="animate-pulse"
            style={{ animationDelay: '0.7s', animationDuration: '2s' }}
          />
          {/* Bottom left arm */}
          <path 
            d={`M ${size/2} ${size/2} Q ${size/2 - armLength * 0.5} ${size/2 + armLength * 0.3} ${size/2 - armLength * 0.8} ${size/2 + armLength * 0.6}`}
            className="animate-pulse"
            style={{ animationDelay: '1.4s', animationDuration: '2s' }}
          />
        </g>

        {/* Terminal Nodes */}
        <g fill="#8B5CF6" stroke="#3B82F6" strokeWidth={strokeWidth}>
          <circle cx={size/2} cy={size/2 - armLength} r={nodeRadius} />
          <circle cx={size/2 + armLength * 0.8} cy={size/2 + armLength * 0.6} r={nodeRadius} />
          <circle cx={size/2 - armLength * 0.8} cy={size/2 + armLength * 0.6} r={nodeRadius} />
        </g>

        {/* Central Hexagonal Core */}
        <polygon 
          points={hexPoints.map(p => `${p.x},${p.y}`).join(' ')}
          fill="url(#quantumGradient)"
          stroke="#FFD700" 
          strokeWidth={strokeWidth * 1.5}
          className="animate-pulse"
          style={{ animationDuration: '3s' }}
        />

        {/* Inner Geometric Pattern */}
        <polygon 
          points={hexPoints.map(p => `${size/2 + (p.x - size/2) * 0.6},${size/2 + (p.y - size/2) * 0.6}`).join(' ')}
          fill="#FFF"
          opacity="0.8"
        />

        {/* Gradient Definition */}
        <defs>
          <linearGradient id="quantumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9"/>
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8"/>
          </linearGradient>
        </defs>
      </svg>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-center text-gray-600">
          Quantum Network Node
          <div className="text-xs text-gray-500">Geometric • Modern • Distinctive</div>
        </div>
      )}
    </div>
  );
}

// Logo Comparison Component
export function LogoConceptShowcase({ className = '' }: { className?: string }) {
  return (
    <div className={`p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl ${className}`}>
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
        COSMARA Logo Concept Variations
      </h2>
      
      {/* Large Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
          <StellarNavigationCore size={120} showLabel={true} />
          <div className="mt-4 text-center">
            <div className="text-sm font-semibold text-green-600">✓ Recommended</div>
            <div className="text-xs text-gray-500 mt-1">Best scalability & recognition</div>
          </div>
        </div>
        
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
          <CosmicCircuitCompass size={120} showLabel={true} />
          <div className="mt-4 text-center">
            <div className="text-sm font-semibold text-blue-600">Universal Appeal</div>
            <div className="text-xs text-gray-500 mt-1">Compass metaphor recognition</div>
          </div>
        </div>
        
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
          <QuantumNetworkNode size={120} showLabel={true} />
          <div className="mt-4 text-center">
            <div className="text-sm font-semibold text-purple-600">Most Distinctive</div>
            <div className="text-xs text-gray-500 mt-1">Unique geometric approach</div>
          </div>
        </div>
      </div>

      {/* Size Comparison */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Scalability Test</h3>
        <div className="flex items-end justify-center space-x-8">
          <div className="text-center">
            <div className="mb-2 space-y-2">
              <StellarNavigationCore size={64} />
              <StellarNavigationCore size={32} />
              <StellarNavigationCore size={16} />
            </div>
            <div className="text-xs text-gray-500">64px • 32px • 16px</div>
          </div>
          
          <div className="text-center">
            <div className="mb-2 space-y-2">
              <CosmicCircuitCompass size={64} />
              <CosmicCircuitCompass size={32} />
              <CosmicCircuitCompass size={16} />
            </div>
            <div className="text-xs text-gray-500">64px • 32px • 16px</div>
          </div>
          
          <div className="text-center">
            <div className="mb-2 space-y-2">
              <QuantumNetworkNode size={64} />
              <QuantumNetworkNode size={32} />
              <QuantumNetworkNode size={16} />
            </div>
            <div className="text-xs text-gray-500">64px • 32px • 16px</div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p className="font-medium">Research-Based Design Principles:</p>
        <p>• Simplified elements (3-5 max) • Strong central focus • Golden brand color preserved • Scalable recognition</p>
      </div>
    </div>
  );
}