# Publishing Guide

This guide covers how to publish the AI Marketplace SDK to npm with automated workflows.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Publishing Methods](#publishing-methods)
3. [Automated Publishing](#automated-publishing)
4. [Manual Publishing](#manual-publishing)
5. [Release Management](#release-management)
6. [GitHub Actions](#github-actions)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### npm Account Setup

1. **Create npm Account**:
   ```bash
   # Visit https://www.npmjs.com/signup
   # Or create via CLI
   npm adduser
   ```

2. **Login to npm**:
   ```bash
   npm login
   # Verify login
   npm whoami
   ```

3. **Set up 2FA** (recommended):
   ```bash
   npm profile enable-2fa auth-and-writes
   ```

### Environment Setup

1. **npm Token** (for automation):
   ```bash
   # Generate token at https://www.npmjs.com/settings/tokens
   export NPM_TOKEN=your_npm_token_here
   ```

2. **Repository Access**:
   - Ensure you have write access to the GitHub repository
   - Repository must be public or you must have npm organization access

## Publishing Methods

### Method 1: Interactive Publishing Script (Recommended)

The interactive script provides safety checks and guided publishing:

```bash
# Make script executable (first time only)
chmod +x scripts/publish.sh

# Run interactive publish
npm run publish:interactive

# Or directly
./scripts/publish.sh
```

**Features**:
- ✅ Pre-flight safety checks
- ✅ Version bump selection
- ✅ Build validation
- ✅ Publish confirmation
- ✅ Automatic git tagging
- ✅ Error handling

### Method 2: Automated Release Preparation

Prepare releases with automated changelog generation:

```bash
# Patch version (1.0.0 -> 1.0.1)
npm run version:patch

# Minor version (1.0.0 -> 1.1.0)
npm run version:minor

# Major version (1.0.0 -> 2.0.0)
npm run version:major

# Specific version
npm run prepare-release 1.2.3
```

### Method 3: Standard npm Publishing

Traditional npm workflow:

```bash
# Build and validate
npm run build
npm run validate

# Version bump
npm version patch  # or minor, major

# Publish
npm publish
```

## Automated Publishing

### GitHub Actions Workflow

The repository includes automated CI/CD pipelines:

#### Continuous Integration (`.github/workflows/ci.yml`)
- **Triggers**: Push to main/develop, Pull Requests
- **Tests**: Node.js 16, 18, 20
- **Checks**: TypeScript validation, build testing, security audit
- **Validation**: Import/export testing, package size analysis

#### Publishing Workflow (`.github/workflows/publish.yml`)
- **Triggers**: GitHub releases, manual dispatch
- **Process**: Build → Validate → Publish → Release
- **Safety**: Dry-run testing, rollback capabilities

### Automated Publishing Setup

1. **Add npm Token to GitHub Secrets**:
   ```bash
   # Go to GitHub repository → Settings → Secrets
   # Add secret: NPM_TOKEN = your_npm_token
   ```

2. **Trigger Automated Release**:
   ```bash
   # Method 1: Create GitHub release (triggers automatic publish)
   gh release create v1.0.1 --title "Release v1.0.1" --notes "Bug fixes and improvements"
   
   # Method 2: Manual workflow dispatch
   gh workflow run publish.yml --field version=patch
   ```

## Manual Publishing

### Step-by-Step Manual Process

1. **Prepare Release**:
   ```bash
   # Clean and install
   npm run clean
   npm install
   
   # Run checks
   npx tsc --noEmit
   npm run build
   npm run validate
   ```

2. **Version Management**:
   ```bash
   # Check current version
   npm version
   
   # Bump version (creates git tag)
   npm version patch  # 1.0.0 -> 1.0.1
   npm version minor  # 1.0.0 -> 1.1.0
   npm version major  # 1.0.0 -> 2.0.0
   
   # Or set specific version
   npm version 1.2.3 --no-git-tag-version
   ```

3. **Pre-publish Validation**:
   ```bash
   # Check what will be published
   npm pack --dry-run
   
   # Test package contents
   npm run check-publish
   
   # Validate TypeScript declarations
   npm run validate-types
   ```

4. **Publish**:
   ```bash
   # Publish to npm
   npm publish
   
   # Verify publication
   npm view @ai-marketplace/sdk
   ```

5. **Post-publish**:
   ```bash
   # Push version tag
   git push origin --tags
   
   # Create GitHub release
   gh release create v1.0.1 --generate-notes
   ```

## Release Management

### Version Strategy

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (`1.0.1`): Bug fixes, no breaking changes
- **Minor** (`1.1.0`): New features, backward compatible
- **Major** (`2.0.0`): Breaking changes

### Release Process

1. **Prepare Release**:
   ```bash
   # Generate changelog and release notes
   npm run prepare-release patch
   
   # Review generated files:
   # - CHANGELOG.md (updated)
   # - RELEASE_NOTES_x.x.x.md (created)
   ```

2. **Commit Changes**:
   ```bash
   git add .
   git commit -m "chore: prepare release v1.0.1"
   ```

3. **Publish**:
   ```bash
   # Using interactive script
   npm run publish:interactive
   
   # Or manual
   npm publish
   ```

4. **Create GitHub Release**:
   ```bash
   # Using generated release notes
   gh release create v1.0.1 --notes-file RELEASE_NOTES_1.0.1.md
   ```

### Changelog Management

The CHANGELOG.md is automatically maintained:

- **Manual Updates**: Edit CHANGELOG.md directly
- **Automated**: Use `prepare-release` script
- **Format**: Follows [Keep a Changelog](https://keepachangelog.com/)

## GitHub Actions

### CI Pipeline Features

**Security Scanning**:
- npm audit for vulnerabilities
- Dependency analysis (should be zero for this package)

**Build Testing**:
- Multi-version Node.js testing (16, 18, 20)
- TypeScript compilation validation
- Import/export testing (CommonJS and ES Modules)

**Package Validation**:
- Build artifact verification
- Package size analysis
- Publishing dry-run

### Publishing Pipeline

**Triggers**:
1. **GitHub Release**: Automatic publishing when release is created
2. **Manual Dispatch**: Workflow can be triggered manually with version parameter

**Process**:
1. **Validation**: TypeScript checks, build validation
2. **Version**: Automatic version bumping (if manual dispatch)
3. **Publish**: npm publication with NPM_TOKEN
4. **Release**: GitHub release creation with generated notes

## Troubleshooting

### Common Issues

#### 1. Authentication Errors

```bash
# Error: npm ERR! 401 Unauthorized
# Solution: Re-login to npm
npm logout
npm login

# Or check npm token
npm whoami
```

#### 2. Version Conflicts

```bash
# Error: npm ERR! 403 You cannot publish over the previously published versions
# Solution: Bump version
npm version patch
npm publish
```

#### 3. Build Failures

```bash
# Error: TypeScript compilation errors
# Solution: Fix TypeScript errors
npx tsc --noEmit

# Error: Missing build artifacts
# Solution: Clean and rebuild
npm run clean
npm run build
```

#### 4. Package Size Issues

```bash
# Check package contents
npm run check-publish

# Analyze bundle size
npm pack
tar -tzf ai-marketplace-sdk-*.tgz
```

#### 5. GitHub Actions Failures

```bash
# Missing NPM_TOKEN secret
# Solution: Add NPM_TOKEN to GitHub repository secrets

# Permission errors
# Solution: Ensure repository has proper access rights
```

### Emergency Recovery

#### Unpublish (within 72 hours)
```bash
# Unpublish specific version
npm unpublish @ai-marketplace/sdk@1.0.1

# Unpublish entire package (dangerous)
npm unpublish @ai-marketplace/sdk --force
```

#### Deprecate Version
```bash
# Deprecate a version
npm deprecate @ai-marketplace/sdk@1.0.1 "This version has security issues"
```

### Debug Publishing

```bash
# Verbose publishing
npm publish --verbose

# Check npm configuration
npm config list

# Test package installation
npm install @ai-marketplace/sdk@latest --dry-run
```

## Best Practices

### Pre-publish Checklist

- [ ] All tests pass
- [ ] TypeScript compilation successful
- [ ] Build artifacts present and valid
- [ ] Version number incremented appropriately
- [ ] CHANGELOG.md updated
- [ ] README.md is current
- [ ] No sensitive information in package
- [ ] Package size is reasonable (<1MB)

### Security Best Practices

- [ ] Use npm 2FA for account security
- [ ] Store NPM_TOKEN securely in GitHub Secrets
- [ ] Regular security audits (`npm audit`)
- [ ] Review dependencies (should be zero for this package)
- [ ] Validate build artifacts before publishing

### Release Best Practices

- [ ] Follow semantic versioning
- [ ] Write clear release notes
- [ ] Test in staging environment first
- [ ] Monitor post-release metrics
- [ ] Have rollback plan ready
- [ ] Communicate breaking changes clearly

## Support

For publishing issues:

1. **Check CI/CD Status**: Review GitHub Actions for build failures
2. **Validate Locally**: Run all validation scripts locally first
3. **npm Support**: Check npm status page for service issues
4. **GitHub Issues**: Report persistent issues in the repository

## Resources

- [npm Publishing Documentation](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)