'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedStatsProps {
  stats: Array<{
    value: string;
    label: string;
    animatedValue?: number;
  }>;
}

export function AnimatedStats({ stats }: AnimatedStatsProps) {
  const statsRef = useRef<HTMLDivElement>(null);
  const countersRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!statsRef.current) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Show final values immediately for accessibility
      countersRef.current.forEach((counter, index) => {
        if (counter) {
          counter.textContent = stats[index].value;
        }
      });
      return;
    }

    // GSAP Animation Timeline
    const tl = gsap.timeline({
      delay: 0.5, // Start after page load
    });

    // Animate each counter
    countersRef.current.forEach((counter, index) => {
      if (counter && stats[index].animatedValue) {
        // Start from 0 and animate to target value
        gsap.set(counter, { textContent: "0" });
        
        tl.to(counter, {
          textContent: stats[index].animatedValue,
          duration: 2,
          ease: "power2.out",
          snap: { textContent: 1 }, // Snap to whole numbers
          onUpdate: function() {
            const currentValue = Math.round(this.targets()[0].textContent);
            const stat = stats[index];
            
            // Format the display value
            if (stat.value.includes('K')) {
              counter.textContent = currentValue >= 1000 ? 
                `${(currentValue / 1000).toFixed(1)}K` : 
                currentValue.toString();
            } else if (stat.value.includes('%')) {
              counter.textContent = `${currentValue}%`;
            } else if (stat.value.includes('+')) {
              counter.textContent = `${currentValue}+`;
            } else {
              counter.textContent = currentValue.toString();
            }
          }
        }, index * 0.2); // Stagger animation
      }
    });

    // Cleanup
    return () => {
      tl.kill();
    };
  }, [stats]);

  return (
    <div 
      ref={statsRef}
      className="grid grid-cols-3 gap-8 max-w-md mx-auto"
    >
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div 
            ref={(el) => (countersRef.current[index] = el)}
            className="text-2xl font-bold text-text-primary"
          >
            {stat.value}
          </div>
          <div className="text-sm text-text-secondary">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}