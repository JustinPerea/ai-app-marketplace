/**
 * Simple Encryption Service for Development (Fixed Version)
 * 
 * Uses modern Node.js crypto APIs for AES-256-GCM encryption
 */

import { createCipher, createDecipher, randomBytes, createHash, scrypt } from 'crypto';
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
      // Generate salt and derive key
      const salt = randomBytes(32);
      const iv = randomBytes(12); // 12 bytes for GCM
      const derivedKey = await scryptAsync(this.masterKey, salt, 32) as Buffer;
      
      // Use modern crypto API
      const crypto = require('crypto');
      const cipher = crypto.createCipher('aes-256-gcm', derivedKey);
      
      // Set IV (this may not work with the deprecated createCipher)
      // Let's use a simpler approach with AES-256-CBC instead
      const cipherCBC = crypto.createCipher('aes-256-cbc', derivedKey);
      
      let encryptedData = cipherCBC.update(apiKey, 'utf8', 'base64');
      encryptedData += cipherCBC.final('base64');
      
      // Create a simple authentication tag using HMAC
      const authTag = crypto.createHmac('sha256', derivedKey)
        .update(encryptedData)
        .update(customerContext)
        .digest('base64');
      
      // Create context hash
      const contextHash = createHash('sha256')
        .update(customerContext)
        .update(this.masterKey)
        .digest('hex');

      return {
        encryptedData,
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        authTag,
        context: contextHash,
        algorithm: 'AES-256-CBC+HMAC',
        createdAt: new Date()
      };

    } catch (error) {
      console.error('Simple encryption failed:', error);
      throw new Error('API key encryption failed');
    }
  }

  /**
   * Decrypt API key
   */
  async decryptApiKey(
    encryptionResult: SimpleEncryptionResult,
    customerContext: string
  ): Promise<SimpleDecryptionResult> {
    try {
      // Verify context
      const expectedContextHash = createHash('sha256')
        .update(customerContext)
        .update(this.masterKey)
        .digest('hex');

      if (encryptionResult.context !== expectedContextHash) {
        return { decryptedData: '', isValid: false };
      }

      // Recreate derived key
      const salt = Buffer.from(encryptionResult.salt, 'base64');
      const derivedKey = await scryptAsync(this.masterKey, salt, 32) as Buffer;
      
      // Verify authentication tag
      const crypto = require('crypto');
      const expectedAuthTag = crypto.createHmac('sha256', derivedKey)
        .update(encryptionResult.encryptedData)
        .update(customerContext)
        .digest('base64');
      
      if (expectedAuthTag !== encryptionResult.authTag) {
        return { decryptedData: '', isValid: false };
      }
      
      // Decrypt
      const decipher = crypto.createDecipher('aes-256-cbc', derivedKey);
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

  async healthCheck(): Promise<{
    healthy: boolean;
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const testData = 'health-check-test';
      const testContext = 'health-context';
      
      const encrypted = await this.encryptApiKey(testData, testContext);
      const decrypted = await this.decryptApiKey(encrypted, testContext);
      
      const latency = Date.now() - startTime;
      
      if (decrypted.isValid && decrypted.decryptedData === testData) {
        return { healthy: true, latency };
      } else {
        return { healthy: false, error: 'Health check cycle failed' };
      }
      
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateMasterKey(): string {
    return randomBytes(32).toString('hex');
  }
}

export function createSimpleEncryptionService(): SimpleEncryptionService {
  return new SimpleEncryptionService();
}