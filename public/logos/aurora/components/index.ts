/**
 * Aurora Logo System - Component Exports
 * 
 * Centralized exports for Aurora logo components.
 * All components feature perfect spacing orchestration and professional polish.
 */

export { AuroraFullLogo as default } from './aurora-full-logo';
export { AuroraFullLogo } from './aurora-full-logo';
export { AuroraIcon } from './aurora-icon';

// Type definitions
export interface AuroraLogoProps {
  size?: number;
  className?: string;
  showLabel?: boolean;
}

// Re-export main implementations (for compatibility with existing code)
export { 
  CosmarcPortalRefined2Ring as AuroraFullLogoOriginal,
  CosmarcAuroraIcon as AuroraIconOriginal 
} from '../../../src/components/ui/cosmic-c-logo';

/**
 * Usage Examples:
 * 
 * import { AuroraFullLogo, AuroraIcon } from './public/logos/aurora/components';
 * 
 * <AuroraFullLogo size={320} />
 * <AuroraIcon size={128} />
 */