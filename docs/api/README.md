# AI App Marketplace - API Documentation

This directory contains the API documentation for the AI App Marketplace platform.

## API Overview

The marketplace platform provides RESTful APIs for:
- User authentication and profile management
- Marketplace app catalog and discovery
- Secure API key management with BYOK support
- Developer app submission and management
- Usage tracking and analytics

## Authentication

All API endpoints (except public marketplace browsing) require authentication via Auth0. Critical operations like API key management require Multi-Factor Authentication (MFA).

### Authentication Headers
```
Authorization: Bearer <auth0_token>
```

## Base URLs

- **Development**: `http://localhost:3000/api`
- **Production**: `https://marketplace.ai-apps.dev/api`

## API Endpoints

### Public APIs
- `GET /marketplace/apps` - Browse marketplace apps
- `GET /marketplace/apps/{id}` - Get app details
- `GET /marketplace/apps/{id}/reviews` - Get app reviews

### User Management
- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update user profile
- `GET /users/subscriptions` - Get user's app subscriptions
- `POST /users/subscriptions` - Subscribe to an app
- `PATCH /users/subscriptions/{id}` - Update subscription
- `DELETE /users/subscriptions/{id}` - Cancel subscription

### Security & API Keys (MFA Required)
- `GET /security/api-keys` - List user's API keys
- `POST /security/api-keys` - Store new API key
- `GET /security/api-keys/{id}` - Retrieve API key for usage
- `PATCH /security/api-keys/{id}` - Update API key metadata
- `DELETE /security/api-keys/{id}` - Deactivate API key

### Developer APIs
- `GET /developers/profile` - Get developer profile
- `POST /developers/profile` - Create developer profile
- `PATCH /developers/profile` - Update developer profile
- `GET /developers/apps` - List developer's apps
- `POST /developers/apps` - Create new app
- `GET /developers/apps/{id}` - Get app details
- `PATCH /developers/apps/{id}` - Update app
- `DELETE /developers/apps/{id}` - Archive app
- `POST /developers/apps/{id}/submit` - Submit app for review

### Marketplace Management
- `POST /marketplace/apps/{id}/install` - Install/subscribe to app
- `POST /marketplace/apps/{id}/reviews` - Submit app review

## Error Responses

All APIs return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (MFA required, insufficient permissions)
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Security Features

### BYOK (Bring Your Own Key) Support
- All user API keys are encrypted using envelope encryption
- Keys are stored with Google Cloud KMS
- MFA required for all API key operations
- Usage tracking and anomaly detection

### Authentication Levels
- **LOW**: Basic authentication
- **MEDIUM**: MFA required (within 15 minutes)
- **HIGH**: Recent MFA required + additional verification
- **CRITICAL**: Admin privileges + MFA

### Rate Limiting
- Default: 100 requests per 15-minute window
- Higher limits available for verified developers
- Automatic throttling under high load

## Integration Points

### Security Agent Integration
- Encrypted API key storage
- Usage tracking and monitoring
- Security event logging

### Developer Ecosystem Integration
- App submission workflow
- Developer analytics
- Revenue tracking (for paid apps)

### AI Integration Agent (Future)
- Provider routing
- Usage analytics
- Cost optimization

## Development

### Local Development
1. Set up environment variables (see `.env.example`)
2. Run database migrations: `npm run db:migrate`
3. Start development server: `npm run dev`
4. API available at: `http://localhost:3000/api`

### Testing APIs
Use the provided Postman collection or test with curl:

```bash
# Get marketplace apps
curl -X GET "http://localhost:3000/api/marketplace/apps"

# Get user profile (requires auth)
curl -X GET "http://localhost:3000/api/users/profile" \
  -H "Authorization: Bearer $AUTH0_TOKEN"
```

## Support

For API support and questions:
- Create an issue in the project repository
- Contact the Platform Architecture Agent team
- Check the error reference documentation

---

**Status**: Week 1 Foundation Complete  
**Last Updated**: July 24, 2025  
**Version**: 1.0.0