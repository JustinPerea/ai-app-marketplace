/**
 * Simple API Key Storage System
 * 
 * This provides in-memory API key storage for testing and development.
 * In production, this would be replaced with encrypted database storage.
 */

import { createHash, randomBytes } from 'crypto';

export interface StoredApiKey {
  id: string;
  userId: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'cohere' | 'hugging_face' | 'ollama';
  keyPreview: string; // Last 4 characters for display
  encryptedKey: string; // Encrypted full key
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  totalRequests: number;
  totalCost: number;
}

export interface ApiKeyInput {
  name: string;
  provider: StoredApiKey['provider'];
  apiKey: string;
}

export interface ApiKeyValidationResult {
  isValid: boolean;
  provider?: string;
  model?: string;
  error?: string;
}

// In-memory storage (replace with database in production)
const apiKeyStore = new Map<string, StoredApiKey>();

// Simple encryption (replace with proper encryption in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-characters';

function encryptKey(key: string): string {
  // Simple base64 encoding for development (use proper encryption in production)
  return Buffer.from(key).toString('base64');
}

function decryptKey(encryptedKey: string): string {
  // Simple base64 decoding for development
  return Buffer.from(encryptedKey, 'base64').toString('utf-8');
}

function generateKeyId(): string {
  return randomBytes(16).toString('hex');
}

function getKeyPreview(key: string): string {
  return key.slice(-4);
}

/**
 * Store an API key for a user
 */
export async function storeApiKey(userId: string, keyData: ApiKeyInput): Promise<StoredApiKey> {
  const keyId = generateKeyId();
  const encryptedKey = encryptKey(keyData.apiKey);
  const keyPreview = getKeyPreview(keyData.apiKey);
  
  const storedKey: StoredApiKey = {
    id: keyId,
    userId,
    name: keyData.name,
    provider: keyData.provider,
    keyPreview,
    encryptedKey,
    isActive: true,
    createdAt: new Date(),
    totalRequests: 0,
    totalCost: 0,
  };
  
  apiKeyStore.set(keyId, storedKey);
  
  console.log(`API key stored for user ${userId}: ${keyData.provider} (${keyData.name})`);
  
  return storedKey;
}

/**
 * Get all API keys for a user
 */
export async function getUserApiKeys(userId: string): Promise<StoredApiKey[]> {
  const userKeys = Array.from(apiKeyStore.values()).filter(
    key => key.userId === userId && key.isActive
  );
  
  return userKeys.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Get a specific API key by ID (for the authenticated user)
 */
export async function getApiKey(userId: string, keyId: string): Promise<StoredApiKey | null> {
  const key = apiKeyStore.get(keyId);
  
  if (!key || key.userId !== userId || !key.isActive) {
    return null;
  }
  
  return key;
}

/**
 * Get decrypted API key for usage (internal use)
 */
export async function getDecryptedApiKey(userId: string, keyId: string): Promise<string | null> {
  const key = await getApiKey(userId, keyId);
  
  if (!key) {
    return null;
  }
  
  return decryptKey(key.encryptedKey);
}

/**
 * Delete an API key
 */
export async function deleteApiKey(userId: string, keyId: string): Promise<boolean> {
  const key = apiKeyStore.get(keyId);
  
  if (!key || key.userId !== userId) {
    return false;
  }
  
  // Soft delete by marking as inactive
  key.isActive = false;
  apiKeyStore.set(keyId, key);
  
  console.log(`API key deleted for user ${userId}: ${keyId}`);
  
  return true;
}

/**
 * Update API key usage statistics
 */
export async function updateKeyUsage(
  keyId: string, 
  tokensUsed: number, 
  cost: number
): Promise<void> {
  const key = apiKeyStore.get(keyId);
  
  if (!key) {
    return;
  }
  
  key.lastUsed = new Date();
  key.totalRequests += 1;
  key.totalCost += cost;
  
  apiKeyStore.set(keyId, key);
}

/**
 * Validate an API key by testing it with the provider
 */
export async function validateApiKey(
  provider: StoredApiKey['provider'], 
  apiKey: string
): Promise<ApiKeyValidationResult> {
  try {
    switch (provider) {
      case 'openai':
        return await validateOpenAIKey(apiKey);
      case 'anthropic':
        return await validateAnthropicKey(apiKey);
      case 'google':
        return await validateGoogleKey(apiKey);
      case 'ollama':
        return await validateOllamaConnection();
      default:
        return { isValid: false, error: 'Unsupported provider' };
    }
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Validation failed' 
    };
  }
}

/**
 * OpenAI API key validation
 */
async function validateOpenAIKey(apiKey: string): Promise<ApiKeyValidationResult> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        isValid: true,
        provider: 'openai',
        model: data.data?.[0]?.id || 'Available',
      };
    } else if (response.status === 401) {
      return { isValid: false, error: 'Invalid API key' };
    } else {
      return { isValid: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { isValid: false, error: 'Network error' };
  }
}

/**
 * Anthropic API key validation
 */
async function validateAnthropicKey(apiKey: string): Promise<ApiKeyValidationResult> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }],
      }),
    });

    if (response.status === 400) {
      // Expected error for test request, but key is valid
      return {
        isValid: true,
        provider: 'anthropic',
        model: 'claude-3-haiku-20240307',
      };
    } else if (response.status === 401) {
      return { isValid: false, error: 'Invalid API key' };
    } else {
      return { isValid: true, provider: 'anthropic' };
    }
  } catch (error) {
    return { isValid: false, error: 'Network error' };
  }
}

/**
 * Google AI API key validation
 */
async function validateGoogleKey(apiKey: string): Promise<ApiKeyValidationResult> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (response.ok) {
      const data = await response.json();
      return {
        isValid: true,
        provider: 'google',
        model: data.models?.[0]?.name || 'Available',
      };
    } else if (response.status === 403) {
      return { isValid: false, error: 'Invalid API key or quota exceeded' };
    } else {
      return { isValid: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { isValid: false, error: 'Network error' };
  }
}

/**
 * Ollama connection validation
 */
async function validateOllamaConnection(): Promise<ApiKeyValidationResult> {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    
    if (response.ok) {
      const data = await response.json();
      return {
        isValid: true,
        provider: 'ollama',
        model: data.models?.[0]?.name || 'Local models available',
      };
    } else {
      return { isValid: false, error: 'Ollama server not responding' };
    }
  } catch (error) {
    return { isValid: false, error: 'Ollama not running or unreachable' };
  }
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsageStats(userId: string): Promise<{
  totalKeys: number;
  totalRequests: number;
  totalCost: number;
  keysByProvider: Record<string, number>;
}> {
  const userKeys = await getUserApiKeys(userId);
  
  const stats = {
    totalKeys: userKeys.length,
    totalRequests: userKeys.reduce((sum, key) => sum + key.totalRequests, 0),
    totalCost: userKeys.reduce((sum, key) => sum + key.totalCost, 0),
    keysByProvider: {} as Record<string, number>,
  };
  
  userKeys.forEach(key => {
    stats.keysByProvider[key.provider] = (stats.keysByProvider[key.provider] || 0) + 1;
  });
  
  return stats;
}