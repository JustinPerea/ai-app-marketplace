#!/bin/bash

# AI Marketplace SDK Publishing Script
# This script automates the publishing process with safety checks

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AI Marketplace SDK Publishing Script${NC}"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the SDK directory?${NC}"
    exit 1
fi

# Check if package name is correct
PACKAGE_NAME=$(node -p "require('./package.json').name")
if [ "$PACKAGE_NAME" != "@ai-marketplace/sdk" ]; then
    echo -e "${RED}❌ Error: Unexpected package name: $PACKAGE_NAME${NC}"
    exit 1
fi

# Check current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📦 Current version: ${CURRENT_VERSION}${NC}"

# Ask for version bump type if not provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}🤔 What type of version bump do you want?${NC}"
    echo "1) patch (1.0.0 -> 1.0.1) - Bug fixes"
    echo "2) minor (1.0.0 -> 1.1.0) - New features, backward compatible"
    echo "3) major (1.0.0 -> 2.0.0) - Breaking changes"
    echo "4) specific - Enter a specific version"
    echo "5) none - Don't bump version, publish current"
    
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1) VERSION_BUMP="patch" ;;
        2) VERSION_BUMP="minor" ;;
        3) VERSION_BUMP="major" ;;
        4) 
            read -p "Enter specific version (e.g., 1.2.3): " VERSION_BUMP
            ;;
        5) VERSION_BUMP="none" ;;
        *) 
            echo -e "${RED}❌ Invalid choice${NC}"
            exit 1
            ;;
    esac
else
    VERSION_BUMP="$1"
fi

# Check if NPM token is set
if [ -z "$NPM_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  NPM_TOKEN environment variable not set${NC}"
    echo "Please set your NPM token: export NPM_TOKEN=your_token_here"
    read -p "Continue anyway? (y/N): " continue_without_token
    if [ "$continue_without_token" != "y" ] && [ "$continue_without_token" != "Y" ]; then
        exit 1
    fi
fi

# Check if user is logged in to npm
echo -e "${BLUE}🔐 Checking npm authentication...${NC}"
if ! npm whoami > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Not logged in to npm${NC}"
    echo "Please run: npm login"
    exit 1
fi

NPM_USER=$(npm whoami)
echo -e "${GREEN}✅ Logged in as: ${NPM_USER}${NC}"

# Clean previous builds
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
npm run clean

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Run TypeScript checks
echo -e "${BLUE}🔍 Running TypeScript checks...${NC}"
npx tsc --noEmit

# Build the package
echo -e "${BLUE}🔨 Building package...${NC}"
npm run build

# Validate the build
echo -e "${BLUE}✅ Validating build...${NC}"
npm run validate

# Check what will be published
echo -e "${BLUE}📋 Checking package contents...${NC}"
npm pack --dry-run

# Version bump if requested
if [ "$VERSION_BUMP" != "none" ]; then
    echo -e "${BLUE}📈 Bumping version ($VERSION_BUMP)...${NC}"
    npm version $VERSION_BUMP --no-git-tag-version
    NEW_VERSION=$(node -p "require('./package.json').version")
    echo -e "${GREEN}✅ New version: ${NEW_VERSION}${NC}"
fi

# Final confirmation
FINAL_VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}🎯 Ready to publish version ${FINAL_VERSION}${NC}"
read -p "Are you sure you want to publish? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo -e "${YELLOW}❌ Publishing cancelled${NC}"
    exit 0
fi

# Publish to npm
echo -e "${BLUE}🚀 Publishing to npm...${NC}"
npm publish

# Check if publish was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Successfully published @ai-marketplace/sdk@${FINAL_VERSION}!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo "1. Create a git tag: git tag v${FINAL_VERSION}"
    echo "2. Push the tag: git push origin v${FINAL_VERSION}"
    echo "3. Create a GitHub release with release notes"
    echo "4. Update documentation if needed"
    echo ""
    echo -e "${BLUE}📦 Installation command:${NC}"
    echo "npm install @ai-marketplace/sdk@${FINAL_VERSION}"
    
    # Ask if user wants to create git tag
    read -p "Create git tag v${FINAL_VERSION}? (y/N): " create_tag
    if [ "$create_tag" = "y" ] || [ "$create_tag" = "Y" ]; then
        git tag "v${FINAL_VERSION}"
        echo -e "${GREEN}✅ Created git tag v${FINAL_VERSION}${NC}"
        
        read -p "Push tag to origin? (y/N): " push_tag
        if [ "$push_tag" = "y" ] || [ "$push_tag" = "Y" ]; then
            git push origin "v${FINAL_VERSION}"
            echo -e "${GREEN}✅ Pushed tag to origin${NC}"
        fi
    fi
    
else
    echo -e "${RED}❌ Publishing failed!${NC}"
    exit 1
fi