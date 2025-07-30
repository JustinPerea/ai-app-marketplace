/**
 * Security & Compliance Module - Main Exports
 * 
 * Central export point for all security services and utilities.
 * This module provides enterprise-grade security for the AI App Marketplace BYOK platform.
 */

// Core Security Services
export {
  EnvelopeEncryptionService,
  createEnvelopeEncryptionService,
  ENCRYPTION_PERFORMANCE_TARGET_MS,
  KEY_ROTATION_INTERVAL_DAYS,
} from './envelope-encryption';

export {
  ApiKeyManager,
  createApiKeyManager,
} from './api-key-manager';

export {
  SecurityMonitoringService,
  createSecurityMonitoringService,
  logSecurityEvent,
} from './monitoring';

// Authentication & Authorization
export {
  Auth0SecurityService,
  UserRole,
  SecurityLevel,
  apiKeyAuthMiddleware,
  adminAuthMiddleware,
  auth0Config,
} from './auth-config';

// Type Definitions
export type {
  SecurityContext,
  ApiKeyAccessPolicy,
} from './auth-config';

export type {
  SecurityEvent,
  UsageAnomaly,
  GeoLocation,
  CostAlert,
  SecurityMetrics,
} from './monitoring';

export type {
  SecurityEventType,
  SecuritySeverity,
  AnomalyType,
} from './monitoring';

export type {
  EncryptionResult,
  DecryptionResult,
  EnvelopeEncryptionConfig,
} from './envelope-encryption';

export type {
  ApiKeyCreateRequest,
  ApiKeyRetrieveRequest,
  ApiKeyUsageData,
  SecureApiKey,
  ApiKeyWithSecret,
} from './api-key-manager';

// Security Constants
export const SECURITY_CONSTANTS = {
  // Performance targets
  ENCRYPTION_PERFORMANCE_TARGET_MS: 50,
  API_RESPONSE_TARGET_MS: 200,
  
  // Session and MFA timing
  MFA_VALIDITY_MINUTES: 15,
  API_KEY_SESSION_MAX_AGE: 60,
  
  // Key rotation and security
  KEY_ROTATION_INTERVAL_DAYS: 90,
  PASSWORD_MIN_LENGTH: 12,
  
  // Rate limiting
  API_RATE_LIMIT_REQUESTS: 100,
  API_RATE_LIMIT_WINDOW_MS: 900000, // 15 minutes
  
  // Monitoring and alerting
  CRITICAL_EVENT_THRESHOLD: 10,
  WARNING_EVENT_THRESHOLD: 50,
  ANOMALY_CONFIDENCE_THRESHOLD: 0.8,
  
  // Cost management
  DEFAULT_MONTHLY_BUDGET: 100, // $100 USD
  BUDGET_ALERT_THRESHOLD: 0.8, // 80% of budget
  
  // Security levels
  SECURITY_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  } as const,
} as const;

// Utility Functions
export const SecurityUtils = {
  /**
   * Validate API key format for different providers
   */
  validateApiKeyFormat(apiKey: string, provider: string): boolean {
    const patterns = {
      OPENAI: /^sk-[a-zA-Z0-9]{48}$/,
      ANTHROPIC: /^sk-ant-api[a-zA-Z0-9\-]{95}$/,
      GOOGLE: /^[a-zA-Z0-9\-_]{39}$/,
      AZURE_OPENAI: /^[a-zA-Z0-9]{32}$/,
      COHERE: /^[a-zA-Z0-9\-]{40}$/,
      HUGGING_FACE: /^hf_[a-zA-Z0-9]{34}$/,
    };
    
    const pattern = patterns[provider as keyof typeof patterns];
    return pattern ? pattern.test(apiKey) : apiKey.length >= 10 && apiKey.length <= 200;
  },

  /**
   * Generate secure random salt
   */
  generateSecureSalt(length: number = 32): string {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  },

  /**
   * Check if IP address is in private range
   */
  isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^127\./,
      /^::1$/,
      /^fc00:/,
    ];
    
    return privateRanges.some(range => range.test(ip));
  },

  /**
   * Calculate cost projection based on usage trends
   */
  calculateCostProjection(
    currentCost: number,
    daysElapsed: number,
    daysInMonth: number
  ): number {
    if (daysElapsed === 0) return 0;
    return (currentCost / daysElapsed) * daysInMonth;
  },

  /**
   * Sanitize error message for logging (remove sensitive data)
   */
  sanitizeErrorMessage(error: Error): string {
    let message = error.message;
    
    // Remove potential API keys
    message = message.replace(/sk-[a-zA-Z0-9]{48}/g, '[REDACTED_OPENAI_KEY]');
    message = message.replace(/sk-ant-api[a-zA-Z0-9\-]{95}/g, '[REDACTED_ANTHROPIC_KEY]');
    
    // Remove potential secrets
    message = message.replace(/secret[:\s]*[a-zA-Z0-9+/=]{16,}/gi, '[REDACTED_SECRET]');
    message = message.replace(/token[:\s]*[a-zA-Z0-9\-_.]{16,}/gi, '[REDACTED_TOKEN]');
    
    return message;
  },

  /**
   * Generate security event ID
   */
  generateEventId(): string {
    const crypto = require('crypto');
    return `sec_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  },
};

/**
 * Security middleware factory for Next.js API routes
 */
export function createSecurityMiddleware(options: {
  securityLevel?: typeof SECURITY_CONSTANTS.SECURITY_LEVELS[keyof typeof SECURITY_CONSTANTS.SECURITY_LEVELS];
  requiredRoles?: import('./auth-config').UserRole[];
  requireMFA?: boolean;
  requireRecentMFA?: boolean;
  rateLimitEnabled?: boolean;
}) {
  // Import from auth-config
  const authConfig = require('./auth-config');
  return authConfig.Auth0SecurityService.withSecureApiAuth(
    (options.securityLevel as any) || authConfig.SecurityLevel.MEDIUM,
    options.requiredRoles || []
  );
}

/**
 * Health check aggregator for all security services
 */
export async function performSecurityHealthCheck(): Promise<{
  overall: 'healthy' | 'warning' | 'error';
  services: Record<string, any>;
  timestamp: string;
}> {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const { createEnvelopeEncryptionService } = await import('./envelope-encryption');
    const { createApiKeyManager } = await import('./api-key-manager');
    const { createSecurityMonitoringService } = await import('./monitoring');
    
    const prisma = new PrismaClient();
    
    const encryptionService = createEnvelopeEncryptionService();
    const apiKeyManager = createApiKeyManager(prisma);
    const monitoringService = createSecurityMonitoringService(prisma);

    const [
      encryptionHealth,
      apiKeyHealth,
      monitoringHealth
    ] = await Promise.all([
      encryptionService.healthCheck(),
      apiKeyManager.healthCheck(),
      monitoringService.getSecurityMetrics(1) // Last hour
    ]);

    const services = {
      encryption: encryptionHealth,
      apiKeyManager: apiKeyHealth,
      monitoring: {
        healthy: true,
        metrics: monitoringHealth,
      },
    };

    const allHealthy = Object.values(services).every(s => s.healthy !== false);
    const hasWarnings = Object.values(services).some(s => 
      (s as any).latency > SECURITY_CONSTANTS.ENCRYPTION_PERFORMANCE_TARGET_MS ||
      (s as any).metrics?.criticalEvents > 0
    );

    await prisma.$disconnect();

    return {
      overall: allHealthy ? (hasWarnings ? 'warning' : 'healthy') : 'error',
      services,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    return {
      overall: 'error',
      services: {
        error: SecurityUtils.sanitizeErrorMessage(error as Error),
      },
      timestamp: new Date().toISOString(),
    };
  }
}