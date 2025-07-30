import { NextRequest, NextResponse } from 'next/server';
import { createApiKeyManager } from '@/lib/security/api-key-manager';
import { prisma } from '@/lib/db';
import { ApiProvider } from '@prisma/client';

/**
 * Test API key migration endpoint
 * GET /api/test-migration
 * 
 * This endpoint simulates the complete API key migration process:
 * 1. Creates a test user
 * 2. Stores an encrypted API key
 * 3. Retrieves and decrypts the key
 * 4. Verifies the process works end-to-end
 */
export async function GET() {
  try {
    console.log('Starting API key migration test...');

    // Create API key manager
    const apiKeyManager = createApiKeyManager(prisma);

    // Create or get test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test-migration@example.com' },
      update: {},
      create: {
        email: 'test-migration@example.com',
        name: 'Test Migration User',
        plan: 'FREE',
        creditsUsed: 0,
        creditsLimit: 3,
      },
    });

    console.log('Test user created/found:', testUser.id);

    // Test API key data
    const testApiKey = 'sk-test-1234567890abcdefghijklmnopqrstuvwxyz';
    const testProvider = ApiProvider.OPENAI;
    const testName = 'Test OpenAI Key';

    // Step 1: Store API key with encryption
    console.log('Storing encrypted API key...');
    const storedKey = await apiKeyManager.storeApiKey({
      userId: testUser.id,
      name: testName,
      provider: testProvider,
      apiKey: testApiKey,
    });

    console.log('API key stored successfully:', storedKey.id);

    // Step 2: Retrieve and decrypt API key
    console.log('Retrieving and decrypting API key...');
    const retrievedKey = await apiKeyManager.retrieveApiKey({
      userId: testUser.id,
      apiKeyId: storedKey.id,
    });

    if (!retrievedKey) {
      throw new Error('Failed to retrieve API key');
    }

    console.log('API key retrieved successfully');

    // Step 3: Verify the decrypted key matches original
    const keyMatches = retrievedKey.decryptedKey === testApiKey;
    
    if (!keyMatches) {
      throw new Error('Decrypted key does not match original');
    }

    console.log('Key verification successful');

    // Step 4: Test listing API keys
    const apiKeys = await apiKeyManager.listApiKeys(testUser.id);
    
    // Step 5: Health check
    const healthCheck = await apiKeyManager.healthCheck();

    // Step 6: Clean up test data
    await prisma.apiKey.deleteMany({
      where: { userId: testUser.id },
    });
    
    await prisma.user.delete({
      where: { id: testUser.id },
    });

    console.log('Migration test completed successfully');

    return NextResponse.json({
      success: true,
      message: 'API key migration test completed successfully',
      results: {
        encryption: {
          keyStored: !!storedKey.id,
          algorithm: 'AES-256-GCM',
          keyPreview: storedKey.keyPreview,
        },
        decryption: {
          keyRetrieved: !!retrievedKey,
          keyMatches: keyMatches,
          isValid: retrievedKey.isValid,
        },
        listing: {
          keysFound: apiKeys.length,
          correctKey: apiKeys.some(k => k.id === storedKey.id),
        },
        healthCheck: {
          healthy: healthCheck.healthy,
          latency: healthCheck.latency,
        },
        cleanup: {
          completed: true,
        },
      },
      performance: {
        encryptionLatency: healthCheck.latency,
        totalProcessTime: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Migration test failed:', error);
    
    // Attempt cleanup on error
    try {
      await prisma.user.deleteMany({
        where: { email: 'test-migration@example.com' },
      });
    } catch (cleanupError) {
      console.error('Cleanup failed:', cleanupError);
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Check server logs for more information',
    }, { status: 500 });
  }
}