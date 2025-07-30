# Vercel Environment Variables Configuration

*Copy these environment variables to your Vercel project settings*

## Required for Basic Functionality

```
# Next.js Configuration
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here

# Auth0 Configuration (Production)
AUTH0_SECRET=e5adc82b19056f828e51ba38d22bda0cd5c01faa602d2bebbbe3fad2a8bb22f2
AUTH0_BASE_URL=https://your-app-name.vercel.app
AUTH0_ISSUER_BASE_URL=https://dev-ai-marketplace.us.auth0.com
AUTH0_CLIENT_ID=development-client-id-placeholder
AUTH0_CLIENT_SECRET=development-client-secret-placeholder
AUTH0_DOMAIN=dev-ai-marketplace.us.auth0.com
AUTH0_AUDIENCE=https://api.ai-marketplace.dev

# Encryption for API keys (Simple fallback for now)
ENCRYPTION_KEY=12bfa0fdaca7333963ade1ef53269e1ea879a8ff118ea99bbc2033f700f40c05
```

## Optional (Can be added later)

```
# Database (for future database integration)
DATABASE_URL=postgresql://username:password@host:port/database

# Stripe (for billing)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Google Cloud KMS (for enterprise encryption)
GOOGLE_CLOUD_PROJECT_ID=cosmara-467519
GOOGLE_CLOUD_LOCATION_ID=global
GOOGLE_CLOUD_KEYRING_ID=ai-marketplace-keyring
GOOGLE_CLOUD_KEY_ID=api-key-encryption-key
# Note: Service account key will need to be configured differently for production

# External services (for admin features)
OPENAI_API_KEY=sk-your-openai-key-for-admin-features
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

## Important Notes

1. **Auth0 URLs**: Update `AUTH0_BASE_URL` and `NEXTAUTH_URL` to your actual Vercel app URL
2. **Database**: Currently using localStorage, database is optional for initial deployment
3. **Google Cloud**: Service account key path won't work in Vercel (needs different setup)
4. **Secrets**: Generate new secrets for production using: `openssl rand -hex 32`