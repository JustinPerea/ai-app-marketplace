'use client';

import { useEffect, useRef, useState } from 'react';

interface CosmicBackgroundProps {
  starCount?: number;
  parallaxSpeed?: number;
}

export function CosmicBackground({ starCount = 60, parallaxSpeed = 0.5 }: CosmicBackgroundProps) {
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

    // Create stars across entire viewport
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'absolute rounded-full star-cosmic';
      
      // Larger, more visible star sizes
      const size = 3 + Math.random() * 4; // 3-7px for better visibility
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.backgroundColor = '#FFD700';
      star.style.boxShadow = '0 0 12px rgba(255, 215, 0, 1), 0 0 6px rgba(255, 215, 0, 0.8)'; // Much stronger glow
      
      // Random position across entire viewport
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      
      star.style.left = `${x}%`;
      star.style.top = `${y}%`;
      
      // Random animation delays for natural variation
      const twinkleDelay = Math.random() * 4;
      const driftDelay = Math.random() * 30;
      
      star.style.setProperty('--star-delay', `${twinkleDelay}s`);
      star.style.animationDelay = `${twinkleDelay}s, ${driftDelay}s`;
      
      // Vary the drift duration
      const driftDuration = 25 + Math.random() * 20;
      star.style.animationDuration = `4s, ${driftDuration}s`;
      
      // Set much higher opacity for better visibility
      const verticalFade = 1 - (y / 100) * 0.1; // Only reduce opacity by up to 10% toward bottom
      const baseOpacity = 0.8 + Math.random() * 0.2; // 0.8 to 1.0 base range (much higher)
      star.style.opacity = (baseOpacity * verticalFade).toString();
      
      // Store initial position for parallax
      star.setAttribute('data-initial-y', y.toString());
      
      container.appendChild(star);
    }

    // Parallax scroll effect
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const stars = container.querySelectorAll('[data-initial-y]');
      
      stars.forEach((star) => {
        const htmlStar = star as HTMLElement;
        const initialY = parseFloat(htmlStar.getAttribute('data-initial-y') || '0');
        const parallaxOffset = scrollY * parallaxSpeed;
        
        // Move stars in opposite direction of scroll
        const newY = initialY - (parallaxOffset / window.innerHeight) * 100;
        htmlStar.style.top = `${newY}%`;
        
        // Fade out stars that move too far up or down
        const opacity = parseFloat(htmlStar.style.opacity || '0.5');
        if (newY < -10 || newY > 110) {
          htmlStar.style.opacity = '0';
        } else if (newY >= 0 && newY <= 100) {
          htmlStar.style.opacity = opacity.toString();
        }
      });
    };

    // Add scroll listener with throttling for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [starCount, parallaxSpeed, mounted]);

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1, background: 'transparent' }}
    />
  );
}