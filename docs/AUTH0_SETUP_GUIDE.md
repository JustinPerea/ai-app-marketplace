# Auth0 Setup Guide for AI Marketplace Platform

This guide walks you through setting up Auth0 with Google social login for the AI marketplace platform.

## Current Status

✅ **Demo Login Working**: The existing demo functionality is preserved and working  
✅ **Auth0 Infrastructure Ready**: All Auth0 code is implemented but disabled during development  
⏸️ **Waiting for Configuration**: Auth0 will be enabled once proper credentials are configured  

## What's Already Implemented

### 1. Auth0 Configuration (src/lib/auth/auth0-config.ts)
- Environment variable validation
- Auth0 SDK integration setup
- Development fallback mechanisms
- Google OAuth configuration

### 2. Auth0 API Routes (src/app/api/auth/[auth0]/route.ts)
- Login/logout handlers
- OAuth callback processing
- User profile endpoints
- Google social login integration

### 3. Login Page Integration (src/app/auth/login/page.tsx)
- Google login button (hidden until Auth0 is configured)
- Preserves existing demo functionality
- Auto-redirect for authenticated users
- Error handling for Auth0 setup issues

### 4. Auth0 Provider Setup (src/components/auth/auth0-provider.tsx)
- UserProvider wrapper component
- Client-side hooks integration
- Session management

### 5. Middleware Integration (src/lib/auth/middleware.ts)
- Dual auth system support (Auth0 + simple auth)
- Database user sync (ready for activation)
- Role-based access control
- MFA verification support

## Setting Up Auth0

### Step 1: Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new "Single Page Application"
3. Configure the following settings:

**Application URIs:**
```
Allowed Callback URLs: http://localhost:3000/api/auth/callback
Allowed Logout URLs: http://localhost:3000/auth/login
Allowed Web Origins: http://localhost:3000
```

### Step 2: Set up Google Social Connection

1. In Auth0 Dashboard, go to Authentication > Social
2. Create a new Google connection
3. Configure with your Google OAuth credentials:
   - Client ID from Google Cloud Console
   - Client Secret from Google Cloud Console

### Step 3: Update Environment Variables

Replace the placeholder values in `.env.local`:

```bash
# Auth0 Configuration - Replace with your actual values
AUTH0_SECRET="your-32-character-secret-here"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://YOUR_DOMAIN.auth0.com"
AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret"
AUTH0_DOMAIN="YOUR_DOMAIN.auth0.com"
AUTH0_AUDIENCE="https://api.ai-marketplace.dev"
```

**To generate a secure secret:**
```bash
openssl rand -hex 32
```

### Step 4: Enable Auth0 Integration

Once your environment variables are configured:

1. **Enable Auth0 Detection** - Update `src/lib/auth/auth0-config.ts`:
   ```typescript
   export const canUseAuth0 = () => {
     return isAuth0Configured() && typeof window !== 'undefined';
   };
   ```

2. **Enable Auth0Provider** - Update `src/app/layout.tsx`:
   ```typescript
   import { Auth0Provider } from "@/components/auth/auth0-provider";
   
   // In the return statement:
   <Auth0Provider>
     <AuthProvider>
       {children}
     </AuthProvider>
   </Auth0Provider>
   ```

3. **Enable Database Integration** - Update `src/lib/auth/middleware.ts`:
   - Uncomment the Prisma import
   - Enable database operations in `getOrCreateUser`
   - Disable mock user creation

### Step 5: Test the Integration

1. **Demo Login (should always work):**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"demo@example.com","password":"demo123"}'
   ```

2. **Google Login:**
   - Visit `http://localhost:3000/auth/login`
   - Click "Continue with Google" button
   - Complete OAuth flow
   - Should redirect to dashboard

3. **Auth0 API Endpoints:**
   ```bash
   # Check user profile
   curl http://localhost:3000/api/auth/me
   
   # Logout
   curl http://localhost:3000/api/auth/logout
   ```

## How the Integration Works

### Dual Authentication System

The platform supports both simple demo auth and Auth0 simultaneously:

1. **Demo Auth**: Always available for development and testing
2. **Auth0**: Enabled when properly configured, provides social login

### User Flow

1. **Login Page**: Shows both demo users and Google login (if configured)
2. **Authentication**: Users can choose either demo or Google OAuth
3. **Session Management**: Both auth types create compatible user sessions
4. **API Access**: All existing API key management works with both auth types

### Database Integration

When Auth0 is enabled:
- Auth0 users are automatically created/updated in the User table
- Existing API key management works seamlessly
- User preferences and data are preserved

## Troubleshooting

### Common Issues

1. **"Module not found" errors:**
   - Check Auth0 package installation: `npm list @auth0/nextjs-auth0`
   - Verify import paths are correct

2. **"Cannot connect to server" errors:**
   - Check if Next.js development server is running
   - Verify port 3000 is not blocked

3. **Auth0 callback errors:**
   - Verify callback URLs in Auth0 dashboard match exactly
   - Check Auth0 domain and client ID are correct

4. **Google login not appearing:**
   - Verify `canUseAuth0()` returns true
   - Check environment variables are set
   - Ensure Google connection is enabled in Auth0

### Development Tips

1. **Test with Demo Users First**: Always verify demo login works before configuring Auth0
2. **Environment Variables**: Use different Auth0 applications for development/production
3. **Database**: Auth0 integration requires database connection for user management
4. **Logs**: Check browser console and server logs for detailed error messages

## Security Considerations

### Environment Variables
- Use strong, unique secrets (32+ characters)
- Different credentials for dev/staging/production
- Never commit real credentials to version control

### Auth0 Configuration
- Enable MFA for admin users
- Configure proper logout URLs
- Use HTTPS in production
- Set up proper CORS origins

### Database
- Auth0 users sync to local database
- API keys remain encrypted
- User roles and permissions enforced

## Next Steps After Setup

1. **Production Deployment**: Configure production Auth0 application
2. **User Management**: Set up Auth0 user roles and permissions
3. **Analytics**: Enable Auth0 analytics and monitoring
4. **Advanced Features**: Implement MFA, custom claims, etc.

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Verify environment variables are correct
3. Test demo authentication first
4. Check Auth0 dashboard logs for OAuth errors
5. Review browser console for client-side errors

The dual authentication system ensures you can always fall back to demo users if Auth0 configuration needs debugging.