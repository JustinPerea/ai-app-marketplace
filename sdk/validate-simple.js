#!/usr/bin/env node

/**
 * Simple Claude 4 Validation - Source Code Analysis
 */

const fs = require('fs');
const path = require('path');

function validateClaude4Changes() {
  console.log('🧪 Validating Claude 4 Integration...\n');

  let allPassed = true;

  // Test 1: Check types.ts for model mapping
  console.log('📋 Test 1: Model Mapping in types.ts');
  try {
    const typesPath = path.join(__dirname, 'src', 'types.ts');
    const typesContent = fs.readFileSync(typesPath, 'utf8');
    
    if (typesContent.includes('claude-sonnet-4-20250514')) {
      console.log('✅ New Claude 4 model found in types.ts');
    } else {
      console.log('❌ Claude 4 model not found in types.ts');
      allPassed = false;
    }

    if (!typesContent.includes('claude-3-sonnet-20240229')) {
      console.log('✅ Deprecated Claude 3 model removed from types.ts');
    } else {
      console.log('❌ Deprecated Claude 3 model still present in types.ts');
      allPassed = false;
    }

    if (typesContent.includes("'refusal'")) {
      console.log('✅ Refusal stop reason added to types.ts');
    } else {
      console.log('❌ Refusal stop reason not found in types.ts');
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ Error checking types.ts: ${error.message}`);
    allPassed = false;
  }

  // Test 2: Check anthropic.ts for provider updates
  console.log('\n📋 Test 2: Anthropic Provider Updates');
  try {
    const anthropicPath = path.join(__dirname, 'src', 'providers', 'anthropic.ts');
    const anthropicContent = fs.readFileSync(anthropicPath, 'utf8');
    
    if (anthropicContent.includes('claude-sonnet-4-20250514')) {
      console.log('✅ Claude 4 model found in Anthropic provider');
    } else {
      console.log('❌ Claude 4 model not found in Anthropic provider');
      allPassed = false;
    }

    if (anthropicContent.includes('Claude 4 Sonnet')) {
      console.log('✅ Claude 4 display name updated');
    } else {
      console.log('❌ Claude 4 display name not updated');
      allPassed = false;
    }

    if (anthropicContent.includes("case 'refusal':")) {
      console.log('✅ Refusal stop reason handling added');
    } else {
      console.log('❌ Refusal stop reason handling not found');
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ Error checking anthropic.ts: ${error.message}`);
    allPassed = false;
  }

  // Test 3: Check ML router updates
  console.log('\n📋 Test 3: ML Router Updates');
  try {
    const routerPath = path.join(__dirname, 'src', 'ml', 'router.ts');
    const routerContent = fs.readFileSync(routerPath, 'utf8');
    
    if (routerContent.includes('claude-sonnet-4-20250514')) {
      console.log('✅ Claude 4 model found in ML router');
    } else {
      console.log('❌ Claude 4 model not found in ML router');
      allPassed = false;
    }

    if (!routerContent.includes('claude-3-sonnet-20240229')) {
      console.log('✅ Deprecated model removed from ML router');
    } else {
      console.log('❌ Deprecated model still in ML router');
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ Error checking ML router: ${error.message}`);
    allPassed = false;
  }

  // Test 4: Check build outputs exist
  console.log('\n📋 Test 4: Build Output Validation');
  try {
    const distPaths = [
      'dist/cjs/index.js',
      'dist/esm/index.js',
      'dist/types/index.d.ts'
    ];

    for (const distPath of distPaths) {
      const fullPath = path.join(__dirname, distPath);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ Build output exists: ${distPath}`);
      } else {
        console.log(`❌ Build output missing: ${distPath}`);
        allPassed = false;
      }
    }
  } catch (error) {
    console.log(`❌ Error checking build outputs: ${error.message}`);
    allPassed = false;
  }

  console.log('\n📊 Validation Summary:');
  if (allPassed) {
    console.log('🎉 All Claude 4 validation checks passed!');
    console.log('\n✅ Ready for production deployment');
    return true;
  } else {
    console.log('❌ Some validation checks failed');
    return false;
  }
}

// Run validation
if (require.main === module) {
  const success = validateClaude4Changes();
  process.exit(success ? 0 : 1);
}

module.exports = { validateClaude4Changes };