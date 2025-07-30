# Cosmara AI Marketplace - Vercel Deployment Guide

## Prerequisites

1. **Node.js Version**: Ensure you're using Node.js 18.20.0 (not 22.x due to compatibility issues)
   ```bash
   nvm use 18.20.0
   ```

2. **Vercel Account**: Create a free account at [vercel.com](https://vercel.com)

3. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```

## Deployment Steps

### 1. Login to Vercel
```bash
vercel login
```
Choose your preferred login method (GitHub recommended).

### 2. Deploy the Project
```bash
vercel --prod
```

Follow the prompts:
- **Set up and deploy**: Yes
- **Which scope**: Choose your personal account or team
- **Link to existing project**: No (first deployment)
- **Project name**: `cosmara-ai-marketplace` (or your preferred name)
- **Directory**: `.` (current directory)
- **Override settings**: No (use defaults)

### 3. Environment Variables Setup

After deployment, configure production environment variables in the Vercel dashboard:

1. Go to your project on [vercel.com](https://vercel.com)
2. Click **Settings** > **Environment Variables**
3. Add the following variables (see `.env.production.example`):

#### Required Variables:
- `AUTH0_SECRET` - Generate a 32+ character secret
- `AUTH0_BASE_URL` - Your Vercel domain (e.g., `https://your-app.vercel.app`)
- `NEXTAUTH_SECRET` - Generate a 32+ character secret
- `ENCRYPTION_KEY` - Generate a 32-character encryption key

#### Optional Variables (for full functionality):
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH0_CLIENT_ID` - Auth0 application client ID
- `AUTH0_CLIENT_SECRET` - Auth0 application client secret
- `AUTH0_ISSUER_BASE_URL` - Auth0 domain
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

### 4. Redeploy with Environment Variables
```bash
vercel --prod
```

## Configuration Files

- `vercel.json` - Vercel-specific configuration
- `.vercelignore` - Files to exclude from deployment
- `.env.production.example` - Production environment variables template

## Production Optimizations

The deployment includes:
- **Node.js 18.x** runtime for compatibility
- **30-second timeout** for API functions
- **Clean URLs** enabled
- **Trailing slash** disabled
- **US East region** for optimal performance

## Post-Deployment Checklist

1. ✅ Verify the application loads correctly
2. ✅ Check that the Cosmara branding displays properly
3. ✅ Test Deep Space background gradient
4. ✅ Verify API endpoints respond correctly
5. ✅ Configure custom domain (optional)

## Troubleshooting

### Build Failures
- Ensure Node.js 18.20.0 is specified in `vercel.json`
- Check that all dependencies are in `package.json`

### Runtime Errors
- Verify all environment variables are set in Vercel dashboard
- Check function logs in Vercel dashboard under **Functions** tab

### Performance Issues
- Monitor usage in Vercel dashboard
- Consider upgrading to Pro plan for better performance

## Custom Domain Setup (Optional)

1. Go to project **Settings** > **Domains**
2. Add your custom domain
3. Configure DNS according to Vercel instructions
4. Update `AUTH0_BASE_URL` and `NEXTAUTH_URL` to use custom domain

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)