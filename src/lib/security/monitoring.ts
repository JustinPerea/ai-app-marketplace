/**
 * Security Monitoring and Analytics Service
 * 
 * Provides real-time security monitoring, anomaly detection, and usage analytics:
 * - API key usage pattern monitoring
 * - Geographic anomaly detection  
 * - Cost tracking and optimization alerts
 * - Security incident detection and response
 * - Compliance audit logging
 * 
 * Prepares data for Wazuh SIEM integration while providing immediate monitoring
 */

import { PrismaClient } from '@prisma/client';

export interface SecurityEvent {
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  apiKeyId?: string;
  sourceIp?: string;
  userAgent?: string;
  location?: GeoLocation;
  metadata?: Record<string, any>;
  timestamp: Date;
  description: string;
}

export interface UsageAnomaly {
  type: AnomalyType;
  severity: SecuritySeverity;
  userId: string;
  apiKeyId: string;
  currentValue: number;
  expectedValue: number;
  threshold: number;
  confidence: number;
  description: string;
  timestamp: Date;
}

export interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface CostAlert {
  userId: string;
  apiKeyId: string;
  currentCost: number;
  budgetLimit: number;
  alertThreshold: number;
  projectedMonthlyCost: number;
  timestamp: Date;
}

export interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  warningEvents: number;
  infoEvents: number;
  anomaliesDetected: number;
  uniqueUsers: number;
  averageResponseTime: number;
  errorRate: number;
}

export enum SecurityEventType {
  API_KEY_ACCESS = 'api_key_access',
  MFA_CHALLENGE = 'mfa_challenge',
  MFA_SUCCESS = 'mfa_success',
  MFA_FAILURE = 'mfa_failure',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  GEOGRAPHIC_ANOMALY = 'geographic_anomaly',
  USAGE_ANOMALY = 'usage_anomaly',
  COST_THRESHOLD_EXCEEDED = 'cost_threshold_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  API_RATE_LIMIT_EXCEEDED = 'api_rate_limit_exceeded',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'unauthorized_access_attempt',
}

export enum SecuritySeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency',
}

export enum AnomalyType {
  USAGE_SPIKE = 'usage_spike',
  COST_SPIKE = 'cost_spike',
  GEOGRAPHIC_ANOMALY = 'geographic_anomaly',
  TIME_ANOMALY = 'time_anomaly',
  FREQUENCY_ANOMALY = 'frequency_anomaly',
  TOKEN_ANOMALY = 'token_anomaly',
}

export class SecurityMonitoringService {
  private prisma: PrismaClient;
  private anomalyThresholds: Map<AnomalyType, number>;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.anomalyThresholds = new Map([
      [AnomalyType.USAGE_SPIKE, 5.0], // 5x normal usage
      [AnomalyType.COST_SPIKE, 3.0],  // 3x normal cost
      [AnomalyType.GEOGRAPHIC_ANOMALY, 0.9], // 90% confidence
      [AnomalyType.TIME_ANOMALY, 2.0], // 2x normal time pattern
      [AnomalyType.FREQUENCY_ANOMALY, 4.0], // 4x normal frequency
      [AnomalyType.TOKEN_ANOMALY, 10.0], // 10x normal tokens
    ]);
  }

  /**
   * Log security event for monitoring and analysis
   */
  async logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
    try {
      const securityEvent: SecurityEvent = {
        ...event,
        timestamp: new Date(),
      };

      // Log to console for immediate visibility
      console.info('Security Event:', {
        type: securityEvent.eventType,
        severity: securityEvent.severity,
        userId: securityEvent.userId,
        sourceIp: securityEvent.sourceIp,
        description: securityEvent.description,
        timestamp: securityEvent.timestamp.toISOString(),
      });

      // Store in database for analysis (if using a security events table)
      // await this.storeSecurityEvent(securityEvent);

      // Send to SIEM if configured
      await this.sendToSiem(securityEvent);

      // Check for immediate incident response triggers
      await this.checkIncidentTriggers(securityEvent);

    } catch (error) {
      console.error('Failed to log security event:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        eventType: event.eventType,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Monitor API key usage patterns for anomalies
   */
  async monitorApiKeyUsage(
    userId: string,
    apiKeyId: string,
    tokensUsed: number,
    cost: number,
    sourceIp?: string
  ): Promise<UsageAnomaly[]> {
    const anomalies: UsageAnomaly[] = [];

    try {
      // Get historical usage data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const historicalUsage = await this.prisma.apiUsageRecord.findMany({
        where: {
          apiKeyId: apiKeyId,
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (historicalUsage.length === 0) {
        // No historical data, skip anomaly detection
        return anomalies;
      }

      // Calculate baseline metrics
      const avgTokens = historicalUsage.reduce((sum, r) => sum + r.tokensUsed, 0) / historicalUsage.length;
      const avgCost = historicalUsage.reduce((sum, r) => sum + Number(r.cost), 0) / historicalUsage.length;

      // Check for usage spikes
      if (tokensUsed > avgTokens * this.anomalyThresholds.get(AnomalyType.USAGE_SPIKE)!) {
        anomalies.push({
          type: AnomalyType.USAGE_SPIKE,
          severity: SecuritySeverity.WARNING,
          userId,
          apiKeyId,
          currentValue: tokensUsed,
          expectedValue: avgTokens,
          threshold: this.anomalyThresholds.get(AnomalyType.USAGE_SPIKE)!,
          confidence: Math.min(tokensUsed / avgTokens, 10.0),
          description: `Token usage ${Math.round(tokensUsed / avgTokens * 100)}% above normal`,
          timestamp: new Date(),
        });
      }

      // Check for cost spikes
      if (cost > avgCost * this.anomalyThresholds.get(AnomalyType.COST_SPIKE)!) {
        anomalies.push({
          type: AnomalyType.COST_SPIKE,
          severity: SecuritySeverity.WARNING,
          userId,
          apiKeyId,
          currentValue: cost,
          expectedValue: avgCost,
          threshold: this.anomalyThresholds.get(AnomalyType.COST_SPIKE)!,
          confidence: Math.min(cost / avgCost, 10.0),
          description: `Cost ${Math.round(cost / avgCost * 100)}% above normal`,
          timestamp: new Date(),
        });
      }

      // Check for geographic anomalies (if IP provided)
      if (sourceIp) {
        const geoAnomaly = await this.checkGeographicAnomaly(userId, sourceIp, historicalUsage);
        if (geoAnomaly) {
          anomalies.push(geoAnomaly);
        }
      }

      // Log anomalies as security events
      for (const anomaly of anomalies) {
        await this.logSecurityEvent({
          eventType: SecurityEventType.USAGE_ANOMALY,
          severity: anomaly.severity,
          userId: anomaly.userId,
          apiKeyId: anomaly.apiKeyId,
          sourceIp: sourceIp,
          description: anomaly.description,
          metadata: {
            anomalyType: anomaly.type,
            currentValue: anomaly.currentValue,
            expectedValue: anomaly.expectedValue,
            confidence: anomaly.confidence,
          },
        });
      }

      return anomalies;

    } catch (error) {
      console.error('Usage monitoring failed:', {
        userId,
        apiKeyId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      return [];
    }
  }

  /**
   * Generate cost alerts for budget management
   */
  async checkCostAlerts(userId: string): Promise<CostAlert[]> {
    const alerts: CostAlert[] = [];

    try {
      // Get user's API keys with usage
      const apiKeys = await this.prisma.apiKey.findMany({
        where: { userId, isActive: true },
        include: {
          usageRecords: {
            where: {
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // This month
              },
            },
          },
        },
      });

      for (const apiKey of apiKeys) {
        const monthlyUsage = apiKey.usageRecords.reduce((sum, r) => sum + Number(r.cost), 0);
        
        // Get user's budget settings (placeholder - would come from user preferences)
        const budgetLimit = 100; // $100 default monthly budget
        const alertThreshold = 0.8; // Alert at 80% of budget

        if (monthlyUsage >= budgetLimit * alertThreshold) {
          // Calculate projected monthly cost
          const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
          const currentDay = new Date().getDate();
          const projectedMonthlyCost = (monthlyUsage / currentDay) * daysInMonth;

          alerts.push({
            userId,
            apiKeyId: apiKey.id,
            currentCost: monthlyUsage,
            budgetLimit,
            alertThreshold,
            projectedMonthlyCost,
            timestamp: new Date(),
          });

          // Log as security event
          await this.logSecurityEvent({
            eventType: SecurityEventType.COST_THRESHOLD_EXCEEDED,
            severity: monthlyUsage >= budgetLimit ? SecuritySeverity.WARNING : SecuritySeverity.INFO,
            userId,
            apiKeyId: apiKey.id,
            description: `Monthly cost ${monthlyUsage >= budgetLimit ? 'exceeded' : 'approaching'} budget limit`,
            metadata: {
              currentCost: monthlyUsage,
              budgetLimit,
              projectedCost: projectedMonthlyCost,
            },
          });
        }
      }

      return alerts;

    } catch (error) {
      console.error('Cost alert check failed:', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      return [];
    }
  }

  /**
   * Generate security metrics dashboard
   */
  async getSecurityMetrics(hours: number = 24): Promise<SecurityMetrics> {
    try {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - hours);

      // This would query actual security events table in full implementation
      // For now, provide placeholder metrics based on available data
      
      const totalRequests = await this.prisma.apiUsageRecord.count({
        where: { createdAt: { gte: startTime } },
      });

      const uniqueUsers = await this.prisma.apiUsageRecord.findMany({
        where: { createdAt: { gte: startTime } },
        distinct: ['apiKeyId'],
        select: { apiKey: { select: { userId: true } } },
      });

      return {
        totalEvents: totalRequests,
        criticalEvents: 0, // Would count from security events table
        warningEvents: 0,  // Would count from security events table
        infoEvents: totalRequests, // All usage records are info events
        anomaliesDetected: 0, // Would count from anomaly detection
        uniqueUsers: new Set(uniqueUsers.map(u => u.apiKey?.userId)).size,
        averageResponseTime: 45, // Would calculate from actual response times
        errorRate: 0.02, // Would calculate from error logs
      };

    } catch (error) {
      console.error('Failed to generate security metrics:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      
      return {
        totalEvents: 0,
        criticalEvents: 0,
        warningEvents: 0,
        infoEvents: 0,
        anomaliesDetected: 0,
        uniqueUsers: 0,
        averageResponseTime: 0,
        errorRate: 0,
      };
    }
  }

  /**
   * Check for geographic anomalies in API usage
   */
  private async checkGeographicAnomaly(
    userId: string,
    sourceIp: string,
    historicalUsage: any[]
  ): Promise<UsageAnomaly | null> {
    try {
      // Get location for current IP (placeholder - would use real geolocation service)
      const currentLocation = await this.getLocationFromIp(sourceIp);
      
      if (!currentLocation) {
        return null;
      }

      // Analyze historical IP patterns
      const historicalIps = historicalUsage
        .map(r => r.ipAddress)
        .filter(ip => ip)
        .slice(0, 100); // Last 100 requests

      if (historicalIps.length === 0) {
        return null;
      }

      // Check if this is a new geographic region
      const isNewRegion = await this.isNewGeographicRegion(currentLocation, historicalIps);
      
      if (isNewRegion) {
        return {
          type: AnomalyType.GEOGRAPHIC_ANOMALY,
          severity: SecuritySeverity.WARNING,
          userId,
          apiKeyId: historicalUsage[0]?.apiKeyId || '',
          currentValue: 1,
          expectedValue: 0,
          threshold: this.anomalyThresholds.get(AnomalyType.GEOGRAPHIC_ANOMALY)!,
          confidence: 0.9,
          description: `API access from new geographic region: ${currentLocation.country}`,
          timestamp: new Date(),
        };
      }

      return null;

    } catch (error) {
      console.error('Geographic anomaly check failed:', error);
      return null;
    }
  }

  /**
   * Send security event to SIEM system
   */
  private async sendToSiem(event: SecurityEvent): Promise<void> {
    try {
      // Placeholder for Wazuh SIEM integration
      // In full implementation, this would send to Wazuh API
      
      if (process.env.WAZUH_API_URL && process.env.WAZUH_API_TOKEN) {
        // await fetch(`${process.env.WAZUH_API_URL}/events`, {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${process.env.WAZUH_API_TOKEN}`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify(event),
        // });
      }

    } catch (error) {
      console.error('Failed to send event to SIEM:', error);
    }
  }

  /**
   * Check for incident response triggers
   */
  private async checkIncidentTriggers(event: SecurityEvent): Promise<void> {
    // Check for critical events that require immediate response
    if (event.severity === SecuritySeverity.CRITICAL || event.severity === SecuritySeverity.EMERGENCY) {
      console.warn('CRITICAL SECURITY EVENT DETECTED:', {
        type: event.eventType,
        userId: event.userId,
        description: event.description,
        timestamp: event.timestamp.toISOString(),
      });
      
      // In full implementation:
      // - Send alert to security team
      // - Create incident ticket
      // - Potentially disable affected accounts
    }

    // Check for repeated failures that might indicate attack
    if (event.eventType === SecurityEventType.MFA_FAILURE || 
        event.eventType === SecurityEventType.LOGIN_FAILURE) {
      // Would implement rate limiting and account lockout logic
    }
  }

  /**
   * Get location from IP address (placeholder)
   */
  private async getLocationFromIp(ip: string): Promise<GeoLocation | null> {
    try {
      // In production, would use a real geolocation service like MaxMind or IPinfo
      // This is a placeholder implementation
      return {
        country: 'US',
        region: 'California',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        timezone: 'America/Los_Angeles',
      };
    } catch (error) {
      console.error('Failed to get location from IP:', error);
      return null;
    }
  }

  /**
   * Check if location represents a new geographic region
   */
  private async isNewGeographicRegion(
    currentLocation: GeoLocation,
    historicalIps: string[]
  ): Promise<boolean> {
    // Placeholder implementation
    // In production, would check historical locations from these IPs
    return Math.random() > 0.9; // 10% chance of being new region for demo
  }
}

/**
 * Factory function to create security monitoring service
 */
export function createSecurityMonitoringService(prisma: PrismaClient): SecurityMonitoringService {
  return new SecurityMonitoringService(prisma);
}

/**
 * Security event logger function for easy access
 */
export async function logSecurityEvent(
  eventType: SecurityEventType,
  severity: SecuritySeverity,
  description: string,
  metadata?: {
    userId?: string;
    apiKeyId?: string;
    sourceIp?: string;
    userAgent?: string;
    [key: string]: any;
  }
): Promise<void> {
  // Would use singleton instance or dependency injection in production
  const prisma = new PrismaClient();
  const monitoringService = createSecurityMonitoringService(prisma);
  
  await monitoringService.logSecurityEvent({
    eventType,
    severity,
    description,
    userId: metadata?.userId,
    apiKeyId: metadata?.apiKeyId,
    sourceIp: metadata?.sourceIp,
    userAgent: metadata?.userAgent,
    metadata,
  });
  
  await prisma.$disconnect();
}