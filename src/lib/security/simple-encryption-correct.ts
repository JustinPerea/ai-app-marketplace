/**
 * Simple Encryption Service for Development (Correct Node.js API)
 * 
 * Uses createCipheriv/createDecipheriv which are the correct functions in Node.js v22
 */

import { randomBytes, createHash, scrypt, createCipheriv, createDecipheriv } from 'crypto';
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
   * Encrypt API key using AES-256-GCM with createCipheriv
   */
  async encryptApiKey(apiKey: string, customerContext: string): Promise<SimpleEncryptionResult> {
    try {
      // Generate salt and IV
      const salt = randomBytes(32);
      const iv = randomBytes(12); // 12 bytes for GCM
      
      // Derive key from master key and salt
      const derivedKey = await scryptAsync(this.masterKey, salt, 32) as Buffer;
      
      // Create cipher using the CORRECT Node.js API
      const cipher = createCipheriv('aes-256-gcm', derivedKey, iv);
      
      // Set Additional Authenticated Data
      cipher.setAAD(Buffer.from(customerContext));
      
      // Encrypt the API key
      let encryptedData = cipher.update(apiKey, 'utf8', 'hex');
      encryptedData += cipher.final('hex');
      
      // Get authentication tag
      const authTag = cipher.getAuthTag();
      
      // Create context hash for integrity verification
      const contextHash = createHash('sha256')
        .update(customerContext)
        .update(this.masterKey)
        .digest('hex');

      return {
        encryptedData,
        salt: salt.toString('hex'),
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
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
   * Decrypt API key using AES-256-GCM with createDecipheriv
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
      const salt = Buffer.from(encryptionResult.salt, 'hex');
      const iv = Buffer.from(encryptionResult.iv, 'hex');
      const derivedKey = await scryptAsync(this.masterKey, salt, 32) as Buffer;
      
      // Create decipher using the CORRECT Node.js API
      const decipher = createDecipheriv('aes-256-gcm', derivedKey, iv);
      decipher.setAAD(Buffer.from(customerContext));
      decipher.setAuthTag(Buffer.from(encryptionResult.authTag, 'hex'));
      
      // Decrypt the data
      let decryptedData = decipher.update(encryptionResult.encryptedData, 'hex', 'utf8');
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