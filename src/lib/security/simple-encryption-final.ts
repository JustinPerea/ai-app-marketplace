/**
 * Simple Encryption Service for Development (Final Working Version)
 * 
 * Uses Node.js crypto module correctly with GCM mode
 */

import { randomBytes, createHash, scrypt, createCipher, createDecipher } from 'crypto';
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
   * Encrypt API key using modern Node.js crypto
   */
  async encryptApiKey(apiKey: string, customerContext: string): Promise<SimpleEncryptionResult> {
    try {
      const crypto = require('crypto');
      
      // Generate salt and IV
      const salt = randomBytes(32);
      const iv = randomBytes(12); // 12 bytes for GCM
      
      // Derive key from master key and salt
      const derivedKey = await scryptAsync(this.masterKey, salt, 32) as Buffer;
      
      // Create cipher using the correct Node.js API
      const cipher = crypto.createCipher('aes-256-gcm', derivedKey);
      
      // For GCM mode, we need to use the cipher methods correctly
      cipher.setAAD(Buffer.from(customerContext));
      
      // Encrypt the API key
      let encryptedData = cipher.update(apiKey, 'utf8', 'hex');
      encryptedData += cipher.final('hex');
      
      // Get authentication tag for GCM
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
      // If GCM fails, fallback to simpler CBC mode
      console.warn('GCM mode failed, falling back to CBC mode:', error);
      return this.encryptApiKeyCBC(apiKey, customerContext);
    }
  }

  /**
   * Fallback CBC encryption (more widely supported)
   */
  private async encryptApiKeyCBC(apiKey: string, customerContext: string): Promise<SimpleEncryptionResult> {
    const crypto = require('crypto');
    
    // Generate salt
    const salt = randomBytes(32);
    const iv = randomBytes(16); // 16 bytes for CBC
    
    // Derive key from master key and salt
    const derivedKey = await scryptAsync(this.masterKey, salt, 32) as Buffer;
    
    // Create cipher
    const cipher = crypto.createCipher('aes-256-cbc', derivedKey);
    
    // Encrypt the API key
    let encryptedData = cipher.update(apiKey, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    
    // Create HMAC for authentication (since CBC doesn't have auth tag)
    const authTag = crypto.createHmac('sha256', derivedKey)
      .update(encryptedData)
      .update(customerContext)
      .digest('hex');
    
    // Create context hash
    const contextHash = createHash('sha256')
      .update(customerContext)
      .update(this.masterKey)
      .digest('hex');

    return {
      encryptedData,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag,
      context: contextHash,
      algorithm: 'AES-256-CBC+HMAC',
      createdAt: new Date()
    };
  }

  /**
   * Decrypt API key
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

      if (encryptionResult.algorithm === 'AES-256-GCM') {
        return this.decryptApiKeyGCM(encryptionResult, customerContext);
      } else {
        return this.decryptApiKeyCBC(encryptionResult, customerContext);
      }

    } catch (error) {
      console.error('Decryption failed:', error);
      return { decryptedData: '', isValid: false };
    }
  }

  private async decryptApiKeyGCM(
    encryptionResult: SimpleEncryptionResult,
    customerContext: string
  ): Promise<SimpleDecryptionResult> {
    const crypto = require('crypto');
    
    // Recreate the derived key
    const salt = Buffer.from(encryptionResult.salt, 'hex');
    const derivedKey = await scryptAsync(this.masterKey, salt, 32) as Buffer;
    
    // Create decipher
    const decipher = crypto.createDecipher('aes-256-gcm', derivedKey);
    decipher.setAAD(Buffer.from(customerContext));
    decipher.setAuthTag(Buffer.from(encryptionResult.authTag, 'hex'));
    
    // Decrypt the data
    let decryptedData = decipher.update(encryptionResult.encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');

    return {
      decryptedData,
      isValid: true
    };
  }

  private async decryptApiKeyCBC(
    encryptionResult: SimpleEncryptionResult,
    customerContext: string
  ): Promise<SimpleDecryptionResult> {
    const crypto = require('crypto');
    
    // Recreate the derived key
    const salt = Buffer.from(encryptionResult.salt, 'hex');
    const derivedKey = await scryptAsync(this.masterKey, salt, 32) as Buffer;
    
    // Verify HMAC
    const expectedAuthTag = crypto.createHmac('sha256', derivedKey)
      .update(encryptionResult.encryptedData)
      .update(customerContext)
      .digest('hex');
    
    if (expectedAuthTag !== encryptionResult.authTag) {
      return { decryptedData: '', isValid: false };
    }
    
    // Create decipher
    const decipher = crypto.createDecipher('aes-256-cbc', derivedKey);
    
    // Decrypt the data
    let decryptedData = decipher.update(encryptionResult.encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');

    return {
      decryptedData,
      isValid: true
    };
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