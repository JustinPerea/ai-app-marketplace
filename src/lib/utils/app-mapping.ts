/**
 * App ID Mapping Utilities
 * 
 * Maps marketplace app IDs to database CUIDs and handles
 * app-specific metadata for the subscription system
 */

// Mock app database mapping for development
// In production, this would come from actual marketplace app records
export const APP_ID_MAP: Record<string, { cuid: string; slug: string; category: string }> = {
  '1': {
    cuid: 'cm5legal001', // Legal Contract Analyzer
    slug: 'legal-contract-analyzer',
    category: 'LEGAL_TOOLS'
  },
  '2': {
    cuid: 'cm5medical001', // HIPAA Medical Scribe
    slug: 'hipaa-medical-scribe', 
    category: 'MEDICAL_TOOLS'
  },
  '3': {
    cuid: 'cm5dev001', // Code Review Bot
    slug: 'code-review-bot',
    category: 'DEVELOPER_TOOLS'
  },
  '4': {
    cuid: 'cm5finance001', // Financial Report Analyzer
    slug: 'financial-report-analyzer',
    category: 'BUSINESS'
  },
  '5': {
    cuid: 'cm5research001', // Research Paper Synthesizer
    slug: 'research-paper-synthesizer',
    category: 'RESEARCH_TOOLS'
  },
  '6': {
    cuid: 'cm5marketing001', // Content Marketing Suite
    slug: 'content-marketing-suite',
    category: 'MARKETING_TOOLS'
  },
  '7': {
    cuid: 'cm5data001', // Data Visualization Engine
    slug: 'data-visualization-engine',
    category: 'DATA_ANALYSIS'
  },
  '8': {
    cuid: 'cm5brand001', // Brand Voice Designer
    slug: 'brand-voice-designer',
    category: 'CONTENT_CREATION'
  },
  '9': {
    cuid: 'cm5pdf001', // PDF Notes Generator
    slug: 'pdf-notes-generator',
    category: 'CONTENT_CREATION'
  }
};

/**
 * Convert marketplace app ID to database CUID
 */
export function getAppCuid(marketplaceId: string): string {
  const mapping = APP_ID_MAP[marketplaceId];
  if (!mapping) {
    throw new Error(`Unknown app ID: ${marketplaceId}`);
  }
  return mapping.cuid;
}

/**
 * Get app metadata by marketplace ID
 */
export function getAppMetadata(marketplaceId: string) {
  const mapping = APP_ID_MAP[marketplaceId];
  if (!mapping) {
    return null;
  }
  return mapping;
}

/**
 * Check if app ID is valid for the marketplace
 */
export function isValidAppId(marketplaceId: string): boolean {
  return marketplaceId in APP_ID_MAP;
}

/**
 * Get marketplace ID from database CUID
 */
export function getMarketplaceId(cuid: string): string | null {
  for (const [marketplaceId, mapping] of Object.entries(APP_ID_MAP)) {
    if (mapping.cuid === cuid) {
      return marketplaceId;
    }
  }
  return null;
}

/**
 * App-specific access routes for installed apps
 */
export const APP_ROUTES: Record<string, string> = {
  '1': '/marketplace/apps/legal-contract-analyzer',
  '2': '/marketplace/apps/hipaa-medical-scribe',
  '3': '/marketplace/apps/code-review-bot',
  '4': '/marketplace/apps/financial-report-analyzer',
  '5': '/marketplace/apps/research-paper-synthesizer',
  '6': '/marketplace/apps/content-marketing-suite',
  '7': '/marketplace/apps/data-visualization-engine',
  '8': '/marketplace/apps/brand-voice-designer',
  '9': '/marketplace/apps/pdf-notes-generator'
};

/**
 * Get app route by marketplace ID
 */
export function getAppRoute(marketplaceId: string): string {
  return APP_ROUTES[marketplaceId] || '/marketplace';
}