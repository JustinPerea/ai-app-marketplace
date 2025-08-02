# NPM Publishing Setup Guide

This guide will help you set up npm publishing for the AI Marketplace SDK.

## Quick Setup Checklist

### 1. npm Account Setup
- [ ] Create npm account at https://www.npmjs.com/signup
- [ ] Enable 2FA for security: `npm profile enable-2fa auth-and-writes`
- [ ] Login locally: `npm login`
- [ ] Verify login: `npm whoami`

### 2. Organization Access (if applicable)
- [ ] Request access to `@ai-marketplace` organization on npm
- [ ] Or update package name in `package.json` to use your own scope

### 3. GitHub Repository Setup
- [ ] Ensure repository is public or you have organization access
- [ ] Add NPM_TOKEN to GitHub Secrets (for automated publishing)

### 4. Local Testing
- [ ] Run `npm run build` to verify build works
- [ ] Run `npm run validate` to test package structure
- [ ] Run `npm run check-publish` to see what will be published

## Publishing Options

### Option 1: Interactive Publishing (Recommended for first-time)
```bash
npm run publish:interactive
```

### Option 2: Automated Release Preparation
```bash
# Patch release (1.0.0 -> 1.0.1)
npm run version:patch

# Minor release (1.0.0 -> 1.1.0)  
npm run version:minor

# Major release (1.0.0 -> 2.0.0)
npm run version:major
```

### Option 3: Manual Publishing
```bash
npm version patch
npm publish
```

## First-Time Publishing

Run this command to publish version 1.0.0:

```bash
# Test the build first
npm run build
npm run validate

# Use interactive script for safety
npm run publish:interactive
```

The interactive script will:
1. ✅ Verify you're logged in to npm
2. ✅ Clean and rebuild the package
3. ✅ Run validation tests
4. ✅ Show you what will be published
5. ✅ Ask for confirmation before publishing
6. ✅ Automatically create git tags
7. ✅ Push tags to GitHub

## Automated Publishing via GitHub Actions

### Setup GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add a new secret:
   - **Name**: `NPM_TOKEN`
   - **Value**: Your npm access token (create at https://www.npmjs.com/settings/tokens)

### Trigger Automated Publishing

**Method 1: Create GitHub Release**
```bash
# This will automatically trigger npm publishing
gh release create v1.0.1 --title "Release v1.0.1" --generate-notes
```

**Method 2: Manual Workflow Dispatch**
```bash
# Trigger publishing workflow manually
gh workflow run publish.yml --field version=patch
```

## Troubleshooting

### Common Issues

**"Not logged in to npm"**
```bash
npm login
npm whoami  # Verify
```

**"Permission denied"**
- Check if you have access to the `@ai-marketplace` organization
- Or change package name to use your own scope

**"Version already exists"**
```bash
npm run version:patch  # Bump version first
```

**Build failures**
```bash
npm run clean
npm install
npm run build
```

## Security Best Practices

- ✅ Enable 2FA on npm account
- ✅ Use npm tokens instead of password for CI/CD
- ✅ Store tokens securely in GitHub Secrets
- ✅ Regularly rotate npm tokens
- ✅ Review published package contents

## Next Steps After Publishing

1. **Verify Publication**: Check https://www.npmjs.com/package/@ai-marketplace/sdk
2. **Test Installation**: `npm install @ai-marketplace/sdk` in a test project
3. **Update Documentation**: Update README with installation instructions
4. **Create GitHub Release**: Document changes and improvements
5. **Monitor Usage**: Track downloads and issues

## Support

If you encounter issues:

1. Check the [PUBLISHING.md](./PUBLISHING.md) guide for detailed troubleshooting
2. Verify all scripts work locally before pushing
3. Check GitHub Actions logs for CI/CD issues
4. Contact npm support for account or publishing issues

---

The SDK is now ready for publishing! 🚀