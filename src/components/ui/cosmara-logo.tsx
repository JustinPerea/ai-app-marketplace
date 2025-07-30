'use client';

interface CosmaraLogoProps {
  size?: number;
  className?: string;
}

export function CosmaraLogo({ size = 32, className = '' }: CosmaraLogoProps) {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Constellation Pattern - Connected Stars */}
        <defs>
          <linearGradient id="cosmaraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FF6B35" />
          </linearGradient>
        </defs>
        
        {/* Connection Lines */}
        <path
          d="M8 12 L16 8 L24 12 L20 20 L12 20 Z"
          stroke="url(#cosmaraGradient)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
        
        {/* Main Stars */}
        <circle cx="8" cy="12" r="2.5" fill="url(#cosmaraGradient)" />
        <circle cx="16" cy="8" r="3" fill="url(#cosmaraGradient)" />
        <circle cx="24" cy="12" r="2.5" fill="url(#cosmaraGradient)" />
        <circle cx="20" cy="20" r="2" fill="url(#cosmaraGradient)" />
        <circle cx="12" cy="20" r="2" fill="url(#cosmaraGradient)" />
        
        {/* Small accent stars */}
        <circle cx="6" cy="6" r="1" fill="url(#cosmaraGradient)" opacity="0.7" />
        <circle cx="26" cy="6" r="1" fill="url(#cosmaraGradient)" opacity="0.7" />
        <circle cx="26" cy="26" r="1" fill="url(#cosmaraGradient)" opacity="0.7" />
      </svg>
    </div>
  );
}