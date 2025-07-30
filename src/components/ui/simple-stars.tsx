'use client';

import { useEffect, useState } from 'react';

interface SimpleStarsProps {
  starCount?: number;
  parallaxSpeed?: number;
}

export function SimpleStars({ starCount = 30, parallaxSpeed = 0.3 }: SimpleStarsProps) {
  const [stars, setStars] = useState<Array<{ 
    id: number; 
    left: string; 
    initialTop: number; 
    currentTop: number;
    size: number; 
    delay: number;
  }>>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < starCount; i++) {
        const initialTop = Math.random() * 100;
        newStars.push({
          id: i,
          left: `${Math.random() * 100}%`,
          initialTop,
          currentTop: initialTop,
          size: 2 + Math.random() * 3, // 2-5px
          delay: Math.random() * 4, // 0-4s delay
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, [starCount]);

  // Parallax scroll effect
  useEffect(() => {
    if (stars.length === 0) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      setStars(prevStars => 
        prevStars.map(star => ({
          ...star,
          currentTop: star.initialTop - (scrollY * parallaxSpeed / window.innerHeight) * 100
        }))
      );
    };

    // Throttle scroll events for performance
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

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [stars.length, parallaxSpeed]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full star-cosmic"
          style={{
            left: star.left,
            top: `${star.currentTop}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: '#FFD700',
            boxShadow: '0 0 6px rgba(255, 215, 0, 0.8)',
            opacity: star.currentTop < -10 || star.currentTop > 110 ? 0 : 0.7 + Math.random() * 0.3, // Fade out stars that move too far
            animationDelay: `${star.delay}s`,
            transition: 'opacity 0.3s ease-out', // Smooth fade transition
          }}
        />
      ))}
    </div>
  );
}