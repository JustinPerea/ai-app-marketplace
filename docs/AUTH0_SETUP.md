# Auth0 Development Setup Guide

This guide will help you configure Auth0 for local development of the AI Marketplace platform.

## Current Status

✅ **Local Development Ready**: The platform currently uses a development bypass when Auth0 is not configured  
⚠️ **Auth0 Optional**: You can develop and test the platform without Auth0 setup  
🎯 **Production Ready**: Follow this guide to enable real authentication  

## Quick Start (Development Mode)

The platform will automatically use development bypass mode when:
- `NODE_ENV=development` 
- Auth0 environment variables contain placeholder values

**No setup required for basic development!**

## Full Auth0 Setup (Optional)

### Step 1: Create Auth0 Account

1. Go to [auth0.com](https://auth0.com) and create a free account
2. Create a new application:
   - **Application Type**: Regular Web Application
   - **Technology**: Next.js
   - **Name**: AI Marketplace Dev

### Step 2: Configure Application Settings

In your Auth0 application settings:

**Allowed Callback URLs:**
```
http://localhost:3000/api/auth/callback
```

**Allowed Logout URLs:**
```
http://localhost:3000
```

**Allowed Web Origins:**
```
http://localhost:3000
```

### Step 3: Update Environment Variables

Replace the placeholder values in `.env.local` with your Auth0 credentials:

```bash
# Auth0 Configuration - Replace with your values
AUTH0_SECRET="your-generated-32-character-secret"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://your-domain.auth0.com"
AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret"
AUTH0_DOMAIN="your-domain.auth0.com"
AUTH0_AUDIENCE="https://api.ai-marketplace.dev"
```

### Step 4: Generate AUTH0_SECRET

Generate a secure secret key:

```bash
openssl rand -hex 32
```

### Step 5: Test Authentication

1. Restart your development server
2. Navigate to `http://localhost:3000/api/auth/login`
3. Complete the Auth0 login flow
4. You should be redirected to `/dashboard`

## Development Features

### Authentication Bypass

When Auth0 is not configured, the platform creates a mock user:

```typescript
{
  id: 'dev-user-1',
  auth0Id: 'dev|development-user',
  email: 'developer@localhost',
  name: 'Development User',
  plan: 'PRO',
  roles: ['USER', 'DEVELOPER'],
  mfaVerified: true
}
```

### Navigation Integration

The navigation component automatically handles:
- Login/logout buttons
- User profile display
- Authentication state management

## API Protection

API routes can be protected using the middleware:

```typescript
import { withAuth } from '@/lib/auth/middleware';

export const GET = withAuth(async (request, context, user) => {
  // Authenticated API handler
  return NextResponse.json({ user });
});
```

## User Roles

The platform supports role-based access control:

- `USER`: Basic marketplace access
- `DEVELOPER`: Can publish applications
- `ADMIN`: Full platform administration
- `SECURITY_ADMIN`: Security management

## Database Integration

User data is automatically synced with the local PostgreSQL database:

- First login creates user record
- Subsequent logins update user information
- Auth0 metadata mapped to local user roles

## Troubleshooting

### "Auth0 not configured" error
- Check that all environment variables are set
- Ensure no values contain "placeholder" or "your-"
- Restart the development server

### Login redirect issues
- Verify callback URLs in Auth0 dashboard
- Check AUTH0_BASE_URL matches your local server

### Database connection errors
- Ensure PostgreSQL is running
- Check DATABASE_URL configuration
- Run `npm run db:push` to sync schema

## Production Deployment

For production deployment:

1. Update environment variables for production domain
2. Configure production Auth0 application
3. Set `NODE_ENV=production`
4. Disable development bypass

## Security Features

When Auth0 is properly configured:

- ✅ JWT token validation
- ✅ Session management
- ✅ MFA support (configurable)
- ✅ Role-based access control
- ✅ Secure cookie handling
- ✅ CSRF protection

## Next Steps

After Auth0 setup:

1. **Configure MFA**: Enable multi-factor authentication
2. **Custom Claims**: Add role and permission claims
3. **Social Logins**: Enable Google, GitHub, etc.
4. **User Management**: Set up user roles and permissions
5. **Production Deploy**: Move to production Auth0 tenant

## Support

- Auth0 Documentation: [auth0.com/docs](https://auth0.com/docs)
- Next.js Integration: [auth0.com/docs/quickstart/webapp/nextjs](https://auth0.com/docs/quickstart/webapp/nextjs)
- Platform Issues: Check `CLAUDE.md` for current development context