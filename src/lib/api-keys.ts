/**
 * Simple API Key Management
 * In production, this would be stored securely on the backend
 * For demo purposes, using localStorage with basic encryption
 */

interface StoredAPIKey {
  id: string;
  provider: string;
  name: string;
  keyPreview: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

const STORAGE_KEY = 'ai-marketplace-api-keys';

// Simple base64 encoding for demo purposes (NOT secure for production)
const encodeKey = (key: string): string => {
  return btoa(key);
};

const decodeKey = (encodedKey: string): string => {
  try {
    return atob(encodedKey);
  } catch {
    return '';
  }
};

const generateKeyPreview = (apiKey: string): string => {
  if (apiKey.length <= 8) return '***';
  return `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
};

export const APIKeyManager = {
  // Get all stored API keys
  getAll(): StoredAPIKey[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Add a new API key
  add(provider: string, name: string, apiKey: string): StoredAPIKey {
    const newKey: StoredAPIKey = {
      id: Date.now().toString(),
      provider,
      name,
      keyPreview: generateKeyPreview(apiKey),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const keys = this.getAll();
    keys.push(newKey);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
      // Store the actual key separately (encrypted)
      localStorage.setItem(`api-key-${newKey.id}`, encodeKey(apiKey));
    }

    return newKey;
  },

  // Get the actual API key for a provider
  getKey(provider: string): string | null {
    const keys = this.getAll();
    const activeKey = keys.find(k => k.provider === provider && k.isActive);
    
    if (!activeKey || typeof window === 'undefined') return null;
    
    const encodedKey = localStorage.getItem(`api-key-${activeKey.id}`);
    return encodedKey ? decodeKey(encodedKey) : null;
  },

  // Update last used timestamp
  markUsed(provider: string): void {
    const keys = this.getAll();
    const keyIndex = keys.findIndex(k => k.provider === provider && k.isActive);
    
    if (keyIndex >= 0) {
      keys[keyIndex].lastUsed = new Date().toISOString();
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
      }
    }
  },

  // Delete an API key
  delete(id: string): boolean {
    const keys = this.getAll();
    const filteredKeys = keys.filter(k => k.id !== id);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredKeys));
      localStorage.removeItem(`api-key-${id}`);
    }
    
    return filteredKeys.length < keys.length;
  },

  // Toggle active status
  toggle(id: string): boolean {
    const keys = this.getAll();
    const keyIndex = keys.findIndex(k => k.id === id);
    
    if (keyIndex >= 0) {
      keys[keyIndex].isActive = !keys[keyIndex].isActive;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
      }
      return true;
    }
    
    return false;
  },

  // Test an API key
  async test(provider: string, apiKey?: string): Promise<{ success: boolean; error?: string }> {
    const keyToTest = apiKey || this.getKey(provider);
    if (!keyToTest) {
      return { success: false, error: 'No API key found' };
    }

    try {
      switch (provider) {
        case 'OPENAI':
          return await this.testOpenAI(keyToTest);
        case 'ANTHROPIC':
          return await this.testAnthropic(keyToTest);
        case 'GOOGLE':
          return await this.testGoogle(keyToTest);
        default:
          return { success: false, error: 'Provider not supported for testing' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Test failed' };
    }
  },

  // Test OpenAI API key via our backend API
  async testOpenAI(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/test-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'OPENAI',
          apiKey: apiKey
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true };
      } else {
        let errorMessage = data.error || 'API key validation failed';
        
        // Add helpful free tier information for common errors
        if (errorMessage.includes('payment') || errorMessage.includes('billing') || errorMessage.includes('quota')) {
          errorMessage += '. Note: OpenAI requires a payment method - try Google Gemini (free 15 requests/minute) or Anthropic Claude ($5 free credit) instead.';
        }
        
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('OpenAI API test error:', error);
      return { success: false, error: 'Network error - check your connection. Consider Google Gemini (free tier) as an alternative.' };
    }
  },

  // Test Anthropic API key via our backend API
  async testAnthropic(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Use our backend API to test the key (avoids CORS issues)
      const response = await fetch('/api/test-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'ANTHROPIC',
          apiKey: apiKey
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'API key validation failed' };
      }
    } catch (error) {
      console.error('Anthropic API test error:', error);
      return { success: false, error: 'Network error - check your connection' };
    }
  },

  // Test Google AI API key via our backend API
  async testGoogle(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/test-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'GOOGLE',
          apiKey: apiKey
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'API key validation failed' };
      }
    } catch (error) {
      console.error('Google AI API test error:', error);
      return { success: false, error: 'Network error - check your connection' };
    }
  },

  // Clear all keys (for development/testing)
  clearAll(): void {
    if (typeof window !== 'undefined') {
      const keys = this.getAll();
      keys.forEach(key => {
        localStorage.removeItem(`api-key-${key.id}`);
      });
      localStorage.removeItem(STORAGE_KEY);
    }
  }
};

// Provider configurations
export const PROVIDER_CONFIGS = {
  OPENAI: {
    name: 'OpenAI',
    icon: 'OPENAI',
    models: ['gpt-4o', 'gpt-4o-mini'],
    keyFormat: 'sk-...',
    signupUrl: 'https://platform.openai.com/api-keys',
    docsUrl: 'https://platform.openai.com/docs',
    freeTier: {
      available: false,
      description: 'No free tier - requires payment method',
      limitations: 'Must add payment method to use any OpenAI models'
    },
    pricing: {
      gpt4o: { input: 0.0025, output: 0.01 }, // per 1K tokens
      gpt4oMini: { input: 0.00015, output: 0.0006 }
    }
  },
  AZURE_OPENAI: {
    name: 'Azure OpenAI',
    icon: 'OPENAI',
    models: ['gpt-4o', 'gpt-4o-mini'],
    keyFormat: 'azure-key-... (plus endpoint & deployment)',
    signupUrl: 'https://portal.azure.com/',
    docsUrl: 'https://learn.microsoft.com/azure/ai-services/openai/',
    freeTier: { available: false, description: 'Azure subscription required', limitations: 'Requires resource endpoint and deployment' },
    pricing: {}
  },
  ANTHROPIC: {
    name: 'Anthropic',
    icon: 'ANTHROPIC',
    models: ['claude-3-5-sonnet-20240620', 'claude-3-haiku-20240307'],
    keyFormat: 'sk-ant-...',
    signupUrl: 'https://console.anthropic.com/',
    docsUrl: 'https://docs.anthropic.com/',
    freeTier: {
      available: true,
      description: '$5 free credit for new accounts',
      limitations: 'Credit expires after initial period'
    },
    pricing: {
      claude3Sonnet: { input: 0.003, output: 0.015 }, // per 1K tokens
      claude3Haiku: { input: 0.00025, output: 0.00125 }
    }
  },
  GOOGLE: {
    name: 'Google AI',
    icon: 'GOOGLE',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-veo-2'],
    keyFormat: 'AI...',
    signupUrl: 'https://aistudio.google.com/app/apikey',
    docsUrl: 'https://ai.google.dev/docs',
    freeTier: {
      available: true,
      description: '15 requests per minute free tier',
      limitations: 'Rate limited but completely free for light usage'
    },
    pricing: {
      gemini15Flash: { input: 0.000075, output: 0.0003 }, // per 1K tokens
      gemini15Pro: { input: 0.00125, output: 0.005 }
    }
  }
  ,
  COHERE: {
    name: 'Cohere',
    icon: 'COHERE',
    models: ['command-r', 'command-r7b'],
    keyFormat: 'cohere-... (Bearer)',
    signupUrl: 'https://dashboard.cohere.com/api-keys',
    docsUrl: 'https://docs.cohere.com/',
    freeTier: { available: true, description: 'Free tier available', limitations: 'Throughput limits apply' },
    pricing: {}
  },
  MISTRAL: {
    name: 'Mistral',
    icon: 'MISTRAL',
    models: ['mistral-large-latest', 'ministral-8b'],
    keyFormat: 'mistral-... (Bearer)',
    signupUrl: 'https://console.mistral.ai/api-keys/',
    docsUrl: 'https://docs.mistral.ai/api/',
    freeTier: { available: true, description: 'Free tier available', limitations: 'Throughput limits apply' },
    pricing: {}
  },
  PERPLEXITY: {
    name: 'Perplexity',
    icon: 'PERPLEXITY',
    models: ['sonar-small-online', 'sonar-large-online'],
    keyFormat: 'pplx-... (Bearer)',
    signupUrl: 'https://www.perplexity.ai/settings/api',
    docsUrl: 'https://docs.perplexity.ai/',
    freeTier: { available: false, description: 'Paid usage', limitations: 'Subject to rate limits' },
    pricing: {}
  },
  OLLAMA: {
    name: 'Local (Ollama)',
    icon: 'LOCAL',
    models: ['llama3', 'phi3', 'qwen2'],
    keyFormat: 'No key required',
    signupUrl: 'https://ollama.ai/',
    docsUrl: 'https://github.com/ollama/ollama',
    freeTier: { available: true, description: 'Runs locally', limitations: 'Requires local runtime' },
    pricing: {}
  }
};