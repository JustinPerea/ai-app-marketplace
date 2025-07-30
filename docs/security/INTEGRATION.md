# Security & Compliance Integration Guide

This guide shows other agents how to integrate with the Security & Compliance Agent's services.

## 🎯 For AI Integration Agent

### Secure API Key Retrieval

```typescript
import { Auth0SecurityService, createApiKeyManager } from '@/lib/security';
import { PrismaClient } from '@prisma/client';

// Get user's API key for provider calls
async function getApiKeyForProvider(
  userId: string,
  provider: 'OPENAI' | 'ANTHROPIC' | 'GOOGLE',
  request: NextRequest
) {
  const prisma = new PrismaClient();
  const apiKeyManager = createApiKeyManager(prisma);
  
  // Get security context
  const securityContext = await Auth0SecurityService.getSecurityContext(request);
  if (!securityContext || securityContext.userId !== userId) {
    throw new Error('Unauthorized access');
  }
  
  // Enforce MFA for API key access
  const accessCheck = await Auth0SecurityService.enforceApiKeyAccess(securityContext);
  if (!accessCheck.allowed) {
    throw new Error(`Access denied: ${accessCheck.reason}`);
  }
  
  // Find user's key for this provider
  const userKeys = await apiKeyManager.listApiKeys(userId);
  const providerKey = userKeys.find(key => key.provider === provider && key.isActive);
  
  if (!providerKey) {
    throw new Error(`No active ${provider} API key found`);
  }
  
  // Retrieve decrypted key
  const keyWithSecret = await apiKeyManager.retrieveApiKey({
    userId,
    apiKeyId: providerKey.id,
  });
  
  if (!keyWithSecret?.isValid) {
    throw new Error('Failed to decrypt API key');
  }
  
  return keyWithSecret.decryptedKey;
}

// Track usage after API call
async function trackApiUsage(
  userId: string,
  apiKeyId: string,
  usage: {
    appId?: string;
    endpoint: string;
    tokensUsed: number;
    cost: number;
    model?: string;
    requestId?: string;
  }
) {
  const prisma = new PrismaClient();
  const apiKeyManager = createApiKeyManager(prisma);
  
  await apiKeyManager.trackApiKeyUsage({
    apiKeyId,
    appId: usage.appId,
    endpoint: usage.endpoint,
    tokensUsed: usage.tokensUsed,
    cost: usage.cost,
    requestId: usage.requestId,
    userAgent: 'AI-Integration-Agent/1.0',
    ipAddress: 'internal',
  });
}
```

### Example OpenAI Integration

```typescript
import OpenAI from 'openai';

async function makeSecureOpenAICall(
  userId: string,
  prompt: string,
  appId: string,
  request: NextRequest
) {
  // Get user's OpenAI key securely
  const apiKey = await getApiKeyForProvider(userId, 'OPENAI', request);
  
  // Create OpenAI client
  const openai = new OpenAI({ apiKey });
  
  // Make API call
  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });
  
  // Calculate usage and cost
  const tokensUsed = response.usage?.total_tokens || 0;
  const cost = (tokensUsed / 1000) * 0.03; // GPT-4 pricing
  
  // Track usage
  await trackApiUsage(userId, apiKeyId, {
    appId,
    endpoint: 'chat.completions.create',
    tokensUsed,
    cost,
    model: 'gpt-4',
    requestId: response.id,
  });
  
  return response;
}
```

## 🎨 For Frontend Agent

### Security Status Components

```typescript
import { useEffect, useState } from 'react';

interface SecurityStatus {
  hasApiKeys: boolean;
  mfaEnabled: boolean;
  lastKeyUsed?: Date;
  monthlySpend: number;
  securityScore: number;
}

function useSecurityStatus(userId: string) {
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  
  useEffect(() => {
    fetch('/api/security/status')
      .then(res => res.json())
      .then(data => setStatus(data.status));
  }, [userId]);
  
  return status;
}

// Security Dashboard Component
function SecurityDashboard() {
  const status = useSecurityStatus();
  
  if (!status) return <div>Loading security status...</div>;
  
  return (
    <div className="security-dashboard">
      <div className="security-score">
        Security Score: {status.securityScore}/100
      </div>
      
      {!status.mfaEnabled && (
        <div className="security-warning">
          ⚠️ Enable MFA to access API keys
          <button onClick={() => window.location.href = '/api/auth/mfa/setup'}>
            Setup MFA
          </button>
        </div>
      )}
      
      <div className="monthly-spend">
        This month: ${status.monthlySpend.toFixed(2)}
      </div>
    </div>
  );
}
```

### API Key Management UI

```typescript
import { useState } from 'react';

function ApiKeyManager() {
  const [keys, setKeys] = useState([]);
  const [newKey, setNewKey] = useState({ name: '', provider: '', key: '' });
  
  const addApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('/api/security/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newKey),
    });
    
    if (response.ok) {
      // Refresh keys list
      loadApiKeys();
      setNewKey({ name: '', provider: '', key: '' });
    } else {
      const error = await response.json();
      alert(`Error: ${error.error}`);
    }
  };
  
  return (
    <div className="api-key-manager">
      <form onSubmit={addApiKey}>
        <input
          type="text"
          placeholder="Key name"
          value={newKey.name}
          onChange={(e) => setNewKey({...newKey, name: e.target.value})}
        />
        <select
          value={newKey.provider}
          onChange={(e) => setNewKey({...newKey, provider: e.target.value})}
        >
          <option value="">Select Provider</option>
          <option value="OPENAI">OpenAI</option>
          <option value="ANTHROPIC">Anthropic</option>
          <option value="GOOGLE">Google</option>
        </select>
        <input
          type="password"
          placeholder="API Key"
          value={newKey.key}
          onChange={(e) => setNewKey({...newKey, key: e.target.value})}
        />
        <button type="submit">Add Key</button>
      </form>
      
      <div className="keys-list">
        {keys.map(key => (
          <div key={key.id} className="key-item">
            <span>{key.name} - {key.provider}</span>
            <span>{key.keyPreview}</span>
            <span>${key.totalCost}</span>
            <button onClick={() => deleteKey(key.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🏗️ For Platform Architecture Agent

### Secure API Endpoints

```typescript
import { createSecurityMiddleware, SecurityLevel, UserRole } from '@/lib/security';

// Protect admin endpoints
export const adminHandler = createSecurityMiddleware({
  securityLevel: SecurityLevel.HIGH,
  requiredRoles: [UserRole.ADMIN],
  requireMFA: true,
})(async (req, res, securityContext) => {
  // Admin logic here
  // securityContext contains validated user info
});

// Protect user data endpoints
export const userHandler = createSecurityMiddleware({
  securityLevel: SecurityLevel.MEDIUM,
  requireMFA: true,
})(async (req, res, securityContext) => {
  // User logic here
  // MFA is enforced automatically
});
```

### Database Integration

```typescript
import { PrismaClient } from '@prisma/client';
import { logSecurityEvent, SecurityEventType, SecuritySeverity } from '@/lib/security';

async function createMarketplaceApp(appData: any, userId: string) {
  const prisma = new PrismaClient();
  
  try {
    const app = await prisma.marketplaceApp.create({
      data: { ...appData, developerId: userId },
    });
    
    // Log security event
    await logSecurityEvent(
      SecurityEventType.API_KEY_ACCESS,
      SecuritySeverity.INFO,
      'Marketplace app created',
      { userId, appId: app.id }
    );
    
    return app;
    
  } catch (error) {
    // Log security error
    await logSecurityEvent(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      SecuritySeverity.WARNING,
      'Failed to create marketplace app',
      { userId, error: error.message }
    );
    
    throw error;
  }
}
```

## 👩‍💻 For Developer Ecosystem Agent

### SDK Security Integration

```typescript
// For the marketplace SDK
class SecureMarketplaceSDK {
  private apiKey: string | null = null;
  private userId: string;
  
  constructor(userId: string) {
    this.userId = userId;
  }
  
  // Automatically handle secure key retrieval
  private async getApiKey(provider: string): Promise<string> {
    if (!this.apiKey) {
      const response = await fetch(`/api/security/api-keys/provider/${provider}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(`No ${provider} API key available. Please add one in settings.`);
      }
      
      this.apiKey = data.apiKey.decryptedKey;
    }
    
    return this.apiKey;
  }
  
  // Example AI provider call
  async callOpenAI(prompt: string): Promise<any> {
    const apiKey = await this.getApiKey('OPENAI');
    
    // Make secure API call with usage tracking
    const response = await fetch('/api/ai/openai/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, userId: this.userId }),
    });
    
    return response.json();
  }
}
```

## 🔍 Security Monitoring Integration

### Event Logging

```typescript
import { logSecurityEvent, SecurityEventType, SecuritySeverity } from '@/lib/security';

// Log important user actions
async function logUserAction(action: string, userId: string, metadata?: any) {
  await logSecurityEvent(
    SecurityEventType.API_KEY_ACCESS,
    SecuritySeverity.INFO,
    action,
    { userId, ...metadata }
  );
}

// Example usage
await logUserAction('User downloaded app', userId, { appId: 'app_123' });
await logUserAction('User upgraded plan', userId, { newPlan: 'PRO' });
```

### Health Monitoring

```typescript
import { performSecurityHealthCheck } from '@/lib/security';

// Add to your monitoring dashboard
async function getSystemHealth() {
  const securityHealth = await performSecurityHealthCheck();
  
  return {
    security: securityHealth,
    database: await checkDatabaseHealth(),
    // ... other health checks
  };
}
```

## 🔐 Security Best Practices for Integration

### 1. Always Validate User Context

```typescript
// ❌ Don't do this
async function getUserData(userId: string) {
  return await db.user.findUnique({ where: { id: userId } });
}

// ✅ Do this
async function getUserData(request: NextRequest, userId: string) {
  const securityContext = await Auth0SecurityService.getSecurityContext(request);
  
  if (!securityContext || securityContext.userId !== userId) {
    throw new Error('Unauthorized access');
  }
  
  return await db.user.findUnique({ where: { id: userId } });
}
```

### 2. Track All API Key Usage

```typescript
// ❌ Don't make provider calls without tracking
const response = await openai.chat.completions.create({ ... });

// ✅ Always track usage
const response = await openai.chat.completions.create({ ... });
await trackApiUsage(userId, apiKeyId, {
  endpoint: 'chat.completions',
  tokensUsed: response.usage.total_tokens,
  cost: calculateCost(response.usage.total_tokens),
});
```

### 3. Sanitize Error Messages

```typescript
import { SecurityUtils } from '@/lib/security';

try {
  // API call
} catch (error) {
  // ❌ Don't expose raw errors
  console.error(error.message);
  
  // ✅ Sanitize first
  console.error(SecurityUtils.sanitizeErrorMessage(error));
}
```

## 📞 Support and Questions

For integration support:
1. Check the security health endpoint: `GET /api/security/health`
2. Review security logs for your user ID
3. Ensure MFA is properly configured in Auth0
4. Verify environment variables are set correctly

The Security & Compliance Agent provides the foundation for secure, compliant BYOK operations across the entire marketplace platform.