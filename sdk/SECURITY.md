# Security Policy

## Supported Versions

We actively support and provide security updates for the following versions:

| Version | Supported          | Node.js Requirement | Security Features |
| ------- | ------------------ | -------------------- | ----------------- |
| 1.x.x   | :white_check_mark: | Node.js 18+         | Full 2025 security features |
| < 1.0   | :x:                | N/A                  | Not recommended |

## Security Features

### 2025 Security Standards

This package is built with cutting-edge 2025 security standards:

- ✅ **OIDC Trusted Publishing**: Published without long-lived npm tokens
- ✅ **Automatic Provenance**: Cryptographic proof of package build process
- ✅ **Sigstore Signing**: Package integrity verified via public good infrastructure
- ✅ **Zero Dependencies**: Minimal attack surface with no external dependencies
- ✅ **npm CLI v11+ Features**: Latest security verification capabilities

### Package Integrity Verification

Verify the integrity and provenance of this package:

```bash
# Verify package signatures (requires npm CLI 11.5.1+)
npm audit signatures

# Check for known vulnerabilities
npm audit

# Verify provenance attestations
npm ls --json | jq '.dependencies'
```

### Supply Chain Security

- **Zero External Dependencies**: This package has no external dependencies, eliminating supply chain attack vectors
- **Automated Security Scanning**: All releases undergo automated security scanning
- **Provenance Attestations**: Each release includes cryptographic proof of build origin
- **Pinned GitHub Actions**: All CI/CD actions are pinned to specific SHA hashes

## Reporting a Vulnerability

### Quick Report

For **critical security vulnerabilities**, please report immediately:

- **Email**: [security@cosmara.ai](mailto:security@cosmara.ai) (if available)
- **GitHub Security Advisory**: [Create a private security advisory](https://github.com/JustinPerea/cosmara-ai-sdk/security/advisories/new)
- **Emergency Contact**: Create a GitHub issue with title "URGENT: Security Issue" (for critical issues only)

### Detailed Reporting Process

1. **Initial Contact** (within 24 hours)
   - Use GitHub Security Advisory for coordinated disclosure
   - Include vulnerability description, impact assessment, and reproduction steps
   - Provide your contact information for follow-up

2. **Assessment Timeline**
   - **24 hours**: Initial acknowledgment
   - **72 hours**: Preliminary assessment and severity classification
   - **7 days**: Detailed security analysis and fix timeline

3. **Severity Classification**
   - **Critical**: Immediate security risk, potential for widespread exploitation
   - **High**: Significant security impact, limited exploitation scenarios  
   - **Medium**: Moderate security impact, requires specific conditions
   - **Low**: Minor security concern, limited impact

### Vulnerability Response

| Severity | Response Time | Fix Timeline | Disclosure Timeline |
|----------|---------------|--------------|-------------------|
| Critical | 24 hours      | 3-7 days     | 14 days after fix |
| High     | 72 hours      | 7-14 days    | 30 days after fix |
| Medium   | 1 week        | 2-4 weeks    | 60 days after fix |
| Low      | 2 weeks       | Next release | 90 days after fix |

## Security Best Practices for Users

### Installation Security

```bash
# Always verify package integrity after installation
npm audit signatures

# Use exact version pinning in production
npm install @ai-marketplace/sdk@1.0.0 --save-exact

# Verify package contents before use
npm ls @ai-marketplace/sdk --json
```

### Runtime Security

```javascript
// API key security best practices
const client = createClient({
  apiKeys: {
    openai: process.env.OPENAI_API_KEY,  // Never hardcode API keys
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_API_KEY,
  },
  config: {
    // Enable built-in security features
    enableAnalytics: false,  // Disable analytics in sensitive environments
    timeout: 30000,          // Prevent hanging requests
    maxRetries: 3,           // Limit retry attempts
  },
});

// Validate all user inputs
import { z } from 'zod';  // Use validation library

const MessageSchema = z.object({
  content: z.string().max(10000),  // Limit message size
  role: z.enum(['user', 'assistant', 'system']),
});

// Always validate before processing
const validatedMessage = MessageSchema.parse(userInput);
```

### Environment Security

```bash
# Production environment variables
export OPENAI_API_KEY="sk-..."              # Secure API key storage
export ANTHROPIC_API_KEY="sk-ant-..."       # Use environment variables
export GOOGLE_API_KEY="AIza..."             # Never commit to repositories

# Optional security enhancements
export AI_ENABLE_ML_ROUTING=true            # Enable intelligent routing
export AI_CACHE_ENABLED=false               # Disable caching for sensitive data
export AI_ANALYTICS_ENABLED=false           # Disable analytics in secure environments
```

## Security Considerations by Use Case

### Enterprise Environments

- **Compliance**: Package supports SOC2, GDPR, and HIPAA compliance requirements
- **Audit Trails**: All API calls can be logged for compliance purposes
- **Data Residency**: Local model support (Ollama) ensures data never leaves your infrastructure
- **Access Controls**: Use environment-specific API keys and configuration

### Healthcare/HIPAA Environments

```javascript
// HIPAA-compliant configuration
const client = createClient({
  apiKeys: {
    // Use only local models for PHI
    // No cloud API keys for sensitive data
  },
  config: {
    enableAnalytics: false,     // Disable all analytics
    enableMLRouting: false,     // Disable cloud routing
    cache: { enabled: false },  // Disable caching
  },
});

// Process sensitive data locally only
const response = await client.chat({
  messages: [{ role: 'user', content: sensitiveData }],
}, {
  provider: 'ollama',  // Force local processing
});
```

### Financial Services

- **Data Encryption**: All API communications use TLS 1.3
- **Access Logging**: Comprehensive logging for audit requirements
- **Rate Limiting**: Built-in protection against abuse
- **Cost Controls**: Intelligent routing and cost optimization

## Incident Response

### Security Incident Classifications

1. **P0 - Critical**: Active exploitation, immediate threat to users
2. **P1 - High**: Potential for exploitation, significant impact
3. **P2 - Medium**: Security weakness, limited impact
4. **P3 - Low**: Minor security concern, minimal impact

### Response Procedures

1. **Immediate Response** (P0/P1)
   - Issue security advisory within 24 hours
   - Publish emergency patch within 72 hours
   - Notify all known affected users

2. **Standard Response** (P2/P3)
   - Include fix in next scheduled release
   - Update security documentation
   - Publish security advisory with fix

## Security Contact

- **Primary Contact**: GitHub Security Advisory (preferred)
- **Email**: security@cosmara.ai (if available)
- **Emergency**: GitHub issue with "URGENT: Security" label

### PGP Key (Optional)

For highly sensitive reports, PGP encryption is available upon request.

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who help improve our security:

- Hall of Fame for responsible security researchers
- Public acknowledgment (with permission)
- Coordination on disclosure timeline

## Security Updates

Subscribe to security updates:

- **GitHub**: Watch this repository for security advisories
- **npm**: Security advisories are published to npm
- **RSS**: GitHub security advisory RSS feed available

---

**Last Updated**: 2025-08-02  
**Next Review**: 2025-11-02 (quarterly review cycle)

For questions about this security policy, please create a GitHub issue with the "security" label.