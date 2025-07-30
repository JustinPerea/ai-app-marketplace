/**
 * Simple Encryption Service for Development (Working Version)
 * 
 * Uses modern Node.js crypto APIs properly
 */

import { randomBytes, createHash, scrypt, createCipherGCM, createDecipherGCM } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export interface SimpleEncryptionResult {
  encryptedData: string;
  salt: string;
  iv: string;
  authTag: string;
  context: string;
  algorithm: string;
  createdAt: Date;
}

export interface SimpleDecryptionResult {
  decryptedData: string;
  isValid: boolean;
}

export class SimpleEncryptionService {
  private masterKey: string;

  constructor(masterKey?: string) {
    this.masterKey = masterKey || process.env.ENCRYPTION_KEY || this.generateMasterKey();
    
    if (this.masterKey.length < 32) {
      throw new Error('Master encryption key must be at least 32 characters');
    }
  }

  /**
   * Encrypt API key using AES-256-GCM
   */
  async encryptApiKey(apiKey: string, customerContext: string): Promise<SimpleEncryptionResult> {
    try {
      // Generate salt and IV
      const salt = randomBytes(32);
      const iv = randomBytes(12); // 12 bytes for GCM
      
      // Derive key from master key and salt
      const derivedKey = await scryptAsync(this.masterKey, salt, 32) as Buffer;
      
      // Create cipher
      const cipher = createCipherGCM('aes-256-gcm', derivedKey, iv);
      
      // Set Additional Authenticated Data
      cipher.setAAD(Buffer.from(customerContext));
      
      // Encrypt the API key
      let encryptedData = cipher.update(apiKey, 'utf8', 'base64');
      encryptedData += cipher.final('base64');
      
      // Get authentication tag
      const authTag = cipher.getAuthTag();
      
      // Create context hash for integrity verification
      const contextHash = createHash('sha256')
        .update(customerContext)
        .update(this.masterKey)
        .digest('hex');

      return {
        encryptedData,
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        context: contextHash,
        algorithm: 'AES-256-GCM',
        createdAt: new Date()
      };

    } catch (error) {
      console.error('Simple encryption failed:', error);
      throw new Error('API key encryption failed');
    }
  }

  /**
   * Decrypt API key using AES-256-GCM
   */
  async decryptApiKey(
    encryptionResult: SimpleEncryptionResult,
    customerContext: string
  ): Promise<SimpleDecryptionResult> {
    try {
      // Verify context binding
      const expectedContextHash = createHash('sha256')
        .update(customerContext)
        .update(this.masterKey)
        .digest('hex');

      if (encryptionResult.context !== expectedContextHash) {
        console.warn('Context binding verification failed');
        return { decryptedData: '', isValid: false };
      }

      // Recreate the derived key
      const salt = Buffer.from(encryptionResult.salt, 'base64');
      const iv = Buffer.from(encryptionResult.iv, 'base64');
      const derivedKey = await scryptAsync(this.masterKey, salt, 32) as Buffer;
      
      // Create decipher
      const decipher = createDecipherGCM('aes-256-gcm', derivedKey, iv);
      decipher.setAAD(Buffer.from(customerContext));
      decipher.setAuthTag(Buffer.from(encryptionResult.authTag, 'base64'));
      
      // Decrypt the data
      let decryptedData = decipher.update(encryptionResult.encryptedData, 'base64', 'utf8');
      decryptedData += decipher.final('utf8');

      return {
        decryptedData,
        isValid: true
      };

    } catch (error) {
      console.error('Simple decryption failed:', error);
      return { decryptedData: '', isValid: false };
    }
  }

  /**
   * Health check for simple encryption service
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // Test encrypt/decrypt cycle
      const testData = 'health-check-test-key';
      const testContext = 'health-check-context';
      
      const encrypted = await this.encryptApiKey(testData, testContext);
      const decrypted = await this.decryptApiKey(encrypted, testContext);
      
      const latency = Date.now() - startTime;
      
      if (decrypted.isValid && decrypted.decryptedData === testData) {
        return { healthy: true, latency };
      } else {
        return { healthy: false, error: 'Encryption cycle failed' };
      }
      
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate a secure master key for development
   */
  private generateMasterKey(): string {
    return randomBytes(32).toString('hex');
  }
}

/**
 * Create simple encryption service for development
 */
export function createSimpleEncryptionService(): SimpleEncryptionService {
  return new SimpleEncryptionService();
}