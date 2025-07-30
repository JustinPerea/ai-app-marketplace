/**
 * OAuth2 Manager for Zero-Friction Provider Connection
 * 
 * Handles OAuth flows for Google, and guides users through API key setup
 * for other providers with clear upgrade benefits
 */

import { z } from 'zod';

// OAuth provider configuration
const OAuthProviderSchema = z.object({
  provider: z.enum(['google', 'openai', 'anthropic']),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  redirectUri: z.string(),
  scope: z.array(z.string()),
  dailyLimit: z.union([z.number(), z.literal('unlimited')]),
  authType: z.enum(['oauth2', 'api_key']),
  setupInstructions: z.string().optional()
});

export type OAuthProvider = z.infer<typeof OAuthProviderSchema>;

// User connection status
export interface UserConnection {
  userId: string;
  provider: string;
  connectionType: 'oauth2' | 'api_key';
  connected: boolean;
  dailyQuota?: number;
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  expiresAt?: Date;
  connectedAt: Date;
  lastUsed?: Date;
}

// Connection result
export interface ConnectionResult {
  success: boolean;
  provider: string;
  connectionType: 'oauth2' | 'api_key';
  quota?: number | 'unlimited';
  error?: string;
  authUrl?: string;
  setupInstructions?: string;
}

export class OAuthManager {
  private providers: Map<string, OAuthProvider> = new Map();
  private userConnections: Map<string, UserConnection[]> = new Map();

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize OAuth providers configuration
   */
  private initializeProviders() {
    const providerConfigs: OAuthProvider[] = [
      {
        provider: 'google',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
        scope: ['https://www.googleapis.com/auth/generative-language'],
        dailyLimit: 1500,
        authType: 'oauth2'
      },
      {
        provider: 'openai',
        redirectUri: '/setup?provider=openai',
        scope: [],
        dailyLimit: 'unlimited',
        authType: 'api_key',
        setupInstructions: `
1. Visit https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy your API key (starts with sk-)
4. Paste it in the field below
        `.trim()
      },
      {
        provider: 'anthropic',
        redirectUri: '/setup?provider=anthropic',
        scope: [],
        dailyLimit: 'unlimited',
        authType: 'api_key',
        setupInstructions: `
1. Visit https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Copy your API key (starts with sk-ant-)
4. Paste it in the field below
        `.trim()
      }
    ];

    providerConfigs.forEach(config => {
      this.providers.set(config.provider, config);
    });
  }

  /**
   * Start OAuth flow or provide API key setup instructions
   */
  async initiateConnection(userId: string, provider: string): Promise<ConnectionResult> {
    const providerConfig = this.providers.get(provider);
    if (!providerConfig) {
      return {
        success: false,
        provider,
        connectionType: 'oauth2',
        error: `Provider ${provider} not supported`
      };
    }

    if (providerConfig.authType === 'oauth2') {
      return this.initiateOAuth2Flow(userId, providerConfig);
    } else {
      return this.provideApiKeyInstructions(providerConfig);
    }
  }

  /**
   * Generate OAuth2 authorization URL
   */
  private async initiateOAuth2Flow(userId: string, config: OAuthProvider): Promise<ConnectionResult> {
    if (config.provider !== 'google' || !config.clientId) {
      return {
        success: false,
        provider: config.provider,
        connectionType: 'oauth2',
        error: 'OAuth2 configuration missing'
      };
    }

    try {
      // Generate state parameter for security
      const state = this.generateState(userId, config.provider);
      
      // Build authorization URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', config.clientId);
      authUrl.searchParams.set('redirect_uri', config.redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', config.scope.join(' '));
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');

      return {
        success: true,
        provider: config.provider,
        connectionType: 'oauth2',
        quota: config.dailyLimit,
        authUrl: authUrl.toString()
      };
    } catch (error) {
      return {
        success: false,
        provider: config.provider,
        connectionType: 'oauth2',
        error: error instanceof Error ? error.message : 'Failed to generate auth URL'
      };
    }
  }

  /**
   * Provide API key setup instructions
   */
  private provideApiKeyInstructions(config: OAuthProvider): ConnectionResult {
    return {
      success: true,
      provider: config.provider,
      connectionType: 'api_key',
      quota: config.dailyLimit,
      setupInstructions: config.setupInstructions
    };
  }

  /**
   * Handle OAuth2 callback and exchange code for tokens
   */
  async handleOAuth2Callback(
    code: string, 
    state: string
  ): Promise<{ success: boolean; userId?: string; provider?: string; error?: string }> {
    try {
      // Verify and decode state
      const stateData = this.verifyState(state);
      if (!stateData) {
        return { success: false, error: 'Invalid state parameter' };
      }

      const { userId, provider } = stateData;
      const config = this.providers.get(provider);
      
      if (!config || config.authType !== 'oauth2') {
        return { success: false, error: 'Invalid provider configuration' };
      }

      // Exchange code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(code, config);
      if (!tokenResponse.success) {
        return { success: false, error: tokenResponse.error };
      }

      // Store user connection
      this.storeUserConnection(userId, {
        userId,
        provider,
        connectionType: 'oauth2',
        connected: true,
        dailyQuota: typeof config.dailyLimit === 'number' ? config.dailyLimit : undefined,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
        expiresAt: tokenResponse.expiresAt,
        connectedAt: new Date()
      });

      return { success: true, userId, provider };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'OAuth callback failed' 
      };
    }
  }

  /**
   * Store API key connection
   */
  async storeApiKeyConnection(
    userId: string, 
    provider: string, 
    apiKey: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const config = this.providers.get(provider);
      if (!config || config.authType !== 'api_key') {
        return { success: false, error: 'Invalid provider for API key connection' };
      }

      // TODO: In production, encrypt the API key before storage
      this.storeUserConnection(userId, {
        userId,
        provider,
        connectionType: 'api_key',
        connected: true,
        apiKey: apiKey, // Should be encrypted in production
        connectedAt: new Date()
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to store API key' 
      };
    }
  }

  /**
   * Get user's connected providers
   */
  getUserConnections(userId: string): UserConnection[] {
    return this.userConnections.get(userId) || [];
  }

  /**
   * Check if user has any connected providers
   */
  hasConnectedProviders(userId: string): boolean {
    const connections = this.getUserConnections(userId);
    return connections.some(conn => conn.connected);
  }

  /**
   * Get available quota for user
   */
  getUserQuota(userId: string): { total: number | 'unlimited'; byProvider: Record<string, number | 'unlimited'> } {
    const connections = this.getUserConnections(userId);
    const byProvider: Record<string, number | 'unlimited'> = {};
    let hasUnlimited = false;

    connections.forEach(conn => {
      if (conn.connected) {
        const quota = conn.dailyQuota || 'unlimited';
        byProvider[conn.provider] = quota;
        if (quota === 'unlimited') {
          hasUnlimited = true;
        }
      }
    });

    return {
      total: hasUnlimited ? 'unlimited' : Object.values(byProvider).reduce((sum, quota) => 
        typeof quota === 'number' ? sum + quota : sum, 0),
      byProvider
    };
  }

  /**
   * Generate secure state parameter
   */
  private generateState(userId: string, provider: string): string {
    const data = { userId, provider, timestamp: Date.now() };
    // In production, this should be signed/encrypted
    return Buffer.from(JSON.stringify(data)).toString('base64url');
  }

  /**
   * Verify state parameter
   */
  private verifyState(state: string): { userId: string; provider: string } | null {
    try {
      const decoded = Buffer.from(state, 'base64url').toString();
      const data = JSON.parse(decoded);
      
      // Check if state is not too old (10 minutes max)
      if (Date.now() - data.timestamp > 10 * 60 * 1000) {
        return null;
      }

      return { userId: data.userId, provider: data.provider };
    } catch {
      return null;
    }
  }

  /**
   * Exchange authorization code for access tokens
   */
  private async exchangeCodeForTokens(
    code: string, 
    config: OAuthProvider
  ): Promise<{ 
    success: boolean; 
    accessToken?: string; 
    refreshToken?: string; 
    expiresAt?: Date;
    error?: string;
  }> {
    try {
      if (config.provider !== 'google' || !config.clientId || !config.clientSecret) {
        return { success: false, error: 'Missing OAuth configuration' };
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        return { success: false, error: `Token exchange failed: ${response.statusText}` };
      }

      const tokens = await response.json();
      
      return {
        success: true,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + (tokens.expires_in * 1000))
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Token exchange failed' 
      };
    }
  }

  /**
   * Store user connection data
   */
  private storeUserConnection(userId: string, connection: UserConnection) {
    const userConnections = this.userConnections.get(userId) || [];
    
    // Remove existing connection for same provider
    const filteredConnections = userConnections.filter(conn => conn.provider !== connection.provider);
    
    // Add new connection
    filteredConnections.push(connection);
    
    this.userConnections.set(userId, filteredConnections);
  }

  /**
   * Disconnect provider for user
   */
  async disconnectProvider(userId: string, provider: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userConnections = this.userConnections.get(userId) || [];
      const updatedConnections = userConnections.filter(conn => conn.provider !== provider);
      
      this.userConnections.set(userId, updatedConnections);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to disconnect provider' 
      };
    }
  }

  /**
   * Get connection benefits messaging
   */
  getConnectionBenefits(provider: string): {
    quota: string;
    benefits: string[];
    setupTime: string;
  } {
    const config = this.providers.get(provider);
    const quota = config?.dailyLimit === 'unlimited' ? 'Unlimited' : `${config?.dailyLimit || 0}`;
    
    const commonBenefits = [
      'Priority processing',
      'No sharing with others', 
      'Advanced orchestration features'
    ];

    switch (provider) {
      case 'google':
        return {
          quota: `${quota} requests/day`,
          benefits: ['60x more than basic tier', ...commonBenefits],
          setupTime: '30 seconds'
        };
      case 'openai':
        return {
          quota: 'Unlimited requests',
          benefits: ['Use your own quota', ...commonBenefits],
          setupTime: '2 minutes'
        };
      case 'anthropic':
        return {
          quota: 'Unlimited requests',
          benefits: ['Use your own quota', ...commonBenefits],
          setupTime: '2 minutes'
        };
      default:
        return {
          quota: 'Enhanced quota',
          benefits: commonBenefits,
          setupTime: '1-2 minutes'
        };
    }
  }
}

// Singleton instance
export const oauthManager = new OAuthManager();