/**
 * Secure API Key Management Service
 * 
 * Provides secure storage, retrieval, and management of user API keys using:
 * - Envelope encryption for data at rest
 * - Secure hashing for integrity verification
 * - Usage tracking and analytics
 * - Audit logging for compliance
 * 
 * Integrates with Platform Architecture Agent's database schema
 */

import { PrismaClient, ApiProvider } from '@prisma/client';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { EncryptionService, createEncryptionService } from './encryption-factory';

export interface ApiKeyCreateRequest {
  userId: string;
  name: string;
  provider: ApiProvider;
  apiKey: string;
}

export interface ApiKeyRetrieveRequest {
  userId: string;
  apiKeyId: string;
}

export interface ApiKeyUsageData {
  apiKeyId: string;
  appId?: string;
  endpoint: string;
  tokensUsed: number;
  cost: number;
  requestId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface SecureApiKey {
  id: string;
  name: string;
  provider: ApiProvider;
  keyPreview: string;
  isActive: boolean;
  lastUsed?: Date;
  totalRequests: number;
  totalCost: number;
  createdAt: Date;
}

export interface ApiKeyWithSecret extends SecureApiKey {
  decryptedKey: string;
  isValid: boolean;
}

export class ApiKeyManager {
  private prisma: PrismaClient;
  private encryptionService: EncryptionService;

  constructor(prisma: PrismaClient, encryptionService?: EncryptionService) {
    this.prisma = prisma;
    this.encryptionService = encryptionService || createEncryptionService();
  }

  /**
   * Securely store a new API key with envelope encryption
   * 
   * @param request - API key creation request
   * @returns Stored API key metadata (without secret)
   */
  async storeApiKey(request: ApiKeyCreateRequest): Promise<SecureApiKey> {
    try {
      // Create customer context for envelope encryption
      const customerContext = this.createCustomerContext(request.userId, request.provider);
      
      // Encrypt the API key using envelope encryption
      const encryptionResult = await this.encryptionService.encryptApiKey(
        request.apiKey,
        customerContext
      );

      // Create secure hash for integrity verification
      const keyHash = this.createSecureHash(request.apiKey, request.userId);
      
      // Create preview (last 4 characters) without exposing full key
      const keyPreview = this.createKeyPreview(request.apiKey);

      // Store encrypted key in database
      const storedKey = await this.prisma.apiKey.create({
        data: {
          userId: request.userId,
          name: request.name,
          provider: request.provider,
          keyHash: keyHash,
          keyPreview: keyPreview,
          encryptedKey: JSON.stringify({
            encryptedData: encryptionResult.encryptedData,
            encryptedDEK: encryptionResult.encryptedDEK,
            salt: encryptionResult.salt,
            iv: encryptionResult.iv,
            authTag: encryptionResult.authTag,
            context: encryptionResult.context,
            algorithm: encryptionResult.algorithm,
            createdAt: encryptionResult.createdAt.toISOString()
          }),
          isActive: true,
          totalRequests: 0,
          totalCost: 0,
        },
      });

      // Log successful storage (without sensitive data)
      console.info('API key stored successfully:', {
        userId: request.userId,
        keyId: storedKey.id,
        provider: request.provider,
        timestamp: new Date().toISOString()
      });

      return this.mapToSecureApiKey(storedKey);

    } catch (error) {
      console.error('API key storage failed:', {
        userId: request.userId,
        provider: request.provider,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw new Error('Failed to store API key securely');
    }
  }

  /**
   * Retrieve and decrypt API key for use
   * 
   * @param request - API key retrieval request
   * @returns Decrypted API key with validation status
   */
  async retrieveApiKey(request: ApiKeyRetrieveRequest): Promise<ApiKeyWithSecret | null> {
    try {
      // Fetch encrypted key from database
      const storedKey = await this.prisma.apiKey.findFirst({
        where: {
          id: request.apiKeyId,
          userId: request.userId,
          isActive: true,
        },
      });

      if (!storedKey) {
        console.warn('API key retrieval failed - key not found:', {
          userId: request.userId,
          keyId: request.apiKeyId,
          timestamp: new Date().toISOString()
        });
        return null;
      }

      // Parse encrypted data
      const encryptedData = JSON.parse(storedKey.encryptedKey);
      const customerContext = this.createCustomerContext(request.userId, storedKey.provider);

      // Decrypt API key using the configured encryption service
      const decryptionResult = await this.encryptionService.decryptApiKey(
        {
          encryptedData: encryptedData.encryptedData,
          encryptedDEK: encryptedData.encryptedDEK,
          salt: encryptedData.salt,
          iv: encryptedData.iv,
          authTag: encryptedData.authTag,
          context: encryptedData.context,
          algorithm: encryptedData.algorithm,
          createdAt: new Date(encryptedData.createdAt)
        },
        customerContext
      );

      if (!decryptionResult.isValid) {
        console.error('API key decryption failed:', {
          userId: request.userId,
          keyId: request.apiKeyId,
          timestamp: new Date().toISOString()
        });
        return null;
      }

      // Verify key integrity using hash
      const expectedHash = this.createSecureHash(decryptionResult.decryptedData, request.userId);
      const hashMatch = timingSafeEqual(
        Buffer.from(storedKey.keyHash, 'hex'),
        Buffer.from(expectedHash, 'hex')
      );

      if (!hashMatch) {
        console.error('API key integrity verification failed:', {
          userId: request.userId,
          keyId: request.apiKeyId,
          timestamp: new Date().toISOString()
        });
        return null;
      }

      // Update last used timestamp
      await this.prisma.apiKey.update({
        where: { id: request.apiKeyId },
        data: { lastUsed: new Date() },
      });

      return {
        ...this.mapToSecureApiKey(storedKey),
        decryptedKey: decryptionResult.decryptedData,
        isValid: true,
      };

    } catch (error) {
      console.error('API key retrieval failed:', {
        userId: request.userId,
        keyId: request.apiKeyId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }

  /**
   * List user's API keys (without secrets)
   * 
   * @param userId - User identifier
   * @returns Array of secure API key metadata
   */
  async listApiKeys(userId: string): Promise<SecureApiKey[]> {
    try {
      const keys = await this.prisma.apiKey.findMany({
        where: {
          userId: userId,
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return keys.map(key => this.mapToSecureApiKey(key));

    } catch (error) {
      console.error('API key listing failed:', {
        userId: userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw new Error('Failed to list API keys');
    }
  }

  /**
   * Deactivate (soft delete) an API key
   * 
   * @param userId - User identifier
   * @param apiKeyId - API key identifier
   * @returns Success status
   */
  async deactivateApiKey(userId: string, apiKeyId: string): Promise<boolean> {
    try {
      const result = await this.prisma.apiKey.updateMany({
        where: {
          id: apiKeyId,
          userId: userId,
        },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      const success = result.count > 0;

      console.info('API key deactivation:', {
        userId: userId,
        keyId: apiKeyId,
        success: success,
        timestamp: new Date().toISOString()
      });

      return success;

    } catch (error) {
      console.error('API key deactivation failed:', {
        userId: userId,
        keyId: apiKeyId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  /**
   * Track API key usage for billing and analytics
   * 
   * @param usageData - Usage tracking data
   * @returns Success status
   */
  async trackApiKeyUsage(usageData: ApiKeyUsageData): Promise<boolean> {
    try {
      // Record usage in database
      await this.prisma.apiUsageRecord.create({
        data: {
          apiKeyId: usageData.apiKeyId,
          appId: usageData.appId,
          endpoint: usageData.endpoint,
          tokensUsed: usageData.tokensUsed,
          cost: usageData.cost,
          requestId: usageData.requestId,
          userAgent: usageData.userAgent,
          ipAddress: usageData.ipAddress,
        },
      });

      // Update API key totals
      await this.prisma.apiKey.update({
        where: { id: usageData.apiKeyId },
        data: {
          totalRequests: { increment: 1 },
          totalCost: { increment: usageData.cost },
          lastUsed: new Date(),
        },
      });

      return true;

    } catch (error) {
      console.error('Usage tracking failed:', {
        apiKeyId: usageData.apiKeyId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  /**
   * Get usage analytics for an API key
   * 
   * @param userId - User identifier
   * @param apiKeyId - API key identifier
   * @param days - Number of days to analyze (default: 30)
   * @returns Usage analytics data
   */
  async getUsageAnalytics(userId: string, apiKeyId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [key, usageRecords, dailyUsage] = await Promise.all([
        // Get API key metadata
        this.prisma.apiKey.findFirst({
          where: { id: apiKeyId, userId: userId },
        }),

        // Get detailed usage records
        this.prisma.apiUsageRecord.findMany({
          where: {
            apiKeyId: apiKeyId,
            createdAt: { gte: startDate },
          },
          include: {
            app: {
              select: { name: true, slug: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),

        // Get daily aggregated usage
        this.prisma.apiUsageRecord.groupBy({
          by: ['createdAt'],
          where: {
            apiKeyId: apiKeyId,
            createdAt: { gte: startDate },
          },
          _sum: {
            tokensUsed: true,
            cost: true,
          },
          _count: {
            id: true,
          },
        }),
      ]);

      if (!key) {
        return null;
      }

      return {
        apiKey: this.mapToSecureApiKey(key),
        usageRecords: usageRecords.map(record => ({
          id: record.id,
          appName: record.app?.name || 'Unknown App',
          endpoint: record.endpoint,
          tokensUsed: record.tokensUsed,
          cost: record.cost,
          createdAt: record.createdAt,
        })),
        dailyUsage: dailyUsage.map(day => ({
          date: day.createdAt,
          requests: day._count.id,
          tokensUsed: day._sum.tokensUsed || 0,
          cost: day._sum.cost || 0,
        })),
        summary: {
          totalRequests: usageRecords.length,
          totalTokens: usageRecords.reduce((sum, r) => sum + r.tokensUsed, 0),
          totalCost: usageRecords.reduce((sum, r) => sum + Number(r.cost), 0),
          averageCostPerRequest: usageRecords.length > 0 
            ? usageRecords.reduce((sum, r) => sum + Number(r.cost), 0) / usageRecords.length
            : 0,
        },
      };

    } catch (error) {
      console.error('Usage analytics failed:', {
        userId: userId,
        apiKeyId: apiKeyId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }

  /**
   * Health check for API key management service
   */
  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const startTime = Date.now();

    try {
      // Test database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Test encryption service
      const encryptionHealth = await this.encryptionService.healthCheck();
      
      const latency = Date.now() - startTime;

      return {
        healthy: encryptionHealth.healthy,
        latency: latency,
        error: encryptionHealth.error,
      };

    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create customer context for envelope encryption
   */
  private createCustomerContext(userId: string, provider: ApiProvider): string {
    return `${userId}:${provider}:${process.env.ENCRYPTION_CONTEXT_SALT || 'default-salt'}`;
  }

  /**
   * Create secure hash of API key for integrity verification
   */
  private createSecureHash(apiKey: string, userId: string): string {
    const salt = process.env.API_KEY_HASH_SALT || 'default-hash-salt';
    return createHash('sha256')
      .update(apiKey)
      .update(userId)
      .update(salt)
      .digest('hex');
  }

  /**
   * Create safe preview of API key (last 4 characters)
   */
  private createKeyPreview(apiKey: string): string {
    if (apiKey.length < 8) {
      return '****';
    }
    const visibleChars = Math.min(4, apiKey.length - 4);
    return '*'.repeat(apiKey.length - visibleChars) + apiKey.slice(-visibleChars);
  }

  /**
   * Map database model to secure API key interface
   */
  private mapToSecureApiKey(dbKey: any): SecureApiKey {
    return {
      id: dbKey.id,
      name: dbKey.name,
      provider: dbKey.provider,
      keyPreview: dbKey.keyPreview,
      isActive: dbKey.isActive,
      lastUsed: dbKey.lastUsed,
      totalRequests: dbKey.totalRequests,
      totalCost: Number(dbKey.totalCost),
      createdAt: dbKey.createdAt,
    };
  }
}

/**
 * Factory function to create API key manager
 */
export function createApiKeyManager(prisma: PrismaClient): ApiKeyManager {
  return new ApiKeyManager(prisma);
}