import { NextRequest, NextResponse } from 'next/server';
import { createEncryptionService, validateEncryptionConfiguration } from '@/lib/security/encryption-factory';

/**
 * Test endpoint to verify encryption service is working
 * GET /api/test-encryption
 */
export async function GET() {
  try {
    // Validate encryption configuration
    const validation = await validateEncryptionConfiguration();
    
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Encryption configuration invalid',
        issues: validation.issues,
        serviceType: validation.serviceType,
      }, { status: 500 });
    }

    // Test encryption/decryption cycle
    const encryptionService = createEncryptionService();
    const testApiKey = 'sk-test-1234567890abcdef';
    const testContext = 'test-user-123:OPENAI:test';

    // Test encrypt
    const encrypted = await encryptionService.encryptApiKey(testApiKey, testContext);
    
    // Test decrypt
    const decrypted = await encryptionService.decryptApiKey(encrypted, testContext);

    // Health check
    const healthCheck = await encryptionService.healthCheck();

    return NextResponse.json({
      success: true,
      serviceType: validation.serviceType,
      encryption: {
        algorithm: encrypted.algorithm,
        createdAt: encrypted.createdAt,
        hasEncryptedData: !!encrypted.encryptedData,
        hasContext: !!encrypted.context,
      },
      decryption: {
        successful: decrypted.isValid,
        dataMatches: decrypted.decryptedData === testApiKey,
      },
      healthCheck: {
        healthy: healthCheck.healthy,
        latency: healthCheck.latency,
        error: healthCheck.error,
      },
    });

  } catch (error) {
    console.error('Encryption test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}