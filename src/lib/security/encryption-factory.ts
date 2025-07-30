/**
 * Encryption Service Factory
 * 
 * Automatically selects the appropriate encryption service based on environment configuration:
 * - Google Cloud KMS (production) when GCP credentials are available
 * - Simple AES encryption (development) when GCP is not configured
 * 
 * This allows seamless development without requiring Google Cloud setup.
 */

import { EnvelopeEncryptionService, createEnvelopeEncryptionService } from './envelope-encryption';
import { SimpleEncryptionService, createSimpleEncryptionService } from './simple-encryption-correct';

export interface EncryptionResult {
  encryptedData: string;
  encryptedDEK?: string; // Only for envelope encryption
  salt?: string; // Only for simple encryption
  iv?: string; // Only for simple encryption
  authTag?: string; // Only for simple encryption
  context: string;
  algorithm: string;
  createdAt: Date;
}

export interface DecryptionResult {
  decryptedData: string;
  isValid: boolean;
}

export interface EncryptionService {
  encryptApiKey(apiKey: string, customerContext: string): Promise<EncryptionResult>;
  decryptApiKey(encryptionResult: EncryptionResult, customerContext: string): Promise<DecryptionResult>;
  healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }>;
}

/**
 * Adapter for Simple Encryption Service to match common interface
 */
class SimpleEncryptionAdapter implements EncryptionService {
  private service: SimpleEncryptionService;

  constructor(service: SimpleEncryptionService) {
    this.service = service;
  }

  async encryptApiKey(apiKey: string, customerContext: string): Promise<EncryptionResult> {
    const result = await this.service.encryptApiKey(apiKey, customerContext);
    return {
      encryptedData: result.encryptedData,
      salt: result.salt,
      iv: result.iv,
      authTag: result.authTag,
      context: result.context,
      algorithm: result.algorithm,
      createdAt: result.createdAt,
    };
  }

  async decryptApiKey(encryptionResult: EncryptionResult, customerContext: string): Promise<DecryptionResult> {
    // Convert back to SimpleEncryptionResult format
    const simpleResult = {
      encryptedData: encryptionResult.encryptedData,
      salt: encryptionResult.salt!,
      iv: encryptionResult.iv!,
      authTag: encryptionResult.authTag!,
      context: encryptionResult.context,
      algorithm: encryptionResult.algorithm,
      createdAt: encryptionResult.createdAt,
    };
    
    return await this.service.decryptApiKey(simpleResult, customerContext);
  }

  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    return await this.service.healthCheck();
  }
}

/**
 * Adapter for Envelope Encryption Service to match common interface
 */
class EnvelopeEncryptionAdapter implements EncryptionService {
  private service: EnvelopeEncryptionService;

  constructor(service: EnvelopeEncryptionService) {
    this.service = service;
  }

  async encryptApiKey(apiKey: string, customerContext: string): Promise<EncryptionResult> {
    const result = await this.service.encryptApiKey(apiKey, customerContext);
    return {
      encryptedData: result.encryptedData,
      encryptedDEK: result.encryptedDEK,
      context: result.context,
      algorithm: result.algorithm,
      createdAt: result.createdAt,
    };
  }

  async decryptApiKey(encryptionResult: EncryptionResult, customerContext: string): Promise<DecryptionResult> {
    // Convert back to EnvelopeEncryptionResult format
    const envelopeResult = {
      encryptedData: encryptionResult.encryptedData,
      encryptedDEK: encryptionResult.encryptedDEK!,
      context: encryptionResult.context,
      algorithm: encryptionResult.algorithm,
      createdAt: encryptionResult.createdAt,
    };
    
    return await this.service.decryptApiKey(envelopeResult, customerContext);
  }

  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    return await this.service.healthCheck();
  }
}

/**
 * Check if Google Cloud KMS configuration is available
 */
function isGoogleCloudKMSConfigured(): boolean {
  const requiredEnvVars = [
    'GOOGLE_CLOUD_PROJECT_ID',
  ];

  const hasRequiredVars = requiredEnvVars.every(envVar => 
    process.env[envVar] && process.env[envVar].trim() !== ''
  );

  // Check if we have either a service account key path or application default credentials
  const hasCredentials = 
    (process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY_PATH && process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY_PATH.trim() !== '') ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.GCLOUD_PROJECT; // Indicates running in Google Cloud environment

  return hasRequiredVars && hasCredentials;
}

/**
 * Factory function to create the appropriate encryption service
 * 
 * Returns:
 * - Google Cloud KMS encryption (production-grade) when GCP is configured
 * - Simple AES encryption (development) when GCP is not available
 */
export function createEncryptionService(): EncryptionService {
  if (isGoogleCloudKMSConfigured()) {
    console.info('Using Google Cloud KMS encryption service');
    try {
      const envelopeService = createEnvelopeEncryptionService();
      return new EnvelopeEncryptionAdapter(envelopeService);
    } catch (error) {
      console.warn('Google Cloud KMS initialization failed, falling back to simple encryption:', 
        error instanceof Error ? error.message : 'Unknown error');
      const simpleService = createSimpleEncryptionService();
      return new SimpleEncryptionAdapter(simpleService);
    }
  } else {
    console.info('Using simple AES encryption service (development mode)');
    const simpleService = createSimpleEncryptionService();
    return new SimpleEncryptionAdapter(simpleService);
  }
}

/**
 * Get encryption service type for logging and monitoring
 */
export function getEncryptionServiceType(): 'google-cloud-kms' | 'simple-aes' {
  return isGoogleCloudKMSConfigured() ? 'google-cloud-kms' : 'simple-aes';
}

/**
 * Validate encryption configuration
 */
export async function validateEncryptionConfiguration(): Promise<{
  valid: boolean;
  serviceType: string;
  issues: string[];
}> {
  const issues: string[] = [];
  const serviceType = getEncryptionServiceType();

  try {
    const service = createEncryptionService();
    const healthCheck = await service.healthCheck();

    if (!healthCheck.healthy) {
      issues.push(`Encryption service health check failed: ${healthCheck.error}`);
    }

    if (serviceType === 'simple-aes') {
      if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 32) {
        issues.push('ENCRYPTION_KEY environment variable must be at least 32 characters');
      }
    }

    return {
      valid: issues.length === 0,
      serviceType,
      issues,
    };

  } catch (error) {
    issues.push(`Encryption service initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      valid: false,
      serviceType,
      issues,
    };
  }
}