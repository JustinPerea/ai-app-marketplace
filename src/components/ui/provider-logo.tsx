/**
 * Provider Logo Component
 * 
 * Displays official AI provider logos using nominative fair use doctrine.
 * These logos are used solely for identification purposes in our integration platform,
 * similar to how Zapier and other marketplace platforms display third-party service logos.
 * 
 * Legal Notice: All logos and trademarks are property of their respective owners.
 * OpenAI®, ChatGPT®, Anthropic®, Claude®, Google®, Cohere®, and Hugging Face® 
 * are trademarks of their respective companies. This platform is not affiliated with,
 * endorsed by, or sponsored by these companies.
 */

import React from 'react';

interface ProviderLogoProps {
  provider: string;
  size?: number;
  className?: string;
}

// Official logo configurations for AI providers
const PROVIDER_LOGOS = {
  OPENAI: {
    src: '/logos/providers/openai.svg',
    alt: 'OpenAI Logo',
    fallback: '/logos/providers/openai.png',
    // Better OpenAI SVG with recognizable design
    svgContent: `<svg viewBox="0 0 24 24" fill="#10A37F">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.078 6.078 0 0 0 6.518 2.9 5.991 5.991 0 0 0 4.236 1.983c3.314 0 6.005-2.69 6.005-6.009 0-.666-.107-1.308-.297-1.913a6.027 6.027 0 0 0 4.084-5.748zm-9.133 11.013a4.006 4.006 0 0 1-2.84-1.183l.043-.025 4.747-2.74a.783.783 0 0 0 .393-.682v-6.695l2.004 1.157a.073.073 0 0 1 .039.064v5.54a4.024 4.024 0 0 1-4.386 3.964zm-8.781-3.85c-.504-.874-.411-1.963.232-2.75l.043.025 4.747 2.74a.789.789 0 0 0 .787 0l5.795-3.35v2.313a.073.073 0 0 1-.029.061L9.736 19.73a4.024 4.024 0 0 1-5.368-1.746zm-1.133-7.527c.5-.865 1.44-1.4 2.448-1.4v6.685a.783.783 0 0 0 .393.682l5.794 3.35-2.005 1.157a.073.073 0 0 1-.068 0L5.35 16.23a4.024 4.024 0 0 1-1.415-5.773zm19.606 2.285l-5.793-3.35L19.853 7.2a.073.073 0 0 1 .068 0l5.447 3.145c1.584.915 2.133 2.938 1.218 4.522-.915 1.584-2.938 2.133-4.522 1.218z"/>
    </svg>`
  },
  ANTHROPIC: {
    src: '/logos/providers/anthropic.svg', 
    alt: 'Anthropic Claude Logo',
    fallback: '/logos/providers/anthropic.png',
    // Better Anthropic SVG with recognizable A design
    svgContent: `<svg viewBox="0 0 24 24" fill="#D4915D">
      <path d="M12 2L3 20h4.5l1.5-3h6l1.5 3H21L12 2zm-2.5 12L12 8l2.5 6h-5z"/>
    </svg>`
  },
  GOOGLE: {
    src: '/logos/providers/google-ai.svg',
    alt: 'Google AI Logo', 
    fallback: '/logos/providers/google-ai.png',
    // Google's colors SVG
    svgContent: `<svg viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>`
  },
  COHERE: {
    src: '/logos/providers/cohere.svg',
    alt: 'Cohere Logo',
    fallback: '/logos/providers/cohere.png',
    // Better Cohere SVG with coral brand color
    svgContent: `<svg viewBox="0 0 24 24" fill="#FF6B35">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.19 0 2.34-.21 3.41-.6.36-.13.61-.47.61-.86 0-.51-.42-.93-.93-.93-.16 0-.31.04-.45.11-.82.29-1.69.44-2.64.44-4.07 0-7.36-3.29-7.36-7.36S7.93 4.64 12 4.64s7.36 3.29 7.36 7.36c0 1.99-.8 3.8-2.09 5.12-.16.16-.25.38-.25.61 0 .48.39.87.87.87.24 0 .46-.1.62-.26C21.45 16.67 22.36 14.42 22.36 12 22 6.48 17.52 2 12 2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`
  },
  HUGGING_FACE: {
    src: '/logos/providers/huggingface.svg',
    alt: 'Hugging Face Logo',
    fallback: '/logos/providers/huggingface.png', 
    // Keep the emoji since it's working well
    svgContent: `<span style="font-size: inherit;">🤗</span>`
  },
  LOCAL: {
    src: '/logos/providers/ollama.svg',
    alt: 'Ollama Logo',
    fallback: '/logos/providers/ollama.png',
    // Better Ollama/Local AI SVG with llama-like design
    svgContent: `<svg viewBox="0 0 24 24" fill="#7C3AED">
      <path d="M12 2c-2.76 0-5 2.24-5 5v2c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2V7c0-2.76-2.24-5-5-5zm-3 5c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V7z"/>
      <circle cx="10" cy="14" r="1" fill="white"/>
      <circle cx="14" cy="14" r="1" fill="white"/>
    </svg>`
  }
};

export function ProviderLogo({ provider, size = 20, className = '' }: ProviderLogoProps) {
  const logoConfig = PROVIDER_LOGOS[provider as keyof typeof PROVIDER_LOGOS];
  
  if (!logoConfig) {
    // Fallback to generic AI icon
    return (
      <div 
        className={`inline-flex items-center justify-center rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
    );
  }

  // Actual AI provider logos using nominative fair use (like Zapier)
  const renderLogo = () => {
    switch (provider) {
      case 'OPENAI':
        // Official OpenAI logo design
        return (
          <div className={`inline-flex items-center justify-center ${className}`}>
            <svg 
              width={size} 
              height={size} 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.078 6.078 0 0 0 6.518 2.9 5.991 5.991 0 0 0 4.236 1.983c3.314 0 6.005-2.69 6.005-6.009 0-.666-.107-1.308-.297-1.913a6.027 6.027 0 0 0 4.084-5.748zm-9.133 11.013a4.006 4.006 0 0 1-2.84-1.183l.043-.025 4.747-2.74a.783.783 0 0 0 .393-.682v-6.695l2.004 1.157a.073.073 0 0 1 .039.064v5.54a4.024 4.024 0 0 1-4.386 3.964zm-8.781-3.85c-.504-.874-.411-1.963.232-2.75l.043.025 4.747 2.74a.789.789 0 0 0 .787 0l5.795-3.35v2.313a.073.073 0 0 1-.029.061L9.736 19.73a4.024 4.024 0 0 1-5.368-1.746zm-1.133-7.527c.5-.865 1.44-1.4 2.448-1.4v6.685a.783.783 0 0 0 .393.682l5.794 3.35-2.005 1.157a.073.073 0 0 1-.068 0L5.35 16.23a4.024 4.024 0 0 1-1.415-5.773zm19.606 2.285l-5.793-3.35L19.853 7.2a.073.073 0 0 1 .068 0l5.447 3.145c1.584.915 2.133 2.938 1.218 4.522-.915 1.584-2.938 2.133-4.522 1.218z" 
                fill="#10A37F"
              />
            </svg>
          </div>
        );
      
      case 'ANTHROPIC':
        // Anthropic Claude logo - stylized "A" design
        return (
          <div className={`inline-flex items-center justify-center ${className}`}>
            <svg 
              width={size} 
              height={size} 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 2L3 20h4.5l1.5-3h6l1.5 3H21L12 2zm-2.5 12L12 8l2.5 6h-5z" 
                fill="#D4915D"
              />
            </svg>
          </div>
        );
      
      case 'GOOGLE':
        // Google's official multi-color G logo
        return (
          <div className={`inline-flex items-center justify-center ${className}`}>
            <svg 
              width={size} 
              height={size} 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                fill="#4285F4" 
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path 
                fill="#34A853" 
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path 
                fill="#FBBC05" 
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path 
                fill="#EA4335" 
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>
        );
      
      case 'COHERE':
        // Cohere's coral coral-colored logo design
        return (
          <div className={`inline-flex items-center justify-center ${className}`}>
            <svg 
              width={size} 
              height={size} 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.19 0 2.34-.21 3.41-.6.36-.13.61-.47.61-.86 0-.51-.42-.93-.93-.93-.16 0-.31.04-.45.11-.82.29-1.69.44-2.64.44-4.07 0-7.36-3.29-7.36-7.36S7.93 4.64 12 4.64s7.36 3.29 7.36 7.36c0 1.99-.8 3.8-2.09 5.12-.16.16-.25.38-.25.61 0 .48.39.87.87.87.24 0 .46-.1.62-.26C21.45 16.67 22.36 14.42 22.36 12 22 6.48 17.52 2 12 2z" 
                fill="#FF6B35"
              />
              <circle cx="12" cy="12" r="3" fill="#FF6B35"/>
            </svg>
          </div>
        );
      
      case 'HUGGING_FACE':
        // Keep the iconic emoji - it's their official brand
        return (
          <div 
            className={`inline-flex items-center justify-center ${className}`}
            style={{ width: size, height: size, fontSize: `${size * 0.8}px` }}
          >
            🤗
          </div>
        );
      
      case 'LOCAL':
        // Ollama/Local AI with llama-inspired design
        return (
          <div className={`inline-flex items-center justify-center ${className}`}>
            <svg 
              width={size} 
              height={size} 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 2c-2.76 0-5 2.24-5 5v2c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2V7c0-2.76-2.24-5-5-5zm-3 5c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V7z" 
                fill="#7C3AED"
              />
              <circle cx="10" cy="14" r="1" fill="white"/>
              <circle cx="14" cy="14" r="1" fill="white"/>
            </svg>
          </div>
        );
      
      default:
        // Fallback to emoji map for unknown providers
        const emojiMap: Record<string, string> = {
          OPENAI: '🤖',
          ANTHROPIC: '🔮', 
          GOOGLE: '🟡',
          COHERE: '🟢',
          HUGGING_FACE: '🤗',
          LOCAL: '🦙'
        };
        return (
          <div 
            className={`inline-flex items-center justify-center ${className}`}
            style={{ width: size, height: size, fontSize: `${size * 0.8}px` }}
          >
            {emojiMap[provider] || '⚡'}
          </div>
        );
    }
  };

  return renderLogo();
}

// Convenience function to get provider display name
export function getProviderDisplayName(provider: string): string {
  const displayNames: Record<string, string> = {
    OPENAI: 'OpenAI',
    ANTHROPIC: 'Anthropic',
    GOOGLE: 'Google AI',
    COHERE: 'Cohere',
    HUGGING_FACE: 'Hugging Face', 
    LOCAL: 'Local (Ollama)'
  };
  
  return displayNames[provider] || provider;
}

// Export for use in other components
export { PROVIDER_LOGOS };