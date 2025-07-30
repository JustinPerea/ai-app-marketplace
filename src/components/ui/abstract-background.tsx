'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ShapeConfig {
  type: 'triangle' | 'hexagon' | 'square' | 'circle' | 'diamond' | 'line';
  size: number;
  gradient: string;
  initialPosition: { x: number; y: number };
  animationSpeed: number;
  scrollMultiplier: number;
}

export function AbstractBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shapesRef = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline>();

  // Enhanced shape configurations for better visual distribution
  const shapeConfigs: ShapeConfig[] = [
    // Large background shapes
    { type: 'triangle', size: 120, gradient: 'from-accent-sapphire/6 to-accent-azure/3', initialPosition: { x: 0.1, y: 0.2 }, animationSpeed: 25, scrollMultiplier: 0.3 },
    { type: 'hexagon', size: 100, gradient: 'from-innovation-magenta/5 to-innovation-rose/2', initialPosition: { x: 0.8, y: 0.15 }, animationSpeed: 30, scrollMultiplier: 0.4 },
    { type: 'circle', size: 80, gradient: 'from-primary-steel/8 to-primary-slate/4', initialPosition: { x: 0.15, y: 0.7 }, animationSpeed: 35, scrollMultiplier: 0.2 },
    
    // Medium accent shapes
    { type: 'diamond', size: 60, gradient: 'from-accent-azure/7 to-innovation-magenta/3', initialPosition: { x: 0.7, y: 0.6 }, animationSpeed: 20, scrollMultiplier: 0.5 },
    { type: 'square', size: 50, gradient: 'from-innovation-rose/6 to-accent-sapphire/3', initialPosition: { x: 0.9, y: 0.8 }, animationSpeed: 28, scrollMultiplier: 0.3 },
    { type: 'triangle', size: 70, gradient: 'from-primary-slate/9 to-accent-azure/4', initialPosition: { x: 0.05, y: 0.9 }, animationSpeed: 22, scrollMultiplier: 0.4 },
    
    // Small detail shapes
    { type: 'circle', size: 40, gradient: 'from-innovation-magenta/8 to-primary-steel/4', initialPosition: { x: 0.6, y: 0.3 }, animationSpeed: 18, scrollMultiplier: 0.6 },
    { type: 'hexagon', size: 35, gradient: 'from-accent-sapphire/9 to-innovation-rose/4', initialPosition: { x: 0.3, y: 0.5 }, animationSpeed: 24, scrollMultiplier: 0.35 },
    
    // Flowing lines for connectivity
    { type: 'line', size: 150, gradient: 'from-transparent via-accent-azure/15 to-transparent', initialPosition: { x: 0.4, y: 0.1 }, animationSpeed: 40, scrollMultiplier: 0.2 },
    { type: 'line', size: 120, gradient: 'from-transparent via-innovation-magenta/12 to-transparent', initialPosition: { x: 0.75, y: 0.4 }, animationSpeed: 35, scrollMultiplier: 0.25 },
    { type: 'line', size: 100, gradient: 'from-transparent via-primary-slate/18 to-transparent', initialPosition: { x: 0.2, y: 0.8 }, animationSpeed: 30, scrollMultiplier: 0.3 },
  ];

  const getClipPath = (type: ShapeConfig['type']): string => {
    switch (type) {
      case 'triangle': return 'polygon(50% 0%, 0% 100%, 100% 100%)';
      case 'hexagon': return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
      case 'square': return 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
      case 'circle': return 'circle(50% at 50% 50%)';
      case 'diamond': return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
      case 'line': return 'none';
      default: return 'circle(50% at 50% 50%)';
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      return; // Skip animations for accessibility
    }

    const shapes = shapesRef.current.filter(Boolean);
    const tl = gsap.timeline();
    timelineRef.current = tl;
    
    // Enhanced initial setup with better positioning
    shapes.forEach((shape, index) => {
      if (shape && shapeConfigs[index]) {
        const config = shapeConfigs[index];
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        gsap.set(shape, {
          x: config.initialPosition.x * viewportWidth,
          y: config.initialPosition.y * viewportHeight,
          rotation: Math.random() * 360,
          scale: 0.6 + Math.random() * 0.4,
        });
      }
    });

    // Enhanced continuous floating animations
    shapes.forEach((shape, index) => {
      if (shape && shapeConfigs[index]) {
        const config = shapeConfigs[index];
        
        // Organic floating movement
        gsap.to(shape, {
          x: `+=${(Math.random() - 0.5) * 300}`,
          y: `+=${(Math.random() - 0.5) * 200}`,
          rotation: `+=${360 + Math.random() * 180}`,
          duration: config.animationSpeed,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 2, // Stagger start times
        });

        // Subtle breathing scale animation
        gsap.to(shape, {
          scale: `+=${0.1 + Math.random() * 0.2}`,
          duration: 8 + Math.random() * 4,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
          delay: Math.random() * 3,
        });
      }
    });

    // Enhanced scroll event handler with dramatic visible effects
    let lastScrollY = 0;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.max(0, Math.min(1, scrollY / scrollHeight));
      const scrollDirection = scrollY > lastScrollY ? 1 : -1;
      const scrollSpeed = Math.abs(scrollY - lastScrollY);
      lastScrollY = scrollY;
      
      console.log('Scroll Progress:', scrollPercent, 'Direction:', scrollDirection, 'Speed:', scrollSpeed);
      
      shapes.forEach((shape, index) => {
        if (shape && shapeConfigs[index]) {
          const config = shapeConfigs[index];
          const progress = scrollPercent;
          
          // Much more dramatic transformations for visibility
          const baseY = config.initialPosition.y * window.innerHeight;
          const scrollOffset = 300 * config.scrollMultiplier * progress * scrollDirection;
          const rotationOffset = 360 * config.scrollMultiplier * progress;
          const scaleRange = 0.5 + (1.5 * progress); // Much larger scale range
          const opacityRange = 0.15 + (0.25 * progress); // Higher opacity for visibility
          
          gsap.set(shape, {
            y: baseY + scrollOffset,
            x: config.initialPosition.x * window.innerWidth + (scrollSpeed * config.scrollMultiplier * 2),
            rotation: rotationOffset + (scrollSpeed * 5),
            scale: scaleRange,
            opacity: opacityRange,
            filter: `blur(${2 - (progress * 1)}px) hue-rotate(${progress * 90}deg)`,
          });
        }
      });
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial call to set positions
    handleScroll();

    // Cleanup
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.6 }} // Slightly increased overall opacity
    >
      {shapeConfigs.map((config, index) => (
        <div
          key={index}
          ref={(el) => (shapesRef.current[index] = el)}
          className={`absolute bg-gradient-to-br ${config.gradient} abstract-shape-optimized shape-morph`}
          style={{
            width: config.type === 'line' ? '2px' : `${config.size}px`,
            height: config.type === 'line' ? `${config.size}px` : `${config.size}px`,
            clipPath: getClipPath(config.type),
            filter: 'blur(1.5px)',
            opacity: config.type === 'line' ? 0.3 : 0.4, // Much higher for visibility
            transform: config.type === 'line' ? `rotate(${index * 30}deg)` : 'none',
          }}
        />
      ))}
    </div>
  );
}