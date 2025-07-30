/**
 * Hybrid API Key Management System
 * 
 * This provides seamless transition from localStorage to database storage while
 * maintaining backward compatibility and preserving existing functionality.
 * 
 * Features:
 * - Automatic migration from localStorage to database
 * - Fallback to localStorage for unauthenticated users
 * - Secure database storage with encryption
 * - Maintains existing API surface for compatibility
 */

import { APIKeyManager as LocalStorageManager, PROVIDER_CONFIGS } from '@/lib/api-keys';

interface StoredAPIKey {
  id: string;
  provider: string;
  name: string;
  keyPreview: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
  totalRequests?: number;
  totalCost?: number;
}

interface DatabaseAPIKey {
  id: string;
  name: string;
  provider: string;
  keyPreview: string;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  totalRequests: number;
  totalCost: number;
}

interface MigrationStatus {
  hasDatabaseKeys: boolean;
  keyCount: number;
  providers: string[];
  lastMigration: number | null;
}

class HybridAPIKeyManager {
  private isAuthenticated: boolean = false;
  private authChecked: boolean = false;
  private migrationAttempted: boolean = false;

  /**
   * Check if user is authenticated by testing API access
   */
  private async checkAuthentication(): Promise<boolean> {
    if (this.authChecked) {
      return this.isAuthenticated;
    }

    try {
      const response = await fetch('/api/keys', {
        method: 'GET',
        credentials: 'include',
      });
      
      this.isAuthenticated = response.ok;
      this.authChecked = true;
      
      return this.isAuthenticated;
    } catch {
      this.isAuthenticated = false;
      this.authChecked = true;
      return false;
    }
  }

  /**
   * Check migration status and trigger if needed
   */
  private async checkAndTriggerMigration(): Promise<void> {
    if (this.migrationAttempted || !await this.checkAuthentication()) {
      return;
    }

    try {
      // Check current migration status
      const statusResponse = await fetch('/api/keys/migrate', {
        method: 'GET',
        credentials: 'include',
      });

      if (!statusResponse.ok) {
        console.warn('Could not check migration status');
        return;
      }

      const statusData = await statusResponse.json();
      const migrationStatus: MigrationStatus = statusData.migrationStatus;

      // If user has no database keys, attempt migration
      if (!migrationStatus.hasDatabaseKeys) {
        await this.performMigration();
      }
    } catch (error) {
      console.error('Migration check failed:', error);
    } finally {
      this.migrationAttempted = true;
    }
  }

  /**
   * Perform migration from localStorage to database
   */
  private async performMigration(): Promise<void> {
    try {
      // Get localStorage keys
      const localKeys = LocalStorageManager.getAll();
      
      if (localKeys.length === 0) {
        console.info('No localStorage keys to migrate');
        return;
      }

      // Prepare migration data
      const migrationKeys = localKeys.map(key => ({
        id: key.id,
        provider: key.provider,
        name: key.name,
        keyPreview: key.keyPreview,
        isActive: key.isActive,
        createdAt: key.createdAt,
        lastUsed: key.lastUsed,
        // Get the actual encoded key from localStorage
        encodedKey: localStorage.getItem(`api-key-${key.id}`) || '',
      }));

      console.info(`Attempting to migrate ${migrationKeys.length} API keys to database`);

      // Perform migration
      const migrationResponse = await fetch('/api/keys/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ keys: migrationKeys }),
      });

      if (migrationResponse.ok) {
        const migrationResult = await migrationResponse.json();
        console.info('Migration completed:', migrationResult.summary);

        // Clear localStorage keys that were successfully migrated
        if (migrationResult.migratedKeys.length > 0) {
          migrationResult.migratedKeys.forEach((migratedKey: any) => {
            const originalKey = localKeys.find(k => k.id === migratedKey.originalId);
            if (originalKey) {
              localStorage.removeItem(`api-key-${originalKey.id}`);
            }
          });
          
          // Update localStorage metadata
          const remainingKeys = localKeys.filter(key => 
            !migrationResult.migratedKeys.some((mk: any) => mk.originalId === key.id)
          );
          localStorage.setItem('ai-marketplace-api-keys', JSON.stringify(remainingKeys));
          
          console.info(`Cleaned up ${migrationResult.migratedKeys.length} migrated keys from localStorage`);
        }
      } else {
        console.error('Migration failed:', await migrationResponse.text());
      }
    } catch (error) {
      console.error('Migration process failed:', error);
    }
  }

  /**
   * Get all stored API keys (from database or localStorage)
   */
  async getAll(): Promise<StoredAPIKey[]> {
    // Always attempt migration check first
    await this.checkAndTriggerMigration();

    if (await this.checkAuthentication()) {
      try {
        // Get from database
        const response = await fetch('/api/keys', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          return (data.keys || []).map((key: DatabaseAPIKey) => ({
            id: key.id,
            provider: key.provider,
            name: key.name,
            keyPreview: key.keyPreview,
            isActive: key.isActive,
            createdAt: key.createdAt instanceof Date ? key.createdAt.toISOString() : key.createdAt,
            lastUsed: key.lastUsed instanceof Date ? key.lastUsed.toISOString() : key.lastUsed,
            totalRequests: key.totalRequests,
            totalCost: key.totalCost,
          }));
        }
      } catch (error) {
        console.error('Failed to get keys from database, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    return LocalStorageManager.getAll();
  }

  /**
   * Add a new API key
   */
  async add(provider: string, name: string, apiKey: string): Promise<StoredAPIKey> {
    if (await this.checkAuthentication()) {
      try {
        // Add to database
        const response = await fetch('/api/keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            provider: provider.toUpperCase(),
            name,
            apiKey,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const key = data.key;
          return {
            id: key.id,
            provider: key.provider,
            name: key.name,
            keyPreview: key.keyPreview,
            isActive: key.isActive,
            createdAt: key.createdAt instanceof Date ? key.createdAt.toISOString() : key.createdAt,
            lastUsed: key.lastUsed,
            totalRequests: key.totalRequests || 0,
            totalCost: key.totalCost || 0,
          };
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add API key');
        }
      } catch (error) {
        console.error('Failed to add key to database, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    return LocalStorageManager.add(provider, name, apiKey);
  }

  /**
   * Get the actual API key for a provider
   */
  async getKey(provider: string): Promise<string | null> {
    if (await this.checkAuthentication()) {
      try {
        // Get all keys and find the one for this provider
        const keys = await this.getAll();
        const key = keys.find(k => k.provider === provider && k.isActive);
        
        if (key) {
          // Get decrypted key from database
          const response = await fetch(`/api/keys/${key.id}/decrypt`, {
            method: 'GET',
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            return data.key.decryptedKey;
          }
        }
      } catch (error) {
        console.error('Failed to get key from database, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    return LocalStorageManager.getKey(provider);
  }

  /**
   * Get the actual API key by specific key ID
   */
  async getKeyById(keyId: string): Promise<string | null> {
    if (await this.checkAuthentication()) {
      try {
        // Get decrypted key from database by ID
        const response = await fetch(`/api/keys/${keyId}/decrypt`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          return data.key.decryptedKey;
        }
      } catch (error) {
        console.error('Failed to get key from database, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage - find key by ID
    const keys = LocalStorageManager.getAll();
    const key = keys.find(k => k.id === keyId && k.isActive);
    
    if (!key || typeof window === 'undefined') return null;
    
    const encodedKey = localStorage.getItem(`api-key-${keyId}`);
    return encodedKey ? atob(encodedKey) : null;
  }

  /**
   * Mark API key as used
   */
  async markUsed(provider: string): Promise<void> {
    if (await this.checkAuthentication()) {
      // Database keys are automatically updated when accessed
      // No additional action needed for database-stored keys
      return;
    }

    // Fallback to localStorage
    LocalStorageManager.markUsed(provider);
  }

  /**
   * Delete an API key
   */
  async delete(id: string): Promise<boolean> {
    if (await this.checkAuthentication()) {
      try {
        const response = await fetch(`/api/keys/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        return response.ok;
      } catch (error) {
        console.error('Failed to delete key from database, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    return LocalStorageManager.delete(id);
  }

  /**
   * Toggle active status of an API key
   */
  async toggle(id: string): Promise<boolean> {
    // For database keys, we don't support toggling - they are either active or deleted
    // This maintains backward compatibility with localStorage behavior
    if (await this.checkAuthentication()) {
      console.warn('Toggle operation not supported for database keys. Use delete instead.');
      return false;
    }

    // Fallback to localStorage
    return LocalStorageManager.toggle(id);
  }

  /**
   * Test an API key
   */
  async test(provider: string, apiKey?: string): Promise<{ success: boolean; error?: string }> {
    // Use the existing test functionality from localStorage manager
    // This works for both stored keys and provided keys
    return LocalStorageManager.test(provider, apiKey);
  }

  /**
   * Clear all keys (for development/testing)
   */
  async clearAll(): Promise<void> {
    if (await this.checkAuthentication()) {
      try {
        // Get all database keys and delete them
        const keys = await this.getAll();
        await Promise.all(keys.map(key => this.delete(key.id)));
      } catch (error) {
        console.error('Failed to clear database keys:', error);
      }
    }

    // Also clear localStorage
    LocalStorageManager.clearAll();
  }

  /**
   * Force re-check authentication status
   */
  async refreshAuthStatus(): Promise<void> {
    this.authChecked = false;
    this.migrationAttempted = false;
    await this.checkAuthentication();
  }

  /**
   * Get current storage type
   */
  async getStorageType(): Promise<'database' | 'localStorage'> {
    return (await this.checkAuthentication()) ? 'database' : 'localStorage';
  }
}

// Export singleton instance
export const APIKeyManager = new HybridAPIKeyManager();

// Export provider configs for compatibility
export { PROVIDER_CONFIGS } from '@/lib/api-keys';

// Export types for compatibility
export type { StoredAPIKey };