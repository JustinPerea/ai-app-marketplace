'use client';

import { useEffect, useRef, useState } from 'react';

interface TwinklingStarsProps {
  count?: number;
  className?: string;
  centerDensity?: boolean; // New prop to enable center-focused distribution
}

export function TwinklingStars({ count = 25, className = '', centerDensity = true }: TwinklingStarsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing stars
    container.innerHTML = '';

    // Create stars with density distribution
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'absolute rounded-full star-cosmic';
      
      // Larger, more visible star sizes
      const size = 2 + Math.random() * 3; // 2-5px for better visibility
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.backgroundColor = '#FFD700';
      star.style.boxShadow = '0 0 6px rgba(255, 215, 0, 0.8)'; // Add glow effect
      
      let x, y;
      
      if (centerDensity) {
        // Create density gradient - more stars near center, fewer at edges
        // Use gaussian-like distribution for more natural clustering
        const centerX = 50; // Center of container
        const centerY = 50;
        
        // Generate position with bias toward center but more spread out
        const spread = 60; // Increased spread to cover more of the hero section
        const gaussianX = (Math.random() + Math.random() + Math.random() + Math.random()) / 4; // Approximate gaussian
        const gaussianY = (Math.random() + Math.random() + Math.random() + Math.random()) / 4;
        
        x = centerX + (gaussianX - 0.5) * spread;
        y = centerY + (gaussianY - 0.5) * spread;
        
        // Ensure stars stay within bounds with minimal padding for full coverage
        x = Math.max(5, Math.min(95, x));
        y = Math.max(5, Math.min(95, y));
      } else {
        // Original random distribution
        x = Math.random() * 100;
        y = Math.random() * 100;
      }
      
      star.style.left = `${x}%`;
      star.style.top = `${y}%`;
      
      // Random animation delays for natural variation
      const twinkleDelay = Math.random() * 3; // 0-3 second delay for twinkling
      const driftDelay = Math.random() * 25; // 0-25 second delay for drift movement
      
      // Set CSS custom properties for animation delays
      star.style.setProperty('--star-delay', `${twinkleDelay}s`);
      star.style.animationDelay = `${twinkleDelay}s, ${driftDelay}s`;
      
      // Vary the drift duration slightly for each star
      const driftDuration = 20 + Math.random() * 15; // 20-35 second duration
      star.style.animationDuration = `3s, ${driftDuration}s`;
      
      // Variable opacity based on distance from center (if centerDensity is enabled)
      let opacity;
      if (centerDensity) {
        const distanceFromCenter = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 50, 2));
        const maxDistance = Math.sqrt(50 * 50 + 50 * 50); // Distance to corner
        const normalizedDistance = distanceFromCenter / maxDistance;
        // Stars closer to center are more visible, but overall more subtle
        opacity = 0.6 - (normalizedDistance * 0.3); // 0.3 to 0.6 opacity range (more subtle)
      } else {
        opacity = 0.3 + Math.random() * 0.3; // 0.3 to 0.6 opacity (more subtle)
      }
      
      star.style.opacity = opacity.toString();
      
      container.appendChild(star);
    }
  }, [count, mounted, centerDensity]);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 1 }}
    />
  );
}