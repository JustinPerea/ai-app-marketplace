/**
 * Developer API Test Script
 * 
 * Tests the developer submission backend APIs to ensure they work with the frontend
 * Run with: node test-developer-apis.js
 */

const API_BASE = 'http://localhost:3000/api';

// Test app submission data
const testAppData = {
  name: 'AI Code Reviewer',
  shortDescription: 'An AI-powered code review assistant that analyzes your code for bugs and improvements',
  description: 'This comprehensive AI code review tool leverages advanced language models to analyze your code, identify potential bugs, security vulnerabilities, and suggest improvements. It supports multiple programming languages and integrates seamlessly with your development workflow.',
  category: 'DEVELOPER_TOOLS',
  tags: ['code-review', 'ai', 'development', 'automation'],
  pricing: 'FREEMIUM',
  price: 29.99,
  requiredProviders: ['OPENAI', 'ANTHROPIC'],
  supportedLocalModels: [],
  iconUrl: 'https://example.com/icon.png',
  screenshotUrls: [
    'https://example.com/screenshot1.png',
    'https://example.com/screenshot2.png'
  ],
  demoUrl: 'https://demo.example.com',
  githubUrl: 'https://github.com/example/ai-code-reviewer',
  runtimeType: 'JAVASCRIPT'
};

async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Add demo auth headers
        'x-user-id': 'demo-user-id',
        'x-user-email': 'demo@developer.com'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(`\n🔍 Testing ${method} ${endpoint}`);
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();

    if (response.ok) {
      console.log('✅ Success:', response.status);
      console.log('📄 Response:', JSON.stringify(result, null, 2));
      return result;
    } else {
      console.log('❌ Error:', response.status);
      console.log('📄 Response:', JSON.stringify(result, null, 2));
      return null;
    }
  } catch (error) {
    console.log('💥 Network Error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Developer API Tests');
  console.log('=' .repeat(50));

  // Test 1: Submit new app
  console.log('\n📝 Test 1: Submit New App');
  const submitResult = await testAPI('/developers/apps', 'POST', testAppData);
  
  let appId = null;
  if (submitResult && submitResult.app) {
    appId = submitResult.app.id;
    console.log('✨ Created app with ID:', appId);
  }

  // Test 2: Get all apps
  console.log('\n📋 Test 2: Get All Developer Apps');
  const appsResult = await testAPI('/developers/apps', 'GET');
  
  if (appsResult && appsResult.apps) {
    console.log('📊 Found', appsResult.apps.length, 'apps');
    console.log('📈 Summary:', appsResult.summary);
  }

  // Test 3: Get specific app (if we have an ID)
  if (appId) {
    console.log('\n🔍 Test 3: Get Specific App');
    await testAPI(`/developers/apps/${appId}`, 'GET');
  }

  // Test 4: Update app (if we have an ID)
  if (appId) {
    console.log('\n✏️ Test 4: Update App');
    const updateData = {
      shortDescription: 'Updated: An enhanced AI-powered code review assistant',
      tags: ['code-review', 'ai', 'development', 'automation', 'updated']
    };
    await testAPI(`/developers/apps/${appId}`, 'PUT', updateData);
  }

  // Test 5: Test admin endpoints
  console.log('\n👨‍💼 Test 5: Admin Endpoints');
  await testAPI('/admin/apps', 'GET');

  if (appId) {
    console.log('\n🎯 Test 5b: Admin Review Action');
    const reviewData = {
      appId: appId,
      action: 'APPROVE',
      reviewNotes: 'Great app! Approved for publication.'
    };
    await testAPI('/admin/apps', 'POST', reviewData);
  }

  // Test 6: Get apps again to see changes
  console.log('\n🔄 Test 6: Get Apps After Changes');
  await testAPI('/developers/apps', 'GET');

  console.log('\n' + '=' .repeat(50));
  console.log('✅ Developer API Tests Complete');
}

// Run the tests
runTests().catch(console.error);