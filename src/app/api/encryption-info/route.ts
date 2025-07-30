import { NextRequest, NextResponse } from 'next/server';
import { getEncryptionServiceType } from '@/lib/security/encryption-factory';

/**
 * Get current encryption service information
 * GET /api/encryption-info
 */
export async function GET() {
  try {
    const serviceType = getEncryptionServiceType();
    
    // Get environment info (without exposing sensitive data)
    const hasGoogleCloudConfig = !!(
      process.env.GOOGLE_CLOUD_PROJECT_ID &&
      process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY_PATH
    );
    
    const hasSimpleEncryptionKey = !!(
      process.env.ENCRYPTION_KEY && 
      process.env.ENCRYPTION_KEY.length >= 32
    );

    return NextResponse.json({
      encryptionService: serviceType,
      configuration: {
        googleCloudKMS: {
          enabled: serviceType === 'google-cloud-kms',
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || null,
          hasServiceAccount: !!process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY_PATH,
          keyRing: process.env.GOOGLE_CLOUD_KEYRING_ID || null,
          keyId: process.env.GOOGLE_CLOUD_KEY_ID || null,
        },
        simpleAES: {
          available: hasSimpleEncryptionKey,
          keyLength: process.env.ENCRYPTION_KEY?.length || 0,
        },
      },
      security: {
        algorithm: serviceType === 'google-cloud-kms' ? 'AES-256-GCM+KMS' : 'AES-256-GCM',
        level: serviceType === 'google-cloud-kms' ? 'Enterprise (FIPS 140-2 Level 3)' : 'Development (AES-256)',
        keyManagement: serviceType === 'google-cloud-kms' ? 'Google Cloud HSM' : 'Local Environment',
      },
      status: 'Active',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get encryption info',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}