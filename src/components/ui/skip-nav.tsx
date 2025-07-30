'use client';

import { Button } from './button';

export function SkipNavigation() {
  const skipToContent = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  };

  return (
    <Button
      onClick={skipToContent}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] bg-primary text-primary-foreground"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          skipToContent();
        }
      }}
    >
      Skip to main content
    </Button>
  );
}

export function SkipToSection({ targetId, children }: { targetId: string; children: React.ReactNode }) {
  const skipToSection = () => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.focus();
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={skipToSection}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-[100] bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-medium transition-colors"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          skipToSection();
        }
      }}
    >
      {children}
    </button>
  );
}