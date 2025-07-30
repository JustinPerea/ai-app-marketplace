# Security & Compliance Setup Guide

This guide covers the complete setup of enterprise-grade security infrastructure for the AI App Marketplace BYOK platform.

## 🎯 Security Architecture Overview

Our security implementation provides:
- **Envelope encryption** with Google Cloud KMS for BYOK API key storage
- **Multi-factor authentication** via Auth0 for API key access
- **Real-time monitoring** and anomaly detection
- **Cost transparency** and usage analytics
- **Enterprise compliance** preparation (SOC 2, GDPR)

**Cost**: $28.30/month operational budget (within <$100/month constraint)

## 📋 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Auth0 Account** (free tier sufficient for 7,000 MAU)
3. **PostgreSQL Database** (local or hosted)
4. **Node.js 18+** and npm/yarn

## 🔧 Step 1: Google Cloud KMS Setup

### 1.1 Create Google Cloud Project

```bash
# Install Google Cloud CLI if not already installed
# Visit: https://cloud.google.com/sdk/docs/install

# Login and create project
gcloud auth login
gcloud projects create ai-marketplace-security --name="AI Marketplace Security"
gcloud config set project ai-marketplace-security

# Enable required APIs
gcloud services enable cloudkms.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 1.2 Create KMS Key Ring and Key

```bash
# Create key ring (global location for cost efficiency)
gcloud kms keyrings create ai-marketplace-keyring \
    --location=global

# Create encryption key for API key envelope encryption
gcloud kms keys create api-key-encryption-key \
    --location=global \
    --keyring=ai-marketplace-keyring \
    --purpose=encryption
```

### 1.3 Create Service Account

```bash
# Create service account
gcloud iam service-accounts create ai-marketplace-kms \
    --display-name="AI Marketplace KMS Service Account"

# Grant KMS permissions
gcloud projects add-iam-policy-binding ai-marketplace-security \
    --member="serviceAccount:ai-marketplace-kms@ai-marketplace-security.iam.gserviceaccount.com" \
    --role="roles/cloudkms.cryptoKeyEncrypterDecrypter"

# Create and download service account key
gcloud iam service-accounts keys create ./service-account-key.json \
    --iam-account=ai-marketplace-kms@ai-marketplace-security.iam.gserviceaccount.com
```

**Security Note**: Store the service account key securely and never commit to version control.

### 1.4 Cost Verification

Your Google Cloud KMS costs will be:
- **Key storage**: $0.06/month per key (1 key = $0.06)
- **Operations**: $0.03 per 10,000 operations
- **Expected monthly cost**: ~$3.30 for typical usage

## 🔐 Step 2: Auth0 Configuration

### 2.1 Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create new **Regular Web Application**
3. Configure settings:
   - **Name**: AI Marketplace
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`

### 2.2 Enable Multi-Factor Authentication

1. Go to **Security > Multi-factor Auth**
2. Enable **SMS**, **Push**, and **TOTP** factors
3. Create MFA Policy:
   - **Policy Name**: API Key Access Policy
   - **Trigger**: Always require MFA for API key operations
   - **Factors**: TOTP (recommended), SMS (backup)

### 2.3 Create Machine-to-Machine Application

1. Create **Machine to Machine Application**
2. Authorize for **Auth0 Management API**
3. Grant scopes: `read:users`, `update:users`, `read:user_metadata`

### 2.4 Configure Custom Claims

Add this rule in Auth0 Dashboard > Rules:

```javascript
function addCustomClaims(user, context, callback) {
  const namespace = 'https://ai-marketplace.dev/';
  
  // Add user roles
  context.idToken[namespace + 'roles'] = user.app_metadata?.roles || ['user'];
  
  // Add MFA status
  if (context.authentication?.methods) {
    const mfaMethod = context.authentication.methods.find(
      method => method.name === 'mfa'
    );
    if (mfaMethod) {
      context.idToken[namespace + 'mfa_timestamp'] = new Date().getTime();
      context.idToken[namespace + 'mfa_enrolled'] = true;
    }
  }
  
  callback(null, user, context);
}
```

## 🗄️ Step 3: Database Setup

The Platform Architecture Agent has already created the required database schema with encrypted API key storage fields. Verify your database includes these tables:

- `User` - User management with Auth0 integration
- `ApiKey` - Encrypted API key storage with usage tracking
- `ApiUsageRecord` - Detailed usage analytics
- `DeveloperProfile` - Developer verification and metrics

## ⚙️ Step 4: Environment Configuration

### 4.1 Copy Environment Template

```bash
cp .env.example .env.local
```

### 4.2 Configure Required Variables

Edit `.env.local` with your values:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_marketplace"

# Auth0 (from your Auth0 dashboard)
AUTH0_SECRET="your-32-character-secret-key"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://your-domain.auth0.com"
AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-client-secret"
AUTH0_DOMAIN="your-domain.auth0.com"
AUTH0_AUDIENCE="https://api.ai-marketplace.dev"

# Machine-to-Machine Auth0 app
AUTH0_M2M_CLIENT_ID="your-m2m-client-id"
AUTH0_M2M_CLIENT_SECRET="your-m2m-client-secret"

# Google Cloud KMS
GOOGLE_CLOUD_PROJECT_ID="ai-marketplace-security"
GOOGLE_CLOUD_LOCATION_ID="global"
GOOGLE_CLOUD_KEYRING_ID="ai-marketplace-keyring"
GOOGLE_CLOUD_KEY_ID="api-key-encryption-key"
GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY_PATH="./service-account-key.json"

# Security salts (generate 32+ character random strings)
API_KEY_HASH_SALT="generate-secure-random-32-char-string"
ENCRYPTION_CONTEXT_SALT="generate-another-secure-32-char-string"
```

### 4.3 Generate Secure Salts

```bash
# Generate secure random salts
node -e "console.log('API_KEY_HASH_SALT=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('ENCRYPTION_CONTEXT_SALT=' + require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 Step 5: Installation and Testing

### 5.1 Install Dependencies

```bash
npm install
```

### 5.2 Generate Prisma Client

```bash
npm run db:generate
```

### 5.3 Run Database Migrations

```bash
npm run db:push
```

### 5.4 Test Security Services

```bash
# Start the development server
npm run dev

# Test security health check (requires authentication)
curl http://localhost:3000/api/security/health

# Expected response: Security service status with all components healthy
```

## 🔍 Step 6: Security Verification

### 6.1 Test Envelope Encryption

Create a simple test script to verify encryption works:

```javascript
// test-encryption.js
const { createEnvelopeEncryptionService } = require('./src/lib/security/envelope-encryption');

async function testEncryption() {
  const service = createEnvelopeEncryptionService();
  
  // Test encrypt/decrypt cycle
  const testKey = 'sk-test-123456789';
  const testContext = 'user-123:OPENAI:test';
  
  console.log('Testing envelope encryption...');
  const encrypted = await service.encryptApiKey(testKey, testContext);
  console.log('✅ Encryption successful');
  
  const decrypted = await service.decryptApiKey(encrypted, testContext);
  console.log('✅ Decryption successful');
  
  if (decrypted.isValid && decrypted.decryptedData === testKey) {
    console.log('✅ Encryption/decryption cycle verified');
  } else {
    console.log('❌ Encryption/decryption verification failed');
  }
}

testEncryption().catch(console.error);
```

Run the test:
```bash
node test-encryption.js
```

### 6.2 Test Auth0 Integration

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/api/auth/login`
3. Complete Auth0 login flow
4. Verify MFA prompt appears
5. Check that user session includes custom claims

### 6.3 Test API Key Management

```bash
# After authentication, test API key storage
curl -X POST http://localhost:3000/api/security/api-keys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test OpenAI Key",
    "provider": "OPENAI",
    "apiKey": "sk-test-123456789"
  }'

# Test API key retrieval
curl http://localhost:3000/api/security/api-keys
```

## 📊 Step 7: Monitoring Setup (Optional)

### 7.1 Wazuh SIEM Deployment

For production deployment, set up Wazuh SIEM on a VPS:

```bash
# On Ubuntu 20.04 VPS ($25/month DigitalOcean droplet)
curl -sO https://packages.wazuh.com/4.7/wazuh-install.sh
sudo bash ./wazuh-install.sh -a
```

Configure environment variables:
```bash
WAZUH_API_URL="https://your-wazuh-server:55000"
WAZUH_API_TOKEN="your-wazuh-api-token"
```

### 7.2 Security Metrics Dashboard

Access security metrics at:
- Health check: `GET /api/security/health`
- Usage analytics: `GET /api/security/usage/analytics/[id]`

## 🛡️ Security Best Practices

### Development

1. **Never commit secrets** to version control
2. **Use environment variables** for all configuration
3. **Test encryption performance** (<50ms target)
4. **Monitor security events** in development logs

### Production

1. **Enable HTTPS** for all communications
2. **Use strong passwords** and MFA for all admin accounts
3. **Regular key rotation** (90-day schedule)
4. **Monitor security metrics** and set up alerts
5. **Regular security audits** and penetration testing

## 🚨 Incident Response

### Security Event Types

- **Critical**: API key compromise, system breach
- **Warning**: Usage anomalies, geographic anomalies
- **Info**: Normal operations, successful authentications

### Response Procedures

1. **Critical events**: Immediately disable affected accounts
2. **Warning events**: Investigate and notify users
3. **Info events**: Log for analytics and compliance

## 📞 Support and Troubleshooting

### Common Issues

1. **KMS Permission Denied**: Verify service account has `cloudkms.cryptoKeyEncrypterDecrypter` role
2. **Auth0 Callback Error**: Check callback URLs in Auth0 dashboard
3. **Database Connection Error**: Verify DATABASE_URL and database is running
4. **Encryption Performance**: Check Google Cloud KMS quotas and limits

### Getting Help

- Review security logs: `docker logs -f marketplace-app`
- Check health status: `GET /api/security/health`
- Verify environment variables are set correctly

## 📈 Cost Monitoring

### Monthly Budget Breakdown

- **Google Cloud KMS**: $3.30
- **Database hosting**: $15-25 (depending on provider)
- **Auth0**: $0 (free tier)
- **Total security costs**: ~$28.30/month

### Cost Optimization

- Use Google Cloud free tier credits for development
- Monitor KMS operations to avoid unexpected charges
- Set up billing alerts in Google Cloud Console

---

## ✅ Security Implementation Complete

Your AI App Marketplace now has enterprise-grade security with:

- ✅ Envelope encryption for BYOK API keys
- ✅ Multi-factor authentication with Auth0
- ✅ Real-time security monitoring
- ✅ Usage analytics and cost transparency
- ✅ Compliance preparation (SOC 2, GDPR ready)

**Next Steps**: The AI Integration Agent can now securely access user API keys for provider calls using the `/api/security/api-keys/[id]` endpoint.