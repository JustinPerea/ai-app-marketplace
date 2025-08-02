# SDK Protection Phase 3 - Platform API Documentation

## Overview

The AI Marketplace Platform API provides secure, server-side access to ML routing and analytics capabilities while protecting the core intellectual property. This API is designed for use by authenticated SDK applications and implements a tiered access model with comprehensive rate limiting and usage tracking.

## Base URL

```
https://api.aimarketplace.com/v1
```

## Authentication

All Platform API endpoints require authentication using SDK app credentials:

```http
Authorization: Bearer app_xxx:sk_xxx
```

### Credential Format
- **App ID**: `app_` followed by UUID (e.g., `app_123e4567-e89b-12d3-a456-426614174000`)
- **Secret Key**: `sk_` followed by secure random string (e.g., `sk_abcd1234...`)

### Authentication Errors

| Status | Error | Description |
|--------|--------|-------------|
| 401 | `INVALID_CREDENTIALS` | Invalid or missing credentials |
| 401 | `APP_NOT_FOUND` | App ID not found |
| 403 | `APP_SUSPENDED` | App has been suspended |
| 429 | `RATE_LIMITED` | Rate limit exceeded |
| 429 | `QUOTA_EXCEEDED` | Monthly quota exceeded |

## Tier System

### Community Tier (Free)
- **Limits**: 1,000 requests/month, 10 requests/minute
- **Features**: Basic provider access only
- **ML Routing**: ❌ Not available
- **Analytics**: ❌ Not available

### Developer Tier ($49/month)
- **Limits**: 50,000 requests/month, 100 requests/minute
- **Features**: ML routing, analytics, caching
- **ML Routing**: ✅ Available
- **Analytics**: ✅ Available

### Professional Tier ($199/month)
- **Limits**: 500,000 requests/month, 500 requests/minute
- **Features**: All features including custom models
- **ML Routing**: ✅ Available
- **Analytics**: ✅ Available
- **Batch Routing**: ✅ Available

### Enterprise Tier (Custom)
- **Limits**: Unlimited requests, 1,000 requests/minute
- **Features**: All features plus priority support
- **Everything**: ✅ Available

## Rate Limiting

Rate limits are enforced per app and tier:

### Headers
All responses include rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1640995200
X-RateLimit-Period: minute
```

### Rate Limit Response
```json
{
  "error": "Rate Limit Exceeded",
  "message": "Maximum 100 requests per minute for Developer tier",
  "remainingRequests": 0,
  "rateLimitReset": "2024-01-01T00:00:00Z",
  "tier": "DEVELOPER"
}
```

---

## App Management

### Register New SDK App

Create a new SDK app and receive API credentials.

```http
POST /v1/apps/register
```

#### Request Body
```json
{
  "name": "My AI Application",
  "description": "An AI-powered productivity tool",
  "tier": "DEVELOPER"
}
```

#### Response
```json
{
  "success": true,
  "app": {
    "id": "app_123",
    "name": "My AI Application",
    "appId": "app_123e4567-e89b-12d3-a456-426614174000",
    "tier": "DEVELOPER",
    "status": "ACTIVE",
    "features": {
      "mlRouting": true,
      "analytics": true,
      "caching": true
    },
    "limits": {
      "requestsPerMonth": 50000,
      "requestsPerMinute": 100
    }
  },
  "credentials": {
    "appId": "app_123e4567-e89b-12d3-a456-426614174000",
    "secretKey": "sk_abcd1234efgh5678ijkl9012mnop3456",
    "authFormat": "Bearer app_123...:sk_abcd..."
  },
  "warning": "Store these credentials securely. The secret key will not be shown again."
}
```

### Get App Details

Retrieve detailed information about an SDK app.

```http
GET /v1/apps/{appId}
```

#### Response
```json
{
  "success": true,
  "app": {
    "id": "app_123",
    "name": "My AI Application",
    "tier": "DEVELOPER",
    "status": "ACTIVE",
    "features": {...},
    "usage": {
      "requestsThisPeriod": 1247,
      "currentMonthUsage": {
        "requestsCount": 1247,
        "mlRoutingCount": 892,
        "totalCost": 12.45
      }
    },
    "analytics": {
      "totalRequests": 1247,
      "successfulRequests": 1201,
      "failedRequests": 46,
      "avgResponseTime": 1423
    }
  }
}
```

### Rotate API Keys

Generate new secret key for an SDK app.

```http
POST /v1/apps/{appId}/keys
```

#### Response
```json
{
  "success": true,
  "message": "Secret key rotated successfully",
  "credentials": {
    "appId": "app_123e4567-e89b-12d3-a456-426614174000",
    "secretKey": "sk_new1234efgh5678ijkl9012mnop3456",
    "authFormat": "Bearer app_123...:sk_new1..."
  },
  "warning": "Update your applications with the new secret key. The old key is no longer valid."
}
```

---

## ML Routing

### Get ML Routing Decision

Get intelligent ML routing recommendation for a single request.

```http
POST /v1/ml/route
```

**Requires**: Developer tier or higher

#### Request Body
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user", 
      "content": "Explain quantum computing in simple terms."
    }
  ],
  "optimizeFor": "balanced",
  "constraints": {
    "maxCost": 0.05,
    "minQuality": 0.8,
    "maxResponseTime": 3000,
    "preferredProviders": ["OPENAI", "ANTHROPIC"],
    "excludeProviders": ["GOOGLE"]
  },
  "metadata": {
    "appVersion": "1.2.0",
    "requestContext": "user_query"
  }
}
```

#### Parameters

| Field | Type | Description |
|-------|------|-------------|
| `messages` | Array | Array of chat messages (required) |
| `optimizeFor` | String | `cost`, `speed`, `quality`, or `balanced` (default: `balanced`) |
| `constraints` | Object | Optional routing constraints |
| `metadata` | Object | Optional request metadata |

#### Response
```json
{
  "success": true,
  "data": {
    "requestId": "req_789abc123def456",
    "provider": "ANTHROPIC",
    "model": "claude-3-5-sonnet-20241022",
    "estimatedCost": 0.0234,
    "estimatedLatency": 1890,
    "confidence": 0.94,
    "reasoning": "Optimized for balanced performance - high quality model with reasonable cost",
    "alternatives": [
      {
        "provider": "OPENAI",
        "model": "gpt-4o-mini",
        "estimatedCost": 0.0189,
        "estimatedLatency": 2100,
        "reasoning": "Lower cost alternative with slightly higher latency"
      }
    ],
    "optimizationType": "balanced",
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "meta": {
    "tier": "DEVELOPER",
    "remainingRequests": 156,
    "processingTime": 234
  }
}
```

### Batch ML Routing

Process multiple ML routing requests with optimization.

```http
POST /v1/ml/route/batch
```

**Requires**: Professional tier or higher

#### Request Body
```json
{
  "requests": [
    {
      "messages": [...],
      "optimizeFor": "cost"
    },
    {
      "messages": [...],
      "optimizeFor": "speed"
    }
  ],
  "batchOptimization": {
    "optimizeFor": "balanced",
    "loadBalance": true,
    "priorityOrder": [0, 1]
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "batchId": "batch_456def789ghi012",
    "responses": [
      {
        "requestId": "req_001",
        "provider": "GOOGLE",
        "model": "gemini-1.5-flash",
        "estimatedCost": 0.0089,
        "estimatedLatency": 1200,
        "confidence": 0.87,
        "reasoning": "Cost-optimized selection",
        "optimizationType": "cost"
      },
      {
        "requestId": "req_002", 
        "provider": "OPENAI",
        "model": "gpt-4o-mini",
        "estimatedCost": 0.0156,
        "estimatedLatency": 980,
        "confidence": 0.92,
        "reasoning": "Speed-optimized selection",
        "optimizationType": "speed"
      }
    ],
    "batchMetrics": {
      "totalEstimatedCost": 0.0245,
      "avgEstimatedLatency": 1090,
      "providerDistribution": {
        "GOOGLE": 1,
        "OPENAI": 1
      },
      "processingTime": 456
    }
  }
}
```

---

## Analytics

### Track Actual Performance

Report actual performance data for ML routing improvement.

```http
POST /v1/analytics/track
```

**Requires**: Developer tier or higher

#### Request Body
```json
{
  "requestId": "req_789abc123def456",
  "actualProvider": "ANTHROPIC",
  "actualModel": "claude-3-5-sonnet-20241022",
  "actualCost": 0.0241,
  "actualLatency": 1923,
  "actualQuality": 0.96,
  "userSatisfaction": 5,
  "success": true,
  "metadata": {
    "appVersion": "1.2.0"
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "Analytics data recorded successfully",
  "data": {
    "requestId": "req_789abc123def456",
    "recorded": true,
    "predictionAccuracy": {
      "costAccuracy": 96.2,
      "latencyAccuracy": 91.7,
      "providerMatch": true,
      "modelMatch": true,
      "overallScore": 94.5
    },
    "contributedToLearning": true
  }
}
```

### Analytics Dashboard

Get comprehensive analytics and insights.

```http
GET /v1/analytics/dashboard?period=30d&includeInsights=true
```

**Requires**: Developer tier or higher

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | String | `24h`, `7d`, `30d`, `90d` (default: `30d`) |
| `includeInsights` | Boolean | Include ML insights (default: `true`) |
| `includeRecommendations` | Boolean | Include optimization recommendations (default: `true`) |

#### Response
```json
{
  "success": true,
  "data": {
    "overview": {
      "period": "30d",
      "totalRequests": 15632,
      "successfulRequests": 15089,
      "failedRequests": 543,
      "successRate": 97,
      "totalCost": 234.56,
      "avgResponseTime": 1456,
      "mlRoutingRequests": 12456,
      "mlRoutingSavings": 45.23
    },
    "usage": {
      "requestsOverTime": [...],
      "costOverTime": [...],
      "responseTimeOverTime": [...]
    },
    "mlRouting": {
      "totalDecisions": 12456,
      "avgConfidence": 0.89,
      "providerDistribution": [
        {"provider": "OPENAI", "count": 6234, "percentage": 50},
        {"provider": "ANTHROPIC", "count": 3712, "percentage": 30},
        {"provider": "GOOGLE", "count": 2510, "percentage": 20}
      ],
      "predictionAccuracy": {
        "cost": 87,
        "latency": 82,
        "provider": 91
      }
    },
    "insights": [
      {
        "type": "trend",
        "severity": "info",
        "title": "Usage Trending Up",
        "description": "Your API usage has increased by 23% in recent days.",
        "recommendation": "Consider monitoring your usage to avoid hitting rate limits."
      }
    ],
    "recommendations": [
      {
        "type": "optimization",
        "priority": "medium",
        "title": "Cost Optimization Opportunity",
        "description": "Your usage volume suggests potential for significant cost savings.",
        "action": "Experiment with different optimization strategies.",
        "estimatedSavings": "15-30%"
      }
    ]
  }
}
```

---

## Billing

### Get Usage Information

Retrieve detailed billing and usage information.

```http
GET /v1/billing/usage?period=current&includeProjections=true
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | String | `current`, `3months`, `6months`, `12months` |
| `includeProjections` | Boolean | Include usage projections |
| `includeBreakdown` | Boolean | Include detailed usage breakdown |

#### Response
```json
{
  "success": true,
  "data": {
    "app": {
      "id": "app_123",
      "name": "My AI Application",
      "tier": "DEVELOPER",
      "status": "ACTIVE"
    },
    "currentPeriod": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z",
      "usage": {
        "requestsCount": 15632,
        "mlRoutingCount": 12456,
        "analyticsRequests": 456,
        "totalCost": 234.56
      },
      "limits": {
        "requestsPerMonth": 50000,
        "requestsPerMinute": 100
      },
      "utilization": {
        "requests": 31,
        "cost": 48
      }
    },
    "projections": {
      "endOfMonth": {
        "projectedRequests": 23448,
        "projectedCost": 351.84,
        "confidence": 85
      }
    },
    "breakdown": {
      "byEventType": [
        {"eventType": "ml_route", "count": 12456, "totalCost": 187.23},
        {"eventType": "analytics", "count": 456, "totalCost": 0.00}
      ],
      "byProvider": [
        {"provider": "OPENAI", "count": 6234, "totalCost": 93.51},
        {"provider": "ANTHROPIC", "count": 3712, "totalCost": 55.68}
      ]
    }
  }
}
```

### Upgrade Tier

Process tier upgrade with billing integration.

```http
POST /v1/billing/upgrade
```

#### Request Body
```json
{
  "appId": "app_123",
  "targetTier": "PROFESSIONAL",
  "billingPeriod": "monthly",
  "paymentMethodId": "pm_1234567890",
  "confirmUpgrade": true
}
```

#### Response
```json
{
  "success": true,
  "message": "Tier upgraded successfully",
  "upgrade": {
    "appId": "app_123",
    "previousTier": "DEVELOPER",
    "newTier": "PROFESSIONAL",
    "features": {
      "mlRouting": true,
      "analytics": true,
      "caching": true,
      "customModels": true,
      "batchRouting": true
    },
    "limits": {
      "requestsPerMonth": 500000,
      "requestsPerMinute": 500
    },
    "billing": {
      "cost": 199.00,
      "period": "monthly",
      "nextBillingDate": "2024-02-01T00:00:00Z"
    },
    "effectiveImmediately": true
  }
}
```

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error description",
  "code": "ERROR_CODE",
  "details": {},
  "timestamp": "2024-01-01T12:00:00Z",
  "requestId": "req_error_123"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `AUTHENTICATION_FAILED` | 401 | Invalid or missing credentials |
| `FEATURE_NOT_AVAILABLE` | 403 | Feature not available in current tier |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `QUOTA_EXCEEDED` | 429 | Monthly quota exceeded |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `ML_ROUTING_FAILED` | 500 | ML routing service unavailable |

---

## SDK Integration Examples

### JavaScript/Node.js

```javascript
const API_BASE = 'https://api.aimarketplace.com/v1';
const AUTH_HEADER = 'Bearer app_123...:sk_abc...';

// Get ML routing decision
async function getMLRouting(messages) {
  const response = await fetch(`${API_BASE}/ml/route`, {
    method: 'POST',
    headers: {
      'Authorization': AUTH_HEADER,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages,
      optimizeFor: 'balanced'
    })
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message);
  }
  
  return result.data;
}

// Track actual performance
async function trackPerformance(requestId, actualData) {
  await fetch(`${API_BASE}/analytics/track`, {
    method: 'POST',
    headers: {
      'Authorization': AUTH_HEADER,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requestId,
      ...actualData
    })
  });
}
```

### Python

```python
import requests

API_BASE = 'https://api.aimarketplace.com/v1'
AUTH_HEADER = 'Bearer app_123...:sk_abc...'

class AIMarketplacePlatformAPI:
    def __init__(self, app_id, secret_key):
        self.auth = f'Bearer {app_id}:{secret_key}'
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': self.auth,
            'Content-Type': 'application/json'
        })
    
    def get_ml_routing(self, messages, optimize_for='balanced'):
        response = self.session.post(f'{API_BASE}/ml/route', json={
            'messages': messages,
            'optimizeFor': optimize_for
        })
        
        response.raise_for_status()
        result = response.json()
        
        if not result['success']:
            raise Exception(result['message'])
        
        return result['data']
    
    def track_performance(self, request_id, **actual_data):
        self.session.post(f'{API_BASE}/analytics/track', json={
            'requestId': request_id,
            **actual_data
        })
```

---

## Security Best Practices

### Credential Management
- Store secret keys securely (environment variables, key vaults)
- Rotate keys regularly using the rotation endpoint
- Never expose secret keys in client-side code
- Use HTTPS for all API requests

### Rate Limiting
- Implement exponential backoff for rate limit errors
- Monitor usage to avoid quota exhaustion
- Use batch endpoints for multiple requests when available

### Error Handling
- Implement proper error handling for all API calls
- Log errors for debugging but don't expose sensitive information
- Implement circuit breakers for service resilience

### Monitoring
- Track API usage and performance metrics
- Set up alerts for error rates and quota usage
- Use analytics tracking for ML routing improvement

---

## Changelog

### v1.0.0 (2024-01-01)
- Initial release of Platform API
- ML routing endpoints
- Analytics and billing integration
- Tier-based access control
- Comprehensive rate limiting

---

## Support

For API support and questions:
- **Email**: developers@aimarketplace.com
- **Documentation**: https://docs.aimarketplace.com
- **Status Page**: https://status.aimarketplace.com

For billing and account issues:
- **Email**: billing@aimarketplace.com
- **Dashboard**: https://aimarketplace.com/dashboard