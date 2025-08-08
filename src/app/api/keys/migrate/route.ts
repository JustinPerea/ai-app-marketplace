import { NextRequest, NextResponse } from 'next/server';
import { withSimpleAuth } from '@/lib/auth/simple-auth';
import { prisma } from '@/lib/db';
import { createApiKeyManager } from '@/lib/security/api-key-manager';
import { ApiProvider } from '@prisma/client';
import { z } from 'zod';

/**
 * Migration utility to transfer API keys from localStorage to secure database storage
 * 
 * This endpoint handles the seamless migration of existing localStorage-based API keys
 * to the new encrypted database storage system while preserving all functionality.
 */

// Schema for localStorage key data
const LocalStorageKeySchema = z.object({
  id: z.string(),
  provider: z.string(),
  name: z.string(),
  keyPreview: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  lastUsed: z.string().optional(),
  // The actual API key (base64 encoded in localStorage)
  encodedKey: z.string(),
});

const MigrationRequestSchema = z.object({
  keys: z.array(LocalStorageKeySchema),
});

// Provider mapping from localStorage format to Prisma enum
const PROVIDER_MAPPING: Record<string, ApiProvider> = {
  'OPENAI': ApiProvider.OPENAI,
  'ANTHROPIC': ApiProvider.ANTHROPIC,
  'GOOGLE': ApiProvider.GOOGLE,
  'AZURE_OPENAI': ApiProvider.AZURE_OPENAI,
  'COHERE': ApiProvider.COHERE,
  'HUGGING_FACE': ApiProvider.HUGGING_FACE,
  'OLLAMA': ApiProvider.OLLAMA,
};

// Helper function to decode localStorage API key
function decodeLocalStorageKey(encodedKey: string): string {
  try {
    return atob(encodedKey);
  } catch {
    throw new Error('Invalid encoded key format');
  }
}

// Helper function to validate API key with provider (uses current request origin)
async function validateApiKeyWithProvider(request: NextRequest, provider: ApiProvider, apiKey: string): Promise<boolean> {
  try {
    const origin = request.nextUrl.origin;
    const response = await fetch(`${origin}/api/test-provider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.success;
    }
    return false;
  } catch (error) {
    console.error('API key validation error during migration:', error);
    return false;
  }
}

/**
 * POST /api/keys/migrate - Migrate localStorage API keys to database
 */
export const POST = withSimpleAuth(async (request, user) => {
  try {
    const body = await request.json();
    
    // Validate the migration request
    const validationResult = MigrationRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid migration data', 
          details: validationResult.error.issues.map(i => i.message).join(', ')
        },
        { status: 400 }
      );
    }

    const { keys } = validationResult.data;
    
    if (keys.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No keys to migrate',
        migratedKeys: [],
        failedKeys: [],
      });
    }

    const apiKeyManager = createApiKeyManager(prisma);
    const migratedKeys: any[] = [];
    const failedKeys: any[] = [];

    // Check if user already has keys in database to avoid duplicates
    const existingKeys = await apiKeyManager.listApiKeys(user.id);
    const existingProviders = new Set(existingKeys.map(key => key.provider));

    console.info('Starting API key migration:', {
      userId: user.id,
      keysToMigrate: keys.length,
      existingKeys: existingKeys.length,
      timestamp: new Date().toISOString(),
    });

    // Process each key for migration
    for (const localKey of keys) {
      try {
        // Map provider to Prisma enum
        const provider = PROVIDER_MAPPING[localKey.provider.toUpperCase()];
        if (!provider) {
          failedKeys.push({
            id: localKey.id,
            name: localKey.name,
            provider: localKey.provider,
            error: 'Unsupported provider',
          });
          continue;
        }

        // Skip if user already has a key for this provider
        if (existingProviders.has(provider)) {
          console.info(`Skipping migration for ${provider} - user already has key`);
          continue;
        }

        // Decode the localStorage key
        const decryptedKey = decodeLocalStorageKey(localKey.encodedKey);
        
        // Validate the key still works
        const isValid = await validateApiKeyWithProvider(request, provider, decryptedKey);
        if (!isValid) {
          failedKeys.push({
            id: localKey.id,
            name: localKey.name,
            provider: localKey.provider,
            error: 'API key validation failed',
          });
          continue;
        }

        // Migrate to secure database storage
        const migratedKey = await apiKeyManager.storeApiKey({
          userId: user.id,
          name: localKey.name,
          provider,
          apiKey: decryptedKey,
        });

        migratedKeys.push({
          id: migratedKey.id,
          name: migratedKey.name,
          provider: migratedKey.provider,
          keyPreview: migratedKey.keyPreview,
          originalId: localKey.id,
        });

        console.info(`Successfully migrated API key:`, {
          userId: user.id,
          provider,
          newKeyId: migratedKey.id,
          originalId: localKey.id,
        });

      } catch (error) {
        console.error('Failed to migrate individual key:', error);
        failedKeys.push({
          id: localKey.id,
          name: localKey.name,
          provider: localKey.provider,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.info('API key migration completed:', {
      userId: user.id,
      migratedCount: migratedKeys.length,
      failedCount: failedKeys.length,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Migration completed: ${migratedKeys.length} keys migrated, ${failedKeys.length} failed`,
      migratedKeys,
      failedKeys,
      summary: {
        total: keys.length,
        migrated: migratedKeys.length,
        failed: failedKeys.length,
        skipped: keys.length - migratedKeys.length - failedKeys.length,
      },
    });

  } catch (error) {
    console.error('API key migration failed:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

/**
 * GET /api/keys/migrate - Check migration status
 */
export const GET = withSimpleAuth(async (request, user) => {
  try {
    const apiKeyManager = createApiKeyManager(prisma);
    const databaseKeys = await apiKeyManager.listApiKeys(user.id);

    return NextResponse.json({
      success: true,
      migrationStatus: {
        hasDatabaseKeys: databaseKeys.length > 0,
        keyCount: databaseKeys.length,
        providers: databaseKeys.map(key => key.provider),
        lastMigration: databaseKeys.length > 0 
          ? Math.max(...databaseKeys.map(key => key.createdAt.getTime()))
          : null,
      },
    });
  } catch (error) {
    console.error('Failed to check migration status:', error);
    return NextResponse.json(
      { error: 'Failed to check migration status' },
      { status: 500 }
    );
  }
});

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}